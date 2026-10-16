import { BIOME_KEYS, uid } from '../core.jsx';
import { migrateLegacyColonization } from '../utils/formulas.js';
import { buildMinistriesState, buildPlanetMinistries, DECAY_MINISTRY_OVERRIDES } from '../data/ministryState.js';
import { initGalacticLonjaState } from '../utils/galacticLonjaAutonomousCore.js';
import { initGalacticBankState, processBankLiquidation } from '../utils/galacticBankCore.js';

const PLANET_SIZES = [80, 100, 120, 150, 180, 200];

/**
 * Generador pseudoaleatorio determinista.
 *
 * Los defaults de una IA (estrategia, agresividad, bioma, tamano, gravedad) se
 * rellenaba con `Math.random()`. Consecuencia: cargar la misma partida dos
 * veces producia imperios enemigos distintos, con biomas y temperamentos
 * cambiados entre una sesion y la siguiente. No es un detalle estetico: la
 * dificultad y el mapa cambian solos.
 *
 * Aqui la semilla sale de la propia partida, asi que el mismo save produce
 * siempre las mismas IAs, y dos saves distintos producen IAs distintas.
 */
const makeRng = (seedInput) => {
  const text = String(seedInput || 'ascension');
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // mulberry32: rapido, 32 bits de estado, sin dependencias.
  let a = (h >>> 0) || 0x9e3779b9;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const sessionSeed = (payload) =>
  `${payload?._sessionId || ''}|${payload?._saveSlug || ''}|${payload?.gameMode || ''}|${payload?.createdAt || ''}`;

/**
 * 3.3 — Reconstruye el registro de comunicaciones de una partida guardada antes
 * de que existiera. Sin esto, un `activeEvent` o `activeTransmission` con
 * decisiones pendientes se perdería en silencio al cargar: el overlay ya no se
 * montará (3.4) y, si no se vuelcan al log, el jugador no volvería a verlos.
 */
const buildMigratedEventLog = (payload) => {
  const seen = new Set();
  const out = [];

  // `read` por defecto: lo que ya venía en el log se respeta; lo que se recoge
  // de la cola o de un slot sin mirar se da por NO leído (que es lo que era).
  const push = (raw, kind, defaultRead) => {
    if (!raw || typeof raw !== 'object') return;
    const id = raw.id || uid();
    if (seen.has(id)) return;
    seen.add(id);
    const options = Array.isArray(raw.options) && raw.options.length > 0 ? raw.options : null;
    out.push({
      ...raw,
      id,
      kind,
      type: raw.type || 'info',
      title: raw.title || raw.text || 'Comunicación entrante',
      subtitle: raw.subtitle || '',
      description: raw.description || '',
      read: typeof raw.read === 'boolean' ? raw.read : defaultRead,
      receivedAt: raw.receivedAt || Date.now(),
      options,
      requiresDecision: Boolean(options) || Boolean(raw.requiresDecision),
      priority: ['baja', 'media', 'alta', 'critica'].includes(raw.priority) ? raw.priority : 'media',
    });
  };

  // 1. El log ya existente manda: es el más completo y conserva su estado.
  for (const e of Array.isArray(payload.tacticalEventLog) ? payload.tacticalEventLog : []) {
    push(e, e.kind || 'tactical', false);
  }
  // 2. La cola de no leídos, si la partida los tenía.
  for (const e of Array.isArray(payload.tacticalEvents) ? payload.tacticalEvents : []) {
    push(e, 'tactical', false);
  }
  // 3. Los slots huérfanos, con su tipo real para que la bandeja los clasifique.
  push(payload.activeEvent, 'narrative', false);
  push(payload.activeFirstContact, 'firstContact', false);
  push(payload.activeTransmission, 'transmission', false);

  return out;
};

const sanitizeTrait = (trait) => {
  if (!trait || typeof trait !== 'object') return null;
  let effect = trait.effect;
  if (typeof effect === 'function') {
    try {
      effect = effect({});
    } catch (_) {
      effect = {};
    }
  }
  return {
    name: trait.name || '',
    desc: trait.desc || '',
    effect: effect && typeof effect === 'object' ? { ...effect } : {}
  };
};

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
      isExchangePlanet: !!p.isExchangePlanet,
      lonjaAutonomousState: p.isExchangePlanet ? (p.lonjaAutonomousState || initGalacticLonjaState(payload.playerFounderId || 'player', p.name)) : undefined,
      gravity: p.gravity !== undefined ? p.gravity : 2,
      trait: sanitizeTrait(p.trait),
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
      resources: {
        metal: p.resources?.metal || 0,
        crystal: p.resources?.crystal || 0,
        deuterium: p.resources?.deuterium || 0,
        slag: p.resources?.slag !== undefined ? p.resources.slag : 0,
      },
      fleet: p.fleet || {},
      defenses: p.defenses || {},
      arsenal: p.arsenal || {
        heavyMissiles: 100,
        kineticShells: 500,
        plasmaCells: 250,
      },
      buildings: {
        ...(p.buildings || {}),
        slagRecycler: (p.buildings?.slagRecycler !== undefined && p.buildings?.slagRecycler > 0) ? p.buildings.slagRecycler : 1,
        slagStorage: (p.buildings?.slagStorage !== undefined && p.buildings?.slagStorage > 0) ? p.buildings.slagStorage : 1,
      },
      automatedExclusions: p.automatedExclusions || {},
      fleetVariants: p.fleetVariants || {},
      defenseVariants: p.defenseVariants || {},
    })),
    aiPlanets: (Array.isArray(payload.aiPlanets) ? payload.aiPlanets : []).filter(p => p && typeof p === 'object' && !p.isVirgin).map(p => {
      const rng = makeRng(`${sessionSeed(payload)}|${p.id || p.name || 'ai'}`);
      const strategyKey = p.strategy || ['expansionist','militarist','merchant','technocrat','diplomat','clanist','chaotic'][Math.floor(rng() * 7)];
      const personality = p.aiPersonality || (
        (strategyKey === 'militarist' || strategyKey === 'expansionist') ? 'bélico' :
        (strategyKey === 'merchant' || strategyKey === 'diplomat') ? 'mercantilista' : 'pacífico'
      );
      return {
        ...p,
        relation: p.relation !== undefined ? p.relation : 0,
        discovered: p.discovered !== undefined ? p.discovered : false,
        strategy: strategyKey,
        aiPersonality: personality,
        aggression: p.aggression !== undefined ? p.aggression : (0.3 + rng() * 0.5),
        riskTolerance: p.riskTolerance !== undefined ? p.riskTolerance : (0.3 + rng() * 0.5),
        lossTolerance: p.lossTolerance !== undefined ? p.lossTolerance : (0.2 + rng() * 0.4),
        biome: p.biome || BIOME_KEYS[Math.floor(rng() * BIOME_KEYS.length)],
        planetSize: p.planetSize || PLANET_SIZES[Math.floor(rng() * PLANET_SIZES.length)],
        gravity: p.gravity !== undefined ? p.gravity : Math.floor(rng() * 5),
        trait: sanitizeTrait(p.trait),
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
    aiIntel: payload.aiIntel && typeof payload.aiIntel === 'object' ? payload.aiIntel : {},
    planetIntel: payload.planetIntel && typeof payload.planetIntel === 'object' ? payload.planetIntel : {},
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
    // 3.3 — Registro persistente de comunicaciones. En partidas viejas no existe,
    // así que se reconstruye: lo que había en la cola de no leídos entra tal cual,
    // y los slots huérfanos (narrativa / primer contacto / transmisión que el
    // jugador no estaba mirando cuando se guardó) se vuelcan al log para que
    // no se pierdan.
    tacticalEventLog: buildMigratedEventLog(payload),
    totalAICount: payload.totalAICount || (payload.aiPlanets || []).length,
    influence: payload.influence ?? 50,
    reputation: payload.reputation ?? 0,
    activeSenateBuffs: payload.activeSenateBuffs && typeof payload.activeSenateBuffs === 'object' ? payload.activeSenateBuffs : {},
    supplyRoutes: Array.isArray(payload.supplyRoutes) ? payload.supplyRoutes : [],
    adventureLogs: Array.isArray(payload.adventureLogs) ? payload.adventureLogs : [],
    eventLog: Array.isArray(payload.eventLog) ? payload.eventLog : [],
    galacticCouncil: payload.galacticCouncil || { lastSessionTick: 0, currentSession: null, resolutionsPassed: [], influenceHistory: [] },
    federations: payload.federations || [],
    federalFleet: payload.federalFleet || { metal: 0, crystal: 0, deuterium: 0, ships: {} },
    diplomaticHistory: payload.diplomaticHistory || [],
    foreignEmbassiesInCapital: Array.isArray(payload.foreignEmbassiesInCapital) ? payload.foreignEmbassiesInCapital : [],
    activeCrises: payload.activeCrises || [],
    // 1.6-2 — `buildMinistriesState` completa los 17 ministerios conservando lo
    // que la partida ya tenía, en vez de hardcodear 6 defaults aquí.
    ministries: buildMinistriesState(payload.ministries, payload.gameMode === 'decay' ? DECAY_MINISTRY_OVERRIDES : {}),
    // Inicialización del ecosistema financiero y Planeta Lonja
    credits: payload.credits !== undefined ? payload.credits : 10000,
    exchangeOrders: Array.isArray(payload.exchangeOrders) ? payload.exchangeOrders : [],
    spotExchange: payload.spotExchange || {
      orders: [],
      trades: [],
      candles: { metal: [], crystal: [], deuterium: [] },
      lastPrices: { metal: 1.0, crystal: 1.65, deuterium: 3.3 },
      stats: {
        metal: { high: 1.05, low: 0.95, volume: 0, change24h: 0 },
        crystal: { high: 1.70, low: 1.60, volume: 0, change24h: 0 },
        deuterium: { high: 3.40, low: 3.20, volume: 0, change24h: 0 }
      }
    },
    daoShares: payload.daoShares || 1000,
    playerDaoShares: payload.playerDaoShares || 100,
    daoDividendPool: payload.daoDividendPool !== undefined ? payload.daoDividendPool : 250000,
    exchangeProjects: payload.exchangeProjects || {},
    researchNetwork: payload.researchNetwork || {
      baseSlots: 2,
      linkedPlanetIds: payload.planets?.[0]?.id ? [payload.planets[0].id] : []
    },
    galacticBank: processBankLiquidation(initGalacticBankState(payload.galacticBank)).bankState,
    financialBalance: payload.financialBalance && typeof payload.financialBalance === 'object' ? payload.financialBalance : {
      income: { total: 0, populationTax: 0, businessTax: 0, miningTax: 0 },
      expenses: { total: 0, ministerSalaries: 0, fleetUpkeep: 0 },
      netHourly: 0,
      monetaryVelocity: 1.0,
      isBankrupt: false
    },
  };

// Amnistía Imperial: asegurar compatibilidad con expansiones previas
  const stateWithAmnesty = migrateLegacyColonization(migrated);

  // 1.7 — Cada planeta es dueño de su gabinete y sus programas.
  const stateWithMinistryScope = migrateMinistryScope(stateWithAmnesty);

  return {
    ...stateWithMinistryScope,
    notifications: [
      { id: uid(), type: 'success', message: '💾 Partida cargada con éxito (v4)', timestamp: Date.now() },
      ...(stateWithMinistryScope.notifications || [])
    ]
  };
};

/**
 * 1.7 — Los ministerios y sus programas pasan a ser estado del planeta.
 *
 * Antes `ministryUpgrades` vivía en el estado global, así que un programa
 * subido en un mundo aparecía comprado en todos los demás, y un planeta sin
 * `ministries` heredaba el gabinete mutado del último mundo jugado.
 *
 * En las partidas viejas no hay forma de saber en qué mundo se subió cada
 * programa (no se guardaba el `planetId`). Se asigna al planeta que estaba
 * activo al guardar, que es el único que el jugador puede reconocer como suyo,
 * y el resto arranca en blanco. Es la única pérdida posible de esta migración y
 * ocurre solo con partidas anteriores a este cambio.
 */
const migrateMinistryScope = (state) => {
  const legacyUpgrades = state.ministryUpgrades;
  const hasLegacyUpgrades = legacyUpgrades && Object.keys(legacyUpgrades).length > 0;
  const homePlanetId = state.currentPlanetId;

  const planets = (state.planets || []).map((p) => {
    const mergedMinistries = buildPlanetMinistries(state.gameMode);
    const ownMinistries = p.ministries && Object.keys(p.ministries).length > 0
      ? { ...mergedMinistries, ...p.ministries }
      : mergedMinistries;

    const keepsLegacyUpgrades = hasLegacyUpgrades && p.id === homePlanetId && (!p.ministryUpgrades || Object.keys(p.ministryUpgrades).length === 0);

    return {
      ...p,
      ministries: ownMinistries,
      ministryUpgrades: keepsLegacyUpgrades ? legacyUpgrades : (p.ministryUpgrades || {}),
    };
  });

  // El estado global deja de ser la fuente: el imperial ya no tiene gabinete.
  const { ministryUpgrades, ...rest } = state;

  return { ...rest, planets };
};

export default migrateLoadState;

