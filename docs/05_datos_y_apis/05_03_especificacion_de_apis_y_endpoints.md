# ESPECIFICACIÓN DE APIS Y ENDPOINTS

## 1. CANAL IPC DEL PUENTE ELECTRON (`window.electronAPI`)
En lugar de endpoints HTTP remotos, la comunicación entre la vista (Renderer) y el sistema operativo (Main) se efectúa mediante canales IPC seguros:

| Canal IPC | Dirección | Argumentos | Retorno Esperado | Función |
| :--- | :--- | :--- | :--- | :--- |
| `save-game` | Renderer -> Main | `{ data: GameState }` | `{ success: boolean, error?: string }` | Guarda la partida de forma atómica en disco |
| `load-game` | Renderer -> Main | Ninguno | `{ success: boolean, data?: GameState }` | Carga el último guardado validado |
| `list-saves` | Renderer -> Main | Ninguno | `string[]` | Lista los archivos de guardado disponibles |
| `export-save` | Renderer -> Main | Ninguno | `{ success: boolean, path?: string }` | Abre el cuadro de diálogo del OS para exportar |
| `import-save` | Renderer -> Main | Ninguno | `{ success: boolean, data?: GameState }` | Abre cuadro de diálogo para importar archivo .json |
| `get-app-version` | Renderer -> Main | Ninguno | `string` (ej. `"1.1.47"`) | Consulta la versión real del paquete |
