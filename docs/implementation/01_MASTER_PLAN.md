# 01 — MASTER PLAN

Orquestador de la remediación de Ascension.
Fase actual: `FASE 03 — COMPLETE` · Siguiente: `FASE 04 — Sistema de audio`

Cada fase se ejecuta con el ciclo obligatorio:
**Implementar → Testear → Corregir → Verificar → Documentar → Actualizar STATUS → Actualizar Master Plan → Evaluar bloqueos**

Ninguna fase avanza si tiene un hard blocker. Definiciones, entregables y bloqueos de cada fase: `ASCENSION_IMPLEMENTATION_STATUS.md`.

---

## PRINCIPIO DE ORDEN

El encargo original numera las fases por tema. La realidad del proyecto obliga a ordenarlas **por causa raíz**:

> **27 acciones despachadas por la UI nunca llegan a ningún reducer** (`src/reducers/index.js` enruta 99; 27 existen en sub-reducers pero no en el switch raíz, y 4 no existen en absoluto).

Mientras eso siga así, el botón de Mercado Galáctico, el de rutas de suministro, el del Senado Planetario, el de retrofit, el de interiores de edificio, el de terraforming y el de Base Lunar **no producen ningún cambio de estado**. Cerrar cualquiera de esas fases por delante sería fabricar una mentira.

Por eso la Fase 1 es el router, y la Fase 2 es la persistencia: sin router no hay dominio que auditar, y sin persistencia no se puede verificar nada que se afirme duradero.

---

## GRAFO DE DEPENDENCIAS

```
FASE 01  Router de acciones (27 rotas + 4 inexistentes + canAfford + footerAction)
   │
   ├──► FASE 02  Persistencia (allow-list, _sessionId, esquema, backup, import/export)
   │       │
   │       └──► FASE 15  Save vs Commander (necesita columnas separadas)
   │
   ├──► FASE 11  Supply Routes reales
   ├──► FASE 12  Autotrade + Capítulo 6
   ├──► FASE 16  Ver detalles + Building/Research details
   └──► FASE 17  Auditoría de cards estériles
           │
           └──► FASE 18  Auditoría universal de fórmulas

FASE 03  Datos de estado y rutas accesibles  (independiente)
FASE 04  Audio  (independiente)
FASE 05  Fuente única de duraciones  (independiente)  ← bloquea 16, 18, 25
FASE 06  Refinería ×200  (independiente)
FASE 07  Pipeline de imágenes y assets  (independiente)
FASE 08  Imperial vs Planetary + navegación  (independiente)
FASE 09  Bastión / Silos  (independiente)
FASE 10  Fleet Hangar 50/50  (independiente)
FASE 13  Cola de investigación  (independiente)
FASE 14  Auditoría research + ministries  (independiente)

FASE 19  Integración  ← requiere TODAS las anteriores
FASE 20  Regresión    ← requiere 19
FASE 21  Verificación final ← requiere 20
```

---

## LAS 22 FASES

### FASE 01 — ROUTER DE ACCIONES ✅ COMPLETE

**Objetivo:** que toda acción despachada por la UI llegue a su dominio.

**Entregado:** 25 rutas + 3 acciones nuevas + alias lunar corregido en dos capas · 2 bugs de `canAfford` · `footerAction` funcional · 2 tarjetas del tablero planetario · precedencia del impuesto unificada · 2 suites nuevas (28 tests) · 251/251 verdes · 0 regresiones.

**Desbloquea:** 11, 12, 16, 17.

**Trabajo:**
1. Añadir al switch de `src/reducers/index.js:34-163` las 23 acciones que existen como `case` en sub-reducers y no están enrutadas, delegando en el sub-reducer correcto.
2. Implementar las 4 acciones inexistentes:
   - `SET_PLANET_TAX_RATE` y `TOGGLE_PLANET_LOCAL_DIRECTIVE` en `systemReducer` (Senado Planetario)
   - `START_MOON_BUILDING` → enrutar al nombre existente `BUILD_MOON_BUILDING` **y** corregir `MoonPage.jsx:152`
   - `DISMISS_ULTIMATUM` en `eventReducer`
3. Corregir `canAfford(cost, res)` → `canAfford(res, cost)` en `MoonPage.jsx:117` y `MissilesPage.jsx:76`.
4. Añadir `footerAction` a las props de `HubCard.jsx` y renderizarlo.
5. Añadir `sharedCommandCards` (`shipDesign`, `combat`) a `PLANETARY_COMMAND_CARDS`, o eliminarlas del spread de `planetaryCommandCardsConfig.jsx:283`.

**Entregables:** router completo · 4 acciones nuevas · 2 bugs de `canAfford` corregidos · `footerAction` funcional.
**Tests:** test de contrato que despacha **cada** acción de la UI a través de `gameReducer` y comprueba mutación del estado. Este test es el que habría detectado C-01.
**Bloquea:** 11, 12, 16, 17.

> **Resultado real:** el recuento era 24, no 23 (faltaba `ASSIGN_LOCAL_MINISTRY_BUDGET`). Y "encaminar" no bastó: el alias `START_MOON_BUILDING` estaba en el router pero no en `fleetReducer`, así que seguía cayendo en su `default`. Solo un test de comportamiento lo detectó. Quedan 3 acciones encaminadas sin verificar de punta a punta (N-03).

---

### FASE 02 — PERSISTENCIA Y ESQUEMA ✅ COMPLETE CON RESERVA

**Objetivo:** que lo que se muestra y lo que se usa sobrevivan a cerrar y abrir, y que el esquema pueda evolucionar sin romper bases existentes.

**Entregado:** allow-list 37 → 50 claves protegida por test · identidad de sesión estable entre guardados · import/export que ya no destruye la partida origen · versionado de esquema + 2 migraciones idempotentes · backup con `wal_checkpoint` real y sin sidecars huérfanos · validación también al cargar · borrado de misiones y naves por sesión · CSP + window open + will-navigate + slug saneado · IAs deterministas · 15 tests de contrato probados que muerden · 266/266 verdes, cero regresiones.

**Reserva:** las migraciones están escritas y verificadas por contrato, pero **no se han ejecutado contra un `universe.db` real**, porque el usuario pidió no tocar su base. Se aplicarán solas al abrir el juego.

**Desbloquea:** 15.

