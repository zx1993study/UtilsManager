"""
Swagger解析路由
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from core.db import get_db
from core.responsemsg import success_response
from service.swagger_service import parse_and_save_swagger_service

router = APIRouter(prefix="/swagger", tags=["Swagger解析"])


class SwaggerParseRequest(BaseModel):
    projectId: int = Field(..., description="项目ID")
    projectSwagger: str = Field(..., description="Swagger JSON地址，例如: http://localhost:8080/v2/api-docs")


@router.post("/parse", summary="解析Swagger并同步到数据库")
async def parse_swagger(
    request: SwaggerParseRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    根据Swagger地址解析API信息和模板信息
    
    - **projectId**: 必填，关联的项目ID
    - **projectSwagger**: 必填，Swagger文档的JSON访问地址
    """
    task_info = background_tasks.add_task(parse_and_save_swagger_service, db, project_id=request.projectId, swagger_url=request.projectSwagger)
    return success_response(msg="任务已添加到后台执行, 请稍候查看结果", data={"task_id": task_info})
