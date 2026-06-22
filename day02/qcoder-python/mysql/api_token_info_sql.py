"""CRUD helpers for API token associations."""
from typing import Iterable, List

from sqlalchemy.orm import Session

from models.api_token_info_model import ApiTokenInfo
from models.token_info_model import TokenInfo
from utils.data_paser import set_audit_fields_for_create


def _normalize_token_ids(token_ids: Iterable[int] | None) -> list[int]:
    if not token_ids:
        return []
    result = []
    seen = set()
    for token_id in token_ids:
        if token_id is None:
            continue
        token_id = int(token_id)
        if token_id in seen:
            continue
        seen.add(token_id)
        result.append(token_id)
    return result


async def get_api_token_ids(db: Session, api_id: int) -> List[int]:
    rows = db.query(ApiTokenInfo.token_id).filter(
        ApiTokenInfo.api_id == api_id
    ).order_by(ApiTokenInfo.id.asc()).all()
    return [row.token_id for row in rows]


async def get_api_tokens(db: Session, api_id: int) -> List[TokenInfo]:
    return db.query(TokenInfo).join(
        ApiTokenInfo, ApiTokenInfo.token_id == TokenInfo.token_id
    ).filter(
        ApiTokenInfo.api_id == api_id
    ).order_by(ApiTokenInfo.id.asc()).all()


async def set_api_token_infos(db: Session, api_id: int, token_ids: Iterable[int] | None) -> None:
    db.query(ApiTokenInfo).filter(ApiTokenInfo.api_id == api_id).delete(synchronize_session=False)
    for token_id in _normalize_token_ids(token_ids):
        data = set_audit_fields_for_create({"api_id": api_id, "token_id": token_id})
        db.add(ApiTokenInfo(**data))
    db.commit()


async def delete_api_token_infos_by_api_id(db: Session, api_id: int) -> None:
    db.query(ApiTokenInfo).filter(ApiTokenInfo.api_id == api_id).delete(synchronize_session=False)
    db.commit()
