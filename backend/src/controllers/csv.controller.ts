import { Request, Response } from 'express';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import fs from 'fs';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});

export const csvController = {
    uploadFiles: async (req: Request, res: Response) => {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length !== 2) {
                throw new Error('Please upload exactly two CSV files');
            }

            logger.info('Files uploaded successfully', { fileNames: files.map(f => f.originalname) });
            res.json({ message: 'Files uploaded successfully', files: files.map(f => f.filename) });
        } catch (error) {
            logger.error('Error uploading files', { error });
            res.status(400).json({ error: error.message });
        }
    },

    compareFiles: async (req: Request, res: Response) => {
        try {
            const { file1, file2 } = req.body;
            const results = await compareCSVFiles(file1, file2);
            logger.info('Files compared successfully');
            res.json(results);
        } catch (error) {
            logger.error('Error comparing files', { error });
            res.status(400).json({ error: error.message });
        }
    },

    exportMerged: async (req: Request, res: Response) => {
        try {
            const { data } = req.body;
            const exportPath = `uploads/merged_${Date.now()}.csv`;
            
            await new Promise((resolve, reject) => {
                stringify(data, { header: true }, (err, output) => {
                    if (err) reject(err);
                    fs.writeFile(exportPath, output, (err) => {
                        if (err) reject(err);
                        resolve(exportPath);
                    });
                });
            });

            logger.info('Merged data exported successfully');
            res.json({ message: 'Export successful', path: exportPath });
        } catch (error) {
            logger.error('Error exporting merged data', { error });
            res.status(400).json({ error: error.message });
        }
    }
};

async function compareCSVFiles(file1Path: string, file2Path: string) {
    const file1Data = await parseCSV(file1Path);
    const file2Data = await parseCSV(file2Path);

    if (!file1Data.length || !file2Data.length) {
        throw new Error('One or both CSV files are empty');
    }

    // Validate column structure
    const file1Headers = Object.keys(file1Data[0]);
    const file2Headers = Object.keys(file2Data[0]);
    
    if (file1Headers.length !== file2Headers.length || 
        !file1Headers.every(header => file2Headers.includes(header))) {
        throw new Error('CSV files have different column structures');
    }

    const idColumn = file1Headers[0]; // Using first column as identifier
    const comparison = {
        added: [],
        removed: [],
        modified: [],
        unchanged: []
    };

    // Create maps for faster lookup
    const file1Map = new Map(file1Data.map(row => [row[idColumn], row]));
    const file2Map = new Map(file2Data.map(row => [row[idColumn], row]));

    // Find added and modified rows
    for (const [id, row2] of file2Map) {
        const row1 = file1Map.get(id);
        if (!row1) {
            comparison.added.push(row2);
        } else {
            const changes = findChanges(row1, row2);
            if (changes.length > 0) {
                comparison.modified.push({ original: row1, modified: row2, changes });
            } else {
                comparison.unchanged.push(row2);
            }
        }
    }

    // Find removed rows
    for (const [id, row1] of file1Map) {
        if (!file2Map.has(id)) {
            comparison.removed.push(row1);
        }
    }

    logger.info('CSV comparison completed', {
        added: comparison.added.length,
        removed: comparison.removed.length,
        modified: comparison.modified.length,
        unchanged: comparison.unchanged.length
    });

    return comparison;
}

function findChanges(row1: any, row2: any) {
    const changes = [];
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

function parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(parse({ columns: true, skip_empty_lines: true }))
            .on('data', (data) => results.push(data))
            .on('error', (error) => reject(error))
            .on('end', () => resolve(results));
    });
}
