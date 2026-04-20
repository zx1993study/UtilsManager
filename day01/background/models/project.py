
"""
项目信息模型
"""
from sqlalchemy import Column, BigInteger, String, DateTime
from models import Base
from datetime import datetime

class Project(Base):
    """项目信息表"""
    __tablename__ = 'project_info'

    project_id = Column(BigInteger, primary_key=True, comment='项目id')
    project_name = Column(String(255), comment='项目名称')
    project_address = Column(String(255), comment='项目地址')
    project_port = Column(String(255), comment='项目端口')
    project_env = Column(String(255), comment='项目环境')
    remark = Column(String(255), comment='备注')
    status = Column(String(255), comment='状态')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.project_id),
            'name': self.project_name,
            'address': self.project_address,
            'port': self.project_port,
            'environment': self.project_env,
            'remark': self.remark,
            'status': self.status,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
