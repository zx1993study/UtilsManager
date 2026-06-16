import request from '@/utils/request'

/**
 * 页面功能 API
 */
const inspectRequests = new Map()

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

// 解析页面元素
export function inspectPageElements(id, options = {}) {
  const requestKey = String(id)
  if (inspectRequests.has(requestKey)) {
    return inspectRequests.get(requestKey)
  }

  const requestId = options.requestId || `page-inspect-${id}-${Date.now()}`
  const promise = request({
    url: '/api/v1/page/inspect',
    method: 'post',
    timeout: 0,
    data: {
      pageId: id,
      replace: options.replace ?? true,
      headless: options.headless ?? true,
      pageUrl: options.pageUrl,
      requestId
    }
  }).finally(() => {
    inspectRequests.delete(requestKey)
  })

  inspectRequests.set(requestKey, promise)
  return promise
}


