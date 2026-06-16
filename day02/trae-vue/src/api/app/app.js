import request from '@/utils/request'

export function getAppList(params) {
  return request({ url: '/api/v1/appInfo', method: 'get', params })
}

export function addApp(data) {
  return request({ url: '/api/v1/appInfo', method: 'post', data })
}

export function updateApp(data) {
  return request({ url: '/api/v1/appInfo', method: 'put', data })
}

export function deleteApp(id) {
  return request({ url: `/api/v1/appInfo/${id}`, method: 'delete' })
}

export function batchDeleteApp(ids) {
  return request({ url: '/api/v1/appInfo/batch', method: 'delete', data: { ids } })
}

export function getAppTemplateList(params) {
  return request({ url: '/api/v1/appTemplate', method: 'get', params })
}

export function addAppTemplate(data) {
  return request({ url: '/api/v1/appTemplate', method: 'post', data })
}

export function updateAppTemplate(data) {
  return request({ url: '/api/v1/appTemplate', method: 'put', data })
}

export function deleteAppTemplate(id) {
  return request({ url: `/api/v1/appTemplate/${id}`, method: 'delete' })
}

export function batchDeleteAppTemplate(ids) {
  return request({ url: '/api/v1/appTemplate/batch', method: 'delete', data: { ids } })
}

export function getAppCaseList(params) {
  return request({ url: '/api/v1/appInstance', method: 'get', params })
}

export function addAppCase(data) {
  return request({ url: '/api/v1/appInstance', method: 'post', data })
}

export function updateAppCase(data) {
  return request({ url: '/api/v1/appInstance', method: 'put', data })
}

export function deleteAppCase(id) {
  return request({ url: `/api/v1/appInstance/${id}`, method: 'delete' })
}

export function batchDeleteAppCase(ids) {
  return request({ url: '/api/v1/appInstance/batch', method: 'delete', data: { ids } })
}

export function executeAppCase(appId, instanceIds) {
  return request({ url: '/api/v1/app/execute', method: 'post', data: { appId, instanceIds } })
}

export function getAppResultList(params) {
  return request({ url: '/api/v1/appResult', method: 'get', params })
}

export function deleteAppResult(id) {
  return request({ url: `/api/v1/appResult/${id}`, method: 'delete' })
}

export function batchDeleteAppResult(ids) {
  return request({ url: '/api/v1/appResult/batch', method: 'delete', data: { ids } })
}
