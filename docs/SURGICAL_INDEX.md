# ASCENSION - MAPA QUIRÚRGICO DE ARQUITECTURA (SURGICAL INDEX)
Este índice mapea de forma unívoca cada subsistema, pantalla, componente y reducer a su archivo y función responsable.
Permite acceso quirúrgico directo sin barridos exploratorios ni búsquedas redundantes.

---

## 1. SISTEMA DE GALAXIA Y DESTINOS
- **Página Principal de Galaxia:** `src/pages/GalaxyPage.jsx`
  - `selectTarget(pos, occupied, isAI)`: Asigna el planeta seleccionado como objetivo táctico (`setSelectedTarget`) y conmuta a la vista de flota.
  - Renderizado de filas de órbitas (posiciones 1 a 15): Detección de colonias propias (`my`), planetas IA (`ai`), mundos vírgenes (`virgin`) o anomalías (`poi`).
- **Consola de Navegación Galáctica:** `src/components/galaxy/GalaxyNavConsole.jsx`
  - Selectores de galaxia (1-10) y sistema solar (1-SYS_MAX).
- **Cálculo de Coordenadas y Distancias:** `src/core.jsx`
  - `calcDistance(p1, p2)`, `calcFlightTime(dist, spd, missionSpeed)`, `calcFuel(...)`.

---

## 2. FLOTAS, ENVÍOS Y MISIONES
- **Página de Operaciones de Flota:** `src/pages/FleetPage.jsx`
  - Orquestador de selección de naves, simulación de combate y despacho de flotas.
  - `sendFleet()`: Dispara la acción `SEND_FLEET` al reducer.
- **Selector de Destino y Hangar Local:** `src/components/fleet/DestinationSelectorSection.jsx`
  - Muestra destino activo o naves disponibles en el planeta actual.
- **Asignación de Naves:** `src/components/fleet/FleetSelectionList.jsx`
  - Controles de cantidad (+1, +10, 50%, MAX), telemetría de ataque, escudos y capacidad de carga.
- **Configuración de Misión y Carga:** `src/components/fleet/MissionConfigPanel.jsx`
  - Selección de tipo de misión (`transport`, `attack`, `colonize`, `espionage`, `recycle`, `expedition`).
  - Carga de recursos (`transportRes`: metal, cristal, deuterio).
  - Auto-asignación de transportes según volumen de carga.
  - Velocidad de vuelo y formaciones de combate.
- **Simulador de Combate:** `src/components/fleet/CombatSimulatorModal.jsx` y `src/core.jsx` (`simulateCombat`).
- **Alertas de Invasión Enemiga:** `src/components/fleet/IncomingInvasionsAlert.jsx`.
- **Rutas Comerciales:** `src/components/fleet/TradeRoutesSection.jsx`.
- **Informes de Espionaje:** `src/components/fleet/SpyReportsSection.jsx`.

---

## 3. REDUCERS DE FLOTA Y DESPACHO
- **Despacho de Flota (Acción Principal):** `src/reducers/fleet/fleetMissionActions.js`
  - `handleSendFleet(state, action)`: Valida naves disponibles, deduce recursos transportados, calcula combustible de deuterio según hiperespacio/impulso, descuenta combustible, calcula tiempos de llegada y retorno, y genera la misión en `state.fleetMissions`.
- **Colonización y Abandono:** `src/reducers/fleet/colonyReducer.js`
  - `handleColonize()`, `handleAbandonPlanet()`.
- **Producción de Naves y Defensas:** `src/reducers/fleet/shipProductionActions.js`
  - `handleStartShip()`, `handleStartDefense()`.
- **Modernización (Retrofit):** `src/reducers/fleet/retrofitActions.js`.
- **Misiles Interplanetarios:** `src/reducers/fleet/missileReducer.js`.
- **Diseño de Naves Personalizadas:** `src/reducers/fleet/blueprintReducer.js`.
- **Rutas Comerciales Automáticas:** `src/reducers/fleet/tradeRouteReducer.js`.
- **Base Lunar y Salto Cuántico:** `src/reducers/fleet/moonReducer.js`.

---

## 4. MOTOR DE RESOLUCIÓN DE MISIONES (LLEGADA Y RETORNO)
- **Orquestador de Misiones:** `src/missions.jsx`
  - `processMission(mission, state)`: Enruta según `mission.type`.
  - `returnFleetToOrigin(state, mission)`: Reintegra las naves al hangar del planeta emisor al finalizar el viaje de regreso.
- **Misiones Diplomáticas, Colonización y Transporte:** `src/missions/diploMission.js`
  - `handleTransportMission(mission, state)`: Deposita el metal, cristal y deuterio transportados en el planeta destino y despacha la flota de vuelta a casa.
  - `handleColonizeMission(mission, state)`: Funda una nueva colonia, descuenta la nave colonizadora y devuelve el resto de la flota.
  - `handleEspionageMission(mission, state)`: Genera reporte de inteligencia según diferencia tecnológica.
- **Misiones de Combate:** `src/missions/combatMission.js`
  - Resolución táctica, cálculo de escombros y saqueo de recursos.
- **Misiones de Expedición:** `src/missions/expeditionMission.js`.
- **Misiones de Reciclaje:** `src/missions/recycleMission.js`.

---

## 5. CICLO DE VIDA, TICK Y CUENTAS ATRÁS
- **Orquestador Principal del Tick:** `src/reducers/tick/tickOrchestrator.js`
  - `processTick(state)`: Se ejecuta cada segundo.
  - Bucle de `state.fleetMissions`: Calcula si `now >= m.arrivalTime` para resolver la misión, y si `now >= m.returnTime` para finalizar el retorno.
  - Actualización de estadísticas y eventos narrativos.
- **Colas de Producción (Construcción, Investigación, Hangar):** `src/reducers/tick/queues/queueTick.js`
  - `processAllQueuesTick(state)`: Entrega unidad a unidad de naves, defensas y finalización de edificios/tecnologías.
- **Economía y Producción Planetaria:** `src/reducers/tick/resourceTick.js` y `src/core.jsx` (`calcProduction`).
- **Simulación de Imperios IA:** `src/reducers/tick/ai/aiEmpireTick.js`.
- **Automatizaciones del Jugador:** `src/reducers/tick/automation/`.

---

## 6. GOBIERNO, MINISTERIOS Y POLÍTICAS
- **Hub de Mando Imperial:** `src/components/government/ImperialCommandHub.jsx`.
- **Ministerios Imperiales:** `src/reducers/tick/ministries/ministryTick.js`.
- **Doctrinas y Políticas:** `src/reducers/empire/doctrineReducer.js`.

---

## 7. PERSISTENCIA Y RUNTIME ELECTRON (LOCAL)
- **Manejador de Persistencia IPC:** `electron/main.cjs` y `src/core.jsx` (`saveGameLocal`, `loadGameLocal`).
- **Preload Seguro:** `electron/preload.cjs`.
- **Archivos de Guardado:** `%APPDATA%/Ascension/saves/`.
