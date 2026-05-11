import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./customers-list/customers-list.component').then(m => m.CustomersListComponent),
    data: { title: 'Clientes', breadcrumb: 'Clientes' },
  },
  {
    path: 'new',
    loadComponent: () => import('./customer-form/customer-form.component').then(m => m.CustomerFormComponent),
    data: { title: 'Novo Cliente', breadcrumb: 'Novo Cliente' },
  },
];
