"""
认证API路由

前端 src/api/auth.js 通过 /api/v1/auth/* 访问（dev 代理见 vite.config.js）。
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db import get_db
from core.jwt import get_current_user
from models.sys_user_model import SysUser
from schemas.auth_schemas import LoginRequest, ChangePasswordRequest
from service.auth_service import (
    login_service,
    get_user_info_service,
    refresh_token_service,
    logout_service,
    change_password_service,
)

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login", response_model=dict)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    """用户登录，返回 token 与用户信息"""
    return await login_service(db, data.username, data.password)


@router.get("/info", response_model=dict)
async def get_info(current_user: SysUser = Depends(get_current_user)):
    """获取当前登录用户信息（需登录）"""
    return await get_user_info_service(current_user)


@router.post("/refresh", response_model=dict)
async def refresh(current_user: SysUser = Depends(get_current_user)):
    """刷新 token（需登录）"""
    return await refresh_token_service(current_user)


@router.post("/logout", response_model=dict)
async def logout(current_user: SysUser = Depends(get_current_user)):
    """退出登录"""
    return await logout_service()


@router.put("/change-password", response_model=dict)
async def change_password(
    data: ChangePasswordRequest,
    current_user: SysUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """修改当前用户密码（需登录）"""
    return await change_password_service(
        db, current_user, data.old_password, data.new_password
    )
