import { NavLink } from 'react-router-dom';
import Brand from './Brand.jsx';

const navigation = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/registro', label: 'Registrar hábito' },
  { to: '/lista', label: 'Mis hábitos' },
];

export default function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Brand />
        <nav aria-label="Navegación principal">
          {navigation.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <span>HabitRune</span>
        <span>Pequeñas acciones, progreso constante.</span>
      </footer>
    </div>
  );
}
