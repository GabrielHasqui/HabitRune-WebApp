import { CheckCircle2, ClipboardList, ExternalLink, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loading, Message, PageHeader } from "../components/Ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { CATEGORIES, formatDate } from "../utils/format.js";

export default function AccountPage() {
  const { account } = useAuth();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ fecha: "", categoria: "" });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const query = new URLSearchParams();
      if (filters.fecha) query.set("fecha", filters.fecha);
      if (filters.categoria) query.set("categoria", filters.categoria);
      setData(await api(`/cuenta?${query}`));
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  const initials = account.nombre.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
  const filtering = filters.fecha || filters.categoria;

  return (
    <>
      <PageHeader title="Mi cuenta" description="Consulta tu perfil y el historial conjunto de realizaciones." />

      <section className="profile-card">
        <span className="profile-card__avatar" aria-hidden="true">{initials}</span>
        <div><span className="eyebrow">Perfil</span><h2>{account.nombre}</h2><p>{account.email}</p></div>
      </section>

      {status === "loading" && <Loading text="Cargando tu cuenta…" />}
      {status === "error" && <Message>{error} <button className="inline-action" onClick={load}>Reintentar</button></Message>}

      {status === "ready" && data && (
        <>
          <dl className="account-stats">
            <div><span><ClipboardList size={23} /></span><dt>Hábitos creados</dt><dd>{data.totales.habitos}</dd></div>
            <div><span><CheckCircle2 size={23} /></span><dt>Realizaciones registradas</dt><dd>{data.totales.realizaciones}</dd></div>
          </dl>

          <section className="account-history" aria-labelledby="account-history-title">
            <header className="section-heading">
              <div><span className="eyebrow">Actividad</span><h2 id="account-history-title">Historial de realizaciones</h2></div>
            </header>
            <div className="filters" aria-label="Filtros del historial">
              <label><span>Fecha exacta</span><input type="date" value={filters.fecha} onChange={(event) => setFilters((current) => ({ ...current, fecha: event.target.value }))} /></label>
              <label><span>Categoría</span><select value={filters.categoria} onChange={(event) => setFilters((current) => ({ ...current, categoria: event.target.value }))}><option value="">Todas las categorías</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
              <button type="button" className="button button--secondary" onClick={() => setFilters({ fecha: "", categoria: "" })} disabled={!filtering}>Limpiar filtros</button>
            </div>

            {data.realizaciones.length ? (
              <ul className="completion-list">
                {data.realizaciones.map((item) => (
                  <li key={item.id}>
                    <span className="completion-list__icon"><CheckCircle2 size={20} /></span>
                    <div><strong>{item.nombre}</strong><span>{item.categoria} · {formatDate(item.fecha)}</span></div>
                    <Link to={`/habitos/${item.habitId}`} state={{ backgroundLocation: location }} aria-label={`Ver detalle de ${item.nombre}`}><ExternalLink size={19} /></Link>
                  </li>
                ))}
              </ul>
            ) : <p className="empty-inline">{filtering ? "No hay realizaciones que coincidan con los filtros." : "Aún no has registrado realizaciones."}</p>}
          </section>
        </>
      )}
    </>
  );
}
