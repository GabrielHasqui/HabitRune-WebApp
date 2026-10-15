import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "habitrune-test-"));
process.env.DATA_FILE = path.join(temporaryDirectory, "db.json");
process.env.APP_TIME_ZONE = "America/Guayaquil";

const { app } = await import("../src/server.js");
const { ensureDemoAccount } = await import("../src/store.js");
const { todayKey } = await import("../src/date.js");

await ensureDemoAccount();
const server = app.listen(0);
await new Promise((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

async function request(route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, options);
  const data = response.status === 204 ? null : await response.json();
  return { response, data };
}

let token;
let habitId;

test("la API responde y permite iniciar sesión", async () => {
  const health = await request("/salud");
  assert.equal(health.response.status, 200);

  const login = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@habitrune.app", password: "Habit123" }),
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.cuenta.nombre, "Usuario Demo");
  token = login.data.token;
});
test("rechaza registros inválidos en el servidor", async () => {
  const result = await request("/registros", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ descripcion: "x", fechaInicio: "", categoria: "", dias: [] }),
  });
  assert.equal(result.response.status, 400);
  assert.ok(result.data.errores.nombre);
  assert.ok(result.data.errores.descripcion);
  assert.ok(result.data.errores.dias);
  assert.ok(result.data.errores.horaInicio);
  assert.ok(result.data.errores.horaFin);
});
test("crea, consulta y persiste un hábito", async () => {
  const created = await request("/registros", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      nombre: "Lectura diaria",
      descripcion: "Leer documentación durante veinte minutos",
      fechaInicio: todayKey(),
      categoria: "Estudio",
      dias: [1, 2, 3, 4, 5, 6, 7],
      horaInicio: "19:00",
      horaFin: "19:20",
    }),
  });
  assert.equal(created.response.status, 201);
  habitId = created.data.registro.id;

  const list = await request("/registros", { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(list.response.status, 200);
  assert.equal(list.data.registros.length, 1);

  const stored = JSON.parse(await readFile(process.env.DATA_FILE, "utf8"));
  assert.equal(stored.habitos.length, 1);
  assert.equal(stored.habitos[0].nombre, "Lectura diaria");
  assert.equal(stored.programaciones.length, 1);
});
test("Realizado hoy es idempotente y actualiza el resumen", async () => {
  const headers = { Authorization: `Bearer ${token}` };
  const first = await request(`/registros/${habitId}/realizaciones`, { method: "POST", headers });
  const second = await request(`/registros/${habitId}/realizaciones`, { method: "POST", headers });
  assert.equal(first.response.status, 201);
  assert.equal(second.response.status, 201);
  assert.equal(first.data.realizacion.id, second.data.realizacion.id);

  const summary = await request("/resumen-hoy", { headers });
  assert.equal(summary.data.total, 1);
  assert.equal(summary.data.realizados, 1);
  assert.equal(summary.data.pendientes, 0);
});
test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(temporaryDirectory, { recursive: true, force: true });
});
