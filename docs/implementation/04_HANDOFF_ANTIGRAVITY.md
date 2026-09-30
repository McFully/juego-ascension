# 04 — TRASPASO PARA OTRO AGENTE (Google Antigravity)

Este documento es la puerta de entrada. No necesitas leer más para empezar.
Al terminar de leerlo, lee `01_MASTER_PLAN.md` y el bloque `FASE NN` de
`ASCENSION_IMPLEMENTATION_STATUS.md` de la fase que te toque.

Orden de lectura:
1. Este documento
2. `AGENTS.md` (reglas maestras del proyecto, en la raíz)
3. `docs/implementation/ASCENSION_IMPLEMENTATION_STATUS.md` (estado real)
4. `docs/implementation/01_MASTER_PLAN.md` (las 22 fases)
5. `docs/implementation/00_PREFLIGHT.md` (los 25 hallazgos, solo si necesitas contexto de un hallazgo concreto)

---

## 1. QUÉ ES ESTE PROYECTO

**Ascensión**: juego grande de estrategia espacial, single player, **100 % local
para Windows**. Electron + React + Vite + SQLite (`better-sqlite3`).

### Regla que NO se negocia

El juego es **offline por diseño**. Prohibido en runtime: servidores externos,
cloud saves, sincronización online, sockets, telemetría, llamadas web. Todo se
guarda en `%APPDATA%/Ascension/saves/universe.db`.

**Consecuencia práctica:** si alguna tarea te pide Supabase, PostgreSQL, RLS,
API REST, autenticación o "servidor de partidas", **para y pregunta**. Esas
palabras salen de un documento de encargo antiguo que describía otro proyecto.
La verdad está en `AGENTS.md` y en el código.

### Stack real

| Capa | Tecnología |
|---|---|
| Runtime | Electron 42 (`contextIsolation:true`, `nodeIntegration:false`, `sandbox:true`) |
| UI | React 18 + Vite 6 + Tailwind + framer-motion + three |
| Estado | `useReducer` único + 9 sub-reducers + switch raíz (`src/reducers/index.js`) |
| Persistencia | SQLite vía `better-sqlite3` + 22 canales IPC |
| Tests | `vitest` (24 suites, 266 tests) + Playwright (1 smoke) |
| Build | `vite build` → `electron-builder` (nsis + portable) |

No hay CI. No hay linter. No hay typechecker. La verificación es `npm test`.

### Magnitud

320 ficheros en `src/`, ~58.500 líneas. 24 páginas. 22 pantallas. 129 edificios.
124 tecnologías. 439 imágenes (336 MB). 137 ficheros de audio.

---

## 2. DÓNDE ESTAMOS

```
2b18f03  (punto de partida)
1c69f25  chore(preflight): punto de retorno, 142 ficheros del trabajo en curso
33d86da  fix(dominio): encaminar 25 acciones rotas y crear 3 que no existian
98a421d  fix(persistencia): allow-list, identidad de sesión, esquema, backup
```

| Fase | Estado | Qué entregó |
|---|---|---|
| 00 Preflight | COMPLETE | 25 hallazgos verificados, 22 fases planificadas |
| 01 Router | COMPLETE | 25 rutas + 3 acciones nuevas, 28 tests, 0 regresiones |
| 02 Persistencia | COMPLETE CON RESERVA | allow-list 37→50, esquema versionado, backup con checkpoint, CSP, 15 tests |

**Rama:** `main`. **Working tree:** limpio. **Suite:** 266/266 verdes.

### El hallazgo que tienes que entender

La UI despachaba **27 acciones que nunca llegaban a ningún reducer** (`src/reducers/index.js` enruta 99; 25 existían como `case` en sub-reducers pero no en el switch raíz, y 4 no existían en absoluto). Ocho sistemas renderizaban perfecto y no hacían nada: Mercado Galáctico, DAO, mercado negro, bazar, Rutas de Suministro, retrofit, interiores de edificio, terraformaje, igualación de colonias, automatización de ministros, Senado Planetario y Base Lunar.

