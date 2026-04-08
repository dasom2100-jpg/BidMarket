import api from './axiosInstance';

/** 신고 등록 */
export const createReport = (data) => api.post('/reports', data);
