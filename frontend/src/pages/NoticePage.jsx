import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { getNotices, getNotice } from '../api/adminApi';
import { Container, Card, Badge, SectionTitle } from '../styles/CommonStyles';
import { formatDate } from '../utils/formatters';
import { FiArrowLeft, FiEye } from 'react-icons/fi';

/** 공지사항 목록 */
export function NoticeListPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotices(0, 30).then((res) => setNotices(res.data.data.content || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Container>
        <SectionTitle>공지사항</SectionTitle>
        {loading ? <Msg>불러오는 중...</Msg> :
          notices.length === 0 ? <Msg>공지사항이 없습니다</Msg> : (
          <NoticeList>
            {notices.map((n) => (
              <NoticeItem key={n.id} to={`/notices/${n.id}`}>
                <NoticeLeft>
                  {n.isPinned && <Badge variant="sold">공지</Badge>}
                  <NoticeTitle>{n.title}</NoticeTitle>
                </NoticeLeft>
                <NoticeMeta>
                  <span><FiEye size={13} /> {n.viewCount}</span>
                  <span>{formatDate(n.createdAt)}</span>
                </NoticeMeta>
              </NoticeItem>
            ))}
          </NoticeList>
        )}
      </Container>
    </PageWrapper>
  );
}

/** 공지사항 상세 */
export function NoticeDetailPage() {
  const { noticeId } = useParams();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    getNotice(noticeId).then((res) => setNotice(res.data.data)).catch(() => {});
  }, [noticeId]);

  if (!notice) return <Container><Msg>불러오는 중...</Msg></Container>;

  return (
    <PageWrapper>
      <Container>
        <BackLink to="/notices"><FiArrowLeft /> 목록으로</BackLink>
        <DetailCard>
          <DetailHeader>
            {notice.isPinned && <Badge variant="sold">공지</Badge>}
            <DetailTitle>{notice.title}</DetailTitle>
            <DetailMeta>
              <span>{formatDate(notice.createdAt)}</span>
              <span><FiEye size={13} /> {notice.viewCount}</span>
            </DetailMeta>
          </DetailHeader>
          <DetailContent>{notice.content}</DetailContent>
        </DetailCard>
      </Container>
    </PageWrapper>
  );
}

/* ========== Styled ========== */
const PageWrapper = styled.div`padding: 30px 0 60px;`;
const Msg = styled.p`text-align: center; padding: 60px; color: var(--text-tertiary);`;
const NoticeList = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const NoticeItem = styled(Link)`
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: var(--bg-primary);
  border: 1px solid var(--border); border-radius: var(--radius-md);
  transition: all 0.2s;
  &:hover { border-color: var(--primary); box-shadow: var(--shadow-sm); }
`;
const NoticeLeft = styled.div`display: flex; align-items: center; gap: 10px;`;
const NoticeTitle = styled.span`font-size: 15px; font-weight: 500;`;
const NoticeMeta = styled.div`display: flex; align-items: center; gap: 16px;
  font-size: 13px; color: var(--text-tertiary);
  span { display: flex; align-items: center; gap: 4px; }`;
const BackLink = styled(Link)`display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--text-secondary); margin-bottom: 20px;
  &:hover { color: var(--primary); }`;
const DetailCard = styled(Card)`padding: 32px;`;
const DetailHeader = styled.div`margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border);`;
const DetailTitle = styled.h1`font-size: 22px; font-weight: 700; margin: 8px 0;`;
const DetailMeta = styled.div`display: flex; gap: 16px; font-size: 13px; color: var(--text-tertiary);
  span { display: flex; align-items: center; gap: 4px; }`;
const DetailContent = styled.div`font-size: 15px; line-height: 1.8; white-space: pre-wrap;`;
