import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { logout } from '../../store/authSlice';
import { getUnreadCount } from '../../api/notificationApi';
import { FiSearch, FiUser, FiBell, FiLogOut, FiPlusCircle } from 'react-icons/fi';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);

  // 로그인 상태일 때 읽지 않은 알림 수 조회 (30초 간격 polling)
  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }

    const fetchCount = async () => {
      try {
        const res = await getUnreadCount();
        setUnreadCount(res.data.data.count || 0);
      } catch { /* ignore */ }
    };

    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <HeaderWrapper>
      <HeaderInner>
        {/* 로고 */}
        <Logo to="/">
          <LogoIcon><Highlight>B</Highlight></LogoIcon>
          Bid
          <BingM>M</BingM>
         arket
        </Logo>

        {/* 네비게이션 */}
        <Nav>
          <NavLink to="/products">경매 상품</NavLink>
          <NavLink to="/notices">공지사항</NavLink>
        </Nav>

        {/* 오른쪽 영역 */}
        <RightSection>
          {isAuthenticated ? (
            <>
              <IconButton to="/products/new" title="상품 등록">
                <FiPlusCircle size={20} />
              </IconButton>
              <NotiWrapper to="/notifications" title="알림">
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <NotiBadge>{unreadCount > 99 ? '99+' : unreadCount}</NotiBadge>
                )}
              </NotiWrapper>
              <UserMenu>
                <IconButton to="/mypage" title="마이페이지">
                  <FiUser size={20} />
                </IconButton>
                <UserName to="/mypage">{user?.nickname || '사용자'}</UserName>
              </UserMenu>
              {user?.role === 'ADMIN' && (
                <AdminLink to="/admin">관리자</AdminLink>
              )}
              <LogoutBtn onClick={handleLogout} title="로그아웃">
                <FiLogOut size={24} />
              </LogoutBtn>
            </>
          ) : (
            <>
              <AuthLink to="/login">로그인</AuthLink>
              <SignupLink to="/signup">회원가입</SignupLink>
            </>
          )}
        </RightSection>
      </HeaderInner>
    </HeaderWrapper>
  );
}

export default Header;

/* ========== Styled ========== */

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  height: var(--header-height);
`;

const HeaderInner = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  flex-shrink: 0;
`;

const LogoIcon = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
   margin-right: 8px;
  border-radius: var(--radius-md);
  background: linear-gradient(0.31turn, var(--primary), #1907f8, #bfc8da);
  position: relative;
  
  &::before {
    content: " ";
    position: absolute;
    left: -60%;
    top: -36%;
    width: 120%;
    height: 120%;
    background: linear-gradient(120deg, #f59e0b 30%, #f1ac37c4 51%, #4f46e582 80%);
    border-radius: 15px 15px 25px 15px;
    animation:shine 5s linear infinite;
  }

  @keyframes shine {
    0% {
      transform: rotate(0deg) ;
      opacity: 0.3;
    }
    50% {
      transform: rotate(180deg) ;
      opacity: 1;
    }
    100% {
      transform: rotate(359deg) ;
      opacity: 0.3;
    }
  }     
`;

const BingM = styled.span`
  color: #10b981;
  font-weight: 800;
  font-size: 33px;
  margin: 0 0 0 2px;
  display: inline-block;
  transform: translateY(-5px);
  background: linear-gradient(45deg, #1907f8, #4f46e5, #d7e0fe70);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Highlight = styled.em`
  font-style: normal;
    color: #fdfdfd;
    font-weight: 800;
    font-size: 27px;
    position: absolute;
    top: 21%;
    left: 16%;
    line-height: 20px;
    transform: skew(2deg, 349deg);
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s;

  &:hover {
    color: var(--primary);
    background: var(--primary-light);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--primary);
  }
`;

const NotiWrapper = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--primary);
  }
`;

const NotiBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 0px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: #EF4444;
  border-radius: 10px;
  border: 2px solid var(--bg-primary);
  line-height: 1;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserName = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);

  &:hover {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const AdminLink = styled(Link)`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--secondary);
  color: var(--text-inverse);
  border-radius: var(--radius-sm);
`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  background: none;
  transition: all 0.2s;

  &:hover {
    background: #FEE2E2;
    color: var(--danger);
  }
`;

const AuthLink = styled(Link)`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-md);

  &:hover {
    color: var(--primary);
    background: var(--primary-light);
  }
`;

const SignupLink = styled(Link)`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: var(--radius-md);
  transition: background 0.2s;

  &:hover {
    background: var(--primary-hover);
  }
`;
