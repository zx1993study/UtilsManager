import { ElMessage } from 'element-plus'

/**
 * 统一处理API响应消息
 * @param {Object} res - API响应对象
 * @param {string} defaultSuccessMsg - 默认成功消息
 * @param {string} defaultErrorMsg - 默认失败消息
 * @returns {boolean} - 是否成功
 */
export function handleApiResponse(res, defaultSuccessMsg = '操作成功', defaultErrorMsg = '操作失败') {
  if (res.success) {
    // 使用后端返回的msg，如果没有则使用默认消息
    const msg = res.msg || defaultSuccessMsg
    ElMessage.success(msg)
    return true
  } else {
    // 使用后端返回的msg，如果没有则使用默认消息
    const msg = res.msg || defaultErrorMsg
    ElMessage.error(msg)
    return false
  }
}

/**
 * 处理API响应并执行回调（仅在成功时）
 * @param {Object} res - API响应对象
 * @param {Function} onSuccess - 成功时的回调函数
 * @param {string} defaultSuccessMsg - 默认成功消息
 * @param {string} defaultErrorMsg - 默认失败消息
 */
export function handleApiResponseWithCallback(res, onSuccess, defaultSuccessMsg = '操作成功', defaultErrorMsg = '操作失败') {
  if (handleApiResponse(res, defaultSuccessMsg, defaultErrorMsg)) {
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(res)
    }
  }
}
