
"""
流程步骤模型
"""
from sqlalchemy import Column, BigInteger, String, Text, DateTime, Index
from models import Base
from datetime import datetime

class FlowStep(Base):
    """流程步骤表"""
    __tablename__ = 'flow_step'

    flow_step_id = Column(BigInteger, primary_key=True, comment='流程步骤id')
    api_id = Column(String(255), comment='接口id')
    instance_id = Column(String(255), comment='实例id')
    param = Column(Text, comment='参数')
    is_batch = Column(String(255), comment='是否批处理')
    status = Column(String(255), comment='状态')
    expect_result = Column(Text, comment='预期结果')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    __table_args__ = (
        Index('idx_api_id', 'api_id'),
        Index('idx_instance_id', 'instance_id'),
    )

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.flow_step_id),
            'apiId': self.api_id,
            'instanceId': self.instance_id,
            'param': self.param,
            'isBatch': self.is_batch,
            'status': self.status,
            'expectResult': self.expect_result,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
