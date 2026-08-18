# 🔮 Ascensión - Auditoría de Código y Propuestas de Futuro (v1.0.39+)

Este documento resume la auditoría de seguridad, estabilidad y rendimiento realizada sobre el ecosistema de **Ascensión**, así como una lista de 20 propuestas de alto nivel para dotar al juego de una experiencia premium y Triple A.

---

## 🔍 1. REPORTE DE AUDITORÍA TÉCNICA

### 🚨 Fallos Críticos (Prioridad de Reparación: Alta)

#### A. Handler de IPC Inexistente para `saveGameNamed`
* **Ubicación:** `electron/preload.cjs` (Línea 17) y `src/App.jsx` (Líneas 1660, 2119)
* **Problema:** En el bridge de Electron (`preload.cjs`) se expone el método `saveGameNamed` invocando el canal `'save-game-named'`. Sin embargo, en el hilo principal (`electron/main.cjs`) **no se ha registrado el handler asíncrono** correspondiente (`ipcMain.handle('save-game-named', ...)`). Solo se registró su variante síncrona `save-game-named-sync`.
* **Impacto:** Los auto-guardados asíncronos cada 30 segundos y el guardado manual asíncrono desde el menú de ajustes fallan con un error crítico silencioso (`Error: No handler registered for save-game-named`), imposibilitando el guardado asíncrono de la partida activa.

#### B. Bucle Síncrono de Colisión de Slugs (Bloqueo del Hilo Principal)
* **Ubicación:** `electron/main.cjs` (Líneas 457-463)
* **Problema:** Al resolver colisiones de nombres de partidas con el mismo slug de guardado (por ejemplo, "Aritz" y "Arítz"), el bucle síncrono comprueba de forma fija la ruta `savePath` en lugar del slug modificado `finalSlug`:
  ```javascript
  while (fs.existsSync(savePath) && counter < 1000) { ... }
  ```
* **Impacto:** Si hay una colisión y los nombres de jugador no son exactamente iguales, el bucle itera las 1000 veces completas realizando lecturas y deserializaciones de archivo de forma síncrona en el hilo principal de Node, congelando momentáneamente la interfaz gráfica y escribiendo siempre la partida con sufijo `-999`.

#### C. Alteración del Estado Activo y Desincronización del Replay
* **Ubicación:** `src/pages/ReplayPage.jsx` y `src/App.jsx` (Línea 1552)
* **Problema:** El reproductor de repeticiones despacha los eventos históricos directamente sobre el almacén de estado (`dispatch`) principal del jugador activo, sin pausar el TICK de simulación global y sin restaurar un snapshot inicial del estado del jugador al salir.
* **Impacto:**
  1. Reproducir un replay corrompe y sobrescribe permanentemente el estado actual de la partida activa del usuario.
  2. Los ticks normales de producción ocurren durante la repetición, desincronizando las matemáticas del replay.

---

### ⚠️ Inconsistencias y Código Muerto

#### A. Handlers de Guardado Único en Desuso (Legacy)
* **Ubicación:** `electron/main.cjs` (Líneas 229, 252, 336) y `electron/preload.cjs`
* **Problema:** Los handlers para gestionar el guardado tradicional (`save-game`, `load-game`, `delete-save`) siguen activos y escribiendo en `ascension_save_v2.json`, pero el frontend (`App.jsx`) ya utiliza exclusivamente el sistema multipartida basado en slugs.
* **Impacto:** Duplicidad innecesaria de API y código muerto.

#### B. Watchdog de Arranque sin Cancelación
* **Ubicación:** `src/App.jsx` (Línea 1458)
* **Problema:** El watchdog de 10s de la pantalla de carga no se invalida inmediatamente tras un arranque rápido y exitoso del juego.

---

## 🚀 2. PROPUESTAS TRIPLE A (Wow Factor & Modos de Juego)

### 🎮 Sistemas y Utilidades Premium

