export const TICK_MS = 1000;
export const STORAGE_BASE = 5000;
export const GAME_SPEED = 20;

export const ACHIEVEMENTS = [
  { id: 'first_building', name: 'Primer Paso', icon: '🏗️', desc: 'Construye tu primer edificio', check: s => s.totalBuildings >= 1 },
  { id: 'first_research', name: 'Científico', icon: '🔬', desc: 'Completa tu primera investigación', check: s => s.totalResearch >= 1 },
  { id: 'first_ship', name: 'Astillero Naval', icon: '🚀', desc: 'Construye tu primera nave', check: s => s.totalShips >= 1 },
  { id: 'first_combat', name: 'Bautismo de Fuego', icon: '⚔️', desc: 'Participa en tu primer combate', check: s => s.combatsWon + s.combatsLost + s.combatsDraw >= 1 },
  { id: 'first_colony', name: 'Expansión', icon: '🏴', desc: 'Funda tu primera colonia', check: s => s.coloniesFounded >= 1 },
  { id: 'first_moon', name: 'Luna Nueva', icon: '🌙', desc: 'Consigue tu primera luna', check: s => s.moonsCreated >= 1 },
  { id: 'resource_master', name: 'Magnate Minero', icon: '⛏️', desc: 'Reúne 1M de metal total', check: s => s.metalGathered >= 1e6 },
  { id: 'crystal_master', name: 'Cristalino', icon: '💎', desc: 'Reúne 500K de cristal total', check: s => s.crystalGathered >= 500000 },
  { id: 'fleet_commander', name: 'Comandante de Flota', icon: '🚢', desc: 'Construye 1000 naves', check: s => s.totalShips >= 1000 },
  { id: 'defense_network', name: 'Fortaleza', icon: '🛡️', desc: 'Construye 500 defensas', check: s => s.totalDefenses >= 500 },
  { id: 'builder', name: 'Arquitecto', icon: '🏛️', desc: 'Construye 100 niveles de edificios', check: s => s.totalBuildings >= 100 },
  { id: 'researcher', name: 'Erudito', icon: '📚', desc: 'Completa 30 investigaciones', check: s => s.totalResearch >= 30 },
  { id: 'warlord', name: 'Señor de la Guerra', icon: '💀', desc: 'Gana 25 combates', check: s => s.combatsWon >= 25 },
  { id: 'survivor', name: 'Superviviente', icon: '♟️', desc: 'Sobrevive a 10 derrotas', check: s => s.combatsLost >= 10 },
  { id: 'explorer', name: 'Explorador', icon: '🌌', desc: 'Completa 50 expediciones', check: s => (s.expeditionsCompleted || 0) >= 50 },
  { id: 'deathstar', name: 'Terror Cósmico', icon: '🌑', desc: 'Construye una Estrella de la Muerte', check: s => s.deathstarsBuilt >= 1 },
  { id: 'tech_advance', name: 'Avance Tecnológico', icon: '🔭', desc: 'Alcanza nivel 10 en cualquier tecnología', check: s => s.maxTechLevel >= 10 },
  { id: 'millionaire', name: 'Multimillonario', icon: '💰', desc: 'Acumula 10M de recursos totales', check: s => (s.metalGathered + s.crystalGathered + s.deuteriumGathered) >= 1e7 },
  { id: 'retrofitter', name: 'Modernizador', icon: '🔧', desc: 'Completa tu primera modernización', check: s => s.retrofitsCompleted >= 1 },
  { id: 'alien_artifact', name: 'Arqueólogo', icon: '🛸', desc: 'Encuentra un artefacto alienígena en expedición', check: s => s.artifactsFound >= 1 },
];

export const RES_NAMES = { metal: 'Metal', crystal: 'Cristal', deuterium: 'Deuterio' };
export const RES_ICONS = { metal: '⛏️', crystal: '💎', deuterium: '⚗️', energy: '⚡' };

