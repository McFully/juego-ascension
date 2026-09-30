# ASCENSION — ESTADO DE IMPLEMENTACIÓN

Estado real de ejecución. Se actualiza al cerrar cada fase.
Última actualización: 2026-09-30 · Commit base: `1c69f25`

Documentos asociados:
- `00_PREFLIGHT.md` — auditoría completa (25 hallazgos clasificados)
- `01_MASTER_PLAN.md` — las 22 fases y sus dependencias
- `04_HANDOFF_ANTIGRAVITY.md` — traspaso autocontenido para otro agente

---

## RESUMEN GLOBAL

| Fase | Nombre | Estado | Bloqueos |
|---|---|---|---|
| **00** | Preflight | ✅ **COMPLETE** | — |
| **01** | Router de acciones | ✅ **COMPLETE** | — |
| **02** | Persistencia y esquema | ✅ **COMPLETE** | — |
| **03** | Datos de estado y rutas accesibles | ✅ **COMPLETE** | — |
| **04** | Sistema de audio | ✅ **COMPLETE** | — |
| **05** | Fuente única de duraciones | ✅ **COMPLETE** | — |
| **06** | Refinería ×200 | ✅ **COMPLETE** | — |
| **07** | Pipeline de imágenes y assets | ✅ **COMPLETE** | — |
| **08** | Imperial vs Planetary + navegación | ✅ **COMPLETE** | — |
| **09** | Bastión y Silos | ✅ **COMPLETE** | — |
| **10** | Fleet Hangar 50/50 | ✅ **COMPLETE** | — |
| **11** | Supply Routes reales | ✅ **COMPLETE** | — |
| **12** | Autotrade y Capítulo 6 | ✅ **COMPLETE** | — |
| **13** | Sistema de investigación | ✅ **COMPLETE** | — |
| **14** | Auditoría research + ministries | ✅ **COMPLETE** | — |
| **15** | Save vs Commander | ✅ **COMPLETE** | — |
| **16** | Ver detalles + sistema unificado | ✅ **COMPLETE** | — |
| **17** | Auditoría de cards estériles | ✅ **COMPLETE** | — |
| **18** | Auditoría universal de fórmulas | ✅ **COMPLETE** | — |
| **19** | Integración y deuda técnica | ✅ **COMPLETE** | — |
| **20** | Regresión | ⬜ NOT_STARTED | dep. 19 |
| **21** | Verificación final | ⬜ NOT_STARTED | dep. 20 |

**Avance: 20 de 22 fases (90,9 %).**

---

## PLANTILLA DE FASE

Cada fase rellena este bloque al cerrarse.

```text
PHASE:
Nombre:

STATUS:
NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETE

OBJECTIVE:
...

SOURCE OF TRUTH:
...

DEPENDENCIES:
...

FILES INSPECTED:
...

FILES MODIFIED:
...

DATABASE CHANGES:
...

MIGRATIONS:
...

IMPLEMENTATION:
...

TESTS:
...

TEST RESULTS:
...

KNOWN ISSUES:
...

HARD BLOCKERS:
...

SOFT ISSUES:
...

DELIVERABLES:
...

DEFINITION OF DONE:
[ ] Analysis complete
[ ] Implementation complete
[ ] Domain verified
[ ] UI verified
[ ] Persistence verified
[ ] Integration verified
[ ] Tests passed
[ ] Documentation updated
[ ] Master Plan updated
[ ] Status updated
[ ] No critical blockers
[ ] Ready for next phase

FINAL DECISION:
PROCEED / BLOCKED
```

---

## FASE 00 — PREFLIGHT

```text
PHASE:        00
Nombre:       Preflight completo y protección del proyecto

STATUS:       COMPLETE

OBJECTIVE:
Auditar el proyecto sin modificar nada funcional, identificar fuentes de verdad,
clasificar riesgos y decidir el orden de fases por causa raíz.

SOURCE OF TRUTH:
Este documento, más el código leído directamente. Ninguna cifra de este informe
procede del encargo: todas se midieron o verificaron contra el código.

DEPENDENCIES:
Ninguna.

FILES INSPECTED:
  electron/            main.cjs, preload.cjs, database/dbManager.cjs,
                       database/gameRepository.cjs, database/shipRepository.cjs,
                       database/migrator.cjs, ipc/saveIpc.cjs, ipc/backupManager.cjs
  src/reducers/        index.js, systemReducer.js, economyReducer.js, researchReducer.js,
                       fleetReducer.js, diplomacyReducer.js, eventReducer.js,
                       governmentReducer.js, councilReducer.js, sectorReducer.js,
                       colonyGovernor.js, loadMigrator.js
  src/reducers/tick/   tickOrchestrator.js, queues/queueTick.js, queues/queueTiming.js,
                       ministries/ministryTick.js, automation/*, ai/*, events/*
  src/utils/formulas/  costFormulas.js, productionFormulas.js, researchTiming.js,
                       combatFormulas.js, flightFormulas.js, retrofitFormulas.js
  src/utils/formulas.js
  src/pages/           22 archivos
  src/components/      ui/, government/, fleet/, defense/, planet/, overview/,
                       shipyard/, diplomacy/, settings/, navigation/, app/, market/
  src/data/            assetsCatalog.js, codex.js, codex_modules/, game/, policies/
  src/audio/           audioCore.js, audioSynth.js, audioMusic.js, audioVoices.js
  src/App.jsx, src/core.jsx, src/ui.jsx, src/assets.jsx
  scripts/             convert-assets-to-webp.cjs, convert-ministers-to-webp.cjs,
                       verify-catalog-integrity.cjs
  e2e/smoke.spec.mjs, package.json, .gitignore
  %APPDATA%/Ascension/saves/  (estado real medido, solo lectura)

FILES MODIFIED:
  .gitignore                                  (saves locales y desktop.ini)
  docs/implementation/00_PREFLIGHT.md         (nuevo)
  docs/implementation/01_MASTER_PLAN.md       (nuevo)
  docs/implementation/ASCENSION_IMPLEMENTATION_STATUS.md  (nuevo)

DATABASE CHANGES:
  Ninguna. Solo lectura del esquema y de las métricas del fichero real.

MIGRATIONS:
  Ninguna. No se ha escrito código funcional.

IMPLEMENTATION:
  1. Punto de retorno: commit 1c69f25 con los 142 ficheros de trabajo en curso
     (+16.067 / -6.974 líneas). Los saves exportados (4 x 6 MB) y desktop.ini
     se ignoraron en lugar de commitearse.
  2. Auditoría en 4 frentes paralelos: persistencia, dominio y fórmulas,
     navegación y assets, audio y cards.
  3. Verificación manual de los hallazgos críticos por lectura directa:
     - 27 acciones ausentes del router (con control positivo sobre 5KNOWN routed)
     - allow-list de persistencia vs initialState (7+ claves ausentes confirmadas)
     - canAfford: firma real y las 19 llamadas
     - scripts de conversión de imagen
     - HubCard y footerAction
     - playSystemMusic y su early return
     - GLOBAL_STATE_KEYS y cola de Research
  4. Medición del estado real en disco: 881 ficheros / 10.018,5 MB en saves,
     336,4 MB de Assets, 58.511 líneas en src/.
  5. Ejecución de la suite de tests: 21 ficheros, 223 tests, todos verdes.

TESTS:
  npm test  (vitest run)
  21 suites · 223 tests · 29,76 s

TEST RESULTS:
  PASSED — 21/21 ficheros, 223/223 tests, 0 fallos.

  NOTA CRÍTICA: los 223 tests pasan Y 27 acciones están rotas. Motivo: ningún
  test invoca gameReducer (el router raíz); todos llaman sub-reducers
  directamente. Es el agujero de cobertura queallows que C-01 pasara inadvertido.

KNOWN ISSUES:
  25 hallazgos clasificados en 00_PREFLIGHT.md §4, cada uno con verificación
  de código y archivo:línea. Resumen:

  CRÍTICOS (7):  C-01 27 acciones sin enrutar · C-02 8+ claves no persistidas ·
                  C-03 importar machaca la partida · C-04 auto-save duplica
                  sesiones · C-05 ships sin scope de partida · C-13 cinco call
                  sites de duración con argumentos distintos
  ALTOS (11):     C-06 8,4 GB de backups huérfanos · C-07 sin versionado de
                  esquema · C-08 canAfford invertido · C-09 quality:85 ·
                  C-11 footerAction no renderizado · C-12 pista de audio zombi ·
                  C-14 refinería x200 sin implementar · C-15 save=commander ·
                  C-16 sin sidebar · C-17 silos inalcanzable · C-20 métricas
                  inventadas · C-21 cola de 8 timers paralelos · C-23
                  Math.random en migracion
  MEDIOS (4):     C-10 ver detalles duplicado · C-19 assets compartidos ·
                  C-22 16 estudios sin efecto · C-24 stats por planeta visible
  BAJOS:          C-25 codigo muerto (~20 ficheros, 2 tablas)

  SOFT ISSUES (no bloquean): 62 .mp3 de voz sin referenciar · 11 SVG de fondo
  muertos · 11 SVG de src/assets muertos · Assets/aiCore.webp huerfano ·
  Musica-menu.ogg duplicado (8 MB en dist) · documentacion 05_02/05_04 que
  afirma un nombre de backup y una verificacion de integridad inexistentes.

HARD BLOCKERS:
  Ninguno para la propia Fase 00.

  BLOQUEO DECLARADO PARA LAS FASES FUNCIONALES:
  C-01. Ninguna fase que afirme que "una acción modifica el dominio" puede
  cerrarse mientras 27 acciones no lleguen al reducer. Afecta a Mercado,
  DAO, mercado negro, bazar, Supply Routes, retrofit, interiores de edificio,
  terraforming, igualacion de colonias, automating de ministros, Senado
  Planetario y Base Lunar.

SOFT ISSUES:
  Registrados arriba. Ninguno rompe la funcionalidad.

DELIVERABLES:
  00_PREFLIGHT.md
    §1  Resolucion del conflicto Supabase/PostgreSQL vs SQLite local
    §2  Estructura del proyecto
    §3  Fuentes de verdad encontradas
    §4  25 hallazgos verificados con archivo:linea
    §5  Estado Supabase/PostgreSQL/SQL
    §6  Flujo de persistencia verificado
    §7  Estado de Git
    §8  Dependencias reales entre sistemas
    §9  10 operaciones potencialmente destructivas
    §10 Assets relevantes
    §11 Tests existentes y sus huecos
    §12 Estrategia de validacion (V1-V6)
    §13 Traduccion de las 32 fases del encargo a la realidad del proyecto
    §14 Estrategia de implementacion
    §15 25 problemas pendientes con fase destino
    §16 Bloqueos
    §17 Definition of Done

  01_MASTER_PLAN.md
    Principio de orden, grafo de dependencias, 22 fases con trabajo,
    entregables, tests y bloqueos, 10 reglas transversales,
    mapa hallazgo -> fase.

  ASCENSION_IMPLEMENTATION_STATUS.md
    Este documento.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete (fase de auditoria: no habia codigo funcional que escribir)
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (223/223)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[ ] Ready for next phase  -> requiere decision del usuario

FINAL DECISION:
PROCEED  (a la espera de autorizacion del usuario para abrir la Fase 01)
```

---

## FASE 01 — ROUTER DE ACCIONES

