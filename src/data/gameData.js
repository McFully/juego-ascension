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
    id: 'space_pirates',
    title: 'Piratas Espaciales',
    type: 'crisis',
    description: 'Una banda de piratas ha sido detectada merodeando nuestras rutas comerciales. Debemos reforzar nuestras defensas.',
    triggerCondition: (s) => s.totalShips > 20 && Math.random() < 0.2,
    options: [
      { text: 'Enviad patrullas.', impact: (s) => ({ ...s, reputation: (s.reputation || 0) + 2 }) },
      { text: 'Ignoradlos por ahora.', impact: (s) => ({ ...s, reputation: (s.reputation || 0) - 5 }) }
    ]
  }
];

export const FACTIONS = {
  human: {
    name: 'República Nova',
    race: 'Humanos',
    color: 'cyan',
    bgColor: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300',
    icon: '👥',
    techStyle: 'Industrial y adaptable',
    lore: 'Una facción humana democrática nacida de las cenizas de la vieja Tierra. Su adaptabilidad e ingenio científico les permite investigar un 10% más rápido.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.10, resistance: 1.0 }
  },
  cyborg: {
    name: 'Dominion Xelar',
    race: 'Cyborgs',
    color: 'purple',
    bgColor: 'bg-purple-500/10 border-purple-500/40 text-purple-300',
    icon: '🦾',
    techStyle: 'Cibernética avanzada',
    lore: 'Seres fusionados con tecnología. Buscan la perfección cibernética, otorgándoles un 10% más de ataque militar y un 10% de resistencia estructural.',
    bonuses: { attack: 1.10, defense: 1.0, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.0, research: 1.05, resistance: 1.10 }
  },
  synth: {
    name: 'Colectivo Zenith',
    race: 'IA Sintéticas',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
    icon: '🤖',
    techStyle: 'Redes neuronales cuánticas',
    lore: 'Una colmena digital autoconsciente. Optimizan la producción en un 10% y los reactores energéticos rinden un 15% más.',
    bonuses: { attack: 1.0, defense: 1.0, production: 1.10, energy: 1.15, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.0 }
  },
  draconian: {
    name: 'Imperio Draconiano',
    race: 'Draconianos',
    color: 'red',
    bgColor: 'bg-red-500/10 border-red-500/40 text-red-300',
    icon: '🐲',
    techStyle: 'Balística pesada y asalto',
    lore: 'Una raza guerrera y belicosa orientada a la conquista física. Obtienen un 15% de bonificación al ataque aéreo y terrestre.',
    bonuses: { attack: 1.15, defense: 1.10, production: 0.95, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.0, resistance: 1.10 }
  },
  helios: {
    name: 'Confederación Helios',
    race: 'Helianos',
    color: 'amber',
    bgColor: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    icon: '☀️',
    techStyle: 'Propulsión termonuclear solar',
    lore: 'Adoradores de las estrellas que dominan la energía solar. Sus motores viajan un 5% más rápido y producen un 10% más de energía solar.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.10, speed: 1.05, espionage: 1.0, research: 1.0, resistance: 1.0 }
  },
  solaris: {
    name: 'Imperio Solaris',
    race: 'Solarios',
    color: 'yellow',
    bgColor: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300',
    icon: '👑',
    techStyle: 'Reactores estelares puros',
    lore: 'Descendientes de civilizaciones de plasma. Generan un 20% más de energía pero sus sensores de espionaje sufren un 5% de penalización.',
    bonuses: { attack: 1.05, defense: 1.05, production: 1.0, energy: 1.20, speed: 1.0, espionage: 0.95, research: 1.05, resistance: 1.0 }
  },
  drakon: {
    name: 'Soberanía Drakon',
    race: 'Drakonianos Supremos',
    color: 'rose',
    bgColor: 'bg-rose-500/10 border-rose-500/40 text-rose-300',
    icon: '⚔️',
    techStyle: 'Plasma pesado y blindajes',
    lore: 'Una facción de reptiles modificados genéticamente para resistir cualquier tormenta cósmica. Su defensa estructural es 15% superior.',
    bonuses: { attack: 1.10, defense: 1.15, production: 1.0, energy: 0.95, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.10 }
  },
  vortex: {
    name: 'Cábala Vortex',
    race: 'Vacíos',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
    icon: '🌀',
    techStyle: 'Motores hiperespaciales de vacío',
    lore: 'Una misteriosa orden que habita en las fisuras hiperespaciales. Su velocidad de flota es 15% mayor y el espionaje aumenta 20%.',
    bonuses: { attack: 1.05, defense: 1.0, production: 1.0, energy: 1.0, speed: 1.15, espionage: 1.20, research: 1.0, resistance: 0.95 }
  },
  umbra: {
    name: 'Protectorado Umbra',
    race: 'Sorgs de Sombra',
    color: 'slate',
    bgColor: 'bg-slate-500/10 border-slate-500/40 text-slate-300',
    icon: '🖤',
    techStyle: 'Nanoestructuras oscuras',
    lore: 'Una sociedad que vive en la oscuridad profunda del espacio. Sus naves tienen un 15% más de resistencia y 15% de espionaje.',
    bonuses: { attack: 1.0, defense: 1.10, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.15, research: 1.0, resistance: 1.15 }
  }
};

