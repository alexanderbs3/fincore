import {
  Component, inject, signal, ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar__header">
          <div class="logo">
            <span class="logo__dot"></span>Fin<span>Core</span>
          </div>
          <button class="collapse-btn" title="Recolher menu">
            <i class="ti ti-layout-sidebar-left-collapse"></i>
          </button>
        </div>

        <div class="sidebar__section">
          <span class="sidebar__section-label">Principal</span>
          <a routerLink="/"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: true }"
             class="nav-item">
            <i class="ti ti-home nav-icon"></i>
            <span class="nav-label">Dashboard</span>
          </a>
          <a routerLink="/customers" routerLinkActive="active" class="nav-item">
            <i class="ti ti-users nav-icon"></i>
            <span class="nav-label">Clientes</span>
          </a>
          <a routerLink="/accounts" routerLinkActive="active" class="nav-item">
            <i class="ti ti-credit-card nav-icon"></i>
            <span class="nav-label">Contas</span>
          </a>
        </div>

        <div class="sidebar__section">
          <span class="sidebar__section-label">Operações</span>
          <a routerLink="/transactions/deposit" routerLinkActive="active" class="nav-item">
            <i class="ti ti-arrow-bar-down nav-icon"></i>
            <span class="nav-label">Depositar</span>
          </a>
          <a routerLink="/transactions/transfer" routerLinkActive="active" class="nav-item">
            <i class="ti ti-arrows-exchange nav-icon"></i>
            <span class="nav-label">Transferir</span>
          </a>
          <a routerLink="/transactions/statement" routerLinkActive="active" class="nav-item">
            <i class="ti ti-list-details nav-icon"></i>
            <span class="nav-label">Extrato</span>
          </a>
        </div>

        <div class="sidebar__footer">
          <div class="user-area">
            <div class="user-avatar">{{ userInitials() }}</div>
            <div class="user-info">
              <div class="user-name">{{ userEmail() }}</div>
              <div class="user-role">{{ userRole() }}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <i class="ti ti-logout nav-icon"></i>
            <span class="nav-label">Sair</span>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-content">
        <div class="topbar">
          <div class="topbar__left">
            <div class="breadcrumb">
              <span>FinCore</span>
              <span class="breadcrumb__sep"><i class="ti ti-chevron-right"></i></span>
              <span class="breadcrumb__current">{{ pageTitle() }}</span>
            </div>
          </div>
          <div class="topbar__right">
            <span class="topbar__badge">
              <i class="ti ti-circle-check"></i> API Online
            </span>
            <button class="btn-icon" title="Notificações">
              <i class="ti ti-bell"></i>
            </button>
          </div>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly pageTitle    = signal('Dashboard');
  readonly userEmail    = signal('');
  readonly userInitials = signal('AD');
  readonly userRole     = signal('');

  ngOnInit(): void {
    const payload = this.authService.decodedToken() as Record<string, unknown> | null;
    if (payload) {
      const email = typeof payload['sub'] === 'string' ? payload['sub'] : '';
      this.userEmail.set(email);
      this.userInitials.set(email.slice(0, 2).toUpperCase() || 'AD');

      const roles = payload['roles'];
      const role  = typeof payload['role'] === 'string'
        ? payload['role']
        : (Array.isArray(roles) && typeof roles[0] === 'string' ? roles[0] : 'USER');
      this.userRole.set(role === 'ADMIN' ? 'Administrador' : 'Usuário');
    }

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => {
        let route = this.router.routerState.root;
        while (route.firstChild) route = route.firstChild;
        return (route.snapshot.data['title'] as string) ?? 'Painel';
      })
    ).subscribe(title => this.pageTitle.set(title));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
