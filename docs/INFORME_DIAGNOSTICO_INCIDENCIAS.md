# Informe de Diagnóstico Integral: Causas y Plan de Solución

### 1. Escoria Industrial (Jitter / Encogimiento y Desencogimiento)
- **Hub Superior (TacticalResourceRow.jsx / ResourceBar.jsx)**:
  - En `TacticalResourceRow.jsx`, la casilla de escoria tenía un ancho fijado con `w-[140px] sm:w-[155px]`. Al cambiar de dígitos o al alternar tasas horarias positivas/negativas (`+` o `-`), el contenedor colapsaba y producía baile visual.
  - En `ResourceBar.jsx`, las celdas tenían `min-w-[115px] sm:min-w-[125px]`.
- **Pantalla de Imperio (Planet3DCard.jsx)**:
  - Las 5 celdas inferiores de las tarjetas 3D usaban `grid-cols-5` sin ancho mínimo blindado ni `tabular-nums` bloqueado, redimensionando la columna en cada TICK.
- **Solución**:
  - Asignar una anchura fija y holgada (`min-w-[170px]` en HUDs y ancho mínimo bloqueado con `tabular-nums` en tarjetas de Imperio) para que solo cambie el número.

---

### 2. Desaparición de Flotas en los Planetas
- **Causa Raíz (loadMigrator.js)**:
  - En el mapper de planetas de `loadMigrator.js` (líneas 127-181) se normalizan defensas, edificios y variantes, pero se omitía la asignación defensiva explícita de `fleet: p.fleet || {}`. Al cargar o migrar un save donde el payload viniera saneado, el objeto quedaba nulo o no deserializado, provocando la desaparición del hangar e inventario naval.
- **Solución**:
  - Asegurar la inicialización garantizada `fleet: p.fleet || {}` en `loadMigrator.js` y `saveValidation.js`.

---

### 3. Megaproyectos de Lonja Galáctica
- **Botón Aportar (Fallo de clic / doble clic / desaparición)**:
  - En `ExchangePlanetaryCommandHub.jsx`, el botón de aportar compartía eventos con el contenedor de la tarjeta sin `e.stopPropagation()`. Al re-renderizarse tras el clic, cambiaba el estado de validación instantáneamente sin debounce, pareciendo que se requería doble clic o que fallaba.
- **Tiempo de Construcción**:
  - La acción `FINALIZE_EXCHANGE_PROJECT` subía el nivel de forma instantánea al 100% de financiación sin temporizador ni cola de obra.
- **Solución**:
  - Blindar el botón con `e.stopPropagation()` y estados de carga, e integrar cola/tiempo de construcción con temporizador real para los megaproyectos.

---

### 4. Mando Imperial: Falta de Hub Superior y Retorno Estándar
- **Causa en Diplomacia y Alianzas (DiplomacyPage.jsx)**:
  - Al hacer clic en "volver a Mando Imperial", el botón llamaba a `navigateBack()` o navegaba a rutas inconsistentes, y `parentHub` no sincronizaba el estado con `OverviewHudBar`.
- **Causa en Consejo de Ministros Supremos (ImperialCouncilCabinet.jsx)**:
  - Tenía una cabecera propia sin montar el `SubsystemTopBanner` estandarizado con recursos imperiales y botón estándar de volver.
- **Causa en Senado Imperial (ImperialSenateView.jsx)**:
  - No montaba el `SubsystemTopBanner`, por lo que no mostraba telemetría de recursos ni el botón estandarizado de regreso al Mando Imperial.
- **Causa del grid de 4 casillas (4x2 = 8 casillas) en Mando Imperial**:
  - `ImperialCommandHub.jsx` utiliza `columnsClass="lg:grid-cols-4"` y el catálogo `IMPERIAL_COMMAND_CARDS` define 8 tarjetas fijas (`missions`, `diplomacy`, `imperial_council`, `imperial_senate`, `colony_network`, `combat`, `shipDesign`, `stats`).