export const NARRATIVE_EVENTS = [
  {
    id: 'first_expansion',
    title: 'Nueva Frontera',
    type: 'info',
    image: 'event_first_expansion.jpg',
    description: 'Nuestros sensores detectan una anomalía en un sector cercano que podría ser ideal para la colonización. El Alto Mando sugiere preparar naves colonizadoras.',
    triggerCondition: (s) => s.totalBuildings > 5 && (s.planets?.length || 0) === 1,
    options: [
      { text: 'Entendido, prepararemos la expedición.', impact: (s) => ({ ...s, influence: (s.influence || 0) + 5 }) }
    ]
  },
  {
    id: 'economic_boom',
    title: 'Auge Económico',
    type: 'success',
    image: 'event_economic_boom.jpg',
    description: 'Un descubrimiento en las técnicas de minería ha disparado la eficiencia en todas nuestras colonias. ¡Es un buen momento para reinvertir!',
    triggerCondition: (s) => (s.gameTick || 0) > 600 && Math.random() < 0.3,
    options: [
      { text: 'Excelente noticia.', impact: (s) => {
        const newState = { ...s };
        newState.planets = newState.planets.map(p => ({
          ...p,
          resources: {
            ...p.resources,
            metal: (p.resources.metal || 0) + 5000,
            crystal: (p.resources.crystal || 0) + 2500
          }
        }));
        return newState;
      }}
    ]
  },
  {
    id: 'pirate_raid_warning',
    title: 'Actividad Corsaria',
    type: 'warning',
    image: 'event_pirate_raid.jpg',
    description: 'Interceptores no identificados merodean las rutas de salto. Sugerimos incrementar las defensas planetarias o construir cazadores pesados.',
    triggerCondition: (s) => (s.gameTick || 0) > 1200 && !s.activeCrises?.some(c => c.id === 'pirates'),
    options: [
      { text: 'Alerta máxima en los astilleros.', impact: (s) => s }
    ]
  }
];

export const EVENTS = [
  { id: 'solar_flare', name: 'Llamarada Solar', icon: '☀️', type: 'resource', image: 'event_solar_flare.jpg', desc: '+50% energía durante este ciclo' },
  { id: 'meteor_shower', name: 'Lluvia de Meteoros', icon: '☄️', type: 'resource', image: 'event_meteor_shower.jpg', desc: '+2000 Metal y +1000 Cristal extraídos de escombros' },
  { id: 'ion_storm', name: 'Tormenta Iónica', icon: '⚡', type: 'danger', image: 'event_ion_storm.jpg', desc: 'Interferencias en comunicaciones galácticas' },
  { id: 'alien_signal', name: 'Señal Desconocida', icon: '📡', type: 'discovery', image: 'event_alien_signal.jpg', desc: '+500 Puntos de Investigación' },
  { id: 'pirate_scout', name: 'Incursión Corsaria', icon: '🏴‍☠️', type: 'danger', image: 'event_pirate_scout.jpg', desc: 'Piratas intentan asaltar almacenes exteriores' },
  { id: 'trader_convoy', name: 'Convoy Mercante', icon: '🚢', type: 'resource', image: 'event_trader_convoy.jpg', desc: 'Mercaderes ofrecen recursos a precio ventajoso' },
  { id: 'space_debris', name: 'Campo de Chatarra', icon: '🛰️', type: 'discovery', image: 'event_space_debris.jpg', desc: '+1500 Metal recuperado de restos antiguos' },
  { id: 'cosmic_radiation', name: 'Radiación Cósmica', icon: '☢️', type: 'danger', image: 'event_cosmic_radiation.jpg', desc: 'Fluctuación en la síntesis de deuterio' },
  { id: 'supernova_echo', name: 'Eco de Supernova', icon: '🌟', type: 'discovery', image: 'event_supernova_echo.jpg', desc: '+1000 Cristal sintetizado por radiación' },
  { id: 'wormhole_flux', name: 'Fluctuación de Gusano', icon: '🌀', type: 'discovery', image: 'event_wormhole_flux.jpg', desc: '+300 Deuterio cosechado del horizonte' },
];

export const PLANET_SPECIALIZATION_COSTS = {
  industrial: { metal: 10000, crystal: 10000, deuterium: 0 },
  scientific: { metal: 15000, crystal: 10000, deuterium: 5000 },
  military: { metal: 10000, crystal: 15000, deuterium: 5000 },
  commercial: { metal: 12000, crystal: 12000, deuterium: 2000 }
};

export const POPULATION_CONSUMPTION_RATES = {
  metal: 0.00002,
  crystal: 0.00001,
  deuterium: 0.000005
};

export const STORAGE_OVERFLOW_THRESHOLD = 0.75;
export const AUTO_BUILD_STORAGE_THRESHOLD = 0.85;

export const EVENT_REWARD_RANGES = {
  resource: { minMetal: 500, maxMetalVar: 3000, minCrystal: 300, maxCrystalVar: 2000 },
  trade: { minDeut: 1000, maxDeutVar: 5000 },
  hazard: { minLoss: 0.05, maxLossVar: 0.10 },
  defaultReward: { minMetal: 300, maxMetalVar: 2000, minCrystal: 200, maxCrystalVar: 1500 }
};

export { MISSIONS } from './missionsData.js';
export * from './game/factions.js';
export * from './game/entities.js';
export * from './game/customShips.js';
export * from './game/galaxyData.js';
