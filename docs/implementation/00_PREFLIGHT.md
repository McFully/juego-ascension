# 00 — PREFLIGHT

Fase: `PHASE 0 — PREFLIGHT COMPLETO Y PROTECCIÓN DEL PROYECTO`
Estado: `COMPLETE`
Fecha de ejecución: 2026-09-30
Commit de punto de retorno: `1c69f25`

---

## 1. RESOLUCIÓN DE CONFLICTO CON EL ENCARGO

El encargo original (`mega cambios.md`) asume **PostgreSQL + Supabase + RLS + migraciones SQL online** en 20 de sus 32 fases.

**Resolución tomada (autorizada explícitamente por el usuario):** la verdad del proyecto es **SQLite local embebido** (`better-sqlite3`) vía Electron IPC. No se introduce backend online.

Justificación:

| Fuente | Qué dice |
|---|---|
| `AGENTS.md` §2 | Prohíbe en runtime: servidores externos, cloud saves, sincronización online, sockets, telemetría |
| `AGENTS.md` §4 | Persistencia obligatoria: `%APPDATA%/Ascension/saves/universe.db`, SQLite, IPC |
| `package.json:75-96` | Sin cliente Supabase/Postgres. Deps: `better-sqlite3`, `react`, `three`, `zustand`, `framer-motion`, `zod` |
| Repo | No existe `supabase/`, no existe `migrations/`, no existe cliente HTTP en runtime |

**Consecuencia:** las fases de "Supabase", "RLS", "policies", "triggers" y "functions SQL" del encargo se traducen a su equivalente real: **versionado de esquema SQLite + migraciones no destructivas + validación Zod + IPC tipado**. La sección 13 de este documento contiene la tabla de traducción.

---

## 2. ESTRUCTURA DEL PROYECTO ENCONTRADA

### 2.1 Magnitud

| Métrica | Valor |
|---|---|
| Ficheros fuente en `src/` | 320 |
| Líneas de código en `src/` | 58.511 |
| Suites de test | 21 |
| Tests | 223 (**todos pasan**) |
| Assets `Assets/*.webp` | 439 ficheros, **336,4 MB** (media 784 KB) |
| Audio `public/audio/` | 137 ficheros, ~47,5 MB |
| Imágenes:`public/ministers/` | 80 `.webp`, 3,9 MB |
| Páginas en `src/pages/` | 22 |
| Viewports en `GameViewports` | 21 |
| Acciones en el router raíz | 99 |

### 2.2 Stack confirmado

- **Runtime:** Electron 42 (`contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`) + React 18 + Vite 6
- **Estado:** `useReducer` único (`src/App.jsx:44`) con router por `switch` (`src/reducers/index.js:34-163`). **No hay Zustand en uso** pese a estar en dependencias.
- **Persistencia:** SQLite (`better-sqlite3`) + 20 canales IPC
- **3D:** `three` + `PlanetViewer3D`
- **Build:** `vite build` → `electron-builder` (nsis + portable)
- **Tests:** `vitest` (unit/integración) + `@playwright/test` (e2e, 1 smoke spec)

### 2.3 Arquitectura de estado

Un único objeto plano de ~60 claves de primer nivel (`src/core/initialState.js:95-185`), agregado por 9 sub-reducers agrupados por dominio (system, economy, research, fleet, diplomacy, event, government, council, sector) más 15 submódulos de tick.

**Eje global vs eje por-planeta — hallazgo estructural:** muchas claves existen en **ambos** planos (`research`, `ministries`, `specialization`, `autoTrade`, `taxRate`, `fleetVariants`, `retrofitTech`, `demographics`…). `initialState.js:104` asigna `research: homePlanet.research` — **misma referencia de objeto**, no copia. `loadMigrator.js:245-269` (`migrateMinistryScope`) intenta reconciliar los dos planos en cada carga y **descarta los mejoras globales** salvo las del planeta activo.

---

## 3. FUENTES DE VERDAD ENCONTRADAS

| Dato | Fuente de verdad declarada | Estado | Veredicto |
|---|---|---|---|
| Coste de edificio | `src/data/game/buildingsData.js` + `expandedBuildings.js` | 129 entradas | OK, pero 30 números mágicos duplicados en `.jsx` |
| Coste de nave | `src/data/game/shipsData.js` | 17 | OK |
| Duración de construcción | `calcBuildTime` (`src/utils/formulas/costFormulas.js:177`) | Única fórmula | **5 call sites con argumentos incompatibles** |
| Duración de investigación | `calcPlanetResearchTime` (`src/utils/formulas/researchTiming.js:62`) | Fuente única | 2 call sites de UI la saltan |
| Producción | `calcProduction` (`src/utils/formulas/productionFormulas.js:80`) | Fuente única | **2ª reimplementación** en `formulas.js:254-455` |
| Recompensa de refinería | `productionFormulas.js:207` (`5000 × refineryLvl`) | Fuente única | **×200 NO implementado** |
| Estado global persistido | `GLOBAL_STATE_KEYS` (`gameRepository.cjs:19-29`) | Allow-list de 37 | **7+ claves vivas ausentes** |
| Identidad de partida | `game_sessions.id` = `state._sessionId` | Existe | **`_sessionId` nunca se reinyecta en React** |
| Nombre de partida | `game_sessions.player_name` ← `state.playerName` | — | **Alias 1:1 del nombre del comandante** |
| `saveName` / `commanderId` | — | — | **`commanderId` NO EXISTE en el repo** |
| Detalle de entidad | `src/data/codex.js` (283 entradas) | Existe | Sin sistema unificado; 5 sistemas distintos |
| Imagen de card | `src/data/assetsCatalog.js` (`REAL_IMAGES`, 571 claves) | Existe | 14 claves duplicadas que se pisan |
| Realimentación de botón | `canAfford` (`costFormulas.js:86`) firma `(res, cost)` | Existe | **2 llamadas con argumentos invertidos** |

---

## 4. HALLAZGOS CRÍTICOS (verificados por lectura directa de código)

### C-01 — 27 acciones despachadas por la UI nunca llegan a ningún reducer

`src/reducers/index.js` enruta 99 acciones. Las siguientes **existen como `case` en un sub-reducer** pero **no están en el switch raíz**, por lo que caen en `default: return state` (`index.js:161-162`).

Verificado: `Select-String` sobre `index.js` con las 27 cadenas exactas → 0 coincidencias, con control positivo (`START_BUILDING`, `SEND_FLEET` → presentes).

