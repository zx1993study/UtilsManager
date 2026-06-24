"""Page automation service based on page inspection and template playback."""
import asyncio
import ast
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime
from time import monotonic

from sqlalchemy.orm import Session

from core.logger import logger
from core.responsemsg import error_response, success_response
from mysql.dict_info_sql import get_active_dict_info_by_key
from mysql.element_template_sql import (
    batch_create_element_templates,
    delete_element_templates_by_page_id,
    get_element_templates_by_page_id,
)
from mysql.page_info_sql import get_page_info_by_id
from mysql.page_instance_sql import (
    get_page_instance_by_id,
    get_page_instances_by_ids,
    update_page_instance_execute_state,
)
from mysql.page_result_sql import batch_create_page_result
from mysql.token_info_sql import get_token_info_by_id
from utils.playwright_splice import PlaywrightSplice

EXECUTE_TIMEOUT = 300
RESPONSE_MAX_LEN = 10000
LOCATOR_ROLE = 1
LOCATOR_PLACEHOLDER = 2
LOCATOR_TEXT = 3
LOCATOR_LISTITEM_TEXT = 4
LOCATOR_CSS = 5
LOCATOR_LABEL = 6

ELEMENT_TEXTBOX = 1
ELEMENT_SELECT = 2
ELEMENT_BUTTON = 3
ELEMENT_TEXT = 4

OP_CLICK = 1
OP_FILL = 2
OP_SELECT = 3
OP_UPLOAD = 4
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEFAULT_PLAYWRIGHT_HEADLESS = False
DEFAULT_PLAYWRIGHT_SLOW_MO = 300
REQUEST_CACHE_TTL_SECONDS = 120
_EXECUTE_REQUEST_CACHE: dict[str, tuple[float, dict]] = {}
_INSPECT_REQUEST_CACHE: dict[str, tuple[float, dict]] = {}
_EXECUTE_RUNNING_KEYS: set[str] = set()
_INSPECT_RUNNING_PAGE_IDS: set[int] = set()


def _resolve_runtime_path(path_value: str | None, default_name: str) -> str:
    path = path_value or os.path.join(BASE_DIR, default_name)
    if not os.path.isabs(path):
        path = os.path.join(BASE_DIR, path)
    return os.path.abspath(path)


def _parse_bool(value, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "yes", "y", "on", "是"}:
        return True
    if text in {"0", "false", "no", "n", "off", "否"}:
        return False
    return default


def _get_cached_execute_response(request_id: str | None) -> dict | None:
    if not request_id:
        return None
    now = monotonic()
    expired_keys = [
        key for key, (created_at, _) in _EXECUTE_REQUEST_CACHE.items()
        if now - created_at > REQUEST_CACHE_TTL_SECONDS
    ]
    for key in expired_keys:
        _EXECUTE_REQUEST_CACHE.pop(key, None)
    cached = _EXECUTE_REQUEST_CACHE.get(request_id)
    return cached[1] if cached else None


def _set_cached_execute_response(request_id: str | None, response: dict) -> None:
    if request_id:
        _EXECUTE_REQUEST_CACHE[request_id] = (monotonic(), response)


def _get_cached_inspect_response(request_id: str | None) -> dict | None:
    if not request_id:
        return None
    now = monotonic()
    expired_keys = [
        key for key, (created_at, _) in _INSPECT_REQUEST_CACHE.items()
        if now - created_at > REQUEST_CACHE_TTL_SECONDS
    ]
    for key in expired_keys:
        _INSPECT_REQUEST_CACHE.pop(key, None)
    cached = _INSPECT_REQUEST_CACHE.get(request_id)
    return cached[1] if cached else None


def _set_cached_inspect_response(request_id: str | None, response: dict) -> None:
    if request_id:
        _INSPECT_REQUEST_CACHE[request_id] = (monotonic(), response)


def _execute_running_key(page_id: int, instance_ids: list[int]) -> str:
    return f"{page_id}:{','.join(str(item) for item in instance_ids)}"


def _parse_int(value, default: int = 0) -> int:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


