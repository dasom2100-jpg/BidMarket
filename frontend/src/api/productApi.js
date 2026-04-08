import api from './axiosInstance';

/** 상품 등록 (이미지 포함 multipart) */
export const createProduct = (productData, imageFiles) => {
  const formData = new FormData();

  // JSON 데이터를 Blob으로 변환하여 전송
  formData.append('product', new Blob([JSON.stringify(productData)], {
    type: 'application/json',
  }));

  // 이미지 파일 추가
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
  }

  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/** 상품 목록 조회 (페이징 + 필터 + 검색) */
export const getProducts = (params = {}) => {
  const { page = 0, size = 12, sort = 'latest', category, keyword } = params;
  const queryParams = new URLSearchParams({ page, size, sort });
  if (category) queryParams.append('category', category);
  if (keyword) queryParams.append('keyword', keyword);
  return api.get(`/products?${queryParams.toString()}`);
};

/** 상품 상세 조회 */
export const getProduct = (id) => api.get(`/products/${id}`);

/** 현재가 조회 (Polling용) */
export const getCurrentPrice = (id) => api.get(`/products/${id}/price`);

/** 내 판매 상품 목록 */
export const getMyProducts = (page = 0, size = 10) =>
  api.get(`/products/my?page=${page}&size=${size}`);

/** 상품 수정 */
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

/** 상품 삭제 */
export const deleteProduct = (id) => api.delete(`/products/${id}`);
