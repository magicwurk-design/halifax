'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PinModal } from '@/components/auth/PinModal';
import { AccountBlockedModal } from '@/components/dashboard/AccountBlockedModal';
import { SubAccount } from '@/lib/types';

type LoginStep = 'credentials' | 'pin';

export default function ClientLoginPage() {
  const { state, isHydrated, isClientLoggedIn, isAdmin, clientLogin } = useApp();
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedAccount, setMatchedAccount] = useState<SubAccount | null>(null);
  const [showBlocked, setShowBlocked] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAdmin) { router.replace('/admin/dashboard'); return; }
    if (isClientLoggedIn) { router.replace('/dashboard'); }
  }, [isHydrated, isAdmin, isClientLoggedIn, router]);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const match = state.subAccounts.find(
      (sa) =>
        sa.user.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        sa.password === password
    );

    setLoading(false);

    if (!match) {
      setError('Invalid email or password. Please try again.');
      return;
    }

    if (match.isBlocked) {
      setMatchedAccount(match);
      setShowBlocked(true);
      return;
    }

    setMatchedAccount(match);
    setStep('pin');
  };

  const handlePinSuccess = () => {
    if (!matchedAccount) return;
    clientLogin(matchedAccount.id, matchedAccount.user.email);
    router.push('/dashboard');
  };

  const handlePinCancel = () => {
    setStep('credentials');
    setMatchedAccount(null);
    setError('');
  };

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-navy">
        <Image src="/logo.svg" alt="Halifax" width={110} height={44}
          className="h-11 w-auto object-contain opacity-80" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex bg-navy relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle,#2979ff 0%,transparent 65%)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle,#1d6ef5 0%,transparent 65%)', filter: 'blur(40px)' }} />
        </div>

        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-[50%] relative p-14 flex-col justify-between border-r"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,rgba(29,110,245,0.06) 0%,transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-20">
              <Image src="/logo.svg" alt="Halifax" width={110} height={44}
                className="h-11 w-auto object-contain opacity-90" />
              <div className="h-5 w-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.30)' }}>Private Banking</span>
            </div>
            <div className="space-y-5 max-w-md">
              <p className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(29,110,245,0.75)' }}>Client Portal</p>
              <h1 className="text-5xl font-light leading-tight tracking-tight"
                style={{ color: 'rgba(255,255,255,0.92)' }}>
                Your money.<br />
                <span className="font-semibold text-white">Your control.</span>
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.30)' }}>
                Access your private banking dashboard — view balances, send money, and manage your account securely.
              </p>
            </div>
          </div>
          <div className="relative z-10 space-y-3">
            {[
              { emoji: '💳', title: 'Real-time balances', desc: 'Live account data, always up to date' },
              { emoji: '↔️', title: 'Instant transfers', desc: 'Send funds securely in seconds' },
              { emoji: '🔒', title: 'Bank-grade security', desc: 'PIN + password protected access' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-center gap-4 glass rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: 'rgba(29,110,245,0.10)', border: '1px solid rgba(29,110,245,0.20)' }}>
                  {emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.72)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — login form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="lg:hidden flex items-center gap-3">
              <Image src="/logo.svg" alt="Halifax" width={90} height={36}
                className="h-9 w-auto object-contain opacity-90" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.90)' }}>Welcome back</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {step === 'credentials' ? 'Sign in to your private banking account' : 'Enter your PIN to complete sign-in'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full transition-all" style={{ background: '#2979ff' }} />
                  <div className="w-8 h-0.5 rounded transition-all" style={{ background: step === 'pin' ? 'rgba(100,160,255,0.5)' : 'rgba(255,255,255,0.08)' }} />
                  <div className="w-2 h-2 rounded-full transition-all" style={{ background: step === 'pin' ? '#2979ff' : 'rgba(255,255,255,0.12)' }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  Step {step === 'credentials' ? '1' : '2'} of 2
                </span>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-8 space-y-5">
              <form onSubmit={handleCredentials} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.32)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(29,110,245,0.6)' }} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" autoComplete="email"
                      disabled={step === 'pin'}
                      className="glass-input w-full h-12 pl-11 pr-4 rounded-xl text-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.32)' }}>Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: 'rgba(29,110,245,0.6)' }} />
                    <input
                      type={showPw ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      autoComplete="current-password" disabled={step === 'pin'}
                      className="glass-input w-full h-12 pl-11 pr-12 rounded-xl text-sm disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.20)' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm text-center"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#fca5a5' }}>
                    {error}
                  </div>
                )}

                {step === 'credentials' && (
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                    {loading
                      ? <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                          </svg>
                          Verifying...
                        </span>
                      : <>Continue <ArrowRight size={16} /></>
                    }
                  </button>
                )}

                {step === 'pin' && (
                  <button type="button" onClick={handlePinCancel}
                    className="w-full h-10 rounded-xl text-xs font-semibold transition-colors"
                    style={{ color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    ← Back to credentials
                  </button>
                )}
              </form>
            </div>

            <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.14)' }}>
              Halifax Private Banking &copy; {new Date().getFullYear()} &mdash; Strictly Confidential
            </p>
            <div className="flex justify-center">
              <a href="/admin/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.10)'; (e.currentTarget as HTMLAnchorElement).style.color='rgba(255,255,255,0.70)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.06)'; (e.currentTarget as HTMLAnchorElement).style.color='rgba(255,255,255,0.45)'; }}>
                Documentation
              </a>
            </div>
          </div>
        </div>
      </div>

      {matchedAccount && (
        <PinModal
          open={step === 'pin'}
          mode="verify"
          pin={matchedAccount.pin}
          onSuccess={handlePinSuccess}
          onCancel={handlePinCancel}
          title="Enter Your PIN"
          subtitle={`Welcome, ${matchedAccount.user.name.split(' ')[0]}`}
          profilePhoto={matchedAccount.user.profilePhoto}
          accountId={matchedAccount.id}
          accountName={matchedAccount.user.name}
        />
      )}

      <AccountBlockedModal
        open={showBlocked}
        onClose={() => { setShowBlocked(false); setStep('credentials'); setMatchedAccount(null); }}
        reason="blocked"
      />
    </>
  );
}