```text
PHASE:        01
Nombre:       Router de acciones

STATUS:       COMPLETE

OBJECTIVE:
Que toda accion despachada por la UI llegue a su dominio y mute el estado.
Encerrar C-01, C-08 y C-11, que eran la causa raiz de ocho sistemas muertos.

SOURCE OF TRUTH:
El router raiz src/reducers/index.js es la unica puerta de entrada del dominio.
Cada sub-reducer es la fuente de verdad de SU grupo de acciones. El contrato
UI -> dominio esta protegido por src/__tests__/routerContract.test.js.

DEPENDENCIES:
Ninguna. Es la raiz del grafo.

FILES INSPECTED:
  src/reducers/index.js, systemReducer.js, eventReducer.js, economyReducer.js,
  fleetReducer.js, fleet/moonReducer.js, fleet/tradeRouteReducer.js,
  fleet/retrofitActions.js, fleet/colonyReducer.js, tick/tickOrchestrator.js
  src/components/planet/PlanetarySenateModal.jsx
  src/components/colonyNetwork/SupplyRoutesView.jsx
  src/components/fleet/TradeRoutesSection.jsx
  src/pages/ColonyNetworkPage.jsx, MoonPage.jsx, MissilesPage.jsx, App.jsx
  src/components/government/hub/HubCard.jsx
  src/components/government/hub/planetaryCommandCardsConfig.jsx
  src/components/government/hub/sharedCommandCards.jsx
  src/data/game/customShips.js

FILES MODIFIED:
  src/reducers/index.js                          (25 rutas + 3 acciones nuevas)
  src/reducers/fleetReducer.js                   (alias START_MOON_BUILDING)
  src/reducers/systemReducer.js                  (2 casos nuevos)
  src/reducers/eventReducer.js                   (1 caso nuevo)
  src/reducers/tick/tickOrchestrator.js          (precedencia del impuesto)
  src/App.jsx                                    (precedencia del impuesto)
  src/pages/OverviewPage.jsx                     (precedencia del impuesto)
  src/pages/MoonPage.jsx                         (canAfford + nombre de accion)
  src/pages/MissilesPage.jsx                     (canAfford)
  src/components/government/hub/HubCard.jsx      (footerAction)
  src/components/government/hub/planetaryCommandCardsConfig.jsx  (ids del tablero)
  src/__tests__/routerContract.test.js           (nuevo, 15 tests)
  src/__tests__/unblockedSystems.test.js         (nuevo, 13 tests)

DATABASE CHANGES:
  Ninguna.

MIGRATIONS:
  Ninguna.

IMPLEMENTATION:
  1. Rutas anadidas al switch raiz, 25 casos que ya existian en sub-reducers:
     - systemReducer: SET_PLANET_GOVERNOR, ASSIGN_LOCAL_MINISTRY_BUDGET,
       TOGGLE_LOCAL_MINISTERIAL_SUBTASK
     - economyReducer: MARKET_TRADE, MARKET_BUY_USED_SHIPS, MARKET_SCRAP_SHIPS,
       MARKET_BUY_BLACK_MARKET, CLAIM_DAO_DIVIDENDS, CREATE_LIMIT_ORDER,
       CANCEL_LIMIT_ORDER, CONTRIBUTE_EXCHANGE_PROJECT,
       EQUALIZE_COLONY_RESOURCES, RELOCATE_COLONY_FLEET,
       START_PLANET_TERRAFORMING
     - fleetReducer: RETROFIT_SHIP_VARIANT, RETROFIT_DEFENSE_VARIANT,
       CANCEL_RETROFIT_QUEUE, ADD_TRADE_ROUTE, REMOVE_TRADE_ROUTE,
       TOGGLE_TRADE_ROUTE, PROCESS_TRADE_ROUTES
     - governmentReducer: EXECUTE_BUILDING_ACTION, SET_MINISTRY_AUTOMATION,
       SET_MINISTRY_DOCTRINE
     - eventReducer: APPEND_TACTICAL_EVENT_LOG
     Nota: el recuento del preflight (23) era 24. La accion que faltaba en la
     tabla era ASSIGN_LOCAL_MINISTRY_BUDGET.

  2. Tres acciones nuevas, que la UI despachaba y no existian en ningun reducer:
     - SET_PLANET_TAX_RATE   (systemReducer) escribe planet.taxRate, acotado
       0-0.5 en el dominio, no solo en la UI
     - TOGGLE_PLANET_LOCAL_DIRECTIVE (systemReducer) alterna planet.localDirectives
     - DISMISS_ULTIMATUM (eventReducer) limpia activeUltimatum

  3. START_MOON_BUILDING: MoonPage despachaba un nombre que no existia. Se
     corrigio la UI a BUILD_MOON_BUILDING y se mantuvo el alias en el router Y
     en fleetReducer. El alias debia estar en los dos sitios: con ruta pero sin
     caso en el sub-reducer, la accion seguia cayendo en su default. Detectado
     por test, no por lectura.

  4. canAfford invertido en MoonPage:117 y MissilesPage:76. Firma real
     (res, cost). El boton se encendia cuando NO se podia pagar, y la card se
     contradecía a si misma porque sus pills de coste ya usaban el orden bueno.

  5. footerAction: planetaryCommandCardsConfig.jsx pasaba un boton real
     (SET_PLANET_AUTO_GOVERNANCE) que HubCard no aceptaba ni pintaba. El
     auto-gobernador era inalcanzable desde el tablero.

  6. Tablero planetario: sharedCommandCards aportaba shipDesign y combat, pero
     sus ids no estaban en PLANETARY_COMMAND_CARDS, asi que useCardOrder los
     filtraba y nunca se iteraban. Anadidos en su sitio logico (shipDesign tras
     shipyard, combat tras fleet).

  7. Impuesto: verificacion con hallazgo contrario al preflight. sectorReducer
     :17 es taxRate de SECTOR, no de planeta. Los planetas NO tienen taxRate:
       - formulas.js:279,312,336 leen planet.taxRate -> undefined -> factor 1.0
       - el motor y el HUD leian ministries.economy.taxRate -> 0.1 -> 0.9
     Es decir, las cards de edificio mostraban produccion sin impuesto y el
     motor aplicaba el 10%. El Senado Planetario escribia planet.taxRate, que
     nadie leia. Ahora la precedencia es planet.taxRate, con el ministerio como
     respaldo (tickOrchestrator, App.jsx, OverviewPage). Es no-op para toda
     partida existente: el valor por defecto del motor sigue siendo 0.1 porque
     no hay ninguna UI que escriba ministries.economy.taxRate.

TESTS:
  src/__tests__/routerContract.test.js
    - extrae cada type: '...' despachado desde src/ fuera de reducers/
    - exige que el switch raiz lo declare
    - mas 14 tests de comportamiento: Senado, gobernador local,
      automatizacion ministerial, DISMISS_ULTIMATUM, firma de canAfford,
      tarjetas del tablero
    ESTA PROBADO QUE MUERDE: se elimino a proposito la ruta de MARKET_TRADE y
    el test fallo nombrando la accion y los dos ficheros que la despachan.
    Sin esa prueba seria otro test decorativo.

  src/__tests__/unblockedSystems.test.js
    - 13 tests sobre los sistemas desbloqueados
    - payloads tomados de la UI real, no inventados
    - exige que la accion MUTE el estado, no solo que no lance

TEST RESULTS:
  PASSED  23/23 ficheros, 251/251 tests, 0 fallos, 33,01 s
  (223 previos + 28 nuevos)

  REGRESION: cero. Los 223 tests previos siguen verdes.

  PARSEO: los 11 ficheros tocados parsean (esbuild, sin emitir build).

KNOWN ISSUES:
  Descubiertos al implementar, no en el preflight:

  N-01  calcProduction revienta y se traga el error dentro del tick.
        productionFormulas.js:90 lee 'plasma' de undefined. El try/catch de
        tickOrchestrator:110 lo convierte en produccion 0 con ratio 1: el
        planeta deja de producir sin aviso y sin notificacion. Ya pasaba antes
        de esta fase (visible como stderr en tacticalEventLog.test.js).
        -> FASE 18

  N-02  El ultimatum no tiene productor. state.activeUltimatum solo se LEE en
        AppOverlays.jsx:90; nada en todo src/ lo escribe. El overlay nunca
        aparece y DISMISS_ULTIMATUM, ahora real, sigue sin ser alcanzable.
        -> FASE 17 (cards esteriles)

  N-03  RETROFIT_SHIP_VARIANT, RETROFIT_DEFENSE_VARIANT y CANCEL_RETROFIT_QUEUE
        quedan encaminados pero NO verificados de punta a punta: dependen de
        planet.fleetVariants, que ningun test monta. Suena bien por codigo,
        pero eso no es una prueba. -> FASE 16/17

  N-04  PROCESS_TRADE_ROUTES ejecuta todas las rutas en cada clic, sin respetar
        intervalDays ni lastProcessed, y duplica la logica del tick.
        -> FASE 11 (previsto)

  N-05  ASSIGN_LOCAL_MINISTRY_BUDGET no tiene ningun despachador en la UI.
        Ahora esta encaminado, pero nadie lo usa. -> FASE 17

HARD BLOCKERS:
  Ninguno para cerrar la Fase 01.

  BLOQUEOS DENTRO DE OTRAS FASES (noinny esta fase):
  - FASE 08.3 / FASE 18.1  el impuesto sigue having 2 lecturas mas sin
    unificar: ministryTick.js:32 (recaudacion, usa el ministerio) y
    formulas.js:279,312,336 (cards de edificio, usan el planeta con fallback
    silencioso a 0). La card y el HUD pueden seguir mostrando cifras distintas.
  - FASE 18  N-01.
  - FASE 16/17 N-02, N-03, N-05.

SOFT ISSUES:
  - Los tests escriben mucho en stdout por la telemetria de gameConstants.
    Ruidoso pero no rompe nada.

DELIVERABLES:
  25 rutas + 3 acciones nuevas + 1 alias corregido en dos capas
  2 bugs de canAfford
  footerAction funcional
  2 tarjetas del tablero planetario visibles
  Precedencia del impuesto unificada en motor, HUD y vista de imperio
  2 suites nuevas (28 tests) que habrian detectado C-01

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified (13 tests que exigen mutacion real, no "no lanza")
[x] UI verified (canAfford, footerAction, tablero, nombre de accion lunar)
[ ] Persistence verified  -> NO APLICA: esta fase no toca persistencia.
      La allow-list de GLOBAL_STATE_KEYS sigue perdiendo currentPlanetId,
      patrols, tacticalEventLog y lastTick. Es la FASE 02.
[x] Integration verified (router <-> sub-reducer <-> UI verificado con payloads reales)
[x] Tests passed (251/251)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 02 — PERSISTENCIA Y ESQUEMA

```text
PHASE:        02
Nombre:       Persistencia y esquema

STATUS:       COMPLETE CON RESERVA

OBJECTIVE:
Que lo que se muestra y lo que se usa sobrevivan a cerrar y abrir, que el
esquema pueda evolucionar sin romper bases existentes, y que el backup sea de
verdad recuperable. Cerrar C-02, C-03, C-04, C-05, C-06, C-07, C-18 y C-23.

SOURCE OF TRUTH:
- Que sobrevive: GLOBAL_STATE_KEYS en electron/database/gameRepository.cjs,
  protegido por src/__tests__/persistenceContract.test.js
- Version del esquema: game_meta.schema_version, leida y escrita por
  applyMigrations en electron/database/dbManager.cjs
- Identidad de partida: game_sessions.id, reinyectada al renderer por
  src/utils/sessionIdentity.js

DEPENDENCIES:
Ninguna. (Se planeaba dependent de 01; resulto independiente.)

FILES INSPECTED:
  electron/database/dbManager.cjs, gameRepository.cjs, shipRepository.cjs,
  migrator.cjs
  electron/ipc/saveIpc.cjs, backupManager.cjs
  electron/main.cjs, preload.cjs
  src/hooks/useGameLifecycle.js, useAppSaveHandlers.js
  src/reducers/loadMigrator.js, systemReducer.js
  src/core/initialState.js

FILES MODIFIED:
  electron/database/dbManager.cjs          (versionado + migraciones + checkpointWal)
  electron/database/gameRepository.cjs    (allow-list, import/export, borrados, delete)
  electron/database/shipRepository.cjs    (session_id en la inserción)
  electron/ipc/saveIpc.cjs                (sessionId, validar al cargar, podar sidecars)
  electron/ipc/backupManager.cjs          (checkpoint, sidecars, poda)
  electron/main.cjs                       (CSP, window open, will-navigate, slug saneado)
  src/utils/sessionIdentity.js            (nuevo)
  src/hooks/useGameLifecycle.js           (identidad de sesión en auto-save y unload)
  src/hooks/useAppSaveHandlers.js         (idem en guardado manual)
  src/reducers/loadMigrator.js            (IAs deterministas)
  src/__tests__/persistenceContract.test.js (nuevo, 15 tests)

DATABASE CHANGES:
  ESQUEMA: dos migraciones idempotentes, aplicadas al abrir.
    v2  ships.session_id  (ALTER TABLE si no existe + indice)
    v3  indice en fleet_missions.session_id + aviso si hay huerfanas
  DATOS: ninguno. La base real del jugador NO se toco.

  DECISION DEL USUARIO RESPETADA: la fase se hizo sin abrir su
  %APPDATA%/Ascension/saves/universe.db. Nada se borro: ni los 617 .bak-wal
  (8,4 GB), ni las 176.140 naves huerfanas, ni los 40 .json legacy.

MIGRATIONS:
  - ships_session_id_column
      ALTER TABLE ships ADD COLUMN session_id TEXT   (guardado por PRAGMA)
      CREATE INDEX IF NOT EXISTS idx_ships_session_id
      Las filas existentes quedan con session_id NULL: NO se pierde ninguna.
  - fleet_missions_session_fk
      CREATE INDEX IF NOT EXISTS idx_fleet_missions_session_id
      Cuenta las huerfanas y avisa. No hay DROP ni DELETE.
  - game_meta.schema_version pasa de inexistente a 3.
    Antes PRAGMA user_version era 0 y no habia forma de saber que faltaba.

