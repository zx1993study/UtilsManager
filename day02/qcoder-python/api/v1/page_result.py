from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.page_result_schemas import PageResultCreate, PageResultUpdate, PageResulIds
from service.page_result_service import (
    clear_page_result_service,
    create_page_result_service,
    delete_page_result_batch_service,
    delete_page_result_service,
    get_latest_page_result_by_instance_service,
    get_page_result_list_service,
    get_page_result_service,
    update_page_result_service,
)

router = APIRouter()


@router.get("/pageResult", response_model=dict)
async def list_page_result(
    page_num: int = Query(default=1, alias="pageNum", ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    testcase_name: str | None = Query(default=None, alias="testcaseName"),
    result_status: int | None = Query(default=None, alias="resultStatus"),
    db: Session = Depends(get_db),
):
    return await get_page_result_list_service(db, page_num, page_size, testcase_name, result_status)


@router.get("/pageResult/latest", response_model=dict)
async def get_latest_page_result(
    instance_id: int = Query(..., alias="instanceId"),
    db: Session = Depends(get_db),
):
    return await get_latest_page_result_by_instance_service(db, instance_id)


@router.get("/pageResult/latest/{instance_id}", response_model=dict)
async def get_latest_page_result_by_path(
    instance_id: int,
    db: Session = Depends(get_db),
):
    return await get_latest_page_result_by_instance_service(db, instance_id)


@router.get("/pageResult/{item_id}", response_model=dict)
async def get_page_result(
    item_id: int,
    db: Session = Depends(get_db),
):
    return await get_page_result_service(db, item_id)


@router.post("/pageResult", response_model=dict)
async def create_page_result(
    data: PageResultCreate,
    db: Session = Depends(get_db),
):
    return await create_page_result_service(db, data)


@router.put("/pageResult", response_model=dict)
async def update_page_result(
    data: PageResultUpdate,
    db: Session = Depends(get_db),
):
    return await update_page_result_service(db, data.page_result_id, data)


@router.delete("/pageResult/batch", response_model=dict)
async def delete_page_result_batch(
    data: PageResulIds,
    db: Session = Depends(get_db),
):
    return await delete_page_result_batch_service(db, data.ids)


@router.delete("/pageResult/clear", response_model=dict)
async def clear_page_result(
    db: Session = Depends(get_db),
):
    return await clear_page_result_service(db)


@router.delete("/pageResult/{item_id}", response_model=dict)
async def delete_page_result(
    item_id: int,
    db: Session = Depends(get_db),
):
    return await delete_page_result_service(db, item_id)
