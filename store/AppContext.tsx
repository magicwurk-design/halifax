'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react';
import {
  AppState, CardSettings, Transaction, TransferPayload,
  Receipt, User, TransferOutcome, SubAccount, AdminAccount,
} from '@/lib/types';
import {
  loadStateFromSupabase, loadStateLocal, saveStateLocal, clearState, getDefaultState,
  makeAuditEntry, upsertSubAccount, upsertTransaction, deleteTransactionFromSupabase,
  deleteAllTransactionsForAccount, deleteSubAccountFromSupabase, saveAuditEntryToSupabase,
  resetAllSupabaseData, upsertAdminBalance,
} from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { makeSeedSubAccount, ADMIN_ACCOUNT } from '@/lib/mockData';
import { generateReference, formatCurrency } from '@/lib/formatters';
import { saveAdminSession, loadAdminSession, clearAdminSession, saveClientSession, loadClientSession, clearClientSession } from '@/lib/auth';

const MAX_AUDIT = 100;

function genId(): string {
  return Math.random().toString(36).slice(2, 11).toUpperCase();
}

function addAudit(state: AppState, action: string, detail: string): AppState['auditLog'] {
  const entry = makeAuditEntry(action, detail);
  saveAuditEntryToSupabase(entry).catch(() => {});
  return [entry, ...state.auditLog].slice(0, MAX_AUDIT);
}

type Action =
  | { type: 'HYDRATE'; state: AppState }
  | { type: 'SELECT_SUBACCOUNT'; id: string }
  | { type: 'DESELECT_SUBACCOUNT' }
  | { type: 'CREATE_SUBACCOUNT'; subAccount: SubAccount }
  | { type: 'DELETE_SUBACCOUNT'; id: string }
  | { type: 'TRANSFER'; subAccountId: string; payload: TransferPayload; outcome: TransferOutcome; newTx: Transaction }
  | { type: 'INTERNAL_TRANSFER'; fromId: string; toId: string | 'ADMIN'; amount: number; debitTx: Transaction; creditTx?: Transaction; newBalance: number; newRecipientBalance?: number }
  | { type: 'TOPUP'; subAccountId: string; amount: number; newTx: Transaction }
  | { type: 'UPDATE_CARD'; subAccountId: string; settings: Partial<CardSettings> }
  | { type: 'ADMIN_SET_USER'; subAccountId: string; user: Partial<User>; auditDetail: string }
  | { type: 'ADMIN_SET_BALANCE'; subAccountId: string; balance: number; auditDetail: string }
  | { type: 'ADMIN_ADD_TRANSACTION'; subAccountId: string; transaction: Transaction; auditDetail: string }
  | { type: 'ADMIN_DELETE_TRANSACTION'; subAccountId: string; txId: string }
  | { type: 'ADMIN_CLEAR_TRANSACTIONS'; subAccountId: string }
  | { type: 'ADMIN_SET_CARD'; subAccountId: string; settings: Partial<CardSettings>; auditDetail: string }
  | { type: 'ADMIN_SET_SUBACCOUNT_PIN'; subAccountId: string; pin: string }
  | { type: 'ADMIN_SET_BLOCKED'; subAccountId: string; isBlocked: boolean; auditDetail: string }
  | { type: 'ADMIN_SET_ACCOUNT_TX_STATUS'; subAccountId: string; transactionStatus: import('@/lib/types').AccountTransactionStatus; auditDetail: string }
  | { type: 'ADMIN_UPDATE_BALANCE'; delta: number }
  | { type: 'ADMIN_RESET_DEMO' };

