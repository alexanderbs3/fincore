# FinCore Frontend v2

Sistema de gestão financeira — Angular 17 + Spring Boot.

## ✅ O que mudou na v2

### Arquitetura
- `normalizePage()` centralizada em `core/utils/pagination.utils.ts` (removida duplicação dos 3 services)
- `ConfirmService` — modal de confirmação como serviço reutilizável
- `guestGuard` adicionado (redireciona usuários logados para longe do `/auth`)
- `error.interceptor.ts` integrado com `NotificationService` + mensagens PT-BR por código HTTP
- `auth.service.ts` com `decodedToken()` para leitura do JWT payload
- `data.title` em todas as rotas → `pageTitle` dinâmico no `DashboardComponent`

### Design System
- CSS Variables completo (`styles.css`) — dark finance premium
- Fontes: DM Sans + DM Mono (via Google Fonts)
- Ícones: Tabler Icons (via CDN, sem dependência npm)
- Tokens: cores, bordas, raios, sombras, tipografia, animações

### Componentes novos
- `ConfirmModalComponent` — modal de confirmação global
- `HomeComponent` — dashboard real com KPIs via API (`forkJoin`)
- `ConfirmService` — serviço de confirmação com `Promise<boolean>`

### Telas melhoradas
| Tela | Melhoria |
|---|---|
| Login | Split layout brand + form, toggle de senha |
| Register | Role selector visual (cards), validação minLength |
| Dashboard | Home real: KPIs, distribuição de contas, ações rápidas |
| Clientes | Busca + filtro de status client-side, badges de status coloridos |
| Contas | Badges de tipo (Corrente/Poupança/Pagamento), saldo colorido, ações contextuais por linha |
| Extrato | Selected account card com saldo, totalizadores (entradas/saídas/líquido), filtro de tipo |
| Depósito | Quick amounts, preview reativo de saldo, modal de confirmação |
| Transferência | Flow visual origem→destino, validação de saldo insuficiente, modal de confirmação |

## 🚀 Instalação

```bash
npm install
npm start
```

O proxy Angular (`proxy.conf.json`) roteia `/v1/*` → `http://localhost:8080` — sem CORS em dev.

## 🏗️ Estrutura

```
src/app/
├── core/
│   ├── guards/         auth.guard, guest.guard
│   ├── interceptors/   auth, error
│   ├── models/         models.ts (DTOs tipados)
│   ├── services/       auth, account, customer, transaction, notification, confirm
│   └── utils/          pagination.utils.ts, label.utils.ts
├── features/
│   ├── auth/           login, register
│   ├── dashboard/      shell + home (KPIs)
│   ├── customers/      list, form
│   ├── accounts/       list, form
│   └── transactions/   statement, deposit, transfer
└── shared/
    └── components/     notification, confirm-modal, data-table, loading-spinner
```
