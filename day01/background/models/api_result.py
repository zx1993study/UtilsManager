
"""
API结果模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class ApiResult(Base):
    """接口结果表"""
    __tablename__ = 'api_result'

    api_result_id = Column(BigInteger, primary_key=True, comment='接口结果id')
    return_info = Column(Text, comment='返回信息')
    instance_id = Column(String(255), comment='接口实例id')
    result_status = Column(String(255), comment='结果状态')
    code = Column(String(255), comment='code')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_instance_id', 'instance_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.api_result_id),
            'returnInfo': self.return_info,
            'instanceId': self.instance_id,
            'resultStatus': self.result_status,
            'code': self.code,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
