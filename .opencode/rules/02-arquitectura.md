# Arquitectura

- Sin servidores, sin puertos, sin sockets
- `file://` protocol exclusivamente en producción
- Electron IPC para save/load (no `localStorage`)
- `asar: true` (default), `loadFile()` resuelve paths
