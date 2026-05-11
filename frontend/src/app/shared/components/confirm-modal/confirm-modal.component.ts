import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirm.state(); as s) {
      <div class="modal-backdrop" (click)="confirm.resolve(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal__icon modal__icon--{{ s.icon ?? 'info' }}">
            <i class="ti {{ s.icon === 'success' ? 'ti-check' : 'ti-send' }}"></i>
          </div>
          <h3 class="modal__title">{{ s.title }}</h3>
          <p class="modal__sub">{{ s.subtitle ?? 'Revise os detalhes antes de confirmar.' }}</p>
          <div class="modal__summary">
            @for (row of s.rows; track row.label) {
              <div class="modal__row">
                <span class="modal__row-label">{{ row.label }}</span>
                <span class="modal__row-value" [class.modal__row-value--highlight]="row.highlight">
                  {{ row.value }}
                </span>
              </div>
            }
          </div>
          <div class="modal__footer">
            <button class="btn btn-secondary" (click)="confirm.resolve(false)">Cancelar</button>
            <button class="btn {{ s.confirmClass ?? 'btn-primary' }}" (click)="confirm.resolve(true)">
              <i class="ti ti-check"></i> {{ s.confirmLabel ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly confirm = inject(ConfirmService);
}
