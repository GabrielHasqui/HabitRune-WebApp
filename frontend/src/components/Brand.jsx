export default function Brand({ inverse = false, compact = false }) {
  return (
    <div className={`brand ${inverse ? "brand--inverse" : ""}`}>
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path d="M12 2.5 21 12l-9 9.5L3 12z" />
          <path d="M12 2.5v4" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
      </span>
      <span>
        <strong>HabitRune</strong>
        {!compact && <small>Tu rutina, tu aventura</small>}
      </span>
    </div>
  );
}
