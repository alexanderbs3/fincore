import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { AccountService } from '../../../core/services/account.service';
import { AccountResponse, TransactionResponse } from '../../../core/models/models';
import {
  TRANSACTION_TYPE_BADGE, TRANSACTION_TYPE_LABELS,
  TRANSACTION_TYPE_ICON, isDebit, formatCurrency
} from '../../../core/utils/label.utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">{{ today }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary btn-sm">
            <i class="ti ti-download"></i> Exportar
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Total de Clientes</span>
            <div class="kpi-icon kpi-icon--blue"><i class="ti ti-users"></i></div>
          </div>
          @if (loading()) {
            <div class="skeleton-row" style="width:60%;height:28px;margin-bottom:10px"></div>
            <div class="skeleton-row" style="width:40%;height:14px"></div>
          } @else {
            <div class="kpi-value">{{ totalCustomers() }}</div>
            <div class="kpi-trend kpi-trend--up">
              <i class="ti ti-trending-up"></i> Cadastros ativos
              <span class="kpi-trend__period">no sistema</span>
            </div>
          }
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Contas Abertas</span>
            <div class="kpi-icon kpi-icon--green"><i class="ti ti-credit-card"></i></div>
          </div>
          @if (loading()) {
            <div class="skeleton-row" style="width:60%;height:28px;margin-bottom:10px"></div>
            <div class="skeleton-row" style="width:40%;height:14px"></div>
          } @else {
            <div class="kpi-value">{{ totalAccounts() }}</div>
            <div class="kpi-trend kpi-trend--up">
              <i class="ti ti-trending-up"></i> Corrente, Poupança, Pgto.
              <span class="kpi-trend__period"></span>
            </div>
          }
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Saldo Total</span>
            <div class="kpi-icon kpi-icon--amber"><i class="ti ti-coin"></i></div>
          </div>
          @if (loading()) {
            <div class="skeleton-row" style="width:80%;height:28px;margin-bottom:10px"></div>
            <div class="skeleton-row" style="width:40%;height:14px"></div>
          } @else {
            <div class="kpi-value" style="font-size:20px">{{ totalBalanceFormatted() }}</div>
            <div class="kpi-trend kpi-trend--up">
              <i class="ti ti-trending-up"></i> Em custódia
              <span class="kpi-trend__period">todas as contas</span>
            </div>
          }
        </div>
      </div>

      <!-- Conteúdo principal -->
      <div class="dash-grid">
        <!-- Transações recentes -->
        <div class="table-wrap">
          <div class="card-header" style="padding:14px 18px;border-bottom:1px solid var(--border-subtle)">
            <span class="card-title">Transações Recentes</span>
            <a routerLink="/transactions/statement" class="btn btn-ghost btn-sm">
              Ver todas <i class="ti ti-arrow-right"></i>
            </a>
          </div>

          @if (loading()) {
            <div class="skeleton-row" style="margin:16px"></div>
            <div class="skeleton-row" style="margin:16px;width:85%"></div>
            <div class="skeleton-row" style="margin:16px;width:70%"></div>
          } @else if (recentTransactions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon"><i class="ti ti-arrows-exchange"></i></div>
              <div class="empty-title">Sem movimentações recentes</div>
              <div class="empty-sub">As transações aparecerão aqui</div>
            </div>
          } @else {
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Conta</th>
                  <th>Valor</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of recentTransactions(); track tx.uuid) {
                  <tr>
                    <td>
                      <span class="badge {{ txBadge(tx.type) }}">
                        <i class="ti {{ txIcon(tx.type) }}" style="font-size:11px"></i>
                        {{ txLabel(tx.type) }}
                      </span>
                    </td>
                    <td class="td-mono td-muted">—</td>
                    <td>
                      <span class="{{ isDebit(tx.type) ? 'amount amount--negative' : 'amount amount--positive' }}">
                        {{ isDebit(tx.type) ? '- ' : '+ ' }}{{ formatCurrency(tx.amount) }}
                      </span>
                    </td>
                    <td class="td-muted text-sm">{{ formatDate(tx.createdAt) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>

        <!-- Painel lateral -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- Distribuição de contas -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Contas por Tipo</span>
            </div>
            @if (loading()) {
              <div class="skeleton-row"></div>
              <div class="skeleton-row" style="width:75%"></div>
              <div class="skeleton-row" style="width:55%"></div>
            } @else {
              <div class="bar-chart">
                <div>
                  <div class="bar-item__meta">
                    <span class="bar-item__label">Conta Corrente</span>
                    <span class="bar-item__value">{{ corrente() }}</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width]="correntePct()+'%'" style="background:var(--brand-500)"></div>
                  </div>
                </div>
                <div>
                  <div class="bar-item__meta">
                    <span class="bar-item__label">Conta Poupança</span>
                    <span class="bar-item__value">{{ poupanca() }}</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width]="poupancaPct()+'%'" style="background:var(--success)"></div>
                  </div>
                </div>
                <div>
                  <div class="bar-item__meta">
                    <span class="bar-item__label">Conta Pagamento</span>
                    <span class="bar-item__value">{{ pagamento() }}</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width]="pagamentoPct()+'%'" style="background:var(--warning)"></div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Ações rápidas -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Ações Rápidas</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <a routerLink="/customers/new" class="btn btn-secondary btn-full" style="justify-content:flex-start;gap:10px">
                <i class="ti ti-user-plus"></i> Novo Cliente
              </a>
              <a routerLink="/accounts/new" class="btn btn-secondary btn-full" style="justify-content:flex-start;gap:10px">
                <i class="ti ti-credit-card"></i> Abrir Conta
              </a>
              <a routerLink="/transactions/deposit" class="btn btn-secondary btn-full" style="justify-content:flex-start;gap:10px">
                <i class="ti ti-arrow-bar-down"></i> Depositar
              </a>
              <a routerLink="/transactions/transfer" class="btn btn-secondary btn-full" style="justify-content:flex-start;gap:10px">
                <i class="ti ti-arrows-exchange"></i> Transferir
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly accountService  = inject(AccountService);

  readonly loading = signal(true);
  readonly totalCustomers = signal(0);
  readonly totalAccounts  = signal(0);
  readonly totalBalanceFormatted = signal('R$ 0,00');
  readonly recentTransactions = signal<TransactionResponse[]>([]);
  readonly corrente  = signal(0);
  readonly poupanca  = signal(0);
  readonly pagamento = signal(0);
  readonly correntePct  = signal(0);
  readonly poupancaPct  = signal(0);
  readonly pagamentoPct = signal(0);

  readonly today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  readonly txLabel  = (t: string) => TRANSACTION_TYPE_LABELS[t as keyof typeof TRANSACTION_TYPE_LABELS] ?? t;
  readonly txBadge  = (t: string) => TRANSACTION_TYPE_BADGE[t as keyof typeof TRANSACTION_TYPE_BADGE]  ?? '';
  readonly txIcon   = (t: string) => TRANSACTION_TYPE_ICON[t as keyof typeof TRANSACTION_TYPE_ICON]    ?? 'ti-arrows-exchange';
  readonly isDebit  = isDebit;
  readonly formatCurrency = formatCurrency;

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  }

  ngOnInit(): void {
    forkJoin({
      customers: this.customerService.findAll({ size: 1 }),
      accounts:  this.accountService.findAll({ size: 100 }),
    }).subscribe({
      next: ({ customers, accounts }) => {
        this.totalCustomers.set(customers.totalElements);
        this.totalAccounts.set(accounts.totalElements);

        const total = accounts.content.reduce((sum, a) => sum + a.balance, 0);
        this.totalBalanceFormatted.set(formatCurrency(total));

        const c = accounts.content.filter((a: AccountResponse) => a.type === 'CORRENTE').length;
        const p = accounts.content.filter((a: AccountResponse) => a.type === 'POUPANCA').length;
        const pg = accounts.content.filter((a: AccountResponse) => a.type === 'PAGAMENTO').length;
        const tot = accounts.totalElements || 1;
        this.corrente.set(c);  this.correntePct.set(Math.round(c/tot*100));
        this.poupanca.set(p);  this.poupancaPct.set(Math.round(p/tot*100));
        this.pagamento.set(pg); this.pagamentoPct.set(Math.round(pg/tot*100));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
