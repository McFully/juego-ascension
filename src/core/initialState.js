import { generatePlanetName, generateGalaxy } from "./galaxyGenerator.js";
import { buildMinistriesState, DECAY_MINISTRY_OVERRIDES } from "../data/ministryState.js";
import { initGalacticBankState } from "../utils/galacticBankCore.js";

export const createInitial = (playerName, homeFaction = 'human', mode = 'standard') => {
  const homeId = Math.random().toString(36).slice(2, 11);
  const homeName = generatePlanetName();
  const isSurvivor = mode === 'survivor';
  const isDecay = mode === 'decay';

  const homePlanet = {
    id: homeId,
    name: isSurvivor ? "Restos del Éxodo" : (homeName || 'Aether Prime'),
    galaxy: 1,
    system: 1,
    position: 1,
    temperature: isSurvivor ? -50 : 25,
    resources: isSurvivor ? { metal: 200, crystal: 50, deuterium: 10, slag: 0 } : (isDecay ? { metal: 500, crystal: 500, deuterium: 200, slag: 50 } : { metal: 800, crystal: 500, deuterium: 200, slag: 0 }),
    buildings: isDecay ? { metalMine: 25, crystalMine: 20, deutSynth: 15, solarPlant: 20, fusionReactor: 10, robotics: 10, shipyard: 8, researchLab: 10, nanite: 3, slagRecycler: 5, slagStorage: 5 } : {
      metalMine: isSurvivor ? 0 : 2,
      crystalMine: isSurvivor ? 0 : 1,
      solarPlant: isSurvivor ? 0 : 1,
      slagRecycler: isSurvivor ? 0 : 1,
      slagStorage: isSurvivor ? 0 : 1,
    },
    research: isDecay ? { energy: 12, laser: 10, ion: 8, plasma: 5, combustion: 15, impulse: 10, hyperspace: 8, espionage: 8, computer: 10, astrophysics: 10 } : {},
    fleet: isSurvivor ? { colonyShip: 0, heavyFighter: 5, largeCargo: 1 } : (isDecay ? { battleship: 50, destroyer: 20, cruiser: 100 } : {}),
    defenses: isDecay ? { rocketLauncher: 1000, lightLaser: 500, heavyLaser: 200, gaussCannon: 50, ionCannon: 20, plasmaTurret: 10, smallDome: 1, largeDome: 1 } : {},
    missiles: {},
    isHome: true,
    population: 1000,
    civilBusinesses: { lowClass: 0, midClass: 0, highClass: 0 },
    moon: null,
    retrofitTech: {},
    faction: homeFaction,
    biome: isSurvivor ? 'barren' : 'temperate',
    planetSize: 100,
    gravity: 1,
    trait: null,
    heritageId: 'precursor_ruins',
    achievements: [],
    stats: {
      totalBuildings: isSurvivor ? 0 : (isDecay ? 100 : 3),
      totalShips: 0,
      totalDefenses: 0,
      totalResearch: 0,
      combatsWon: 0,
      combatsLost: 0,
      combatsDraw: 0,
      metalGathered: 0,
      crystalGathered: 0,
      deuteriumGathered: 0,
      metalSpent: 0,
      crystalSpent: 0,
      deuteriumSpent: 0,
      playTime: 0,
      coloniesFounded: 0,
      moonsCreated: 0,
      expeditionsCompleted: 0,
      artifactsFound: 0,
      deathstarsBuilt: 0,
      maxTechLevel: 0,
      retrofitsCompleted: 0,
    },
    lastTick: Date.now(),
    gameTick: 0,
    debrisField: { metal: 0, crystal: 0 },
    activeEvent: null,
  };

  const initialPlanets = [homePlanet];

  if (isDecay) {
    for (let i = 2; i <= 5; i++) {
      initialPlanets.push({
        id: Math.random().toString(36).slice(2, 11),
        name: `Colonia Decadente ${i}`,
        galaxy: 1, system: i, position: 2,
        temperature: Math.floor(Math.random() * 100) - 50,
        resources: { metal: 0, crystal: 0, deuterium: 0 },
        buildings: { metalMine: 15, crystalMine: 15, deutSynth: 10, solarPlant: 15 },
        research: {}, fleet: {}, defenses: {}, missiles: {},
        isHome: false,
        population: 1000,
        civilBusinesses: { lowClass: 0, midClass: 0, highClass: 0 },
        moon: null,
        retrofitTech: {},
        faction: homeFaction,
        biome: 'barren', planetSize: 120, gravity: 1, trait: null, achievements: [],
        stats: { totalBuildings: 55, totalShips: 0, totalDefenses: 0, totalResearch: 0, combatsWon: 0, combatsLost: 0, combatsDraw: 0, metalGathered: 0, crystalGathered: 0, deuteriumGathered: 0, metalSpent: 0, crystalSpent: 0, deuteriumSpent: 0, playTime: 0, coloniesFounded: 0, moonsCreated: 0, expeditionsCompleted: 0, artifactsFound: 0, deathstarsBuilt: 0, maxTechLevel: 0, retrofitsCompleted: 0 },
        lastTick: Date.now(), gameTick: 0, debrisField: { metal: 0, crystal: 0 }, activeEvent: null,
      });
    }
  }

  const galaxyData = generateGalaxy(playerName, homeFaction);
  const aiPlanets = galaxyData.aiPlanets || [];

  return {
    version: 4,
    playerName: playerName || 'Comandante',
    gameStarted: true,
    reputation: isDecay ? -50 : 0,
    influence: isDecay ? 1000 : 50,
    currentPlanetId: homeId,
    planets: initialPlanets,
    aiPlanets,
    research: { ...(homePlanet.research || {}) },
    galacticCouncil: {
      lastSessionTick: 0,
      currentSession: null,
      resolutionsPassed: [],
      influenceHistory: []
    },
    federations: [],
    federalFleet: { 
      metal: 0, crystal: 0, deuterium: 0, 
      ships: {},
      contributions: {
        player: { metal: 0, crystal: 0, deuterium: 0, ships: {} }
      }
    },
    diplomaticHistory: [],
    activeCrises: [],
    chatHistory: {},
    ministries: buildMinistriesState(null, isDecay ? DECAY_MINISTRY_OVERRIDES : {}),
    researchNetwork: {
      baseSlots: 2,
      linkedPlanetIds: [homeId]
    },
    gameMode: mode,
    leaders: [],
    activeEvents: [],
    relics: [],
    galacticBank: initGalacticBankState(),
    governmentPolicies: {
      socialOrder: isDecay ? 30 : 100,
      corruption: isDecay ? 80 : 0,
      liberty: 50,
    },
    adventureLogs: [{ tick: 0, type: 'start', text: `Comandante ${playerName} asume el mando en modo ${mode.toUpperCase()}.` }],
    activeMissions: [],
    completedMissions: [],
    fleetMissions: [],
    eventLog: [],
    defenseQueue: [],
    buildQueue: [],
    researchQueue: [],
    shipQueue: [],
    shipyardQueue: [],
    missileQueue: [],
    retrofitQueue: [],
    notifications: [
      { id: Math.random().toString(36).slice(2, 11), type: 'success', message: `🚀 Bienvenido a Ascensión, ${playerName || 'Comandante'}. Tu imperio comienza en ${homePlanet.name}.`, timestamp: Date.now() }
    ],
    events: [],
    combatLog: [],
    lastSave: Date.now(),
    lastTick: Date.now(),
    gameTick: 0,
    debrisField: { metal: 0, crystal: 0 },
    activeEvent: null,
    tacticalEvents: [],
    tacticalEventLog: [],
    galacticEvents: [],
    tradeRoutes: [],
    spyReports: [],
    aiIntel: {},
    planetIntel: {},
    totalAICount: aiPlanets.length,
    fleetPresets: [],
    patrols: [],
    achievements: [],
    stats: {
      totalBuildings: isSurvivor ? 0 : (isDecay ? 100 : 3),
      totalShips: 0,
      totalDefenses: 0,
      totalResearch: 0,
      combatsWon: 0,
      combatsLost: 0,
      combatsDraw: 0,
      metalGathered: 0,
      crystalGathered: 0,
      deuteriumGathered: 0,
      metalSpent: 0,
      crystalSpent: 0,
      deuteriumSpent: 0,
      playTime: 0,
      coloniesFounded: 0,
      moonsCreated: 0,
      expeditionsCompleted: 0,
      artifactsFound: 0,
      deathstarsBuilt: 0,
      maxTechLevel: 0,
      retrofitsCompleted: 0,
    },
  };
};
