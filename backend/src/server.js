import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import cors from 'cors';
import express from 'express';
import { PORT } from './config.js';
import { readDatabase, updateDatabase } from './store.js';
import { validateHabit } from './validation.js';

async function requireSession(request, response, next) {
  try {
    const accountId = request.get('x-account-id');
    const database = await readDatabase();
    const accountExists = database.cuentas.some((account) => account.id === accountId);

    if (!accountExists) {
      return response.status(401).json({ mensaje: 'La sesión no es válida' });
    }

    request.accountId = accountId;
    return next();
  } catch (error) {
    return next(error);
  }
}

function recordWithSchedule(database, habit) {
  return {
    ...habit,
    programacion: database.programaciones.find(
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

  app.get('/registros', requireSession, async (request, response, next) => {
    try {
      const database = await readDatabase();
      const records = database.habitos
        .filter((habit) => habit.cuentaId === request.accountId)
        .map((habit) => recordWithSchedule(database, habit));

      response.status(200).json({ registros: records });
    } catch (error) {
      next(error);
    }
  });

  app.post('/registros', requireSession, async (request, response, next) => {
    const { errors, value } = validateHabit(request.body);

    if (Object.keys(errors).length) {
      return response.status(400).json({
        mensaje: 'Revisa los datos enviados',
        errores: errors,
      });
    }

    try {
      const record = await updateDatabase((database) => {
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
          creadoEn: now,
        };

        database.habitos.push(habit);
        database.programaciones.push(schedule);
        return { ...habit, programacion: schedule };
      });

      return response.status(201).json({
        mensaje: 'Hábito creado correctamente',
        registro: record,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({
      mensaje: 'No se pudo completar la operación',
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
