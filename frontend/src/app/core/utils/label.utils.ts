import { AccountType, CustomerStatus, TransactionType } from '../models/models';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CORRENTE:  'Corrente',
  POUPANCA:  'Poupança',
  PAGAMENTO: 'Pagamento',
};

export const ACCOUNT_TYPE_BADGE: Record<AccountType, string> = {
  CORRENTE:  'badge--info',
  POUPANCA:  'badge--success',
  PAGAMENTO: 'badge--warning',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  DEPOSIT:    'Depósito',
  WITHDRAWAL: 'Saque',
  TRANSFER:   'Transferência',
  PAYMENT:    'Pagamento',
};

export const TRANSACTION_TYPE_BADGE: Record<TransactionType, string> = {
  DEPOSIT:    'badge--success',
  WITHDRAWAL: 'badge--danger',
  TRANSFER:   'badge--info',
  PAYMENT:    'badge--warning',
};

export const TRANSACTION_TYPE_ICON: Record<TransactionType, string> = {
  DEPOSIT:    'ti-arrow-bar-down',
  WITHDRAWAL: 'ti-arrow-bar-up',
  TRANSFER:   'ti-arrows-exchange',
  PAYMENT:    'ti-credit-card',
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ATIVO:     'Ativo',
  INATIVO:   'Inativo',
  BLOQUEADO: 'Bloqueado',
};

export const CUSTOMER_STATUS_BADGE: Record<CustomerStatus, string> = {
  ATIVO:     'badge--success',
  INATIVO:   'badge--neutral',
  BLOQUEADO: 'badge--danger',
};

export function accountTypeLabel(type: AccountType | string): string {
  return ACCOUNT_TYPE_LABELS[type as AccountType] ?? type;
}

export function transactionTypeLabel(type: TransactionType | string): string {
  return TRANSACTION_TYPE_LABELS[type as TransactionType] ?? type;
}

export function customerStatusLabel(status: CustomerStatus | string): string {
  return CUSTOMER_STATUS_LABELS[status as CustomerStatus] ?? status;
}

export function isDebit(type: TransactionType | string): boolean {
  return type === 'WITHDRAWAL' || type === 'TRANSFER' || type === 'PAYMENT';
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
  }).format(value);
}
