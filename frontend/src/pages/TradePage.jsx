import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as tradeApi from '../api/tradeApi';
import { checkReviewed, createReview } from '../api/reviewApi';
import { Container, Button, Card, Input, Select, Divider, TextArea } from '../styles/CommonStyles';
import { formatPrice, formatDate, getImageUrl } from '../utils/formatters';
import { FiArrowLeft, FiCheck, FiTruck, FiCreditCard, FiPackage, FiStar } from 'react-icons/fi';

const STEPS = [
  { key: 'AWAITING_PAYMENT', label: '결제대기', icon: <FiCreditCard size={18} /> },
  { key: 'PAID',             label: '결제완료', icon: <FiCheck size={18} /> },
  { key: 'SHIPPING',         label: '배송중',   icon: <FiTruck size={18} /> },
  { key: 'DELIVERED',        label: '수령확인', icon: <FiPackage size={18} /> },
  { key: 'COMPLETED',        label: '거래완료', icon: <FiStar size={18} /> },
];

function TradePage() {
  const { tradeId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shipForm, setShipForm] = useState({ shippingCompany: '대한통운', trackingNumber: '' });
  const [error, setError] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    loadTrade();
  }, [tradeId]);

  const loadTrade = async () => {
    try {
      setLoading(true);
      const res = await tradeApi.getTradeDetail(tradeId);
      setTrade(res.data.data);
      // 거래 완료 상태면 리뷰 작성 여부 확인
      if (res.data.data.status === 'COMPLETED') {
        try {
          const reviewRes = await checkReviewed(tradeId);
          setHasReviewed(reviewRes.data.data.reviewed);
        } catch { /* ignore */ }
      }
    } catch (err) {
      setError(err.response?.data?.message || '거래 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!reviewForm.content.trim()) {
      alert('리뷰 내용을 입력해주세요');
      return;
    }
    setReviewLoading(true);
    try {
      await createReview({
        tradeId: Number(tradeId),
        rating: reviewForm.rating,
        content: reviewForm.content,
      });
      setHasReviewed(true);
      setReviewSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || '리뷰 등록에 실패했습니다');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    setError('');
    try {
      let res;
      switch (action) {
        case 'pay':
          if (!window.confirm('결제를 확인하시겠습니까?')) return;
          res = await tradeApi.confirmPayment(tradeId);
          break;
        case 'ship':
          if (!shipForm.trackingNumber.trim()) { setError('송장번호를 입력하세요'); return; }
          res = await tradeApi.shipOrder(tradeId, shipForm);
          break;
        case 'confirm':
          if (!window.confirm('상품 수령을 확인하시겠습니까?')) return;
          res = await tradeApi.confirmDelivery(tradeId);
          break;
        case 'complete':
          if (!window.confirm('거래를 완료하시겠습니까?')) return;
          res = await tradeApi.completeTrade(tradeId);
          break;
        default: return;
      }
      setTrade(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '처리에 실패했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Container><p style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>불러오는 중...</p></Container>;
  if (!trade) return <Container><p style={{ padding: '60px 0', textAlign: 'center', color: 'var(--danger)' }}>{error || '거래를 찾을 수 없습니다'}</p></Container>;

  const isSeller = user?.id === trade.sellerId;
  const isBuyer = user?.id === trade.buyerId;
  const currentStepIndex = STEPS.findIndex((s) => s.key === trade.status);

  return (
    <PageWrapper>
      <Container>
        <BackLink to="/mypage"><FiArrowLeft /> 마이페이지</BackLink>

        {/* 진행 단계 */}
        <StepCard>
          <StepRow>
            {STEPS.map((step, i) => (
              <StepItem key={step.key}>
                <StepCircle $done={i <= currentStepIndex} $active={i === currentStepIndex}>
                  {step.icon}
                </StepCircle>
                <StepLabel $active={i === currentStepIndex}>{step.label}</StepLabel>
                {i < STEPS.length - 1 && <StepLine $done={i < currentStepIndex} />}
              </StepItem>
            ))}
          </StepRow>
        </StepCard>

        <ContentGrid>
          {/* 상품 정보 */}
          <InfoCard>
            <CardTitle>상품 정보</CardTitle>
            <ProductRow to={`/products/${trade.productId}`}>
              <ProductThumb $src={trade.productThumbnail ? getImageUrl(trade.productThumbnail) : ''} />
              <div>
                <ProductName>{trade.productTitle}</ProductName>
                <FinalPrice>{formatPrice(trade.finalPrice)}</FinalPrice>
              </div>
            </ProductRow>

            <Divider margin="16px 0" />

            <DetailRow><DetailLabel>판매자</DetailLabel><DetailValue>{trade.sellerNickname}</DetailValue></DetailRow>
            <DetailRow><DetailLabel>구매자</DetailLabel><DetailValue>{trade.buyerNickname}</DetailValue></DetailRow>
            <DetailRow><DetailLabel>거래 생성</DetailLabel><DetailValue>{formatDate(trade.createdAt)}</DetailValue></DetailRow>
            {trade.paidAt && <DetailRow><DetailLabel>결제 일시</DetailLabel><DetailValue>{formatDate(trade.paidAt)}</DetailValue></DetailRow>}
            {trade.shippedAt && <DetailRow><DetailLabel>배송 시작</DetailLabel><DetailValue>{formatDate(trade.shippedAt)}</DetailValue></DetailRow>}
            {trade.deliveredAt && <DetailRow><DetailLabel>수령 확인</DetailLabel><DetailValue>{formatDate(trade.deliveredAt)}</DetailValue></DetailRow>}
            {trade.completedAt && <DetailRow><DetailLabel>거래 완료</DetailLabel><DetailValue>{formatDate(trade.completedAt)}</DetailValue></DetailRow>}

            {trade.trackingNumber && (
              <>
                <Divider margin="16px 0" />
                <DetailRow><DetailLabel>택배사</DetailLabel><DetailValue>{trade.shippingCompany}</DetailValue></DetailRow>
                <DetailRow><DetailLabel>송장번호</DetailLabel><DetailValue>{trade.trackingNumber}</DetailValue></DetailRow>
              </>
            )}
          </InfoCard>

          {/* 액션 영역 */}
          <ActionCard>
            <CardTitle>거래 진행</CardTitle>

            {error && <ErrorBox>{error}</ErrorBox>}

            {/* 구매자: 결제 확인 */}
            {isBuyer && trade.status === 'AWAITING_PAYMENT' && (
              <ActionSection>
                <ActionDesc>판매자에게 결제를 완료한 후 아래 버튼을 눌러주세요.</ActionDesc>
                <Button fullWidth onClick={() => handleAction('pay')} disabled={actionLoading}>
                  <FiCreditCard size={16} /> 결제 확인
                </Button>
              </ActionSection>
            )}

            {/* 판매자: 배송 시작 */}
            {isSeller && trade.status === 'PAID' && (
              <ActionSection>
                <ActionDesc>상품을 발송하고 송장번호를 입력해주세요.</ActionDesc>
                <FormGroup>
                  <Select value={shipForm.shippingCompany} onChange={(e) => setShipForm({ ...shipForm, shippingCompany: e.target.value })}>
                    <option value="대한통운">대한통운(CJ)</option>
                    <option value="로젠택배">로젠택배</option>
                    <option value="한진택배">한진택배</option>
                    <option value="롯데택배">롯데택배</option>
                    <option value="우체국택배">우체국택배</option>
                    <option value="기타">기타</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Input
                    placeholder="송장번호를 입력하세요"
                    value={shipForm.trackingNumber}
                    onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                  />
                </FormGroup>
                <Button fullWidth onClick={() => handleAction('ship')} disabled={actionLoading}>
                  <FiTruck size={16} /> 배송 시작
                </Button>
              </ActionSection>
            )}

            {/* 구매자: 수령 확인 */}
            {isBuyer && trade.status === 'SHIPPING' && (
              <ActionSection>
                <ActionDesc>상품을 수령한 후 확인 버튼을 눌러주세요.</ActionDesc>
                <ShipInfo>
                  <span>{trade.shippingCompany}</span>
                  <strong>{trade.trackingNumber}</strong>
                </ShipInfo>
                <Button fullWidth onClick={() => handleAction('confirm')} disabled={actionLoading}>
                  <FiPackage size={16} /> 수령 확인
                </Button>
              </ActionSection>
            )}

            {/* 양쪽: 거래 완료 */}
            {trade.status === 'DELIVERED' && (isSeller || isBuyer) && (
              <ActionSection>
                <ActionDesc>거래에 만족하시면 완료 처리해주세요.</ActionDesc>
                <Button fullWidth variant="accent" onClick={() => handleAction('complete')} disabled={actionLoading}>
                  <FiStar size={16} /> 거래 완료
                </Button>
              </ActionSection>
            )}

            {/* 대기 상태 메시지 */}
            {isSeller && trade.status === 'AWAITING_PAYMENT' && (
              <WaitMsg>구매자의 결제를 기다리고 있습니다...</WaitMsg>
            )}
            {isBuyer && trade.status === 'PAID' && (
              <WaitMsg>판매자가 배송을 준비하고 있습니다...</WaitMsg>
            )}
            {isSeller && trade.status === 'SHIPPING' && (
              <WaitMsg>구매자의 수령 확인을 기다리고 있습니다...</WaitMsg>
            )}
            {trade.status === 'COMPLETED' && (
              <>
                <CompletedMsg><FiCheck size={18} /> 거래가 완료되었습니다!</CompletedMsg>

                {/* 리뷰 영역 */}
                {hasReviewed || reviewSuccess ? (
                  <ReviewDoneBox>
                    <FiStar size={18} />
                    리뷰를 작성했습니다. 감사합니다!
                  </ReviewDoneBox>
                ) : (
                  <ReviewSection>
                    <ReviewTitle>
                      <FiStar size={16} />
                      {isSeller ? '구매자' : '판매자'}에게 리뷰를 남겨주세요
                    </ReviewTitle>

                    <StarRow>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarBtn
                          key={star}
                          $active={star <= reviewForm.rating}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          ★
                        </StarBtn>
                      ))}
                      <StarText>{reviewForm.rating}점</StarText>
                    </StarRow>

                    <TextArea
                      placeholder="거래는 어떠셨나요? 상대방에게 도움이 되는 리뷰를 남겨주세요"
                      rows={4}
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    />

                    <Button
                      fullWidth
                      variant="accent"
                      onClick={handleReview}
                      disabled={reviewLoading}
                      style={{ marginTop: 8 }}
                    >
                      {reviewLoading ? '등록 중...' : '리뷰 등록'}
                    </Button>
                  </ReviewSection>
                )}
              </>
            )}
          </ActionCard>
        </ContentGrid>
      </Container>
    </PageWrapper>
  );
}

