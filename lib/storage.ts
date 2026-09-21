import { AppState, AuditEntry, SubAccount } from './types';
import { makeSeedSubAccount, ADMIN_ACCOUNT } from './mockData';
import { supabase } from './supabase';

export function getDefaultState(): AppState {
  return {
    subAccounts: [],
    activeSubAccountId: null,
    auditLog: [],
    adminAccount: { ...ADMIN_ACCOUNT },
  };
}

// ─── Supabase persistence ────────────────────────────────────────────────────

export async function loadStateFromSupabase(): Promise<AppState> {
  try {
    const { data: saRows, error: saErr } = await supabase
      .from('sub_accounts')
      .select('*')
      .order('created_at', { ascending: true });
    if (saErr) throw saErr;

    const { data: auditRows } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!saRows || saRows.length === 0) return getDefaultState();

    const subAccounts: SubAccount[] = await Promise.all(
      saRows.map(async (row) => {
        const { data: txRows } = await supabase
          .from('transactions')
          .select('*')
          .eq('sub_account_id', row.id)
          .order('created_at', { ascending: false });
        return {
          id: row.id,
          user: {
            ...row.user_data,
            bankId: row.user_data?.bankId ?? 'halifax',
            bankName: row.user_data?.bankName ?? 'Halifax Private Banking',
            bankFlag: row.user_data?.bankFlag ?? '🇬🇧',
            bankType: row.user_data?.bankType ?? 'halifax',
            iban: row.user_data?.iban ?? '',
            swiftBic: row.user_data?.swiftBic ?? '',
            profilePhoto: row.user_data?.profilePhoto ?? '',
          },
          balance: row.balance,
          transactions: (txRows ?? []).map((t) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            recipient: t.recipient,
            category: t.category,
            timestamp: t.created_at,
            status: t.status,
            reference: t.reference,
            isInternalTransfer: t.is_internal_transfer ?? false,
            internalRecipientId: t.internal_recipient_id ?? undefined,
            internalSenderId: t.internal_sender_id ?? undefined,
          })),
          cardSettings: row.card_settings,
          pin: row.pin ?? '000000',
          pinSet: row.pin_set ?? false,
          password: row.password ?? '',
          isBlocked: row.is_blocked ?? false,
          transactionStatus: row.transaction_status ?? 'normal',
        };
      })
    );

    const auditLog: AuditEntry[] = (auditRows ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      detail: r.detail,
      timestamp: r.created_at,
    }));

    return { subAccounts, activeSubAccountId: null, auditLog, adminAccount: { ...ADMIN_ACCOUNT, balance: await loadAdminBalance() } };
  } catch (err) {
    console.warn('[Halifax] Supabase load failed, using defaults:', err);
    return getDefaultState();
  }
}

export async function loadAdminBalance(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'admin_balance')
      .single();
    if (error || !data) return ADMIN_ACCOUNT.balance;
    return typeof data.value === 'number' ? data.value : Number(data.value);
  } catch {
    return ADMIN_ACCOUNT.balance;
  }
}

