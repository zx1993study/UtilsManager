
"""
数据库模型初始化
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import Config

# 创建数据库引擎
engine = create_engine(
    Config.get_db_uri(),
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()

# 导入所有模型
from .project import Project
from .dictionary import Dictionary
from .api import API
from .api_template import ApiTemplate
from .param_instance import ParamInstance
from .page import Page
from .element_template import ElementTemplate
from .page_instance import PageInstance
from .flow import Flow
from .flow_step import FlowStep
from .api_result import ApiResult
from .page_result import PageResult
from .flow_result import FlowResult
from .user import User
from .token import Token

# 创建所有表
def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
