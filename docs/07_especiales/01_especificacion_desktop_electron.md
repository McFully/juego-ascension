# 🎥 BLOQUE 7: ESPECIFICACIONES ESPECIALIZADAS DE DESKTOP Y IPC (`electron/main.cjs`)

## 07.01 COMUNICACIÓN IPC Y SEGURIDAD EN ELECTRON

### Configuración de la Ventana Principal (`BrowserWindow`)
```javascript
const mainWindow = new BrowserWindow({
  width: 1400,
  height: 900,
  minWidth: 1024,
  minHeight: 768,
  backgroundColor: '#05070f',
  icon: path.join(__dirname, '../build/icon.ico'),
  webPreferences: {
    preload: path.join(__dirname, 'preload.cjs'),
    contextIsolation: true,
    nodeIntegration: false,
    webSecurity: true
  }
});
```

### Canales IPC de Comunicación Registrados:

1. **`save-game` (Canal de Guardado):**
   - Recibe la cadena JSON serializada de la partida.
   - Realiza la escritura asíncrona en `%APPDATA%/Ascension/ascension_save.json`.
   - Genera backup `.bak` previo.

2. **`load-game` (Canal de Carga):**
   - Lee el contenido del archivo de guardado local.
   - Devuelve la partida deserializada o el objeto inicial si no se encuentra partida previa.

3. **`get-app-version` (Consulta de Versión):**
   - Devuelve la versión actual configurada en `package.json` (ej. `1.1.27`).
