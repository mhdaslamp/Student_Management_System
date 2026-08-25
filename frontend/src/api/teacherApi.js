/**
 * @file teacherApi.js
 * @description All teacher-related API calls in one place.
 * Import these functions in components instead of writing axios calls inline.
 * If an endpoint changes, update it here — not in every component.
 */

import api from './axios';

// ─── Batches ──────────────────────────────────────────────────────────────────
export const getBatches         = ()           => api.get('/teacher/batch');
export const createBatch        = (data)       => api.post('/teacher/batch', data);
export const getBatchDetails    = (batchId)    => api.get(`/teacher/batch/${batchId}`);
export const uploadStudents     = (batchId, formData) =>
    api.post(`/teacher/batch/${batchId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ─── Student Management ───────────────────────────────────────────────────────
export const updateStudent  = (studentId, data) => api.put(`/teacher/student/${studentId}`, data);
export const deleteStudent  = (studentId)        => api.delete(`/teacher/student/${studentId}`);

// ─── Internal Marks ───────────────────────────────────────────────────────────
export const downloadInternalTemplate = (batchId, subject) =>
    api.get(`/teacher/internal/template/${batchId}`, {
        params: { subject },
        responseType: 'blob',
    });
export const uploadInternalMarks = (batchId, formData) =>
    api.post(`/teacher/internal/upload/${batchId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });

// ─── Certificates ─────────────────────────────────────────────────────────────
export const getPendingCertificates  = ()             => api.get('/teacher/certificates/pending');
export const updateCertificateStatus = (id, data)     => api.put(`/teacher/certificates/${id}/status`, data);
