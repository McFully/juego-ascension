/* ============================================================
   GAME ENGINE (core.jsx)
   Allowed per updated AGENTS.md rule #7 (pragmatic exception).
   Contains all heavy game logic (reducer, combat, IA, formulas, etc.).
   Keep this file focused and well-organized.
   ============================================================ */

/* ============================================================
   ASCENSIÓN - ESTRATEGIA ESPACIAL
   Edificios, Investigación, Naves, Defensas, Galaxia,
   Combate con Rapid-Fire, IA con Planetas, Flotas en Vuelo,
   Misiones, Espionaje, Colonización, Eventos, Offline Progress
   ============================================================ */

import { EXPANDED_BUILDINGS, EXPANDED_RESEARCH } from './data/expandedContent.js';
import { MISSIONS } from './data/missionsData.js';
export { MISSIONS };
import { ACHIEVEMENTS, RES_NAMES, RES_ICONS, NARRATIVE_EVENTS, FACTIONS, ARTIFACTS } from './data/gameConstants.js';
export { ACHIEVEMENTS, RES_NAMES, RES_ICONS, NARRATIVE_EVENTS, FACTIONS };

export {
  calcStorage, shipTimeBonus, researchTimeBonus,
  calcCustomShipCost, calcCustomShipTime, calcCustomShipStats,
  buildingProdDisplay, buildingProdInfo, researchEffectInfo,
  calcBuildTime, calcResearchTime, calcShipTime, calcDefenseTime, calcDistance,
  calcFlightTime, calcFuel, shipSpeed, fleetSpeed, getDefenseStats, getShipStats,
  buildingCost, researchCost, shipCost, defenseCost, constructionDiscount, aiResearchDiscount
} from './utils/formulas.js';

// ============ CONSTANTES ============
export const TICK_MS = 1000;
const STORAGE_BASE = 5000;
export const GAME_SPEED = 20;


