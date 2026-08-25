/**
 * @file studentApi.js
 * @description All student-related API calls in one place.
 */

import api from './axios';

export const getMyProfile       = ()  => api.get('/student/me');
export const getMyResults       = ()  => api.get('/academic/result/student');
export const getMyInternalResults = () => api.get('/student/internal');
export const getMyCertificates  = ()  => api.get('/student/certificates');
export const uploadCertificate  = (formData) =>
    api.post('/student/certificates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
