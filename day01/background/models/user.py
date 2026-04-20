
"""
用户信息模型
"""
from sqlalchemy import Column, BigInteger, String, DateTime
from models import Base
from datetime import datetime

class User(Base):
    """用户信息表"""
    __tablename__ = 'user_info'

    user_id = Column(BigInteger, primary_key=True, comment='用户id')
    nickname = Column(String(255), comment='用户昵称')
    username = Column(String(255), unique=True, comment='用户名')
    password = Column(String(255), comment='密码')
    dept_id = Column(String(255), comment='部门id')
    status = Column(String(255), comment='状态')
    remark = Column(String(255), comment='备注')
    creator = Column(String(255), comment='创建人')
    create_time = Column(DateTime, default=datetime.now, comment='创建时间')
    update_time = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment='更新时间')

    def to_dict(self):
        """转换为字典"""
        return {
            'id': str(self.user_id),
            'nickname': self.nickname,
            'username': self.username,
            'deptId': self.dept_id,
            'status': self.status,
            'remark': self.remark,
            'creator': self.creator,
            'createTime': self.create_time.strftime('%Y-%m-%d %H:%M:%S') if self.create_time else None,
            'updateTime': self.update_time.strftime('%Y-%m-%d %H:%M:%S') if self.update_time else None
        }
