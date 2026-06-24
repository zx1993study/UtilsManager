"""根据异常类型和模板自动生成测试用例。"""
from __future__ import annotations

import json
from typing import Iterable

from sqlalchemy import or_
from sqlalchemy.orm import Session

from core.responsemsg import error_response, success_response
from models.api_info_model import ApiInfo
from models.api_instance_model import ApiInstance
from models.api_template_model import ApiTemplate
from models.element_template_model import ElementTemplate
from models.exception_case_type_model import ExceptionCaseType
from models.page_info_model import PageInfo
from models.page_instance_model import PageInstance
from schemas.case_generate_schemas import CaseGenerateRequest, CaseGenerateResponse, GeneratedCasePreview
from utils.data_paser import set_audit_fields_for_create, set_audit_fields_for_update


OPERATION_NAMES = {
    0: "通用",
    1: "添加",
    2: "编辑",
    3: "删除",
    4: "登录",
    5: "搜索",
}

METHOD_OPERATION_MAP = {
    1: 5,
    2: 1,
    3: 2,
    4: 3,
    5: 2,
}

MAX_CASE_NAME_LENGTH = 50

LOGIN_KEYWORDS = ("login", "signin", "auth/token", "登录", "登陆")
ADD_KEYWORDS = ("add", "create", "insert", "save", "submit", "添加", "新增", "保存", "提交")
EDIT_KEYWORDS = ("edit", "update", "modify", "修改", "编辑", "更新")
DELETE_KEYWORDS = ("delete", "remove", "del", "删除", "移除")
SEARCH_KEYWORDS = ("search", "query", "list", "page", "select", "find", "搜索", "查询", "列表")


def _contains_any(text: str, keywords: Iterable[str]) -> bool:
    text = (text or "").lower()
    return any(keyword.lower() in text for keyword in keywords)


def _operation_name(operation_type: int | None) -> str:
    return OPERATION_NAMES.get(int(operation_type or 0), "未知")


def _case_name(*parts: object) -> str:
    return "".join(str(part or "") for part in parts)[:MAX_CASE_NAME_LENGTH]


def _infer_api_operation(api: ApiInfo) -> int:
    text = f"{api.api_name or ''} {api.method_url or ''}"
    if _contains_any(text, LOGIN_KEYWORDS):
        return 4
    return METHOD_OPERATION_MAP.get(int(api.method_type or 1), 5)


def _infer_page_operation(page: PageInfo, elements: list[ElementTemplate]) -> int:
    page_text = f"{page.page_name or ''} {page.page_url or ''} {page.function or ''}"
    if _contains_any(page_text, LOGIN_KEYWORDS):
        return 4

    button_text = " ".join(
        f"{item.element_name or ''} {item.element_value or ''}"
        for item in elements
        if int(item.element_type or 0) == 3 or int(item.operation or 0) == 1
    )
    all_text = f"{page_text} {button_text}"
    if _contains_any(all_text, DELETE_KEYWORDS):
        return 3
    if _contains_any(all_text, EDIT_KEYWORDS):
        return 2
    if _contains_any(all_text, ADD_KEYWORDS):
        return 1
    if _contains_any(all_text, SEARCH_KEYWORDS):
        return 5
    return 1


def _query_exceptions(
    db: Session,
    operation_type: int,
    exception_ids: list[int] | None,
    include_common: bool,
) -> list[ExceptionCaseType]:
    query = db.query(ExceptionCaseType)
    if exception_ids:
        query = query.filter(ExceptionCaseType.exception_id.in_(exception_ids))
    else:
        operation_values = [operation_type]
        if include_common:
            operation_values.append(0)
        expressions = [
            ExceptionCaseType.operation_type.op("REGEXP")(f"(^|,){int(value)}(,|$)")
            for value in operation_values
        ]
        query = query.filter(or_(*expressions))
    return query.order_by(ExceptionCaseType.exception_id.asc()).all()


def _default_api_value(template: ApiTemplate):
    default_value = getattr(template, "default_value", None)
    if default_value not in (None, ""):
        try:
            return json.loads(default_value)
        except (TypeError, json.JSONDecodeError):
            return default_value
    field_type = int(template.field_type or 0)
    if field_type in (2, 3, 4):
        return 1
    if field_type == 5:
        return True
    return "正常值"


