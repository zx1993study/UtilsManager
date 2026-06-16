"""
页面结果 Service 层
"""
import json

from sqlalchemy.orm import Session

from core.responsemsg import error_response, success_response
from models.page_info_model import PageInfo
from models.page_instance_model import PageInstance
from models.page_result_model import PageResult
from mysql.page_result_sql import (
    create_page_result,
    delete_page_result,
    get_latest_page_result_by_instance_id,
    get_page_result_by_id,
    get_page_result_list,
    update_page_result,
)
from schemas.page_result_schemas import PageResultCreate, PageResultInfo, PageResultUpdate
from utils.pagination import create_page_response


async def get_page_result_service(db: Session, item_id: int):
    """获取页面结果详情。"""
    obj = await get_page_result_by_id(db, item_id)
    if not obj:
        return error_response(
            msg="查询失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "页面结果不存在"}',
        )

    row = PageResultInfo.model_validate(obj).model_dump(by_alias=True)
    instance = None
    page = None
    if obj.page_instance_id:
        instance = (
            db.query(PageInstance)
            .filter(PageInstance.page_instance_id == obj.page_instance_id)
            .first()
        )
    if instance and instance.page_id:
        page = db.query(PageInfo).filter(PageInfo.page_id == instance.page_id).first()

    row.update(
        {
            "id": obj.page_result_id,
            "pageResultId": obj.page_result_id,
            "pageId": instance.page_id if instance else None,
            "pageName": page.page_name if page else "",
            "pageUrl": page.page_url if page else "",
            "testcaseName": instance.instance_name if instance else "",
            "instanceName": instance.instance_name if instance else "",
            "operationJson": instance.operation_json if instance else "",
            "expectResult": instance.expect_result if instance else "",
            "description": instance.description if instance else "",
            "executeTime": row.get("createTime"),
            "status": obj.result_status,
        }
    )
    return success_response(msg="查询成功", data=row)


async def get_page_result_list_service(
    db: Session,
    page_num: int = 1,
    page_size: int = 10,
    testcase_name: str | None = None,
    result_status: int | None = None,
):
    """获取页面结果列表。"""
    items, total = await get_page_result_list(db, page_num, page_size, testcase_name, result_status)
    instance_ids = [item.page_instance_id for item in items if item.page_instance_id]
    instances = {}
    pages = {}
    if instance_ids:
        instance_rows = db.query(PageInstance).filter(PageInstance.page_instance_id.in_(instance_ids)).all()
        instances = {item.page_instance_id: item for item in instance_rows}
        page_ids = [item.page_id for item in instance_rows if item.page_id]
        if page_ids:
            page_rows = db.query(PageInfo).filter(PageInfo.page_id.in_(page_ids)).all()
            pages = {item.page_id: item for item in page_rows}

    schema_items = []
    for item in items:
        row = PageResultInfo.model_validate(item).model_dump(by_alias=True)
        instance = instances.get(item.page_instance_id)
        page = pages.get(instance.page_id) if instance else None
        row.update(
            {
                "id": item.page_result_id,
                "pageResultId": item.page_result_id,
                "pageId": instance.page_id if instance else None,
                "pageName": page.page_name if page else "",
                "testcaseName": instance.instance_name if instance else "",
                "instanceName": instance.instance_name if instance else "",
                "executeTime": row.get("createTime"),
                "status": item.result_status,
            }
        )
        schema_items.append(row)
    page_data = create_page_response(
        items=schema_items,
        total=total,
        page_num=page_num,
        page_size=page_size,
    )
    return success_response(msg="查询成功", data=page_data)


async def create_page_result_service(db: Session, data: PageResultCreate):
    """创建页面结果。"""
    data_dict = data.model_dump(by_alias=False)
    if isinstance(data_dict.get("screenshot_path"), list):
        data_dict["screenshot_path"] = json.dumps(data_dict["screenshot_path"], ensure_ascii=False)

    obj = await create_page_result(db, data_dict)
    schema_obj = PageResultInfo.model_validate(obj)
    return success_response(msg="添加成功", data=schema_obj)


async def update_page_result_service(db: Session, item_id: int, data: PageResultUpdate):
    """更新页面结果。"""
    existing = await get_page_result_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="更新失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "页面结果不存在"}',
        )

    data_dict = data.model_dump(by_alias=False, exclude_unset=True)
    if isinstance(data_dict.get("screenshot_path"), list):
        data_dict["screenshot_path"] = json.dumps(data_dict["screenshot_path"], ensure_ascii=False)

    obj = await update_page_result(db, item_id, data_dict)
    schema_obj = PageResultInfo.model_validate(obj)
    return success_response(msg="更新成功", data=schema_obj)


async def delete_page_result_service(db: Session, item_id: int):
    """删除页面结果。"""
    existing = await get_page_result_by_id(db, item_id)
    if not existing:
        return error_response(
            msg="删除失败，信息不存在",
            data=None,
            error='{"errorCode": "NOT_FOUND", "message": "页面结果不存在"}',
        )

    await delete_page_result(db, item_id)
    return success_response(msg="删除成功", data={"id": item_id, "message": "页面结果已删除"})


async def delete_page_result_batch_service(db: Session, ids: list[int]):
    """批量删除页面结果。"""
    deleted_ids = []
    not_found_ids = []

    for item_id in ids:
        existing = await get_page_result_by_id(db, item_id)
        if not existing:
            not_found_ids.append(item_id)
            continue

        await delete_page_result(db, item_id)
        deleted_ids.append(item_id)

    return success_response(
        msg="批量删除完成",
        data={"deleted_ids": deleted_ids, "not_found_ids": not_found_ids},
    )


async def clear_page_result_service(db: Session):
    """清空页面结果。"""
    count = db.query(PageResult).delete(synchronize_session=False)
    db.commit()
    return success_response(msg="清空成功", data={"deleted": count})


async def get_latest_page_result_by_instance_service(db: Session, instance_id: int):
    """根据页面实例ID获取最新页面结果。"""
    obj = await get_latest_page_result_by_instance_id(db, instance_id)
    if not obj:
        return success_response(msg="查询成功", data=None)

    schema_obj = PageResultInfo.model_validate(obj)
    return success_response(msg="查询成功", data=schema_obj)
