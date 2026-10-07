# Especificación Maestra de Implementación: Gran Enciclopedia Imperial (Wiki)
**Proyecto:** Ascension (Juego de Estrategia Espacial para Windows)  
**Objetivo:** Sustitución de la tarjeta de "Estadísticas" en la pantalla principal (`OverviewPage`) por la **Gran Enciclopedia Imperial (Wiki)** y desarrollo de una arquitectura de consulta interactiva ultra detallada, técnica, visual y escalable.  
**Modo de Runtime:** 100% Offline / Local (Electron + React + Vite). Cero llamadas externas.

---

## 1. Visión General del Sistema

La **Gran Enciclopedia Imperial (Wiki)** no es un simple visor de textos estáticos. Es una **herramienta estratégica de consulta profunda, simulación paramétrica y guía de campo** para el jugador, integrada orgánicamente en la interfaz de Ascension.

### Características Principales:
1. **Acceso Principal Prominente:**
   - Ubicada directamente en la pantalla principal del juego (`OverviewPage`), reemplazando la tarjeta de "Estadísticas" (la cual puede quedar como sub-enlace secundario si se requiere).
   - Estilizada como una tarjeta de mando naval/estratégico con icono de holocódice (`📚` o `🏛️`), insignia `ENCICLOPEDIA / GUÍA`, descripción contextual y acceso directo a pantalla completa.

2. **Buscador en Tiempo Real:**
   - Barra de búsqueda reactiva instantánea que indexa títulos, categorías, etiquetas (`tags`), descripciones y términos clave de mecánicas.
   - Historial de términos recientes y chips de sugerencias rápidas ("Escalado de Minas", "Costes de Colonización", "Fórmula AMM", "Blindajes de Cruceros").

3. **Arquitectura Paramétrica tipo Hoja de Cálculo (Tablas Excel/Matriciales):**
   - Tablas de datos técnicos con formato contable/ingeniería (`fmt`, números compactos o exactos).
   - Escalado por nivel (Nivel 1 al 20+ con progresión geométrica de costes de metal, cristal, deuterio y tiempo).
   - Ratios de rendimiento: producción por hora, consumo energético, coste por punto de ataque/defensa.

4. **Fórmulas Matemáticas Reales del Código:**
   - Bloques destacados con las fórmulas canónicas de `formulas.js` y `core.jsx` explicadas con ejemplos numéricos reales.
   - Variables dinámicas calculadas en base a la partida actual (si el jugador tiene bonificaciones de investigación o ministerios activos, la wiki muestra sus valores teóricos base y sus valores actuales modificados).

5. **Soporte Multimedia y Capturas de Pantalla:**
   - Visor de imágenes y capturas de pantalla integrado (`WikiMediaViewer`).
   - Contenedor preparado para pantallazos explicativos en alta resolución (vistas de la Lonja, interfaces de combate, diagramas de flujo de recursos).

---

## 2. Mapa Arquitectónico y Archivos

### 2.1 Archivos a Crear / Modificar

```
src/
├── data/
│   └── wikiData.js                      <-- [CREAR] Base de datos canónica de artículos, tablas y fórmulas
├── components/
│   ├── app/
│   │   └── gameNavigation.js            <-- [MODIFICAR] Registrar ruta 'wiki' (y subordinar 'stats' o moverla)
│   ├── wiki/
│   │   ├── WikiSearchHeader.jsx         <-- [CREAR] Buscador reactivo, filtros y chips temáticos
│   │   ├── WikiNavigationSidebar.jsx    <-- [CREAR] Índice temático lateral por categorías
│   │   ├── WikiArticleView.jsx          <-- [CREAR] Vista detallada del artículo seleccionado
│   │   ├── WikiParametricTable.jsx      <-- [CREAR] Tablas matriciales tipo Excel con paginación/zoom
│   │   ├── WikiFormulaCard.jsx          <-- [CREAR] Bloque de fórmulas matemáticas y ejemplos
│   │   └── WikiMediaViewer.jsx          <-- [CREAR] Contenedor de capturas de pantalla y diagramas
├── pages/
│   ├── OverviewPage.jsx                 <-- [MODIFICAR] Reemplazar tarjeta 'stats' por tarjeta 'wiki'
│   └── ImperialWikiPage.jsx             <-- [CREAR] Pantalla completa orquestadora de la Enciclopedia
└── __tests__/
    └── imperialWikiContract.test.js     <-- [CREAR] Pruebas de navegación, búsqueda y renderizado de la wiki
```

