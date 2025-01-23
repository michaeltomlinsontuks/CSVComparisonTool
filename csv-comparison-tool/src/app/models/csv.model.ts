export interface CsvComparison {
    added: any[];
    removed: any[];
    modified: ModifiedRow[];
    unchanged: any[];
}

export interface ModifiedRow {
    original: any;
    modified: any;
    changes: ColumnChange[];
}

export interface ColumnChange {
    column: string;
    oldValue: any;
    newValue: any;
}

export interface FileUploadResponse {
    message: string;
    files: string[];
}

export interface ExportResponse {
    message: string;
    path: string;
}
