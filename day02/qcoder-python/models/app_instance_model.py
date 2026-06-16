from sqlalchemy import BigInteger, Column, DateTime, Integer, SmallInteger, String, Text

from core.db import Base


class AppInstance(Base):
    __tablename__ = "app_instance"

    app_instance_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    app_id = Column(BigInteger, nullable=False, comment="app id")
    instance_name = Column(String(100), nullable=False, comment="test case name")
    operation_json = Column(Text, comment="operation json")
    expect_result = Column(Text, comment="expect result")
    screen_photo_file = Column(String(160), comment="screenshot file")
    exec_count = Column(Integer, default=0, comment="execute count")
    description = Column(Text, comment="description")
    status = Column(SmallInteger, default=1, comment="status")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<AppInstance(app_instance_id={self.app_instance_id})>"
