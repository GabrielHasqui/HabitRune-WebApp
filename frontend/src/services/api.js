const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const DEMO_ACCOUNT_ID = 'demo-account';

export async function api(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'x-account-id': DEMO_ACCOUNT_ID,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No fue posible conectar con la API de HabitRune.');
  }

  const data = await response.json().catch(() => ({
    mensaje: 'La API devolvió una respuesta que no se pudo interpretar.',
  }));

  if (!response.ok) {
    const requestError = new Error(data.mensaje || 'No se pudo completar la solicitud.');
    requestError.status = response.status;
    requestError.fields = data.errores || {};
    throw requestError;
  }

  return data;
}

export function getHabits(options = {}) {
  return api('/registros', options);
}

export function createHabit(values) {
  return api('/registros', {
    method: 'POST',
    body: JSON.stringify(values),
  });
}
