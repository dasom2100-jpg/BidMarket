import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyInfo } from './store/authSlice';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductRegisterPage from './pages/ProductRegisterPage';
import MyPage from './pages/MyPage';
import TradePage from './pages/TradePage';
import NotificationPage from './pages/NotificationPage';

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  // 앱 시작 시 토큰이 있으면 자동으로 내 정보 조회
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMyInfo());
    }
  }, [dispatch, token, user]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductRegisterPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/trades/:tradeId" element={<TradePage />} />
          <Route path="/notifications" element={<NotificationPage />} />

          {/* Step 5에서 추가: 관리자 페이지 */}
          {/* <Route path="/admin/*" element={<AdminPage />} /> */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/** 404 페이지 */
function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', gap: '12px',
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-tertiary)' }}>404</h1>
      <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
        페이지를 찾을 수 없습니다
      </p>
      <a href="/" style={{
        padding: '10px 20px', background: 'var(--primary)',
        color: 'white', borderRadius: 'var(--radius-md)',
        fontWeight: 600, marginTop: '8px',
      }}>
        홈으로 돌아가기
      </a>
    </div>
  );
}

export default App;
