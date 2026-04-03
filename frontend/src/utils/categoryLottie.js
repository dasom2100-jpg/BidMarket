/**
 * 카테고리별 Lottie 애니메이션 URL 매핑
 *
 * 애니메이션 찾는 방법:
 * 1. https://lottiefiles.com/ 접속
 * 2. 원하는 키워드 검색 (예: "smartphone", "fashion", "furniture")
 * 3. 마음에 드는 애니메이션 클릭
 * 4. "Get this animation" → URL 복사
 * 5. 아래 맵에 해당 카테고리 ID의 URL을 교체
 *
 * .lottie 또는 .json 형식 모두 지원됩니다.
 */

const categoryLottieMap = {
  // 대분류 카테고리 ID → Lottie URL
  1: 'https://lottie.host/0fd1a390-1532-4a71-a96a-5cc03367e2b4/cFbSvCDHYm.lottie',  // 전자/디지털
  2: 'https://lottie.host/e3a492f7-2698-44fc-a6e7-1deac3143e05/mkBfHNJPDI.lottie',  // 패션/의류
  3: 'https://lottie.host/de31e667-b06c-4d1a-8a6c-0b8cfb39e9ea/rmlVEaeyiI.lottie',  // 가구/인테리어
  4: 'https://lottie.host/e3e97b79-5c2b-47f5-89c8-20e5c7fe8e48/c41QVQ0kts.lottie',  // 스포츠/레저
  5: 'https://lottie.host/53ff1b60-0c0e-419d-bad7-8e0793839489/TZQfzSEaVG.lottie',  // 도서/음반
  6: 'https://lottie.host/3e773e67-65b7-43ff-8cb4-21a4865bde29/i9MsVIMjbR.lottie',  // 생활/주방
  7: 'https://lottie.host/f5e7cf28-1fba-4f38-9520-27a5b3b4c0cc/VEVhCl8N0C.lottie',  // 취미/수집
  8: 'https://lottie.host/8e8adeed-3a25-483f-bfca-31078a47a02e/yI5vuTwAaP.lottie',  // 기타
};

/**
 * 카테고리 ID로 Lottie URL 가져오기
 * @param {number} categoryId
 * @returns {string|null} Lottie URL or null
 */
export const getCategoryLottie = (categoryId) => {
  return categoryLottieMap[categoryId] || null;
};

export default categoryLottieMap;
