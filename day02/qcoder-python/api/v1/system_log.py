from fastapi import APIRouter, Query

from core.responsemsg import success_response
from service.system_log_service import clear_runtime_logs, cleanup_old_logs, get_latest_logs

router = APIRouter()


@router.get("/system/logs", response_model=dict)
async def latest_runtime_logs(
    lines: int = Query(default=300, ge=1, le=2000, description="只返回最新N行日志"),
):
    data = await get_latest_logs(lines)
    return success_response(msg="查询成功", data=data)


@router.delete("/system/logs", response_model=dict)
async def clear_logs():
    data = await clear_runtime_logs()
    return success_response(msg="清空成功", data=data)


@router.post("/system/logs/cleanup", response_model=dict)
async def cleanup_logs(
    retention_days: int | None = Query(default=None, ge=0, le=365, description="日志保留天数"),
):
    data = await cleanup_old_logs(retention_days)
    return success_response(msg="清理完成", data=data)
