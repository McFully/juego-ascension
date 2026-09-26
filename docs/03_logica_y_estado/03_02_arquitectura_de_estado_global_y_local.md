# ARQUITECTURA DE ESTADO GLOBAL Y LOCAL

## 1. ESTRUCTURA DEL OBJETO DE ESTADO GLOBAL (`GameState`)
El estado global está centralizado en `src/core.jsx` y sus reductores satélites:
- `playerName`: Nombre del comandante del imperio.
- `gameStarted`: Bandera booleana de estado de partida activa.
- `currentPlanetIndex`: Índice del planeta actualmente seleccionado y enfocado en el HUD.
- `planets`: Array de objetos planetarios, cada uno con:
  - Coordenadas galácticas: `{ galaxy, system, position }`.
  - Recursos almacenados: `{ metal, crystal, deuterium, energy, maxEnergy }`.
  - Edificios construidos: `{ [buildingId]: level }`.
  - Defensas activas: `{ [defenseId]: count }`.
  - Colas de producción: `{ buildingQueue, shipyardQueue, defenseQueue }`.
  - Gobernador y políticas: `{ governor, policies }`.
- `research`: Registro de niveles de tecnología global desbloqueados: `{ [techId]: level }`.
- `fleets`: Array de flotas en tránsito espacial con origen, destino, composición de naves y misión.
- `factions`: Relaciones diplomáticas, tratados y opiniones con imperios IA.
- `government`: Estructura ministerial con candidatos asignados, presupuestos y directivas activas.

## 2. MODULARIZACIÓN EN SUB-REDUCTORES
- `src/reducers/economyReducer.js`: Mutaciones de recursos y colas de obras.
- `src/reducers/fleetReducer.js`: Gestión de astilleros, ensamblaje y misiones.
- `src/reducers/diplomacyReducer.js`: Acuerdos, federaciones y crisis cósmicas.
- `src/reducers/governmentReducer.js`: Ministerios y directivas gubernamentales.
- `src/reducers/researchReducer.js`: Árbol tecnológico e investigaciones.
- `src/reducers/systemReducer.js`: Preferencias de interfaz, volumen y configuraciones.
