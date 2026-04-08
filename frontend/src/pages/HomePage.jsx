import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { fetchCategories } from '../store/categorySlice';
import { Container } from '../styles/CommonStyles';
import CategoryLottie from '../components/common/CategoryLottie';
import api from '../api/axiosInstance';
import { FiArrowRight, FiShield, FiClock, FiDollarSign } from 'react-icons/fi';

/** Hero 영역 오른쪽 Lottie 애니메이션 */
function HeroLottie() {
  const [LottieComp, setLottieComp] = useState(null);
  const [animData, setAnimData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const mod = await import('lottie-react');
        const res = await fetch('/lottie/auction.json');
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        if (!cancelled) {
          setLottieComp(() => mod.default);
          setAnimData(data);
        }
      } catch {
        // auction.json이 없으면 아무것도 안 보임
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (!LottieComp || !animData) return null;

  return (
    <LottieComp
      animationData={animData}
      loop
      autoplay
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.category);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    // 메인화면 통계 조회
    api.get('/stats')
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, [dispatch]);

  return (
    <>
      {/* ===== Hero Section ===== */}
      <HeroSection>
        <HeroContent>
          <HeroTextSide>
            <HeroBadge>C2C 경매 플랫폼</HeroBadge>
            <HeroTitle>
              당신의 물건에<br />
              <Highlight>새로운 가치</Highlight>를 부여하세요
            </HeroTitle>
            <HeroDesc>
              사용하지 않는 질 좋은 제품을 경매에 등록하고,
              원하는 물건을 합리적인 가격에 낙찰받으세요.
            </HeroDesc>
            <HeroBtnGroup>
              <HeroPrimaryBtn to="/products">
                경매 둘러보기 <FiArrowRight />
              </HeroPrimaryBtn>
              {isAuthenticated ? (
                <HeroSecondaryBtn to="/products/new">
                  상품 등록하기
                </HeroSecondaryBtn>
              ) : (
                <HeroSecondaryBtn to="/signup">
                  시작하기
                </HeroSecondaryBtn>
              )}
            </HeroBtnGroup>

            <StatsRow>
              <StatItem>
                <StatNumber>{stats ? stats.totalProducts.toLocaleString() : '-'}</StatNumber>
                <StatLabel>등록된 상품</StatLabel>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatNumber>{stats ? stats.totalMembers.toLocaleString() : '-'}</StatNumber>
                <StatLabel>회원 수</StatLabel>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatNumber>
                  {stats
                    ? stats.totalReviews > 0
                      ? `${stats.satisfactionPercent}%`
                      : '-'
                    : '-'}
                </StatNumber>
                <StatLabel>거래 만족도</StatLabel>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatNumber>{stats ? stats.activeAuctions.toLocaleString() : '-'}</StatNumber>
                <StatLabel>진행중 경매</StatLabel>
              </StatItem>
            </StatsRow>
          </HeroTextSide>

          <HeroLottieSide>
            <HeroLottie />
          </HeroLottieSide>
        </HeroContent>
      </HeroSection>

      {/* ===== 카테고리 Section ===== */}
      <Section>
        <Container>
          <SectionHeader>
            <SectionTitle>카테고리별 경매</SectionTitle>
            <SectionLink to="/products">전체 보기 <FiArrowRight /></SectionLink>
          </SectionHeader>

          <CategoryGrid>
            {loading
              ? Array(8).fill(null).map((_, i) => (
                  <CategoryCardSkeleton key={i}>
                    <Skeleton height={60} width={60} circle />
                    <Skeleton width={80} height={16} style={{ marginTop: 12 }} />
                  </CategoryCardSkeleton>
                ))
              : categories.map((cat) => (
                  <CategoryCard key={cat.id} to={`/products?category=${cat.id}`}>
                    <CategoryLottie categoryId={cat.id} size={72} />
                    <CategoryName>{cat.name}</CategoryName>
                    <CategoryCount>{cat.children?.length || 0}개 하위 카테고리</CategoryCount>
                  </CategoryCard>
                ))
            }
          </CategoryGrid>
        </Container>
      </Section>

      {/* ===== Features Section ===== */}
      <Section $bg>
        <Container>
          <SectionTitle style={{ textAlign: 'center', marginBottom: 40 }}>
            왜 BidMarket인가요?
          </SectionTitle>

          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon><FiDollarSign size={28} /></FeatureIcon>
              <FeatureTitle>합리적인 가격</FeatureTitle>
              <FeatureDesc>
                시작가에서 경쟁 입찰을 통해 합리적인 가격으로
                거래가 이루어집니다.
              </FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon><FiShield size={28} /></FeatureIcon>
              <FeatureTitle>안전한 거래</FeatureTitle>
              <FeatureDesc>
                거래 상태를 단계별로 관리하고,
                상호 리뷰 시스템으로 신뢰를 보장합니다.
              </FeatureDesc>
            </FeatureCard>
            <FeatureCard>
              <FeatureIcon><FiClock size={28} /></FeatureIcon>
              <FeatureTitle>실시간 경매</FeatureTitle>
              <FeatureDesc>
                실시간으로 최고가가 갱신되며,
                마감 카운트다운으로 긴장감 있는 경매를 즐기세요.
              </FeatureDesc>
            </FeatureCard>
          </FeatureGrid>
        </Container>
      </Section>

      {/* ===== CTA Section ===== */}
      <CtaSection>
        <Container>
          {isAuthenticated ? (
            <>
              <CtaTitle>지금 경매에 참여하세요</CtaTitle>
              <CtaDesc>집에 잠자는 물건에 새 주인을 찾아주세요</CtaDesc>
              <CtaBtn to="/products/new">상품 등록하기 <FiArrowRight /></CtaBtn>
            </>
          ) : (
            <>
              <CtaTitle>지금 바로 시작하세요</CtaTitle>
              <CtaDesc>집에 잠자는 물건에 새 주인을 찾아주세요</CtaDesc>
              <CtaBtn to="/signup">무료 회원가입 <FiArrowRight /></CtaBtn>
            </>
          )}
        </Container>
      </CtaSection>
    </>
  );
}

