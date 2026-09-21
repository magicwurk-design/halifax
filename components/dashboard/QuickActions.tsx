'use client';
import { ArrowUpRight, ArrowDownLeft, LayoutList, Plus } from 'lucide-react';

interface Props { onSend:()=>void; onReceive:()=>void; onTransactions:()=>void; onTopUp:()=>void; }

const ACTIONS = [
  { key:'send',         label:'Send',     icon:ArrowUpRight,  primary:true  },
  { key:'receive',      label:'Receive',  icon:ArrowDownLeft, primary:false },
  { key:'transactions', label:'History',  icon:LayoutList,    primary:false },
  { key:'topup',        label:'Top Up',   icon:Plus,          primary:false },
];

export function QuickActions({ onSend, onReceive, onTransactions, onTopUp }: Props) {
  const handlers: Record<string,()=>void> = { send:onSend, receive:onReceive, transactions:onTransactions, topup:onTopUp };
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {ACTIONS.map(({ key, label, icon:Icon, primary }) => (
        <button key={key} onClick={handlers[key]}
          className="flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all duration-150 active:scale-95"
          style={primary
            ? { background:'linear-gradient(135deg,#2979ff 0%,#1558d6 100%)', boxShadow:'0 2px 16px rgba(29,110,245,0.35)' }
            : { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)' }
          }>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={primary
              ? { background:'rgba(255,255,255,0.15)' }
              : { background:'rgba(29,110,245,0.12)', border:'1px solid rgba(29,110,245,0.2)' }
            }>
            <Icon size={15}
              style={{ color: primary ? '#fff' : 'rgba(100,160,255,0.85)' }}
              strokeWidth={2.2}/>
          </div>
          <span className="text-[10px] font-semibold tracking-wide"
            style={{ color: primary ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.38)' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}
