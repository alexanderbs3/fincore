import { Routes } from '@angular/router';

export const accountsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./accounts-list/accounts-list.component').then(m => m.AccountsListComponent),
    data: { title: 'Contas', breadcrumb: 'Contas' },
  },
  {
    path: 'new',
    loadComponent: () => import('./account-form/account-form.component').then(m => m.AccountFormComponent),
    data: { title: 'Nova Conta', breadcrumb: 'Nova Conta' },
  },
];
