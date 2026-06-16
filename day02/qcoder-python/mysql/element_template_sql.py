from typing import List, Optional, Tuple

from sqlalchemy import and_, func
from sqlalchemy.orm import Session

from models.element_template_model import ElementTemplate
from schemas.element_template_schemas import ElementTemplateList
from utils.data_paser import set_audit_fields_for_create, set_audit_fields_for_update


async def get_element_template_by_id(db: Session, element_id: int) -> Optional[ElementTemplate]:
    """根据ID获取元素模板。"""
    return db.query(ElementTemplate).filter(ElementTemplate.element_id == element_id).first()


async def get_element_template_by_unique_fields(
    db: Session,
    element_name: str,
    element_type: int,
    page_id: int,
) -> Optional[ElementTemplate]:
    """根据唯一字段组合获取元素模板。"""
    return db.query(ElementTemplate).filter(
        and_(
            ElementTemplate.element_name == element_name,
            ElementTemplate.element_type == element_type,
            ElementTemplate.page_id == page_id,
        )
    ).first()


async def get_element_template_list(
    db: Session,
    page_num: int = 1,
    page_size: int = 10,
    filter: ElementTemplateList | None = None,
) -> Tuple[List[ElementTemplate], int]:
    """获取元素模板分页列表。"""
    page_num = filter.page_num if filter else page_num
    page_size = filter.page_size if filter else page_size
    offset = (page_num - 1) * page_size

    base_query = db.query(ElementTemplate)
    if filter:
        base_query = base_query.filter(*filter.filter_params())

    total = base_query.with_entities(func.count(ElementTemplate.element_id)).scalar()
    items = base_query.order_by(ElementTemplate.element_id.desc()).offset(offset).limit(page_size).all()
    return items, total


async def get_element_templates_by_page_id(db: Session, page_id: int) -> List[ElementTemplate]:
    """根据页面ID获取元素模板，按录制顺序返回。"""
    return db.query(ElementTemplate).filter(
        ElementTemplate.page_id == page_id,
        ElementTemplate.status == 1,
    ).order_by(ElementTemplate.element_id.asc()).all()


async def create_element_template(db: Session, data: dict) -> ElementTemplate:
    """创建元素模板。"""
    data = set_audit_fields_for_create(data)
    db_obj = ElementTemplate(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


async def batch_create_element_templates(db: Session, rows: List[dict]) -> List[ElementTemplate]:
    """批量创建元素模板。"""
    if not rows:
        return []
    db_rows = [ElementTemplate(**set_audit_fields_for_create(row)) for row in rows]
    db.add_all(db_rows)
    db.commit()
    for row in db_rows:
        db.refresh(row)
    return db_rows


async def update_element_template(db: Session, element_id: int, data: dict) -> Optional[ElementTemplate]:
    """更新元素模板。"""
    db_obj = db.query(ElementTemplate).filter(ElementTemplate.element_id == element_id).first()
    if db_obj:
        data = set_audit_fields_for_update(data)
        for key, value in data.items():
            setattr(db_obj, key, value)
        db.commit()
        db.refresh(db_obj)
    return db_obj


async def delete_element_template(db: Session, element_id: int) -> Optional[ElementTemplate]:
    """删除元素模板。"""
    db_obj = db.query(ElementTemplate).filter(ElementTemplate.element_id == element_id).first()
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj


async def delete_element_template_batch(db: Session, ids: List[int]) -> int:
    """批量删除元素模板。"""
    if not ids:
        return 0
    count = db.query(ElementTemplate).filter(ElementTemplate.element_id.in_(ids)).delete(synchronize_session=False)
    if count:
        db.commit()
    return count


async def delete_element_templates_by_page_ids(db: Session, page_ids: List[int]) -> int:
    """Delete element templates by page ids."""
    if not page_ids:
        return 0
    count = db.query(ElementTemplate).filter(
        ElementTemplate.page_id.in_(page_ids)
    ).delete(synchronize_session=False)
    if count:
        db.commit()
    return count


async def delete_element_templates_by_page_id(db: Session, page_id: int) -> int:
    """删除页面下的元素模板。"""
    count = db.query(ElementTemplate).filter(ElementTemplate.page_id == page_id).delete(synchronize_session=False)
    if count:
        db.commit()
    return count
