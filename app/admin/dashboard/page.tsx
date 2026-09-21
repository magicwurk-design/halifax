'use client';

import { useState } from 'react';
import {
  AlertTriangle, Trash2, Plus, Check, RotateCcw,
  ClipboardList, X, Eye, EyeOff, UserPlus, Landmark,
  Copy, DollarSign, Settings, BarChart2, Zap,
  ShieldOff, Shield, ArrowUpCircle, ChevronDown, ChevronUp, ChevronLeft,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { Avatar } from '@/components/ui/avatar';
import { HALIFAX_BANK, UK_BANKS, INTL_BANKS, Bank } from '@/lib/banks';
import { TransactionCategory, SubAccount, AccountTransactionStatus, BankType } from '@/lib/types';
import { formatCurrency, formatDate, formatTime, generateReference } from '@/lib/formatters';


function showToast(msg: string, type: 'success' | 'error' = 'success') {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = [
    'position:fixed','bottom:28px','left:50%','transform:translateX(-50%)',
    `background:${type === 'success' ? '#16a34a' : '#dc2626'}`, 'color:#fff',
    'padding:11px 24px','border-radius:14px','font-size:13px','font-weight:600',
    'z-index:9999','box-shadow:0 4px 24px rgba(0,0,0,0.25)','pointer-events:none',
    'white-space:nowrap',
  ].join(';');
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 2800);
}

const inputCls = 'h-11 rounded-xl text-sm glass-input focus:outline-none w-full px-3';
const selectCls = 'h-11 rounded-xl text-sm px-3 focus:outline-none glass-input w-full';

function FieldRow({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</label>
      {children}
    </div>
  );
}

// ─── NFT Avatar ───────────────────────────────────────────────────────────────
const PALETTES = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fda085,#f6d365)',
  'linear-gradient(135deg,#96fbc4,#f9f586)',
];

