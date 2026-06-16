"""Small runtime schema fixes for existing deployments.

SQLAlchemy create_all creates missing tables but does not add new columns to
tables that already exist. These helpers keep older databases aligned with the
current models without requiring a separate migration tool.
"""
from sqlalchemy import inspect, text

from core.db import engine


def _add_missing_columns(table_name: str, columns: dict[str, str]) -> None:
    inspector = inspect(engine)
    existing = {column["name"] for column in inspector.get_columns(table_name)}
    with engine.begin() as conn:
        for column_name, ddl in columns.items():
            if column_name not in existing:
                conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {ddl}"))


def _ensure_dict_info(dict_name: str, dict_key: str, dict_value: str, type_value: int) -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                INSERT INTO dict_info
                    (dict_name, dict_key, dict_value, type, status, creator, create_time, update_time)
                SELECT
                    :dict_name, :dict_key, :dict_value, :type_value, 1, 'admin', NOW(), NOW()
                WHERE NOT EXISTS (
                    SELECT 1 FROM dict_info WHERE dict_key = :dict_key
                )
                """
            ),
            {
                "dict_name": dict_name,
                "dict_key": dict_key,
                "dict_value": dict_value,
                "type_value": type_value,
            },
        )


def ensure_runtime_schema() -> None:
    _add_missing_columns(
        "dict_info",
        {
            "creator": "creator VARCHAR(50) NULL COMMENT 'creator'",
            "create_time": "create_time DATETIME NULL COMMENT 'create time'",
            "update_time": "update_time DATETIME NULL COMMENT 'update time'",
        },
    )
    _ensure_dict_info("Playwright配置", "playwright_retry_count", "0", 9)
    _ensure_dict_info("Playwright配置", "playwright_browser_timeout", "0", 9)
