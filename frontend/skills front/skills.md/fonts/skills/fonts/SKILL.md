---
name: fonts
description: >
  Skill de tipografia para o projeto ClinicaIES. Cobre o uso correto das
  fontes Syne e DM Sans, escala tipográfica, pesos, line-height, letter-spacing,
  carregamento otimizado, fallbacks, fluid typography, e boas práticas de
  legibilidade em interfaces clínicas. Use este skill quando o usuário
  perguntar sobre fontes, tipografia, tamanho de texto, peso de fonte,
  readability, Google Fonts, @font-face, ou quando a UI estiver com problemas
  de legibilidade, texto "pesado demais", "leve demais" ou sem hierarquia clara.
---

# Fonts Skill — ClinicaIES

## Sistema Tipográfico Oficial

### Fontes Carregadas
```css
/* styles.scss — Import já presente no projeto */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
```

| Fonte | Papel | Pesos Carregados |
|-------|-------|-----------------|
| **Syne** | Display / Headings | 400 · 500 · 600 · 700 · 800 |
| **DM Sans** | Body / UI | 300 · 400 · 500 · 600 (+ italic 300) |

---

## Escala Tipográfica

```scss
// _typography.scss
// Base: 15px (definido no body do projeto)

// DISPLAY (Syne — apenas headings e números grandes)
.text-display-xl  { font-family: 'Syne', sans-serif; font-size: 3rem;    font-weight: 800; letter-spacing: -0.04em; line-height: 1.0; }
.text-display-lg  { font-family: 'Syne', sans-serif; font-size: 2.25rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; }
.text-display-md  { font-family: 'Syne', sans-serif; font-size: 1.75rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.text-display-sm  { font-family: 'Syne', sans-serif; font-size: 1.375rem; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }

// HEADINGS (Syne)
h1 { font-family: 'Syne', sans-serif; font-size: 1.65rem;  font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; }
h2 { font-family: 'Syne', sans-serif; font-size: 1.35rem;  font-weight: 700; letter-spacing: -0.01em; line-height: 1.25; }
h3 { font-family: 'Syne', sans-serif; font-size: 1.125rem; font-weight: 700; line-height: 1.3; }
h4 { font-family: 'Syne', sans-serif; font-size: 1rem;     font-weight: 600; line-height: 1.35; }
h5 { font-family: 'DM Sans', sans-serif; font-size: 0.9375rem; font-weight: 600; line-height: 1.4; }
h6 { font-family: 'DM Sans', sans-serif; font-size: 0.875rem;  font-weight: 600; line-height: 1.4; }

// BODY (DM Sans)
.text-lg   { font-size: 1.0625rem; line-height: 1.6; font-weight: 400; }  // 17px
.text-base { font-size: 0.9375rem; line-height: 1.6; font-weight: 400; }  // 15px — default
.text-sm   { font-size: 0.875rem;  line-height: 1.55; font-weight: 400; } // 14px
.text-xs   { font-size: 0.8125rem; line-height: 1.5;  font-weight: 400; } // 13px

// LABELS (DM Sans uppercase)
.label-lg { font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.label-sm { font-size: 0.7rem;    font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

// MONO (para CPF, CRM, datas formatadas)
.text-mono { font-family: 'DM Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.875rem; }
```

---

## Guia de Uso por Contexto

### Telas de Dashboard (números grandes)
```scss
// Métricas em destaque: Syne 800 com tracking negativo
.stat-number {
  font-family: 'Syne', sans-serif;
  font-size: 2.5rem; font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;  // Alinha decimais
}
```

### Tabelas de Dados Clínicos
```scss
// Células de tabela: DM Sans 400, sem uppercase
td { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 400; }

// Campos identificadores (CPF, CRM): monospace
.cpf-cell, .crm-cell {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem; letter-spacing: 0.02em;
}
```

### Labels de Formulário
```scss
// Sempre uppercase + tracking — nunca tamanho normal
.form-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-text-secondary);
}
```

### Sidebar Navigation
```scss
.nav-item-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem; font-weight: 500;
  // Nav ativa: weight bump
  &.active { font-weight: 600; }
}
```

---

## Otimização de Carregamento

### Preconnect (adicionar no index.html)
```html
<head>
  <!-- Já deve estar ou adicionar -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <!-- A @import do styles.scss já cuida do resto -->
</head>
```

### Subsets Otimizados
```css
/* Se quiser carregar apenas latin (menor bundle) */
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap&subset=latin');
```

### Font-Display
O `display=swap` no URL garante **FOUT** (Flash of Unstyled Text) em vez de **FOIT** (Flash of Invisible Text) — melhor para UX.

---

## Fallback Stack

```scss
// Definido no body do projeto — manter consistente
$font-body:    'DM Sans', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
$font-heading: 'Syne', 'Outfit', 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
$font-mono:    'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
```

---

## Combinações que Funcionam

### Padrão ClinicaIES
| Syne 800 | + | DM Sans 400 | — Heading forte + body legível |
|----------|---|-------------|-------------------------------|

### Variações Permitidas
| Syne 700 | + | DM Sans 500 | — Subcards, seções internas |
| Syne 600 | + | DM Sans 400 | — Títulos de coluna de tabela |
| DM Sans 700 uppercase | + | DM Sans 400 | — Labels + valores (formulários) |

### ❌ Nunca Misturar
- Syne em texto corrido (legibilidade ruim em tamanhos pequenos)
- DM Sans em métricas de dashboard (sem personalidade)
- Mais de 2 font-families (já temos Syne + DM Sans)
- Bold + Italic em conjunto (muito pesado)

---

## Legibilidade em Contexto Clínico

Sistemas de saúde são lidos sob pressão e cansaço. Regras especiais:

```scss
// 1. Line-height generoso em blocos de texto
.prontuario-text, .observacoes {
  line-height: 1.75;  // Mais que o padrão 1.6
  font-size: 0.9375rem;
  max-width: 70ch;  // Limitar largura da linha para leitura confortável
}

// 2. Jamais usar font-weight: 300 em texto crítico
// Light é apenas para decoração ou texto complementar grande

// 3. Tamanho mínimo em UI densa
.table-cell { font-size: 0.875rem; }  // Nunca abaixo de 0.8rem

// 4. Espaçamento entre parágrafos
p + p { margin-top: 0.75em; }

// 5. Contraste de cor, não só peso, para hierarquia
.value-primary   { color: var(--color-text-primary);   font-weight: 500; }
.value-secondary { color: var(--color-text-secondary); font-weight: 400; }
.value-muted     { color: var(--color-text-muted);     font-weight: 400; }
```

---

## Checklist Tipográfico

- [ ] Headings com `font-family: 'Syne'`?
- [ ] Body com `font-family: 'DM Sans'`?
- [ ] Labels com `uppercase + letter-spacing`?
- [ ] Números de métricas com `letter-spacing: -0.03em`?
- [ ] Campos de CPF/CRM com `font-family: monospace`?
- [ ] `font-variant-numeric: tabular-nums` em tabelas numéricas?
- [ ] Line-height ≥ 1.5 em texto corrido?
- [ ] Tamanho mínimo 12px (0.75rem) em qualquer texto visível?
- [ ] Não mais que 3 tamanhos de fonte em uma única tela?