**Trabajo:**
1. **Allow-list (`gameRepository.cjs:19-29`):** añadir `currentPlanetId`, `patrols`, `tacticalEventLog`, `lastTick`, `credits`, `exchangeOrders`, `daoShares`, `playerDaoShares`, `daoDividendPool`, `exchangeProjects`, `victory`, `gameOver`, `showTutorial`, `tutorialCompleted`, `worldAlertLog`, `triggeredNarrativeEvents`, `tradeRoutes` (verificar que ya está). Preferir **deny-list explícita** sobre allow-list para que ninguna clave nueva se pierda en silencio.
2. **`_sessionId`:** reinyectar `res.slug` / `res.sessionId` en el estado tras guardar. Usar `_saveSlug` ya restaurado como fallback para partidas existentes.
3. **Import/export:** usar `exportSessionToJson` (`gameRepository.cjs:316`, hoy muerto) en `export-save-to-file`, y regenerar `sessionId` en `import-save-from-file`.
4. **`ships.session_id`:** escribirlo en `shipRepository.cjs:17-31` y añadir FK a `game_sessions(id)`. **Migración no destructiva**: `ALTER TABLE` solo si la columna no existe; los valores NULL existentes se conservan hasta que se decida su destino (D-2).
5. **`fleet_missions.session_id`:** añadir la FK que falta.
6. **Versionado de esquema:** usar la tabla `game_meta` (hoy muerta) para `schema_version`. Script de migración idempotente, con `wal_checkpoint` previo.
7. **Backup verificado:** `db.pragma('wal_checkpoint(TRUNCATE)')` antes de copiar; dejar de copiar el WAL a `<bak>.bak-wal`; incluir los sidecars que sí importen; `PRAGMA integrity_check` tras crear.
8. **Poda de backups:** corregir `cleanupOldBackups` (`backupManager.cjs:96`) para que borre también los sidecars huérfanos. **No borrar nada hasta tener backup verificado** (D-4).
9. **Validación de carga:** llamar a `validateSaveData` en `load-save-by-slug` (hoy solo se valida al guardar). Conectar el validador Zod `src/utils/saveValidation.js` (hoy muerto) o eliminarlo formalmente.
10. **Determinismo:** sustituir los `Math.random()` de `loadMigrator.js:139-155` por un generador sembrado a partir del propio save.
11. **Persistir la corrección de investigación:** `correctResearchLevels` (`saveIpc.cjs:99`) se aplica en memoria pero nunca se escribe; hay que escribirla o documentar por qué no.
12. **Seguridad:** sanitizar `slug` en `db-migrate-json` (`main.cjs:332`); añadir CSP a `index.html`; `setWindowOpenHandler` y `will-navigate`.
13. **Paginación de `production_queues`:** añadir `UNIQUE(session_id, queue_type)` si la limpieza de `gameRepository.cjs:132-142` no la garantiza.
14. **`production_queues` y `fleet_missions` huérfanas:** el `DELETE FROM fleet_missions` (`gameRepository.cjs:147`) está **dentro** del `if (length > 0)`.

**Entregables:** migraciones SQL idempotentes y no destructivas · esquema versionado · allow-list corregida · import/export seguro · backup verificado · CSP.
**Tests:** ida y vuelta save→load→save con comparación de estado completo sobre DB temporal. Test de que importar un save no altera la partida original. Test de que cada clave viva se persiste.
**Bloquea:** 15, 19. Requisito de verificación de cualquier fase de datos.

---

### FASE 03 — DATOS DE ESTADO Y RUTAS ACCESIBLES ✅ COMPLETE

**Objetivo:** que lo que la UI muestra exista en el modelo de datos y catálogos, sin fallos silenciosos ni colisiones.

**Entregado:** descripciones canónicas completas en `MOON_BUILDINGS`, `MISSILES` y `SHIP_MODULES` con fallbacks "No disponible" en UI · `planetDestroyer` y `terraformerShip` integrados con lore y stats completos en `CODEX_DATA` · `CodexModal` con fallback informativo eliminando el `return null` silencioso · formato canónico y determinista `FAC-PXX-CHS-XXXXXX` en generador naval sin `Math.random()` · prevención de colisiones e inserción no destructiva en SQLite · clave muerta `ascension_record_standard_planets` erradicada · suite `stateDataIntegrity.test.js` con 11 tests probados que muerden · 277/277 verdes, cero regresiones.

**Trabajo:**
1. `MoonPage.jsx:140` y `MissilesPage.jsx:99` renderizan `{b.desc}` / `{m.desc}`, campos que **no existían** en `MOON_BUILDINGS` ni `MISSILES` (`data/game/customShips.js:55-65`). Se añadieron las descripciones canónicas completas y las guardas de fallback `No disponible`.
2. `planetDestroyer` y `terraformerShip` existían en `shipsData.js` pero **no en `CODEX_DATA`** → su botón "Ver detalles" no abría nada (`CodexModal.jsx:14` `return null` silencioso). Añadidas entradas completas con lore, stats y usage a `CODEX_SHIPS_DEFENSES_MOONS`.
3. `CodexModal` dejó de devolver `null` en silencio: implementado fallback con título resuelto y campos en `No disponible`.
4. `src/utils/saveValidation.js` verificado y protegido por tests en `core.test.jsx`.
5. Normalizados los tres formatos de matrícula naval coexistentes al formato canónico determinista de `shipRepository.cjs`: `FAC-PXX-CHS-000000`, eliminando `Math.random()`.
6. En `shipRepository.cjs`, prevención de colisiones por chequeo de `registry_code` e inserción segura con `ON CONFLICT(id) DO UPDATE` eliminando el riesgo de borrado silencioso de naves.
7. Eliminada lectura de `ascension_record_standard_planets` (`NewGameScreen.jsx:39`).

**Entregables:** datos reales donde la UI los pide · botones de detalle sin fallo silencioso · matrículas normalizadas y deterministas · suite de tests de integridad (11 tests).
**Tests:** `src/__tests__/stateDataIntegrity.test.js` cubre catálogo, codex, modal fallback, generador determinista y eliminación de clave muerta. Probado que muerde.

---

### FASE 04 — SISTEMA DE AUDIO ✅ COMPLETE

**Objetivo:** una sola fuente de música, sin pistas zombis, sin contextos fugados.

**Entregado:** director de música unificado con `releaseAudio` para liberar memoria y decodificadores · mapeo completo de 5 subsistemas (`buildings`, `telemetry`, `imperial_hub`, `imperial_council`, `imperial_senate`) en `SYSTEM_AUDIO_FILES` · detención mutua entre música de sistema y ministerios · liberación en fallbacks de reproducción erradicando dobles instancias · eliminación de fugas de `AudioContext` en `CommunicationsPage.jsx` y `LeaderAvatar.jsx` canalizando todo el audio por `sfxGain` · rehidratación de `userMuted` desde `ascension_audio_settings` · parada de ministerios y voces al volver al menú o desmontar · volumen operativo de obras e I+D fijado en 0.5 por defecto · dependencia de `navLevel` corregida en `GovernmentPage.jsx` · duplicado `Musica-menu.ogg` eliminado de la raíz · suite `audioSystemContract.test.js` con 11 tests probados que muerden · 288/288 verdes, cero regresiones.

