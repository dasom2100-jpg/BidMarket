import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { placeBid, buyNow } from '../../api/bidApi';
import { Button, Input } from '../../styles/CommonStyles';
import { formatPrice } from '../../utils/formatters';
import { FiAlertCircle, FiCheck, FiZap } from 'react-icons/fi';

const MIN_INCREMENT = 1000;

function BidSection({ product, onBidSuccess }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const minBidAmount = product.currentPrice + MIN_INCREMENT;
  const isSeller = user && user.id === product.sellerId;
  const isActive = product.status === 'ACTIVE';
  const isTopBidder = user && product.topBidderId === user.id;

  // 로그인 필요
  const requireAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return true;
    }
    return false;
  };

  /** 입찰하기 */
  const handleBid = async () => {
    if (requireAuth()) return;
    setError('');
    setSuccess('');

    const amount = Number(bidAmount);
    if (!amount || amount < minBidAmount) {
      setError(`최소 입찰 금액은 ${formatPrice(minBidAmount)}입니다`);
      return;
    }

    if (product.buyNowPrice && amount >= product.buyNowPrice) {
      setError(`입찰가가 즉시구매가(${formatPrice(product.buyNowPrice)}) 이상입니다. 즉시구매를 이용하세요`);
      return;
    }

    setLoading(true);
    try {
      const res = await placeBid({
        productId: product.id,
        bidAmount: amount,
      });
      setSuccess(`${formatPrice(amount)}에 입찰 성공!`);
      setBidAmount('');
      if (onBidSuccess) onBidSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '입찰에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  /** 즉시구매 */
  const handleBuyNow = async () => {
    if (requireAuth()) return;
    setError('');
    setSuccess('');

    if (!window.confirm(
      `${formatPrice(product.buyNowPrice)}에 즉시구매하시겠습니까?\n이 작업은 취소할 수 없습니다.`
    )) return;

    setLoading(true);
    try {
      const res = await buyNow({ productId: product.id });
      setSuccess('즉시구매 완료! 거래가 시작됩니다.');
      if (onBidSuccess) onBidSuccess(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '즉시구매에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  /** 빠른 금액 버튼 — 실제 입찰될 금액을 표시 */
  const quickAmounts = [
    { label: formatPrice(minBidAmount), value: minBidAmount },
    { label: formatPrice(product.currentPrice + 5000), value: product.currentPrice + 5000 },
    { label: formatPrice(product.currentPrice + 10000), value: product.currentPrice + 10000 },
  ].filter(item => !product.buyNowPrice || item.value < product.buyNowPrice);

  // 판매자는 입찰 불가
  if (isSeller) {
    return (
      <Wrapper>
        <InfoBox>
          <FiAlertCircle size={18} />
          내가 등록한 상품입니다
        </InfoBox>
      </Wrapper>
    );
  }

  // 경매 종료
  if (!isActive) {
    return (
      <Wrapper>
        <InfoBox $type="ended">
          <FiAlertCircle size={18} />
          경매가 종료되었습니다
        </InfoBox>
      </Wrapper>
    );
  }

  // 이미 최고 입찰자
  if (isTopBidder) {
    return (
      <Wrapper>
        <SuccessBox>
          <FiCheck size={18} />
          현재 최고 입찰자입니다!
        </SuccessBox>
        {product.buyNowPrice && (
          <BuyNowBtn onClick={handleBuyNow} disabled={loading}>
            <FiZap size={16} />
            즉시구매 {formatPrice(product.buyNowPrice)}
          </BuyNowBtn>
        )}
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* 피드백 메시지 */}
      {error && <ErrorBox><FiAlertCircle size={16} />{error}</ErrorBox>}
      {success && <SuccessBox><FiCheck size={16} />{success}</SuccessBox>}

      {/* 입찰 금액 입력 */}
      <BidInputGroup>
        <Label>입찰 금액 (최소 {formatPrice(minBidAmount)})</Label>
        <BidInput
          type="number"
          placeholder={`${minBidAmount.toLocaleString()}원 이상`}
          value={bidAmount}
          onChange={(e) => {
            setBidAmount(e.target.value);
            setError('');
          }}
          min={minBidAmount}
          step={1000}
        />

        {/* 빠른 금액 버튼 */}
        <QuickBtnRow>
          {quickAmounts.map(({ label, value }) => (
            <QuickBtn
              key={label}
              type="button"
              onClick={() => setBidAmount(String(value))}
              $active={Number(bidAmount) === value}
            >
              {label}
            </QuickBtn>
          ))}
        </QuickBtnRow>
      </BidInputGroup>

      {/* 입찰 버튼 */}
      <Button fullWidth onClick={handleBid} disabled={loading}>
        {loading ? '처리 중...' : '입찰하기'}
      </Button>

      {/* 즉시구매 버튼 */}
      {product.buyNowPrice && (
        <BuyNowBtn onClick={handleBuyNow} disabled={loading}>
          <FiZap size={16} />
          즉시구매 {formatPrice(product.buyNowPrice)}
        </BuyNowBtn>
      )}

      <BidNotice>
        입찰 후 취소할 수 없습니다. 신중하게 입찰하세요.
      </BidNotice>
    </Wrapper>
  );
}

export default BidSection;

/* ========== Styled ========== */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BidInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
`;

const BidInput = styled(Input)`
  font-size: 18px;
  font-weight: 700;
  padding: 14px;
  text-align: right;

  &::placeholder {
    font-size: 14px;
    font-weight: 400;
  }
`;

const QuickBtnRow = styled.div`
  display: flex;
  gap: 8px;
`;

const QuickBtn = styled.button`
  flex: 1;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  background: ${({ $active }) => $active ? 'var(--primary-light)' : 'var(--bg-tertiary)'};
  color: ${({ $active }) => $active ? 'var(--primary)' : 'var(--text-secondary)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--primary)' : 'transparent'};

  &:hover {
    background: var(--primary-light);
    color: var(--primary);
  }
`;

const BuyNowBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-md);
  transition: background 0.2s;

  &:hover:not(:disabled) { background: var(--accent-hover); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FEE2E2;
  color: #991B1B;
  font-size: 14px;
  border-radius: var(--radius-md);
`;

const SuccessBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #DCFCE7;
  color: #166534;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: ${({ $type }) => $type === 'ended' ? '#F1F5F9' : '#EEF2FF'};
  color: ${({ $type }) => $type === 'ended' ? '#475569' : '#4338CA'};
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
`;

const BidNotice = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
`;
