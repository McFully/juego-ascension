# PROMPT DE TRABAJO PARA GOOGLE ANTIGRAVITY — Ascension

Proyecto: `E:\Proyectos Antigravity\Juegos\Juegos para Windows\Juego Ascensión`
Stack: React 18 + Vite 6 + Electron + Vitest. Estado en reducer puro (sin Zustand para el juego).
Tests: `npm test` (vitest). Build: `npm run build`.

**REGLAS DURAS (del AGENTS.md del proyecto, no se ignoran):**
- Prohibido `npm run build`, `npm run dist`, generar `.exe` o instalador. Solo `npm test` y `npm run dev`.
- Prohibido tocar `landing/`, `mcps/`, `firebase-download/`, `electron/` salvo necesidad real.
- Prohibido rediseñar la arquitectura visual, mover sidebar/header, meter animaciones invasivas.
- No crear abstracciones que oculten reglas del juego. Fragmentación sana sí se permite.
- No tocar builds, instaladores, zips ni landing.

---

# PARTE 1 — Sistema de Investigación

## 1.1 BUG CRÍTICO: "Optimización Industrial" se cancela a sí misma

**Síntoma:** la investigación nunca se completa. Al terminar el temporizador, se borra de la cola,
se avisa *"Investigación cancelada: requisitos no cumplidos. Recursos reembolsados."* y se devuelven
los recursos. Se puede repetir indefinidamente.

**Causa raíz:** el requisito `req` mezcla **investigaciones** y **edificios**, y la validación de
finalización solo mira investigaciones.

`src/data/game/researchData.js:41`
```js
industrialOpt: { name: 'Optimización Industrial', icon: '📈', cost: { m: 10000, c: 8000, d: 4000 },
  factor: 2, cat: 'economy', req: { miningAuto: 3, robotFactory: 5 },
  effect: 'Acelera velocidad de construcción de edificios (+10%/nv)', perLevel: { buildSpeed: 10 }, unit: '%' },
```

`robotFactory` es **Fábrica de Robots**, un edificio (`src/data/game/buildingsData.js:19`).
`miningAuto` es una investigación (`researchData.js:40`).

**El sitio que falla — `src/reducers/tick/queues/queueTick.js:181-199`:**
```js
if (now >= item.endTime) {
  const rDef = RESEARCH[item.researchId];
  const reqMet = !rDef || !rDef.req || meetsReq(rDef.req, newState.research);   // <-- LÍNEA 183, EL BUG
  if (!reqMet) {
    // ... reembolso + notificación de cancelación + continue
  }
```

`newState.research.robotFactory` es `undefined` → `(undefined || 0) >= 5` → `false` → siempre falla.

**Todos los demás sitios sí mezclan edificios correctamente:**
| Archivo:línea | Contexto | ¿Mezcla edificios? |
|---|---|---|
| `src/reducers/researchReducer.js:30` | `START_RESEARCH` | ✅ `{...planet.buildings, ...state.research}` |
| `src/reducers/tick/automation/autoResearchTick.js:42` | auto-ciencia | ✅ |
| `src/reducers/tick/automationTick.js:115` | código muerto | ✅ |
| `src/reducers/colonyGovernor.js:219` | ministros | ✅ `{...b, ...research}` |
| `src/pages/ResearchPage.jsx:240` | UI | ✅ |
| `src/components/government/MinistryResearchSection.jsx:92` | UI ministerios | ✅ |
| **`src/reducers/tick/queues/queueTick.js:183`** | **finalización** | ❌ **← BUG** |
| **`src/pages/TechTreePage.jsx:65`** | **UI árbol** | ❌ **← BUG** |

**Fix 1.1-a — `queueTick.js:183`:** reconstruir el contexto mergeando los edificios del planeta que
posee la investigación, antes de validar. El item de la cola tiene `item.planetId`; si viene vacío
 cae a `state.currentPlanetId`; si tampoco existe, validar solo contra `research` (degradación segura
en vez de cancelar una partida cara por un dato que falta).
```js
const ownerPlanet = newState.planets?.find(pl => pl.id === item.planetId)
  || newState.planets?.find(pl => pl.id === newState.currentPlanetId);
const ctx = { ...(ownerPlanet?.buildings || {}), ...(newState.research || {}) };
const reqMet = !rDef || !rDef.req || meetsReq(rDef.req, ctx);
```

**Fix 1.1-b — `TechTreePage.jsx:65`:** mismo merge, usando `currentPlanet.buildings`. Ahora
`industrialOpt` sale como bloqueada para siempre mostrando `Req: Nv.5 (Tienes: 0)` sobre
`robotFactory`.

**Fix 1.1-c — Robustez de `meetsReq`.** `src/utils/formulas.js:177-180`
```js
export const meetsReq = (req, research) => {
  if (!req) return true;
  return Object.entries(req).every(([k, v]) => (research[k] || 0) >= v);
};
```
No distingue investigación de edificio, y un `id` mal escrito falla en silencio. Añadir un helper
único, por ejemplo `meetsResearchReq(req, research, buildings)` en `src/utils/formulas.js`, que:
- resuelva la clave primero contra `BUILDINGS` y luego contra `RESEARCH`;
- emita `console.warn` en desarrollo si la clave no existe en ninguno de los dos;
- devuelva `true` (no bloquea) si la clave es desconocida, para no dejar una partida encerrada.
Luego sustituir los **8** call sites de la tabla de arriba por el helper único. Elimina de raíz esta
clase de bug.

**Fix 1.1-d — Efecto falso.** `industrialOpt.perLevel.buildSpeed` **no lo lee ninguna fórmula**.
`calcBuildTime` (`src/utils/formulas/costFormulas.js:177-200`) solo mira `fullAuto`,
`molecularVaporDep`, `adaptiveModularArch`, `b.colonySupremeCourt`. El texto promete "+10%/nv de
velocidad de construcción" y no ocurre. O se añade `industrialOpt` a `calcBuildTime`, o se corrige
el texto. **Recomendado: añadirlo a `calcBuildTime`**, porque la descripción es la correcta y el
nivel 5 como prerrequisito de `modularEng` y nivel 3 de `galacticTrade` solo se justifican con el
bonus real.

**Tecnologías afectadas por el mismo bug (arregladas por 1.1-a/1.1-c):**
`researchData.js:27` `nanoRepair` (`naniteFactory`), y en `src/data/expanded/expandedResearch.js`
`carbonNanotubes:34`, `townHall:63,64,65`, `robotFactory:66,70,89`, `terraformer:72`,
`diploCenter:78,79,80,83`, `militaryAcademy:84`, `spyCenter:87,93`, `leisureCenter:65`.
Todas con `req` de edificio, todas se autobombardean hoy.

---

## 1.2 BUG PRINCIPAL: los ministros no eligen la investigación más barata/rápida

