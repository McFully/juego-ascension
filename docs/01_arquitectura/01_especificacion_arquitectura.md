# 🏢 BLOQUE 1: ESTRATEGIA, VISIÓN Y ARQUITECTURA MAESTRA

## 01.01 RESUMEN EJECUTIVO Y MODELO DE NEGOCIO

### Visión General del Proyecto
**Ascensión** es un videojuego ejecutable para PC (Windows) de estrategia espacial en tiempo real y simulación 4X para un solo jugador (Single Player). El diseño combina la gestión de recursos de juegos de navegador clásicos (como OGame) con sistemas tácticos avanzados de diseño modular de naves, simulación física de combates por rondas, exploración en mapa estelar por coordenadas, árbol de investigación de alta profundidad, diplomacías con facciones controladas por IA y gestión gubernamental.

### Características Principales y Modelo Tecnológico
1. **Ejecución 100% Offline y Local:** Diseñado para funcionar de manera autosuficiente en el ordenador del usuario sin requerir conexión a servidores externos, bases de datos remotas ni almacenamiento en la nube.
2. **Persistencia Local Segura:** Guardado automático y manual mediante archivos JSON locales respaldados con copias `.bak` en la ruta `%APPDATA%/Ascension/`.
3. **Alto Rendimiento en Escritorio:** Desarrollado sobre un stack de React 18, Vite y Electron 42 con renderizado de interfaz acelerado por hardware y bucles de juego optimizados mediante reductores de estado inmutables.
4. **Diseño Modular y Escalable:** Arquitectura desintegrada en componentes, modales, reductores y motores de simulación independientes que permiten añadir nuevas naves, tecnologías o eventos sin alterar el runtime central.

---

## 01.02 ARQUITECTURA DEL SISTEMA Y DIAGRAMA C4

### Estructura de Capas (C4 Level 2 - Contenedores)
El ejecutable consta de dos procesos principales coordinados por Electron:

1. **Proceso Principal (Main Process - Node.js / Electron):**
   - Archivo base: `electron/main.cjs`
   - Responsabilidades: Gestión del ciclo de vida de la ventana nativa (`BrowserWindow`), configuración de protocolo seguro de precarga (`preload.cjs`), manejo de atajos del sistema y servicios de lectura/escritura en el sistema de archivos local (`fs.promises`).

