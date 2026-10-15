import { ClipboardList, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import HabitCard from "../components/HabitCard.jsx";
import { EmptyState, Loading, Message, PageHeader } from "../components/Ui.jsx";
import { api } from "../services/api.js";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deleteState, setDeleteState] = useState({ busy: false, error: "" });
  const location = useLocation();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await api("/registros");
      setHabits(data.registros);
      setStatus("ready");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const flash = location.state?.message;

  return (
    <>
      <PageHeader title="Mis hábitos" description="Consulta, registra y administra tus hábitos personales." action={<Link className="button button--primary" to="/registro"><Plus size={19} /> Nuevo hábito</Link>} />
      {flash && <Message type="success">{flash} <button className="inline-action" onClick={() => navigate(location.pathname, { replace: true })}>Cerrar</button></Message>}
      {status === "loading" && <Loading text="Consultando tus hábitos…" />}
      {status === "error" && <Message>{error} <button className="inline-action" onClick={load}>Reintentar</button></Message>}
      {status === "ready" && habits.length > 0 && <section className="habit-grid" aria-label="Listado de hábitos">{habits.map((habit) => <HabitCard key={habit.id} habit={habit} onMark={mark} onDelete={setDeleting} />)}</section>}
      {status === "ready" && !habits.length && <EmptyState icon={<ClipboardList size={28} />} title="Todavía no tienes hábitos" description="Crea el primero y selecciona los días en que quieres realizarlo." action={<Link className="button button--primary" to="/registro"><Plus size={19} /> Crear hábito</Link>} />}
      {deleting && <ConfirmDialog habit={deleting} busy={deleteState.busy} error={deleteState.error} onCancel={() => setDeleting(null)} onConfirm={remove} />}
    </>
  );
}
