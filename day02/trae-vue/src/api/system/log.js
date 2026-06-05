import request from '@/utils/request'

/**
 * 日志管理API
 */

// 获取操作日志列表
export function getOperationLogList(params) {
  return request({
    url: '/system/log/operation/list',
    method: 'get',
    params
  })
}

// 获取登录日志列表
export function getLoginLogList(params) {
  return request({
    url: '/system/log/login/list',
    method: 'get',
    params
  })
}

// 获取日志详情
export function getLogDetail(id) {
  return request({
    url: `/system/log/${id}`,
    method: 'get'
  })
}

// 删除日志
export function deleteLog(id) {
  return request({
    url: `/system/log/${id}`,
    method: 'delete'
  })
}

// 批量删除日志
export function batchDeleteLog(ids) {
  return request({
    url: '/system/log/batch',
    method: 'delete',
    data: { ids }
  })
}

// 清空日志
export function clearLogs() {
  return request({
    url: '/system/log/clear',
    method: 'delete'
  })
}
