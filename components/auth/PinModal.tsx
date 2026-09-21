'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, X } from 'lucide-react';
import { ADMIN_PIN } from '@/lib/auth';
import { getAvatarPalette } from '@/lib/mockData';

interface PinModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  mode?: 'verify' | 'create';
  pin?: string;
  onPinCreated?: (pin: string) => void;
  title?: string;
  subtitle?: string;
  profilePhoto?: string;  // base64 data URL
  accountId?: string;     // for NFT avatar fallback
  accountName?: string;   // for NFT avatar initials
}

const PIN_LENGTH = 6;
const MAX_ATTEMPTS = 4;
const LOCKOUT_SECONDS = 30;

// Persists lockout state across modal open/close cycles keyed by accountId.
// Using a module-level Map means useState reset on unmount cannot bypass the lockout.
const lockoutStore = new Map<string, { lockedUntil: number; attempts: number }>();

function getLockoutKey(accountId?: string) {
  return accountId ?? '__admin__';
}

function getStoredAttempts(accountId?: string) {
  return lockoutStore.get(getLockoutKey(accountId))?.attempts ?? 0;
}

function getLockedUntil(accountId?: string) {
  return lockoutStore.get(getLockoutKey(accountId))?.lockedUntil ?? 0;
}

function setLockoutState(accountId: string | undefined, attempts: number, lockedUntil: number) {
  lockoutStore.set(getLockoutKey(accountId), { attempts, lockedUntil });
}

// ─── Shared dial pad ──────────────────────────────────────────────────────────
const DIAL_PAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', 'del'],
] as const;

