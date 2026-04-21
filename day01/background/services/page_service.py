
"""
页面服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.page import Page
from services.base_service import BaseService
import time
from datetime import datetime

class PageService(BaseService[Page]):
    """页面服务类"""

    def __init__(self):
        super().__init__(Page)

    def create_page(self, db: Session, page_data: Dict[str, Any]) -> Page:
        """创建新页面"""
        # 生成页面ID
        if 'page_id' not in page_data:
            page_data['page_id'] = int(time.time() * 1000)

        return self.create(db, page_data)

    def update_page(self, db: Session, page_id: int, page_data: Dict[str, Any]) -> Optional[Page]:
        """更新页面信息"""
        page = self.get(db, page_id)
        if not page:
            return None

        return self.update(db, page, page_data)

    def get_pages_by_token(self, db: Session, token_id: str, skip: int = 0, limit: int = 100) -> List[Page]:
        """根据Token ID获取页面列表"""
        return self.get_multi(db, skip=skip, limit=limit, token_id=token_id)

    def search_pages(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Page]:
        """搜索页面"""
        query = db.query(Page).filter(
            Page.page_name.like(f'%{keyword}%') |
            Page.function.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

    def copy_page(self, db: Session, page_id: int, new_name: str) -> Optional[Page]:
        """复制页面"""
        page = self.get(db, page_id)
        if not page:
            return None

        # 创建副本
        copy_data = {
            'page_name': new_name,
            'description': page.description,
            'url': page.url,
            'token_id': page.token_id,
            'function': page.function,
            'remark': page.remark,
            'creator': page.creator
        }

        return self.create_page(db, copy_data)

# 创建全局页面服务实例
page_service = PageService()
