# HabitRune

HabitRune es una aplicación web para crear, organizar y completar hábitos diarios. Incluye autenticación, rutas privadas, resumen del día, historial, edición y almacenamiento persistente en JSON.

## Tecnologías

- React, React Router y Vite para la interfaz.
- Node.js y Express para la API.
- JSON para la persistencia local.
- Node Test Runner para las pruebas funcionales.

## Estructura del proyecto

```text
HabitRune/
├── backend/
│   ├── data/db.json       # Datos persistentes
│   ├── src/               # API, validación y almacenamiento
│   └── test/              # Pruebas funcionales
├── frontend/
│   └── src/
│       ├── components/    # Formularios, tarjetas, diálogos y estados
│       ├── context/       # Sesión y autenticación
│       ├── pages/         # Login, inicio, hábitos, detalle y cuenta
│       └── services/      # Peticiones HTTP centralizadas
├── package.json
└── README.md
```

## Instalación

Desde la raíz del proyecto se instalan todas las dependencias con:

```bash
npm run install:all
```

## Ejecución

Para iniciar el frontend y el backend al mismo tiempo:

```bash
npm run dev
```

La interfaz queda disponible en `http://localhost:5173` y la API en `http://localhost:4000`.

También es posible iniciar cada parte por separado:

```bash
npm run dev --prefix backend
npm run dev --prefix frontend
```

Durante el desarrollo, Vite redirige las solicitudes de `/api` hacia el backend.

## Acceso de demostración

La aplicación permite crear cuentas nuevas. También incluye una cuenta preparada para la demostración:

```text
Correo: demo@habitrune.app
Contraseña: Habit123
```

## API

El frontend conserva el token de sesión en el navegador y lo envía como `Authorization: Bearer <token>` en las rutas protegidas.

- `GET /salud`: comprueba que el servicio esté activo.
- `POST /auth/register` y `POST /auth/login`: crean una cuenta o inician sesión.
- `GET /auth/session` y `DELETE /auth/session`: consultan o cierran la sesión.
- `GET /registros` y `POST /registros`: consultan o crean hábitos.
- `GET`, `PUT` y `DELETE /registros/:id`: muestran, editan o eliminan un hábito.
- `POST /registros/:id/realizaciones`: marca el hábito como realizado hoy.
- `GET /registros/:id/historial`: devuelve su historial diario.
- `GET /resumen-hoy`: genera el resumen de la pantalla principal.
- `GET /cuenta`: devuelve el perfil, totales e historial filtrable.

Los datos inválidos responden con `400` y errores por campo; una sesión desconocida responde con `401`. Las cuentas, hábitos, programaciones y realizaciones se conservan en `backend/data/db.json` después de reiniciar el servidor.

## Verificación

Para ejecutar las pruebas de autenticación, validación, creación, consulta, realización y persistencia:

```bash
npm test
```

Para generar la versión de producción del frontend:

```bash
npm run build
```

## Integrantes y flujo de trabajo

- Karla Santillán: preparación del proyecto, estructura, navegación y componentes iniciales.
- Gabriel Hasqui: construcción del backend, validación y persistencia en JSON.
- Wilmer Espinoza: consulta de registros y estados visuales del listado.
- Leo Moyota: integración HTTP, pruebas funcionales y documentación final.

El trabajo se organiza en las ramas `karla`, `gabriel`, `wilmer` y `leo`. Cada aporte se integra mediante un Pull Request y, después de aprobarlo, todas las ramas se actualizan desde `main` para conservar el mismo punto de partida.
