# PASO 04: MOTORES DE LÓGICA Y ESTADO

## 1. CONSTRUCCIÓN DEL CORE LOGIC Y REDUCTORES
1. Crear las fórmulas de producción, costes y vuelo en `src/utils/formulas/`.
2. Implementar el simulador de combate de hasta 6 rondas en `src/combat.js`.
3. Construir los sub-reductores en `src/reducers/` (`economyReducer.js`, `fleetReducer.js`, `diplomacyReducer.js`, `governmentReducer.js`, `researchReducer.js`).
4. Ensamblar el orquestador de ticks en `src/reducers/tick/tickOrchestrator.js` y el hook maestro `useGameLoop.js`.
