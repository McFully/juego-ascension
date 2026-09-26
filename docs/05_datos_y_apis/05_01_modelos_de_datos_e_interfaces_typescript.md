# MODELOS DE DATOS E INTERFACES DE DOMINIO

## 1. MODELO PRINCIPAL DE PARTIDA (`GameState`)
```typescript
interface GameState {
  version: number; // Versión actual: 3
  playerName: string;
  gameStarted: boolean;
  gameSpeed: number; // Multiplicador de velocidad de juego
  currentPlanetIndex: number;
  planets: Planet[];
  research: Record<string, number>; // TechId -> Level
  fleets: FleetMission[];
  factions: Record<string, FactionRelation>;
  government: GovernmentState;
  combatReports: CombatReport[];
  transmissions: Transmission[];
  settings: GameSettings;
}
```

## 2. MODELO DE PLANETA (`Planet`)
```typescript
interface Planet {
  id: string;
  name: string;
  coordinates: { galaxy: number; system: number; position: number };
  resources: {
    metal: number;
    crystal: number;
    deuterium: number;
    energy: number;
    maxEnergy: number;
  };
  capacity: {
    metal: number;
    crystal: number;
    deuterium: number;
  };
  temperature: { min: number; max: number };
  diameter: number;
  fields: { used: number; total: number };
  buildings: Record<string, number>;
  defenses: Record<string, number>;
  ships: Record<string, number>;
  buildingQueue: QueueItem[];
  shipyardQueue: ProductionQueueItem[];
  defenseQueue: ProductionQueueItem[];
  governor?: Governor;
}
```

## 3. MODELO DE MISIÓN DE FLOTA (`FleetMission`)
```typescript
interface FleetMission {
  id: string;
  type: 'attack' | 'transport' | 'deploy' | 'spy' | 'colonize' | 'recycle' | 'expedition';
  origin: Coordinates;
  destination: Coordinates;
  ships: Record<string, number>;
  cargo: { metal: number; crystal: number; deuterium: number };
  departureTime: number;
  arrivalTime: number;
  returnTime: number;
  isReturning: boolean;
}
```