| Acción | Implementada en | Despachada desde |
|---|---|---|
| `MARKET_TRADE` | `economyReducer.js:282` | `GalacticMarketPage`, `ExchangeCommandHubView` |
| `MARKET_BUY_USED_SHIPS` | `economyReducer.js:419` | `UsedShipBazaarView` |
| `MARKET_SCRAP_SHIPS` | `economyReducer.js:455` | `UsedShipBazaarView` |
| `MARKET_BUY_BLACK_MARKET` | `economyReducer.js:489` | `BlackMarketView` |
| `CLAIM_DAO_DIVIDENDS` | `economyReducer.js:21` | `ExchangeCommandHubView` |
| `CREATE_LIMIT_ORDER` | `economyReducer.js:38` | `ExchangeCommandHubView` |
| `CANCEL_LIMIT_ORDER` | `economyReducer.js:86` | `ExchangeCommandHubView` |
| `CONTRIBUTE_EXCHANGE_PROJECT` | `economyReducer.js:107` | `ExchangeCommandHubView` |
| `ADD_TRADE_ROUTE` | `fleetReducer.js:368` | `SupplyRoutesView`, `TradeRoutesSection` |
| `REMOVE_TRADE_ROUTE` | `fleetReducer.js:372` | `SupplyRoutesView`, `TradeRoutesSection` |
| `TOGGLE_TRADE_ROUTE` | `fleetReducer.js:376` | `SupplyRoutesView`, `TradeRoutesSection` |
| `PROCESS_TRADE_ROUTES` | `fleetReducer.js:380` | `TradeRoutesSection` |
| `RETROFIT_SHIP_VARIANT` | `fleetReducer.js:84` | `RetrofitShipModal` |
| `RETROFIT_DEFENSE_VARIANT` | `fleetReducer.js:88` | `DefenseGrid` |
| `CANCEL_RETROFIT_QUEUE` | `fleetReducer.js:92` | `FleetRetrofitQueueSection` |
| `EXECUTE_BUILDING_ACTION` | `governmentReducer.js:489` | `BuildingInteriorModal` |
| `SET_MINISTRY_AUTOMATION` | `governmentReducer.js:138` | `colonyGovernor.js:133` (IA `full_auto`) |
| `SET_MINISTRY_DOCTRINE` | `governmentReducer.js:533` | — |
| `SET_PLANET_GOVERNOR` | `systemReducer.js:21` | `LivingPlanetPanel` |
| `TOGGLE_LOCAL_MINISTERIAL_SUBTASK` | `systemReducer.js:53` | `LivingPlanetPanel` |
| `EQUALIZE_COLONY_RESOURCES` | `economyReducer.js:321` | `ColonyNetworkPage` |
| `RELOCATE_COLONY_FLEET` | `economyReducer.js:356` | `ColonyNetworkPage` |
| `START_PLANET_TERRAFORMING` | `economyReducer.js:391` | `PlanetTerraformingView` |

**4 acciones adicionales no existen en ningún reducer:**

| Acción | Despachada desde | Efecto |
|---|---|---|
| `SET_PLANET_TAX_RATE` | `PlanetarySenateModal.jsx:29` | **Senado Planetario 100 % inerte** |
| `TOGGLE_PLANET_LOCAL_DIRECTIVE` | `PlanetarySenateModal.jsx:38` | Los 3 edictos locales inertes |
| `START_MOON_BUILDING` | `MoonPage.jsx:152` | **Base Lunar no construye** (el reducer implementa `BUILD_MOON_BUILDING`) |
| `DISMISS_ULTIMATUM` | `AppOverlays.jsx` | El ultimátum no se puede descartar |

**Por qué los 223 tests pasan:** invocan los sub-reducers directamente (`livingPlanet.test.jsx` → `systemReducer(...)`), nunca `gameReducer`. **No existe ningún test que verifique que una acción despachada por la UI llegue al dominio.** Este es el agujero de test más grave del proyecto.

**Impacto:** Mercado Galáctico, DAO, mercado negro, bazar de naves, rutas de suministro, retrofit, interiores de edificio,对公司化 de colonias, terraforming, Senado Planetario y Base Lunar están **funcionalmente muertos** aunque se rendericen correctamente.

### C-02 — El guardado pierde estado vivo (allow-list incompleta)

`GLOBAL_STATE_KEYS` (`gameRepository.cjs:19-29`) es una allow-list de 37 claves. Verificado contra `initialState.js`:

| Clave | ¿Persistida? | Consecuencia al cargar |
|---|---|---|
| `currentPlanetId` | **NO** | `App.jsx:85` cae a `planets[0]` → el jugador reaparece en otro planeta |
| `patrols` | **NO** | **Todas las patrullas se pierden.** 33 referencias en UI |
| `tacticalEventLog` | **NO** | La bandeja de comunicaciones (85 refs) se vacía; los `read:true` vuelven a `false` |
| `lastTick` | **NO** | El progreso offline (`useGameLifecycle.js:173`) nunca se ejecuta tras cargar |
| `credits` | **NO** | Reiniciado a 10000 por `loadMigrator.js:209` |
| `exchangeOrders` | **NO** | Órdenes de bolsa perdidas |
| `daoShares`, `playerDaoShares`, `daoDividendPool`, `exchangeProjects` | **NO** | Economía DAO reseteada |
| `victory`, `gameOver`, `showTutorial`, `tutorialCompleted` | **NO** | Pantalla de victoria y tutorial se pierden |
| `worldAlertLog`, `triggeredNarrativeEvents` | **NO** | Eventos narrativos re-disparables |

### C-03 — Importar un save exportado machaca la partida original

`export-save-to-file` (`saveIpc.cjs:360`) escribe el payload **crudo**, que incluye `_sessionId` (`gameRepository.cjs:221`). `import-save-from-file` (`saveIpc.cjs:396`) → `saveFullGameState` → `const sessionId = state._sessionId || generate()` (`gameRepository.cjs:42`) → **reutiliza el id original** → `ON CONFLICT(id) DO UPDATE SET slug=@slug` con el slug nuevo. La partida original desaparece de la lista.

Existe el código que lo corrige: `exportSessionToJson` (`gameRepository.cjs:316-326`) limpia `_sessionId`, está importado en `saveIpc.cjs:10` y **nunca se llama**.