function SectionCard({ icon: Icon, title, subtitle, color = '#4f8ef7', children, defaultOpen = false }: {
  icon: React.ElementType; title: string; subtitle: string; color?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 transition-colors text-left"
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
        </div>
        {open ? <ChevronUp size={15} style={{ color: 'rgba(255,255,255,0.30)' }} /> : <ChevronDown size={15} style={{ color: 'rgba(255,255,255,0.30)' }} />}
      </button>
      {open && <div className="px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

// ─── Admin Balance + Button ───────────────────────────────────────────────────
function AdminBalanceAddButton() {
  const { state, adminDeductBalance } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const adminBalance = state.adminAccount.balance;

  const handleAdd = () => {
    const val = parseFloat(input);
    if (isNaN(val) || val <= 0) { showToast('Enter a valid amount.', 'error'); return; }
    // Add to admin balance using negative deduct (deduct a negative = add)
    adminDeductBalance(-val);
    showToast(`${formatCurrency(val)} added to admin balance.`);
    setInput('');
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white transition-all active:scale-95 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', boxShadow: '0 2px 8px rgba(79,142,247,0.40)', fontSize: '18px', lineHeight: 1 }}
        title="Add to admin balance">
        +
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
            style={{ background: 'linear-gradient(160deg,#1f2b47,#16213e)', border: '1px solid rgba(79,142,247,0.25)' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>Add to Admin Balance</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Current: {formatCurrency(adminBalance)}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <X size={14} style={{ color: 'rgba(255,255,255,0.50)' }} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'rgba(255,255,255,0.40)' }}>£</span>
                <input type="number" min="1" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="0.00" className={inputCls + ' pl-9 text-xl font-bold'}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }} autoFocus />
              </div>
              <div className="flex flex-wrap gap-2">
                {[10000, 50000, 100000, 500000, 1000000].map(a => (
                  <button key={a} onClick={() => setInput(String(a))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.20)', color: '#4f8ef7' }}>
                    +{formatCurrency(a)}
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} disabled={!input || parseFloat(input) <= 0}
                className="w-full h-11 rounded-xl font-bold text-sm text-white disabled:opacity-40 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', boxShadow: '0 2px 12px rgba(79,142,247,0.30)' }}>
                Add {input && parseFloat(input) > 0 ? formatCurrency(parseFloat(input)) : 'Amount'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Admin top-up modal (admin sends from own balance to client) ──────────────
function AdminTopUpModal({ sa, onClose }: { sa: SubAccount; onClose: () => void }) {
  const { state, adminSetBalance, adminAddTransaction, adminDeductBalance } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const amountNum = parseFloat(amount) || 0;
  const adminBalance = state.adminAccount.balance;

  const handleTopUp = async () => {
    if (amountNum <= 0) { showToast('Enter a valid amount.', 'error'); return; }
    if (amountNum > adminBalance) { showToast('Insufficient admin balance.', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const newClientBalance = parseFloat((sa.balance + amountNum).toFixed(2));
    adminSetBalance(sa.id, newClientBalance);
    adminAddTransaction(sa.id, {
      type: 'credit', amount: amountNum,
      description: note || 'Top Up from Halifax Private Banking',
      recipient: 'Halifax Private Banking',
      category: 'transfer', timestamp: new Date().toISOString(),
      status: 'completed', reference: 'TPU-' + generateReference(),
      isInternalTransfer: true,
    });
    adminDeductBalance(amountNum);
    setLoading(false);
    showToast(`${formatCurrency(amountNum)} sent to ${sa.user.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-slide-up"
        style={{ background: 'linear-gradient(160deg,#1f2b47,#16213e)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <Avatar id={sa.id} name={sa.user.name} photo={sa.user.profilePhoto} size="sm" />
            <div>
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>Top Up — {sa.user.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Send from admin balance</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.50)' }} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.20)' }}>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Admin Balance</span>
            <span className="font-bold text-sm" style={{ color: '#4f8ef7' }}>{formatCurrency(adminBalance)}</span>
          </div>
          <FieldRow label="Amount (£)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'rgba(255,255,255,0.40)' }}>£</span>
              <input type="number" min="0.01" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00" className={inputCls + ' pl-9 text-xl font-bold'} />
            </div>
          </FieldRow>
          <FieldRow label="Reference (optional)">
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Monthly allowance" className={inputCls} />
          </FieldRow>
          {amountNum > 0 && (
            <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.40)' }}>Client receives</span>
                <span className="font-bold text-emerald-400">+{formatCurrency(amountNum)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.40)' }}>Admin balance after</span>
                <span className="font-semibold" style={{ color: amountNum > adminBalance ? '#f87171' : 'rgba(255,255,255,0.70)' }}>
                  {formatCurrency(Math.max(0, adminBalance - amountNum))}
                </span>
              </div>
            </div>
          )}
          <button onClick={handleTopUp} disabled={loading || amountNum <= 0 || amountNum > adminBalance}
            className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', boxShadow: '0 2px 16px rgba(79,142,247,0.35)' }}>
            {loading ? 'Processing…' : amountNum > 0 ? `Send ${formatCurrency(amountNum)}` : 'Enter Amount'}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Per-subaccount sections ───────────────────────────────────────────────────
function UserSection({ sa }: { sa: SubAccount }) {
  const { adminSetUser } = useApp();
  const isIntl = sa.user.bankType === 'international';
  const [name, setName] = useState(sa.user.name);
  const [email, setEmail] = useState(sa.user.email);
  const [accountNumber, setAccountNumber] = useState(sa.user.accountNumber);
  const [sortCode, setSortCode] = useState(sa.user.sortCode);
  const [iban, setIban] = useState(sa.user.iban ?? '');
  const [swiftBic, setSwiftBic] = useState(sa.user.swiftBic ?? '');
  const [photo, setPhoto] = useState(sa.user.profilePhoto ?? '');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Photo must be under 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) { showToast('Name cannot be empty.', 'error'); return; }
    const initials = name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
    adminSetUser(sa.id, {
      name: name.trim(), email: email.trim(),
      accountNumber: isIntl ? '' : accountNumber.trim(),
      sortCode: isIntl ? '' : sortCode.trim(),
      iban: isIntl ? iban.trim() : (sa.user.iban ?? ''),
      swiftBic: isIntl ? swiftBic.trim() : (sa.user.swiftBic ?? ''),
      avatarInitials: initials, profilePhoto: photo,
    });
    showToast('Profile updated.');
  };

  return (
    <div className="space-y-3">
      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <Avatar id={sa.id} name={name || sa.user.name} photo={photo} size="lg" />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Profile Photo</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#4f8ef7' }}>
            📷 Upload Photo
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {photo && (
            <button onClick={() => setPhoto('')} className="ml-2 text-xs font-semibold" style={{ color: 'rgba(248,113,113,0.80)' }}>
              Remove
            </button>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Max 2MB · JPG, PNG, WEBP</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldRow label="Full Name"><input value={name} onChange={e => setName(e.target.value)} className={inputCls} /></FieldRow>
        <FieldRow label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} /></FieldRow>
        {isIntl ? (
          <>
            <FieldRow label="IBAN"><input value={iban} onChange={e => setIban(e.target.value.toUpperCase())} className={inputCls + ' font-mono'} placeholder="GB29NWBK60161331926819" /></FieldRow>
            <FieldRow label="SWIFT/BIC"><input value={swiftBic} onChange={e => setSwiftBic(e.target.value.toUpperCase())} className={inputCls + ' font-mono'} placeholder="NWBKGB2L" /></FieldRow>
          </>
        ) : (
          <>
            <FieldRow label="Account Number"><input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className={inputCls + ' font-mono'} /></FieldRow>
            <FieldRow label="Sort Code"><input value={sortCode} onChange={e => setSortCode(e.target.value)} className={inputCls + ' font-mono'} /></FieldRow>
          </>
        )}
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)' }}>
          <Check size={13} /> Save Changes
        </button>
      </div>
    </div>
  );
}

function BalanceSection({ sa }: { sa: SubAccount }) {
  const { adminSetBalance } = useApp();
  const [mode, setMode] = useState<'set' | 'add' | 'sub'>('set');
  const [input, setInput] = useState('');
  const QUICK = [1000, 10000, 50000, 100000, 340000, 1000000];
  const handleApply = () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 0) { showToast('Enter a valid positive amount.', 'error'); return; }
    let nb = val;
    if (mode === 'add') nb = sa.balance + val;
    if (mode === 'sub') { nb = sa.balance - val; if (nb < 0) { showToast('Would go negative.', 'error'); return; } }
    adminSetBalance(sa.id, nb);
    showToast(`Balance updated to ${formatCurrency(nb)}`);
    setInput('');
  };
  return (
    <div className="space-y-3">
      <div className="rounded-xl px-4 py-3 flex justify-between items-center" style={{ background: 'rgba(79,142,247,0.10)', border: '1px solid rgba(79,142,247,0.20)' }}>
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Current Balance</span>
        <span className="font-bold text-base" style={{ color: 'rgba(255,255,255,0.90)' }}>{formatCurrency(sa.balance)}</span>
      </div>
      <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
        {(['set', 'add', 'sub'] as const).map((m, i) => (
          <button key={m} onClick={() => setMode(m)} className="flex-1 h-9 text-xs font-semibold transition-all"
            style={{
              background: mode === m ? 'rgba(79,142,247,0.25)' : 'rgba(255,255,255,0.03)',
              color: mode === m ? '#4f8ef7' : 'rgba(255,255,255,0.35)',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
            {m === 'set' ? 'Set To' : m === 'add' ? '+ Add' : '− Subtract'}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="number" min="0" value={input} onChange={e => setInput(e.target.value)} placeholder="0.00" className={inputCls + ' flex-1'} />
        <button onClick={handleApply} className="h-11 px-4 rounded-xl font-bold text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)' }}>
          Apply
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK.map(a => (
          <button key={a} onClick={() => { adminSetBalance(sa.id, a); showToast(`Balance set to ${formatCurrency(a)}`); }}
            className="text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
            {formatCurrency(a)}
          </button>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES: TransactionCategory[] = ['transfer','shopping','food','transport','entertainment','utilities','salary','other'];

function TransactionSection({ sa }: { sa: SubAccount }) {
  const { adminAddTransaction, adminDeleteTransaction, adminClearTransactions } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const [txType, setTxType] = useState<'credit'|'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('transfer');
  const [status, setStatus] = useState<'completed'|'pending'|'failed'>('completed');
  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { showToast('Enter a valid amount.', 'error'); return; }
    if (!description.trim()) { showToast('Description required.', 'error'); return; }
    if (!recipient.trim()) { showToast('Recipient required.', 'error'); return; }
    const prefix = txType === 'credit' ? 'CR' : 'DB';
    adminAddTransaction(sa.id, { type: txType, amount: amt, description: description.trim(), recipient: recipient.trim(), category, timestamp: new Date().toISOString(), status, reference: prefix + '-' + Math.random().toString(36).slice(2,10).toUpperCase() });
    showToast('Transaction injected.');
    setAmount(''); setDescription(''); setRecipient('');
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[['Total', sa.transactions.length, 'rgba(255,255,255,0.80)'], ['Credits', sa.transactions.filter(t=>t.type==='credit').length, '#4ade80'], ['Debits', sa.transactions.filter(t=>t.type==='debit').length, '#f87171']].map(([l,v,c]) => (
          <div key={String(l)} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="font-bold text-lg" style={{ color: String(c) }}>{v}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</p>
          </div>
        ))}
      </div>
      {sa.transactions.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="max-h-40 overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {sa.transactions.slice(0,20).map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs font-semibold truncate" style={{ color: 'rgba(255,255,255,0.70)' }}>{tx.description}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>{formatDate(tx.timestamp)}</p>
                </div>
                <span className={`text-xs font-bold mr-3 flex-shrink-0 ${tx.type==='credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type==='credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>
                <button onClick={() => { adminDeleteTransaction(sa.id, tx.id); showToast('Removed.'); }}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#f87171'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.25)'}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>Inject Transaction</p>
        <div className="grid grid-cols-2 gap-3">
          <FieldRow label="Type">
            <select value={txType} onChange={e => setTxType(e.target.value as any)} className={selectCls}>
              <option value="credit">Credit (In)</option>
              <option value="debit">Debit (Out)</option>
            </select>
          </FieldRow>
          <FieldRow label="Status">
            <select value={status} onChange={e => setStatus(e.target.value as any)} className={selectCls}>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </FieldRow>
          <FieldRow label="Amount (£)">
            <input type="number" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="250.00" className={inputCls} />
          </FieldRow>
          <FieldRow label="Category">
            <select value={category} onChange={e => setCategory(e.target.value as any)} className={selectCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </FieldRow>
        </div>
        <FieldRow label="Description"><input value={description} onChange={e => setDescription(e.target.value)} placeholder="Transaction description" className={inputCls} /></FieldRow>
        <FieldRow label="Recipient / Sender"><input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Name" className={inputCls} /></FieldRow>
        <div className="flex justify-end">
          <button onClick={handleAdd} className="h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)' }}>
            <Plus size={13} /> Inject
          </button>
        </div>
      </div>
      <button onClick={() => { if (!confirmClear) { setConfirmClear(true); setTimeout(()=>setConfirmClear(false),4000); return; } adminClearTransactions(sa.id); setConfirmClear(false); showToast('Cleared.'); }}
        className={`w-full h-10 rounded-xl text-sm font-bold transition-all ${confirmClear ? 'text-white' : 'text-red-400'}`}
        style={{ background: confirmClear ? '#dc2626' : 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
        {confirmClear ? '⚠ Confirm Clear All' : 'Clear All Transactions'}
      </button>
    </div>
  );
}


function TxStatusSection({ sa }: { sa: SubAccount }) {
  const { adminSetAccountTxStatus } = useApp();
  const opts: { value: AccountTransactionStatus; label: string; color: string; bg: string; desc: string }[] = [
    { value: 'normal',  label: 'Normal',  color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  desc: 'Transfers execute successfully' },
    { value: 'pending', label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  desc: 'Transfers held in processing' },
    { value: 'failed',  label: 'Failed',  color: '#f87171', bg: 'rgba(248,113,113,0.10)', desc: 'Transfers declined immediately' },
  ];
  const current = opts.find(o => o.value === sa.transactionStatus) ?? opts[0];
  return (
    <div className="space-y-3">
      {/* Current status display */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
        style={{ background: current.bg, border: `1px solid ${current.color}30` }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: current.color, boxShadow: `0 0 6px ${current.color}` }} />
        <div className="flex-1">
          <p className="text-xs font-bold" style={{ color: current.color }}>Currently: {current.label}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{current.desc}</p>
        </div>
      </div>
      <p className="text-[10px] px-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
        Defaults to Normal. Only change if you need to control this client's transfer outcomes.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {opts.map(opt => {
          const active = sa.transactionStatus === opt.value;
          return (
            <button key={opt.value}
              onClick={() => { adminSetAccountTxStatus(sa.id, opt.value); showToast(`Transfer status → ${opt.label}.`); }}
              className="py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.97]"
              style={{
                background: active ? opt.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? opt.color + '50' : 'rgba(255,255,255,0.09)'}`,
                color: active ? opt.color : 'rgba(255,255,255,0.30)',
                boxShadow: active ? `0 0 12px ${opt.color}20` : 'none',
              }}>
              {opt.label}
              {active && <div className="text-[9px] mt-0.5 font-normal opacity-70">active</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Subaccount Card ──────────────────────────────────────────────────────────
function SubAccountCard({ sa, onDelete }: { sa: SubAccount; onDelete: () => void }) {
  const { adminSetBlocked } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const credits = sa.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const debits  = sa.transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <div className="rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)', border: sa.isBlocked ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.10)' }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <Avatar id={sa.id} name={sa.user.name} photo={sa.user.profilePhoto} size="lg" blocked={sa.isBlocked} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>{sa.user.name}</p>
              {sa.isBlocked && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.30)' }}>Blocked</span>}
              {!sa.pinSet && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>PIN not set</span>}
            </div>
            <p className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.38)' }}>{sa.user.bankType === 'international' ? (sa.user.iban ?? '—') : `${sa.user.accountNumber} · ${sa.user.sortCode}`}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.30)' }}>{sa.user.email}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg" style={{ color: 'rgba(255,255,255,0.92)' }}>{formatCurrency(sa.balance)}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>{sa.transactions.length} txns</p>
          </div>
        </div>

        {/* In/Out */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
            <p className="text-xs font-bold text-emerald-400">+{formatCurrency(credits)}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>Total In</p>
          </div>
          <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <p className="text-xs font-bold text-red-400">−{formatCurrency(debits)}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.30)' }}>Total Out</p>
          </div>
        </div>

        {/* Action buttons row */}
        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          {/* Top Up button */}
          <button onClick={() => setTopUpOpen(true)}
            className="h-10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', boxShadow: '0 2px 12px rgba(79,142,247,0.30)' }}>
            <ArrowUpCircle size={14} /> Top Up
          </button>
          {/* Block/Unblock */}
          <button
            onClick={() => { adminSetBlocked(sa.id, !sa.isBlocked); showToast(`${sa.user.name} ${!sa.isBlocked ? 'blocked' : 'unblocked'}.`, !sa.isBlocked ? 'error' : 'success'); }}
            className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{
              background: sa.isBlocked ? 'rgba(74,222,128,0.10)' : 'rgba(239,68,68,0.10)',
              border: sa.isBlocked ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(239,68,68,0.25)',
              color: sa.isBlocked ? '#4ade80' : '#f87171',
            }}>
            {sa.isBlocked ? <><Shield size={13} /> Unblock</> : <><ShieldOff size={13} /> Block</>}
          </button>
        </div>

        {/* Expandable sections */}
        <div className="px-4 pb-4 space-y-2">
          <SectionCard icon={Settings} title="Profile & Account" subtitle="Name, email, account number" color="#4f8ef7">
            <UserSection sa={sa} />
          </SectionCard>
          <SectionCard icon={DollarSign} title="Balance Control" subtitle={formatCurrency(sa.balance)} color="#4ade80">
            <BalanceSection sa={sa} />
          </SectionCard>
          <SectionCard icon={BarChart2} title="Transactions" subtitle={`${sa.transactions.length} records`} color="#a78bfa">
            <TransactionSection sa={sa} />
          </SectionCard>
          <SectionCard icon={Zap} title="Transfer Status" subtitle={`Currently: ${sa.transactionStatus}`} color="#f87171">
            <TxStatusSection sa={sa} />
          </SectionCard>
        </div>

        {/* Delete */}
        <div className="px-4 pb-4 flex justify-end">
          <button onClick={() => { if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3500); return; } onDelete(); }}
            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${confirmDelete ? 'text-white' : ''}`}
            style={{ background: confirmDelete ? '#dc2626' : 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: confirmDelete ? '#fff' : '#f87171' }}>
            {confirmDelete ? <><AlertTriangle size={12} /> Confirm Delete</> : <><Trash2 size={13} /> Remove Client</>}
          </button>
        </div>
      </div>

      {topUpOpen && <AdminTopUpModal sa={sa} onClose={() => setTopUpOpen(false)} />}
    </>
  );
}

// ─── Create subaccount form ───────────────────────────────────────────────────
function CreateSubAccountForm({ onDone }: { onDone: () => void }) {
  const { createSubAccount } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank>(HALIFAX_BANK);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [photo, setPhoto] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Photo must be under 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const isHalifax = selectedBank.id === 'halifax';
  const isIntl = !['United Kingdom'].includes(selectedBank.country) || selectedBank.id === 'intl';
  const bankType: BankType = isHalifax ? 'halifax' : isIntl ? 'international' : 'uk';

  const allBanks: Bank[] = [HALIFAX_BANK, ...UK_BANKS, ...INTL_BANKS];
  const filteredBanks = bankSearch
    ? allBanks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.country.toLowerCase().includes(bankSearch.toLowerCase()))
    : allBanks;

  const handleSortCodeChange = (raw: string) => {
    const d = raw.replace(/\D/g,'').slice(0,6);
    setSortCode(d.length > 4 ? `${d.slice(0,2)}-${d.slice(2,4)}-${d.slice(4)}` : d.length > 2 ? `${d.slice(0,2)}-${d.slice(2)}` : d);
  };

  const sortDigits = sortCode.replace(/\D/g,'');
  const sortOk = sortDigits.length === 6;
  const accOk = accountNumber.length === 8;
  const ibanOk = iban.trim().length >= 15;
  const swiftOk = swiftBic.trim().length >= 8;
  const pinOk = pin.length === 6;
  const pwOk = password.trim().length >= 6;

  const accountFieldsOk = bankType === 'international' ? (ibanOk && swiftOk) : (sortOk && accOk);

  const badge = (ok: boolean, msg: string) => (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-1.5"
      style={{ background: ok ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)', color: ok ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
      {ok ? `✓ ${msg}` : msg}
    </span>
  );

  const handleCreate = () => {
    if (!name.trim()) { showToast('Full name is required.', 'error'); return; }
    if (!email.trim()) { showToast('Email is required.', 'error'); return; }
    if (bankType === 'international') {
      if (!ibanOk) { showToast('Enter a valid IBAN.', 'error'); return; }
      if (!swiftOk) { showToast('Enter a valid SWIFT/BIC code.', 'error'); return; }
    } else {
      if (!sortOk) { showToast('Sort code must be 6 digits.', 'error'); return; }
      if (!accOk) { showToast('Account number must be 8 digits.', 'error'); return; }
    }
    if (!pwOk) { showToast('Password must be at least 6 characters.', 'error'); return; }
    if (!pinOk) { showToast('PIN must be exactly 6 digits.', 'error'); return; }
    createSubAccount(
      name, email,
      bankType === 'international' ? '' : sortCode,
      bankType === 'international' ? '' : accountNumber,
      password, pin,
      selectedBank.id, selectedBank.name, selectedBank.flag, bankType,
      bankType === 'international' ? iban : '',
      bankType === 'international' ? swiftBic : '',
      photo,
    );
    showToast(`Client created for ${name.trim()}.`);
    onDone();
  };

  return (
    <div className="rounded-2xl overflow-hidden animate-fade-in" style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.20)' }}>
      <div className="px-4 py-3.5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(79,142,247,0.15)' }}>
        <button onClick={onDone}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}>
          <ChevronLeft size={15} style={{ color: 'rgba(255,255,255,0.55)' }} />
        </button>
        <UserPlus size={15} style={{ color: '#4f8ef7' }} />
        <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>New Client</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Bank selection */}
        <FieldRow label="Bank">
          <div className="space-y-2">
            <button onClick={() => setShowBankList(!showBankList)}
              className="w-full flex items-center gap-3 h-11 px-3 rounded-xl text-left transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <span className="text-lg">{selectedBank.flag}</span>
              <span className="flex-1 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{selectedBank.name}</span>
              <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.35)', transform: showBankList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showBankList && (
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(20,30,55,0.98)' }}>
                <div className="p-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <input
                    placeholder="Search banks..."
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    className={inputCls}
                    style={{ height: '36px' }}
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredBanks.map((bank, i) => (
                    <button key={bank.id}
                      onClick={() => { setSelectedBank(bank); setShowBankList(false); setBankSearch(''); setSortCode(''); setAccountNumber(''); setIban(''); setSwiftBic(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        borderBottom: i < filteredBanks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        background: selectedBank.id === bank.id ? 'rgba(79,142,247,0.15)' : 'transparent',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.10)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = selectedBank.id === bank.id ? 'rgba(79,142,247,0.15)' : 'transparent'}>
                      <span className="text-base">{bank.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{bank.name}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{bank.country}</p>
                      </div>
                      {bank.id === 'halifax' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(79,142,247,0.20)', color: '#4f8ef7' }}>DEFAULT</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FieldRow>

        {/* Photo upload */}
        <FieldRow label="Profile Photo (optional)">
          <div className="flex items-center gap-3">
            {photo ? (
              <img src={photo} alt="preview" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" style={{ border: '1px solid rgba(79,142,247,0.30)' }} />
            ) : (
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                <span className="text-lg">👤</span>
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.25)', color: '#4f8ef7' }}>
                📷 {photo ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
              {photo && <button onClick={() => setPhoto('')} className="ml-2 text-xs font-semibold" style={{ color: 'rgba(248,113,113,0.80)' }}>Remove</button>}
            </div>
          </div>
        </FieldRow>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldRow label="Full Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></FieldRow>
          <FieldRow label="Email"><input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com" /></FieldRow>
        </div>

        {/* Account fields — conditional on bank type */}
        {bankType === 'international' ? (
          <div className="space-y-3">
            <FieldRow label={<span>IBAN {badge(ibanOk, 'min 15 chars')}</span>}>
              <input className={inputCls + ' font-mono tracking-wider'} value={iban}
                onChange={e => setIban(e.target.value.toUpperCase().slice(0,34))}
                placeholder="GB29 NWBK 6016 1331 9268 19" />
            </FieldRow>
            <FieldRow label={<span>SWIFT / BIC {badge(swiftOk, 'min 8 chars')}</span>}>
              <input className={inputCls + ' font-mono tracking-wider'} value={swiftBic}
                onChange={e => setSwiftBic(e.target.value.toUpperCase().slice(0,11))}
                placeholder="NWBKGB2L" />
            </FieldRow>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label={<span>Sort Code {badge(sortOk, '6 digits')}</span>}>
              <input className={inputCls + ' font-mono tracking-widest'} value={sortCode}
                onChange={e => handleSortCodeChange(e.target.value)}
                placeholder="20-41-63" maxLength={8} inputMode="numeric" />
            </FieldRow>
            <FieldRow label={<span>Account No. {badge(accOk, '8 digits')}</span>}>
              <input className={inputCls + ' font-mono tracking-widest'} value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g,'').slice(0,8))}
                placeholder="12345678" maxLength={8} inputMode="numeric" />
            </FieldRow>
          </div>
        )}

        <FieldRow label={<span>Password {badge(pwOk, 'min 6 chars')}</span>}>
          <div className="relative">
            <input className={inputCls} type={showPw ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Client login password" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </FieldRow>
        <FieldRow label={<span>6-Digit PIN {badge(pinOk, `${pin.length}/6`)}</span>}>
          <div className="relative">
            <input className={inputCls + ' font-mono tracking-[0.3em] pr-10'} type={showPin ? 'text' : 'password'}
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="••••••" inputMode="numeric" maxLength={6} />
            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.30)' }}>
              {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>Client uses this PIN to verify login and authorise transfers.</p>
        </FieldRow>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onDone} className="h-10 px-4 rounded-xl text-sm font-semibold"
            style={{ color: 'rgba(255,255,255,0.40)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>Cancel</button>
          <button onClick={handleCreate}
            disabled={!name.trim() || !email.trim() || !accountFieldsOk || !pwOk || !pinOk}
            className="h-10 px-5 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', boxShadow: '0 2px 12px rgba(79,142,247,0.30)' }}>
            <Check size={13} /> Create Client
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Audit log ────────────────────────────────────────────────────────────────
function AuditLog() {
  const { state } = useApp();
  const log = state.auditLog ?? [];
  if (log.length === 0) return <p className="text-center py-4 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>No actions recorded yet.</p>;
  return (
    <div className="rounded-xl overflow-hidden divide-y max-h-64 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {log.map(entry => (
        <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'rgba(79,142,247,0.70)' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.70)' }}>{entry.action}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.30)' }}>{entry.detail}</p>
          </div>
          <div className="text-right flex-shrink-0 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <p>{formatDate(entry.timestamp)}</p>
            <p>{formatTime(entry.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Transfer outcome quick controls ─────────────────────────────────────────


// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { state, adminResetDemo, deleteSubAccount } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [adminAccCopied, setAdminAccCopied] = useState(false);

  const totalBalance = state.subAccounts.reduce((s, sa) => s + sa.balance, 0);
  const adminAcc = state.adminAccount;

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); return; }
    adminResetDemo();
    setShowCreate(false);
    setConfirmReset(false);
    showToast('All client data has been reset.');
  };

  const copyAdminAcc = () => {
    navigator.clipboard.writeText(adminAcc.accountNumber).then(() => {
      setAdminAccCopied(true); setTimeout(() => setAdminAccCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.90)' }}>Admin Panel</h1>
        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Manage clients and accounts</p>
      </div>

      {/* Admin account card */}
      <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.15) 0%,rgba(59,125,232,0.08) 100%)', border: '1px solid rgba(79,142,247,0.25)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)' }}>
            <Landmark size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.88)' }}>{adminAcc.name}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Admin Account</p>
          </div>
          <div className="text-right flex items-center gap-2">
            <p className="font-bold text-lg" style={{ color: '#4f8ef7' }}>{formatCurrency(adminAcc.balance)}</p>
            <AdminBalanceAddButton />
          </div>
        </div>
        <div className="flex items-center gap-6 px-1">
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Account Number</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>{adminAcc.accountNumber}</p>
              <button onClick={copyAdminAcc} className="p-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>
                {adminAccCopied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>Sort Code</p>
            <p className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>{adminAcc.sortCode}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Clients', value: state.subAccounts.length },
          { label: 'Client Funds', value: formatCurrency(totalBalance) },
          { label: 'Transactions', value: state.subAccounts.reduce((s, sa) => s + sa.transactions.length, 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl px-3 py-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
            <p className="font-bold text-base" style={{ color: 'rgba(255,255,255,0.88)' }}>{value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Client list */}
      <div className="space-y-3">
        {state.subAccounts.length === 0 && !showCreate && (
          <div className="text-center py-10 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.30)' }}>No clients yet. Add one below.</p>
          </div>
        )}
        {state.subAccounts.map(sa => (
          <SubAccountCard key={sa.id} sa={sa} onDelete={() => { deleteSubAccount(sa.id); showToast(`${sa.user.name} removed.`); }} />
        ))}
      </div>

      {/* Add client */}
      {showCreate
        ? <CreateSubAccountForm onDone={() => setShowCreate(false)} />
        : (
          <button onClick={() => setShowCreate(true)}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            style={{ border: '1px dashed rgba(79,142,247,0.30)', color: 'rgba(79,142,247,0.60)', background: 'rgba(79,142,247,0.05)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.10)'; (e.currentTarget as HTMLElement).style.color = '#4f8ef7'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(79,142,247,0.60)'; }}>
            <Plus size={16} /> Add Client
          </button>
        )}

      {/* Audit log */}
      <SectionCard icon={ClipboardList} title="Audit Log" subtitle={`${state.auditLog.length} actions recorded`} color="#a78bfa">
        <AuditLog />
      </SectionCard>

      {/* Reset */}
      <button onClick={handleReset}
        className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
        style={{
          background: confirmReset ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
          border: confirmReset ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(255,255,255,0.09)',
          color: confirmReset ? '#f87171' : 'rgba(255,255,255,0.30)',
        }}>
        {confirmReset ? <><AlertTriangle size={14} /> Confirm Reset All Data</> : <><RotateCcw size={13} /> Reset All Data</>}
      </button>
    </div>
  );
}
