export default function ErrorState({ message, onRetry }) {
  return (
    <section className="error-state" role="alert">
      <div>
        <strong>No pudimos cargar tus hábitos</strong>
        <p>{message || 'Comprueba que el servidor esté disponible e inténtalo nuevamente.'}</p>
      </div>
      <button className="button error-retry" type="button" onClick={onRetry}>
        Reintentar consulta
      </button>
    </section>
  );
}
