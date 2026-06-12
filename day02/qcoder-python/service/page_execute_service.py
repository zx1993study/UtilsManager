"""
页面执行Service层
基于 playwright codegen 生成脚本，并通过子进程真实执行。
"""
import os
import sys
import json
import asyncio
import subprocess
import re
import tempfile
from threading import Lock
from datetime import datetime
from sqlalchemy.orm import Session
from mysql.page_info_sql import get_page_info_by_id
from mysql.page_instance_sql import get_page_instance_by_id, get_page_instances_by_ids, update_page_instance
from mysql.page_result_sql import batch_create_page_result
from mysql.token_info_sql import get_token_info_by_id
from core.responsemsg import success_response, error_response

# 子进程执行的最长等待时间（秒）
EXECUTE_TIMEOUT = 300
# response_info 入库时的最大长度
RESPONSE_MAX_LEN = 10000
_CODEGEN_PROCESSES = {}
_CODEGEN_LOCK = Lock()
_CODEGEN_STARTUP_CHECK_SECONDS = 2


def _code_dir() -> str:
    """playwright 代码文件目录，确保存在"""
    code_path = os.getenv("PLAYWRIGHT_CODE_PATH", "./playwright_codes")
    code_path = os.path.abspath(code_path)
    os.makedirs(code_path, exist_ok=True)
    return code_path


def _screenshot_dir() -> str:
    """playwright 截图目录，确保存在"""
    shot_path = os.getenv("PLAYWRIGHT_SCREENSHOT_PATH", "./playwright_screenshots")
    shot_path = os.path.abspath(shot_path)
    os.makedirs(shot_path, exist_ok=True)
    return shot_path


def _token_dir() -> str:
    """playwright token JSON 目录，确保存在"""
    token_path = os.getenv("PLAYWRIGHT_TOKEN_PATH", "./playwright_tokens")
    token_path = os.path.abspath(token_path)
    os.makedirs(token_path, exist_ok=True)
    return token_path


def _log_dir() -> str:
    """codegen 临时日志目录，不放在 playwright_codes 里。"""
    log_path = os.path.join(tempfile.gettempdir(), "qcoder_playwright_logs")
    os.makedirs(log_path, exist_ok=True)
    return log_path


def _safe_json_file_name(file_name: str | None, prefix: str = "token") -> str:
    """生成安全的 JSON 文件名，仅允许文件名本身，不接受路径。"""
    raw_name = (file_name or "").strip()
    raw_name = os.path.basename(raw_name)
    raw_name = re.sub(r"[^0-9A-Za-z._-]+", "_", raw_name)
    raw_name = raw_name.strip("._-")
    if not raw_name:
        raw_name = f"{prefix}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
    if not raw_name.lower().endswith(".json"):
        raw_name = f"{raw_name}.json"
    return raw_name


def _read_process_log(log_path: str) -> str:
    """读取 codegen 日志，避免进程闪退时错误信息丢失。"""
    try:
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()[-RESPONSE_MAX_LEN:]
    except OSError:
        pass
    return ""


async def _get_token_json_path_by_token_id(db: Session, token_id: int | None) -> str | None:
    """根据 token_id 返回 token JSON 绝对路径。"""
    if not token_id:
        return None

    token_info = await get_token_info_by_id(db, token_id)
    if not token_info or not token_info.token:
        return None

    token_path = token_info.token
    if not os.path.isabs(token_path):
        token_path = os.path.join(_token_dir(), token_path)

    return token_path


