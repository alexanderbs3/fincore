import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { AccountResponse, AccountType } from '../../../core/models/models';
import {
  ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_BADGE, formatCurrency
} from '../../../core/utils/label.utils';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Contas
            @if (!loading()) {
              <span class="page-title-count">{{ totalElements() }}</span>
            }
          </h1>
          <p class="page-subtitle">Gestão de contas bancárias</p>
        </div>
        <div class="header-actions">
          <a routerLink="/accounts/new" class="btn btn-primary">
            <i class="ti ti-plus"></i> Nova Conta
          </a>
        </div>
      </div>

      <div class="table-wrap">
        <div class="table-toolbar">
          <div class="search-wrap">
            <i class="ti ti-search search-icon"></i>
            <input class="search-input" type="search" placeholder="Buscar por número da conta..."
              [(ngModel)]="searchTerm"/>
          </div>
          <select class="filter-select" [(ngModel)]="typeFilter">
            <option value="">Todos os tipos</option>
            <option value="CORRENTE">Corrente</option>
            <option value="POUPANCA">Poupança</option>
            <option value="PAGAMENTO">Pagamento</option>
          </select>
        </div>

        @if (loading()) {
          <div style="padding:16px">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton-row" [style.width]="(60+i*7)+'%'"></div>
            }
          </div>
        }

        @if (!loading()) {
          @if (filtered().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="ti ti-credit-card"></i></div>
              <div class="empty-title">Nenhuma conta encontrada</div>
              <div class="empty-sub">
                {{ searchTerm || typeFilter ? 'Tente ajustar os filtros' : 'Crie a primeira conta bancária' }}
              </div>
              @if (!searchTerm && !typeFilter) {
                <a routerLink="/accounts/new" class="btn btn-primary">
                  <i class="ti ti-plus"></i> Nova Conta
                </a>
              }
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nº da Conta</th>
                  <th>Agência</th>
                  <th>Tipo</th>
                  <th>Saldo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (a of filtered(); track a.uuid) {
                  <tr>
                    <td class="td-mono">{{ a.accountNumber }}</td>
                    <td class="td-mono td-muted">{{ a.agency }}</td>
                    <td>
                      <span class="badge {{ typeBadge(a.type) }}">{{ typeLabel(a.type) }}</span>
                    </td>
                    <td>
                      <span class="amount {{ a.balance > 0 ? 'amount--positive' : a.balance < 0 ? 'amount--negative' : 'amount--neutral' }}">
                        {{ formatCurrency(a.balance) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <a [routerLink]="['/transactions/deposit']"
                          [queryParams]="{ account: a.uuid }"
                          class="btn btn-sm btn-ghost" title="Depositar">
                          <i class="ti ti-arrow-bar-down"></i>
                        </a>
                        <a [routerLink]="['/transactions/transfer']"
                          [queryParams]="{ source: a.uuid }"
                          class="btn btn-sm btn-ghost" title="Transferir">
                          <i class="ti ti-arrows-exchange"></i>
                        </a>
                        <a [routerLink]="['/transactions/statement']"
                          [queryParams]="{ account: a.uuid }"
                          class="btn btn-sm btn-ghost" title="Extrato">
                          <i class="ti ti-list-details"></i>
                        </a>
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
                  <button class="page-btn" [class.page-btn--active]="p === currentPage()" (click)="goToPage(p)">
                    {{ p + 1 }}
                  </button>
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
export class AccountsListComponent implements OnInit {
  private readonly accountService = inject(AccountService);

  readonly loading       = signal(true);
  readonly accounts      = signal<AccountResponse[]>([]);
  readonly totalElements = signal(0);
  readonly currentPage   = signal(0);
  readonly totalPages    = signal(1);
  readonly isLast        = signal(false);
  readonly pageSize      = 10;

  searchTerm = '';
  typeFilter = '';

  readonly typeLabel   = (t: AccountType) => ACCOUNT_TYPE_LABELS[t] ?? t;
  readonly typeBadge   = (t: AccountType) => ACCOUNT_TYPE_BADGE[t]  ?? 'badge--neutral';
  readonly formatCurrency = formatCurrency;

  filtered() {
    return this.accounts().filter(a => {
      const matchSearch = !this.searchTerm || a.accountNumber.includes(this.searchTerm);
      const matchType   = !this.typeFilter || a.type === this.typeFilter;
      return matchSearch && matchType;
    });
  }

  pageNumbers() { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  pageStart()   { return this.currentPage() * this.pageSize + 1; }
  pageEnd()     { return Math.min((this.currentPage()+1) * this.pageSize, this.totalElements()); }

  ngOnInit(): void { this.load(); }

  goToPage(p: number): void { this.currentPage.set(p); this.load(); }

  private load(): void {
    this.loading.set(true);
    this.accountService.findAll({ page: this.currentPage(), size: this.pageSize }).subscribe({
      next: page => {
        this.accounts.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.isLast.set(page.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
