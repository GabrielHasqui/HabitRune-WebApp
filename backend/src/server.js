import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import { CATEGORIES, PORT } from "./config.js";
import { addDays, datesDescending, todayKey, tomorrowKey, weekdayIso } from "./date.js";
import { ensureDemoAccount, hashPassword, readDatabase, updateDatabase } from "./store.js";
import { timeToMinutes, validateCredentials, validateHabit } from "./validation.js";

const sessions = new Map();

function publicAccount(account) {
  return { id: account.id, nombre: account.nombre, email: account.email };
}

function scheduleForDate(database, habitId, date) {
  return database.programaciones
    .filter((schedule) => schedule.habitId === habitId && schedule.vigenteDesde <= date)
    .sort((a, b) => b.vigenteDesde.localeCompare(a.vigenteDesde))[0] || null;
}

function nextSchedule(database, habitId, date) {
  return database.programaciones
    .filter((schedule) => schedule.habitId === habitId && schedule.vigenteDesde > date)
    .sort((a, b) => a.vigenteDesde.localeCompare(b.vigenteDesde))[0] || null;
}

function scheduledOn(habit, schedule, date) {
  return Boolean(schedule && date >= habit.fechaInicio && schedule.dias.includes(weekdayIso(date)));
}

function recordForDate(database, habit, date = todayKey()) {
  const schedule = scheduleForDate(database, habit.id, date);
  const future = nextSchedule(database, habit.id, date);
  const completion = database.realizaciones.find(
    (item) => item.habitId === habit.id && item.fecha === date,
  );
  const total = database.realizaciones.filter((item) => item.habitId === habit.id).length;
  const last = database.realizaciones
    .filter((item) => item.habitId === habit.id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0] || null;
  const isScheduledToday = scheduledOn(habit, schedule, date);

  return {
    ...habit,
    nombre: habit.nombre || habit.descripcion,
    programacion: schedule,
    cambioProgramado: future,
    programadoHoy: isScheduledToday,
    realizadoHoy: Boolean(completion),
    estadoHoy: completion ? "realizado" : isScheduledToday ? "pendiente" : "no_programado",
    totalRealizaciones: total,
    ultimaRealizacion: last?.fecha || null,
    tieneRealizaciones: total > 0,
  };
}

function sortRecords(records) {
  return records.sort(
    (a, b) =>
      b.fechaInicio.localeCompare(a.fechaInicio) ||
      b.creadoEn.localeCompare(a.creadoEn) ||
      b.id.localeCompare(a.id),
  );
}

function sortToday(records) {
  return records.sort((a, b) => {
    const aTime = a.programacion?.horaInicio;
    const bTime = b.programacion?.horaInicio;
    if (!aTime && bTime) return 1;
    if (aTime && !bTime) return -1;
    return (aTime || "").localeCompare(bTime || "") || a.creadoEn.localeCompare(b.creadoEn) || a.id.localeCompare(b.id);
  });
}

function requireSession(req, res, next) {
  const token = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const accountId = token ? sessions.get(token) : null;
  if (!accountId) return res.status(401).json({ mensaje: "Tu sesión no es válida. Inicia sesión nuevamente" });
  req.accountId = accountId;
  req.sessionToken = token;
  next();
}

function sendValidation(res, errors) {
  return res.status(400).json({ mensaje: "Revisa los datos enviados", errores: errors });
}

