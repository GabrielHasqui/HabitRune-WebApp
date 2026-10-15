import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import HabitFormPage from './pages/HabitFormPage.jsx';
import HabitsPage from './pages/HabitsPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registro" element={<HabitFormPage />} />
        <Route path="/lista" element={<HabitsPage />} />
      </Routes>
    </AppLayout>
  );
}
