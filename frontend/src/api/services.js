import api from './client'

// --- Auth ---
export const authApi = {
  login: (payload) => api.post('/auth/login/', payload),
  register: (payload) => api.post('/auth/register/', payload),
  me: () => api.get('/auth/me/'),
  updateMe: (payload) =>
    api.patch('/auth/me/', payload, {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  changePassword: (payload) => api.post('/auth/change-password/', payload),
  users: (params) => api.get('/auth/users/', { params }),
  updateUser: (id, payload) => api.patch(`/auth/users/${id}/`, payload),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
}

// --- Doctors / Slots / Appointments ---
export const appointmentApi = {
  doctors: (params) => api.get('/appointments/doctors/', { params }),
  createDoctor: (payload) => api.post('/appointments/doctors/', payload),
  createDoctorAccount: (payload) => api.post('/appointments/doctors/create_account/', payload),
  updateDoctor: (id, payload) => api.patch(`/appointments/doctors/${id}/`, payload),
  specializations: () => api.get('/appointments/doctors/specializations/'),
  slots: (params) => api.get('/appointments/slots/', { params }),
  createSlot: (payload) => api.post('/appointments/slots/', payload),
  list: (params) => api.get('/appointments/', { params }),
  book: (payload) => api.post('/appointments/', payload),
  setStatus: (id, payload) => api.patch(`/appointments/${id}/status/`, payload),
  cancel: (id) => api.delete(`/appointments/${id}/`),
}

// --- Chat ---
export const chatApi = {
  conversations: () => api.get('/chat/conversations/'),
  conversation: (id) => api.get(`/chat/conversations/${id}/`),
  send: (payload) => api.post('/chat/conversations/send/', payload),
  remove: (id) => api.delete(`/chat/conversations/${id}/`),
  disclaimer: () => api.get('/chat/conversations/disclaimer/'),
}

// --- Reports ---
export const reportApi = {
  list: (params) => api.get('/reports/', { params }),
  upload: (formData) =>
    api.post('/reports/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => api.delete(`/reports/${id}/`),
  reprocess: (id) => api.post(`/reports/${id}/reprocess/`),
}

// --- Dashboard ---
export const dashboardApi = {
  adminStats: () => api.get('/dashboard/admin-stats/'),
  myStats: () => api.get('/dashboard/my-stats/'),
}
