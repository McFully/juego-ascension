export const RESEARCH = {
  // ===== ENERGÍA =====
  energy: { name: 'Energía', icon: '⚡', cost: { m: 0, c: 800, d: 400 }, factor: 2, cat: 'power', effect: 'Multiplica toda la energía producida (+10%/nv)', perLevel: { energy: 10 }, unit: '%' },
  advReactors: { name: 'Reactores Avanzados', icon: '☢️', cost: { m: 8000, c: 12000, d: 6000 }, factor: 2, cat: 'power', req: { energy: 5 }, effect: 'Multiplica la eficiencia del Reactor de Fusión (+15%/nv)', perLevel: { fusion: 15 }, unit: '%' },
  quantumEnergy: { name: 'Optimización Energética', icon: '💡', cost: { m: 20000, c: 30000, d: 15000 }, factor: 2, cat: 'power', req: { energy: 8, computer: 6 }, effect: 'Reduce el consumo global de energía en minas e industrias (-10%/nv)', perLevel: { energySaver: 10 }, unit: '%' },
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
  // molecularCargoCompress vive en expanded/expandedResearch.js (única definición activa)


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