**223 tests pasaban mientras tanto.** Ninguno invocaba `gameReducer` (el router raíz): todos llamaban a sub-reducers directamente.

Y un detalle que costó un test: encaminar no basta. El alias `START_MOON_BUILDING` estaba en el router pero **no en `fleetReducer`**, así que seguía cayendo en su `default`. Solo un test de comportamiento lo detectó.

---

## 3. CÓMO SE TRABAJA AQUÍ (lee esto antes de tocar nada)

Estas seis reglas son la diferencia entre avanzar y fabricar mentiras.

### 3.1 Un test que falla es el punto de partida, no el final

**Ninguna fase empieza sin un test rojo previo.** Si no puedes escribir el test
que falla, todavía no entiendes el problema.

### 3.2 Prueba que Muerde, no que Decora

Un test que pasa siempre no vale nada. **Verifícalo rompiendo el código a
propósito** y comprobando que el test se pone rojo. Se ha hecho dos veces:

```powershell
# quitar la ruta de MARKET_TRADE del router y ver que el contrato falla
Copy-Item src/reducers/index.js "$env:TEMP\b.bak" -Force
$c = Get-Content src/reducers/index.js -Raw
$c = $c -replace "(?m)^\s*case 'MARKET_TRADE':\r?\n", ""
[System.IO.File]::WriteAllText("$PWD\src\reducers\index.js", $c)
npx vitest run src/__tests__/routerContract.test.js   # debe FALLAR
Copy-Item "$env:TEMP\b.bak" src/reducers/index.js -Force
```

> **AVISO — herramientas de PowerShell.** `Set-Content` y `Out-File` destruyen
> la codificación UTF-8 de estos ficheros: leen como ANSI y escriben como UTF-8,
> produciendo doble codificación (`remediación` → `remediaciÃ³n`) más un BOM.
> Ya ha pasado dos veces. **Usa las herramientas de edición por archivo, o
> `[System.IO.File]::WriteAllText($path, $content, [Text.UTF8Encoding]::new($false))`.**
> Si ves `Ã`, `Â`, `â€` o `ï»¿` en un diff, es esto.

### 3.3 Encaminado ≠ Funcional

Una acción que llega al reducer y sale por un `return state` temprano sigue
siendo un botón decorativo. **El test tiene que exigir que el estado cambie.**

```js
// MAL: solo comprueba que no lanza
expect(() => gameReducer(s, action)).not.toThrow();

// BIEN: comprueba mutación real
const s1 = gameReducer(s0, action);
expect(s1.planets[0].moon.buildings.lunarBase).toBe(1);
```

### 3.4 VALOR MOSTRADO = VALOR REAL = VALOR USADO = VALOR PERSISTIDO

Si un componente calcula lo mismo que el motor, es una segunda fuente de verdad
yEventually divergen. Cuando encuentres uno, no lo "arregles" con un parche:
elimina el cálculo duplicado y usa la fuente real.

Si el dato no existe: `No disponible`. Si no aplica: `No aplica`. **Nunca inventes
valores para que algo parezca que funciona.**

### 3.5 Nada se borra sin evidencia

Antes de eliminar algo: busca todas sus referencias, quién lo usa, si tiene
persistencia, migraciones, tests e imports. **Si no puedes demostrar que está
obsoleto, déjalo y documéntalo.** Hay una tabla de operaciones destructivas en
`00_PREFLIGHT.md` §9.

### 3.6 Una fase, un commit, con el STATUS actualizado

```
Implementar → Testear → Corregir → Verificar → Documentar →
Actualizar STATUS → Actualizar Master Plan → Evaluar bloqueos
```

Si hay hard blocker, la fase queda `BLOCKED` y **no avanzas**.

---

## 4. PROHIBICIONES ABSOLUTAS

