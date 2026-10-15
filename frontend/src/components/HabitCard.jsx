const DAY_LABELS = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb',
  7: 'Dom',
};

function formatDays(days = []) {
  if (days.length === 7) return 'Todos los días';
  return days.map((day) => DAY_LABELS[day]).filter(Boolean).join(', ');
}

export default function HabitCard({ habit }) {
  const schedule = habit.programacion;

  return (
    <article className="habit-card">
      <header className="habit-card-header">
        <div>
          <span className="habit-category">{habit.categoria}</span>
          <h2>{habit.nombre}</h2>
        </div>
        <span className="habit-date">Desde {habit.fechaInicio}</span>
      </header>

      <p>{habit.descripcion}</p>

      {schedule && (
        <dl className="habit-schedule">
          <div>
            <dt>Días</dt>
            <dd>{formatDays(schedule.dias)}</dd>
          </div>
          <div>
            <dt>Horario</dt>
            <dd>{schedule.horaInicio} - {schedule.horaFin}</dd>
          </div>
        </dl>
      )}
    </article>
  );
}