async def _get_playwright_execute_config(db: Session) -> dict:
    config = {
        "headless": DEFAULT_PLAYWRIGHT_HEADLESS,
        "slow_mo": DEFAULT_PLAYWRIGHT_SLOW_MO,
        "retry_count": 0,
        "browser_timeout": 0,
    }

    combined = await get_active_dict_info_by_key(db, "playwright_execute")
    if combined and combined.dict_value:
        try:
            data = json.loads(combined.dict_value)
            if isinstance(data, dict):
                config["headless"] = _parse_bool(data.get("headless"), config["headless"])
                config["slow_mo"] = _parse_int(data.get("slow_mo", data.get("slowMo")), config["slow_mo"])
                config["retry_count"] = _parse_int(
                    data.get("retry_count", data.get("retryCount")),
                    config["retry_count"],
                )
                config["browser_timeout"] = _parse_int(
                    data.get("browser_timeout", data.get("browserTimeout")),
                    config["browser_timeout"],
                )
        except json.JSONDecodeError:
            pass

    headless_item = await get_active_dict_info_by_key(db, "playwright_headless")
    if headless_item:
        config["headless"] = _parse_bool(headless_item.dict_value, config["headless"])

    slow_mo_item = await get_active_dict_info_by_key(db, "playwright_slow_mo")
    if slow_mo_item:
        config["slow_mo"] = _parse_int(slow_mo_item.dict_value, config["slow_mo"])

    retry_item = await get_active_dict_info_by_key(db, "playwright_retry_count")
    if retry_item:
        config["retry_count"] = _parse_int(retry_item.dict_value, config["retry_count"])

    timeout_item = await get_active_dict_info_by_key(db, "playwright_browser_timeout")
    if timeout_item:
        config["browser_timeout"] = _parse_int(timeout_item.dict_value, config["browser_timeout"])

    config["retry_count"] = max(0, config["retry_count"])
    config["browser_timeout"] = max(0, config["browser_timeout"])
    return config

def _unique_int_list(values: list[int] | None) -> list[int]:
    result = []
    seen = set()
    for item in values or []:
        if item is None:
            continue
        try:
            value = int(item)
        except (TypeError, ValueError):
            continue
        if value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _code_dir() -> str:
    code_path = _resolve_runtime_path(os.getenv("PLAYWRIGHT_CODE_PATH"), "playwright_codes")
    os.makedirs(code_path, exist_ok=True)
    return code_path


def _screenshot_dir() -> str:
    shot_path = _resolve_runtime_path(os.getenv("PLAYWRIGHT_SCREENSHOT_PATH"), "playwright_screenshots")
    os.makedirs(shot_path, exist_ok=True)
    return shot_path


def _token_dir() -> str:
    configured_path = os.getenv("PLAYWRIGHT_TOKEN_PATH")
    token_path = (
        _resolve_runtime_path(configured_path, "playwright_tokens")
        if configured_path
        else os.path.join(os.getenv("TEMP", tempfile.gettempdir()), "qcoder_playwright_tokens")
    )
    os.makedirs(token_path, exist_ok=True)
    return token_path


def _legacy_token_dir() -> str:
    return _resolve_runtime_path(None, "playwright_tokens")


def _temp_codegen_script_path(page_id: int) -> str:
    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
    temp_dir = os.path.join(tempfile.gettempdir(), "qcoder_page_codegen")
    os.makedirs(temp_dir, exist_ok=True)
    return os.path.join(temp_dir, f"inspect_codegen_{page_id}_{ts}.py")


def _run_codegen_command(page_url: str, script_path: str, token_json_path: str | None = None) -> subprocess.CompletedProcess:
    command = [
        sys.executable,
        "-m",
        "playwright",
        "codegen",
        "-o",
        script_path,
    ]
    if token_json_path:
        command.append(f"--load-storage={token_json_path}")
    command.append(page_url)
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        timeout=EXECUTE_TIMEOUT,
        cwd=_code_dir(),
    )


