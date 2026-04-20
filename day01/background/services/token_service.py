
"""
Token服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from models.token import Token
from services.base_service import BaseService
import time

class TokenService(BaseService[Token]):
    """Token服务类"""

    def __init__(self):
        super().__init__(Token)

    def create_token(self, db: Session, token_data: Dict[str, Any]) -> Token:
        """创建新Token"""
        # 生成Token ID
        if 'token_id' not in token_data:
            token_data['token_id'] = int(time.time() * 1000)

        # 设置默认状态
        if 'status' not in token_data:
            token_data['status'] = 'active'

        return self.create(db, token_data)

    def update_token(self, db: Session, token_id: int, token_data: Dict[str, Any]) -> Optional[Token]:
        """更新Token信息"""
        token = self.get(db, token_id)
        if not token:
            return None

        return self.update(db, token, token_data)

    def get_tokens_by_type(self, db: Session, token_type: str, skip: int = 0, limit: int = 100) -> List[Token]:
        """根据类型获取Token列表"""
        return self.get_multi(db, skip=skip, limit=limit, type=token_type)

    def get_active_tokens(self, db: Session, skip: int = 0, limit: int = 100) -> List[Token]:
        """获取活跃的Token列表"""
        return self.get_multi(db, skip=skip, limit=limit, status='active')

    def toggle_status(self, db: Session, token_id: int) -> Optional[Token]:
        """切换Token状态"""
        token = self.get(db, token_id)
        if not token:
            return None

        token.status = 'active' if token.status == 'inactive' else 'inactive'
        db.commit()
        db.refresh(token)
        return token

    def search_tokens(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Token]:
        """搜索Token"""
        query = db.query(Token).filter(
            Token.name.like(f'%{keyword}%')
        )
        return query.offset(skip).limit(limit).all()

# 创建全局Token服务实例
token_service = TokenService()
