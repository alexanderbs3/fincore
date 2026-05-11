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
  selector: 'app-transfer',
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
          <h1 class="page-title">Transferência</h1>
          <p class="page-subtitle">Movimentação entre contas bancárias</p>
        </div>
      </div>

      <div class="form-card" style="max-width:700px">
        <!-- Banner -->
        <div class="op-banner op-banner--transfer">
          <div class="op-banner__icon"><i class="ti ti-arrows-exchange"></i></div>
          <div>
            <div class="op-banner__title">Transferência</div>
            <div class="op-banner__sub">Movimentação instantânea entre contas</div>
          </div>
        </div>

        <!-- Flow visual -->
        <div class="transfer-flow">
          <div class="transfer-node">
            <div class="transfer-node__label">Conta Origem</div>
            <div class="transfer-node__value">{{ originLabel() }}</div>
          </div>
          <div class="transfer-arrow">
            <div class="transfer-arrow__line"></div>
            <div class="transfer-arrow__amount">{{ amountLabel() }}</div>
          </div>
          <div class="transfer-node">
            <div class="transfer-node__label">Conta Destino</div>
            <div class="transfer-node__value">{{ destLabel() }}</div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid form-grid-2col">
            <!-- Origem -->
            <div class="field-group">
              <label class="field-label">Conta de Origem <span class="field-required">*</span></label>
              <select formControlName="sourceAccountUuid" class="field-select"
                [class.error]="isInvalid('sourceAccountUuid')"
                (change)="onSourceChange()">
                <option value="">— Selecione —</option>
                @for (a of accounts(); track a.uuid) {
                  <option [value]="a.uuid">CC {{ a.accountNumber }} — {{ formatCurrency(a.balance) }}</option>
                }
              </select>
              @if (isInvalid('sourceAccountUuid')) {
                <span class="field-error">Selecione a conta de origem</span>
              }
              @if (sourceAccount()) {
                <div class="field-hint">
                  Saldo disponível: <strong style="font-family:var(--font-mono);color:var(--success)">
                    {{ formatCurrency(sourceAccount()!.balance) }}
                  </strong>
                </div>
              }
            </div>

            <!-- Destino -->
            <div class="field-group">
              <label class="field-label">Conta de Destino <span class="field-required">*</span></label>
              <select formControlName="destinationAccountUuid" class="field-select"
                [class.error]="isInvalid('destinationAccountUuid')"
                (change)="onDestChange()">
                <option value="">— Selecione —</option>
                @for (a of destAccounts(); track a.uuid) {
                  <option [value]="a.uuid">CC {{ a.accountNumber }} · {{ typeLabel(a.type) }}</option>
                }
              </select>
              @if (isInvalid('destinationAccountUuid')) {
                <span class="field-error">Selecione a conta de destino</span>
              }
              @if (sameAccountError()) {
                <span class="field-error">Origem e destino devem ser diferentes</span>
              }
            </div>

            <!-- Valor -->
            <div class="field-group full-col">
              <label class="field-label">Valor da Transferência <span class="field-required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">R$</span>
                <input type="number" formControlName="amount" placeholder="0,00"
                  min="0.01" step="0.01"
                  class="field-input" [class.error]="isInvalid('amount')"
                  style="padding-left:36px;font-family:var(--font-mono)"
                  (input)="onAmountChange()"/>
              </div>
              @if (isInvalid('amount')) {
                <span class="field-error">Valor deve ser maior que zero</span>
              }
              @if (insufficientFunds()) {
                <span class="field-error">
                  <i class="ti ti-alert-triangle"></i>
                  Saldo insuficiente — disponível: {{ formatCurrency(sourceAccount()!.balance) }}
                </span>
              }
              <div class="quick-amounts">
                @for (v of quickAmounts; track v) {
                  <button type="button" class="quick-amount" (click)="setAmount(v)">
                    {{ formatCurrency(v) }}
                  </button>
                }
              </div>
            </div>

            <!-- Descrição -->
            <div class="field-group full-col">
              <label class="field-label">Descrição <span style="color:var(--text-muted);font-weight:400">(opcional)</span></label>
              <input type="text" formControlName="description"
                placeholder="Ex.: pagamento aluguel"
                class="field-input" maxlength="255"/>
              <span class="field-hint">Máximo 255 caracteres</span>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/transactions/statement" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary btn-lg"
              [disabled]="loading() || sameAccountError() || insufficientFunds()">
              @if (loading()) {
                <span class="btn-loading"><span class="btn-spinner"></span>Processando...</span>
              } @else {
                <i class="ti ti-send"></i> Confirmar Transferência
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TransferComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly accountService     = inject(AccountService);
  private readonly notif   = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);
  private readonly router  = inject(Router);
  private readonly route   = inject(ActivatedRoute);
  private readonly fb      = inject(FormBuilder);

  readonly loading       = signal(false);
  readonly accounts      = signal<AccountResponse[]>([]);
  readonly sourceAccount = signal<AccountResponse | null>(null);
  readonly destAccount   = signal<AccountResponse | null>(null);

  readonly formatCurrency = formatCurrency;
  readonly typeLabel = (t: string) => ACCOUNT_TYPE_LABELS[t as keyof typeof ACCOUNT_TYPE_LABELS] ?? t;
  readonly quickAmounts = [100, 500, 1000, 5000];

  readonly form: FormGroup = this.fb.group({
    sourceAccountUuid:      ['', Validators.required],
    destinationAccountUuid: ['', Validators.required],
    amount:      [null, [Validators.required, Validators.min(0.01)]],
    description: [''],
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  sameAccountError(): boolean {
    const { sourceAccountUuid, destinationAccountUuid } = this.form.value;
    return !!(sourceAccountUuid && destinationAccountUuid &&
              sourceAccountUuid === destinationAccountUuid);
  }

  insufficientFunds(): boolean {
    const src = this.sourceAccount();
    const amt = +this.form.value.amount;
    return !!(src && amt > 0 && amt > src.balance);
  }

  destAccounts(): AccountResponse[] {
    const srcUuid = this.form.value.sourceAccountUuid;
    return this.accounts().filter(a => a.uuid !== srcUuid);
  }

  originLabel(): string {
    const a = this.sourceAccount();
    return a ? `CC ${a.accountNumber}` : '—';
  }

  destLabel(): string {
    const a = this.destAccount();
    return a ? `CC ${a.accountNumber}` : '—';
  }

  amountLabel(): string {
    const amt = +this.form.value.amount;
    return amt > 0 ? formatCurrency(amt) : 'R$ 0,00';
  }

  onSourceChange(): void {
    const uuid = this.form.value.sourceAccountUuid;
    this.sourceAccount.set(this.accounts().find(a => a.uuid === uuid) ?? null);
    // resetar destino se for igual
    if (this.form.value.destinationAccountUuid === uuid) {
      this.form.patchValue({ destinationAccountUuid: '' });
      this.destAccount.set(null);
    }
  }

  onDestChange(): void {
    const uuid = this.form.value.destinationAccountUuid;
    this.destAccount.set(this.accounts().find(a => a.uuid === uuid) ?? null);
  }

  onAmountChange(): void { /* reativo via signal */ }

  setAmount(v: number): void {
    this.form.patchValue({ amount: v });
  }

  ngOnInit(): void {
    this.accountService.findAll({ size: 100 }).subscribe({
      next: page => {
        this.accounts.set(page.content);
        const sourceUuid = this.route.snapshot.queryParamMap.get('source');
        if (sourceUuid) {
          this.form.patchValue({ sourceAccountUuid: sourceUuid });
          this.onSourceChange();
        }
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.sameAccountError()) return;
    if (this.insufficientFunds()) return;

    const src  = this.sourceAccount();
    const dest = this.destAccount();
    const amt  = +this.form.value.amount;

    const confirmed = await this.confirm.confirm({
      title:        'Confirmar Transferência',
      subtitle:     'Esta operação não pode ser desfeita.',
      icon:         'info',
      confirmLabel: 'Confirmar Transferência',
      confirmClass: 'btn-primary',
      rows: [
        { label: 'De',    value: src  ? `CC ${src.accountNumber}`  : '' },
        { label: 'Para',  value: dest ? `CC ${dest.accountNumber}` : '' },
        { label: 'Valor', value: formatCurrency(amt), highlight: true },
        ...(this.form.value.description
          ? [{ label: 'Descrição', value: this.form.value.description }]
          : []),
      ],
    });

    if (!confirmed) return;

    this.loading.set(true);
    const payload = {
      sourceAccountUuid:      this.form.value.sourceAccountUuid,
      destinationAccountUuid: this.form.value.destinationAccountUuid,
      amount:                 amt,
      ...(this.form.value.description ? { description: this.form.value.description } : {}),
    };

    this.transactionService.transfer(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Transferência realizada com sucesso!');
          this.router.navigate(['/transactions/statement']);
        },
      });
  }
}
