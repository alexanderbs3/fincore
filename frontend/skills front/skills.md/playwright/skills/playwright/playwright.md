---
name: playwright
description: >
  Skill de testes End-to-End (E2E) com Playwright para o projeto Angular
  ClinicaIES. Cobre setup, configuração, escrita de testes para fluxos de
  login, CRUD de entidades clínicas, autenticação com JWT, guards, interceptors,
  Page Object Model (POM), fixtures, CI/CD integration e relatórios. Use este
  skill quando o usuário mencionar testes E2E, Playwright, testes de integração
  de front-end, automação de browser, testar fluxo de login, testar CRUD,
  test coverage de front, ou qualquer menção a "testar a aplicação Angular".
---

# Playwright Skill — ClinicaIES Angular 17

## Setup Inicial

```bash
# Instalar Playwright no projeto Angular
cd projeto-front-desenvolvimento-de-sistemas-ads-grupo-1
npm init playwright@latest

# Escolher durante o wizard:
# - TypeScript: Yes
# - tests/ folder: e2e/
# - GitHub Actions: Yes (opcional)
# - Install browsers: Yes
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    // Mobile
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],

  // Inicia o Angular antes dos testes
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
  },
});
```

---

## Page Object Model (POM)

### LoginPage
```typescript
// e2e/pages/login.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly senhaInput: Locator;
  readonly submitBtn: Locator;
  readonly erroMsg: Locator;
  readonly toggleSenha: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput  = page.getByLabel(/email/i).or(page.locator('input[type="email"]'));
    this.senhaInput  = page.getByLabel(/senha/i).or(page.locator('input[type="password"]'));
    this.submitBtn   = page.getByRole('button', { name: /entrar|login/i });
    this.erroMsg     = page.locator('.toast.error, .field-error, [role="alert"]');
    this.toggleSenha = page.locator('.icon-btn[aria-label*="senha"]');
  }

  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveTitle(/ClinicaIES/i);
  }

  async login(email: string, senha: string) {
    await this.emailInput.fill(email);
    await this.senhaInput.fill(senha);
    await this.submitBtn.click();
  }

  async loginComoAdmin() {
    await this.login('admin@clinica.com', 'admin123');
  }

  async loginComoProfissional() {
    await this.login('profissional@clinica.com', 'prof123');
  }
}
```

### CrudPage (base genérica para CRUD)
```typescript
// e2e/pages/crud.page.ts
import { Page, Locator, expect } from '@playwright/test';

export class CrudPage {
  readonly page: Page;
  readonly novoBtn: Locator;
  readonly tabelaRows: Locator;
  readonly modalContainer: Locator;
  readonly salvarBtn: Locator;
  readonly cancelarBtn: Locator;
  readonly toastSucesso: Locator;
  readonly toastErro: Locator;

  constructor(page: Page, private rota: string) {
    this.page = page;
    this.novoBtn        = page.getByRole('button', { name: /novo|adicionar|criar/i });
    this.tabelaRows     = page.locator('table tbody tr:not(.empty-state)');
    this.modalContainer = page.locator('.modal-container, [role="dialog"]');
    this.salvarBtn      = page.getByRole('button', { name: /salvar|confirmar/i });
    this.cancelarBtn    = page.getByRole('button', { name: /cancelar/i });
    this.toastSucesso   = page.locator('.toast.success');
    this.toastErro      = page.locator('.toast.error');
  }

  async goto() {
    await this.page.goto(this.rota);
  }

  async abrirNovoModal() {
    await this.novoBtn.click();
    await expect(this.modalContainer).toBeVisible();
  }

  async fecharModal() {
    await this.cancelarBtn.click();
    await expect(this.modalContainer).not.toBeVisible();
  }

  async aguardarToastSucesso() {
    await expect(this.toastSucesso).toBeVisible({ timeout: 5000 });
  }

  async contarRegistros() {
    return await this.tabelaRows.count();
  }

  async editarPrimeiro() {
    await this.tabelaRows.first().locator('.btn-edit').click();
    await expect(this.modalContainer).toBeVisible();
  }

  async excluirPrimeiro() {
    await this.tabelaRows.first().locator('.btn-delete').click();
    // Aguardar confirmação
    const confirmarBtn = this.page.getByRole('button', { name: /excluir|confirmar/i });
    await expect(confirmarBtn).toBeVisible();
    await confirmarBtn.click();
  }
}
```

---

## Fixtures (autenticação persistida)

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  adminPage: Page;
  profissionalPage: Page;
};

