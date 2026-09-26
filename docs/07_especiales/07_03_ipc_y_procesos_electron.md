# IPC Y PROCESOS ELECTRON (DESKTOP)

## 1. ARQUITECTURA MULTI-PROCESO DE ELECTRON
- **Proceso Main (`electron/main.cjs`):** Ejecutado en Node.js, interactúa directamente con el sistema de archivos de Windows y administra las ventanas nativas.
- **Proceso Renderer (`src/App.jsx`):** Ejecutado dentro de la instancia de Chromium aislada.
- **Preload Script (`electron/preload.cjs`):** Actúa como aduana de seguridad, exponiendo una API fuertemente tipada y sanitizada hacia `window.electronAPI`.

## 2. LISTADO COMPLETO DE CANALES IPC REGISTRADOS
1. `ipcMain.handle('save-game', ...)`
2. `ipcMain.handle('load-game', ...)`
3. `ipcMain.handle('list-saves', ...)`
4. `ipcMain.handle('export-save', ...)`
5. `ipcMain.handle('import-save', ...)`
6. `ipcMain.handle('get-app-version', ...)`
