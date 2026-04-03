import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as adminApi from '../api/adminApi';
import { Container, Button, Input, TextArea, Card, Badge, Select } from '../styles/CommonStyles';
import { formatPrice, formatDate } from '../utils/formatters';
import { FiUsers, FiPackage, FiAlertTriangle, FiFileText, FiMessageSquare, FiBarChart2, FiToggleLeft, FiToggleRight, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const TABS = [
  { key: 'dashboard', label: '대시보드', icon: <FiBarChart2 size={16} /> },
  { key: 'members', label: '회원 관리', icon: <FiUsers size={16} /> },
  { key: 'products', label: '상품 관리', icon: <FiPackage size={16} /> },
  { key: 'reports', label: '신고 관리', icon: <FiAlertTriangle size={16} /> },
  { key: 'notices', label: '공지사항', icon: <FiFileText size={16} /> },
  { key: 'inquiries', label: '1:1 문의', icon: <FiMessageSquare size={16} /> },
];

function AdminPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      alert('관리자만 접근할 수 있습니다');
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <PageWrapper>
      <Container>
        <Title>관리자 페이지</Title>
        <TabRow>
          {TABS.map((tab) => (
            <Tab key={tab.key} $active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
              {tab.icon} {tab.label}
            </Tab>
          ))}
        </TabRow>
        <Content>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'members' && <MembersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'notices' && <NoticesTab />}
          {activeTab === 'inquiries' && <InquiriesTab />}
        </Content>
      </Container>
    </PageWrapper>
  );
}

// ========== Dashboard ==========
function DashboardTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    adminApi.getDashboard().then((res) => setStats(res.data.data)).catch(() => {});
  }, []);
  if (!stats) return <Loading>불러오는 중...</Loading>;
  const items = [
    { label: '총 회원 수', value: stats.totalMembers, color: '#4F46E5' },
    { label: '총 상품 수', value: stats.totalProducts, color: '#0F6E56' },
    { label: '진행중 경매', value: stats.activeAuctions, color: '#D97706' },
    { label: '총 거래 수', value: stats.totalTrades, color: '#3B82F6' },
    { label: '미처리 신고', value: stats.pendingReports, color: '#EF4444' },
    { label: '미답변 문의', value: stats.pendingInquiries, color: '#8B5CF6' },
  ];
  return (
    <StatsGrid>
      {items.map((item) => (
        <StatCard key={item.label}>
          <StatValue style={{ color: item.color }}>{item.value}</StatValue>
          <StatLabel>{item.label}</StatLabel>
        </StatCard>
      ))}
    </StatsGrid>
  );
}

