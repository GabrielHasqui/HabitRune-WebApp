import { Link } from 'react-router-dom';

export default function EmptyState() {
  return (
    <section className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">+</span>
      <h2>Aún no tienes hábitos</h2>
      <p>
        Registra tu primera actividad para comenzar a organizar tu rutina en
        HabitRune.
      </p>
      <Link className="button button-primary" to="/registro">
        Registrar mi primer hábito
      </Link>
    </section>
  );
}
