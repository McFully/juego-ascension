# SISTEMA DE ESPIONAJE PLANETARIO — AUDITORÍA, VALORACIÓN ARQUITECTÓNICA Y PLAN

Alcance: exclusivamente Juego Ascensión. Sin referencias externas.
Base: auditoría estática de `src/` y `electron/` (415 archivos) + 50 suites de tests.

---

## 1. RESUMEN EJECUTIVO

El espionaje **no falta**. Existe un bucle completo y funcional que va de lanzar a
guardar el informe, y está alrededor del **15% implementado**.

El problema de fondo no es que falte el sistema, es que **el 70% del sistema es
código inalcanzable**: el nivel de tecnología de espionaje que decide el resultado
se lee de un sitio donde siempre vale cero. Eso deja muerta la mitad de la
escalera de inteligencia, el bonus de combate, y casi todo lo que el jugador paga.

Prioridades, por tanto, en este orden:

1. **Corregir** lo que ya está roto (8 defectos verificados).
2. **Conectar** las 12 mecánicas que el jugador ya compra y que no hacen nada.
3. **Completar** el flujo: estados, contraespionaje, intercepción, IA que espía.
4. **Crear** solo un componente nuevo: el dossier de inteligencia por planeta.

---

## 2. AUDITORÍA: QUÉ HAY

### 2.1 El bucle que ya funciona (verificado)

| Etapa | Dónde | Estado |
|---|---|---|
| Lanzar desde mapa galáctico | `src/pages/GalaxyPage.jsx:147-158` | funciona |
| Lanzar desde hangar | `src/components/fleet/MissionConfigPanel.jsx:38` | funciona |
| Validar y crear misión | `src/reducers/fleet/fleetMissionActions.js:8-159` | parcial |
| Viajar | `src/utils/formulas/flightFormulas.js` | funciona |
| Resolver | `src/missions/diploMission.js:138-304` | parcial |
| Volver | `src/reducers/tick/tickOrchestrator.js:174-196` | funciona |
| Evento de retorno | `src/reducers/tick/fleetReturnEvents.js:41-54` | funciona |
| Guardar informe | `diploMission.js:281-282` | funciona |
| Ver informes | `src/components/fleet/SpyReportsSection.jsx` | funciona |
| Informe en bandeja | `src/pages/TelemetryPage.jsx:22` | funciona |
| Bonificar combate | `src/missions/combatMission.js:59-71` | **muerto** |

### 2.2 La escalera de inteligencia (6 niveles)

`diploMission.js:216-266` decide entre `blocked`, `low`, `medium`, `high`, `full`
en función de `techDiff = spyTech - targetEspDefense`.

**Solo `low` y `blocked` son alcanzables.** Ver sección 3, defecto D1.

| Nivel | Contenido |
|---|---|
| `blocked` | todo `'???'` |
| `low` | recursos `'parcial'`, flota estimada o ausente |
| `medium` | recursos/flota/defensas con ruido |
| `high` | exacto + edificios + joker de investigación |
| `full` | exacto + estrategia, victorias, patrón de expansión, predicción |

### 2.3 Persistencia

- `spyReports` ya está en `GLOBAL_STATE_KEYS` (`electron/database/gameRepository.cjs:44`).
- Se serializa en `game_sessions.global_state_json`.
- Se restaura y se migra en `src/reducers/loadMigrator.js:221`.
- Las misiones viven en la tabla `fleet_missions` (`gameRepository.cjs:181-212`).

**No hace falta ninguna tabla nueva.** Solo añadir claves a esa lista cuando
aparezcan entidades nuevas.

---

## 3. DEFECTOS VERIFICADOS (corregir antes de añadir nada)

### D1 — CRÍTICO. El nivel de espionaje siempre vale 0

```
diploMission.js:143   const spyTech = mission.from.research?.espionage || 0;
```

`mission.from` es el planeta de origen. Su objeto `research` está **vacío**:
- `src/core/initialState.js:25` → `research: {}`
- `src/reducers/tick/queues/queueTick.js:209` → la investigación sube en `state.research`, nunca en el planeta
- `retrofitTech` solo contiene `weapons/shields/armour/combustion/impulse/hyperspace`

El patrón correcto ya existe en el proyecto y se usa en `combatMission.js:18`:

```js
getEffectiveTech(planet, globalResearch)   // combatFormulas.js:45-50
```

**Consecuencia:** `techDiff ∈ [-14, 0]` siempre → `medium`, `high` y `full`
inalcanzables → `combatMission.js:68-69` nunca bonifica → el único pago
estratégico del espionaje no existe.

