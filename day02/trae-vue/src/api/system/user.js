import request from '@/utils/request'

/**
 * 用户管理API
 */

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/api/v1/sysUser',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(id) {
  return request({
    url: `/api/v1/sysUser/${id}`,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/api/v1/sysUser',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(data) {
  return request({
    url: '/api/v1/sysUser',
    method: 'put',
    data
  })
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/api/v1/sysUser/${id}`,
    method: 'delete'
  })
}

// 批量删除用户
export function batchDeleteUser(ids) {
  return request({
    url: '/api/v1/sysUser/batch',
    method: 'delete',
    data: { ids }
  })
}

// 重置密码
export function resetPassword(id, password) {
  return request({
    url: `/api/v1/sysUser/${id}/reset-password`,
    method: 'put',
    data: { password }
  })
}

// 修改状态
export function updateUserStatus(id, status) {
  return request({
    url: `/api/v1/sysUser/${id}/status`,
    method: 'put',
    data: { status }
  })
}