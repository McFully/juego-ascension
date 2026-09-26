# ARQUITECTURA DEL SISTEMA Y DIAGRAMA C4

## 1. CONTEXTO DEL SISTEMA (C4 NIVEL 1)
- **Actor Principal:** Jugador humano único (Single Player Desktop).
- **Sistema Ascension:** Ejecutable autónomo para PC Windows que provee toda la simulación espacial, cálculo de flotas, economía de planetas y diplomacia galáctica.
- **Entorno del Sistema:** 100% desconectado de internet. Lectura y escritura en el sistema de archivos local (`%APPDATA%/Ascension/`).

```
+-------------------------------------------------------------+
|                      JUGADOR HUMANO                         |
+-------------------------------------------------------------+
                               |
                               v Input táctil / teclado / ratón
+-------------------------------------------------------------+
|                      JUEGO ASCENSIÓN                        |
|   (Electron Main + Chromium Renderer + Web Audio API)       |
+-------------------------------------------------------------+
                               |
                               v IPC Seguro (Guardado / Carga)
+-------------------------------------------------------------+
|            SISTEMA DE ARCHIVOS LOCAL (Windows)              |
|        %APPDATA%/Ascension/savegame.json + savegame.bak     |
+-------------------------------------------------------------+
```

## 2. CONTENEDORES (C4 NIVEL 2)
1. **Proceso Principal Electron (`electron/main.cjs`):**
   - Control del ciclo de vida de la ventana de sistema (`BrowserWindow`).
   - Configuración estricta de aislamiento (`contextIsolation: true`, `nodeIntegration: false`).
   - Gestión de persistencia en disco con verificación atómica de suma y copia de seguridad (`.bak`).
2. **Proceso de Renderizado Chromium (`src/main.jsx` & `src/App.jsx`):**
   - Interfaz React 18 acelerada por hardware con Tailwind CSS y Framer Motion.
   - Bucle central de juego (`useGameLoop`) con tick de 1000ms.
   - Despacho de acciones inmutables hacia el reductor maestro (`gameReducer`).
3. **Puente Seguro de Precarga (`electron/preload.cjs`):**
   - Exposición estricta mediante `contextBridge.exposeInMainWorld('electronAPI', ...)`.
   - Métodos expuestos: `saveGame`, `loadGame`, `listSaves`, `exportSave`, `importSave`, `getAppVersion`.

## 3. COMPONENTES DEL RENDERER (C4 NIVEL 3)
- **Capa de Navegación y HUD:** `AppHeader`, `AppSidebar`, `ConsoleHudBar`, `ResourceBar`, `Breadcrumbs`.
- **Capa de Vistas Principales (18 Páginas):** `OverviewPage`, `BuildingsPage`, `ResearchPage`, `ShipyardPage`, `DefensePage`, `FleetPage`, `GalaxyPage`, `DiplomacyPage`, `GovernmentPage`, etc.
- **Capa de Lógica y Reductores:** `src/reducers/` (`economyReducer`, `fleetReducer`, `diplomacyReducer`, `governmentReducer`, `researchReducer`, `systemReducer`).
- **Capa de Fórmulas y Simulación:** `src/utils/formulas/` y `src/combat.js`.

## 4. CÓDIGO Y FLUJO DE DATOS (C4 NIVEL 4)
- Cada evento del usuario o avance temporal despacha una acción tipada: `dispatch({ type: 'TICK' })` o `dispatch({ type: 'START_BUILDING', payload: ... })`.
- El estado fluye de manera unidireccional y se serializa periódicamente hacia el proceso principal.