function updateSubAccount(state: AppState, id: string, updater: (sa: SubAccount) => SubAccount): AppState {
  return { ...state, subAccounts: state.subAccounts.map((sa) => (sa.id === id ? updater(sa) : sa)) };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.state, activeSubAccountId: state.activeSubAccountId };
    case 'SELECT_SUBACCOUNT':
      return { ...state, activeSubAccountId: action.id };
    case 'DESELECT_SUBACCOUNT':
      return { ...state, activeSubAccountId: null };
    case 'CREATE_SUBACCOUNT':
      return { ...state, subAccounts: [...state.subAccounts, action.subAccount], auditLog: addAudit(state, 'Subaccount Created', action.subAccount.user.name) };
    case 'DELETE_SUBACCOUNT':
      return { ...state, subAccounts: state.subAccounts.filter((sa) => sa.id !== action.id), activeSubAccountId: state.activeSubAccountId === action.id ? null : state.activeSubAccountId, auditLog: addAudit(state, 'Subaccount Deleted', `ID: ${action.id}`) };
    case 'TOPUP':
      return updateSubAccount(state, action.subAccountId, (sa) => ({ ...sa, balance: parseFloat((sa.balance + action.amount).toFixed(2)), transactions: [action.newTx, ...sa.transactions] }));
    case 'UPDATE_CARD':
      return updateSubAccount(state, action.subAccountId, (sa) => ({ ...sa, cardSettings: { ...sa.cardSettings, ...action.settings } }));
    case 'TRANSFER': {
      const { subAccountId, payload, outcome, newTx } = action;
      return updateSubAccount(state, subAccountId, (sa) => ({
        ...sa,
        balance: outcome !== 'failed' ? parseFloat((sa.balance - payload.amount).toFixed(2)) : sa.balance,
        transactions: [newTx, ...sa.transactions],
      }));
    }
    case 'INTERNAL_TRANSFER': {
      let nextState = updateSubAccount(state, action.fromId, (sa) => ({
        ...sa,
        balance: action.newBalance,
        transactions: [action.debitTx, ...sa.transactions],
      }));
      if (action.toId !== 'ADMIN' && action.creditTx && action.newRecipientBalance !== undefined) {
        nextState = updateSubAccount(nextState, action.toId, (sa) => ({
          ...sa,
          balance: action.newRecipientBalance!,
          transactions: [action.creditTx!, ...sa.transactions],
        }));
      } else if (action.toId === 'ADMIN') {
        const senderOriginalBalance = state.subAccounts.find(s => s.id === action.fromId)?.balance ?? 0;
        const transferred = parseFloat((senderOriginalBalance - action.newBalance).toFixed(2));
        nextState = { ...nextState, adminAccount: { ...state.adminAccount, balance: parseFloat((state.adminAccount.balance + transferred).toFixed(2)) } };
      }
      return nextState;
    }
    case 'ADMIN_UPDATE_BALANCE':
      return { ...state, adminAccount: { ...state.adminAccount, balance: parseFloat((state.adminAccount.balance + action.delta).toFixed(2)) } };
    case 'ADMIN_SET_USER':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'User Updated', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, user: { ...sa.user, ...action.user } }));
    case 'ADMIN_SET_BALANCE':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Balance Changed', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, balance: parseFloat(action.balance.toFixed(2)) }));
    case 'ADMIN_ADD_TRANSACTION':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Transaction Injected', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, transactions: [action.transaction, ...sa.transactions] }));
    case 'ADMIN_DELETE_TRANSACTION':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Transaction Deleted', `ID: ${action.txId}`) }, action.subAccountId, (sa) => ({ ...sa, transactions: sa.transactions.filter((t) => t.id !== action.txId) }));
    case 'ADMIN_CLEAR_TRANSACTIONS':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Transactions Cleared', `Account: ${action.subAccountId}`) }, action.subAccountId, (sa) => ({ ...sa, transactions: [] }));
    case 'ADMIN_SET_CARD':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Card Settings Changed', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, cardSettings: { ...sa.cardSettings, ...action.settings } }));
    case 'ADMIN_SET_SUBACCOUNT_PIN':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'PIN Changed', `Account: ${action.subAccountId}`) }, action.subAccountId, (sa) => ({ ...sa, pin: action.pin, pinSet: true }));
    case 'ADMIN_SET_BLOCKED':
      return updateSubAccount({ ...state, auditLog: addAudit(state, action.isBlocked ? 'Account Blocked' : 'Account Unblocked', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, isBlocked: action.isBlocked }));
    case 'ADMIN_SET_ACCOUNT_TX_STATUS':
      return updateSubAccount({ ...state, auditLog: addAudit(state, 'Transaction Status Changed', action.auditDetail) }, action.subAccountId, (sa) => ({ ...sa, transactionStatus: action.transactionStatus }));
    case 'ADMIN_RESET_DEMO': {
      const fresh = getDefaultState();
      return { ...fresh, auditLog: [makeAuditEntry('Data Reset', 'All client accounts restored to defaults')] };
    }
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  isHydrated: boolean;
  isAdmin: boolean;
  isClientLoggedIn: boolean;
  loggedInClientId: string | null;
  activeSubAccount: SubAccount | null;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  clientLogin: (subAccountId: string, email: string) => void;
  clientLogout: () => void;
  selectSubAccount: (id: string) => void;
  deselectSubAccount: () => void;
  createSubAccount: (name: string, email: string, sortCode: string, accountNumber: string, password: string, pin: string, bankId?: string, bankName?: string, bankFlag?: string, bankType?: import('@/lib/types').BankType, iban?: string, swiftBic?: string, profilePhoto?: string) => Promise<void>;
  deleteSubAccount: (id: string) => void;
  transfer: (payload: TransferPayload) => { success: boolean; message: string; receipt?: Receipt };
  internalTransfer: (payload: TransferPayload) => { success: boolean; message: string; receipt?: Receipt };
  topUp: (amount: number, reference: string) => void;
  updateCard: (settings: Partial<CardSettings>) => void;
  adminSetUser: (subAccountId: string, user: Partial<User>) => void;
  adminSetBalance: (subAccountId: string, balance: number) => void;
  adminAddTransaction: (subAccountId: string, tx: Omit<Transaction, 'id'>) => void;
  adminDeleteTransaction: (subAccountId: string, txId: string) => void;
  adminClearTransactions: (subAccountId: string) => void;
  adminSetCard: (subAccountId: string, settings: Partial<CardSettings>) => void;
  adminSetSubAccountPin: (subAccountId: string, pin: string) => void;
  adminSetBlocked: (subAccountId: string, isBlocked: boolean) => void;
  adminSetAccountTxStatus: (subAccountId: string, transactionStatus: import('@/lib/types').AccountTransactionStatus) => void;
  adminResetDemo: () => Promise<void>;
  adminDeductBalance: (amount: number) => void;
  // Lookup helpers
  findSubAccountByAccountNumber: (accountNumber: string) => SubAccount | null;
  findSubAccountByIban: (iban: string) => SubAccount | null;
  findSubAccountByAny: (query: string) => SubAccount | null;
  getAdminAccount: () => AdminAccount;
}

