import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as notiApi from '../api/notificationApi';
import { Container, Button, Card } from '../styles/CommonStyles';
import { FiBell, FiCheck, FiChevronRight } from 'react-icons/fi';

const TYPE_ICONS = {
  BID: '🔨', OUTBID: '⚡', AUCTION_WON: '🎉', AUCTION_ENDED: '⏰',
  PAYMENT: '💳', SHIPPING: '📦', DELIVERED: '✅', REVIEW: '⭐', SYSTEM: '📢',
};

function NotificationPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notiApi.getNotifications(0, 50);
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (noti) => {
    // 읽음 처리
    if (!noti.isRead) {
      try {
        await notiApi.markAsRead(noti.id);
        setNotifications((prev) =>
          prev.map((n) => n.id === noti.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }

    // 관련 페이지로 이동
    if (noti.referenceId) {
      if (['BID', 'OUTBID', 'AUCTION_WON', 'AUCTION_ENDED'].includes(noti.type)) {
        navigate(`/products/${noti.referenceId}`);
      } else if (['PAYMENT', 'SHIPPING', 'DELIVERED', 'REVIEW'].includes(noti.type)) {
        navigate(`/products/${noti.referenceId}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notiApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '방금 전';
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return new Date(dateStr).toLocaleDateString('ko-KR');
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <TitleRow>
            <Title><FiBell size={22} /> 알림</Title>
            {unreadCount > 0 && <UnreadBadge>{unreadCount}</UnreadBadge>}
          </TitleRow>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              <FiCheck size={14} /> 모두 읽음
            </Button>
          )}
        </Header>

        {loading ? (
          <EmptyMsg>불러오는 중...</EmptyMsg>
        ) : notifications.length === 0 ? (
          <EmptyCard>
            <EmptyIcon><FiBell size={40} /></EmptyIcon>
            <EmptyMsg>알림이 없습니다</EmptyMsg>
          </EmptyCard>
        ) : (
          <NotiList>
            {notifications.map((noti) => (
              <NotiItem
                key={noti.id}
                $unread={!noti.isRead}
                onClick={() => handleClick(noti)}
              >
                <NotiIcon>{TYPE_ICONS[noti.type] || '📢'}</NotiIcon>
                <NotiContent>
                  <NotiTitle $unread={!noti.isRead}>{noti.title}</NotiTitle>
                  <NotiMsg>{noti.message}</NotiMsg>
                  <NotiTime>{formatTimeAgo(noti.createdAt)}</NotiTime>
                </NotiContent>
                {!noti.isRead && <UnreadDot />}
                <FiChevronRight size={16} color="var(--text-tertiary)" />
              </NotiItem>
            ))}
          </NotiList>
        )}
      </Container>
    </PageWrapper>
  );
}

export default NotificationPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 30px 0 60px;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px;
`;

const TitleRow = styled.div`
  display: flex; align-items: center; gap: 10px;
`;

const Title = styled.h1`
  display: flex; align-items: center; gap: 8px;
  font-size: 22px; font-weight: 700;
`;

const UnreadBadge = styled.span`
  padding: 2px 10px; font-size: 13px; font-weight: 700;
  background: var(--danger); color: white; border-radius: 20px;
`;

const NotiList = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;

const NotiItem = styled.div`
  display: flex; align-items: center; gap: 14px;
  padding: 16px; cursor: pointer;
  background: ${({ $unread }) => $unread ? '#EEF2FF' : 'var(--bg-primary)'};
  border: 1px solid ${({ $unread }) => $unread ? '#C7D2FE' : 'var(--border)'};
  border-radius: var(--radius-lg);
  transition: all 0.2s;

  &:hover { box-shadow: var(--shadow-sm); border-color: var(--primary); }
`;

const NotiIcon = styled.span`
  font-size: 24px; flex-shrink: 0;
`;

const NotiContent = styled.div`
  flex: 1; min-width: 0;
`;

const NotiTitle = styled.p`
  font-size: 14px; font-weight: ${({ $unread }) => $unread ? '700' : '500'};
  color: ${({ $unread }) => $unread ? 'var(--primary)' : 'var(--text-primary)'};
`;

const NotiMsg = styled.p`
  font-size: 13px; color: var(--text-secondary); margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

const NotiTime = styled.p`
  font-size: 12px; color: var(--text-tertiary); margin-top: 4px;
`;

const UnreadDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--primary); flex-shrink: 0;
`;

const EmptyCard = styled.div`
  text-align: center; padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  color: var(--text-tertiary); margin-bottom: 16px;
`;

const EmptyMsg = styled.p`
  font-size: 15px; color: var(--text-tertiary); text-align: center;
  padding: 40px 0;
`;
