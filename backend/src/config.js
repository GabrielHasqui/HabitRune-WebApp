import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT || 4000);
export const DATA_FILE = process.env.DATA_FILE
  || path.resolve(currentDirectory, '../data/db.json');

export const CATEGORIES = [
  'Actividad física',
  'Alimentación',
  'Estudio',
  'Descanso',
  'Bienestar',
  'Otros',
];