- **Solución**:
  - Incorporar `SubsystemTopBanner` estandarizado con telemetría completa de recursos y botón idéntico de retorno en Consejo de Ministros Supremos, Senado Imperial y Diplomacia.
  - Sincronizar el retorno al Mando Imperial para que siempre cargue la barra superior consolidada.

---

### 5. Tarjetas de Red de Colonias y Logística (ColonyStationCardGrid.jsx)
- **Tarjeta "Armadores y Convoyes Comerciales"**:
  - El título no cabe bien y desentona. Se renombra a **"Convoy Comercial"** con subtítulo coherente de ordenanzas y rutas bilaterales.
- **Prefecturas y Sectores**:
  - Se unifica a **"Prefecturas Coloniales"**.
  - El layout interno de "Sectores Territoriales y Virreinatos" se refactoriza para abrirse en vista modal/pantalla completa dedicada al hacer clic.
- **Matriz Colonial en Vivo**:
  - Se conecta su clic para abrir la vista completa de la matriz colonial sin layouts intermedios.
- **Matriz de Investigación ("No apto, falta energía red")**:
  - **Causa**: `ResearchMatrixView.jsx` y `researchReducer.js` exigen `planet.resources?.energy >= 50`. En el juego, la energía es un balance de producción (`prod.energyBalance`), NO una propiedad guardada en `resources.energy`. Por tanto, cualquier colonia mostraba erróneamente **"No Apto: Falta Energía Red"**.
  - **Solución**:
    - Renombrar la tarjeta a **"Matriz de Investigación"**.
    - Corregir la validación de energía para consultar el balance energético real del planeta (`calcProduction().energyBalance >= 50` o producción de centrales).

---

### 6. Tarjetas de Naves y Defensas (Botón Ver Detalles y Pulsadores +1, +5, +10, MAX)
- **Botón "Ver detalles" (menu_book)**:
  - **Causa**: En `ShipProductionCard.jsx` y `DefenseGrid.jsx`, el botón de detalles está ubicado en la cabecera en un recuadro diminuto de `w-4 h-4` con el texto de icono `menu_book` sin fuente de iconos cargada visiblemente, haciéndolo casi imperceptible.
  - **Solución**:
    - Mover el botón abajo a la derecha, al lado de MAX, con estilo de botón táctico claro (icono 📖 / "Detalles").
- **Pulsadores +1, +5, +10 y MAX**:
  - **Causa**: En `ShipProductionCard.jsx`, los botones `+1`, `+5`, `+10` tenían clases mínimas `flex-1 text-[11px] py-1` sin fondo, relieve ni borde evidente de pulsador.
  - **Solución**:
    - Estilizarlos de forma idéntica a la botonera de defensas: botones con fondo visible, bordes cian tenues, efecto hover brillante y feedback de pulsación (active scale).

---

### 7. Guardado de Partidas: Sobrescritura y Solo Dos Partidas
- **Causa en Electron IPC (saveIpc.cjs)**:
  - En `saveIpc.cjs`, la función `save-game-named` recibe `data._sessionId`. Si la partida ya tenía una sesión activa, actualizaba **siempre la misma fila** en `game_sessions` mediante `ON CONFLICT(id) DO UPDATE`.
  - Cuando el usuario ponía un nombre distinto para guardar como una partida nueva, el sistema reutilizaba el `_sessionId` de la partida en memoria y sobrescribía la partida anterior en lugar de crear un nuevo registro. Por eso solo quedaban dos partidas (el slot actual y un backup).
- **Solución**:
  - Cuando el usuario guarde manualmente con un nombre específico en `handleInGameSave`, generar una nueva sesión o desvincular el `_sessionId` para crear un registro independiente en SQLite, permitiendo tener múltiples partidas guardadas con nombres distintos sin sobrescribirse.