### C-04 — Cada auto-save de una partida nueva crea una sesión nueva

`_sessionId` nunca se reinyecta en el estado de React: `SaveGameScreen.jsx:36-38` descarta `res.slug`; `initialState.js:95-185` no incluye `_sessionId`. → `saveIpc.cjs:227` cae a la rama "nueva sesión" en cada llamada → `slug`, `slug-2`, `slug-3`… hasta 1000. Con auto-save cada 30 s (`useGameLifecycle.js:271`).

### C-05 — Las naves no están scopeadas por partida

`ships.session_id` existe (`dbManager.cjs:115`) pero **sin FK** y `shipRepository.cjs:17-31` **nunca lo escribe**. El "Registro Naval Imperial" es una bolsa global para todas las partidas. `deleteGameSession` no las toca (sin cascada).

### C-06 — 8,4 GB de backups huérfanos en disco (medido)

```
%APPDATA%/Ascension/saves  →  881 ficheros, 10.018,5 MB
  universe.db               92,2 MB
  universe_*.bak            5 ficheros,   461,2 MB
  universe_*.bak-wal        617 ficheros, 8.398,2 MB   ← 84 % del disco
  *.json legacy             40 ficheros
```

Causa: `backupManager.cjs:71` copia el WAL a `<backup>.bak-wal`; `cleanupOldBackups` filtra con `!f.endsWith("-wal")` (`:96`) → **nunca puede borrarlos**. Además no hay `wal_checkpoint` antes de copiar, así que el `.bak` **no contiene las transacciones aún no volcadas**.

### C-07 — Sin versionado de esquema

`PRAGMA user_version = 0`. Ningún `ALTER TABLE` en `electron/`. Ninguna tabla de migraciones. `game_meta` (`dbManager.cjs:53`) existe y está **vacía** — es el sitio natural para `schema_version` y nadie lo usa. `PRAGMA integrity_check` no se ejecuta jamás.

Consecuencia: añadir una columna a `planets` o `ships` **no hace nada** sobre una DB existente; la app arranca "bien" y lee/escribe mal, sin detección.

### C-08 — `canAfford` con argumentos invertidos en 2 pantallas

Firma: `canAfford = (res, cost)` (`src/utils/formulas/costFormulas.js:86`).

| Archivo:línea | Llamada | Efecto |
|---|---|---|
| `src/pages/MoonPage.jsx:117` | `canAfford(cost, currentPlanet.resources)` | Botón habilitado **justo cuando no puedes pagar** |
| `src/pages/MissilesPage.jsx:76` | `canAfford(cost, currentPlanet.resources)` | Ídem |

Las pills de coste de esas mismas cards (`MoonPage.jsx:142`, `MissilesPage.jsx:101`) usan el orden correcto → **la card se contradice a sí misma**. Las otras 17 llamadas usan `(resources, cost)` correctamente.

### C-09 — Pipeline de imagenes con compresión lossy

`scripts/convert-assets-to-webp.cjs:41-42`:
```js
.resize(1920, 1080, { fit: 'cover' })
.webp({ quality: 85, effort: 4 })
```

El script de ministros (`convert-ministers-to-webp.cjs:25`) sí usa `lossless: true`. Resultado: 439 imágenes, **336,4 MB**, media 784 KB, para miniaturas de 48–144 px de alto. El commit `2b18f03` ("restaurar 190 imagenes WebP a calidad lossless 100%") restauró **los ficheros ya existentes**, pero **el script sigue en `quality: 85`**: cualquier regeneración futura reintroduce la degradación. No se ejecuta en `build` (es herramienta manual) y Vite no recomprime.

### C-10 — Dos botones "Ver detalles" idénticos por card

`src/components/ui/ItemCard.jsx:130-135` (icono `menu_book` en la cabecera) y `:187-192` (icono ℹ️ en el pie). Mismo `title="Ver detalles"`, mismo handler `onOpenCodex(id)`, mismo argumento. Duplicación dentro de la misma tarjeta.

### C-11 — `footerAction` nunca se renderiza

`planetaryCommandCardsConfig.jsx:70-90` pasa un botón "🤖 Activar Gobernador IA" con `dispatch` real, pero `HubCard.jsx` **no acepta `footerAction` en sus props ni lo pinta en ningún return** (0 coincidencias de `footerAction` en `HubCard.jsx`). El botón no existe en pantalla. El auto-gobernador es inalcanzable desde el hub.

### C-12 — Pista de audio zombi en 5 pantallas

`playSystemMusic` (`src/audio/audioMusic.js:192-206`) hace `if (!fileName) return;` **antes** de cualquier `stop*`. `SYSTEM_AUDIO_FILES` no tiene entrada para `buildings`, `telemetry`, `imperial_hub`, `imperial_council`, `imperial_senate` → **la música de la pantalla anterior sigue sonando** en esas 5 pantallas.

Además: `playMinistryMusic` nunca llama a `stopSystemMusic()`; los fallbacks de ruta (`audioMusic.js:142, 231`) sustituyen la referencia sin pausar el `Audio` original; `CommunicationsPage.jsx:27` crea un `AudioContext` nuevo por cada transmisión y nunca lo cierra; `LeaderAvatar.jsx:20, 80` conecta a `destination` directo, ignorando mute y muffle.

### C-13 — Doble fuente de verdad de duración efectiva

`calcBuildTime` (`costFormulas.js:177`) es la única fórmula, pero se invoca con **5 conjuntos de argumentos distintos**:

| # | Call site | `mins` | `research` | `buildings` | `relics` |
|---|---|---|---|---|---|
| 1 | `economyReducer.js:269` (encolar) | ❌ `{}` | ✅ | ✅ | ❌ |
| 2 | `autoBuildTick.js:160` | ❌ | ✅ | ✅ | ❌ |
| 3 | `autoBuildTick.js:211` | ❌ | ✅ | ✅ | ❌ |
| 4 | `MinistryBuildingsSection.jsx:75` (**la card**) | ❌ | ❌ | ❌ | ❌ |
| 5 | `queueTiming.js:85-95` (reajustar) | ✅ | ✅ | ✅ | ✅ |

Consecuencia: la card muestra un tiempo, el encolado sella otro, y el primer tick **reescribe el `endTime`** (tolerancia 0,5 % en `queueTiming.js:180`). Es exactamente el síntoma que el encargo describe (card 4h → queue 2h), y la causa raíz **no es visual**: es que la firma posicional de 9 parámetros con 4 opcionales se rellena de 4 maneras distintas.

