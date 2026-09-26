/**
 * Definición de tipos estricta para Ascensión (TypeScript Declarations).
 * Proporciona autocompletado y validación en IDE para contratos de datos nucleares.
 */

export interface Resources {
  metal: number;
  crystal: number;
  deuterium: number;
}

export interface PlanetDemographics {
  primaryLabor: number;
  technicians: number;
  intellectuals: number;
  morale: number;
  healthIndex: number;
  unrest: number;
}

export interface PlanetBiosphere {
  pressureAtm: number;
  o2Level: number;
  waterReserveDays: number;
  caloricSupplyRatio: number;
  radiationShieldActive: boolean;
  pollutionLevel: number;
  leakDetected?: boolean;
}

export interface PlanetThermalGrid {
  heatGeneratedMW: number;
  heatDissipatedMW: number;
  atmosphericTempC: number;
  blackoutRisk: number;
  coolingEfficiency: number;
}

export interface Planet {
  id: string;
  name: string;
  galaxy: number;
  system: number;
  position: number;
  isHome: boolean;
  biome: 'temperate' | 'volcanic' | 'oceanic' | 'desert' | 'frozen' | 'tundra' | 'toxic' | 'exotic' | 'barren';
  temperature: number;
  planetSize: number;
  population: number;
  resources: Resources;
  buildings: Record<string, number>;
  fleet: Record<string, number>;
  defenses: Record<string, number>;
  demographics?: PlanetDemographics;
  biosphere?: PlanetBiosphere;
  thermalGrid?: PlanetThermalGrid;
  specialization?: string;
  autoTrade?: boolean;
}

export interface FleetMission {
  id: string;
  type: 'transport' | 'attack' | 'spy' | 'colonize' | 'recycle' | 'expedition' | 'patrol';
  from: { id: string; name: string; galaxy: number; system: number; position: number };
  to: { id: string; name: string; galaxy: number; system: number; position: number };
  fleet: Record<string, number>;
  resources?: Partial<Resources>;
  departure: number;
  arrivalTime: number;
  returnTime: number;
  returning?: boolean;
}

export interface SaveGameData {
  version: 2 | 3;
  playerName: string;
  gameStarted: boolean;
  gameTick: number;
  lastTick: number;
  planets: Planet[];
  research: Record<string, number>;
  fleetMissions: FleetMission[];
  reputation?: number;
  influence?: number;
}