def _safe_json_file_name(file_name: str | None, prefix: str = "token") -> str:
    raw_name = (file_name or "").strip()
    raw_name = os.path.basename(raw_name)
    raw_name = re.sub(r"[^0-9A-Za-z._-]+", "_", raw_name).strip("._-")
    if not raw_name:
        raw_name = f"{prefix}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
    if not raw_name.lower().endswith(".json"):
        raw_name = f"{raw_name}.json"
    return raw_name

def _parse_json_object(raw: str | None) -> dict:
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        try:
            parsed = json.loads(raw, strict=False)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}


def _apply_value_marks(params: dict, exec_count: int | None = 0) -> dict:
    result = dict(params or {})
    value_marks = result.get("valueMarks")
    if not isinstance(value_marks, dict):
        return result
    suffix = (exec_count or 0) + 1
    for key, mark in value_marks.items():
        if mark != "execCountSuffix" or key not in result:
            continue
        value = result.get(key)
        if isinstance(value, (dict, list)) or value is None:
            continue
        result[key] = f"{value}{suffix}"
    return result


def _screen_targets(params: dict, key: str) -> list[str]:
    raw_value = params.get(key) if isinstance(params, dict) else None
    if raw_value is None:
        return []
    if isinstance(raw_value, (list, tuple, set)):
        values = raw_value
    else:
        values = str(raw_value).split(",")
    return [
        str(value).strip()
        for value in values
        if value is not None and str(value).strip() != ""
    ]


def _fallback_screenshot_element_id(params: dict, templates: list) -> str:
    targets = _screen_targets(params, "screenAfter") or _screen_targets(params, "screenBefore")
    if targets:
        return targets[-1]
    if templates:
        element_id = getattr(templates[-1], "element_id", None)
        if element_id is not None:
            return str(element_id)
    return "unknown"


def _literal_arg(node: ast.AST | None):
    if node is None:
        return None
    try:
        return ast.literal_eval(node)
    except (ValueError, SyntaxError):
        return ast.unparse(node)


def _call_name(node: ast.AST) -> str | None:
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
        return node.func.attr
    return None


def _keyword_value(call: ast.Call, name: str):
    for keyword in call.keywords:
        if keyword.arg == name:
            return _literal_arg(keyword.value)
    return None


def _call_args_text(call: ast.Call) -> str:
    parts = [ast.unparse(arg) for arg in call.args]
    parts.extend(f"{keyword.arg}={ast.unparse(keyword.value)}" for keyword in call.keywords if keyword.arg)
    return ", ".join(parts)


def _operation_from_name(name: str) -> int | None:
    return {
        "click": OP_CLICK,
        "dblclick": OP_CLICK,
        "fill": OP_FILL,
        "select_option": OP_SELECT,
        "set_input_files": OP_UPLOAD,
    }.get(name)


def _operation_default_value(call: ast.Call, operation: int, nth_value: int | None = None) -> str | None:
    if operation in (OP_FILL, OP_UPLOAD):
        value = _literal_arg(call.args[0]) if call.args else None
        if value is not None:
            return str(value)
    if nth_value is not None:
        return str(nth_value)
    return None


def _element_type_from_locator(locator_type: int, operation: int, role: str | None = None) -> int:
    if operation == OP_FILL:
        return ELEMENT_TEXTBOX
    if operation == OP_SELECT:
        return ELEMENT_SELECT
    if operation in (OP_CLICK, OP_UPLOAD):
        if role in {"textbox", "spinbutton", "combobox"} or locator_type == LOCATOR_PLACEHOLDER:
            return ELEMENT_TEXTBOX
        if role in {"listitem", "option"} or locator_type == LOCATOR_LISTITEM_TEXT:
            return ELEMENT_SELECT
        return ELEMENT_BUTTON
    return ELEMENT_TEXT


