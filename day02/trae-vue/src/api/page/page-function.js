import request from '@/utils/request'

/**
 * 页面功能API
 */

// 获取页面功能列表
export function getPageFunctionList(params) {
  return request({
    url: '/api/v1/pageInfo',
    method: 'get',
    params
  })
}

// 获取页面功能详情
export function getPageFunctionDetail(id) {
  return request({
    url: `/api/v1/pageInfo/${id}`,
    method: 'get'
  })
}

// 新增页面功能
export function addPageFunction(data) {
  return request({
    url: '/api/v1/pageInfo',
    method: 'post',
    data
  })
}

// 更新页面功能
export function updatePageFunction(data) {
  return request({
    url: '/api/v1/pageInfo',
    method: 'put',
    data
  })
}

// 删除页面功能
export function deletePageFunction(id) {
  return request({
    url: `/api/v1/pageInfo/${id}`,
    method: 'delete'
  })
}

// 批量删除页面功能
export function batchDeletePageFunction(ids) {
  return request({
    url: '/api/v1/pageInfo/batch',
    method: 'delete',
    data: { ids }
  })
}

//生成playwright脚本
export function generatePlaywrightScript(id) {
  return request({
    url: `/api/v1/page/bash/generate/${id}`,
    method: 'post'
  })
}

// 结束playwright脚本录制
export function stopGeneratePlaywrightScript(id) {
  return request({
    url: `/api/v1/page/bash/generate/${id}/stop`,
    method: 'post'
  })
}

// 获取页面执行脚本文件
export function getExecuteFile(filePath) {
  return request({
    url: '/api/v1/page/get_execute_file',
    method: 'get',
    params: { filePath }
  })
}

// 更新页面执行脚本文件
export function updateExecuteFile(filePath, content) {
  return request({
    url: '/api/v1/page/update_execute_file',
    method: 'put',
    data: { filePath, content }
  })
}

// 删除页面执行脚本文件
export function deleteExecuteFile(filePath) {
  return request({
    url: '/api/v1/page/delete_execute_file',
    method: 'delete',
    params: { filePath }
  })
}
