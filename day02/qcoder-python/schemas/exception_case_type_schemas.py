"""异常用例类型 Schema。"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator
from pydantic.alias_generators import to_camel

from models.exception_case_type_model import ExceptionCaseType


class ExceptionCaseTypeBase(BaseModel):
    """异常用例类型基础 Schema。"""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    exception_name: Optional[str] = Field(None, description="异常名称")
    exception_type: Optional[int] = Field(None, description="异常类型")
    operation_type: Optional[str] = Field(None, description="操作类型")
    operation_types: Optional[list[int]] = Field(None, description="操作类型列表")
    exception_value: Optional[str] = Field(None, description="异常值")

    @field_validator("operation_type", mode="before")
    @classmethod
    def normalize_operation_type(cls, value):
        if isinstance(value, list):
            return ",".join(str(item) for item in value if item is not None)
        if value is None:
            return value
        return str(value)

    @field_validator("operation_types", mode="before")
    @classmethod
    def normalize_operation_types(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            return [int(item) for item in value.split(",") if item.strip()]
        if isinstance(value, int):
            return [value]
        return value


class ExceptionCaseTypeCreate(ExceptionCaseTypeBase):
    """异常用例类型创建 Schema。"""

    exception_name: str = Field(..., description="异常名称")
    exception_type: int = Field(..., description="异常类型")
    exception_value: str = Field(..., description="异常值")


class ExceptionCaseTypeUpdate(ExceptionCaseTypeBase):
    """异常用例类型更新 Schema。"""

    exception_id: int = Field(..., description="主键")


class ExceptionCaseTypeList(ExceptionCaseTypeBase):
    """异常用例类型列表查询 Schema。"""

    page_num: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=10, ge=1, le=100, description="每页条数")

    def filter_params(self):
        filters = []
        if self.exception_name:
            filters.append(ExceptionCaseType.exception_name.contains(self.exception_name))
        if self.exception_type is not None:
            filters.append(ExceptionCaseType.exception_type == self.exception_type)
        if self.operation_type is not None:
            filters.append(ExceptionCaseType.operation_type.op("REGEXP")(f"(^|,){int(self.operation_type)}(,|$)"))
        if self.exception_value:
            filters.append(ExceptionCaseType.exception_value.contains(self.exception_value))
        return filters


class ExceptionCaseTypeIds(BaseModel):
    """异常用例类型批量操作 Schema。"""

    ids: list[int] = Field(..., description="异常用例类型 ID 列表")


class ExceptionCaseTypeInfo(ExceptionCaseTypeBase):
    """异常用例类型响应 Schema。"""

    exception_id: Optional[int] = Field(None, description="主键")
    creator: Optional[str] = Field(None, description="创建人")
    create_time: Optional[datetime] = Field(None, description="创建时间")
    update_time: Optional[datetime] = Field(None, description="更新时间")

    @field_serializer("operation_types")
    def serialize_operation_types(self, value, _info) -> list[int]:
        if value:
            return value
        if self.operation_type is None:
            return []
        return [int(item) for item in str(self.operation_type).split(",") if item.strip()]

    @field_serializer("create_time", "update_time")
    def serialize_datetime(self, dt: Optional[datetime], _info) -> Optional[str]:
        if dt is None:
            return None
        return dt.strftime("%Y-%m-%d %H:%M:%S")
