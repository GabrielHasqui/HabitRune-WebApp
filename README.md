# HabitRune

HabitRune es una aplicación web para registrar y consultar hábitos diarios. Su objetivo es facilitar la organización de rutinas mediante un formulario validado, una API REST y almacenamiento persistente en un archivo JSON.

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
│       ├── components/    # Formulario, tarjetas y estados visuales
│       ├── pages/         # Inicio, registro y listado
│       └── services/      # Peticiones HTTP centralizadas
├── package.json
└── README.md
```

## Requisitos e instalación

Se requiere Node.js 20 o una versión posterior. Desde la raíz del proyecto se instalan todas las dependencias con:

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

Durante el desarrollo, Vite redirige las solicitudes de `/api` hacia el backend. Para utilizar otra dirección se puede definir `VITE_API_URL` antes de iniciar o compilar el frontend.

## API de registros

Las rutas protegidas requieren el encabezado de demostración:

```text
x-account-id: demo-account
```

- `GET /salud`: comprueba que el servicio esté activo.
- `GET /registros`: devuelve los hábitos de la cuenta.
- `POST /registros`: valida y guarda un hábito.

Ejemplo del cuerpo para crear un registro:

```json
{
  "nombre": "Lectura técnica",
  "descripcion": "Leer documentación durante treinta minutos",
  "categoria": "Estudio",
  "fechaInicio": "2026-10-14",
  "dias": [1, 3, 5],
  "horaInicio": "18:00",
  "horaFin": "18:30"
}
```

Una creación correcta responde con estado `201`. Los datos inválidos responden con `400` y errores por campo; una cuenta desconocida responde con `401`. Los registros se conservan en `backend/data/db.json`, incluso después de reiniciar el servidor.

## Verificación

Para ejecutar las pruebas de validación, creación, consulta y persistencia:

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
