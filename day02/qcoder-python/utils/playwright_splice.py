import json
import os
import re
from datetime import datetime
from typing import Any

from playwright.sync_api import sync_playwright


LOCATOR_ROLE = 1
LOCATOR_PLACEHOLDER = 2
LOCATOR_TEXT = 3
LOCATOR_LISTITEM_TEXT = 4
LOCATOR_CSS = 5
LOCATOR_LABEL = 6

OP_CLICK = 1
OP_FILL = 2
OP_SELECT = 3
OP_UPLOAD = 4


def _json_or_empty(raw: str | None) -> Any:
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _parse_role_value(value: Any) -> dict:
    if isinstance(value, dict):
        return value
    text = "" if value is None else str(value)
    role, _ = _first_arg_text(text)
    name = _keyword_arg_text(text, "name")
    exact = _keyword_arg_text(text, "exact")
    if role is None:
        match = re.match(r'^\s*"?([^",]+)"?\s*(?:,\s*name\s*=\s*["\'](.+?)["\'])?\s*$', text)
        if not match:
            return {"role": text, "name": None}
        return {"role": match.group(1), "name": match.group(2)}
    result = {"role": role, "name": name}
    if exact is not None:
        result["exact"] = str(exact).strip().lower() in {"true", "1"}
    return result


def _literal_text(value: str) -> str | None:
    text = str(value).strip()
    try:
        import ast

        parsed = ast.literal_eval(text)
        return str(parsed)
    except (ValueError, SyntaxError):
        if text:
            return text
        return None


def _first_arg_text(value: Any) -> tuple[str | None, str]:
    text = "" if value is None else str(value).strip()
    if not text:
        return None, ""
    if text[0] in {"'", '"'}:
        quote = text[0]
        escaped = False
        for index in range(1, len(text)):
            char = text[index]
            if escaped:
                escaped = False
                continue
            if char == "\\":
                escaped = True
                continue
            if char == quote:
                return _literal_text(text[: index + 1]), text[index + 1 :].lstrip()
    match = re.match(r"\s*([^,]+)(.*)$", text, re.S)
    if not match:
        return None, text
    return _literal_text(match.group(1)), match.group(2).lstrip()


def _keyword_arg_text(value: Any, name: str) -> str | None:
    text = "" if value is None else str(value)
    pattern = rf"(?:^|,\s*){re.escape(name)}\s*=\s*"
    match = re.search(pattern, text)
    if not match:
        return None
    rest = text[match.end() :].strip()
    first, _ = _first_arg_text(rest)
    if first is not None:
        return first
    match = re.match(r"([^,]+)", rest)
    return match.group(1).strip() if match else None


def _single_arg_text(value: Any) -> str:
    first, _ = _first_arg_text(value)
    return "" if first is None else first


def _clean_regex_text(value: str) -> tuple[str, bool]:
    text = str(value)
    has_text = _keyword_arg_text(text, "has_text")
    if has_text:
        text = has_text
    match = re.search(r're\.compile\(r?["\']\^(.+?)\$["\']\)', text)
    if match:
        return match.group(1), True
    return text, False


