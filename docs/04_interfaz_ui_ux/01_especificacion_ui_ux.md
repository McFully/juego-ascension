# 🎨 BLOQUE 4: INTERFAZ, UI/UX Y COMPONENTES ATÓMICOS

## 04.01 SISTEMA DE DISEÑO, TOKENS Y ESTILOS (`src/index.css` & `src/styles.js`)

### Paleta de Colores Sci-Fi Espacial (Variables CSS)
El diseño visual utiliza una paleta espacial profunda con acentos neón y efectos de iluminación frena:

- **Fondo Global Espacial:** `#05070f` (Negro abisal con matices azul muy oscuro).
- **Paneles Principales:** `rgba(10, 15, 30, 0.85)` con `backdrop-filter: blur(12px)`.
- **Acento Primario (Cian Eléctrico):** `#06b6d4` / `hsl(189, 94%, 43%)`.
- **Acento Secundario (Azul Neón):** `#3b82f6` / `hsl(217, 91%, 60%)`.
- **Alertas / Amenazas (Rojo Alerta):** `#ef4444` / `hsl(0, 84%, 60%)`.
- **Recurso Metal:** `#94a3b8` (Gris platino brillante).
- **Recurso Cristal:** `#38bdf8` (Azul cian cristalino).
- **Recurso Deuterio:** `#a855f7` (Púrpura sintético).
- **Recurso Energía:** `#eab308` (Amarillo solar).

---

## 04.02 PANTALLAS PRINCIPALES DEL JUEGO (18 VISTAS ATÓMICAS)

### Ficha Técnica de las Vistas (`src/pages/`)

| Nombre de la Vista | Archivo | Responsabilidad / Descripción UI |
| :--- | :--- | :--- |
| **Resumen General** | [`OverviewPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/OverviewPage.jsx) | Muestra el estado del planeta activo, temperatura, campos, luna, recursos y eventos en curso. |
| **Edificios** | [`BuildingsPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/BuildingsPage.jsx) | Matriz de construcciones planetarias (minas, plantas de energía, almacenes y fábrica de robots). |
| **Investigaciones** | [`ResearchPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/ResearchPage.jsx) | Árbol tecnológico de investigaciones científicas y desarrollo espacial. |
| **Hangar / Astillero** | [`ShipyardPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/ShipyardPage.jsx) | Producción en serie de cazas, cargueros, cruceros, destructores y naves insignia. |
| **Defensas** | [`DefensePage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/DefensePage.jsx) | Construcción de torretas láser, cañones Gauss, escudos orbitales y cúpulas. |
| **Misiles** | [`MissilesPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/MissilesPage.jsx) | Lanzamiento y fabricación de misiles interplanetarios tácticos e interceptores. |
| **Galaxia** | [`GalaxyPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/GalaxyPage.jsx) | Mapa interactivo de navegación por coordenadas estelares (Galaxia, Sistema, Posición). |
| **Flota** | [`FleetPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/FleetPage.jsx) | Despliegue de misiones, selección de naves, asignación de velocidad y carga de recursos. |
| **Simulador de Combate**| [`CombatPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/CombatPage.jsx) | Herramienta de pruebas de enfrentamientos hipotéticos para calcular resultados tácticos. |
| **Estadísticas** | [`StatsPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/StatsPage.jsx) | Clasificación global de puntos de construcciones, flota, investigación y total. |
| **Gestión de Luna** | [`MoonPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/MoonPage.jsx) | Construcción de base lunar, Sensor Phalanx y Salto Cuántico en satélites naturales. |
| **Árbol Tecnológico** | [`TechTreePage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/TechTreePage.jsx) | Diagrama interactivo de requisitos previos para desbloquear cada edificio y nave. |
| **Diseñador de Naves** | [`ShipDesignPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/ShipDesignPage.jsx) | Taller de customización de naves modulares (elección de chasis, motores y armas). |
| **Repetidor de Batallas**| [`ReplayPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/ReplayPage.jsx) | Reproductor por rondas animadas de informes de batalla pasados. |
| **Diplomacia** | [`DiplomacyPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/DiplomacyPage.jsx) | Relaciones diplomáticas, pactos de no agresión y ofertas comerciales con facciones IA. |
| **Gobierno** | [`GovernmentPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/GovernmentPage.jsx) | Elección de doctrinas de gobierno, decretos imperiales y asignación de ministros. |
| **Comunicaciones** | [`CommunicationsPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/CommunicationsPage.jsx) | Centro de mensajes, informes de espionaje, boletines diplomáticos y alertas de ataque. |
| **Misiones Narrativas** | [`MissionsPage.jsx`](file:///e:/Proyectos%20Antigravity/Juegos/Juego%20Ascensi%C3%B3n/src/pages/MissionsPage.jsx) | Campaña narrativa con objetivos, recompensas y cadena de decisiones históricas. |

---

## 04.03 COMPONENTES REUTILIZABLES DE INTERFAZ (`src/ui.jsx`)

- **`StarField`:** Canvas/CSS interactivo de fondo animado que simula el polvo estelar en profundidad.
- **`ResourceBar` & `ResourceBadge`:** Barra fija superior que muestra Metal, Cristal, Deuterio y Energía en tiempo real con indicador de almacenamiento máximo.
- **`ProgressBar`:** Componente de barra de estado holográfico con estimación de tiempo restante ($T-\text{min}$).
- **`RedAlertOverlay` & `AttackAlert`:** Sistema visual de emergencia que parpadea en bordes de pantalla cuando hay una flota enemiga hostil acercándose al planeta.
- **`ItemCard`:** Tarjeta interactiva con imagen, coste de recursos, tiempo de producción, botón de acción y tooltip detallado de requisitos.
