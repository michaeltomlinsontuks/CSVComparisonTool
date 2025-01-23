import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { ComparisonData, CsvRow } from '../../models/csv.model';
import { ColumnManagerComponent } from '../column-manager/column-manager.component';

interface TableRow extends CsvRow {
  _status: 'added' | 'removed' | 'modified' | 'unchanged';
  _id: string;
}

@Component({
  selector: 'app-comparison-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatSortModule,
    MatPaginatorModule,
    ColumnManagerComponent
  ],
  template: `
    <div class="table-container mat-elevation-z2">
      <div class="table-header">
        <app-column-manager
          [columns]="columnDefinitions"
          (columnsChange)="onColumnsChange($event)">
        </app-column-manager>
        
        <div class="selection-info" *ngIf="selection.hasValue()">
          <span class="status-modified">{{ selection.selected.length }}</span> rows selected
        </div>
      </div>

      <div class="table-scroll-container">
        <table mat-table [dataSource]="dataSource" matSort class="comparison-table">
          <!-- Checkbox Column -->
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                [checked]="isAllSelected()"
                [indeterminate]="isIndeterminate()"
                (change)="toggleAllRows($event.checked)">
              </mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                [checked]="selection.isSelected(row)"
                (change)="toggleRow(row)"
                [disabled]="row._status === 'unchanged'">
              </mat-checkbox>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let row">
              <span [class]="'status-' + row._status">
                {{ row._status | titlecase }}
              </span>
            </td>
          </ng-container>

          <!-- Data Columns -->
          <ng-container *ngFor="let column of displayedColumns" [matColumnDef]="column">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ column }}</th>
            <td mat-cell *matCellDef="let row" [ngClass]="getCellClass(row)">
              {{ row[column] }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="allDisplayedColumns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: allDisplayedColumns;"
              [ngClass]="getRowClass(row)"
              (click)="toggleRow(row)">
          </tr>
        </table>

        <mat-card class="no-data" *ngIf="!dataSource.length">
          <mat-card-content>
            <p>No comparison data available</p>
            <p class="sub-text">Upload CSV files to start comparing</p>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-paginator
        [pageSize]="10"
        [pageSizeOptions]="[5, 10, 25, 100]"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 8px;
      margin: 16px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }

    .selection-info {
      color: #666;
      font-weight: 500;
      span {
        font-weight: bold;
      }
    }

    .table-scroll-container {
      max-height: calc(100vh - 300px);
      overflow: auto;
    }

    .comparison-table {
      width: 100%;
    }

    tr.mat-mdc-row {
      height: 48px;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
        cursor: pointer;
      }

      &.row-added {
        background-color: rgba(76, 175, 80, 0.1);
      }

      &.row-removed {
        background-color: rgba(244, 67, 54, 0.1);
      }

      &.row-modified {
        background-color: rgba(255, 152, 0, 0.1);
      }
    }

    .no-data {
      text-align: center;
      padding: 40px;
      background: transparent;
      box-shadow: none;
      
      p {
        font-size: 1.2em;
        color: #666;
        margin: 8px 0;

        &.sub-text {
          font-size: 0.9em;
          color: #999;
        }
      }
    }

    th.mat-mdc-header-cell {
      color: rgba(0, 0, 0, 0.87);
      font-weight: 500;
      font-size: 14px;
      padding: 0 16px;
      background: white;
      z-index: 1;
    }

    td.mat-mdc-cell {
      color: rgba(0, 0, 0, 0.87);
      font-size: 14px;
      padding: 0 16px;
    }

    .mat-mdc-paginator {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  `]
})
export class ComparisonTableComponent implements OnInit {
  @Input() comparisonData!: ComparisonData;
  @Output() selectionChange = new EventEmitter<TableRow[]>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<TableRow>;

  dataSource: TableRow[] = [];
  selection = new SelectionModel<TableRow>(true, []);
  columnDefinitions: { name: string; visible: boolean; }[] = [];
  displayedColumns: string[] = [];
  
  get allDisplayedColumns(): string[] {
    return ['select', 'status', ...this.displayedColumns];
  }

  ngOnInit() {
    if (!this.comparisonData) return;

    // Get all unique column names
    const allRows = [
      ...this.comparisonData.added,
      ...this.comparisonData.removed,
      ...this.comparisonData.modified.map(m => m.modified),
      ...this.comparisonData.unchanged
    ];

    if (allRows.length > 0) {
      // Initialize column definitions
      this.columnDefinitions = Object.keys(allRows[0]).map(key => ({
        name: key,
        visible: true
      }));
      this.displayedColumns = this.columnDefinitions
        .filter(col => col.visible)
        .map(col => col.name);
    }

    // Prepare data source with unique IDs
    this.dataSource = [
      ...this.comparisonData.added.map((row, i): TableRow => ({ 
        ...row, 
        _status: 'added',
        _id: `added-${i}`
      })),
      ...this.comparisonData.removed.map((row, i): TableRow => ({ 
        ...row, 
        _status: 'removed',
        _id: `removed-${i}`
      })),
      ...this.comparisonData.modified.map((row, i): TableRow => ({ 
        ...row.modified, 
        _status: 'modified',
        _id: `modified-${i}`
      })),
      ...this.comparisonData.unchanged.map((row, i): TableRow => ({ 
        ...row, 
        _status: 'unchanged',
        _id: `unchanged-${i}`
      }))
    ];
  }

  onColumnsChange(columns: string[]): void {
    this.displayedColumns = columns;
    if (this.table) {
      this.table.renderRows();
    }
  }

  isAllSelected(): boolean {
    const selectableRows = this.dataSource.filter(row => row._status !== 'unchanged');
    return selectableRows.length > 0 && 
           selectableRows.every(row => this.selection.isSelected(row));
  }

  isIndeterminate(): boolean {
    const selectableRows = this.dataSource.filter(row => row._status !== 'unchanged');
    return selectableRows.some(row => this.selection.isSelected(row)) && !this.isAllSelected();
  }

  toggleAllRows(checked: boolean): void {
    const selectableRows = this.dataSource.filter(row => row._status !== 'unchanged');
    if (checked) {
      selectableRows.forEach(row => this.selection.select(row));
    } else {
      this.selection.clear();
    }
    this.emitSelection();
  }

  toggleRow(row: TableRow): void {
    if (row._status === 'unchanged') return;
    this.selection.toggle(row);
    this.emitSelection();
  }

  getRowClass(row: TableRow): string {
    return `row-${row._status}`;
  }

  getCellClass(row: TableRow): string {
    return row._status;
  }

  private emitSelection(): void {
    this.selectionChange.emit(this.selection.selected);
  }

  approveSelected(): void {
    this.selection.selected.forEach(row => {
      const index = this.dataSource.findIndex(r => r._id === row._id);
      if (index !== -1) {
        this.dataSource[index] = { ...row, _status: 'unchanged' };
      }
    });
    this.selection.clear();
    this.emitSelection();
    if (this.table) {
      this.table.renderRows();
    }
  }

  getSelectedRows(): TableRow[] {
    return this.selection.selected;
  }
}
