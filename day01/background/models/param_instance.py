
"""
参数实例模型
"""
from sqlalchemy import Column, BigInteger, String, Text, Integer, DateTime, Index
from models import Base
from datetime import datetime

class ParamInstance(Base):
    """参数实例表"""
    __tablename__ = 'param_instance'

    instance_id = Column(BigInteger, primary_key=True, comment='接口实例id')
    instance_name = Column(String(255), comment='接口实例名称')
    description = Column(Text, comment='描述')
    api_id = Column(String(255), comment='接口id')
    instance_json = Column(Text, comment='实例JSON')
    exec_count = Column(Integer, comment='执行次数')
    status = Column(String(255), comment='状态')
    expect_result = Column(Text, comment='期望结果')
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
            'id': str(self.instance_id),
            'instanceName': self.instance_name,
            'description': self.description,
            'apiId': self.api_id,
            'instanceJson': self.instance_json,
            'execCount': self.exec_count,
            'status': self.status,
            'expectResult': self.expect_result,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