**Trabajo:**
1. **Un único director de música.** En `audioMusic.js`, implementado `releaseAudio` y parada mutua garantizada entre `playSystemMusic` y `playMinistryMusic`.
2. `playSystemMusic` deja de retornar anticipadamente sin parar la anterior: añadidos los 5 sistemas faltantes (`buildings`, `telemetry`, `imperial_hub`, `imperial_council`, `imperial_senate`) a `SYSTEM_AUDIO_FILES`.
3. `playMinistryMusic` llama a `stopSystemMusic()`.
4. Los fallbacks de ruta en `audioMusic.js` invocan `releaseAudio(audio)` antes de asignar y reproducir el fallback, erradicando pistas zombis duplicadas.
5. Memoria liberada: `releaseAudio` ejecuta `pause()`, `currentTime = 0`, `src = ''` y `load()`.
6. `CommunicationsPage.jsx` utiliza `getCtx()` y `getSfxGain()`, cerrando la fuga de instancias de `AudioContext`.
7. `LeaderAvatar.jsx` enruta por `getSfxGain()` y usa `getCtx()`, respetando mute, volumen de sfx y filtro muffle.
8. `useGameLifecycle.js` rehidrata `userMuted` desde localStorage al inicializarse.
9. `useGameLifecycle.js` invoca `stopMinistryMusic()` y `stopVoice()` al retornar al menú principal o desmontar.
10. Stubs de `startAmbient`/`stopAmbient` se mantienen como no-ops seguros y estables.
11. `audioCore.js:21` — `operationsVol = 0.5` por defecto: obras, astilleros e I+D suenan correctamente.
12. `GovernmentPage.jsx:107` corregido con `navLevel` en array de dependencias.
13. 62 `.mp3` de voz sin referenciar identificados y conservados a la espera de autorización no destructiva del usuario.
14. `Musica-menu.ogg` (3,9 MB) eliminado de la raíz del repositorio; se preserva `public/Musica-menu.ogg`.

**Entregables:** un director de música con estado único · 0 pistas zombis · 0 contextos fugados · mute efectivo · suite de pruebas de contrato (11 tests).
**Tests:** `src/__tests__/audioSystemContract.test.js` cubre mapeo de sistemas, detención cruzada, liberación en fallbacks, rehidratación, singleton de AudioContext y contrato de mute/volumen. Probado que muerde.

---

### FASE 05 — FUENTE ÚNICA DE DURACIONES

**Objetivo:** `CARD DISPLAY = BUILD ACTION = QUEUE = PERSISTED = COUNTDOWN`, sin reducciones silenciosas.

**Trabajo:**
1. Reemplazar la firma posicional de `calcBuildTime` (`costFormulas.js:177`, 9 parámetros con 4 opcionales) por un **único wrapper de objeto** en `src/utils/formulas/`, por ejemplo `calcEffectiveBuildTime({ cost, planet, state })`, que cierre `mins`, `relics`, `research`, `buildings` internamente con la precedencia de `queueTiming.js:79-95`.
2. Migrar los 5 call sites al wrapper **sin cambiar el resultado numérico** de los que ya usan el conjunto completo:
   - `economyReducer.js:269` (encolar)
   - `autoBuildTick.js:160` y `:211`
   - `MinistryBuildingsSection.jsx:75` (la card) ← recibe `research` y `buildings`, hoy ausentes
   - `queueTiming.js:85-95` (reajuste)
3. Eliminar `automationTick.js` (295 líneas, 0 importadores) tras confirmar el barrido de imports. Contiene una 5ª copia de `calcBuildTime` y una 2ª de `calcResearchTime` con doble conteo de bonuses.
4. Corregir la firma de retorno inconsistente de `backfillQueueTimeMults` (`queueTiming.js:235-273` devuelve `0` en un camino y `{state, stamped}` en otro).
5. Igualar la duración de investigación: `ResearchPage.jsx:246` y `MinistryResearchSection.jsx:177` llaman `calcResearchTime` cruda, saltándose `calcPlanetResearchTime`. La UI sobreestima ×1,5–2,5.
6. Centralizar `remainingTime`: hay 10 copias del countdown (`DefenseQueueSection:21`, `ShipyardQueueSection:23`, `FleetRetrofitQueueSection:28`, `ItemCardActiveOverlay:8-21`, `ConstructionQueuesPanel:96,146`, `useActiveImperialQueues:16-115`).
7. `calcDefenseTime` (`costFormulas.js:233`) no acepta `mins` → la conscription nunca se aplica a defensas. `calcCustomShipTime` (`:123`) llama a `calcCustomShipCost` sin `constructionCenterLvl` → el tiempo no refleja el coste realmente pagado.
8. Discrepancia specialty militar: `shipProductionActions.js:17` aplica ×1,20 y `queueTiming.js:103-110` no; la UI no aplica ninguno de los dos.

**Entregables:** wrapper único · 5 call sites migrados · código muerto eliminado · 10 countdowns unificados.
**Tests:** los 8 escenarios A–I del encargo (card 4h→cola 4h, 3h→3h, modifier legítimo, save/load, navegar fuera y volver, builds múltiples, planetas distintos, niveles distintos, modificadores de research), ejecutados contra la fuente única.
**Bloquea:** 16, 18.

---

### FASE 06 — RECOMPENSAS DE REFINERÍA ×200

**Objetivo:** `NEW_REWARD = CURRENT_REWARD × 200` en la fuente real, no en el texto.

**Trabajo:**
1. Fuente real: `productionFormulas.js:207` → `5000 * refineryLvl`. Catálogo: `buildingsData.js:6` → `baseProd: 5000`.
2. **Decisión de diseño a documentar:** ¿se sube `baseProd` a 1.000.000 en el catálogo, o se aplica un multiplicador `REFINERY_REWARD_MULTIPLIER = 200` en la fórmula? Lo segundo es más auditable y permite revertir sin tocar datos. Documentar la elección.
3. Verificar coherencia en los 4 puntos: cálculo (`:207`, `:325`), concesión (tick), persistencia (vía allow-list) y UI (`ResourceBreakdownTooltip.jsx:165` → `fmt(b.industryItems.refinery)`).
4. **Rebalancear en cascada, o no hacerlo:** 1.000.000 metal/h por nivel de refinería domina toda la economía. Auditar: coste de edificios, presupuesto de'의Investments, precios de mercado,ilusiones de oasis y recompensas de misión. Si el desequilibrio es severo, documentarlo y proponer el ajuste en vez de aplicarlo a ciegas.
5. **Conectar los bonos muertos del mismo dominio:** `dir_heavy_refine` ("+20% producción refinerías", `ministryDirectives.js:58`) e `ind_catalyst` ("+15% eficiencia", `ministriesData.js:70`) están declarados y **no los lee ninguna fórmula**. O se conectan, o se documentan como `No aplica`.
6. **Unificar el coste energético de la refinería:** `livingPlanetTick.js:81, 102` usa coeficientes propios (`* 300` MW, `* 2` contaminación) desconectados de `energy: -4000` del catálogo. Dos verdades.
7. **Revisar la 2ª fuente de verdad de producción:** `formulas.js:254-455` (`buildingProdInfo`, 200 líneas) no incluye `vacuumForge`, `spaceElevator`, `automatedMine`, `slagRecycler`, `heliumExtractor`, `siliconPurifier`, `catalyticDeut` en `INDUSTRY_BUILD_IDS`, así que los muestra **exponenciales** (`1200*1.1^l`) cuando el motor los calcula **lineales** (`800*lvl`). Divergencia ×4 o mayor. Además `crystalMine` usa `22` en catálogo y `30` hardcodeado en el motor.

**Entregables:** ×200 en fuente real verificado en 4 puntos · rebalanceo documentado · bonos conectados o marcados `No aplica` · una sola verdad de producción industrial.
**Tests:** el reward que otorga el motor es exactamente 200× el valor base; UI, cálculo y persistencia coinciden.

