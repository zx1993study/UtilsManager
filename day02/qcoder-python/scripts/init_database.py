"""Initialize database schema and default data.

Run this script manually when preparing or upgrading the database:

    python scripts/init_database.py
"""
from datetime import datetime
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from core.db import Base, SessionLocal, engine
from core.jwt import get_password_hash
from core.logger import logger
from core.schema_migrations import ensure_runtime_schema
from models.api_token_info_model import ApiTokenInfo as _ApiTokenInfo
from models.page_token_info_model import PageTokenInfo as _PageTokenInfo
from models.sys_user_model import SysUser


def seed_default_users() -> None:
    db = SessionLocal()
    try:
        if db.query(SysUser).count() > 0:
            return
        now = datetime.now()
        db.add_all([
            SysUser(
                username="admin",
                password=get_password_hash("admin123"),
                nickname="管理员",
                status=1,
                creator="system",
                create_time=now,
                update_time=now,
            ),
            SysUser(
                username="test_user",
                password=get_password_hash("test123"),
                nickname="测试用户",
                status=1,
                creator="system",
                create_time=now,
                update_time=now,
            ),
        ])
        db.commit()
        logger.info("默认账号已初始化：admin / test_user")
    finally:
        db.close()


def main() -> None:
    logger.info("数据库初始化开始")
    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema()
    seed_default_users()
    logger.info("数据库初始化完成")


if __name__ == "__main__":
    main()
