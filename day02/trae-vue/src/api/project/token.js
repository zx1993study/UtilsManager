import request from '@/utils/request'

/**
 * Token管理API
 */

// 获取Token列表
export function getTokenList(params) {
  return request({
    url: '/api/v1/tokenInfo',
    method: 'get',
    params
  })
}

// 获取Token详情
export function getTokenDetail(id) {
  return request({
    url: `/api/v1/tokenInfo/${id}`,
    method: 'get'
  })
}

// 新增Token（手动创建）
export function addToken(data) {
  return request({
    url: '/api/v1/tokenInfo',
    method: 'post',
    data
  })
}

// 更新Token
export function updateToken(data) {
  return request({
    url: '/api/v1/tokenInfo',
    method: 'put',
    data
  })
}

// 删除Token
export function deleteToken(id) {
  return request({
    url: `/api/v1/tokenInfo/${id}`,
    method: 'delete'
  })
}

// 批量删除Token
export function batchDeleteToken(ids) {
  return request({
    url: '/api/v1/tokenInfo/batch',
    method: 'delete',
    data: { ids }
  })
}

// 使Token失效
export function invalidateToken(id) {
  return request({
    url: `/api/v1/tokenInfo/${id}/invalidate`,
    method: 'put'
  })
}

// 清空所有Token
export function clearTokens() {
  return request({
    url: '/api/v1/tokenInfo/clear',
    method: 'delete'
  })
}

// 刷新Token
export function refreshToken(id) {
  return request({
    url: `/api/v1/tokenInfo/refresh/${id}`,
    method: 'post'
  })
}

// 批量刷新Token
export function batchRefreshToken(ids) {
  return request({
    url: '/api/v1/tokenInfo/refresh/batch',
    method: 'post',
    data: { ids }
  })
}
