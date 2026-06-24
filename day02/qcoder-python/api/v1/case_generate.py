"""自动生成测试用例接口。"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.case_generate_schemas import CaseGenerateRequest
from service.case_generate_service import (
    preview_api_cases_service,
    preview_page_cases_service,
    save_api_cases_service,
    save_page_cases_service,
)

router = APIRouter()


@router.post("/caseGenerate/api/preview", response_model=dict)
async def preview_api_cases(data: CaseGenerateRequest, db: Session = Depends(get_db)):
    return await preview_api_cases_service(db, data)


@router.post("/caseGenerate/api/save", response_model=dict)
async def save_api_cases(data: CaseGenerateRequest, db: Session = Depends(get_db)):
    return await save_api_cases_service(db, data)


@router.post("/caseGenerate/page/preview", response_model=dict)
async def preview_page_cases(data: CaseGenerateRequest, db: Session = Depends(get_db)):
    return await preview_page_cases_service(db, data)


@router.post("/caseGenerate/page/save", response_model=dict)
async def save_page_cases(data: CaseGenerateRequest, db: Session = Depends(get_db)):
    return await save_page_cases_service(db, data)