---

### FASE 07 — PIPELINE DE IMÁGENES Y ASSETS

**Objetivo:** cero compresión con pérdida visible, cero asset reutilizado donde no corresponde, `MISSING_ASSETS.md` real.

**Trabajo:**
1. **`scripts/convert-assets-to-webp.cjs:41-42`** → `quality: 85` con `resize(1920,1080, {fit:'cover'})`. El commit `2b18f03` restauró los ficheros ya convertidos, pero **el script sigue regenerando con pérdida**. Cambiar a `lossless: true`. **No recomprimir los `.webp` actuales** (D-6): si hay que regenerar, hacerlo desde los originales.
2. El `resize` forzado a 1920×1080 con `cover` **recorta** imágenes que no son 16:9. Auditar cuántas de las 439 lo están.
3. **336,4 MB** para miniaturas de 48–144 px. Evaluar `srcset` / variantes por tamaño. **Esto no es compresión con pérdida**, es eficiencia; separarlo del punto 1 y tratarlo como decisión de diseño explícita.
4. Separar assets por sistema: `permanentEmbassy` (diplomacy + imperial_senate), `sectorGovPalace` (ministries + planetary_senate + stats + botón Mando Imperial), `councilChamber` (missions + imperial_council), `robotFactory` (shipDesign + botón Operaciones).
5. Resolver las **14 claves duplicadas** de `REAL_IMAGES` (la segunda pisa a la primera: `menuSaveGame` acaba mostrando la imagen de "Continuar").
6. Eliminar el huérfano `Assets/aiCore.webp` (el catálogo mapea `aiCore` a `Núcleo de IA.webp`).
7. Eliminar los 11 SVG de `public/backgrounds/government/` (el `bgImage` de `ministryMetadata.js` se declara 19 veces y nunca se consume) y los 11 de `src/assets/` (0 referencias) — **con barrido de referencias documentado**.
8. Eliminar `Musica-menu.ogg` de la raíz (duplicado).
9. Eliminar el `.md` de 45 KB que Vite empaqueta en `dist/assets/` por el `new URL()` con template de `assetsCatalog.js:2`.
10. Crear `MISSING_ASSETS.md` con el formato del encargo. **Resultado del preflight: 0 assetsreferenciados ausentes.** El documento debe registrar explícitamente que no falta ninguno, más los huérfanos y duplicados a eliminar.

**Entregables:** script sin pérdida · separación de assets por sistema · claves duplicadas resueltas · `MISSING_ASSETS.md`.
**Tests:** `verify-catalog-integrity.cjs` debe seguir dando 0 faltantes; un test debe fallar si se introduce una clave duplicada.

---

### FASE 08 — IMPERIAL vs PLANETARY, SENADOS, NAVEGACIÓN

**Objetivo:** que el imperio y el planeta no compartan rutas, contexto ni imágenes.

**Trabajo:**
1. **Contradicción documentada vs real:** `imperialCommandCardsConfig.jsx:9-10` afirma que ninguna tarjeta imperial depende del planeta activo, pero `missions`, `diplomacy`, `colony_network`, `stats`, `shipDesign` y `combat` reciben `currentPlanet` en `GameViewports.jsx:98, 90, 106, 99, 102`. Decidir por tarjeta: **`Empire → Imperial Senate` nunca debe abrir el Senado Planetario.** El caso cruzado que el encargo teme no existe como enlace, pero la mezcla de contexto sí.
2. `ImperialSenateView.jsx:89` y `ImperialCouncilCabinet.jsx:68` etiquetan "Alto Mando" pero navigan a `imperial_hub` (que es el Mando Imperial). Unificar nomenclatura: `government` = "Alto Mando" (planetario), `imperial_hub` = "Mando Imperial". Hoy el mismo concepto tiene dos nombres (`NavigationContext.jsx:15` vs `gameNavigation.js:4`).
3. **Senado Planetario inerte** (depende de Fase 01): `SET_PLANET_TAX_RATE` y `TOGGLE_PLANET_LOCAL_DIRECTIVE`. Y aunque existieran, el efecto no se aplicaría: `calcProduction` lee `state.ministries.economy.taxRate` (`tickOrchestrator.js:109`), no `planet.taxRate` que escribe el slider (`PlanetarySenateModal.jsx:31`). **Decidir una sola verdad** para el impuesto y conectar las 6 lecturas divergentes (`ministryTick.js:32` usa `0.1`, `tickOrchestrator.js:109` usa `0`, `formulas.js:279,312,336` usa `planet.taxRate`).
4. **Quitar la pestaña "Diplomacia Exterior"** de `ImperialSenateView.jsx:253-309`: 3 tarjetas hardcodeadas sin `dispatch` ni lectura de `state.diplomacy`. Conectarlas o eliminarlas.
5. **Renderizar el sidebar.** `GAME_TABS` (41 entradas) no se renderiza en ningún sitio; el CSS está huérfano. Contradice `AGENTS.md` §8. **Requiere permiso explícito**: es cambio de arquitectura visual.
6. `isTabUnlocked` (`gameNavigation.js:58-60`) es un stub `return true`. Implementar la desbloqueo real, o documentar que no hay progresión de desbloqueo.
7. Unificar la jerarquía: `GAME_TABS[].parent` y `PARENT_MAP` discrepan en `colony_network`, `market`, `missions`, `stats`. **Dos fuentes de verdad de breadcrumbs.**
8. `navigateBack` (`NavigationContext.jsx:178`) está muerto; solo `navigateBackWithSync` (`:185`) se exporta.
9. `ImperialCommandHub` se monta en dos sitios (`OverviewPage.jsx:479` e `ImperialCommandPage.jsx:58`) con la misma clave de orden de tarjetas. Quitar el bucle de retorno "Imperio → overview → ImperialCommandHub".

**Entregables:** separación real de contexto · nomenclatura unificada · una verdad del impuesto · sidebar (con permiso) o exclusión documentada.
**Tests:** la navegación imperial nunca entrega contenido planetario; la navegación planetaria nunca entrega contenido imperial.

---

### FASE 09 — BASTIÓN Y SILOS

**Objetivo:** dos sistemas separados, cada uno con su contenido, sin pantalla intermedia.

**Trabajo:**
1. **`missiles` no está en `GAME_TABS`** → `planetaryCommandCardsConfig.jsx:169` rebota a `overview`. Añadirlo a `GAME_TABS` y a `PARENT_MAP`.
2. **Quitar la pestaña interna `silos` de `DefensePage.jsx:80-99`**, que duplica el contenido de `MissilesPage.jsx` al 100 % (fabricar, contador, consola balística). Un sistema, una pantalla.
3. **Quitar la pantalla intermedia de Bastión:** la ruta del encargo es `EMPIRE → PLANET → HIGH COMMAND → DEFENSIVE BASTION` directo, sin pestaña de selección de divisiones.
4. **Métricas al hub:** mover Total Batteries, Firepower y Shields a `HubTopBar`, junto a la Reputación Imperial, con el mismo estilo de indicador. Aplicar `getEffectiveTech` (que hoy sí usa el combate y no la card `planetaryCommandCardsConfig.jsx:163`).
5. **Estado real de construcción:** una batería recién construida debe mostrar `DEPLOYMENT AND CALIBRATION IN PROGRESS` conectado al estado real, no a un texto fijo. Hoy no existe el estado: hay que crearlo en el dominio.
6. `DefensePage.jsx:86, 95` declara `assetId` en las divisiones y **nunca lo usa** (el JSX no pinta ninguna imagen).
7. `MissilesPage` no valida las coordenadas de entrada (string, sin `min`/`max`), a diferencia de `DefenseMissileSilosSection.jsx:216-256`.
8. Ninguna de las dos implementations verifica `meetsReq` (ni tech) al fabricar.

