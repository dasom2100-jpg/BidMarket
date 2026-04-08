import api from './axiosInstance';

export const createReview = (data) => api.post('/reviews', data);
export const getMemberReviews = (memberId) => api.get(`/reviews/member/${memberId}`);
export const checkReviewed = (tradeId) => api.get(`/reviews/check/${tradeId}`);