function DialPad({ onDigit, onDelete, disabled }: { onDigit: (d: string) => void; onDelete: () => void; disabled?: boolean }) {
  return (
    <div className="px-5 pb-4">
      <div className="grid grid-cols-3 gap-2.5">
        {DIAL_PAD.flat().map((key, idx) => {
          if (key === '') return <div key={idx} aria-hidden="true" />;
          if (key === 'del') {
            return (
              <button key={idx} onClick={onDelete} disabled={disabled} aria-label="Delete last digit"
                className="h-14 rounded-2xl flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 active:scale-95 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed">
                <Delete size={20} />
              </button>
            );
          }
          return (
            <button key={idx} onClick={() => onDigit(key)} disabled={disabled} aria-label={`Digit ${key}`}
              className="h-14 rounded-2xl font-bold text-xl text-white/80 active:scale-95 transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed" style={{ background:'rgba(29,110,245,0.08)', border:'1px solid rgba(29,110,245,0.18)' }}>
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PIN dots ─────────────────────────────────────────────────────────────────
function PinDots({ filled, success }: { filled: number; success?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-4" role="status" aria-label={`${filled} of ${PIN_LENGTH} digits entered`}>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => {
        const isFilled = i < filled;
        const isActive = i === filled && !success;
        return (
          <div key={i} className={[
            'w-4 h-4 rounded-full border-2 transition-all duration-150',
            success    ? 'bg-emerald-500 border-emerald-500 scale-110'
            : isFilled ? 'bg-blue-600 border-blue-600 scale-105'
            : isActive  ? 'border-blue-400 bg-transparent animate-pulse'
            :             'border-slate-300 bg-transparent',
          ].join(' ')} />
        );
      })}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
function ModalShell({ onCancel, shake, success, title, headerSubtitle, children, profilePhoto, accountId, accountName }: {
  onCancel: () => void; shake: boolean; success: boolean;
  title: string; headerSubtitle: string; children: React.ReactNode;
  profilePhoto?: string; accountId?: string; accountName?: string;
}) {
  const palette = getAvatarPalette(accountId ?? 'default');
  const initials = accountName ? accountName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '••';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-navy/80 backdrop-blur-md" onClick={onCancel} />
      <div
        className={['relative rounded-3xl shadow-2xl w-full max-w-xs mx-4 overflow-hidden select-none', shake ? 'animate-pin-shake' : '', success ? 'animate-pin-success' : ''].join(' ')}
        style={{ willChange: 'transform', background: 'rgba(17,24,39,0.98)', backdropFilter: 'blur(24px)', border: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="px-6 pt-8 pb-6 text-center relative" style={{ background:"linear-gradient(135deg,#071330 0%,#0f2867 50%,#1558d6 100%)" }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <button onClick={onCancel} className="absolute top-4 right-4 text-blue-300 hover:text-white transition-colors" aria-label="Cancel" tabIndex={-1}>
            <X size={18} />
          </button>
          {/* Profile photo / NFT avatar */}
          <div className={['w-16 h-16 rounded-2xl mx-auto mb-3 overflow-hidden transition-all duration-300', success ? 'scale-110 ring-2 ring-emerald-400' : ''].join(' ')}
            style={{ border: `2px solid ${palette.accent}50` }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt={accountName ?? ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-white text-lg"
                style={{ background: palette.bg }}>
                {initials}
              </div>
            )}
          </div>
          <h2 className="text-white font-bold text-lg tracking-tight">{title}</h2>
          <p className="text-blue-200 text-xs mt-0.5">{headerSubtitle}</p>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes pin-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-6px)} 60%{transform:translateX(6px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
        @keyframes pin-success { 0%{transform:scale(1)} 50%{transform:scale(1.03)} 100%{transform:scale(1)} }
        .animate-pin-shake { animation: pin-shake 0.6s ease-in-out; }
        .animate-pin-success { animation: pin-success 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}

// ─── Verify mode ──────────────────────────────────────────────────────────────
function VerifyPin({ expectedPin, onSuccess, onCancel, title, subtitle, profilePhoto, accountId, accountName }: {
  expectedPin: string; onSuccess: () => void; onCancel: () => void; title: string; subtitle?: string;
  profilePhoto?: string; accountId?: string; accountName?: string;
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  // Initialise from persistent store so closing/reopening doesn't reset the lockout
  const nowMs = Date.now();
  const storedLockedUntil = getLockedUntil(accountId);
  const initialLocked = storedLockedUntil > nowMs;
  const initialCountdown = initialLocked ? Math.ceil((storedLockedUntil - nowMs) / 1000) : 0;
  const initialAttempts = getStoredAttempts(accountId);

  const [attempts, setAttempts] = useState(initialAttempts);
  const [locked, setLocked] = useState(initialLocked);
  const [lockCountdown, setLockCountdown] = useState(initialCountdown);
  const [success, setSuccess] = useState(false);
  const attemptsRef = useRef(initialAttempts);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => { if (timerRef.current !== null) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const unlock = useCallback(() => {
    clearTimer();
    setLocked(false);
    setAttempts(0);
    attemptsRef.current = 0;
    setError('');
    setLockCountdown(0);
    setLockoutState(accountId, 0, 0);
  }, [clearTimer, accountId]);

  // Start countdown when locked becomes true, or resume if already locked on mount
  useEffect(() => {
    if (!locked) return;
    clearTimer();
    const remaining = Math.ceil((getLockedUntil(accountId) - Date.now()) / 1000);
    if (remaining <= 0) { unlock(); return; }
    setLockCountdown(remaining);
    timerRef.current = setInterval(() => {
      setLockCountdown((c) => {
        if (c <= 1) { unlock(); return 0; }
        return c - 1;
      });
    }, 1000);
    return clearTimer;
  }, [locked, clearTimer, unlock, accountId]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const triggerShake = useCallback(() => { setShake(true); setTimeout(() => setShake(false), 600); }, []);

  const verify = useCallback((entered: string) => {
    if (entered === expectedPin) { setSuccess(true); setTimeout(onSuccess, 700); return; }
    const next = attemptsRef.current + 1;
    attemptsRef.current = next;
    setAttempts(next);
    setPin('');
    if (next >= MAX_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
      setLockoutState(accountId, next, lockedUntil);
      setLocked(true);
    } else {
      setLockoutState(accountId, next, 0);
      const r = MAX_ATTEMPTS - next;
      setError(`Incorrect PIN. ${r} attempt${r === 1 ? '' : 's'} remaining.`);
      triggerShake();
    }
  }, [expectedPin, onSuccess, triggerShake, accountId]);

  const handleDigit = useCallback((digit: string) => {
    if (locked || success) return;
    setError('');
    setPin((prev) => { if (prev.length >= PIN_LENGTH) return prev; const next = prev + digit; if (next.length === PIN_LENGTH) setTimeout(() => verify(next), 120); return next; });
  }, [locked, success, verify]);

  const handleDelete = useCallback(() => { if (locked || success) return; setError(''); setPin((p) => p.slice(0, -1)); }, [locked, success]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (/^[0-9]$/.test(e.key)) handleDigit(e.key); else if (e.key === 'Backspace') handleDelete(); else if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit, handleDelete, onCancel]);

  return (
    <ModalShell onCancel={onCancel} shake={shake} success={success} title={title}
      profilePhoto={profilePhoto} accountId={accountId} accountName={accountName}
      headerSubtitle={success ? 'Verified — signing you in…' : locked ? 'Too many incorrect attempts' : subtitle ?? 'Enter your 6-digit PIN'}>
      <div className="px-6 pt-6 pb-2">
        <PinDots filled={pin.length} success={success} />
        <div className="h-8 flex items-center justify-center" aria-live="assertive" aria-atomic="true">
          {locked ? <p className="text-red-500 text-xs font-semibold">🔒 Locked — retry in {lockCountdown}s</p>
            : error ? <p className="text-red-500 text-xs font-medium">{error}</p> : null}
        </div>
      </div>
      <DialPad onDigit={handleDigit} onDelete={handleDelete} disabled={locked || success} />
      {!locked && !success && attempts > 0 && (
        <div className="flex justify-center gap-1.5 pb-5" aria-hidden="true">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i < attempts ? 'bg-red-400' : 'bg-slate-200'}`} />
          ))}
        </div>
      )}
      {(locked || success || attempts === 0) && <div className="pb-2" />}
    </ModalShell>
  );
}

// ─── Create mode ──────────────────────────────────────────────────────────────
type CreateStep = 'enter' | 'confirm';

function CreatePin({ onPinCreated, onCancel, title, subtitle, profilePhoto, accountId, accountName }: {
  onPinCreated: (pin: string) => void; onCancel: () => void; title: string; subtitle?: string;
  profilePhoto?: string; accountId?: string; accountName?: string;
}) {
  const [step, setStep] = useState<CreateStep>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const triggerShake = useCallback(() => { setShake(true); setTimeout(() => setShake(false), 600); }, []);

  const handleDigit = useCallback((digit: string) => {
    if (success) return;
    setError('');
    setPin((prev) => {
      if (prev.length >= PIN_LENGTH) return prev;
      const next = prev + digit;
      if (next.length === PIN_LENGTH) {
        setTimeout(() => {
          if (step === 'enter') {
            setFirstPin(next);
            setPin('');
            setStep('confirm');
          } else {
            if (next === firstPin) {
              setSuccess(true);
              setTimeout(() => onPinCreated(next), 700);
            } else {
              setPin('');
              setError("PINs don't match. Try again.");
              triggerShake();
              setTimeout(() => { setStep('enter'); setFirstPin(''); setError(''); }, 1400);
            }
          }
        }, 120);
      }
      return next;
    });
  }, [success, step, firstPin, onPinCreated, triggerShake]);

  const handleDelete = useCallback(() => { if (success) return; setError(''); setPin((p) => p.slice(0, -1)); }, [success]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (/^[0-9]$/.test(e.key)) handleDigit(e.key); else if (e.key === 'Backspace') handleDelete(); else if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDigit, handleDelete, onCancel]);

  return (
    <ModalShell onCancel={onCancel} shake={shake} success={success} title={title}
      profilePhoto={profilePhoto} accountId={accountId} accountName={accountName}
      headerSubtitle={success ? 'PIN created — signing you in…' : subtitle ?? 'Choose a 6-digit PIN for your account'}>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-5 px-6">
        {(['enter', 'confirm'] as CreateStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300',
              step === s && !success ? 'text-navy scale-110'
              : (s === 'enter' && (step === 'confirm' || success)) || (s === 'confirm' && success) ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-400',
            ].join(' ')}>
              {i + 1}
            </div>
            {i === 0 && <div className={`w-8 h-0.5 rounded transition-all duration-500 ${step === 'confirm' || success ? 'bg-blue-bright/50' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <div className="px-6 pt-3 pb-1 text-center">
        <p className="text-white/75 text-sm font-semibold">
          {success ? 'All done!' : step === 'enter' ? 'Choose a PIN' : 'Confirm your PIN'}
        </p>
        <p className="text-white/30 text-xs mt-0.5">
          {success ? 'Entering your account…'
            : step === 'enter' ? "You'll confirm it in the next step"
            : 'Re-enter the same PIN to confirm'}
        </p>
      </div>

      <div className="px-6 pt-3 pb-2">
        <PinDots filled={pin.length} success={success} />
        <div className="h-8 flex items-center justify-center" aria-live="assertive" aria-atomic="true">
          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
        </div>
      </div>

      <DialPad onDigit={handleDigit} onDelete={handleDelete} disabled={success} />
      <div className="pb-2" />
    </ModalShell>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function PinModal({ open, onSuccess, onCancel, mode = 'verify', pin, onPinCreated, title, subtitle, profilePhoto, accountId, accountName }: PinModalProps) {
  if (!open) return null;

  if (mode === 'create') {
    return (
      <CreatePin
        onPinCreated={(newPin) => { onPinCreated?.(newPin); onSuccess(); }}
        onCancel={onCancel}
        title={title ?? 'Create Your PIN'}
        subtitle={subtitle}
        profilePhoto={profilePhoto}
        accountId={accountId}
        accountName={accountName}
      />
    );
  }

  return (
    <VerifyPin
      expectedPin={pin ?? ADMIN_PIN}
      onSuccess={onSuccess}
      onCancel={onCancel}
      title={title ?? 'Security PIN'}
      subtitle={subtitle}
      profilePhoto={profilePhoto}
      accountId={accountId}
      accountName={accountName}
    />
  );
}