export function createApp() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/salud", (_req, res) => res.json({ estado: "ok", servicio: "HabitRune API" }));

  app.post("/auth/login", async (req, res, next) => {
    try {
      const { errors, value } = validateCredentials(req.body);
      if (Object.keys(errors).length) return sendValidation(res, errors);
      const database = await readDatabase();
      const account = database.cuentas.find(
        (item) => item.email === value.email && item.passwordHash === hashPassword(value.password),
      );
      if (!account) return res.status(401).json({ mensaje: "Correo o contraseña incorrectos" });
      const token = randomUUID();
      sessions.set(token, account.id);
      res.json({ token, cuenta: publicAccount(account) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/auth/register", async (req, res, next) => {
    try {
      const { errors, value } = validateCredentials(req.body, true);
      if (Object.keys(errors).length) return sendValidation(res, errors);
      const account = await updateDatabase((database) => {
        if (database.cuentas.some((item) => item.email === value.email)) {
          const error = new Error("El correo ya está registrado");
          error.status = 409;
          throw error;
        }
        const created = {
          id: randomUUID(),
          nombre: value.nombre,
          email: value.email,
          passwordHash: hashPassword(value.password),
          creadoEn: new Date().toISOString(),
        };
        database.cuentas.push(created);
        return created;
      });
      const token = randomUUID();
      sessions.set(token, account.id);
      res.status(201).json({ token, cuenta: publicAccount(account) });
    } catch (error) {
      next(error);
    }
  });

  app.get("/auth/session", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const account = database.cuentas.find((item) => item.id === req.accountId);
      if (!account) return res.status(401).json({ mensaje: "Cuenta no encontrada" });
      res.json({ cuenta: publicAccount(account) });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/auth/session", requireSession, (req, res) => {
    sessions.delete(req.sessionToken);
    res.status(204).end();
  });

  app.get("/categorias", (_req, res) => res.json({ categorias: CATEGORIES }));

  app.get("/registros", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const habits = database.habitos
        .filter((habit) => habit.cuentaId === req.accountId)
        .map((habit) => recordForDate(database, habit));
      res.json({ registros: sortRecords(habits) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/registros", requireSession, async (req, res, next) => {
    try {
      const { errors, value } = validateHabit(req.body);
      if (Object.keys(errors).length) return sendValidation(res, errors);
      const created = await updateDatabase((database) => {
        const now = new Date().toISOString();
        const habit = {
          id: randomUUID(),
          cuentaId: req.accountId,
          nombre: value.nombre,
          descripcion: value.descripcion,
          fechaInicio: value.fechaInicio,
          categoria: value.categoria,
          creadoEn: now,
        };
        database.habitos.push(habit);
        database.programaciones.push({
          id: randomUUID(),
          habitId: habit.id,
          vigenteDesde: value.fechaInicio,
          dias: value.dias,
          horaInicio: value.horaInicio,
          horaFin: value.horaFin,
          creadoEn: now,
        });
        return recordForDate(database, habit);
      });
      res.status(201).json({ mensaje: "Hábito creado correctamente", registro: created });
    } catch (error) {
      next(error);
    }
  });

  app.get("/registros/:id", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const habit = database.habitos.find(
        (item) => item.id === req.params.id && item.cuentaId === req.accountId,
      );
      if (!habit) return res.status(404).json({ mensaje: "Hábito no encontrado" });
      res.json({ registro: recordForDate(database, habit) });
    } catch (error) {
      next(error);
    }
  });

  app.put("/registros/:id", requireSession, async (req, res, next) => {
    try {
      const { errors, value } = validateHabit(req.body);
      if (Object.keys(errors).length) return sendValidation(res, errors);
      const updated = await updateDatabase((database) => {
        const habit = database.habitos.find(
          (item) => item.id === req.params.id && item.cuentaId === req.accountId,
        );
        if (!habit) {
          const error = new Error("Hábito no encontrado");
          error.status = 404;
          throw error;
        }
        const completions = database.realizaciones.filter((item) => item.habitId === habit.id);
        if (completions.length && habit.fechaInicio !== value.fechaInicio) {
          const error = new Error("La fecha de inicio no puede cambiar porque ya existen realizaciones");
          error.status = 400;
          throw error;
        }

        const originalStart = habit.fechaInicio;
        habit.nombre = value.nombre;
        habit.descripcion = value.descripcion;
        habit.categoria = value.categoria;
        habit.fechaInicio = value.fechaInicio;

        if (!completions.length && originalStart !== value.fechaInicio) {
          const firstSchedule = database.programaciones
            .filter((item) => item.habitId === habit.id)
            .sort((a, b) => a.vigenteDesde.localeCompare(b.vigenteDesde))[0];
          if (firstSchedule) firstSchedule.vigenteDesde = value.fechaInicio;
        }

        const current = scheduleForDate(database, habit.id, todayKey());
        const scheduleChanged =
          JSON.stringify(current?.dias || []) !== JSON.stringify(value.dias) ||
          (current?.horaInicio || null) !== value.horaInicio ||
          (current?.horaFin || null) !== value.horaFin;

        const effectiveDate = tomorrowKey();
        const pending = database.programaciones.find(
          (item) => item.habitId === habit.id && item.vigenteDesde === effectiveDate,
        );

        if (scheduleChanged) {
          const values = {
            dias: value.dias,
            horaInicio: value.horaInicio,
            horaFin: value.horaFin,
            creadoEn: new Date().toISOString(),
          };
          if (pending) Object.assign(pending, values);
          else database.programaciones.push({ id: randomUUID(), habitId: habit.id, vigenteDesde: effectiveDate, ...values });
        } else if (pending) {
          database.programaciones = database.programaciones.filter((item) => item.id !== pending.id);
        }

        return recordForDate(database, habit);
      });
      res.json({ mensaje: "Hábito actualizado correctamente", registro: updated });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/registros/:id", requireSession, async (req, res, next) => {
    try {
      await updateDatabase((database) => {
        const habit = database.habitos.find(
          (item) => item.id === req.params.id && item.cuentaId === req.accountId,
        );
        if (!habit) {
          const error = new Error("Hábito no encontrado");
          error.status = 404;
          throw error;
        }
        database.habitos = database.habitos.filter((item) => item.id !== habit.id);
        database.programaciones = database.programaciones.filter((item) => item.habitId !== habit.id);
        database.realizaciones = database.realizaciones.filter((item) => item.habitId !== habit.id);
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.post("/registros/:id/realizaciones", requireSession, async (req, res, next) => {
    try {
      const completion = await updateDatabase((database) => {
        const habit = database.habitos.find(
          (item) => item.id === req.params.id && item.cuentaId === req.accountId,
        );
        if (!habit) {
          const error = new Error("Hábito no encontrado");
          error.status = 404;
          throw error;
        }
        const date = todayKey();
        const schedule = scheduleForDate(database, habit.id, date);
        if (!scheduledOn(habit, schedule, date)) {
          const error = new Error("Este hábito no está programado para hoy");
          error.status = 400;
          throw error;
        }
        const existing = database.realizaciones.find(
          (item) => item.habitId === habit.id && item.fecha === date,
        );
        if (existing) return existing;
        const created = {
          id: randomUUID(),
          habitId: habit.id,
          fecha: date,
          registradoEn: new Date().toISOString(),
        };
        database.realizaciones.push(created);
        return created;
      });
      res.status(201).json({ mensaje: "Realización registrada", realizacion: completion });
    } catch (error) {
      next(error);
    }
  });

  app.get("/registros/:id/historial", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const habit = database.habitos.find(
        (item) => item.id === req.params.id && item.cuentaId === req.accountId,
      );
      if (!habit) return res.status(404).json({ mensaje: "Hábito no encontrado" });
      const limit = Math.min(Math.max(Number(req.query.limite) || 30, 1), 90);
      const offset = Math.max(Number(req.query.desde) || 0, 0);
      const today = todayKey();
      const dates = datesDescending(habit.fechaInicio, today, offset, limit);
      const completionDates = new Set(
        database.realizaciones.filter((item) => item.habitId === habit.id).map((item) => item.fecha),
      );
      const history = dates.map((date) => {
        const schedule = scheduleForDate(database, habit.id, date);
        const planned = scheduledOn(habit, schedule, date);
        const state = completionDates.has(date)
          ? "realizado"
          : !planned
            ? "no_programado"
            : date === today
              ? "pendiente_hoy"
              : "sin_registro";
        return { fecha: date, estado: state };
      });
      const totalDays = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${habit.fechaInicio}T00:00:00Z`)) / 86400000) + 1;
      res.json({ historial: history, hayMas: offset + history.length < totalDays });
    } catch (error) {
      next(error);
    }
  });

  app.get("/resumen-hoy", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const date = todayKey();
      const records = database.habitos
        .filter((habit) => habit.cuentaId === req.accountId)
        .map((habit) => recordForDate(database, habit, date))
        .filter((habit) => habit.programadoHoy);
      const completed = records.filter((habit) => habit.realizadoHoy).length;
      res.json({
        fecha: date,
        habitosCreados: database.habitos.filter((habit) => habit.cuentaId === req.accountId).length,
        total: records.length,
        realizados: completed,
        pendientes: records.length - completed,
        registros: sortToday(records),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/cuenta", requireSession, async (req, res, next) => {
    try {
      const database = await readDatabase();
      const account = database.cuentas.find((item) => item.id === req.accountId);
      if (!account) return res.status(404).json({ mensaje: "Cuenta no encontrada" });
      const habits = database.habitos.filter((item) => item.cuentaId === req.accountId);
      const habitMap = new Map(habits.map((habit) => [habit.id, habit]));
      const date = String(req.query.fecha || "");
      const category = String(req.query.categoria || "");
      const completions = database.realizaciones
        .filter((item) => habitMap.has(item.habitId))
        .map((item) => ({ ...item, habit: habitMap.get(item.habitId) }))
        .filter((item) => !date || item.fecha === date)
        .filter((item) => !category || item.habit.categoria === category)
        .sort((a, b) => b.registradoEn.localeCompare(a.registradoEn))
        .map((item) => ({
          id: item.id,
          habitId: item.habitId,
          fecha: item.fecha,
          registradoEn: item.registradoEn,
          nombre: item.habit.nombre || item.habit.descripcion,
          descripcion: item.habit.descripcion,
          categoria: item.habit.categoria,
        }));
      const allCount = database.realizaciones.filter((item) => habitMap.has(item.habitId)).length;
      res.json({
        cuenta: publicAccount(account),
        totales: { habitos: habits.length, realizaciones: allCount },
        realizaciones: completions,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.status || 500).json({
      mensaje: error.status ? error.message : "No se pudo completar la operación. Inténtalo de nuevo",
    });
  });

  return app;
}

export const app = createApp();

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  ensureDemoAccount()
    .then(() => {
      app.listen(PORT, () => console.log(`HabitRune API disponible en http://localhost:${PORT}`));
    })
    .catch((error) => {
      console.error("No se pudo iniciar HabitRune", error);
      process.exitCode = 1;
    });
}
