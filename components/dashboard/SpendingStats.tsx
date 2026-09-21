'use client';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatCurrency } from '@/lib/formatters';

const CAT_COLORS: Record<string,string> = {
  salary:'#4ade80', transfer:'#60a5fa', food:'#fb923c',
  shopping:'#f472b6', utilities:'#fbbf24', transport:'#38bdf8',
  entertainment:'#c4b5fd', other:'#64748b',
};
const CAT_LABELS: Record<string,string> = {
  salary:'Salary', transfer:'Transfers', food:'Food & Dining',
  shopping:'Shopping', utilities:'Utilities', transport:'Transport',
  entertainment:'Entertainment', other:'Other',
};

export function SpendingStats() {
  const { activeSubAccount } = useApp();
  if (!activeSubAccount) return null;
  const now = new Date();
  const txs = activeSubAccount.transactions.filter(t => new Date(t.timestamp) >= new Date(now.getFullYear(), now.getMonth(), 1));
  const totalIn  = txs.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const totalOut = txs.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const cats = Object.entries(
    txs.filter(t=>t.type==='debit').reduce<Record<string,number>>((a,t)=>{ a[t.category]=(a[t.category]??0)+t.amount; return a; },{})
  ).sort((a,b)=>b[1]-a[1]).slice(0,3);

  if (txs.length === 0) {
    return (
      <div className="glass-card rounded-2xl px-4 py-5 text-center">
        <p className="text-xs tracking-wide" style={{ color:'rgba(255,255,255,0.22)' }}>No transactions this month yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {/* In */}
        <div className="glass-card rounded-2xl px-3 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(34,197,94,0.10)', border:'1px solid rgba(34,197,94,0.18)' }}>
            <TrendingUp size={14} className="text-emerald-400"/>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest"
              style={{ color:'rgba(255,255,255,0.25)' }}>Money In</p>
            <p className="text-sm font-bold text-emerald-400 leading-tight">{formatCurrency(totalIn)}</p>
          </div>
        </div>
        {/* Out */}
        <div className="glass-card rounded-2xl px-3 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'rgba(248,113,113,0.10)', border:'1px solid rgba(248,113,113,0.18)' }}>
            <TrendingDown size={14} className="text-red-400"/>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest"
              style={{ color:'rgba(255,255,255,0.25)' }}>Money Out</p>
            <p className="text-sm font-bold text-red-400 leading-tight">{formatCurrency(totalOut)}</p>
          </div>
        </div>
      </div>

      {cats.length > 0 && (
        <div className="glass-card rounded-2xl px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color:'rgba(255,255,255,0.22)' }}>Top Spending</p>
          <div className="space-y-2">
            {cats.map(([cat, amt]) => {
              const pct = totalOut > 0 ? (amt/totalOut)*100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-medium" style={{ color:'rgba(255,255,255,0.48)' }}>
                      {CAT_LABELS[cat]??cat}
                    </span>
                    <span className="text-[10px] font-semibold" style={{ color:'rgba(255,255,255,0.70)' }}>
                      {formatCurrency(amt)}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${Math.max(pct,3)}%`, background: CAT_COLORS[cat]??'#64748b' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
