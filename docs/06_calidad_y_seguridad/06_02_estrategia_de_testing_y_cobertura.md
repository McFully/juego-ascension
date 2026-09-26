# ESTRATEGIA DE TESTING Y COBERTURA

## 1. INFRAESTRUCTURA DE PRUEBAS UNITARIAS (`vitest`)
La suite de pruebas automatizadas valida la estabilidad matemática y la integridad del estado del juego:
- **`src/__tests__/logic.test.jsx`:** Pruebas del bucle temporal, colas de investigación y producción de edificios.
- **`src/__tests__/core.test.jsx`:** Validación del reductor principal y persistencia del estado base.
- **`src/__tests__/extendedSimulation.test.jsx`:** Simulación de partidas aceleradas por miles de ticks para validar balance de recursos y ausencia de desbordamientos numéricos.
- **`src/__tests__/livingPlanet.test.jsx`:** Pruebas de simulación ecológica y eventos estocásticos planetarios.
- **`src/__tests__/colonyGovernor.test.jsx`:** Validación de la delegación de decisiones en gobernadores coloniales automáticos.

## 2. COMANDO DE EJECUCIÓN
```powershell
npm run test
```
