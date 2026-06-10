from fastapi import APIRouter
from . import sys_user, project_info, dict_info, api_info, api_instance, api_template, api_result, page_info, page_instance, page_result, element_template, flow_info, flow_step, flow_result, token_info, api_execute, swagger_parse, auth

# 创建 API v1 主路由器
api_router = APIRouter()

# 包含所有子路由
api_router.include_router(auth.router, prefix="/api/v1", tags=["认证"])
api_router.include_router(sys_user.router, prefix="/api/v1", tags=["系统用户"])
api_router.include_router(project_info.router, prefix="/api/v1", tags=["项目管理"])
api_router.include_router(dict_info.router, prefix="/api/v1", tags=["字典管理"])
api_router.include_router(api_info.router, prefix="/api/v1", tags=["API信息管理"])
api_router.include_router(api_instance.router, prefix="/api/v1", tags=["API实例管理"])
api_router.include_router(api_template.router, prefix="/api/v1", tags=["API模板管理"])
api_router.include_router(api_result.router, prefix="/api/v1", tags=["API结果管理"])
api_router.include_router(page_info.router, prefix="/api/v1", tags=["页面信息管理"])
api_router.include_router(page_instance.router, prefix="/api/v1", tags=["页面实例管理"])
api_router.include_router(page_result.router, prefix="/api/v1", tags=["页面结果管理"])
api_router.include_router(element_template.router, prefix="/api/v1", tags=["元素模板管理"])
api_router.include_router(flow_info.router, prefix="/api/v1", tags=["流程信息管理"])
api_router.include_router(flow_step.router, prefix="/api/v1", tags=["流程步骤管理"])
api_router.include_router(flow_result.router, prefix="/api/v1", tags=["流程结果管理"])
api_router.include_router(token_info.router, prefix="/api/v1", tags=["Token管理"])
api_router.include_router(api_execute.router,prefix="/api/v1", tags=["API执行"])
api_router.include_router(swagger_parse.router, prefix="/api/v1", tags=["Swagger解析"])
