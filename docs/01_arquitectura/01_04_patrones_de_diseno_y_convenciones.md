# PATRONES DE DISEÑO Y CONVENCIONES DE CÓDIGO

## 1. PATRONES ARQUITECTÓNICOS DOMINANTES
1. **Unidirectional Data Flow (Redux / Flux Pattern):**
   - El estado reside en una estructura inmutable única gestionada por `gameReducer` (`src/reducers/`).
   - Las vistas emiten acciones (`dispatch`) sin modificar el estado directamente.
2. **Sub-Reducer Domain Decomposition:**
   - La lógica de negocio está dividida en sub-reductores especializados:
     - `economyReducer.js`: Gestión de almacenes, colas de construcción y producción.
     - `fleetReducer.js`: Despliegue de flotas, misiones y producción de astillero.
     - `diplomacyReducer.js`: Relaciones con facciones, pactos comerciales y diplomacia.
     - `governmentReducer.js`: Nombramiento de ministros, directivas imperiales y decretos.
     - `researchReducer.js`: Colas y bonificaciones tecnológicas.
3. **Compound Component & Container/Presenter:**
   - Separación entre lógica de interacción (`FleetSelectionList`, `MissionConfigPanel`) y componentes puros de presentación (`ActionCardTile`, `ItemCard`).
4. **Error Boundary Isolation:**
   - Límites de error en el nivel raíz (`ErrorBoundary.jsx`) para capturar cualquier fallo de renderizado sin corromper el estado guardado ni detener el audio.

## 2. CONVENCIONES DE NOMENCLATURA Y ESTILO
- **Componentes React:** PascalCase (ej. `BuildingsPage.jsx`, `ConsoleHudBar.jsx`).
- **Archivos de Utilidad y Reductores:** camelCase (ej. `combatFormulas.js`, `colonyGovernor.js`).
- **Constantes y Enums de Dominio:** UPPER_SNAKE_CASE (ej. `TICK_MS`, `GAME_SPEED`, `MINISTRY_MAPPING`).
- **Idioma del Código:** Identificadores en inglés o camelCase técnico según el codebase original.
- **Idioma de Documentación:** Español técnico de alta precisión.
