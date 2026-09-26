# AUDITORÍA DE SEGURIDAD OWASP Y PERMISOS

## 1. SEGURIDAD DEL PUENTE ELECTRON IPC
- **Aislamiento de Contexto (`contextIsolation: true`):** Se previene que el código en ejecución en el DOM de Chromium tenga acceso directo a las APIs internas de Node.js (`fs`, `child_process`, `path`).
- **Desactivación de Node Integration (`nodeIntegration: false`):** Evita que inyecciones de script puedan invocar módulos nativos.
- **Validación Estricta de Carga de Partidas (`saveValidation.js`):** Toda partida cargada por IPC o importada por el usuario es validada verificando:
  1. Versión válida (versión 3 activa; versión 2 admitida como migrable).
  2. Presencia obligatoria de `playerName`, array de `planets` y bandera `gameStarted`.
  3. Sanitización de nombres de planetas y flotas para prevenir XSS dentro de la UI.

## 2. PREVENCIÓN DE INYECCIONES Y VULNERABILIDADES
- No existen llamadas a `eval()` ni ejecución dinámica de código arbitrario.
- Las consultas y mutaciones de estado se procesan mediante funciones inmutables y puras.