export const BUILDINGS = {
  // ===== RECURSOS =====
  metalMine: { name: 'Mina de Metal', icon: '⛏️', cost: { m: 60, c: 15, d: 0 }, factor: 1.23157, prod: 'metal', baseProd: 30, energy: -10, cat: 'resource' },
  crystalMine: { name: 'Mina de Cristal', icon: '💎', cost: { m: 48, c: 24, d: 0 }, factor: 1.23157, prod: 'crystal', baseProd: 22, energy: -10, cat: 'resource' },
  deutSynth: { name: 'Sintetizador Deuterio', icon: '⚗️', cost: { m: 225, c: 75, d: 0 }, factor: 1.23157, prod: 'deuterium', baseProd: 15, energy: -20, cat: 'resource' },
  refinery: { name: 'Refinería Avanzada', icon: '🏭', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.8, prod: 'metal', baseProd: 500, energy: -30, cat: 'resource', req: { metalMine: 5 } },
  chemPlant: { name: 'Planta de Procesamiento', icon: '⚗️', cost: { m: 2500, c: 3000, d: 1000 }, factor: 1.8, prod: 'crystal', baseProd: 400, energy: -30, cat: 'resource', req: { crystalMine: 5 } },
  synthPlant: { name: 'Sintetizador Químico', icon: '🧪', cost: { m: 3000, c: 2000, d: 1500 }, factor: 1.8, prod: 'deuterium', baseProd: 250, energy: -40, cat: 'resource', req: { deutSynth: 5 } },
  enrichPlant: { name: 'Planta de Enriquecimiento', icon: '☢️', cost: { m: 5000, c: 4000, d: 3000 }, factor: 2, prod: 'deuterium', baseProd: 350, energy: -50, cat: 'resource', req: { deutSynth: 8, researchLab: 5 } },

  // ===== ENERGÍA =====
  solarPlant: { name: 'Planta Solar', icon: '☀️', cost: { m: 75, c: 30, d: 0 }, factor: 1.23157, energyGen: 20, cat: 'energy' },
  fusionReactor: { name: 'Reactor de Fusión', icon: '⚛️', cost: { m: 900, c: 360, d: 180 }, factor: 1.23157, energyGen: 1000, deutCons: 10, cat: 'energy', req: { solarPlant: 10 } },
  geoPlant: { name: 'Central Geotérmica', icon: '🌋', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.7, energyGen: 30, cat: 'energy', req: { fusionReactor: 5 } },
  orbitalEnergy: { name: 'Red Orbital Energética', icon: '🛰️', cost: { m: 10000, c: 8000, d: 4000 }, factor: 1.9, energyGen: 100, cat: 'energy', req: { solarPlant: 10, researchLab: 5 } },
  quantumReactor: { name: 'Reactor Cuántico', icon: '⚡', cost: { m: 50000, c: 30000, d: 20000 }, factor: 2.2, energyGen: 200, cat: 'energy', req: { fusionReactor: 5, researchLab: 8 } },

  // ===== INSTALACIONES =====
  robotFactory: { name: 'Fábrica de Robots', icon: '🤖', cost: { m: 400, c: 120, d: 200 }, factor: 2, cat: 'facility' },
  shipyard: { name: 'Astillero', icon: '🚀', cost: { m: 400, c: 200, d: 100 }, factor: 2, cat: 'facility' },
  researchLab: { name: 'Laboratorio', icon: '🔬', cost: { m: 200, c: 400, d: 200 }, factor: 2, cat: 'facility' },
  missileSilo: { name: 'Silo de Misiles', icon: '🎯', cost: { m: 20000, c: 20000, d: 1000 }, factor: 2, cat: 'facility' },
  naniteFactory: { name: 'Fábrica Nanobots', icon: '🧬', cost: { m: 1000000, c: 500000, d: 100000 }, factor: 2, cat: 'facility', req: { robotFactory: 10 } },
  commandCenter: { name: 'Centro de Mando', icon: '🎖️', cost: { m: 5000, c: 3000, d: 1000 }, factor: 2, cat: 'facility', req: { researchLab: 3 } },
  militaryAcademy: { name: 'Academia Militar', icon: '🎓', cost: { m: 8000, c: 5000, d: 2000 }, factor: 2, cat: 'facility', req: { commandCenter: 3 } },
  logiCenter: { name: 'Centro Logístico', icon: '📦', cost: { m: 10000, c: 6000, d: 3000 }, factor: 1.8, cat: 'facility', req: { shipyard: 5, robotFactory: 5 } },
  spyCenter: { name: 'Centro de Espionaje', icon: '🕵️', cost: { m: 6000, c: 8000, d: 2000 }, factor: 2, cat: 'facility', req: { researchLab: 5 } },
  advResearchCenter: { name: 'Centro Inv. Avanzada', icon: '🔬', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, cat: 'facility', req: { researchLab: 8 } },
  industrialComplex: { name: 'Complejo Industrial', icon: '🏗️', cost: { m: 25000, c: 15000, d: 8000 }, factor: 2, cat: 'facility', req: { robotFactory: 8, shipyard: 6 } },
  modularFactory: { name: 'Fábrica Modular', icon: '🧩', cost: { m: 40000, c: 25000, d: 12000 }, factor: 2, cat: 'facility', req: { industrialComplex: 5 } },
  terraformer: { name: 'Centro de Terraformación', icon: '🌍', cost: { m: 100000, c: 80000, d: 40000 }, factor: 2.2, cat: 'facility', req: { researchLab: 10, naniteFactory: 5 } },
  assemblyCenter: { name: 'Centro de Ensamblaje', icon: '🔧', cost: { m: 50000, c: 30000, d: 15000 }, factor: 2, cat: 'facility', req: { modularFactory: 3 } },
  constructionCenter: { name: 'Centro de Construcciones', icon: '🏗️', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.8, cat: 'facility', req: { robotFactory: 3 } },

  // ===== ALMACENES =====
  metalStorage: { name: 'Almacén Metal', icon: '🏗️', cost: { m: 1000, c: 0, d: 0 }, factor: 2, cat: 'storage' },
  crystalStorage: { name: 'Almacén Cristal', icon: '🏛️', cost: { m: 1000, c: 500, d: 0 }, factor: 2, cat: 'storage' },
  deutStorage: { name: 'Almacén Deuterio', icon: '🛢️', cost: { m: 1000, c: 500, d: 0 }, factor: 2, cat: 'storage' },
  vault: { name: 'Bóveda Protegida', icon: '🔒', cost: { m: 10000, c: 8000, d: 2000 }, factor: 2, cat: 'storage', req: { metalStorage: 5, crystalStorage: 5 } },
  orbitalStorage: { name: 'Almacén Orbital', icon: '🛰️', cost: { m: 30000, c: 20000, d: 10000 }, factor: 2, cat: 'storage', req: { vault: 3 } },

  // ===== ESPECIALES =====
  spacePort: { name: 'Puerto Espacial', icon: '🚀', cost: { m: 15000, c: 10000, d: 5000 }, factor: 1.8, cat: 'special', req: { shipyard: 4 } },
  diploCenter: { name: 'Centro Diplomático', icon: '🤝', cost: { m: 8000, c: 12000, d: 4000 }, factor: 2, cat: 'special', req: { researchLab: 4 } },
  galacticMarket: { name: 'Mercado Galáctico', icon: '💰', cost: { m: 20000, c: 25000, d: 10000 }, factor: 2, cat: 'special', req: { diploCenter: 3 } },
  tradeNetwork: { name: 'Red Comercio Autom.', icon: '📡', cost: { m: 50000, c: 40000, d: 20000 }, factor: 2, cat: 'special', req: { galacticMarket: 3 } },

  // ===== AVANZADOS =====
  customShipyard: { name: 'Fábrica Naves Personalizadas', icon: '🔧', cost: { m: 200000, c: 150000, d: 80000 }, factor: 2, cat: 'advanced', req: { shipyard: 10, researchLab: 10 } },
  aiCore: { name: 'Núcleo de IA', icon: '🧠', cost: { m: 100000, c: 150000, d: 50000 }, factor: 2, cat: 'advanced', req: { researchLab: 10, computer: 8 } },
  nanoCenter: { name: 'Centro de Nanotecnología', icon: '⚙️', cost: { m: 150000, c: 100000, d: 80000 }, factor: 2, cat: 'advanced', req: { naniteFactory: 5, researchLab: 10 } },
  expLab: { name: 'Laboratorio Experimental', icon: '🧪', cost: { m: 200000, c: 300000, d: 100000 }, factor: 2.2, cat: 'advanced', req: { advResearchCenter: 5, researchLab: 12 } },
  geneticLab: { name: 'Centro Ing. Genética', icon: '🧬', cost: { m: 250000, c: 200000, d: 150000 }, factor: 2.2, cat: 'advanced', req: { expLab: 3 } },
  darkMatterPlant: { name: 'Planta Materia Oscura', icon: '🪐', cost: { m: 500000, c: 400000, d: 300000 }, factor: 2.5, cat: 'advanced', req: { quantumReactor: 5, expLab: 5 } },

  // ===== CIVILES =====
  townHall: { name: 'Ayuntamiento', icon: '🏛️', cost: { m: 1000, c: 500, d: 200 }, factor: 1.5, cat: 'civil', desc: 'Ayuntamiento que impulsa el crecimiento de la población.' },
  healthCenter: { name: 'Centro de Salud', icon: '🏥', cost: { m: 800, c: 800, d: 100 }, factor: 1.5, cat: 'civil', desc: 'Centro de salud que aumenta la población máxima disponible.' },
  leisureCenter: { name: 'Centro de Ocio', icon: '🎡', cost: { m: 1500, c: 1000, d: 500 }, factor: 1.5, cat: 'civil', desc: 'Centro de ocio que aumenta la felicidad y productividad de la población.' },
};

