import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { DATA_FILE } from "./config.js";

const EMPTY_DATABASE = {
  cuentas: [],
  habitos: [],
  programaciones: [],
  realizaciones: [],
};

let writeQueue = Promise.resolve();

export function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}
function normalizeDatabase(value) {
  return {
    cuentas: Array.isArray(value?.cuentas) ? value.cuentas : [],
    habitos: Array.isArray(value?.habitos) ? value.habitos : [],
    programaciones: Array.isArray(value?.programaciones) ? value.programaciones : [],
    realizaciones: Array.isArray(value?.realizaciones) ? value.realizaciones : [],
  };
}
async function writeDatabase(database) {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  const temporaryFile = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  await rename(temporaryFile, DATA_FILE);
}
export async function readDatabase() {
  try {
    const content = await readFile(DATA_FILE, "utf8");
    return normalizeDatabase(JSON.parse(content));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeDatabase(EMPTY_DATABASE);
    return structuredClone(EMPTY_DATABASE);
  }
}
export function updateDatabase(change) {
  const operation = writeQueue.then(async () => {
    const database = await readDatabase();
    const result = await change(database);
    await writeDatabase(database);
    return result;
  });

  writeQueue = operation.catch(() => undefined);
  return operation;
}
export async function ensureDemoAccount() {
  return updateDatabase((database) => {
    if (database.cuentas.some((account) => account.email === "demo@habitrune.app")) return;
    database.cuentas.push({
      id: randomUUID(),
      nombre: "Usuario Demo",
      email: "demo@habitrune.app",
      passwordHash: hashPassword("Habit123"),
      creadoEn: new Date().toISOString(),
    });
  });
}