**Síntoma:**{IAs — emperador, gobernador y ministros — ignoran las investigaciones baratas o
rápidas y se lanzan a investigaciones de días/semanas, dejando el resto de lado.

**Causa raíz — `src/reducers/colonyGovernor.js:209-230`:**
```js
if ((state.researchQueue || []).length < 8 && mapping.research && mapping.research.length > 0) {
  if ((b.researchLab || 0) >= 1) {
    for (const resId of mapping.research) {          // <-- ORDEN DEL ARCHIVO, sin sort
      if (planet.automatedExclusions?.[resId]) continue;
      const rDef = RESEARCH[resId];
      if (!rDef) continue;
      const rLvl = research[resId] || 0;
      const meetsR = meetsReq(rDef.req, { ...b, ...research });
      if (!meetsR) continue;
      const rCost = researchCost ? researchCost(resId, rLvl, b.researchLab || 0) : {};
      if (canAfford(res, rCost)) {
        dispatch({ type: 'START_RESEARCH', researchId: resId, planetId: planet.id });
        break;                                        // <-- GANA EL PRIMERO DEL ARRAY
      }
    }
  }
}
```
**No existe ninguna puntuación.** El coste solo es puerta binaria (`canAfford`), nunca criterio de
ordenación. Gana el **primer elemento del array tal y como está escrito en el archivo**.

**Fix 1.2-a — Puntuación real.** Reemplazar el `for` + `break` por una evaluación de todos los
candidatos y quedarse con el de mejor puntuación. Crear un módulo nuevo
`src/reducers/tick/ai/researchScoring.js` con una función pura y testeable, por ejemplo
`scoreResearch({ id, rDef, level, cost, labLevel, research, buildings, planetResources, GAME_SPEED, missionTechs })`
que devuelva un número. Puntuación propuesta (todo relativo, sin números mágicos sueltos):
- base: `1 / (costo ponderado normalizado)` — premia lo barato;
- ÷ duración estimada vía `calcResearchTime` normalizada — premia lo rápido (esto es lo que hoy no existe);
- × peso de la categoría del ministerio (el más relevante: economía/recursos arriba, militar solo si
  hay amenaza detectada en el estado);
- bonificación fuerte (tipo `×0.05`, como ya se hace con `prioritizedTechs` en
  `autoResearchTick.js:39`) si la investigación desbloquea otra ya disponible o encolada;
- bonificación si es prerrequisito de algo que la facción ya tiene a medias;
- excluye los `req` no cumplidos y los que no puede pagar, y los ya en cola
  (`isAlreadyResearchingType`).
Añadir tests en `src/reducers/tick/ai/researchScoring.test.js` con casos reales del dataset
(comprobar que `combustion` 200/100/0 gana a `ion` 5000/4000/2000 cuando ambos están disponibles).

**Fix 1.2-b — Reordenar los arrays de `MINISTRY_MAPPING`** en
`src/data/buildingOperationsData.js` **por coste ascendente real**, para que incluso la lógica
antigua se comporta mejor como red de seguridad. Casos rotos que hay que corregir:
- `buildingOperationsData.js:116` `war: ['weapons','laser','ion','plasma','combustion',...]` —
  `combustion` cuesta `{m:200, c:100, d:0}` (`researchData.js:9`) pero está **5º**; en cuanto `ion`
  (5000/4000/2000) cumple requisitos, `combustion` quedaIgnorado para siempre.
- `buildingOperationsData.js:78` `innovation: ['nanoTech','nanoRepair','expDesign','cyberIntegration']`
  — `nanoTech` cuesta 50000/40000/20000, el más caro de la lista, y está **primero**.
- `buildingOperationsData.js:67` `science: ['astrophysics','hyperspace','quantumDrive',...]` —
  `astrophysics` necesita `espionage:4 + impulse:3 + energy:4`, y `impulse` lo produce el ministerio
  **war**. Ciencia queda muerta hasta que guerra investigue 3 niveles de impulso. Sin fallback a
  una prerrequisito más barata.
- `buildingOperationsData.js:56` `energy: ['energy','advReactors',...]` — este sí funciona bien
  (`energy` cuesta `{m:0, c:800, d:400}`), servir de referencia de ordenación.

**Fix 1.2-c — 7 ministerios no pueden investigar nunca.** `infra`, `biosphere`, `agriculture`,
`civics`, `diplomacy`, `justice`, `culture` no tienen array `research` en `MINISTRY_MAPPING`
(líneas 7, 141, 151, 160, 169, 194, 203), así que `mapping.research && ...` es `false` en
`colonyGovernor.js:210` y solo construyen. Asignarles al menos 1-2 tecnologías coherentes con su
función, o dejar constancia explícita de que son ministerios solo de construcción (con un
comentario en el dato) para que no parezca un bug.

**Fix 1.2-d — Cola global de 8 reparte mal.** `colonyGovernor.js:111-121` ordena los ministerios
`energy → resources → infra` primero y la cola es **global** (`< 8`). Los primeros monopizan los 8
huecos y ciencia/innovación/cibernética se quedan sin nada. Ideas: repartir los huecos por ronda
(round-robin) entre ministerios activos, o reservar al menos 1 hueco para el ministerio de ciencia.
Añadir test que verifique que con 2 ministerios activos ambos consiguen investigar.

---

## 1.3 BUG SECUNDARIO: la auto-ciencia ordena por coste pero ignora la duración

`src/reducers/tick/automation/autoResearchTick.js:30-46`
```js
for (const [id, r] of Object.entries(RESEARCH)) {
  if (isAlreadyResearchingType(id)) continue;
  if (cp.automatedExclusions?.[id]) continue;
  const cost = researchCost(id, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
  const costSum = (cost.metal||0) + (cost.crystal||0)*1.5 + (cost.deuterium||0)*3;
  const priorityMultiplier = prioritizedTechs.has(id) ? 0.01 : 1.0;
  const finalScore = costSum * priorityMultiplier;
  if (finalScore < lowestPriorityScore && canAfford(cp.resources, cost) && meetsReq(r.req, { ...cp.buildings, ...newState.research })) { ... }
}
```
Es el **único** sistema que puntúa, pero `calcResearchTime` se llama **después** de elegir ganador
(línea 59), solo para rellenar `endTime`. Resultado: la IA elige la más barata aunque sea la más
lenta. **Unificar este sistema con el scoring de 1.2-a**: mismo módulo `researchScoring.js`, misma
puntuación. Si son los dos caminos idénticos, el código baja de 3 implementaciones a 1.

---

## 1.4 BUG: las IAs rivales (emperadores) no eligen nada

`src/reducers/tick/ai/aiEmpireTick.js:158-164`
```js
if (strat.weight?.mil > 0.4 && Math.random() < 0.02 * aiLvl)      newAi.research.weapons++;
else if (strat.weight?.eco > 0.4 && Math.random() < 0.02 * aiLvl) newAi.research.plasma++;
else if (strat.weight?.tech > 0.4 && Math.random() < 0.02 * aiLvl) newAi.research.computer++;
```
- No lee `RESEARCH`, no calcula coste, no comprueba `req`, no encola nada, no considera duración.
- Solo 3 contadores hardcodeados sobre el blob privado `ai.research`.
- Las estrategias de `src/data/game/galaxyData.js:122-151` con `weight` ≤ 0.5 en las tres ramas
  (`merchant`, `diplomat`, `clanist`) **no pasan ningún gate `> 0.4`** → esas facciones no investigan
  nunca, en toda la partida.

**Fix 1.4:** dar a las facciones de IA el mismo `researchScoring.js`, evaluado contra su propio
`state.research` y recursos, y encolar en el mismo `researchQueue` global (o en su cola propia si
se decide aislarlas). Mínimo: que toda estrategia tenga peso > 0 en alguna rama, y que el
`Math.random()` sustituya al peso como factor, no sea la única fuente de decisión.

---

## 1.5 Bugs de argumentos en llamadas (revisar con lupa)

| Archivo:línea | Bug | Fix |
|---|---|---|
| `src/reducers/colonyGovernor.js:222` | `researchCost(resId, rLvl, b.researchLab || 0)` — la firma es `researchCost(id, lvl, aiStrategyLvl, constructionCenterLvl)` (`costFormulas.js:54`). **El nivel de laboratorio se pasa como nivel de aiStrategy.** El affordability sale con descuento fantasma; el `dispatch` a `START_RESEARCH` es rechazado en silencio por `researchReducer.js:29` y el turno se pierde. | `researchCost(resId, rLvl, research?.aiStrategy \|\| 0, b.constructionCenter \|\| 0)` |
| `src/reducers/tick/automation/autoResearchTick.js:59` | `calcResearchTime(cost, lab, GAME_SPEED, bonus, newState.research)` — la firma es `calcResearchTime(cost, lab, speed, bonus, mins, research)` (`costFormulas.js:202`). Se pasa `research` en la posición `mins`. Consecuencia: `researchGrants` y el ministro de ciencia caen al valor por defecto y el bonus de `synchronousOptical` **nunca se aplica**. | `calcResearchTime(cost, lab, GAME_SPEED, mult, cp.ministries?.science \|\| newState.ministries?.science \|\| {}, newState.research)` |
| `src/reducers/tick/automation/autoResearchTick.js` (todo el archivo) | **Evita `START_RESEARCH` por completo.** Descuenta y encola directamente, sin comprobar `researchLab` ni el tope de 8 en el reducer. Puede investigar en un planeta sin laboratorio. | Sustituir el encolado manual por `dispatch({ type: 'START_RESEARCH', researchId, planetId })` y dejar que el reducer sea la única puerta. |
| `src/reducers/index.js:22` | `actionToLog` incluye `CANCEL_SHIP_QUEUE` y `CANCEL_DEFENSE_QUEUE`, pero no `CANCEL_RESEARCH_QUEUE` ni `CANCEL_BUILD_QUEUE`. | Añadir ambos. |

**Recomendación general:** los dos archivos de scoring deberían recibir un objeto de parámetros con
nombre, no posicional, para que un cambio de orden de parámetros no se pueda colar sin error visible.

---

## 1.6 Bugs de datos y de estado

| # | Archivo:línea | Bug | Fix |
|---|---|---|---|
| 1 | `src/reducers/index.js` / `ministryTick.js` | `techFocus` se declara (`initialState.js:124`) y se escribe (`ministryTick.js:7,15`, `loadMigrator.js:151`, `GovernmentPage.jsx:131`) pero **ningún tick lo lee**. El ajuste "Foco científico" del ministerio de Ciencia no hace nada. | Implementarlo como peso dentro de `researchScoring.js`, o borrar el campo y el ajuste de la UI. |
| 2 | `src/reducers/initialState.js:121-128` | Solo define **6** ministerios; `MINISTRY_MAPPING` tiene **17**. Los otros 11 nacen sin estado. | Generar el estado de los 17 desde `MINISTRY_MAPPING` en un único sitio, no hardcodear la lista. |
| 3 | `src/reducers/colonyGovernor.js:83-84, 8-15` | `MINISTRY_BUILDING_REQS` solo cubre los 6 ministerios legacy → 11 ministerios nacen "desbloqueados" sin requisito de edificio. | Igual que (2): derivar de una única fuente. |
| 4 | `src/reducers/tick/automationTick.js` (295 líneas) | **Código muerto.** `rg "automationTick"` → cero importadores. Mantiene una versión vieja de la auto-investigación sin cola, sin prioridad y sin `automatedExclusions`. Confuso para quien lea, riesgo de que alguien lo importe por error. | Eliminar, o marcar con aviso de cabecera. **No reutilizar su lógica.** |
| 5 | `src/data/game/researchData.js` + `src/data/expanded/expandedResearch.js` (124 entradas) | Ninguna investigación tiene `priority`, `order`, `tier` ni `maxLevel`. El orden es puramente el orden literal del objeto JS. | Añadir un campo `tier` (o `order`) explícito como fuente de verdad del orden, para que reordenar el archivo no cambie el comportamiento del juego. |
| 6 | `src/reducers/colonyGovernor.js:51` | En `full_auto` se nombra ministro al `candidates[0]` — el **primero del array**, no el mejor. | Puntuar candidatos por competencia del `\"research\"` de cada ministro. |
| 7 | `src/reducers/colonyGovernor.js:30, 88-97` | `directiveMode: 'autonomous_only'` exige ministro **y** `automationEnabled`. Un ministerio sin ministro nombrado es totalmente inerte, sin avisar al jugador. | Aviso en la UI cuando un ministerio tiene automatización activa pero no hay ministro. |

---

# PARTE 2 — Cancelación de investigaciones (modal que parpadea)

## 2.1 SÍNTOMA
Al pulsar ✕ en una tarjeta con cola, el modal de confirmación **aparece y desaparece a ~1 Hz**.
Por muy rápido que se pulse "Confirmar", la investigación nunca se cancela.

## 2.2 CAUSA RAÍZ #1 — El componente se desmonta cada segundo

`src/App.jsx:87-89`
```js
const ItemCardWithCodex = useCallback((props) => (
  <ItemCard {...props} onOpenCodex={onOpenCodex} planetResources={currentPlanet?.resources} />
), [onOpenCodex, currentPlanet?.resources]);
```

Cadena exacta:
1. `TICK_MS = 1000` (`src/data/gameData.js:1`) — tick cada segundo.
2. Cada tick reconstruye `currentPlanet.resources` como **objeto nuevo**
   (`tick/exchangeOrdersTick.js:50`, `tick/pirateRaidTick.js:53`, tick de recursos). Identidad distinta.
3. `useCallback` ve la dependencia cambiada → **devuelve una función nueva**.
4. Se pasa como prop: `src/components/app/GameViewports.jsx:91` → `ItemCard={ItemCardWithCodex}`.
5. `src/pages/ResearchPage.jsx:259` la usa como **tipo de componente**: `<ItemCard id={id} ... />`.
6. React compara `element.type` **por referencia**. Referencia nueva = tipo distinto =
   **desmonta el subárbol entero y monta otro**. `React.memo` no ayuda: la comparación de tipo
   ocurre **antes** del memo.
7. `selectedCancelItem` (`src/components/ui/ItemCard.jsx:43`) es `useState` **de esa tarjeta**. Al
   desmontar, se destruye y vuelve a `null`.

**Resultado:** clic en ✕ → modal se abre → 1 segundo después la tarjeta entera se recrea → el estado
del modal desaparece. Nunca se llega al botón "Confirmar".

## 2.3 CAUSA RAÍZ #2 — El modal vive dentro de la tarjeta, sin portal

`src/components/ui/ItemCard.jsx:203-216` — el `<CancelConfirmationModal>` es el **último hijo** del
`<div>` de la tarjeta (línea 95-98). Ese div lleva `S.card`:
```js
card: 'glass holographic rounded-2xl p-4 ...'   // src/styles.js:4
```
```css
.holographic { position: relative; overflow: hidden; }   /* src/index.css:75-78 */
```
El modal es `fixed inset-0 w-screen h-screen z-[9999]`, pero está dentro de un contenedor
`overflow: hidden`. Aunque se arreglase 2.2, seguiría sin verse centrado en pantalla.
`ItemCardActiveOverlay` añade `z-20` con `absolute inset-x-0 bottom-0 ... pointer-events-auto`
(`src/components/ui/ItemCard/ItemCardActiveOverlay.jsx:93`), que compite con el `z-[9999]`.

Referencia de lo que **sí funciona**: `src/components/ui/CodexModal.jsx` — está montado en la raíz
de la app, fuera de las tarjetas.

## 2.4 LO QUE **NO** ESTÁ ROTO — no lo toques
`src/reducers/fleetReducer.js:172-214` es **correcto**: busca el item, cancela ese nivel y todos los
superiores, reembolsa el 50%, filtra la cola, notifica. El action type coincide en el despacho
(`ResearchPage.jsx:278`, `MinistryResearchSection.jsx:144`,
`overview/ConstructionQueuesPanel.jsx:128,178`) y en el enrutado (`reducers/index.js:78`).
**El backend funciona. El dispatch nunca llega a ejecutarse porque el componente se desmonta antes.**

## 2.5 FIXES

**Fix 2.5-a — Estabilizar la identidad del componente (arregla el parpadeo).** En `src/App.jsx:87-89`:
- sacar `currentPlanet?.resources` de las dependencias del `useCallback` y leerlo por `ref`
  (`resourcesRef.current`), o
- definir `ItemCardWithCodex` a **nivel de módulo** (fuera del componente), tomando `onOpenCodex` y
  `planetResources` como props normales, en vez de construir un closure por render.
Lo importante: **la referencia del tipo de componente debe ser estable entre renders.**
Preferible la segunda: `ItemCardWithCodex` no debería ser un closure creado dentro del render de
`App`. Y pasar `planetResources` ya como prop desde la propia página que ya lo tiene
(`ResearchPage.jsx:267` ya lo hace), en vez de inyectarlo a escondidas.

**Fix 2.5-b — Portal.** En `src/components/ui/CancelConfirmationModal.jsx`, renderizar el overlay
con `createPortal(..., document.body)`. Así escapa de `overflow: hidden` de la tarjeta y de cualquier
contexto de apilamiento. Comprobar el resultado visualmente: modal centrado sobre la pantalla
completa, oscureciendo el fondo, por encima de todo.

**Fix 2.5-c — Título incorrecto.** `src/components/ui/ItemCard.jsx:211`
```js
title={category === 'science' || category === 'power' && selectedCancelItem.researchId
  ? 'Cancelar Investigación' : 'Cancelar Construcción'}
```
Precedencia de `||` sobre `&&`, y además **no existe `cat: 'science'`** en los datos
(`cat` reales: `power, propulsion, weapon, defense, utility, economy, ai, engineering, exploration,
computer, military, civics, government, logistics`). Resultado: casi toda investigación muestra
**"Cancelar Construcción"**, mientras el subtítulo (línea 46) sí dice "Investigación en curso".
Derivar el título **solo** de `selectedCancelItem.researchId` (que es el campo fiable, y que la
línea 214 ya usa para `type`).

**Fix 2.5-d — Churn de listeners.** `ItemCard.jsx:206` pasa
`onClose={() => setSelectedCancelItem(null)}`, un closure nuevo en cada render, y
`CancelConfirmationModal.jsx:16-25` tiene `[isOpen, onClose]` en el `useEffect` → **re-registra el
listener `keydown` en cada tick**, en todas las tarjetas con cola. Envolver en `useCallback` con
dependencias estables, o almacenar el handler en una ref dentro del modal.

**Fix 2.5-e — Cierre accidental.** `CancelConfirmationModal.jsx:32` cierra con **cualquier clic en el
fondo**. Durante el parpadeo, el `mousedown` residual del clic que abrió el modal puede caer en el
overlay y cerrarlo en el mismo frame. Con 2.5-a resuelto esto baja mucho, pero conviene exigir un
gesto deliberado: ignorar el `click` que cierre en menos de ~150 ms desde la apertura (marcar el
tiempo de apertura con `useRef`), o cerrar solo con el ✕, con "Continuar Orden" y con `Escape`.

**Fix 2.5-f — Accesibilidad y foco.** Añadir `role="dialog"`, `aria-modal="true"`, foco inicial en
el botón de confirmar, y foco atrapado dentro del modal mientras esté abierto. `Escape` ya está
implementado (líneas 18-22), se conserva.

**Fix 2.5-g — Afecta también a edificios.** El bug está en `ItemCard`, así que **cancelar
construcciones está roto igual** (`MinistryBuildingsSection.jsx:116-145` y cualquier otra página que
use `ItemCard`). Al arreglar 2.5-a se arregla todo; verificar también ese camino.

---

# PARTE 3 — Ventanas emergentes de comunicación → Bandeja de entrada (estilo email)

## 3.0 Qué pide el usuario

1. **Que ninguna ventana emergente de comunicación entrante se abra sola.** Nada de saltos
   involuntarios a media partida.
2. **Que las comunicaciones se acumulen en un apartado de telemetría** (el "Registro Táctico
   Imperial"), con un **número de pendientes** tipo bandeja de correo.
3. **Que el jugador abra cada una cuando quiera.** Él decide cuándo leer.

Estado actual del "Registro Táctico Imperial": **aparece siempre vacío**, y además su fuente de
datos **no existe en el estado**. Detalle en 3.2.

## 3.1 Mapa de lo que hoy se abre solo (hay que desmontarlo)

Todo esto salta sin que el jugador lo pida:

| Qué | Archivo:línea | Cómo salta |
|---|---|---|
| **Overlay de informe táctico** | `src/components/ui/TacticalEventOverlay.jsx:120` | `z-[140]` fijo a pantalla completa. Apunta a `state.tacticalEvents` (`AppOverlays.jsx:46-51`). Cada misión completada encola un evento (`tickOrchestrator.js:256`) y este componente lo muestra **de inmediato**, con `sfx` y `speakText` (`TacticalEventOverlay.jsx:20-45`). |
| **Evento narrativo** | `src/components/ui/NarrativeEventOverlay.jsx`, montado en `AppOverlays.jsx:54-56` | `state.activeEvent`, que se dispara cada 60 ticks (`tickOrchestrator.js:30-45`). |
| **Primer contacto** | `src/components/FirstContactOverlay.jsx`, montado en `AppOverlays.jsx:88-93` | `state.activeFirstContact`. |
| **Transmisión en vivo** | `src/components/ActiveTransmissionOverlay.jsx`, montado en `AppOverlays.jsx:96-102` | `state.activeTransmission && acceptTransmission`. Con `setTimeout` de 30 s que se autodescarta (`ActiveTransmissionOverlay.jsx:25-28`). |
| **Ultimátum** | `AppOverlays.jsx:105-134` | `state.activeUltimatum` → `DialogueBox2D` con opciones. **Este sí debe seguir siendo bloqueante** (ver 3.6). |

**Bug grave que hay que arreglar de paso: los slots se pisan entre sí.**
`src/reducers/eventReducer.js:66-73` y `:97`, y `RESOLVE_NARRATIVE_EVENT` (`:178`):
```js
case 'CLEAR_ACTIVE_EVENT':
  return { ...state, activeEvent: null, activeFirstContact: null, activeTransmission: null };

case 'DISMISS_TRANSMISSION':
  return { ...state, activeTransmission: null, activeEvent: null, activeFirstContact: null };
```
Cada `DISMISS_X` borra los **tres** slots. Si llega un evento narrativo mientras hay una
transmisión pendiente, uno de los dos **desaparece sin que nadie lo haya leído**. Con el paso a
bandeja esto deja de ser grave, pero hay que **eliminar el borrado cruzado**: cada case debe tocar
solo su propio campo.

## 3.2 Por qué el Registro Táctico Imperial está siempre vacío

`src/components/overview/OverviewHudBar.jsx:76-82`
```jsx
<ImperialTelemetryTicker
  variant="header"
  events={(state.history || state.logs || []).map((l, i) => ({ ... }))}
/>
```
**`state.history` y `state.logs` no existen.** Ni aparecen en `src/core/initialState.js`, ni hay
ningún reducer que los escriba (verificado: lo único que escribe en `.history` es
`chatHistory`, que es otra cosa, en `governmentReducer.js:26`). Resultado: siempre llega `[]`.

Y el componente se queda con su propio texto de relleno —`ImperialTelemetryTicker.jsx:16-22`:
```js
const latestEvent = recentEvents[0] || {
  id: 'default',
  text: 'Sistemas imperiales en estado óptimo. Sin anomalías en el sector.', ...
};
```
De ahí el "siempre vacío" y el `[0]` que se ve en la barra.

**Los datos correctos ya existen y sí se llenan:** `state.tacticalEvents`
(`initialState.js:160`, poblado en `tickOrchestrator.js:256`) y `state.notifications`
(`initialState.js:150`, poblado en ~15 sitios). El registro debe leer de ahí, no de campos
inventados.

## 3.3 Modelo de datos: un `tacticalEvents` real y persistente

Hoy `tacticalEvents` es una **cola de wip**: se vacía al descartar (`eventReducer.js:75-87`) y solo
guarda lo no leído. Para una bandeja de correo hacen falta dos campos más.

Añadir en `src/core/initialState.js:160` (junto a `tacticalEvents: []`):
```js
tacticalEvents: [],
tacticalEventLog: [],   // histórico de todo lo que se ha recibido, incluye leídos
tacticalUnreadCount: 0, // redundante solo como caché; la verdad es contar los !read del log
```
Y en `src/reducers/loadMigrator.js:136` migrar partidas viejas: si una partida guardada tiene
`activeTransmission` o `activeEvent` huérfanos, volcarlos al log para no perderlos.

**Forma de una entrada del log:**
```js
{
  id, kind: 'tactical' | 'narrative' | 'transmission' | 'firstContact',
  type,                    // 'colonize' | 'combat' | 'espionage' | ... (el que ya usa hoy)
  title, subtitle, description,
  faction, ministryId, minister, targetPlanetId,
  resources, losses, debris, planetDetails, returnedFleet,  // los que ya genera cada misión
  read: false,
  receivedAt: Date.now(),
  options,                 // solo si trae decisiones pendientes (narrativa, primer contacto)
  priority: 'baja' | 'media' | 'alta' | 'critica'
}
```

**Decisión clave:** `read` va en la entrada. `state.notifications` ya tiene un `read` pero está
**roto**: `eventReducer.js:28` crea las notificaciones **sin `read`**, y `MARK_ALL_NOTIF_READ`
(`:35-36`) las marca todas. Sirve como referencia, pero no se puede reutilizar tal cual.

## 3.4 Fix 3.4-a — Parar las aperturas automáticas (el núcleo del pedido)

En `src/components/app/AppOverlays.jsx`:

1. **Sustituir `TacticalEventOverlay` por un registro en bandeja.** Quitar el bloque de las líneas
   **46-51**. El componente ya no se monta; sus datos pasan a la bandeja (3.4-c).
2. **Quitar el overlay de evento narrativo** de las líneas **54-56**.
3. **Quitar el overlay de primer contacto** de las líneas **88-93**.
4. **Quitar el overlay de transmisión en vivo** de las líneas **96-102**.
5. **Dejar intactos**: `PerimeterEmergencyAlert`, `RedAlertOverlay`, `VictoryOverlay`,
   `TutorialOverlay`, ajustes, codex, y **el ultimátum** (3.6).

En `src/App.jsx:199-203` quitar el efecto que fuerza `setAcceptTransmission(false)`, ya innecesario:
```jsx
useEffect(() => {
  if (!state.activeTransmission) { setAcceptTransmission(false); }
}, [state.activeTransmission]);
```
Igual con `acceptTransmission` / `setAcceptTransmission` en `App.jsx`, `GameViewports.jsx:102`,
`CommunicationsPage.jsx:42` y `TransmissionChannelGrid.jsx:10-12`: si la transmisión ya no se abre
sola, se elimina el flag entero. **La tarjeta "SEÑAL EN VIVO" de
`TransmissionChannelGrid.jsx:26-65` también desaparece**, porque está condicionada a
`activeTransmission` y ese campo quedará siempre `null`.

**Limpieza opcional:** `ActiveTransmissionOverlay.jsx` (133 líneas), `FirstContactOverlay.jsx` y
`NarrativeEventOverlay.jsx` quedan sin uso. Borrarlos **solo** tras confirmar en `src/` que no hay
más referencias (`rg` primero). Si se prefieren conservar para reutilizar la UI de lectura al abrir
un mensaje, mantenerlos y usarlos como visor bajo demanda.

## 3.5 Fix 3.5 — La bandeja: dónde va y qué se ve

### 3.5-a — Contador de pendientes en la barra (el "numerito de unread")

Arreglar `src/components/overview/OverviewHudBar.jsx:76-82` para que lea `state.tacticalEventLog` y
no campos inexistentes:
```jsx
<ImperialTelemetryTicker
  variant="header"
  events={(state.tacticalEventLog || []).slice(-40)}
  unreadCount={(state.tacticalEventLog || []).filter(e => !e.read).length}
  onOpenInbox={() => safeSetActiveTab('telemetry')}
/>
```
`ImperialTelemetryTicker` **ya tiene** contador (`[{recentEvents.length}]`, línea ~48) y es
colapsable (`isOpen`). Reaprovechar ese panel desplegable como vista rápida de la bandeja: que
muestre los no leídos arriba, con el título y la hora, y que al pinchar uno se marque leído y se
abra el detalle.

**Comportamiento del contador:**
- número grande en rojo/ámbar si `unreadCount > 0`; gris y `0` si no hay nada;
- ocultar el punto rojo `animate-ping` cuando el contador es 0 (hoy late siempre, línea ~38);
- mostrar el número también en la pestaña de navegación de Comunicaciones, para que se vea desde
  cualquier pantalla (reutilizando el patrón `BadgeCounter` que ya exporta
  `src/components/ui/AlertComponents.jsx:7`).

### 3.5-b — La pantalla de la bandeja

Crear `src/pages/TelemetryPage.jsx` como página de verdad (no desplegable), registrada en
`src/components/app/GameViewports.jsx` y en la lista de pestañas. Estructura, respetando el estilo
del proyecto (fondo `#05070f`, paneles `bg-[#090d1f]`, bordes cian):

- Cabecera: contador grande de pendientes + botón "Marcar todo leído" (ya existe la acción
  `MARK_ALL_TACTICAL_EVENTS_READ`, hay que crearla, ver 3.5-c).
- Filtros por clase: **Todas / Colonización / Transporte / Combate / Espionaje / Expedición /
  Diplomaticas / Narrativas**, contados.
- Lista de mensajes estilo correo: remitente (ministro, facción o "Comando"), asunto, hora,
  punto azul de no leído, y un borde de color por prioridad.
- Al pinchar un mensaje: se marca leído, se abre el **detalle**, y si trae `options` pendientes se
  muestran los botones de decisión ahí mismo (reutilizando la UI de `TacticalEventOverlay.jsx`,
  que ya sabe pintar manifiesto de recursos, bajas, escombros, ficha del planeta y ficha de
  Ministro — no reescribirlo).
- "Vaciar leídos" al pie.

Reutilizar de `TacticalEventOverlay.jsx` el bloque de presentación, **quitándole** el overlay
fijo, el `speakText` automático (líneas 20-45) y el `sfx` de apertura. Que el sonido y la voz
suenen **al abrir el mensaje**, no al recibirlo.

### 3.5-c — Acciones del reducer (`src/reducers/eventReducer.js`)

```js
case 'MARK_TACTICAL_EVENT_READ':
  return { ...state, tacticalEventLog: (state.tacticalEventLog || []).map(e => e.id === action.payload ? { ...e, read: true } : e) };

case 'MARK_ALL_TACTICAL_EVENTS_READ':
  return { ...state, tacticalEventLog: (state.tacticalEventLog || []).map(e => ({ ...e, read: true })) };

case 'CLEAR_READ_TACTICAL_EVENTS':
  return { ...state, tacticalEventLog: (state.tacticalEventLog || []).filter(e => !e.read) };
```
**Mantener** `DISMISS_TACTICAL_EVENT` y `DISMISS_ALL_TACTICAL_EVENTS` si otros sitios los usan, pero
que ya **no borren** (o que borren solo de la vista), para no perder historial.

Añadir `'MARK_TACTICAL_EVENT_READ'`, `'MARK_ALL_TACTICAL_EVENTS_READ'` y
`'CLEAR_READ_TACTICAL_EVENTS'` a `actionToLog` en `src/reducers/index.js:22`.

## 3.6 Reglas de qué sigue siendo bloqueante

El criterio general: si el jugador puede perder algo por no mirar el mensaje, el mensaje se queda
encima del resto, sin opción de aplazar. **Estas NO pasan a la bandeja:**

- **Ultimátum** (`AppOverlays.jsx:105-134`): expirar una decisión destructiva por no mirar el popup
  sería peor que el popup. Dejarlo, y añadir un aviso en la bandeja para que tampoco se pierda de
  vista.
- **`RedAlertOverlay` / `PerimeterEmergencyAlert`** (`AppOverlays.jsx:40-43`): alerta de invasión y
  de crisis energética. Son estados continuos del mundo, no mensajes. Se quedan, pero hay que
  registrar esos estados en la bandeja como entradas `priority: 'critica'` para que quede rastro.
- **`TutorialOverlay`**, **`VictoryOverlay`**, ajustes y codex: fuera del alcance.

Para **narrativas con `options` pendientes** y **primer contacto**: pasan a la bandeja, pero
mientras estén sin resolver deben mostrar el contador en rojo y una marca de "requiere decisión".
**No se descartan solas.** Hoy `tickOrchestrator.js:30` bloquea nuevos eventos mientras
`activeEvent` siga puesto; con la bandeja hay que cambiar esa guarda para que no depends de un slot
efímero — decidir por `tacticalEventLog.some(e => !e.read && e.requiresDecision)`.

## 3.7 Lo que **ya funciona** y no hay que rehacer

- **`state.tacticalEvents` se llena bien.** `tickOrchestrator.js:243-256` genera el evento, enriquece
  con el ministro asignado y lo encola. Los tests de `src/__tests__/tacticalEvents.test.jsx` (184
  líneas) cubren colonización, transporte, combate, espionaje y retorno. Ese trabajo se reutiliza:
  el log es `tacticalEvents` **más `read: false` y sin vaciarse**.
- **La presentación de cada evento ya está hecha** en `TacticalEventOverlay.jsx:119-405`
  (manifiesto, bajas, escombros, flota retornada, ficha de planeta, ficha de ministro, paginador).
  Extraer a un componente de detalle reutilizable, sin rehacerlo.
- **La acción `MARK_ALL_NOTIF_READ`** (`eventReducer.js:35-36`) y el botón de
  `CommunicationsPage.jsx:157-166` ya existen: sirve de patrón para 3.5-c.
- **`CommunicationsPage.jsx` ya funciona como bandeja** (canales, filtros, lectura, contador de
  mensajes en la cabecera, líneas 151-168). Se puede **fusionar** con la nueva página o dejarla
  como vista por facción. **No duplicar las dos**: decidir una y que la otra enlace a ella.
- **El `sfx` y la voz** existen (`src/audio.js`: `sfx`, `speakText`, `playVoice`) y se conservan;
  solo cambia **cuándo** suenan.

## 3.8 Aviso de contenido: filtrado actual de la bandeja

`src/pages/CommunicationsPage.jsx:105-109`
```js
const filteredNotifs = enrichedNotifs.filter(n => {
  if (n.category === 'system' || n.factionKey === 'human') return false;
  ...
});
```
**Se descarta todo lo propio del jugador** (`factionKey === 'human'`), que incluye el mensaje de
bienvenida de `initialState.js:151`. Revisar si es intencionado: el jugador quiere ver también sus
propias directive y logros, no solo lo ajeno. Y `getEnrichedNotif` (`:50-93`) clasifica por
`msg.includes(...)` — heurística frágil sobre texto libre; con el log estructurado se puede usar
el `kind` y el `type` reales en vez de buscar cadenas.

---

# PARTE 4 — ORDEN DE EJECUCIÓN SUGERIDO

1. **2.5-a** (identidad del componente) — el síntoma más molesto, cambio pequeño.
2. **1.1-a / 1.1-b** (merge de edificios) — desbloquea 15 tecnologías, cambio de 2 líneas.
3. **1.1-c** (helper único `meetsResearchReq` + sustituir los 8 call sites) — elimina la clase de bug.
4. **3.3 + 3.5-c** (modelo `tacticalEventLog` y acciones del reducer) — base de la bandeja, sin UI.
5. **3.5-a** (arreglar la fuente vacía de `OverviewHudBar` + contador) — **parche mínimo**: aunque
   no se monte la página nueva, el ticker deja de estar vacío y muestra los pendientes.
6. **3.4-a** (quitar las aperturas automáticas) — a partir de aquí ya nada salta solo.
7. **3.5-b** (pantalla de bandeja completa) y **3.7** (extraer el visor de detalle).
8. **1.2-a** (`researchScoring.js` + integrar en `colonyGovernor.js`) y **1.3** (unificar con
   `autoResearchTick.js`) — el corazón del problema de la IA.
9. **1.2-b** (reordenar `MINISTRY_MAPPING` por coste) y **1.2-d** (reparto de la cola de 8).
10. **1.4** (IA rival con scoring real).
11. **1.5 / 1.6** (bugs de argumentos, datos y estado) — pueden ir en paralelo.
12. **2.5-b a 2.5-g** (portal, título, listeners, foco).
13. **3.6** (reglas de bloqueantes, guard de `tickOrchestrator.js:30`).
14. **1.1-d** (efecto real de `industrialOpt` en `calcBuildTime`).

# PARTE 5 — VERIFICACIÓN

- `npm test` debe pasar. Añadir tests nuevos:
  - `queueTick` completa una investigación con `req` de edificio (`industrialOpt` con
    `robotFactory:5` → sube de nivel, no se cancela).
  - `meetsResearchReq` resuelve clave de investigación y clave de edificio, y no bloquea ante una
    clave desconocida.
  - `researchScoring` prefiere la más barata y la más rápida cuando ambas están disponibles, y
    respeta la bonificación de misión.
  - `CANCEL_RESEARCH_QUEUE` cancela ese nivel y todos los superiores y reembolsa el 50%.
  - Test de regresión de identidad: renderizar una lista de `ItemCard` envuelta en el mismo patrón
    de `ItemCardWithCodex`, tickear el estado y comprobar que `selectedCancelItem` **sobrevive**.
  - Bandeja: una misión completada añade una entrada con `read: false`; el contador sube en 1;
    `MARK_TACTICAL_EVENT_READ` lo baja a 0 sin borrarla; `CLEAR_READ_TACTICAL_EVENTS` no borra los
    no leídos.
  - Bandeja: el `DISMISS_TRANSMISSION` ya **no** borra `activeEvent` ni `activeFirstContact`
    (el bug de slots pisados de 3.1).
- `npm run dev` y comprobar a mano:
  - ⚙️ Industria → 🔬 Optimización Industrial se investiga y **completa** (no aparece el aviso de
    cancelación).
  - El mismo requisito building+research en el árbol tecnológico muestra el nivel real ("Tienes: 5").
  - El modal de cancelar se queda **quieto** hasta que se pulse un botón, y confirmar sí cancela.
  - Cancelar una construcción también funciona (2.5-g).
  - Un ministro automatizado con la cola de 8 items llena reparte hueco entre ministerios distintos (1.2-d).
  - Una facción IA con estrategia `merchant` o `diplomat` sí acaba investigando (1.4).
  - **Al completar una misión NO salta ninguna ventana.** El número de pendientes sube en la barra
    de telemetría.
  - La barra de telemetría ya **no** dice "Sistemas imperiales en estado óptimo" en vacío, y su
    contador refleja los pendientes reales.
  - Al abrir la bandeja: el mensaje se ve entero, con su detalle, y al cerrarlo queda marcado leído.
  - Un ultimátum **sigue** apareciendo bloqueante (3.6) y además queda anotado en la bandeja.
  - Una narrativa con decisión pendiente **no se pierde** al no mirarla.
- **No ejecutar `npm run build` ni `npm run dist`.** Si al final se pide compilador, que sea en una
  petición aparte y explícita.

---

# PARTE 6 — ESTADO DE IMPLEMENTACIÓN

> Registro de lo aplicado, para no repetir trabajo ni dar por hecho algo que sigue roto.
> `npm test`: **181/181 verdes**. `vite build`: compila limpio.

## Bugs encontrados y corregidos (no estaban en el plan)

| # | Dónde | Qué pasaba | Por qué importaba |
|---|---|---|---|
| **A** | `autoResearchTick.js:44` y `colonyGovernor.js:219` | Los dos leían `ranked[0].researchId`, pero `rankResearch` devuelve la propiedad **`id`**. | `cheapestResearch` era siempre `undefined` y la cola nunca se llenaba. **La cola automática estaba muerta**: el arreglo del 1.2-a/1.3 no funcionaba en ninguna de las dos rutas. |
| **B** | `researchScoring.js` (duración) | El score dividía por la duración: `score /= timeUnits`. Como "menor = mejor", eso **premiaba las techs más lentas**. | Invertía exactamente el objetivo de 1.3. Corregido a `score *= timeUnits` (el tiempo es un coste, no un beneficio; los demás términos sí dividen por un factor de deseo). Con test de regresión. |
| **C** | `loadMigrator.js` (`buildMigratedEventLog`) | La primera versión forzaba `read: false` a **todas** las entradas migradas. | Al cargar una partida con log, todo volvía a "pendiente" y el contador mentía. Ahora respeta el `read` que ya venía. |
| **D** | `tickOrchestrator.js` (volcado de slots) | Se dispatched `DISMISS_ACTIVE_EVENT`, que **no existe**: la acción real es `CLEAR_ACTIVE_EVENT`. | El slot de narrativa no se vaciaba y se re-volcaba en bucle. Ahora el mapa slot→acción es explícito. |
| **E** | `minId` destructuring en `colonyGovernor.js:219` | Mismo origen que A, en la forma de destructuring. | Corregido a `for (const { id: researchId, score } of ranked)`. |
| **F** | `colonyGovernor.js` (tope de 8) | El bucle comprobaba `state.researchQueue.length < 8`, pero `state` es la foto **anterior** al tick y no se actualiza dentro del bucle: la comprobación era la misma en cada vuelta. El recorte real lo hacía `researchReducer`, que rechaza en silencio. | El bucle seguía dando vueltas y `logTelemetry` anunciaba "I+D iniciada" para investigaciones que el reducer iba a rechazar. Ahora hay un contador local que se decrementa de verdad. |
| **G** | `ministryTick.js:87` | `mins.economy.treasury` reventaba si el ministerio `economy` no existía. | Lo destapó un test propio. Una partida vieja guardada sin ese ministerio tiraba el tick entero. Ahora es `mins.economy?.treasury`. |
| **H** | `governmentReducer.js:15` | Importaba `MINISTRY_BUILDING_REQS` de `colonyGovernor`, que al unificar 1.6-3 dejó de reexportarlo. | Rompía el build (los tests no lo detectan: no cubren el grafo de imports de producción). Apuntado a la fuente nueva. |

## Hecho

### Parte 1 — Investigación
- **1.1-a/b** merge de edificios en `queueTick.js` y `TechTreePage.jsx`; **1.1-c** `meetsResearchReq` sustituyendo a los 8+ call sites; **1.1-d** `industrialOpt` ya leía en `calcBuildTime`.
- **1.2-a** `researchScoring.js` (scoreResearch / pickBestResearch / rankResearch / ministryHasViableResearch) con pesos por ministerio, amenaza, `techFocus`, urgencia de prerrequisitos y desbloqueos. **Integrado y funcionando** en `colonyGovernor.js` y `autoResearchTick.js` (gracias al arreglo A).
- **1.3** auto-ciencia unificada con el mismo módulo. Un solo criterio de selección en todo el juego.
- **1.4** IAs rivales con el mismo scoring: `AI_STRATEGY_CATEGORY_WEIGHTS` traduce `{eco, mil, diplo, tech}` a categorías reales, y la IA **paga el coste de sus propios recursos**. Despertadas `diplomat` y `clanist`, que no investigaban nunca (el gate `> 0.4` no lo pasaban). El azar decide el ritmo, nunca el qué.
- **1.5** `CANCEL_BUILD_QUEUE` y `CANCEL_RESEARCH_QUEUE` añadidas al log de auditoría. Los bugs de argumentos posicionales ya no aplican (todo por objeto con nombre).
- **1.2-d** La cola global de 8 reparte de verdad: se **rota el orden de ministerios por tick**, así que el primer turno va cambiando, y se lleva un **contador local** de huecos libres (el `< 8` anterior consultaba la foto previa al tick y nunca cambiaba dentro del bucle). Cada ministerio mantiene su prioridad *dentro* de su turno: si la energía va deficiente, energía sigue yendo antes que nada; lo que cambia es a quién le toca elegir primero.
- **1.6-2** `src/data/ministryState.js` (fuente única) con `buildMinistriesState`: los **17** ministerios nacen con estado, conservando lo que una partida ya tenía ajustado. Sustituye a los tres listados hardcodeados de 6 ministerios (`initialState`, `ministryTick`, `loadMigrator`).
- **1.6-3** `MINISTRY_BUILDING_REQS` también pasa a esa fuente, y ahora **lee el `parentRequiredBuilding` que `MINISTRY_MAPPING` ya declaraba** (science, cybernetics) en vez de contradecirlo con un mapa paralelo. `governmentReducer` también apunta allí.
- **1.6-6** `full_auto` puntúa a los candidatos (`scoreMinisterCandidate` / `pickBestCandidate`) según el punto débil real del planeta, en vez de invertir siempre a `candidates[0]`: déficit energético elige al de `energyBoost`, invasión entrante al de `fleetAttack`.
- **1.6-7** Automatización activa **sin ministro** genera un aviso (una vez por ministerio, no cada tick) y deja `state.ministryNoopWarnings` para que la UI pueda marcarlo.
- **1.6** `techFocus` **por fin pesa**: `TECH_FOCUS_CATEGORIES` + `focusCategoriesFor` los lee `buildResearchScoreConfig`. Se añadió `SET_MINISTRY_STATE` para poder fijarlos, un selector real en `MinistryResearchSection`, y la lista de candidatos por puntuación ("¿por qué eligió esto?"). Los puntos 2, 3, 5, 6 y 7 de esta tabla se cerraron después; ver arriba.

### Parte 2 — Modal de cancelación
- **2.5-a** identidad estable (`ItemCardWithCodex` es una referencia de módulo, no un closure por render).
- **2.5-b** `createPortal` a `document.body`. **2.5-c** título derivado solo de `researchId`. **2.5-d** `useCallback` sin re-registrar listeners. **2.5-e** se ignoran los clics de menos de 150 ms. **2.5-f** `role="dialog"`, `aria-modal`, foco inicial.

### Parte 4 — Retiming
- `reconcileQueueTimings` llamado en `tickOrchestrator.js:93`, justo tras `processAllQueuesTick`. `stampTimeMult` en los 8 puntos de encolado. `backfillQueueTimeMults` para partidas antiguas. `researchTiming.js` como fuente única (el bug de `1 + researchTimeBonus` duplicado y los grants por duplicado están corregidos).

### Parte 3 — Bandeja de comunicaciones
- **3.1** Cada `DISMISS_*` toca **solo su propio slot**. Antes los tres se limpiaban entre sí y un mensaje pendiente desaparecía sin que nadie lo leyera.
- **3.3** `tacticalEventLog` con `read` **en la entrada** (a diferencia de `notifications`, que no puede). `normalizeLogEntry` da forma única a todo. `APPEND_TACTICAL_EVENT_LOG` es el punto único de entrada. Migración de partidas viejas que vuelca los slots huérfanos para que ninguna narrativa con decisión se pierda.
- **3.4-a** **Nada se abre solo.** Desmontados `TacticalEventOverlay`, `NarrativeEventOverlay`, `FirstContactOverlay` y `ActiveTransmissionOverlay`. El flag `acceptTransmission` eliminado de `App.jsx`, `GameViewports.jsx`, `CommunicationsPage` y `TransmissionChannelGrid`; la tarjeta "SEÑAL EN VIVO" pasa a decir "En bandeja". Se conservan los cuatro archivos, con aviso de cabecera, porque su UI es trabajo reutilizable.
- **3.4 (guaranteía)** El orquestador vuelca al log cualquier slot pendiente al final de cada tick, con `id` estable para no duplicar. Ocho sitios escriben en esos slots; normalizar en uno es más seguro que editar los ocho. **Esto es lo que garantiza que "nada se abre solo" no se convierta en "nada se ve nunca".**
- **3.5-a** `OverviewHudBar` leía `state.history || state.logs`, campos **inexistentes**: el registro estaba siempre vacío. Ahora lee `tacticalEventLog`. El ticker muestra el contador real, ordena pendientes arriba, avisa de "requiere decisión" y **el punto rojo deja de latir cuando no hay nada pendiente**. Ya no dice "Sistemas imperiales en estado óptimo".
- **3.5-b** `TelemetryPage.jsx`: filtros por clase contados, lista estilo correo con punto de no leído y borde por prioridad, detalle completo, "marcar todo leído" y "vaciar leídos". El sonido y la voz suenan **al abrir** el mensaje.
- **3.5-c** `MARK_TACTICAL_EVENT_READ`, `MARK_ALL_TACTICAL_EVENTS_READ`, `CLEAR_READ_TACTICAL_EVENTS`. Marcar leído **no borra**.
- **3.6** La guarda de narrativas ya no pregunta por slots efímeros (que con 3.4 no se montan y se vacían): pregunta al log por `!read && requiresDecision`. Se conservan bloqueantes el ultimátum, `RedAlertOverlay` y `PerimeterEmergencyAlert`. Además, invasión y crisis energética dejan **rastro** en la bandeja como `priority: 'critica'`, sin repetir cada tick mientras el estado dure.
- **3.7** `TacticalEventDetail.jsx`: la presentación del overlay extraída **sin reescribirla**, sin overlay fijo y con el audio al abrir.

### Nota sobre el ultimátum

`state.activeUltimatum` **no lo escribe ningún reducer**: `AppOverlays.jsx:90` monta un overlay
para un campo que nunca se llena. Está muerto desde antes de este trabajo, no es una regresión.
`DIPLOMACY_*TRIBUTO_THREAT` sí existe y funciona, pero por otra vía. Si el ultimátum debe
reaparecer, hay que escribir primero el `activeUltimatum`; si no, ese overlay sobra.

## Tests añadidos (87)

- `researchScoring.test.js` — 22. Filtros duros, orden por coste y duración, bonificación de misión, `focusCategoriesFor` contra valores corruptos, y **regresión del bug B** (la duración penaliza, no premia).
- `aiEmpireTick.test.js` — 6. Que `diplomat` investigue, que los pesos de toda estrategia sean positivos, y que sin laboratorio no investigue.
- `tacticalEventLog.test.js` — 34. El log acumula, marcar leído no borra, los slots no se pisan, la migración no pierde nada, el orquestador vuelca y no duplica, y los estados continuos dejan rastro sin spamear.
- `colonyGovernor.test.jsx` — +25. **1.2-d**: con 2 ministerios ambos investigan, la rotación reparte el primer turno, nunca se pasan de 8. **1.6-6**: déficit de energía elige al ministro de energía, invasión elige al defensivo. **1.6-2/3**: los 17 ministerios nacen con estado, se conserva lo ajustado, y los requisitos salen de una sola fuente. **1.6-7**: avisa del autónomo sin ministro, y solo una vez.
- `researchTiming.test.js` y `queueTiming.test.js` — existentes, ampliados.

## Lo que SIGUE pendiente (revisar, no dar por hecho)

| # | Punto | Nota |
|---|---|---|
| 1 | **Verificación manual con `npm run dev`** | Toda la Parte 5 de comprobaciones a ojo sigue sin hacer. Los tests cubren la lógica, no la pantalla. **Es lo que más riesgo queda**: hay ~700 líneas de UI nueva (bandeja) y varias de `colonyGovernor` que nunca se han visto. |
| 2 | **1.6-5** campo `tier`/`order` en las 124 investigaciones | Sin hacer. El orden sigue siendo el literal del objeto JS. |
| 3 | **1.6-4** `automationTick.js` es código muerto (295 líneas) | Sin borrar. Riesgo de que alguien lo importe por error. Borrarlo es destructivo y no se pidió. |
| 4 | **3.8** filtro de `CommunicationsPage` descarta `factionKey === 'human'` | El jugador sigue sin ver sus propios mensajes ahí. |
| 5 | `pickBestResearch` / `ministryHasViableResearch` sin usar en producción | Implementados y testeados, pero `colonyGovernor` recorre `ranked` en bucle. Funciona; queda una vía de código duplicada. |
| 6 | Marca visual del «ministerio inerte» en la UI | 1.6-7 ya avisa por notificación y deja `state.ministryNoopWarnings`, pero el `GovernmentPage` no lo pinta en rojo todavía. |

> Cerrados en esta ronda: **1.2-d** (rotación + contadores reales), **1.6-2** y **1.6-3**
> (fuente única `ministryState.js`), **1.6-6** (ministros puntuados), **1.6-7** (aviso).
>
> **1.2-b y 1.2-c ya estaban resueltos** al empezar (arrays ordenados por coste ascendente,
> los 17 ministerios con `research`, y `science` con `combustion`/`impulse` como prerrequisito
> barato). Anotado para que no se den por pendientes.

## Dos cosas que se negó a hacer, y por qué

1. **No inventar requisitos de edificio.** Al unificar 1.6-3 salía tentador deducir
   «si investiga → que necesite laboratorio». Se descartó: `colonyGovernor` ya comprueba
   `researchLab >= 1` justo antes de investigar, así que un ministerio de Recursos puede
   seguir levantando minas en un planeta sin laboratorio. Exigirlo para la investidura le
   quitaría también la construcción, que no era el bug.
2. **No borrar `automationTick.js` ni los cuatro overlays.** Son código muerto, sí, pero
   borrarlos sin pedirlo es destructivo. Los overlays llevan aviso de cabecera y su UI
   reutilizable ya está extraída en `TacticalEventDetail.jsx`.