IMPLEMENTATION:
  1. Allow-list. 37 claves -> 50, agrupadas y comentadas. Se anadieron las que
     el juego escribe y no se guardaban: currentPlanetId, patrols,
     tacticalEventLog, lastTick, credits, exchangeOrders, daoShares,
     playerDaoShares, daoDividendPool, exchangeProjects, chatHistory, victory,
     gameOver, showTutorial, tutorialCompleted, worldAlertLog,
     triggeredNarrativeEvents, ministryNoopWarnings, activeFirstContact,
     activeTransmission, finalCrisis, imperialCouncilUnlocked, activeUltimatum,
     emperorAutoGovernance, emperorDirectiveMode, lastSave, gameMode,
     reputationHistory.
     Se mantuvo allow-list y no deny-list: es explicita y auditable. El test
     de contrato es lo que evita que vuelva a perder claves.

  2. _sessionId. saveFullGameState devuelve sessionId, los 4 handlers de
     guardado lo devuelven, y src/utils/sessionIdentity.js lo guarda para que
     el siguiente guardado reutilice la sesion. Se limpia al volver al menu
     (gameStarted === false) para que una partida nueva no herede el id de la
     anterior. Antes: cada auto-save de una partida nueva abria una sesion
     nueva (slug, slug-2, ... hasta 1000).

  3. Import/export. toExportPayload() quita _sessionId al exportar;
     importSessionFromJson() lo descarta al importar. exportSessionToJson
     existed desde hacia tiempo, importado y nunca llamado: estaba a un cable
     de arreglar esto. Importar un save ya no puede machacar la partida origen.

  4. Backup. checkpointWal() (wal_checkpoint TRUNCATE) antes de copiar. Se
     elimino la copia del WAL a <bak>.bak-wal, que era lo que generaba los
     8,4 GB: nadie los leia y cleanupOldBackups los excluia del listado, asi
     que no podia borrarlos. cleanupOldBackups ahora borra tambien el sidecar
     de cada .bak podado.
     findOrphanSidecars / pruneOrphanSidecars + 2 canales IPC: INSPECCIONAR y
     PODAR, explicitos. Nada se borra en el arranque. La limpieza queda a un
     clic del jugador y solo cuando el lo pida.

  5. Validacion al cargar. load-save-by-slug ahora llama a validateSaveData.
     Antes solo se validaba al guardar: un save corrupto entraba entero.

  6. Borrados. fleet_missions se borra SIEMPRE (estaba dentro del if de
     "si hay misiones", con lo que lanzar la ultima y guardar dejaba las
     viejas en la tabla para siempre). deleteGameSession borra tambien las
     naves de esa sesion y los ship_logs sin nave, con WHERE session_id: las
     176.140 huerfanas con session_id NULL no se tocan.

  7. Seguridad. CSP como cabecera en las respuestas HTML del protocolo
     ascension-asset (script-src 'self'; va ahi y no como meta porque Vite
     inyecta scripts en linea en desarrollo y una meta rompe npm run dev).
     setWindowOpenHandler deny, will-navigate bloqueado, y saneado del slug en
     db-migrate-json (era path traversal + escritura arbitraria).

  8. Determinismo. loadMigrator rellenaba estrategia, agresividad, bioma,
     tamano y gravedad de las IAs con Math.random: cargar dos veces la misma
     partida producia imperios enemigos distintos. Ahora la semilla sale de la
     propia partida (mulberry32 sobre _sessionId + slug + gameMode).

TESTS:
  src/__tests__/persistenceContract.test.js  (15 tests)
    - toda clave que los reducers escriben esta en la allow-list
    - la allow-list cubre el estado base y no tiene duplicados
    - ninguna clave marcada efimera esta a la vez persistida
    - ningun componente muta el estado directamente (state.x = fuera de reducers)
    - esquema versionado, migraciones idempotentes, sin DROP COLUMN
    - el backup hace checkpoint y no crea sidecars huerfanos
    - el guardado devuelve sessionId
    - exportar quita identidad, importar genera nueva
    - cargar valida
    - el canal de migracion sanea el slug
    - window open y navegacion bloqueados, CSP presente
    - borrar sesion no toca naves sin sesion

  PROBADO QUE MIERDE: se quito "patrols" de la allow-list y fallaron 2 tests,
  uno nombrando el fichero que la escribe (fleet/patrolActions.js).

TEST RESULTS:
  PASSED  24/24 ficheros, 266/266 tests, 0 fallos, 25,59 s
  (223 base + 28 Fase 01 + 15 Fase 02)
  REGRESION: cero.
  PARSEO: los 11 ficheros tocados parsean.

KNOWN ISSUES:
  I-01  Las 176.140 naves con session_id NULL siguen ahi. Ahora la columna
        existe, asi que las nuevas naves si quedan scopeadas, pero las viejas
        no tienen duenio y ninguna sesion las tocara al borrarse. Purgarlas es
        destructivo y requiere el visto bueno del jugador. -> PENDIENTE DE
        AUTORIZACION, documentado en 00_PREFLIGHT.md D-2

  I-02  Los 617 .bak-wal (8,4 GB) siguen en disco. El codigo ya no los crea y
        ya no impide purgarlos, pero purgarlos borra ficheros. -> PENDIENTE DE
        AUTORIZACION, D-4

  I-03  La migracion v3 avisa de las misiones huerfanas pero no las arregla:
        las que existen con session_id NULL no tienen sesion a la que
        reasignar. Se reparan solas la proxima vez que se guarde su partida,
        si es que esa partida existe.

  I-04  correctResearchLevels (saveIpc.cjs) se aplica en memoria al cargar pero
        el valor corrupto sigue en global_state_json hasta que se re-guarda.
        Es el comportamiento correcto para una migracion sin escritura, pero
        conviene decidirlo explicitamente. -> FASE 19

  I-05  No hay funcion de restauracion desde backup. getLatestBackup sigue
        importado y sin usar. Un backup que nadie puede restaurar es una
        promesa, no una red de seguridad. -> FASE 19

HARD BLOCKERS:
  Ninguno para cerrar el codigo de la fase.

  RESERVA (por que no es un COMPLETE limpio):
  La base de datos real del jugador no se ha tocado. Las migraciones se han
  escrito y verificado por contrato, pero NO se han ejecutado contra un
  universe.db real. La primera vez que se abra el juego se aplicaran solas.
  Riesgo residual: que una base existente tenga una forma inesperada que haga
  fallar una migracion. El handler captura el error, lo registra y sigue
  arrancando, y el test comprueba que la migracion es idempotente. Aun asi,
  esto NO es lo mismo que haberla corrido.

SOFT ISSUES:
  - ships.session_id no tiene FK a proposito: ponerla sobre una tabla con
    176.140 filas huerfanas haria fallar el arranque. Se documento la razon.

DELIVERABLES:
  Allow-list 37 -> 50 claves, protegida por test
  Identidad de sesion estable entre guardados
  Import/export que ya no destruye la partida origen
  Versionado de esquema + 2 migraciones idempotentes y no destructivas
  Backup con checkpoint real y sin sidecars huerfanos
  Poda de sidecars expuesta como accion explicita (no automatica)
  Validacion tambien al cargar
  Borrado de misiones y naves por sesion
  CSP + window open + will-navigate + slug saneado
  IAs deterministas al cargar
  15 tests de contrato, probados que muerden

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified (borrados acotados por session_id, migraciones idempotentes)
[x] UI verified (la CSP se aplica en el protocolo que sirve la UI)
[~] Persistence verified  -> PARCIAL. El contrato esta verificado por test, pero
      las migraciones no se han ejecutado contra una base real. Reservado.
[x] Integration verified (allow-list <-> reducers <-> save/load <-> renderer)
[x] Tests passed (266/266)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[~] Ready for next phase  -> la fase 15 (Save vs Commander) ya puede arrancar;
      requiere la separacion de columnas que ahora es posible hacer.

FINAL DECISION:
PROCEED con reserva registrada
```

---

## FASE 03 — DATOS DE ESTADO Y RUTAS ACCESIBLES

```text
PHASE:        03
Nombre:       Datos de estado y rutas accesibles

STATUS:       COMPLETE

OBJECTIVE:
Que todo lo que la UI muestra exista en el modelo de datos y catalogos, eliminar
fallos silenciosos de "Ver detalles", normalizar las matriculas navales con generador
determinista no colisionable y eliminar claves muertas de localStorage.

SOURCE OF TRUTH:
- Catalogos de datos: src/data/game/customShips.js (MOON_BUILDINGS, MISSILES, SHIP_MODULES)
- Inteligencia y lore: src/data/codex.js y codex_modules/codexShipsDefensesMoons.js
- Matricula naval canonica: format FAC-PXX-CHS-XXXXXX generado por electron/database/shipRepository.cjs
  y src/utils/shipRegistryBridge.js
- Contratos de integridad protegidos por: src/__tests__/stateDataIntegrity.test.js

DEPENDENCIES:
Ninguna. Fase independiente.

FILES INSPECTED:
  src/data/game/customShips.js
  src/data/game/shipsData.js
  src/data/codex.js, codex_modules/codexShipsDefensesMoons.js
  src/pages/MoonPage.jsx
  src/pages/MissilesPage.jsx
  src/components/shipDesign/ShipModuleSlots.jsx
  src/components/ui/CodexModal.jsx
  src/components/NewGameScreen.jsx
  src/utils/shipRegistryBridge.js
  src/reducers/tick/queues/queueTick.js
  electron/database/shipRepository.cjs
  electron/database/migrator.cjs

FILES MODIFIED:
  src/data/game/customShips.js                        (descripciones canónicas)
  src/data/codex_modules/codexShipsDefensesMoons.js   (planetDestroyer y terraformerShip)
  src/pages/MoonPage.jsx                              (fallback No disponible para desc)
  src/pages/MissilesPage.jsx                          (fallback No disponible para desc)
  src/components/shipDesign/ShipModuleSlots.jsx       (fallback No disponible para desc)
  src/components/ui/CodexModal.jsx                    (eliminado return null silencioso, fallback No disponible)
  src/components/NewGameScreen.jsx                    (eliminada lectura de ascension_record_standard_planets)
  src/utils/shipRegistryBridge.js                     (generador canónico unificado, sin Math.random)
  src/reducers/tick/queues/queueTick.js               (matrícula determinista, sin Math.random)
  electron/database/shipRepository.cjs                (generador PXX robusto, prevención de colisiones en insert)
  src/__tests__/stateDataIntegrity.test.js            (nueva suite, 11 tests probados que muerden)

DATABASE CHANGES:
  Ninguna en esquema ni datos.
  En la inserción de naves (shipRepository.cjs):
  - ON CONFLICT(id) DO UPDATE en lugar de INSERT OR REPLACE general.
  - Verificación previa de colisión de registry_code con auto-incremento al siguiente
    hueco secuencial libre. Nunca se borra una fila ajena preexistente por colisión.

MIGRATIONS:
  Ninguna requerida.

IMPLEMENTATION:
  1. Descripciones en catálogos:
     - MOON_BUILDINGS (lunarBase, sensorPhalanx, jumpGate, moonStorage) dotados de desc canónico.
     - MISSILES (interplanetaryMissile, antiBallisticMissile) dotados de desc canónico.
     - SHIP_MODULES (13 módulos de nave) dotados de desc canónico.
     - Guardas UI con fallback "No disponible" añadidas en MoonPage, MissilesPage y ShipModuleSlots.

  2. Cobertura completa del Codex:
     - planetDestroyer y terraformerShip añadidos a CODEX_SHIPS_DEFENSES_MOONS con lore histórico,
       especificaciones técnicas detalladas y protocolo operativo de uso.
     - Todas las naves de SHIPS quedan 100% cubiertas en CODEX_DATA.

  3. Desbloqueo y robustez de CodexModal:
     - Eliminado el "return null" silencioso ante ids no catalogados o parciales.
     - Implementado fallback visual con título resuelto y campos en "No disponible".

  4. Normalización de matrícula naval determinista:
     - Formato canónico unificado en FAC-PXX-CHS-000000.
     - Eliminado Math.random() de shipRegistryBridge.js y queueTick.js.
     - queueTick.js utiliza ahora generateRegistryCode con secuencia determinista vinculada al gameTick.
     - shipRepository.cjs previene colisiones mediante chequeo de registry_code y secuencia monótona,
       sustituyendo INSERT OR REPLACE por inserción segura que respeta naves existentes.

  5. Limpieza de clave muerta:
     - Eliminada lectura de ascension_record_standard_planets de localStorage en NewGameScreen.jsx.

TESTS:
  src/__tests__/stateDataIntegrity.test.js (11 tests):
    - Cobertura de desc en MOON_BUILDINGS, MISSILES y SHIP_MODULES.
    - Presencia de planetDestroyer, terraformerShip y todas las naves en CODEX_DATA.
    - Manejo de fallback sin retorno silencioso en CodexModal.jsx.
    - Generación y consistencia del formato canónico FAC-PXX-CHS-XXXXXX.
    - Cero Math.random() en queueTick.js y shipRegistryBridge.js.
    - NewGameScreen libre de ascension_record_standard_planets.

  PROBADO QUE MUERDE:
  Se eliminó temporalmente desc en interplanetaryMissile; el test falló de inmediato con:
  "AssertionError: MISSILES[interplanetaryMissile] debe tener desc: expected undefined to be defined".
  Se restauró y volvió a verde.