export const RESEARCH = {
  // ===== ENERGÍA =====
  energy: { name: 'Energía', icon: '⚡', cost: { m: 0, c: 800, d: 400 }, factor: 2, cat: 'power', effect: 'Multiplica toda la energía producida (+10%/nv)', perLevel: { energy: 10 }, unit: '%' },
  advReactors: { name: 'Reactores Avanzados', icon: '☢️', cost: { m: 8000, c: 12000, d: 6000 }, factor: 2, cat: 'power', req: { energy: 5 }, effect: 'Multiplica la eficiencia del Reactor de Fusión (+15%/nv)', perLevel: { fusion: 15 }, unit: '%' },
  quantumEnergy: { name: 'Optimización Energética', icon: '💡', cost: { m: 20000, c: 30000, d: 15000 }, factor: 2, cat: 'power', req: { energy: 8, computer: 6 }, effect: 'Reduce el consumo de energía de las minas (-10%/nv)', perLevel: { energySaver: 10 }, unit: '%' },
  quantumNetworks: { name: 'Redes Cuánticas', icon: '🔗', cost: { m: 60000, c: 80000, d: 40000 }, factor: 2.2, cat: 'power', req: { quantumEnergy: 5, computer: 10 }, effect: 'Aumenta la producción global (+10%/nv)', perLevel: { globalProd: 10 }, unit: '%' },

  // ===== PROPULSIÓN =====
  combustion: { name: 'Combustión', icon: '🔥', cost: { m: 200, c: 100, d: 0 }, factor: 2, cat: 'propulsion', req: { energy: 1 }, effect: 'Velocidad naves de combustión (+10%/nv)', perLevel: { speed: 10 }, unit: '%' },
  impulse: { name: 'Impulso', icon: '💨', cost: { m: 2000, c: 4000, d: 600 }, factor: 2, cat: 'propulsion', req: { energy: 1, combustion: 1 }, effect: 'Velocidad naves de impulso (+20%/nv)', perLevel: { speed: 20 }, unit: '%' },
  hyperspace: { name: 'Hiperespacio', icon: '🌀', cost: { m: 10000, c: 20000, d: 6000 }, factor: 2, cat: 'propulsion', req: { energy: 3, impulse: 3 }, effect: 'Velocidad naves de hiperespacio (+30%/nv)', perLevel: { speed: 30 }, unit: '%' },
  quantumDrive: { name: 'Propulsión Cuántica', icon: '💫', cost: { m: 50000, c: 60000, d: 30000 }, factor: 2.2, cat: 'propulsion', req: { hyperspace: 7, quantumEnergy: 3 }, effect: 'Multiplica la velocidad global de flotas (+25%/nv)', perLevel: { fleetSpeed: 25 }, unit: '%' },
  interstellarNav: { name: 'Navegación Interestelar', icon: '🧭', cost: { m: 80000, c: 100000, d: 50000 }, factor: 2.2, cat: 'propulsion', req: { hyperspace: 5, astrophysics: 5 }, effect: 'Reduce el consumo de combustible de naves (-10%/nv)', perLevel: { fuelSaver: 10 }, unit: '%' },

  // ===== ARMAMENTO =====
  laser: { name: 'Láser', icon: '🔴', cost: { m: 200, c: 100, d: 0 }, factor: 2, cat: 'weapon', req: { energy: 3 }, effect: 'Ataque de armas láser (+10%/nv)', perLevel: { laserAtk: 10 }, unit: '%' },
  ion: { name: 'Iones', icon: '🔵', cost: { m: 5000, c: 4000, d: 2000 }, factor: 2, cat: 'weapon', req: { energy: 4, laser: 4 }, effect: 'Destrucción de escudos enemigos (+12%/nv)', perLevel: { ionAtk: 12 }, unit: '%' },
  plasma: { name: 'Plasma', icon: '🟣', cost: { m: 2000, c: 4000, d: 1000 }, factor: 2.5, cat: 'weapon', req: { energy: 5, laser: 5, ion: 4 }, effect: 'Multiplica producción de Metal/Cristal/Deuterio (+10%/nv)', perLevel: { metal: 10, crystal: 10, deuterium: 10 }, unit: '%' },
  ballisticWeapons: { name: 'Armamento Balístico', icon: '🎯', cost: { m: 8000, c: 4000, d: 2000 }, factor: 2, cat: 'weapon', req: { weapons: 4, laser: 3 }, effect: 'Ataque de canti-naves balístico (+15%/nv)', perLevel: { ballisticAtk: 15 }, unit: '%' },
  advMissiles: { name: 'Misiles Avanzados', icon: '🚀', cost: { m: 15000, c: 10000, d: 5000 }, factor: 2, cat: 'weapon', req: { ballisticWeapons: 3 }, effect: 'Daño de misiles y fuego rápido (+20%/nv)', perLevel: { missileAtk: 20 }, unit: '%' },
  orbitalArtillery: { name: 'Artillería Orbital', icon: '💥', cost: { m: 40000, c: 30000, d: 15000 }, factor: 2, cat: 'weapon', req: { plasma: 5, hyperspace: 4 }, effect: 'Multiplica ataque orbital (+25%/nv)', perLevel: { orbitalAtk: 25 }, unit: '%' },

  // ===== DEFENSA =====
  armour: { name: 'Blindaje', icon: '🛡️', cost: { m: 0, c: 400, d: 200 }, factor: 2, cat: 'defense', req: { energy: 1 }, effect: 'Multiplica estructura de naves/defensas (+10%/nv)', perLevel: { hull: 10 }, unit: '%' },
  weapons: { name: 'Armas', icon: '⚔️', cost: { m: 800, c: 200, d: 0 }, factor: 2, cat: 'defense', req: { energy: 3 }, effect: 'Multiplica ataque global de naves/defensas (+10%/nv)', perLevel: { atk: 10 }, unit: '%' },
  shields: { name: 'Escudos', icon: '🔰', cost: { m: 200, c: 600, d: 0 }, factor: 2, cat: 'defense', req: { energy: 3 }, effect: 'Multiplica potencia de escudos (+10%/nv)', perLevel: { shd: 10 }, unit: '%' },
  nanoRepair: { name: 'Nano-reparación', icon: '🛠️', cost: { m: 20000, c: 15000, d: 8000 }, factor: 2, cat: 'defense', req: { shields: 5, naniteFactory: 3 }, effect: 'Recuperación de defensas tras batalla (+10%/nv)', perLevel: { repair: 10 }, unit: '%' },
  defenseFields: { name: 'Campos Defensivos', icon: '🔰', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'defense', req: { shields: 7, energy: 6 }, effect: 'Resistencia planetaria a bombarderos (+15%/nv)', perLevel: { defenseRes: 15 }, unit: '%' },
  fortressTech: { name: 'Fortaleza Planetaria', icon: '🏰', cost: { m: 100000, c: 80000, d: 50000 }, factor: 2.2, cat: 'defense', req: { defenseFields: 3, armour: 7 }, effect: 'Blindaje y escudos planetarios (+20%/nv)', perLevel: { fortressPower: 20 }, unit: '%' },

  // ===== UTILIDAD =====
  espionage: { name: 'Espionaje', icon: '👁️', cost: { m: 200, c: 1000, d: 200 }, factor: 2, cat: 'utility', req: { energy: 3 }, effect: 'Profundidad de escaneo e información (+10%/nv)', perLevel: { espLevel: 10 }, unit: '%' },
  computer: { name: 'Computación', icon: '💻', cost: { m: 400, c: 800, d: 200 }, factor: 2, cat: 'utility', req: { energy: 3 }, effect: 'Velocidad de procesamiento de colas (+10%/nv)', perLevel: { compSpeed: 10 }, unit: '%' },
  astrophysics: { name: 'Astrofísica', icon: '🌌', cost: { m: 4000, c: 8000, d: 4000 }, factor: 2, cat: 'utility', req: { espionage: 4, impulse: 3, energy: 4 }, effect: 'Desbloquea nuevas colonias y expediciones', perLevel: { colonyBonus: 1 } },
  aiTactics: { name: 'IA Táctica', icon: '🤖', cost: { m: 10000, c: 15000, d: 5000 }, factor: 2, cat: 'utility', req: { computer: 5 }, effect: 'Precisión en simulación de batalla (+15%/nv)', perLevel: { tacticalAcc: 15 }, unit: '%' },
  advSensors: { name: 'Sensores Avanzados', icon: '📡', cost: { m: 12000, c: 18000, d: 6000 }, factor: 2, cat: 'utility', req: { espionage: 5, computer: 4 }, effect: 'Alcance del sensor phalax (+15%/nv)', perLevel: { sensorRange: 15 }, unit: '%' },
  galacticCrypto: { name: 'Criptografía Galáctica', icon: '🔐', cost: { m: 25000, c: 30000, d: 15000 }, factor: 2, cat: 'utility', req: { computer: 8, espionage: 6 }, effect: 'Protección contra sondas enemigas (+15%/nv)', perLevel: { cryptoProt: 15 }, unit: '%' },

  // ===== ECONOMÍA =====
  miningAuto: { name: 'Automatización Minera', icon: '⚙️', cost: { m: 5000, c: 4000, d: 2000 }, factor: 2, cat: 'economy', req: { computer: 3, energy: 4 }, effect: 'Multiplica extracción de Metal y Cristal (+10%/nv)', perLevel: { mineBoost: 10 }, unit: '%' },
  industrialOpt: { name: 'Optimización Industrial', icon: '📈', cost: { m: 10000, c: 8000, d: 4000 }, factor: 2, cat: 'economy', req: { miningAuto: 3, robotFactory: 5 }, effect: 'Acelera velocidad de construcción de edificios (+10%/nv)', perLevel: { buildSpeed: 10 }, unit: '%' },
  galacticTrade: { name: 'Comercio Galáctico', icon: '💰', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, cat: 'economy', req: { industrialOpt: 3, computer: 6 }, effect: 'Mejora tipos de cambio en mercado galáctico (+10%/nv)', perLevel: { tradeRate: 10 }, unit: '%' },
  advLogistics: { name: 'Logística Avanzada', icon: '📦', cost: { m: 30000, c: 25000, d: 15000 }, factor: 2, cat: 'economy', req: { galacticTrade: 3, hyperspace: 4 }, effect: 'Capacidad de carga de naves (+10%/nv)', perLevel: { cargoCap: 10 }, unit: '%' },

  // ===== IA =====
  aiProd: { name: 'IA de Producción', icon: '🏭', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, cat: 'ai', req: { computer: 6, miningAuto: 3 }, effect: 'Multiplica producción planetaria global (+10%/nv)', perLevel: { aiProdBoost: 10 }, unit: '%' },
  aiMilitary: { name: 'IA Militar', icon: '⚔️', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'ai', req: { computer: 7, aiTactics: 3 }, effect: 'Acelera fabricación de naves y defensas (+15%/nv)', perLevel: { shipProdSpeed: 15 }, unit: '%' },
  aiStrategy: { name: 'IA Estratégica', icon: '🧠', cost: { m: 60000, c: 80000, d: 30000 }, factor: 2, cat: 'ai', req: { aiMilitary: 3, aiProd: 3 }, effect: 'IA Estratégica: −25% coste de investigación por nivel (multiplicativo). Se acumula con Centro de Construcciones', perLevel: { techCostRed: 10 }, unit: '%' },
  fullAuto: { name: 'Automatización Total', icon: '🤖', cost: { m: 150000, c: 200000, d: 100000 }, factor: 2.2, cat: 'ai', req: { aiStrategy: 5, computer: 10 }, effect: 'Multiplicador maestro de economía y flota (+20%/nv)', perLevel: { masterBoost: 20 }, unit: '%' },

  // ===== INGENIERÍA AVANZADA =====
  nanoTech: { name: 'Nanotecnología', icon: '⚛️', cost: { m: 50000, c: 40000, d: 20000 }, factor: 2, cat: 'engineering', req: { computer: 7, shields: 5 }, effect: 'Acelera todas las colas de producción (+15%/nv)', perLevel: { queueSpeed: 15 }, unit: '%' },
  modularEng: { name: 'Ingeniería Modular', icon: '🧩', cost: { m: 40000, c: 50000, d: 25000 }, factor: 2, cat: 'engineering', req: { industrialOpt: 5 }, effect: 'Eficiencia de instalaciones avanzadas (+10%/nv)', perLevel: { modularEff: 10 }, unit: '%' },
  expDesign: { name: 'Diseño Experimental', icon: '💡', cost: { m: 80000, c: 100000, d: 40000 }, factor: 2.2, cat: 'engineering', req: { nanoTech: 3, modularEng: 3 }, effect: 'Stats de naves personalizadas (+15%/nv)', perLevel: { customShipBoost: 15 }, unit: '%' },
  cyberIntegration: { name: 'Integración Cibernética', icon: '🔗', cost: { m: 120000, c: 150000, d: 80000 }, factor: 2.2, cat: 'engineering', req: { expDesign: 3, aiStrategy: 3 }, effect: 'Eficiencia energética y de recursos (+20%/nv)', perLevel: { cyberBoost: 20 }, unit: '%' },

  // ===== EXPLORACIÓN =====
  deepScanner: { name: 'Escáner Profundo', icon: '🔍', cost: { m: 15000, c: 20000, d: 8000 }, factor: 2, cat: 'exploration', req: { espionage: 5, astrophysics: 3 }, effect: 'Descubrimiento de anomalías en expedición (+15%/nv)', perLevel: { anomalyRate: 15 }, unit: '%' },
  advColonization: { name: 'Colonización Avanzada', icon: '🏴', cost: { m: 25000, c: 30000, d: 15000 }, factor: 2, cat: 'exploration', req: { astrophysics: 5, impulse: 5 }, effect: 'Campos iniciales al colonizar (+2/nv)', perLevel: { extraFields: 2 } },
  galacticCartography: { name: 'Cartografía Galáctica', icon: '🗺️', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'exploration', req: { deepScanner: 3, computer: 6 }, effect: 'Velocidad de vuelo de expedición (+15%/nv)', perLevel: { expSpeed: 15 }, unit: '%' },
  dimensionalExploration: { name: 'Exploración Dimensional', icon: '🌀', cost: { m: 100000, c: 150000, d: 80000 }, factor: 2.5, cat: 'exploration', req: { galacticCartography: 5, quantumDrive: 3 }, effect: 'Botín de expediciones e investigación (+25%/nv)', perLevel: { expLoot: 25 }, unit: '%' },
  singularity: { name: 'Proyecto Singularidad', icon: '🌌', cost: { m: 1e7, c: 8e6, d: 4e6 }, factor: 3, cat: 'exploration', req: { dimensionalExploration: 5, quantumNetworks: 5 }, effect: 'Proyecto final para la victoria de investigación.' },
};

