import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const testDirectory = await mkdtemp(path.join(tmpdir(), 'habitrune-api-'));
const dataFile = path.join(testDirectory, 'db.json');
process.env.DATA_FILE = dataFile;

const { createApp } = await import('../src/server.js');

const initialDatabase = {
  cuentas: [{ id: 'demo-account', nombre: 'Usuario Demo' }],
  habitos: [],
  programaciones: [],
  realizaciones: [],
};

async function resetDatabase() {
  await writeFile(dataFile, `${JSON.stringify(initialDatabase, null, 2)}\n`, 'utf8');
}

async function withServer(callback) {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function requestOptions(body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-account-id': 'demo-account',
    },
    body: JSON.stringify(body),
  };
}

test('la API valida, registra, consulta y conserva los hábitos', async (context) => {
  await resetDatabase();

  await context.test('rechaza sesiones y datos inválidos', async () => {
    await withServer(async (baseUrl) => {
      const unauthorizedResponse = await fetch(`${baseUrl}/registros`);
      assert.equal(unauthorizedResponse.status, 401);

      const invalidResponse = await fetch(
        `${baseUrl}/registros`,
        requestOptions({ nombre: 'x' }),
      );
      const invalidData = await invalidResponse.json();

      assert.equal(invalidResponse.status, 400);
      assert.equal(invalidData.mensaje, 'Revisa los datos enviados');
      assert.ok(invalidData.errores.nombre);
      assert.ok(invalidData.errores.dias);
    });
  });

  let recordId;

  await context.test('registra un hábito válido con identificadores únicos', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/registros`, requestOptions({
        nombre: 'Lectura técnica',
        descripcion: 'Leer documentación durante treinta minutos',
        categoria: 'Estudio',
        fechaInicio: '2026-10-14',
        dias: [1, 3, 5],
        horaInicio: '18:00',
        horaFin: '18:30',
      }));
      const data = await response.json();

      assert.equal(response.status, 201);
      assert.equal(data.mensaje, 'Hábito creado correctamente');
      assert.match(data.registro.id, /^[0-9a-f-]{36}$/i);
      assert.match(data.registro.programacion.id, /^[0-9a-f-]{36}$/i);
      recordId = data.registro.id;
    });
  });

  await context.test('mantiene el registro después de reiniciar el servidor', async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/registros`, {
        headers: { 'x-account-id': 'demo-account' },
      });
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.registros.length, 1);
      assert.equal(data.registros[0].id, recordId);
      assert.deepEqual(data.registros[0].programacion.dias, [1, 3, 5]);
    });
  });
});

test.after(async () => {
  await rm(testDirectory, { recursive: true, force: true });
});
