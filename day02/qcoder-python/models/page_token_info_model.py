"""Page token association model."""
from sqlalchemy import BigInteger, Column, DateTime, UniqueConstraint

from core.db import Base


class PageTokenInfo(Base):
    """Association table for pages and web tokens."""

    __tablename__ = "page_token_info"
    __table_args__ = (
        UniqueConstraint("page_id", "token_id", name="uk_page_token_info"),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    page_id = Column(BigInteger, nullable=False, comment="page id")
    token_id = Column(BigInteger, nullable=False, comment="token id")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<PageTokenInfo(id={self.id}, page_id={self.page_id}, token_id={self.token_id})>"
