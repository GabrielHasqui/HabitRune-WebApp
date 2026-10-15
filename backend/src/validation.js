import { CATEGORIES } from "./config.js";
import { isCalendarDate, todayKey } from "./date.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function timeToMinutes(value) {
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
}
export function validateCredentials(body, registering = false) {
  const errors = {};
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.nombre || "").trim();

  if (!EMAIL_PATTERN.test(email)) errors.email = "Ingresa un correo electrónico válido";
  if (!password) errors.password = "La contraseña es obligatoria";
  if (registering && password.length < 6) errors.password = "Usa al menos 6 caracteres";
  if (registering && name.length < 2) errors.nombre = "Ingresa tu nombre";

  return { errors, value: { email, password, nombre: name } };
}
export function validateHabit(body) {
  const errors = {};
  const nombre = String(body.nombre || "").trim();
  const descripcion = String(body.descripcion || "").trim();
  const fechaInicio = String(body.fechaInicio || "");
  const categoria = String(body.categoria || "");
  const dias = Array.isArray(body.dias) ? [...new Set(body.dias.map(Number))].sort() : [];
  const horaInicio = body.horaInicio ? String(body.horaInicio) : null;
  const horaFin = body.horaFin ? String(body.horaFin) : null;

  if (nombre.length < 3 || nombre.length > 60) {
    errors.nombre = "El nombre debe tener entre 3 y 60 caracteres";
  }
  if (descripcion.length < 3 || descripcion.length > 500) {
    errors.descripcion = "La descripción debe tener entre 3 y 500 caracteres";
  }
  if (!isCalendarDate(fechaInicio) || fechaInicio > todayKey()) {
    errors.fechaInicio = "Selecciona una fecha válida, pasada o presente";
  }
  if (!CATEGORIES.includes(categoria)) errors.categoria = "Selecciona una categoría válida";
  if (!dias.length || dias.some((day) => !Number.isInteger(day) || day < 1 || day > 7)) {
    errors.dias = "Selecciona al menos un día";
  }
  if (!horaInicio) errors.horaInicio = "Selecciona una hora de inicio";
  else if (!TIME_PATTERN.test(horaInicio)) errors.horaInicio = "La hora de inicio no es válida";
  if (!horaFin) errors.horaFin = "Selecciona una hora de fin";
  else if (!TIME_PATTERN.test(horaFin)) errors.horaFin = "La hora de fin no es válida";
  if (TIME_PATTERN.test(horaInicio || "") && TIME_PATTERN.test(horaFin || "") && timeToMinutes(horaFin) <= timeToMinutes(horaInicio)) {
    errors.horaFin = "La hora de fin debe ser posterior al inicio, dentro del mismo día";
  }

  return {
    errors,
    value: { nombre, descripcion, fechaInicio, categoria, dias, horaInicio, horaFin },
  };
}
