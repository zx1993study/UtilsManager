import traceback
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from core.db import engine, Base
from core.config import settings
from api.v1 import api_router
from core.responsemsg import error_response
from core.logger import logger

# 创建数据库表
Base.metadata.create_all(bind=engine)


def _seed_default_users():
    """首次启动时幂等播种默认账号，保证登录开箱可用。

    仅当 sys_user 表为空时写入：admin/admin123、test_user/test123（密码 bcrypt 存储）。
    任何异常都不应阻断应用启动。
    """
    try:
        from datetime import datetime
        from core.db import SessionLocal
        from models.sys_user_model import SysUser
        from core.jwt import get_password_hash

        db = SessionLocal()
        try:
            if db.query(SysUser).count() == 0:
                now = datetime.now()
                db.add_all([
                    SysUser(username="admin", password=get_password_hash("admin123"),
                            nickname="管理员", status=1, creator="system",
                            create_time=now, update_time=now),
                    SysUser(username="test_user", password=get_password_hash("test123"),
                            nickname="测试用户", status=1, creator="system",
                            create_time=now, update_time=now),
                ])
                db.commit()
                logger.info("已播种默认账号：admin / test_user")
        finally:
            db.close()
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"默认账号播种跳过：{exc}")


_seed_default_users()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    logger.info("应用启动...")
    yield
    # 关闭时执行
    logger.info("应用关闭...")

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    description="这是一个基于 FastAPI 的 API 服务",
    version=settings.APP_VERSION,
    openapi_url=f"/openapi.json",
    docs_url="/docs",  # Swagger UI 文档地址
    redoc_url="/redoc",  # ReDoc 文档地址
    lifespan=lifespan
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加可信主机中间件
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# 注册 API v1 路由
app.include_router(api_router)

# 挂载页面执行截图静态目录。前端经 Vite 代理访问 /api/static/screenshots/<file>。
os.makedirs(settings.PLAYWRIGHT_SCREENSHOT_PATH, exist_ok=True)
app.mount(
    "/static/screenshots",
    StaticFiles(directory=settings.PLAYWRIGHT_SCREENSHOT_PATH),
    name="screenshots"
)

os.makedirs(settings.PLAYWRIGHT_TOKEN_PATH, exist_ok=True)
app.mount(
    "/static/tokens",
    StaticFiles(directory=settings.PLAYWRIGHT_TOKEN_PATH),
    name="tokens"
)

# 异常处理中间件 - 捕获所有异常包括序列化异常
@app.middleware("http")
async def exception_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        # 记录详细的错误日志
        logger.error(f"服务器内部错误 - 请求路径: {request.url.path}")
        logger.error(f"请求方法: {request.method}")
        logger.error(f"错误类型: {type(exc).__name__}")
        logger.error(f"错误信息: {str(exc)}")
        logger.error(f"堆栈跟踪:\n{traceback.format_exc()}")
        
        # 返回统一错误响应
        from starlette.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content=error_response(
                msg="服务器内部错误",
                data=None,
                error=str(exc),
            )
        )

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 根路径
@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} API服务"}

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录详细的错误日志
    logger.error(f"服务器内部错误 - 请求路径: {request.url.path}")
    logger.error(f"错误类型: {type(exc).__name__}")
    logger.error(f"错误信息: {str(exc)}")
    logger.error(f"堆栈跟踪:\n{traceback.format_exc()}")
    
    return error_response(
        msg="服务器内部错误",
        data=None,
        error=str(exc),
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