async def generate_page_excute_file(page_id: int, db: Session):
    """启动页面脚本录制：调用 playwright codegen 生成脚本"""
    # 根据page_id获取page_info信息
    page_info = await get_page_info_by_id(db, page_id)
    if not page_info:
        return error_response(msg="页面执行文件生成失败", data={"错误信息": "页面信息不存在"})

    real_file_name = page_info.real_file_name or page_info.file_name
    if not real_file_name:
        return error_response(msg="页面执行文件生成失败", data={"错误信息": "页面未配置文件名称"})

    output_path = os.path.join(_code_dir(), real_file_name)
    log_path = os.path.join(_log_dir(), f"{real_file_name}.codegen.log")
    token_json_path = await _get_token_json_path_by_token_id(db, page_info.token_id)
    if page_info.token_id and not token_json_path:
        return error_response(msg="页面执行文件生成失败", data={"错误信息": "页面配置的Token不存在或未生成token文件"})
    if token_json_path and not os.path.exists(token_json_path):
        return error_response(msg="页面执行文件生成失败", data={"错误信息": f"Token文件不存在: {token_json_path}"})

    # 生成cmd命令并执行
    command = [
        sys.executable, "-m", "playwright", "codegen",
    ]
    if token_json_path:
        command.extend(["--load-storage", token_json_path])
    command.extend([
        "-o", output_path,
        page_info.page_url or "",
    ])
    try:
        with _CODEGEN_LOCK:
            running = _CODEGEN_PROCESSES.get(page_id)
            if running and running["process"].poll() is None:
                return success_response(
                    msg="页面脚本录制正在进行，请完成后点击结束生成",
                    data={"pageId": page_id, "filePath": real_file_name, "status": "running"},
                )
            _CODEGEN_PROCESSES.pop(page_id, None)

        # codegen 会打开浏览器录制；这里不长时间阻塞请求，先确认它没有立即闪退。
        startup_flags = 0
        if os.name == "nt":
            startup_flags = subprocess.CREATE_NEW_PROCESS_GROUP
        log_file = open(log_path, "w", encoding="utf-8")
        try:
            process = subprocess.Popen(
                command,
                cwd=_code_dir(),
                stdin=subprocess.DEVNULL,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                creationflags=startup_flags,
            )
        finally:
            log_file.close()

        with _CODEGEN_LOCK:
            _CODEGEN_PROCESSES[page_id] = {
                "process": process,
                "file_path": real_file_name,
                "output_path": output_path,
                "log_path": log_path,
                "token_path": token_json_path,
            }

        await asyncio.sleep(_CODEGEN_STARTUP_CHECK_SECONDS)
        if process.poll() is not None:
            with _CODEGEN_LOCK:
                _CODEGEN_PROCESSES.pop(page_id, None)
            log_text = _read_process_log(log_path)
            return error_response(
                msg="页面脚本录制启动失败，Playwright 已退出",
                data={
                    "pageId": page_id,
                    "filePath": real_file_name,
                    "status": "exited",
                    "returnCode": process.returncode,
                    "错误信息": log_text or "codegen 启动后立即退出，请检查页面地址、浏览器依赖或 Playwright 安装",
                },
            )

        return success_response(
            msg="页面脚本录制已启动，请完成操作后点击结束生成",
            data={"pageId": page_id, "filePath": real_file_name, "tokenPath": token_json_path, "status": "running"},
        )
    except FileNotFoundError:
        return error_response(msg="页面执行文件生成失败", data={"错误信息": "未找到 playwright 命令，请先安装 playwright"})
    except Exception as e:
        return error_response(msg="页面执行文件生成失败", data={"错误信息": str(e)})


async def stop_generate_page_excute_file(page_id: int):
    """结束页面脚本录制"""
    with _CODEGEN_LOCK:
        state = _CODEGEN_PROCESSES.get(page_id)

    if not state:
        return success_response(msg="没有正在进行的页面脚本录制", data={"pageId": page_id, "status": "idle"})

    process = state["process"]
    if process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)

    with _CODEGEN_LOCK:
        _CODEGEN_PROCESSES.pop(page_id, None)

    file_exists = os.path.exists(state["output_path"])
    if not file_exists:
        log_text = _read_process_log(state.get("log_path", ""))
        return error_response(
            msg="页面脚本录制已结束，但未生成脚本文件",
            data={
                "pageId": page_id,
                "filePath": state["file_path"],
                "status": "finished",
                "错误信息": log_text,
            },
        )

    return success_response(
        msg="页面脚本录制已结束",
        data={"pageId": page_id, "filePath": state["file_path"], "status": "finished"},
    )


async def update_page_execute_file_by_file(file_path: str, content: str):
    """更新页面执行文件内容"""
    try:
        abs_path = os.path.join(_code_dir(), file_path)
        # 更新文件内容
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(content)
        return success_response(msg="页面执行文件更新成功", data={"文件路径": file_path})
    except Exception as e:
        return error_response(msg="页面执行文件更新失败", data={"错误信息": str(e)})


def _inject_storage_state_capture(script_content: str) -> str:
    """在 codegen 生成脚本关闭 context 前注入 storage_state 保存逻辑。"""
    lines = script_content.splitlines()
    injected = False
    output_lines = []

    for line in lines:
        stripped = line.strip()
        if not injected and stripped == "context.close()":
            indent = line[:len(line) - len(line.lstrip())]
            output_lines.extend([
                f"{indent}token_json_path = os.environ.get(\"TOKEN_JSON_PATH\")",
                f"{indent}if token_json_path:",
                f"{indent}    context.storage_state(path=token_json_path)",
            ])
            injected = True
        output_lines.append(line)

    if not injected:
        output_lines.extend([
            "",
            "token_json_path = os.environ.get(\"TOKEN_JSON_PATH\")",
            "if token_json_path:",
            "    raise RuntimeError(\"脚本中未找到可保存 token 的 context.close() 位置\")",
        ])

    content = "\n".join(output_lines)
    if "import os" not in content:
        content = "import os\n" + content
    return content + "\n"


