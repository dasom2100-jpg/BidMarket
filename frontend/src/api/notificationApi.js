import api from './axiosInstance';

/** 내 알림 목록 */
export const getNotifications = (page = 0, size = 20) =>
  api.get(`/notifications?page=${page}&size=${size}`);

/** 읽지 않은 알림 수 */
export const getUnreadCount = () => api.get('/notifications/unread-count');

/** 알림 읽음 처리 */
export const markAsRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`);

/** 모든 알림 읽음 처리 */
export const markAllAsRead = () => api.put('/notifications/read-all');
