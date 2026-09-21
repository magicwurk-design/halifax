// Credentials — NEXT_PUBLIC_ vars are inlined at build time by Next.js
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'admin@halifaxbanking.co.uk';
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'HalifaxSecure2026!';
export const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? '246810';

export const ADMIN_SESSION_KEY = 'halifax_admin_session_v1';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

export interface AdminSession {
  email: string;
  loggedInAt: string;
  expiresAt: string;
}

export function isAdminCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
}

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function saveAdminSession(): void {
  if (typeof window === 'undefined') return;
  const now = new Date();
  const session: AdminSession = {
    email: ADMIN_EMAIL,
    loggedInAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  };
  try { localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
}

export function loadAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    if (!session.expiresAt || new Date() > new Date(session.expiresAt)) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch { return null; }
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* ignore */ }
}

// ─── Client Session ────────────────────────────────────────────────────────
export const CLIENT_SESSION_KEY = 'halifax_client_session_v1';

export interface ClientSession {
  subAccountId: string;
  email: string;
  loggedInAt: string;
  expiresAt: string;
}

export function saveClientSession(subAccountId: string, email: string): void {
  if (typeof window === 'undefined') return;
  const now = new Date();
  const session: ClientSession = {
    subAccountId,
    email,
    loggedInAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
  };
  try { localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
}

export function loadClientSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLIENT_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ClientSession;
    if (!session.expiresAt || new Date() > new Date(session.expiresAt)) {
      clearClientSession();
      return null;
    }
    return session;
  } catch { return null; }
}

export function clearClientSession(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(CLIENT_SESSION_KEY); } catch { /* ignore */ }
}
