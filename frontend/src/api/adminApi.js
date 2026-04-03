import api from './axiosInstance';

// 대시보드
export const getDashboard = () => api.get('/admin/dashboard');

// 회원 관리
export const getMembers = (page = 0, size = 20) => api.get(`/admin/members?page=${page}&size=${size}`);
export const toggleMemberActive = (memberId) => api.put(`/admin/members/${memberId}/toggle-active`);

// 상품 관리
export const getAdminProducts = (page = 0, size = 20) => api.get(`/admin/products?page=${page}&size=${size}`);
export const cancelProduct = (productId) => api.put(`/admin/products/${productId}/cancel`);

// 신고 관리
export const getReports = (status, page = 0, size = 20) =>
  api.get(`/admin/reports?${status ? `status=${status}&` : ''}page=${page}&size=${size}`);
export const resolveReport = (reportId, adminNote) => api.put(`/admin/reports/${reportId}/resolve`, { adminNote });
export const dismissReport = (reportId, adminNote) => api.put(`/admin/reports/${reportId}/dismiss`, { adminNote });

// 공지사항
export const createNotice = (data) => api.post('/admin/notices', data);
export const deleteNotice = (noticeId) => api.delete(`/admin/notices/${noticeId}`);
export const getNotices = (page = 0, size = 10) => api.get(`/notices?page=${page}&size=${size}`);
export const getNotice = (noticeId) => api.get(`/notices/${noticeId}`);

// 1:1 문의 (관리자)
export const getAdminInquiries = (page = 0, size = 20) => api.get(`/admin/inquiries?page=${page}&size=${size}`);
export const answerInquiry = (inquiryId, answer) => api.put(`/admin/inquiries/${inquiryId}/answer`, { answer });

// 1:1 문의 (사용자)
export const getMyInquiries = (page = 0, size = 10) => api.get(`/inquiries/my?page=${page}&size=${size}`);
export const createInquiry = (data) => api.post('/inquiries', data);
