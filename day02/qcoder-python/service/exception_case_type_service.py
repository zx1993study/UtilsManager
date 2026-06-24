"""异常用例类型业务逻辑。"""
from sqlalchemy.orm import Session

from core.responsemsg import error_response, success_response
from mysql.exception_case_type_sql import (
    create_exception_case_type,
    delete_exception_case_type,
    delete_exception_case_type_batch,
    get_exception_case_type_by_id,
    get_exception_case_type_list,
    update_exception_case_type,
)
from schemas.exception_case_type_schemas import (
    ExceptionCaseTypeCreate,
    ExceptionCaseTypeInfo,
    ExceptionCaseTypeList,
    ExceptionCaseTypeUpdate,
)
from utils.pagination import create_page_response


def _normalize_operation_types_payload(data_dict: dict) -> dict:
    operation_types = data_dict.pop("operation_types", None)
    if operation_types is not None:
        clean_types = []
        seen = set()
        for item in operation_types:
            if item is None:
                continue
            item = int(item)
            if item in seen:
                continue
            seen.add(item)
            clean_types.append(item)
        data_dict["operation_type"] = ",".join(str(item) for item in clean_types)
    elif isinstance(data_dict.get("operation_type"), list):
        data_dict["operation_type"] = ",".join(str(item) for item in data_dict["operation_type"] if item is not None)
    elif data_dict.get("operation_type") is not None:
        data_dict["operation_type"] = str(data_dict["operation_type"])
    return data_dict


async def get_exception_case_type_service(db: Session, item_id: int):
    """获取异常用例类型详情。"""
    obj = await get_exception_case_type_by_id(db, item_id)
    if not obj:
        return error_response(
            msg="查询失败，异常用例类型不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "异常用例类型不存在"}',
        )
    return success_response(msg="查询成功", data=ExceptionCaseTypeInfo.model_validate(obj))


async def get_exception_case_type_list_service(
    db: Session,
    filter_data: ExceptionCaseTypeList,
):
    """获取异常用例类型分页列表。"""
    items, total = await get_exception_case_type_list(db, filter_data)
    schema_items = [ExceptionCaseTypeInfo.model_validate(item) for item in items]
    page_data = create_page_response(
        items=schema_items,
        total=total,
        page_num=filter_data.page_num,
        page_size=filter_data.page_size,
    )
    return success_response(msg="查询成功", data=page_data)


async def create_exception_case_type_service(
    db: Session,
    data: ExceptionCaseTypeCreate,
):
    """创建异常用例类型。"""
    data_dict = data.model_dump(by_alias=False, exclude_unset=True)
    data_dict = _normalize_operation_types_payload(data_dict)
    obj = await create_exception_case_type(db, data_dict)
    return success_response(msg="添加成功", data=ExceptionCaseTypeInfo.model_validate(obj))


async def update_exception_case_type_service(
    db: Session,
    item_id: int,
    data: ExceptionCaseTypeUpdate,
):
    """更新异常用例类型。"""
    existing = await get_exception_case_type_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="更新失败，异常用例类型不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "异常用例类型不存在"}',
        )

    obj = await update_exception_case_type(
        db,
        item_id,
        _normalize_operation_types_payload(data.model_dump(by_alias=False, exclude_unset=True)),
    )
    return success_response(msg="更新成功", data=ExceptionCaseTypeInfo.model_validate(obj))


async def delete_exception_case_type_service(db: Session, item_id: int):
    """删除异常用例类型。"""
    existing = await get_exception_case_type_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="删除失败，异常用例类型不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "异常用例类型不存在"}',
        )

    await delete_exception_case_type(db, item_id)
    return success_response(msg="删除成功", data={"id": item_id})


async def delete_exception_case_type_batch_service(db: Session, ids: list[int]):
    """批量删除异常用例类型。"""
    deleted = await delete_exception_case_type_batch(db, ids)
    if not deleted:
        return error_response(
            msg="批量删除失败，异常用例类型不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "异常用例类型不存在"}',
        )
    return success_response(msg="批量删除成功", data={"ids": ids, "deleted": deleted})
