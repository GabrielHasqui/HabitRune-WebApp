# HabitRune

HabitRune es una aplicación web para organizar y consultar hábitos diarios.

El proyecto se desarrollará en equipo con React para el frontend, Node.js y Express para el backend, y un archivo JSON para almacenar la información.

## Estructura inicial

```text
HabitRune/
├── frontend/        # Interfaz creada con React y Vite
├── backend/         # API preparada con Node.js y Express
├── package.json
└── README.md
```

Cada integrante trabajará en una rama independiente para mantener un historial claro de sus aportes.

## Instalación y ejecución

Desde la carpeta principal se instalan todas las dependencias con:

```bash
npm run install:all
```

Para iniciar el frontend y el backend al mismo tiempo:

```bash
npm run dev
```

También se pueden ejecutar por separado:

```bash
npm run dev --prefix frontend
npm run dev --prefix backend
```

El frontend utiliza por defecto `http://localhost:5173`. La API quedará disponible en `http://localhost:3000` cuando se implemente el servidor.

## Flujo de trabajo

Las contribuciones se organizan en las ramas `karla`, `gabriel`, `wilmer` y `leo`. Cada cambio se confirma con un mensaje breve que describe el avance realizado antes de integrarlo en `main`.
