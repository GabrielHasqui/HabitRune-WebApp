import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import HabitDetailPage from "./pages/HabitDetailPage.jsx";
import HabitFormPage from "./pages/HabitFormPage.jsx";
import HabitsPage from "./pages/HabitsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function ProtectedArea() {
  const { account, checking } = useAuth();
  const location = useLocation();

  if (checking) return <div className="screen-loader" role="status">Cargando HabitRune…</div>;
  if (!account) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
export default function App() {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedArea />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="registro" element={<HabitFormPage />} />
            <Route path="lista" element={<HabitsPage />} />
            <Route path="habitos/:id" element={<HabitDetailPage />} />
            <Route path="habitos/:id/editar" element={<HabitFormPage />} />
            <Route path="cuenta" element={<AccountPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route element={<ProtectedArea />}>
            <Route path="/habitos/:id" element={<HabitDetailPage />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
