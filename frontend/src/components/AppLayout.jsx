import { ClipboardList, House, LogOut, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Brand from "./Brand.jsx";

const navigation = [
  { to: "/", label: "Inicio", icon: House, end: true },
  { to: "/lista", label: "Hábitos", icon: ClipboardList },
  { to: "/cuenta", label: "Cuenta", icon: UserRound },
];

function Navigation({ mobile = false }) {
  return (
    <nav className={mobile ? "mobile-nav" : "main-nav"} aria-label="Navegación principal">
      {navigation.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
          <span className="nav-link__icon"><Icon size={21} /></span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
export default function AppLayout() {
  const { account, logout } = useAuth();
  const initials = account.nombre.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-account">
          <span className="avatar" aria-hidden="true">{initials}</span>
          <span className="sidebar-account__text">
            <strong>{account.nombre}</strong>
            <small>{account.email}</small>
          </span>
          <button type="button" className="icon-button" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <header className="tablet-header">
        <Brand compact />
        <Navigation />
        <button type="button" className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut size={20} /></button>
      </header>

      <header className="mobile-header">
        <Brand compact />
        <button type="button" className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut size={20} /></button>
      </header>

      <main id="main-content" className="page-content">
        <Outlet />
      </main>

      <Navigation mobile />
    </div>
  );
}
