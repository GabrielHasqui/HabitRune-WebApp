import { CATEGORIES } from './config.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function isCalendarDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
  );
}

export function validateHabit(body = {}) {
  const errors = {};
  const value = {
    nombre: String(body.nombre || '').trim(),
    descripcion: String(body.descripcion || '').trim(),
    categoria: String(body.categoria || ''),
    fechaInicio: String(body.fechaInicio || ''),
    dias: Array.isArray(body.dias)
      ? [...new Set(body.dias.map(Number))].sort((a, b) => a - b)
      : [],
    horaInicio: String(body.horaInicio || ''),
    horaFin: String(body.horaFin || ''),
  };

  if (value.nombre.length < 3 || value.nombre.length > 60) {
    errors.nombre = 'El nombre debe tener entre 3 y 60 caracteres';
  }
  if (value.descripcion.length < 3 || value.descripcion.length > 500) {
    errors.descripcion = 'La descripción debe tener entre 3 y 500 caracteres';
  }
  if (!CATEGORIES.includes(value.categoria)) {
    errors.categoria = 'Selecciona una categoría válida';
  }
  if (!isCalendarDate(value.fechaInicio) || value.fechaInicio > new Date().toISOString().slice(0, 10)) {
    errors.fechaInicio = 'Selecciona una fecha válida, pasada o presente';
  }
  if (!value.dias.length || value.dias.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    errors.dias = 'Selecciona al menos un día entre lunes y domingo';
  }
  if (!TIME_PATTERN.test(value.horaInicio)) {
    errors.horaInicio = 'Selecciona una hora de inicio válida';
  }
  if (!TIME_PATTERN.test(value.horaFin)) {
    errors.horaFin = 'Selecciona una hora de finalización válida';
  } else if (
    TIME_PATTERN.test(value.horaInicio)
    && timeToMinutes(value.horaFin) <= timeToMinutes(value.horaInicio)
  ) {
    errors.horaFin = 'La hora final debe ser posterior a la hora inicial';
  }

  return { errors, value };
}