def _inject_storage_state_load(script_content: str) -> str:
    """在 browser.new_context() 中注入 storage_state，用于加载 cookies/token JSON。"""
    lines = script_content.splitlines()
    injected = False
    output_lines = []

    for line in lines:
        stripped = line.strip()
        if not injected and "browser.new_context(" in stripped:
            indent = line[:len(line) - len(line.lstrip())]
            if stripped == "context = browser.new_context()":
                output_lines.extend([
                    f"{indent}token_json_path = os.environ.get(\"TOKEN_JSON_PATH\")",
                    f"{indent}context_kwargs = {{}}",
                    f"{indent}if token_json_path:",
                    f"{indent}    context_kwargs[\"storage_state\"] = token_json_path",
                    f"{indent}context = browser.new_context(**context_kwargs)",
                ])
                injected = True
                continue

            output_lines.extend([
                f"{indent}token_json_path = os.environ.get(\"TOKEN_JSON_PATH\")",
                f"{indent}context_kwargs = {{}}",
                f"{indent}if token_json_path:",
                f"{indent}    context_kwargs[\"storage_state\"] = token_json_path",
            ])
            output_lines.append(line.replace("browser.new_context(", "browser.new_context(**context_kwargs, ", 1))
            injected = True
            continue
        output_lines.append(line)

    content = "\n".join(output_lines)
    if injected and "import os" not in content:
        content = "import os\n" + content
    return content + "\n"


async def _get_token_json_path_for_page(db: Session, page_id: int | None) -> str | None:
    """根据页面配置的 token_id 返回 token JSON 绝对路径。"""
    if not page_id:
        return None

    page_info = await get_page_info_by_id(db, page_id)
    if not page_info or not page_info.token_id:
        return None

    token_path = await _get_token_json_path_by_token_id(db, page_info.token_id)
    return token_path if os.path.exists(token_path) else None


def _build_token_runner(script_path: str) -> str:
    """创建一个注入 storage_state 的临时执行脚本。"""
    with open(script_path, "r", encoding="utf-8") as f:
        script_content = f.read()

    runner_name = f".token_exec_runner_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.py"
    runner_path = os.path.join(_token_dir(), runner_name)
    with open(runner_path, "w", encoding="utf-8") as f:
        f.write(_inject_storage_state_load(script_content))
    return runner_path


async def save_token_json_by_instance(db: Session, page_instance_id: int, token_file_name: str | None = None):
    """执行页面实例，并把浏览器 storage_state 保存为 token JSON 文件。"""
    try:
        instance = await get_page_instance_by_id(db, page_instance_id)
        if not instance:
            return error_response(msg="保存token json失败", data={"错误信息": "页面实例不存在"})

        page_info = await get_page_info_by_id(db, instance.page_id)
        if not page_info:
            return error_response(msg="保存token json失败", data={"错误信息": "页面信息不存在"})

        real_file_name = page_info.real_file_name or page_info.file_name
        if not real_file_name:
            return error_response(msg="保存token json失败", data={"错误信息": "页面未配置执行脚本文件"})

        script_path = os.path.join(_code_dir(), real_file_name)
        if not os.path.exists(script_path):
            return error_response(msg="保存token json失败", data={"错误信息": f"页面执行脚本不存在: {real_file_name}"})

        safe_name = _safe_json_file_name(token_file_name, prefix=f"token_{page_instance_id}")
        token_path = os.path.join(_token_dir(), safe_name)

        with open(script_path, "r", encoding="utf-8") as f:
            script_content = f.read()

        runner_name = f".token_runner_{page_instance_id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.py"
        runner_path = os.path.join(_token_dir(), runner_name)
        with open(runner_path, "w", encoding="utf-8") as f:
            f.write(_inject_storage_state_capture(script_content))

        run_env = {
            **os.environ,
            "OPERATION_JSON": instance.operation_json or "",
            "TOKEN_JSON_PATH": token_path,
        }
        try:
            proc = subprocess.run(
                [sys.executable, runner_path],
                capture_output=True,
                text=True,
                timeout=EXECUTE_TIMEOUT,
                env=run_env,
                cwd=_code_dir(),
            )
        finally:
            try:
                os.remove(runner_path)
            except OSError:
                pass

        response_info = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
        if proc.returncode != 0:
            return error_response(
                msg="保存token json失败",
                data={
                    "错误信息": response_info[:RESPONSE_MAX_LEN],
                    "returnCode": proc.returncode,
                },
            )

        if not os.path.exists(token_path):
            with open(token_path, "w", encoding="utf-8") as f:
                json.dump({"cookies": [], "origins": []}, f, ensure_ascii=False, indent=2)

        return success_response(
            msg="保存token json成功",
            data={
                "tokenFileName": safe_name,
                "tokenFilePath": token_path,
                "pageInstanceId": page_instance_id,
            },
        )
    except subprocess.TimeoutExpired:
        return error_response(msg="保存token json失败", data={"错误信息": "执行超时"})
    except Exception as e:
        return error_response(msg="保存token json失败", data={"错误信息": str(e)})


