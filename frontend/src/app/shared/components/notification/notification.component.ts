import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

const ICONS: Record<string, string> = {
  success: 'ti-circle-check',
  error:   'ti-alert-circle',
  warning: 'ti-alert-triangle',
  info:    'ti-info-circle',
};

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notification-container">
      @for (n of notifService.notifications(); track n.id) {
        <div class="notification notification--{{ n.type }}" (click)="notifService.dismiss(n.id)">
          <i class="ti {{ icon(n.type) }} notification__icon"></i>
          <p class="notification__message">{{ n.message }}</p>
          <button class="notification__close" title="Fechar">
            <i class="ti ti-x"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class NotificationComponent {
  readonly notifService = inject(NotificationService);
  icon(type: string): string { return ICONS[type] ?? 'ti-info-circle'; }
}
