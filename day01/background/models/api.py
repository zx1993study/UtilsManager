
"""
API接口模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class API(Base):
    """接口表"""
    __tablename__ = 'api_info'

    api_id = Column(BigInteger, primary_key=True, comment='接口id')
    api_name = Column(String(255), comment='接口名称')
    method_type = Column(String(255), comment='方法类型')
    method_url = Column(String(255), comment='方法URL')
    token_id = Column(String(255), comment='tokenId')
    request_header = Column(Text, comment='请求头')
    description = Column(Text, comment='描述')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_token_id', 'token_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.api_id),
            'name': self.api_name,
            'method': self.method_type,
            'url': self.method_url,
            'tokenId': self.token_id,
            'requestHeader': self.request_header,
            'description': self.description,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