| # | No hagas esto | Por qué |
|---|---|---|
| 1 | `npm run build`, `npm run dist`, generar `.exe` o instalador | `AGENTS.md` §7. Solo con orden explícita del usuario, y el instalador va a `E:\Proyectos Antigravity\Juegos\Ascensión\Instalador` |
| 2 | Tocar `landing/`, `mcps/`, `firebase-download/` | No son parte del runtime (`AGENTS.md` §3) |
| 3 | Borrar los 617 ficheros `.bak-wal` (8,4 GB) | Destructivo. Hay código que los poda, pero solo si el jugador lo pide |
| 4 | Purgar las 176.140 naves con `session_id` NULL | Destructivo. Requieren autorización (ver §6) |
| 5 | Rediseñar la arquitectura visual sin permiso | `AGENTS.md` §8. Las fases 08 (sidebar) y 10 (layout 50/50) lo necesitan |
| 6 | Meter red, Supabase, sockets, telemetría | Rompe el runtime offline |
| 7 | `DROP TABLE`, `DROP COLUMN`, `DELETE` masivo, `TRUNCATE` | `00_PREFLIGHT.md` §9 |
| 8 | Declarar algo terminado porque "compila" o "el botón existe" | El criterio real es el de `AGENTS.md` / el encargo §32 |

---

## 5. PRÓXIMAS FASES, EN ORDEN

El orden no es temático, es **por causa raíz**. Detalle completo de cada una en
`01_MASTER_PLAN.md`.

### FASE 03 — Datos de estado y rutas accesibles · *siguiente*

 independiente. Corta y de resultado visible.

Trabajo:
1. `src/pages/MoonPage.jsx:140` renderiza `{b.desc}` y `MissilesPage.jsx:99`
   renderiza `{m.desc}`. **Esos campos no existen** en `MOON_BUILDINGS` ni en
   `MISSILES` (`src/data/game/customShips.js:55-65`) → párrafo vacío. Decidir:
   añadir `desc` a los datos, o aplicar `No disponible`.
2. `planetDestroyer` y `terraformerShip` existen en `shipsData.js` pero **no en
   `CODEX_DATA`** → su botón "Ver detalles" no abre nada
   (`CodexModal.jsx:14` `return null` silencioso).
3. **Tres formatos de matrícula naval** conviven:
   - `migrator.cjs:6` → `HUM-P01-LF-000001`
   - `queueTick.js:245` → `HUM-ZDOB-BAT-608080` (6 dígitos aleatorios)
   - `shipRegistryBridge.js:11` → con `Math.random()`
   Unificar en el generador determinista de `shipRepository.cjs:4`.
4. **Riesgo de pérdida de datos**: `ships.registry_code` es UNIQUE global y el
   generador en runtime usa 6 dígitos aleatorios. Con 176.140 filas la paradoja
   del cumpleaños casi garantiza colisión, y `INSERT OR REPLACE`
   (`shipRepository.cjs:18`) **borra la fila ajena en silencio**. Esto NO ha
   pasado todavía en la base real, pero es un bomba de relojería. Sustituye por
   generador determinista no colisionable.
5. `ascension_record_standard_planets` (`NewGameScreen.jsx:39`): 1 lectura, 0
   escrituras → siempre `0`. Decidir si se implementa o se elimina.

Criterio de aceptación: ningún componente renderiza un campo que no exista en
su catálogo. Prueba: recorre todas las entidades de `data/` y verifica que todo
campo accedido por la UI está definido.

### FASE 05 — Fuente única de duraciones · *la causa raíz de tu bug*

Esta es la fase que explica "la card dice 4 horas y la cola dice 2".

Diagnóstico ya hecho, **no lo repitas**: existe UNA fórmula,
`calcBuildTime` (`src/utils/formulas/costFormulas.js:177`), pero se invoca con
**5 conjuntos de argumentos distintos**:

| # | Call site | `mins` | `research` | `buildings` | `relics` |
|---|---|---|---|---|---|
| 1 | `economyReducer.js:269` (encolar) | ❌ | ✅ | ✅ | ❌ |
| 2 | `autoBuildTick.js:160` | ❌ | ✅ | ✅ | ❌ |
| 3 | `autoBuildTick.js:211` | ❌ | ✅ | ✅ | ❌ |
| 4 | `MinistryBuildingsSection.jsx:75` (**la card**) | ❌ | ❌ | ❌ | ❌ |
| 5 | `queueTiming.js:85-95` (reajustar) | ✅ | ✅ | ✅ | ✅ |

