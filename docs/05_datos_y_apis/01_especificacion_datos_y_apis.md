# 🔌 BLOQUE 5: DATOS, APIS Y ALMACENAMIENTO

## 05.01 ESQUEMA DE DATOS Y CONTRATOS DEL ESTADO (`src/core.jsx`)

### Objeto de Estado Principal (`GameState`)

El estado global administrado por `gameReducer` mantiene la siguiente estructura atómica:

```javascript
{
  version: 3,                          // Versión del esquema de guardado
  playerName: "Comandante",           // Nombre del jugador
  gameStarted: true,                   // Flag de partida en curso
  currentPlanetIndex: 0,              // Índice del planeta activo en pantalla
  planets: [                          // Array de planetas/colonias del jugador
    {
      id: "planet-1",
      name: "Planeta Principal",
      coords: { g: 1, s: 1, p: 4 },    // Galaxia, Sistema, Posición
      biome: "terrestre",              // Bioma determinista
      temperature: { min: -10, max: 40 },
      fields: { used: 12, max: 180 },
      resources: { metal: 5000, crystal: 3000, deuterium: 1000 },
      buildings: { metalMine: 5, crystalMine: 4, solarPlant: 6 },
      ships: { lightFighter: 10, smallCargo: 5 },
      defenses: { rocketLauncher: 20 },
      buildingQueue: [],
      shipyardQueue: []
    }
  ],
  research: {                          // Niveles de investigación imperiales
    energyTech: 3,
    laserTech: 2,
    combustionDrive: 4
  },
  fleets: [],                          // Flotas en movimiento estelar
  messages: [],                        // Centro de comunicaciones
  diplomacy: {},                       // Relaciones con facciones IA
  government: { form: "republica" }    // Configuración política
}
```

---

## 05.02 PERSISTENCIA LOCAL Y PROTOCOLO IPC (`electron/main.cjs`)

### Ruta de Archivo de Guardado Local
Los datos de la partida se guardan en el sistema de archivos del usuario en formato JSON:

$$\text{Ruta Windows:} \quad \texttt{\%APPDATA\%/Ascension/ascension\_save.json}$$

### Mecanismo de Seguridad y Respaldo Automático (`.bak`)
Para prevenir corrupción por cortes de energía o cierres inesperados del ejecutable:

1. Al solicitar la acción de guardado, Electron verifica si existe `ascension_save.json`.
2. Si existe, clona el archivo original a `ascension_save.json.bak`.
3. Escribe el nuevo estado mediante un buffer de escritura atómico (`fs.promises.writeFile`).
4. Si la escritura falla, se restaura automáticamente la copia `.bak`.

---

## 05.03 VALIDACIÓN MÍNIMA DE CARGA Y COMPATIBILIDAD
Al cargar un guardado desde el menú principal, la función de validación verifica los siguientes requisitos mínimos:
- Campo `version` igual a `3` (las partidas de versión `2` se migran automáticamente al esquema nuevo).
- Propiedad `playerName` definida como string no vacío.
- Array `planets` con al menos 1 planeta válido.
- Flag `gameStarted` en `true`.