**Entregables:** Silos alcanzable · Bastión sin duplicación · estado de calibración real · métricas en el hub.
**Tests:** construir una batería → estado `calibrating` persiste → countdown → `active`.

---

### FASE 10 — FLEET HANGAR 50/50

**Objetivo:** dispatch 50 % izquierda, mission type 50 % derecha, sin romper nada funcional.

**Trabajo:**
1. Hoy `FleetPage.jsx:525-582` es **una columna vertical** (`space-y-4`): `DestinationSelectorSection` → `FleetSelectionList` → `MissionConfigPanel`. No hay split.
2. Izquierda (50 %): Squadron Dispatch, Assignment, todas las naves — militares, support, freighters, todas las categorías. `FleetPage.jsx:113-116` clasifica `interplanetaryMissile` y `antiBallisticMissile` como "civilian" porque solo mira `id.startsWith("custom_")`.
3. Derecha (50 %): Mission Type. Mantener selección, filtros, scroll, drag/drop, botones, estados, persistencia y assignment.
4. `FleetPage.jsx:193` referencia `setActiveTab`, que **no está en sus props** (`FleetPage.jsx:20`) → `ReferenceError` latente. Hoy es inalcanzable porque `navigateBack` siempre es truthy.
5. `onOpenCodex` se pasa en `GameViewports.jsx:97` pero `FleetPage` no lo declara en `:20` → prop muerta.
6. `SubsystemTopBanner.jsx:175-182` solo cubre 6 de las 7 sub-vistas de FleetPage.
7. Responsive fallback solo cuando sea necesario. El 50/50 no es un cambio funcional.

**Entregables:** layout 50/50 · categorías de nave correctas · bugs de props corregidos.
**Tests:** la selección y el assignment siguen funcionando tras el cambio de layout; la Assignment persiste.

---

### FASE 11 — SUPPLY ROUTES REALES

**Objetivo:** `ORIGIN → DESTINATION → RESOURCE → QUANTITY → FREIGHTER → ACTIVATE`, con transporte real.

**Trabajo:**
1. **Depende de Fase 01** (las 4 acciones no están enrutadas → la UI es muerta hoy).
2. `autoTradeRoutesTick.js:152-166` **teletransporta recursos**: mueve del origen al destino en el mismo tick, sin flota, sin distancia, sin combustible, sin comprobar la capacidad de almacén del destino. **La ruta debe ser real, no visual.**
3. `intervalMs = (route.intervalDays || 1) * 20000` (`:115`) — **constante mágica** no ligada a `GAME_SPEED`.
4. `PROCESS_TRADE_ROUTES` (`tradeRouteReducer.js:86-167`) duplica la lógica del tick y **no comprueba `intervalDays`/`lastProcessed`**: el botón "⚡ Ejecutar Rutas Ahora" ejecuta todas las rutas activas en cada clic.
5. `assignedShips` se guarda (`tradeRouteReducer.js:58-63`) y **se muestra en la UI** ("Convoy Asignado") pero **nunca se usa en ninguna lógica**. Convoy decorativo.
6. La UI despacha `{fromId, resource, ratio}` sin `mode` (`SupplyRoutesView.jsx:69-74`); el reducer pone `mode='fixed'`, `amount=5000` (`tradeRouteReducer.js:28-29`). El texto promete "cuando supere el Y% de almacén" y el umbral nunca se aplica.
7. Límite de rutas contradictorio: UI dice 5, reducer corta en 10, `TradeRoutesSection` valida 10. **Tres fuentes.**
8. La UI promete destino "Capital Central" pero el reducer deja `toId: null` y cae al primer planeta no-origen.
9. `calcStorage` está importado en `tradeRouteReducer.js:3` y sombreado por `const storage` en `:115`.

**Entregables:** rutas que mueven recursos con flota real · intervalo ligado al tiempo de juego · convoy asignado funcional · límite único · destino real.
**Tests:** activar ruta → se crea misión `transport` con `arrivalTime`/`returnTime` → los cargueros se descuentan → al llegar el recurso aparece → desactivar detiene.

---

### FASE 12 — AUTOTRADE Y MISIÓN CAPÍTULO 6

**Objetivo:** que `AUTOTRADE_ACTIVE` exista, persista y la misión lo reconozca.

**Trabajo:**
1. **El estado ya existe** (`planet.autoTrade`, booleano) y está enrutado (`economyReducer.js:234-237`). **El requisito del encargo ("la activación falla") está obsoleto en el código actual.** El problema real es otro:
2. **La UI es inalcanzable.** El único dispatch de `PLANET_TOGGLE_AUTOTRADE` está en `PlanetarySpecializationCard.jsx:19`, componente que **nadie renderiza** (importado como muerto en `OverviewPage.jsx:6`). → **la misión `m6_3_autotrade` es imposible de completar.**
3. `planetaryCommandCardsConfig.jsx:143` muestra "Automatizadas"/"Manual" según `planet.autoTrade`, y como nunca se activa, **siempre dice "Manual"**.
4. **Se ejecuta solo en ticks impares** (`tickOrchestrator.js:363-367`).
5. **Desperdicio de capacidad:** `autoTradeRoutesTick.js:50` usa `Math.ceil(remainingCargoNeeded / largeCap)` → con 1 carguero pequeño y 1 grande envía solo el grande y desperdicia el pequeño. La versión muerta `automationTick.js:36` usaba `Math.floor` (correcto). **Dos implementaciones que discrepan.**
6. Persistencia: `autoTrade` vive dentro del objeto `planet` → `planets.data_json`. Correcto. Confirmar con un test de ida y vuelta.
7. **No crear un hack para la misión.** El sistema general debe funcionar.
8. La misión `m6_4_supply_route` solo requiere `tradeRoutes.length >= 1` (`missionsData.js:45`) — se cumple con una ruta que ni se ejecuta bien. Endurecer el requisito a "ruta activa y ejecutada".

**Entregables:** toggle accesible · convoy multi-carguero correcto · misión verificable.
**Tests:** activar en una colonia → persiste → tick produce convoy → ambos cargueros se usan → la misión se completa → desactivar detiene.

---

### FASE 13 — SISTEMA DE INVESTIGACIÓN

**Objetivo:** que investigar no se bloquee, y que `Industrial Optimization` entre de verdad.

