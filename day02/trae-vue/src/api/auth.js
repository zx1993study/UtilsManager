import request from '@/utils/request'

/**
 * 认证API
 */

// 用户登录
export function login(data) {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

// 用户登出
export function logout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'post'
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/v1/auth/info',
    method: 'get'
  })
}

// 刷新Token
export function refreshToken() {
  return request({
    url: '/api/v1/auth/refresh',
    method: 'post'
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/v1/auth/change-password',
    method: 'put',
    data
  })
}