export const test = base.extend<AuthFixtures>({
  // Admin autenticado
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    await login.loginComoAdmin();
    await page.waitForURL('**/dashboard');
    await use(page);
    await context.close();
  },

  // Profissional autenticado
  profissionalPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const login = new LoginPage(page);
    await login.goto();
    await login.loginComoProfissional();
    await page.waitForURL('**/atendimentos');
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```

---

## Testes: Login

```typescript
// e2e/tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login — ClinicaIES', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('deve exibir formulário de login', async ({ page }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.senhaInput).toBeVisible();
    await expect(loginPage.submitBtn).toBeEnabled();
  });

  test('deve redirecionar admin para /dashboard', async ({ page }) => {
    await loginPage.loginComoAdmin();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('deve redirecionar profissional para /atendimentos', async ({ page }) => {
    await loginPage.loginComoProfissional();
    await expect(page).toHaveURL(/\/atendimentos/);
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await loginPage.login('invalido@email.com', 'senhaerrada');
    await expect(loginPage.erroMsg).toBeVisible();
  });

  test('deve toggle visibilidade da senha', async ({ page }) => {
    await loginPage.senhaInput.fill('teste123');
    await expect(loginPage.senhaInput).toHaveAttribute('type', 'password');
    await loginPage.toggleSenha.click();
    await expect(loginPage.senhaInput).toHaveAttribute('type', 'text');
  });

  test('deve bloquear acesso direto a /dashboard sem login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

## Testes: CRUD de Pacientes

```typescript
// e2e/tests/pacientes.spec.ts
import { test, expect } from '../fixtures/auth.fixture';
import { CrudPage } from '../pages/crud.page';

test.describe('Pacientes CRUD', () => {
  let pacientesPage: CrudPage;

  test.beforeEach(async ({ profissionalPage }) => {
    pacientesPage = new CrudPage(profissionalPage, '/profissional/pacientes');
    await pacientesPage.goto();
  });

  test('deve listar pacientes', async ({ profissionalPage }) => {
    await expect(profissionalPage.locator('table')).toBeVisible();
  });

  test('deve criar novo paciente', async ({ profissionalPage }) => {
    const antes = await pacientesPage.contarRegistros();
    await pacientesPage.abrirNovoModal();

    await profissionalPage.getByLabel(/nome/i).fill('João Teste');
    await profissionalPage.getByLabel(/cpf/i).fill('123.456.789-00');
    await profissionalPage.getByLabel(/data.*nascimento/i).fill('1990-01-01');

    await pacientesPage.salvarBtn.click();
    await pacientesPage.aguardarToastSucesso();

    const depois = await pacientesPage.contarRegistros();
    expect(depois).toBeGreaterThan(antes);
  });

  test('deve validar campos obrigatórios', async ({ profissionalPage }) => {
    await pacientesPage.abrirNovoModal();
    await pacientesPage.salvarBtn.click();

    const erros = profissionalPage.locator('.field-error');
    await expect(erros.first()).toBeVisible();
  });

  test('deve fechar modal ao cancelar', async () => {
    await pacientesPage.abrirNovoModal();
    await pacientesPage.fecharModal();
  });

  test('deve editar paciente existente', async ({ profissionalPage }) => {
    await pacientesPage.editarPrimeiro();
    await profissionalPage.getByLabel(/nome/i).clear();
    await profissionalPage.getByLabel(/nome/i).fill('Nome Editado');
    await pacientesPage.salvarBtn.click();
    await pacientesPage.aguardarToastSucesso();
  });
});
```

---

## Comandos Úteis

```bash
# Rodar todos os testes
npx playwright test

# Rodar com UI mode (recomendado para dev)
npx playwright test --ui

# Rodar arquivo específico
npx playwright test e2e/tests/login.spec.ts

# Rodar em modo debug (passo a passo)
npx playwright test --debug

# Gerar relatório HTML
npx playwright show-report

# Gravar novo teste (Codegen)
npx playwright codegen http://localhost:4200

# Rodar apenas chromium
npx playwright test --project=chromium

# Rodar com headed (ver browser)
npx playwright test --headed
```

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/e2e.yml
name: Playwright E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npx playwright test --project=chromium
        env:
          CI: true

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Checklist de Qualidade de Testes

- [ ] Usa Page Object Model (não selectors espalhados nos testes)?
- [ ] Usa `getByRole`, `getByLabel` em vez de seletores CSS frágeis?
- [ ] Testes independentes (não dependem da ordem)?
- [ ] Auth via fixture (não repete login em cada teste)?
- [ ] Assertions com `expect(locator).toBeVisible()` (não `page.waitForTimeout`)?
- [ ] Cobre: happy path + validação + erro?
- [ ] Screenshot on failure ativado?
- [ ] CI configurado?
