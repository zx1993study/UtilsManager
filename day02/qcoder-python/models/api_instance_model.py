"""API testcase instance model."""
from sqlalchemy import BigInteger, Column, DateTime, Integer, SmallInteger, String, Text

from core.db import Base


class ApiInstance(Base):
    """API testcase instance table."""

    __tablename__ = "api_instance"

    instance_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    instance_name = Column(String(50), comment="instance name")
    description = Column(Text, comment="description")
    api_id = Column(BigInteger, comment="api id")
    token_id = Column(BigInteger, comment="tokenId")
    instance_json = Column(Text, comment="instance JSON")
    exec_count = Column(Integer, comment="execute count")
    status = Column(SmallInteger, comment="status")
    expect_result = Column(Text, comment="expect result")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<ApiInstance(instance_id={self.instance_id})>"