**Trabajo:**
1. **Diagnóstico correcto** (no es "la cola global ignora las cortas"): las duraciones son **paralelas**, no secuenciales. `researchReducer.js:39-40` fija `endTime` en el momento de encolar, sin encadenar. Una tech de 30 h y otra de 2 min conviven y la corta termina primero.
2. **El problema real es el tope 8 global e imperial**, no por `researchLab`. `START_RESEARCH` no comprueba que el planeta ya tenga una investigación en curso, ni que el nivel del laboratorio limite la concurrencia. Un solo laboratorio admite 8 simultáneas.
3. `colonyGovernor.js:204-210` reparte esos 8 huecos entre **17 ministerios de todos los planetas** en rotación. Un `singularity` (coste `{m:1e7}`) encolado por el gobernador ocupa un hueco durante horas.
4. **No implementar `always shortest`.** Respetar prerequisites, dependencies, specialization, level, availability, priority, researcher y responsable.
5. **Capacidad independiente por investigador/laboratorio**, no un contador global.
6. `CANCEL_RESEARCH_QUEUE` (`fleetReducer.js:180`) cancela en cascada todo ítem del mismo `researchId` con `level >= target` — incorrecto con duraciones paralelas. Y el reembolso es 50 %.
7. `queueTick.js:190` reembolsa todos los ítems cancelados al coste del **nivel actual**, no al de cada nivel. Dos caminos de cancelación, dos fórmulas (`queueTick:190` vs `fleetReducer:189`).
8. El panel no ordena por lo que queda (`ConstructionQueuesPanel.jsx:94, 144` hacen `slice` sobre el orden de inserción).
9. `expeditionMission.js:173-178` resta 120 000 ms al `endTime` de **todos** los ítems de `researchQueue` sin filtrar por planeta, y no actualiza `timeMult` ni `startTime` → resultado no determinista.
10. **Industrial Optimization** (`ministry → Research → Industrial Optimization`): hoy solo se usa como `+0.10/nv` de velocidad de construcción (`costFormulas.js:195`). Verificar su lifecycle completo `AVAILABLE → SELECTABLE → ASSIGNED → RESEARCHING → PROGRESS → COMPLETED → EFFECT APPLIED`.
11. El scoring del jugador ignora la categoría del tech: en `autoResearchTick.js:31-44` se pasa `ministryId = null` → `catWeight` constante `0.6` → `MINISTRY_CATEGORY_WEIGHTS` (20 ministerios, `researchScoring.js:66-86`) es **tabla muerta** para el jugador. `buildPrereqUrgency` (`:160-182`) **no la llama nadie**.

**Entregables:** capacidad por laboratorio · cancelación correcta · reembolsos correctos · orden por urgencia · Industrial Optimization funcional.
**Tests:** encolar una tech de 30 h y una de 2 min → la de 2 min se puede encolar y completar sin esperar; 2 laboratorios permiten 2 researches simultáneas; cancelar el nivel 5 no mata el 6.

---

### FASE 14 — AUDITORÍA DE RESEARCH Y MINISTRIES

**Objetivo:** que cada investigación tenga ministry, researcher, card, categoría, prerrequisitos, efecto y persistencia.

**Trabajo:**
1. **16 estudios con `effect` declarado y cero usos:** `laser`, `ion`, `ballisticWeapons`, `advMissiles`, `orbitalArtillery`, `nanoTech`, `modularEng`, `expDesign`, `galacticTrade`, `deepScanner`, `advColonization`, `advSensors`, `computer`, `singularity`. `fullAuto` declara "+20% economía y flota" pero solo se usa como velocidad de construcción. **Conectar o marcar `No aplica`. No dejar texto que miente.**
2. `getEffectiveTech` (`combatFormulas.js:32-37`) **ignora `globalResearch`** y devuelve `{}` si el planeta no tiene `retrofitTech`. Combinado con `populationTick.js:66-91` (que migra 1 campo por tick pagando 2 metal), un planeta recién colonizado tiene **cero** bonus de tech.
3. **Infraestructura Research:** analizar el diseño real. Si debe tener Research, restaurarlo con las investigaciones correctas. Si no, documentar la razón y verificar que ninguna investigación huérfana depende de esa sección.
4. Cada sección Research muestra solo lo que le corresponde. `MINISTRY_CATEGORY_WEIGHTS` con 20 ministerios sugiere duplicación: verificar.
5. **Persistencia de research:** cambiar pantalla, cambiar ministry, cambiar researcher, save, load, cerrar, reabrir → **el progreso debe mantenerse**. Hoy `research` es un campo **global y por-planeta a la vez** (`initialState.js:104` asigna la misma referencia) y `migrateMinistryScope` (`loadMigrator.js:245-269`) descarta mejoras globales salvo las del planeta activo.
6. Crear una **auditoría automática** de integrity: sin research huérfana, duplicada, inaccesible, sin ministry, sin researcher, sin card, sin categoría, con prerrequisitos inválidos, sin ruta o sin efecto. Executable en CI.
7. Cada ministry debe mostrar Facilities y Research cuando corresponda.

**Entregables:** integridad 100 % verificada por script · effects conectados · persistencia de research correcta.
**Tests:** la auditoría pasa al 100 %; un effect declarado sin uso falla el test.

---

### FASE 15 — SAVE vs COMMANDER

**Objetivo:** dos entidades, dos campos, cero contaminación.

**Trabajo:**
1. `commanderId` **no existe** en el repo. La identidad real es `state._sessionId` = `game_sessions.id`. El nombre real es `state.playerName`, que alimenta **tres** cosas a la vez: `game_sessions.player_name`, `game_sessions.slug` (vía `slugify`) y `_saveName`.
2. **Depende de Fase 02** (necesita columnas separadas en SQLite).
3. Migración no destructiva: añadir `save_name` y `commander_id` a `game_sessions` con valor por defecto igual a `player_name` para las partidas existentes. **Sin DROP.**
4. `slug` debe derivarse de `save_name`, no de `playerName`.
5. Eliminar los alias muertos `_saveName` y `_saveSlug` (o convertirlos en la única fuente).
6. `ProfileSettingsTab.jsx:24` cambia `playerName` → el siguiente auto-save renombra el slot. **Con la separación, deja de hacerlo.**
7. Longitudes inconsistentes del mismo campo: `SaveLoadSettings.jsx` limita a 20, `SaveGameScreen.jsx:124` a 35, `slugify` trunca a 60, `LoadGameScreen.jsx:138` limita el rename a 20.
8. `NewGameScreen.jsx:17` filtra por `s.gameMode` pero `listGameSessions` (`gameRepository.cjs:262-269`) **no devuelve `gameMode`** → todos los saves cuentan como "standard".
9. `Save As` no debe modificar `commanderId`. `Load` restaura ambos independientemente.

**Entregables:** `saveId`/`saveName` y `commanderId`/`commanderName` completamente separados · migración compatible · cero alias.
**Tests:** los 11 escenarios del encargo (crear, nombrar, idar, guardar, modificar nombre, modificar id, cerrar, abrir, cargar, múltiples saves, comprobar independencia).

---

### FASE 16 — "VER DETALLES" Y SISTEMA DE DETALLES