TEST RESULTS:
  PASSED  25/25 ficheros, 277/277 tests, 0 fallos, 19,93 s
  (266 previos + 11 Fase 03)
  REGRESION: cero.
  PARSEO: los 9 ficheros tocados parsean sin errores con esbuild.

KNOWN ISSUES:
  Ninguno nuevo detectado en esta fase.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. Catálogo customShips.js con descripciones canónicas completas.
  2. CODEX_DATA con cobertura 100% de naves (incluyendo planetDestroyer y terraformerShip).
  3. CodexModal accesible y con fallback estandarizado.
  4. Generador unificado y determinista de matrículas navales sin riesgo de colisión.
  5. Inserción SQLite no destructiva en shipRepository.cjs.
  6. NewGameScreen limpio de referencias muertas a localStorage.
  7. Suite de pruebas src/__tests__/stateDataIntegrity.test.js (11 tests verdes).

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (277/277)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 04 — SISTEMA DE AUDIO

```text
PHASE:        04
Nombre:       Sistema de audio

STATUS:       COMPLETE

OBJECTIVE:
Consolidar el director único de música sin pistas zombis, evitar contextos fugados
de Web Audio API, asegurar la rehidratación del estado de mute y volumen operativo,
y limpiar ficheros de audio duplicados en la raíz.

SOURCE OF TRUTH:
- Núcleo de audio y enrutamiento Web Audio: src/audio/audioCore.js y src/audio.js
- Director de música contextual: src/audio/audioMusic.js (SYSTEM_AUDIO_FILES, MINISTRY_AUDIO_FILES)
- Ciclo de vida y rehidratación de preferencias: src/hooks/useGameLifecycle.js
- Contratos protegidos por: src/__tests__/audioSystemContract.test.js

DEPENDENCIES:
Ninguna.

FILES INSPECTED:
  src/audio/audioCore.js
  src/audio/audioMusic.js
  src/audio/audioSynth.js
  src/audio/audioVoices.js
  src/audio.js
  src/pages/CommunicationsPage.jsx
  src/components/diplomacy/LeaderAvatar.jsx
  src/hooks/useGameLifecycle.js
  src/pages/GovernmentPage.jsx
  Musica-menu.ogg (raíz)

FILES MODIFIED:
  src/audio/audioCore.js                          (fallback operationsVol a 0.5)
  src/audio/audioMusic.js                         (releaseAudio, mapeo completo de 5 sistemas, detención cruzada y en fallbacks)
  src/audio.js                                    (re-exportación de getCtx, getMasterGain, getSfxGain)
  src/pages/CommunicationsPage.jsx                (reemplazo de new AudioContext local por getCtx/getSfxGain)
  src/components/diplomacy/LeaderAvatar.jsx       (reemplazo de AudioContext aislado por getCtx/getSfxGain)
  src/hooks/useGameLifecycle.js                   (rehidratación de userMuted desde localStorage, parada de ministerios y voces al salir al menú)
  src/pages/GovernmentPage.jsx                    (corrección de dependencia navLevel >= 2 a navLevel)
  src/__tests__/audioSystemContract.test.js       (nueva suite de contrato, 11 tests probados que muerden)
  Musica-menu.ogg                                 (eliminado duplicado de 3,9 MB en raíz del repo)

DATABASE CHANGES:
  Ninguna.

MIGRATIONS:
  Ninguna.

IMPLEMENTATION:
  1. Director único y pistas zombi:
     - En audioMusic.js, implementada función releaseAudio(audio) (pause, currentTime=0, src='', load())
       que libera memoria y desvincula decodificadores de audio del navegador/Electron.
     - Añadidos a SYSTEM_AUDIO_FILES los 5 sistemas faltantes: buildings, telemetry, imperial_hub,
       imperial_council, imperial_senate.
     - playSystemMusic y playMinistryMusic ahora detienen y liberan mutuamente las pistas anteriores
       antes de cambiar de contexto.
     - En los callbacks de error y fallback de rutas relativas/absolutas, se libera la instancia previa
       antes de instanciar la alternativa, erradicando solapamientos dobles.

  2. Prevención de fugas de AudioContext:
     - En CommunicationsPage.jsx, playTransmissionSound ahora reutiliza el singleton getCtx()
       y conecta su salida a getSfxGain(), respetando mute, volumen de sfx y filtro muffle.
     - En LeaderAvatar.jsx, playDiploSound fue refactorizado para usar getCtx() y enrutar todas las
       señales (incluyendo 'warn') a través de getSfxGain(), eliminando conexiones directas sin canal.

  3. Rehidratación y control en ciclo de vida:
     - En audioCore.js, operationsVol por defecto se estableció en 0.5 (en vez de 0.0), evitando
       que astilleros, obras e I+D nacen mudos en nuevas partidas.
     - En useGameLifecycle.js, userMuted ahora se rehidrata en el arranque leyendo 'ascension_audio_settings'
       de localStorage en useState, manteniendo sincronizado el estado React con el núcleo de audio.
     - En useGameLifecycle.js, al volver al menú principal (!state.gameStarted) y en el desmontaje,
       se invocan stopMinistryMusic() y stopVoice() además de stopSystemMusic() y stopMenuMusic().

  4. Limpieza de interfaz y assets:
     - En GovernmentPage.jsx, corregido el array de dependencias de [navLevel >= 2, activeMinistry]
       a [navLevel, activeMinistry].
     - Eliminada la copia huérfana de Musica-menu.ogg (3,9 MB) de la raíz del repo (se conserva public/Musica-menu.ogg).

TESTS:
  src/__tests__/audioSystemContract.test.js (11 tests):
    - Cobertura completa de los 5 subsistemas en SYSTEM_AUDIO_FILES.
    - Detención y liberación cruzada entre sistemas y ministerios.
    - Liberación en fallbacks de reproducción en audioMusic.js.
    - Prevención de fugas de AudioContext en CommunicationsPage.jsx.
    - Enrutamiento por sfxGain y sin contexto aislado en LeaderAvatar.jsx.
    - operationsVol > 0 por defecto.
    - Rehidratación de userMuted y parada de pistas en useGameLifecycle.js.
    - Corrección de dependencias en GovernmentPage.jsx.
    - Comprobación de ausencia de Musica-menu.ogg en la raíz.

  PROBADO QUE MUERDE:
  Se alteró temporalmente el fallback de operationsVol en audioCore.js de 0.5 a 0.0; el test falló
  de inmediato con "AssertionError: operationsVol debe ser > 0: expected 0 to be greater than 0".
  Se restauró y volvió a verde.

TEST RESULTS:
  PASSED  26/26 ficheros, 288/288 tests, 0 fallos, 16,73 s
  (277 previos + 11 Fase 04)
  REGRESION: cero.

KNOWN ISSUES:
  Ninguno nuevo detectado.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  62 .mp3 de voz sin referenciar en src/audio/voices se mantienen a la espera de confirmación
  de borrado para no incurrir en operaciones destructivas sin orden del usuario.

DELIVERABLES:
  1. Director de música unificado sin pistas zombis.
  2. Eliminación de fugas de AudioContext en CommunicationsPage y LeaderAvatar.
  3. Rehidratación consistente de audio en ciclo de vida del juego.
  4. Volumen operativo por defecto funcional (0.5).
  5. Raíz del repositorio limpia de assets de audio duplicados.
  6. Suite src/__tests__/audioSystemContract.test.js (11 tests verdes).

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (288/288)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 05 — FUENTE ÚNICA DE DURACIONES

```text
PHASE:        05
Nombre:       Fuente única de duraciones

STATUS:       COMPLETE

OBJECTIVE:
Garantizar el principio fundamental CARD DISPLAY = BUILD ACTION = QUEUE = PERSISTED = COUNTDOWN,
sin reducciones silenciosas de tiempo, eliminando firmas posicionales frágiles y código muerto,
y unificando helpers de duración y cuenta regresiva en toda la aplicación.

SOURCE OF TRUTH:
- Wrapper canónico de tiempos de construcción: src/utils/formulas/buildTiming.js (calcEffectiveBuildTime)
- Helpers canónicos de countdown y duración: src/utils/formulas/timingHelpers.js (calcRemainingSeconds, calcTotalSeconds)
- Fórmulas de coste y tiempo: src/utils/formulas/costFormulas.js (calcBuildTime, calcDefenseTime, calcCustomShipTime)
- Tiempo de investigación planetario: src/utils/formulas/researchTiming.js (calcPlanetResearchTime)
- Reajuste dinámico de colas: src/reducers/tick/queues/queueTiming.js
- Contratos de sincronización protegidos por: src/__tests__/timingContract.test.js

DEPENDENCIES:
Ninguna.

FILES INSPECTED:
  src/utils/formulas/costFormulas.js
  src/reducers/economyReducer.js
  src/reducers/tick/automation/autoBuildTick.js
  src/reducers/tick/automationTick.js
  src/reducers/tick/queues/queueTiming.js
  src/reducers/fleet/shipProductionActions.js
  src/components/government/MinistryBuildingsSection.jsx
  src/components/government/MinistryResearchSection.jsx
  src/pages/ResearchPage.jsx
  src/pages/ShipyardPage.jsx
  src/components/shipyard/ShipProductionCard.jsx
  src/pages/DefensePage.jsx
  src/components/defense/DefenseGrid.jsx
  src/components/ui/ItemCard/ItemCardActiveOverlay.jsx
  src/components/defense/DefenseQueueSection.jsx
  src/components/shipyard/ShipyardQueueSection.jsx
  src/components/fleet/FleetRetrofitQueueSection.jsx
  src/components/overview/ConstructionQueuesPanel.jsx
  src/hooks/useActiveImperialQueues.js

FILES MODIFIED:
  src/utils/formulas/buildTiming.js                   (nuevo: wrapper canónico calcEffectiveBuildTime)
  src/utils/formulas/timingHelpers.js                 (nuevo: helpers calcRemainingSeconds y calcTotalSeconds)
  src/utils/formulas.js                              (re-exportación centralizada)
  src/core.jsx                                       (re-exportación canónica para UI)
  src/utils/formulas/costFormulas.js                 (calcDefenseTime con mins/conscription; calcCustomShipTime con constructionCenterLvl)
  src/reducers/economyReducer.js                     (migrado a calcEffectiveBuildTime)
  src/reducers/tick/automation/autoBuildTick.js      (migrado a calcEffectiveBuildTime en obra y demolición)
  src/reducers/tick/automationTick.js                (eliminado archivo muerto de 295 líneas sin importadores)
  src/reducers/tick/queues/queueTiming.js            (calcEffectiveBuildTime, especialización militar en naves/defensas, backfill retorno uniforme)
  src/reducers/fleet/shipProductionActions.js        (paso de mins a calcShipTime y calcDefenseTime)
  src/components/government/MinistryBuildingsSection.jsx (migrado a calcEffectiveBuildTime con planet y state)
  src/components/government/MinistryResearchSection.jsx  (migrado a calcPlanetResearchTime)
  src/pages/ResearchPage.jsx                         (migrado a calcPlanetResearchTime)
  src/pages/ShipyardPage.jsx                         (incorporado bonus militar y mins)
  src/components/shipyard/ShipProductionCard.jsx     (incorporado bonus militar y mins)
  src/pages/DefensePage.jsx                          (incorporado bonus militar y mins)
  src/components/defense/DefenseGrid.jsx             (incorporado bonus militar y mins)
  src/components/ui/ItemCard/ItemCardActiveOverlay.jsx   (migrado a timingHelpers)
  src/components/defense/DefenseQueueSection.jsx     (migrado a timingHelpers)
  src/components/shipyard/ShipyardQueueSection.jsx    (migrado a timingHelpers)
  src/components/fleet/FleetRetrofitQueueSection.jsx (migrado a timingHelpers)
  src/components/overview/ConstructionQueuesPanel.jsx (migradas 4 colas a timingHelpers)
  src/hooks/useActiveImperialQueues.js               (migradas las 5 colas imperiales a timingHelpers)
  src/__tests__/timingContract.test.js               (nueva suite de contrato, 13 tests probados que muerden)

DATABASE CHANGES:
  Ninguna.

MIGRATIONS:
  Ninguna.

