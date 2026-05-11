import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title:     string;
  subtitle?: string;
  icon?:     'success' | 'info';
  rows:      { label: string; value: string; highlight?: boolean }[];
  confirmLabel?: string;
  confirmClass?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _state = signal<ConfirmState | null>(null);
  readonly state = this._state.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise(resolve => {
      this._state.set({ ...options, resolve });
    });
  }

  resolve(result: boolean): void {
    this._state()?.resolve(result);
    this._state.set(null);
  }
}
