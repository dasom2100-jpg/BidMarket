/** 가격 포맷 (1000 → "1,000원") */
export const formatPrice = (price) => {
  if (price == null) return '-';
  return price.toLocaleString('ko-KR') + '원';
};

/** 날짜 포맷 ("2026-04-01T12:00:00" → "2026.04.01 12:00") */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d} ${h}:${min}`;
};

/** 경매 상태 한글 라벨 */
export const statusLabel = {
  ACTIVE: '경매중',
  SOLD: '낙찰',
  FAILED: '유찰',
  TRADING: '거래중',
  COMPLETED: '거래완료',
  CANCELLED: '취소',
};

/** 경매 상태 → Badge variant 매핑 */
export const statusVariant = {
  ACTIVE: 'active',
  SOLD: 'sold',
  FAILED: 'failed',
  TRADING: 'trading',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

/** 상품 상태 한글 라벨 */
export const conditionLabel = {
  BEST: '최상',
  GOOD: '양호',
  FAIR: '보통',
};

/** 배송 방법 한글 라벨 */
export const deliveryLabel = {
  PARCEL: '택배',
  DIRECT: '직거래',
  BOTH: '택배/직거래',
};

/** 이미지 URL이 상대경로인 경우 백엔드 URL 붙이기 */
export const getImageUrl = (url) => {
  if (!url) return '/no-image.png';
  if (url.startsWith('http')) return url;
  return url; // Vite proxy가 /uploads → localhost:8080으로 전달
};
