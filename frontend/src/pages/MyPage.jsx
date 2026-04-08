import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMyProducts } from '../api/productApi';
import { getMyBids } from '../api/bidApi';
import { getMySales, getMyPurchases } from '../api/tradeApi';
import { Container, Button, Badge, Card, SectionTitle } from '../styles/CommonStyles';
import { formatPrice, formatDate, statusLabel, statusVariant, getImageUrl } from '../utils/formatters';
import { FiPackage, FiShoppingBag, FiDollarSign, FiUser, FiChevronRight } from 'react-icons/fi';

const TABS = [
  { key: 'selling', label: '판매 상품', icon: <FiPackage size={16} /> },
  { key: 'sales', label: '판매 거래', icon: <FiShoppingBag size={16} /> },
  { key: 'purchases', label: '구매 거래', icon: <FiShoppingBag size={16} /> },
  { key: 'bids', label: '입찰 내역', icon: <FiDollarSign size={16} /> },
  { key: 'profile', label: '내 정보', icon: <FiUser size={16} /> },
];

function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('selling');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadData();
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'selling':
          res = await getMyProducts(0, 20);
          setData(res.data.data.products || []);
          break;
        case 'sales':
          res = await getMySales(0, 20);
          setData(res.data.data.trades || []);
          break;
        case 'purchases':
          res = await getMyPurchases(0, 20);
          setData(res.data.data.trades || []);
          break;
        case 'bids':
          res = await getMyBids();
          setData(res.data.data || []);
          break;
        default:
          setData([]);
      }
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <Container>
        {/* 프로필 헤더 */}
        <ProfileCard>
          <Avatar><FiUser size={32} /></Avatar>
          <ProfileInfo>
            <ProfileName>{user?.nickname}</ProfileName>
            <ProfileEmail>{user?.email}</ProfileEmail>
          </ProfileInfo>
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('profile')}>
            정보 수정
          </Button>
        </ProfileCard>

        {/* 탭 */}
        <TabRow>
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              $active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </Tab>
          ))}
        </TabRow>

        {/* 내용 */}
        <ContentArea>
          {activeTab === 'profile' ? (
            <ProfileSection user={user} />
          ) : loading ? (
            <EmptyText>불러오는 중...</EmptyText>
          ) : data.length === 0 ? (
            <EmptyState>
              <EmptyText>
                {activeTab === 'selling' && '등록한 상품이 없습니다'}
                {activeTab === 'sales' && '판매 거래 내역이 없습니다'}
                {activeTab === 'purchases' && '구매 거래 내역이 없습니다'}
                {activeTab === 'bids' && '입찰 내역이 없습니다'}
              </EmptyText>
              {activeTab === 'selling' && (
                <Button onClick={() => navigate('/products/new')}>상품 등록하기</Button>
              )}
              {activeTab === 'bids' && (
                <Button onClick={() => navigate('/products')}>경매 둘러보기</Button>
              )}
            </EmptyState>
          ) : (
            <ItemList>
              {activeTab === 'selling' && data.map((item, idx) => (
                <ProductItem key={`sell-${item.id || idx}`} to={`/products/${item.id}`}>
                  <Thumb src={item.thumbnailUrl ? getImageUrl(item.thumbnailUrl) : ''} />
                  <ItemInfo>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemMeta>현재가 {formatPrice(item.currentPrice)} · 입찰 {item.bidCount}건</ItemMeta>
                  </ItemInfo>
                  <Badge variant={statusVariant[item.status]}>{statusLabel[item.status]}</Badge>
                  <FiChevronRight size={16} color="var(--text-tertiary)" />
                </ProductItem>
              ))}

              {(activeTab === 'sales' || activeTab === 'purchases') && data.map((item, idx) => (
                <ProductItem key={`trade-${item.tradeId || idx}`} to={`/trades/${item.tradeId}`}>
                  <Thumb src={item.productThumbnail ? getImageUrl(item.productThumbnail) : ''} />
                  <ItemInfo>
                    <ItemTitle>{item.productTitle}</ItemTitle>
                    <ItemMeta>
                      {formatPrice(item.finalPrice)} ·
                      {item.role === 'SELLER' ? ` 구매자: ${item.counterpartNickname}` : ` 판매자: ${item.counterpartNickname}`}
                    </ItemMeta>
                  </ItemInfo>
                  <TradeStatusBadge $status={item.status}>{tradeStatusLabel[item.status]}</TradeStatusBadge>
                  <FiChevronRight size={16} color="var(--text-tertiary)" />
                </ProductItem>
              ))}

              {activeTab === 'bids' && data.map((item, idx) => (
                <ProductItem key={`bid-${item.bidId || idx}`} to={`/products/${item.productId}`}>
                  <Thumb src={item.productThumbnail ? getImageUrl(item.productThumbnail) : ''} />
                  <ItemInfo>
                    <ItemTitle>{item.productTitle}</ItemTitle>
                    <ItemMeta>
                      내 입찰 {formatPrice(item.bidAmount)} · 현재가 {formatPrice(item.currentPrice)}
                    </ItemMeta>
                  </ItemInfo>
                  {item.isTopBidder ? (
                    <Badge variant="active">최고입찰</Badge>
                  ) : (
                    <Badge variant="failed">경쟁중</Badge>
                  )}
                  <FiChevronRight size={16} color="var(--text-tertiary)" />
                </ProductItem>
              ))}
            </ItemList>
          )}
        </ContentArea>
      </Container>
    </PageWrapper>
  );
}

