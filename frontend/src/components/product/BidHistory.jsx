import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getBidHistory } from '../../api/bidApi';
import { formatPrice, formatDate } from '../../utils/formatters';
import { FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function BidHistory({ productId, refreshTrigger }) {
  const [history, setHistory] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [productId, refreshTrigger]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getBidHistory(productId);
      setHistory(res.data.data);
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  if (loading || !history) return null;
  if (history.bids.length === 0) {
    return (
      <Wrapper>
        <Header>
          <Title>입찰 내역</Title>
          <Count>0건</Count>
        </Header>
        <EmptyText>아직 입찰이 없습니다. 첫 입찰자가 되어보세요!</EmptyText>
      </Wrapper>
    );
  }

  const displayBids = expanded ? history.bids : history.bids.slice(0, 5);

  return (
    <Wrapper>
      <Header>
        <Title>입찰 내역</Title>
        <Count>{history.bidCount}건</Count>
      </Header>

      <BidList>
        {displayBids.map((bid, index) => (
          <BidItem key={bid.bidId} $isTop={bid.isTopBid}>
            <Rank>
              {index === 0 && bid.isTopBid ? (
                <TopBadge><FiAward size={14} /></TopBadge>
              ) : (
                <RankNum>{index + 1}</RankNum>
              )}
            </Rank>
            <BidInfo>
              <BidderName $isTop={bid.isTopBid}>{bid.bidderNickname}</BidderName>
              <BidTime>{formatDate(bid.bidTime)}</BidTime>
            </BidInfo>
            <BidAmount $isTop={bid.isTopBid}>
              {formatPrice(bid.bidAmount)}
            </BidAmount>
          </BidItem>
        ))}
      </BidList>

      {history.bids.length > 5 && (
        <ToggleBtn onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <>접기 <FiChevronUp size={16} /></>
          ) : (
            <>전체 {history.bids.length}건 보기 <FiChevronDown size={16} /></>
          )}
        </ToggleBtn>
      )}
    </Wrapper>
  );
}

export default BidHistory;

/* ========== Styled ========== */

const Wrapper = styled.div`
  margin-top: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
`;

const Count = styled.span`
  font-size: 14px;
  color: var(--text-tertiary);
`;

const BidList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const BidItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ $isTop }) => $isTop ? '#EEF2FF' : 'var(--bg-tertiary)'};
  border-radius: var(--radius-md);
  border-left: 3px solid ${({ $isTop }) => $isTop ? 'var(--primary)' : 'transparent'};
`;

const Rank = styled.div`
  width: 28px;
  flex-shrink: 0;
`;

const TopBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
`;

const RankNum = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
`;

const BidInfo = styled.div`
  flex: 1;
`;

const BidderName = styled.p`
  font-size: 14px;
  font-weight: ${({ $isTop }) => $isTop ? '700' : '500'};
  color: ${({ $isTop }) => $isTop ? 'var(--primary)' : 'var(--text-primary)'};
`;

const BidTime = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
`;

const BidAmount = styled.span`
  font-size: ${({ $isTop }) => $isTop ? '16px' : '14px'};
  font-weight: 700;
  color: ${({ $isTop }) => $isTop ? 'var(--primary)' : 'var(--text-primary)'};
  white-space: nowrap;
`;

const EmptyText = styled.p`
  text-align: center;
  padding: 32px;
  color: var(--text-tertiary);
  font-size: 14px;
`;

const ToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border-radius: var(--radius-md);
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--primary);
  }
`;
