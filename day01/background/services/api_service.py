
"""
API接口服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.api import API
from services.base_service import BaseService
import time

class APIService(BaseService[API]):
    """API服务类"""

    def __init__(self):
        super().__init__(API)

    def create_api(self, db: Session, api_data: Dict[str, Any]) -> API:
        """创建新API"""
        # 生成API ID
        if 'api_id' not in api_data:
            api_data['api_id'] = int(time.time() * 1000)

        return self.create(db, api_data)

    def update_api(self, db: Session, api_id: int, api_data: Dict[str, Any]) -> Optional[API]:
        """更新API信息"""
        api = self.get(db, api_id)
        if not api:
            return None

        return self.update(db, api, api_data)

    def get_apis_by_method(self, db: Session, method: str, skip: int = 0, limit: int = 100) -> List[API]:
        """根据方法类型获取API列表"""
        return self.get_multi(db, skip=skip, limit=limit, method_type=method)

    def get_apis_by_token(self, db: Session, token_id: str, skip: int = 0, limit: int = 100) -> List[API]:
        """根据Token ID获取API列表"""
        return self.get_multi(db, skip=skip, limit=limit, token_id=token_id)

    def search_apis(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[API]:
        """搜索API"""
        query = db.query(API).filter(
            API.api_name.like(f'%{keyword}%') | 
            API.method_url.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def copy_api(self, db: Session, api_id: int, new_name: str) -> Optional[API]:
        """复制API"""
        api = self.get(db, api_id)
        if not api:
            return None

        # 创建副本
        copy_data = {
            'api_name': new_name,
            'method_type': api.method_type,
            'method_url': api.method_url,
            'token_id': api.token_id,
            'request_header': api.request_header,
            'description': api.description,
            'remark': api.remark,
            'creator': api.creator
        }

        return self.create_api(db, copy_data)

# 创建全局API服务实例
api_service = APIService()
