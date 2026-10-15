import { Link } from 'react-router-dom';

export default function Brand() {
  return (
    <Link className="brand" to="/" aria-label="Ir al inicio de HabitRune">
      <span className="brand-mark" aria-hidden="true">
        H
      </span>
      <span>HabitRune</span>
    </Link>
  );
}
