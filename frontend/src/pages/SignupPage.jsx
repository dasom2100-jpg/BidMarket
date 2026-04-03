import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { signupUser, clearError } from '../store/authSlice';
import { checkEmail, checkNickname } from '../api/authApi';
import {
  Button, Input, FormGroup, Label, ErrorText, Card
} from '../styles/CommonStyles';

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '', password: '', passwordConfirm: '',
    nickname: '', phone: '', zipcode: '',
    address: '', addressDetail: '',
  });

  const [checks, setChecks] = useState({
    email: null,       // null=미확인, true=사용가능, false=중복
    nickname: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // 입력 변경 시 중복확인 초기화
    if (name === 'email') setChecks((c) => ({ ...c, email: null }));
    if (name === 'nickname') setChecks((c) => ({ ...c, nickname: null }));
  };

  /** 이메일 중복확인 */
  const handleCheckEmail = async () => {
    if (!form.email) return;
    try {
      const res = await checkEmail(form.email);
      const exists = res.data.data;
      setChecks((c) => ({ ...c, email: !exists }));
    } catch {
      setChecks((c) => ({ ...c, email: false }));
    }
  };

  /** 닉네임 중복확인 */
  const handleCheckNickname = async () => {
    if (!form.nickname) return;
    try {
      const res = await checkNickname(form.nickname);
      const exists = res.data.data;
      setChecks((c) => ({ ...c, nickname: !exists }));
    } catch {
      setChecks((c) => ({ ...c, nickname: false }));
    }
  };

  /** 폼 유효성 검사 */
  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = '이메일을 입력하세요';
    if (checks.email !== true) newErrors.email = '이메일 중복확인을 해주세요';
    if (!form.password || form.password.length < 8)
      newErrors.password = '비밀번호는 8자 이상입니다';
    if (form.password !== form.passwordConfirm)
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    if (!form.nickname) newErrors.nickname = '닉네임을 입력하세요';
    if (checks.nickname !== true) newErrors.nickname = '닉네임 중복확인을 해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(signupUser({
      email: form.email,
      password: form.password,
      nickname: form.nickname,
      phone: form.phone,
      zipcode: form.zipcode,
      address: form.address,
      addressDetail: form.addressDetail,
    }));

    if (signupUser.fulfilled.match(result)) {
      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      navigate('/login');
    }
  };

  return (
    <Wrapper>
      <SignupCard>
        <Title>회원가입</Title>
        <SubTitle>BidMarket에서 경매를 시작하세요</SubTitle>

        <form onSubmit={handleSubmit}>
          {error && <AlertBox>{error}</AlertBox>}

          {/* 이메일 */}
          <FormGroup>
            <Label>이메일 *</Label>
            <InputRow>
              <Input
                name="email" type="email"
                placeholder="example@email.com"
                value={form.email} onChange={handleChange}
              />
              <CheckBtn type="button" onClick={handleCheckEmail}>중복확인</CheckBtn>
            </InputRow>
            {checks.email === true && <SuccessText>사용 가능한 이메일입니다</SuccessText>}
            {checks.email === false && <ErrorText>이미 사용중인 이메일입니다</ErrorText>}
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </FormGroup>

          {/* 비밀번호 */}
          <FormGroup>
            <Label>비밀번호 *</Label>
            <Input
              name="password" type="password"
              placeholder="8자 이상 입력하세요"
              value={form.password} onChange={handleChange}
            />
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>비밀번호 확인 *</Label>
            <Input
              name="passwordConfirm" type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm} onChange={handleChange}
            />
            {errors.passwordConfirm && <ErrorText>{errors.passwordConfirm}</ErrorText>}
          </FormGroup>

          {/* 닉네임 */}
          <FormGroup>
            <Label>닉네임 *</Label>
            <InputRow>
              <Input
                name="nickname"
                placeholder="2~15자"
                value={form.nickname} onChange={handleChange}
              />
              <CheckBtn type="button" onClick={handleCheckNickname}>중복확인</CheckBtn>
            </InputRow>
            {checks.nickname === true && <SuccessText>사용 가능한 닉네임입니다</SuccessText>}
            {checks.nickname === false && <ErrorText>이미 사용중인 닉네임입니다</ErrorText>}
            {errors.nickname && <ErrorText>{errors.nickname}</ErrorText>}
          </FormGroup>

          {/* 전화번호 */}
          <FormGroup>
            <Label>전화번호</Label>
            <Input
              name="phone" type="tel"
              placeholder="010-0000-0000"
              value={form.phone} onChange={handleChange}
            />
          </FormGroup>

          {/* 주소 */}
          <FormGroup>
            <Label>우편번호</Label>
            <Input
              name="zipcode"
              placeholder="우편번호"
              value={form.zipcode} onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>주소</Label>
            <Input
              name="address"
              placeholder="주소를 입력하세요"
              value={form.address} onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>상세주소</Label>
            <Input
              name="addressDetail"
              placeholder="상세주소를 입력하세요"
              value={form.addressDetail} onChange={handleChange}
            />
          </FormGroup>

          <Button type="submit" fullWidth disabled={loading} style={{ marginTop: 8 }}>
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <BottomText>
          이미 계정이 있으신가요? <StyledLink to="/login">로그인</StyledLink>
        </BottomText>
      </SignupCard>
    </Wrapper>
  );
}

export default SignupPage;

/* ========== Styled ========== */

const Wrapper = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
`;

const SignupCard = styled(Card)`
  width: 100%;
  max-width: 480px;
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

const InputRow = styled.div`
  display: flex;
  gap: 8px;
`;

const CheckBtn = styled.button`
  flex-shrink: 0;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--primary);
    color: var(--primary);
  }
`;

const SuccessText = styled.p`
  font-size: 13px;
  color: var(--success);
  margin-top: 4px;
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
  &:hover { text-decoration: underline; }
`;
