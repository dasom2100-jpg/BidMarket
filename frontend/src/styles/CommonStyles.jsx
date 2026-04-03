import styled, { css } from 'styled-components';

/* ========== Layout ========== */

export const Container = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
`;

export const PageWrapper = styled.div`
  min-height: calc(100vh - var(--header-height) - 200px);
  padding: 40px 0;
`;

export const FlexRow = styled.div.withConfig({
  shouldForwardProp: (prop) => !['align', 'justify', 'gap', 'wrap'].includes(prop),
})`
  display: flex;
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap }) => gap || '12px'};
  flex-wrap: ${({ wrap }) => wrap || 'nowrap'};
`;

export const Grid = styled.div.withConfig({
  shouldForwardProp: (prop) => !['cols', 'gap'].includes(prop),
})`
  display: grid;
  grid-template-columns: repeat(${({ cols }) => cols || 4}, 1fr);
  gap: ${({ gap }) => gap || '20px'};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

/* ========== Button ========== */

const buttonVariants = {
  primary: css`
    background: var(--primary);
    color: var(--text-inverse);
    &:hover:not(:disabled) { background: var(--primary-hover); }
  `,
  secondary: css`
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    &:hover:not(:disabled) {
      background: var(--bg-tertiary);
      border-color: var(--border-hover);
    }
  `,
  danger: css`
    background: var(--danger);
    color: var(--text-inverse);
    &:hover:not(:disabled) { background: var(--danger-hover); }
  `,
  accent: css`
    background: var(--accent);
    color: var(--text-inverse);
    &:hover:not(:disabled) { background: var(--accent-hover); }
  `,
};

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant', 'fullWidth', 'size'].includes(prop),
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ size }) => size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px'};
  font-size: ${({ size }) => size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px'};
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all 0.2s;
  white-space: nowrap;

  ${({ variant }) => buttonVariants[variant || 'primary']}

  ${({ fullWidth }) => fullWidth && css`width: 100%;`}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* ========== Input ========== */

export const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &::placeholder {
    color: var(--text-tertiary);
  }

  &:disabled {
    background: var(--bg-tertiary);
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;

  &:focus {
    border-color: var(--primary);
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const ErrorText = styled.p`
  font-size: 13px;
  color: var(--danger);
  margin-top: 4px;
`;

/* ========== Card ========== */

export const Card = styled.div.withConfig({
  shouldForwardProp: (prop) => !['hoverable', 'padding'].includes(prop),
})`
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: ${({ padding }) => padding || '24px'};
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;

  ${({ hoverable }) => hoverable && css`
    &:hover {
      box-shadow: var(--shadow-md);
    }
  `}
`;

/* ========== Badge ========== */

const badgeColors = {
  active:    css`background: #DCFCE7; color: #166534;`,
  sold:      css`background: #DBEAFE; color: #1E40AF;`,
  failed:    css`background: #FEE2E2; color: #991B1B;`,
  trading:   css`background: #FEF3C7; color: #92400E;`,
  completed: css`background: #E0E7FF; color: #3730A3;`,
  cancelled: css`background: #F1F5F9; color: #475569;`,
  best:      css`background: #DCFCE7; color: #166534;`,
  good:      css`background: #DBEAFE; color: #1E40AF;`,
  fair:      css`background: #FEF3C7; color: #92400E;`,
};

export const Badge = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'variant',
})`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  white-space: nowrap;
  ${({ variant }) => badgeColors[variant] || badgeColors.active}
`;

/* ========== Divider ========== */

export const Divider = styled.hr.withConfig({
  shouldForwardProp: (prop) => prop !== 'margin',
})`
  border: none;
  border-top: 1px solid var(--border);
  margin: ${({ margin }) => margin || '24px 0'};
`;

/* ========== Section Title ========== */

export const SectionTitle = styled.h2.withConfig({
  shouldForwardProp: (prop) => prop !== 'size',
})`
  font-size: ${({ size }) => size || '22px'};
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
`;
