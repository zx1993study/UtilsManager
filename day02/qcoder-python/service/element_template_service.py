from sqlalchemy.orm import Session

from core.responsemsg import error_response, success_response
from mysql.element_template_sql import (
    create_element_template,
    delete_element_template,
    delete_element_template_batch,
    get_element_template_by_id,
    get_element_template_by_unique_fields,
    get_element_template_list,
    get_element_templates_by_page_id,
    update_element_template,
)
from schemas.element_template_schemas import (
    ElementTemplateCreate,
    ElementTemplateInfo,
    ElementTemplateList,
    ElementTemplateUpdate,
)
from utils.pagination import create_page_response


async def get_element_template_service(db: Session, item_id: int):
    """获取元素模板详情。"""
    obj = await get_element_template_by_id(db, item_id)
    if not obj:
        return error_response(
            msg="查询失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "元素模板不存在"}',
        )

    schema_obj = ElementTemplateInfo.model_validate(obj)
    return success_response(msg="查询成功", data=schema_obj)


async def get_element_template_list_service(db: Session, filter: ElementTemplateList):
    """获取元素模板分页列表。"""
    items, total = await get_element_template_list(db, filter=filter)
    schema_items = [ElementTemplateInfo.model_validate(item) for item in items]
    page_data = create_page_response(
        items=schema_items,
        total=total,
        page_num=filter.page_num,
        page_size=filter.page_size,
    )
    return success_response(msg="查询成功", data=page_data)


async def get_element_templates_by_page_service(db: Session, page_id: int):
    """获取页面下的元素模板。"""
    items = await get_element_templates_by_page_id(db, page_id)
    schema_items = [ElementTemplateInfo.model_validate(item) for item in items]
    return success_response(msg="查询成功", data=schema_items)


async def create_element_template_service(db: Session, data: ElementTemplateCreate):
    """创建元素模板。"""
    existing = await get_element_template_by_unique_fields(
        db,
        element_name=data.element_name,
        element_type=data.element_type,
        page_id=data.page_id,
    )

    if existing:
        schema_existing = ElementTemplateInfo.model_validate(existing)
        return error_response(
            msg="添加失败，该元素已存在",
            data=schema_existing,
            error=f'{{"errorCode": "DUPLICATE_ELEMENT", "message": "已存在名称为\'{data.element_name}\'且类型为{data.element_type}的元素模板"}}',
        )

    obj = await create_element_template(db, data.model_dump(by_alias=False))
    schema_obj = ElementTemplateInfo.model_validate(obj)
    return success_response(msg="添加成功", data=schema_obj)


async def update_element_template_service(db: Session, item_id: int, data: ElementTemplateUpdate):
    """更新元素模板。"""
    existing = await get_element_template_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="更新失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "元素模板不存在"}',
        )

    obj = await update_element_template(db, item_id, data.model_dump(by_alias=False, exclude_unset=True))
    schema_obj = ElementTemplateInfo.model_validate(obj)
    return success_response(msg="更新成功", data=schema_obj)


async def delete_element_template_service(db: Session, item_id: int):
    """删除元素模板。"""
    existing = await get_element_template_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="删除失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "元素模板不存在"}',
        )

    await delete_element_template(db, item_id)
    return success_response(msg="删除成功", data={"id": item_id, "message": "元素模板已删除"})


async def delete_element_template_batch_service(db: Session, ids: list[int]):
    """批量删除元素模板。"""
    deleted = await delete_element_template_batch(db, ids)
    if not deleted:
        return error_response(
            msg="批量删除失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "元素模板不存在"}',
        )
    return success_response(msg="批量删除成功", data={"ids": ids, "deleted": deleted})
