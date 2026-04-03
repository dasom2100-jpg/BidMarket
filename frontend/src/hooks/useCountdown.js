import { useState, useEffect } from 'react';

/**
 * 경매 남은 시간 카운트다운 훅
 * @param {string} endTime - 경매 마감 시간 (ISO 문자열)
 * @returns {{ timeLeft: string, isExpired: boolean, urgency: string }}
 */
export function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [urgency, setUrgency] = useState('normal'); // normal, warning, danger

  useEffect(() => {
    if (!endTime) return;

    const calculate = () => {
      const diff = new Date(endTime) - new Date();

      if (diff <= 0) {
        setTimeLeft('경매 종료');
        setIsExpired(true);
        setUrgency('expired');
        return false; // clearInterval 신호
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      // 표시 형식
      if (days > 0) {
        setTimeLeft(`${days}일 ${hours}시간 ${mins}분`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}시간 ${mins}분 ${secs}초`);
      } else {
        setTimeLeft(`${mins}분 ${secs}초`);
      }

      // 긴급도 판단
      if (diff < 3600000) {         // 1시간 미만
        setUrgency('danger');
      } else if (diff < 86400000) { // 24시간 미만
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }

      return true; // 계속 진행
    };

    // 즉시 1번 실행
    const shouldContinue = calculate();
    if (!shouldContinue) return;

    // 1초마다 업데이트
    const timer = setInterval(() => {
      const cont = calculate();
      if (!cont) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return { timeLeft, isExpired, urgency };
}
