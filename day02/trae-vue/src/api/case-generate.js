import request from '@/utils/request'

const baseUrl = '/api/v1/caseGenerate'

export function previewApiCases(data) {
  return request({
    url: `${baseUrl}/api/preview`,
    method: 'post',
    data
  })
}

export function saveApiCases(data) {
  return request({
    url: `${baseUrl}/api/save`,
    method: 'post',
    data
  })
}

export function previewPageCases(data) {
  return request({
    url: `${baseUrl}/page/preview`,
    method: 'post',
    data
  })
}

export function savePageCases(data) {
  return request({
    url: `${baseUrl}/page/save`,
    method: 'post',
    data
  })
}

