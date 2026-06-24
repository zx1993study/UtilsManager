import asyncio
import os
import traceback
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

from api.v1 import api_router
from core.config import settings
from core.logger import logger
from core.responsemsg import error_response
from core.schema_migrations import ensure_runtime_schema
from service.system_log_service import cleanup_old_logs, periodic_log_cleanup


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_runtime_schema()
    await cleanup_old_logs()
    cleanup_task = asyncio.create_task(periodic_log_cleanup())
    logger.info("应用启动完成")
    try:
        yield
    finally:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass
        logger.info("应用关闭")


app = FastAPI(
    title=settings.APP_NAME,
    description="基于 FastAPI 的自动化测试服务",
    version=settings.APP_VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"],
)

app.include_router(api_router)

os.makedirs(settings.PLAYWRIGHT_SCREENSHOT_PATH, exist_ok=True)
app.mount(
    "/static/screenshots",
    StaticFiles(directory=settings.PLAYWRIGHT_SCREENSHOT_PATH),
    name="screenshots",
)

os.makedirs(settings.PLAYWRIGHT_TOKEN_PATH, exist_ok=True)
app.mount(
    "/static/tokens",
    StaticFiles(directory=settings.PLAYWRIGHT_TOKEN_PATH),
    name="tokens",
)

os.makedirs(settings.APPIUM_SCREENSHOT_PATH, exist_ok=True)
app.mount(
    "/static/app-screenshots",
    StaticFiles(directory=settings.APPIUM_SCREENSHOT_PATH),
    name="app-screenshots",
)


@app.middleware("http")
async def exception_handling_middleware(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    except Exception as exc:
        logger.error(f"服务器内部错误 - 请求路径: {request.url.path}")
        logger.error(f"请求方法: {request.method}")
        logger.error(f"错误类型: {type(exc).__name__}")
        logger.error(f"错误信息: {str(exc)}")
        logger.error(f"堆栈跟踪:\n{traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content=error_response(
                msg="服务器内部错误",
                data=None,
                error=str(exc),
                log_exception=False,
            ),
        )


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} API 服务"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"服务器内部错误 - 请求路径: {request.url.path}")
    logger.error(f"错误类型: {type(exc).__name__}")
    logger.error(f"错误信息: {str(exc)}")
    logger.error(f"堆栈跟踪:\n{traceback.format_exc()}")
    return error_response(
        msg="服务器内部错误",
        data=None,
        error=str(exc),
        log_exception=False,
    )


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
