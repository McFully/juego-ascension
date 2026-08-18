# Estabilidad del Executable

- `ErrorBoundary` obligatorio en raíz del render
- `LoadingScreen` con watchdog de 10s (botón Reintentar si excede)
- Bootstrap con logging: `[Ascensión] Boot: inicio/listo/error`
- Validación de save antes de cargar (`version === 2`, `playerName`, `planets` array)
- Backup automático antes de sobrescribir save (`.bak`)
