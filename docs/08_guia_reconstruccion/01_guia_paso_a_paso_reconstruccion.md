# 🛠️ BLOQUE 8: GUÍA QUIRÚRGICA DE RECONSTRUCCIÓN PASO A PASO

## 08.01 GUÍA DE MONTAJE Y SECUENCIA CRONOLÓGICA DE RECONSTRUCCIÓN

Esta guía permite reconstruir el ejecutable completo de **Ascensión** desde cero (carpeta vacía) en 7 pasos metódicos:

---

### Paso 1: Configuración e Inicialización del Entorno
1. Crear una carpeta vacía e inicializar el repositorio y proyecto Node:
   ```bash
   mkdir Ascension
   cd Ascension
   npm init -y
   ```
2. Instalar dependencias de producción y desarrollo:
   ```bash
   npm install react react-dom framer-motion
   npm install -D vite @vitejs/plugin-react electron electron-builder tailwindcss postcss autoprefixer vitest
   ```
3. Copiar las configuraciones base de `package.json`, `vite.config.js` y `tailwind.config.js`.

---

### Paso 2: Motor Lógico Central (`src/core.jsx` y `src/combat.js`)
1. Implementar las constantes estáticas de datos (`BUILDINGS`, `RESEARCH`, `SHIPS`, `DEFENSES`, `SHIP_CHASSIS`) en `src/data/gameData.js`.
2. Escribir las funciones puras de cálculo de producción, costes y tiempos (`calcProduction`, `buildingCost`, `calcFlightTime`) en `src/core.jsx`.
3. Crear el reductor de estado central `gameReducer` para manejar las acciones del ciclo de ticks y mutaciones de edificios.
4. Implementar el motor de combate por rondas en `src/combat.js`.

---

### Paso 3: Capa de Persistencia Electron (`electron/main.cjs` & `electron/preload.cjs`)
1. Configurar la ventana principal de Electron con `contextIsolation: true`.
2. Implementar las llamadas IPC para escritura y lectura segura de partidas en disco local (`%APPDATA%/Ascension/`).
3. Crear las funciones de respaldo automático `.bak`.

---

### Paso 4: Sistema de Diseño e Interfaz Atómica (`src/index.css` & `src/ui.jsx`)
1. Configurar las variables CSS HSL de colores espaciales, animaciones de estrellas y fuentes tipográficas.
2. Construir la biblioteca de componentes atómicos: `ResourceBar`, `ProgressBar`, `RedAlertOverlay`, `ItemCard` y `StarField`.

---

### Paso 5: Construcción de Páginas del Juego (`src/pages/`)
1. Implementar cada una de las 18 vistas principales en `src/pages/` conectando sus acciones al `gameReducer`.

---

### Paso 6: Componente Raíz y Orquestación (`src/App.jsx`)
1. Integrar el bucle de ticks (`setInterval` con `TICK_MS`).
2. Configurar la navegación principal con `React.lazy()` y `Suspense`.
3. Añadir la pantalla de carga defensiva con watchdog de 10 segundos (`LoadingScreen`).

---

### Paso 7: Validación, Pruebas y Compilación Final
1. Ejecutar las pruebas unitarias: `npm run test`.
2. Probar la aplicación en modo desarrollo local: `npm run dev:electron`.
3. Generar el ejecutable de distribución: `npm run dist`.
