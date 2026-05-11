import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { AccountResponse, TransactionResponse, TransactionType } from '../../../core/models/models';
import {
  TRANSACTION_TYPE_LABELS, TRANSACTION_TYPE_BADGE, TRANSACTION_TYPE_ICON,
  ACCOUNT_TYPE_LABELS, isDebit, formatCurrency
} from '../../../core/utils/label.utils';

@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <div class="page-header">
        <div>
          <h1 class="page-title">Extrato de Transações</h1>
          <p class="page-subtitle">Movimentações por conta bancária</p>
        </div>
        <div class="header-actions">
          <a routerLink="/transactions/deposit" class="btn btn-secondary btn-sm">
            <i class="ti ti-arrow-bar-down"></i> Depositar
          </a>
          <a routerLink="/transactions/transfer" class="btn btn-primary btn-sm">
            <i class="ti ti-arrows-exchange"></i> Transferir
          </a>
        </div>
      </div>

      <!-- Seletor de conta -->
      <div class="card mb-5">
        <div class="field-group">
          <label class="field-label">Selecione uma conta para visualizar o extrato</label>
          <select class="field-select" [(ngModel)]="selectedUuid" (ngModelChange)="onAccountChange($event)">
            <option value="">— Escolha uma conta —</option>
            @for (a of accounts(); track a.uuid) {
              <option [value]="a.uuid">
                CC {{ a.accountNumber }} · Ag. {{ a.agency }} — {{ typeLabel(a.type) }}
              </option>
            }
          </select>
        </div>

        @if (selectedAccount()) {
          <div class="selected-account-card">
            <div>
              <div class="sa-number">CC {{ selectedAccount()!.accountNumber }} · Ag. {{ selectedAccount()!.agency }}</div>
              <div class="sa-meta">
                {{ typeLabel(selectedAccount()!.type) }}
                &nbsp;·&nbsp;
                <span class="badge badge--success" style="font-size:10px">
                  <span class="badge__dot"></span>Ativa
                </span>
              </div>
            </div>
            <div class="sa-balance"
              [style.color]="selectedAccount()!.balance < 0 ? 'var(--danger)' : 'var(--success)'">
              {{ formatCurrency(selectedAccount()!.balance) }}
            </div>
          </div>
        }
      </div>

      <!-- Filtros -->
      @if (selectedUuid) {
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
          <select class="filter-select" [(ngModel)]="typeFilter" (ngModelChange)="applyFilters()">
            <option value="">Todos os tipos</option>
            <option value="DEPOSIT">Depósito</option>
            <option value="TRANSFER">Transferência</option>
            <option value="WITHDRAWAL">Saque</option>
            <option value="PAYMENT">Pagamento</option>
          </select>
          <button class="btn btn-ghost btn-sm" style="margin-left:auto">
            <i class="ti ti-download"></i> Exportar OFX
          </button>
        </div>

        <!-- Totalizadores -->
        @if (!loading() && transactions().length > 0) {
          <div class="totals-grid">
            <div class="total-card">
              <div class="total-label"><i class="ti ti-arrow-bar-down"></i> Entradas</div>
              <div class="total-value total-value--in">+ {{ formatCurrency(totalIn()) }}</div>
            </div>
            <div class="total-card">
              <div class="total-label"><i class="ti ti-arrow-bar-up"></i> Saídas</div>
              <div class="total-value total-value--out">- {{ formatCurrency(totalOut()) }}</div>
            </div>
            <div class="total-card">
              <div class="total-label"><i class="ti ti-chart-bar"></i> Saldo do Período</div>
              <div class="total-value total-value--net">{{ formatCurrency(totalIn() - totalOut()) }}</div>
            </div>
          </div>
        }
      }

      <!-- Tabela -->
      <div class="table-wrap">
        @if (!selectedUuid) {
          <div class="empty-state">
            <div class="empty-icon"><i class="ti ti-file-description"></i></div>
            <div class="empty-title">Selecione uma conta</div>
            <div class="empty-sub">Escolha uma conta acima para visualizar as movimentações</div>
          </div>
        } @else if (loading()) {
          <div style="padding:16px">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="skeleton-row" [style.width]="(60+i*7)+'%'"></div>
            }
          </div>
        } @else if (filtered().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><i class="ti ti-chart-line"></i></div>
            <div class="empty-title">Nenhuma movimentação</div>
            <div class="empty-sub">Esta conta ainda não possui transações registradas</div>
            <a routerLink="/transactions/deposit" class="btn btn-primary">
              <i class="ti ti-arrow-bar-down"></i> Fazer Depósito
            </a>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th style="text-align:right">Valor</th>
              </tr>
            </thead>
            <tbody>
              @for (tx of filtered(); track tx.uuid) {
                <tr>
                  <td class="td-muted text-sm">{{ formatDate(tx.createdAt) }}</td>
                  <td>
                    <span class="badge {{ txBadge(tx.type) }}">
                      <i class="ti {{ txIcon(tx.type) }}" style="font-size:11px"></i>
                      {{ txLabel(tx.type) }}
                    </span>
                  </td>
                  <td class="td-muted">{{ tx.description || '—' }}</td>
                  <td style="text-align:right">
                    <span class="amount {{ isDebit(tx.type) ? 'amount--negative' : 'amount--positive' }}">
                      {{ isDebit(tx.type) ? '- ' : '+ ' }}{{ formatCurrency(tx.amount) }}
                    </span>
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
                  {{ p+1 }}
                </button>
              }
              <button class="page-btn" [disabled]="isLast()" (click)="goToPage(currentPage()+1)">
                <i class="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class StatementComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly accountService     = inject(AccountService);
  private readonly route = inject(ActivatedRoute);

  readonly loading         = signal(true);
  readonly accounts        = signal<AccountResponse[]>([]);
  readonly selectedAccount = signal<AccountResponse | null>(null);
  readonly transactions    = signal<TransactionResponse[]>([]);
  readonly totalElements   = signal(0);
  readonly currentPage     = signal(0);
  readonly totalPages      = signal(1);
  readonly isLast          = signal(false);
  readonly pageSize        = 20;

  selectedUuid = '';
  typeFilter   = '';

  readonly formatCurrency = formatCurrency;
  readonly isDebit   = isDebit;
  readonly txLabel   = (t: string) => TRANSACTION_TYPE_LABELS[t as TransactionType] ?? t;
  readonly txBadge   = (t: string) => TRANSACTION_TYPE_BADGE[t as TransactionType]  ?? 'badge--neutral';
  readonly txIcon    = (t: string) => TRANSACTION_TYPE_ICON[t as TransactionType]   ?? 'ti-arrows-exchange';
  readonly typeLabel = (t: string) => ACCOUNT_TYPE_LABELS[t as keyof typeof ACCOUNT_TYPE_LABELS] ?? t;

  filtered() {
    if (!this.typeFilter) return this.transactions();
    return this.transactions().filter(tx => tx.type === this.typeFilter);
  }

  totalIn():  number { return this.transactions().filter(tx => !isDebit(tx.type)).reduce((s, tx) => s + tx.amount, 0); }
  totalOut(): number { return this.transactions().filter(tx =>  isDebit(tx.type)).reduce((s, tx) => s + tx.amount, 0); }

  pageNumbers() { return Array.from({ length: Math.min(this.totalPages(), 5) }, (_, i) => i); }
  pageStart()   { return this.currentPage() * this.pageSize + 1; }
  pageEnd()     { return Math.min((this.currentPage()+1) * this.pageSize, this.totalElements()); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  ngOnInit(): void {
    this.accountService.findAll({ size: 100 }).subscribe({
      next: page => {
        this.accounts.set(page.content);
        const uuid = this.route.snapshot.queryParamMap.get('account');
        if (uuid) {
          this.selectedUuid = uuid;
          this.onAccountChange(uuid);
        } else {
          this.loading.set(false);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  onAccountChange(uuid: string): void {
    this.selectedUuid = uuid;
    const acc = this.accounts().find(a => a.uuid === uuid) ?? null;
    this.selectedAccount.set(acc);
    if (!uuid) { this.transactions.set([]); this.loading.set(false); return; }
    this.currentPage.set(0);
    this.loadStatement();
  }

  applyFilters(): void { /* typeFilter reativo via filtered() */ }

  goToPage(p: number): void { this.currentPage.set(p); this.loadStatement(); }

  private loadStatement(): void {
    if (!this.selectedUuid) return;
    this.loading.set(true);
    this.transactionService.getStatement(this.selectedUuid, {
      page: this.currentPage(), size: this.pageSize, sort: 'createdAt,desc'
    }).subscribe({
      next: page => {
        this.transactions.set(page.content);
        this.totalElements.set(page.totalElements);
        this.totalPages.set(page.totalPages);
        this.isLast.set(page.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
