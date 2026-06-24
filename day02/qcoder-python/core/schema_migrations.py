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


def _modify_column_if_needed(table_name: str, column_name: str, ddl: str, expected_types: set[str]) -> None:
    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns(table_name)}
    column = columns.get(column_name)
    if not column:
        return
    current_type = str(column["type"]).lower()
    if any(expected_type.lower() in current_type for expected_type in expected_types):
        return
    with engine.begin() as conn:
        conn.execute(text(f"ALTER TABLE {table_name} MODIFY COLUMN {ddl}"))


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


def _ensure_api_token_info_table() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS api_token_info (
                    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'primary key',
                    api_id BIGINT NOT NULL COMMENT 'api id',
                    token_id BIGINT NOT NULL COMMENT 'token id',
                    create_time DATETIME NULL COMMENT 'create time',
                    update_time DATETIME NULL COMMENT 'update time',
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_api_token_info (api_id, token_id),
                    KEY idx_api_token_info_api_id (api_id),
                    KEY idx_api_token_info_token_id (token_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
        )


def _ensure_page_token_info_table() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS page_token_info (
                    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'primary key',
                    page_id BIGINT NOT NULL COMMENT 'page id',
                    token_id BIGINT NOT NULL COMMENT 'token id',
                    create_time DATETIME NULL COMMENT 'create time',
                    update_time DATETIME NULL COMMENT 'update time',
                    PRIMARY KEY (id),
                    UNIQUE KEY uk_page_token_info (page_id, token_id),
                    KEY idx_page_token_info_page_id (page_id),
                    KEY idx_page_token_info_token_id (token_id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
        )


def _ensure_exception_case_type_table() -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS exception_case_type (
                    exception_id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'primary key',
                    exception_name VARCHAR(100) NOT NULL COMMENT 'exception name',
                    exception_type INT NOT NULL COMMENT 'exception type',
                    operation_type VARCHAR(100) NOT NULL DEFAULT '1' COMMENT 'operation type',
                    exception_value TEXT NOT NULL COMMENT 'exception value',
                    creator VARCHAR(50) NULL COMMENT 'creator',
                    create_time DATETIME NULL COMMENT 'create time',
                    update_time DATETIME NULL COMMENT 'update time',
                    PRIMARY KEY (exception_id),
                    KEY idx_exception_case_type_type (exception_type),
                    KEY idx_exception_case_type_name (exception_name)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """
            )
        )


def ensure_runtime_schema() -> None:
    _ensure_api_token_info_table()
    _ensure_page_token_info_table()
    _ensure_exception_case_type_table()
    _add_missing_columns(
        "exception_case_type",
        {
            "operation_type": "operation_type VARCHAR(100) NOT NULL DEFAULT '1' COMMENT 'operation type'",
        },
    )
    _modify_column_if_needed(
        "exception_case_type",
        "operation_type",
        "operation_type VARCHAR(100) NOT NULL DEFAULT '1' COMMENT 'operation type'",
        {"varchar", "text"},
    )
    _add_missing_columns(
        "dict_info",
        {
            "creator": "creator VARCHAR(50) NULL COMMENT 'creator'",
            "create_time": "create_time DATETIME NULL COMMENT 'create time'",
            "update_time": "update_time DATETIME NULL COMMENT 'update time'",
        },
    )
    _ensure_dict_info("Playwright配置", "playwright_retry_count", "0", 9)
    _add_missing_columns(
        "api_instance",
        {
            "token_id": "token_id BIGINT NULL COMMENT 'tokenId'",
        },
    )
    _add_missing_columns(
        "api_template",
        {
            "default_value": "default_value TEXT NULL COMMENT 'default value'",
        },
    )
    _add_missing_columns(
        "element_template",
        {
            "default_value": "default_value TEXT NULL COMMENT 'default value'",
            "parent_element": "parent_element TEXT NULL COMMENT 'parent element'",
        },
    )
    _add_missing_columns(
        "page_instance",
        {
            "token_id": "token_id BIGINT NULL COMMENT 'tokenId'",
        },
    )
    _modify_column_if_needed(
        "page_instance",
        "operation_json",
        "operation_json LONGTEXT NULL COMMENT 'operation json'",
        {"longtext"},
    )
    _add_missing_columns(
        "flow_step",
        {
            "token_id": "token_id BIGINT NULL COMMENT 'tokenId'",
        },
    )
    _ensure_dict_info("Playwright配置", "playwright_browser_timeout", "0", 9)
