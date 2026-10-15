import { ArrowRight, CheckCircle2, ClipboardList, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HabitCard from "../components/HabitCard.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { EmptyState, Loading, Message, PageHeader } from "../components/Ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { formatDate } from "../utils/format.js";

export default function HomePage() {
  const { account } = useAuth();
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });

  const load = useCallback(async () => {
    setStatus("loading");
    setError("");
    try {
      setSummary(await api("/resumen-hoy"));
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [load]);

  async function mark(id) {
    await api(`/registros/${id}/realizaciones`, { method: "POST" });
    await load();
  }

  async function remove() {
    setDeleteState({ busy: true, error: "" });
    try {
      await api(`/registros/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
    } catch (requestError) {
      setDeleteState({ busy: false, error: requestError.message });
    }
  }

  const allDone = summary?.total > 0 && summary?.pendientes === 0;

  return (
    <>
      <PageHeader
        title={`Hola, ${account.nombre.split(" ")[0]}`}
        description={summary?.fecha ? formatDate(summary.fecha, true) : "Organiza tu aventura de hoy"}
        action={<Link className="button button--primary" to="/registro"><Plus size={19} /> Nuevo hábito</Link>}
      />

      {status === "loading" && <Loading text="Preparando tu día…" />}
      {status === "error" && <Message>{error} <button className="inline-action" onClick={load}>Reintentar</button></Message>}

      {status === "ready" && (
        <>
          <section className="summary-card" aria-labelledby="summary-title">
            <div className="summary-card__icon"><CheckCircle2 size={26} /></div>
            <div className="summary-card__content">
              <span className="eyebrow">Resumen de hoy</span>
              <h2 id="summary-title">{summary.realizados} de {summary.total} hábitos realizados hoy</h2>
              <p>{allDone ? "¡Completaste tus hábitos de hoy!" : `Pendientes: ${summary.pendientes}`}</p>
            </div>
            <dl className="summary-numbers">
              <div><dt>Total</dt><dd>{summary.total}</dd></div>
              <div><dt>Realizados</dt><dd>{summary.realizados}</dd></div>
              <div><dt>Pendientes</dt><dd>{summary.pendientes}</dd></div>
            </dl>
          </section>

          <section className="section-block" aria-labelledby="today-title">
            <header className="section-heading">
              <div>
                <span className="eyebrow">Programación</span>
                <h2 id="today-title">Tus hábitos de hoy</h2>
              </div>
              <Link className="text-link" to="/lista">Ver todos <ArrowRight size={17} /></Link>
            </header>

            {summary.registros.length ? (
              <div className="habit-grid">
                {summary.registros.map((habit) => <HabitCard key={habit.id} habit={habit} onMark={mark} onDelete={setDeleting} />)}
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardList size={28} />}
                title={summary.habitosCreados ? "No tienes hábitos programados para hoy" : "Crea tu primer hábito para comenzar"}
                description="Elige los días que quieres practicarlo y HabitRune lo mostrará aquí cuando corresponda."
                action={<Link className="button button--primary" to="/registro"><Plus size={19} /> Crear hábito</Link>}
              />
            )}
          </section>
        </>
      )}

      {deleting && <ConfirmDialog habit={deleting} busy={deleteState.busy} error={deleteState.error} onCancel={() => setDeleting(null)} onConfirm={remove} />}
    </>
  );
}
