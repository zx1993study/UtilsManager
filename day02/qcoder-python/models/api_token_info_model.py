"""API token association model."""
from sqlalchemy import BigInteger, Column, DateTime, UniqueConstraint

from core.db import Base


class ApiTokenInfo(Base):
    """Association table for APIs and tokens."""

    __tablename__ = "api_token_info"
    __table_args__ = (
        UniqueConstraint("api_id", "token_id", name="uk_api_token_info"),
    )

    id = Column(BigInteger, primary_key=True, autoincrement=True, comment="primary key")
    api_id = Column(BigInteger, nullable=False, comment="api id")
    token_id = Column(BigInteger, nullable=False, comment="token id")
    create_time = Column(DateTime, comment="create time")
    update_time = Column(DateTime, comment="update time")

    def __repr__(self):
        return f"<ApiTokenInfo(id={self.id}, api_id={self.api_id}, token_id={self.token_id})>"
