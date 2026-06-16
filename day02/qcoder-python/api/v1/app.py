from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.db import get_db
from schemas.app_schemas import (
    AppExecuteRequest,
    AppInfoCreate,
    AppInfoUpdate,
    AppInstanceCreate,
    AppInstanceUpdate,
    AppTemplateCreate,
    AppTemplateUpdate,
    IdsPayload,
)
from service.app_service import (
    create_app_info_service,
    create_app_instance_service,
    create_app_template_service,
    delete_app_info_service,
    delete_app_instance_service,
    delete_app_result_service,
    delete_app_template_service,
    execute_app_service,
    list_app_info_service,
    list_app_instance_service,
    list_app_result_service,
    list_app_template_service,
    update_app_info_service,
    update_app_instance_service,
    update_app_template_service,
)

router = APIRouter()


@router.get("/appInfo")
async def list_app_info(
    page_num: int = Query(1, alias="pageNum", ge=1),
    page_size: int = Query(10, alias="pageSize", ge=1, le=1000),
    app_name: str | None = Query(None, alias="appName"),
    project_id: int | None = Query(None, alias="projectId"),
    db: Session = Depends(get_db),
):
    return await list_app_info_service(db, page_num, page_size, app_name, project_id)


@router.post("/appInfo")
async def create_app_info(data: AppInfoCreate, db: Session = Depends(get_db)):
    return await create_app_info_service(db, data)


@router.put("/appInfo")
async def update_app_info(data: AppInfoUpdate, db: Session = Depends(get_db)):
    return await update_app_info_service(db, data)


@router.delete("/appInfo/batch")
async def batch_delete_app_info(data: IdsPayload, db: Session = Depends(get_db)):
    return await delete_app_info_service(db, data.ids)


@router.delete("/appInfo/{item_id}")
async def delete_app_info(item_id: int, db: Session = Depends(get_db)):
    return await delete_app_info_service(db, [item_id])


@router.get("/appTemplate")
async def list_app_template(
    page_num: int = Query(1, alias="pageNum", ge=1),
    page_size: int = Query(10, alias="pageSize", ge=1, le=1000),
    app_id: int | None = Query(None, alias="appId"),
    template_name: str | None = Query(None, alias="templateName"),
    db: Session = Depends(get_db),
):
    return await list_app_template_service(db, page_num, page_size, app_id, template_name)


@router.post("/appTemplate")
async def create_app_template(data: AppTemplateCreate, db: Session = Depends(get_db)):
    return await create_app_template_service(db, data)


@router.put("/appTemplate")
async def update_app_template(data: AppTemplateUpdate, db: Session = Depends(get_db)):
    return await update_app_template_service(db, data)


@router.delete("/appTemplate/batch")
async def batch_delete_app_template(data: IdsPayload, db: Session = Depends(get_db)):
    return await delete_app_template_service(db, data.ids)


@router.delete("/appTemplate/{item_id}")
async def delete_app_template(item_id: int, db: Session = Depends(get_db)):
    return await delete_app_template_service(db, [item_id])


@router.get("/appInstance")
async def list_app_instance(
    page_num: int = Query(1, alias="pageNum", ge=1),
    page_size: int = Query(10, alias="pageSize", ge=1, le=1000),
    app_id: int | None = Query(None, alias="appId"),
    instance_name: str | None = Query(None, alias="instanceName"),
    db: Session = Depends(get_db),
):
    return await list_app_instance_service(db, page_num, page_size, app_id, instance_name)


@router.post("/appInstance")
async def create_app_instance(data: AppInstanceCreate, db: Session = Depends(get_db)):
    return await create_app_instance_service(db, data)


@router.put("/appInstance")
async def update_app_instance(data: AppInstanceUpdate, db: Session = Depends(get_db)):
    return await update_app_instance_service(db, data)


@router.delete("/appInstance/batch")
async def batch_delete_app_instance(data: IdsPayload, db: Session = Depends(get_db)):
    return await delete_app_instance_service(db, data.ids)


@router.delete("/appInstance/{item_id}")
async def delete_app_instance(item_id: int, db: Session = Depends(get_db)):
    return await delete_app_instance_service(db, [item_id])


@router.get("/appResult")
async def list_app_result(
    page_num: int = Query(1, alias="pageNum", ge=1),
    page_size: int = Query(10, alias="pageSize", ge=1, le=1000),
    app_instance_id: int | None = Query(None, alias="appInstanceId"),
    result_status: int | None = Query(None, alias="resultStatus"),
    db: Session = Depends(get_db),
):
    return await list_app_result_service(db, page_num, page_size, app_instance_id, result_status)


@router.delete("/appResult/batch")
async def batch_delete_app_result(data: IdsPayload, db: Session = Depends(get_db)):
    return await delete_app_result_service(db, data.ids)


@router.delete("/appResult/{item_id}")
async def delete_app_result(item_id: int, db: Session = Depends(get_db)):
    return await delete_app_result_service(db, [item_id])


@router.post("/app/execute")
async def execute_app(data: AppExecuteRequest, db: Session = Depends(get_db)):
    return await execute_app_service(db, data.app_id, data.instance_ids)
