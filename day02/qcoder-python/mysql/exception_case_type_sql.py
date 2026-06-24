"""异常用例类型数据访问。"""
from typing import List, Optional, Tuple

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.exception_case_type_model import ExceptionCaseType
from schemas.exception_case_type_schemas import ExceptionCaseTypeList
from utils.data_paser import set_audit_fields_for_create, set_audit_fields_for_update


async def get_exception_case_type_by_id(
    db: Session,
    exception_id: int,
) -> Optional[ExceptionCaseType]:
    """根据 ID 获取异常用例类型。"""
    return db.query(ExceptionCaseType).filter(
        ExceptionCaseType.exception_id == exception_id
    ).first()


async def get_exception_case_type_list(
    db: Session,
    filter_data: ExceptionCaseTypeList,
) -> Tuple[List[ExceptionCaseType], int]:
    """获取异常用例类型分页列表。"""
    offset = (filter_data.page_num - 1) * filter_data.page_size
    base_query = db.query(ExceptionCaseType).filter(*filter_data.filter_params())
    total = base_query.with_entities(func.count(ExceptionCaseType.exception_id)).scalar()
    items = (
        base_query.order_by(ExceptionCaseType.exception_id.desc())
        .offset(offset)
        .limit(filter_data.page_size)
        .all()
    )
    return items, total


async def create_exception_case_type(
    db: Session,
    data: dict,
) -> ExceptionCaseType:
    """创建异常用例类型。"""
    data = set_audit_fields_for_create(data)
    data.setdefault("creator", "admin")
    db_obj = ExceptionCaseType(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


async def update_exception_case_type(
    db: Session,
    exception_id: int,
    data: dict,
) -> Optional[ExceptionCaseType]:
    """更新异常用例类型。"""
    db_obj = await get_exception_case_type_by_id(db, exception_id)
    if not db_obj:
        return None
    data = set_audit_fields_for_update(data)
    data.pop("exception_id", None)
    for key, value in data.items():
        setattr(db_obj, key, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


async def delete_exception_case_type(
    db: Session,
    exception_id: int,
) -> Optional[ExceptionCaseType]:
    """删除异常用例类型。"""
    db_obj = await get_exception_case_type_by_id(db, exception_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj


async def delete_exception_case_type_batch(db: Session, ids: List[int]) -> int:
    """批量删除异常用例类型。"""
    if not ids:
        return 0
    count = db.query(ExceptionCaseType).filter(
        ExceptionCaseType.exception_id.in_(ids)
    ).delete(synchronize_session=False)
    if count:
        db.commit()
    return count
