import HabitForm from '../components/HabitForm.jsx';

export default function HabitFormPage() {
  return (
    <section className="page-card">
      <p className="eyebrow">Nuevo registro</p>
      <h1>Registrar un hábito</h1>
      <p>
        Define la actividad, los días y el horario que deseas incorporar a tu
        rutina diaria.
      </p>
      <HabitForm />
    </section>
  );
}
