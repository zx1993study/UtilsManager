import asyncio
import os
import time
from collections import deque
from typing import Any

from core.config import settings
from core.logger import get_log_file_path


def _iter_log_files() -> list[str]:
    os.makedirs(settings.LOG_DIR, exist_ok=True)
    files: list[str] = []
    for name in os.listdir(settings.LOG_DIR):
        path = os.path.join(settings.LOG_DIR, name)
        if os.path.isfile(path) and name.startswith(settings.LOG_FILE_NAME):
            files.append(path)
    return files


def _read_tail_lines(path: str, line_count: int) -> list[str]:
    if line_count <= 0 or not os.path.exists(path):
        return []

    lines: deque[str] = deque(maxlen=line_count)
    with open(path, "r", encoding="utf-8", errors="ignore") as log_file:
        for line in log_file:
            lines.append(line.rstrip("\r\n"))
    return list(lines)


async def get_latest_logs(line_count: int = 300) -> dict[str, Any]:
    log_path = get_log_file_path()
    lines = _read_tail_lines(log_path, line_count)
    stat = os.stat(log_path) if os.path.exists(log_path) else None
    return {
        "lines": lines,
        "lineCount": len(lines),
        "requestedLines": line_count,
        "logFile": log_path,
        "fileSize": stat.st_size if stat else 0,
        "updatedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
    }


async def clear_runtime_logs() -> dict[str, Any]:
    log_path = get_log_file_path()
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, "w", encoding="utf-8"):
        pass
    return {"logFile": log_path, "cleared": True}


async def cleanup_old_logs(retention_days: int | None = None) -> dict[str, Any]:
    days = settings.LOG_RETENTION_DAYS if retention_days is None else retention_days
    cutoff = time.time() - max(days, 0) * 24 * 60 * 60
    deleted: list[str] = []
    current_log = get_log_file_path()

    for path in _iter_log_files():
        try:
            if os.path.abspath(path) == current_log:
                continue
            if os.path.getmtime(path) < cutoff:
                os.remove(path)
                deleted.append(path)
        except OSError:
            continue

    return {"retentionDays": days, "deleted": deleted, "deletedCount": len(deleted)}


async def periodic_log_cleanup() -> None:
    while True:
        await cleanup_old_logs()
        await asyncio.sleep(max(settings.LOG_CLEAN_INTERVAL_SECONDS, 60))
