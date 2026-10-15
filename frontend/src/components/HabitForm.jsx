import { useState } from 'react';

const CATEGORIES = [
  'Actividad física',
  'Alimentación',
  'Estudio',
  'Descanso',
  'Bienestar',
  'Otros',
];

const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];

function localDateKey() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

const emptyForm = {
  nombre: '',
  descripcion: '',
  categoria: '',
  fechaInicio: localDateKey(),
  dias: [],
  horaInicio: '',
  horaFin: '',
};

function timeToMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function FieldError({ children }) {
  if (!children) return null;
  return <small className="field-error">{children}</small>;
}

export default function HabitForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('success');
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMessage('');
  }

  function toggleDay(day) {
    setForm((current) => ({
      ...current,
      dias: current.dias.includes(day)
        ? current.dias.filter((value) => value !== day)
        : [...current.dias, day].sort(),
    }));
    setErrors((current) => ({ ...current, dias: undefined }));
    setMessage('');
  }

  function validate() {
    const nextErrors = {};
    const name = form.nombre.trim();
    const description = form.descripcion.trim();

    if (name.length < 3 || name.length > 60) {
      nextErrors.nombre = 'El nombre debe tener entre 3 y 60 caracteres.';
    }
    if (description.length < 3 || description.length > 500) {
      nextErrors.descripcion = 'La descripción debe tener entre 3 y 500 caracteres.';
    }
    if (!CATEGORIES.includes(form.categoria)) {
      nextErrors.categoria = 'Selecciona una categoría válida.';
    }
    if (!form.fechaInicio || form.fechaInicio > localDateKey()) {
      nextErrors.fechaInicio = 'Selecciona una fecha pasada o presente.';
    }
    if (!form.dias.length) {
      nextErrors.dias = 'Selecciona al menos un día.';
    }
    if (!form.horaInicio) {
      nextErrors.horaInicio = 'Selecciona una hora de inicio.';
    }
    if (!form.horaFin) {
      nextErrors.horaFin = 'Selecciona una hora de finalización.';
    } else if (
      form.horaInicio
      && timeToMinutes(form.horaFin) <= timeToMinutes(form.horaInicio)
    ) {
      nextErrors.horaFin = 'La hora final debe ser posterior a la hora inicial.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    if (!validate()) {
      setMessageKind('error');
      setMessage('Revisa los campos señalados antes de continuar.');
      return;
    }

    setSaving(true);
    setMessageKind('success');

    try {
      const result = await onSubmit({
        ...form,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
      });
      setMessage(result?.mensaje || 'Hábito guardado correctamente.');
    } catch (requestError) {
      setErrors(requestError.fields || {});
      setMessageKind('error');
      setMessage(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="habit-form" onSubmit={submit} noValidate>
      {message && (
        <p
          className={messageKind === 'error' ? 'form-message form-message-error' : 'form-message'}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span>Nombre del hábito</span>
          <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={updateField}
            placeholder="Ej. Caminata diaria"
            maxLength="60"
            aria-invalid={Boolean(errors.nombre)}
          />
          <FieldError>{errors.nombre}</FieldError>
        </label>

        <label className="form-field">
          <span>Categoría</span>
          <select
            name="categoria"
            value={form.categoria}
            onChange={updateField}
            aria-invalid={Boolean(errors.categoria)}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <FieldError>{errors.categoria}</FieldError>
        </label>
      </div>

      <label className="form-field">
        <span>Descripción</span>
        <textarea
          name="descripcion"
          rows="4"
          value={form.descripcion}
          onChange={updateField}
          placeholder="Describe la actividad que deseas convertir en hábito"
          maxLength="500"
          aria-invalid={Boolean(errors.descripcion)}
        />
        <FieldError>{errors.descripcion}</FieldError>
      </label>

      <label className="form-field">
        <span>Fecha inicial</span>
        <input
          name="fechaInicio"
          type="date"
          max={localDateKey()}
          value={form.fechaInicio}
          onChange={updateField}
          aria-invalid={Boolean(errors.fechaInicio)}
        />
        <FieldError>{errors.fechaInicio}</FieldError>
      </label>

      <fieldset className="days-field">
        <legend>Días para realizarlo</legend>
        <div className="day-buttons">
          {WEEKDAYS.map((day) => {
            const selected = form.dias.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                className={selected ? 'day-button day-button-selected' : 'day-button'}
                aria-pressed={selected}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <FieldError>{errors.dias}</FieldError>
      </fieldset>

      <div className="form-grid">
        <label className="form-field">
          <span>Hora de inicio</span>
          <input
            name="horaInicio"
            type="time"
            value={form.horaInicio}
            onChange={updateField}
            aria-invalid={Boolean(errors.horaInicio)}
          />
          <FieldError>{errors.horaInicio}</FieldError>
        </label>

        <label className="form-field">
          <span>Hora de finalización</span>
          <input
            name="horaFin"
            type="time"
            value={form.horaFin}
            onChange={updateField}
            aria-invalid={Boolean(errors.horaFin)}
          />
          <FieldError>{errors.horaFin}</FieldError>
        </label>
      </div>

      <button className="button button-primary submit-button" type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar hábito'}
      </button>
    </form>
  );
}
