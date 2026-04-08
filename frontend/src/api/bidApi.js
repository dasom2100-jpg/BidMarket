import api from './axiosInstance';

/** 입찰하기 */
export const placeBid = (data) => api.post('/bids', data);

/** 즉시구매 */
export const buyNow = (data) => api.post('/bids/buy-now', data);

/** 상품의 입찰 내역 조회 */
export const getBidHistory = (productId) => api.get(`/bids/product/${productId}`);

/** 내 입찰 내역 */
export const getMyBids = () => api.get('/bids/my');
