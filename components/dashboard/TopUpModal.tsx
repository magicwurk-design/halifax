'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, CreditCard, Building2, Smartphone, ChevronLeft, Mail, MessageSquare, type LucideIcon } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { ContactSupportModal } from './ContactSupportModal';
import { formatCurrency, generateReference } from '@/lib/formatters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TopUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Method = 'debit' | 'bank' | 'apple';
type Step = 'amount' | 'method' | 'result';

const QUICK_AMOUNTS = [500, 1000, 2500, 5000];

const METHODS: { key: Method; label: string; desc: string; icon: LucideIcon }[] = [
  { key: 'debit', label: 'Debit / Credit Card', desc: 'Instant — Visa, Mastercard', icon: CreditCard },
  { key: 'bank', label: 'Bank Transfer', desc: '1–2 working days', icon: Building2 },
  { key: 'apple', label: 'Apple Pay / Google Pay', desc: 'Instant via digital wallet', icon: Smartphone },
];

export function TopUpModal({ open, onOpenChange }: TopUpModalProps) {
  const { activeSubAccount, topUp, isAdmin } = useApp();
  const state = { balance: activeSubAccount?.balance ?? 0 };
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<Method | null>(null);
  const [reference, setReference] = useState('');
  const [amountError, setAmountError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const amountNum = isNaN(parseFloat(amount)) ? 0 : parseFloat(amount);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('amount');
      setAmount('');
      setMethod(null);
      setReference('');
      setAmountError('');
      setConfirming(false);
      setFailed(false);
      setSupportOpen(false);
    }, 300);
  };

  const handleContinue = () => {
    // Rule 4 — only admin can add money
    if (!isAdmin) {
      setSupportOpen(true);
      return;
    }
    if (amountNum < 10) {
      setAmountError('Minimum top-up amount is £10.00.');
      return;
    }
    setAmountError('');
    setStep('method');
  };

  const handleConfirm = async () => {
    if (!method) return;
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 1800));
    setConfirming(false);

    // Only admin can top up — clients always get a failed result
    if (!isAdmin) {
      setFailed(true);
      setStep('result');
      return;
    }

    const ref = generateReference();
    topUp(amountNum, ref);
    setReference(ref);
    setFailed(false);
    setStep('result');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full border-slate-100 shadow-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-teal-700 to-emerald-500 p-5 text-white flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {step === 'method' && (
                <button
                  onClick={() => setStep('amount')}
                  className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-500 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
              )}
              <div>
                <DialogTitle className="text-white text-xl font-bold leading-none">Top Up Account</DialogTitle>
                <p className="text-teal-100 text-xs mt-0.5">
                  {step === 'amount' ? 'How much would you like to add?' : step === 'method' ? 'Choose a payment method' : failed ? 'Top-up failed' : 'Top-up complete!'}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-5">
          {step === 'amount' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">£</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 rounded-xl border-slate-200 h-14 text-2xl font-bold focus-visible:ring-emerald-500 text-slate-800"
                    min="10"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-slate-400">Minimum top-up: <span className="font-semibold text-slate-600">£10.00</span></p>
                {amountError && <p className="text-xs text-red-500 font-medium">{amountError}</p>}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(String(q))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        amountNum === q
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      £{q >= 1000 ? `${q / 1000}k` : q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current balance</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(state.balance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Processing time</span>
                  <span className="font-semibold text-slate-600">1–3 business days</span>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={amountNum < 10}
                className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 font-semibold text-base disabled:opacity-40"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Adding <span className="font-bold text-slate-800">{formatCurrency(amountNum)}</span> to your account
              </p>

              <div className="space-y-2.5">
                {METHODS.map(({ key, label, desc, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMethod(key)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border transition-all text-left ${
                      method === key
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${method === key ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <Icon size={20} className={method === key ? 'text-emerald-700' : 'text-slate-500'} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${method === key ? 'text-emerald-800' : 'text-slate-800'}`}>{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${method === key ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                      {method === key && <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5" />}
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleConfirm}
                disabled={!method || confirming}
                className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 font-semibold text-base disabled:opacity-40"
              >
                {confirming ? 'Processing...' : `Add ${formatCurrency(amountNum)}`}
              </Button>
            </div>
          )}

          {step === 'result' && !failed && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">Request Submitted!</p>
                <p className="text-slate-500 text-sm mt-1.5">
                  Your top-up of <span className="font-bold text-emerald-700">{formatCurrency(amountNum)}</span> is being processed.
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100">
                <Row label="Amount Requested" value={formatCurrency(amountNum)} highlight />
                <Row label="Reference" value={reference} />
                <Row label="Status" value="Processing" />
                <Row label="Settlement" value="1–3 business days" success />
              </div>
              <Button onClick={handleClose} className="w-full rounded-xl h-11 bg-emerald-600 hover:bg-emerald-700 font-semibold">
                Done
              </Button>
            </div>
          )}

          {step === 'result' && failed && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto">
                <XCircle size={40} className="text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">Top-Up Failed</p>
                <p className="text-slate-500 text-sm mt-1.5">
                  We were unable to process your top-up of <span className="font-bold text-red-600">{formatCurrency(amountNum)}</span>. Please contact your relationship manager.
                </p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-left space-y-2 border border-red-100">
                <Row label="Amount Requested" value={formatCurrency(amountNum)} />
                <Row label="Status" value="Failed" error />
                <Row label="Reason" value="Service unavailable" />
              </div>
              <Button onClick={handleClose} className="w-full rounded-xl h-11 bg-slate-700 hover:bg-slate-800 font-semibold">
                Close
              </Button>
            </div>
          )}
        </div>

        {/* Support modal inside DialogContent to avoid stacking context issues */}
        {supportOpen && (
          <div className="absolute inset-0 z-[250] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
            <TopUpSupportContent onClose={() => { setSupportOpen(false); handleClose(); }} />
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

function Row({ label, value, highlight, success, error }: { label: string; value: string; highlight?: boolean; success?: boolean; error?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-emerald-700 text-base' : success ? 'text-emerald-600' : error ? 'text-red-600' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  );
}

// ─── TopUp Support Modal Content ──────────────────────────────────────────────
function TopUpSupportContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(239,68,68,0.25)' }}>
      <div className="px-6 pt-8 pb-6 text-center relative" style={{ background: 'linear-gradient(135deg,#1a0000 0%,#3b0a0a 50%,#7f1d1d 100%)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-red-300 hover:text-white transition-colors">
          <XCircle size={18} />
        </button>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.35)' }}>
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-white font-bold text-lg tracking-tight">Action Not Permitted</h2>
        <p className="text-red-300 text-xs mt-1">You cannot add money to your account</p>
      </div>
      <div className="px-6 py-5 space-y-3">
        <p className="text-white/60 text-sm leading-relaxed text-center">
          Your account funding feature is currently under maintenance. We apologise for the inconvenience. Please contact our support team for assistance.
        </p>
        <a href="https://wa.me/447877698035" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
          style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.20)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
            <MessageSquare size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-white/85 text-sm font-semibold">WhatsApp Support</p>
          </div>
        </a>
        <a href="mailto:halifaxapp1@gmail.com"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
          style={{ background: 'rgba(29,110,245,0.08)', border: '1px solid rgba(29,110,245,0.20)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29,110,245,0.15)' }}>
            <Mail size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white/85 text-sm font-semibold">Email Support</p>
          </div>
        </a>
        <button onClick={onClose} className="w-full h-11 rounded-2xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}>
          Close
        </button>
      </div>
    </div>
  );
}
