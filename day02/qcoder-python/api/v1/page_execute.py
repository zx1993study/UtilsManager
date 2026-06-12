from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.db import get_db
from schemas.page_execute_schemas import PageExecuteFileUpdate, PageExecuteRequest, PageTokenSaveRequest
from service.page_execute_service import (
    generate_page_excute_file as svc_generate_page_excute_file,
    stop_generate_page_excute_file as svc_stop_generate_page_excute_file,
    update_page_execute_file_by_file as svc_update_page_execute_file_by_file,
    execute_file as svc_execute_file,
    get_page_execute_file as svc_get_page_execute_file,
    delete_page_execute_file as svc_delete_page_execute_file,
    save_token_json_by_instance as svc_save_token_json_by_instance,
)


router = APIRouter()


@router.post("/page/bash/generate/{pageId}")
async def generate_execute_file(pageId: int, db: Session = Depends(get_db)):
    """生成页面执行文件"""
    return await svc_generate_page_excute_file(page_id=pageId, db=db)


@router.post("/page/bash/generate/{pageId}/stop")
async def stop_generate_execute_file(pageId: int):
    """结束页面执行文件录制"""
    return await svc_stop_generate_page_excute_file(page_id=pageId)


@router.put("/page/update_execute_file")
async def update_execute_file(data: PageExecuteFileUpdate):
    """更新页面执行文件"""
    return await svc_update_page_execute_file_by_file(file_path=data.file_path, content=data.content)


@router.post("/page/execute")
async def run_execute_file(data: PageExecuteRequest, db: Session = Depends(get_db)):
    """执行页面执行文件"""
    return await svc_execute_file(file_path=data.file_path, instance_ids=data.instance_ids, db=db)


@router.post("/page/save_token_json")
async def save_token_json(data: PageTokenSaveRequest, db: Session = Depends(get_db)):
    """执行页面实例并保存 token JSON"""
    return await svc_save_token_json_by_instance(
        db=db,
        page_instance_id=data.page_instance_id,
        token_file_name=data.token_file_name,
    )


@router.get("/page/get_execute_file")
async def get_execute_file(filePath: str):
    """获取页面执行文件"""
    return await svc_get_page_execute_file(file_path=filePath)


@router.delete("/page/delete_execute_file")
async def delete_execute_file(filePath: str = Query(...)):
    """删除页面执行文件"""
    return await svc_delete_page_execute_file(file_path=filePath)
