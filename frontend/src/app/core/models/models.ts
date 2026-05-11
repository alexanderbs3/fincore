// ============================================================
// FinCore v2 — Modelos de domínio
// Espelho exato dos DTOs do backend Spring Boot
// ============================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

// ---- Autenticação ----
export interface LoginRequest    { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; role: UserRole; }
export interface AuthResponse    { token: string; }
export type UserRole = 'ADMIN' | 'USER';

// ---- Paginação ----
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
export interface Page<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;
  size:          number;
  first:         boolean;
  last:          boolean;
}

// ---- Customer ----
export type CustomerStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO';
export interface CustomerRequest {
  fullName:       string;
  documentNumber: string;
  email:          string;
}
export interface CustomerResponse {
  uuid:           string;
  fullName:       string;
  documentNumber: string;
  email:          string;
  status:         CustomerStatus;
  createdAt:      string;
}

// ---- Account ----
export type AccountType = 'CORRENTE' | 'POUPANCA' | 'PAGAMENTO';
export interface AccountRequest {
  customerUuid: string;
  type:         AccountType;
}
/**
 * ATENÇÃO: O backend NÃO retorna customerName nem createdAt neste DTO.
 * Não adicionar esses campos para evitar undefined silencioso.
 */
export interface AccountResponse {
  uuid:          string;
  accountNumber: string;
  agency:        string;
  balance:       number;
  type:          AccountType;
}

// ---- Transaction ----
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT';
export interface DepositRequest {
  accountUuid: string;
  amount:      number;
}
export interface TransferRequest {
  sourceAccountUuid:      string;
  destinationAccountUuid: string;
  amount:                 number;
  description?:           string;
}
export interface TransactionResponse {
  uuid:        string;
  type:        TransactionType;
  amount:      number;
  description: string;
  createdAt:   string;
}
