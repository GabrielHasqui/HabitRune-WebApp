import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken, saveToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api("/auth/session")
      .then((data) => setAccount(data.cuenta))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  async function authenticate(mode, values) {
    const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
    const data = await api(endpoint, { method: "POST", body: JSON.stringify(values) });
    saveToken(data.token);
    setAccount(data.cuenta);
  }

  async function logout() {
    try {
      await api("/auth/session", { method: "DELETE" });
    } finally {
      clearToken();
      setAccount(null);
    }
  }

  const value = useMemo(() => ({ account, checking, authenticate, logout }), [account, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

