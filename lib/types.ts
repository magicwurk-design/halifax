export type BankType = 'halifax' | 'uk' | 'international';

export interface User {
  name: string;
  email: string;
  accountNumber: string;  // for Halifax/UK banks
  sortCode: string;       // for Halifax/UK banks
  iban?: string;          // for international banks
  swiftBic?: string;      // for international banks
  avatarInitials: string;
  profilePhoto?: string;   // base64 data URL or empty string
  bankId: string;         // bank id from banks.ts e.g. 'halifax', 'barclays'
  bankName: string;       // display name e.g. 'Halifax Private Banking'
  bankFlag: string;       // emoji flag
  bankType: BankType;     // determines which fields to show
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  recipient: string;
  category: TransactionCategory;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  isInternalTransfer?: boolean;
  internalRecipientId?: string;
  internalSenderId?: string;
}

export type TransactionCategory =
  | 'transfer'
  | 'shopping'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'utilities'
  | 'salary'
  | 'other';

export interface CardSettings {
  frozen: boolean;
  contactless: boolean;
  onlinePayments: boolean;
}

export interface AuditEntry {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}

export type AccountTransactionStatus = 'normal' | 'pending' | 'failed';

export interface SubAccount {
  id: string;
  user: User;
  balance: number;
  transactions: Transaction[];
  cardSettings: CardSettings;
  pin: string;
  pinSet: boolean;
  password: string;
  isBlocked: boolean;
  transactionStatus: AccountTransactionStatus;
}

export interface AdminAccount {
  accountNumber: string;
  sortCode: string;
  name: string;
  balance: number;
}

export interface AppState {
  subAccounts: SubAccount[];
  activeSubAccountId: string | null;
  auditLog: AuditEntry[];
  adminAccount: AdminAccount;
}

export type TransferOutcome = 'success' | 'pending' | 'failed';

export interface TransferPayload {
  recipientName: string;
  amount: number;
  note?: string;
  bankName?: string;
  bankFlag?: string;
  isInternal?: boolean;
  internalRecipientId?: string;
}

export interface Receipt {
  id: string;
  status: 'completed' | 'pending' | 'failed';
  recipientName: string;
  amount: number;
  note: string;
  bankName: string;
  bankFlag: string;
  reference: string;
  timestamp: string;
  senderName: string;
  senderAccount: string;
  senderSortCode: string;
  newBalance: number;
  failureReason?: string;
  isInternal?: boolean;
}
