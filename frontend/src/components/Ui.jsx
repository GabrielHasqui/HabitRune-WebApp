import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";

export function PageHeader({ title, description, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Message({ type = "error", children }) {
  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div className={`message message--${type}`} role={type === "error" ? "alert" : "status"} aria-live="polite">
      <Icon size={20} />
      <span>{children}</span>
    </div>
  );
}

export function Loading({ text = "Cargando…" }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={28} />
      <p>{text}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <section className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return <p id={id} className="field-error" role="alert">{children}</p>;
}