export const SHIPS = {
  smallCargo: { name: 'Carguera Pequeña', icon: '📦', cost: { m: 2000, c: 2000, d: 0 }, speed: 5000, cargo: 5000, fuel: 20, drive: 'combustion', atk: 5, shd: 10, hull: 400, rapid: { espionageProbe: 5 }, cat: 'civil' },
  largeCargo: { name: 'Carguera Grande', icon: '🚚', cost: { m: 6000, c: 6000, d: 0 }, speed: 7500, cargo: 25000, fuel: 50, drive: 'combustion', atk: 5, shd: 25, hull: 1200, cat: 'civil' },
  lightFighter: { name: 'Cazador Ligero', icon: '✈️', cost: { m: 3000, c: 1000, d: 0 }, speed: 12500, cargo: 50, fuel: 20, drive: 'combustion', atk: 50, shd: 10, hull: 400, rapid: { espionageProbe: 5 }, cat: 'military' },
  heavyFighter: { name: 'Cazador Pesado', icon: '🛩️', cost: { m: 6000, c: 4000, d: 0 }, speed: 10000, cargo: 100, fuel: 75, drive: 'impulse', atk: 150, shd: 25, hull: 1000, rapid: { smallCargo: 3, espionageProbe: 5 }, cat: 'military' },
  cruiser: { name: 'Crucero', icon: '🚢', cost: { m: 20000, c: 7000, d: 2000 }, speed: 15000, cargo: 800, fuel: 300, drive: 'impulse', atk: 400, shd: 50, hull: 2700, rapid: { lightFighter: 6, espionageProbe: 5, rocketLauncher: 10 }, cat: 'military' },
  battleship: { name: 'Nave de Batalla', icon: '⚓', cost: { m: 45000, c: 15000, d: 0 }, speed: 10000, cargo: 1500, fuel: 500, drive: 'hyperspace', atk: 1000, shd: 200, hull: 6000, rapid: { cruiser: 3, heavyFighter: 4, largeCargo: 5 }, cat: 'military' },
  bomber: { name: 'Bombardero', icon: '💣', cost: { m: 50000, c: 25000, d: 15000 }, speed: 4000, cargo: 500, fuel: 700, drive: 'impulse', atk: 1000, shd: 500, hull: 7500, rapid: { rocketLauncher: 20, lightLaser: 20, heavyLaser: 10, gaussCannon: 5, ionCannon: 5 }, cat: 'military', req: { impulse: 6, plasma: 1 } },
  destroyer: { name: 'Destructor', icon: '💥', cost: { m: 60000, c: 50000, d: 15000 }, speed: 5000, cargo: 2000, fuel: 1000, drive: 'hyperspace', atk: 2000, shd: 500, hull: 11000, rapid: { lightFighter: 10, battleship: 2, cruiser: 3, lightLaser: 10 }, cat: 'military', req: { hyperspace: 5 } },
  deathstar: { name: 'Estrella de la Muerte', icon: '🌑', cost: { m: 5e6, c: 4e6, d: 1e6 }, speed: 100, cargo: 1e6, fuel: 1, drive: 'hyperspace', atk: 200000, shd: 50000, hull: 900000, rapid: { smallCargo: 250, largeCargo: 250, lightFighter: 200, heavyFighter: 100, cruiser: 33, battleship: 30, bomber: 25, destroyer: 10, espionageProbe: 1250, rocketLauncher: 100, lightLaser: 100, heavyLaser: 50, gaussCannon: 15, ionCannon: 30 }, cat: 'military', req: { hyperspace: 7, plasma: 7 } },
  planetDestroyer: { name: 'Planeta Destructor', icon: '🪐', cost: { m: 2e7, c: 1.5e7, d: 5e6 }, speed: 50, cargo: 2e6, fuel: 1, drive: 'hyperspace', atk: 500000, shd: 100000, hull: 2500000, rapid: { deathstar: 2, destroyer: 20, battleship: 50 }, cat: 'military', req: { hyperspace: 9, plasma: 9 } },
  espionageProbe: { name: 'Sonda', icon: '📡', cost: { m: 0, c: 1000, d: 0 }, speed: 1e8, cargo: 5, fuel: 1, drive: 'combustion', atk: 0, shd: 0, hull: 1, cat: 'civil', req: { combustion: 2, espionage: 2 } },
  colonizer: { name: 'Colonizador', icon: '🏴', cost: { m: 10000, c: 20000, d: 10000 }, speed: 2500, cargo: 7500, fuel: 1000, drive: 'impulse', atk: 50, shd: 100, hull: 30000, cat: 'civil', req: { impulse: 4, astrophysics: 1 } },
  recycler: { name: 'Reciclador', icon: '♻️', cost: { m: 10000, c: 6000, d: 2000 }, speed: 2000, cargo: 20000, fuel: 300, drive: 'combustion', atk: 1, shd: 1, hull: 16000, cat: 'civil', req: { combustion: 4 } },
  interplanetaryMissile: { name: 'Misil Interplanetario', icon: '☄️', cost: { m: 12000, c: 2500, d: 0 }, speed: 0, cargo: 0, fuel: 0, drive: 'combustion', atk: 12000, shd: 0, hull: 1, cat: 'ammo' },
  antiBallisticMissile: { name: 'Misil Antibalístico', icon: '🛡️', cost: { m: 8000, c: 0, d: 0 }, speed: 0, cargo: 0, fuel: 0, drive: 'combustion', atk: 1, shd: 0, hull: 1, cat: 'ammo' },
};

