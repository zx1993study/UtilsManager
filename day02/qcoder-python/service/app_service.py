import json
import os
import subprocess
import sys
from datetime import datetime

from sqlalchemy.orm import Session

from core.logger import logger
from core.responsemsg import error_response, success_response
from mysql.app_sql import (
    create_app_info,
    create_app_instance,
    create_app_result,
    create_app_template,
    delete_app_info_batch,
    delete_app_instance_batch,
    delete_app_result_batch,
    delete_app_template_batch,
    get_app_info_by_id,
    get_app_info_list,
    get_app_instance_list,
    get_app_instances_by_ids,
    get_app_result_list,
    get_app_template_list,
    get_app_templates_by_app_id,
    update_app_info,
    update_app_instance,
    update_app_instance_execute_state,
    update_app_template,
)
from schemas.app_schemas import AppInfoOut, AppInstanceOut, AppResultOut, AppTemplateOut
from utils.pagination import create_page_response

APP_EXECUTE_TIMEOUT = 300
APP_RESPONSE_MAX_LEN = 10000


def _app_code_dir() -> str:
    path = os.getenv("APPIUM_CODE_PATH", "./appium_codes")
    path = os.path.abspath(path)
    os.makedirs(path, exist_ok=True)
    return path


def _app_screenshot_dir() -> str:
    path = os.getenv("APPIUM_SCREENSHOT_PATH", "./appium_screenshots")
    path = os.path.abspath(path)
    os.makedirs(path, exist_ok=True)
    return path


def _dump_list(items, schema):
    return [schema.model_validate(item) for item in items]


def _json_object(raw: str | None) -> dict:
    if not raw:
        return {}
    try:
        value = json.loads(raw)
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


async def list_app_info_service(db: Session, page_num=1, page_size=10, app_name=None, project_id=None):
    items, total = await get_app_info_list(db, page_num, page_size, app_name, project_id)
    return success_response(data=create_page_response(_dump_list(items, AppInfoOut), total, page_num, page_size))


async def create_app_info_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"app_id"}, exclude_none=True)
    obj = await create_app_info(db, payload)
    return success_response(msg="新增成功", data=AppInfoOut.model_validate(obj))


async def update_app_info_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"app_id"}, exclude_unset=True)
    obj = await update_app_info(db, data.app_id, payload)
    return success_response(msg="更新成功", data=AppInfoOut.model_validate(obj)) if obj else error_response(msg="App功能不存在")


async def delete_app_info_service(db: Session, ids: list[int]):
    count = await delete_app_info_batch(db, ids)
    return success_response(msg="删除成功", data={"count": count})


async def list_app_template_service(db: Session, page_num=1, page_size=10, app_id=None, template_name=None):
    items, total = await get_app_template_list(db, page_num, page_size, app_id, template_name)
    return success_response(data=create_page_response(_dump_list(items, AppTemplateOut), total, page_num, page_size))


async def create_app_template_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"template_id"}, exclude_none=True)
    obj = await create_app_template(db, payload)
    return success_response(msg="新增成功", data=AppTemplateOut.model_validate(obj))


async def update_app_template_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"template_id"}, exclude_unset=True)
    obj = await update_app_template(db, data.template_id, payload)
    return success_response(msg="更新成功", data=AppTemplateOut.model_validate(obj)) if obj else error_response(msg="App模板不存在")


async def delete_app_template_service(db: Session, ids: list[int]):
    count = await delete_app_template_batch(db, ids)
    return success_response(msg="删除成功", data={"count": count})


async def list_app_instance_service(db: Session, page_num=1, page_size=10, app_id=None, instance_name=None):
    items, total = await get_app_instance_list(db, page_num, page_size, app_id, instance_name)
    return success_response(data=create_page_response(_dump_list(items, AppInstanceOut), total, page_num, page_size))


async def create_app_instance_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"app_instance_id"}, exclude_none=True)
    obj = await create_app_instance(db, payload)
    return success_response(msg="新增成功", data=AppInstanceOut.model_validate(obj))


async def update_app_instance_service(db: Session, data):
    payload = data.model_dump(by_alias=False, exclude={"app_instance_id"}, exclude_unset=True)
    obj = await update_app_instance(db, data.app_instance_id, payload)
    return success_response(msg="更新成功", data=AppInstanceOut.model_validate(obj)) if obj else error_response(msg="测试用例不存在")


async def delete_app_instance_service(db: Session, ids: list[int]):
    count = await delete_app_instance_batch(db, ids)
    return success_response(msg="删除成功", data={"count": count})


async def list_app_result_service(db: Session, page_num=1, page_size=10, app_instance_id=None, result_status=None):
    items, total = await get_app_result_list(db, page_num, page_size, app_instance_id, result_status)
    return success_response(data=create_page_response(_dump_list(items, AppResultOut), total, page_num, page_size))


async def delete_app_result_service(db: Session, ids: list[int]):
    count = await delete_app_result_batch(db, ids)
    return success_response(msg="删除成功", data={"count": count})


def _build_caps(app_info) -> dict:
    caps = _json_object(app_info.desired_caps)
    caps.setdefault("platformName", app_info.platform or "Android")
    if app_info.device_name:
        caps.setdefault("appium:deviceName", app_info.device_name)
    if app_info.platform_version:
        caps.setdefault("appium:platformVersion", app_info.platform_version)
    if app_info.app_package:
        caps.setdefault("appium:appPackage", app_info.app_package)
    if app_info.app_activity:
        caps.setdefault("appium:appActivity", app_info.app_activity)
    if app_info.bundle_id:
        caps.setdefault("appium:bundleId", app_info.bundle_id)
    caps.setdefault("appium:automationName", "UiAutomator2" if (app_info.platform or "Android").lower() == "android" else "XCUITest")
    return caps


