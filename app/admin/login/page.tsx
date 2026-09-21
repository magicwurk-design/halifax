'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, ShieldCheck, Activity } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { isAdminCredentials } from '@/lib/auth';
import { PinModal } from '@/components/auth/PinModal';

export default function AdminLoginPage() {
  const { isAdmin, isHydrated, loginAdmin } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    if (isHydrated && isAdmin) router.replace('/admin/dashboard');
  }, [isHydrated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email address required.'); return; }
    if (!password.trim()) { setError('Password required.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (!isAdminCredentials(email, password)) {
      setLoading(false);
      setError('Invalid credentials. Access denied.');
      return;
    }
    setLoading(false);
    setShowPin(true);
  };

  return (
    <>
      <div className="min-h-screen flex bg-navy relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07]"
            style={{ background:'radial-gradient(circle,#2979ff 0%,transparent 65%)', filter:'blur(60px)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background:'radial-gradient(circle,#1d6ef5 0%,transparent 65%)', filter:'blur(40px)' }} />
        </div>

        <div className="hidden lg:flex lg:w-[52%] relative p-14 flex-col justify-between border-r"
          style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="absolute inset-0"
            style={{ background:'linear-gradient(135deg,rgba(29,110,245,0.07) 0%,transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize:'28px 28px' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-20">
              <Image src="/logo.svg" alt="Halifax" width={110} height={44}
                className="h-11 w-auto object-contain opacity-90" />
              <div className="h-5 w-px" style={{ background:'rgba(255,255,255,0.1)' }} />
              <span className="text-xs font-semibold tracking-widest uppercase"
                style={{ color:'rgba(255,255,255,0.35)' }}>Private Banking</span>
            </div>
            <div className="space-y-5 max-w-md">
              <p className="text-xs font-semibold tracking-widest uppercase"
                style={{ color:'rgba(29,110,245,0.8)' }}>Restricted Access</p>
              <h1 className="text-5xl font-light leading-tight tracking-tight"
                style={{ color:'rgba(255,255,255,0.92)' }}>
                Command.<br/>
                <span className="font-semibold text-white">Control.</span>
              </h1>
              <p className="text-base leading-relaxed" style={{ color:'rgba(255,255,255,0.35)' }}>
                Institutional-grade administration. Complete visibility over every account, balance, and transaction.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { icon: Shield, title:'Authorised Personnel Only', desc:'Two-factor authentication required' },
              { icon: Activity, title:'Full Audit Trail', desc:'Every action logged and timestamped' },
              { icon: ShieldCheck, title:'Session Monitoring', desc:'4-hour secure session with auto-expiry' },
            ].map(({ icon:Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 glass rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(29,110,245,0.12)', border:'1px solid rgba(29,110,245,0.22)' }}>
                  <Icon size={16} style={{ color:'rgba(100,160,255,0.9)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.75)' }}>{title}</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
          <div className="w-full max-w-sm space-y-8">
            <div className="lg:hidden flex items-center gap-3">
              <Image src="/logo.svg" alt="Halifax" width={90} height={36}
                className="h-9 w-auto object-contain opacity-90" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-1" style={{ color:'rgba(255,255,255,0.90)' }}>Sign In</h2>
              <p className="text-sm" style={{ color:'rgba(255,255,255,0.30)' }}>Authorised personnel only</p>
            </div>

            <div className="glass-card rounded-3xl p-8 space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color:'rgba(255,255,255,0.35)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color:'rgba(29,110,245,0.6)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@halifaxbanking.co.uk" autoComplete="email"
                      className="glass-input w-full h-12 pl-11 pr-4 rounded-xl text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color:'rgba(255,255,255,0.35)' }}>Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color:'rgba(29,110,245,0.6)' }} />
                    <input type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                      autoComplete="current-password"
                      className="glass-input w-full h-12 pl-11 pr-12 rounded-xl text-sm" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color:'rgba(255,255,255,0.2)' }}>
                      {showPw ? <EyeOff size={15}/> : <Eye size={15}/>} 
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm text-center"
                    style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                  {loading
                    ? <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                        </svg>
                        Verifying...
                      </span>
                    : <>Continue <ArrowRight size={16}/></>
                  }
                </button>
              </form>
            </div>

            <p className="text-center text-xs" style={{ color:'rgba(255,255,255,0.15)' }}>
              Halifax Private Banking &copy; {new Date().getFullYear()} &mdash; Strictly Confidential
            </p>
            <p className="text-center text-xs" style={{ color:'rgba(255,255,255,0.10)' }}>
              <a href="/login" className="underline hover:opacity-60 transition-opacity">Client login</a>
            </p>
          </div>
        </div>
      </div>

      <PinModal open={showPin}
        onSuccess={() => { loginAdmin(); router.push('/admin/dashboard'); }}
        onCancel={() => { setShowPin(false); setError('PIN verification cancelled.'); }} />
    </>
  );
}