Investigación: 2,5× más lenta (con `researchLab` 4 y `advResearchCenter` 5).

Hay además un **quinto módulo muerto** (`automationTick.js`, 295 líneas, 0 importadores) que contiene la copia vieja con doble conteo de bonuses.

### C-14 — `refinery` ×200 no implementado

Valor real: `productionFormulas.js:207` → `5000 * refineryLvl`. Catálogo: `buildingsData.js:6` → `baseProd: 5000`. **No existe `* 200` en `src/`**. UI y cálculo coinciden en 5000 — no hay discrepancia "texto vs fuente", simplemente la fase nunca se hizo.

Efectos colaterales reales: los bonos `dir_heavy_refine` ("+20% producción refinerías") e `ind_catalyst` ("+15% eficiencia") están declarados en `ministryDirectives.js:58` y `ministriesData.js:70` y **no los lee ninguna fórmula**.

### C-15 — "Save" y "Commander" son el mismo campo

`saveId` y `commanderId` **no existen en el repo**. La identidad real es `state._sessionId` (= `game_sessions.id`). El nombre real es `state.playerName` → `game_sessions.player_name` → `slugify()` → `game_sessions.slug` (la clave de la partida).

Aliases muertos: `_saveName: session.player_name` (`gameRepository.cjs:223`, copia exacta de `playerName`) y `_saveSlug`. Ninguno lo lee nadie en `src/`.

Consecuencia observable: `ProfileSettingsTab.jsx:24` cambia `playerName` → el siguiente auto-save recalcula el slug → **el slot de guardado se renombra solo**.

### C-16 — No hay sidebar renderizado

`GAME_TABS` (`gameNavigation.js:1-56`, 41 entradas) **no se renderiza en ningún sitio**; sólo se usa como whitelist. El CSS de sidebar (`styles.js:18-20`, `index.css:569-575`) está huérfano. Contradice `AGENTS.md` §8 ("Sidebar izquierda fija").

`isTabUnlocked` (`gameNavigation.js:58-60`) es un stub que devuelve `true` siempre: no existe progresión de desbloqueo.

Doble fuente de verdad de jerarquía: `GAME_TABS[].parent` y `PARENT_MAP` (`NavigationContext.jsx:56-96`) **discrepan** en `colony_network`, `market`, `missions`, `stats`.

### C-17 — Silos de Misiles inalcanzable

`planetaryCommandCardsConfig.jsx:169` hace `setActiveTab('missiles')`, pero `missiles` **no está en `GAME_TABS`** → `App.jsx:211-218` lo rechaza y rebota a `overview`. Además el contenido está **duplicado**: `DefensePage.jsx` tiene una pestaña interna `silos` con el mismo componente y el mismo contenido que la página `MissilesPage` independiente.

### C-18 — Sin CSP

`index.html` no tiene `<meta http-equiv="Content-Security-Policy">`. `main.cjs:31` declara `bypassCSP: false` pero no hay CSP que proteger. Cualquier XSS en el renderer obtiene los 27 métodos de `electronAPI`. Tampoco hay `setWindowOpenHandler` ni `will-navigate`.

`db-migrate-json` (`main.cjs:330-339`) construye `path.join(savesDir, \`${slug}.json\`)` **sin `assertSafeSlug`** (el sibling existe en `saveIpc.cjs:30`): path traversal + escritura arbitraria `.legacy_v3.bak`. Hoy inalcanzable (0 llamadas) pero el canal está expuesto en `preload.cjs:74`.

### C-19 — Assets: 0 faltantes, 14 claves duplicadas, assets compartidos entre sistemas

Verificación del 100 %: 438 referencias en `assetsCatalog.js` → **0 ficheros ausentes** en `Assets/`. Confirmado también por `scripts/verify-catalog-integrity.cjs`.

Pero:
- `permanentEmbassy.webp` se usa para **diplomacy** y **imperial_senate** (`imperialCommandCardsConfig.jsx:58, 98`) — dos tarjetas visualmente idénticas
- `sectorGovPalace.webp` se usa en **4 sistemas** (ministries, planetary_senate, stats, botón Mando Imperial)
- 14 claves de `REAL_IMAGES` definidas dos veces (la segunda pisa a la primera): `menuSaveGame` acaba mostrando la imagen de "Continuar"
- 1 fichero huérfano en disco: `Assets/aiCore.webp` (el catálogo mapea `aiCore` a `Núcleo de IA.webp`)
- 62 de 100 `.mp3` de voz sin referenciar (~2,4 MB)
- `Musica-menu.ogg` duplicado: raíz del repo (3,9 MB, no servida) + `public/` (4,0 MB servida) = 8 MB en `dist/`

### C-20 — Métricas y efectos inventados pintados como datos

| Archivo:línea | Qué inventa |
|---|---|
| `MinistryPerformanceMetrics.jsx:17` | `PIB Nova Proyectado = 2500000 + mining_subsidy*250005` |
| `MinistryPerformanceMetrics.jsx:21` | `Tasa de Inflación Fiscal = (0.02 + taxRate*0.1).toFixed(2)%` → **error de unidades**: fracción impresa como porcentaje |
| `MinistryPerformanceMetrics.jsx:25,85,109` | Gini `0.34`, `DEFCON 3`, aprobación `92%` — constantes |
| `LivingPlanetPanel.jsx:12-47` | 4 objetos de fallback con valores fijos (1200 MW, 5000 MW, morale 85…) pintados como reales |
| `LivingPlanetPanel.jsx:107,179` | "Reciclaje cerrado: 96.5%" y "La producción industrial ha colapsado al 20%" sin ninguna implementación del 0.2 |
| `planetaryCommandCardsConfig.jsx:107` | `Math.floor(pop/10000)+1` "Escaños" — 3 copias de la misma fórmula mágica |
| `ItemCard.jsx:150` | Barra de progreso `Math.min(90, level*8)` — nunca llega al 100 %, y `maxLevel`/`maxReached` no los pasa ningún caller |
| `ImperialSenateView.jsx:253-309` | Pestaña "Diplomacia Exterior" con 3 tarjetas hardcodeadas sin `dispatch` ni lectura de `state.diplomacy` |
| `missions.jsx:114,123,154` | Recompensas con `Math.random()` en runtime, fuera de `data/missionsData.js` |

