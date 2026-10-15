const TOKEN_KEY = "habitrune:token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({ mensaje: "Respuesta inválida del servidor" }));

  if (!response.ok) {
    const error = new Error(data.mensaje || "No se pudo completar la operación");
    error.status = response.status;
    error.fields = data.errores || {};
    throw error;
  }

  return data;
}
