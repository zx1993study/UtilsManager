
"""
API模板模型
"""
from sqlalchemy import Column, BigInteger, String, DateTime, Index
from models import Base
from datetime import datetime

class ApiTemplate(Base):
    """接口模板表"""
    __tablename__ = 'api_template'

    api_template_id = Column(BigInteger, primary_key=True, comment='接口模板id')
    field_name = Column(String(255), comment='字段名称')
    field_type = Column(String(255), comment='字段类型')
    field_size = Column(String(255), comment='字段大小')
    not_null = Column(String(255), comment='非空')
    api_id = Column(String(255), comment='接口id')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_api_id', 'api_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.api_template_id),
            'fieldName': self.field_name,
            'fieldType': self.field_type,
            'fieldSize': self.field_size,
            'notNull': self.not_null,
            'apiId': self.api_id,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