def _template_payload(templates) -> list[dict]:
    return [
        {
            "name": item.template_name,
            "locatorType": item.locator_type,
            "locatorValue": item.locator_value,
            "actionType": item.action_type,
            "inputKey": item.input_key,
            "defaultValue": item.default_value,
        }
        for item in templates
    ]


def _build_runner(app_info, templates) -> str:
    caps_json = json.dumps(_build_caps(app_info), ensure_ascii=False)
    ops_json = json.dumps(_template_payload(templates), ensure_ascii=False)
    server = app_info.appium_server or "http://127.0.0.1:4723"
    return f'''import json
import os
import time

from appium import webdriver
from appium.options.common import AppiumOptions
from appium.webdriver.common.appiumby import AppiumBy

SERVER = {server!r}
CAPS = json.loads({caps_json!r})
OPERATIONS = json.loads({ops_json!r})


def params():
    raw = os.environ.get("OPERATION_JSON") or "{{}}"
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else {{}}
    except json.JSONDecodeError:
        return {{}}


def by(locator_type):
    mapping = {{
        "id": AppiumBy.ID,
        "xpath": AppiumBy.XPATH,
        "accessibility_id": AppiumBy.ACCESSIBILITY_ID,
        "class_name": AppiumBy.CLASS_NAME,
        "android_uiautomator": AppiumBy.ANDROID_UIAUTOMATOR,
        "ios_predicate": AppiumBy.IOS_PREDICATE,
    }}
    return mapping.get((locator_type or "id").lower(), AppiumBy.ID)


def run():
    data = params()
    options = AppiumOptions()
    options.load_capabilities(CAPS)
    driver = webdriver.Remote(SERVER, options=options)
    try:
        for item in OPERATIONS:
            action = (item.get("actionType") or "click").lower()
            if action == "wait":
                time.sleep(float(item.get("defaultValue") or 1))
                continue
            if action == "back":
                driver.back()
                continue
            element = driver.find_element(by(item.get("locatorType")), item.get("locatorValue") or "")
            if action == "click":
                element.click()
            elif action == "input":
                key = item.get("inputKey") or item.get("name")
                value = data.get(key, item.get("defaultValue", ""))
                element.send_keys("" if value is None else str(value))
            elif action == "clear":
                element.clear()
            elif action == "assert_text":
                expected = str(data.get(item.get("inputKey") or item.get("name"), item.get("defaultValue", "")))
                actual = element.text or ""
                if expected not in actual:
                    raise AssertionError(f"Expected text {{expected!r}} not found in {{actual!r}}")
            else:
                raise RuntimeError(f"Unsupported action: {{action}}")
        screenshot_path = os.environ.get("SCREENSHOT_PATH")
        if screenshot_path:
            driver.save_screenshot(screenshot_path)
    finally:
        driver.quit()


if __name__ == "__main__":
    run()
'''


async def execute_app_service(db: Session, app_id: int, instance_ids: list[int]):
    app_info = await get_app_info_by_id(db, app_id)
    if not app_info:
        return error_response(msg="App功能不存在")
    templates = await get_app_templates_by_app_id(db, app_id)
    if not templates:
        return error_response(msg="请先维护App模板")
    instances = [item for item in await get_app_instances_by_ids(db, instance_ids) if item.app_id == app_id]
    if not instances:
        return error_response(msg="未找到可执行测试用例")

    runner_name = f".appium_runner_{app_id}_{datetime.now().strftime('%Y%m%d%H%M%S%f')}.py"
    runner_path = os.path.join(_app_code_dir(), runner_name)
    with open(runner_path, "w", encoding="utf-8") as f:
        f.write(_build_runner(app_info, templates))

    rows = []
    try:
        for instance in instances:
            ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
            screenshot_name = f"app_{instance.app_instance_id}_{ts}.png"
            screenshot_path = os.path.join(_app_screenshot_dir(), screenshot_name)
            env = {**os.environ, "OPERATION_JSON": instance.operation_json or "", "SCREENSHOT_PATH": screenshot_path}
            try:
                proc = subprocess.run(
                    [sys.executable, runner_path],
                    cwd=_app_code_dir(),
                    env=env,
                    capture_output=True,
                    text=True,
                    timeout=APP_EXECUTE_TIMEOUT,
                )
                ok = proc.returncode == 0
                code = str(proc.returncode)
                response = (proc.stdout or "") + (("\n" + proc.stderr) if proc.stderr else "")
            except subprocess.TimeoutExpired:
                logger.exception("App 用例执行超时: app_instance_id=%s", instance.app_instance_id)
                ok = False
                code = "timeout"
                response = "执行超时"
            except Exception as exc:
                logger.exception("App 用例执行异常: app_instance_id=%s", instance.app_instance_id)
                ok = False
                code = "error"
                response = str(exc)

            screenshots = [screenshot_name] if os.path.exists(screenshot_path) else []
            await update_app_instance_execute_state(db, instance.app_instance_id, ok, screenshot_name if screenshots else None)
            row = {
                "app_instance_id": instance.app_instance_id,
                "result_status": 1 if ok else 0,
                "code": code,
                "response_info": response[:APP_RESPONSE_MAX_LEN],
                "screenshot_path": json.dumps(screenshots, ensure_ascii=False),
                "remark": f"App用例「{instance.instance_name}」执行{'成功' if ok else '失败'}",
            }
            await create_app_result(db, row)
            rows.append(row)
    finally:
        try:
            os.remove(runner_path)
        except OSError:
            pass

    return success_response(msg="App用例执行完成", data={"执行实例数": len(instances), "结果": rows})