export const DEFENSES = {
  rocketLauncher: { name: 'Lanzamisiles', icon: '🚀', cost: { m: 2000, c: 0, d: 0 }, atk: 80, shd: 20, hull: 200 },
  lightLaser: { name: 'Láser Ligero', icon: '🔴', cost: { m: 1500, c: 500, d: 0 }, atk: 100, shd: 25, hull: 200, req: { laser: 3 } },
  heavyLaser: { name: 'Láser Pesado', icon: '🔴', cost: { m: 6000, c: 2000, d: 0 }, atk: 250, shd: 100, hull: 800, req: { laser: 6, energy: 3 } },
  gaussCannon: { name: 'Cañón Gauss', icon: '🎯', cost: { m: 20000, c: 15000, d: 2000 }, atk: 1100, shd: 200, hull: 3500, req: { energy: 6, weapons: 3, shields: 1 } },
  ionCannon: { name: 'Cañón de Iones', icon: '🔵', cost: { m: 5000, c: 3000, d: 0 }, atk: 150, shd: 500, hull: 800, req: { ion: 4 } },
  plasmaTurret: { name: 'Cañón de Plasma', icon: '🟣', cost: { m: 50000, c: 50000, d: 30000 }, atk: 3000, shd: 300, hull: 10000, rapid: { smallCargo: 250, largeCargo: 250, lightFighter: 200, heavyFighter: 100, cruiser: 50 }, req: { plasma: 7 } },
  smallShieldDome: { name: 'Cúpula Pequeña', icon: '🛡️', cost: { m: 10000, c: 10000, d: 0 }, atk: 1, shd: 2000, hull: 2000, max: 1, req: { shields: 2 } },
  largeShieldDome: { name: 'Cúpula Grande', icon: '🛡️', cost: { m: 50000, c: 50000, d: 0 }, atk: 1, shd: 10000, hull: 10000, max: 1, req: { shields: 6 } },
};

