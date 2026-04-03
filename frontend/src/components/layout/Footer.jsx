import styled from 'styled-components';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <FooterWrapper>
      <FooterInner>
        <FooterTop>
          <FooterSection>
            <FooterTitle>BidMarket</FooterTitle>
            <FooterText>
              누구나 참여할 수 있는 C2C 경매 플랫폼
            </FooterText>
          </FooterSection>

          <FooterSection>
            <FooterSubTitle>서비스</FooterSubTitle>
            <FooterLink to="/products">경매 상품</FooterLink>
            <FooterLink to="/notices">공지사항</FooterLink>
          </FooterSection>

          <FooterSection>
            <FooterSubTitle>고객센터</FooterSubTitle>
            <FooterLink to="/inquiry">1:1 문의</FooterLink>
            <FooterText>평일 09:00 ~ 18:00</FooterText>
          </FooterSection>
        </FooterTop>

        <FooterBottom>
          <Copyright>© 2026 BidMarket. All rights reserved.</Copyright>
        </FooterBottom>
      </FooterInner>
    </FooterWrapper>
  );
}

export default Footer;

/* ========== Styled ========== */

const FooterWrapper = styled.footer`
  background: var(--secondary);
  color: #94A3B8;
  margin-top: auto;
`;

const FooterInner = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterTop = styled.div`
  display: flex;
  gap: 60px;
  padding: 40px 0 30px;
  border-bottom: 1px solid #334155;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  color: white;
`;

const FooterSubTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #CBD5E1;
  margin-bottom: 4px;
`;

const FooterText = styled.p`
  font-size: 13px;
  line-height: 1.6;
`;

const FooterLink = styled(Link)`
  font-size: 13px;
  color: #94A3B8;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const FooterBottom = styled.div`
  padding: 20px 0;
`;

const Copyright = styled.p`
  font-size: 12px;
  color: #64748B;
`;