def _locator_from_call(call: ast.Call) -> dict | None:
    name = _call_name(call)
    if name == "get_by_role":
        role = _literal_arg(call.args[0]) if call.args else None
        locator_name = _keyword_value(call, "name")
        exact = _keyword_value(call, "exact")
        element_name = locator_name or role or "role"
        result = {
            "element_name": str(element_name),
            "locator_type": LOCATOR_ROLE,
            "element_value": _call_args_text(call),
            "role": str(role) if role else None,
        }
        if exact is not None:
            result["exact"] = bool(exact)
        return result

    if name == "get_by_placeholder":
        value = _literal_arg(call.args[0]) if call.args else ""
        return {
            "element_name": str(value),
            "locator_type": LOCATOR_PLACEHOLDER,
            "element_value": _call_args_text(call),
            "role": None,
        }

    if name == "get_by_text":
        value = _literal_arg(call.args[0]) if call.args else ""
        return {
            "element_name": str(value),
            "locator_type": LOCATOR_TEXT,
            "element_value": _call_args_text(call),
            "role": None,
        }

    if name == "get_by_label":
        value = _literal_arg(call.args[0]) if call.args else ""
        return {
            "element_name": str(value),
            "locator_type": LOCATOR_LABEL,
            "element_value": _call_args_text(call),
            "role": None,
        }

    if name == "locator":
        value = _literal_arg(call.args[0]) if call.args else ""
        return {
            "element_name": str(value),
            "locator_type": LOCATOR_CSS,
            "element_value": _call_args_text(call),
            "role": None,
        }

    if name == "filter":
        has_text = _keyword_value(call, "has_text")
        if has_text is None:
            return None
        return {
            "element_name": str(has_text),
            "locator_type": LOCATOR_LISTITEM_TEXT,
            "element_value": _call_args_text(call),
            "role": "listitem",
        }

    return None


def _collect_locator_chain(node: ast.AST) -> list[dict]:
    chain = []
    current = node
    while True:
        if isinstance(current, ast.Attribute):
            current = current.value
            continue
        if not isinstance(current, ast.Call):
            break

        locator = _locator_from_call(current)
        if locator:
            chain.append(locator)
        if not isinstance(current.func, ast.Attribute):
            break
        current = current.func.value
    chain.reverse()
    return chain


def _has_chained_call(node: ast.AST, call_names: set[str]) -> bool:
    current = node
    while True:
        if isinstance(current, ast.Attribute):
            current = current.value
            continue
        if not isinstance(current, ast.Call):
            return False
        name = _call_name(current)
        if name in call_names:
            return True
        if not isinstance(current.func, ast.Attribute):
            return False
        current = current.func.value


def _extract_nth_value(node: ast.AST) -> int | None:
    current = node
    while True:
        if isinstance(current, ast.Attribute):
            if current.attr == "first":
                return 0
            current = current.value
            continue
        if not isinstance(current, ast.Call):
            return None
        if _call_name(current) == "nth":
            raw_value = _literal_arg(current.args[0]) if current.args else None
            try:
                return int(raw_value)
            except (TypeError, ValueError):
                return None
        if not isinstance(current.func, ast.Attribute):
            return None
        current = current.func.value


def _source_segment(lines: list[str], node: ast.AST) -> str:
    start = getattr(node, "lineno", None)
    end = getattr(node, "end_lineno", None)
    if not start:
        return ""
    if not end:
        end = start
    return "\n".join(lines[start - 1:end]).strip()


def _parent_element_value(parents: list[dict], nth_value: int | None) -> str | None:
    parent_items = [
        {
            "element_name": parent.get("element_name"),
            "locator_type": parent.get("locator_type"),
            "element_value": parent.get("element_value"),
        }
        for parent in parents
    ]
    payload: dict[str, object] = {}
    if parent_items:
        payload["parents"] = parent_items
    if nth_value is not None:
        payload["nth"] = nth_value
    if not payload:
        return None
    return json.dumps(payload, ensure_ascii=False)


