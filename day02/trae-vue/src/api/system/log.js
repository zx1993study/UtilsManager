import request from '@/utils/request'

const baseUrl = '/api/v1/system/logs'

export function getRuntimeLogs(params) {
  return request({
    url: baseUrl,
    method: 'get',
    params
  })
}

export function clearLogs() {
  return request({
    url: baseUrl,
    method: 'delete'
  })
}

export function cleanupLogs(params) {
  return request({
    url: `${baseUrl}/cleanup`,
    method: 'post',
    params
  })
}

export const getOperationLogList = getRuntimeLogs
export const getLoginLogList = getRuntimeLogs
export const getLogDetail = getRuntimeLogs

export function deleteLog() {
  return clearLogs()
}

export function batchDeleteLog() {
  return clearLogs()
}
