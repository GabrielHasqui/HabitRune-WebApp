import { ArrowLeft, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HabitForm from "../components/HabitForm.jsx";
import { Loading, Message, PageHeader } from "../components/Ui.jsx";
import { api } from "../services/api.js";

export default function HabitFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [status, setStatus] = useState(editing ? "loading" : "ready");
  const [error, setError] = useState("");
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!editing) return;
    api(`/registros/${id}`)
      .then((data) => setInitial(data.registro))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setStatus("ready"));
  }, [editing, id]);

  useEffect(() => {
    if (editing) return undefined;

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const previousOverflow = document.body.style.overflow;

    function updateModalState() {
      document.body.style.overflow = desktopQuery.matches ? "hidden" : previousOverflow;
      if (desktopQuery.matches) closeButtonRef.current?.focus();
    }

    function closeWithKeyboard(event) {
      if (event.key === "Escape") navigate(-1);
    }

    updateModalState();
    desktopQuery.addEventListener("change", updateModalState);
    document.addEventListener("keydown", closeWithKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      desktopQuery.removeEventListener("change", updateModalState);
      document.removeEventListener("keydown", closeWithKeyboard);
    };
  }, [editing, navigate]);

  async function save(values) {
    const data = await api(editing ? `/registros/${id}` : "/registros", {
      method: editing ? "PUT" : "POST",
      body: JSON.stringify(values),
    });
    navigate("/lista", { replace: true, state: { message: data.mensaje } });
  }

  const formContent = (
    <>
      {status === "loading" && <Loading text="Cargando el hábito…" />}
      {error && <Message>{error}</Message>}
      {status === "ready" && (!editing || initial) && <HabitForm initial={initial} editing={editing} onSubmit={save} onCancel={() => navigate(-1)} />}
    </>
  );

  if (editing) {
    return (
      <>
        <button type="button" className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Volver</button>
        <PageHeader title="Editar hábito" description="Actualiza la información sin perder el historial registrado." />
        {formContent}
      </>
    );
  }

  return (
    <>
      <div className="create-modal-backdrop" aria-hidden="true" />
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-habit-title">
        <header className="create-modal__header">
          <button type="button" className="back-link create-modal__back" onClick={() => navigate(-1)}><ArrowLeft size={18} /> Volver</button>
          <div>
            <span className="eyebrow">Nuevo hábito</span>
            <h1 id="create-habit-title">Crear hábito</h1>
            <p>Crea el hábito una vez y registra su realización en los días seleccionados.</p>
          </div>
          <button ref={closeButtonRef} type="button" className="icon-button create-modal__close" onClick={() => navigate(-1)} aria-label="Cerrar creación de hábito" title="Cerrar">
            <X size={22} />
          </button>
        </header>
        <div className="create-modal__body">{formContent}</div>
      </section>
    </>
  );
}
