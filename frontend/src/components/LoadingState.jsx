export default function LoadingState() {
  return (
    <section className="loading-state" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <div>
        <strong>Consultando tus hábitos</strong>
        <p>Estamos recuperando la información de HabitRune.</p>
      </div>
    </section>
  );
}