La causa raíz **no es visual**: es que la firma posicional de 9 parámetros con
4 opcionales se rellena de 4 maneras distintas. El primer tick reescribe el
`endTime` con tolerancia 0,5 %.

Trabajo:
1. Sustituir por un **wrapper de objeto único**, por ejemplo
   `calcEffectiveBuildTime({ cost, planet, state })`, que cierre `mins`,
   `relics`, `research`, `buildings` internamente con la precedencia de
   `queueTiming.js:79-95`. Migrar los 5 call sites **sin cambiar el resultado
   numérico** de los que ya usan el conjunto completo.
2. Eliminar `src/reducers/tick/automationTick.js` (295 líneas, **0 importadores**)
   tras confirmar el barrido de imports. Contiene una 5ª copia de `calcBuildTime`
   y una 2ª de `calcResearchTime` con doble conteo de bonuses.
3. Corregir `backfillQueueTimeMults` (`queueTiming.js:235-273`): devuelve `0`
   (número) en un camino y `{state, stamped}` en otro. API con dos tipos.
4. `ResearchPage.jsx:246` y `MinistryResearchSection.jsx:177` llaman
   `calcResearchTime` cruda saltándose `calcPlanetResearchTime` → la UI
   sobreestima ×1,5–2,5.
5. Unificar los **10 countdowns** duplicados (`DefenseQueueSection:21`,
   `ShipyardQueueSection:23`, `FleetRetrofitQueueSection:28`,
   `ItemCardActiveOverlay:8-21`, `ConstructionQueuesPanel:96,146`,
   `useActiveImperialQueues:16-115`).
6. `calcDefenseTime` (`costFormulas.js:233`) no acepta `mins` → la conscription
   nunca se aplica a defensas. `calcCustomShipTime` (`:123`) llama a
   `calcCustomShipCost` sin `constructionCenterLvl` → el tiempo no refleja el
   coste pagado.

Tests obligatorios: los 8 escenarios A–I del encargo (card 4h→cola 4h, 3h→3h,
modifier legítimo, save/load, navegar fuera y volver, builds múltiples, planetas
distintos, niveles distintos, modificadores de research).

**Desbloquea:** 16, 18.

### FASE 04 — Audio

Hay una **pista zombi en 5 pantallas**: `playSystemMusic`
(`src/audio/audioMusic.js:192-206`) hace `if (!fileName) return;` **antes de
parar nada**, y `SYSTEM_AUDIO_FILES` no tiene entrada para `buildings`,
`telemetry`, `imperial_hub`, `imperial_council`, `imperial_senate`. La música de
la pantalla anterior sigue sonando.

Además: `playMinistryMusic` nunca llama a `stopSystemMusic()`; los fallbacks de
ruta (`:142`, `:231`) sustituyen la referencia sin pausar el `Audio` original;
`CommunicationsPage.jsx:27` crea un `AudioContext` por transmisión y nunca lo
cierra; `LeaderAvatar.jsx:20,80` conecta a `destination` directo ignorando mute
y muffle; `audio.js:148-149` tiene `startAmbient`/`stopAmbient` como stubs vacíos
con 4 call sites.

Objetivo: un único director de música con estado único
(`idle | menu | system:<id> | ministry:<id> | cosmic`).

### FASE 06 — Refinería ×200

**No está implementado.** Valor real: `productionFormulas.js:207` →
`5000 * refineryLvl`. Catálogo: `buildingsData.js:6` → `baseProd: 5000`. No
existe `* 200` en `src/`.

Decisión de diseño a documentar: ¿subir `baseProd` a 1.000.000, o aplicar un
multiplicador `REFINERY_REWARD_MULTIPLIER = 200` en la fórmula? Lo segundo es
más auditable y reversible. **Y avisa antes:** 1.000.000 metal/h por nivel
domina toda la economía, así que hay que rebalancear en cascada o documentar
por qué no.

