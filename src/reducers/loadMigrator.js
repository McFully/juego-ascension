import { BIOME_KEYS, uid } from '../core.jsx';
import { migrateLegacyColonization } from '../utils/formulas.js';

const PLANET_SIZES = [80, 100, 120, 150, 180, 200];

export const migrateLoadState = (payload = {}) => {
  const defaults = {
    fleetPresets: [],
    achievements: [],
    stats: { totalBuildings: 0, totalShips: 0, totalDefenses: 0, totalResearch: 0, combatsWon: 0, combatsLost: 0, combatsDraw: 0, metalGathered: 0, crystalGathered: 0, deuteriumGathered: 0, metalSpent: 0, crystalSpent: 0, deuteriumSpent: 0, playTime: 0, coloniesFounded: 0, moonsCreated: 0, expeditionsCompleted: 0, artifactsFound: 0, deathstarsBuilt: 0, maxTechLevel: 0, retrofitsCompleted: 0 },
    research: { weapons: 0, shields: 0, armour: 0, combustion: 0, impulse: 0, hyperspace: 0, espionage: 0, computer: 0, astrophysics: 0, energyTech: 0, laserTech: 0, ionTech: 0, plasma: 0, intergalacticNetwork: 0, gravitation: 0, nanoTech: 0, terraforming: 0 },
    governmentPolicies: { socialOrder: 100, corruption: 0, liberty: 50 },
    debrisField: { metal: 0, crystal: 0 }
  };

  const migrated = {
    ...payload,
    version: 4,
    gameStarted: payload.gameStarted !== undefined ? payload.gameStarted : true,
    activeEvent: payload.activeEvent || null,
    fleetPresets: Array.isArray(payload.fleetPresets) ? payload.fleetPresets : [],
    achievements: Array.isArray(payload.achievements) ? payload.achievements : [],
    stats: { ...defaults.stats, ...(payload.stats || {}) },
    research: { ...defaults.research, ...(payload.research || {}) },
    governmentPolicies: { ...defaults.governmentPolicies, ...(payload.governmentPolicies || {}) },
    planets: (Array.isArray(payload.planets) ? payload.planets : []).map(p => ({
      ...p,
      retrofitTech: p.retrofitTech || {},
      biome: p.biome || 'temperate',
      planetSize: p.planetSize || 100,
      gravity: p.gravity !== undefined ? p.gravity : 2,
      trait: p.trait || null,
      biosphere: p.biosphere || {
        pressureAtm: p.biome === 'barren' ? 0.05 : 1.0,
        o2Level: p.biome === 'barren' || p.biome === 'toxic' ? 0.02 : 0.21,
        waterReserveDays: 120,
        caloricSupplyRatio: 1.0,
        radiationShieldActive: true,
        pollutionLevel: 5.0,
      },
      thermalGrid: p.thermalGrid || {
        heatGeneratedMW: 1200,
        heatDissipatedMW: 5000,
        atmosphericTempC: 18.0,
        blackoutRisk: 0.0,
        coolingEfficiency: 1.0,
      },
      demographics: p.demographics || {
        primaryLabor: Math.floor((p.population || 50000) * 0.50),
        technicians: Math.floor((p.population || 50000) * 0.35),
        intellectuals: Math.floor((p.population || 50000) * 0.15),
        morale: 85,
        healthIndex: 92,
        unrest: 3,
      },
      governance: p.governance || {
        governor: null,
        localMinistries: {
          infra: { budgetShare: 0.20, activeTasks: [] },
          energy: { budgetShare: 0.20, activeTasks: [] },
          economy: { budgetShare: 0.20, activeTasks: [] },
          welfare: { budgetShare: 0.20, activeTasks: [] },
          defense: { budgetShare: 0.20, activeTasks: [] },
        }
      },
      automatedExclusions: p.automatedExclusions || {},
      fleetVariants: p.fleetVariants || {},
      defenseVariants: p.defenseVariants || {},
    })),
    aiPlanets: (Array.isArray(payload.aiPlanets) ? payload.aiPlanets : []).filter(p => p && typeof p === 'object' && !p.isVirgin).map(p => {
      const strategyKey = p.strategy || ['expansionist','militarist','merchant','technocrat','diplomat','clanist','chaotic'][Math.floor(Math.random() * 7)];
      const personality = p.aiPersonality || (
        (strategyKey === 'militarist' || strategyKey === 'expansionist') ? 'bélico' :
        (strategyKey === 'merchant' || strategyKey === 'diplomat') ? 'mercantilista' : 'pacífico'
      );
      return {
        ...p,
        relation: p.relation !== undefined ? p.relation : 0,
        discovered: p.discovered !== undefined ? p.discovered : true,
        strategy: strategyKey,
        aiPersonality: personality,
        aggression: p.aggression !== undefined ? p.aggression : (0.3 + Math.random() * 0.5),
        riskTolerance: p.riskTolerance !== undefined ? p.riskTolerance : (0.3 + Math.random() * 0.5),
        lossTolerance: p.lossTolerance !== undefined ? p.lossTolerance : (0.2 + Math.random() * 0.4),
        biome: p.biome || BIOME_KEYS[Math.floor(Math.random() * BIOME_KEYS.length)],
        planetSize: p.planetSize || PLANET_SIZES[Math.floor(Math.random() * PLANET_SIZES.length)],
        gravity: p.gravity !== undefined ? p.gravity : Math.floor(Math.random() * 5),
        trait: p.trait || null,
        totalWins: p.totalWins || 0,
        totalLosses: p.totalLosses || 0,
        warsDeclared: p.warsDeclared || 0,
        warsReceived: p.warsReceived || 0,
        activePacts: Array.isArray(p.activePacts) ? p.activePacts : [],
      };
    }),
    buildQueue: Array.isArray(payload.buildQueue) ? payload.buildQueue : [],
    researchQueue: Array.isArray(payload.researchQueue) ? payload.researchQueue : [],
    shipQueue: Array.isArray(payload.shipQueue) ? payload.shipQueue : [],
    defenseQueue: Array.isArray(payload.defenseQueue) ? payload.defenseQueue : [],
    customShipQueue: Array.isArray(payload.customShipQueue) ? payload.customShipQueue : [],
    retrofitQueue: Array.isArray(payload.retrofitQueue) ? payload.retrofitQueue : [],
    shipyardQueue: Array.isArray(payload.shipyardQueue) ? payload.shipyardQueue : [],
    missileQueue: Array.isArray(payload.missileQueue) ? payload.missileQueue : [],
    fleetMissions: Array.isArray(payload.fleetMissions) ? payload.fleetMissions : [],
    combatLog: Array.isArray(payload.combatLog) ? payload.combatLog : [],
    spyReports: Array.isArray(payload.spyReports) ? payload.spyReports : [],
    events: Array.isArray(payload.events) ? payload.events : [],
    notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
    blueprints: Array.isArray(payload.blueprints) ? payload.blueprints : [],
    debrisField: { ...defaults.debrisField, ...(payload.debrisField || {}) },
    clans: Array.isArray(payload.clans) ? payload.clans : [],
    galacticEvents: Array.isArray(payload.galacticEvents) ? payload.galacticEvents : [],
    tradeRoutes: Array.isArray(payload.tradeRoutes) ? payload.tradeRoutes : [],
    leaders: Array.isArray(payload.leaders) ? payload.leaders : [],
    activeMissions: Array.isArray(payload.activeMissions) ? payload.activeMissions : [],
    completedMissions: Array.isArray(payload.completedMissions) ? payload.completedMissions : [],
    relics: Array.isArray(payload.relics) ? payload.relics : [],
    activeEvents: Array.isArray(payload.activeEvents) ? payload.activeEvents : [],
    tacticalEvents: Array.isArray(payload.tacticalEvents) ? payload.tacticalEvents : [],
    totalAICount: payload.totalAICount || (payload.aiPlanets || []).length,
    // New diplomacy and narrative fields for compatibility
    influence: payload.influence ?? 50,
    reputation: payload.reputation ?? 0,
    adventureLogs: Array.isArray(payload.adventureLogs) ? payload.adventureLogs : [],
    eventLog: Array.isArray(payload.eventLog) ? payload.eventLog : [],
    galacticCouncil: payload.galacticCouncil || { lastSessionTick: 0, currentSession: null, resolutionsPassed: [], influenceHistory: [] },
    federations: payload.federations || [],
    federalFleet: payload.federalFleet || { metal: 0, crystal: 0, deuterium: 0, ships: {} },
    diplomaticHistory: payload.diplomaticHistory || [],
    activeCrises: payload.activeCrises || [],
    ministries: payload.ministries || {
      economy: { taxRate: payload.gameMode === 'decay' ? 0.3 : 0.1, tradeSubsidies: false, treasury: payload.gameMode === 'decay' ? -50000 : 1000, gdp: 0, automationEnabled: false },
      defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false },
      science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false },
      culture: { propagandaLevel: 1, socialUnity: payload.gameMode === 'decay' ? 20 : 80, eventsActive: [], automationEnabled: false },
      infra: { maintenanceBudget: payload.gameMode === 'decay' ? 0.01 : 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false },
      intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false }
    },
  };

  // Amnistía Imperial: asegurar compatibilidad con expansiones previas
  const stateWithAmnesty = migrateLegacyColonization(migrated);

  return {
    ...stateWithAmnesty,
    notifications: [
      { id: uid(), type: 'success', message: '💾 Partida cargada con éxito (v4)', timestamp: Date.now() },
      ...(stateWithAmnesty.notifications || [])
    ]
  };
};

export default migrateLoadState;

