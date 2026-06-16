from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.element_template_schemas import (
    ElementTemplateCreate,
    ElementTemplateIds,
    ElementTemplateList,
    ElementTemplateUpdate,
)
from service.element_template_service import (
    create_element_template_service,
    delete_element_template_batch_service,
    delete_element_template_service,
    get_element_template_list_service,
    get_element_template_service,
    get_element_templates_by_page_service,
    update_element_template_service,
)

router = APIRouter(prefix="/elementTemplate", tags=["元素模板"])


@router.get("/", response_model=dict)
async def list_element_template(
    search_params: ElementTemplateList = Depends(),
    db: Session = Depends(get_db),
):
    """获取元素模板分页列表。"""
    return await get_element_template_list_service(db, search_params)


@router.get("/page/{page_id}", response_model=dict)
async def list_element_template_by_page(
    page_id: int,
    db: Session = Depends(get_db),
):
    """获取页面下的元素模板。"""
    return await get_element_templates_by_page_service(db, page_id)


@router.get("/{item_id}", response_model=dict)
async def get_element_template(
    item_id: int,
    db: Session = Depends(get_db),
):
    """获取元素模板详情。"""
    return await get_element_template_service(db, item_id)


@router.post("/", response_model=dict)
async def create_element_template(
    data: ElementTemplateCreate,
    db: Session = Depends(get_db),
):
    """创建元素模板。"""
    return await create_element_template_service(db, data)


@router.put("/{item_id}", response_model=dict)
async def update_element_template(
    item_id: int,
    data: ElementTemplateUpdate,
    db: Session = Depends(get_db),
):
    """更新元素模板。"""
    return await update_element_template_service(db, item_id, data)


@router.delete("/batch", response_model=dict)
async def delete_element_template_batch(
    data: ElementTemplateIds,
    db: Session = Depends(get_db),
):
    """批量删除元素模板。"""
    return await delete_element_template_batch_service(db, data.ids)


@router.delete("/{item_id}", response_model=dict)
async def delete_element_template(
    item_id: int,
    db: Session = Depends(get_db),
):
    """删除元素模板。"""
    return await delete_element_template_service(db, item_id)
