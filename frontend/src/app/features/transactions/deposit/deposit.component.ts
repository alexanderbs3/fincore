import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { AccountResponse } from '../../../core/models/models';
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '../../../core/utils/label.utils';

@Component({
  selector: 'app-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <a routerLink="/transactions/statement" class="back-link">
        <i class="ti ti-arrow-left"></i> Voltar
      </a>
      <div class="page-header">
        <div>
          <h1 class="page-title">Depósito</h1>
          <p class="page-subtitle">Adicionar fundos a uma conta bancária</p>
        </div>
      </div>

      <div class="form-card" style="max-width:560px">
        <!-- Banner -->
        <div class="op-banner op-banner--deposit">
          <div class="op-banner__icon"><i class="ti ti-arrow-bar-down"></i></div>
          <div>
            <div class="op-banner__title">Depósito</div>
            <div class="op-banner__sub">Operação de crédito — disponível imediatamente</div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Conta destino -->
            <div class="field-group full-col">
              <label class="field-label">Conta Destino <span class="field-required">*</span></label>
              <select formControlName="accountUuid" class="field-select"
                [class.error]="isInvalid('accountUuid')"
                (change)="onAccountChange()">
                <option value="">— Selecione a conta —</option>
                @for (a of accounts(); track a.uuid) {
                  <option [value]="a.uuid">
                    CC {{ a.accountNumber }} · Ag. {{ a.agency }} — {{ typeLabel(a.type) }}
                  </option>
                }
              </select>
              @if (isInvalid('accountUuid')) {
                <span class="field-error">Selecione uma conta</span>
              }

              @if (selectedAccount()) {
                <div class="account-preview">
                  <div>
                    <div class="account-preview__label">Saldo atual</div>
                    <div class="account-preview__value"
                      [class.account-preview__balance]="selectedAccount()!.balance >= 0"
                      [class.account-preview__balance--negative]="selectedAccount()!.balance < 0">
                      {{ formatCurrency(selectedAccount()!.balance) }}
                    </div>
                  </div>
                  @if (form.value.amount > 0) {
                    <div style="text-align:right">
                      <div class="account-preview__label">Após depósito</div>
                      <div class="account-preview__balance">
                        {{ formatCurrency(selectedAccount()!.balance + (+form.value.amount || 0)) }}
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Valor -->
            <div class="field-group full-col">
              <label class="field-label">Valor do Depósito <span class="field-required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">R$</span>
                <input type="number" formControlName="amount" placeholder="0,00"
                  min="0.01" step="0.01"
                  class="field-input" [class.error]="isInvalid('amount')"
                  style="padding-left:36px;font-family:var(--font-mono)"/>
              </div>
              @if (isInvalid('amount')) {
                <span class="field-error">Valor deve ser maior que zero</span>
              }
              <div class="quick-amounts">
                @for (v of quickAmounts; track v) {
                  <button type="button" class="quick-amount" (click)="setAmount(v)">
                    {{ formatCurrency(v) }}
                  </button>
                }
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/transactions/statement" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-success btn-lg" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-loading"><span class="btn-spinner"></span>Processando...</span>
              } @else {
                <i class="ti ti-check"></i> Confirmar Depósito
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DepositComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly accountService     = inject(AccountService);
  private readonly notif    = inject(NotificationService);
  private readonly confirm  = inject(ConfirmService);
  private readonly router   = inject(Router);
  private readonly route    = inject(ActivatedRoute);
  private readonly fb       = inject(FormBuilder);

  readonly loading         = signal(false);
  readonly accounts        = signal<AccountResponse[]>([]);
  readonly selectedAccount = signal<AccountResponse | null>(null);

  readonly quickAmounts = [50, 100, 500, 1000, 5000];
  readonly formatCurrency = formatCurrency;
  readonly typeLabel = (t: string) => ACCOUNT_TYPE_LABELS[t as keyof typeof ACCOUNT_TYPE_LABELS] ?? t;

  readonly form: FormGroup = this.fb.group({
    accountUuid: ['', Validators.required],
    amount:      [null, [Validators.required, Validators.min(0.01)]],
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  ngOnInit(): void {
    this.accountService.findAll({ size: 100 }).subscribe({
      next: page => {
        this.accounts.set(page.content);
        // pré-selecionar se vier via queryParam
        const uuid = this.route.snapshot.queryParamMap.get('account');
        if (uuid) {
          this.form.patchValue({ accountUuid: uuid });
          this.onAccountChange();
        }
      },
    });
  }

  onAccountChange(): void {
    const uuid = this.form.value.accountUuid;
    const acc  = this.accounts().find(a => a.uuid === uuid) ?? null;
    this.selectedAccount.set(acc);
  }

  setAmount(v: number): void {
    this.form.patchValue({ amount: v });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const acc = this.selectedAccount();
    const amt = +this.form.value.amount;

    const confirmed = await this.confirm.confirm({
      title:        'Confirmar Depósito',
      subtitle:     'Esta operação será creditada imediatamente.',
      icon:         'success',
      confirmLabel: 'Confirmar Depósito',
      confirmClass: 'btn-success',
      rows: [
        { label: 'Operação',       value: 'Depósito' },
        { label: 'Conta destino',  value: acc ? `CC ${acc.accountNumber} · Ag. ${acc.agency}` : '' },
        { label: 'Saldo atual',    value: acc ? formatCurrency(acc.balance) : '' },
        { label: 'Valor',          value: formatCurrency(amt), highlight: true },
        { label: 'Saldo após',     value: acc ? formatCurrency(acc.balance + amt) : '' },
      ],
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.transactionService.deposit(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Depósito realizado com sucesso!');
          this.router.navigate(['/transactions/statement']);
        },
      });
  }
}
