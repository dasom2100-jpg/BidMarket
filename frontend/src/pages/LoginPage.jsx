import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { loginUser, clearError } from '../store/authSlice';
import { Button, Input, FormGroup, Label, ErrorText, Card } from '../styles/CommonStyles';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  // 이미 로그인된 경우 홈으로
  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  // 페이지 진입 시 에러 초기화
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    dispatch(loginUser(form));
  };

  return (
    <Wrapper>
      <LoginCard>
        <Title>로그인</Title>
        <SubTitle>BidMarket에 오신 것을 환영합니다</SubTitle>

        <form onSubmit={handleSubmit}>
          {error && <AlertBox>{error}</AlertBox>}

          <FormGroup>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <BottomText>
          아직 계정이 없으신가요? <StyledLink to="/signup">회원가입</StyledLink>
        </BottomText>

        {/* 테스트 계정 안내 */}
        <TestInfo>
          <TestTitle>테스트 계정</TestTitle>
          <TestAccount>
            <span>일반회원: user1@test.com / test1234</span>
            <span>관리자: admin@auction.com / admin1234</span>
          </TestAccount>
        </TestInfo>
      </LoginCard>
    </Wrapper>
  );
}

export default LoginPage;

/* ========== Styled ========== */

const Wrapper = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 420px;
  padding: 40px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
`;

const SubTitle = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 32px;
`;

const AlertBox = styled.div`
  padding: 12px 16px;
  background: #FEE2E2;
  color: #991B1B;
  font-size: 14px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
`;

const BottomText = styled.p`
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 24px;
`;

const StyledLink = styled(Link)`
  color: var(--primary);
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const TestInfo = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
`;

const TestTitle = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const TestAccount = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
`;
