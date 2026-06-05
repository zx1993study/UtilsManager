"""
自定义异常类
"""
from fastapi import HTTPException


class BusinessException(HTTPException):
    """业务异常"""
    
    def __init__(
        self,
        msg: str = "业务处理失败",
        error_code: str = "BUSINESS_ERROR",
        data: any = None
    ):
        super().__init__(
            status_code=400,
            detail={
                "msg": msg,
                "success": False,
                "data": data,
                "error": {
                    "errorCode": error_code,
                    "message": msg
                }
            }
        )


class NotFoundException(BusinessException):
    """资源未找到异常"""
    
    def __init__(self, msg: str = "资源不存在"):
        super().__init__(
            msg=msg,
            error_code="NOT_FOUND"
        )


class DuplicateException(BusinessException):
    """重复数据异常"""
    
    def __init__(self, msg: str = "数据已存在"):
        super().__init__(
            msg=msg,
            error_code="DUPLICATE_DATA"
        )
