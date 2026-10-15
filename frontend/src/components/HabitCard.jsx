import { CalendarDays, Check, Clock3, Ellipsis, Eye, Pencil, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatDate, scheduleDays, scheduleTime, stateLabel } from "../utils/format.js";

export default function HabitCard({ habit, onMark, onDelete }) {
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function mark() {
    setSaving(true);
    setError("");
    try {
      await onMark(habit.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const canMark = habit.programadoHoy && !habit.realizadoHoy;

  return (
    <article className="habit-card">
      <header className="habit-card__header">
        <span className={`status-chip status-chip--${habit.estadoHoy}`}>{stateLabel(habit.estadoHoy)}</span>
        <details className="action-menu">
          <summary aria-label="Más acciones"><Ellipsis size={22} /></summary>
          <div className="action-menu__list">
            <Link to={`/habitos/${habit.id}/editar`}><Pencil size={17} /> Editar</Link>
            <button type="button" onClick={() => onDelete(habit)}><Trash2 size={17} /> Eliminar</button>
          </div>
        </details>
      </header>
      <h2>{habit.nombre}</h2>
      <p className="habit-card__description">{habit.descripcion}</p>
      <dl className="habit-meta">
        <div><Tag size={18} /><dt>Categoría</dt><dd>{habit.categoria}</dd></div>
        <div><CalendarDays size={18} /><dt>Inicio y días</dt><dd>{formatDate(habit.fechaInicio)} · {scheduleDays(habit.programacion?.dias)}</dd></div>
        <div><Clock3 size={18} /><dt>Horario</dt><dd>{scheduleTime(habit.programacion)}</dd></div>
      </dl>
      {error && <p className="field-error" role="alert">{error}</p>}
      <footer className="habit-card__actions">
        <button type="button" className="button button--primary button--grow" onClick={mark} disabled={!canMark || saving}>
          <Check size={19} />
          {habit.realizadoHoy ? "Realizado hoy" : saving ? "Guardando…" : habit.programadoHoy ? "Realizado hoy" : "No programado hoy"}
        </button>
        <Link className="button button--secondary" to={`/habitos/${habit.id}`} state={{ backgroundLocation: location }}><Eye size={19} /> Ver detalle</Link>
      </footer>
    </article>
  );
}
