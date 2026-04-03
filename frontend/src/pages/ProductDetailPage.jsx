import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { fetchProductDetail, clearDetail, updateCurrentPrice } from '../store/productSlice';
import { getCurrentPrice } from '../api/productApi';
import { useCountdown } from '../hooks/useCountdown';
import { Container, Button, Badge, Card, Divider } from '../styles/CommonStyles';
import {
  formatPrice, formatDate, statusLabel, statusVariant,
  conditionLabel, deliveryLabel, getImageUrl
} from '../utils/formatters';
import { FiClock, FiEye, FiUsers, FiUser, FiTruck, FiTag, FiArrowLeft } from 'react-icons/fi';
import BidSection from '../components/product/BidSection';
import BidHistory from '../components/product/BidHistory';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { detail: product, loading } = useSelector((state) => state.product);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [bidRefresh, setBidRefresh] = useState(0);
  const { timeLeft, isExpired, urgency } = useCountdown(product?.endTime);

  // 입찰 성공 시 상품 정보 + 입찰 내역 갱신
  const handleBidSuccess = (bidResult) => {
    dispatch(fetchProductDetail(id));
    setBidRefresh((prev) => prev + 1);
  };

  // 상품 상세 조회
  useEffect(() => {
    dispatch(fetchProductDetail(id));
    return () => dispatch(clearDetail());
  }, [dispatch, id]);

  // 현재가 Polling (5초 간격, 경매 진행중일 때만)
  useEffect(() => {
    if (!product || product.status !== 'ACTIVE') return;

    const polling = setInterval(async () => {
      try {
        const res = await getCurrentPrice(id);
        dispatch(updateCurrentPrice(res.data.data));
      } catch {
        // polling 에러는 무시
      }
    }, 5000);

    return () => clearInterval(polling);
  }, [id, product?.status, dispatch]);

  if (loading || !product) {
    return (
      <Container>
        <DetailWrapper>
          <ImageSection><Skeleton height={400} /></ImageSection>
          <InfoSection>
            <Skeleton height={28} width="70%" />
            <Skeleton height={20} width="40%" style={{ marginTop: 12 }} />
            <Skeleton height={40} width="50%" style={{ marginTop: 20 }} />
            <Skeleton height={100} style={{ marginTop: 20 }} />
          </InfoSection>
        </DetailWrapper>
      </Container>
    );
  }

  const isSeller = user && user.id === product.sellerId;
  const isActive = product.status === 'ACTIVE' && !isExpired;
  const images = product.images || [];

  return (
    <PageWrapper>
      <Container>
        {/* 뒤로가기 */}
        <BackLink to="/products">
          <FiArrowLeft /> 목록으로
        </BackLink>

        <DetailWrapper>
          {/* ===== 이미지 영역 ===== */}
          <ImageSection>
            <MainImage>
              {images.length > 0 ? (
                <img src={getImageUrl(images[selectedImage]?.imageUrl)} alt={product.title} />
              ) : (
                <NoImage>이미지 없음</NoImage>
              )}
            </MainImage>
            {images.length > 1 && (
              <ThumbnailList>
                {images.map((img, i) => (
                  <Thumbnail
                    key={img.id}
                    $active={selectedImage === i}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={getImageUrl(img.imageUrl)} alt="" />
                  </Thumbnail>
                ))}
              </ThumbnailList>
            )}
          </ImageSection>

          {/* ===== 정보 영역 ===== */}
          <InfoSection>
            {/* 카테고리 + 상태 */}
            <TopRow>
              <BreadCrumb>
                {product.parentCategoryName && <span>{product.parentCategoryName} &gt; </span>}
                {product.categoryName}
              </BreadCrumb>
              <Badge variant={statusVariant[product.status]}>
                {statusLabel[product.status]}
              </Badge>
            </TopRow>

            <Title>{product.title}</Title>

            {/* 남은 시간 */}
            <TimerBox $urgency={urgency}>
              <FiClock size={18} />
              <TimerLabel>남은 시간</TimerLabel>
              <TimerValue>{timeLeft}</TimerValue>
            </TimerBox>

            {/* 가격 정보 */}
            <PriceCard>
              <PriceRow>
                <PriceLabel>현재가</PriceLabel>
                <CurrentPrice>{formatPrice(product.currentPrice)}</CurrentPrice>
              </PriceRow>
              <PriceRow>
                <PriceLabel>시작가</PriceLabel>
                <PriceValue>{formatPrice(product.startPrice)}</PriceValue>
              </PriceRow>
              {product.buyNowPrice && (
                <PriceRow>
                  <PriceLabel>즉시구매가</PriceLabel>
                  <BuyNowPrice>{formatPrice(product.buyNowPrice)}</BuyNowPrice>
                </PriceRow>
              )}
              <PriceRow>
                <PriceLabel>입찰 수</PriceLabel>
                <PriceValue>{product.bidCount}회</PriceValue>
              </PriceRow>
            </PriceCard>

            {/* 입찰 영역 */}
            <BidSection product={product} onBidSuccess={handleBidSuccess} />

            {isSeller && product.bidCount === 0 && (
              <BtnGroup>
                <Button variant="secondary" fullWidth onClick={() => alert('수정 기능은 추후 구현')}>
                  수정
                </Button>
                <Button variant="danger" fullWidth onClick={() => alert('삭제 기능은 추후 구현')}>
                  삭제
                </Button>
              </BtnGroup>
            )}

            <Divider />

            {/* 상품 정보 */}
            <InfoGrid>
              <InfoItem>
                <FiTag size={16} />
                <InfoLabel>상품 상태</InfoLabel>
                <InfoValue>{conditionLabel[product.itemCondition]}</InfoValue>
              </InfoItem>
              <InfoItem>
                <FiTruck size={16} />
                <InfoLabel>배송 방법</InfoLabel>
                <InfoValue>{deliveryLabel[product.deliveryType]}</InfoValue>
              </InfoItem>
              <InfoItem>
                <FiEye size={16} />
                <InfoLabel>조회수</InfoLabel>
                <InfoValue>{product.viewCount}</InfoValue>
              </InfoItem>
              <InfoItem>
                <FiClock size={16} />
                <InfoLabel>등록일</InfoLabel>
                <InfoValue>{formatDate(product.startTime)}</InfoValue>
              </InfoItem>
            </InfoGrid>

            <Divider />

            {/* 판매자 정보 */}
            <SellerCard>
              <SellerAvatar>
                <FiUser size={24} />
              </SellerAvatar>
              <div>
                <SellerName>{product.sellerNickname}</SellerName>
                <SellerLabel>판매자</SellerLabel>
              </div>
            </SellerCard>
          </InfoSection>
        </DetailWrapper>

        {/* 상품 설명 */}
        <DescriptionCard>
          <DescTitle>상품 설명</DescTitle>
          <DescContent>{product.description}</DescContent>
        </DescriptionCard>

        {/* 입찰 내역 */}
        <DescriptionCard>
          <BidHistory productId={product.id} refreshTrigger={bidRefresh} />
        </DescriptionCard>
      </Container>
    </PageWrapper>
  );
}

