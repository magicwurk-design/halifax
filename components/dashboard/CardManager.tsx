'use client';
import { Eye, EyeOff, Wifi, Lock, Unlock, Smartphone, Globe } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { ServiceErrorModal, type ErrorScenario } from './ServiceErrorModal';
import { SupportModal } from './SupportModal';

export function CardManager() {
  const { activeSubAccount, updateCard } = useApp();
  if (!activeSubAccount) return null;
  const { user, cardSettings } = activeSubAccount;
  const [showNum, setShowNum] = useState(false);
  const { frozen, contactless, onlinePayments } = cardSettings;
  const maskedNum = showNum ? '4929 1842 7731 4291' : '•••• •••• •••• 4291';
  const [errorScenario, setErrorScenario] = useState<ErrorScenario | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const handleReveal = () => {
    if (showNum) { setShowNum(false); return; }
    setErrorScenario('card_reveal');
  };

  const handleToggle = (key: 'frozen' | 'contactless' | 'onlinePayments', value: boolean) => {
    const scenario: ErrorScenario =
      key === 'frozen' ? 'card_freeze' :
      key === 'contactless' ? 'card_contactless' : 'card_online';
    setErrorScenario(scenario);
  };

  const controls = [
    { key:'frozen' as const,         label:'Card Frozen',       desc: frozen ? 'All transactions blocked' : 'Card is active', icon: frozen ? Lock : Unlock, value:frozen,         danger:true  },
    { key:'contactless' as const,    label:'Contactless',       desc:'Tap-to-pay at terminals',                               icon:Smartphone,                value:contactless,    danger:false },
    { key:'onlinePayments' as const, label:'Online Payments',   desc:'E-commerce & online purchases',                         icon:Globe,                     value:onlinePayments, danger:false },
  ];

  return (
    <>
    <div className="space-y-3">
      {/* Card visual */}
      <div className={`relative w-full rounded-3xl overflow-hidden select-none shadow-2xl transition-all duration-500 ${frozen ? 'grayscale opacity-55' : ''}`} style={{ minHeight:168 }}>
        <div className="absolute inset-0"
          style={{ background:'linear-gradient(135deg,#0a1f5c 0%,#1043a3 45%,#1a56cc 100%)' }}/>
        <div className="absolute inset-0"
          style={{ background:'linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.01) 100%)' }}/>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)' }}/>
        {/* Gold orb top-right */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-12"
          style={{ background:'radial-gradient(circle,rgba(201,168,76,0.6) 0%,transparent 70%)' }}/>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize:'16px 16px' }}/>

        <div className="relative z-10 px-5 pt-5 pb-4 text-white">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase mb-0.5" style={{ color:'rgba(255,255,255,0.38)' }}>Halifax Private</p>
              <p className="font-medium text-sm" style={{ color:'rgba(255,255,255,0.85)' }}>{user?.name}</p>
            </div>
            <Wifi size={14} className="rotate-90" style={{ color:'rgba(255,255,255,0.28)' }}/>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <p className="font-mono text-sm font-semibold tracking-widest" style={{ color:'rgba(255,255,255,0.80)' }}>
              {maskedNum}
            </p>
            <button onClick={handleReveal} className="p-1 rounded-lg transition-all"
              style={{ background:'rgba(255,255,255,0.10)' }}>
              {showNum
                ? <EyeOff size={12} style={{ color:'rgba(255,255,255,0.45)' }}/>
                : <Eye    size={12} style={{ color:'rgba(255,255,255,0.45)' }}/>}
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color:'rgba(255,255,255,0.28)' }}>Expires</p>
              <p className="font-mono text-xs" style={{ color:'rgba(255,255,255,0.70)' }}>09 / 28</p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase mb-0.5 text-right" style={{ color:'rgba(255,255,255,0.28)' }}>CVV</p>
              <p className="font-mono text-xs" style={{ color:'rgba(255,255,255,0.70)' }}>{showNum ? '382' : '•••'}</p>
            </div>
            {/* Card rings — gold accent */}
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full border border-white/10" style={{ background:'rgba(201,168,76,0.75)' }}/>
              <div className="w-7 h-7 rounded-full border border-white/10" style={{ background:'rgba(239,68,68,0.70)' }}/>
            </div>
          </div>
        </div>
      </div>

      {frozen && (
        <div className="rounded-2xl px-4 py-3 text-center text-sm font-semibold text-red-400"
          style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.18)' }}>
          🔒 Card is frozen — all transactions blocked
        </div>
      )}

      {/* Controls */}
      <div className="space-y-2">
        {controls.map(({ key, label, desc, icon:Icon, value, danger }) => (
          <div key={key} className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all"
            style={{
              background: danger && value ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${danger && value ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: danger && value ? 'rgba(239,68,68,0.10)' : 'rgba(29,110,245,0.10)',
                  border: `1px solid ${danger && value ? 'rgba(239,68,68,0.18)' : 'rgba(29,110,245,0.18)'}`,
                }}>
                <Icon size={15} style={{ color: danger && value ? '#f87171' : 'rgba(100,160,255,0.85)' }}/>
              </div>
              <div>
                <p className="text-sm font-semibold"
                  style={{ color: danger && value ? '#f87171' : 'rgba(255,255,255,0.72)' }}>{label}</p>
                <p className="text-[10px]" style={{ color:'rgba(255,255,255,0.28)' }}>{desc}</p>
              </div>
            </div>
            <button onClick={() => handleToggle(key, value)}
              role="switch" aria-checked={value} aria-label={label}
              className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ml-4"
              style={{ background: value ? (danger ? '#ef4444' : '#2979ff') : 'rgba(255,255,255,0.10)' }}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
          </div>
        ))}
      </div>
    </div>

    {errorScenario && (
      <ServiceErrorModal
        open={!!errorScenario}
        onOpenChange={(v) => { if (!v) setErrorScenario(null); }}
        scenario={errorScenario}
        onRetry={() => setErrorScenario(null)}
        onContactSupport={() => { setErrorScenario(null); setSupportOpen(true); }}
      />
    )}
    <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  );
}