export const SHIP_CHASSIS = {
  scout: { name: 'Explorador Ligero', icon: '🛸', hull: 200, cargo: 100, speed: 15000, slots: 2, cost: { m: 5000, c: 3000, d: 1000 }, req: { shipyard: 4 } },
  fighter: { name: 'Cazador', icon: '✈️', hull: 600, cargo: 50, speed: 12000, slots: 3, cost: { m: 8000, c: 4000, d: 2000 }, req: { shipyard: 5 } },
  corvette: { name: 'Corbeta', icon: '🚀', hull: 1500, cargo: 300, speed: 10000, slots: 4, cost: { m: 15000, c: 10000, d: 4000 }, req: { shipyard: 6 } },
  frigate: { name: 'Fragata', icon: '⛵', hull: 3000, cargo: 800, speed: 8000, slots: 5, cost: { m: 30000, c: 20000, d: 8000 }, req: { shipyard: 7 } },
  cruiserH: { name: 'Crucero Pesado', icon: '🚢', hull: 6000, cargo: 1200, speed: 7000, slots: 6, cost: { m: 60000, c: 40000, d: 15000 }, req: { shipyard: 8 } },
  battleshipH: { name: 'Acorazado', icon: '⚓', hull: 12000, cargo: 2000, speed: 5000, slots: 8, cost: { m: 100000, c: 80000, d: 30000 }, req: { shipyard: 10 } },
  carrier: { name: 'Portanaves', icon: '🛩️', hull: 20000, cargo: 5000, speed: 3000, slots: 10, cost: { m: 200000, c: 150000, d: 50000 }, req: { shipyard: 12, customShipyard: 1 } },
  titan: { name: 'Titán', icon: '🏛️', hull: 50000, cargo: 10000, speed: 1500, slots: 12, cost: { m: 500000, c: 400000, d: 200000 }, req: { shipyard: 15, customShipyard: 3 } },
};

export const SHIP_WEAPONS = {
  lightLaser: { name: 'Láser Ligero', icon: '🔴', atk: 50, energy: 5, slots: 1, cost: { m: 2000, c: 1000, d: 0 }, req: { laser: 2 } },
  heavyLaser: { name: 'Láser Pesado', icon: '🔴', atk: 150, energy: 15, slots: 1, cost: { m: 5000, c: 3000, d: 0 }, req: { laser: 4 } },
  ionCannonS: { name: 'Cañón Iónico', icon: '🔵', atk: 300, energy: 25, slots: 2, cost: { m: 10000, c: 8000, d: 2000 }, req: { ion: 3 } },
  plasmaCannon: { name: 'Cañón de Plasma', icon: '🟣', atk: 600, energy: 40, slots: 2, cost: { m: 20000, c: 15000, d: 5000 }, req: { plasma: 3 } },
  gaussCannonS: { name: 'Cañón Gauss', icon: '🎯', atk: 400, energy: 30, slots: 2, cost: { m: 15000, c: 10000, d: 3000 }, req: { ballisticWeapons: 2 } },
  missileRack: { name: 'Lanzamisiles', icon: '🚀', atk: 500, energy: 20, slots: 2, cost: { m: 12000, c: 5000, d: 4000 }, req: { advMissiles: 2 } },
  railgun: { name: 'Cañón Electromagnético', icon: '⚡', atk: 800, energy: 50, slots: 3, cost: { m: 30000, c: 20000, d: 10000 }, req: { ballisticWeapons: 4, ion: 4 } },
  plasmaBeam: { name: 'Rayo de Plasma', icon: '💥', atk: 1200, energy: 70, slots: 3, cost: { m: 50000, c: 40000, d: 20000 }, req: { plasma: 5, orbitalArtillery: 2 } },
};