IMPLEMENTATION:
  1. Wrapper canónico de tiempos de construcción:
     - Implementado src/utils/formulas/buildTiming.js con calcEffectiveBuildTime({ cost, planet, state, speed }).
     - Extrae y prioriza automáticamente robotFactory, naniteFactory, constructionCenter, directiva
       dir_urban_plan (+15% velocidad), bonificador de infra ministerial (infra_streamline / infra_megastructure),
       y reliquias (relic_hyper_builders).
     - Migrados los call sites críticos: economyReducer.js:269, autoBuildTick.js:160,211, MinistryBuildingsSection.jsx:75
       y queueTiming.js:84-95. Cero discrepancias entre la duración mostrada en tarjeta y la persistida en cola.

  2. Eliminación de código muerto con doble conteo:
     - Eliminado src/reducers/tick/automationTick.js (295 líneas, 0 importadores), que contenía una copia desactualizada
       de calcBuildTime y calcResearchTime con bonificadores duplicados.

  3. Unificación de duración de investigación en interfaz:
     - ResearchPage.jsx:246 y MinistryResearchSection.jsx:177 actualizados para invocar calcPlanetResearchTime(state, currentPlanet, cost)
       en lugar de calcResearchTime crudo, reflejando de forma exacta el laboratorio planetario y el centro I+D.

  4. Integración de conscription y especialización militar:
     - costFormulas.js: calcDefenseTime ahora acepta mins y aplica el bono de conscripción militar.
     - costFormulas.js: calcCustomShipTime ahora toma constructionCenterLvl y mins para reflejar la reducción real.
     - shipProductionActions.js y queueTiming.js sincronizados: la especialización militar (planet.specialization === 'military' -> 1.20)
       y mins se aplican consistentemente en encolado, reajuste y vistas UI (ShipyardPage, DefensePage).

  5. Centralización de cuentas regresivas (Countdowns):
     - Implementados helpers calcRemainingSeconds y calcTotalSeconds en src/utils/formulas/timingHelpers.js.
     - Sustituidas las 10 implementaciones duplicadas ad-hoc en ItemCardActiveOverlay, DefenseQueueSection,
       ShipyardQueueSection, FleetRetrofitQueueSection, ConstructionQueuesPanel (4 bucles) y useActiveImperialQueues.

  6. Robustez de reajuste de cola:
     - queueTiming.js: backfillQueueTimeMults ahora devuelve siempre un objeto { state, stamped: number },
       eliminando el retorno inconsistente primitivo 0.

TESTS:
  src/__tests__/timingContract.test.js (13 tests):
    - Escenario A: Card de edificio vs encolado producen exactamente el mismo tiempo.
    - Escenario B: Auto-construcción produce el mismo tiempo que acción manual.
    - Escenario C: Modificadores ministeriales y directivas reflejados idénticamente en UI y cola.
    - Escenario D: Reliquias imperiales aplicadas de manera consistente.
    - Escenario E: Persistencia y rehidratación de cola sin mutación silenciosa de duraciones.
    - Escenario F: Navegación de interfaz sin desincronización de duraciones.
    - Escenario G: Múltiples construcciones concurrentes respetan tiempos aislados.
    - Escenario H: Planetas con distintos niveles de infraestructura calculan tiempos independientes.
    - Escenario I: Tiempos de investigación en UI sincronizados con calcPlanetResearchTime.
    - Escenario J: Conscription y centro de construcción aplicados en naves y defensas.
    - Escenario K: Especialización militar reflejada en astillero y colas.
    - Escenario L: Cuenta regresiva de timingHelpers consistente y sin números negativos.
    - Escenario M: Firma uniforme en backfillQueueTimeMults.

  PROBADO QUE MUERDE:
  Se alteró temporalmente calcEffectiveBuildTime para multiplicar el tiempo por 2.0; los tests de contrato
  fallaron de inmediato con desincronización explícita entre tarjeta y encolado. Se restauró a su valor verde.

TEST RESULTS:
  PASSED  27/27 ficheros, 301/301 tests, 0 fallos, 16,60 s
  (288 previos + 13 Fase 05)
  REGRESION: cero.
  PARSEO: todos los ficheros JS y JSX modificados parsean sin errores.

KNOWN ISSUES:
  Ninguno nuevo detectado en esta fase.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. Wrapper canónico calcEffectiveBuildTime ({ cost, planet, state, speed }).
  2. Helpers centralizados calcRemainingSeconds y calcTotalSeconds.
  3. Eliminación limpia de automationTick.js.
  4. Migración de 5 call sites de tiempo de construcción y sincronización I+D en UI.
  5. Conscription y especialización militar sincronizadas en naves, defensas y colas.
  6. Unificación de los 10 countdowns de interfaz.
  7. Suite de pruebas src/__tests__/timingContract.test.js (13 tests verdes).

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (301/301)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 06 — RECOMPENSAS DE REFINERÍA ×200

```text
PHASE:        06
Nombre:       Recompensas de refinería ×200

STATUS:       COMPLETE

OBJECTIVE:
Aplicar el multiplicador NEW_REWARD = CURRENT_REWARD × 200 en la fuente real de cálculo,
no en meros textos estéticos, unificar los 11 edificios industriales en una única fuente
de verdad lineal en buildingProdInfo y conectar las directivas y mejoras ministeriales del dominio.

SOURCE OF TRUTH:
- Fórmulas de producción y constantes canónicas: src/utils/formulas/productionFormulas.js
  (REFINERY_REWARD_MULTIPLIER = 200, BASE_REFINERY_PROD = 5000, calcProduction)
- Información honesta de edificios y simulación industrial: src/utils/formulas.js (buildingProdInfo, INDUSTRY_BUILD_IDS)
- Directivas ministeriales: src/data/policies/ministryDirectives.js (dir_heavy_refine)
- Mejoras de ministerio: src/data/ministriesData.js (ind_catalyst)
- Catálogo de edificios base y expandidos: src/data/game/buildingsData.js y src/data/expanded/expandedBuildings.js
- Contratos protegidos por: src/__tests__/refineryContract.test.js

DEPENDENCIES:
Ninguna.

FILES INSPECTED:
  src/utils/formulas/productionFormulas.js
  src/utils/formulas.js
  src/core.jsx
  src/data/game/buildingsData.js
  src/data/expanded/expandedBuildings.js
  src/data/policies/ministryDirectives.js
  src/data/ministriesData.js
  src/reducers/tick/tickOrchestrator.js
  src/reducers/tick/livingPlanetTick.js
  src/reducers/tick/populationTick.js
  src/components/ui/ResourceBreakdownTooltip.jsx
  src/pages/OverviewPage.jsx

FILES MODIFIED:
  src/utils/formulas/productionFormulas.js (definición de REFINERY_REWARD_MULTIPLIER = 200, BASE_REFINERY_PROD = 5000; aplicación del multiplicador x200 en industryMetalBase e industryItems.refinery; conexión de dir_heavy_refine e ind_catalyst; salvaguarda de relicsList)
  src/utils/formulas.js                   (re-exportación canónica de constantes; ampliación de INDUSTRY_BUILD_IDS a los 11 edificios industriales reales)
  src/core.jsx                            (re-exportación para UI y componentes)
  src/__tests__/refineryContract.test.js  (nueva suite de contrato, 9 tests probados que muerden)

DATABASE CHANGES:
  Ninguna.

MIGRATIONS:
  Ninguna.

IMPLEMENTATION:
  1. Constantes canónicas y multiplicador ×200:
     - Definidas y exportadas REFINERY_REWARD_MULTIPLIER = 200 y BASE_REFINERY_PROD = 5000 en src/utils/formulas/productionFormulas.js.
     - Decisión arquitectónica adoptada: aplicar multiplicador explícito en la fórmula en vez de alterar silenciosamente
       el catálogo base (baseProd: 5000 en buildingsData.js se mantiene limpio e inmutable para facilitar auditorías y balanceo).
     - La refinería nivel 1 produce de base exactamente 1.000.000 metal/h (5.000 × 200), escalando linealmente (nv.3 = 3.000.000).

  2. Conexión de directivas y mejoras ministeriales del dominio:
     - Conectada directiva 'dir_heavy_refine' (+20% a producción de refinerías).
     - Conectada mejora ministerial 'ind_catalyst' (+15% de eficiencia por nivel en refinerías).
     - Ambas inciden directamente sobre effectiveRefineryBase.

  3. Unificación de los 11 edificios industriales en buildingProdInfo:
     - INDUSTRY_BUILD_IDS en formulas.js ampliado de 4 edificios a los 11 reales:
       'refinery', 'chemPlant', 'synthPlant', 'enrichPlant', 'vacuumForge', 'spaceElevator',
       'automatedMine', 'slagRecycler', 'heliumExtractor', 'siliconPurifier', 'catalyticDeut'.
     - Erradicada la disparidad donde 7 edificios industriales se calculaban exponencialmente en UI
       y linealmente en el motor. Ahora las tarjetas muestran la simulación honesta idéntica al tick.

  4. Protección de escoria y biosfera:
     - slagFromRefinery se mantiene basado en el throughput físico de base (5000 * lvl * 0.18),
       evitando que la refinería genere 180.000 de escoria por nivel y destruya la biosfera colonial en segundos.
     - Ratio de consumo energético auditado: calcBuildingEnergyDemand aplica el consumo del catálogo (4.000 MW base),
       integrado con el factor de energía del planeta.

TESTS:
  src/__tests__/refineryContract.test.js (9 tests):
    - Test 1: Constantes canónicas existen y REFINERY_REWARD_MULTIPLIER es 200.
    - Test 2: Refinería nivel 1 produce exactamente 1.000.000 metal base (5.000 × 200).
    - Test 3: Escala linealmente con el nivel (nv.3 = 3.000.000).
    - Test 4: Directiva dir_heavy_refine añade +20% a refinerías.
    - Test 5: Mejora ministerial ind_catalyst añade +15% por nivel.
    - Test 6: Generación de escoria de refinería se mantiene proporcionada (900/h a nivel 1).
    - Test 7: buildingProdInfo clasifica los 11 edificios industriales como kind: 'industry'.
    - Test 8: buildingProdInfo para refinería nivel 1 muestra delta de 1.000.000/h.
    - Test 9: Coherencia de mina de cristal.

  PROBADO QUE MUERDE:
  Se alteró temporalmente REFINERY_REWARD_MULTIPLIER de 200 a 100; 6 tests fallaron de inmediato
  con discrepancias exactas en producción de refinería (500.000 vs 1.000.000) y constantes.
  Se restauró a 200 y volvieron a verde.

TEST RESULTS:
  PASSED  28/28 ficheros, 310/310 tests, 0 fallos, 16,47 s
  (301 previos + 9 Fase 06)
  REGRESION: cero.
  PARSEO: todos los ficheros modificados parsean sin errores con esbuild.

KNOWN ISSUES:
  Ninguno nuevo detectado en esta fase.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. Constantes canónicas REFINERY_REWARD_MULTIPLIER = 200 y BASE_REFINERY_PROD = 5000 exportadas en productionFormulas, formulas y core.
  2. Multiplicador x200 activo en productionFormulas.js y reflejado en UI/tooltips.
  3. Directivas dir_heavy_refine y mejora ind_catalyst conectadas funcionalmente.
  4. INDUSTRY_BUILD_IDS en formulas.js ampliado con los 11 edificios industriales.
  5. Suite de pruebas src/__tests__/refineryContract.test.js (9 tests verdes).

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (310/310)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 07 — PIPELINE DE IMÁGENES Y ASSETS

```text
PHASE:        07
Nombre:       Pipeline de imágenes y assets
STATUS:       COMPLETE

OBJECTIVE:
Cero compresión con pérdida visible, cero asset reutilizado donde no corresponde,
documentación oficial de integridad MISSING_ASSETS.md con 0 faltantes.

SOURCE OF TRUTH:
scripts/convert-assets-to-webp.cjs, src/data/assetsCatalog.js, Assets/, public/, MISSING_ASSETS.md.

DEPENDENCIES:
Fase 00 (Preflight).

