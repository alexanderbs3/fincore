import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../../core/services/customer.service';
import { CustomerResponse, CustomerStatus } from '../../../core/models/models';
import {
  CUSTOMER_STATUS_LABELS, CUSTOMER_STATUS_BADGE
} from '../../../core/utils/label.utils';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Clientes
            @if (!loading()) {
              <span class="page-title-count">{{ totalElements() }}</span>
            }
          </h1>
          <p class="page-subtitle">Gerenciamento de clientes cadastrados</p>
        </div>
        <div class="header-actions">
          <a routerLink="/customers/new" class="btn btn-primary">
            <i class="ti ti-user-plus"></i> Novo Cliente
          </a>
        </div>
      </div>

      <div class="table-wrap">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="search-wrap">
            <i class="ti ti-search search-icon"></i>
            <input
              class="search-input"
              type="search"
              placeholder="Buscar por nome ou CPF..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
            />
          </div>
          <select class="filter-select" [(ngModel)]="statusFilter" (ngModelChange)="onSearch()">
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </select>
          <button class="btn btn-ghost btn-sm spacer">
            <i class="ti ti-download"></i> CSV
          </button>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div style="padding:16px">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton-row" [style.width]="(60+i*7)+'%'"></div>
            }
          </div>
        }

        <!-- Tabela -->
        @if (!loading()) {
          @if (filtered().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="ti ti-users"></i></div>
              <div class="empty-title">Nenhum cliente encontrado</div>
              <div class="empty-sub">
                {{ searchTerm || statusFilter ? 'Tente ajustar os filtros' : 'Comece adicionando o primeiro cliente' }}
              </div>
              @if (!searchTerm && !statusFilter) {
                <a routerLink="/customers/new" class="btn btn-primary">
                  <i class="ti ti-user-plus"></i> Adicionar Cliente
                </a>
              }
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome Completo</th>
                  <th>CPF / CNPJ</th>
                  <th>E-mail</th>
                  <th>Status</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (c of filtered(); track c.uuid) {
                  <tr>
                    <td style="font-weight:500">{{ c.fullName }}</td>
                    <td class="td-mono td-muted">{{ formatDoc(c.documentNumber) }}</td>
                    <td class="td-muted">{{ c.email }}</td>
                    <td>
                      <span class="badge {{ statusBadge(c.status) }}">
                        @if (c.status === 'ATIVO') {
                          <span class="badge__dot"></span>
                        }
                        {{ statusLabel(c.status) }}
                      </span>
                    </td>
                    <td class="td-muted text-sm">{{ formatDate(c.createdAt) }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-icon" title="Ver detalhes">
                          <i class="ti ti-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="pagination">
              <span class="pagination__info">
                Mostrando {{ pageStart() }}–{{ pageEnd() }} de {{ totalElements() }} registros
              </span>
              <div class="pagination__controls">
                <button class="page-btn" [disabled]="currentPage() === 0" (click)="goToPage(currentPage()-1)">
                  <i class="ti ti-chevron-left"></i>
                </button>
                @for (p of pageNumbers(); track p) {
                  <button
                    class="page-btn"
                    [class.page-btn--active]="p === currentPage()"
                    (click)="goToPage(p)"
                  >{{ p + 1 }}</button>
                }
                <button class="page-btn" [disabled]="isLast()" (click)="goToPage(currentPage()+1)">
                  <i class="ti ti-chevron-right"></i>
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CustomersListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  readonly loading      = signal(true);
  readonly customers    = signal<CustomerResponse[]>([]);
  readonly totalElements = signal(0);
  readonly currentPage  = signal(0);
  readonly totalPages   = signal(1);
  readonly isLast       = signal(false);
  readonly pageSize     = 10;

  searchTerm   = '';
  statusFilter = '';

  readonly statusLabel = (s: CustomerStatus) => CUSTOMER_STATUS_LABELS[s] ?? s;
  readonly statusBadge = (s: CustomerStatus) => CUSTOMER_STATUS_BADGE[s]  ?? 'badge--neutral';

  filtered() {
    return this.customers().filter(c => {
      const matchSearch = !this.searchTerm ||
        c.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.documentNumber.includes(this.searchTerm.replace(/\D/g, ''));
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  pageNumbers() {
    return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i);
  }

  pageStart() { return this.currentPage() * this.pageSize + 1; }
  pageEnd()   { return Math.min((this.currentPage()+1) * this.pageSize, this.totalElements()); }

  formatDoc(doc: string): string {
    if (doc.length === 11) return doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    if (doc.length === 14) return doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    return doc;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
  }

  ngOnInit(): void { this.load(); }

  onSearch(): void { /* filtro client-side já feito em filtered() */ }

  goToPage(p: number): void {
    this.currentPage.set(p);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.customerService.findAll({ page: this.currentPage(), size: this.pageSize }).subscribe({
      next: page => {
        this.customers.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.isLast.set(page.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
