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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-layout">
      <div class="auth-brand">
        <div class="auth-deco" style="width:400px;height:400px;bottom:-120px;right:-100px"></div>
        <div class="auth-deco" style="width:240px;height:240px;top:-60px;left:-80px;border-color:rgba(255,255,255,0.03)"></div>
        <div class="auth-brand__logo">Fin<span>Core</span></div>
        <div class="auth-brand__tagline">Crie sua conta de acesso</div>
      </div>

      <div class="auth-panel">
        <div class="auth-card">
          <h1 class="auth-title">Criar conta</h1>
          <p class="auth-subtitle">Preencha os dados para se registrar</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field-group">
              <label class="field-label">E-mail <span class="field-required">*</span></label>
              <input type="email" formControlName="email" placeholder="seu@email.com"
                class="field-input" [class.error]="isInvalid('email')" autocomplete="email"/>
              @if (isInvalid('email')) {
                <span class="field-error">E-mail inválido</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Senha <span class="field-required">*</span></label>
              <div class="input-prefix-wrap">
                <input [type]="showPwd() ? 'text' : 'password'" formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  class="field-input" [class.error]="isInvalid('password')"
                  style="padding-right:44px" autocomplete="new-password"/>
                <button type="button" class="password-toggle" (click)="showPwd.set(!showPwd())">
                  <i class="ti {{ showPwd() ? 'ti-eye-off' : 'ti-eye' }}"></i>
                </button>
              </div>
              @if (isInvalid('password')) {
                <span class="field-error">Senha deve ter no mínimo 6 caracteres</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Perfil de acesso</label>
              <div class="role-selector">
                <label class="role-option" [class.selected]="form.value.role === 'USER'">
                  <input type="radio" formControlName="role" value="USER"/>
                  <div class="role-label">
                    <i class="ti ti-user role-icon"></i>
                    <span>Usuário</span>
                  </div>
                </label>
                <label class="role-option" [class.selected]="form.value.role === 'ADMIN'">
                  <input type="radio" formControlName="role" value="ADMIN"/>
                  <div class="role-label">
                    <i class="ti ti-shield role-icon"></i>
                    <span>Administrador</span>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg btn-full"
              style="margin-top:4px" [disabled]="loading()">
              @if (loading()) {
                <span class="btn-loading"><span class="btn-spinner"></span>Criando...</span>
              } @else {
                <i class="ti ti-user-plus"></i> Criar conta
              }
            </button>
          </form>

          <p class="auth-link">Já tem conta? <a routerLink="/auth/login">Entrar</a></p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly showPwd = signal(false);

  readonly form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['USER', Validators.required],
  });

  isInvalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.authService.register(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notif.success('Conta criada! Faça login.');
          this.router.navigate(['/auth/login']);
        },
      });
  }
}
