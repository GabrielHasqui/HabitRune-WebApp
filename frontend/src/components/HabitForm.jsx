import { Check, Clock3, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ALL_DAYS, CATEGORIES, formatTime12, localDateKey, timeToMinutes, WEEKDAYS } from "../utils/format.js";
import { FieldError, Message } from "./Ui.jsx";

const TIME_OPTIONS = Array.from({ length: 288 }, (_, index) => {
  const minutes = index * 5;
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const minutePart = String(minutes % 60).padStart(2, "0");
  return `${hours}:${minutePart}`;
});

function includeCurrentTime(options, currentTime) {
  if (!currentTime || options.includes(currentTime)) return options;
  return [...options, currentTime].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}
const emptyForm = {
  nombre: "",
  descripcion: "",
  fechaInicio: localDateKey(),
  categoria: "",
  dias: ALL_DAYS,
  horaInicio: "",
  horaFin: "",
};

export default function HabitForm({ initial, editing = false, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setForm({
      nombre: initial.nombre || initial.descripcion,
      descripcion: initial.descripcion,
      fechaInicio: initial.fechaInicio,
      categoria: initial.categoria,
      dias: initial.programacion?.dias || ALL_DAYS,
      horaInicio: initial.programacion?.horaInicio || "",
      horaFin: initial.programacion?.horaFin || "",
    });
  }, [initial]);

  const duration = useMemo(() => {
    if (!form.horaInicio || !form.horaFin) return null;
    return timeToMinutes(form.horaFin) - timeToMinutes(form.horaInicio);
  }, [form.horaInicio, form.horaFin]);

  const startTimeOptions = useMemo(
    () => includeCurrentTime(TIME_OPTIONS.slice(0, -1), form.horaInicio),
    [form.horaInicio],
  );

  const endTimeOptions = useMemo(() => {
    if (!form.horaInicio) return [];
    const startMinutes = timeToMinutes(form.horaInicio);
    return includeCurrentTime(TIME_OPTIONS, form.horaFin)
      .filter((time) => timeToMinutes(time) > startMinutes);
  }, [form.horaInicio, form.horaFin]);

  function set(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function toggleDay(day) {
    const selected = form.dias.includes(day);
    const days = selected ? form.dias.filter((item) => item !== day) : [...form.dias, day].sort();
    set("dias", days);
  }

  function validate() {
    const next = {};
    const name = form.nombre.trim();
    const description = form.descripcion.trim();
    if (name.length < 3 || name.length > 60) next.nombre = "Usa entre 3 y 60 caracteres";
    if (description.length < 3 || description.length > 500) next.descripcion = "Usa entre 3 y 500 caracteres";
    if (!form.fechaInicio || form.fechaInicio > localDateKey()) next.fechaInicio = "Selecciona una fecha pasada o presente";
    if (!form.categoria) next.categoria = "Selecciona una categoría";
    if (!form.dias.length) next.dias = "Selecciona al menos un día";
    if (!form.horaInicio) next.horaInicio = "Selecciona una hora de inicio";
    if (!form.horaFin) next.horaFin = "Selecciona una hora de fin";
    if (form.horaInicio && form.horaFin && timeToMinutes(form.horaFin) <= timeToMinutes(form.horaInicio)) {
      next.horaFin = "Debe ser posterior al inicio y pertenecer al mismo día";
    }
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      });
    } catch (error) {
      setErrors(error.fields || {});
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const startLocked = editing && initial?.tieneRealizaciones;

  return (
    <form className="habit-form" onSubmit={submit} noValidate>
      {message && <Message>{message}</Message>}

      <fieldset disabled={saving}>
        <legend className="sr-only">Información del hábito</legend>

        <label className="form-field form-field--name">
          <span>Nombre del hábito</span>
          <input
            type="text"
            maxLength="60"
            required
            value={form.nombre}
            onChange={(event) => set("nombre", event.target.value)}
            aria-invalid={Boolean(errors.nombre)}
            aria-describedby="nombre-habito-error nombre-habito-help"
            placeholder="Ej. Caminata diaria"
          />
          <small id="nombre-habito-help" className="form-help">Un título corto para identificarlo. {form.nombre.trim().length}/60</small>
          <FieldError id="nombre-habito-error">{errors.nombre}</FieldError>
        </label>

        <label className="form-field form-field--full">
          <span>Descripción</span>
          <textarea
            rows="4"
            value={form.descripcion}
            onChange={(event) => set("descripcion", event.target.value)}
            aria-invalid={Boolean(errors.descripcion)}
            aria-describedby="descripcion-error descripcion-help"
            placeholder="Ej. Caminar durante 30 minutos"
          />
          <small id="descripcion-help" className="form-help">Explica en qué consiste el hábito. {form.descripcion.trim().length}/500</small>
          <FieldError id="descripcion-error">{errors.descripcion}</FieldError>
        </label>

        <div className="form-grid">
          <label className="form-field">
            <span>Fecha de inicio</span>
            <input
              type="date"
              max={localDateKey()}
              value={form.fechaInicio}
              onChange={(event) => set("fechaInicio", event.target.value)}
              disabled={saving || startLocked}
              aria-invalid={Boolean(errors.fechaInicio)}
              aria-describedby="fecha-error fecha-help"
            />
            <small id="fecha-help" className="form-help">{startLocked ? "No puede cambiar porque ya existen realizaciones." : "Puede ser hoy o una fecha anterior."}</small>
            <FieldError id="fecha-error">{errors.fechaInicio}</FieldError>
          </label>

          <label className="form-field">
            <span>Categoría</span>
            <select value={form.categoria} onChange={(event) => set("categoria", event.target.value)} aria-invalid={Boolean(errors.categoria)} aria-describedby="categoria-error">
              <option value="">Selecciona una categoría</option>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <FieldError id="categoria-error">{errors.categoria}</FieldError>
          </label>
        </div>

        <fieldset className="days-field" aria-describedby="dias-error">
          <div className="days-field__heading">
            <legend>Días para realizarlo</legend>
            <button type="button" className="text-button" onClick={() => set("dias", ALL_DAYS)}>Todos los días</button>
          </div>
          <div className="day-buttons">
            {WEEKDAYS.map((day) => {
              const selected = form.dias.includes(day.value);
              return (
                <button key={day.value} type="button" className={selected ? "day-button day-button--selected" : "day-button"} onClick={() => toggleDay(day.value)} aria-pressed={selected} aria-label={day.full}>
                  {selected && <Check size={15} />} {day.short}
                </button>
              );
            })}
          </div>
          <FieldError id="dias-error">{errors.dias}</FieldError>
        </fieldset>

        <section className="schedule-fields" aria-labelledby="schedule-title">
          <div className="schedule-fields__heading">
            <span className="section-icon"><Clock3 size={20} /></span>
            <div>
              <h2 id="schedule-title">Horario</h2>
              <p>Define la hora de inicio y fin para los días seleccionados.</p>
            </div>
          </div>
          <div className="form-grid">
            <label className="form-field">
              <span>Hora de inicio</span>
              <select required value={form.horaInicio} onChange={(event) => {
                const value = event.target.value;
                setForm((current) => ({
                  ...current,
                  horaInicio: value,
                  horaFin: current.horaFin && value && timeToMinutes(current.horaFin) > timeToMinutes(value) ? current.horaFin : "",
                }));
                setErrors((current) => ({ ...current, horaInicio: undefined, horaFin: undefined }));
              }} aria-invalid={Boolean(errors.horaInicio)} aria-describedby="hora-inicio-error">
                <option value="">Selecciona la hora de inicio</option>
                {startTimeOptions.map((time) => <option key={time} value={time}>{formatTime12(time)}</option>)}
              </select>
              <FieldError id="hora-inicio-error">{errors.horaInicio}</FieldError>
            </label>
            <label className="form-field">
              <span>Hora de fin</span>
              <select required value={form.horaFin} onChange={(event) => set("horaFin", event.target.value)} disabled={!form.horaInicio || saving} aria-invalid={Boolean(errors.horaFin)} aria-describedby="hora-fin-error hora-fin-help">
                <option value="">{form.horaInicio ? "Selecciona la hora de fin" : "Selecciona primero el inicio"}</option>
                {endTimeOptions.map((time) => <option key={time} value={time}>{formatTime12(time)}</option>)}
              </select>
              <small id="hora-fin-help" className="form-help">
                {!form.horaInicio ? "Selecciona primero el inicio." : duration > 0 ? `Duración prevista: ${duration} min.` : "Solo se muestran horas posteriores al inicio."}
              </small>
              <FieldError id="hora-fin-error">{errors.horaFin}</FieldError>
            </label>
          </div>
        </section>

        {editing && <Message type="success">Los cambios de días y horario se aplicarán desde mañana. El nombre, la descripción y la categoría se actualizan de inmediato.</Message>}

        <footer className="form-actions">
          <button type="button" className="button button--secondary" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="button button--primary" disabled={saving}>
            <Save size={19} /> {saving ? "Guardando…" : editing ? "Guardar cambios" : "Guardar hábito"}
          </button>
        </footer>
      </fieldset>
    </form>
  );
}
