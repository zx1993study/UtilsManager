"""
认证相关Schema
"""
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class LoginRequest(BaseModel):
    """登录请求"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class ChangePasswordRequest(BaseModel):
    """修改密码请求"""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    old_password: str = Field(..., description="旧密码")
    new_password: str = Field(..., description="新密码")