---

## 3. Especificación Detallada de Módulos

### 3.1 Modelo de Datos Canónico (`src/data/wikiData.js`)

Cada artículo de la enciclopedia debe respetar una estructura de esquema uniforme para garantizar modularidad y extensibilidad continua:

```javascript
export const WIKI_CATEGORIES = [
  { id: 'all', label: 'Todo', icon: '🌌' },
  { id: 'economy', label: 'Economía e Industrias', icon: '⛏️' },
  { id: 'fleet', label: 'Armada y Astilleros', icon: '🚀' },
  { id: 'defense', label: 'Defensa y Bastiones', icon: '🛡️' },
  { id: 'research', label: 'Ciencia y Árbol Tecnológico', icon: '🔬' },
  { id: 'market', label: 'Lonja y Mercado AMM', icon: '💼' },
  { id: 'colonies', label: 'Colonización y Biomas', icon: '🪐' },
  { id: 'diplomacy', label: 'Diplomacia y Consejo', icon: '🤝' },
  { id: 'espionage', label: 'Inteligencia y Espionaje', icon: '📡' },
  { id: 'government', label: 'Ministerios y Alto Mando', icon: '👑' },
];

export const WIKI_ENTRIES = [
  {
    id: 'metal_mine',
    category: 'economy',
    title: 'Mina de Metal',
    subtitle: 'Extracción geológica de aleaciones estructurales',
    badge: 'EDIFICIO BÁSICO',
    tags: ['metal', 'produccion', 'mineria', 'escalado', 'energia'],
    summary: 'Columna vertebral de la industria imperial. Proporciona el recurso primario necesario para infraestructuras y cascos de naves.',
    guide: `
      La Mina de Metal extrae menas profundas mediante taladros térmicos y detonaciones de pulso.
      Su producción crece geométricamente por nivel, pero incrementa exponencialmente su demanda de energía.
      Si el planeta sufre un déficit energético, la producción efectiva se reduce de forma directamente proporcional al porcentaje de cobertura energética.
    `,
    formula: {
      title: 'Fórmula de Producción Horaria Base',
      expression: 'Producción = Math.floor(30 * nivel * Math.pow(1.1, nivel)) * multGeologia * multGobierno',
      notes: 'Afectada por la especialización planetaria minera (+20%) y ministros asignados.'
    },
    parametricTable: {
      headers: ['Nivel', 'Metal Coste', 'Cristal Coste', 'Energía Req.', 'Prod/Hora', 'Retorno (Horas)'],
      rows: [
        [1, '60', '15', '11', '33/h', '2.2h'],
        [2, '90', '22', '13', '72/h', '1.5h'],
        [3, '135', '33', '16', '119/h', '1.4h'],
        [4, '202', '50', '20', '175/h', '1.4h'],
        [5, '303', '75', '24', '241/h', '1.5h'],
        [10, '2.3k', '576', '62', '778/h', '3.7h'],
        [15, '17.5k', '4.3k', '162', '2.2k/h', '9.9h'],
        [20, '133k', '33k', '420', '6.0k/h', '27.6h'],
      ]
    },
    indicators: [
      { label: 'Eficiencia Base', value: '100%', color: 'text-emerald-400' },
      { label: 'Escalado Coste', value: 'x1.5 por nivel', color: 'text-cyan-400' },
      { label: 'Escalado Prod.', value: 'x1.1 por nivel', color: 'text-amber-400' }
    ],
    media: {
      type: 'image',
      assetId: 'metalMine',
      caption: 'Esquema de perforación y silos de extracción superficial.'
    }
  },
  // ... decenas de entradas exhaustivas para cada sistema
];
```

---

### 3.2 Componente Visual de la Tarjeta en `OverviewPage.jsx`

En la pantalla principal (`src/pages/OverviewPage.jsx`):
1. Localizar la tarjeta que actualmente navega a `'stats'`.
2. Reemplazarla por la tarjeta de la **Gran Enciclopedia Imperial**:
   - **Título:** "Enciclopedia Imperial"
   - **Subtítulo:** "Codex Magnus, manuales tácticos, tablas de escalado y guías operativas"
   - **Icono / Banner:** Hololibro holográfico espacial (`📚` / `Codex`)
   - **Insignia (Badge):** `MANUAL DE MANDO`
   - **Acción:** `navigateTo('wiki')`