### C-21 — Cola de investigación: 8 temporizadores paralelos sin capacidad por laboratorio

`researchReducer.js:34, 39-40`: `endTime` se fija en el momento de encolar, **no encadenado** al ítem anterior. Todo corre en paralelo. El tope 8 es **global e imperial**, no por `researchLab`. `START_RESEARCH` no comprueba que el planeta ya tenga una investigación en curso.

Efecto: un único laboratorio puede tener 8 investigaciones simultáneas; y con 8 techs largas encoladas el jugador queda bloqueado aunque la siguiente disponible sea de 2 minutos. `colonyGovernor.js:204-210` reparte esos 8 huecos entre **17 ministerios de todos los planetas**.

`CANCEL_RESEARCH_QUEUE` (`fleetReducer.js:180`) cancela en cascada todos los ítems del mismo `researchId` con `level >= target`, lo cual es incorrecto con duraciones paralelas.

### C-22 — 16 estudios de investigación declarados sin efecto

`laser`, `ion`, `ballisticWeapons`, `advMissiles`, `orbitalArtillery`, `nanoTech`, `modularEng`, `expDesign`, `galacticTrade`, `deepScanner`, `advColonization`, `advSensors`, `computer`, `singularity` — su `effect` declarado no lo lee ninguna fórmula. `fullAuto` declara "+20% economía y flota" pero solo se usa como +0,05/nv de velocidad de construcción.

### C-23 — Importación de JSON legacy usa `Math.random()`

`loadMigrator.js:139-155` genera `strategy`, `aiPersonality`, `aggression`, `riskTolerance`, `biome`, `planetSize`, `gravity` de las IA con `Math.random()` → **cada recarga produce IAs distintas**. No es determinista.

### C-24 — Stats de recursos solo del planeta visible

`tickOrchestrator.js:131` acumula `metalGathered`/`crystalGathered`/`deuteriumGathered` **solo del planeta actual**. Los logros `resource_master`, `crystal_master`, `millionaire` (`gameConstants.js:8,9,19`) leen esos contadores → mal calibrados.

### C-25 — Dead code identificado

| Fichero | Líneas | Razón |
|---|---|---|
| `src/reducers/tick/automationTick.js` | 295 | 0 importadores. 5ª copia de `calcBuildTime`, 2ª de `calcResearchTime` |
| `src/reducers/tick/events/missionsAndRandomEvents.js` | — | 0 importadores |
| `src/reducers/tick/events/transmissionsAndFirstContact.js` | — | 0 importadores |
| `src/reducers/tick/events/councilAndCrises.js` | — | 0 importadores |
| `src/pages/ReplayPage.jsx` | — | Lazy importado, nunca renderizado |
| `src/utils/saveValidation.js` | — | Exportado y **nunca usado en producción** (solo en tests) |
| `electron/database/gameRepository.cjs:316` `exportSessionToJson` | — | Importado en `saveIpc.cjs:10`, nunca llamado (arregla C-03) |
| `electron/ipc/backupManager.cjs:116` `getLatestBackup` | — | Importado, nunca usado. No hay restore |
| `preload.cjs:66` `dbGetPlanetFleetSummary` | — | Expuesto, nunca llamado |
| `preload.cjs:74` `dbMigrateJson` | — | Expuesto, nunca llamado (y es el vector de C-18) |
| `src/assets.jsx:12,31,50` (`CardImage`/`SafeImg`/`CardBanner`) | — | Casi sin uso |
| `src/data/assetsCatalog.js:78,80-82,89,118,631` | — | Alias de clave duplicada |
| `src/components/government/hub/sharedCommandCards.jsx` | — | `shipDesign`/`combat` no están en `PLANETARY_COMMAND_CARDS` → nunca se itera en el hub planetario |
| 11 SVG de `public/backgrounds/government/` | — | `bgImage` declarado en `ministryMetadata.js` (19 ocurrencias) y nunca consumido |
| 11 SVG de `src/assets/` | — | 0 referencias |
| `game_meta` (tabla) | — | Existe, 0 filas, 0 escrituras |
| `game_logs` (tabla) | — | Existe, 0 filas, 0 `INSERT` |
| `ascension_record_standard_planets` (localStorage) | — | 1 lectura, 0 escrituras → siempre 0 |

---

## 5. ESTADO DE SUPABASE / POSTGRESQL / SQL

| Elemento | Estado |
|---|---|
| Supabase | **No existe.** Sin cliente, sin config, sin claves |
| PostgreSQL | **No existe** |
| `supabase/` | No existe |
| `migrations/` | No existe |
| Seeds | No existen |
| RLS / policies | No aplican |
| Motor real | SQLite 3 vía `better-sqlite3@13` |

**No hay nada que migrar desde Postgres.** El esquema real está íntegro en `electron/database/dbManager.cjs:50-187` (un único `createSchema` con 8 `CREATE TABLE IF NOT EXISTS` + 15 `CREATE INDEX IF NOT EXISTS`).

**El esquema actual es idempotente y no destructivo** (cero `DROP`, cero `TRUNCATE`). Los únicos `DELETE` están acotados por `WHERE session_id` o `WHERE id`. Esto cumple la regla de no-destrucción.

**Tablas y estado real medido:**

| Tabla | PK | FK | Índices | Filas (DB real) | Nota |
|---|---|---|---|---|---|
| `game_sessions` | `id` TEXT | — | slug, updated | 2 | `slug` UNIQUE. `version` hardcodeado a 4 (`gameRepository.cjs:71`) |
| `planets` | `id` TEXT (**global**) | `session_id`→sessions CASCADE | session, coords, owner | 5.876 | El PK global impide el mismo `planet.id` en 2 partidas |
| `production_queues` | `id` INTEGER AI | `session_id`→sessions CASCADE | (session, type) | 4 | **Sin UNIQUE** en (session, type) |
| `ships` | `id` TEXT | **NINGUNA** | 6 | **176.140** | `session_id` **nunca escrito** → todas NULL |
| `ship_logs` | `id` INTEGER AI | `ship_id`→ships CASCADE | ship | 88.335 | |
| `fleet_missions` | `id` TEXT | **NINGUNA** | session | 1 | `session_id` sin FK → no se limpia al borrar partida |
| `game_logs` | `id` INTEGER AI | `session_id`→sessions CASCADE | session | **0** | Tabla muerta |
| `game_meta` | `key` TEXT | — | — | **0** | Tabla muerta (candidata a `schema_version`) |

