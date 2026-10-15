import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:4000';

export default function HabitsPage() {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecords() {
      try {
        const response = await fetch(`${API_URL}/registros`, {
          headers: { 'x-account-id': 'demo-account' },
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.mensaje || 'No se pudieron consultar los hábitos.');
        }

        setRecords(data.registros);
        setStatus('ready');
      } catch (requestError) {
        if (requestError.name === 'AbortError') return;
        setError(requestError.message);
        setStatus('error');
      }
    }

    loadRecords();
    return () => controller.abort();
  }, []);

  return (
    <section className="habits-page">
      <p className="eyebrow">Seguimiento</p>
      <h1>Mis hábitos</h1>
      <p>
        Consulta las actividades que forman parte de tu rutina diaria.
      </p>

      {status === 'loading' && <p>Consultando hábitos…</p>}
      {status === 'error' && <p>{error}</p>}
      {status === 'ready' && !records.length && <p>No existen hábitos registrados.</p>}
      {status === 'ready' && records.length > 0 && (
        <ul className="habits-list">
          {records.map((record) => (
            <li key={record.id}>
              <strong>{record.nombre}</strong>
              <span>{record.descripcion}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