*(Opcional: Colocar un botón secundario discreto dentro de la barra o footer de la Enciclopedia para abrir "Estadísticas Históricas", de modo que los datos estadísticos sigan siendo accesibles para el jugador sin ocupar una tarjeta principal).*

---

### 3.3 Estructura de la Pantalla `ImperialWikiPage.jsx`

La vista de la Enciclopedia debe mantener la estética de ciencia ficción sobria de Ascension:
- **Fondo:** Negro espacial profundo `#05070f` con bordes sutiles en cian eléctrico `border-cyan-500/20`.
- **Cabecera (`WikiSearchHeader.jsx`):**
  - Buscador estilizado con input en terminal monospace, atajo `Ctrl+K` o `Esc` para limpiar.
  - Filtros horizontales por categoría con scroll suave.
  - Contador reactivo: `"Mostrando 42 de 85 artículos registrados"`.
- **Layout de Dos Columnas (Split Pane o Grid):**
  - **Columna Izquierda (Índice / 30%):** Listado de artículos agrupados por categoría con indicador de lectura, badges y selección activa con brillo cian.
  - **Columna Derecha (Visor de Artículo / 70%):**
    - Banner superior del módulo.
    - Explicación conceptual detallada.
    - Componente `<WikiFormulaCard />` con la matemática exacta.
    - Componente `<WikiParametricTable />` con la tabla tipo Excel (ordenación por columnas, números tabulares monospace).
    - Componente `<WikiMediaViewer />` preparado para capturas de pantalla, esquemas y gráficos.
    - Botón de retorno al Alto Mando o a la pantalla previa.

---

### 3.4 Componentes Específicos

#### A. `WikiParametricTable.jsx` (Hoja de Cálculo / Tabla Matricial)
- Renderizado de tablas con estilo contable:
  - Cabeceras adhesivas (`sticky top-0`) con fondo de carbón oscuro.
  - Filas alternadas (`zebra striping`) con bordes en `white/5`.
  - Celdas con tipografía `font-mono text-xs`.
  - Capacidad para resaltar la fila que coincide con el nivel actual del planeta seleccionado en la partida.

#### B. `WikiFormulaCard.jsx`
- Contenedor con borde ámbar/cian eléctrico.
- Muestra la fórmula en pseudocódigo limpio o LaTeX renderizado.
- Explicación de cada parámetro (`nivel`, `bonus`, `nanobots`, `consumo`).

#### C. `WikiMediaViewer.jsx`
- Marco con bisel metálico para imágenes y pantallazos.
- Si no existe captura física aún, muestra un placeholder interactivo con el icono del asset y su ficha técnica listo para recibir el archivo `.webp` o `.png`.

---

## 4. Plan de Ejecución Paso a Paso

1. **Paso 1: Estructurar la Base de Datos Canónica (`src/data/wikiData.js`)**
   - Crear el catálogo con las categorías fundamentales: Economía, Industria, Naves, Defensas, Tecnologías, Lonja AMM, Colonias, Ministerios y Diplomacia.
   - Incluir tablas de datos reales y fórmulas exactas de Ascension.

2. **Paso 2: Desarrollar los Componentes Modulares de la Wiki**
   - Implementar `WikiParametricTable.jsx`, `WikiFormulaCard.jsx` y `WikiSearchHeader.jsx`.
   - Implementar la pantalla orquestadora `ImperialWikiPage.jsx`.

3. **Paso 3: Registrar la Navegación y Reemplazar la Tarjeta**
   - En `src/components/app/gameNavigation.js`, registrar la pestaña `{ id: "wiki", label: "📚 Enciclopedia Imperial", quadrant: "gov" }`.
   - En `src/pages/OverviewPage.jsx`, sustituir la tarjeta de Estadísticas por la tarjeta de la Enciclopedia Imperial.
   - En `src/core.jsx` o enrutador principal, asociar la pestaña `'wiki'` a `<ImperialWikiPage />`.

4. **Paso 4: Pruebas y Validación**
   - Crear el test de contrato `src/__tests__/imperialWikiContract.test.js` para asegurar que:
     - El buscador filtra correctamente por texto y categoría.
     - Las tablas matriciales renderizan sin errores de null-safety.
     - La navegación entra y sale de la wiki limpiamente.
   - Ejecutar `npm test` para asegurar que los 531 tests sigan pasando y que el nuevo módulo sume tests en verde.
