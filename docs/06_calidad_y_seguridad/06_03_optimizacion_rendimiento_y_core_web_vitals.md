# OPTIMIZACIÓN DE RENDIMIENTO Y RENDERING

## 1. TÉCNICAS DE OPTIMIZACIÓN EN EL RENDERER
- **Carga Perezosa (Lazy Loading):** Todas las pantallas secundarias se cargan mediante `React.lazy()` y `Suspense` para mantener un bundle inicial extremadamente ligero.
- **Memoización de Componentes:** Uso de `React.memo` y selectores derivados con `useMemo` para prevenir re-renders masivos del árbol de componentes en cada tick del juego.
- **Renderizado por Hardware:** Uso de capas aceleradas por GPU (`transform-gpu`) para transiciones fluidas de paneles y animaciones HUD.
- **Eficiencia en el Motor 3D Three.js:** Geometrías optimizadas y materiales compartidos en el mapa galáctico para garantizar 60 FPS estables.
