"""异常用例类型模型。"""
from sqlalchemy import BigInteger, Column, DateTime, Integer, String, Text

from core.db import Base


class ExceptionCaseType(Base):
    """异常用例类型表。"""

    __tablename__ = "exception_case_type"

    exception_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="主键")
    exception_name = Column(String(100), nullable=False, comment="异常名称")
    exception_type = Column(Integer, nullable=False, comment="异常类型")
    operation_type = Column(String(100), nullable=False, default="1", comment="操作类型")
    exception_value = Column(Text, nullable=False, comment="异常值")
    creator = Column(String(50), comment="创建人")
    create_time = Column(DateTime, comment="创建时间")
    update_time = Column(DateTime, comment="更新时间")

    def __repr__(self):
        return f"<ExceptionCaseType(exception_id={self.exception_id})>"
