# PLAN MAESTRO DE IMPLEMENTACIÓN: METAMORFOSIS ARQUITECTÓNICA DE ASCENSIÓN
## Transición de Persistencia JSON Monolítica a Motor Relacional Embebido SQLite (better-sqlite3)

---

## 1. Justificación y Objetivos Estratégicos

### El Problema de Raíz
El proyecto *Ascensión* nació con el modelo tradicional de navegador: todo el estado del universo reside en un único objeto JavaScript en memoria que se serializa y guarda en disco como un archivo plano `.json` en `%APPDATA%/Ascension/`.
- Este modelo funciona mientras las naves y recursos sean contadores numéricos agregados (`cruiser: 5, lightFighter: 500`).
- Al incorporar **identidad permanente, número de bastidor/matrícula, procedencia, biografía y trazabilidad individual** a cientos de miles de naves (incluyendo cazadores ligeros), el modelo JSON colapsa:
  - Tiempos de guardado superiores a varios segundos (pantalla congelada por IPC síncrono).
  - Consumo desmedido de memoria RAM en el motor V8 de Electron.
  - Riesgo crítico de corrupción de partidas por escrituras interrumpidas.
  - Imposibilidad de consultar o filtrar naves sin recorrer arrays gigantes en el hilo principal de render.

### El Objetivo de la Metamorfosis
Dotar a *Ascensión* de una arquitectura de almacenamiento y consulta de grado profesional (equivalente a juegos como *EVE Online*, *RimWorld* o *Stellaris*) mediante una base de datos local embebida **SQLite** gestionada de forma nativa por el proceso principal de Electron a través de `better-sqlite3`.

---

## 2. Pilares de la Nueva Arquitectura

```
+-----------------------------------------------------------------------+
|                       RENDERER PROCESS (REACT)                        |
|  - UI Pages (FleetPage, Shipyard, Galaxy, Empire)                     |
|  - Redux/Reducer (Estado ligero de UI, recursos locales y vista)      |
|  - Virtualized Lists (React Window / Virtualizer para 60 FPS)         |
+-----------------------------------------------------------------------+
                                  |
                           Electron IPC (Async)
                                  |
+-----------------------------------------------------------------------+
|                        MAIN PROCESS (ELECTRON)                        |
|  - Database Controller (better-sqlite3)                               |
|  - In-Memory Cache / Prepared Statements                              |
|  - WAL Mode (Write-Ahead Logging) para escrituras a 2ms sin pausas   |
|  - Automated Backup Manager (.bak transaccional)                     |
+-----------------------------------------------------------------------+
                                  |
                                  v
                    %APPDATA%/Ascension/universe.db
```

1. **Persistencia Híbrida Inteligente**:
   - **Parámetros Globales e Imperiales** (Investigaciones, Políticas, Logros, Diplomacia general): Se mantienen en tablas de configuración rápidas o documentos clave-valor estructurados en SQLite.
   - **Entidades Masivas Altamente Escalables** (Naves con Matrícula, Flotas, Planetas, Oficiales, Historial/Eventos): Pasan a tablas relacionales fuertemente indexadas.
2. **Escritura Asíncrona sin Bloqueo de Fotogramas**:
   - Activación de modo `PRAGMA journal_mode = WAL;` (Write-Ahead Logging). Las operaciones de combate y botadura de naves escriben en disco a velocidad de memoria C++ sin bloquear la interfaz React.
3. **Migración Transparente y Silenciosa**:
   - El jugador jamás pierde su progreso: si el juego detecta un `savegame.json` clásico de versión 3, lo migra atómicamente a `universe.db` de versión 4, creando un respaldo seguro del archivo original.

---

## 3. Esquema Relacional de Base de Datos (`universe.db`)

### A. Tabla: `game_meta`
Almacena el estado global y versión del guardado:
```sql
CREATE TABLE IF NOT EXISTS game_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
-- Ejemplo: ('version', '4'), ('player_name', 'Comandante Aritz'), ('game_tick', '15200')
```

### B. Tabla: `planets`
```sql
CREATE TABLE IF NOT EXISTS planets (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    name TEXT NOT NULL,
    galaxy INTEGER NOT NULL,
    system INTEGER NOT NULL,
    position INTEGER NOT NULL,
    biome TEXT NOT NULL,
    planet_size INTEGER NOT NULL,
    buildings_json TEXT NOT NULL,
    resources_json TEXT NOT NULL,
    demographics_json TEXT NOT NULL,
    governance_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_planets_coords ON planets(galaxy, system, position);
```

