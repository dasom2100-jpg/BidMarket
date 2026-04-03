import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMyInquiries, createInquiry } from '../api/adminApi';
import { Container, Button, Input, TextArea, Card, Badge, SectionTitle } from '../styles/CommonStyles';
import { formatDate } from '../utils/formatters';
import { FiMessageSquare, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi';

function InquiryPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadInquiries();
  }, [isAuthenticated]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const res = await getMyInquiries(0, 30);
      setInquiries(res.data.data.content || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { alert('제목을 입력하세요'); return; }
    if (!form.content.trim()) { alert('내용을 입력하세요'); return; }

    setSubmitting(true);
    try {
      await createInquiry(form);
      alert('문의가 등록되었습니다');
      setForm({ title: '', content: '' });
      setShowForm(false);
      loadInquiries();
    } catch (err) {
      alert(err.response?.data?.message || '문의 등록에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <PageWrapper>
      <Container>
        <Header>
          <SectionTitle>1:1 문의</SectionTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? '취소' : <><FiPlus size={14} /> 문의하기</>}
          </Button>
        </Header>

        {/* 문의 작성 폼 */}
        {showForm && (
          <FormCard>
            <FormTitle>새 문의 작성</FormTitle>
            <FormGroup>
              <Label>제목</Label>
              <Input
                placeholder="문의 제목을 입력하세요"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>내용</Label>
              <TextArea
                placeholder="문의 내용을 자세히 입력하세요"
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </FormGroup>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '등록 중...' : '문의 등록'}
            </Button>
          </FormCard>
        )}

        {/* 문의 목록 */}
        {loading ? (
          <EmptyMsg>불러오는 중...</EmptyMsg>
        ) : inquiries.length === 0 ? (
          <EmptyState>
            <EmptyIcon><FiMessageSquare size={40} /></EmptyIcon>
            <EmptyMsg>등록된 문의가 없습니다</EmptyMsg>
            <EmptyDesc>궁금한 점이 있으면 문의를 남겨주세요</EmptyDesc>
          </EmptyState>
        ) : (
          <InquiryList>
            {inquiries.map((inq) => (
              <InquiryItem key={inq.id}>
                <InquiryHeader onClick={() => toggleExpand(inq.id)}>
                  <InquiryLeft>
                    <Badge variant={inq.status === 'PENDING' ? 'trading' : 'active'}>
                      {inq.status === 'PENDING' ? '대기중' : '답변완료'}
                    </Badge>
                    <InquiryTitle>{inq.title}</InquiryTitle>
                  </InquiryLeft>
                  <InquiryRight>
                    <InquiryDate>{formatDate(inq.createdAt)}</InquiryDate>
                    {expandedId === inq.id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </InquiryRight>
                </InquiryHeader>

                {expandedId === inq.id && (
                  <InquiryBody>
                    <QuestionSection>
                      <SectionLabel>문의 내용</SectionLabel>
                      <ContentText>{inq.content}</ContentText>
                    </QuestionSection>

                    {inq.answer ? (
                      <AnswerSection>
                        <SectionLabel>답변</SectionLabel>
                        <ContentText>{inq.answer}</ContentText>
                        {inq.answeredAt && (
                          <AnswerDate>답변일: {formatDate(inq.answeredAt)}</AnswerDate>
                        )}
                      </AnswerSection>
                    ) : (
                      <WaitingMsg>관리자 답변을 기다리고 있습니다...</WaitingMsg>
                    )}
                  </InquiryBody>
                )}
              </InquiryItem>
            ))}
          </InquiryList>
        )}
      </Container>
    </PageWrapper>
  );
}

export default InquiryPage;

/* ========== Styled ========== */

const PageWrapper = styled.div`
  padding: 30px 0 60px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const FormCard = styled(Card)`
  padding: 24px;
  margin-bottom: 24px;
`;

const FormTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const InquiryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InquiryItem = styled(Card)`
  padding: 0;
  overflow: hidden;
`;

const InquiryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

const InquiryLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const InquiryTitle = styled.span`
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const InquiryRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  color: var(--text-tertiary);
`;

const InquiryDate = styled.span`
  font-size: 13px;
  color: var(--text-tertiary);

  @media (max-width: 640px) {
    display: none;
  }
`;

const InquiryBody = styled.div`
  padding: 0 20px 20px;
  border-top: 1px solid var(--border);
`;

const QuestionSection = styled.div`
  padding: 16px 0;
`;

const AnswerSection = styled.div`
  padding: 16px;
  background: #EEF2FF;
  border-radius: var(--radius-md);
  margin-top: 4px;
`;

const SectionLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  margin-bottom: 8px;
`;

const ContentText = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  white-space: pre-wrap;
`;

const AnswerDate = styled.p`
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 8px;
`;

const WaitingMsg = styled.p`
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-top: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const EmptyIcon = styled.div`
  color: var(--text-tertiary);
  margin-bottom: 16px;
`;

const EmptyMsg = styled.p`
  font-size: 15px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 20px 0;
`;

const EmptyDesc = styled.p`
  font-size: 14px;
  color: var(--text-tertiary);
`;
