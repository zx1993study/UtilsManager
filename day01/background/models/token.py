
"""
Token信息模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime
from models import Base
from datetime import datetime

class Token(Base):
    """Token信息表"""
    __tablename__ = 'token_info'

    token_id = Column(BigInteger, primary_key=True, comment='tokenId')
    name = Column(String(255), comment='名称')
    type = Column(String(255), comment='类型')
    url = Column(String(255), comment='URL')
    param_type = Column(String(255), comment='参数类型')
    param = Column(Text, comment='参数')
    status = Column(String(255), comment='状态')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.token_id),
            'name': self.name,
            'type': self.type,
            'url': self.url,
            'paramType': self.param_type,
            'param': self.param,
            'status': self.status,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