### C. Tabla: `ships` (El Núcleo de las Matrículas)
Soporta desde 10 naves hasta 2.000.000 de naves con matrícula única:
```sql
CREATE TABLE IF NOT EXISTS ships (
    id TEXT PRIMARY KEY,                   -- UUID v4 interno (shp_xxxx)
    registry_code TEXT UNIQUE NOT NULL,    -- Matrícula galáctica (ej. HUM-P01-LF-004521)
    custom_name TEXT,                      -- Bautismo opcional del jugador
    chassis_id TEXT NOT NULL,              -- lightFighter, cruiser, custom_..., etc.
    class_category TEXT NOT NULL,          -- 'swarm' (cazas/sondas) | 'capital' (cruceros+)
    origin_planet_id TEXT NOT NULL,        -- Planeta natal de construcción
    origin_tick INTEGER NOT NULL,          -- Fecha estelar de botadura
    owner_id TEXT NOT NULL,                -- Propietario legal
    controller_id TEXT NOT NULL,           -- Controlador operativo actual
    status TEXT NOT NULL,                  -- 'docked', 'in_flight', 'patrol', 'combat', 'captured'
    current_planet_id TEXT,                -- ID del planeta si está atracada
    current_fleet_id TEXT,                 -- ID de la misión/flota si está en vuelo
    hull_percent REAL DEFAULT 1.0,         -- Daño residual (0.0 - 1.0)
    veterancy_level INTEGER DEFAULT 0,     -- Nivel de experiencia
    kills_count INTEGER DEFAULT 0,         -- Bajas confirmadas
    battles_survived INTEGER DEFAULT 0,    -- Batallas superadas
    tech_generation INTEGER DEFAULT 1,     -- Nivel tecnológico aplicado
    FOREIGN KEY(origin_planet_id) REFERENCES planets(id)
);
CREATE INDEX IF NOT EXISTS idx_ships_docked ON ships(current_planet_id, status);
CREATE INDEX IF NOT EXISTS idx_ships_fleet ON ships(current_fleet_id);
CREATE INDEX IF NOT EXISTS idx_ships_owner ON ships(owner_id);
CREATE INDEX IF NOT EXISTS idx_ships_registry ON ships(registry_code);
```

### D. Tabla: `ship_logs` (Bitácora de Trazabilidad)
Historial selectivo y compacto sin inflar memoria:
```sql
CREATE TABLE IF NOT EXISTS ship_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ship_id TEXT NOT NULL,
    event_type TEXT NOT NULL,              -- 'COMMISSIONED', 'BATTLE', 'CAPTURE', 'RETROFIT', 'DECOMMISSION'
    game_tick INTEGER NOT NULL,
    location_desc TEXT NOT NULL,
    details_json TEXT,
    FOREIGN KEY(ship_id) REFERENCES ships(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_logs_ship ON ship_logs(ship_id);
```

### E. Tabla: `fleet_missions` (Misiones en Tránsito)
```sql
CREATE TABLE IF NOT EXISTS fleet_missions (
    id TEXT PRIMARY KEY,
    from_planet_id TEXT NOT NULL,
    to_galaxy INTEGER NOT NULL,
    to_system INTEGER NOT NULL,
    to_position INTEGER NOT NULL,
    mission_type TEXT NOT NULL,            -- attack, transport, colonize, patrol, etc.
    start_time INTEGER NOT NULL,
    arrival_time INTEGER NOT NULL,
    return_time INTEGER,
    resources_json TEXT,
    formation TEXT DEFAULT 'standard'
);
```

---

## 4. Fases de Ejecución Técnica

### Fase 1: Infraestructura y Dependencias en Electron
- **1.1. Integración de `better-sqlite3`**:
  - Incorporación del driver nativo SQLite en el proceso principal de Electron (`electron/database/dbManager.js`).
  - Configuración del modo `WAL` y pragmas de optimización de alto rendimiento:
    ```javascript
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('cache_size = -64000'); // 64 MB de caché en RAM para lecturas ultra rápidas
    ```
- **1.2. Módulo de Preload e IPC Seguro**:
  - Exposición en `electron/preload.cjs` de métodos asíncronos tipados:
    - `window.electronAPI.queryShips(filter)`
    - `window.electronAPI.saveShipBatch(ships)`
    - `window.electronAPI.getShipDetail(shipId)`

---

