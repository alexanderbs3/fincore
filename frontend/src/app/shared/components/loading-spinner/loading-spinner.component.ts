import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-wrapper" [class.overlay]="overlay">
      <div class="spinner__ring"></div>
      @if (label) {
        <p class="spinner__label">{{ label }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  @Input() label = '';
  @Input() overlay = false;
}
