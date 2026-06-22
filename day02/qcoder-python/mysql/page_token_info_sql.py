"""CRUD helpers for page token associations."""
from typing import Iterable, List

from sqlalchemy.orm import Session

from models.page_token_info_model import PageTokenInfo
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


async def get_page_token_ids(db: Session, page_id: int) -> List[int]:
    rows = db.query(PageTokenInfo.token_id).filter(
        PageTokenInfo.page_id == page_id
    ).order_by(PageTokenInfo.id.asc()).all()
    return [row.token_id for row in rows]


async def get_page_tokens(db: Session, page_id: int) -> List[TokenInfo]:
    return db.query(TokenInfo).join(
        PageTokenInfo, PageTokenInfo.token_id == TokenInfo.token_id
    ).filter(
        PageTokenInfo.page_id == page_id
    ).order_by(PageTokenInfo.id.asc()).all()


async def set_page_token_infos(db: Session, page_id: int, token_ids: Iterable[int] | None) -> None:
    db.query(PageTokenInfo).filter(PageTokenInfo.page_id == page_id).delete(synchronize_session=False)
    for token_id in _normalize_token_ids(token_ids):
        data = set_audit_fields_for_create({"page_id": page_id, "token_id": token_id})
        db.add(PageTokenInfo(**data))
    db.commit()


async def delete_page_token_infos_by_page_id(db: Session, page_id: int) -> None:
    db.query(PageTokenInfo).filter(PageTokenInfo.page_id == page_id).delete(synchronize_session=False)
    db.commit()


async def delete_page_token_infos_by_page_ids(db: Session, page_ids: list[int]) -> None:
    if not page_ids:
        return
    db.query(PageTokenInfo).filter(PageTokenInfo.page_id.in_(page_ids)).delete(synchronize_session=False)
    db.commit()
