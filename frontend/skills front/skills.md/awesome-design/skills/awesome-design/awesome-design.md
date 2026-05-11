---
name: awesome-design
description: >
  Skill de design de alto nível para o projeto ClinicaIES. Cobre princípios
  estéticos, hierarquia visual, uso correto de espaçamento, contraste, motion
  design, composição de telas e como evitar UI genérica/sem personalidade.
  Use este skill sempre que o usuário pedir para "deixar mais bonito",
  "melhorar o design", "dar um toque profissional", "redesenhar", "criar uma
  tela com boa aparência", ou quando a UI parecer monótona, sem identidade
  visual ou amadora. Também dispara para qualquer pergunta sobre estética,
  paleta de cores, hierarquia visual, espaçamento ou composição.
---

# Awesome Design — ClinicaIES

> "Design não é como algo parece. É como algo funciona." — Steve Jobs  
> "Clareza é design." — Edward Tufte

---

## Os 7 Pilares do Design Premium

### 1. Hierarquia Visual
Nunca deixe o usuário em dúvida sobre o que olhar primeiro.

```
NÍVEL 1 — Headline / Título da Página  → Syne 700, 1.6rem, --color-text-primary
NÍVEL 2 — Subtítulo / Contexto        → DM Sans 400, 0.875rem, --color-text-muted
NÍVEL 3 — Dados / Conteúdo Principal  → DM Sans 500, 0.9375rem, --color-text-primary
NÍVEL 4 — Labels / Metadados          → DM Sans 600, 0.75rem, uppercase, --color-text-muted
```

### 2. Espaçamento Rítmico
Use a sequência 4/8/12/16/24/32/48/64px. Nunca valores aleatórios.

```scss
// Scale de espaçamento do projeto
$space-1: 4px;   $space-2: 8px;   $space-3: 12px;  $space-4: 16px;
$space-5: 24px;  $space-6: 32px;  $space-7: 48px;  $space-8: 64px;
```

### 3. Contraste e Legibilidade
- Texto primário sobre fundo: mínimo **4.5:1** (WCAG AA)
- Nunca use `--color-text-muted` para conteúdo informativo crítico
- Ícones decorativos: `--color-text-muted`; ícones funcionais: `--color-primary`

### 4. Consistência de Raios
| Elemento | Border-radius |
|----------|--------------|
| Cards grandes | `--radius-lg` (16px) |
| Modais | `--radius-xl` (24px) |
| Inputs, botões | `--radius-md` (10px) |
| Badges, pills | `--radius-full` (9999px) |
| Ícones pequenos | `--radius-sm` (6px) |

### 5. Sombras com Propósito
```scss
// Não use sombra em tudo — use com intenção
.card-base       { box-shadow: var(--shadow-sm); }  // Elemento plano
.card-elevated   { box-shadow: var(--shadow-md); }  // Card em destaque
.modal-overlay   { box-shadow: var(--shadow-xl); }  // Modal / Dropdown
.hover-lift:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
```

### 6. Motion Design
```scss
// Princípios de animação
// - Entrada: fadeIn + slide suave (translateY 12px → 0)
// - Hover: scale 1 → 1.02 ou translateY -1px (nunca os dois juntos)
// - Saída: opacidade 1 → 0 mais rápido que a entrada

.card-interactive {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
}

// Nunca animar color diretamente — anime opacidade de overlay
.btn-primary::after {
  content: '';
  position: absolute; inset: 0;
  background: white;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--transition-fast);
}
.btn-primary:hover::after { opacity: 0.08; }
```

### 7. Densidade de Informação
Adaptar conforme o contexto:
- **Telas de lista/tabela**: alta densidade, padding 12–14px nas células
- **Telas de detalhe/formulário**: baixa densidade, grupos com gap: 24px
- **Dashboard**: cards com breathing room, 24–32px de padding interno

---

## Anti-Patterns a Evitar

| ❌ Errado | ✅ Certo |
|-----------|---------|
| Todas as seções com border | Usar espaçamento + hierarquia de cor |
| Hover só muda cor do texto | Hover muda background + adiciona sutil shadow |
| Botões todos do mesmo peso visual | Hierarquia: primary > ghost > link |
| Tabela sem hover state | `tr:hover td { background: var(--color-surface-2) }` |
| Títulos com `font-weight: 400` | Títulos sempre `700` (Syne) |
| Ícones sem `aria-label` | Sempre acessível |
| Cor hardcoded no SCSS | Sempre CSS custom property |
| Modal sem backdrop blur | `backdrop-filter: blur(4px)` no overlay |

---

## Receita para Tela com "Wow Factor"

```scss
// 1. Gradiente sutil no header
.page-header {
  background: linear-gradient(
    135deg,
    var(--color-primary-light) 0%,
    transparent 60%
  );
  border-radius: var(--radius-lg);
  padding: 24px;
}

// 2. Stats cards com acento colorido
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--color-primary);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}

// 3. Número de destaque com gradiente
.stat-value {
  font-family: 'Syne', sans-serif;
  font-size: 2rem; font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), var(--color-info));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// 4. Empty state com ilustração
.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 64px 32px;

  .empty-icon {
    width: 64px; height: 64px;
    background: var(--color-primary-light);
    border-radius: var(--radius-xl);
    display: flex; align-items: center; justify-content: center;
    svg { width: 28px; height: 28px; color: var(--color-primary); }
  }
  h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; }
  p { font-size: 0.875rem; color: var(--color-text-muted); text-align: center; max-width: 280px; }
}
```

---

## Checklist de Design Review

- [ ] Hierarquia clara: o olho sabe onde ir primeiro?
- [ ] Espaçamento múltiplo de 4px em todos os gaps/paddings?
- [ ] Hover states em todos os elementos interativos?
- [ ] Estados vazios tratados com empty-state?
- [ ] Loading state implementado?
- [ ] Funciona em dark E light theme?
- [ ] Responsivo? (mínimo 768px)
- [ ] Animações respeitam `prefers-reduced-motion`?
- [ ] Cores apenas via CSS custom properties?