const defaultCtx: AppContextValue = {
  state: getDefaultState(), isHydrated: false, isAdmin: false, isClientLoggedIn: false, loggedInClientId: null, activeSubAccount: null,
  loginAdmin: () => {}, logoutAdmin: () => {}, clientLogin: () => {}, clientLogout: () => {},
  selectSubAccount: () => {}, deselectSubAccount: () => {},
  createSubAccount: async () => {}, deleteSubAccount: () => {},
  transfer: () => ({ success: false, message: '' }),
  internalTransfer: () => ({ success: false, message: '' }),
  topUp: () => {}, updateCard: () => {},
  adminSetUser: () => {}, adminSetBalance: () => {},
  adminAddTransaction: () => {}, adminDeleteTransaction: () => {},
  adminClearTransactions: () => {}, adminSetCard: () => {},
  adminSetSubAccountPin: () => {},
  adminSetBlocked: () => {}, adminSetAccountTxStatus: () => {},
  adminResetDemo: async () => {},
  adminDeductBalance: () => {},
  findSubAccountByAccountNumber: () => null,
  findSubAccountByIban: () => null,
  findSubAccountByAny: () => null,
  getAdminAccount: () => ADMIN_ACCOUNT,
};

const AppContext = createContext<AppContextValue>(defaultCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getDefaultState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [loggedInClientId, setLoggedInClientId] = useState<string | null>(null);
  const pendingSaves = useRef<Set<string>>(new Set());
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let saved: AppState;
      try {
        saved = await loadStateFromSupabase();
        if (!cancelled) saveStateLocal(saved);
      } catch {
        saved = loadStateLocal();
      }
      if (cancelled) return;
      dispatch({ type: 'HYDRATE', state: saved });
      if (loadAdminSession()) setIsAdmin(true);
      const cs = loadClientSession();
      if (cs) {
        setIsClientLoggedIn(true);
        setLoggedInClientId(cs.subAccountId);
        dispatch({ type: 'SELECT_SUBACCOUNT', id: cs.subAccountId });
      }
      setIsHydrated(true);
    }
    hydrate();
    return () => { cancelled = true; };
  }, []);

  // ── Supabase Realtime subscriptions ─────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    // Subscribe to sub_accounts changes
    const accountsSub = supabase
      .channel('realtime:sub_accounts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sub_accounts' },
        async () => {
          // Re-fetch full state on any account change
          try {
            const fresh = await loadStateFromSupabase();
            const cs = loadClientSession();
            dispatch({ type: 'HYDRATE', state: fresh });
            if (cs) dispatch({ type: 'SELECT_SUBACCOUNT', id: cs.subAccountId });
            saveStateLocal(fresh);
          } catch { /* fail silently */ }
        }
      )
      .subscribe();

    // Subscribe to transactions changes
    const txSub = supabase
      .channel('realtime:transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' },
        async () => {
          try {
            const fresh = await loadStateFromSupabase();
            const cs = loadClientSession();
            dispatch({ type: 'HYDRATE', state: fresh });
            if (cs) dispatch({ type: 'SELECT_SUBACCOUNT', id: cs.subAccountId });
            saveStateLocal(fresh);
          } catch { /* fail silently */ }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accountsSub);
      supabase.removeChannel(txSub);
    };
  }, [isHydrated]);

  const scheduleSave = useCallback((sa: SubAccount) => {
    const existing = saveTimers.current.get(sa.id);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      upsertSubAccount(sa).catch(() => {});
      saveTimers.current.delete(sa.id);
    }, 1200);
    saveTimers.current.set(sa.id, timer);
  }, []);

  useEffect(() => {
    if (isHydrated) saveStateLocal(state);
  }, [state, isHydrated]);

  const activeSubAccount = state.activeSubAccountId
    ? (state.subAccounts.find((sa) => sa.id === state.activeSubAccountId) ?? null)
    : null;

  const findSubAccountByAccountNumber = useCallback((accountNumber: string): SubAccount | null => {
    if (!accountNumber.trim()) return null;
    const clean = accountNumber.replace(/[\s\-]/g, '').toLowerCase();
    if (!clean) return null;
    return state.subAccounts.find(sa => {
      const stored = (sa.user.accountNumber ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    }) ?? null;
  }, [state.subAccounts]);

  const findSubAccountByIban = useCallback((iban: string): SubAccount | null => {
    if (!iban.trim()) return null;
    // Strip spaces AND hyphens, case-insensitive
    const clean = iban.replace(/[\s\-]/g, '').toLowerCase();
    return state.subAccounts.find(sa => {
      const stored = (sa.user.iban ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    }) ?? null;
  }, [state.subAccounts]);

  // Universal lookup: account number → IBAN → sort code → email.
  // Works for ALL admin-created clients: Halifax, Barclays, HSBC, international IBAN accounts, etc.
  const findSubAccountByAny = useCallback((query: string): SubAccount | null => {
    if (!query.trim()) return null;
    const clean = query.replace(/[\s\-]/g, '').toLowerCase();
    if (!clean) return null;

    // 1. Account number (UK/Halifax/Barclays/any UK bank clients)
    const byAcct = state.subAccounts.find(sa => {
      const stored = (sa.user.accountNumber ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    });
    if (byAcct) return byAcct;

    // 2. IBAN (international clients — strip spaces & hyphens, case-insensitive)
    const byIban = state.subAccounts.find(sa => {
      const stored = (sa.user.iban ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    });
    if (byIban) return byIban;

    // 3. Sort code fallback (UK clients — allows lookup by "20-41-63" or "204163")
    const bySortCode = state.subAccounts.find(sa => {
      const stored = (sa.user.sortCode ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    });
    if (bySortCode) return bySortCode;

    // 4. SWIFT/BIC fallback (international clients)
    const bySwift = state.subAccounts.find(sa => {
      const stored = (sa.user.swiftBic ?? '').replace(/[\s\-]/g, '').toLowerCase();
      return stored.length > 0 && stored === clean;
    });
    if (bySwift) return bySwift;

    // 5. Email fallback (any client type — case-insensitive)
    const byEmail = state.subAccounts.find(sa =>
      sa.user.email.trim().toLowerCase() === query.trim().toLowerCase()
    );
    return byEmail ?? null;
  }, [state.subAccounts]);

  const getAdminAccount = useCallback((): AdminAccount => {
    return state.adminAccount;
  }, [state.adminAccount]);

  const loginAdmin = useCallback(() => { saveAdminSession(); setIsAdmin(true); }, []);
  const logoutAdmin = useCallback(() => { clearAdminSession(); setIsAdmin(false); dispatch({ type: 'DESELECT_SUBACCOUNT' }); }, []);
  const selectSubAccount = useCallback((id: string) => { dispatch({ type: 'SELECT_SUBACCOUNT', id }); }, []);
  const deselectSubAccount = useCallback(() => { dispatch({ type: 'DESELECT_SUBACCOUNT' }); }, []);

  const createSubAccount = useCallback(async (
    name: string, email: string, sortCode: string, accountNumber: string,
    password: string, pin: string,
    bankId = 'halifax', bankName = 'Halifax Private Banking', bankFlag = '🇬🇧',
    bankType: import('@/lib/types').BankType = 'halifax',
    iban = '', swiftBic = '', profilePhoto = ''
  ) => {
    const initials = name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    const sa = makeSeedSubAccount({
      name: name.trim(), email: email.trim(), avatarInitials: initials,
      sortCode: sortCode.trim(), accountNumber: accountNumber.trim(),
      iban: iban.trim(), swiftBic: swiftBic.trim(),
      bankId, bankName, bankFlag, bankType, profilePhoto,
    });
    const newSa = { ...sa, balance: 0, pinSet: true, pin: pin.trim(), password: password.trim(), isBlocked: false, transactionStatus: 'normal' as const };
    dispatch({ type: 'CREATE_SUBACCOUNT', subAccount: newSa });
    await upsertSubAccount(newSa).catch(() => {});
  }, []);

  const deleteSubAccount = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SUBACCOUNT', id });
    deleteSubAccountFromSupabase(id).catch(() => {});
  }, []);

  const topUp = useCallback((amount: number, reference: string) => {
    if (!state.activeSubAccountId) return;
    const newTx: Transaction = {
      id: genId(), type: 'credit', amount,
      description: 'Account Top-Up', recipient: 'Halifax Digital Bank',
      category: 'transfer', timestamp: new Date().toISOString(),
      status: 'completed', reference,
    };
    dispatch({ type: 'TOPUP', subAccountId: state.activeSubAccountId, amount, newTx });
    const sa = state.subAccounts.find((s) => s.id === state.activeSubAccountId);
    if (sa) {
      const newBalance = parseFloat((sa.balance + amount).toFixed(2));
      upsertSubAccount({ ...sa, balance: newBalance }).catch(() => {});
      upsertTransaction(state.activeSubAccountId, newTx).catch(() => {});
    }
  }, [state.activeSubAccountId, state.subAccounts]);

  const updateCard = useCallback((settings: Partial<CardSettings>) => {
    if (!state.activeSubAccountId) return;
    dispatch({ type: 'UPDATE_CARD', subAccountId: state.activeSubAccountId, settings });
    const sa = state.subAccounts.find((s) => s.id === state.activeSubAccountId);
    if (sa) upsertSubAccount({ ...sa, cardSettings: { ...sa.cardSettings, ...settings } }).catch(() => {});
  }, [state.activeSubAccountId, state.subAccounts]);

  // External transfer (to banks outside Halifax)
  const transfer = useCallback((payload: TransferPayload): { success: boolean; message: string; receipt?: Receipt } => {
    if (!state.activeSubAccountId || !activeSubAccount) return { success: false, message: 'No active subaccount.' };
    if (payload.amount <= 0) return { success: false, message: 'Amount must be greater than zero.' };
    if (payload.amount > activeSubAccount.balance) return { success: false, message: 'Insufficient funds.' };
    if (!payload.recipientName.trim()) return { success: false, message: 'Recipient name is required.' };

    const acctStatus = activeSubAccount.transactionStatus ?? 'normal';
    const outcome: TransferOutcome =
      acctStatus === 'pending' ? 'pending'
      : acctStatus === 'failed' ? 'failed'
      : 'success';

    const txStatus = outcome === 'success' ? 'completed' : outcome === 'pending' ? 'pending' : 'failed';
    const reference = 'TRF-' + generateReference();
    const newBalance = outcome !== 'failed' ? parseFloat((activeSubAccount.balance - payload.amount).toFixed(2)) : activeSubAccount.balance;

    const newTx: Transaction = {
      id: genId(), type: 'debit', amount: payload.amount,
      description: payload.note || `Transfer to ${payload.recipientName}`,
      recipient: payload.recipientName, category: 'transfer',
      timestamp: new Date().toISOString(), status: txStatus, reference,
    };

    const receipt: Receipt = {
      id: genId(), status: txStatus, recipientName: payload.recipientName,
      amount: payload.amount, note: payload.note ?? '',
      bankName: payload.bankName ?? 'Unknown Bank', bankFlag: payload.bankFlag ?? '🏦',
      reference, timestamp: new Date().toISOString(),
      senderName: activeSubAccount.user.name,
      senderAccount: activeSubAccount.user.accountNumber || activeSubAccount.user.iban || '',
      senderSortCode: activeSubAccount.user.sortCode || activeSubAccount.user.swiftBic || '',
      newBalance,
      failureReason: outcome === 'failed' ? 'Transaction declined by the receiving bank.' : undefined,
    };

    dispatch({ type: 'TRANSFER', subAccountId: state.activeSubAccountId, payload, outcome, newTx });
    const updated = { ...activeSubAccount, balance: newBalance };
    upsertSubAccount(updated).catch(() => {});
    upsertTransaction(state.activeSubAccountId, newTx).catch(() => {});

    return { success: outcome !== 'failed', message: outcome === 'success' ? 'Transfer completed.' : outcome === 'pending' ? 'Transfer is processing.' : 'Transfer was declined.', receipt };
  }, [state.activeSubAccountId, activeSubAccount]);

  // Internal transfer: platform-to-platform (any subaccount to any other subaccount, or to admin)
  const internalTransfer = useCallback((payload: TransferPayload): { success: boolean; message: string; receipt?: Receipt } => {
    const now = new Date().toISOString();
    const reference = 'HLX-' + generateReference();

    // Helper to build a failed receipt so the result screen always has something to show
    const failReceipt = (reason: string): Receipt => ({
      id: genId(), status: 'failed',
      recipientName: payload.recipientName,
      amount: payload.amount, note: payload.note ?? '',
      bankName: payload.bankName ?? 'Halifax Private Banking',
      bankFlag: payload.bankFlag ?? '🏦',
      reference, timestamp: now,
      senderName: activeSubAccount?.user.name ?? '',
      senderAccount: activeSubAccount?.user.accountNumber || activeSubAccount?.user.iban || '',
      senderSortCode: activeSubAccount?.user.sortCode || activeSubAccount?.user.swiftBic || '',
      newBalance: activeSubAccount?.balance ?? 0,
      isInternal: true,
      failureReason: reason,
    });

    if (!state.activeSubAccountId || !activeSubAccount) return { success: false, message: 'No active subaccount.', receipt: failReceipt('Session expired. Please log in again.') };
    if (payload.amount <= 0) return { success: false, message: 'Amount must be greater than zero.', receipt: failReceipt('Invalid amount.') };
    if (payload.amount > activeSubAccount.balance) return { success: false, message: 'Insufficient funds.', receipt: failReceipt('Insufficient funds in your account.') };
    if (!payload.internalRecipientId) return { success: false, message: 'No recipient specified.', receipt: failReceipt('Recipient could not be identified.') };

    // Admin transfer status applies to internal transfers too
    const acctStatus = activeSubAccount.transactionStatus ?? 'normal';
    const outcome: TransferOutcome =
      acctStatus === 'pending' ? 'pending'
      : acctStatus === 'failed' ? 'failed'
      : 'success';
    const txStatus = outcome === 'success' ? 'completed' : outcome === 'pending' ? 'pending' : 'failed';
    const newSenderBalance = outcome !== 'failed'
      ? parseFloat((activeSubAccount.balance - payload.amount).toFixed(2))
      : activeSubAccount.balance;

    const debitTx: Transaction = {
      id: genId(), type: 'debit', amount: payload.amount,
      description: payload.note || `Halifax Transfer to ${payload.recipientName}`,
      recipient: payload.recipientName, category: 'transfer',
      timestamp: now, status: txStatus, reference,
      isInternalTransfer: true,
      internalRecipientId: payload.internalRecipientId,
    };

    let creditTx: Transaction | undefined;
    let newRecipientBalance: number | undefined;

    // Only credit the recipient if transfer succeeded
    if (outcome === 'success' && payload.internalRecipientId !== 'ADMIN') {
      const recipientSa = state.subAccounts.find(sa => sa.id === payload.internalRecipientId);
      if (recipientSa) {
        newRecipientBalance = parseFloat((recipientSa.balance + payload.amount).toFixed(2));
        creditTx = {
          id: genId(), type: 'credit', amount: payload.amount,
          description: payload.note || `Halifax Transfer from ${activeSubAccount.user.name}`,
          recipient: activeSubAccount.user.name, category: 'transfer',
          timestamp: now, status: 'completed', reference,
          isInternalTransfer: true,
          internalSenderId: state.activeSubAccountId,
        };
      }
    }

    dispatch({
      type: 'INTERNAL_TRANSFER',
      fromId: state.activeSubAccountId,
      toId: payload.internalRecipientId,
      amount: payload.amount,
      debitTx,
      creditTx,
      newBalance: newSenderBalance,
      newRecipientBalance,
    });

    // Persist sender
    upsertSubAccount({ ...activeSubAccount, balance: newSenderBalance }).catch(() => {});
    upsertTransaction(state.activeSubAccountId, debitTx).catch(() => {});

    if (outcome === 'success') {
      if (payload.internalRecipientId === 'ADMIN') {
        // Persist admin balance to Supabase
        const newAdminBalance = parseFloat((state.adminAccount.balance + payload.amount).toFixed(2));
        upsertAdminBalance(newAdminBalance).catch(() => {});
      } else if (creditTx && newRecipientBalance !== undefined) {
        const recipientSa = state.subAccounts.find(sa => sa.id === payload.internalRecipientId);
        if (recipientSa) {
          upsertSubAccount({ ...recipientSa, balance: newRecipientBalance }).catch(() => {});
          upsertTransaction(payload.internalRecipientId, creditTx).catch(() => {});
        }
      }
    }

    const receipt: Receipt = {
      id: genId(), status: txStatus, recipientName: payload.recipientName,
      amount: payload.amount, note: payload.note ?? '',
      bankName: payload.bankName ?? 'Halifax Private Banking', bankFlag: payload.bankFlag ?? '🏦',
      reference, timestamp: now,
      senderName: activeSubAccount.user.name,
      senderAccount: activeSubAccount.user.accountNumber || activeSubAccount.user.iban || '',
      senderSortCode: activeSubAccount.user.sortCode || activeSubAccount.user.swiftBic || '',
      newBalance: newSenderBalance,
      isInternal: true,
      failureReason: outcome === 'failed' ? 'Transaction declined. Contact support.' : undefined,
    };

    return {
      success: outcome !== 'failed',
      message: outcome === 'success' ? 'Transfer completed.' : outcome === 'pending' ? 'Transfer is processing.' : 'Transfer was declined.',
      receipt,
    };
  }, [state.activeSubAccountId, state.subAccounts, state.adminAccount.balance, activeSubAccount]);

  const adminSetUser = useCallback((subAccountId: string, user: Partial<User>) => {
    const detail = Object.entries(user).map(([k, v]) => `${k}=${v}`).join(', ');
    dispatch({ type: 'ADMIN_SET_USER', subAccountId, user, auditDetail: detail });
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    if (sa) scheduleSave({ ...sa, user: { ...sa.user, ...user } });
  }, [state.subAccounts, scheduleSave]);

  const adminSetBalance = useCallback((subAccountId: string, balance: number) => {
    dispatch({ type: 'ADMIN_SET_BALANCE', subAccountId, balance, auditDetail: `Set to ${formatCurrency(balance)}` });
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    if (sa) scheduleSave({ ...sa, balance: parseFloat(balance.toFixed(2)) });
  }, [state.subAccounts, scheduleSave]);

  const adminAddTransaction = useCallback((subAccountId: string, tx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = { ...tx, id: genId() };
    const detail = `${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.amount)} — ${tx.description}`;
    dispatch({ type: 'ADMIN_ADD_TRANSACTION', subAccountId, transaction, auditDetail: detail });
    upsertTransaction(subAccountId, transaction).catch(() => {});
  }, []);

  const adminDeleteTransaction = useCallback((subAccountId: string, txId: string) => {
    dispatch({ type: 'ADMIN_DELETE_TRANSACTION', subAccountId, txId });
    deleteTransactionFromSupabase(txId).catch(() => {});
  }, []);

  const adminClearTransactions = useCallback((subAccountId: string) => {
    dispatch({ type: 'ADMIN_CLEAR_TRANSACTIONS', subAccountId });
    deleteAllTransactionsForAccount(subAccountId).catch(() => {});
  }, []);

  const adminSetCard = useCallback((subAccountId: string, settings: Partial<CardSettings>) => {
    const detail = Object.entries(settings).map(([k, v]) => `${k}=${v}`).join(', ');
    dispatch({ type: 'ADMIN_SET_CARD', subAccountId, settings, auditDetail: detail });
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    if (sa) upsertSubAccount({ ...sa, cardSettings: { ...sa.cardSettings, ...settings } }).catch(() => {});
  }, [state.subAccounts]);

  const adminSetSubAccountPin = useCallback((subAccountId: string, pin: string) => {
    dispatch({ type: 'ADMIN_SET_SUBACCOUNT_PIN', subAccountId, pin });
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    if (sa) upsertSubAccount({ ...sa, pin, pinSet: true }).catch(() => {});
  }, [state.subAccounts]);

  const adminSetBlocked = useCallback((subAccountId: string, isBlocked: boolean) => {
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    const name = sa?.user.name ?? subAccountId;
    dispatch({ type: 'ADMIN_SET_BLOCKED', subAccountId, isBlocked, auditDetail: `${name} — ${isBlocked ? 'blocked' : 'unblocked'}` });
    if (sa) upsertSubAccount({ ...sa, isBlocked }).catch(() => {});
  }, [state.subAccounts]);

  const adminSetAccountTxStatus = useCallback((subAccountId: string, transactionStatus: import('@/lib/types').AccountTransactionStatus) => {
    const sa = state.subAccounts.find((s) => s.id === subAccountId);
    const name = sa?.user.name ?? subAccountId;
    dispatch({ type: 'ADMIN_SET_ACCOUNT_TX_STATUS', subAccountId, transactionStatus, auditDetail: `${name} → ${transactionStatus}` });
    if (sa) upsertSubAccount({ ...sa, transactionStatus }).catch(() => {});
  }, [state.subAccounts]);

  const adminDeductBalance = useCallback((amount: number) => {
    dispatch({ type: 'ADMIN_UPDATE_BALANCE', delta: -amount });
    const newAdminBalance = parseFloat((state.adminAccount.balance - amount).toFixed(2));
    upsertAdminBalance(newAdminBalance).catch(() => {});
  }, [state.adminAccount.balance]);

  const clientLogin = useCallback((subAccountId: string, email: string) => {
    saveClientSession(subAccountId, email);
    setIsClientLoggedIn(true);
    setLoggedInClientId(subAccountId);
    dispatch({ type: 'SELECT_SUBACCOUNT', id: subAccountId });
  }, []);

  const clientLogout = useCallback(() => {
    clearClientSession();
    setIsClientLoggedIn(false);
    setLoggedInClientId(null);
    dispatch({ type: 'DESELECT_SUBACCOUNT' });
  }, []);

  const adminResetDemo = useCallback(async () => {
    await resetAllSupabaseData().catch(() => {});
    clearState();
    dispatch({ type: 'ADMIN_RESET_DEMO' });
    const fresh = getDefaultState();
    for (const sa of fresh.subAccounts) {
      await upsertSubAccount(sa).catch(() => {});
    }
  }, []);

  return (
    <AppContext.Provider value={{
      state, isHydrated, isAdmin, isClientLoggedIn, loggedInClientId, activeSubAccount,
      loginAdmin, logoutAdmin, clientLogin, clientLogout, selectSubAccount, deselectSubAccount,
      createSubAccount, deleteSubAccount, transfer, internalTransfer, topUp, updateCard,
      adminSetUser, adminSetBalance, adminAddTransaction, adminDeleteTransaction,
      adminClearTransactions, adminSetCard,
      adminSetSubAccountPin, adminSetBlocked, adminSetAccountTxStatus, adminResetDemo,
      adminDeductBalance, findSubAccountByAccountNumber, findSubAccountByIban, findSubAccountByAny, getAdminAccount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
