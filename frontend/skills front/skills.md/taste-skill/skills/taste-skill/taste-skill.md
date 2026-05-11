---
name: taste-skill
description: >
  Skill de "taste" — refinamento estético e senso visual apurado aplicado ao
  ClinicaIES. Vai além das regras técnicas: é sobre o QUE separa um design
  correto de um design memorável. Cobre micro-detalhes que elevam a percepção
  de qualidade: peso visual, ritmo, tensão, respiro, personalidade, coerência.
  Use quando o usuário disser que algo "parece errado mas não sabe o quê",
  "tá feio", "falta algo", "parece amateur", "quero que fique mais premium",
  "mais refinado", "mais sofisticado", ou pedir para revisar o design com
  olhar crítico.
---

# Taste Skill — ClinicaIES

> "Você pode ensinar regras. Taste você cultiva." — Dieter Rams

---

## O que é Taste em UI?

Taste é a capacidade de perceber a diferença entre o que é tecnicamente correto e o que é **esteticamente convincente**. São os 20% finais que fazem 80% da impressão.

---

## 10 Sinais de Alto Taste no ClinicaIES

### 1. Peso Visual dos Títulos
```scss
// ❌ Título genérico
h1 { font-size: 1.5rem; font-weight: 700; }

// ✅ Título com personalidade
h1 {
  font-family: 'Syne', sans-serif;
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.02em;  // Tracking negativo = sofisticação
  line-height: 1.1;
  // Gradiente sutil no dark mode
  background: linear-gradient(135deg, #e2e8f0 60%, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 2. Respiro nos Cards (Breathing Room)
```scss
// ❌ Comprimido
.card { padding: 12px; }

// ✅ Respira
.card {
  padding: 24px 28px;  // Mais horizontal que vertical = naturalidade
  // Padding interno dos grupos de conteúdo
  .card-section + .card-section { margin-top: 20px; }
}
```

### 3. Separadores com Taste
```scss
// ❌ <hr> padrão, pesado demais
hr { border: 1px solid var(--color-border); }

// ✅ Divisor elegante
.divider {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: 0;
  // Ou: gradiente que some nas bordas
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-border) 20%,
    var(--color-border) 80%,
    transparent
  );
  height: 1px;
  border: none;
}
```

### 4. Números e Métricas com Destaque Cirúrgico
```scss
// Números de dashboard não devem ser simples texto
.metric-value {
  font-family: 'Syne', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;  // Números apertados = profissional
  font-variant-numeric: tabular-nums;  // Alinhamento em tabelas
  color: var(--color-text-primary);
}

.metric-delta {
  font-size: 0.8rem; font-weight: 600;
  // Pequena tag de variação
  &.positive { color: var(--color-success); }
  &.negative { color: var(--color-danger); }
}
```

### 5. Ícones com Contexto (não soltos)
```scss
// ❌ Ícone jogado ao lado do texto
// ✅ Ícone com container contextual
.icon-container {
  width: 40px; height: 40px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;

  &.blue   { background: var(--color-primary-light); color: var(--color-primary); }
  &.green  { background: var(--color-success-light); color: var(--color-success); }
  &.red    { background: var(--color-danger-light);  color: var(--color-danger); }
  &.amber  { background: var(--color-warning-light); color: var(--color-warning); }

  svg { width: 20px; height: 20px; }
}
```

### 6. Border-Left como Acento (não decoração)
```scss
// Usado para categorizar, não decorar aleatoriamente
.alert-card {
  border-left: 3px solid var(--color-warning);
  padding-left: 16px;
  // Só use quando a borda SIGNIFICA algo (urgência, categoria)
}
```

### 7. Tabelas com Linhas Alternadas Sutis
```scss
// Alternância quase imperceptível — não listrado de zebra!
tbody tr:nth-child(even) td {
  background: rgba(255,255,255,0.015);  // Dark mode: quase nada
}

body[data-theme='light'] tbody tr:nth-child(even) td {
  background: rgba(0,0,0,0.012);
}
```

### 8. Focus Ring com Personalidade
```scss
// ❌ Focus padrão do browser (anel azul grosso)
// ✅ Focus ring refinado
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;  // Acompanha o formato do elemento
}

// Inputs: glow ao invés de outline
.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
```

### 9. Sidebar Link com Hover Premium
```scss
.nav-item {
  position: relative;
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  color: var(--color-sidebar-text);

  // Hover: fill suave
  &:hover {
    background: rgba(255,255,255,0.05);
    color: var(--color-sidebar-text-active);
  }

  // Ativo: glow + indicador lateral
  &.active {
    background: var(--color-sidebar-accent-glow);
    color: var(--color-sidebar-text-active);

    &::before {
      content: '';
      position: absolute; left: 0; top: 20%; bottom: 20%;
      width: 3px;
      background: var(--color-sidebar-accent);
      border-radius: 0 3px 3px 0;
    }
  }
}
```

### 10. Badges que "Encaixam"
```scss
// Badge não deve parecer um adesivo colado
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  // Ponto de status antes do texto
  &::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.8;
  }
}
```

---

## Teste de Taste: Perguntas-Chave

Ao revisar qualquer tela, faça estas perguntas:

1. **"O eye-tracking natural flui para o ponto certo?"**  
   — Olhe sem ler. Onde seu olho vai primeiro? É o que deve ser?

2. **"Algo parece solto ou sem propósito?"**  
   — Cada elemento deve ter razão de estar onde está.

3. **"Os estados têm personalidade?"**  
   — Hover, focus, active, disabled, loading, empty — todos definidos?

4. **"O espaçamento respira?"**  
   — Se parece comprimido, é. Se parece vazio demais, é.

5. **"A tipografia conta uma história de hierarquia?"**  
   — 3 pesos no máximo. 2 famílias (Syne + DM Sans). Nada mais.

6. **"Passaria no teste de 3 segundos?"**  
   — Um novo usuário entende o propósito da tela em 3s?

---

## Quick Wins de Taste (aplicar em qualquer componente)

```scss
// 1. Suavizar bordas com transparência
border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);

// 2. Texto de label sempre uppercase + tracking
.label { text-transform: uppercase; letter-spacing: 0.07em; font-size: 0.72rem; }

// 3. Transição em tudo interativo
* { transition: color var(--transition-fast), background var(--transition-fast); }

// 4. Cursor correto em elementos custom
[role="button"], label[for] { cursor: pointer; }

// 5. Último item sem borda
li:last-child, tr:last-child td { border-bottom: none !important; }

// 6. Overflow elegante (truncar com reticências)
.text-truncate {
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
  max-width: 200px;  // ajustar por contexto
}
```
