export interface CsvRow {
    [key: string]: string | number;
}

export interface ComparisonData {
    added: CsvRow[];
    removed: CsvRow[];
    modified: ModifiedRow[];
    unchanged: CsvRow[];
}

export interface ModifiedRow {
    original: CsvRow;
    modified: CsvRow;
    changes: ColumnChange[];
}

export interface ColumnChange {
    column: string;
    oldValue: string | number;
    newValue: string | number;
}

export interface FileUploadResponse {
    message: string;
    data: ComparisonData;
}

export interface ExportResponse {
    message: string;
    path: string;
}
