
// 统一的API服务层
const API_BASE_URL = '/api';

export const api = {
  // 获取认证token
  getToken: () => localStorage.getItem('auth_token') || '',

  // 通用GET请求
  get: async (url: string, params?: Record<string, string | number>) => {
    const token = localStorage.getItem('auth_token');
    let queryString = '';
    if (params) {
      queryString = '?' + new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
    }

    const response = await fetch(`${API_BASE_URL}${url}${queryString}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    return response.json();
  },

  // 通用POST请求
  post: async (url: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API请求失败: ${response.status}`);
    }

    return response.json();
  },

  // 通用PUT请求
  put: async (url: string, data: any) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API请求失败: ${response.status}`);
    }

    return response.json();
  },

  // 通用DELETE请求
  delete: async (url: string) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API请求失败: ${response.status}`);
    }

    return response.json();
  }
};

// 认证相关API
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),

  logout: () => 
    api.post('/auth/logout', {}),

  getCurrentUser: () => 
    api.get('/auth/me'),

  changePassword: (oldPassword: string, newPassword: string) => 
    api.post('/auth/change-password', { oldPassword, newPassword })
};

// 用户相关API
export const userApi = {
  getUsers: (params?: { skip?: number; limit?: number; status?: string }) => 
    api.get('/users', params),

  getUser: (userId: number) => 
    api.get(`/users/${userId}`),

  createUser: (userData: any) => 
    api.post('/users', userData),

  updateUser: (userId: number, userData: any) => 
    api.put(`/users/${userId}`, userData),

  deleteUser: (userId: number) => 
    api.delete(`/users/${userId}`),

  toggleUserStatus: (userId: number) => 
    api.post(`/users/${userId}/toggle-status`, {})
};

// 项目相关API
export const projectApi = {
  getProjects: (params?: { skip?: number; limit?: number; status?: string; env?: string; keyword?: string }) => 
    api.get('/projects', params),

  getProject: (projectId: number) => 
    api.get(`/projects/${projectId}`),

  createProject: (projectData: any) => 
    api.post('/projects', projectData),

  updateProject: (projectId: number, projectData: any) => 
    api.put(`/projects/${projectId}`, projectData),

  deleteProject: (projectId: number) => 
    api.delete(`/projects/${projectId}`),

  toggleProjectStatus: (projectId: number) => 
    api.post(`/projects/${projectId}/toggle-status`, {})
};

// 接口相关API
export const interfaceApi = {
  getInterfaces: (params?: { skip?: number; limit?: number; method?: string; tokenId?: string; keyword?: string }) => 
    api.get('/interfaces', params),

  getInterface: (interfaceId: number) => 
    api.get(`/interfaces/${interfaceId}`),

  createInterface: (interfaceData: any) => 
    api.post('/interfaces', interfaceData),

  updateInterface: (interfaceId: number, interfaceData: any) => 
    api.put(`/interfaces/${interfaceId}`, interfaceData),

  deleteInterface: (interfaceId: number) => 
    api.delete(`/interfaces/${interfaceId}`),

  copyInterface: (interfaceId: number, name: string) => 
    api.post(`/interfaces/${interfaceId}/copy`, { name }),

  batchRunInterfaces: (apiIds: number[]) => 
    api.post('/interfaces/batch-run', { apiIds })
};

// 字典相关API
export const dictionaryApi = {
  getDictionaries: (params?: { skip?: number; limit?: number; type?: string; keyword?: string }) => 
    api.get('/dictionaries', params),

  getDictionary: (dictionaryId: number) => 
    api.get(`/dictionaries/${dictionaryId}`),

  createDictionary: (dictionaryData: any) => 
    api.post('/dictionaries', dictionaryData),

  updateDictionary: (dictionaryId: number, dictionaryData: any) => 
    api.put(`/dictionaries/${dictionaryId}`, dictionaryData),

  deleteDictionary: (dictionaryId: number) => 
    api.delete(`/dictionaries/${dictionaryId}`)
};

// Token相关API
export const tokenApi = {
  getTokens: (params?: { skip?: number; limit?: number; status?: string; keyword?: string }) => 
    api.get('/tokens', params),

  getToken: (tokenId: number) => 
    api.get(`/tokens/${tokenId}`),

  createToken: (tokenData: any) => 
    api.post('/tokens', tokenData),

  updateToken: (tokenId: number, tokenData: any) => 
    api.put(`/tokens/${tokenId}`, tokenData),

  deleteToken: (tokenId: number) => 
    api.delete(`/tokens/${tokenId}`),

  toggleTokenStatus: (tokenId: number) => 
    api.post(`/tokens/${tokenId}/toggle-status`, {})
};

// 流程相关API
export const flowApi = {
  getFlows: (params?: { skip?: number; limit?: number; status?: string; keyword?: string }) => 
    api.get('/flows', params),

  getFlow: (flowId: number) => 
    api.get(`/flows/${flowId}`),

  createFlow: (flowData: any) => 
    api.post('/flows', flowData),

  updateFlow: (flowId: number, flowData: any) => 
    api.put(`/flows/${flowId}`, flowData),

  deleteFlow: (flowId: number) => 
    api.delete(`/flows/${flowId}`),

  toggleFlowStatus: (flowId: number) => 
    api.post(`/flows/${flowId}/toggle-status`, {}),

  runFlow: (flowId: number) => 
    api.post(`/flows/${flowId}/run`, {})
};

// 报告相关API
export const reportApi = {
  getReports: (params?: { skip?: number; limit?: number; status?: string; keyword?: string }) => 
    api.get('/reports', params),

  getReport: (reportId: number) => 
    api.get(`/reports/${reportId}`),

  deleteReport: (reportId: number) => 
    api.delete(`/reports/${reportId}`),

  exportReport: (reportId: number) => 
    api.get(`/reports/${reportId}/export`)
};
