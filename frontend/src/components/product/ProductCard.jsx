import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Badge } from '../../styles/CommonStyles';
import { useCountdown } from '../../hooks/useCountdown';
import { formatPrice, statusLabel, statusVariant, conditionLabel, getImageUrl } from '../../utils/formatters';
import { FiClock, FiEye, FiUsers } from 'react-icons/fi';

function ProductCard({ product, loading }) {
  if (loading) {
    return (
      <CardWrapper>
        <Skeleton height={200} style={{ borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />
        <CardBody>
          <Skeleton width="70%" height={18} />
          <Skeleton width="50%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={22} style={{ marginTop: 12 }} />
          <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
        </CardBody>
      </CardWrapper>
    );
  }

  const { timeLeft, isExpired, urgency } = useCountdown(product.endTime);

  return (
    <CardWrapper as={Link} to={`/products/${product.id}`}>
      {/* 이미지 */}
      <ImageWrapper>
        {product.thumbnailUrl ? (
          <ProductImage src={getImageUrl(product.thumbnailUrl)} alt={product.title} />
        ) : (
          <NoImage>이미지 없음</NoImage>
        )}
        <BadgeGroup>
          <Badge variant={statusVariant[product.status]}>
            {statusLabel[product.status]}
          </Badge>
          {product.itemCondition && (
            <Badge variant={product.itemCondition.toLowerCase()}>
              {conditionLabel[product.itemCondition]}
            </Badge>
          )}
        </BadgeGroup>
      </ImageWrapper>

      {/* 정보 */}
      <CardBody>
        <CategoryTag>{product.categoryName}</CategoryTag>
        <Title>{product.title}</Title>

        <PriceSection>
          <CurrentPrice>{formatPrice(product.currentPrice)}</CurrentPrice>
          {product.buyNowPrice && (
            <BuyNowPrice>즉시구매 {formatPrice(product.buyNowPrice)}</BuyNowPrice>
          )}
        </PriceSection>

        <MetaRow>
          <MetaItem $urgency={urgency}>
            <FiClock size={13} />
            {isExpired ? '종료' : timeLeft}
          </MetaItem>
          <MetaItem>
            <FiUsers size={13} />
            {product.bidCount}명 입찰
          </MetaItem>
          <MetaItem>
            <FiEye size={13} />
            {product.viewCount}
          </MetaItem>
        </MetaRow>
      </CardBody>
    </CardWrapper>
  );
}

export default ProductCard;

/* ========== Styled ========== */

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-tertiary);
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 14px;
`;

const BadgeGroup = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 6px;
`;

const CardBody = styled.div`
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const CategoryTag = styled.span`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceSection = styled.div`
  margin-top: 8px;
`;

const CurrentPrice = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
`;

const BuyNowPrice = styled.p`
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
  margin-top: 2px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ $urgency }) =>
    $urgency === 'danger' ? 'var(--danger)' :
    $urgency === 'warning' ? 'var(--accent)' :
    'var(--text-tertiary)'};
  font-weight: ${({ $urgency }) => $urgency && $urgency !== 'normal' ? '600' : '400'};
`;
