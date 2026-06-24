"""异常用例类型接口。"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.exception_case_type_schemas import (
    ExceptionCaseTypeCreate,
    ExceptionCaseTypeIds,
    ExceptionCaseTypeList,
    ExceptionCaseTypeUpdate,
)
from service.exception_case_type_service import (
    create_exception_case_type_service,
    delete_exception_case_type_batch_service,
    delete_exception_case_type_service,
    get_exception_case_type_list_service,
    get_exception_case_type_service,
    update_exception_case_type_service,
)

router = APIRouter()


@router.get("/exceptionCaseType", response_model=dict)
async def list_exception_case_type(
    search_params: ExceptionCaseTypeList = Depends(),
    db: Session = Depends(get_db),
):
    """获取异常用例类型分页列表。"""
    return await get_exception_case_type_list_service(db, search_params)


@router.post("/exceptionCaseType", response_model=dict)
async def create_exception_case_type(
    data: ExceptionCaseTypeCreate,
    db: Session = Depends(get_db),
):
    """创建异常用例类型。"""
    return await create_exception_case_type_service(db, data)


@router.put("/exceptionCaseType", response_model=dict)
async def update_exception_case_type(
    data: ExceptionCaseTypeUpdate,
    db: Session = Depends(get_db),
):
    """更新异常用例类型。"""
    return await update_exception_case_type_service(db, data.exception_id, data)


@router.delete("/exceptionCaseType/batch", response_model=dict)
async def delete_exception_case_type_batch(
    data: ExceptionCaseTypeIds,
    db: Session = Depends(get_db),
):
    """批量删除异常用例类型。"""
    return await delete_exception_case_type_batch_service(db, data.ids)


@router.get("/exceptionCaseType/{item_id}", response_model=dict)
async def get_exception_case_type(
    item_id: int,
    db: Session = Depends(get_db),
):
    """获取异常用例类型详情。"""
    return await get_exception_case_type_service(db, item_id)


@router.delete("/exceptionCaseType/{item_id}", response_model=dict)
async def delete_exception_case_type(
    item_id: int,
    db: Session = Depends(get_db),
):
    """删除异常用例类型。"""
    return await delete_exception_case_type_service(db, item_id)
