import traceback
from fastapi import FastAPI, Request
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