Sin triggers. Sin views. `PRAGMA user_version = 0`. `recursive_triggers` **no activado** → los `ON DELETE CASCADE` **no se disparan** en los `INSERT OR REPLACE` de `ships`.

`ships` pesa 176.140 filas de una sesión abandonada (`kik`, 1 planeta de jugador) = el 90 % de un `universe.db` de 92 MB que nunca se poda. No hay `VACUUM`, no hay recolección de basura, `db-scrap-ships` solo marca `status='scrapped'` sin borrar.

---

## 6. FLUJO DE PERSISTENCIA (verificado)

### Guardado

```
UI (useAppSaveHandlers:111 / useGameLifecycle:258,271,286)
  → preload.cjs:53  saveGameNamed  (sanitiza: quita funciones, ciclos, Date→ISO)
  → saveIpc.cjs:215  validateSaveData → slugify(playerName) → desambiguar
  → saveIpc.cjs:240  createTimestampedBackup(universe.db)     ← backup
  → gameRepository.cjs:40  saveFullGameState(slug, state)
       :42   sessionId = state._sessionId || generateSessionId()
       :55   INSERT ... ON CONFLICT(id) DO UPDATE  (37 claves allow-list)
       :85   DELETE FROM planets/production_queues WHERE session_id
       :89   INSERT planetas (jugador + IA, uno a uno)
       :132  INSERT colas (8 tipos)
       :145  INSERT fleet_missions
```

### Carga

```
UI → preload.cjs:52 → saveIpc.cjs:198
  → assertSafeSlug → loadFullGameState(slug)
       :191  SELECT * FROM game_sessions WHERE slug = ?
       :196  JSON.parse(global_state_json)
       :199  SELECT data_json FROM planets WHERE is_ai=0/1
       :209  SELECT queues / :214  SELECT fleet_missions
       :219  reensambla state + _sessionId/_saveSlug/_saveName
  → correctResearchLevels (saveIpc.cjs:205)  ← solo en memoria
  → dispatch LOAD → systemReducer:11 → migrateLoadState (loadMigrator:74)
```

**No se valida la forma del save al cargar.** `validateSaveData` solo se usa al guardar. El validador Zod `src/utils/saveValidation.js:39-63` está escrito y **nunca se usa en producción**.

La migración a v4 ocurre **solo en memoria** (`loadMigrator.js:86` fuerza `version: 4`). La DB sigue marcada `version = 3` hasta que se re-guarda.

**Backup:** 4 llamadas, todas en `saveIpc.cjs:240,256,293,309`, todas **antes** del `saveFullGameState`. `import-save-from-file` y `delete-save-by-slug` **no generan backup**. No hay función de restore en todo el repo.

**Canales IPC:** 20 (19 `invoke` + 1 `sendSync` en `beforeunload`, que bloquea el renderer).

---

## 7. ESTADO DE GIT

```
branch:  main
commit previo: 2b18f03 "fix(assets): restaurar 190 imagenes WebP a calidad lossless 100% sin perdida"
```

**Trabajo del desarrollador sin commitear al inicio de esta fase:** 94 modificados + 48 nuevos = 142 ficheros, +16.067 / −6.974 líneas.

**Acción tomada (autorizada):** commit de punto de retorno `1c69f25`, sin cambios funcionales deliberados. Los saves locales exportados (`ascension_*.json`, 4 × 6 MB) y `desktop.ini` se añadieron a `.gitignore` en lugar de commitearse.

Estado actual: árbol limpio.

---

## 8. DEPENDENCIAS REALES ENTRE SISTEMAS

```
C-01 (27 acciones sin enrutar)          ← BLOQUEA casi todo lo demás
   │
   ├─→ Supply Routes (fase 11 del encargo)
   ├─→ Autotrade / misión capítulo 6 (fase 12)
   ├─→ Mercado Galáctico / DAO / mercado negro
   ├─→ Senado Planetario (fase 9 parcial)
   ├─→ Retrofit de naves y defensas
   ├─→ Interiores de edificio (fase 18)
   ├─→ Terraforming, igualación de colonias, fastened Automatico de ministros
   └─→ Base Lunar (fase posterior)

C-02 + C-07 (persistencia)              ← BLOQUEA verificación de cualquier fase de datos
   │
   └─→ Toda fase que afirme "el valor persiste"

C-13 (duraciones)                        ← BLOQUEA fases 17, 22, 23, 24, 25 del encargo
   │
   └─→ Ver detalles (16, 17, 18, 19), auditoría de fórmulas (21), UI→dominio (25)

C-08 + C-10 + C-11 + C-20 (cards)        ← BLOQUEA "cards no estériles" (fase 20)
   │
   └─→ Auditoría universal de fórmulas (21)
```

**Conclusión de dependencias:** el encargo empieza por calidad de imágenes y refinería, pero **las fases 3, 5, 7, 9, 11, 12, 14 y 20 del encargo son todas irrealizables mientras C-01 no esté arreglado**, porque sus botones no producen ningún cambio de estado. El Master Plan reordena en consecuencia.

---

## 9. OPERACIONES POTENCIALMENTE DESTRUCTIVAS IDENTIFICADAS

Se documentan para que **ninguna fase las ejecute sin backup verificado**:

| # | Operación | Riesgo | Mitigación exigida |
|---|---|---|---|
| D-1 | `ALTER TABLE` sobre `ships`/`planets` | Rompe DBs existentes de usuarios (C-07: no hay versionado) | Backup verificado + migración idempotente + prueba sobre copia |
| D-2 | Limpiar las 176.140 naves huérfanas de `ships` | **Pérdida de datos** si alguna pertenece a una partida viva | Filtro por `session_id` primero; hoy todas son NULL, hay que resolver C-05 antes |
| D-3 | `VACUUM` sobre `universe.db` | Bloqueo de 92 MB; requiere cerrar la DB | Solo con la app cerrada |
| D-4 | Borrar los 617 `.bak-wal` (8,4 GB) | Ninguno se ha aplicado nunca → pérdida segura | Reconstruir el `.bak` con `wal_checkpoint` primero |
| D-5 | Cambiar `calcBuildTime` a firma de objeto | 5 call sites + tests existentes | Migración call-site por call-site, sin cambio de resultado numérico |
| D-6 | Reescribir los 439 `.webp` | Pérdida de calidad si se regeneran desde `quality:85` | Re-generar desde **originales** con `lossless`, nunca recomprimir los `.webp` actuales |
| D-7 | Añadir claves a `GLOBAL_STATE_KEYS` | Un valor `undefined` mal tipado rompe el JSON de un save | Filtro `!== undefined` ya presente (`gameRepository.cjs:48`) |
| D-8 | Borrar `automationTick.js` y los 3 módulos `events/*` muertos | Bajo: 0 importadores verificados | Confirmar con barrido de imports antes de borrar |
| D-9 | Corregir `_sessionId` para que se reinyecte | Partidas nuevas existentes con slug huérfano | `_saveSlug` ya se restaura; usar ese fallback |
| D-10 | Cambiar el nombre de `START_MOON_BUILDING` | Rompe `MoonPage.jsx:152` | Enrutar el nombre viejo **y** corregir la UI |

