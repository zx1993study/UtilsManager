
// 页面管理相关API
import { api } from './api';

export const pageApi = {
  getPages: (params?: { skip?: number; limit?: number; tokenId?: string; keyword?: string }) =>
    api.get('/pages', params),

  getPage: (pageId: number) =>
    api.get(`/pages/${pageId}`),

  createPage: (pageData: any) =>
    api.post('/pages', pageData),

  updatePage: (pageId: number, pageData: any) =>
    api.put(`/pages/${pageId}`, pageData),

  deletePage: (pageId: number) =>
    api.delete(`/pages/${pageId}`),

  copyPage: (pageId: number, name: string) =>
    api.post(`/pages/${pageId}/copy`, { name }),

  batchRunPages: (pageIds: number[]) =>
    api.post('/pages/batch-run', { pageIds })
};

export const elementTemplateApi = {
  getElementTemplates: (params?: { skip?: number; limit?: number; pageId?: string; keyword?: string }) =>
    api.get('/element-templates', params),

  getElementTemplate: (templateId: number) =>
    api.get(`/element-templates/${templateId}`),

  createElementTemplate: (templateData: any) =>
    api.post('/element-templates', templateData),

  updateElementTemplate: (templateId: number, templateData: any) =>
    api.put(`/element-templates/${templateId}`, templateData),

  deleteElementTemplate: (templateId: number) =>
    api.delete(`/element-templates/${templateId}`),

  generateInstance: (pageId: string) =>
    api.get('/element-templates/generate-instance', { pageId })
};

export const pageInstanceApi = {
  getPageInstances: (params?: { skip?: number; limit?: number; pageId?: string; keyword?: string }) =>
    api.get('/page-instances', params),

  getPageInstance: (instanceId: number) =>
    api.get(`/page-instances/${instanceId}`),

  createPageInstance: (instanceData: any) =>
    api.post('/page-instances', instanceData),

  updatePageInstance: (instanceId: number, instanceData: any) =>
    api.put(`/page-instances/${instanceId}`, instanceData),

  deletePageInstance: (instanceId: number) =>
    api.delete(`/page-instances/${instanceId}`),

  copyPageInstance: (instanceId: number, name: string) =>
    api.post(`/page-instances/${instanceId}/copy`, { name }),

  runPageInstance: (instanceId: number) =>
    api.post(`/page-instances/${instanceId}/run`, {}),

  batchRunPageInstances: (instanceIds: number[]) =>
    api.post('/page-instances/batch-run', { instanceIds })
};
