import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTable } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CsvComparison } from '../../models/csv.model';

@Component({
  selector: 'app-comparison-table',
  templateUrl: './comparison-table.component.html',
  styleUrls: ['./comparison-table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ComparisonTableComponent implements OnChanges {
  @Input() comparisonData?: CsvComparison;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  filterValue = '';

  ngOnChanges() {
    if (this.comparisonData) {
      this.processComparisonData();
    }
  }

  private processComparisonData() {
    if (!this.comparisonData) return;

    // Combine all data and add status
    const allData = [
      ...this.comparisonData.added.map(row => ({ ...row, status: 'added' })),
      ...this.comparisonData.removed.map(row => ({ ...row, status: 'removed' })),
      ...this.comparisonData.modified.map(row => ({
        ...row.modified,
        status: 'modified',
        changes: row.changes
      })),
      ...this.comparisonData.unchanged.map(row => ({ ...row, status: 'unchanged' }))
    ];

    // Get all unique columns
    if (allData.length > 0) {
      this.displayedColumns = ['status', ...Object.keys(allData[0]).filter(key => key !== 'status' && key !== 'changes')];
    }

    this.dataSource = allData;
  }

  getRowClass(row: any): string {
    switch (row.status) {
      case 'added': return 'added-row';
      case 'removed': return 'removed-row';
      case 'modified': return 'modified-row';
      default: return '';
    }
  }

  getCellClass(row: any, column: string): string {
    if (row.status === 'modified' && row.changes?.some((change: any) => change.column === column)) {
      return 'modified-cell';
    }
    return '';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    // Apply filtering logic here
  }
}