def _parse_codegen_script_rows(page_id: int, script_content: str) -> list[dict]:
    tree = ast.parse(script_content)
    script_lines = script_content.splitlines()
    rows = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Expr) or not isinstance(node.value, ast.Call):
            continue
        operation_name = _call_name(node.value)
        operation = _operation_from_name(operation_name or "")
        if operation is None or not isinstance(node.value.func, ast.Attribute):
            continue

        chain = _collect_locator_chain(node.value.func.value)
        if not chain:
            continue
        if chain[-1]["locator_type"] == LOCATOR_LISTITEM_TEXT and len(chain) >= 2 and chain[-2].get("role") == "listitem":
            chain.pop(-2)

        locator = chain[-1]
        parents = chain[:-1]
        role = locator.get("role")
        nth_value = _extract_nth_value(node.value.func.value)
        default_value = _operation_default_value(node.value, operation, nth_value)

        rows.append(
            {
                "element_name": str(locator.get("element_name") or "")[:50],
                "page_id": page_id,
                "locator_type": locator["locator_type"],
                "element_value": locator["element_value"],
                "default_value": default_value,
                "parent_element": _parent_element_value(parents, nth_value),
                "element_type": _element_type_from_locator(locator["locator_type"], operation, role=role),
                "status": 1,
                "operation": operation,
                "remark": _source_segment(script_lines, node),
                "creator": "page_inspector",
            }
        )
    return rows


async def _get_token_json_path_by_token_id(db: Session, token_id: int | None) -> str | None:
    if not token_id:
        return None
    token_info = await get_token_info_by_id(db, token_id)
    if not token_info or not token_info.token:
        return None
    token_path = token_info.token
    if not os.path.isabs(token_path):
        token_path = os.path.join(_token_dir(), token_path)
        if not os.path.exists(token_path):
            legacy_path = os.path.join(_legacy_token_dir(), token_info.token)
            if os.path.exists(legacy_path):
                token_path = legacy_path
    return token_path


async def inspect_page_to_element_templates(
    db: Session,
    page_id: int,
    page_url: str | None = None,
    replace: bool = True,
    headless: bool = True,
    request_id: str | None = None,
):
    cached_response = _get_cached_inspect_response(request_id)
    if cached_response:
        return cached_response
    if page_id in _INSPECT_RUNNING_PAGE_IDS:
        return error_response(
            msg="inspect page running",
            data={"error": "page inspect is already running, please wait"},
        )

    _INSPECT_RUNNING_PAGE_IDS.add(page_id)
    page_info = await get_page_info_by_id(db, page_id)
    if not page_info:
        response = error_response(msg="inspect page failed", data={"error": "page info not found"})
        _set_cached_inspect_response(request_id, response)
        _INSPECT_RUNNING_PAGE_IDS.discard(page_id)
        return response

    target_url = (page_url or page_info.page_url or "").strip()
    if not target_url:
        response = error_response(msg="inspect page failed", data={"error": "page url is not configured"})
        _set_cached_inspect_response(request_id, response)
        _INSPECT_RUNNING_PAGE_IDS.discard(page_id)
        return response

    script_path = _temp_codegen_script_path(page_id)
    token_json_path = await _get_token_json_path_by_token_id(db, page_info.token_id)
    if token_json_path and not os.path.exists(token_json_path):
        token_json_path = None
    try:
        proc = await asyncio.to_thread(_run_codegen_command, target_url, script_path, token_json_path)
        response_info = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
        if proc.returncode != 0:
            response = error_response(
                msg="inspect page failed",
                data={"error": response_info[:RESPONSE_MAX_LEN], "returnCode": proc.returncode},
            )
            _set_cached_inspect_response(request_id, response)
            return response
        if not os.path.exists(script_path):
            response = error_response(msg="inspect page failed", data={"error": "temporary codegen script was not created"})
            _set_cached_inspect_response(request_id, response)
            return response
        with open(script_path, "r", encoding="utf-8") as f:
            script_content = f.read()
        rows = _parse_codegen_script_rows(page_id, script_content)
    except subprocess.TimeoutExpired:
        response = error_response(msg="inspect page failed", data={"error": "playwright codegen timeout"})
        _set_cached_inspect_response(request_id, response)
        return response
    except Exception as exc:
        response = error_response(msg="inspect page failed", data={"error": f"parse codegen script failed: {exc}"})
        _set_cached_inspect_response(request_id, response)
        return response
    finally:
        try:
            if os.path.exists(script_path):
                os.remove(script_path)
        except OSError:
            pass
        _INSPECT_RUNNING_PAGE_IDS.discard(page_id)

    if not rows:
        response = error_response(msg="inspect page failed", data={"error": "no playable operations found in codegen script"})
        _set_cached_inspect_response(request_id, response)
        return response
    deleted_count = await delete_element_templates_by_page_id(db, page_id)
    saved = await batch_create_element_templates(db, rows)
    response = success_response(
        msg="inspect page success",
        data={
            "pageId": page_id,
            "requestId": request_id,
            "source": "temporary_codegen_script",
            "scriptFile": None,
            "detectedCount": len(rows),
            "deletedCount": deleted_count,
            "savedCount": len(saved),
            "items": rows,
        },
    )
    _set_cached_inspect_response(request_id, response)
    return response


