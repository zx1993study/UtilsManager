"""
JWT认证工具
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import bcrypt
from core.config import settings
from core.db import get_db

"""Bearer 提取器；auto_error=False 让我们自己统一抛 401"""
_bearer_scheme = HTTPBearer(auto_error=False)

"""说明：直接使用 bcrypt 库，而不是 passlib。"""
"""passlib 1.7.4 与 bcrypt >= 4.1/5.x 不兼容（后端探测时会抛"""
""""password cannot be longer than 72 bytes"），导致哈希/校验对任何密码都失败。"""
"""bcrypt 生成的 $2b$ 哈希是标准格式，直接用 bcrypt.checkpw 即可校验历史数据。"""


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    if not plain_password or not hashed_password:
        return False
    try:
        """bcrypt 上限 72 字节，超出部分截断（与加密时保持一致）"""
        pw = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pw, hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def get_password_hash(password: str) -> str:
    """获取密码哈希"""
    """bcrypt 限制密码长度为72字节"""
    pw = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """解码访问令牌"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
):
    """从 Authorization: Bearer <token> 解析并返回当前登录用户。

    token 缺失/无效/过期，或用户不存在时，统一抛 401，
    前端 request.js 的响应拦截器会据此清登录态并跳转登录页。
    """
    """延迟导入，避免 core 与 mysql 层循环引用"""
    from mysql.sys_user_sql import get_sys_user_by_username

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="登录已失效，请重新登录",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None or not credentials.credentials:
        raise credentials_exception

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise credentials_exception

    username = payload.get("sub")
    if not username:
        raise credentials_exception

    user = await get_sys_user_by_username(db, username)
    if not user:
        raise credentials_exception

    return user