---

## 10. ASSETS RELEVANTES

| Ubicación | Cantidad | Peso | Nota |
|---|---|---|---|
| `Assets/*.webp` | 439 | 336,4 MB | Empaquetado en `dist/assets/` con hash |
| `public/ministers/*.webp` | 80 | 3,9 MB | lossless correcto |
| `public/audio/` | 137 | ~47,5 MB | 62 `.mp3` de voz sin referenciar |
| `public/backgrounds/government/*.svg` | 11 | ~30 KB | **11 muertos** |
| `src/assets/*.svg` | 11 | ~40 KB | **11 muertos** |
| `Assets/aiCore.webp` | 1 | — | **Huérfano** (el catálogo apunta a otro fichero) |
| `Musica-menu.ogg` (raíz repo) | 1 | 3,9 MB | **No se sirve**; duplica la de `public/` |

Scripts de imagenes: `convert-assets-to-webp.cjs` (**quality 85**), `convert-ministers-to-webp.cjs` (**lossless**, correcto), `verify-catalog-integrity.cjs` (0 faltantes), `audit-assets-forensics.cjs`, `clean-legacy-assets.cjs`, `update-catalog-to-webp.cjs`.

Ninguno se invoca desde `package.json` salvo `doctor`.

---

## 11. TESTS EXISTENTES

21 suites, 223 tests, **todos verdes** (29,76 s). Ninguno cubre `electron/`. Ninguno invoca `gameReducer` (el router raíz) — todos llaman sub-reducers directamente.

| Suite | Cubre |
|---|---|
| `core.test.jsx`, `logic.test.jsx` | Núcleo del estado |
| `queueTiming.test.js` | Reajuste de tiempos de cola |
| `researchTiming.test.js` | Tiempos de investigación |
| `commandHubScope.test.jsx`, `ministryPlanetScope.test.jsx` | Scope planetario vs imperial de hubs |
| `loadMigrator.test.js` | Migración de carga |
| `combatFuzzing.test.jsx`, `extendedSimulation.test.jsx` | Simulación prolongada |
| `researchScoring.test.js`, `aiEmpireTick.test.js` | Scoring de investigación e IA |
| `tacticalEventLog.test.js`, `tacticalEvents.test.jsx` | Registro táctico |
| `retrofitSystem.test.js` | Retrofit |
| `galacticMarket.test.jsx` | Mercado galáctico |
| `colonyGovernor.test.jsx` | Gobernador colonial |
| `livingPlanet.test.jsx` | Planeta vivo |
| `populationTick.test.js` | Tick de población |
| `ministriesData.test.js` | Datos de ministerios |
| `coreResearchDiscounts.test.jsx` | Descuentos de I+D |
| `e2e/smoke.spec.mjs` | Playwright: 1 smoke test |

**Huecos de cobertura críticos:**
1. Ningún test verifica que una acción despachada por la UI llegue al reducer (de ahí que C-01 pasara 223 tests).
2. Ningún test de `electron/` (persistencia, migraciones, backup).
3. Ningún test de save → close → load → save que compare estado.
4. Ningún test de igualdad card-tiempo vs cola-tiempo (C-13).
5. Ningún test de accesibilidad de rutas (C-17).

---

## 12. ESTRATEGIA DE VALIDACIÓN

Toda fase del Master Plan debe cerrar con:

| # | Prueba | Herramienta |
|---|---|---|
| V1 | Tests unitarios y de integración verdes | `npm test` (vitest) |
| V2 | Build sin errores | `npx vite build` (solo si el usuario lo pide) |
| V3 | Test de contrato UI→dominio: `dispatch(action)` a través de `gameReducer` muta el estado | vitest (nuevo) |
| V4 | Test de ida y vuelta de persistencia sobre DB temporal | vitest + `better-sqlite3` (nuevo) |
| V5 | Igualdad de valor mostrado = valor usado = valor persistido, en la misma prueba | vitest (nuevo) |
| V6 | E2E Playwright del flujo afectado | playwright |

**Prohibido cerrar una fase con "compila" o "el botón existe".**

---

## 13. TRADUCCIÓN DEL ENCARGO A LA REALIDAD DEL PROYECTO