De paso: `formulas.js:254-455` (`buildingProdInfo`, 200 líneas) es una **2ª
fuente de verdad de producción** que no incluye 7 edificios de industria
(`vacuumForge`, `spaceElevator`, `automatedMine`, `slagRecycler`,
`heliumExtractor`, `siliconPurifier`, `catalyticDeut`) y los muestra
**exponenciales** cuando el motor los calcula **lineales**. Divergencia ×4.

### FASE 07 — Imágenes y assets

`scripts/convert-assets-to-webp.cjs:41-42` sigue en
`.resize(1920,1080,{fit:'cover'}).webp({quality:85})`. El commit `2b18f03`
restauró los **ficheros** ya convertidos, pero **no el script**: cualquier
regeneración futura reintroduce la pérdida. El script de ministros sí usa
`lossless: true`.

**No recomprimas los `.webp` actuales** (operación D-6): si hay que regenerar,
desde los originales.

336,4 MB para miniaturas de 48–144 px. Evalúa `srcset`/variantes por tamaño, pero
separa eso de la calidad: reducir resolución no es lo mismo que degradar.

Además: 14 claves duplicadas en `REAL_IMAGES` (la segunda pisa a la primera;
`menuSaveGame` acaba mostrando la imagen de "Continuar"), 1 fichero huérfano,
11 SVG de fondo muertos, 11 SVG de `src/assets` muertos, `Musica-menu.ogg`
duplicado (8 MB en `dist/`). Y hay que crear `MISSING_ASSETS.md`: **el resultado
del preflight es 0 assets referenciados ausentes** (verificado al 100 %, 438/438),
así que el documento debe registrar explícitamente que no falta ninguno, más los
huérfanos y duplicados a eliminar.

### FASE 08 — Imperial vs Planetary, y navegación

Requiere **permiso explícito** para el punto 5 (sidebar). El resto no.

1. `imperialCommandCardsConfig.jsx:9-10` afirma que ninguna tarjeta imperial
   depende del planeta activo, pero `missions`, `diplomacy`, `colony_network`,
   `stats`, `shipDesign` y `combat` **sí** lo reciben
   (`GameViewports.jsx:98,90,106,99,102`). La documentación miente.
2. Nomenclatura partida en dos: `government` = "Alto Mando" (planetario),
   `imperial_hub` = "Mando Imperial". Hoy el mismo concepto tiene dos nombres.
3. **Impuesto con 6 lecturas divergentes.** `planetaryCommandCardsConfig.jsx`
   → ya unificado en Fase 01 a `planet.taxRate` con respaldo del ministerio.
   Quedan 2 sin unificar: `ministryTick.js:32` (recaudación) y
   `formulas.js:279,312,336` (cards de edificio).
4. `ImperialSenateView.jsx:253-309`: pestaña "Diplomacia Exterior" con 3
   tarjetas hardcodeadas sin `dispatch` ni lectura de `state.diplomacy`.
5. **No hay sidebar.** `GAME_TABS` (41 entradas) no se renderiza en ningún
   sitio; el CSS está huérfano. Contradice `AGENTS.md` §8. **Pide permiso.**
6. `isTabUnlocked` (`gameNavigation.js:58-60`) es un stub `return true`.
7. `GAME_TABS[].parent` y `PARENT_MAP` discrepan en `colony_network`, `market`,
   `missions`, `stats`: dos fuentes de verdad de breadcrumbs.

### Fases restantes (detalle en `01_MASTER_PLAN.md`)

09 Bastión/Silos · 10 Fleet Hangar 50/50 (permiso visual) · 11 Supply Routes
reales · 12 Autotrade y Capítulo 6 · 13 Cola de investigación · 14 Auditoría
research/ministries · 15 Save vs Commander · 16 "Ver detalles" y sistema de
detalles · 17 Cards estériles · 18 Auditoría de fórmulas · 19 Integración y deuda
técnica · 20 Regresión · 21 Verificación final.

---

## 6. PENDIENTES QUE ESPERAN TU DECISIÓN

No los toques sin que el usuario lo diga.

