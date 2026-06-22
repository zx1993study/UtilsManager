import request from '@/utils/request'

const executingRequests = new Map()
const EXECUTE_TIMEOUT = 10 * 60 * 1000

function executeOnce(key, requestFactory) {
  if (executingRequests.has(key)) {
    return executingRequests.get(key)
  }
  const promise = requestFactory().finally(() => {
    executingRequests.delete(key)
  })
  executingRequests.set(key, promise)
  return promise
}

/**
 * 页面测试用例API
 */

// 获取页面测试用例列表
export function getPageTestCaseList(params) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'get',
    params
  })
}

// 获取页面测试用例详情
export function getPageTestCaseDetail(id) {
  return request({
    url: `/api/v1/pageInstance/${id}`,
    method: 'get'
  })
}

// 新增页面测试用例
export function addPageTestCase(data) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'post',
    data
  })
}

export const addPageTestcase = addPageTestCase

// 更新页面测试用例
export function updatePageTestCase(data) {
  return request({
    url: '/api/v1/pageInstance',
    method: 'put',
    data
  })
}

export const updatePageTestcase = updatePageTestCase

// 删除页面测试用例
export function deletePageTestCase(id) {
  return request({
    url: `/api/v1/pageInstance/${id}`,
    method: 'delete'
  })
}

export const deletePageTestcase = deletePageTestCase

// 批量删除页面测试用例
export function batchDeletePageTestCase(ids) {
  return request({
    url: '/api/v1/pageInstance/batch',
    method: 'delete',
    data: { ids }
  })
}

export const batchDeletePageTestcase = batchDeletePageTestCase

// 执行页面测试用例
export function executePageTestCase(pageId, id, tokenId = null) {
  const requestId = `page-run-${pageId}-${id}-${tokenId || 'default'}-${Date.now()}`
  const key = `page:${pageId}:instances:${id}:token:${tokenId || 'default'}`
  return executeOnce(key, () => request({
    url: '/api/v1/page/execute_by_template',
    method: 'post',
    data: { pageId, instanceIds: [id], tokenId, requestId },
    timeout: EXECUTE_TIMEOUT
  }))
}

// 批量执行页面测试用例
export function batchExecutePageTestCase(pageId, ids, tokenId = null) {
  const instanceIds = [...new Set((ids || []).filter(id => id !== null && id !== undefined))]
  const requestId = `page-run-${pageId}-${instanceIds.join('-')}-${tokenId || 'default'}-${Date.now()}`
  const key = `page:${pageId}:instances:${instanceIds.join(',')}:token:${tokenId || 'default'}`
  return executeOnce(key, () => request({
    url: '/api/v1/page/execute_by_template',
    method: 'post',
    data: { pageId, instanceIds, tokenId, requestId },
    timeout: EXECUTE_TIMEOUT
  }))
}
