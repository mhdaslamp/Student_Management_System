/**
 * @file academicApi.js
 * @description All academic/result-related API calls in one place.
 */

import api from './axios';

// ─── Results ─────────────────────────────────────────────────────────────────
export const uploadResultPDF      = (formData) =>
    api.post('/academic/result/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob', // returns Excel file
    });

export const getDraftOverview     = ()                   => api.get('/academic/result/draft-overview');
export const getPublishedOverview = ()                   => api.get('/academic/result/overview');
export const getBatchOverview     = (batchId)            => api.get(`/academic/result/overview/${batchId}`);
export const getBatchResultDetails = (batchId, params)   => api.get(`/academic/result/details/${batchId}`, { params });
export const getAllResultDetails   = (params)             => api.get('/academic/result/details/all', { params });
export const publishResult        = (data)               => api.post('/academic/result/publish', data);
export const deleteResult         = (data)               => api.post('/academic/result/delete', data);

// ─── Downloads ────────────────────────────────────────────────────────────────
export const downloadBatchResult = (batchId, params) =>
    api.get(`/academic/result/download/${batchId}`, { params, responseType: 'blob' });
export const downloadGlobalResult = (params) =>
    api.get('/academic/result/download/all', { params, responseType: 'blob' });

// ─── Analysis ─────────────────────────────────────────────────────────────────
export const getBatchAnalysis      = (batchId, params) => api.get(`/academic/result/analysis/${batchId}`, { params });
export const getDepartmentAnalysis = (params)           => api.get('/academic/result/analysis/department', { params });
export const getCollegeAnalysis    = (params)           => api.get('/academic/result/analysis/college', { params });
