import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* === Reset === */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* === Root Variables === */
  :root {
    --primary: #4F46E5;
    --primary-hover: #4338CA;
    --primary-light: #EEF2FF;
    --secondary: #0F172A;
    --accent: #F59E0B;
    --accent-hover: #D97706;
    --success: #10B981;
    --danger: #EF4444;
    --danger-hover: #DC2626;
    --warning: #F59E0B;
    --info: #3B82F6;

    --bg-primary: #FFFFFF;
    --bg-secondary: #F8FAFC;
    --bg-tertiary: #F1F5F9;

    --text-primary: #0F172A;
    --text-secondary: #475569;
    --text-tertiary: #94A3B8;
    --text-inverse: #FFFFFF;

    --border: #E2E8F0;
    --border-hover: #CBD5E1;

    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);

    --max-width: 1200px;
    --header-height: 64px;
  }

  /* === Base === */
  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont,
      'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: var(--text-primary);
    background-color: var(--bg-secondary);
    line-height: 1.6;
    min-height: 100vh;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
    display: block;
  }

  ul, ol {
    list-style: none;
  }

  /* === 유틸리티 === */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
  }
`;

export default GlobalStyle;
