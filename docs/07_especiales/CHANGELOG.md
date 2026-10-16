# REGISTRO DE ACTUALIZACIONES Y NOVEDADES (CHANGELOG)

## [v1.1.138] - 2026-10-16

### Nuevos Hubs y Despachos Gubernamentales
- **Salas de Gobierno e Hubs Tácticos:** Integración de `planetarySenateHall`, `planetaryBankVault`, `imperialMissionsHub`, `imperialSenateChamber`, `imperialCodexArchive`, `imperialStatisticsCore` y `tacticalListeningNetwork`.
- **Embajadas Extranjeras:** Nuevo modal y flujo interactivo `ForeignEmbassyModal.jsx` para gestionar relaciones interestelares, pactos comerciales y diplomacia activa.
- **Banco Planetario y Finanzas:** Incorporación de `PlanetaryBankPage.jsx` y `financialBalanceTick.js` para una gestión monetaria local y control de tesorería descentralizada por planeta.
- **Rutas de Suministro y Logística:** Implementación de `supplyRoutesTick.js` y optimización en `useGameTick.js` para el transporte logístico automatizado.

### Rediseño de Navegación e Identidad Visual
- **Navegación Táctica por Tarjetas:** Tarjetas de comando para hubs planetarios e imperiales con renderizado condicional, breadcrumbs directos y soporte full null-safety.
- **Optimización WebGL/Three.js:** Descarga y liberación correcta de texturas procedimentales y geometrías en `PlanetViewer3D.jsx`.
- **Preloader del Sistema:** Implementación de `systemPreloader.js` para arranque suave y amortiguación de assets en memoria.

### Estabilidad y Base de Datos SQLite v4
- **Persistencia Transaccional:** Robustecimiento de `gameRepository.cjs`, `migrator.cjs` y `dbManager.cjs`.
- **Auditoría de Fórmulas y Null-Safety:** Cobertura de tests ampliada a 62 suites (558 tests pasando al 100%) sin errores de tipo undefined ni regresiones.