async def save_token_json_by_instance(db: Session, page_instance_id: int, token_file_name: str | None = None):
    try:
        instance = await get_page_instance_by_id(db, page_instance_id)
        if not instance:
            return error_response(msg="save token json failed", data={"error": "page instance not found"})

        page_info = await get_page_info_by_id(db, instance.page_id)
        if not page_info:
            return error_response(msg="save token json failed", data={"error": "page info not found"})

        templates = await get_element_templates_by_page_id(db, instance.page_id)
        if not templates:
            return error_response(msg="save token json failed", data={"error": "element templates not found"})

        safe_name = _safe_json_file_name(token_file_name, prefix=f"token_{page_instance_id}")
        token_path = os.path.join(_token_dir(), safe_name)
        params = _apply_value_marks(_parse_json_object(instance.operation_json), instance.exec_count)
        execute_config = await _get_playwright_execute_config(db)
        runner = PlaywrightSplice(
            headless=execute_config["headless"],
            slow_mo=execute_config["slow_mo"],
            browser_timeout=execute_config["browser_timeout"],
        )
        response_info = await asyncio.to_thread(
            runner.execute,
            page_url=page_info.page_url or "",
            templates=templates,
            params=params,
            token_json_path=None,
            output_storage_state_path=token_path,
        )

        if not os.path.exists(token_path):
            with open(token_path, "w", encoding="utf-8") as f:
                json.dump({"cookies": [], "origins": []}, f, ensure_ascii=False, indent=2)

        return success_response(
            msg="save token json success",
            data={
                "tokenFileName": safe_name,
                "tokenFilePath": token_path,
                "pageInstanceId": page_instance_id,
                "playwrightConfig": execute_config,
                "responseInfo": response_info[:RESPONSE_MAX_LEN],
            },
        )
    except subprocess.TimeoutExpired:
        return error_response(msg="save token json failed", data={"error": "execute timeout"})
    except Exception as e:
        return error_response(msg="save token json failed", data={"error": str(e)})


