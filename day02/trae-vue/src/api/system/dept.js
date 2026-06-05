import request from '@/utils/request'

/**
 * 部门管理API
 */

// 获取部门列表
export function getDeptList(params) {
  return request({
    url: '/system/dept/list',
    method: 'get',
    params
  })
}

// 获取部门树形结构
export function getDeptTree() {
  return request({
    url: '/system/dept/tree',
    method: 'get'
  })
}

// 获取部门详情
export function getDeptDetail(id) {
  return request({
    url: `/system/dept/${id}`,
    method: 'get'
  })
}

// 新增部门
export function addDept(data) {
  return request({
    url: '/system/dept',
    method: 'post',
    data
  })
}

// 更新部门
export function updateDept(data) {
  return request({
    url: '/system/dept',
    method: 'put',
    data
  })
}

// 删除部门
export function deleteDept(id) {
  return request({
    url: `/system/dept/${id}`,
    method: 'delete'
  })
}
