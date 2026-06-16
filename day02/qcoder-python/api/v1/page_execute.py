from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.page_execute_schemas import (
    PageInspectRequest,
    PageTemplateExecuteRequest,
    PageTokenSaveRequest,
)
from service.page_execute_service import (
    execute_page_by_element_templates as svc_execute_page_by_element_templates,
    inspect_page_to_element_templates as svc_inspect_page_to_element_templates,
    save_token_json_by_instance as svc_save_token_json_by_instance,
)

router = APIRouter()


@router.post("/page/inspect")
async def inspect_page(data: PageInspectRequest, db: Session = Depends(get_db)):
    return await svc_inspect_page_to_element_templates(
        db=db,
        page_id=data.page_id,
        page_url=data.page_url,
        replace=data.replace,
        headless=data.headless,
        request_id=data.request_id,
    )


@router.post("/page/execute_by_template")
async def run_execute_by_template(data: PageTemplateExecuteRequest, db: Session = Depends(get_db)):
    return await svc_execute_page_by_element_templates(
        page_id=data.page_id,
        instance_ids=data.instance_ids,
        db=db,
        request_id=data.request_id,
    )


@router.post("/page/save_token_json")
async def save_token_json(data: PageTokenSaveRequest, db: Session = Depends(get_db)):
    return await svc_save_token_json_by_instance(
        db=db,
        page_instance_id=data.page_instance_id,
        token_file_name=data.token_file_name,
    )
