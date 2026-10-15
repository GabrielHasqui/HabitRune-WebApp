import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero">
      <p className="eyebrow">Organiza tu constancia</p>
      <h1>Convierte tus metas diarias en hábitos sostenibles.</h1>
      <p>
        HabitRune es una aplicación para registrar actividades, definir su
        frecuencia y consultar el progreso desde una interfaz sencilla.
      </p>
      <div className="actions">
        <Link className="button button-primary" to="/registro">
          Crear un hábito
        </Link>
        <Link className="button button-secondary" to="/lista">
          Ver mis hábitos
        </Link>
      </div>
    </section>
  );
}
