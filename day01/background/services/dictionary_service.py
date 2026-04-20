
"""
字典服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.dictionary import Dictionary
from services.base_service import BaseService
import time

class DictionaryService(BaseService[Dictionary]):
    """字典服务类"""

    def __init__(self):
        super().__init__(Dictionary)

    def create_dictionary(self, db: Session, dict_data: Dict[str, Any]) -> Dictionary:
        """创建新字典"""
        # 生成字典ID
        if 'dict_id' not in dict_data:
            dict_data['dict_id'] = int(time.time() * 1000)

        # 设置默认状态
        if 'status' not in dict_data:
            dict_data['status'] = 'active'

        return self.create(db, dict_data)

    def update_dictionary(self, db: Session, dict_id: int, dict_data: Dict[str, Any]) -> Optional[Dictionary]:
        """更新字典信息"""
        dictionary = self.get(db, dict_id)
        if not dictionary:
            return None

        return self.update(db, dictionary, dict_data)

    def get_dictionaries_by_type(self, db: Session, dict_type: str, skip: int = 0, limit: int = 100) -> List[Dictionary]:
        """根据类型获取字典列表"""
        return self.get_multi(db, skip=skip, limit=limit, type=dict_type)

    def get_dictionaries_by_name(self, db: Session, dict_name: str, skip: int = 0, limit: int = 100) -> List[Dictionary]:
        """根据名称获取字典列表"""
        return self.get_multi(db, skip=skip, limit=limit, dict_name=dict_name)

    def get_active_dictionaries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dictionary]:
        """获取活跃的字典列表"""
        return self.get_multi(db, skip=skip, limit=limit, status='active')

    def toggle_status(self, db: Session, dict_id: int) -> Optional[Dictionary]:
        """切换字典状态"""
        dictionary = self.get(db, dict_id)
        if not dictionary:
            return None

        dictionary.status = 'active' if dictionary.status == 'inactive' else 'inactive'
        db.commit()
        db.refresh(dictionary)
        return dictionary

    def search_dictionaries(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Dictionary]:
        """搜索字典"""
        query = db.query(Dictionary).filter(
            Dictionary.dict_name.like(f'%{keyword}%') |
            Dictionary.key_value.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

# 创建全局字典服务实例
dictionary_service = DictionaryService()
