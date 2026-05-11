/**
 * DataTable v2 — componente genérico reutilizável
 * Usado por: customers-list, accounts-list, statement
 * Cada feature pode usar diretamente (sem ng-content confuso do v1)
 */
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key:     string;
  label:   string;
  width?:  string;
  align?:  'left' | 'right' | 'center';
  mono?:   boolean;
  muted?:  boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrap">
      @if (loading) {
        <div style="padding:16px">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-row" [style.width]="(55 + i*10) + '%'"></div>
          }
        </div>
      } @else if (rows.length === 0) {
        <div class="empty-state">
          <div class="empty-icon"><i class="ti {{ emptyIcon }}"></i></div>
          <div class="empty-title">{{ emptyTitle }}</div>
          <div class="empty-sub">{{ emptySub }}</div>
          <ng-content select="[slot=empty-action]"></ng-content>
        </div>
      } @else {
        <table class="data-table">
          <thead>
            <tr>
              @for (col of columns; track col.key) {
                <th [style.width]="col.width" [style.textAlign]="col.align ?? 'left'">
                  {{ col.label }}
                </th>
              }
              @if (hasActions) {
                <th style="width:120px">Ações</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track $index) {
              <tr (click)="onRowClick.emit(row)">
                @for (col of columns; track col.key) {
                  <td
                    [class.td-mono]="col.mono"
                    [class.td-muted]="col.muted"
                    [style.textAlign]="col.align ?? 'left'"
                  >
                    <ng-content></ng-content>
                    {{ row[col.key] }}
                  </td>
                }
                @if (hasActions) {
                  <td>
                    <div class="action-buttons">
                      <ng-content select="[slot=actions]"></ng-content>
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        @if (totalElements > 0) {
          <div class="pagination">
            <span class="pagination__info">
              Mostrando {{ pageStart }}–{{ pageEnd }} de {{ totalElements }} registros
            </span>
            <div class="pagination__controls">
              <button class="page-btn" [disabled]="currentPage === 0" (click)="onPageChange.emit(currentPage - 1)">
                <i class="ti ti-chevron-left"></i>
              </button>
              @for (p of pageNumbers; track p) {
                <button class="page-btn" [class.page-btn--active]="p === currentPage"
                  (click)="onPageChange.emit(p)">{{ p + 1 }}</button>
              }
              <button class="page-btn" [disabled]="isLast" (click)="onPageChange.emit(currentPage + 1)">
                <i class="ti ti-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class DataTableComponent {
  @Input() columns:       TableColumn[]   = [];
  @Input() rows:          Record<string, unknown>[] = [];
  @Input() loading        = false;
  @Input() hasActions     = false;
  @Input() totalElements  = 0;
  @Input() currentPage    = 0;
  @Input() totalPages     = 1;
  @Input() pageSize       = 10;
  @Input() isLast         = false;
  @Input() emptyIcon      = 'ti-table';
  @Input() emptyTitle     = 'Nenhum registro encontrado';
  @Input() emptySub       = '';

  @Output() onPageChange  = new EventEmitter<number>();
  @Output() onRowClick    = new EventEmitter<unknown>();

  get pageStart() { return this.currentPage * this.pageSize + 1; }
  get pageEnd()   { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }
  get pageNumbers() { return Array.from({ length: Math.min(this.totalPages, 5) }, (_, i) => i); }
}
