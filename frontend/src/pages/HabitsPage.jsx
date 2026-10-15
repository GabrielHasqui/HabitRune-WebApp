import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import HabitCard from '../components/HabitCard.jsx';
import LoadingState from '../components/LoadingState.jsx';

const API_URL = 'http://localhost:4000';

export default function HabitsPage() {
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecords() {
      setStatus('loading');
      setError('');

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
        setError(
          requestError instanceof TypeError
            ? 'No fue posible conectar con la API. Comprueba que el backend esté iniciado.'
            : requestError.message,
        );
        setStatus('error');
      }
    }

    loadRecords();
    return () => controller.abort();
  }, [requestKey]);

  function retry() {
    setRequestKey((current) => current + 1);
  }

  return (
    <section className="habits-page">
      <p className="eyebrow">Seguimiento</p>
      <h1>Mis hábitos</h1>
      <p>
        Consulta las actividades que forman parte de tu rutina diaria.
      </p>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={error} onRetry={retry} />}
      {status === 'ready' && !records.length && <EmptyState />}
      {status === 'ready' && records.length > 0 && (
        <div className="habits-grid">
          {records.map((record) => (
            <HabitCard key={record.id} habit={record} />
          ))}
        </div>
      )}
    </section>
  );
}