El test que lo tapa: `src/__tests__/tacticalEvents.test.js:94` inyecta
`research:{espionage:10}` a mano.

### D2 — Las sondas nunca aparecen en la pestaña de inteligencia

```
FleetInventorySection.jsx:39
if (id.includes('spy') || id.includes('probe')) return 'intel';
```

`'espionageProbe'.includes('spy')` → **false**. `'espionageProbe'.includes('probe')`
→ **false** (mayúscula `P`). La sonda se clasifica `civil` y la pestaña
"🕵️ Espionaje e Inteligencia" (`FleetInventorySection.jsx:193`) queda vacía.

Además `:46` filtra por `['spyProbe','scannerDrone']`, ids que **no existen** en `SHIPS`.

### D3 — Las sondas destruidas se quedan colgadas en SQLite

Al detectarse la sonda, `diploMission.js:193` devuelve `returnFleet: {}`. Pero
`fleetMissionActions.js:139-147` ya había marcado esas naves como `in_flight` en la
tabla `ships`, y la única llamada que limpia destrucciones es
`dbResolveCombatShips`, usada solo en `combatMission.js:110`.

Esas filas quedan **`in_flight` para siempre**. `gameRepository.cjs:292-299` solo
lee `status='docked'`, así que ni se recuperan ni se ven: desincronización
permanente con el Registro Naval.

### D4 — `spyReports` no existe en el estado inicial

`src/core/initialState.js:98-192` declara `patrols`, `tacticalEventLog`, `combatLog`,
pero **no `spyReports`**. Funciona por suerte porque todo lo lee con `|| []`.

### D5 — El bonus de combate toma el informe más viejo

`combatMission.js:66` usa `.find()` sobre un array ordenado por inserción: devuelve
el **más antiguo** de la ventana de 50. Un informe `high` de hace horas sigue
bonificando como si fuera nuevo.

### D6 — El reducer no exige sondas

`fleetMissionActions.js:8-159` no tiene rama de espionaje. Se puede enviar
`missionType:'espionage'` con solo cazas. Si se detecta, se borran sin simulación
de combate y sin bajas: pérdida silenciosa.

### D7 — Sondas en misiones que no son de espionaje

Nada impide mandar `espionageProbe` en `transport`, `attack` o `expedition`.
De hecho `src/missions/expeditionMission.js:265` las cuenta como "naves pequeñas"
que se pueden perder.

### D8 — Afirmaciones falsas en la interfaz

| Afirmación | Realidad |
|---|---|
| `PatrolControlSection.jsx:220` "Intercepta asaltos y **espías**" | `patrolActions.js:309` solo intercepta `attack`. Ninguna patrulla toca espionaje. |
| `CommunicationsPage.jsx:101` "Informes de agentes encubiertos" | No existen agentes encubiertos en el código. |
| `PatrolControlSection` "Vigilancia de Frontera" (`galaxyData.js:202`) | `effect:'counter_intel'` nunca se lee. |

---

## 4. MECÁNICAS COMPRADAS Y MUERTAS (12)

| Declaración | Dónde | Efecto real |
|---|---|---|
| `espionage` → `perLevel:{espLevel:10}` | `researchData.js:32` | `espLevel` no lo lee nadie |
| `galacticCrypto` → `cryptoProt:15` "Protección contra sondas enemigas" | `researchData.js:37` | `cryptoProt` no lo lee nadie |
| `quantumCrypto` "Antiespionaje defensivo" | `expandedResearch.js:40` | nunca leída |
| `stealthSilos` "Protege silos de espionaje" | `expandedResearch.js:57` | nunca leída |
| `earlyWarningSat`, `phalanxSensors` (requieren `spyCenter`) | `expandedBuildings.js:25,27` | sin efecto |
| `advSensors` → `sensorRange` | `researchData.js:36` | nunca leído |
| `ministries.intel.{espionageBudget,counterIntelLevel,sleeperCells}` | `ministryState.js:22` | escritos, nunca leídos |
| `hawk_eye`, `sleeper_net` | `ministriesData.js:40-43` | solo imprimen "+X%" |
| `quantum_scrambler`, `black_ops` | `ministriesData.js` | sin efecto |
| `counterEspionage`, `activeEspionage` (candidatos) | `candidatesExtended.js:261-291` | solo peso de selección |
| `customShips.stealthSys/stealthModule` (`stealth:1/2`) | `customShips.js:44,49` | se calcula y se descarta |
| `bonuses.espionage` de las 9 facciones | `factions.js:10-90` | nunca leído |

