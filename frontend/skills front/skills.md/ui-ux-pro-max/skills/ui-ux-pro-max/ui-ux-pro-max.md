---
name: ui-ux-pro-max
description: >
  Skill de UX avançado (nível "pro max") para o ClinicaIES. Cobre fluxos de
  usuário, microinterações, feedback visual imediato, acessibilidade WCAG,
  formulários progressivos, modais otimizados, skeleton loaders, toasts,
  validação inline, estados de erro/sucesso e UX de sistemas clínicos. Use
  este skill quando o usuário falar de "experiência do usuário", "UX",
  "fluxo", "feedback", "validação", "acessibilidade", "skeleton", "toast",
  "microinteração", ou quando uma tela estiver tecnicamente correta mas
  difícil de usar, confusa, ou sem feedback adequado.
---

# UI/UX Pro Max — ClinicaIES

## Premissa

Um sistema clínico tem usuários sob pressão (médicos, enfermeiros, recepcionistas). A UX deve ser **previsível, rápida e sem ambiguidade**. Cada interação deve ter feedback imediato e claro.

---

## 1. Skeleton Loaders (melhor que spinners)

```typescript
// skeleton.component.ts
@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-wrapper">
      @for (row of rows; track $index) {
        <div class="skeleton-row">
          <div class="skeleton-cell wide"></div>
          <div class="skeleton-cell medium"></div>
          <div class="skeleton-cell narrow"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .skeleton-row {
      display: flex; gap: 16px; padding: 14px 16px;
      border-bottom: 1px solid var(--color-border-light);
    }
    .skeleton-cell {
      height: 14px; border-radius: var(--radius-sm);
      background: linear-gradient(
        90deg,
        var(--color-surface-2) 25%,
        var(--color-border) 50%,
        var(--color-surface-2) 75%
      );
      background-size: 400% 100%;
      animation: shimmer 1.4s ease infinite;
    }
    .wide   { flex: 3; }
    .medium { flex: 2; }
    .narrow { flex: 1; }

    @keyframes shimmer {
      0%   { background-position: 100% 50%; }
      100% { background-position:   0% 50%; }
    }
  `]
})
export class SkeletonComponent {
  @Input() rows = 5;
}
```

---

## 2. Toast Notifications (Service + Component)

```typescript
// toast.service.ts
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast { id: number; type: ToastType; message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly list = this.toasts.asReadonly();
  private counter = 0;

  show(message: string, type: ToastType = 'success', duration = 3500) {
    const id = ++this.counter;
    this.toasts.update(t => [...t, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string)   { this.show(msg, 'error', 5000); }
  warning(msg: string) { this.show(msg, 'warning'); }
}
```

```scss
// toast host (no shell)
.toast-host {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; flex-direction: column; gap: 10px;
  z-index: 9999;
}

.toast {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 500;
  min-width: 280px; max-width: 380px;
  box-shadow: var(--shadow-lg);
  animation: slideInRight 0.25s cubic-bezier(0.4,0,0.2,1) both;

  &.success { background: var(--color-success); color: #fff; }
  &.error   { background: var(--color-danger);  color: #fff; }
  &.warning { background: var(--color-warning); color: #fff; }
  &.info    { background: var(--color-info);    color: #fff; }

  .toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
  .toast-close { margin-left: auto; opacity: 0.7; cursor: pointer;
    &:hover { opacity: 1; } }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 3. Validação Inline em Formulários

```html
<!-- form-field padrão com feedback inline -->
<div class="form-field" [class.has-error]="campo.invalid && campo.touched">
  <label class="form-label">
    Nome do Paciente
    <span class="required-mark">*</span>
  </label>
  <input
    type="text"
    class="form-input"
    formControlName="nome"
    [attr.aria-invalid]="campo.invalid && campo.touched"
    aria-describedby="nome-error"
  >
  @if (campo.invalid && campo.touched) {
    <span class="field-error" id="nome-error" role="alert">
      <svg><!-- ícone alerta --></svg>
      @if (campo.errors?.['required']) { Campo obrigatório }
      @if (campo.errors?.['minlength']) { Mínimo 3 caracteres }
    </span>
  }
  @if (campo.valid && campo.touched) {
    <span class="field-success">
      <svg><!-- check --></svg> Ok
    </span>
  }
</div>
```

```scss
.form-field {
  display: flex; flex-direction: column; gap: 6px;

  .form-label {
    font-size: 0.8125rem; font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase; letter-spacing: 0.04em;
  }

  .required-mark { color: var(--color-danger); margin-left: 2px; }

  .form-input {
    padding: 10px 14px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-light);
    }
  }

  &.has-error .form-input {
    border-color: var(--color-danger);
    &:focus { box-shadow: 0 0 0 3px var(--color-danger-light); }
  }

  .field-error {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.8rem; color: var(--color-danger);
    animation: fadeIn 0.2s ease both;
  }

  .field-success {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.8rem; color: var(--color-success);
  }
}
```

---

## 4. Confirmação de Ação Destrutiva

```html
<!-- Nunca use window.confirm() — use este modal inline -->
<div class="confirm-danger" @if="confirmandoExclusao">
  <div class="confirm-icon">
    <svg><!-- trash icon --></svg>
  </div>
  <div class="confirm-content">
    <h4>Excluir {{ itemSelecionado?.nome }}?</h4>
    <p>Esta ação não pode ser desfeita.</p>
  </div>
  <div class="confirm-actions">
    <button class="btn btn-ghost" (click)="cancelarExclusao()">Cancelar</button>
    <button class="btn btn-danger" (click)="confirmarExclusao()" [disabled]="excluindo()">
      @if (excluindo()) { <div class="spinner-sm"></div> }
      @else { Excluir }
    </button>
  </div>
</div>
```

---

## 5. Estados de Botão com Feedback

```typescript
// Padrão: loading state no botão de submit
salvar() {
  if (this.form.invalid) {
    this.form.markAllAsTouched(); // Dispara validação visual
    return;
  }
  this.salvando.set(true);
  this.api.post('/endpoint', this.form.value).subscribe({
    next: () => {
      this.toast.success('Salvo com sucesso!');
      this.salvando.set(false);
      this.fecharModal();
    },
    error: () => {
      this.toast.error('Falha ao salvar. Tente novamente.');
      this.salvando.set(false);
    }
  });
}
```

```html
<button class="btn btn-primary" (click)="salvar()" [disabled]="salvando()">
  @if (salvando()) {
    <div class="spinner-inline"></div> Salvando...
  } @else {
    <svg><!-- save icon --></svg> Salvar
  }
</button>
```

---

## 6. Filtro de Tabela com Busca Reativa

```typescript
// Busca reativa sem chamada ao servidor
protected readonly termoBusca = signal('');

protected readonly itensFiltrados = computed(() =>
  this.items().filter(item =>
    item.nome.toLowerCase().includes(this.termoBusca().toLowerCase()) ||
    item.cpf?.includes(this.termoBusca())
  )
);
```

```html
<div class="search-bar">
  <svg class="search-icon"><!-- magnifier --></svg>
  <input
    type="search"
    placeholder="Buscar por nome ou CPF..."
    [value]="termoBusca()"
    (input)="termoBusca.set($any($event.target).value)"
  >
  @if (termoBusca()) {
    <button class="clear-btn" (click)="termoBusca.set('')">✕</button>
  }
</div>
```

---

## 7. Acessibilidade (WCAG 2.1 AA)

```html
<!-- Padrão mínimo de acessibilidade -->
<button aria-label="Editar paciente João Silva" class="btn-icon btn-edit">✏</button>
<button aria-label="Excluir paciente João Silva" class="btn-icon btn-delete">🗑</button>

<!-- Modal acessível -->
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Novo Atendimento</h2>
</div>

<!-- Tabela acessível -->
<table aria-label="Lista de pacientes">
  <caption class="sr-only">{{ itensFiltrados().length }} pacientes encontrados</caption>
</table>
```

```scss
// Screen reader only
.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
```

---

## UX Checklist Clínico

- [ ] Todo formulário tem validação inline (não só no submit)?
- [ ] Botões destrutivos têm confirmação?
- [ ] Loading state em toda requisição assíncrona?
- [ ] Toast de sucesso/erro em toda operação?
- [ ] Busca com debounce ou filtro reativo?
- [ ] Campos obrigatórios sinalizados com `*`?
- [ ] Tab order lógico nos formulários?
- [ ] Focus trap no modal (não deixa Tab sair)?
- [ ] Empty state quando lista está vazia?
- [ ] Mensagens de erro em linguagem humana (não "Error 422")?
