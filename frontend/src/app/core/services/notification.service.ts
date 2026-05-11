import { Injectable, signal } from '@angular/core';
import { Notification, NotificationType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private add(type: NotificationType, message: string, duration = 4000): void {
    const id = crypto.randomUUID();
    this._notifications.update(list => [...list, { id, type, message, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string): void { this.add('success', message); }
  error(message: string):   void { this.add('error',   message, 6000); }
  warning(message: string): void { this.add('warning', message, 5000); }
  info(message: string):    void { this.add('info',    message); }

  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }
}