// ========== Members ==========
function MembersTab() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const res = await adminApi.getMembers(0, 50); setMembers(res.data.data.content || []); }
    catch {} finally { setLoading(false); }
  };
  const handleToggle = async (id) => {
    try { await adminApi.toggleMemberActive(id); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  if (loading) return <Loading>불러오는 중...</Loading>;
  return (
    <Table>
      <thead><tr><Th>ID</Th><Th>이메일</Th><Th>닉네임</Th><Th>역할</Th><Th>상태</Th><Th>가입일</Th><Th>관리</Th></tr></thead>
      <tbody>
        {members.map((m) => (
          <tr key={m.id}>
            <Td>{m.id}</Td><Td>{m.email}</Td><Td>{m.nickname}</Td>
            <Td><Badge variant={m.role === 'ADMIN' ? 'sold' : 'active'}>{m.role}</Badge></Td>
            <Td>{m.isActive ? <Badge variant="active">활성</Badge> : <Badge variant="failed">정지</Badge>}</Td>
            <Td>{formatDate(m.createdAt)}</Td>
            <Td>
              {m.role !== 'ADMIN' && (
                <SmallBtn onClick={() => handleToggle(m.id)}>
                  {m.isActive ? <><FiToggleRight size={14} /> 정지</> : <><FiToggleLeft size={14} /> 활성</>}
                </SmallBtn>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// ========== Products ==========
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const res = await adminApi.getAdminProducts(0, 50); setProducts(res.data.data.content || []); }
    catch {} finally { setLoading(false); }
  };
  const handleCancel = async (id) => {
    if (!window.confirm('이 상품을 취소하시겠습니까?')) return;
    try { await adminApi.cancelProduct(id); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  if (loading) return <Loading>불러오는 중...</Loading>;
  return (
    <Table>
      <thead><tr><Th>ID</Th><Th>제목</Th><Th>판매자</Th><Th>현재가</Th><Th>상태</Th><Th>마감일</Th><Th>관리</Th></tr></thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <Td>{p.id}</Td><Td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</Td>
            <Td>{p.seller?.nickname}</Td><Td>{formatPrice(p.currentPrice)}</Td>
            <Td><Badge variant={p.status === 'ACTIVE' ? 'active' : p.status === 'SOLD' ? 'sold' : 'cancelled'}>{p.status}</Badge></Td>
            <Td>{formatDate(p.endTime)}</Td>
            <Td>{p.status === 'ACTIVE' && <SmallBtn $danger onClick={() => handleCancel(p.id)}><FiX size={14} /> 취소</SmallBtn>}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

// ========== Reports ==========
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [noteInput, setNoteInput] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const res = await adminApi.getReports(null, 0, 50); setReports(res.data.data.content || []); }
    catch {} finally { setLoading(false); }
  };
  const handleResolve = async (id) => {
    try { await adminApi.resolveReport(id, noteInput[id] || ''); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  const handleDismiss = async (id) => {
    try { await adminApi.dismissReport(id, noteInput[id] || ''); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  if (loading) return <Loading>불러오는 중...</Loading>;
  return (
    <CardList>
      {reports.length === 0 && <Loading>신고 내역이 없습니다</Loading>}
      {reports.map((r) => (
        <ReportCard key={r.id}>
          <ReportHeader>
            <Badge variant={r.status === 'PENDING' ? 'trading' : r.status === 'RESOLVED' ? 'active' : 'cancelled'}>{r.status}</Badge>
            <span>{r.targetType} #{r.targetId}</span>
            <span>{formatDate(r.createdAt)}</span>
          </ReportHeader>
          <ReportBody>
            <p><strong>사유:</strong> {r.reason}</p>
            {r.detail && <p>{r.detail}</p>}
            {r.adminNote && <p><strong>관리자 메모:</strong> {r.adminNote}</p>}
          </ReportBody>
          {r.status === 'PENDING' && (
            <ReportActions>
              <Input placeholder="관리자 메모" value={noteInput[r.id] || ''}
                onChange={(e) => setNoteInput({ ...noteInput, [r.id]: e.target.value })} />
              <BtnRow>
                <SmallBtn onClick={() => handleResolve(r.id)}><FiCheck size={14} /> 처리</SmallBtn>
                <SmallBtn $danger onClick={() => handleDismiss(r.id)}><FiX size={14} /> 기각</SmallBtn>
              </BtnRow>
            </ReportActions>
          )}
        </ReportCard>
      ))}
    </CardList>
  );
}

// ========== Notices ==========
function NoticesTab() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const res = await adminApi.getNotices(0, 50); setNotices(res.data.data.content || []); }
    catch {} finally { setLoading(false); }
  };
  const handleCreate = async () => {
    if (!form.title || !form.content) { alert('제목과 내용을 입력하세요'); return; }
    try {
      await adminApi.createNotice(form);
      setForm({ title: '', content: '', isPinned: false }); setShowForm(false); load();
    } catch (e) { alert(e.response?.data?.message); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try { await adminApi.deleteNotice(id); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  if (loading) return <Loading>불러오는 중...</Loading>;
  return (
    <div>
      <BtnRow style={{ marginBottom: 16 }}>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '+ 새 공지'}
        </Button>
      </BtnRow>
      {showForm && (
        <FormCard>
          <Input placeholder="공지 제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextArea placeholder="공지 내용" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} style={{ marginTop: 8 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} /> 상단 고정
          </label>
          <Button size="sm" onClick={handleCreate} style={{ marginTop: 12 }}>등록</Button>
        </FormCard>
      )}
      <Table>
        <thead><tr><Th>ID</Th><Th>제목</Th><Th>고정</Th><Th>조회수</Th><Th>작성일</Th><Th>관리</Th></tr></thead>
        <tbody>
          {notices.map((n) => (
            <tr key={n.id}>
              <Td>{n.id}</Td><Td>{n.title}</Td>
              <Td>{n.isPinned ? '📌' : '-'}</Td><Td>{n.viewCount}</Td>
              <Td>{formatDate(n.createdAt)}</Td>
              <Td><SmallBtn $danger onClick={() => handleDelete(n.id)}><FiTrash2 size={14} /></SmallBtn></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

// ========== Inquiries ==========
function InquiriesTab() {
  const [inquiries, setInquiries] = useState([]);
  const [answerInput, setAnswerInput] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, []);
  const load = async () => {
    try { const res = await adminApi.getAdminInquiries(0, 50); setInquiries(res.data.data.content || []); }
    catch {} finally { setLoading(false); }
  };
  const handleAnswer = async (id) => {
    if (!answerInput[id]) { alert('답변을 입력하세요'); return; }
    try { await adminApi.answerInquiry(id, answerInput[id]); load(); } catch (e) { alert(e.response?.data?.message); }
  };
  if (loading) return <Loading>불러오는 중...</Loading>;
  return (
    <CardList>
      {inquiries.length === 0 && <Loading>문의 내역이 없습니다</Loading>}
      {inquiries.map((inq) => (
        <ReportCard key={inq.id}>
          <ReportHeader>
            <Badge variant={inq.status === 'PENDING' ? 'trading' : 'active'}>{inq.status === 'PENDING' ? '미답변' : '답변완료'}</Badge>
            <span>{inq.member?.nickname}</span>
            <span>{formatDate(inq.createdAt)}</span>
          </ReportHeader>
          <ReportBody>
            <p><strong>{inq.title}</strong></p>
            <p>{inq.content}</p>
            {inq.answer && <AnswerBox><strong>답변:</strong> {inq.answer}</AnswerBox>}
          </ReportBody>
          {inq.status === 'PENDING' && (
            <ReportActions>
              <TextArea placeholder="답변 입력" rows={3} value={answerInput[inq.id] || ''}
                onChange={(e) => setAnswerInput({ ...answerInput, [inq.id]: e.target.value })} />
              <Button size="sm" onClick={() => handleAnswer(inq.id)} style={{ marginTop: 8 }}>답변 등록</Button>
            </ReportActions>
          )}
        </ReportCard>
      ))}
    </CardList>
  );
}

export default AdminPage;

/* ========== Styled ========== */
const PageWrapper = styled.div`padding: 30px 0 60px;`;
const Title = styled.h1`font-size: 24px; font-weight: 700; margin-bottom: 24px;`;
const TabRow = styled.div`display: flex; gap: 4px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 4px;`;
const Tab = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 10px 18px;
  font-size: 14px; font-weight: 600; white-space: nowrap; border-radius: var(--radius-md);
  background: ${({ $active }) => $active ? 'var(--secondary)' : 'var(--bg-primary)'};
  color: ${({ $active }) => $active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${({ $active }) => $active ? 'var(--secondary)' : 'var(--border)'};
  &:hover { border-color: var(--secondary); }
`;
const Content = styled.div``;
const Loading = styled.p`text-align: center; padding: 40px; color: var(--text-tertiary);`;

const StatsGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  @media(max-width:768px){grid-template-columns: repeat(2,1fr);}`;
const StatCard = styled(Card)`text-align: center; padding: 24px;`;
const StatValue = styled.p`font-size: 32px; font-weight: 800;`;
const StatLabel = styled.p`font-size: 14px; color: var(--text-secondary); margin-top: 4px;`;

const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 14px;
  background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden;`;
const Th = styled.th`padding: 12px 16px; text-align: left; background: var(--bg-tertiary);
  font-weight: 600; color: var(--text-secondary); border-bottom: 1px solid var(--border); white-space: nowrap;`;
const Td = styled.td`padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle;`;

const SmallBtn = styled.button`
  display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px;
  font-size: 12px; font-weight: 600; border-radius: var(--radius-sm);
  background: ${({ $danger }) => $danger ? '#FEE2E2' : 'var(--bg-tertiary)'};
  color: ${({ $danger }) => $danger ? '#991B1B' : 'var(--text-secondary)'};
  &:hover { opacity: 0.8; }
`;
const BtnRow = styled.div`display: flex; gap: 8px;`;
const CardList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const ReportCard = styled(Card)`padding: 20px;`;
const ReportHeader = styled.div`display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
  font-size: 13px; color: var(--text-tertiary);`;
const ReportBody = styled.div`font-size: 14px; line-height: 1.7; p { margin-bottom: 4px; }`;
const ReportActions = styled.div`margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);`;
const FormCard = styled(Card)`padding: 20px; margin-bottom: 16px;`;
const AnswerBox = styled.div`margin-top: 8px; padding: 12px; background: var(--bg-tertiary);
  border-radius: var(--radius-md); font-size: 14px;`;
