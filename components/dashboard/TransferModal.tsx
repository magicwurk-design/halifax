'use client';

import React, { useState, useMemo, useRef } from 'react';
import { ArrowRight, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, User, FileText, Search, Building2, Globe, ChevronLeft, Clock, Circle as XCircle, Receipt, Landmark, Shield } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatCurrency } from '@/lib/formatters';
import { UK_BANKS, INTL_BANKS, Bank } from '@/lib/banks';
import { Receipt as ReceiptType } from '@/lib/types';
import { TransactionReceipt } from './TransactionReceipt';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PinModal } from '@/components/auth/PinModal';
import { ContactSupportModal, SupportReason } from './ContactSupportModal';

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TransferMode = 'select' | 'internal' | 'external';
type Step = 'mode' | 'bank' | 'form' | 'confirm' | 'result' | 'receipt';

export function TransferModal({ open, onOpenChange }: TransferModalProps) {
  const { activeSubAccount, transfer, internalTransfer, findSubAccountByAny, getAdminAccount } = useApp();
  const balance = activeSubAccount?.balance ?? 0;

  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<TransferMode>('select');

  // Internal transfer state
  const [internalAccountNum, setInternalAccountNum] = useState('');
  const [internalRecipient, setInternalRecipient] = useState<{ id: string; name: string; accountNumber: string; bankName: string; bankFlag: string; isAdmin?: boolean } | null>(null);
  const [internalAmount, setInternalAmount] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [internalError, setInternalError] = useState('');
  const [isUnknownRecipient, setIsUnknownRecipient] = useState(false);
  const [lookupMethod, setLookupMethod] = useState<'account' | 'iban'>('account');

  // External transfer state (kept for type safety but Wire Transfer is blocked for clients)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [iban, setIban] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const pinOpenRef = React.useRef(false);

  // Support modal state
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportReason, setSupportReason] = useState<SupportReason>('blocked');

  const showSupport = (reason: SupportReason) => { setSupportReason(reason); setSupportOpen(true); };
  const hideSupport = () => setSupportOpen(false);

  const isInternational = selectedBank?.country !== 'United Kingdom';
  const amountNum = parseFloat(mode === 'internal' ? internalAmount : amount) || 0;

  const filteredUK = useMemo(() => UK_BANKS.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())), [bankSearch]);
  const filteredIntl = useMemo(() => INTL_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
    b.country.toLowerCase().includes(bankSearch.toLowerCase())
  ), [bankSearch]);

  const adminAccount = getAdminAccount();

  const lookupRecipient = () => {
    setInternalError('');
    const raw = internalAccountNum.trim();
    if (!raw) { setInternalError('Please enter an account number, IBAN, or email.'); return; }

    const normalized = raw.replace(/[\s\-]/g, '').toLowerCase();

    // Check admin account first
    const adminNormAcct = adminAccount.accountNumber.replace(/[\s\-]/g, '').toLowerCase();
    const adminNormSort = (adminAccount.sortCode ?? '').replace(/[\s\-]/g, '').toLowerCase();
    if (normalized === adminNormAcct || (adminNormSort.length > 0 && normalized === adminNormSort)) {
      setIsUnknownRecipient(false);
      setInternalRecipient({ id: 'ADMIN', name: adminAccount.name, accountNumber: adminAccount.accountNumber, bankName: 'Halifax Private Banking', bankFlag: '🇬🇧', isAdmin: true });
      return;
    }

    const found = findSubAccountByAny(raw);

    if (found && found.id === activeSubAccount?.id) {
      setInternalError("You can't transfer to your own account.");
      return;
    }

    if (!found) {
      setIsUnknownRecipient(true);
      setInternalRecipient({ id: 'UNKNOWN', name: 'Unknown Account', accountNumber: raw, bankName: 'Unknown', bankFlag: '🏦' });
      return;
    }

    const displayRef = found.user.bankType === 'international'
      ? (found.user.iban || found.user.accountNumber || raw)
      : (found.user.accountNumber || found.user.iban || raw);

    setIsUnknownRecipient(false);
    setInternalRecipient({
      id: found.id,
      name: found.user.name,
      accountNumber: displayRef,
      bankName: found.user.bankName,
      bankFlag: found.user.bankFlag,
    });
  };

  const handleInternalNext = () => {
    if (!internalAccountNum.trim()) { setInternalError('Please enter an account number or IBAN.'); return; }
    if (!internalRecipient) { setInternalError('Please tap "Look up" to find the recipient.'); return; }

    // Rule 1 — recipient must be an admin-created account
    if (isUnknownRecipient || internalRecipient.id === 'UNKNOWN') {
      showSupport('not-admin-client'); return;
    }

    if (amountNum <= 0) { setInternalError('Please enter a valid amount.'); return; }
    if (amountNum > balance) { setInternalError(`Insufficient funds. Available: ${formatCurrency(balance)}.`); return; }

    // Rule 2 — sender must be on Normal mode
    const acctStatus = activeSubAccount?.transactionStatus ?? 'normal';
    if (acctStatus !== 'normal') {
      showSupport('transfer-restricted'); return;
    }

    setInternalError('');
    setStep('confirm');
  };

  const handleConfirm = () => { pinOpenRef.current = true; setPinOpen(true); };

  const handlePinSuccess = () => {
    pinOpenRef.current = false; setPinOpen(false);

    // Block check
    if (activeSubAccount?.isBlocked) {
      showSupport('blocked'); return;
    }

    if (mode === 'internal') {
      const result = internalTransfer({
        recipientName: internalRecipient!.name,
        amount: amountNum,
        note: internalNote,
        bankName: internalRecipient!.bankName,
        bankFlag: internalRecipient!.bankFlag,
        isInternal: true,
        internalRecipientId: internalRecipient!.id,
      });
      if (result.receipt) {
        setReceipt(result.receipt);
        setStep('result');
      } else {
        setInternalError(result.message || 'Transfer could not be completed. Please try again.');
      }
    } else {
      const result = transfer({
        recipientName,
        amount: amountNum,
        note,
        bankName: selectedBank?.name ?? 'Unknown Bank',
        bankFlag: selectedBank?.flag ?? '🏦',
      });
      if (result.receipt) {
        setReceipt(result.receipt);
        setStep('result');
      } else {
        setErrorMsg(result.message || 'Transfer could not be completed. Please try again.');
      }
    }
  };

  const reset = () => {
    setStep('mode'); setMode('select');
    setInternalAccountNum(''); setInternalRecipient(null); setLookupMethod('account');
    setInternalAmount(''); setInternalNote(''); setInternalError('');
    setSelectedBank(null); setBankSearch('');
    setRecipientName(''); setAccountNumber(''); setSortCode('');
    setAmount(''); setNote(''); setIban('');
    setErrorMsg(''); setReceipt(null); pinOpenRef.current = false; setPinOpen(false);
    setSupportOpen(false); setIsUnknownRecipient(false);
  };

  const handleClose = () => { onOpenChange(false); setTimeout(reset, 300); };
  const resultStatus = receipt?.status ?? 'completed';

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !pinOpenRef.current) handleClose(); }}>
        <DialogContent
          className="w-full border-0 shadow-2xl p-0 overflow-hidden flex flex-col"
          style={{ maxHeight: 'min(92svh, 92vh)', touchAction: 'manipulation' }}
          onInteractOutside={(e) => { if (pinOpenRef.current) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (pinOpenRef.current) e.preventDefault(); }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0 sm:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>

          {step !== 'receipt' && (
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-5 pt-5 pb-4 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                {step !== 'mode' && (
                  <button onClick={() => {
                    if (step === 'confirm') setStep('form');
                    else if (step === 'form') setStep('mode');
                    else setStep('mode');
                  }} className="w-8 h-8 rounded-full bg-blue-600/60 flex items-center justify-center flex-shrink-0">
                    <ChevronLeft size={16} />
                  </button>
                )}
                <div>
                  <p className="text-white text-base font-bold leading-none">Send Money</p>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {step === 'mode' ? 'Choose transfer type' :
                     step === 'form' ? 'International/UK Transfer' :
                     step === 'confirm' ? 'Review & confirm' :
                     step === 'result' ? 'Transfer complete' : ''}
                  </p>
                </div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 bg-blue-600/40 rounded-xl px-3 py-1.5">
                <span className="text-blue-200 text-xs">Available:</span>
                <span className="text-white text-sm font-bold">{formatCurrency(balance)}</span>
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">

            {/* Mode selection */}
            {step === 'mode' && (
              <div className="p-5 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Transfer type</p>

                {/* Internal — allowed */}
                <button onClick={() => { setMode('internal'); setStep('form'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-blue-100 bg-blue-50 hover:border-blue-300 transition-all text-left active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Landmark size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">International/UK Transfer</p>
                    <p className="text-xs text-slate-500 mt-0.5">Send to any account on this platform · instant · free</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Instant</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">No fees</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-blue-400 flex-shrink-0" />
                </button>

                {/* Wire Transfer — blocked for clients, shows support modal */}
                <button onClick={() => showSupport('external-transfer')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-200 transition-all text-left active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Globe size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Wire Transfer</p>
                    <p className="text-xs text-slate-500 mt-0.5">Send to UK banks, international accounts</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">UK & International</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />
                </button>
              </div>
            )}

            {/* Internal transfer form */}
            {step === 'form' && mode === 'internal' && (
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Landmark size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-800">International/UK Transfer</p>
                    <p className="text-[10px] text-blue-500">Instant · secure · no fees</p>
                  </div>
                  <Shield size={14} className="text-blue-400 ml-auto" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Account Number, IBAN, or Email</Label>
                  <p className="text-[10px] text-slate-400">Halifax/Barclays/HSBC account no. · international IBAN · sort code · or registered email</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Account no., IBAN, sort code, or email"
                      value={internalAccountNum}
                      onChange={e => {
                        const raw = e.target.value;
                        const val = raw.includes('@')
                          ? raw.slice(0, 80)
                          : raw.toUpperCase().replace(/[^A-Z0-9 \-]/g, '').slice(0, 39);
                        setInternalAccountNum(val);
                        setLookupMethod(/[A-Z@]/.test(val) ? 'iban' : 'account');
                        setInternalRecipient(null);
                      }}
                      className="font-mono tracking-wider rounded-xl border-slate-200 h-11 text-sm"
                      autoCapitalize="off"
                      maxLength={80}
                      onKeyDown={e => { if (e.key === 'Enter') lookupRecipient(); }}
                    />
                    <Button onClick={lookupRecipient} className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold whitespace-nowrap">
                      Look up
                    </Button>
                  </div>

                  {internalRecipient && !isUnknownRecipient && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mt-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)' }}>
                        {internalRecipient.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-emerald-800">{internalRecipient.name}</p>
                        <p className="text-xs text-emerald-600">{internalRecipient.bankFlag} {internalRecipient.bankName}</p>
                        {internalRecipient.accountNumber && (
                          <p className="text-[10px] text-emerald-500 font-mono mt-0.5">{internalRecipient.accountNumber}</p>
                        )}
                      </div>
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    </div>
                  )}

                  {internalRecipient && isUnknownRecipient && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 mt-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>?
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-800">Not found: {internalRecipient.accountNumber}</p>
                        <p className="text-xs text-amber-600">No platform account matches this identifier</p>
                      </div>
                      <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">£</span>
                    <Input type="number" placeholder="0.00" value={internalAmount}
                      onChange={e => setInternalAmount(e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 h-12 text-xl font-bold"
                      min="0.01" step="0.01" />
                  </div>
                  <p className="text-xs text-slate-400">Available: <span className="font-semibold text-slate-600">{formatCurrency(balance)}</span></p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Reference (optional)</Label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input placeholder="Payment note" value={internalNote}
                      onChange={e => setInternalNote(e.target.value)}
                      className="pl-9 rounded-xl border-slate-200 h-11" />
                  </div>
                </div>

                {internalError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" />{internalError}
                  </div>
                )}

                <Button onClick={handleInternalNext} className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-700 gap-2 text-base font-semibold">
                  Review Transfer <ArrowRight size={17} />
                </Button>
              </div>
            )}

            {/* Confirm */}
            {step === 'confirm' && (
              <div className="p-5 space-y-4 pb-2 overflow-y-auto">
                <div className="bg-gradient-to-b from-blue-50 to-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transfer Summary</p>
                  <div className="space-y-2.5 pt-1">
                    <SummaryRow label="Recipient" value={internalRecipient?.name ?? ''} />
                    {internalRecipient && (
                      <SummaryRow label="Bank" value={`${internalRecipient.bankFlag} ${internalRecipient.bankName}`} />
                    )}
                    <div className="h-px bg-slate-200" />
                    <SummaryRow label="Amount" value={formatCurrency(amountNum)} highlight />
                    <SummaryRow label="Fee" value="Free" success />
                    <div className="h-px bg-slate-200" />
                    <SummaryRow label="Balance after" value={formatCurrency(balance - amountNum)} />
                    {internalNote && <SummaryRow label="Reference" value={internalNote} />}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                  <Shield size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">International/UK Transfer — funds arrive immediately.</p>
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">Verify all details before confirming. Transfers cannot be reversed once submitted.</p>
                </div>
              </div>
            )}

            {/* Result */}
            {step === 'result' && receipt && (
              <div className="p-5 text-center space-y-5 py-8">
                <ResultIcon status={resultStatus} />
                <div>
                  <p className="text-xl font-bold text-slate-800">
                    {resultStatus === 'completed' ? 'Transfer Sent!' : resultStatus === 'pending' ? 'Transfer Pending' : 'Transfer Failed'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1.5">
                    {resultStatus === 'completed' && <><span className="font-bold text-slate-700">{formatCurrency(amountNum)}</span> sent to <span className="font-semibold text-slate-700">{receipt.recipientName}</span></>}
                    {resultStatus === 'pending' && 'Your transfer is being processed.'}
                    {resultStatus === 'failed' && receipt.failureReason}
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5 font-medium">International/UK Transfer</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100">
                  <SummaryRow label="Reference" value={receipt.reference} />
                  {resultStatus !== 'failed' && <SummaryRow label="New Balance" value={formatCurrency(receipt.newBalance)} highlight />}
                  <SummaryRow label="Status" value={resultStatus === 'completed' ? 'Completed' : resultStatus === 'pending' ? 'Processing' : 'Declined'} success={resultStatus === 'completed'} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('receipt')} className="flex-1 rounded-xl h-11 border-slate-200 gap-2 font-semibold">
                    <Receipt size={14} />Receipt
                  </Button>
                  <Button onClick={handleClose} className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 font-semibold">Done</Button>
                </div>
              </div>
            )}

            {step === 'receipt' && receipt && (
              <TransactionReceipt receipt={receipt} onBack={() => setStep('result')} onClose={handleClose} />
            )}
          </div>

          {/* Sticky confirm footer */}
          {step === 'confirm' && (
            <div
              className="flex-shrink-0 flex gap-3 px-5 pt-4 border-t border-white/5"
              style={{ background: 'rgba(17,24,39,0.97)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            >
              <Button variant="outline" onClick={() => setStep('form')} className="flex-1 rounded-xl h-12 border-slate-200 text-sm font-semibold">Back</Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-semibold text-sm"
                style={{ touchAction: 'manipulation' }}
              >
                Confirm
              </Button>
            </div>
          )}

          {/* PIN modal */}
          {activeSubAccount && pinOpen && (
            <div className="absolute inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(7,19,48,0.85)', backdropFilter: 'blur(8px)' }}>
              <PinModal open={pinOpen} mode="verify" pin={activeSubAccount.pin}
                onSuccess={handlePinSuccess} onCancel={() => { pinOpenRef.current = false; setPinOpen(false); }}
                title="Confirm Transfer" subtitle="Enter your PIN to authorise this payment"
                profilePhoto={activeSubAccount.user.profilePhoto}
                accountId={activeSubAccount.id}
                accountName={activeSubAccount.user.name} />
            </div>
          )}

          {/* Support modal — inside DialogContent to avoid stacking context issues */}
          {supportOpen && (
            <div className="absolute inset-0 z-[250] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
              <SupportModalContent reason={supportReason} onClose={hideSupport} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryRow({ label, value, highlight, success }: { label: string; value: string; highlight?: boolean; success?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-blue-700 text-base' : success ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}

function ResultIcon({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const cfg = {
    completed: { icon: CheckCircle2, ringBg: 'bg-emerald-50', ringBorder: 'border-emerald-100', iconClass: 'text-emerald-500' },
    pending: { icon: Clock, ringBg: 'bg-amber-50', ringBorder: 'border-amber-100', iconClass: 'text-amber-500' },
    failed: { icon: XCircle, ringBg: 'bg-red-50', ringBorder: 'border-red-100', iconClass: 'text-red-500' },
  }[status];
  const Icon = cfg.icon;
  return (
    <div className={`w-20 h-20 rounded-full ${cfg.ringBg} border-4 ${cfg.ringBorder} flex items-center justify-center mx-auto`}>
      <Icon size={40} className={cfg.iconClass} />
    </div>
  );
}

// ─── Support Modal Content (rendered inside DialogContent as absolute overlay) ─
function SupportModalContent({ reason, onClose }: { reason: SupportReason; onClose: () => void }) {
  const ref = React.useMemo(() => 'HC-' + Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  const content: Record<SupportReason, { title: string; subtitle: string; message: string }> = {
    blocked: { title: 'Account Restricted', subtitle: 'Your account access has been suspended', message: 'Your account has been temporarily restricted by Halifax. Please contact our support team to resolve this and regain access.' },
    'external-transfer': { title: 'Transfer Not Permitted', subtitle: 'External transfers are not available', message: 'You can only transfer to accounts on this platform. External bank transfers are not permitted. Please contact support for assistance.' },
    'transfer-restricted': { title: 'Transfer Unavailable', subtitle: 'This transaction cannot be completed', message: 'Your account currently has transfer restrictions in place. Please contact our support team for assistance.' },
    topup: { title: 'Action Not Permitted', subtitle: 'You cannot add money to your account', message: 'Your account funding feature is currently under maintenance. We apologise for the inconvenience. Please contact our support team for assistance.' },
    'not-admin-client': { title: 'Recipient Not Found', subtitle: 'No matching platform account', message: 'The details you entered do not match any account on this platform. Only transfers to Halifax platform accounts are permitted. Please contact support for assistance.' },
  };
  const { title, subtitle, message } = content[reason];
  return (
    <div className="w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(239,68,68,0.25)' }}>
      <div className="px-6 pt-8 pb-6 text-center relative" style={{ background: 'linear-gradient(135deg,#1a0000 0%,#3b0a0a 50%,#7f1d1d 100%)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-red-300 hover:text-white transition-colors"><XCircle size={18} /></button>
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.35)' }}>
          <Shield size={32} className="text-red-400" />
        </div>
        <h2 className="text-white font-bold text-lg tracking-tight">{title}</h2>
        <p className="text-red-300 text-xs mt-1">{subtitle}</p>
      </div>
      <div className="px-6 py-5 space-y-3">
        <p className="text-white/60 text-sm leading-relaxed text-center">{message}</p>
        <a href="https://wa.me/447877698035" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
          style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.20)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
            <ArrowRight size={16} className="text-green-400" />
          </div>
          <div>
            <p className="text-white/85 text-sm font-semibold">WhatsApp Support</p>
          </div>
        </a>
        <a href="mailto:halifaxapp1@gmail.com"
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
          style={{ background: 'rgba(29,110,245,0.08)', border: '1px solid rgba(29,110,245,0.20)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29,110,245,0.15)' }}>
            <FileText size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white/85 text-sm font-semibold">Email Support</p>
          </div>
        </a>
        <button onClick={onClose} className="w-full h-11 rounded-2xl text-sm font-bold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}>Close</button>
        <p className="text-white/20 text-[10px] text-center">Reference: {ref} · Halifax Private Banking</p>
      </div>
    </div>
  );
}
