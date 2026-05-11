import {
  Component, inject, signal, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AccountService } from '../../../core/services/account.service';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CustomerResponse, AccountType } from '../../../core/models/models';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <a routerLink="/accounts" class="back-link">
        <i class="ti ti-arrow-left"></i> Contas
      </a>
      <div class="page-header">
        <div>
          <h1 class="page-title">Nova Conta</h1>
          <p class="page-subtitle">Abra uma nova conta bancária para um cliente</p>
        </div>
      </div>

      <div class="form-card" style="max-width:680px">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="field-group">
              <label class="field-label">Cliente <span class="field-required">*</span></label>
              <select formControlName="customerUuid" class="field-select"
                [class.error]="isInvalid('customerUuid')">
                <option value="">— Selecione um cliente —</option>
                @for (c of customers(); track c.uuid) {
                  <option [value]="c.uuid">{{ c.fullName }} — {{ c.documentNumber }}</option>
                }
              </select>
              @if (isInvalid('customerUuid')) {
                <span class="field-error">Selecione um cliente</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Tipo de Conta <span class="field-required">*</span></label>
              <div class="type-selector">
                @for (opt of accountTypeOptions; track opt.value) {
                  <label class="type-option" [class.selected]="form.value.type === opt.value">
                    <input type="radio" formControlName="type" [value]="opt.value"/>
                    <div class="type-label">
                      <span class="type-icon">{{ opt.icon }}</span>
                      <span class="type-name">{{ opt.label }}</span>
                      <span class="type-desc">{{ opt.description }}</span>
                    </div>
                  </label>
                }
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/accounts" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-loading"><span class="btn-spinner"></span>Criando...</span>
              } @else {
                <i class="ti ti-credit-card"></i> Abrir Conta
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AccountFormComponent implements OnInit {
  private readonly accountService  = inject(AccountService);
  private readonly customerService = inject(CustomerService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading   = signal(false);
  readonly customers = signal<CustomerResponse[]>([]);

  readonly accountTypeOptions: { value: AccountType; label: string; icon: string; description: string }[] = [
    { value: 'CORRENTE',  label: 'Corrente',  icon: '◎', description: 'Uso diário e transferências' },
    { value: 'POUPANCA',  label: 'Poupança',  icon: '◈', description: 'Rendimento automático' },
    { value: 'PAGAMENTO', label: 'Pagamento', icon: '◉', description: 'Contas e boletos' },
  ];

  readonly form: FormGroup = this.fb.group({
    customerUuid: ['', Validators.required],
    type:         ['CORRENTE', Validators.required],
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  ngOnInit(): void {
    this.customerService.findAll({ size: 100 }).subscribe({
      next: page => this.customers.set(page.content),
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.accountService.create(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Conta aberta com sucesso!');
          this.router.navigate(['/accounts']);
        },
      });
  }
}
