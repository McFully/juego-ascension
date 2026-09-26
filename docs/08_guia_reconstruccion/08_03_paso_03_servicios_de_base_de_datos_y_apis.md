# PASO 03: SERVICIOS DE PERSISTENCIA Y APIS

## 1. IMPLEMENTACIÓN DEL PUENTE ELECTRON IPC
1. Crear `electron/main.cjs` configurando la ventana principal (`BrowserWindow`) con aislamiento de contexto y carga de `preload.cjs`.
2. Implementar los manejadores IPC (`save-game`, `load-game`, `list-saves`, `export-save`, `import-save`, `get-app-version`).
3. Crear `electron/preload.cjs` exponiendo `window.electronAPI` de forma estricta y sanitizada.
4. Implementar la rutina de copia de seguridad atómica (`.bak`) antes de la sobreescritura de partidas.