async def execute_file(file_path: str, instance_ids: list[int], db: Session):
    """执行页面执行文件，逐个实例运行脚本并把结果落库到 page_result"""
    try:
        abs_path = os.path.join(_code_dir(), file_path)
        if not os.path.exists(abs_path):
            return error_response(msg="页面执行文件执行失败", data={"错误信息": f"脚本文件不存在: {file_path}"})

        # 根据instance_ids获取page_instance信息
        instances = await get_page_instances_by_ids(db, instance_ids)
        if not instances:
            return error_response(msg="页面执行文件执行失败", data={"错误信息": "未找到对应的页面实例"})

        shot_dir = _screenshot_dir()
        result_rows = []
        # 一个参数(operation_json)对应一条执行命令，逐个实例执行（即天然分批）
        for instance in instances:
            ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
            screenshot_name = f"{instance.page_instance_id}_{ts}.png"
            screenshot = os.path.join(shot_dir, screenshot_name)

            # 更新页面实例截图文件名
            await update_page_instance(db, instance.page_instance_id, {"screen_photo_file": screenshot_name})

            # 执行文件：通过环境变量把 operation_json 与截图输出路径传给脚本
            run_env = {
                **os.environ,
                "OPERATION_JSON": instance.operation_json or "",
                "SCREENSHOT_PATH": screenshot,
            }
            run_path = abs_path
            cleanup_run_path = None
            token_json_path = await _get_token_json_path_for_page(db, instance.page_id)
            if token_json_path:
                run_env["TOKEN_JSON_PATH"] = token_json_path
                run_path = _build_token_runner(abs_path)
                cleanup_run_path = run_path
            try:
                proc = subprocess.run(
                    [sys.executable, run_path],
                    capture_output=True,
                    text=True,
                    timeout=EXECUTE_TIMEOUT,
                    env=run_env,
                    cwd=_code_dir(),
                )
                success = proc.returncode == 0
                response_info = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
                code = str(proc.returncode)
            except subprocess.TimeoutExpired:
                success = False
                response_info = "执行超时"
                code = "timeout"
            except Exception as e:  # noqa: BLE001
                success = False
                response_info = str(e)
                code = "error"
            finally:
                if cleanup_run_path:
                    try:
                        os.remove(cleanup_run_path)
                    except OSError:
                        pass

            screenshot_names = [screenshot_name] if os.path.exists(screenshot) else []

            # 获取返回的截图文件名列表，并将信息保存到page_result表
            result_rows.append({
                "page_instance_id": instance.page_instance_id,
                "result_status": 1 if success else 0,
                "code": code,
                "response_info": response_info[:RESPONSE_MAX_LEN],
                "screenshot_path": json.dumps(screenshot_names, ensure_ascii=False),
                "remark": f"实例「{instance.instance_name}」执行{'成功' if success else '失败'}",
            })

        saved = await batch_create_page_result(db, result_rows)
        return success_response(
            msg="页面执行文件执行成功",
            data={"执行实例数": len(instances), "结果入库数": saved, "结果": result_rows},
        )
    except Exception as e:
        return error_response(msg="页面执行文件执行失败", data={"错误信息": str(e)})


async def get_page_execute_file(file_path: str):
    """获取页面执行文件内容"""
    try:
        abs_path = os.path.join(_code_dir(), file_path)
        if not os.path.exists(abs_path):
            return error_response(msg="页面执行文件获取失败", data={"错误信息": f"脚本文件不存在: {file_path}"})
        # 获取文件内容
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        return success_response(msg="页面执行文件获取成功", data={"文件内容": content})
    except Exception as e:
        return error_response(msg="页面执行文件获取失败", data={"错误信息": str(e)})


async def delete_page_execute_file(file_path: str):
    """删除页面执行文件"""
    try:
        abs_path = os.path.join(_code_dir(), file_path)
        if not os.path.exists(abs_path):
            return error_response(msg="页面执行文件删除失败", data={"错误信息": f"脚本文件不存在: {file_path}"})
        os.remove(abs_path)
        return success_response(msg="页面执行文件删除成功", data={"文件路径": file_path})
    except Exception as e:
        return error_response(msg="页面执行文件删除失败", data={"错误信息": str(e)})
