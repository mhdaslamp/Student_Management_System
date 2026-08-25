/**
 * @file requestApi.js
 * @description All request management API calls in one place.
 */

import api from './axios';

// ─── Student ──────────────────────────────────────────────────────────────────
export const createRequest    = (data)  => api.post('/request', data);
export const getMyRequests    = ()      => api.get('/request/my');
export const resubmitRequest  = (id, data) => api.post(`/request/${id}/resubmit`, data);
export const downloadPDF      = (id)    => api.get(`/request/${id}/pdf`, { responseType: 'blob' });
export const getStaff         = (params) => api.get('/request/staff', { params });

// ─── Approvers (teacher / hod / principal) ────────────────────────────────────
export const getPendingRequests  = ()        => api.get('/request/pending');
export const getApproverHistory  = ()        => api.get('/request/history');
export const approveRequest      = (id, data) => api.post(`/request/${id}/approve`, data);
export const rejectRequest       = (id, data) => api.post(`/request/${id}/reject`, data);

// ─── Public ───────────────────────────────────────────────────────────────────
export const verifyRequest = (reqId) => api.get(`/request/verify/${reqId}`);