export async function upsertAdminBalance(balance: number): Promise<void> {
  try {
    await supabase.from('app_config').upsert({
      key: 'admin_balance',
      value: balance,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Halifax] upsertAdminBalance failed:', err);
  }
}

export async function upsertSubAccount(sa: SubAccount): Promise<void> {
  try {
    await supabase.from('sub_accounts').upsert({
      id: sa.id,
      balance: sa.balance,
      user_data: sa.user,
      card_settings: sa.cardSettings,
      pin: sa.pin,
      pin_set: sa.pinSet,
      password: sa.password ?? '',
      is_blocked: sa.isBlocked ?? false,
      transaction_status: sa.transactionStatus ?? 'normal',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Halifax] upsertSubAccount failed:', err);
  }
}

export async function upsertTransaction(subAccountId: string, tx: SubAccount['transactions'][0]): Promise<void> {
  try {
    await supabase.from('transactions').upsert({
      id: tx.id,
      sub_account_id: subAccountId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      recipient: tx.recipient,
      category: tx.category,
      status: tx.status,
      reference: tx.reference,
      created_at: tx.timestamp,
      is_internal_transfer: tx.isInternalTransfer ?? false,
      internal_recipient_id: tx.internalRecipientId ?? null,
      internal_sender_id: tx.internalSenderId ?? null,
    });
  } catch (err) {
    console.warn('[Halifax] upsertTransaction failed:', err);
  }
}

export async function deleteTransactionFromSupabase(txId: string): Promise<void> {
  try {
    await supabase.from('transactions').delete().eq('id', txId);
  } catch (err) {
    console.warn('[Halifax] deleteTransaction failed:', err);
  }
}

export async function deleteAllTransactionsForAccount(subAccountId: string): Promise<void> {
  try {
    await supabase.from('transactions').delete().eq('sub_account_id', subAccountId);
  } catch (err) {
    console.warn('[Halifax] deleteAllTransactions failed:', err);
  }
}

export async function deleteSubAccountFromSupabase(id: string): Promise<void> {
  try {
    await supabase.from('transactions').delete().eq('sub_account_id', id);
    await supabase.from('sub_accounts').delete().eq('id', id);
  } catch (err) {
    console.warn('[Halifax] deleteSubAccount failed:', err);
  }
}

export async function saveAuditEntryToSupabase(entry: AuditEntry): Promise<void> {
  try {
    await supabase.from('audit_log').insert({
      id: entry.id,
      action: entry.action,
      detail: entry.detail,
      created_at: entry.timestamp,
    });
  } catch (err) {
    console.warn('[Halifax] saveAuditEntry failed:', err);
  }
}

export async function resetAllSupabaseData(): Promise<void> {
  try {
    const { data: saRows } = await supabase.from('sub_accounts').select('id');
    if (saRows && saRows.length > 0) {
      const ids = saRows.map((r) => r.id);
      await supabase.from('transactions').delete().in('sub_account_id', ids);
      await supabase.from('sub_accounts').delete().in('id', ids);
    }
    await supabase.from('audit_log').delete().neq('id', '');
  } catch (err) {
    console.warn('[Halifax] resetAllSupabaseData failed:', err);
  }
}

// ─── localStorage fallback ───────────────────────────────────────────────────
const STORAGE_KEY = 'halifax_state_v5';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    window.localStorage.setItem('__test__', '1');
    window.localStorage.removeItem('__test__');
    return window.localStorage;
  } catch { return null; }
}

export function loadStateLocal(): AppState {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      subAccounts: Array.isArray(parsed.subAccounts) && parsed.subAccounts.length > 0
        ? parsed.subAccounts.map((sa) => ({
            ...sa,
            pin: sa.pin ?? '000000',
            pinSet: sa.pinSet ?? false,
            password: sa.password ?? '',
            isBlocked: sa.isBlocked ?? false,
            transactionStatus: sa.transactionStatus ?? 'normal',
            user: {
              ...sa.user,
              bankId: sa.user?.bankId ?? 'halifax',
              bankName: sa.user?.bankName ?? 'Halifax Private Banking',
              bankFlag: sa.user?.bankFlag ?? '🇬🇧',
              bankType: sa.user?.bankType ?? 'halifax',
              iban: sa.user?.iban ?? '',
              swiftBic: sa.user?.swiftBic ?? '',
              profilePhoto: sa.user?.profilePhoto ?? '',
            },
          }))
        : getDefaultState().subAccounts,
      activeSubAccountId: null,
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
      adminAccount: parsed.adminAccount ?? { ...ADMIN_ACCOUNT },
    };
  } catch { return getDefaultState(); }
}

export function saveStateLocal(state: AppState): void {
  try { getStorage()?.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export function clearState(): void {
  try { getStorage()?.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function makeAuditEntry(action: string, detail: string): AuditEntry {
  return {
    id: Math.random().toString(36).slice(2, 11).toUpperCase(),
    action,
    detail,
    timestamp: new Date().toISOString(),
  };
}