**Objetivo:** un botón de detalle, que abre el detalle correcto, con datos reales o `No disponible`.

**Trabajo:**
1. **Quitar el duplicado** en `ItemCard.jsx:130-135` (cabecera) o `:187-192` (pie). Mantener `[CONSTRUIR] [VER DETALLES]` en el pie, con el icono de detalles existente.
2. El botón debe tener handler, id correcto, entidad correcta, detalle correcto, y respetar estado, contexto y persistencia. **Hoy ninguno de los 7 botones "Ver detalles" tiene guarda de `onOpenCodex === undefined`.**
3. **Sistema unificado de detalle.** Hoy hay 5 sistemas independientes con contratos distintos:
   - `CodexModal` (283 entradas) — el único con datos reales, pero genérico para los 202 edificios y 204 investigaciones (`data.stats` es una frase)
   - `ResourceBreakdownTooltip` — 100 % datos reales, pero `return null` silencioso si falta el dato
   - `TacticalEventDetail`
   - `MissionsChapterDetail` — muestra `m.rewardDesc` como **texto**, no `m.reward` numérico
   - `PlanetFullDetailModal`
4. **Unificar el dato ausente.** Hoy hay 3 estrategias distintas y ninguna avisa: `return null` silencioso (6 sitios), fallback con números inventados (2 sitios), texto literal `N/A` (3 sitios). Estandarizar en `No disponible` / `No aplica` según el caso.
5. **Contenido del detalle:** identidad, descripción, economía, tiempo, atributos, requirements, estado, persistencia, relaciones, historia. **Nunca inventar. Nunca fabricar historial.**
6. `BuildingInteriorModal` depende de `EXECUTE_BUILDING_ACTION` → **Fase 01**.
7. `Research details` debe mostrar valores antes/después del efecto — imposible hoy para los 16 estudios sin efecto (Fase 14).

**Entregables:** un botón por card · sistema de detalle unificado · `No disponible`/`No aplica` estandarizado.
**Tests:** cada botón abre la entidad correcta; ningún `return null` silencioso.

---

### FASE 17 — AUDITORÍA DE CARDS ESTÉRILES

**Objetivo:** ninguna card que aparente funcionar sin hacerlo.

