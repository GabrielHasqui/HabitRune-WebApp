import { useNavigate } from 'react-router-dom';
import HabitForm from '../components/HabitForm.jsx';
import { createHabit } from '../services/api.js';

export default function HabitFormPage() {
  const navigate = useNavigate();

  async function saveHabit(values) {
    const result = await createHabit(values);
    navigate('/lista', {
      replace: true,
      state: { message: result.mensaje },
    });
    return result;
  }

  return (
    <section className="page-card">
      <p className="eyebrow">Nuevo registro</p>
      <h1>Registrar un hábito</h1>
      <p>
        Define la actividad, los días y el horario que deseas incorporar a tu
        rutina diaria.
      </p>
      <HabitForm onSubmit={saveHabit} />
    </section>
  );
}