export const SHIP_ENGINES = {
  basicCombustion: { name: 'Combustión Básica', icon: '🔥', speed: 5000, energy: 2, slots: 1, cost: { m: 2000, c: 1000, d: 500 }, req: { combustion: 2 } },
  advCombustion: { name: 'Combustión Avanzada', icon: '🔥', speed: 8000, energy: 4, slots: 1, cost: { m: 5000, c: 3000, d: 1500 }, req: { combustion: 4 } },
  basicImpulse: { name: 'Impulso Básico', icon: '💨', speed: 12000, energy: 8, slots: 2, cost: { m: 10000, c: 8000, d: 3000 }, req: { impulse: 3 } },
  advImpulse: { name: 'Impulso Avanzado', icon: '💨', speed: 18000, energy: 12, slots: 2, cost: { m: 20000, c: 15000, d: 6000 }, req: { impulse: 5 } },
  hyperDrive: { name: 'Hipermotor', icon: '🌀', speed: 25000, energy: 20, slots: 3, cost: { m: 40000, c: 30000, d: 15000 }, req: { hyperspace: 4 } },
  quantumEngine: { name: 'Motor Cuántico', icon: '💫', speed: 40000, energy: 30, slots: 3, cost: { m: 80000, c: 60000, d: 30000 }, req: { quantumDrive: 3 } },
};

export const SHIP_SHIELDS = {
  basicShield: { name: 'Escudo Básico', icon: '🛡️', shd: 50, energy: 5, slots: 1, cost: { m: 3000, c: 2000, d: 500 }, req: { shields: 2 } },
  advShield: { name: 'Escudo Avanzado', icon: '🛡️', shd: 150, energy: 10, slots: 1, cost: { m: 8000, c: 5000, d: 2000 }, req: { shields: 4 } },
  megaShield: { name: 'Megasescudo', icon: '🔰', shd: 400, energy: 20, slots: 2, cost: { m: 20000, c: 15000, d: 5000 }, req: { shields: 6 } },
  quantumShield: { name: 'Escudo Cuántico', icon: '✨', shd: 800, energy: 35, slots: 2, cost: { m: 50000, c: 40000, d: 20000 }, req: { shields: 8, quantumEnergy: 3 } },
};

export const SHIP_MODULES = {
  extraCargo: { name: 'Bodega Extra', icon: '📦', bonus: { cargo: 2000 }, slots: 1, cost: { m: 5000, c: 3000, d: 1000 }, req: { modularEng: 1 } },
  armorPlating: { name: 'Placas Blindaje', icon: '🛡️', bonus: { hull: 1000 }, slots: 1, cost: { m: 8000, c: 4000, d: 2000 }, req: { armour: 4 } },
  speedBoost: { name: 'Acelerador', icon: '⚡', bonus: { speed: 2000 }, slots: 1, cost: { m: 6000, c: 5000, d: 3000 }, req: { impulse: 3 } },
  nanoRepair: { name: 'Nanoreparador', icon: '🔧', bonus: { repair: 0.1 }, slots: 1, cost: { m: 15000, c: 10000, d: 5000 }, req: { nanoTech: 2 } },
  stealthSys: { name: 'Sistema Sigilo', icon: '👻', bonus: { stealth: 1 }, slots: 2, cost: { m: 20000, c: 25000, d: 10000 }, req: { espionage: 6, nanoTech: 2 } },
  aiAssist: { name: 'Asistente IA', icon: '🤖', bonus: { atk: 100, shd: 50 }, slots: 2, cost: { m: 25000, c: 20000, d: 15000 }, req: { aiMilitary: 2 } },
  energyCore: { name: 'Núcleo Energético', icon: '⚛️', bonus: { energy: 20 }, slots: 2, cost: { m: 30000, c: 25000, d: 15000 }, req: { advReactors: 3 } },
  quantumCore: { name: 'Núcleo Cuántico', icon: '💎', bonus: { atk: 200, shd: 100, speed: 3000 }, slots: 3, cost: { m: 80000, c: 60000, d: 40000 }, req: { quantumNetworks: 3, expDesign: 3 } },
  ionDeflector: { name: 'Escudo Ionizante', icon: '🌀', bonus: {}, slots: 1, cost: { m: 15000, c: 20000, d: 10000 }, req: { shields: 6 } },
  stealthModule: { name: 'Sigilo Avanzado', icon: '🕵️', bonus: { stealth: 2, speed: -400 }, slots: 2, cost: { m: 22000, c: 28000, d: 10000 }, req: { espionage: 5, nanoTech: 3 } },
  tradeModule: { name: 'Módulo Comercial', icon: '💰', bonus: { cargo: 2500, speed: -200 }, slots: 1, cost: { m: 8000, c: 12000, d: 4000 }, req: { modularEng: 3 } },
  plasmaInjector: { name: 'Inyector Plasma', icon: '⚡', bonus: {}, slots: 1, cost: { m: 25000, c: 15000, d: 15000 }, req: { impulse: 5 } },
  gaussBattery: { name: 'Batería Gauss', icon: '💥', bonus: {}, slots: 2, cost: { m: 30000, c: 10000, d: 5000 }, req: { weapons: 7 } },
};

export const MISSILES = {
  interplanetaryMissile: { name: 'Misil Interplanetario', icon: '☄️', cost: { m: 12000, c: 2500, d: 0 }, atk: 12000, tech: 'weapons' },
  antiBallisticMissile: { name: 'Misil Antibalístico', icon: '🛡️', cost: { m: 8000, c: 0, d: 0 }, atk: 1, tech: 'shields' },
};

export const MOON_BUILDINGS = {
  lunarBase: { name: 'Base Lunar', icon: '🌙', cost: { m: 20000, c: 10000, d: 5000 }, factor: 2, cat: 'facility', max: 1 },
  sensorPhalanx: { name: 'Phalanx Sensor', icon: '📡', cost: { m: 500000, c: 200000, d: 100000 }, factor: 2, cat: 'facility', max: 1, req: { lunarBase: 1 } },
  jumpGate: { name: 'Puerta de Salto', icon: '🌀', cost: { m: 2000000, c: 1000000, d: 500000 }, factor: 2, cat: 'facility', max: 1, req: { lunarBase: 5 } },
  moonStorage: { name: 'Depósito Lunar', icon: '🏪', cost: { m: 5000, c: 2500, d: 1000 }, factor: 2, cat: 'storage' },
};

