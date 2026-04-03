import api from './axiosInstance';

/** 전체 카테고리 트리 조회 */
export const getCategories = () => api.get('/categories');

/** 하위 카테고리 조회 */
export const getSubCategories = (parentId) => api.get(`/categories/${parentId}/children`);
