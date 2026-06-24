from fastapi import APIRouter

from . import (
    api_execute,
    api_info,
    api_instance,
    api_result,
    api_template,
    app,
    auth,
    case_generate,
    dict_info,
    element_template,
    exception_case_type,
    flow_info,
    flow_result,
    flow_step,
    page_execute,
    page_info,
    page_instance,
    page_result,
    project_info,
    swagger_parse,
    sys_user,
    system_log,
    token_info,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/api/v1", tags=["认证"])
api_router.include_router(case_generate.router, prefix="/api/v1", tags=["自动生成用例"])
api_router.include_router(sys_user.router, prefix="/api/v1", tags=["系统用户"])
api_router.include_router(project_info.router, prefix="/api/v1", tags=["项目管理"])
api_router.include_router(dict_info.router, prefix="/api/v1", tags=["字典管理"])
api_router.include_router(exception_case_type.router, prefix="/api/v1", tags=["异常用例类型管理"])
api_router.include_router(api_info.router, prefix="/api/v1", tags=["API信息管理"])
api_router.include_router(api_instance.router, prefix="/api/v1", tags=["API实例管理"])
api_router.include_router(api_template.router, prefix="/api/v1", tags=["API模板管理"])
api_router.include_router(api_result.router, prefix="/api/v1", tags=["API结果管理"])
api_router.include_router(page_info.router, prefix="/api/v1", tags=["页面信息管理"])
api_router.include_router(page_instance.router, prefix="/api/v1", tags=["页面实例管理"])
api_router.include_router(page_result.router, prefix="/api/v1", tags=["页面结果管理"])
api_router.include_router(page_execute.router, prefix="/api/v1", tags=["页面执行"])
api_router.include_router(element_template.router, prefix="/api/v1", tags=["元素模板管理"])
api_router.include_router(flow_info.router, prefix="/api/v1", tags=["流程信息管理"])
api_router.include_router(flow_step.router, prefix="/api/v1", tags=["流程步骤管理"])
api_router.include_router(flow_result.router, prefix="/api/v1", tags=["流程结果管理"])
api_router.include_router(token_info.router, prefix="/api/v1", tags=["Token管理"])
api_router.include_router(api_execute.router, prefix="/api/v1", tags=["API执行"])
api_router.include_router(app.router, prefix="/api/v1", tags=["App自动化"])
api_router.include_router(swagger_parse.router, prefix="/api/v1", tags=["Swagger解析"])
api_router.include_router(system_log.router, prefix="/api/v1", tags=["系统日志"])