### Fase 2: El Motor de Migración Silenciosa (v3 JSON $\rightarrow$ v4 SQLite)
- **2.1. Detección en el Arranque (`electron/database/migrator.js`)**:
  - Si existe `%APPDATA%/Ascension/savegame.json` y no existe `universe.db`:
    1. Se crea copia de seguridad `savegame.json.bak`.
    2. Se leen los planetas y tecnologías.
    3. Para cada nave numérica existente en `planet.fleet` (incluidos todos los cazas y cruceros), se genera su registro inicial en la tabla `ships`:
       - Matrícula generada: `HUM-LEGACY-[CHASSIS]-[INDEX]`.
       - Planeta natal: ID del planeta donde residía.
       - Fecha: Tick 0.
    4. Se marca la migración como exitosa y se arranca el juego con normalidad.

---

### Fase 3: Adaptación del Reducer y Astilleros (Construcción con Matrícula)
- **3.1. Fabricación en Masa de Naves (`src/reducers/fleet/shipProductionActions.js`)**:
  - Al completarse una cola de naves (ej. 500 cazadores ligeros en el Astillero de Tau Ceti):
    - Se invoca una inserción por lotes en SQLite mediante una transacción única (`db.transaction` tarda < 5 milisegundos para 500 registros).
    - El generador de matrículas produce el rango secuencial `TAU-LF-001201` a `TAU-LF-001700`.
- **3.2. Reducción de la Huella en Redux**:
  - El estado de Redux en React ya no guarda un array de 50.000 naves.
  - Redux solo conserva:
    - `planet.fleetSummary = { lightFighter: 500, cruiser: 12 }` (para cálculos inmediatos de producción, costes y visualización rápida de cabeceras).
    - Los datos detallados de cascos e historiales se consultan bajo demanda.

---

### Fase 4: Adaptación del Motor de Combate (`combatEngine.js`)
- **4.1. Despliegue de Misiones con Identificadores**:
  - Al enviar una flota, la misión vincula los IDs de las naves en SQLite marcando su estado como `status = 'in_flight'`.
- **4.2. Resolución de Bajas en Batalla**:
  - Durante el combate, las bajas de naves se mapean directamente contra los IDs de la flota enviada.
  - Al finalizar la batalla:
    - Naves destruidas: Marcadas como `status = 'destroyed'` o purgadas a la tabla conmemorativa de bajas.
    - Naves supervivientes: Se actualiza en una única consulta `battles_survived = battles_survived + 1`, `kills_count = kills_count + X` y su porcentaje de casco residual.

---

### Fase 5: Interfaz de Usuario Virtualizada y Registro Naval Imperial
- **5.1. Vista de Hangar y Escuadras (`FleetInventorySection.jsx`)**:
  - Implementación de lista virtualizada (solo renderiza los elementos visibles en el scroll).
  - Selector de naves por matrícula, tipo, nivel de experiencia y planeta natal.
- **5.2. Ficha Técnica / Registro de Casco (Modal de Inspección)**:
  - Al hacer clic en cualquier nave (desde un cazador ligero hasta una Estrella de la Muerte):
    - Se abre la ventana modal con su matrícula militar, fecha estelar de ensamblaje, astillero de origen, número de bajas y condecoraciones.
    - Opción para que el jugador asigne un nombre bautismal a naves destacadas.

---

## 5. Matriz de Riesgos y Mitigaciones

| Riesgo Técnico | Impacto | Mitigación Arquitectónica |
| :--- | :--- | :--- |
| **Pérdida de partidas en la migración** | Catastrófico | Backup obligatorio `.json.bak` antes de iniciar la migración SQLite. Validación transaccional: si la migración falla, se restaura el JSON y no se altera nada. |
| **Sobrecarga de IPC entre Electron y React** | Medio | No transferir 50.000 naves por el canal IPC de una vez. Consultas paginadas (`LIMIT 50 OFFSET X`) y resúmenes numéricos en memoria viva. |
| **Tiempo de compilación de binarios C++ en Windows** | Bajo | `better-sqlite3` incluye binarios precompilados estándar para Electron en Windows (mediante `electron-rebuild`). |
| **Bloqueos de archivo de base de datos** | Bajo | Configuración estricta de `PRAGMA busy_timeout = 5000;` y modo `WAL` para permitir lecturas concurrentes sin esperas. |

---

## 6. Conclusión y Hoja de Ruta

La metamorfosis a SQLite no es solo una solución para las matrículas de los cazadores ligeros: es el paso que transforma a *Ascensión* en una plataforma de estrategia espacial con escalabilidad infinita, guardados atómicos invulnerables y soporte para mecánicas narrativas complejas que ningún juego basado en JSON plano puede permitirse.