| # | Qué | Tamaño | Dónde |
|---|---|---|---|
| I-01 | 176.140 naves con `session_id` NULL: sin dueño de sesión | 90 % de un `universe.db` de 92 MB | `00_PREFLIGHT.md` D-2 |
| I-02 | 617 ficheros `.bak-wal` huérfanos | **8,4 GB** (84 % de la carpeta saves) | `00_PREFLIGHT.md` D-4 |
| I-05 | No hay función de restaurar desde backup | — | `00_PREFLIGHT.md` D-6 |

I-01 e I-02 ya tienen el código que los resuelve
(`pruneOrphanSidecars` + canales `inspect-backup-sidecars` /
`prune-backup-sidecars`, y `deleteGameSession` con `WHERE session_id`). Lo que
falta es la decisión y, para I-01, un filtro que no pierda naves de una partida
viva.

---

## 7. HALLAZGOS ABIERTOS PARA TU FASE

Descubiertos al implementar las fases 00–02. No reaparezcan como "sorpresas":

| # | Qué | Fase destino |
|---|---|---|
| N-01 | `calcProduction` lee `plasma` de `undefined` (`productionFormulas.js:90`); el `try/catch` del tick lo convierte en producción 0 **sin aviso** | 18 |
| N-02 | `state.activeUltimatum` no tiene productor: el overlay nunca aparece | 17 |
| N-03 | `RETROFIT_SHIP_VARIANT` / `RETROFIT_DEFENSE_VARIANT` / `CANCEL_RETROFIT_QUEUE` encaminados pero sin test de punta a punta (dependen de `planet.fleetVariants`, que ningún test monta) | 16, 17 |
| N-04 | `PROCESS_TRADE_ROUTES` ignora `intervalDays` y duplica la lógica del tick | 11 |
| N-05 | `ASSIGN_LOCAL_MINISTRY_BUDGET` encaminado pero sin despachador en la UI | 17 |
| I-04 | `correctResearchLevels` se aplica en memoria pero nunca se escribe en la DB | 19 |

N-01 es el más nasty: un planeta deja de producir y el jugador no se entera
nunca.

---

## 8. RESERVA DE LA FASE 02

`98a421d` se marcó `COMPLETE CON RESERVA`, no `COMPLETE`. Motivo:

Las dos migraciones de esquema están escritas y verificadas por contrato, pero
**no se han ejecutado contra un `universe.db` real**, porque el usuario pidió no
tocar su base. Se aplicarán solas al abrir el juego la primera vez.

Mitigaciones ya en el código: cada migración está guardada por `PRAGMA
table_info`, es idempotente, y el runner captura el error, lo registra y deja
arrancar el juego. Aun así, **la primera vez que se abra el juego hay que
comprobar el log en `%APPDATA%/Ascension/logs/error.log`** y confirmar que
`game_meta.schema_version` quedó en 3.

---

## 9. PROTOCOLO DE CIERRE DE FASE

Al terminar una fase, en este orden:

1. `npx vitest run` → todos verdes, **cero regresiones** respecto al conteo anterior
2. Parsear los ficheros tocados sin emitir build:
   ```powershell
   npx esbuild --loader:.jsx=jsx --loader:.js=jsx --outfile=NUL <fichero>
   ```
3. **Probar que tu test nuevo muerde** (rompe el código a propósito, comprueba
   que se pone rojo, revierte)
4. Rellenar el bloque `FASE NN` de `ASCENSION_IMPLEMENTATION_STATUS.md` con la
   plantilla que ya está en el fichero
5. Actualizar la tabla de fases y el `Avance:` del STATUS
6. Actualizar la sección de la fase en `01_MASTER_PLAN.md` con lo entregado y
   lo que se encontró
7. Añadir hallazgos nuevos a la tabla `COLA DE HALLAZGOS` del STATUS
8. Un commit, con mensaje estilo conventional commit en español, que explique
   **la causa** y no solo el síntoma
9. **No hacer push** salvo que lo pidan

---

## 10. RESUMEN EN UNA FRASE

> El juego se ve entero y funciona entero, pero el router de acciones tenía 27
> agujeros y la persistencia perdía media partida en silencio, y 223 tests no se
> enteraron porque ninguno miraba la puerta de entrada. **Verifica siempre por
> comportamiento, nunca por apariencia.**
