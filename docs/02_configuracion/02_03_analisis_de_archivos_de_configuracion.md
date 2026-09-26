# ANÁLISIS DE ARCHIVOS DE CONFIGURACIÓN

## 1. `vite.config.js` (CONFIGURACIÓN DE EMPAQUETADOR)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // CRÍTICO: Rutas relativas para que los assets carguen correctamente desde el protocolo file:// de Electron
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext'
  }
})
```

## 2. `tailwind.config.js` (CONFIGURACIÓN DEL SISTEMA DE DISEÑO)
- Configura el escaneo de clases en `./index.html` y `./src/**/*.{js,ts,jsx,tsx}`.
- Extiende la paleta de colores con acentos cósmicos espaciales (`cyan`, `slate`, `amber`, `emerald`, `rose`).
- Define transiciones de microinteracción táctiles para paneles y HUD militar.

## 3. `electron/main.cjs` (CONFIGURACIÓN DE PROCESO PRINCIPAL)
- Define la resolución nativa de ventana por defecto (1440x900 con mínimo de 1024x768).
- Aplica `contextIsolation: true` y deshabilita `nodeIntegration: false` para máxima seguridad frente a inyecciones de script.