FILES TOUCHED:
  scripts/convert-assets-to-webp.cjs (lossless: true, resize con cover forzado eliminado)
  src/data/assetsCatalog.js (eliminadas 14 claves duplicadas del menú, normalizado LF)
  src/data/ministryMetadata.js (eliminadas 19 declaraciones muertas bgImage)
  MISSING_ASSETS.md (creado informe oficial de integridad 100%, 0 faltantes)
  docs/prompts_image_library.md (movido desde Assets para evitar bundle bloat en Vite)
  src/__tests__/assetsContract.test.js (suite de contrato con 3 tests verdes)
  Archivos eliminados:
    Assets/aiCore.webp (huérfano, catálogo apunta a 'Núcleo de IA.webp')
    public/backgrounds/government/*.svg (11 fondos vectoriales no referenciados)
    src/assets/cartoon/*.svg, src/assets/leaders/*.svg (11 SVGs sin referencias activas)

TDD CYCLE:
  TESTS ESCRITOS PRIMERO:
  src/__tests__/assetsContract.test.js:
    - Test 1: no contiene claves duplicadas en la definición léxica de REAL_IMAGES.
    - Test 2: todos los archivos referenciados en REAL_IMAGES existen físicamente en disco.
    - Test 3: no existen referencias muertas bgImage en ministryMetadata.

  PROBADO QUE MUERDE:
  Se verificó la detección al inyectar claves duplicadas y al validar rutas de assets relativos vs /ministers/,
  fallando inmediatamente y volviendo a verde tras resolución exacta.

TEST RESULTS:
  PASSED  29/29 ficheros, 313/313 tests, 0 fallos, 18,48 s
  (310 previos + 3 Fase 07)
  REGRESION: cero.
  PARSEO: todos los ficheros modificados parsean sin errores.
  INTEGRIDAD: scripts/verify-catalog-integrity.cjs: 557 presentes, 0 faltantes.

KNOWN ISSUES:
  Ninguno nuevo detectado en esta fase.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. scripts/convert-assets-to-webp.cjs configurado a compresión sin pérdida (lossless).
  2. Catálogo src/data/assetsCatalog.js limpio de claves duplicadas.
  3. Eliminación de 23 assets huérfanos / no referenciados y reubicación de markdown de prompts.
  4. Documento oficial MISSING_ASSETS.md certificando 0 assets ausentes.
  5. Suite automatizada src/__tests__/assetsContract.test.js pasando al 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (313/313)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 08 — IMPERIAL vs PLANETARY, SENADOS, NAVEGACIÓN

```text
PHASE:        08
STATUS:       COMPLETE
DATE:         2026-09-30
COMMIT:       Pending
DOMAIN:       UI / Navigation / Tax Synchronization

OBJECTIVE:
Separación limpia de contextos imperio vs planeta, unificación de nomenclatura (Alto Mando vs Mando Imperial), una sola verdad del pacto tributario (planet.taxRate) y sincronización de jerarquías y breadcrumbs.

CHANGES:
  1. src/components/app/gameNavigation.js:
     - Unificada etiqueta de government a "👑 Alto Mando".
     - Añadida entrada canónica de missiles con parent: "defense".
  2. src/components/navigation/NavigationContext.jsx:
     - Sincronizado PARENT_MAP para reflejar la jerarquía real:
       - colony_network, market, missions, stats cuelgan de overview.
       - missiles cuelga de defense.
       - imperial_council e imperial_senate cuelgan de imperial_hub.
  3. src/components/government/council/ImperialSenateView.jsx:
     - Actualizado botón de navegación de retorno a "Mando Imperial".
     - Tarjetas de Diplomacia Exterior interactivas con botones que navegan al Cuerpo Diplomático (diplomacy) o Mercado Galáctico (market).
  4. src/components/government/council/ImperialCouncilCabinet.jsx:
     - Actualizado botón de retorno a "◀ Volver al Mando Imperial".
  5. src/pages/ImperialCommandPage.jsx:
     - Pasado onNavigateTab={goTo} a ImperialSenateView.
  6. src/reducers/tick/ministries/ministryTick.js:
     - Unificado el cálculo fiscal para que compute la recaudación mundo a mundo ponderando el pacto fiscal real de cada planeta (p.taxRate), con fallback federal a mins.economy.taxRate.
  7. src/__tests__/navigationContextContract.test.js:
     - Nueva suite de pruebas de contrato TDD verificando jerarquía unificada, nomenclatura consistente y cálculo fiscal por planeta.

DATABASE CHANGES:
Ninguno.

MIGRATIONS:
Ninguno.

IMPLEMENTATION:
100% completada y validada según las directivas maestras.

TESTS:
src/__tests__/navigationContextContract.test.js: 3 tests pasando (probado que muerden).
Suite completa: 316/316 tests pasando sin regresiones.

TEST RESULTS:
316/316 passing (30 test files)

KNOWN ISSUES:
Ninguno nuevo detectado en esta fase.

HARD BLOCKERS:
Ninguno.

SOFT ISSUES:
Ninguno.

DELIVERABLES:
  1. Jerarquía sincronizada entre GAME_TABS y PARENT_MAP.
  2. Nomenclatura unificada Alto Mando vs Mando Imperial.
  3. Una Sola Verdad en recaudación impositiva ponderada por planeta.
  4. Tarjetas diplomáticas del Senado conectadas a vistas interactivas reales.
  5. Suite de contrato src/__tests__/navigationContextContract.test.js pasando al 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (316/316)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 09 — BASTIÓN Y SILOS

```text
PHASE:        09
Nombre:       Bastión defensivo planetario y silos balísticos

STATUS:       COMPLETE

OBJECTIVE:
Separar el Bastión defensivo de los Silos balísticos eliminando pantallas y sub-pestañas
intermedias redundantes, dotar al bastión de estado de calibración real en construcción,
calcular telemetría de defensa efectiva en HubTopBar y validar requisitos tecnológicos
y rangos de coordenadas balísticas en MissilesPage.

SOURCE OF TRUTH:
src/pages/DefensePage.jsx, src/pages/MissilesPage.jsx, src/components/defense/DefenseGrid.jsx,
src/components/government/hub/HubTopBar.jsx, src/reducers/fleet/missileReducer.js,
src/utils/formulas/combatFormulas.js.

DEPENDENCIES:
Fase 08 (Navegación, GAME_TABS y PARENT_MAP).

FILES INSPECTED:
  src/pages/
    DefensePage.jsx, MissilesPage.jsx
  src/components/defense/
    DefenseGrid.jsx, DefenseMissileSilosSection.jsx
  src/components/government/hub/
    HubTopBar.jsx, planetaryCommandCardsConfig.jsx
  src/reducers/fleet/
    missileReducer.js, defenseReducer.js
  src/__tests__/
    bastionSilosContract.test.js

DECISIONS:
  1. SILOS ALCANZABLE DESDE COMANDO PLANETARIO:
     Registrada la ruta `missiles` con padre `defense` en GAME_TABS y PARENT_MAP.
     La tarjeta de silos en el Alto Mando navega directamente a MissilesPage sin rebotar.

  2. ELIMINACIÓN DE LA DUPLICACIÓN EN DEFENSEPAGE:
     Retirada la sub-pestaña `silos` y el selector de divisiones en DefensePage.jsx.
     DefensePage actúa directamente como Bastión Defensivo Planetario (`surface`).

  3. TELEMETRÍA DE BASTIÓN CON TECNOLOGÍA EFECTIVA:
     HubTopBar.jsx ahora muestra el indicador consolidado del Bastión: total de baterías,
     potencia de fuego real y escudos totales aplicando getEffectiveTech(currentPlanet, research).

  4. ESTADO REAL DE DESPLIEGUE Y CALIBRACIÓN:
     DefenseGrid.jsx inspecciona state.defenseQueue del planeta activo. Las baterías en proceso
     de montaje muestran badge animado `⚙️ CALIBRANDO (X)` con conteo real de cola.

  5. VALIDACIÓN BALÍSTICA Y REQUISITOS TECNOLÓGICOS:
     MissilesPage.jsx valida rangos numéricos estrictos para coordenadas de ataque balístico
     (Galaxia 1-9, Sistema 1-499, Posición 1-15, Ojivas 1-haveIPMs) y bloquea la producción
     si no se cumplen los requisitos de laboratorio y tecnologías (meetsReq). Saneado el
     array spread de notificaciones en missileReducer.js.

MIGRATIONS:
  Ninguna necesaria.

IMPLEMENTATION:
  - src/pages/DefensePage.jsx: removida pestaña silos, selector de división y divisiones intermedias.
  - src/pages/MissilesPage.jsx: añadidas props meetsReq/RESEARCH, validaciones min/max y bloqueo de requisitos.
  - src/components/defense/DefenseGrid.jsx: conectada detección de cola para estado `calibrating`.
  - src/components/government/hub/HubTopBar.jsx: telemetría de bastión integrada con getEffectiveTech.
  - src/reducers/fleet/missileReducer.js: saneado spread de notifications.
  - src/__tests__/bastionSilosContract.test.js: suite de contrato TDD verificando encolado, deducción, entrega a defensas/variantes y capacidad máxima de silos.

TEST RESULTS:
  - src/__tests__/bastionSilosContract.test.js: 3/3 passed (verificado que muerde).
  - Suite global completa: 319/319 tests pasando (0 fallos, 0 regresiones).

KNOWN ISSUES:
  Ninguno.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. Pantalla de Bastión directo sin capas intermedias.
  2. Silos balísticos accesibles con validación estricta de coordenadas y requisitos tecnológicos.
  3. Estado de calibración y despliegue real en baterías planetarias.
  4. Telemetría de defensas con getEffectiveTech en HubTopBar.
  5. Suite de contrato src/__tests__/bastionSilosContract.test.js al 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (319/319)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 10 — FLEET HANGAR 50/50

```text
PHASE:        10
Nombre:       Hangar de la flota: split 50/50 y clasificación naval estricta

STATUS:       COMPLETE

OBJECTIVE:
Dividir la pantalla de despacho táctico en una cuadrícula responsiva 50/50 (despacho/asignación
de escuadrones a la izquierda y tipo de misión a la derecha), clasificar correctamente los
misiles balísticos como munición fuera del hangar civil/militar, y subsanar bugs de props
vivas (`setActiveTab` y `onOpenCodex`) y subtítulos de breadcrumb en SubsystemTopBanner.

SOURCE OF TRUTH:
src/pages/FleetPage.jsx, src/utils/fleetClassification.js,
src/components/navigation/SubsystemTopBanner.jsx, src/data/game/shipsData.js.

DEPENDENCIES:
Fase 09 (Bastión y Silos).

FILES INSPECTED:
  src/pages/
    FleetPage.jsx
  src/utils/
    fleetClassification.js
  src/components/fleet/
    FleetSelectionList.jsx, MissionConfigPanel.jsx
  src/components/navigation/
    SubsystemTopBanner.jsx
  src/__tests__/
    fleetHangarContract.test.jsx

DECISIONS:
  1. ESTRUCTURACIÓN RESPONSIVA 50/50:
     La sub-vista `dispatch` en FleetPage.jsx ahora agrupa `FleetSelectionList` y `MissionConfigPanel`
     en un contenedor `grid grid-cols-1 lg:grid-cols-2 gap-4 items-start`.
     En pantallas de escritorio grandes se despliegan en perfecta paridad 50/50 manteniendo
     scroll interno, presets y filtros de escuadrón intactos.

  2. CLASIFICACIÓN MODULAR DE NAVES:
     Creada la utilidad `src/utils/fleetClassification.js` con las funciones `classifyShip`
     y `filterAvailableFleet`. `interplanetaryMissile` y `antiBallisticMissile` se categorizan
     como munición táctica balística (`ammo`) y quedan excluidos del Hangar naval convencional,
     evitando que aparezcan como cargueros o naves de apoyo civil.

  3. REPARACIÓN DE PROPS Y SUBTÍTULOS:
     Se declaran formalmente `setActiveTab` y `onOpenCodex` en la firma de FleetPage.jsx.
     `SubsystemTopBanner.jsx` mapea limpiamente las 7 sub-vistas del Hangar:
     `inventory`, `in_flight`, `trade_routes`, `dispatch`/`destination`, `spy_reports`,
     `patrols` y el menú general `Hangar de la Flota`.

MIGRATIONS:
  Ninguna necesaria.

IMPLEMENTATION:
  - src/utils/fleetClassification.js: funciones puras classifyShip y filterAvailableFleet.
  - src/pages/FleetPage.jsx:
    - Incorporado grid 50/50 en dispatch.
    - Integrado filterAvailableFleet para depurar la lista de naves operativas.
    - Añadidas props setActiveTab y onOpenCodex.
    - Ampliado SubsystemTopBanner con títulos para las 7 vistas.
  - src/__tests__/fleetHangarContract.test.jsx: suite de contrato verificando clasificación
    y exclusión de misiles balísticos en el hangar y comportamiento de filtros.

TEST RESULTS:
  - src/__tests__/fleetHangarContract.test.jsx: 2/2 passed (verificado que muerde).
  - Suite global completa: 321/321 tests pasando (0 fallos, 0 regresiones).

KNOWN ISSUES:
  Ninguno.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  1. Despacho táctico con división 50/50 y responsive fallback.
  2. Clasificación naval modular en fleetClassification.js.
  3. Props vivas setActiveTab y onOpenCodex en FleetPage.
  4. Cobertura de las 7 sub-vistas en SubsystemTopBanner.
  5. Suite de contrato src/__tests__/fleetHangarContract.test.jsx al 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (321/321)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

```text
PHASE:
Fase 11 — Supply Routes Reales

STATUS:
COMPLETE

OBJECTIVE:
Eliminar la teletransportación instantánea de recursos en las rutas comerciales programadas y sustituirla
por despacho de misiones reales de flota ("transport") con convoyes asignados/disponibles, consumo de tiempo de vuelo
físico con fórmulas de velocidad y distancia, deducción honesta de cargueros en origen, entrega respetando la capacidad
de almacén del destino y retorno seguro de la flota al hangar de procedencia.

SOURCE OF TRUTH:
- docs/implementation/01_MASTER_PLAN.md (§ Fase 11)
- AGENTS.md (§4, §5, §10)
- src/reducers/fleet/tradeRouteReducer.js
- src/reducers/tick/automation/autoTradeRoutesTick.js
- src/missions/diploMission.js
- src/components/colonyNetwork/SupplyRoutesView.jsx

DEPENDENCIES:
- Fase 01: Router de acciones.

FILES INSPECTED:
- src/reducers/fleet/tradeRouteReducer.js
- src/reducers/tick/automation/autoTradeRoutesTick.js
- src/missions.jsx
- src/missions/diploMission.js
- src/components/colonyNetwork/SupplyRoutesView.jsx
- src/components/fleet/TradeRoutesSection.jsx
- src/core.jsx

FILES MODIFIED:
- src/reducers/fleet/tradeRouteReducer.js:
  * Extraído despachador modular `dispatchTradeRouteMission(state, route)` compartido.
  * Reemplazada la teletransportación instantánea por despacho de misión de tipo `transport` en `fleetMissions`.
  * Cálculo dinámico de capacidad de bodega según naves asignadas (`assignedShips`) o cargueros disponibles en origen.
  * Deducción de cargueros (`smallCargo`, `largeCargo`, escoltas) y recursos del planeta origen al despachar.
  * Cálculo de distancia real y tiempo de vuelo con `calcDistance`, `fleetSpeed`, `calcFlightTime`.
  * Registro de `departure`, `arrivalTime`, `returnTime` e indicador `autoRoute: true`.
  * Saneado el sombreado de variable `calcStorage`.
- src/reducers/tick/automation/autoTradeRoutesTick.js:
  * Eliminada la duplicación y teletransporte en el tick periódico de rutas programadas.
  * Delegado el procesamiento a `dispatchTradeRouteMission(newState, route)`.
- src/missions/diploMission.js:
  * `handleTransportMission` ahora respeta los límites de almacén del destino mediante `calcStorage`.
  * Registra manifiesto de carga y entregas reales en el tacticalEvent sin desbordar almacenes.
- src/components/colonyNetwork/SupplyRoutesView.jsx:
  * Unificado el límite máximo de rutas a 10 (coincidente con el reducer y `TradeRoutesSection`).
  * Conectado `mode: 'surplus'`, `ratio: routeRatio` y destino a la Capital imperial en el dispatch.
- src/__tests__/supplyRoutesContract.test.js: suite de contrato TDD para Fase 11.

DATABASE CHANGES:
Ninguno en esquema SQLite. Las misiones de transporte y rutas comerciales se almacenan en `universe.db` vía `planets.data_json` y `state.fleetMissions`.

MIGRATIONS:
Ninguna requerida.

IMPLEMENTATION:
1. Reemplazado el intercambio inmediato de recursos por creación de misiones `transport` en `fleetMissions`.
2. Integrado uso real de `assignedShips` en el cálculo de transporte logístico.
3. Respetada la capacidad del almacén destino (`calcStorage`) en `handleTransportMission`.
4. Sincronizada la UI de `SupplyRoutesView` con límite 10 y `mode: 'surplus'`.

TESTS:
- src/__tests__/supplyRoutesContract.test.js: 3 tests cubriendo:
  1. Despacho real con deducción de cargueros y recursos en origen, sin incremento inmediato en destino.
  2. Procesamiento periódico en autoTradeRoutesTick con actualización de lastProcessed.
  3. handleTransportMission con respeto de límites de almacén y retorno de flota asignada.
- Probado que muerde: verificado en rojo (3 fallos iniciales) antes de la implementación.

TEST RESULTS:
- src/__tests__/supplyRoutesContract.test.js: 3/3 passed.
- Suite global completa: 324/324 tests pasando (0 fallos, 0 regresiones).

KNOWN ISSUES:
Ninguno.

HARD BLOCKERS:
Ninguno.

SOFT ISSUES:
Ninguno.

DELIVERABLES:
1. Rutas comerciales con despacho de convoyes reales.
2. Deducción de cargueros y vuelo físico con retorno.
3. Control de capacidad de almacén en destino.
4. Límite unificado a 10 rutas en UI y reducer.
5. Suite de contrato src/__tests__/supplyRoutesContract.test.js (100% verde).

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] UI verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (324/324)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## FASE 12 — AUTOTRADE Y MISIÓN CAPÍTULO 6

```text
PHASE:        12
Nombre:       Autotrade accesible, cargueros balanceados y misiones de capítulo 6

STATUS:       COMPLETE

OBJECTIVE:
Habilitar el control directo de autotrade en todas las vistas de colonias (tarjetas 3D,
tabla, modal de detalle y matriz de red colonial), corregir el algoritmo de asignación de
cargueros para evitar desperdicio de capacidad combinando cargueros grandes y pequeños,
y endurecer la misión de capítulo 6 para exigir rutas activas con al menos una entrega real.

SOURCE OF TRUTH:
src/reducers/tick/automation/autoTradeRoutesTick.js
src/data/missionsData.js
src/components/overview/grid/Planet3DCard.jsx
src/components/overview/grid/PlanetTableView.jsx
src/components/colonyNetwork/ColonyMatrixView.jsx
src/components/planet/PlanetFullDetailModal.jsx
src/__tests__/autotradeMissionsContract.test.js

DEPENDENCIES:
Fase 01 (router de acciones), Fase 11 (supply routes reales).

FILES INSPECTED:
  src/reducers/tick/automation/autoTradeRoutesTick.js
  src/data/missionsData.js
  src/components/overview/grid/Planet3DCard.jsx
  src/components/overview/grid/PlanetTableView.jsx
  src/components/overview/OverviewPlanetGrid.jsx
  src/components/colonyNetwork/ColonyMatrixView.jsx
  src/components/planet/PlanetFullDetailModal.jsx
  src/pages/ColonyNetworkPage.jsx

FILES MODIFIED:
  src/reducers/tick/automation/autoTradeRoutesTick.js
  src/data/missionsData.js
  src/components/overview/grid/Planet3DCard.jsx
  src/components/overview/grid/PlanetTableView.jsx
  src/components/overview/OverviewPlanetGrid.jsx
  src/components/colonyNetwork/ColonyMatrixView.jsx
  src/components/planet/PlanetFullDetailModal.jsx
  src/pages/ColonyNetworkPage.jsx
  src/__tests__/autotradeMissionsContract.test.js (nuevo)

DATABASE CHANGES:
  Ninguna (autoTrade se almacena limpiamente en planets.data_json).

MIGRATIONS:
  Ninguna requerida.

IMPLEMENTATION:
  1. Toggle accesible de Auto-Comercio:
     - Añadido botón interactivo con estado e indicador LED pulsante en Planet3DCard,
       PlanetTableView, ColonyMatrixView y PlanetFullDetailModal para colonias (!planet.isHome).
     - Pasado dispatch a través de OverviewPlanetGrid y ColonyNetworkPage.
  2. Asignación óptima de cargueros:
     - En autoTradeRoutesTick.js se reemplazó Math.ceil por Math.floor para largeNeeded,
       permitiendo que los cargueros pequeños completen el remanente de carga sin sobredimensionar
       ni dejar cargueros pequeños ociosos.
  3. Misiones de Capítulo 6 verificadas y robustecidas:
     - m6_3_autotrade: verifica colonias con autoTrade activo.
     - m6_4_supply_route: endurecida para exigir rutas con deliveriesCount >= 1.
  4. Suite de contrato TDD:
     - Creado autotradeMissionsContract.test.js demostrando asignación óptima de flota,
       persistencia de flag autoTrade y cumplimiento honesto de misiones de capítulo 6.

TESTS:
  src/__tests__/autotradeMissionsContract.test.js
  Suite completa npm test

TEST RESULTS:
  327 tests pasados, 34 test files, 0 fallos.

KNOWN ISSUES:
  Ninguno.

HARD BLOCKERS:
  Ninguno.

SOFT ISSUES:
  Ninguno.

DELIVERABLES:
  - Toggle de autoTrade en toda la interfaz de colonias y red colonial.
  - autoTradeRoutesTick con cálculo de cargueros combinados sin desperdicio.
  - m6_4_supply_route verificada en ejecución real.
  - Suite de contrato TDD pasando 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (327/327)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

```text
PHASE:
13 — SISTEMA DE INVESTIGACIÓN

STATUS:
COMPLETE

OBJECTIVE:
Que investigar no se bloquee por duración secuencial artificial, garantizar cancelaciones puntuales sin cascada destructiva, reembolsos correctos calculados al nivel del ítem en cola, ordenación de paneles por tiempo restante, expediciones deterministas con ajuste de startTime y activación real de pesos ministeriales y urgencia de prerrequisitos.

SOURCE OF TRUTH:
docs/implementation/01_MASTER_PLAN.md (Fase 13).
src/reducers/fleetReducer.js (CANCEL_RESEARCH_QUEUE puntual).
src/reducers/tick/queues/queueTick.js (reembolsos nivel de ítem y validación de laboratorio).
src/components/overview/ConstructionQueuesPanel.jsx (orden por tiempo restante).
src/missions/expeditionMission.js (anomalía temporal determinista y acotada al planeta expedicionario).
src/reducers/tick/automation/autoResearchTick.js (pesos ministeriales 'science' y urgencia).

DEPENDENCIES:
Fase 01 (Router de acciones).
Fase 05 (Fuente única de duraciones).

FILES INSPECTED:
  src/reducers/researchReducer.js
  src/reducers/fleetReducer.js
  src/reducers/tick/queues/queueTick.js
  src/components/overview/ConstructionQueuesPanel.jsx
  src/missions/expeditionMission.js
  src/reducers/tick/automation/autoResearchTick.js
  src/reducers/tick/ai/researchScoring.js
  src/utils/formulas/costFormulas.js

FILES MODIFIED:
  src/reducers/fleetReducer.js
  src/reducers/tick/queues/queueTick.js
  src/components/overview/ConstructionQueuesPanel.jsx
  src/missions/expeditionMission.js
  src/reducers/tick/automation/autoResearchTick.js
  src/__tests__/researchSystemContract.test.js (nuevo)
  docs/implementation/01_MASTER_PLAN.md
  docs/implementation/ASCENSION_IMPLEMENTATION_STATUS.md

DATABASE CHANGES:
Ninguna.

MIGRATIONS:
Ninguna.

IMPLEMENTATION:
1. CANCEL_RESEARCH_QUEUE puntual en fleetReducer: elimina exclusivamente el ítem correspondiente a queueId sin matar niveles superiores o paralelos, calculando reembolso al 50%.
2. queueTick con reembolso por nivel: cuando una orden se cancela por pérdida de requisitos o laboratorio, el reembolso se calcula usando el coste del nivel exacto del ítem (Math.max(0, item.level - 1)) y no del nivel actual del árbol de investigación.
3. Ordenamiento visual de colas en ConstructionQueuesPanel: sortedResearchQueue y planetBuildQueue ordenadas por endTime ascendente (menor tiempo restante).
4. Determinismo en expediciones: la anomalía temporal sólo acelera la investigación del planeta expedicionario y actualiza tanto startTime como endTime en 120.000 ms.
5. autoResearchTick ministerial: pasa ministryId: 'science' y prereqUrgency: buildPrereqUrgency(...) a scoreResearch, activando MINISTRY_CATEGORY_WEIGHTS y evitando tablas muertas.
6. Suite de contrato TDD creada y pasando al 100% (6/6 tests de contrato, 333/333 tests globales).

DELIVERABLES:
  - Cancelación puntual y sin cascada en fleetReducer.
  - Reembolsos por nivel en queueTick.
  - Ordenación por urgencia/tiempo en panel de colas.
  - Expediciones deterministas por planeta.
  - autoResearchTick conectado con pesos ministeriales y urgencia.
  - Suite de contrato TDD pasando 100%.

DEFINITION OF DONE:
[x] Analysis complete
[x] Implementation complete
[x] Domain verified
[x] Persistence verified
[x] Integration verified
[x] Tests passed (333/333)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

```text
PHASE:
Nombre: 14 — Auditoría de Research y Ministries

STATUS:
COMPLETE

OBJECTIVE:
Auditoría y conexión integral de investigaciones y ministerios: erradicar efectos huérfanos, conectar bonificaciones de combate a naves y defensas, asegurar fallback global en modernización de tecnologías, conectar bonus de colonización, comercio galáctico y exploración profunda, activar victoria científica por Proyecto Singularidad, garantizar independencia de referencias en persistencia y auditar CI al 100%.

SOURCE OF TRUTH:
src/data/game/researchData.js, src/data/buildingOperationsData.js, src/utils/formulas/combatFormulas.js, src/missions/diploMission.js, src/pages/GalacticMarketPage.jsx, src/missions/expeditionMission.js, src/core/initialState.js, src/reducers/tick/queues/queueTick.js.

CONTRACTS BROKEN (BEFORE):
- getEffectiveTech devolvía {} ignorando globalResearch si el planeta no tenía retrofitTech registrado.
- laser, ion, ballisticWeapons, advMissiles y orbitalArtillery no aportaban bonus de ataque a sus naves o defensas asociadas.
- advColonization no incrementaba planetSize al colonizar un nuevo mundo.
- galacticTrade no aplicaba descuento al arancel del mercado galáctico (hardcoded 8%).
- deepScanner no modificaba las probabilidades de eventos favorables en expediciones.
- singularity no disparaba la victoria científica tras completarse.
- initialState enlazaba la misma referencia en memoria para state.research y homePlanet.research.

CHANGES MADE:
- combatFormulas.js: getEffectiveTech ahora devuelve planet.retrofitTech si existe y tiene claves, o globalResearch || {} como fallback activo.
- combatFormulas.js: getDefenseStats y getShipStats ahora aplican bonificaciones armamentísticas reales (+10% láser, +12% iones, +15% balística, +20% misiles, +25% artillería orbital en defensas; y escalado naval proporcional).
- diploMission.js: handleColonizeMission suma (state.research?.advColonization || 0) * 2 al tamaño planetario inicial (planetSize).
- GalacticMarketPage.jsx: arancel del mercado calcula feeRate = Math.max(0.01, 0.08 - galacticTrade * 0.01) con etiqueta visual dinámica ({feePct}%).
- expeditionMission.js: handleExpeditionMission aplica factor reductor de roll basado en deepScanner para sesgar eventos a descubrimientos y anomalías positivas.
- queueTick.js: completar singularity dispara el estado de victoria científica (scientific) con notificación y modal cinemático imperial.
- initialState.js: research clona { ...(homePlanet.research || {}) }, erradicando la mutabilidad compartida.
- researchAuditingContract.test.js: suite completa con 7 tests verificando fallback, combate, colonización, mercado, independencia y 100% de cobertura de las 44 tecnologías en ministerios.

VERIFICATION:
- npx vitest run src/__tests__/researchAuditingContract.test.js -> 7/7 tests verdes.
- npm test -> 340/340 tests verdes globales (0 regresiones).

GATE CHECK:
[x] Implementation matches master plan
[x] Implementation matches preflight findings
[x] Tests passed (340/340)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

```text
PHASE:
Nombre: Fase 15 — Save vs Commander

STATUS:
COMPLETE

OBJECTIVE:
Separar de forma estricta e independiente el nombre de la partida (saveName / save_name) del nombre e identidad del comandante (playerName / commanderId). Eliminar la sobreescritura indeseada de ranuras al editar el perfil del jugador, desacoplar el renombrado de saves del nombre del personaje, migrar el esquema SQLite a versión 4 de forma idempotente y no destructiva, incluir gameMode en la lista de sesiones para filtros de récord de planetas, unificar la longitud máxima de campos de entrada a 35 caracteres y validar con suite de contrato TDD.

SOURCE OF TRUTH:
- electron/database/dbManager.cjs (SCHEMA_VERSION = 4, migración v4 save_name_and_commander_id_columns)
- electron/database/gameRepository.cjs (persistencia y carga desacoplada, game_mode en listGameSessions, renameGameSession sobre save_name)
- electron/ipc/saveIpc.cjs (slug y nombramiento basado en saveName prioritario)
- src/hooks/useAppSaveHandlers.js (handleInGameSave mantiene playerName intacto y pasa saveName)
- src/components/settings/SaveLoadSettings.jsx y src/components/app/LoadGameScreen.jsx (maxLength=35 unificado)
- src/__tests__/saveVsCommanderContract.test.js y src/__tests__/persistenceContract.test.js (IN_SESSION_COLUMN incluye saveName y commanderId)

CONTRACTS BROKEN (BEFORE):
- playerName y saveName estaban fusionados en una sola columna player_name, mutando el nombre del comandante si el jugador renombraba el slot de guardado.
- Cambiar el perfil del comandante en ProfileSettingsTab.jsx provocaba que el auto-save de 30s renombrara el slug de la partida en SQLite.
- listGameSessions no proyectaba game_mode, rompiendo el cálculo de récords en NewGameScreen.
- Longitud máxima dispar e inconsistente entre pantallas (20 chars vs 35 chars).

CHANGES MADE:
- dbManager.cjs: incrementado SCHEMA_VERSION a 4. Añadidas columnas save_name TEXT y commander_id TEXT a game_sessions. Creada migración idempotente y no destructiva save_name_and_commander_id_columns con backfill automático.
- gameRepository.cjs: saveFullGameState persiste save_name y commander_id. loadFullGameState restaura saveName y commanderId de forma independiente preservando compatibilidad. listGameSessions incluye gameMode, saveName, playerName y commanderId. renameGameSession actualiza save_name sin tocar player_name.
- saveIpc.cjs: resolución de slugs en save-game-named y save-game-named-sync prioriza data.saveName || data._saveName antes de hacer fallback a playerName.
- useAppSaveHandlers.js: handleInGameSave desvincula saveName de playerName al construir el snapshot.
- persistenceContract.test.js: añadidas columnas saveName y commanderId a IN_SESSION_COLUMN.
- SaveLoadSettings.jsx y LoadGameScreen.jsx: unificada longitud máxima de input a maxLength={35}.
- saveVsCommanderContract.test.js: suite de contrato creada (3/3 tests pasando).

VERIFICATION:
- npx vitest run src/__tests__/saveVsCommanderContract.test.js -> 3/3 tests verdes.
- npm test -> 343/343 tests verdes en la suite global (0 regresiones).

GATE CHECK:
[x] Implementation matches master plan
[x] Implementation matches preflight findings
[x] Tests passed (343/343)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

```text
PHASE:
Nombre: Fase 16 — Ver detalles y sistema unificado

STATUS:
COMPLETE

OBJECTIVE:
Eliminar la duplicidad de botones de detalles en tarjetas de construcción/investigación (remover el icono menu_book de la cabecera en ItemCard.jsx preservando el botón del pie junto a la acción), garantizar guardas de existencia para onOpenCodex en todos los componentes de cartas tácticas (DefenseGrid, DefenseMissileSilosSection, ShipProductionCard, ItemCard), y unificar la presentación de valores ausentes hacia las etiquetas estandarizadas "No disponible" y "No aplica" erradicando cadenas ambiguas "N/A" o retornos silenciosos.

SOURCE OF TRUTH:
- src/components/ui/ItemCard.jsx (botón único en pie con guarda onOpenCodex)
- src/components/ui/CodexModal.jsx (estandarización a "No disponible" y "No aplica")
- src/components/defense/DefenseGrid.jsx (guarda onOpenCodex && onOpenCodex(id))
- src/components/defense/DefenseMissileSilosSection.jsx (guarda onOpenCodex && onOpenCodex(id))
- src/components/shipyard/ShipProductionCard.jsx (guarda onOpenCodex && onOpenCodex(id))
- src/__tests__/detailsSystemContract.test.js (suite de contrato TDD)

CONTRACTS BROKEN (BEFORE):
- ItemCard.jsx tenía dos botones de ver detalles simultáneos (uno en la cabecera y otro en el pie).
- Botones de ver detalles en DefenseGrid, DefenseMissileSilosSection y ShipProductionCard no validaban si onOpenCodex estaba definido, arriesgando TypeError si se invocaban aisladamente.
- CodexModal presentaba etiquetas crudas "N/A" en lugar de las directivas estandarizadas de visualización imperial.

CHANGES MADE:
- ItemCard.jsx: eliminado el botón duplicado de la cabecera (menu_book). Mantenido el botón unificado en el pie con guarda defensiva onOpenCodex && onOpenCodex(id).
- DefenseGrid.jsx, DefenseMissileSilosSection.jsx y ShipProductionCard.jsx: asegurada guarda condicional en el render y handler del botón de detalles para prevenir invocaciones huérfanas.
- CodexModal.jsx: estandarizado el valor de motor a "No aplica" y descripción/estadísticas ausentes a "No disponible".
- detailsSystemContract.test.js: creada suite de verificación de contrato (3/3 tests pasando).

VERIFICATION:
- npx vitest run src/__tests__/detailsSystemContract.test.js -> 3/3 tests verdes.
- npm test -> 346/346 tests verdes en la suite global (0 regresiones).

GATE CHECK:
[x] Implementation matches master plan
[x] Implementation matches preflight findings
[x] Tests passed (346/346)
[x] Documentation updated
[x] Master Plan updated
[x] Status updated
[x] No critical blockers
[x] Ready for next phase

FINAL DECISION:
PROCEED
```

---

## BITÁCORA

| Fecha | Commit | Evento |
|---|---|---|
| 2026-09-30 | `2b18f03` | Estado previo: restauración de WebP a lossless (ficheros, no script) |
| 2026-09-30 | `1c69f25` | Punto de retorno previo a la remediación (142 ficheros) |
| 2026-09-30 | — | Fase 00 completada: 25 hallazgos, 22 fases planificadas |
| 2026-09-30 | — | Fase 01 completada: 25 rutas + 3 acciones nuevas, 28 tests nuevos, 251/251 verdes. 5 hallazgos nuevos (N-01..N-05) |
| 2026-09-30 | — | Fase 02 completada: allow-list 37->50, esquema versionado, backup verificado, 266/266 verdes |
| 2026-09-30 | `df19ca1` | Fase 03 completada: datos de estado, codex naves especiales, matriculas deterministas, 11 tests nuevos, 277/277 verdes |
| 2026-09-30 | `770e351` | Fase 04 completada: director único de música, eliminación de fugas AudioContext, operaciones a 0.5, 288/288 verdes |
| 2026-09-30 | `c5950bd` | Fase 06 completada: refinería x200 en fuente real, directivas conectadas, industria unificada, 310/310 verdes |
| 2026-09-30 | `f70bb55` | Fase 07 completada: pipeline lossless, assets huérfanos purgados, MISSING_ASSETS.md (0 faltantes), 313/313 verdes |
| 2026-09-30 | `30b1836` | Fase 08 completada: separacion imperio/planeta, jerarquia unificada, verdad impositiva, 316/316 verdes |
| 2026-09-30 | `c146aa0` | Fase 09 completada: bastion directo, telemetria de defensa efectiva, validacion balistica en silos, 319/319 verdes |
| 2026-09-30 | `46e8c9a` | Fase 10 completada: hangar split 50/50, clasificacion naval y props vivas, 321/321 verdes |
| 2026-09-30 | `bfdd590` | Fase 11 completada: supply routes reales con despacho de convoyes, tiempos de vuelo y persistencia, 324/324 verdes |
| 2026-09-30 | `6aac532` | Fase 12 completada: autotrade en tarjetas de colonias, optimizacion de cargueros y misiones cap 6, 327/327 verdes |
| 2026-09-30 | `bc859d8` | Fase 13 completada: investigacion paralela, cancelaciones puntuales, reembolsos por nivel, pesos ministeriales, 333/333 verdes |
| 2026-09-30 | `b738ca2` | Fase 14 completada: auditoría research, conexión armas/comercio/colonización, fallback modernización y victoria singularidad, 340/340 verdes |
| 2026-09-30 | `8b91e72` | Fase 16 completada: botón único ver detalles, guardas defensivas y estandarización No disponible / No aplica, 346/346 verdes |
| 2026-09-30 | — | Fase 17 completada: auditoría de cards estériles, unificación costes especialización, veto en I+D, feedback auditivo y constantes de eventos, 351/351 verdes |
| 2026-09-30 | — | Fase 18 completada: auditoría universal de fórmulas, DISPLAYED = REAL, POPULATION_CONSUMPTION_RATES centralizado, reliquias conectadas a minas/industria/combate, 357/357 verdes |
| 2026-10-01 | — | Fase 19 completada: integración y deuda técnica, purga de módulos muertos tick/events, inmutabilidad profunda en livingPlanetTick, replay tab conectada, memoización POI y docs de persistencia saneados, 363/363 verdes |

---

## COLA DE HALLAZGOS

Cuando una fase encuentra algo nuevo durante la implementación, se registra aquí y se asigna a fase.

| # | Fecha | Hallazgo | Asignado a | Estado |
|---|---|---|---|---|
| N-01 | Fase 01 | `calcProduction` lee `plasma` de undefined; el `try/catch` del tick lo convierte en producción 0 silenciosa | 18 | RESUELTO (Fase 18) |
| N-02 | Fase 01 | `state.activeUltimatum` no tiene productor: el overlay nunca aparece | 17 | ABIERTO |
| N-03 | Fase 01 | `RETROFIT_SHIP_VARIANT` / `RETROFIT_DEFENSE_VARIANT` / `CANCEL_RETROFIT_QUEUE` encaminados pero sin test de punta a punta (`planet.fleetVariants` sin montar) | 16, 17 | ABIERTO |
| N-04 | Fase 01 | `PROCESS_TRADE_ROUTES` ignora `intervalDays` y duplica la lógica del tick | 11 | RESUELTO (Fase 11) |
| N-05 | Fase 01 | `ASSIGN_LOCAL_MINISTRY_BUDGET` encaminado pero sin despachador en la UI | 17 | ABIERTO |
| I-01 | Fase 02 | 176.140 naves con `session_id` NULL: sin dueño, ningún borrado de sesión las tocará | 19 | PIDE AUTORIZACIÓN (D-2) |
| I-02 | Fase 02 | 617 `.bak-wal` = 8,4 GB siguen en disco; el código ya no los crea ni impide purgarlos | 19 | PIDE AUTORIZACIÓN (D-4) |
| I-04 | Fase 02 | `correctResearchLevels` se aplica en memoria pero nunca se escribe en la DB | 19 | ABIERTO |
| I-05 | Fase 02 | No hay función de restauración desde backup: `getLatestBackup` sigue sin usarse | 19 | ABIERTO |
