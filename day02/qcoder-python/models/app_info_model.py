from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class AppInfo(Base):
    __tablename__ = "app_info"

    app_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    app_name = Column(String(100), nullable=False, comment="app function name")
    project_id = Column(BigInteger, comment="project id")
    platform = Column(String(20), default="Android", comment="Android or iOS")
    app_package = Column(String(200), comment="android app package")
    app_activity = Column(String(200), comment="android app activity")
    bundle_id = Column(String(200), comment="ios bundle id")
    device_name = Column(String(100), comment="device name")
    platform_version = Column(String(50), comment="platform version")
    appium_server = Column(String(300), default="http://127.0.0.1:4723", comment="appium server")
    desired_caps = Column(Text, comment="desired capabilities json")
    file_name = Column(String(100), comment="script file name")
    real_file_name = Column(String(160), comment="real script file name")
    description = Column(Text, comment="description")
    status = Column(SmallInteger, default=1, comment="status")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<AppInfo(app_id={self.app_id})>"