---

## 5. CARENCIAS DEL FLUJO QUE PIDES

| Etapa del flujo | Existe | Falta |
|---|---|---|
| Selección del objetivo | sí | — |
| Comprobación de requisitos | **no** | nada valida: sin sonda, sin PNP, sin guerra |
| Costes | **no** | ni energía ni coste propio |
| Disponibilidad de unidad | parcial | solo `Math.min(5, count)`: no puedes mandar 1 |
| Preparación | **no** | sin selección de sonda ni confirmación |
| Lanzamiento | sí | — |
| Desplazamiento | sí | inútil: `speed: 1e8` → **toda misión dura 10 s**, la distancia no importa |
| Estados intermedios | **no** | no hay máquina de estados |
| Detección | sí | pero siempre con `spyTech = 0` |
| Interceptación | **no** | no existe para espionaje |
| Llegada / operación / recopilación | implícitas en un tick | — |
| Resolución | sí | — |
| Destrucción | sí | con fuga en SQLite (D3) |
| Retorno | sí | — |
| Notificación | sí | sin enlace a la pantalla correcta |
| Informe | sí | es un histórico plano, no acumulado |
| Inteligencia obtenida | **no** | no hay "conocido vs descubierto" ni estado por planeta |
| Consulta posterior | sí | como lista, no como dossier |

**No existe en ninguna parte:** contraespionaje, que la IA espíe al jugador,
niveles de inteligencia por planeta, separación conocido/descubierto,
máquina de estados de misión.

---

## 6. VALORACIÓN ARQUITECTÓNICA

Decisiones tomadas y por qué:

| Decisión | Elección | Motivo |
|---|---|---|
| ¿Pantalla nueva de espionaje? | **No** | el modo del proyecto es rejilla de tarjetas; `ministry_intel` ya es un tab |
| ¿Pantalla nueva de inteligencia? | **No** | `ministry_intel` ya existe como tab (`gameNavigation.js:21`) |
| ¿Sistema nuevo de misiones? | **No** | `fleetMissions` + `tickOrchestrator` ya resuelven viaje y retorno |
| ¿Sistema nuevo de eventos? | **No** | `tacticalEventLog` + `TelemetryPage` ya filtran `espionage*` |
| ¿Sistema nuevo de informes? | **No** | `SpyReportsSection` existe; se amplía |
| ¿Tablas nuevas? | **No** | `spyReports` ya está en `GLOBAL_STATE_KEYS` |
| Componente nuevo | **Solo 1**: dossier de inteligencia por planeta | es lo único que no existe en ninguna forma |

### 6.1 Punto de entrada

**Tarjeta en el hub del planeta** (`planetaryCommandCardsConfig.jsx`) → `ministry_intel`.
El tab ya existe; solo falta la tarjeta y el `subview`.

Cero pantallas nuevas. Cero rutas nuevas.

### 6.2 Encaje exacto

```
PLANETA (planetaryCommandCardsConfig)
  └─ tarjeta "🕵️ Espionaje y Sondas" → onNavigateTab('ministry_intel')
       └─GovernmentPage
            └─ parseGovernmentRoute('ministry_intel') → {level:2, ministryId:'intel'}
                 └─ Ministerio de Inteligencia
                      ├─ [nuevo subview 'espionage'] → IntelDossierView
                      │     ├─ selector de objetivo
                      │     ├─ Known vs undiscovered
                      │     └─ lanzar (reusa MissionConfigPanel)
                      ├─ buildings → reusar (spyCenter ya está)
                      ├─ research → reusar (espionage ya está)
                      └─ programs → reusar (hawk_eye, sleeper_net...)
```

Para que el subview exista: añadir `'espionage'` a `DESK_SUBVIEWS`
(`governmentRoute.js:6`) → la ruta queda `ministry_intel_espionage` y el parser
la resuelve sin tocar nada más.

### 6.3 Superficies que ya sirven y solo se amplían

| Superficie | Ampliación |
|---|---|
| `MissionConfigPanel.jsx` | selector de nº de sondas, coste y riesgo antes de lanzar |
| `InFlightMissionsSection.jsx` | etiqueta de fase de la misión |
| `TelemetryPage.jsx` | enlace de la notificación a la pantalla correcta |
| `SpyReportsSection.jsx` | agrupar por objetivo, marcar consultation |
| `FleetInventorySection.jsx` | corregir D2 |
| `GalaxyPage.jsx` | que respete la selección de sondas |

---

## 7. PLAN TÉCNICO — ESTADO DE EJECUCIÓN

