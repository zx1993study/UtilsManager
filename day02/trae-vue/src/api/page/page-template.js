import request from '@/utils/request'

const baseUrl = '/api/v1/elementTemplate'

export function getPageTemplateList(params) {
  return request({
    url: `${baseUrl}/`,
    method: 'get',
    params
  })
}

export function getPageTemplateByPage(pageId) {
  return request({
    url: `${baseUrl}/page/${pageId}`,
    method: 'get'
  })
}

export function getPageTemplateDetail(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'get'
  })
}

export function addPageTemplate(data) {
  return request({
    url: `${baseUrl}/`,
    method: 'post',
    data
  })
}

export function updatePageTemplate(data) {
  return request({
    url: `${baseUrl}/${data.elementId}`,
    method: 'put',
    data
  })
}

export function deletePageTemplate(id) {
  return request({
    url: `${baseUrl}/${id}`,
    method: 'delete'
  })
}

export function batchDeletePageTemplate(ids) {
  return request({
    url: `${baseUrl}/batch`,
    method: 'delete',
    data: { ids }
  })
}
