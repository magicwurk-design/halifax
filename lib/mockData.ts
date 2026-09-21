import { Transaction, User, SubAccount, CardSettings, AdminAccount, BankType } from './types';

export const INITIAL_BALANCE = 0;

function generateId(): string {
  return Math.random().toString(36).slice(2, 11).toUpperCase();
}

export const DEFAULT_SUBACCOUNT_PIN = '000000';

export const DEFAULT_CARD_SETTINGS: CardSettings = {
  frozen: false,
  contactless: true,
  onlinePayments: true,
};

export const SEED_TRANSACTIONS: Transaction[] = [];

export const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', accent: '#a78bfa' },
  { bg: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', accent: '#f9a8d4' },
  { bg: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)', accent: '#7dd3fc' },
  { bg: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', accent: '#6ee7b7' },
  { bg: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)', accent: '#fcd34d' },
  { bg: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)', accent: '#c084fc' },
  { bg: 'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)', accent: '#fb923c' },
  { bg: 'linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)', accent: '#f9a8d4' },
  { bg: 'linear-gradient(135deg,#96fbc4 0%,#f9f586 100%)', accent: '#86efac' },
  { bg: 'linear-gradient(135deg,#fda085 0%,#f6d365 100%)', accent: '#fb923c' },
];

export function getAvatarPalette(id: string): { bg: string; accent: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

export const ADMIN_ACCOUNT: AdminAccount = {
  accountNumber: '65237642',
  sortCode: '11-00-01',
  name: 'Halifax Private Banking',
  balance: 2000000,
};

export function makeSeedSubAccount(overrides?: Partial<User>): SubAccount {
  const user: User = {
    name: overrides?.name ?? '',
    email: overrides?.email ?? '',
    accountNumber: overrides?.accountNumber ?? '',
    sortCode: overrides?.sortCode ?? '',
    iban: overrides?.iban ?? '',
    swiftBic: overrides?.swiftBic ?? '',
    profilePhoto: overrides?.profilePhoto ?? '',
    avatarInitials: overrides?.avatarInitials ?? '',
    bankId: overrides?.bankId ?? 'halifax',
    bankName: overrides?.bankName ?? 'Halifax Private Banking',
    bankFlag: overrides?.bankFlag ?? '🇬🇧',
    bankType: overrides?.bankType ?? 'halifax',
  };
  return {
    id: generateId(),
    user,
    balance: INITIAL_BALANCE,
    transactions: [],
    cardSettings: { ...DEFAULT_CARD_SETTINGS },
    pin: DEFAULT_SUBACCOUNT_PIN,
    pinSet: false,
    password: '',
    isBlocked: false,
    transactionStatus: 'normal' as const,
  };
}

export const CATEGORY_ICONS: Record<string, string> = {
  salary: '💼',
  entertainment: '🎬',
  food: '🍔',
  transport: '🚗',
  transfer: '↔️',
  utilities: '⚡',
  shopping: '🛍️',
  other: '📦',
};
