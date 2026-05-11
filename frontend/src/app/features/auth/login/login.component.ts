import {
  Component, inject, signal, ChangeDetectionStrategy
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-layout">
      <!-- Painel esquerdo - Brand -->
      <div class="auth-brand">
        <div class="auth-deco" style="width:400px;height:400px;bottom:-120px;right:-100px"></div>
        <div class="auth-deco" style="width:240px;height:240px;top:-60px;left:-80px;border-color:rgba(255,255,255,0.03)"></div>
        <div class="auth-brand__logo">Fin<span>Core</span></div>
        <div class="auth-brand__tagline">Sistema de Gestão Financeira</div>
        <div class="auth-brand__stats">
          <div class="auth-stat">
            <div class="auth-stat__value">100%</div>
            <div class="auth-stat__label">Seguro</div>
          </div>
          <div class="auth-stat">
            <div class="auth-stat__value">JWT</div>
            <div class="auth-stat__label">Auth</div>
          </div>
          <div class="auth-stat">
            <div class="auth-stat__value">REST</div>
            <div class="auth-stat__label">API</div>
          </div>
        </div>
      </div>

      <!-- Painel direito - Form -->
      <div class="auth-panel">
        <div class="auth-card">
          <h1 class="auth-title">Bem-vindo de volta</h1>
          <p class="auth-subtitle">Acesse com suas credenciais</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field-group">
              <label class="field-label">
                E-mail <span class="field-required">*</span>
              </label>
              <input
                type="email"
                formControlName="email"
                placeholder="admin@fincore.com"
                class="field-input"
                [class.error]="isInvalid('email')"
                autocomplete="email"
              />
              @if (isInvalid('email')) {
                <span class="field-error">E-mail inválido</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">
                Senha <span class="field-required">*</span>
              </label>
              <div class="input-prefix-wrap">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="field-input"
                  [class.error]="isInvalid('password')"
                  autocomplete="current-password"
                  style="padding-right: 44px"
                />
                <button
                  type="button"
                  class="password-toggle"
                  (click)="showPassword.set(!showPassword())"
                  [title]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
                >
                  <i class="ti {{ showPassword() ? 'ti-eye-off' : 'ti-eye' }}"></i>
                </button>
              </div>
              @if (isInvalid('password')) {
                <span class="field-error">Senha obrigatória</span>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg btn-full"
              style="margin-top:4px"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="btn-loading">
                  <span class="btn-spinner"></span>Entrando...
                </span>
              } @else {
                <i class="ti ti-login"></i> Entrar
              }
            </button>
          </form>

          <p class="auth-link">
            Não tem conta? <a routerLink="/auth/register">Criar conta</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly showPassword = signal(false);

  readonly form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.login(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Login realizado com sucesso!');
          this.router.navigate(['/']);
        },
      });
  }
}
