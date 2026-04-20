
"""
服务层基类
"""
from typing import Generic, TypeVar, List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Base

ModelType = TypeVar('ModelType', bound=Base)

class BaseService(Generic[ModelType]):
    """服务层基类"""

    def __init__(self, model: type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        """根据ID获取单个对象"""
        return db.query(self.model).filter(self.model.__table__.columns[0] == id).first()

    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> List[ModelType]:
        """获取多个对象"""
        query = db.query(self.model)

        # 应用过滤条件
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.filter(getattr(self.model, key) == value)

        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: Dict[str, Any]) -> ModelType:
        """创建新对象"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, 
        db: Session, 
        db_obj: ModelType, 
        obj_in: Dict[str, Any]
    ) -> ModelType:
        """更新对象"""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> bool:
        """删除对象"""
        obj = db.query(self.model).filter(self.model.__table__.columns[0] == id).first()
        if obj:
            db.delete(obj)
            db.commit()
            return True
        return False

    def count(self, db: Session, **filters) -> int:
        """统计数量"""
        query = db.query(self.model)

        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                query = query.filter(getattr(self.model, key) == value)

        return query.count()