export default HomePage;

/* ========== Styled ========== */

const HeroSection = styled.section`
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%);
  padding: 80px 20px;
  overflow: hidden;
`;

const HeroContent = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const HeroTextSide = styled.div``;

const HeroLottieSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 450px;

  @media (max-width: 768px) {
    max-height: 300px;
    // order: -1;
    display: none;
  }
`;

const HeroBadge = styled.span`
  display: inline-block;
  padding: 6px 14px;
  background: var(--primary);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
`;

const HeroTitle = styled.h1`
  font-size: 42px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--secondary);
  margin-bottom: 16px;

  @media (max-width: 768px) { font-size: 28px; }
`;

const Highlight = styled.span`
  color: var(--primary);
`;

const HeroDesc = styled.p`
  font-size: 17px;
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.7;
  margin-bottom: 32px;
`;

const HeroBtnGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 48px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const HeroPrimaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: background 0.2s;

  &:hover { background: var(--primary-hover); }
`;

const HeroSecondaryBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: white;
  color: var(--primary);
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: var(--primary-light);
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 480px) { gap: 16px; }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.p`
  font-size: 24px;
  font-weight: 800;
  color: var(--secondary);

  @media (max-width: 480px) { font-size: 20px; }
`;

const StatLabel = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
`;

const StatDivider = styled.div`
  width: 1px;
  height: 40px;
  background: #CBD5E1;
`;

/* ===== Section ===== */

const Section = styled.section`
  padding: 60px 0;
  background: ${({ $bg }) => $bg ? 'var(--bg-tertiary)' : 'transparent'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 22px;
  font-weight: 700;
`;

const SectionLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;

  &:hover { text-decoration: underline; }
`;

/* ===== Category ===== */

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const CategoryCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const CategoryCardSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
`;

const CategoryName = styled.p`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const CategoryCount = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
`;

/* ===== Features ===== */

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 32px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
`;

const FeatureIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 50%;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const FeatureDesc = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
`;

/* ===== CTA ===== */

const CtaSection = styled.section`
  text-align: center;
  padding: 60px 20px;
  background: var(--secondary);
`;

const CtaTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin-bottom: 8px;
`;

const CtaDesc = styled.p`
  font-size: 16px;
  color: #94A3B8;
  margin-bottom: 28px;
`;

const CtaBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: var(--primary);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: background 0.2s;

  &:hover { background: var(--primary-hover); }
`;