export default ProductDetailPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 20px 0 60px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  &:hover { color: var(--primary); }
`;

const DetailWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

/* Image */
const ImageSection = styled.div``;

const MainImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const NoImage = styled.div`
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-tertiary); font-size: 16px;
`;

const ThumbnailList = styled.div`
  display: flex; gap: 8px; margin-top: 12px;
`;

const Thumbnail = styled.div`
  width: 72px; height: 72px;
  border-radius: var(--radius-md);
  overflow: hidden; cursor: pointer;
  border: 2px solid ${({ $active }) => $active ? 'var(--primary)' : 'var(--border)'};
  opacity: ${({ $active }) => $active ? 1 : 0.6};
  transition: all 0.2s;
  &:hover { opacity: 1; }
  img { width: 100%; height: 100%; object-fit: cover; }
`;

/* Info */
const InfoSection = styled.div``;

const TopRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
`;

const BreadCrumb = styled.span`
  font-size: 13px; color: var(--text-tertiary);
`;

const Title = styled.h1`
  font-size: 24px; font-weight: 700; line-height: 1.4;
  margin-bottom: 16px;
`;

const TimerBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: var(--radius-md);
  margin-bottom: 20px;
  background: ${({ $urgency }) =>
    $urgency === 'danger' ? '#FEE2E2' :
    $urgency === 'warning' ? '#FEF3C7' : 'var(--bg-tertiary)'};
  color: ${({ $urgency }) =>
    $urgency === 'danger' ? '#991B1B' :
    $urgency === 'warning' ? '#92400E' : 'var(--text-secondary)'};
`;

const TimerLabel = styled.span`
  font-size: 14px; font-weight: 500;
`;

const TimerValue = styled.span`
  font-size: 16px; font-weight: 700; margin-left: auto;
`;

const PriceCard = styled(Card)`
  padding: 20px; margin-bottom: 20px;
`;

const PriceRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0;
  &:not(:last-child) { border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 4px; }
`;

const PriceLabel = styled.span`
  font-size: 14px; color: var(--text-secondary);
`;

const CurrentPrice = styled.span`
  font-size: 24px; font-weight: 800; color: var(--primary);
`;

const PriceValue = styled.span`
  font-size: 15px; font-weight: 600;
`;

const BuyNowPrice = styled.span`
  font-size: 15px; font-weight: 700; color: var(--accent);
`;

const BtnGroup = styled.div`
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
`;

const InfoItem = styled.div`
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--text-secondary);
`;

const InfoLabel = styled.span`
  color: var(--text-tertiary);
`;

const InfoValue = styled.span`
  font-weight: 600; color: var(--text-primary); margin-left: auto;
`;

const SellerCard = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 16px; background: var(--bg-tertiary);
  border-radius: var(--radius-md);
`;

const SellerAvatar = styled.div`
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--primary-light); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
`;

const SellerName = styled.p`
  font-size: 15px; font-weight: 600;
`;

const SellerLabel = styled.p`
  font-size: 12px; color: var(--text-tertiary);
`;

const DescriptionCard = styled(Card)`
  margin-top: 32px; padding: 32px;
`;

const DescTitle = styled.h3`
  font-size: 18px; font-weight: 700; margin-bottom: 16px;
`;

const DescContent = styled.div`
  font-size: 15px; line-height: 1.8; color: var(--text-secondary);
  white-space: pre-wrap;
`;