export default TradePage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 20px 0 60px;
`;

const BackLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;
  &:hover { color: var(--primary); }
`;

const StepCard = styled(Card)`
  padding: 32px 24px; margin-bottom: 24px; overflow-x: auto;
`;

const StepRow = styled.div`
  display: flex; align-items: flex-start; justify-content: center; min-width: 500px;
`;

const StepItem = styled.div`
  display: flex; flex-direction: column; align-items: center; position: relative;
  flex: 1;
`;

const StepCircle = styled.div`
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: ${({ $done, $active }) => $active ? 'var(--primary)' : $done ? 'var(--success)' : 'var(--bg-tertiary)'};
  color: ${({ $done, $active }) => ($done || $active) ? 'white' : 'var(--text-tertiary)'};
  transition: all 0.3s;
  z-index: 1;
`;

const StepLabel = styled.p`
  font-size: 12px; font-weight: ${({ $active }) => $active ? '700' : '400'};
  color: ${({ $active }) => $active ? 'var(--primary)' : 'var(--text-tertiary)'};
  margin-top: 8px; text-align: center;
`;

const StepLine = styled.div`
  position: absolute; top: 22px; left: 50%; width: 100%; height: 2px;
  background: ${({ $done }) => $done ? 'var(--success)' : 'var(--border)'};
  z-index: 0;
`;

const ContentGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const InfoCard = styled(Card)`
  padding: 24px;
`;

const ActionCard = styled(Card)`
  padding: 24px;
`;

const CardTitle = styled.h3`
  font-size: 18px; font-weight: 700; margin-bottom: 20px;
`;

const ProductRow = styled(Link)`
  display: flex; align-items: center; gap: 14px;
`;

const ProductThumb = styled.div`
  width: 64px; height: 64px; border-radius: var(--radius-md);
  background: var(--bg-tertiary) url(${({ $src }) => $src}) center/cover no-repeat;
  flex-shrink: 0;
`;

const ProductName = styled.p`
  font-size: 15px; font-weight: 600;
`;

const FinalPrice = styled.p`
  font-size: 18px; font-weight: 700; color: var(--primary); margin-top: 4px;
`;

const DetailRow = styled.div`
  display: flex; justify-content: space-between; padding: 8px 0;
`;

const DetailLabel = styled.span`
  font-size: 14px; color: var(--text-tertiary);
`;

const DetailValue = styled.span`
  font-size: 14px; font-weight: 500;
`;

const ActionSection = styled.div`
  display: flex; flex-direction: column; gap: 12px;
`;

const ActionDesc = styled.p`
  font-size: 14px; color: var(--text-secondary); line-height: 1.6;
`;

const FormGroup = styled.div``;

const ShipInfo = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: var(--bg-tertiary);
  border-radius: var(--radius-md); font-size: 14px;
  span { color: var(--text-secondary); }
  strong { color: var(--text-primary); }
`;

const WaitMsg = styled.p`
  text-align: center; padding: 32px 0;
  font-size: 14px; color: var(--text-tertiary);
`;

const CompletedMsg = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 24px; background: #DCFCE7; color: #166534;
  font-size: 16px; font-weight: 700; border-radius: var(--radius-md);
`;

const ErrorBox = styled.div`
  padding: 12px 16px; background: #FEE2E2; color: #991B1B;
  font-size: 14px; border-radius: var(--radius-md); margin-bottom: 12px;
`;

const ReviewSection = styled.div`
  margin-top: 16px;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ReviewTitle = styled.p`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
`;

const StarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarBtn = styled.button`
  font-size: 28px;
  background: none;
  color: ${({ $active }) => $active ? '#F59E0B' : '#D1D5DB'};
  transition: color 0.15s, transform 0.15s;
  padding: 2px;

  &:hover {
    transform: scale(1.2);
    color: #F59E0B;
  }
`;

const StarText = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-left: 8px;
`;

const ReviewDoneBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 16px;
  background: #FEF3C7;
  color: #92400E;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
`;
