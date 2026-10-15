import { NavLink, Route, Routes } from 'react-router-dom';
import HabitFormPage from './pages/HabitFormPage.jsx';
import HabitsPage from './pages/HabitsPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">
          HabitRune
        </NavLink>
        <nav aria-label="Navegación principal">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/registro">Registrar hábito</NavLink>
          <NavLink to="/lista">Mis hábitos</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/registro" element={<HabitFormPage />} />
          <Route path="/lista" element={<HabitsPage />} />
        </Routes>
      </main>
    </div>
  );
}
