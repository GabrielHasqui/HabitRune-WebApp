export const WEEKDAYS = [
  { value: 1, short: "Lun", full: "Lunes" },
  { value: 2, short: "Mar", full: "Martes" },
  { value: 3, short: "Mié", full: "Miércoles" },
  { value: 4, short: "Jue", full: "Jueves" },
  { value: 5, short: "Vie", full: "Viernes" },
  { value: 6, short: "Sáb", full: "Sábado" },
  { value: 7, short: "Dom", full: "Domingo" },
];

export const ALL_DAYS = WEEKDAYS.map((day) => day.value);

export const CATEGORIES = [
  "Actividad física",
  "Alimentación",
  "Estudio",
  "Descanso",
  "Bienestar",
  "Otros",
];

export function localDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return parts;
}

export function formatDate(date, long = false) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-EC", long
    ? { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
    : { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: "America/Guayaquil",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function scheduleDays(days = []) {
  if (days.length === 7) return "Todos los días";
  return WEEKDAYS.filter((day) => days.includes(day.value)).map((day) => day.short).join(" · ");
}

export function timeToMinutes(value) {
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
}

export function durationText(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h${rest ? ` ${rest} min` : ""}`;
}

export function formatTime12(value) {
  const [hours, minutes] = value.split(":").map(Number);
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function scheduleTime(schedule) {
  if (!schedule?.horaInicio) return "Sin hora definida";
  if (!schedule.horaFin) return formatTime12(schedule.horaInicio);
  const minutes = timeToMinutes(schedule.horaFin) - timeToMinutes(schedule.horaInicio);
  return `${formatTime12(schedule.horaInicio)}–${formatTime12(schedule.horaFin)} · ${durationText(minutes)}`;
}

export function stateLabel(state) {
  return {
    realizado: "Realizado hoy",
    pendiente: "Pendiente hoy",
    pendiente_hoy: "Pendiente hoy",
    no_programado: "No programado",
    sin_registro: "Sin registro",
  }[state] || state;
}
