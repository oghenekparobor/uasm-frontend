import apiClient from './api-client';
import type { PaginatedResponse, PaginationMeta } from '@/types/api';

// Auth
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
  requestPasswordReset: (email: string) =>
    apiClient.post('/auth/request-password-reset', { email }),
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),
};

// Dashboard
export const dashboardApi = {
  getStats: (period?: string) =>
    apiClient.get('/dashboard/stats', { params: { period } }),
  getOverview: () => apiClient.get('/dashboard/overview'),
  getOfferingsAnalytics: (period?: string) =>
    apiClient.get('/dashboard/offerings/analytics', { params: { period } }),
  getDistributionAnalytics: (period?: string) =>
    apiClient.get('/dashboard/distribution/analytics', { params: { period } }),
  getAttendanceAnalytics: (period?: string) =>
    apiClient.get('/dashboard/attendance/analytics', { params: { period } }),
};

// Members
export const membersApi = {
  getAll: (params?: any) => apiClient.get('/members', { params }),
  getOne: (id: string) => apiClient.get(`/members/${id}`),
  create: (data: any) => apiClient.post('/members', data),
  update: (id: string, data: any) => apiClient.patch(`/members/${id}`, data),
  transfer: (id: string, data: any) =>
    apiClient.post(`/members/${id}/transfer`, data),
  getHistory: (id: string) => apiClient.get(`/members/${id}/history`),
  getUpcomingBirthdays: (upcomingDays: number = 7) =>
    apiClient.get('/members/birthdays/upcoming', { params: { upcomingDays } }),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post(`/members/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  removePhoto: (id: string) => apiClient.post(`/members/${id}/photo/remove`),
  uploadCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<{ created: number; errors: { row: number; message: string }[] }>(
      '/members/upload-csv',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

// Export
export const exportApi = {
  exportMembers: (format: 'csv' | 'xlsx' | 'pdf', params?: any) =>
    apiClient.get('/export/members', { params: { format, ...params }, responseType: 'blob' }),
  exportAttendance: (format: 'csv' | 'xlsx' | 'pdf', params?: any) =>
    apiClient.get('/export/attendance', { params: { format, ...params }, responseType: 'blob' }),
  exportDistribution: (format: 'csv' | 'xlsx' | 'pdf', params?: any) =>
    apiClient.get('/export/distribution', { params: { format, ...params }, responseType: 'blob' }),
  exportActivityLogs: (format: 'csv' | 'xlsx' | 'pdf', params?: any) =>
    apiClient.get('/export/activity-logs', { params: { format, ...params }, responseType: 'blob' }),
  exportEmpowermentRequests: (format: 'csv' | 'xlsx' | 'pdf', params?: any) =>
    apiClient.get('/export/empowerment-requests', { params: { format, ...params }, responseType: 'blob' }),
};

// Attendance
export const attendanceApi = {
  getWindows: () => apiClient.get('/attendance/windows'),
  getCurrentWindow: () => apiClient.get('/attendance/windows/current'),
  getWindow: (id: string) => apiClient.get(`/attendance/windows/${id}`),
  openWindow: (data: any) => apiClient.post('/attendance/windows', data),
  closeWindow: (id: string) =>
    apiClient.patch(`/attendance/windows/${id}/close`),
  getClassAttendance: (classId: string, params?: any) =>
    apiClient.get(`/attendance/classes/${classId}`, { params }),
  submitAttendance: (classId: string, data: any) =>
    apiClient.post(`/attendance/classes/${classId}`, data),
  getSummary: (windowId?: string) =>
    apiClient.get('/attendance/summary', {
      params: windowId ? { windowId } : {},
    }),
  getAll: (params?: any) => apiClient.get('/attendance', { params }),
  // Individual member attendance
  markMemberAttendance: (data: any) =>
    apiClient.post('/attendance/members', data),
  bulkMarkAttendance: (data: any) =>
    apiClient.post('/attendance/members/bulk', data),
  getClassMembersAttendance: (classId: string, windowId: string) =>
    apiClient.get(`/attendance/classes/${classId}/windows/${windowId}/members`),
  getMemberAttendanceHistory: (memberId: string, params?: any) =>
    apiClient.get(`/attendance/members/${memberId}/history`, { params }),
};

// Classes
export const classesApi = {
  getAll: (params?: any) => apiClient.get('/classes', { params }),
  getOne: (id: string) => apiClient.get(`/classes/${id}`),
  create: (data: any) => apiClient.post('/classes', data),
  update: (id: string, data: any) => apiClient.patch(`/classes/${id}`, data),
  delete: (id: string) => apiClient.delete(`/classes/${id}`),
  assignLeader: (id: string, data: any) =>
    apiClient.post(`/classes/${id}/leaders`, data),
  removeLeader: (id: string, userId: string, role: string) =>
    apiClient.delete(`/classes/${id}/leaders/${userId}/${role}`),
};

// Users
export const usersApi = {
  getAll: (params?: any) => apiClient.get('/users', { params }),
  getOne: (id: string) => apiClient.get(`/users/${id}`),
  getRoles: () => apiClient.get<{ id: number; name: string }[]>('/users/roles'),
  create: (data: any) => apiClient.post('/users', data),
  update: (id: string, data: any) => apiClient.patch(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  assignRole: (id: string, data: any) =>
    apiClient.post(`/users/${id}/roles`, data),
  removeRole: (id: string, roleId: string) =>
    apiClient.delete(`/users/${id}/roles/${roleId}`),
  getUserRoles: (id: string) => apiClient.get(`/users/${id}/roles`),
};

// Distribution
export const distributionApi = {
  getBatches: (params?: any) => apiClient.get('/distribution/batches', { params }),
  getCurrentBatch: () => apiClient.get('/distribution/batches/current'),
  getBatch: (id: string) => apiClient.get(`/distribution/batches/${id}`),
  confirmReceipt: (data: any) => apiClient.post('/distribution/batches', data),
  allocateFood: (batchId: string, classId: string, data: any) =>
    apiClient.post(`/distribution/batches/${batchId}/classes/${classId}`, data),
  getAllocations: (params?: any) =>
    apiClient.get('/distribution/allocations', { params }),
  updateAllocation: (id: string, data: any) =>
    apiClient.patch(`/distribution/allocations/${id}`, data),
  getOverview: (batchId?: string) =>
    apiClient.get('/distribution/overview', {
      params: batchId ? { batchId } : {},
    }),
  getClassesWithAttendance: (batchId: string) =>
    apiClient.get(`/distribution/batches/${batchId}/classes-with-attendance`),
};

// Kitchen
export const kitchenApi = {
  getRecipes: (params?: any) => apiClient.get('/kitchen/recipes', { params }),
  getRecipe: (id: string) => apiClient.get(`/kitchen/recipes/${id}`),
  createRecipe: (data: any) => apiClient.post('/kitchen/recipes', data),
  getProduction: (params?: any) =>
    apiClient.get('/kitchen/production', { params }),
  logProduction: (data: any) => apiClient.post('/kitchen/production', data),
};

// Empowerment
export const empowermentApi = {
  getAll: (params?: any) => apiClient.get('/empowerment', { params }),
  getOne: (id: string) => apiClient.get(`/empowerment/${id}`),
  create: (data: any) => apiClient.post('/empowerment', data),
  approve: (id: string) => apiClient.patch(`/empowerment/${id}/approve`),
  reject: (id: string, data?: any) =>
    apiClient.patch(`/empowerment/${id}/reject`, data),
};

// Events
export const eventsApi = {
  getAll: (params?: any) => apiClient.get('/events', { params }),
  getOne: (id: string) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post('/events', data),
  approve: (id: string) => apiClient.patch(`/events/${id}/approve`),
  recordAttendance: (id: string, data: any) =>
    apiClient.post(`/events/${id}/attendance`, data),
  getAttendance: (id: string) => apiClient.get(`/events/${id}/attendance`),
};

// Offerings & Tithe
export const offeringsApi = {
  getAll: (params?: any) => apiClient.get('/offerings', { params }),
  getOne: (id: string) => apiClient.get(`/offerings/${id}`),
  create: (data: any) => apiClient.post('/offerings', data),
  update: (id: string, data: any) => apiClient.patch(`/offerings/${id}`, data),
};

// Requests
export const requestsApi = {
  getAll: (params?: any) => apiClient.get('/requests', { params }),
  getMy: (params?: any) => apiClient.get('/requests/my', { params }),
  getOne: (id: string) => apiClient.get(`/requests/${id}`),
  create: (data: any) => apiClient.post('/requests', data),
  approve: (id: string) => apiClient.patch(`/requests/${id}/approve`),
  reject: (id: string, data?: any) =>
    apiClient.patch(`/requests/${id}/reject`, data),
};

// Activity Logs
export const activityLogsApi = {
  getAll: (params?: any) => apiClient.get('/activity-logs', { params }),
  getMy: (params?: any) => apiClient.get('/activity-logs/me', { params }),
};

// Member Logs
export const memberLogsApi = {
  getByMember: (memberId: string, params?: any) =>
    apiClient.get(`/members/${memberId}/logs`, { params }),
  create: (memberId: string, data: any) =>
    apiClient.post(`/members/${memberId}/logs`, data),
  getOne: (id: string) => apiClient.get(`/logs/${id}`),
  update: (id: string, data: any) => apiClient.patch(`/logs/${id}`, data),
  addAttachment: (logId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/logs/${logId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeAttachment: (id: string) =>
    apiClient.delete(`/attachments/${id}`),
};

// Notifications
export const notificationsApi = {
  getAll: (params?: any) => apiClient.get('/notifications', { params }),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
};