def _exception_value_for_api(template: ApiTemplate, exception: ExceptionCaseType):
    exception_type = int(exception.exception_type or 0)
    raw = exception.exception_value or ""
    size = int(template.field_size or 0)
    if exception_type == 1:
        return "" if str(template.is_required or "").upper() == "Y" else None
    if exception_type == 2:
        seed = raw or str(_default_api_value(template))
        repeat = max(size + 1, 50) if size else 200
        return (seed * ((repeat // max(len(seed), 1)) + 1))[:repeat]
    if exception_type == 4:
        return "abc"
    if exception_type == 5:
        return -1
    return raw


def _exception_value_for_element(element: ElementTemplate, exception: ExceptionCaseType):
    exception_type = int(exception.exception_type or 0)
    raw = exception.exception_value or ""
    if exception_type == 1:
        return ""
    if exception_type == 2:
        if raw:
            return raw
        seed = element.element_name or "超长内容"
        return (seed * ((200 // max(len(seed), 1)) + 1))[:200]
    if exception_type == 4:
        return "abc"
    if exception_type == 5:
        return "-1"
    return raw


def _case_remark(target_type: str, target_id: int, template_id: int, exception: ExceptionCaseType | None, operation_type: int) -> str:
    return json.dumps(
        {
            "source": "case_generator",
            "targetType": target_type,
            "targetId": target_id,
            "templateId": template_id,
            "exceptionId": exception.exception_id if exception else None,
            "operationType": operation_type,
        },
        ensure_ascii=False,
    )


def _build_api_base_payload(templates: list[ApiTemplate]) -> dict:
    return {item.field_name: _default_api_value(item) for item in templates if item.field_name}


def _api_preview_items(
    db: Session,
    api: ApiInfo,
    operation_type: int,
    templates: list[ApiTemplate],
    exceptions: list[ExceptionCaseType],
) -> list[GeneratedCasePreview]:
    base_payload = _build_api_base_payload(templates)
    items = []
    for template in templates:
        if not template.field_name:
            continue
        for exception in exceptions:
            payload = dict(base_payload)
            payload[template.field_name] = _exception_value_for_api(template, exception)
            case_name = _case_name("测试", template.field_name, exception.exception_name)
            exists = db.query(ApiInstance.instance_id).filter(
                ApiInstance.api_id == api.api_id,
                ApiInstance.instance_name == case_name,
            ).first() is not None
            items.append(
                GeneratedCasePreview(
                    case_name=case_name,
                    target_id=api.api_id,
                    template_id=template.template_id,
                    template_name=template.field_name,
                    exception_id=exception.exception_id,
                    exception_name=exception.exception_name,
                    operation_type=operation_type,
                    operation_type_name=_operation_name(operation_type),
                    payload=payload,
                    exists=exists,
                )
            )
    return items


def _is_input_element(element: ElementTemplate) -> bool:
    element_type = int(element.element_type or 0)
    operation = int(element.operation or 0)
    return element_type in (1, 2, 4) or operation in (2, 3, 4)


def _build_page_base_payload(elements: list[ElementTemplate]) -> dict:
    payload: dict[str, object] = {}
    last_element_id = None
    for element in elements:
        key = str(element.element_id)
        last_element_id = element.element_id
        if _is_input_element(element):
            payload[key] = ""
        else:
            payload[key] = ""
    if last_element_id is not None:
        payload["screenAfter"] = [last_element_id]
    return payload


def _page_preview_items(
    db: Session,
    page: PageInfo,
    operation_type: int,
    elements: list[ElementTemplate],
    exceptions: list[ExceptionCaseType],
) -> list[GeneratedCasePreview]:
    target_elements = [item for item in elements if _is_input_element(item)]
    base_payload = _build_page_base_payload(elements)
    items = []
    for element in target_elements:
        for exception in exceptions:
            payload = dict(base_payload)
            payload[str(element.element_id)] = _exception_value_for_element(element, exception)
            case_name = _case_name("测试", element.element_name or element.element_id, exception.exception_name)
            exists = db.query(PageInstance.page_instance_id).filter(
                PageInstance.page_id == page.page_id,
                PageInstance.instance_name == case_name,
            ).first() is not None
            items.append(
                GeneratedCasePreview(
                    case_name=case_name,
                    target_id=page.page_id,
                    template_id=element.element_id,
                    template_name=element.element_name or str(element.element_id),
                    exception_id=exception.exception_id,
                    exception_name=exception.exception_name,
                    operation_type=operation_type,
                    operation_type_name=_operation_name(operation_type),
                    payload=payload,
                    exists=exists,
                )
            )
    return items


async def preview_api_cases_service(db: Session, data: CaseGenerateRequest):
    api = db.query(ApiInfo).filter(ApiInfo.api_id == data.target_id).first()
    if not api:
        return error_response(msg="生成失败，API不存在", data=None)
    operation_type = data.operation_type or _infer_api_operation(api)
    templates = db.query(ApiTemplate).filter(ApiTemplate.api_id == api.api_id).order_by(ApiTemplate.template_id.asc()).all()
    if data.template_ids:
        template_ids = set(data.template_ids)
        templates = [item for item in templates if item.template_id in template_ids]
    if not templates:
        return error_response(msg="生成失败，该API暂无参数模板", data=None)
    exceptions = _query_exceptions(db, operation_type, data.exception_ids, data.include_common)
    if not exceptions:
        return error_response(msg="生成失败，未匹配到异常用例类型", data=None)
    items = _api_preview_items(db, api, operation_type, templates, exceptions)
    response = CaseGenerateResponse(
        target_id=api.api_id,
        operation_type=operation_type,
        operation_type_name=_operation_name(operation_type),
        total=len(items),
        exists_count=sum(1 for item in items if item.exists),
        items=items,
    )
    return success_response(msg="预览成功", data=response)


async def save_api_cases_service(db: Session, data: CaseGenerateRequest):
    if data.items is None:
        preview_response = await preview_api_cases_service(db, data)
        if not preview_response.get("success"):
            return preview_response
        preview_items = preview_response["data"].items
    else:
        preview_items = data.items
    saved = 0
    skipped = 0
    updated = 0
    for item in preview_items:
        if not item.case_name:
            skipped += 1
            continue
        item.case_name = item.case_name[:MAX_CASE_NAME_LENGTH]
        existing = db.query(ApiInstance).filter(
            ApiInstance.api_id == item.target_id,
            ApiInstance.instance_name == item.case_name,
        ).first()
        payload = {
            "instance_name": item.case_name,
            "api_id": item.target_id,
            "instance_json": json.dumps(item.payload, ensure_ascii=False),
            "expect_result": "参数校验失败",
            "status": 0,
            "exec_count": 0,
            "description": "自动生成异常用例",
            "remark": json.dumps(
                {
                    "source": "case_generator",
                    "targetType": "api",
                    "targetId": item.target_id,
                    "templateId": item.template_id,
                    "exceptionId": item.exception_id,
                    "operationType": item.operation_type,
                },
                ensure_ascii=False,
            ),
            "creator": "case_generator",
        }
        if existing:
            if not data.overwrite:
                skipped += 1
                continue
            payload = set_audit_fields_for_update(payload)
            for key, value in payload.items():
                setattr(existing, key, value)
            updated += 1
            continue
        db.add(ApiInstance(**set_audit_fields_for_create(payload)))
        saved += 1
    db.commit()
    return success_response(msg="保存成功", data={"saved": saved, "updated": updated, "skipped": skipped})


async def preview_page_cases_service(db: Session, data: CaseGenerateRequest):
    page = db.query(PageInfo).filter(PageInfo.page_id == data.target_id).first()
    if not page:
        return error_response(msg="生成失败，页面不存在", data=None)
    elements = db.query(ElementTemplate).filter(
        ElementTemplate.page_id == page.page_id,
        ElementTemplate.status == 1,
    ).order_by(ElementTemplate.element_id.asc()).all()
    if data.template_ids:
        template_ids = set(data.template_ids)
        elements = [item for item in elements if item.element_id in template_ids]
    if not elements:
        return error_response(msg="生成失败，该页面暂无元素模板", data=None)
    operation_type = data.operation_type or _infer_page_operation(page, elements)
    exceptions = _query_exceptions(db, operation_type, data.exception_ids, data.include_common)
    if not exceptions:
        return error_response(msg="生成失败，未匹配到异常用例类型", data=None)
    items = _page_preview_items(db, page, operation_type, elements, exceptions)
    response = CaseGenerateResponse(
        target_id=page.page_id,
        operation_type=operation_type,
        operation_type_name=_operation_name(operation_type),
        total=len(items),
        exists_count=sum(1 for item in items if item.exists),
        items=items,
    )
    return success_response(msg="预览成功", data=response)


async def save_page_cases_service(db: Session, data: CaseGenerateRequest):
    if data.items is None:
        preview_response = await preview_page_cases_service(db, data)
        if not preview_response.get("success"):
            return preview_response
        preview_items = preview_response["data"].items
    else:
        preview_items = data.items
    saved = 0
    skipped = 0
    updated = 0
    page = db.query(PageInfo).filter(PageInfo.page_id == data.target_id).first()
    for item in preview_items:
        if not item.case_name:
            skipped += 1
            continue
        item.case_name = item.case_name[:MAX_CASE_NAME_LENGTH]
        existing = db.query(PageInstance).filter(
            PageInstance.page_id == item.target_id,
            PageInstance.instance_name == item.case_name,
        ).first()
        exception = db.query(ExceptionCaseType).filter(ExceptionCaseType.exception_id == item.exception_id).first()
        payload = {
            "page_id": item.target_id,
            "token_id": page.token_id if page else None,
            "operation_json": json.dumps(item.payload, ensure_ascii=False, indent=2),
            "instance_name": item.case_name,
            "expect_result": "页面校验失败",
            "status": 0,
            "exec_count": 0,
            "description": "自动生成异常用例",
            "remark": _case_remark("page", item.target_id, item.template_id, exception, item.operation_type),
            "creator": "case_generator",
        }
        if existing:
            if not data.overwrite:
                skipped += 1
                continue
            payload = set_audit_fields_for_update(payload)
            for key, value in payload.items():
                setattr(existing, key, value)
            updated += 1
            continue
        db.add(PageInstance(**set_audit_fields_for_create(payload)))
        saved += 1
    db.commit()
    return success_response(msg="保存成功", data={"saved": saved, "updated": updated, "skipped": skipped})
