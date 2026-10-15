import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function ConfirmDialog({ habit, busy, error, onCancel, onConfirm }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const close = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [busy, onCancel]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description">
        <button type="button" className="dialog__close" onClick={onCancel} disabled={busy} aria-label="Cerrar"><X size={20} /></button>
        <span className="dialog__icon"><AlertTriangle size={28} /></span>
        <h2 id="delete-title">¿Eliminar este hábito?</h2>
        <p id="delete-description">También se eliminará su historial de realizaciones. Esta acción no se puede deshacer.</p>
        <blockquote>{habit.nombre}</blockquote>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="dialog__actions">
          <button ref={cancelRef} type="button" className="button button--secondary" onClick={onCancel} disabled={busy}>Cancelar</button>
          <button type="button" className="button button--danger" onClick={onConfirm} disabled={busy}>{busy ? "Eliminando…" : "Eliminar hábito"}</button>
        </div>
      </section>
    </div>
  );
}
