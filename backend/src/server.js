import { pathToFileURL } from 'node:url';
import cors from 'cors';
import express from 'express';
import { PORT } from './config.js';

const records = [];
let nextId = 1;

export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/salud', (_request, response) => {
    response.json({ estado: 'ok', servicio: 'HabitRune API' });
  });

  app.get('/registros', (_request, response) => {
    response.status(200).json({ registros: records });
  });

  app.post('/registros', (request, response) => {
    const record = {
      id: nextId,
      nombre: request.body.nombre,
      descripcion: request.body.descripcion,
      categoria: request.body.categoria,
      fechaInicio: request.body.fechaInicio,
      dias: request.body.dias,
      horaInicio: request.body.horaInicio,
      horaFin: request.body.horaFin,
      creadoEn: new Date().toISOString(),
    };

    nextId += 1;
    records.push(record);

    response.status(201).json({
      mensaje: 'Hábito creado correctamente',
      registro: record,
    });
  });

  return app;
}

export const app = createApp();

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  app.listen(PORT, () => {
    console.log(`HabitRune API disponible en http://localhost:${PORT}`);
  });
}
