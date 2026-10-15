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

export default function HabitForm() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage('');
  }

  function toggleDay(day) {
    setForm((current) => ({
      ...current,
      dias: current.dias.includes(day)
        ? current.dias.filter((value) => value !== day)
        : [...current.dias, day].sort(),
    }));
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    await Promise.resolve();

    setMessage('Los datos del hábito están listos para su validación.');
    setSaving(false);
  }

  return (
    <form className="habit-form" onSubmit={submit}>
      {message && <p className="form-message" role="status">{message}</p>}

      <div className="form-grid">
        <label className="form-field">
          <span>Nombre del hábito</span>
          <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={updateField}
            placeholder="Ej. Caminata diaria"
          />
        </label>

        <label className="form-field">
          <span>Categoría</span>
          <select name="categoria" value={form.categoria} onChange={updateField}>
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
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
        />
      </label>

      <label className="form-field">
        <span>Fecha inicial</span>
        <input
          name="fechaInicio"
          type="date"
          max={localDateKey()}
          value={form.fechaInicio}
          onChange={updateField}
        />
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
      </fieldset>

      <div className="form-grid">
        <label className="form-field">
          <span>Hora de inicio</span>
          <input
            name="horaInicio"
            type="time"
            value={form.horaInicio}
            onChange={updateField}
          />
        </label>

        <label className="form-field">
          <span>Hora de finalización</span>
          <input
            name="horaFin"
            type="time"
            value={form.horaFin}
            onChange={updateField}
          />
        </label>
      </div>

      <button className="button button-primary submit-button" type="submit" disabled={saving}>
        {saving ? 'Preparando…' : 'Guardar hábito'}
      </button>
    </form>
  );
}
