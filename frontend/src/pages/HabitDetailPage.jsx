import { CalendarDays, Check, Clock3, History, Pencil, Tag, Trash2, UserRound, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { Loading, Message } from "../components/Ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { formatDate, formatDateTime, scheduleDays, scheduleTime, stateLabel } from "../utils/format.js";

export default function HabitDetailPage() {
  const { id } = useParams();
  const { account } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [habit, setHabit] = useState(null);
  const [history, setHistory] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });
  const titleRef = useRef(null);

  const closeDetail = useCallback(() => {
    if (location.state?.backgroundLocation) navigate(-1);
    else navigate("/lista");
  }, [location.state, navigate]);

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      const [recordData, historyData] = await Promise.all([
        api(`/registros/${id}`),
        api(`/registros/${id}/historial?limite=30`),
      ]);
      setHabit(recordData.registro);
      setHistory(historyData.historial);
      setHasMore(historyData.hayMas);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    titleRef.current?.focus();
    const close = (event) => {
      if (event.key === "Escape" && !deleting) closeDetail();
    };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
    };
  }, [closeDetail, deleting, status]);

  async function mark() {
    setMarking(true);
    try {
      await api(`/registros/${id}/realizaciones`, { method: "POST" });
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setMarking(false);
    }
  }

  async function loadMore() {
    const data = await api(`/registros/${id}/historial?limite=30&desde=${history.length}`);
    setHistory((current) => [...current, ...data.historial]);
    setHasMore(data.hayMas);
  }

  async function remove() {
    setDeleteState({ busy: true, error: "" });
    try {
      await api(`/registros/${id}`, { method: "DELETE" });
      navigate("/lista", { replace: true, state: { message: "Hábito eliminado correctamente" } });
    } catch (requestError) {
      setDeleteState({ busy: false, error: requestError.message });
    }
  }

  if (status === "loading") return (
    <>
      <div className="detail-backdrop" aria-hidden="true" onMouseDown={closeDetail} />
      <section className="detail-page detail-page--state" role="dialog" aria-modal="true" aria-label="Cargando detalle del hábito">
        <button type="button" className="back-link" onClick={closeDetail}><X size={18} /> Cerrar</button>
        <Loading text="Preparando el detalle…" />
      </section>
    </>
  );

  if (status === "error" || !habit) return (
    <>
      <div className="detail-backdrop" aria-hidden="true" onMouseDown={closeDetail} />
      <section className="detail-page detail-page--state" role="dialog" aria-modal="true" aria-label="Error al cargar el detalle">
        <button type="button" className="back-link" onClick={closeDetail}><X size={18} /> Cerrar</button>
        <Message>{error || "Hábito no encontrado"}</Message>
      </section>
    </>
  );

  return (
    <>
    <div className="detail-backdrop" aria-hidden="true" onMouseDown={() => !deleting && closeDetail()} />
    <article className="detail-page" role="dialog" aria-modal="true" aria-labelledby="habit-detail-title">
      <header className="detail-header">
        <div className="detail-toolbar">
          <button type="button" className="back-link" onClick={closeDetail}><X size={18} /> Cerrar</button>
          <div className="detail-toolbar__actions" aria-label="Administrar hábito">
            <Link className="toolbar-button" to={`/habitos/${habit.id}/editar`}><Pencil size={17} /> Editar</Link>
            <button className="toolbar-button toolbar-button--danger" type="button" onClick={() => setDeleting(true)}><Trash2 size={17} /> Eliminar</button>
          </div>
        </div>
        <div className="detail-header__title">
          <span className={`status-chip status-chip--${habit.estadoHoy}`}>{stateLabel(habit.estadoHoy)}</span>
          <h1 id="habit-detail-title" ref={titleRef} tabIndex="-1">{habit.nombre}</h1>
          <p>{habit.descripcion}</p>
        </div>
        <div className="detail-primary-action">
          <button className="button button--primary" onClick={mark} disabled={!habit.programadoHoy || habit.realizadoHoy || marking}><Check size={19} /> {marking ? "Guardando…" : habit.realizadoHoy ? "Realizado hoy" : "Realizado hoy"}</button>
        </div>
      </header>

      {error && <Message>{error}</Message>}

      <section className="detail-card" aria-labelledby="data-title">
        <h2 id="data-title">Datos del hábito</h2>
        <dl className="detail-list">
          <div><span><UserRound size={19} /></span><dt>Persona</dt><dd>{account.nombre}</dd></div>
          <div><span><Tag size={19} /></span><dt>Categoría</dt><dd>{habit.categoria}</dd></div>
          <div><span><CalendarDays size={19} /></span><dt>Fecha de inicio</dt><dd>{formatDate(habit.fechaInicio)}</dd></div>
          <div><span><CalendarDays size={19} /></span><dt>Programación vigente</dt><dd>{scheduleDays(habit.programacion?.dias)}</dd></div>
          <div><span><Clock3 size={19} /></span><dt>Horario y duración</dt><dd>{scheduleTime(habit.programacion)}</dd></div>
          <div><span><History size={19} /></span><dt>Creado</dt><dd>{formatDateTime(habit.creadoEn)}</dd></div>
          <div><span><Check size={19} /></span><dt>Total realizado</dt><dd>{habit.totalRealizaciones} {habit.totalRealizaciones === 1 ? "día" : "días"}</dd></div>
          <div><span><History size={19} /></span><dt>Última realización</dt><dd>{habit.ultimaRealizacion ? formatDate(habit.ultimaRealizacion) : "Sin realizaciones"}</dd></div>
        </dl>
      </section>

      {habit.cambioProgramado && (
        <section className="pending-card" aria-labelledby="pending-title">
          <h2 id="pending-title">Cambios programados para mañana</h2>
          <p>Aplican desde {formatDate(habit.cambioProgramado.vigenteDesde)}: {scheduleDays(habit.cambioProgramado.dias)} · {scheduleTime(habit.cambioProgramado)}.</p>
        </section>
      )}

      <section className="history-card" aria-labelledby="history-title">
        <header className="section-heading">
          <div><span className="eyebrow">Seguimiento</span><h2 id="history-title">Historial diario</h2></div>
        </header>
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.fecha}>
              <time dateTime={item.fecha}>{formatDate(item.fecha, true)}</time>
              <span className={`history-state history-state--${item.estado}`}>{stateLabel(item.estado)}</span>
            </li>
          ))}
        </ul>
        {hasMore && <button type="button" className="button button--secondary history-more" onClick={loadMore}>Ver más</button>}
      </section>
    </article>
    {deleting && <ConfirmDialog habit={habit} busy={deleteState.busy} error={deleteState.error} onCancel={() => setDeleting(false)} onConfirm={remove} />}
    </>
  );
}