class PlaywrightSplice:
    """Execute element templates generated from Playwright codegen."""

    def __init__(self, headless: bool = False, slow_mo: int = 300, browser_timeout: int = 0):
        self.headless = headless
        self.slow_mo = slow_mo
        self.browser_timeout = max(0, int(browser_timeout or 0))

    def _locate(self, scope, locator_type: int, element_value: Any):
        if locator_type == LOCATOR_ROLE:
            info = _parse_role_value(element_value)
            role = info.get("role") or ""
            name = info.get("name")
            kwargs = {}
            if info.get("exact") is not None:
                kwargs["exact"] = bool(info.get("exact"))
            if name:
                return scope.get_by_role(role, name=name, **kwargs)
            return scope.get_by_role(role, **kwargs)

        if locator_type == LOCATOR_PLACEHOLDER:
            return scope.get_by_placeholder(_single_arg_text(element_value))

        if locator_type == LOCATOR_TEXT:
            text = _single_arg_text(element_value)
            exact = _keyword_arg_text(element_value, "exact")
            kwargs = {"exact": str(exact).strip().lower() == "true"} if exact is not None else {}
            return scope.get_by_text(text, **kwargs)

        if locator_type == LOCATOR_LISTITEM_TEXT:
            text, exact = _clean_regex_text(str(element_value))
            locator = scope.get_by_role("listitem")
            if exact:
                return locator.filter(has_text=re.compile(f"^{re.escape(text)}$"))
            return locator.filter(has_text=text)

        if locator_type == LOCATOR_CSS:
            return scope.locator(_single_arg_text(element_value)).first

        if locator_type == LOCATOR_LABEL:
            return scope.get_by_label(_single_arg_text(element_value))

        raise RuntimeError(f"Unsupported locator type: {locator_type}")

    def _template_locator(self, page, template, params: dict | None = None, apply_nth: bool = True):
        params = params or {}
        remark = _json_or_empty(template.remark)
        parents = []
        nth_value = None
        if isinstance(remark, list):
            if len(remark) == 1 and isinstance(remark[0], dict) and "nth" in remark[0]:
                nth_value = remark[0].get("nth")
            else:
                parents = remark
        elif isinstance(remark, dict) and isinstance(remark.get("parents"), list):
            parents = remark["parents"]
            nth_value = remark.get("nth")
        elif isinstance(remark, dict) and isinstance(remark.get("element"), list):
            parents = [
                {
                    "element_name": item.get("elementName") or item.get("element_name"),
                    "locator_type": item.get("elementType") or item.get("locator_type"),
                    "element_value": item.get("elementValue") or item.get("element_value"),
                }
                for item in remark["element"]
            ]
            nth_value = remark.get("nth")
        elif isinstance(remark, dict):
            nth_value = remark.get("nth")
        scope = page
        for parent in parents:
            if "locator_type" not in parent:
                continue
            scope = self._locate(scope, int(parent.get("locator_type") or 0), parent.get("element_value"))
        locator = self._locate(scope, int(template.locator_type or 0), template.element_value)
        nth_value = self._nth_value(params, template, nth_value)
        if apply_nth and nth_value is not None:
            locator = locator.nth(int(nth_value))
        return locator

    def _click_template(self, page, template, params: dict, logs: list[str]) -> None:
        param_value = self._param_value(params, template, None)
        is_button = "button" in str(template.element_value or "").lower()
        if is_button and param_value is not None and not isinstance(param_value, list) and str(param_value).strip() != "":
            click_text = str(param_value).strip()
            locator = page.get_by_role("button", name=click_text)
            locator.wait_for(state="visible")
            locator.click()
            logs.append(f"[param-click-button] {template.element_name} => {click_text}")
            return

        remark = _json_or_empty(template.remark)
        optional = self._is_optional_template(template)
        nth_default = None
        if isinstance(remark, list):
            for item in remark:
                if isinstance(item, dict) and "nth" in item:
                    nth_default = item.get("nth")
                    break
        elif isinstance(remark, dict):
            nth_default = remark.get("nth")

        nth_value = self._nth_value(params, template, nth_default)
        if nth_value is not None:
            base_locator = self._template_locator(page, template, params, apply_nth=False)
            count = base_locator.count()
            if 0 < count <= int(nth_value):
                index = count - 1
                logs.append(f"[retry] {template.element_name} nth={nth_value} 超出匹配数量 {count}，改为点击 nth={index}")
                base_locator.nth(index).click(timeout=2000 if optional else None)
                return

        locator = self._template_locator(page, template, params)
        try:
            locator.click(timeout=2000 if optional else None)
        except Exception as error:
            if optional:
                logs.append(f"[skip] {template.element_name} 可选点击未找到，继续执行: {error}")
                return
            if nth_value is None:
                raise
            logs.append(f"[retry] {template.element_name} nth定位失败，回退基础定位器点击: {error}")
            fallback_locator = self._template_locator(page, template, params, apply_nth=False)
            fallback_locator.click()

    def _param_keys(self, template, param_key: str | None = None):
        keys = []
        if param_key:
            keys.append(param_key)
        if template.element_name and template.element_id:
            keys.append(f"{template.element_name}#{template.element_id}")
        if template.element_name:
            keys.append(template.element_name)
        if template.element_id:
            keys.append(str(template.element_id))
        return keys

    def _nth_value(self, params: dict, template, default: Any = None):
        remark = _json_or_empty(template.remark)
        param_key = remark.get("paramKey") if isinstance(remark, dict) else None
        if default is None and not param_key:
            return None
        for key in self._param_keys(template, param_key):
            if key not in params:
                continue
            value = params[key]
            if value is None or str(value).strip() == "":
                continue
            return int(value)
        return default

    def _param_value(self, params: dict, template, default: Any = ""):
        remark = _json_or_empty(template.remark)
        param_key = None
        if isinstance(remark, dict):
            param_key = remark.get("paramKey")
            default = remark.get("defaultValue", default)
        for key in self._param_keys(template, param_key):
            if key and key in params:
                return params[key]
        return default

    def _param_list_value(self, params: dict, group_keys: list[str], index: int):
        for key in group_keys:
            value = params.get(key)
            if not isinstance(value, list) or index >= len(value):
                continue
            return value[index]
        return None

    def _click_select_option(self, page, template, text: Any) -> None:
        text_value = str(text)
        locator_type = int(template.locator_type or 0)
        if locator_type == LOCATOR_LISTITEM_TEXT:
            option_locator = page.get_by_role("listitem").filter(has_text=text_value).first
        else:
            option_locator = self._template_locator(page, template, apply_nth=False)
        option_locator.wait_for(state="visible")
        option_locator.click()

    def _screen_targets(self, params: dict, key: str) -> set[str]:
        raw_value = params.get(key)
        if raw_value is None:
            return set()
        if isinstance(raw_value, (list, tuple, set)):
            values = raw_value
        else:
            values = str(raw_value).split(",")
        return {
            str(value).strip()
            for value in values
            if value is not None and str(value).strip() != ""
        }

    def _skip_targets(self, params: dict) -> set[str]:
        return self._screen_targets(params, "skipElements")

    def _repeat_count(self, params: dict, template) -> int:
        repeat_elements = params.get("repeatElements")
        if not isinstance(repeat_elements, dict):
            return 1
        raw_value = repeat_elements.get(self._template_element_id(template))
        try:
            return max(1, int(raw_value or 1))
        except (TypeError, ValueError):
            return 1

    def _template_element_id(self, template) -> str:
        value = getattr(template, "element_id", None)
        return "" if value is None else str(value)

    def _screen_target_matched(self, targets: set[str], template) -> bool:
        element_id = self._template_element_id(template)
        return bool(element_id and element_id in targets)

    def _is_optional_template(self, template) -> bool:
        remark = _json_or_empty(template.remark)
        if isinstance(remark, dict):
            return bool(remark.get("optional"))
        if isinstance(remark, list):
            return any(isinstance(item, dict) and item.get("optional") for item in remark)
        return False

    def execute(
        self,
        page_url: str,
        templates: list,
        params: dict | None = None,
        screenshot_path: str | None = None,
        token_json_path: str | None = None,
        output_storage_state_path: str | None = None,
        screenshot_dir: str | None = None,
        screenshot_prefix: str | None = None,
        screenshot_collector: list[str] | None = None,
    ) -> str:
        params = params or {}
        logs = []
        captured_screenshots = []
        select_group_keys = []
        select_group_index = 0
        screen_before = self._screen_targets(params, "screenBefore")
        screen_after = self._screen_targets(params, "screenAfter")
        skip_elements = self._skip_targets(params)
        context_kwargs = {}
        if token_json_path and os.path.exists(token_json_path):
            context_kwargs["storage_state"] = token_json_path

        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=self.headless, slow_mo=self.slow_mo)
            context = browser.new_context(**context_kwargs)
            page = context.new_page()
            if self.browser_timeout > 0:
                timeout_ms = self.browser_timeout * 1000
                page.set_default_timeout(timeout_ms)
                page.set_default_navigation_timeout(timeout_ms)
            try:
                if page_url:
                    page.goto(page_url)
                total = len(templates)

                def capture_screen(kind: str, template) -> None:
                    if not screenshot_dir:
                        return
                    os.makedirs(screenshot_dir, exist_ok=True)
                    element_id = self._template_element_id(template) or "unknown"
                    prefix = screenshot_prefix or "screenshot"
                    ts = datetime.now().strftime("%Y%m%d%H%M%S%f")
                    file_name = f"{prefix}_{kind}_{element_id}_{ts}.png"
                    path = os.path.join(screenshot_dir, file_name)
                    page.screenshot(path=path, full_page=True)
                    captured_screenshots.append(path)
                    if screenshot_collector is not None:
                        screenshot_collector.append(path)
                    logs.append(f"[screen-{kind}] element_id={element_id} file={file_name}")

                for index, template in enumerate(templates, start=1):
                    if self._screen_target_matched(skip_elements, template):
                        logs.append(f"[skip] element_id={self._template_element_id(template)} {template.element_name}")
                        continue
                    logs.append(f"[{index}/{total}] {template.element_name} op={template.operation}")
                    if self._screen_target_matched(screen_before, template):
                        capture_screen("before", template)
                    operation = int(template.operation or 0)
                    repeat_count = self._repeat_count(params, template)
                    for repeat_index in range(repeat_count):
                        if repeat_count > 1:
                            logs.append(f"[repeat {repeat_index + 1}/{repeat_count}] {template.element_name}")
                        if operation == OP_CLICK:
                            current_value = self._param_value(params, template, None)
                            if isinstance(current_value, list):
                                self._click_template(page, template, params, logs)
                                select_group_keys = self._param_keys(template)
                                select_group_index = 0
                            else:
                                list_value = self._param_list_value(params, select_group_keys, select_group_index)
                                if list_value is not None and int(template.locator_type or 0) == LOCATOR_LISTITEM_TEXT:
                                    self._click_select_option(page, template, list_value)
                                    logs.append(f"[select-array] {template.element_name} => {list_value}")
                                    select_group_index += 1
                                else:
                                    select_group_keys = []
                                    select_group_index = 0
                                    self._click_template(page, template, params, logs)
                        elif operation == OP_FILL:
                            select_group_keys = []
                            select_group_index = 0
                            locator = self._template_locator(page, template, params)
                            value = self._param_value(params, template)
                            locator.fill("" if value is None else str(value))
                        elif operation == OP_SELECT:
                            select_group_keys = self._param_keys(template)
                            select_group_index = 0
                            locator = self._template_locator(page, template, params)
                            value = self._param_value(params, template)
                            text_value = "" if value is None else str(value)
                            try:
                                locator.select_option(label=text_value)
                            except Exception:
                                locator.click()
                                option_locator = page.get_by_text(text_value, exact=True)
                                option_locator.wait_for(state="visible")
                                option_locator.click()
                        elif operation == OP_UPLOAD:
                            select_group_keys = []
                            select_group_index = 0
                            locator = self._template_locator(page, template, params)
                            value = self._param_value(params, template)
                            if value is None or str(value).strip() == "":
                                raise RuntimeError(f"Upload file path is empty for {template.element_name}")
                            if int(template.locator_type or 0) == LOCATOR_CSS:
                                locator = locator.locator("input[type='file']").first
                            locator.set_input_files(os.path.abspath(str(value)))
                        else:
                            raise RuntimeError(f"Unsupported operation: {operation}")
                        if self._screen_target_matched(screen_after, template):
                            capture_screen("after", template)

                if screenshot_path and not captured_screenshots:
                    page.screenshot(path=screenshot_path, full_page=True)
                    if screenshot_collector is not None:
                        screenshot_collector.append(screenshot_path)
                if output_storage_state_path:
                    os.makedirs(os.path.dirname(output_storage_state_path), exist_ok=True)
                    context.storage_state(path=output_storage_state_path)
            finally:
                context.close()
                browser.close()

        return "\n".join(logs) + ("\n" if logs else "")
