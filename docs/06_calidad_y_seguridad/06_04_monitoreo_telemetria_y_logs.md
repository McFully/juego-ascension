# MONITOREO, TELEMETRÍA Y LOGS

## 1. SISTEMA DE REGISTRO EN CONSOLA NATIVA (`[Ascension] Boot`)
- Registro estructurado del ciclo de vida del juego en la consola del proceso principal:
  - `[Ascension] Boot: inicio`: Inicio de carga de Electron y verificación de rutas de save.
  - `[Ascension] Boot: listo`: Ventana de Chromium montada y estado de partida inicializado.
  - `[Ascension] Boot: error`: Registro detallado ante fallos de persistencia o límites de error.

## 2. POLÍTICA DE PRIVACIDAD Y ZERO-TELEMETRY
- Ningún evento de juego, duración de sesión o registro de errores se transmite hacia servidores remotos. Toda la información de logs permanece en el entorno local del usuario.
