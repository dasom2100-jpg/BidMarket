import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

/**
 * 카테고리 ID → 로컬 Lottie 파일 매핑
 *
 * 사용법:
 * 1. https://lottiefiles.com/ 에서 원하는 애니메이션 검색
 * 2. 무료 애니메이션 클릭 → "Download" → "Lottie JSON" 선택
 * 3. 다운로드한 .json 파일명을 아래 이름으로 변경
 * 4. frontend/public/lottie/ 폴더에 넣기
 *
 * 예: 전자/디지털 → electronics.json 다운로드 → public/lottie/electronics.json
 */
const CATEGORY_FILES = {
  1: { file: 'electronics.json', emoji: '📱', label: '전자/디지털' },
  2: { file: 'fashion.json',     emoji: '👗', label: '패션/의류' },
  3: { file: 'furniture.json',   emoji: '🛋️', label: '가구/인테리어' },
  4: { file: 'sports.json',      emoji: '⚽', label: '스포츠/레저' },
  5: { file: 'books.json',       emoji: '📚', label: '도서/음반' },
  6: { file: 'kitchen.json',     emoji: '🍳', label: '생활/주방' },
  7: { file: 'hobby.json',       emoji: '🎨', label: '취미/수집' },
  8: { file: 'etc.json',         emoji: '📦', label: '기타' },
};

/**
 * Lottie 또는 애니메이션 아이콘을 보여주는 컴포넌트
 * - public/lottie/ 에 JSON 파일이 있으면 → Lottie 애니메이션
 * - 없으면 → 애니메이션 CSS 아이콘 (폴백)
 */
function CategoryLottie({ categoryId, size = 72 }) {
  const [LottieComponent, setLottieComponent] = useState(null);
  const [animationData, setAnimationData] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const config = CATEGORY_FILES[categoryId] || { emoji: '📦', label: '기타' };

  useEffect(() => {
    let cancelled = false;

    const loadLottie = async () => {
      try {
        // 1) lottie-react 동적 import
        const lottieModule = await import('lottie-react');
        if (cancelled) return;

        // 2) public/lottie/ 에서 JSON 파일 로드 시도
        const response = await fetch(`/lottie/${config.file}`);
        if (!response.ok) throw new Error('File not found');
        const data = await response.json();
        if (cancelled) return;

        setLottieComponent(() => lottieModule.default);
        setAnimationData(data);
      } catch {
        // 파일이 없으면 CSS 폴백 사용
        if (!cancelled) setUseFallback(true);
      }
    };

    if (config.file) {
      loadLottie();
    } else {
      setUseFallback(true);
    }

    return () => { cancelled = true; };
  }, [categoryId, config.file]);

  // Lottie 로드 성공
  if (LottieComponent && animationData) {
    return (
      <LottieWrapper $size={size}>
        <LottieComponent
          animationData={animationData}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </LottieWrapper>
    );
  }

  // 폴백: 애니메이션 CSS 아이콘
  return (
    <FallbackIcon $size={size}>
      <IconText>{config.emoji}</IconText>
    </FallbackIcon>
  );
}

export default CategoryLottie;

/* ========== Styled ========== */

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
`;

const LottieWrapper = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const FallbackIcon = styled.div`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 50%;
  margin-bottom: 12px;
  animation: ${pulse} 3s ease-in-out infinite;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.15);
  }
`;

const IconText = styled.span`
  font-size: 32px;
  line-height: 1;
`;
