import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import cors from 'cors';
import express from 'express';
import { PORT } from './config.js';
import { validateHabit } from './validation.js';

const memoryDatabase = {
  cuentas: [{ id: 'demo-account', nombre: 'Usuario Demo' }],
  habitos: [],
  programaciones: [],
  realizaciones: [],
};

function requireSession(request, response, next) {
  const accountId = request.get('x-account-id');
  const accountExists = memoryDatabase.cuentas.some((account) => account.id === accountId);

  if (!accountExists) {
    return response.status(401).json({ mensaje: 'La sesión no es válida' });
  }

  request.accountId = accountId;
  return next();
}

function recordWithSchedule(habit) {
  return {
    ...habit,
    programacion: memoryDatabase.programaciones.find(
      (schedule) => schedule.habitId === habit.id,
    ),
  };
}

export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/salud', (_request, response) => {
    response.json({ estado: 'ok', servicio: 'HabitRune API' });
  });

  app.get('/registros', requireSession, (request, response) => {
    const records = memoryDatabase.habitos
      .filter((habit) => habit.cuentaId === request.accountId)
      .map(recordWithSchedule);

    response.status(200).json({ registros: records });
  });

  app.post('/registros', requireSession, (request, response) => {
    const { errors, value } = validateHabit(request.body);

    if (Object.keys(errors).length) {
      return response.status(400).json({
        mensaje: 'Revisa los datos enviados',
        errores: errors,
      });
    }

    const now = new Date().toISOString();
    const habit = {
      id: randomUUID(),
      cuentaId: request.accountId,
      nombre: value.nombre,
      descripcion: value.descripcion,
      categoria: value.categoria,
      fechaInicio: value.fechaInicio,
      creadoEn: now,
    };
    const schedule = {
      id: randomUUID(),
      habitId: habit.id,
      vigenteDesde: value.fechaInicio,
      dias: value.dias,
      horaInicio: value.horaInicio,
      horaFin: value.horaFin,
      creadoEn: new Date().toISOString(),
    };

    memoryDatabase.habitos.push(habit);
    memoryDatabase.programaciones.push(schedule);

    return response.status(201).json({
      mensaje: 'Hábito creado correctamente',
      registro: { ...habit, programacion: schedule },
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