export const EVENTS = [
  { id: 'asteroid', name: 'Campo de Asteroides', icon: '☄️', type: 'resource', prob: 0.015 },
  { id: 'trade', name: 'Mercader Ambulante', icon: '💰', type: 'trade', prob: 0.02 },
  { id: 'storm', name: 'Tormenta Solar', icon: '⛈️', type: 'hazard', prob: 0.01 },
  { id: 'alien', name: 'Señal Alienígena', icon: '👽', type: 'tech', prob: 0.008 },
  { id: 'merchant', name: 'Flota Mercante', icon: '🚢', type: 'trade', prob: 0.015 },
  { id: 'nebula', name: 'Nebulosa Cercana', icon: '🌌', type: 'resource', prob: 0.012 },
];

import { MISSIONS } from './missionsData.js';
export { MISSIONS };

export const BIOMES = {
  desert: { name: 'Desértico', bonus: { metal: 0.2 }, penalty: { crystal: -0.1 }, color: 'amber' },
  oceanic: { name: 'Oceánico', bonus: { crystal: 0.2 }, penalty: { deuterium: -0.1 }, color: 'blue' },
  volcanic: { name: 'Volcánico', bonus: { metal: 0.3, deuterium: 0.1 }, penalty: { crystal: -0.15 }, color: 'red' },
  tundra: { name: 'Tundra', bonus: { deuterium: 0.2 }, penalty: { metal: -0.1 }, color: 'slate' },
  temperate: { name: 'Templado', bonus: { metal: 0.1, crystal: 0.1 }, penalty: {}, color: 'green' },
  toxic: { name: 'Tóxico', bonus: { crystal: 0.25 }, penalty: { metal: -0.15, deuterium: -0.1 }, color: 'purple' },
  frozen: { name: 'Helado', bonus: { deuterium: 0.3 }, penalty: { metal: -0.2, crystal: -0.1 }, color: 'cyan' },
  exotic: { name: 'Exótico', bonus: { metal: 0.15, crystal: 0.15, deuterium: 0.15 }, penalty: {}, color: 'pink' },
  barren: { name: 'Yermo', bonus: {}, penalty: { metal: -0.1, crystal: -0.1 }, color: 'stone' },
};
export const BIOME_KEYS = Object.keys(BIOMES);

export const PLANET_SIZES = [30, 40, 50, 60, 70, 80, 100, 120, 150, 200, 250];

export const GRAVITY_LEVELS = [
  { name: 'Muy baja', mult: { buildTime: 0.8, fuelCost: 1.3, prod: 0.85 } },
  { name: 'Baja', mult: { buildTime: 0.9, fuelCost: 1.15, prod: 0.92 } },
  { name: 'Normal', mult: { buildTime: 1.0, fuelCost: 1.0, prod: 1.0 } },
  { name: 'Alta', mult: { buildTime: 1.15, fuelCost: 0.85, prod: 1.08 } },
  { name: 'Muy alta', mult: { buildTime: 1.3, fuelCost: 0.7, prod: 1.15 } },
];

export const PLANET_TRAITS = [
  null, null, null, null, null,
  { name: 'Suelos Ricos', desc: '+10% producción metal', effect: p => ({ metal: 0.1 }) },
  { name: 'Cristales Nativos', desc: '+10% producción cristal', effect: p => ({ crystal: 0.1 }) },
  { name: 'Océanos de Deuterio', desc: '+15% producción deuterio', effect: p => ({ deuterium: 0.15 }) },
  { name: 'Campo Magnético', desc: '-10% tiempo construcción', effect: p => ({ buildTime: -0.1 }) },
  { name: 'Ruinas Antiguas', desc: '+10% investigación', effect: p => ({ research: 0.1 }) },
  { name: 'Clima Extremo', desc: '-10% producción general', effect: p => ({ malus: 0.1 }) },
  { name: 'Yermo Radioactivo', desc: '-15% producción, +5% defensa', effect: p => ({ malus: 0.15, defense: 0.05 }) },
  { name: 'Ecosistema Frágil', desc: '-20% tamaño efectivo', effect: p => ({ sizeMalus: 0.2 }) },
];

export const AI_STRATEGIES = {
  expansionist: {
    name: 'Expansionista', weight: { eco: 0.3, mil: 0.4, diplo: 0.1, tech: 0.2 },
    desc: 'Busca expandirse agresivamente', warTendency: 0.6, allyTendency: 0.3,
  },
  militarist: {
    name: 'Militarista', weight: { eco: 0.2, mil: 0.6, diplo: 0.05, tech: 0.15 },
    desc: 'Prioriza poder militar', warTendency: 0.8, allyTendency: 0.15,
  },
  merchant: {
    name: 'Comerciante', weight: { eco: 0.5, mil: 0.15, diplo: 0.25, tech: 0.1 },
    desc: 'Enfoque económico y comercial', warTendency: 0.2, allyTendency: 0.6,
  },
  technocrat: {
    name: 'Tecnócrata', weight: { eco: 0.2, mil: 0.2, diplo: 0.1, tech: 0.5 },
    desc: 'Prioriza investigación', warTendency: 0.3, allyTendency: 0.4,
  },
  diplomat: {
    name: 'Diplomático', weight: { eco: 0.2, mil: 0.15, diplo: 0.5, tech: 0.15 },
    desc: 'Busca alianzas y tratados', warTendency: 0.15, allyTendency: 0.8,
  },
  clanist: {
    name: 'Clanista', weight: { eco: 0.15, mil: 0.35, diplo: 0.35, tech: 0.15 },
    desc: 'Lealtad al clan por encima', warTendency: 0.5, allyTendency: 0.7,
  },
  chaotic: {
    name: 'Caótico', weight: { eco: 0.25, mil: 0.25, diplo: 0.25, tech: 0.25 },
    desc: 'Comportamiento impredecible', warTendency: 0.5, allyTendency: 0.4,
  },
};
export const AI_STRATEGY_KEYS = Object.keys(AI_STRATEGIES);

export const PLANET_PREFIXES = ['Saturno','Neptuno','Kronos','Orion','Elysium','Valkar','Helion','Astra','Draconis','Terra','Zion','Vega','Zephyr','Hydra','Atlas','Titan','Hyperion','Solaris','Xenon','Acheron','Boreas','Caelum','Erebus','Gaea','Hermes','Janus','Kore','Lethe','Mimas','Nyx','Osiris','Prometheus','Rhea','Tartarus','Uranus','Vulcan','Nebula','Sphaera','Luxor','Noctis','Umbra','Aurum','Ferrus','Argentum','Cobalt','Thorium','Iridium','Platinum','Onyx','Jade','Ruby','Zafiro','Esmeralda','Topacio','Ámbar','Perla','Opalo','Cuarzo','Granito','Mármol','Bronce','Acero','Cromo'];
export const PLANET_SUFFIXES = ['Prime','Secundus','Tertiarius','IX','IV','III','VI','Alpha','Beta','Gamma','Delta','Nexus','Centauri','Major','Minor','V','VIII','X','XII','Nova','Primeval','Expanse','Haven','Gate','Hold','Reach','Deep','Farpoint','Station','Orbital'];
