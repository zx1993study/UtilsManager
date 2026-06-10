"""
认证业务逻辑

约定（与其它 service 一致）：业务失败返回 error_response（HTTP 200, success=False），
不抛 HTTPException；只有 token 校验类失败在依赖层 get_current_user 中抛 401。
"""
from sqlalchemy.orm import Session
from core.responsemsg import success_response, error_response
from core.jwt import (
    verify_password,
    get_password_hash,
    create_access_token,
)
from mysql.sys_user_sql import get_sys_user_by_username, update_sys_user
from models.sys_user_model import SysUser


def _check_password(plain: str, stored: str) -> bool:
    """校验密码。

    兼容两种存储：bcrypt 哈希（以 $2 开头）走哈希校验；
    其余按历史明文数据直接比较，避免老库登录不上。
    """
    if not stored:
        return False
    if stored.startswith("$2"):
        try:
            return verify_password(plain, stored)
        except Exception:
            return False
    return plain == stored


def _user_info(user: SysUser) -> dict:
    """构造返回给前端的用户信息（camelCase）"""
    return {
        "userId": user.user_id,
        "username": user.username,
        "nickname": user.nickname,
        "deptId": user.dept_id,
        "status": user.status,
        "avatar": None,
    }


async def login_service(db: Session, username: str, password: str) -> dict:
    """登录：校验用户名/密码，签发 JWT"""
    user = await get_sys_user_by_username(db, username)
    if not user or not _check_password(password, user.password):
        return error_response("用户名或密码错误")

    if user.status is not None and int(user.status) == 0:
        return error_response("账号已被禁用，请联系管理员")

    token = create_access_token({"sub": user.username, "userId": user.user_id})
    return success_response("登录成功", {
        "token": token,
        "userInfo": _user_info(user),
    })


async def get_user_info_service(user: SysUser) -> dict:
    """获取当前登录用户信息（user 由 get_current_user 注入）"""
    return success_response("获取成功", _user_info(user))


async def refresh_token_service(user: SysUser) -> dict:
    """刷新 token（基于已校验的当前用户重新签发）"""
    token = create_access_token({"sub": user.username, "userId": user.user_id})
    return success_response("刷新成功", {"token": token})


async def logout_service() -> dict:
    """登出：JWT 无状态，服务端无需处理，由前端清除本地 token"""
    return success_response("已退出登录")


async def change_password_service(
    db: Session, user: SysUser, old_password: str, new_password: str
) -> dict:
    """修改当前用户密码"""
    if not _check_password(old_password, user.password):
        return error_response("旧密码不正确")
    await update_sys_user(db, user.user_id, {"password": get_password_hash(new_password)})
    return success_response("密码修改成功")
