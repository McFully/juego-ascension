# Master Plan de Implementación Total: Correcciones y Mejoras

Este plan aborda de forma exhaustiva, modular y quirúrgica todas las incidencias y solicitudes tratadas en la sesión.

---

### Fase 1: Blindaje Visual y Estabilidad de Escoria Industrial (Cero Jitter)
- **Archivos diana**:
  - `src/components/ui/TacticalResourceRow.jsx`
  - `src/components/ui/ResourceBar.jsx`
  - `src/components/overview/grid/Planet3DCard.jsx`
- **Acciones**:
  1. En `TacticalResourceRow.jsx`: cambiar el ancho rígido de la casilla de escoria a `w-[170px] shrink-0` con `tabular-nums` estricto en la cifra y en la tasa horaria para eliminar el jitter cuando fluctúan cifras y signos (+/-).
  2. En `ResourceBar.jsx`: fijar en `ResourceBadge` para el tipo `slag` una anchura mínima holgada (`min-w-[150px]`) que prevenga oscilaciones.
  3. En `Planet3DCard.jsx`: fijar anchos mínimos consistentes y `tabular-nums` en el grid de recursos de las tarjetas planetarias para que los números cambien sin alterar el ancho de las tarjetas.

---

### Fase 2: Blindaje de Flotas en Carga y Persistencia Local
- **Archivos diana**:
  - `src/reducers/loadMigrator.js`
  - `src/utils/saveValidation.js`
- **Acciones**:
  1. En `loadMigrator.js`: asegurar que en la normalización de mundos (`payload.planets.map`) se asigne de forma explícita e inviolable `fleet: p.fleet || {}`.
  2. En `saveValidation.js`: validar que `fleet` sea preservado y saneado sin descartar hangares al validar saves v4.

---

### Fase 3: Megaproyectos de la Lonja Galáctica (Tiempo de Obra y Botón Aportar)
- **Archivos diana**:
  - `src/components/government/ExchangePlanetaryCommandHub.jsx`
  - `src/reducers/economyReducer.js`
  - `src/reducers/tick/queues/queueTick.js`
- **Acciones**:
  1. En `ExchangePlanetaryCommandHub.jsx`: agregar `e.stopPropagation()` al botón de aportar, debounce y estado de pulsación para evitar clicks fantasma, dobles clicks y desaparición.
  2. Integrar cola y temporizador de construcción: cuando un megaproyecto alcance el 100% de aportaciones comunitarias, no finalizar instantáneamente; encolarlo en `buildQueue` (o cola especializada de megaproyectos de Lonja) con temporizador calculado y barra de progreso.

---

### Fase 4: Mando Imperial, Consejo de Ministros y Senado (Hub Superior y Navegación)
- **Archivos diana**:
  - `src/pages/DiplomacyPage.jsx`
  - `src/components/government/council/ImperialCouncilCabinet.jsx`
  - `src/components/government/council/ImperialSenateView.jsx`
  - `src/pages/ImperialCommandPage.jsx`
- **Acciones**:
  1. En `ImperialCouncilCabinet.jsx`: integrar `SubsystemTopBanner` con telemetría de recursos consolidados y botón estándar de regreso al Mando Imperial.
  2. En `ImperialSenateView.jsx`: integrar `SubsystemTopBanner` idéntico con recursos imperiales y botón estándar de retorno.
  3. En `DiplomacyPage.jsx`: corregir el retorno hacia el Mando Imperial para que mantenga la barra superior consolidada.
  4. En `ImperialCommandPage.jsx`: asegurar la sincronización del HUB superior cuando se navega entre los tres niveles (Hub central, Consejo y Senado).

---

### Fase 5: Red de Colonias y Logística (Nomenclatura y Vistas Completas)
- **Archivos diana**:
  - `src/components/colonyNetwork/ColonyStationCardGrid.jsx`
  - `src/components/colonyNetwork/ResearchMatrixView.jsx`
  - `src/reducers/researchReducer.js`
  - `src/pages/ColonyNetworkPage.jsx`
- **Acciones**:
  1. En `ColonyStationCardGrid.jsx`:
     - Renombrar tarjeta "Armadores y Convoyes Comerciales" a **"Convoy Comercial"**.
     - Renombrar tarjeta a **"Prefecturas Coloniales"**.
     - Renombrar tarjeta a **"Matriz de Investigación"**.
  2. En `ColonyNetworkPage.jsx` y `SectorManagementView.jsx`:
     - Refactorizar para que al clicar en "Prefecturas Coloniales" y "Matriz Colonial en Vivo" se cargue una vista limpia a pantalla completa dedicada, eliminando layouts estáticos innecesarios.
  3. En `ResearchMatrixView.jsx` y `researchReducer.js`:
     - Corregir el bug de "No apto, falta energía red". Cambiar la comprobación errónea de `planet.resources.energy` (que no existe) a la producción de energía neta real (`calcProduction().energyBalance >= 50` o producción de centrales), permitiendo enlazar colonias con normalidad.

---

### Fase 6: Tarjetas de Naves y Defensas (Botones de Detalles y Pulsadores Tácticos)
- **Archivos diana**:
  - `src/components/shipyard/ShipProductionCard.jsx`
  - `src/components/defense/DefenseGrid.jsx`
- **Acciones**:
  1. En `ShipProductionCard.jsx`:
     - Mover el botón "Ver detalles" (📖) de la cabecera a la parte inferior derecha, junto al botón MAX.
     - Convertir los selectores `+1`, `+5`, `+10` y `MAX` en pulsadores tácticos con fondo visible, bordes cian, hover activo y feedback táctil claro.
  2. En `DefenseGrid.jsx`:
     - Reubicar el botón de detalles de forma análoga junto al botón MAX y homogeneizar los pulsadores.

---

### Fase 7: Sistema de Guardado Independiente (Múltiples Saves sin Sobrescritura)
- **Archivos diana**:
  - `electron/ipc/saveIpc.cjs`
  - `src/hooks/useAppSaveHandlers.js`
- **Acciones**:
  1. En `useAppSaveHandlers.js`: cuando el usuario guarde manualmente una partida con un nombre explícito en `handleInGameSave(name)`, desvincular el `_sessionId` de la partida en memoria para forzar la creación de un nuevo slot independiente.
  2. En `saveIpc.cjs`: cuando el nombre de la partida guardada difiera del `saveName` registrado en la sesión actual, generar un nuevo registro con nuevo slug y nuevo `sessionId` en la tabla `game_sessions`, evitando que la última partida sobrescriba a las anteriores y permitiendo una lista ilimitada de partidas guardadas.

---

### Fase 8: Verificación, Tests y Validación de Estabilidad
- **Acciones**:
  1. Ejecución de suite de tests unitarios y de integración (`npm test`).
  2. Verificación de compilación de Vite (`npm run build`).
  3. Comprobación de integridad de base de datos SQLite y consistencia de UI.
