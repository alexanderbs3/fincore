import {
  Component, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-body">
      <a routerLink="/customers" class="back-link">
        <i class="ti ti-arrow-left"></i> Clientes
      </a>
      <div class="page-header">
        <div>
          <h1 class="page-title">Novo Cliente</h1>
          <p class="page-subtitle">Preencha os dados para cadastrar um novo cliente</p>
        </div>
      </div>

      <div class="form-card" style="max-width:680px">
        <div class="form-section-title">Dados Pessoais</div>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid form-grid-2col">
            <div class="field-group full-col">
              <label class="field-label">Nome Completo <span class="field-required">*</span></label>
              <input type="text" formControlName="fullName" placeholder="João da Silva"
                class="field-input" [class.error]="isInvalid('fullName')"/>
              @if (isInvalid('fullName')) {
                <span class="field-error">Nome deve ter entre 3 e 150 caracteres</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">CPF / CNPJ <span class="field-required">*</span></label>
              <input type="text" formControlName="documentNumber"
                placeholder="Apenas números (11 ou 14 dígitos)"
                maxlength="14" class="field-input" [class.error]="isInvalid('documentNumber')"/>
              @if (isInvalid('documentNumber')) {
                <span class="field-error">CPF (11 dígitos) ou CNPJ (14 dígitos) obrigatório</span>
              }
              <span class="field-hint">Apenas dígitos, sem pontuação</span>
            </div>

            <div class="field-group">
              <label class="field-label">E-mail <span class="field-required">*</span></label>
              <input type="email" formControlName="email" placeholder="joao@email.com"
                class="field-input" [class.error]="isInvalid('email')" autocomplete="off"/>
              @if (isInvalid('email')) {
                <span class="field-error">E-mail inválido</span>
              }
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/customers" class="btn btn-secondary">Cancelar</a>
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-loading"><span class="btn-spinner"></span>Salvando...</span>
              } @else {
                <i class="ti ti-check"></i> Salvar Cliente
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CustomerFormComponent {
  private readonly customerService = inject(CustomerService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);

  readonly form: FormGroup = this.fb.group({
    fullName:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    documentNumber: ['', [Validators.required, Validators.pattern(/^(\d{11}|\d{14})$/)]],
    email:          ['', [Validators.required, Validators.email]],
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.customerService.create(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Cliente cadastrado com sucesso!');
          this.router.navigate(['/customers']);
        },
      });
  }
}
