import { Eye, EyeOff, Heart, LogIn, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import { FieldError, Message } from "../components/Ui.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { account, authenticate } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (account) return <Navigate to="/" replace />;

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function validate() {
    const next = {};
    if (mode === "register" && form.nombre.trim().length < 2) next.nombre = "Ingresa tu nombre";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Ingresa un correo válido";
    if (!form.password) next.password = "La contraseña es obligatoria";
    if (mode === "register" && form.password.length < 6) next.password = "Usa al menos 6 caracteres";
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;
    setLoading(true);
    try {
      await authenticate(mode, form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      setErrors(error.fields || {});
      setMessage(error.status === 401 ? "Correo o contraseña incorrectos" : error.message || "No se pudo iniciar sesión. Inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  }

  function changeMode() {
    setMode((current) => current === "login" ? "register" : "login");
    setErrors({});
    setMessage("");
    setForm({ nombre: "", email: "", password: "" });
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-labelledby="welcome-title">
        <Brand inverse />
        <div className="pixel-decoration pixel-decoration--one" aria-hidden="true">✦</div>
        <div className="pixel-decoration pixel-decoration--two" aria-hidden="true">◇</div>
        <div className="login-hero__content">
          <Sparkles size={26} aria-hidden="true" />
          <h1 id="welcome-title">Tu próxima aventura empieza con un <em>pequeño hábito.</em></h1>
          <p>Elige tus días, organiza tus hábitos y avanza a tu ritmo. Cada pequeña acción cuenta.</p>
        </div>
        <p className="login-quote"><Heart size={18} fill="currentColor" /> Un nuevo día. Tú eliges el siguiente paso.</p>
      </section>

      <section className="login-form-area">
        <form className="login-card" onSubmit={submit} noValidate>
          <header>
            <span className="eyebrow">Bienvenido a HabitRune</span>
            <h2>{mode === "login" ? "Iniciar sesión" : "Crear una cuenta"}</h2>
            <p>{mode === "login" ? "Retoma tu aventura, un hábito a la vez" : "Empieza a construir una rutina a tu ritmo"}</p>
          </header>

          {message && <Message>{message}</Message>}

          {mode === "register" && (
            <label className="form-field">
              <span>Nombre</span>
              <input type="text" autoComplete="name" value={form.nombre} onChange={(event) => update("nombre", event.target.value)} placeholder="Tu nombre" aria-invalid={Boolean(errors.nombre)} aria-describedby="nombre-error" />
              <FieldError id="nombre-error">{errors.nombre}</FieldError>
            </label>
          )}

          <label className="form-field">
            <span>Correo electrónico</span>
            <input type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="nombre@correo.com" aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
            <FieldError id="email-error">{errors.email}</FieldError>
          </label>

          <label className="form-field">
            <span>Contraseña</span>
            <span className="password-control">
              <input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="Tu contraseña" aria-invalid={Boolean(errors.password)} aria-describedby="password-error" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
            <FieldError id="password-error">{errors.password}</FieldError>
          </label>

          <button type="submit" className="button button--primary button--wide" disabled={loading}>
            <LogIn size={20} /> {loading ? mode === "login" ? "Ingresando…" : "Creando cuenta…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
          </button>

          <p className="login-switch">
            {mode === "login" ? "¿Aún no tienes una cuenta?" : "¿Ya tienes una cuenta?"}
            <button type="button" onClick={changeMode} disabled={loading}>{mode === "login" ? "Crear una cuenta" : "Iniciar sesión"}</button>
          </p>
        </form>
      </section>
    </main>
  );
}