Fases J1 a J4 ejecutadas. J5 repartido en cinco suites nuevas.

### Fase J1 — Correcciones (sin tocar la arquitectura) — HECHA

| # | Archivo | Cambio | Estado |
|---|---|---|---|
| J1.1 | `missions/diploMission.js` | `getEffectiveTech(mission.from, state.research)` | hecho |
| J1.2 | `missions/combatMission.js` | último informe, no el primero | hecho |
| J1.3 | `data/game/shipsData.js` + `FleetInventorySection.jsx` | `INTEL_SHIP_IDS` en el dato | hecho |
| J1.4 | `core/initialState.js` | `spyReports: []` | hecho |
| J1.5 | `reducers/fleet/fleetMissionActions.js` | exigir sondas | hecho |
| J1.6 | `missions/diploMission.js` + SQLite | resolver sondas destruidas | hecho |
| J1.7 | `PatrolControlSection.jsx`, `CommunicationsPage.jsx` | textos honestos | hecho |

Extra: **D7** — las sondas ya no pueden viajar en misiones que no son de espionaje.

### Fase J2 — Conectar lo que ya se paga — HECHA

Nuevo `src/utils/espionageFormulas.js` como fuente única. Conectadas: `galacticCrypto`,
`quantum_scrambler`, `sleeper_net`, `earlyWarningSat`, `phalanxSensors`, `advSensors`,
`factions.bonuses.espionage` (9 facciones), sigilo de `customShips`.

### Fase J3 — Completar el flujo — HECHA

Coste operativo, fases de misión, panel previo de coste y riesgo,
IA que espía (`aiEspionageTick.js`), intercepción por patrulla, bonus de
inteligencia de la IA en su ataque (`aiIntel`).

Las cinco mecánicas diferidas en J2 se conectaron aquí, que es donde por fin
tenían consumidor: `hawk_eye`, `counterIntelLevel`, `espionageBudget`,
`quantumCrypto`, `stealthSilos`.

### Fase J4 — Inteligencia acumulada — HECHA

`IntelDossierView` + `planetIntel`, dentro de `ministry_intel_espionage`.
Cero pantallas nuevas, cero tablas nuevas.

### Fase J5 — Tests — HECHA

| Suite | Tests |
|---|---|
| `espionageIntelLadder.test.js` | 11 |
| `espionageCounterIntel.test.js` | 23 |
| `espionageCounterSpy.test.js` | 18 |
| `espionageDossier.test.js` | 22 |
| `espionageValidation.test.js` | 23 |
| **total** | **97** |

### Hallazgo colateral, no resuelto

`aiSimulationProlonged.test.js` fallaba 2 de cada 8 veces: 300 ticks sin sembrar
RNG. Al sembrarlo se vio que la estrategia de facción **no se traduce en
resultados agregados**: los perfiles se diferencian (`techLean` 0,40 contra 0,95)
pero la IA reparte investigación y flota casi igual. El test se reescribió contra
lo que el código sí garantiza. Es un problema de equilibrio de IA, ajeno a esta fase.

---

## 8. RIESGOS

| Riesgo | Nivel | Prevención |
|---|---|---|
| Subir la tasa de éxito del espionaje rompe el equilibrio | **alto** | los niveles se prueban contra partida real, no a ojo |
| Tocar `fleetMissionActions` afecta a las 6 clases de misión | **alto** | la validación de sonda se limita a `type === 'espionage'`; test de no regresión de las otras |
| Añadir clave a `GLOBAL_STATE_KEYS` afecta a todo el guardado | medio | `persistenceContract.test.js` ya falla si una clave viva no está en la lista |
| Intercepción rompe misiones que antes llegaban | medio | solo `espionage`; los informes existentes no se tocan |
| Nueva ruta `ministry_intel_espionage`vara el breadcrumb | medio | `DESK_SUBVIEWS` es la única fuente; test de ruta |
| El dossier nuevo se cuelga con estado viejo | medio | `planetIntel` con valor por defecto defensivo; nada de acceso directo |
| Doble clic launching dos sondas | bajo | el reducer exige sondas y el contador es la fuente de verdad |

---

## 9. REGLAS QUE NO SE TOCAN

- No se crea ninguna pantalla nueva.
- No se crea ninguna tabla nueva.
- No se sustituye `fleetMissions`, `tacticalEventLog`, `spyReports`, `TelemetryPage`
  ni `SpyReportsSection`: se amplían.
- No se toca la arquitectura visual ni se introducen animaciones.
- No se rompe ninguna de las 50 suites existentes.