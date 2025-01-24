import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface ColumnDefinition {
  name: string;
  visible: boolean;
}

@Component({
  selector: 'app-column-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  template: `
    <button mat-button [matMenuTriggerFor]="menu">
      <mat-icon>view_column</mat-icon>
      Columns
    </button>
    <mat-menu #menu="matMenu">
      <div class="column-list">
        <div *ngFor="let column of columns" class="column-item">
          <mat-checkbox
            [checked]="column.visible"
            (change)="toggleColumn(column)">
            {{ column.name }}
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
  @Input() columns: ColumnDefinition[] = [];
  @Output() columnsChange = new EventEmitter<ColumnDefinition[]>();

  toggleColumn(column: ColumnDefinition): void {
    column.visible = !column.visible;
    this.columnsChange.emit([...this.columns]);
  }
}