async def execute_page_by_element_templates(
    page_id: int,
    instance_ids: list[int],
    db: Session,
    token_id: int | None = None,
    request_id: str | None = None,
):
    try:
        cached_response = _get_cached_execute_response(request_id)
        if cached_response:
            return cached_response

        requested_ids = _unique_int_list(instance_ids)
        if not requested_ids:
            return error_response(msg="execute template failed", data={"error": "page instance ids are required"})

        running_key = _execute_running_key(page_id, requested_ids)
        if running_key in _EXECUTE_RUNNING_KEYS:
            return success_response(
                msg="execute template running",
                data={
                    "pageId": page_id,
                    "requestId": request_id,
                    "requestedIds": requested_ids,
                    "running": True,
                },
            )
        _EXECUTE_RUNNING_KEYS.add(running_key)

        page_info = await get_page_info_by_id(db, page_id)
        if not page_info:
            return error_response(msg="execute template failed", data={"error": "page info not found"})

        templates = await get_element_templates_by_page_id(db, page_id)
        if not templates:
            return error_response(msg="execute template failed", data={"error": "element templates not found"})

        instances = await get_page_instances_by_ids(db, requested_ids)
        instances = [item for item in instances if item.page_id == page_id]
        if not instances:
            return error_response(msg="execute template failed", data={"error": "page instances not found"})

        result_rows = []
        shot_dir = _screenshot_dir()
        execute_config = await _get_playwright_execute_config(db)
        runner = PlaywrightSplice(
            headless=execute_config["headless"],
            slow_mo=execute_config["slow_mo"],
            browser_timeout=execute_config["browser_timeout"],
        )
        for instance in instances:
            selected_token_id = token_id or getattr(instance, "token_id", None) or page_info.token_id
            token_json_path = await _get_token_json_path_by_token_id(db, selected_token_id)
            if token_json_path and not os.path.exists(token_json_path):
                token_json_path = None
            params = _apply_value_marks(_parse_json_object(instance.operation_json), instance.exec_count)
            response_info = ""
            code = "error"
            success = False
            screenshot_name = None
            screenshot = None
            screenshot_paths = []
            retry_count = execute_config["retry_count"]
            total_attempts = retry_count + 1

            for attempt_index in range(total_attempts):
                ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
                fallback_element_id = _fallback_screenshot_element_id(params, templates)
                screenshot_name = f"{fallback_element_id}_{ts}.png"
                screenshot = os.path.join(shot_dir, screenshot_name)
                attempt_screenshot_paths = []
                try:
                    response_info = await asyncio.to_thread(
                        runner.execute,
                        page_url=page_info.page_url or "",
                        templates=templates,
                        params=params,
                        screenshot_path=screenshot,
                        token_json_path=token_json_path,
                        screenshot_dir=shot_dir,
                        screenshot_collector=attempt_screenshot_paths,
                    )
                    screenshot_paths = attempt_screenshot_paths
                    success = True
                    code = "0"
                    if attempt_index > 0:
                        response_info = f"retry attempt {attempt_index} success\n{response_info}"
                    break
                except Exception as e:
                    logger.exception(
                        "页面模板执行异常: page_id=%s, page_instance_id=%s, attempt=%s/%s",
                        page_id,
                        instance.page_instance_id,
                        attempt_index + 1,
                        total_attempts,
                    )
                    screenshot_paths = attempt_screenshot_paths
                    success = False
                    response_info = str(e)
                    code = "error"
                    if attempt_index < retry_count:
                        continue

            screenshot_names = [
                os.path.basename(path)
                for path in screenshot_paths
                if path and os.path.exists(path)
            ]
            retry_remark = f", retry_count={retry_count}, attempts={attempt_index + 1}"
            await update_page_instance_execute_state(
                db,
                instance.page_instance_id,
                success=success,
                screen_photo_file=screenshot_names[-1] if screenshot_names else None,
            )
            result_rows.append(
                {
                    "page_instance_id": instance.page_instance_id,
                    "result_status": 1 if success else 0,
                    "code": code,
                    "response_info": response_info[:RESPONSE_MAX_LEN],
                    "screenshot_path": json.dumps(screenshot_names, ensure_ascii=False),
                    "remark": (
                        f"template execute: instance {instance.instance_name} "
                        f"{'success' if success else 'failed'}{retry_remark}"
                    ),
                }
            )

        saved = await batch_create_page_result(db, result_rows)
        response = success_response(
            msg="execute template finished",
            data={
                "pageId": page_id,
                "requestId": request_id,
                "requestedIds": requested_ids,
                "templateCount": len(templates),
                "instanceCount": len(instances),
                "savedCount": saved,
                "playwrightConfig": execute_config,
                "results": result_rows,
            },
        )
        _set_cached_execute_response(request_id, response)
        return response
    except Exception as e:
        response = error_response(msg="execute template failed", data={"error": str(e)})
        _set_cached_execute_response(request_id, response)
        return response
    finally:
        if "running_key" in locals():
            _EXECUTE_RUNNING_KEYS.discard(running_key)