2. **Proceso de Renderizado (Renderer Process - React / Vite):**
   - Archivos base: `src/main.jsx` y `src/App.jsx`
   - Responsabilidades: Renderizado del árbol de componentes UI, ciclo de ticks del juego (`TICK_MS`), cálculo de estado local mediante `gameReducer` ([`src/core.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/core.jsx)), generación de audio mediante Web Audio API / HTML5 Audio y renderizado de la galaxia.

### Diagrama de Flujo del Runtime

```
+-----------------------------------------------------------------------------------+
|                                 PROCESO PRINCIPAL                                 |
|                               (electron/main.cjs)                                 |
|                                                                                   |
|  +------------------------+      IPC Read/Write Save     +---------------------+  |
|  | Eventos Ventana OS     |<---------------------------->| %APPDATA%/Ascension |  |
|  +------------------------+                              +---------------------+  |
+------------------------------------------^----------------------------------------+
                                           | IPC ContextBridge
+------------------------------------------v----------------------------------------+
|                               PROCESO DE RENDERIZADO                              |
|                                   (src/App.jsx)                                   |
|                                                                                   |
|  +-----------------------+     State Action Dispatch     +---------------------+  |
|  | Bucle de Juego (Tick) |------------------------------>|     gameReducer     |  |
|  +-----------------------+                               |   (src/core.jsx)    |  |
|              |                                           +---------------------+  |
|              v Actualiza Vistas                                     |             |
|  +------------------------------------------------------------------v----------+  |
|  | Páginas / Vistas (OverviewPage, BuildingsPage, GalaxyPage, FleetPage, etc.) |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 01.03 STACK TECNOLÓGICO Y ÁRBOL DE DEPENDENCIAS

### Tecnologías Núcleo (Runtime)
- **Electron (`v42.2.0`):** Runtime de escritorio que encapsula la aplicación en Chromium y Node.js.
- **React (`v18.3.1`):** Librería para la construcción de interfaces mediante componentes orientados a estado.
- **React DOM (`v18.3.1`):** Renderizador del DOM virtual.
- **Framer Motion (`v11.15.0`):** Motor de animación para micro-interacciones, efectos visuales y modales.

### Herramientas de Compilación y Desarrollo
- **Vite (`v6.0.5`):** Empaquetador ultrarrápido y servidor de desarrollo.
- **Tailwind CSS (`v3.4.17`) & PostCSS (`v8.4.49`):** Framework CSS basado en utilidad de estilos.
- **Autoprefixer (`v10.4.20`):** Inserción automática de prefijos CSS para motores Chromium.
- **Electron Builder (`v26.8.1`):** Sistema de empaquetado final para generadores de instaladores NSIS y ejecutables portables de Windows.
- **Vitest (`v4.1.8`):** Framework de pruebas unitarias ultrarrápido.

---

## 01.04 PATRONES DE DISEÑO Y CONVENCIONES

1. **Reducer Pattern (Reductor de Estado Central):** Toda la mutación de estado del juego pasa por `gameReducer` en `src/core.jsx`. La inmutabilidad garantiza predictibilidad y facilita el guardado/carga.
2. **Lazy Loading de Vistas:** Las páginas secundarias (Galaxia, Combate, Misiles, Replay, Navegación, etc.) se cargan diferidas con `React.lazy()` y `Suspense` para acelerar el tiempo de primer arranque.
3. **Bucle de Juego por Ticks:** El estado avanza por intervalos regulares definidos por `TICK_MS` y acelerados por la constante `GAME_SPEED`.
4. **Despliegue Físico y Táctico Separado:** La resolución de combate se desacopla completamente de la interfaz mediante la función pura `simulateCombat` en `src/combat.js`.

---

## 01.05 MAPA FORENSE DE DIRECTORIOS Y ARCHIVOS

```
Juego Ascensión/
├── electron/
│   ├── main.cjs               # Proceso principal de Electron, IPC handlers y persistencia en disco
│   └── preload.cjs            # Script de precarga seguro con contextBridge
├── src/
│   ├── App.jsx                # Componente raíz orquestador, gestión de estado y routing
│   ├── main.jsx               # Punto de entrada de React en el DOM
│   ├── index.css              # Estilos globales, variables HSL, temas y animaciones CSS
│   ├── core.jsx               # Lógica del motor, gameReducer, fórmulas y constantes del juego
│   ├── combat.js              # Motor táctico de simulación de combate por rondas
│   ├── audio.js               # Motor de audio con Web Audio API y reproductor HTML5
│   ├── ui.jsx                 # Biblioteca de componentes atómicos UI comunes
│   ├── assets.jsx             # Gestor de imágenes, assets y componentes de renderizado de imagen seguro
│   ├── styles.js              # Clases y constantes de estilo reutilizables
│   ├── i18n.js                # Sistema de traducción e internacionalización
│   ├── missions.jsx           # Componentes y lógica de visualización de misiones
│   ├── components/            # Overlays y componentes superpuestos (Tutorial, Transmisiones)
│   ├── data/                  # Base de conocimientos estática
│   │   ├── codex.js           # Lore, guía y enciclopedia interna del juego
│   │   ├── expandedContent.js # Datos expandidos de misiones y textos narrativos
│   │   ├── gameConstants.js   # Constantes numéricas, multiplicadores e identificadores
│   │   ├── gameData.js        # Estructuras de naves, construcciones, investigaciones y defensas
│   │   └── missionsData.js    # Definición de misiones principales y secundarias
│   ├── pages/                 # Las 18 páginas principales del juego
│   │   ├── OverviewPage.jsx
│   │   ├── BuildingsPage.jsx
│   │   ├── ResearchPage.jsx
│   │   ├── ShipyardPage.jsx
│   │   ├── DefensePage.jsx
│   │   ├── MissilesPage.jsx
│   │   ├── GalaxyPage.jsx
│   │   ├── FleetPage.jsx
│   │   ├── CombatPage.jsx
│   │   ├── StatsPage.jsx
│   │   ├── MoonPage.jsx
│   │   ├── TechTreePage.jsx
│   │   ├── ShipDesignPage.jsx
│   │   ├── ReplayPage.jsx
│   │   ├── DiplomacyPage.jsx
│   │   ├── GovernmentPage.jsx
│   │   ├── CommunicationsPage.jsx
│   │   └── MissionsPage.jsx
│   ├── reducers/              # Reductores secundarios
│   ├── services/              # Servicios de conexión local
│   └── utils/                 # Funciones auxiliares de formato y cálculo
├── package.json               # Configuración de dependencias y scripts de construcción
├── vite.config.js             # Configuración de compilación Vite
├── tailwind.config.js         # Configuración de colores y utilidades de Tailwind CSS
└── AGENTS.md                  # Reglas maestras del proyecto e instrucciones de desarrollo
```
