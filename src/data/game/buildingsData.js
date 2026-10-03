export const BUILDINGS = {
  // ===== RECURSOS =====
  metalMine: { name: 'Mina de Metal', icon: '⛏️', cost: { m: 60, c: 15, d: 0 }, factor: 1.23157, prod: 'metal', baseProd: 45, energy: -10000, energyFactor: 1.10, cat: 'resource' },
  crystalMine: { name: 'Mina de Cristal', icon: '💎', cost: { m: 48, c: 24, d: 0 }, factor: 1.23157, prod: 'crystal', baseProd: 30, energy: -10000, energyFactor: 1.10, cat: 'resource' },
  deutSynth: { name: 'Sintetizador Deuterio', icon: '⚗️', cost: { m: 225, c: 75, d: 0 }, factor: 1.23157, prod: 'deuterium', baseProd: 22.5, energy: -20000, energyFactor: 1.10, cat: 'resource' },
  refinery: { name: 'Refinería Avanzada', icon: '🏭', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.8, prod: 'metal', baseProd: 5000, energy: -45000, energyFactor: 1.08, cat: 'resource', req: { metalMine: 5 } },
  chemPlant: { name: 'Planta de Procesamiento', icon: '⚗️', cost: { m: 2500, c: 3000, d: 1000 }, factor: 1.8, prod: 'crystal', baseProd: 4000, energy: -40000, energyFactor: 1.08, cat: 'resource', req: { crystalMine: 5 } },
  synthPlant: { name: 'Sintetizador Químico', icon: '🧪', cost: { m: 3000, c: 2000, d: 1500 }, factor: 1.8, prod: 'deuterium', baseProd: 2500, energy: -45000, energyFactor: 1.08, cat: 'resource', req: { deutSynth: 5 } },
  enrichPlant: { name: 'Planta de Enriquecimiento', icon: '☢️', cost: { m: 5000, c: 4000, d: 3000 }, factor: 2, prod: 'deuterium', baseProd: 3500, energy: -55000, energyFactor: 1.09, cat: 'resource', req: { deutSynth: 8, researchLab: 5 } },
  // slagRecycler vive en expanded/expandedBuildings.js (única definición activa)
  slagDenseArmorForge: { name: 'Forja de Blindaje de Escoria', icon: '🛡️', cost: { m: 3500, c: 2000, d: 800 }, factor: 1.75, energy: -35000, energyFactor: 1.06, cat: 'resource', req: { slagRecycler: 2 }, desc: 'Compacta escoria densificada en planchas de blindaje compuesto y superaleaciones de alta resistencia.' },
  slagPavingPlant: { name: 'Pavimentadora de Firme de Escoria', icon: '🛣️', cost: { m: 2800, c: 1600, d: 600 }, factor: 1.7, energy: -30000, energyFactor: 1.05, cat: 'resource', req: { slagRecycler: 1 }, desc: 'Transforma escoria vitrificada en firmes de alta capacidad de carga, acelerando infraestructuras y hábitats.' },
  slagSyntheticSynthesizer: { name: 'Sintetizador Silíceo de Escoria', icon: '⚗️', cost: { m: 4200, c: 3200, d: 1500 }, factor: 1.8, energy: -40000, energyFactor: 1.07, cat: 'resource', req: { slagRecycler: 3 }, desc: 'Reactores químicos de craqueo por plasma que extraen silicatos puros y deuterio de la escoria industrial.' },

  // ===== ENERGÍA =====
  solarPlant: { name: 'Planta Solar', icon: '☀️', cost: { m: 75, c: 30, d: 0 }, factor: 1.23157, energyGen: 20, cat: 'energy' },
  fusionReactor: { name: 'Reactor de Fusión', icon: '⚛️', cost: { m: 900, c: 360, d: 180 }, factor: 1.23157, energyGen: 1000, deutCons: 10, cat: 'energy', req: { solarPlant: 10 } },
  geoPlant: { name: 'Central Geotérmica', icon: '🌋', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.7, energyGen: 75, cat: 'energy', req: { fusionReactor: 5 } },
  orbitalEnergy: { name: 'Red Orbital Energética', icon: '🛰️', cost: { m: 10000, c: 8000, d: 4000 }, factor: 1.9, energyGen: 100, cat: 'energy', req: { solarPlant: 10, researchLab: 5 } },
  quantumReactor: { name: 'Reactor Cuántico', icon: '⚡', cost: { m: 50000, c: 30000, d: 20000 }, factor: 2.2, energyGen: 200, cat: 'energy', req: { fusionReactor: 5, researchLab: 8 } },

  // ===== INSTALACIONES =====
  robotFactory: { name: 'Fábrica de Robots', icon: '🤖', cost: { m: 400, c: 120, d: 200 }, factor: 2, energy: -25000, energyFactor: 1.07, cat: 'facility' },
  shipyard: { name: 'Astillero', icon: '🚀', cost: { m: 400, c: 200, d: 100 }, factor: 2, energy: -35000, energyFactor: 1.08, cat: 'facility' },
  researchLab: { name: 'Laboratorio', icon: '🔬', cost: { m: 200, c: 400, d: 200 }, factor: 2, energy: -20000, energyFactor: 1.06, cat: 'facility' },
  missileSilo: { name: 'Silo de Misiles', icon: '🎯', cost: { m: 20000, c: 20000, d: 1000 }, factor: 2, energy: -20000, cat: 'facility' },
  naniteFactory: { name: 'Fábrica Nanobots', icon: '🧬', cost: { m: 1000000, c: 500000, d: 100000 }, factor: 2, energy: -80000, energyFactor: 1.10, cat: 'facility', req: { robotFactory: 10 } },
  commandCenter: { name: 'Centro de Mando', icon: '🎖️', cost: { m: 5000, c: 3000, d: 1000 }, factor: 2, energy: -25000, cat: 'facility', req: { researchLab: 3 } },
  militaryAcademy: { name: 'Academia Militar', icon: '🎓', cost: { m: 8000, c: 5000, d: 2000 }, factor: 2, energy: -20000, cat: 'facility', req: { commandCenter: 3 } },
  logiCenter: { name: 'Centro Logístico', icon: '📦', cost: { m: 10000, c: 6000, d: 3000 }, factor: 1.8, energy: -25000, cat: 'facility', req: { shipyard: 5, robotFactory: 5 } },
  spyCenter: { name: 'Centro de Espionaje', icon: '🕵️', cost: { m: 6000, c: 8000, d: 2000 }, factor: 2, energy: -25000, cat: 'facility', req: { researchLab: 5 } },
  advResearchCenter: { name: 'Centro Inv. Avanzada', icon: '🔬', cost: { m: 20000, c: 30000, d: 10000 }, factor: 2, energy: -35000, energyFactor: 1.07, cat: 'facility', req: { researchLab: 8 } },
  industrialComplex: { name: 'Complejo Industrial', icon: '🏗️', cost: { m: 25000, c: 15000, d: 8000 }, factor: 2, energy: -40000, energyFactor: 1.08, cat: 'facility', req: { robotFactory: 8, shipyard: 6 } },
  modularFactory: { name: 'Fábrica Modular', icon: '🧩', cost: { m: 40000, c: 25000, d: 12000 }, factor: 2, energy: -30000, energyFactor: 1.07, cat: 'facility', req: { industrialComplex: 5 } },
  terraformer: { name: 'Centro de Terraformación', icon: '🌍', cost: { m: 100000, c: 80000, d: 40000 }, factor: 2.2, energy: -120000, energyFactor: 1.12, cat: 'facility', req: { researchLab: 10, naniteFactory: 5 } },
  assemblyCenter: { name: 'Centro de Ensamblaje', icon: '🔧', cost: { m: 50000, c: 30000, d: 15000 }, factor: 2, energy: -35000, energyFactor: 1.08, cat: 'facility', req: { modularFactory: 3 } },
  constructionCenter: { name: 'Centro de Construcciones', icon: '🏗️', cost: { m: 2000, c: 1500, d: 500 }, factor: 1.8, energy: -20000, cat: 'facility', req: { robotFactory: 3 } },

  // ===== ALMACENES =====
  metalStorage: { name: 'Almacén Metal', icon: '🏗️', cost: { m: 1000, c: 0, d: 0 }, factor: 2, energy: -6000, cat: 'storage' },
  crystalStorage: { name: 'Almacén Cristal', icon: '🏛️', cost: { m: 1000, c: 500, d: 0 }, factor: 2, energy: -6000, cat: 'storage' },
  deutStorage: { name: 'Almacén Deuterio', icon: '🛢️', cost: { m: 1000, c: 500, d: 0 }, factor: 2, energy: -15000, cat: 'storage' },
  slagStorage: { name: 'Depósito de Escoria', icon: '🏭', cost: { m: 1200, c: 600, d: 200 }, factor: 2, energy: -8000, cat: 'storage', desc: 'Silos sellados para almacenamiento de escoria industrial y minera. Evita el colapso fabril.' },
  vault: { name: 'Bóveda Protegida', icon: '🔒', cost: { m: 10000, c: 8000, d: 2000 }, factor: 2, energy: -16000, cat: 'storage', req: { metalStorage: 5, crystalStorage: 5 } },
  orbitalStorage: { name: 'Almacén Orbital', icon: '🛰️', cost: { m: 30000, c: 20000, d: 10000 }, factor: 2, energy: -20000, cat: 'storage', req: { vault: 3 } },

  // ===== ESPECIALES =====
  spacePort: { name: 'Puerto Espacial', icon: '🚀', cost: { m: 15000, c: 10000, d: 5000 }, factor: 1.8, energy: -45000, cat: 'special', req: { shipyard: 4 } },
  diploCenter: { name: 'Centro Diplomático', icon: '🤝', cost: { m: 8000, c: 12000, d: 4000 }, factor: 2, energy: -15000, cat: 'special', req: { researchLab: 4 } },
  galacticMarket: { name: 'Mercado Galáctico', icon: '💰', cost: { m: 20000, c: 25000, d: 10000 }, factor: 2, energy: -25000, cat: 'special', req: { diploCenter: 3 } },
  tradeNetwork: { name: 'Red Comercio Autom.', icon: '📡', cost: { m: 50000, c: 40000, d: 20000 }, factor: 2, energy: -35000, cat: 'special', req: { galacticMarket: 3 } },
  massDriver: { name: 'Catapulta Electromagnética', icon: '⚡', cost: { m: 60000, c: 45000, d: 20000 }, factor: 2, energy: -75000, energyFactor: 1.08, cat: 'special', req: { spacePort: 3, energy: 6 }, desc: 'Reduce el consumo de combustible de las flotas en un 40% al lanzarlas por aceleración de riel.' },
  hyperloopNetwork: { name: 'Red Maglev Hyperloop', icon: '🚄', cost: { m: 40000, c: 30000, d: 15000 }, factor: 1.8, energy: -35000, cat: 'special', req: { spacePort: 2 }, desc: 'Aumenta un 12% la productividad fabril al eliminar cuellos de botella de tránsito civil.' },

  // ===== AVANZADOS =====
  customShipyard: { name: 'Fábrica Naves Personalizadas', icon: '🔧', cost: { m: 200000, c: 150000, d: 80000 }, factor: 2, energy: -55000, energyFactor: 1.08, cat: 'advanced', req: { shipyard: 10, researchLab: 10 } },
  aiCore: { name: 'Núcleo de IA', icon: '🧠', cost: { m: 100000, c: 150000, d: 50000 }, factor: 2, energy: -50000, energyFactor: 1.10, cat: 'advanced', req: { researchLab: 10, computer: 8 } },
  nanoCenter: { name: 'Centro de Nanotecnología', icon: '⚙️', cost: { m: 150000, c: 100000, d: 80000 }, factor: 2, energy: -40000, energyFactor: 1.08, cat: 'advanced', req: { naniteFactory: 5, researchLab: 10 } },
  expLab: { name: 'Laboratorio Experimental', icon: '🧪', cost: { m: 200000, c: 300000, d: 100000 }, factor: 2.2, energy: -40000, energyFactor: 1.08, cat: 'advanced', req: { advResearchCenter: 5, researchLab: 12 } },
  geneticLab: { name: 'Centro Ing. Genética', icon: '🧬', cost: { m: 250000, c: 200000, d: 150000 }, factor: 2.2, energy: -35000, energyFactor: 1.07, cat: 'advanced', req: { expLab: 3 } },
  darkMatterPlant: { name: 'Planta Materia Oscura', icon: '🪐', cost: { m: 500000, c: 400000, d: 300000 }, factor: 2.5, energy: -90000, energyFactor: 1.12, bonusEnergyGen: 500, bonusEnergyGenFactor: 1.15, cat: 'advanced', req: { quantumReactor: 5, expLab: 5 } },

  // ===== CIVILES =====
  townHall: { name: 'Ayuntamiento', icon: '🏛️', cost: { m: 400, c: 200, d: 50 }, factor: 1.45, energy: -15000, energyFactor: 1.05, cat: 'civil', desc: 'Ayuntamiento colonial que impulsa el crecimiento continuo de la población.' },
  healthCenter: { name: 'Centro de Salud', icon: '🏥', cost: { m: 350, c: 300, d: 40 }, factor: 1.45, energy: -15000, energyFactor: 1.05, cat: 'civil', desc: 'Centro de salud que amplía la capacidad de población y reduce la mortalidad.' },
  leisureCenter: { name: 'Centro de Ocio', icon: '🎡', cost: { m: 600, c: 400, d: 100 }, factor: 1.45, energy: -15000, energyFactor: 1.04, cat: 'civil', desc: 'Centro de ocio que aumenta la felicidad, moral y productividad de la colonia.' },

  // ===== MEGA-INFRAESTRUCTURAS DE LA LONJA / EXCHANGE (Costes Mastodónticos +5 Ceros) =====
  exchangeDocks: { name: 'Muelles de Atraque Orbitales', icon: '🛸', cost: { m: 100000000, c: 80000000, d: 40000000 }, factor: 2.0, energy: -500000, cat: 'exchange', desc: 'Controla los slots de atraque simultáneos para parking logístico y flotas mercantes en espera de órdenes Limit.' },
  exchangeVaults: { name: 'Bóvedas Subterráneas de Custodia', icon: '🏦', cost: { m: 150000000, c: 100000000, d: 50000000 }, factor: 2.0, energy: -600000, cat: 'exchange', desc: 'Capacidad masiva de almacenamiento blindado de materias primas depositadas por los comerciantes.' },
  exchangeEngine: { name: 'Cámara de Cotización Cuántica', icon: '📈', cost: { m: 200000000, c: 250000000, d: 150000000 }, factor: 2.2, energy: -1000000, cat: 'exchange', desc: 'Motor de cálculo de precios dinámicos (AMM) y balanceo continuo de spread y comisiones del mercado.' },
  exchangeBank: { name: 'Banca Galáctica Central', icon: '💎', cost: { m: 250000000, c: 200000000, d: 100000000 }, factor: 2.0, energy: -800000, cat: 'exchange', desc: 'Emite y custodia los Créditos Estelares, liquidando dividendos del DAO e intereses a inversores.' },
  exchangeBastion: { name: 'Bastión de Baterías Planetarias', icon: '🛡️', cost: { m: 300000000, c: 150000000, d: 100000000 }, factor: 2.0, energy: -1500000, cat: 'exchange', desc: 'Primera línea de defensa pesada para neutralizar flotas piratas e intentos de asalto a los depósitos.' },
  exchangeBunkers: { name: 'Búnkeres Blindados de Aislamiento', icon: '🔒', cost: { m: 180000000, c: 120000000, d: 60000000 }, factor: 2.0, energy: -400000, cat: 'exchange', desc: 'Garantiza que hasta un 70% de las reservas queden selladas e invulnerables ante brechas de seguridad.' },
  exchangePatrols: { name: 'Hangar de Patrullas del DAO', icon: '🚀', cost: { m: 220000000, c: 180000000, d: 90000000 }, factor: 2.0, energy: -1200000, cat: 'exchange', desc: 'Mantiene escuadras de interceptación de élite en las rutas hiperespaciales de aproximación.' },
  exchangeBeacon: { name: 'Faro de Tráfico Galáctico', icon: '📡', cost: { m: 120000000, c: 150000000, d: 80000000 }, factor: 2.0, energy: -700000, cat: 'exchange', desc: 'Emite balizas de sincronización comercial que multiplican el volumen de flotas y comisiones globales.' },
};
