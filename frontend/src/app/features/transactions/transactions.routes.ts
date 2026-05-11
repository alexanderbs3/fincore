import { Routes } from '@angular/router';

export const transactionsRoutes: Routes = [
  {
    path: 'statement',
    loadComponent: () => import('./statement/statement.component').then(m => m.StatementComponent),
    data: { title: 'Extrato', breadcrumb: 'Extrato' },
  },
  {
    path: 'deposit',
    loadComponent: () => import('./deposit/deposit.component').then(m => m.DepositComponent),
    data: { title: 'Depósito', breadcrumb: 'Depósito' },
  },
  {
    path: 'transfer',
    loadComponent: () => import('./transfer/transfer.component').then(m => m.TransferComponent),
    data: { title: 'Transferência', breadcrumb: 'Transferência' },
  },
  { path: '', redirectTo: 'statement', pathMatch: 'full' },
];