/** 내 정보 섹션 */
function ProfileSection({ user }) {
  if (!user) return null;
  return (
    <ProfileDetailCard>
      <InfoRow><InfoLabel>이메일</InfoLabel><InfoValue>{user.email}</InfoValue></InfoRow>
      <InfoRow><InfoLabel>닉네임</InfoLabel><InfoValue>{user.nickname}</InfoValue></InfoRow>
      <InfoRow><InfoLabel>전화번호</InfoLabel><InfoValue>{user.phone || '-'}</InfoValue></InfoRow>
      <InfoRow><InfoLabel>주소</InfoLabel><InfoValue>{user.address ? `${user.address} ${user.addressDetail || ''}` : '-'}</InfoValue></InfoRow>
      <InfoRow><InfoLabel>가입일</InfoLabel><InfoValue>{formatDate(user.createdAt)}</InfoValue></InfoRow>
    </ProfileDetailCard>
  );
}

const tradeStatusLabel = {
  AWAITING_PAYMENT: '결제대기',
  PAID: '결제완료',
  SHIPPING: '배송중',
  DELIVERED: '수령확인',
  COMPLETED: '거래완료',
  DISPUTED: '분쟁중',
  CANCELLED: '취소됨',
};

export default MyPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 30px 0 60px;
`;

const ProfileCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--primary-light); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.p`
  font-size: 18px; font-weight: 700;
`;

const ProfileEmail = styled.p`
  font-size: 14px; color: var(--text-secondary);
`;

const TabRow = styled.div`
  display: flex; gap: 4px; margin-bottom: 24px;
  overflow-x: auto; padding-bottom: 4px;
`;

const Tab = styled.button`
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; font-size: 14px; font-weight: 600;
  white-space: nowrap; border-radius: var(--radius-md);
  transition: all 0.2s;
  background: ${({ $active }) => $active ? 'var(--primary)' : 'var(--bg-primary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--primary)' : 'var(--border)'};

  &:hover { border-color: var(--primary); }
`;

const ContentArea = styled.div``;

const EmptyState = styled.div`
  text-align: center; padding: 60px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
`;

const EmptyText = styled.p`
  font-size: 15px; color: var(--text-tertiary);
`;

const ItemList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const ProductItem = styled(Link)`
  display: flex; align-items: center; gap: 14px;
  padding: 16px; background: var(--bg-primary);
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  transition: all 0.2s;

  &:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
`;

const Thumb = styled.div`
  width: 56px; height: 56px; border-radius: var(--radius-md);
  background: var(--bg-tertiary) url(${({ src }) => src}) center/cover no-repeat;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`
  flex: 1; min-width: 0;
`;

const ItemTitle = styled.p`
  font-size: 14px; font-weight: 600;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const ItemMeta = styled.p`
  font-size: 13px; color: var(--text-secondary); margin-top: 2px;
`;

const TradeStatusBadge = styled.span`
  padding: 4px 10px; font-size: 12px; font-weight: 600;
  border-radius: 20px; white-space: nowrap;
  background: ${({ $status }) =>
    $status === 'COMPLETED' ? '#DCFCE7' :
    $status === 'SHIPPING' ? '#DBEAFE' :
    $status === 'PAID' ? '#FEF3C7' :
    $status === 'AWAITING_PAYMENT' ? '#FEE2E2' : '#F1F5F9'};
  color: ${({ $status }) =>
    $status === 'COMPLETED' ? '#166534' :
    $status === 'SHIPPING' ? '#1E40AF' :
    $status === 'PAID' ? '#92400E' :
    $status === 'AWAITING_PAYMENT' ? '#991B1B' : '#475569'};
`;

const ProfileDetailCard = styled(Card)`
  padding: 24px;
`;

const InfoRow = styled.div`
  display: flex; padding: 14px 0;
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
`;

const InfoLabel = styled.span`
  width: 100px; font-size: 14px; color: var(--text-tertiary); flex-shrink: 0;
`;

const InfoValue = styled.span`
  font-size: 14px; font-weight: 500;
`;