| Fase del encargo | Realidad | Fase en el Master Plan |
|---|---|---|
| 0 Preflight |Igual | **00** (este documento) |
| 1 Orquestación |Igual | **01** |
| 2 Calidad de imágenes | Real, pero el script sigue en `quality:85` | **07** |
| 3 Refinería ×200 | No implementado | **06** |
| 4 Audio | Real (5 pantallas con pista zombi) | **04** |
| 5 Autotrade / capítulo 6 | El estado existe; la UI es inalcanzable | **12** |
| 6 Colonias / High Command assets | Real (assets compartidos) | **07** + **08** |
| 7 Supply Routes | 100 % rotas (C-01) | **11** |
| 8 Council / Senate / Diplomacy / Alliances | Real (assets compartidos) | **08** |
| 9 Planetary vs Imperial | Parcial; el Senado Planetario está inerte | **08** |
| 10 Save vs Commander | `commanderId` no existe; todo es un campo | **15** |
| 11 Bastion / Silos | Real: Silos inalcanzable y duplicado | **09** |
| 12 Fleet Hangar 50/50 | No existe; `FleetPage` es vertical | **10** |
| 13 Sistema de investigación | Real (8 temporizadores paralelos) | **13** |
| 14 Industrial Optimization | No verificable hasta arreglar C-13 | **13** |
| 15 Auditoría research/ministries | Real (16 estudios sin efecto) | **14** |
| 16 "Ver detalles" universal | Real (duplicado en ItemCard) | **16** |
| 17 Detalles ultradetallados | Parcial (CodexModal genérico) | **16** |
| 18 Building details | Bloqueado por C-01 (`EXECUTE_BUILDING_ACTION`) | **16** |
| 19 Research details | Parcial | **16** |
| 20 Cards estériles | Real (C-08, C-10, C-11, C-20) | **17** |
| 21 Auditoría de fórmulas | Real (C-13, C-14) | **18** |
| 22 Tiempos de construcción | Real, causa raíz identificada (C-13) | **05** |
| 23 Centralización de duraciones | Real | **05** |
| 24 Tests de construcción | Los 8 escenarios A–I, sobre fuente única | **05** |
| 25 Auditoría UI→dominio | Real | **18** |
| 26 Auditoría global de imágenes | Real (0 faltantes, duplicadas) | **07** |
| 27 MISSING_ASSETS.md | Real | **07** |
| 28 **Database y persistencia (Supabase/RLS)** | **Reescrito**: versionado de esquema SQLite, migraciones no destructivas, allow-list, backup verificado, import/export seguro | **02** |
| 29 Integración | Igual | **19** |
| 30 Regresión | Igual | **20** |
| 31 Verificación final | Igual | **21** |
| 32 Criterios de completitud | Igual, transversal | transversal |
| — (nuevo) | **27 acciones sin enrutar** | **01** |
| — (nuevo) | Base Lunar rota, `canAfford` invertido | **01** |

**22 fases en vez de 32.** La reducción no elimina ningún alcance: consolida fases que eran subconjuntos y añade dos fases nuevas (01 y 02) que son requisito previo de todas las demás.

---

## 14. ESTRATEGIA DE IMPLEMENTACIÓN

1. **Orden por causa raíz, no por número de fase del encargo.** Lo que desbloquea va primero.
2. **Ninguna fase empieza sin test que falle.** Cada corrección de C-01, C-08, C-10, C-13, C-14 llega con su test rojo previo.
3. **Un commit por fase**, con el STATUS actualizado en el mismo commit.
4. **Sin build ni instalador** salvo orden explícita (`AGENTS.md` §7).
5. **Migraciones no destructivas y probadas sobre copia** antes de tocar `%APPDATA%`.
6. **Nada de "compila" como prueba.** V3 y V5 de la sección 12 son obligatorias en cada fase que toque estado.

---

## 15. PROBLEMAS PENDIENTES REGISTRADOS

| # | Problema | Gravedad | Fase destino |
|---|---|---|---|
| C-01 | 27 acciones sin enrutar + 4 inexistentes | CRÍTICA | 01 |
| C-02 | 8+ claves de estado no persistidas | CRÍTICA | 02 |
| C-03 | Importar save machaca la partida original | CRÍTICA | 02 |
| C-04 | Auto-save crea sesiones duplicadas | CRÍTICA | 02 |
| C-05 | `ships` sin scope de partida | CRÍTICA | 02 |
| C-06 | 8,4 GB de backups huérfanos | ALTA | 02 |
| C-07 | Sin versionado de esquema | ALTA | 02 |
| C-08 | `canAfford` invertido en 2 pantallas | ALTA | 01 |
| C-09 | `quality: 85` en el script de conversión | ALTA | 07 |
| C-10 | "Ver detalles" duplicado en ItemCard | MEDIA | 16 |
| C-11 | `footerAction` nunca renderizado | ALTA | 01 |
| C-12 | Pista de audio zombi en 5 pantallas | ALTA | 04 |
| C-13 | 5 call sites de duración con argumentos distintos | CRÍTICA | 05 |
| C-14 | Refinería ×200 no implementado | ALTA | 06 |
| C-15 | Save y Commander son el mismo campo | ALTA | 15 |
| C-16 | No hay sidebar; `isTabUnlocked` es stub | ALTA | 08 |
| C-17 | Silos inalcanzable y duplicado | ALTA | 09 |
| C-18 | Sin CSP; traversal en `db-migrate-json` | ALTA | 02 |
| C-19 | Assets compartidos y claves duplicadas | MEDIA | 07 |
| C-20 | Métricas inventadas pintadas como datos | ALTA | 17 |
| C-21 | Cola de investigación: 8 timers paralelos | ALTA | 13 |
| C-22 | 16 estudios sin efecto | MEDIA | 14 |
| C-23 | `Math.random()` en la migración de save | ALTA | 02 |
| C-24 | Stats de recursos solo del planeta visible | MEDIA | 18 |
| C-25 | ~20 ficheros y 2 tablas muertas | BAJA | 19 |
| — | 62 `.mp3` de voz sin referenciar | BAJA | 04 |
| — | 11 SVG de fondo + 11 SVG de `src/assets` muertos | BAJA | 07 |
| — | `Assets/aiCore.webp` huérfano | BAJA | 07 |
| — | `Musica-menu.ogg` duplicado (8 MB en dist) | BAJA | 07 |
| — | Doc `05_02`/`05_04` afirma `universe.db.bak` e integridad verificada: **falso** | BAJA | 19 |

---

## 16. BLOQUEOS

**Ningún hard blocker impide el avance.** La Fase 0 está completa y el proyecto tiene un punto de retorno (`1c69f25`).

**Hard blocker declarado para las fases funcionales:** C-01. Ninguna fase que afirme que "una acción modifica el dominio" puede cerrarse mientras 27 acciones no lleguen al reducer.

---

## 17. DEFINITION OF DONE — FASE 0

```text
[x] Análisis completado
[x] Implementación completada (no aplica: fase de auditoría)
[x] Fuente de verdad identificada por cada dato
[x] Lógica de dominio verificada
[x] UI verificada
[x] Persistencia verificada
[x] Integraciones verificadas
[x] Tests ejecutados (223/223 verdes)
[x] Tests críticos superados
[x] No existen errores críticos conocidos sin clasificar (25 hallazgos clasificados)
[x] No existen discrepancias UI → dominio sin documentar
[x] Documentación de la fase creada (este documento)
[x] MASTER_PLAN.md creado
[x] STATUS.md creado
[x] Entregables producidos
[x] Criterios de aceptación cumplidos
[x] Fase preparada para cierre
[ ] Autorizada para pasar a la siguiente fase  → requiere decisión del usuario
```

**DECISIÓN FINAL: PROCEED** — a la espera de autorización del usuario para la Fase 1.
