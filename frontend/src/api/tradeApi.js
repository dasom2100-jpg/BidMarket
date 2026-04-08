import api from './axiosInstance';

/** 거래 상세 조회 */
export const getTradeDetail = (tradeId) => api.get(`/trades/${tradeId}`);

/** 상품 ID로 거래 조회 */
export const getTradeByProduct = (productId) => api.get(`/trades/product/${productId}`);

/** 결제 확인 (구매자) */
export const confirmPayment = (tradeId) => api.put(`/trades/${tradeId}/pay`);

/** 배송 시작 (판매자) */
export const shipOrder = (tradeId, data) => api.put(`/trades/${tradeId}/ship`, data);

/** 수령 확인 (구매자) */
export const confirmDelivery = (tradeId) => api.put(`/trades/${tradeId}/confirm`);

/** 거래 완료 */
export const completeTrade = (tradeId) => api.put(`/trades/${tradeId}/complete`);

/** 내 판매 거래 목록 */
export const getMySales = (page = 0, size = 10) =>
  api.get(`/trades/sales?page=${page}&size=${size}`);

/** 내 구매 거래 목록 */
export const getMyPurchases = (page = 0, size = 10) =>
  api.get(`/trades/purchases?page=${page}&size=${size}`);
