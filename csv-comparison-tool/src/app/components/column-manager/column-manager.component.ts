import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-column-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule
  ],
  template: `
    <button mat-button [matMenuTriggerFor]="menu">
      <mat-icon>view_column</mat-icon>
      Columns
    </button>
    
    <mat-menu #menu="matMenu">
      <div class="column-list" (click)="$event.stopPropagation()">
        <div *ngFor="let col of columns" class="column-item">
          <mat-checkbox
            [(ngModel)]="col.visible"
            (change)="onColumnToggle()">
            {{ col.name }}
          </mat-checkbox>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [`
    .column-list {
      padding: 8px;
      min-width: 200px;
    }

    .column-item {
      padding: 4px 8px;
    }
  `]
})
export class ColumnManagerComponent {
  @Input() columns: { name: string; visible: boolean; }[] = [];
  @Output() columnsChange = new EventEmitter<string[]>();

  onColumnToggle(): void {
    const visibleColumns = this.columns
      .filter(col => col.visible)
      .map(col => col.name);
    this.columnsChange.emit(visibleColumns);
  }
}
