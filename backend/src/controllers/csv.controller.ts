import { Request, Response } from 'express';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';

// Define types
interface CSVRow {
    [key: string]: string | number;
}

interface ComparisonResult {
    added: CSVRow[];
    removed: CSVRow[];
    modified: ModifiedRow[];
    unchanged: CSVRow[];
}

interface ModifiedRow {
    original: CSVRow;
    modified: CSVRow;
    changes: ColumnChange[];
}

interface ColumnChange {
    column: string;
    oldValue: string | number;
    newValue: string | number;
}

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ]
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

export const csvController = {
    uploadFiles: async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length !== 2) {
                throw new Error('Please upload exactly two CSV files');
            }

            logger.info('Files uploaded successfully', { 
                files: files.map(f => ({
                    originalName: f.originalname,
                    filename: f.filename,
                    size: f.size
                }))
            });

            res.json({ 
                message: 'Files uploaded successfully',
                file1Id: files[0].filename,
                file2Id: files[1].filename
            });
        } catch (error) {
            logger.error('Error uploading files', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    },

    compareFiles: async (req: Request, res: Response) => {
        try {
            const { file1Id, file2Id } = req.body;
            if (!file1Id || !file2Id) {
                throw new Error('Both file IDs are required');
            }

            const file1Path = path.join(uploadsDir, file1Id);
            const file2Path = path.join(uploadsDir, file2Id);
            
            if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
                throw new Error('One or both files not found');
            }

            const results = await compareCSVFiles(file1Path, file2Path);
            logger.info('Files compared successfully', {
                file1: file1Id,
                file2: file2Id,
                stats: {
                    added: results.added.length,
                    removed: results.removed.length,
                    modified: results.modified.length,
                    unchanged: results.unchanged.length
                }
            });

            res.json(results);
        } catch (error) {
            logger.error('Error comparing files', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    },

    exportData: async (req: Request, res: Response) => {
        try {
            const { type } = req.query;
            const { file1Id, file2Id } = req.body;

            if (!file1Id || !file2Id) {
                throw new Error('Both file IDs are required');
            }

            const file1Path = path.join(uploadsDir, file1Id);
            const file2Path = path.join(uploadsDir, file2Id);
            
            if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
                throw new Error('One or both files not found');
            }

            // Get actual comparison result
            const comparisonResult = await compareCSVFiles(file1Path, file2Path);
            const exportPath = path.join(uploadsDir, `export_${Date.now()}.csv`);

            // Format data based on export type
            let exportData: any[];
            if (type === 'differences') {
                exportData = [
                    ...comparisonResult.added.map(row => ({ ...row, Status: 'Added' })),
                    ...comparisonResult.removed.map(row => ({ ...row, Status: 'Removed' })),
                    ...comparisonResult.modified.map(row => ({
                        ...row.modified,
                        Status: 'Modified',
                        Changes: row.changes.map(c => `${c.column}: ${c.oldValue} → ${c.newValue}`).join('; ')
                    }))
                ];
            } else {
                exportData = [
                    ...comparisonResult.added.map(row => ({ ...row, Status: 'Added' })),
                    ...comparisonResult.removed.map(row => ({ ...row, Status: 'Removed' })),
                    ...comparisonResult.modified.map(row => ({ ...row.modified, Status: 'Modified' })),
                    ...comparisonResult.unchanged.map(row => ({ ...row, Status: 'Unchanged' }))
                ];
            }

            // Write to CSV file
            await new Promise<void>((resolve, reject) => {
                stringify(exportData, {
                    header: true,
                    columns: Object.keys(exportData[0] || {}),
                    cast: {
                        string: (value) => value === null ? '' : String(value),
                        number: (value) => value === null ? '' : String(value)
                    }
                }, (err, output) => {
                    if (err) reject(err);
                    fs.writeFile(exportPath, output, (err) => {
                        if (err) reject(err);
                        resolve();
                    });
                });
            });

            // Send file to client
            const fileStream = fs.createReadStream(exportPath);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=comparison_result.csv`);
            fileStream.pipe(res);

            // Clean up the file after sending
            fileStream.on('end', () => {
                fs.unlink(exportPath, (err) => {
                    if (err) logger.error('Error deleting export file', { error: err });
                });
            });

            logger.info('Data exported successfully', {
                type: type || 'full',
                file1: file1Id,
                file2: file2Id
            });
        } catch (error) {
            logger.error('Error exporting data', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    },

    approveChanges: async (req: Request, res: Response) => {
        try {
            const { changes } = req.body;
            if (!changes || !Array.isArray(changes)) {
                throw new Error('Changes array is required');
            }

            // TODO: Implement actual change approval logic
            logger.info('Changes approved successfully', { count: changes.length });
            res.json({ message: 'Changes approved successfully' });
        } catch (error) {
            logger.error('Error approving changes', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    },

    approveAll: async (req: Request, res: Response) => {
        try {
            // TODO: Implement actual approve all logic
            logger.info('All changes approved successfully');
            res.json({ message: 'All changes approved successfully' });
        } catch (error) {
            logger.error('Error approving all changes', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    },

    deleteRows: async (req: Request, res: Response) => {
        try {
            const { rows } = req.body;
            if (!rows || !Array.isArray(rows)) {
                throw new Error('Rows array is required');
            }

            // TODO: Implement actual row deletion logic
            logger.info('Rows deleted successfully', { count: rows.length });
            res.json({ message: 'Rows deleted successfully' });
        } catch (error) {
            logger.error('Error deleting rows', { error });
            res.status(400).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
        }
    }
};

async function compareCSVFiles(file1Path: string, file2Path: string): Promise<ComparisonResult> {
    const file1Rows = await parseCSV(file1Path);
    const file2Rows = await parseCSV(file2Path);

    const added: CSVRow[] = [];
    const removed: CSVRow[] = [];
    const modified: ModifiedRow[] = [];
    const unchanged: CSVRow[] = [];

    // Create maps for faster lookup
    const file1Map = new Map(file1Rows.map(row => [JSON.stringify(row), row]));
    const file2Map = new Map(file2Rows.map(row => [JSON.stringify(row), row]));

    // Find added and modified rows
    for (const row2 of file2Rows) {
        const row2Key = JSON.stringify(row2);
        if (!file1Map.has(row2Key)) {
            // Check if it's a modified version of a row in file1
            let isModified = false;
            for (const [key1, row1] of file1Map.entries()) {
                // Compare primary key or first column
                const pk = Object.keys(row1)[0];
                if (row1[pk] === row2[pk]) {
                    const changes = findChanges(row1, row2);
                    if (changes.length > 0) {
                        modified.push({
                            original: row1,
                            modified: row2,
                            changes
                        });
                        file1Map.delete(key1); // Remove to avoid duplicate processing
                        isModified = true;
                        break;
                    }
                }
            }
            if (!isModified) {
                added.push(row2);
            }
        } else {
            unchanged.push(row2);
            file1Map.delete(row2Key);
        }
    }

    // Remaining rows in file1Map are removed rows
    removed.push(...Array.from(file1Map.values()));

    return { added, removed, modified, unchanged };
}

function findChanges(row1: CSVRow, row2: CSVRow): ColumnChange[] {
    const changes: ColumnChange[] = [];
    for (const key of Object.keys(row1)) {
        if (row1[key] !== row2[key]) {
            changes.push({
                column: key,
                oldValue: row1[key],
                newValue: row2[key]
            });
        }
    }
    return changes;
}

function parseCSV(filePath: string): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
        const rows: CSVRow[] = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, trim: true }))
            .on('data', (row: CSVRow) => rows.push(row))
            .on('error', reject)
            .on('end', () => resolve(rows));
    });
}
