from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class AppResult(Base):
    __tablename__ = "app_result"

    app_result_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    app_instance_id = Column(BigInteger, nullable=False, comment="app instance id")
    result_status = Column(SmallInteger, default=0, comment="result status")
    code = Column(String(50), comment="code")
    response_info = Column(Text, comment="response info")
    screenshot_path = Column(Text, comment="screenshot path json")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<AppResult(app_result_id={self.app_result_id})>"
