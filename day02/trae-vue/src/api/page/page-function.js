import request from '@/utils/request'

/**
 * 页面功能API
 */

// 获取页面功能列表
export function getPageFunctionList(params) {
  return request({
    url: '/page/function/list',
    method: 'get',
    params
  })
}

// 获取页面功能详情
export function getPageFunctionDetail(id) {
  return request({
    url: `/page/function/${id}`,
    method: 'get'
  })
}

// 新增页面功能
export function addPageFunction(data) {
  return request({
    url: '/page/function',
    method: 'post',
    data
  })
}

// 更新页面功能
export function updatePageFunction(data) {
  return request({
    url: '/page/function',
    method: 'put',
    data
  })
}

// 删除页面功能
export function deletePageFunction(id) {
  return request({
    url: `/page/function/${id}`,
    method: 'delete'
  })
}

// 批量删除页面功能
export function batchDeletePageFunction(ids) {
  return request({
    url: '/page/function/batch',
    method: 'delete',
    data: { ids }
  })
}
