import request from '@/utils/request'

/**
 * 接口管理API
 */

// 获取接口列表
export function getApiList(params) {
  return request({
    url: '/api/v1/apiInfo',
    method: 'get',
    params
  })
}

// 获取接口详情
export function getApiDetail(id) {
  return request({
    url: `/api/v1/apiInfo/${id}`,
    method: 'get'
  })
}

// 新增接口
export function addApi(data) {
  return request({
    url: '/api/v1/apiInfo',
    method: 'post',
    data
  })
}

// 更新接口
export function updateApi(data) {
  return request({
    url: '/api/v1/apiInfo',
    method: 'put',
    data
  })
}

// 删除接口
export function deleteApi(id) {
  return request({
    url: `/api/v1/apiInfo/${id}`,
    method: 'delete'
  })
}

// 批量删除接口
export function batchDeleteApi(ids) {
  return request({
    url: '/api/v1/apiInfo/batch',
    method: 'delete',
    data: { ids }
  })
}

// 导入接口
export function importApi(data) {
  return request({
    url: '/api/v1/apiInfo/import',
    method: 'post',
    data
  })
}

// 导出接口
export function exportApi(params) {
  return request({
    url: '/api/v1/apiInfo/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 执行接口测试
export function executeApiTest(id) {
  return request({
    url: '/api/v1/apiExecute/execute',
    method: 'post',
    data: { executionType: 3, targetId: id }
  })
}