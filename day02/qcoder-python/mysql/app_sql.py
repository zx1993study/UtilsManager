from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.app_info_model import AppInfo
from models.app_instance_model import AppInstance
from models.app_result_model import AppResult
from models.app_template_model import AppTemplate
from utils.data_paser import set_audit_fields_for_create, set_audit_fields_for_update


def _page(query, id_column, page_num: int, page_size: int):
    total = query.with_entities(func.count(id_column)).scalar()
    items = query.offset((page_num - 1) * page_size).limit(page_size).all()
    return items, total


async def get_app_info_by_id(db: Session, app_id: int) -> Optional[AppInfo]:
    return db.query(AppInfo).filter(AppInfo.app_id == app_id).first()


async def get_app_info_list(db: Session, page_num=1, page_size=10, app_name=None, project_id=None):
    query = db.query(AppInfo)
    if app_name:
        query = query.filter(AppInfo.app_name.like(f"%{app_name}%"))
    if project_id is not None:
        query = query.filter(AppInfo.project_id == project_id)
    return _page(query.order_by(AppInfo.app_id.desc()), AppInfo.app_id, page_num, page_size)


async def create_app_info(db: Session, data: dict) -> AppInfo:
    obj = AppInfo(**set_audit_fields_for_create(data))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


async def update_app_info(db: Session, app_id: int, data: dict) -> Optional[AppInfo]:
    obj = await get_app_info_by_id(db, app_id)
    if obj:
        for key, value in set_audit_fields_for_update(data).items():
            setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
    return obj


async def delete_app_info_batch(db: Session, ids: list[int]) -> int:
    count = db.query(AppInfo).filter(AppInfo.app_id.in_(ids)).delete(synchronize_session=False) if ids else 0
    if count:
        db.commit()
    return count


async def get_app_template_by_id(db: Session, template_id: int) -> Optional[AppTemplate]:
    return db.query(AppTemplate).filter(AppTemplate.template_id == template_id).first()


async def get_app_template_list(db: Session, page_num=1, page_size=10, app_id=None, template_name=None):
    query = db.query(AppTemplate)
    if app_id is not None:
        query = query.filter(AppTemplate.app_id == app_id)
    if template_name:
        query = query.filter(AppTemplate.template_name.like(f"%{template_name}%"))
    return _page(query.order_by(AppTemplate.sort_order.asc(), AppTemplate.template_id.asc()), AppTemplate.template_id, page_num, page_size)


async def get_app_templates_by_app_id(db: Session, app_id: int) -> list[AppTemplate]:
    return db.query(AppTemplate).filter(AppTemplate.app_id == app_id, AppTemplate.status == 1).order_by(AppTemplate.sort_order.asc(), AppTemplate.template_id.asc()).all()


async def create_app_template(db: Session, data: dict) -> AppTemplate:
    obj = AppTemplate(**set_audit_fields_for_create(data))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


async def update_app_template(db: Session, template_id: int, data: dict) -> Optional[AppTemplate]:
    obj = await get_app_template_by_id(db, template_id)
    if obj:
        for key, value in set_audit_fields_for_update(data).items():
            setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
    return obj


async def delete_app_template_batch(db: Session, ids: list[int]) -> int:
    count = db.query(AppTemplate).filter(AppTemplate.template_id.in_(ids)).delete(synchronize_session=False) if ids else 0
    if count:
        db.commit()
    return count


async def get_app_instance_by_id(db: Session, app_instance_id: int) -> Optional[AppInstance]:
    return db.query(AppInstance).filter(AppInstance.app_instance_id == app_instance_id).first()


async def get_app_instances_by_ids(db: Session, ids: list[int]) -> list[AppInstance]:
    return db.query(AppInstance).filter(AppInstance.app_instance_id.in_(ids)).all() if ids else []


async def get_app_instance_list(db: Session, page_num=1, page_size=10, app_id=None, instance_name=None):
    query = db.query(AppInstance)
    if app_id is not None:
        query = query.filter(AppInstance.app_id == app_id)
    if instance_name:
        query = query.filter(AppInstance.instance_name.like(f"%{instance_name}%"))
    return _page(query.order_by(AppInstance.app_instance_id.desc()), AppInstance.app_instance_id, page_num, page_size)


async def create_app_instance(db: Session, data: dict) -> AppInstance:
    obj = AppInstance(**set_audit_fields_for_create(data))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


async def update_app_instance(db: Session, app_instance_id: int, data: dict) -> Optional[AppInstance]:
    obj = await get_app_instance_by_id(db, app_instance_id)
    if obj:
        for key, value in set_audit_fields_for_update(data).items():
            setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
    return obj


async def update_app_instance_execute_state(db: Session, app_instance_id: int, success: bool, screen_photo_file: str | None = None):
    obj = await get_app_instance_by_id(db, app_instance_id)
    if obj:
        obj.exec_count = (obj.exec_count or 0) + 1
        obj.status = 1 if success else 0
        if screen_photo_file:
            obj.screen_photo_file = screen_photo_file
        obj.update_time = datetime.now()
        db.commit()
        db.refresh(obj)
    return obj


async def delete_app_instance_batch(db: Session, ids: list[int]) -> int:
    count = db.query(AppInstance).filter(AppInstance.app_instance_id.in_(ids)).delete(synchronize_session=False) if ids else 0
    if count:
        db.commit()
    return count


async def create_app_result(db: Session, data: dict) -> AppResult:
    obj = AppResult(**set_audit_fields_for_create(data))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


async def get_app_result_list(db: Session, page_num=1, page_size=10, app_instance_id=None, result_status=None):
    query = db.query(AppResult)
    if app_instance_id is not None:
        query = query.filter(AppResult.app_instance_id == app_instance_id)
    if result_status is not None:
        query = query.filter(AppResult.result_status == result_status)
    return _page(query.order_by(AppResult.app_result_id.desc()), AppResult.app_result_id, page_num, page_size)


async def delete_app_result_batch(db: Session, ids: list[int]) -> int:
    count = db.query(AppResult).filter(AppResult.app_result_id.in_(ids)).delete(synchronize_session=False) if ids else 0
    if count:
        db.commit()
    return count