1. **Simulador de Rutas de Tránsito Holográfico:** Mapa táctico interactivo 3D CSS Canvas que dibuja líneas vectoriales resplandecientes entre planetas con flujos de partículas para representar transferencias y flotas.
2. **Terminal de Red Interestelar:** Una consola de comandos ficticia integrada al estilo cyberpunk donde el jugador puede escribir comandos reales para consultar bases de datos y encriptar logs alienígenas.
3. **Cámara de Diseño de Naves Estilo Blueprint:** Vista esquemática técnica interactiva en `ShipDesignPage` con zonas iluminadas reactivas al cursor y sonido de escáner sintético.
4. **Log de Eventos Histórico "Caja Negra":** Registro narrativo generado automáticamente sobre los logros y batallas destacadas de la civilización espacial del jugador, exportable a un archivo local de texto estilizado.
5. **Panel de Gráficas de Rendimiento Financiero:** Gráficas vectoriales fluidas en tiempo real en la sección de estadísticas para analizar la producción de recursos de los últimos 100 ticks.
6. **Sintetizador Dinámico de Clima y Frecuencias Cósmicas:** Banda sonora generativa en `audio.js` que cambia su tono y osciladores en base a los biomas de los planetas y los reactores construidos.
7. **Base de Datos Holográfica "Galactapedia":** Enciclopedia de lore y trasfondo científico interactiva con efectos de refracción vidriosa y glifos espaciales interactivos.

### 🌌 Nuevas Misiones Dinámicas de Campaña

8. **Proyecto Éxodo Interestelar:** Evacuar contrarreloj la población y recursos de un planeta al borde de una catástrofe estelar antes de que expire un límite de ticks.
9. **El Enigma del Horizonte:** Misión de investigación cooperativa local orientada a decodificar frecuencias extrañas emitidas desde un agujero negro construyendo arrays de radiotelescopios.
10. **Hegemonía Comercial del Sector:** Lograr tratados e intercambios comerciales de gran volumen (50k+ recursos) con todas las facciones IA sin iniciar conflictos bélicos.
11. **La Amenaza Silenciosa:** Posicionar satélites de espionaje en órbita enemiga de forma simultánea esquivando escáneres defensivos.
12. **El Resurgir de las Lunas:** Levantar bases lunares avanzadas en 3 de tus planetas y automatizar el flujo logístico satélite-planeta.
13. **Gran Red de Defensa Orbital:** Construir un cinturón masivo de escudos y torretas defensivas en cada frontera planetaria para resistir el endgame.
14. **El Arca Génesis:** Terraformar un bioma hostil (helado/ardiente) utilizando reactores térmicos planetarios para optimizar al 100% sus coeficientes de producción.

### 🏆 Nuevos Modos de Juego Temáticos (100% Locales)

15. **Modo Campaña "Legado de Bahamonde":** Modo historia capitulado con transmisiones de radio simuladas (texto + estática de audio sintetizada) y desarrollo lineal del sector interestelar.
16. **Modo "Supervivencia en el Vacío":** Inicias en un planeta con recursos decrecientes e inhabitabilidad progresiva. Sin posibilidad de comerciar, obligado a optimizar tecnologías de reciclado rápidamente.
17. **Modo "Guerra de Guerrillas Espacial":** Se inhabilita la defensa planetaria estática. Todo el control táctico e invasivo depende exclusivamente de flotas móviles y diseños de naves a medida.
18. **Modo "Amanecer de la Singularidad" (AI Rebellion):** Las automatizaciones y fábricas adquieren consciencia de forma aleatoria, rebelándose en tus planetas y obligando a negociar o purgar los sistemas.
19. **Modo "Nómadas de la Galaxia":** Tu base de operaciones es una nave nodriza colosal móvil en el mapa galáctico. Minar asteroides en tránsito y huir de los sectores hostiles antes de ser interceptado.
20. **Modo "Hegemonía del Consejo Galáctico":** Victoria pacífica orientada a la diplomacia y el cabildeo político de resoluciones en el senado interestelar.
