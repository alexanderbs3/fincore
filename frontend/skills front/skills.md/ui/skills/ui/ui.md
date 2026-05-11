---
name: ui
description: >
  Skill especializada em criação, refatoração e melhoria de componentes Angular
  para o projeto ClinicaIES. Cobre standalone components, SCSS com as CSS
  custom properties do projeto, shells, modais, tabelas CRUD, formulários
  reativos e padrões de UI da aplicação clínica. Use este skill sempre que o
  usuário pedir para criar, corrigir, estilizar ou melhorar qualquer componente
  Angular do projeto — mesmo que diga apenas "cria um componente", "melhora o
  HTML", "arruma o SCSS" ou "preciso de uma tela nova".
---

# UI Skill — ClinicaIES Angular 17

## Contexto do Projeto

| Item | Detalhe |
|------|---------|
| Framework | Angular 17 (standalone components) |
| Estilo | SCSS com CSS Custom Properties (ver tokens abaixo) |
| Fontes | `Syne` (headings) · `DM Sans` (body) |
| Tema | Dark default · Light via `body[data-theme='light']` |
| Ícones | SVG inline (shell-icons.ts) |
| State | Services + RxJS, sem NgRx |
| HTTP | `ApiService` centralizado |

---

## Design Tokens (CSS Custom Properties)

```scss
/* Superfícies */
--color-bg          /* fundo da página */
--color-surface     /* cards, modais */
--color-surface-2   /* sub-cards */
--color-border      /* bordas padrão */
--color-border-light

/* Texto */
--color-text-primary
--color-text-secondary
--color-text-muted

/* Marca */
--color-primary        /* #3b82f6 dark / #2563eb light */
--color-primary-light  /* rgba com opacidade */
--color-primary-dark

/* Semânticos */
--color-success / --color-success-light
--color-warning / --color-warning-light
--color-danger  / --color-danger-light
--color-info    / --color-info-light

/* Layout */
--sidebar-width: 260px
--header-height: 64px

/* Raios */
--radius-sm: 6px  --radius-md: 10px  --radius-lg: 16px  --radius-xl: 24px

/* Transições */
--transition-fast: 150ms  --transition-base: 250ms  --transition-slow: 400ms

/* Sombras */
--shadow-sm  --shadow-md  --shadow-lg  --shadow-xl
```

---

## Anatomia de um Componente Padrão

### TypeScript (Standalone)
```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { MinhaEntidade } from '../../../core/models/models';

@Component({
  selector: 'app-meu-componente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './meu-componente.component.html',
  styleUrl: './meu-componente.component.scss'
})
export class MeuComponenteComponent implements OnInit {
  items = signal<MinhaEntidade[]>([]);
  loading = signal(false);
  erro = signal<string | null>(null);

  constructor(private api: ApiService, private fb: FormBuilder) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.api.get<MinhaEntidade[]>('/endpoint').subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: () => { this.erro.set('Falha ao carregar'); this.loading.set(false); }
    });
  }
}
```

### HTML Template Padrão (CRUD)
```html
<div class="page-enter">
  <div class="page-header">
    <div class="page-title">
      <h1>Título da Página</h1>
      <span class="page-subtitle">Subtítulo descritivo</span>
    </div>
    <button class="btn btn-primary" (click)="abrirModal()">
      <svg><!-- ícone --></svg> Nova Entidade
    </button>
  </div>

  <!-- Loading State -->
  @if (loading()) {
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>
  }

  <!-- Tabela -->
  @if (!loading()) {
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th class="col-actions">Ações</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr>
              <td>{{ item.nome }}</td>
              <td class="actions">
                <button class="btn-icon btn-edit"  (click)="editar(item)">✏</button>
                <button class="btn-icon btn-delete" (click)="excluir(item)">🗑</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="empty-state">Nenhum registro encontrado.</td></tr>
          }
        </tbody>
      </table>
    </div>
  }
</div>
```

### SCSS Padrão
```scss
.page-enter {
  display: flex; flex-direction: column; gap: 24px;
  padding: 28px; animation: fadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  h1 { font-family: 'Syne', sans-serif; font-size: 1.6rem; color: var(--color-text-primary); }
  .page-subtitle { font-size: 0.875rem; color: var(--color-text-muted); margin-top: 2px; }
}

.table-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  table { width: 100%; border-collapse: collapse; }
  th {
    background: var(--color-surface-2);
    padding: 12px 16px;
    font-size: 0.75rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-border);
    text-align: left;
  }
  td {
    padding: 14px 16px;
    font-size: 0.9rem;
    color: var(--color-text-primary);
    border-bottom: 1px solid var(--color-border-light);
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--color-surface-2); }
}

.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 18px; border-radius: var(--radius-md);
  font-size: 0.875rem; font-weight: 600;
  transition: all var(--transition-fast);

  &.btn-primary {
    background: var(--color-primary);
    color: #fff;
    &:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
  }
  &.btn-ghost {
    color: var(--color-text-secondary);
    &:hover { background: var(--color-surface-2); }
  }
}

.btn-icon {
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: all var(--transition-fast);

  &.btn-edit   { color: var(--color-primary); &:hover { background: var(--color-primary-light); } }
  &.btn-delete { color: var(--color-danger);  &:hover { background: var(--color-danger-light);  } }
}

.empty-state {
  text-align: center; padding: 48px !important;
  color: var(--color-text-muted); font-size: 0.9rem;
}
```

---

## Padrões Globais de Classe

| Classe | Uso |
|--------|-----|
| `.page-enter` | Wrapper da página com fadeIn |
| `.table-card` | Card de tabela padrão |
| `.btn .btn-primary` | Botão de ação principal |
| `.btn .btn-ghost` | Botão secundário |
| `.btn-icon` | Botão só com ícone (32×32) |
| `.badge.badge-ativo/inativo` | Status badges |
| `.loading-state` | Spinner de carregamento |
| `.empty-state` | Mensagem de lista vazia |
| `.form-grid` | Grid de 2 colunas por padrão |
| `.form-grid.cols-1` | Grid de 1 coluna |

---

## Regras de Ouro

1. **Sempre usar CSS custom properties** — nunca hex hardcoded no SCSS
2. **`@if / @for`** em vez de `*ngIf / *ngFor` (Angular 17+)
3. **Signals** (`signal()`) para estado local reativo
4. **Standalone components** — sempre declarar `imports: []`
5. **Tema-agnóstico**: testar visual em dark E light mode
6. **Animação padrão**: `fadeIn 0.35s` no `.page-enter`
7. **Acessibilidade**: `aria-label` em todos os `btn-icon`

---

## Referências Internas
- Ver `references/modal-pattern.md` para padrão de modais
- Ver `references/form-pattern.md` para formulários reativos
- Ver `ui.components.ts` para componentes compartilhados (Badge, Spinner, etc.)
