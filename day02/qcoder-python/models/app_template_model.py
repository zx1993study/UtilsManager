from sqlalchemy import BigInteger, Column, DateTime, SmallInteger, String, Text

from core.db import Base


class AppTemplate(Base):
    __tablename__ = "app_template"

    template_id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    template_name = Column(String(100), nullable=False, comment="template name")
    app_id = Column(BigInteger, nullable=False, comment="app id")
    locator_type = Column(String(50), nullable=False, comment="id/xpath/accessibility_id/class_name/android_uiautomator/ios_predicate")
    locator_value = Column(Text, nullable=False, comment="locator value")
    element_type = Column(String(50), comment="input/button/text/select")
    action_type = Column(String(50), nullable=False, comment="click/input/clear/wait/assert_text/back")
    input_key = Column(String(100), comment="parameter key")
    default_value = Column(Text, comment="default value")
    sort_order = Column(SmallInteger, default=1, comment="sort order")
    status = Column(SmallInteger, default=1, comment="status")
    remark = Column(Text, comment="remark")
    creator = Column(String(50), comment="creator")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<AppTemplate(template_id={self.template_id})>"
