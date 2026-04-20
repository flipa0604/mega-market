import { useMemo } from 'react';

function getQueryTgId() {
  if (typeof window === 'undefined') return null;
  const p = new URLSearchParams(window.location.search).get('tg_id');
  if (!p) return null;
  const n = parseInt(p, 10);
  return Number.isFinite(n) ? n : null;
}

export function useTelegramUserId() {
  return useMemo(() => {
    const w = typeof window !== 'undefined' ? window : null;
    const tw = w?.Telegram?.WebApp;
    const fromTg = tw?.initDataUnsafe?.user?.id;
    if (fromTg) return fromTg;
    return getQueryTgId();
  }, []);
}

export function useTelegramWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
}
