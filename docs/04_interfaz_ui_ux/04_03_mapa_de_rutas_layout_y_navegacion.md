# MAPA DE RUTAS, LAYOUT Y NAVEGACIÓN

## 1. LAYOUT MAESTRO DE ESCRITORIO
El contenedor raíz de la interfaz se divide en áreas anatómicas fijas:
- **Cabecera Superior (`AppHeader.jsx` & `ResourceBar.jsx`):**
  - Selector de planeta activo y selector de colonia rápida.
  - Contadores en tiempo real de Metal, Cristal, Deuterio, Energía y Capacidad de Almacén.
  - Selector de velocidad de juego y botón de opciones.
- **Barra Lateral Izquierda (`AppSidebar.jsx`):**
  - Botones de acceso directo a las 18 vistas principales con iconos y badges de colas activas.
- **Área Central de Mando:**
  - Contenedor dinámico donde se renderiza la página activa mediante carga diferida (`React.lazy`).
- **Barra de Telemetría Inferior (`ImperialTelemetryTicker.jsx` & `ConsoleHudBar.jsx`):**
  - Registro de eventos recientes, alertas de flotas enemigas y logs del imperio.

## 2. MAPA DE LAS 18 PÁGINAS PRINCIPALES DEL JUEGO
1. `OverviewPage`: Estado integral del planeta, resumen económico y operaciones en curso.
2. `BuildingsPage`: Complejo de obras civiles e industriales organizado por ministerios.
3. `ResearchPage`: Laboratorio científico y árbol de tecnologías.
4. `ShipyardPage`: Astillero para construcción de naves ligeras, pesadas y cargueros.
5. `DefensePage`: Instalación de torretas láser, cañones iónicos y escudos planetarios.
6. `FleetPage`: Gestión de flotas orbitales, asignación de misiones y rutas de comercio.
7. `GalaxyPage`: Mapa estelar interactivo para exploración de sistemas y planetas vecinos.
8. `DiplomacyPage`: Relaciones con imperios alienígenas, pactos y Consejo Galáctico.
9. `GovernmentPage`: Asignación de ministros, directivas y decretos del imperio.
10. `CombatPage`: Registro y simulación táctica de enfrentamientos bélicos.
11. `CommunicationsPage`: Registro de transmisiones entrantes, espionaje y diálogos.
12. `MissilesPage`: Silos de misiles balísticos interplanetarios y antimisiles.
13. `MissionsPage`: Misiones de campaña, expediciones y exploración profunda.
14. `MoonPage`: Base lunar, sensor falanx y cañón de salto gravitatorio.
15. `ReplayPage`: Reproductor cinemático ronda a ronda de batallas espaciales.
16. `ShipDesignPage`: Diseñador modular de chasis y módulos tácticos de naves.
17. `StatsPage`: Estadísticas históricas, poder militar y ranking galáctico.
18. `TechTreePage`: Visualizador del árbol de requisitos de investigación e infraestructuras.