const BASE_BUILDINGS = {
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
  naniteFactory: { name: 'Fábrica Nanobots', icon: '🧬', cost: { m: 1e6, c: 5e5, d: 1e5 }, factor: 2, cat: 'facility', req: { robotFactory: 10 } },
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

export const BUILDINGS = {
  ...BASE_BUILDINGS,
  ...EXPANDED_BUILDINGS
};

const BASE_RESEARCH = {
  // ===== ENERGÍA =====
  energy: { name: 'Energía', icon: '⚡', cost: { m: 0, c: 800, d: 400 }, factor: 2, cat: 'power', effect: 'Habilita tecnologías avanzadas' },
  advReactors: { name: 'Reactores Avanzados', icon: '☢️', cost: { m: 8000, c: 12000, d: 6000 }, factor: 2, cat: 'power', req: { energy: 5 }, effect: 'Mejora eficiencia de reactores de fusión' },
  quantumEnergy: { name: 'Optimización Energética', icon: '💡', cost: { m: 20000, c: 30000, d: 15000 }, factor: 2, cat: 'power', req: { energy: 8, computer: 6 }, effect: 'Optimiza producción de energía' },
  quantumNetworks: { name: 'Redes Cuánticas', icon: '🔗', cost: { m: 60000, c: 80000, d: 40000 }, factor: 2.2, cat: 'power', req: { quantumEnergy: 5, computer: 10 }, effect: 'Redes de comunicación cuánticas' },

  // ===== PROPULSIÓN =====
  combustion: { name: 'Combustión', icon: '🔥', cost: { m: 200, c: 100, d: 0 }, factor: 2, cat: 'propulsion', req: { energy: 1 }, effect: 'Velocidad naves combustión', perLevel: { speed: 10 }, unit: '%' },
  impulse: { name: 'Impulso', icon: '💨', cost: { m: 2000, c: 4000, d: 600 }, factor: 2, cat: 'propulsion', req: { energy: 1, combustion: 1 }, effect: 'Velocidad naves impulso', perLevel: { speed: 20 }, unit: '%' },
  hyperspace: { name: 'Hiperespacio', icon: '🌀', cost: { m: 10000, c: 20000, d: 6000 }, factor: 2, cat: 'propulsion', req: { energy: 3, impulse: 3 }, effect: 'Velocidad naves hiperespacio', perLevel: { speed: 30 }, unit: '%' },
  quantumDrive: { name: 'Propulsión Cuántica', icon: '💫', cost: { m: 50000, c: 60000, d: 30000 }, factor: 2.2, cat: 'propulsion', req: { hyperspace: 7, quantumEnergy: 3 }, effect: 'Propulsión cuántica para naves' },
  interstellarNav: { name: 'Navegación Interestelar', icon: '🧭', cost: { m: 80000, c: 100000, d: 50000 }, factor: 2.2, cat: 'propulsion', req: { hyperspace: 5, astrophysics: 5 }, effect: 'Navegación entre sistemas lejanos' },

  // ===== ARMAMENTO =====
  laser: { name: 'Láser', icon: '🔴', cost: { m: 200, c: 100, d: 0 }, factor: 2, cat: 'weapon', req: { energy: 3 }, effect: 'Ataque de láseres' },
  ion: { name: 'Iones', icon: '🔵', cost: { m: 5000, c: 4000, d: 2000 }, factor: 2, cat: 'weapon', req: { energy: 4, laser: 4 }, effect: 'Ataque de cañones iónicos' },
  plasma: { name: 'Plasma', icon: '🟣', cost: { m: 2000, c: 4000, d: 1000 }, factor: 2.5, cat: 'weapon', req: { energy: 5, laser: 5, ion: 4 }, effect: 'Producción minas (metal/cristal)', perLevel: { metal: 1, crystal: 0.66 }, unit: '%' },
  ballisticWeapons: { name: 'Armamento Balístico', icon: '🎯', cost: { m: 8000, c: 4000, d: 2000 }, factor: 2, cat: 'weapon', req: { weapons: 4, laser: 3 }, effect: 'Armamento balístico avanzado' },
  advMissiles: { name: 'Misiles Avanzados', icon: '🚀', cost: { m: 15000, c: 10000, d: 5000 }, factor: 2, cat: 'weapon', req: { ballisticWeapons: 3 }, effect: 'Misiles de largo alcance' },
  orbitalArtillery: { name: 'Artillería Orbital', icon: '💥', cost: { m: 40000, c: 30000, d: 15000 }, factor: 2, cat: 'weapon', req: { plasma: 5, hyperspace: 4 }, effect: 'Artillería orbital' },

  // ===== DEFENSA =====
  armour: { name: 'Blindaje', icon: '🛡️', cost: { m: 0, c: 400, d: 200 }, factor: 2, cat: 'defense', req: { energy: 1 }, effect: 'Blindaje de naves', perLevel: { hull: 8 }, unit: '%' },
  weapons: { name: 'Armas', icon: '⚔️', cost: { m: 800, c: 200, d: 0 }, factor: 2, cat: 'defense', req: { energy: 3 }, effect: 'Ataque de naves', perLevel: { atk: 10 }, unit: '%' },
  shields: { name: 'Escudos', icon: '🔰', cost: { m: 200, c: 600, d: 0 }, factor: 2, cat: 'defense', req: { energy: 3 }, effect: 'Escudos de naves', perLevel: { shd: 10 }, unit: '%' },
  nanoRepair: { name: 'Nano-reparación', icon: '🛠️', cost: { m: 20000, c: 15000, d: 8000 }, factor: 2, cat: 'defense', req: { shields: 5, naniteFactory: 3 }, effect: 'Reparación automática de flotas' },
  defenseFields: { name: 'Campos Defensivos', icon: '🔰', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'defense', req: { shields: 7, energy: 6 }, effect: 'Campos de fuerza defensivos' },
  fortressTech: { name: 'Fortaleza Planetaria', icon: '🏰', cost: { m: 100000, c: 80000, d: 50000 }, factor: 2.2, cat: 'defense', req: { defenseFields: 3, armour: 7 }, effect: 'Fortalezas planetarias' },

  // ===== UTILIDAD =====
  espionage: { name: 'Espionaje', icon: '👁️', cost: { m: 200, c: 1000, d: 200 }, factor: 2, cat: 'utility', req: { energy: 3 }, effect: 'Probabilidad de espionaje' },
  computer: { name: 'Computación', icon: '💻', cost: { m: 400, c: 800, d: 200 }, factor: 2, cat: 'utility', req: { energy: 3 }, effect: 'Velocidad de hackeo' },
  astrophysics: { name: 'Astrofísica', icon: '🌌', cost: { m: 4000, c: 8000, d: 4000 }, factor: 2, cat: 'utility', req: { espionage: 4, impulse: 3, energy: 4 }, effect: 'Astrofísica avanzada' },
  aiTactics: { name: 'IA Táctica', icon: '🤖', cost: { m: 10000, c: 15000, d: 5000 }, factor: 2, cat: 'utility', req: { computer: 5 }, effect: 'IA táctica de combate' },
  advSensors: { name: 'Sensores Avanzados', icon: '📡', cost: { m: 12000, c: 18000, d: 6000 }, factor: 2, cat: 'utility', req: { espionage: 5, computer: 4 }, effect: 'Sensores de largo alcance' },
  galacticCrypto: { name: 'Criptografía Galáctica', icon: '🔐', cost: { m: 25000, c: 30000, d: 15000 }, factor: 2, cat: 'utility', req: { computer: 8, espionage: 6 }, effect: 'Criptografía galáctica' },

  // ===== ECONOMÍA =====
  miningAuto: { name: 'Automatización Minera', icon: '⚙️', cost: { m: 5000, c: 4000, d: 2000 }, factor: 2, cat: 'economy', req: { computer: 3, energy: 4 }, effect: 'Producción de minas' },
  industrialOpt: { name: 'Optimización Industrial', icon: '📈', cost: { m: 10000, c: 8000, d: 4000 }, factor: 2, cat: 'economy', req: { miningAuto: 3, robotFactory: 5 }, effect: 'Optimización industrial' },
  galacticTrade: { name: 'Comercio Galáctico', icon: '💰', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, cat: 'economy', req: { industrialOpt: 3, computer: 6 }, effect: 'Comercio galáctico' },
  advLogistics: { name: 'Logística Avanzada', icon: '📦', cost: { m: 30000, c: 25000, d: 15000 }, factor: 2, cat: 'economy', req: { galacticTrade: 3, hyperspace: 4 }, effect: 'Logística avanzada' },

  // ===== IA =====
  aiProd: { name: 'IA de Producción', icon: '🏭', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, cat: 'ai', req: { computer: 6, miningAuto: 3 }, effect: 'IA de producción' },
  aiMilitary: { name: 'IA Militar', icon: '⚔️', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'ai', req: { computer: 7, aiTactics: 3 }, effect: 'IA militar' },
  aiStrategy: { name: 'IA Estratégica', icon: '🧠', cost: { m: 60000, c: 80000, d: 30000 }, factor: 2, cat: 'ai', req: { aiMilitary: 3, aiProd: 3 }, effect: 'IA estratégica' },
  fullAuto: { name: 'Automatización Total', icon: '🤖', cost: { m: 150000, c: 200000, d: 100000 }, factor: 2.2, cat: 'ai', req: { aiStrategy: 5, computer: 10 }, effect: 'Automatización total' },

  // ===== INGENIERÍA AVANZADA =====
  nanoTech: { name: 'Nanotecnología', icon: '⚛️', cost: { m: 50000, c: 40000, d: 20000 }, factor: 2, cat: 'engineering', req: { computer: 7, shields: 5 }, effect: 'Nanotecnología' },
  modularEng: { name: 'Ingeniería Modular', icon: '🧩', cost: { m: 40000, c: 50000, d: 25000 }, factor: 2, cat: 'engineering', req: { industrialOpt: 5 }, effect: 'Ingeniería modular' },
  expDesign: { name: 'Diseño Experimental', icon: '💡', cost: { m: 80000, c: 100000, d: 40000 }, factor: 2.2, cat: 'engineering', req: { nanoTech: 3, modularEng: 3 }, effect: 'Diseño experimental' },
  cyberIntegration: { name: 'Integración Cibernética', icon: '🔗', cost: { m: 120000, c: 150000, d: 80000 }, factor: 2.2, cat: 'engineering', req: { expDesign: 3, aiStrategy: 3 }, effect: 'Integración cibernética' },

  // ===== EXPLORACIÓN =====
  deepScanner: { name: 'Escáner Profundo', icon: '🔍', cost: { m: 15000, c: 20000, d: 8000 }, factor: 2, cat: 'exploration', req: { espionage: 5, astrophysics: 3 }, effect: 'Escáner profundo' },
  advColonization: { name: 'Colonización Avanzada', icon: '🏴', cost: { m: 25000, c: 30000, d: 15000 }, factor: 2, cat: 'exploration', req: { astrophysics: 5, impulse: 5 }, effect: 'Colonización avanzada' },
  galacticCartography: { name: 'Cartografía Galáctica', icon: '🗺️', cost: { m: 30000, c: 40000, d: 20000 }, factor: 2, cat: 'exploration', req: { deepScanner: 3, computer: 6 }, effect: 'Cartografía galáctica' },
  dimensionalExploration: { name: 'Exploración Dimensional', icon: '🌀', cost: { m: 100000, c: 150000, d: 80000 }, factor: 2.5, cat: 'exploration', req: { galacticCartography: 5, quantumDrive: 3 }, effect: 'Exploración dimensional' },
};

export const RESEARCH = {
  ...BASE_RESEARCH,
  ...EXPANDED_RESEARCH
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

// ============ COMPONENTES DE NAVES PERSONALIZADAS ============
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
  { id: 'derelict', name: 'Nave Abandonada', icon: '🛸', type: 'tech', prob: 0.008 },
  { id: 'pirates', name: 'Piratas Espaciales', icon: '🏴‍☠️', type: 'hazard', prob: 0.012 },
  { id: 'anomaly', name: 'Anomalía Gravitacional', icon: '🌀', type: 'resource', prob: 0.01 },
  { id: 'cache', name: 'Depósito Olvidado', icon: '📦', type: 'resource', prob: 0.015 },
];

export const checkAchievements = (state) => {
  let ns = { ...state, achievements: [...(state.achievements || [])] };
  for (const a of ACHIEVEMENTS) {
    if (!(ns.achievements || []).includes(a.id) && a.check(ns.stats || {})) {
      ns.achievements.push(a.id);
      ns.notifications = [...(ns.notifications || []), { id: uid(), type: 'success', message: `🏆 Logro: ${a.icon} ${a.name}`, timestamp: Date.now() }];
    }
  }
  return ns;
};



export const checkMissions = (state) => {
  let ns = { ...state, completedMissions: [...(state.completedMissions || [])] };
  const currentPlanet = ns.planets.find(p => p.id === ns.currentPlanetId) || ns.planets[0];
  if (!currentPlanet) return ns;

  for (const m of MISSIONS) {
    if (!ns.completedMissions.includes(m.id)) {
      const isUnlocked = !m.req || ns.completedMissions.includes(m.req);
      if (isUnlocked && m.check(ns, currentPlanet)) {
        ns.completedMissions.push(m.id);
        
        ns.planets = ns.planets.map(p => {
          if (p.id === currentPlanet.id) {
            return {
              ...p,
              resources: {
                metal: p.resources.metal + (m.reward.metal || 0),
                crystal: p.resources.crystal + (m.reward.crystal || 0),
                deuterium: p.resources.deuterium + (m.reward.deuterium || 0)
              }
            };
          }
          return p;
        });

        ns.notifications = [...(ns.notifications || []), {
          id: uid(),
          type: 'success',
          message: `🎯 ¡Misión Cumplida! ${m.icon} ${m.name}. Recompensa: ${m.rewardDesc}`,
          timestamp: Date.now(),
          isMission: true
        }];
      }
    }
  }
  return ns;
};

// ============ UTILIDADES ============
export const fmt = (n, opts = {}) => {
  if (n == null || isNaN(n)) return '0';
  const num = Math.floor(n);
  
  if (opts.full || num < 10000) {
    return num.toLocaleString();
  }
  
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const fmtTime = (sec) => {
  if (sec <= 0) return '0s';
  sec = Math.floor(sec);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

export const uid = () => Math.random().toString(36).slice(2, 11);

export const getGalacticAlignment = (reputation) => {
  const r = reputation || 0;
  if (r > 70) return { title: 'Emisario de la Paz', color: 'text-emerald-400', icon: 'auto_awesome' };
  if (r >= 30) return { title: 'Guardián Galáctico', color: 'text-cyan-400', icon: 'shield' };
  if (r >= -30) return { title: 'Líder Neutral', color: 'text-slate-400', icon: 'balance' };
  if (r >= -70) return { title: 'Pirata del Sector', color: 'text-amber-500', icon: 'sailing' };
  return { title: 'Azote Estelar', color: 'text-rose-500', icon: 'skull' };
};

export const getPOIAtCoordinates = (galaxy, system, position) => {
  // Deterministic seed based on coordinates
  const seed = (galaxy * 10000) + (system * 100) + position;
  const hash = Math.sin(seed) * 10000;
  const rand = hash - Math.floor(hash);

  // 15% chance to have a POI at these coordinates
  if (rand < 0.15) {
    if (rand < 0.05) {
      return {
        type: 'wormhole',
        name: 'Agujero de Gusano',
        icon: '🌀',
        desc: 'Una singularidad estable que pliega el espacio-tiempo. Los viajes hacia este sistema consumen un 50% menos de Deuterio y tardan un 50% menos.'
      };
    } else if (rand < 0.10) {
      return {
        type: 'helium_belt',
        name: 'Cinturón de Helio-3',
        icon: '🌌',
        desc: 'Una densa corriente de gases interestelares ricos en Helio-3. La producción de Deuterio en las colonias fundadas aquí aumenta un 50%.'
      };
    } else {
      return {
        type: 'precursor_ruins',
        name: 'Ruinas Ancestrales',
        icon: '🏛️',
        desc: 'Estructuras abandonadas de una civilización extinta altamente avanzada. Las expediciones a este sistema tienen el doble de probabilidad de encontrar tecnología o naves abandonadas.'
      };
    }
  }
  return null;
};

// ============ FÓRMULAS ============
export const canAfford = (res, cost) => {
  if ((cost.metal || 0) < 0 || (cost.crystal || 0) < 0 || (cost.deuterium || 0) < 0) return false;
  return (res.metal || 0) >= (cost.metal || 0) &&
         (res.crystal || 0) >= (cost.crystal || 0) &&
         (res.deuterium || 0) >= (cost.deuterium || 0);
};

export const deduct = (res, cost) => ({
  metal: Math.max(0, (res.metal || 0) - (cost.metal || 0)),
  crystal: Math.max(0, (res.crystal || 0) - (cost.crystal || 0)),
  deuterium: Math.max(0, (res.deuterium || 0) - (cost.deuterium || 0)),
});

export const calcResourceValueForAI = (aiPlanet, offer) => {
  let metalWeight = 1.0;
  let crystalWeight = 2.0;
  let deutWeight = 4.0;
  let influenceWeight = 15.0;

  if (aiPlanet.biome === 'volcanic' || aiPlanet.biome === 'desert') {
    deutWeight *= 1.8;
    crystalWeight *= 1.2;
  } else if (aiPlanet.biome === 'ice' || aiPlanet.biome === 'frozen') {
    metalWeight *= 1.6;
  } else if (aiPlanet.biome === 'gas' || aiPlanet.biome === 'oceanic') {
    metalWeight *= 1.5;
    crystalWeight *= 1.5;
  }

  if (aiPlanet.strategy === 'militarist' || aiPlanet.strategy === 'expansionist') {
    metalWeight *= 1.3;
    deutWeight *= 1.4;
  } else if (aiPlanet.strategy === 'technocrat') {
    crystalWeight *= 1.6;
  } else if (aiPlanet.strategy === 'merchant') {
    influenceWeight *= 0.8;
  } else if (aiPlanet.strategy === 'diplomat') {
    influenceWeight *= 1.5;
  }

  const rel = aiPlanet.relation || 0;
  let relFactor = 1.0;
  if (rel >= 60) relFactor = 0.85;
  else if (rel <= -30) relFactor = 1.3;

  const rawValue = (offer.metal || 0) * metalWeight +
                    (offer.crystal || 0) * crystalWeight +
                    (offer.deuterium || 0) * deutWeight +
                    (offer.influence || 0) * influenceWeight;

  return rawValue * relFactor;
};

// Hardening helper: previene estados inválidos de recursos
export const clampResources = (res) => ({
  metal: Math.max(0, res.metal || 0),
  crystal: Math.max(0, res.crystal || 0),
  deuterium: Math.max(0, res.deuterium || 0),
});

export const meetsReq = (req, research) => {
  if (!req) return true;
  const r = research || {};
  return Object.entries(req).every(([k, v]) => (r[k] || 0) >= v);
};

export { calcProduction } from './utils/formulas.js';

// Get effective tech for a planet (retrofitTech if set, otherwise empty/base)
export const getEffectiveTech = (planet, globalResearch) => {
  if (planet && planet.retrofitTech && Object.keys(planet.retrofitTech).length > 0) {
    return planet.retrofitTech;
  }
  return {};
};

// Check if a planet's units are outdated compared to current research
export const isOutdated = (planet, globalResearch) => {
  if (!planet || !globalResearch) return false;
  const t = planet.retrofitTech || {};
  return (globalResearch.weapons || 0) > (t.weapons || 0) ||
    (globalResearch.shields || 0) > (t.shields || 0) ||
    (globalResearch.armour || 0) > (t.armour || 0) ||
    (globalResearch.combustion || 0) > (t.combustion || 0) ||
    (globalResearch.impulse || 0) > (t.impulse || 0) ||
    (globalResearch.hyperspace || 0) > (t.hyperspace || 0);
};

// ============ COMBATE CON RAPID-FIRE (GROUP-BASED) ============
export { simulateCombat } from './combat.js';

// ============ IA ============
// ============ GENERADOR DE NOMBRES ÚNICOS ============
const AI_TITLES = ['Imperio','República','Dominio','Confederación','Colectivo','Alianza','Legión','Clan','Sindicato','Hegemonía','Reino','Federación','Protectorado','Cábala','Nación','Concordia','Secta','Coalición','Cartel','Principado','Soberanía','Frente','Enclave','Unión','Orden','Congregación','Consorcio','Dinastía','Imperium','Magisterio'];
const AI_ROOTS = ['Kael','Vex','Xylos','Draak','Zor','Sid','Fénix','Crom','Orion','Tauri','Astr','Lumin','Umbr','Vort','Sola','Eclip','Quant','Ragn','Nova','Andró','Heli','Drak','Galá','Spect','Terran','Cósmi','Void','Cent','Kron','Elys','Valk','Heli','Astr','Drac','Zion','Vega','Zeph','Hydr','Atla','Tita','Hype','Xeno','Ache','Bore','Cael','Ereb','Gaea','Herm','Janu','Kore','Leth','Mima','Nyx','Osir','Prome','Rhea','Tart','Uran','Vulc','Nebul','Spha','Lux','Noct','Umbr','Auri','Ferr','Argent','Cobal','Thori','Irid','Plat','Onyx','Jade','Rubi','Zafir','Esme','Topa','Ámbar','Perla','Opal','Cuar','Gran','Márm','Bronc','Acer','Crom'];
const generateAIName = (index) => {
  const t = AI_TITLES[index % AI_TITLES.length];
  const r1 = AI_ROOTS[(index * 7 + 3) % AI_ROOTS.length];
  const r2 = AI_ROOTS[(index * 13 + 11) % AI_ROOTS.length];
  const suffix = index < AI_TITLES.length * AI_ROOTS.length ? '' : ` ${Math.floor(index / (AI_TITLES.length * AI_ROOTS.length))}`;
  return `${t} ${r1}${r2}${suffix}`;
};

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

const PLANET_SIZES = [30, 40, 50, 60, 70, 80, 100, 120, 150, 200, 250];
const GRAVITY_LEVELS = [
  { name: 'Muy baja', mult: { buildTime: 0.8, fuelCost: 1.3, prod: 0.85 } },
  { name: 'Baja', mult: { buildTime: 0.9, fuelCost: 1.15, prod: 0.92 } },
  { name: 'Normal', mult: { buildTime: 1.0, fuelCost: 1.0, prod: 1.0 } },
  { name: 'Alta', mult: { buildTime: 1.15, fuelCost: 0.85, prod: 1.08 } },
  { name: 'Muy alta', mult: { buildTime: 1.3, fuelCost: 0.7, prod: 1.15 } },
];

const PLANET_TRAITS = [
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

// ============ ESTRATEGIAS IA ============
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

// Clan structures removed (audit cleanup - see TICK section).
// Kept for reference in case the feature is revived later.

// ============ NOMBRES DE PLANETAS (ESCALABLES) ============
const PLANET_PREFIXES = ['Saturno','Neptuno','Kronos','Orion','Elysium','Valkar','Helion','Astra','Draconis','Terra','Zion','Vega','Zephyr','Hydra','Atlas','Titan','Hyperion','Solaris','Xenon','Acheron','Boreas','Caelum','Erebus','Gaea','Hermes','Janus','Kore','Lethe','Mimas','Nyx','Osiris','Prometheus','Rhea','Tartarus','Uranus','Vulcan','Nebula','Sphaera','Luxor','Noctis','Umbra','Aurum','Ferrus','Argentum','Cobalt','Thorium','Iridium','Platinum','Onyx','Jade','Ruby','Zafiro','Esmeralda','Topacio','Ámbar','Perla','Opalo','Cuarzo','Granito','Mármol','Bronce','Acero','Cromo'];
const PLANET_SUFFIXES = ['Prime','Secundus','Tertiarius','IX','IV','III','VI','Alpha','Beta','Gamma','Delta','Nexus','Centauri','Major','Minor','V','VIII','X','XII','Nova','Primeval','Expanse','Haven','Gate','Hold','Reach','Deep','Farpoint','Station','Orbital'];
let _planetNameCounter = 0;
const generatePlanetName = () => {
  const idx = _planetNameCounter;
  _planetNameCounter++;
  const p = PLANET_PREFIXES[idx % PLANET_PREFIXES.length];
  const suffixIdx = Math.floor(idx / PLANET_PREFIXES.length) % PLANET_SUFFIXES.length;
  const s = PLANET_SUFFIXES[suffixIdx];
  return Math.random() < 0.2 ? `${p} ${Math.floor(idx / 10)}` : `${p} ${s}`;
};

const generateAIPlanet = (level, coords, empireName, aiIndex) => {
  const factionKeys = Object.keys(FACTIONS);
  const factionKey = factionKeys[Math.floor(Math.random() * factionKeys.length)];
  const fact = FACTIONS[factionKey];
  const pName = generatePlanetName();
  const biomeKey = BIOME_KEYS[Math.floor(Math.random() * BIOME_KEYS.length)];
  const biome = BIOMES[biomeKey];
  const sizeIdx = Math.floor(Math.random() * PLANET_SIZES.length);
  const planetSize = PLANET_SIZES[sizeIdx];
  const gravIdx = Math.floor(Math.random() * GRAVITY_LEVELS.length);
  const gravity = GRAVITY_LEVELS[gravIdx];
  const trait = PLANET_TRAITS[Math.floor(Math.random() * PLANET_TRAITS.length)];
  const strategyKey = AI_STRATEGY_KEYS[Math.floor(Math.random() * AI_STRATEGY_KEYS.length)];
  const strategy = AI_STRATEGIES[strategyKey];

  const baseMetal = 1000 * level;
  const baseCrystal = Math.floor(600 * level);
  const baseDeuterium = Math.floor(300 * level);
  const metalBonus = (biome.bonus.metal || 0) + (trait?.effect?.({})?.metal || 0) + (gravity.mult.prod - 1);
  const crystalBonus = (biome.bonus.crystal || 0) + (trait?.effect?.({})?.crystal || 0);
  const deutBonus = (biome.bonus.deuterium || 0) + (trait?.effect?.({})?.deuterium || 0);
  const malus = trait?.effect?.({})?.malus || 0;

  return {
    id: uid(),
    name: pName,
    galaxy: coords.galaxy, system: coords.system, position: coords.position,
    temperature: -30 + Math.floor(Math.random() * 100),
    resources: {
      metal: Math.floor(baseMetal * (1 + metalBonus - malus)),
      crystal: Math.floor(baseCrystal * (1 + crystalBonus - malus)),
      deuterium: Math.floor(baseDeuterium * (1 + deutBonus - malus)),
    },
    buildings: {
      metalMine: Math.min(15, Math.floor(level * 1.5)),
      crystalMine: Math.min(12, Math.floor(level * 1.2)),
      deutSynth: Math.min(10, level),
      solarPlant: Math.min(12, Math.floor(level * 1.3)),
      robotFactory: Math.min(8, Math.floor(level * 0.8)),
      shipyard: Math.min(6, Math.floor(level * 0.6)),
      researchLab: Math.min(5, Math.floor(level * 0.5)),
    },
    research: {
      weapons: Math.floor(level * 0.4),
      shields: Math.floor(level * 0.3),
      armour: Math.floor(level * 0.3),
    },
    fleet: {
      lightFighter: Math.floor(level * 5 + Math.random() * level * 5),
      cruiser: Math.floor(level * 1.5),
      battleship: Math.floor(level * 0.5),
    },
    defenses: {
      rocketLauncher: Math.floor(level * 10),
      lightLaser: Math.floor(level * 3),
    },
    isAI: true, aiLevel: level,
    relation: 0,
    discovered: false,
    aiType: strategyKey,
    aiPersonality: (strategyKey === 'militarist' || strategyKey === 'expansionist') ? 'bélico' :
                   (strategyKey === 'merchant' || strategyKey === 'diplomat') ? 'mercantilista' : 'pacífico',
    faction: factionKey,
    empireName: empireName,
    race: fact.race,
    economicLvl: Math.floor(level * 1.2) || 1,
    militaryLvl: Math.floor(level * 1.5) || 1,
    biome: biomeKey,
    planetSize,
    gravity: gravIdx,
    trait: trait ? { name: trait.name, desc: trait.desc } : null,

    // Strategic profile
    strategy: strategyKey,
    aggression: strategy.warTendency + (Math.random() * 0.4 - 0.2),
    ecoTendency: strategy.weight.eco + (Math.random() * 0.2 - 0.1),
    diploTendency: strategy.weight.diplo + (Math.random() * 0.2 - 0.1),
    riskTolerance: 0.3 + Math.random() * 0.5,
    lossTolerance: 0.2 + Math.random() * 0.4,

    // Evolution tracking
    totalWins: 0, totalLosses: 0, totalDraws: 0,
    warsDeclared: 0, warsReceived: 0,
    planetsConquered: 0, planetsLost: 0,
    totalEcoSpent: 0, totalMilSpent: 0,
    factionStability: 0.7 + Math.random() * 0.3,
    lastStrategyChange: Date.now(),

    // Clan membership
    clanId: null,
    allianceIds: [],

    // Espionage defense level
    espDefenseLvl: Math.floor(Math.random() * level),

    // Trade routes
    tradeRoutes: [],
    activePacts: [],
  };
};

// ============ GENERADOR DE PLANETAS VÍRGENES DETERMINISTAS ============
export const getVirginPlanet = (galaxy, system, position) => {
  const seed = galaxy * 10000 + system * 20 + position;
  let sVal = seed;
  const nextRand = () => {
    const x = Math.sin(sVal++) * 10000;
    return x - Math.floor(x);
  };

  const biomes = BIOME_KEYS;
  const sizes = PLANET_SIZES;
  const gravities = [0, 1, 2, 3, 4];
  const traits = PLANET_TRAITS;

  const rTemp = nextRand();
  const rBiome = nextRand();
  const rSize = nextRand();
  const rGravity = nextRand();
  const rTrait = nextRand();

  return {
    id: `virgin-${galaxy}-${system}-${position}`,
    name: null,
    isVirgin: true,
    empireName: null,
    galaxy,
    system,
    position,
    temperature: -30 + Math.floor(rTemp * 110),
    resources: { metal: 0, crystal: 0, deuterium: 0 },
    buildings: {},
    research: {},
    fleet: {},
    defenses: {},
    missiles: {},
    isHome: false,
    moon: null,
    retrofitTech: {},
    faction: null,
    biome: biomes[Math.floor(rBiome * biomes.length)],
    planetSize: sizes[Math.floor(rSize * sizes.length)],
    gravity: gravities[Math.floor(rGravity * gravities.length)],
    trait: traits[Math.floor(rTrait * traits.length)],
  };
};

// ============ GENERADOR GALÁCTICO (SOLO IMPERIOS IA) ============
const generateGalaxy = (playerName, homeFaction) => {
  const aiPlanets = [];
  const usedNames = new Set();
  const systems = [];
  let aiIndex = 0;

  // Generate 4,000 systems with positions
  for (let g = 1; g <= 10; g++) {
    const systemsInGalaxy = g === 1 ? 500 : 389;
    for (let s = 1; s <= systemsInGalaxy; s++) {
      systems.push({ galaxy: g, system: s });
    }
  }

  // AI empire naming: generate guaranteed unique names
  const generateUniqueAIName = (idx) => {
    let name;
    let attempts = 0;
    do {
      name = generateAIName(idx + attempts * 1000);
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    usedNames.add(name);
    return name;
  };

  // Populate occupied positions (5% chance an AI empire occupies it)
  for (let i = 0; i < systems.length; i++) {
    const { galaxy, system } = systems[i];

    for (let pos = 1; pos <= 15; pos++) {
      if (galaxy === 1 && system === 1 && pos === 1) continue;

      if (Math.random() < 0.05) {
        const level = 1 + Math.floor(Math.random() * 15);
        const empName = generateUniqueAIName(aiIndex);
        const planet = generateAIPlanet(level, { galaxy, system, position: pos }, empName, aiIndex);
        aiPlanets.push(planet);
        aiIndex++;
      }
    }
  }

  return { aiPlanets };
};

// ============ CREAR PARTIDA NUEVA ============
export const createInitial = (playerName, homeFaction = 'human', mode = 'standard') => {
  const homeId = uid();
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
    resources: isSurvivor ? { metal: 200, crystal: 50, deuterium: 10 } : (isDecay ? { metal: 500, crystal: 500, deuterium: 200 } : { metal: 800, crystal: 500, deuterium: 200 }),
    buildings: isDecay ? { metalMine: 25, crystalMine: 20, deutSynth: 15, solarPlant: 20, fusionReactor: 10, robotics: 10, shipyard: 8, researchLab: 10, nanite: 3 } : {
      metalMine: isSurvivor ? 0 : 2,
      crystalMine: isSurvivor ? 0 : 1,
      solarPlant: isSurvivor ? 0 : 1,
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

  // Extra decaying planets for Decay Mode
  if (isDecay) {
    for (let i = 2; i <= 5; i++) {
      initialPlanets.push({
        id: uid(),
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
    version: 3,
    playerName: playerName || 'Comandante',
    gameStarted: true,
    reputation: isDecay ? -50 : 0,
    influence: isDecay ? 1000 : 50,
    currentPlanetId: homeId,
    planets: initialPlanets,
    aiPlanets,
    research: homePlanet.research,
    // === NEW: Galactic Diplomacy Overhaul (20 improvements synthesis) ===
    galacticCouncil: {
      lastSessionTick: 0,
      currentSession: null, // { id, proposals: [], votes: {} }
      resolutionsPassed: [],
      influenceHistory: [] // for graphs
    },
    federations: [], // [{ id, name, members: [], leader: player or aiId, level: 1-3, bonuses: {} }]
    federalFleet: { 
      metal: 0, crystal: 0, deuterium: 0, 
      ships: {},
      contributions: {
        player: { metal: 0, crystal: 0, deuterium: 0, ships: {} }
      }
    }, // contributed resources and ships for federated army
    diplomaticHistory: [], // log of major pacts, votes, crises for "ministry memory"
    activeCrises: [], // for adventure: [{ id, title, description, options: [], aiInvolved: [] }]
    chatHistory: {}, // { aiId: [{ sender, text, timestamp }] }
    ministries: {
      economy: { taxRate: isDecay ? 0.3 : 0.1, tradeSubsidies: false, treasury: isDecay ? -50000 : 1000, gdp: 0 },
      defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1 },
      science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [] },
      culture: { propagandaLevel: 1, socialUnity: isDecay ? 20 : 80, eventsActive: [] },
      infra: { maintenanceBudget: isDecay ? 0.01 : 0.05, logisticsLevel: 1, orbitalNetwork: false },
      intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [] }
    },
    // === END NEW DIPLOMACY STATE ===
    gameMode: mode, // 'standard', 'survivor', 'decay', 'corporate', 'roguelike'
    leaders: [], // [{ id, name, type: 'admiral'|'scientist'|'governor', traits: [], xp, level, assignedTo: planetId|fleetId }]
    activeEvents: [], // [{ id, title, description, options: [], remainingTicks }]
    relics: [], // [{ id, name, effect, active: boolean }]
    governmentPolicies: {
      socialOrder: isDecay ? 30 : 100, // 0-100, affects rebellion risk
      corruption: isDecay ? 80 : 0, // affects resource waste
      liberty: 50, // authoritarian vs libertarian scale
    },
    adventureLogs: [{ tick: 0, type: 'start', text: `Comandante ${playerName} asume el mando en modo ${mode.toUpperCase()}.` }],
    // === END PREMIUM ADVENTURE STATE ===
    activeMissions: [],
    completedMissions: [],
    fleetMissions: [],
    eventLog: [],
    defenseQueue: [],
    buildQueue: [],
    researchQueue: [],
    shipQueue: [],
    shipyardQueue: [],       // usado por el código actual
    missileQueue: [],
    retrofitQueue: [],
    notifications: [
      { id: uid(), type: 'success', message: `🚀 Bienvenido a Ascensión, ${playerName || 'Comandante'}. Tu imperio comienza en ${homePlanet.name}.`, timestamp: Date.now() }
    ],
    events: [],
    combatLog: [],
    lastSave: Date.now(),
    lastTick: Date.now(),
    gameTick: 0,
    debrisField: { metal: 0, crystal: 0 },
    activeEvent: null,
    galacticEvents: [],
    tradeRoutes: [],
    totalAICount: aiPlanets.length,
    fleetPresets: [],
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

// ============ REDUCER ============
export const updatePlanet = (st, id, updater) => ({
  ...st,
  planets: st.planets.map(p => p.id === id ? updater(p) : p),
});

export const shouldKeepNotification = (n) => {
  if (!n || !n.message) return false;
  const msg = n.message;
  if (
    msg.includes('mejorado a nivel') ||
    (msg.includes('nivel') && (msg.includes('=,') || msg.includes('nivel '))) ||
    msg.includes('listos') ||
    msg.includes('construidos') ||
    msg.includes('lista') ||
    msg.includes('Modernización completada') ||
    msg.includes('cancelada') ||
    msg.includes('Reembolso') ||
    msg.includes('desguazados') ||
    msg.includes('retirados') ||
    msg.includes('Salto completado') ||
    msg.includes('Partida cargada') ||
    msg.includes('Logro:') ||
    msg.includes('Misión Cumplida') ||
    msg.includes('No puedes abandonar') ||
    msg.includes('Retira todas las naves') ||
    msg.includes('No tienes recursos') ||
    msg.includes('Delegación diplomática llegó a') ||
    msg.includes('Ya no tienes suficientes recursos') ||
    msg.includes('Vendiste excedentes a') ||
    msg.includes('Pagaste tributo a') ||
    msg.includes('Has cancelado el pacto') ||
    msg.includes('Rechazaste el chantaje de') ||
    msg.includes('Tratado firmado con') ||
    (msg.includes('¡Éxito!') && msg.includes('cede ante tu flota')) ||
    msg.includes('Flota regresó a')
  ) {
    return false;
  }
  return true;
};

export { gameReducer } from './reducer.jsx';
export { processMission, returnFleetToOrigin, processEvent } from './missions.jsx';


// gameReducer + gameReducerInner moved to src/reducer.jsx
// processMission, returnFleetToOrigin, processEvent moved to src/missions.jsx

// ============ SAVE VALIDATION (rule #3) ============
export const validateSave = (data) => {
  const errors = [];

  if (!data) {
    errors.push('Save vacío');
    return { valid: false, errors, version: null };
  }

  const version = data.version;

  if (version !== 2 && version !== 3) {
    errors.push(`Versión inválida: ${version} (se espera 2 o 3)`);
  }

  if (!data.playerName || typeof data.playerName !== 'string') {
    errors.push('Falta playerName válido');
  }

  if (!Array.isArray(data.planets) || data.planets.length === 0) {
    errors.push('No hay planetas en el save');
  }

  if (!data.gameStarted) {
    errors.push('Flag gameStarted no está activo');
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    version: version || null,
    canMigrate: version === 2, // future-proof
  };
};

// (Estilos S movidos exclusivamente a App.jsx para mantener core.jsx enfocado en lógica de juego)