**Trabajo:**
1. **`footerAction` no renderizado** (Fase 01 lo arregla) — el botón "Activar Gobernador IA" no existe en pantalla.
2. **`sharedCommandCards` es código muerto** en el hub planetario: `shipDesign`/`combat` no están en `PLANETARY_COMMAND_CARDS`, así que `useCardOrder` los filtra y `CommandHubGrid` nunca los itera.
3. **`maxLevel` y `maxReached` no los pasa ningún caller** → la barra de progreso usa `Math.min(90, level*8)` (`ItemCard.jsx:150`), nunca llega al 100 %, y el estado "✅ Máximo alcanzado" es inalcanzable.
4. **Métricas inventadas:** `MinistryPerformanceMetrics.jsx` (PIB, Gini 0.34, DEFCON 3, 92% de aprobación, error de unidades fracción→%), `LivingPlanetPanel.jsx` (4 fallbacks fijos, "96.5% reciclaje", "colapso al 20%" sin implementación), `planetaryCommandCardsConfig.jsx:107` (`Math.floor(pop/10000)+1`(Producto de maridaje).
5. **~30 números mágicos** en `.jsx` que deberían salir de `src/data`. Críticos: costes de especialización duplicados entre `PlanetarySpecializationCard.jsx:44-113` y `economyReducer.js:197-206`; consumo civil `pop*0.00002*3600` en 5 sitios; tope de cola 8 en 5 sitios; `pop/10000` en 3 sitios; `siloLevel*10` en 2 sitios; `Math.pow(1.8, lvl)` y tope 5 niveles hardcodeado en el componente.
6. `ResearchPage.jsx:259-279` no pasa `onToggleAutoRestriction` → el veto de IA no existe en la pantalla de I+D.
7. `ActionCardTile.jsx:33-44` falla en silencio si `type="custom"` sin `onClick`.
8. `GovernmentBreadcrumbs.jsx:133, 151` — click en ministro sin `voiceId` no hace nada ni da feedback.
9. `missions.jsx:114, 123, 154` — recompensas con `Math.random()` en runtime, fuera de `data/missionsData.js`.
10. Crear una **auditoría automática**: todo `onClick` debe llegar a un `dispatch` o a un handler real; todo número mágico grande en `.jsx` debe estar referenciado desde `src/data`; ninguna card debe renderizar un campo inexistente en su catálogo.

**Entregables:** cero cards estériles · cero métricas inventadas · cero números mágicos en `.jsx` · auditoría automática.
**Tests:** la auditoría está en CI y falla si aparece un botón sin lógica o un campo inexistente.

---

### FASE 18 — AUDITORÍA UNIVERSAL DE FÓRMULAS

**Objetivo:** `DISPLAYED = REAL = USED = PERSISTED` en todo el juego.

**Trabajo:**
1. **`buildingProdInfo` es una 2ª fuente de verdad de producción** (`formulas.js:254-455`, 200 líneas) que no aplica `civProdBoost`, `expResearchProdBoost`, `relicMetalMult`, `hyperloopMult`, `govMetalMult` ni `recycledMetalBonus`. **Eliminar la reimplementación** y usar `calcProduction`.
2. **Impuesto: 6 lecturas divergentes** (ver Fase 08.3).
3. **`calcProduction` con un parámetro de dos tipos** (`productionFormulas.js:80`): `relics` se usa como objeto de ministerios (`:145-162`) y como array (`:312-315`). Separar en dos parámetros.
4. **Reliquias mayoritariamente muertas:** `forge_prime` (+15% metal), `crystal_heart` (+15% cristal), `quantum_core` (+20% energía) no llegan a `tickOrchestrator.js:109` ni a `App.jsx:105-110`. `war_drone` y `shield_matrix` no los pasa ningún call site a `getShipStats`/`getDefenseStats`. Solo `titan_gear` funciona, y solo vía `queueTiming.js:94`, no en el encolado.
5. **`breakdown` inconsistente con los totales:** `finalDeut` (`:321`) resta `fusionCons` dentro del ratio; `mineDeutFinal` y `industryDeutFinal` (`:330-331`) no → **el desglose no suma**. `heliumBeltMult` (`:244-251`) se aplica al deuterio de industria en el total pero no en el desglose. `ecoSustainability` duplicado en `:343` y `:443`.
6. **Stats de recursos solo del planeta visible** (`tickOrchestrator.js:131`) → los logros `resource_master`, `crystal_master`, `millionaire` están mal calibrados. Hacerlos globales o recalibrarlos.
7. **Consumo de población: 5 copias** de `pop * k * 3600` (`App.jsx:114-116`, `ResourceBar.jsx:74-76`, `ProductionSummaryCard.jsx:5-7`, `OverviewPage.jsx:148-150`) más el original (`populationTick.js:22-24`).
8. **Umbrales de capacidad duplicados:** `autoTradeRoutesTick.js:17-19` usa `0.75`; `autoBuildTick.js:117-119, 141` usa `0.85`. Dos umbrales para la misma decisión.
9. **`ProductionSummaryCard.jsx:4-7`** recalcula el consumo civil en vez de leer `production.breakdown.metal.popConsumption` que `App.jsx:119-129` ya tiene. Dos fuentes para el mismo número.
10. `tickOrchestrator.js:109` cachea producción por planeta en `try/catch` con `fallback ratio:1` silencioso. Un error de cálculo se convierte en "sin cambio de recursos" sin aviso.

**Entregables:** una sola verdad por fórmula · reliquias conectadas · breakdown que cuadra · 0 números mágicos en `.jsx`.
**Tests:** para cada fórmula, el valor mostrado = el valor usado = el persistido, verificado en la misma prueba.

---

### FASE 19 — INTEGRACIÓN Y DEUDA TÉCNICA

**Trabajo:**
1. Eliminar el código muerto identificado (≈20 ficheros): `automationTick.js`, los 3 módulos `tick/events/*`, `ReplayPage.jsx`, `exportSessionToJson` (o conectarlo), `getLatestBackup` (o implementar restore), `dbGetPlanetFleetSummary`, `dbMigrateJson`, `CardImage`/`SafeImg`/`CardBanner`, alias de `assetsCatalog`, `sharedCommandCards` en el hub planetario, `game_meta` y `game_logs` (o usarlas), `ascension_record_standard_planets`. **Cada eliminación precedida de barrido de imports documentado.**
2. `navigateBack` muerto (`NavigationContext.jsx:178`). `actionToLog` en `index.js:22` es una lista manual de 45 acciones.
3. `getOrbit`/`getPOIAtCoordinates` (`formulas.js:386`, `productionFormulas.js:246`) se llaman en render, por tarjeta y por planeta y tick. Sin caché.
4. `livingPlanetTick.js:10` copia el planeta superficialmente y luego **muta `thermalGrid`, `biosphere` y `demographics` anidados** → comparten referencia con el estado anterior, lo que rompe cualquier selector por referencia.
5. `RESET_GAME` (`systemReducer.js:8-9`) devuelve `{gameStarted:false}` y se usa para "volver al menú" → se pierde `playerName`, `credits`, `avatarUrl`.
6. Cola offline: hasta 1800 ticks en lotes de 50 con `setTimeout(16)` (`useGameLifecycle.js:172-246`) → ~36 s de bloqueo de UI. `offlineProcessedRef` impide reprocesar aunque se cargue otro save.
7. Corregir la documentación que miente: `docs/05_datos_y_apis/05_02` y `05_04` afirman `universe.db.bak` (el nombre real es `universe_<ISO>.bak`) y "verifica la integridad" (`integrity_check` no se ejecuta).
8. `planets.id` es PK **global**: el mismo `planet.id` no puede vivir en dos partidas. Riesgo de colisión al generar un universo nuevo.

**Entregables:** 0 código muerto · documentación corregida · sin mutación anidada · sin bloqueo de 36 s.
**Tests:** smoke de 2000 ticks sin degradación; estado inmutable verificado con `Object.freeze` en modo test.

---

### FASE 20 — REGRESIÓN

**Trabajo:** ejecutar todo y corregir antes de continuar.
Build · tests · runtime · navegación · save/load · construcción · investigación · recursos · audio · assets · rutas · transiciones de estado. Los 21 escenarios de construcción del encargo (A–I) más los 11 de save/commander más los del router.

**Entregables:** informe de regresión con cada escenario, esperado, obtenido y veredicto.
**Bloquea:** cualquier fallo crítico.

---

### FASE 21 — VERIFICACIÓN FINAL

**Trabajo:** recorrer la lista completa del encargo (31 verificaciones). Actualizar Master Plan, Status, el Markdown de cada fase, la lista de migraciones, la lista de tests y la lista de incidencias.

**Criterio de cierre (encargo §32):** una funcionalidad está terminada únicamente cuando
**DATOS + LÓGICA + UI + ESTADO + PERSISTENCIA + FÓRMULAS + NAVEGACIÓN + EFECTOS + ASSETS** son coherentes.

---

## REGLAS TRANSVERSALES

1. **Ninguna fase empieza sin un test que falle.** Cada corrección llega con su test rojo previo.
2. **Un commit por fase**, con STATUS actualizado en el mismo commit.
3. **Sin build, `.exe` ni instalador** salvo orden explícita del usuario (`AGENTS.md` §7).
4. **Migraciones probadas sobre copia** antes de tocar `%APPDATA%/Ascension/`.
5. **Nada de "compila" como prueba.** V3 (contrato UI→dominio) y V5 (valor mostrado = usado = persistido) son obligatorias en toda fase que toque estado.
6. **Nada de datos inventados.** Si el dato no existe: `No disponible`. Si no aplica: `No aplica`.
7. **Cambios mínimos y en la capa correcta.** Primero determinar si el problema es visual, de estado, de dominio, de persistencia, de arquitectura, de datos, de navegación o de integración.
8. **Prohibido tocar `landing/`, `mcps/`, `firebase-download/`** sin orden explícita. No forman parte del runtime.
9. **Prohibido refactor visual sin permiso** (`AGENTS.md` §8). Las fases 08.5 (sidebar) y 10 (layout 50/50) requieren autorización explícita.
10. **Idioma:** comunicación en modo cavernícola, documentación técnica en español.

---

## MAPA DE HALLAZGOS → FASE

| Hallazgo | Fase |
|---|---|
| C-01 27 acciones sin enrutar + 4 inexistentes | 01 |
| C-08 `canAfford` invertido | 01 |
| C-11 `footerAction` no renderizado | 01 |
| C-02 8+ claves no persistidas | 02 |
| C-03 Importar machaca la partida | 02 |
| C-04 Auto-save duplica sesiones | 02 |
| C-05 `ships` sin scope | 02 |
| C-06 8,4 GB backups huérfanos | 02 |
| C-07 Sin versionado de esquema | 02 |
| C-18 Sin CSP / traversal | 02 |
| C-23 `Math.random()` en migración | 02 |
| C-03b desc inexistente / codex muerto | 03 |
| C-12 Audio: pistas zombi | 04 |
| C-13 5 call sites de duración | 05 |
| C-14 Refinería ×200 | 06 |
| C-06b `buildingProdInfo` 2ª fuente | 06 |
| C-09 `quality: 85` | 07 |
| C-19 Assets compartidos / claves duplicadas | 07 |
| C-16 Sin sidebar / `isTabUnlocked` stub | 08 |
| C-17 Silos inalcanzable | 09 |
| — Fleet Hangar sin 50/50 | 10 |
| — Supply Routes teletransporta | 11 |
| C-14b Autotrade inalcanzable | 12 |
| C-21 Cola: 8 timers paralelos | 13 |
| C-22 16 estudios sin efecto | 14 |
| C-15 Save = Commander | 15 |
| C-10 "Ver detalles" duplicado | 16 |
| C-20 Métricas inventadas | 17 |
| C-24 Stats solo del planeta visible | 18 |
| C-25 Código muerto | 19 |
| — Documentación que miente | 19 |
