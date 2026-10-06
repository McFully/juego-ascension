/**
 * Catálogo de Operaciones y Consolas de Edificios de Ascensión.
 * Asocia cada edificio con su Ministerio de Estado rector, modos operativos, calibraciones y acciones interactivas.
 *
 * NOTA SOBRE `research`: los arrays están ordenados por COSTE PONDERADO ASCENDENTE
 * (metal + cristal*1.5 + deuterio*3) calculado sobre el dataset real. Es una red de
 * seguridad: la decisión la toma `researchScoring.js`, pero si el scoring se desactiva
 * o no hay laboratorio, recorrer el array en orden barato da un comportamiento decente.
 * `science` incluye `combustion`/`impulse` a propósito: son su prerrequisito más barato
 * y sin ellos Astrofísica (que exige impulse:3) quedaba bloqueada para siempre.
 *
 * Ministerios SIN array `research` a propósito (solo construyen):
 *   - Ninguno. Los 17 tienen al menos 2 technologies coherentes con su función.
 */

export const MINISTRY_MAPPING = {
  infra: {
    id: 'infra',
    name: 'Ministerio de Infraestructuras',
    icon: '🏗️',
    color: '#10b981',
    buildings: [
      'constructionCenter', 'robotFactory', 'naniteFactory', 'assemblyCenter',
      'modularFactory', 'industrialComplex', 'researchLab', 'shipyard'
    ],
    research: ['energy', 'miningAuto', 'modularEng', 'expDesign']
  },
  resources: {
    id: 'resources',
    name: 'Ministerio de Minería y Recursos',
    icon: '⛏️',
    color: '#d97706',
    buildings: [
      'metalMine', 'crystalMine', 'deutSynth'
    ],
    research: ['miningAuto']
  },
  industry: {
    id: 'industry',
    name: 'Ministerio de Industria',
    icon: '🏭',
    color: '#ea580c',
    buildings: [
      'refinery', 'chemPlant', 'synthPlant', 'enrichPlant', 'slagRecycler',
      'slagDenseArmorForge', 'slagPavingPlant', 'slagSyntheticSynthesizer'
    ],
    research: ['industrialOpt', 'modularEng']
  },
  economy: {
    id: 'economy',
    name: 'Ministerio de Economía',
    icon: '💼',
    color: '#f59e0b',
    buildings: [
      'galacticMarket', 'tradeNetwork'
    ],
    research: ['galacticTrade']
  },
  energy: {
    id: 'energy',
    name: 'Ministerio de Energía',
    icon: '⚡',
    color: '#eab308',
    buildings: [
      'solarPlant', 'geoPlant', 'orbitalEnergy', 'fusionReactor',
      'quantumReactor', 'darkMatterPlant'
    ],
    research: ['energy', 'advReactors', 'quantumEnergy', 'quantumNetworks', 'rtgGenerator']
  },
  science: {
    id: 'science',
    name: 'Ministerio de Ciencia',
    icon: '🔬',
    color: '#06b6d4',
    parentRequiredBuilding: 'researchLab',
    buildings: [
      'advResearchCenter', 'expLab'
    ],
    research: ['combustion', 'impulse', 'astrophysics', 'hyperspace', 'galacticCartography', 'quantumDrive', 'dimensionalExploration', 'singularity']
  },
  innovation: {
    id: 'innovation',
    name: 'Ministerio de Innovación',
    icon: '💡',
    color: '#38bdf8',
    parentRequiredBuilding: 'naniteFactory',
    buildings: [
      'nanoCenter'
    ],
    research: ['industrialOpt', 'nanoRepair', 'nanoTech', 'modularEng', 'expDesign', 'cyberIntegration']
  },
  cybernetics: {
    id: 'cybernetics',
    name: 'Ministerio de Cibernética e IA',
    icon: '🧠',
    color: '#818cf8',
    parentRequiredBuilding: 'researchLab',
    buildings: [
      'aiCore'
    ],
    research: ['computer', 'aiTactics', 'aiProd', 'aiMilitary', 'aiStrategy', 'fullAuto']
  },
  defense: {
    id: 'defense',
    name: 'Ministerio de Defensa',
    icon: '🛡️',
    color: '#ef4444',
    buildings: [
      'missileSilo', 'militaryAcademy'
    ],
    defenses: [
      'rocketLauncher', 'lightLaser', 'heavyLaser', 'gaussCannon', 'ionCannon', 'plasmaTurret', 'smallShieldDome', 'largeShieldDome'
    ],
    research: ['shields', 'weapons', 'armour', 'nanoRepair', 'defenseFields', 'fortressTech']
  },
  war: {
    id: 'war',
    name: 'Ministerio de Guerra',
    icon: '⚔️',
    color: '#b91c1c',
    parentRequiredBuilding: 'shipyard',
    buildings: [
      'customShipyard', 'commandCenter'
    ],
    ships: [
      'lightFighter', 'heavyFighter', 'cruiser', 'battleship', 'bomber', 'destroyer', 'deathstar', 'planetDestroyer'
    ],
    research: ['laser', 'combustion', 'impulse', 'plasma', 'ion', 'ballisticWeapons', 'advMissiles', 'orbitalArtillery']
  },
  transport: {
    id: 'transport',
    name: 'Ministerio de Transporte',
    icon: '🚄',
    color: '#0284c7',
    buildings: [
      'hyperloopNetwork', 'massDriver'
    ],
    research: ['interstellarNav']
  },
  logistics: {
    id: 'logistics',
    name: 'Ministerio de Logística',
    icon: '📦',
    color: '#0ea5e9',
    buildings: [
      'metalStorage', 'crystalStorage', 'deutStorage', 'slagStorage', 'logiCenter', 'vault', 'orbitalStorage', 'spacePort'
    ],
    ships: [
      'smallCargo', 'largeCargo', 'heavyFreighter', 'cargoTitan', 'recycler'
    ],
    research: ['advLogistics', 'molecularCargoCompress']
  },
  biosphere: {
    id: 'biosphere',
    name: 'Ministerio de Biosfera y Ecología',
    icon: '🌍',
    color: '#22c55e',
    parentRequiredBuilding: 'researchLab',
    buildings: [
      'terraformer', 'geneticLab', 'biomeDomeSimulation', 'geosphericEcoPark', 'planetaryClimatizer', 'pollutionScrubbers'
    ],
    research: ['deepScanner', 'advColonization', 'galacticCartography', 'dimensionalExploration']
  },
  agriculture: {
    id: 'agriculture',
    name: 'Ministerio de Agricultura y Alimentación',
    icon: '🌱',
    color: '#10b981',
    buildings: [
      'urbanHydroponic', 'waterTreatmentPlant', 'urbanGarbageRecycler'
    ],
    research: ['miningAuto', 'advColonization', 'galacticCartography']
  },
  civics: {
    id: 'civics',
    name: 'Ministerio de Asuntos Civiles y Demografía',
    icon: '🏛️',
    color: '#14b8a6',
    buildings: [
      'townHall', 'prefabHousingUnit', 'arcologyAlpha', 'healthCenter', 'bioRegenClinic', 'civilPowerGrid', 'vacuumTransitTubes', 'communityCenter'
    ],
    research: ['astrophysics', 'galacticTrade', 'advColonization']
  },
  diplomacy: {
    id: 'diplomacy',
    name: 'Ministerio Diplomático',
    icon: '🤝',
    color: '#a855f7',
    buildings: [
      'diploCenter', 'permanentEmbassy', 'consulateHeadquarters', 'treatyCoordinationOffice', 'humanitarianAssistance'
    ],
    research: ['advColonization', 'galacticCartography', 'dimensionalExploration']
  },
  intel: {
    id: 'intel',
    name: 'Ministerio de Inteligencia',
    icon: '🕵️',
    color: '#3b82f6',
    buildings: [
      'spyCenter', 'internalSecurityMinistry', 'deepScanner'
    ],
    ships: [
      'espionageProbe'
    ],
    ammo: [
      'interplanetaryMissile', 'antiBallisticMissile'
    ],
    research: ['espionage', 'advSensors', 'galacticCrypto']
  },
  justice: {
    id: 'justice',
    name: 'Ministerio de Justicia y Orden Federal',
    icon: '⚖️',
    color: '#6366f1',
    buildings: [
      'commandCenter', 'colonySupremeCourt', 'civilGuardCommand', 'galacticArbitrageCourt'
    ],
    research: ['shields', 'computer', 'galacticCrypto']
  },
  culture: {
    id: 'culture',
    name: 'Ministerio de Cultura y Sociedad',
    icon: '🎭',
    color: '#ec4899',
    buildings: [
      'leisureCenter', 'holographicLeisure', 'stellarProjectionTheater', 'zeroGravityGym', 'schoolEduCenter', 'stellarPhilosophyTemple', 'historicImperialArchive'
    ],
    research: ['astrophysics', 'advSensors', 'galacticCrypto', 'galacticCartography']
  },
  finance: {
    id: 'finance',
    name: 'Ministerio de Finanzas y Banca',
    icon: '🏦',
    color: '#eab308',
    buildings: [
      'financeMinistry', 'futuresExchange', 'exchangeBank', 'exchangeVaults', 'galacticMarket'
    ],
    research: ['galacticTrade', 'galacticCrypto', 'quantumCrypto']
  }
};

import { EXPANDED_BUILDING_OPERATIONS } from './expandedBuildingOperations.js';

const BASE_BUILDING_OPERATIONS = {
  // === ENERGÍA ===
  solarPlant: {
    title: 'Consola de Control Helio-Orbital',
    ministry: 'energy',
    modes: [
      { id: 'standard', name: 'Régimen Estándar', desc: 'Producción fotovoltaica nominal 100%. Desgaste nulo.', prodBonus: 1, energyMod: 0 },
      { id: 'overdrive', name: 'Sobrecarga de Espejos', desc: '+25% de energía producida a cambio de mantenimiento continuo de metal.', prodBonus: 1.25, energyMod: 0, costPerTick: { metal: 2 } },
      { id: 'shielded', name: 'Blindaje Térmico', desc: 'Producción 80%, pero genera micro-escudo térmico protector contra tormentas solares.', prodBonus: 0.8, energyMod: 0 }
    ],
    actions: [
      { id: 'alignMirrors', name: 'Reorientar Fotocélulas', desc: 'Genera un pulso instantáneo de energía recargando los condensadores.', cost: { crystal: 50 }, cooldownSec: 60 }
    ]
  },
  fusionReactor: {
    title: 'Cámara de Confinamiento Magnético',
    ministry: 'energy',
    modes: [
      { id: 'standard', name: 'Combustión Controlada', desc: 'Consumo y producción nominal de deuterio y energía.', prodBonus: 1, deutConsMod: 1 },
      { id: 'boosted', name: 'Inyección Enriquecida H-3', desc: '+40% energía producida, consume un 50% más de deuterio.', prodBonus: 1.4, deutConsMod: 1.5 },
      { id: 'low_burn', name: 'Quemado Económico', desc: '60% producción energética consumiendo solo el 40% de deuterio.', prodBonus: 0.6, deutConsMod: 0.4 }
    ],
    actions: [
      { id: 'purgePlasma', name: 'Purga de Escoria Plasmática', desc: 'Limpia el toroide de fusión, devolviendo deuterio refinado de alta pureza.', cost: {}, cooldownSec: 120 }
    ]
  },
  geoPlant: {
    title: 'Monitor Tectónico Geotérmico',
    ministry: 'energy',
    modes: [
      { id: 'standard', name: 'Sonda Térmica Estable', desc: 'Extracción estándar de calor de la corteza.', prodBonus: 1 },
      { id: 'deep_vent', name: 'Pozos Supercríticos', desc: '+30% energía geotérmica aprovechando magma profundo.', prodBonus: 1.3, costPerTick: { crystal: 1 } }
    ]
  },
  orbitalEnergy: {
    title: 'Matriz de Transmisión de Microondas',
    ministry: 'energy',
    modes: [
      { id: 'balanced', name: 'Distribución Global', desc: 'Alimenta uniformemente a toda la colonia.', focusTarget: 'all' },
      { id: 'focus_mines', name: 'Focalizar en Minas', desc: '+15% de velocidad a las minas de metal y cristal.', focusTarget: 'mines' },
      { id: 'focus_shipyard', name: 'Focalizar en Astilleros', desc: '+15% de velocidad de ensamblaje naval.', focusTarget: 'shipyard' },
      { id: 'focus_shields', name: 'Focalizar en Red Defensiva', desc: '+20% de regeneración de escudos planetarios.', focusTarget: 'shields' }
    ]
  },
  quantumReactor: {
    title: 'Regulador de Vacío Cuántico',
    ministry: 'energy',
    modes: [
      { id: 'standard', name: 'Estabilidad de Punto Cero', desc: 'Generación máxima estable.', prodBonus: 1 },
      { id: 'antimatter_condenser', name: 'Sintetizador de Antimateria', desc: 'Desvía el 25% de la energía para acumular cápsulas de deuterio super-enriquecido.', prodBonus: 0.75, antimatterYield: true }
    ]
  },

  // === RECURSOS / INDUSTRIA ===
  metalMine: {
    title: 'Supervisión de Extracción Minera',
    ministry: 'economy',
    modes: [
      { id: 'standard', name: 'Extracción Estándar', desc: 'Régimen de minado seguro sin perturbaciones tectónicas.', prodBonus: 1, energyMod: 1 },
      { id: 'deep_bore', name: 'Perforación Tectónica Profunda', desc: '+25% de extracción de metal, requiere +35% de consumo de energía.', prodBonus: 1.25, energyMod: 1.35 },
      { id: 'conservation', name: 'Modo Eco-Minado', desc: '75% de producción con solo 50% de gasto energético.', prodBonus: 0.75, energyMod: 0.5 }
    ],
    actions: [
      { id: 'detonateVein', name: 'Detonación de Veta Sísmica', desc: 'Dinamita un filón subterráneo aportando una cantidad inmediata de metal.', cost: { deuterium: 200 }, cooldownSec: 90 }
    ]
  },
  crystalMine: {
    title: 'Control de Cristalografía Subterránea',
    ministry: 'economy',
    modes: [
      { id: 'standard', name: 'Corte por Resonancia Nominal', desc: 'Extracción pura de matrices de cristal.', prodBonus: 1, energyMod: 1 },
      { id: 'laser_fracture', name: 'Fractura Láser Acelerada', desc: '+30% de producción de cristal con +40% de gasto energético.', prodBonus: 1.3, energyMod: 1.4 },
      { id: 'precision', name: 'Extracción Quirúrgica', desc: '90% producción, genera probabilidad de recuperar componentes electrónicos.', prodBonus: 0.9, energyMod: 0.8 }
    ],
    actions: [
      { id: 'harvestGems', name: 'Cosecha de Prismas Puros', desc: 'Recolecta gemas resonantes de alta pureza al instante.', cost: { metal: 300 }, cooldownSec: 90 }
    ]
  },
  deutSynth: {
    title: 'Separador Isotópico de Deuterio',
    ministry: 'economy',
    modes: [
      { id: 'standard', name: 'Centrifugado Atmosférico', desc: 'Condensación continua de deuterio estándar.', prodBonus: 1, energyMod: 1 },
      { id: 'super_heavy', name: 'Filtrado Hiperpesado', desc: '+25% de deuterio, requiere flujo de cristal para los filtros.', prodBonus: 1.25, energyMod: 1.2, costPerTick: { crystal: 2 } }
    ]
  },
  refinery: {
    title: 'Altos Hornos de Aleaciones',
    ministry: 'industry',
    modes: [
      { id: 'metal_focus', name: 'Laminado Pesado de Titanio', desc: 'Convierte parte del cristal en metal ultra denso (+15% metal).', prodBonusMetal: 1.15 },
      { id: 'pure_slag', name: 'Reciclaje de Escoria Integral', desc: 'Recupera un 5% extra de todos los recursos procesados.' }
    ],
    actions: [
      { id: 'smeltReserves', name: 'Colada Continua de Emergencia', desc: 'Funde escoria en bruto convirtiéndola en 2.000 unidades de metal inmediato.', cost: { deuterium: 100 }, cooldownSec: 150 }
    ]
  },
  slagRecycler: {
    title: 'Planta de Revalorización y Reciclaje de Escoria',
    ministry: 'industry',
    modes: [
      { id: 'circular_standard', name: 'Ciclo Cerrado Sostenible', desc: 'Recuperación equilibrada de aleaciones metálicas (70%) y matrices cristalinas (25%).' },
      { id: 'overdrive_refine', name: 'Purificación Térmica Forzada', desc: '+25% tasa de conversión de escoria, requiere +20% energía.', energyMod: 1.2 }
    ],
    actions: [
      { id: 'purgeVats', name: 'Purga Rápida de Crisoles', desc: 'Evacua 1.000 unidades de escoria residual acumulada de forma instantánea.', cost: { deuterium: 50 }, cooldownSec: 90 }
    ]
  },
  slagStorage: {
    title: 'Silos Blindados de Escoria',
    ministry: 'logistics',
    modes: [
      { id: 'pressurized', name: 'Contención Presurizada', desc: 'Sella los residuos pesados evitando cualquier contaminación ambiental.', protectRate: 1.0 },
      { id: 'overflow_filter', name: 'Filtro de Desbordamiento', desc: 'Prioriza el vaciado continuo hacia los recicladores locales.' }
    ]
  },

  // === INFRAESTRUCTURA / OBRAS CIVILES ===
  robotFactory: {
    title: 'Línea Automatizada de Autómatas',
    ministry: 'infra',
    modes: [
      { id: 'civil', name: 'Cuadrillas de Urbanización', desc: '-15% tiempo de construcción de edificios civiles y minas.', target: 'buildings' },
      { id: 'assembly', name: 'Robots de Dique Seco', desc: '-15% tiempo de ensamblaje en el astillero naval.', target: 'ships' }
    ]
  },
  naniteFactory: {
    title: 'Matriz de Control de Enjambres Nanitas',
    ministry: 'infra',
    modes: [
      { id: 'construction', name: 'Enjambre Constructor', desc: '-25% tiempo de todas las construcciones planetarias.', target: 'build' },
      { id: 'defense_repair', name: 'Enjambre Auto-Reparador', desc: 'Repara automáticamente un 10% de defensas dañadas tras cada combate.', target: 'repair' },
      { id: 'recycle', name: 'Desensamblaje Molecular', desc: 'Recicla estructuras obsoletas devolviendo el 50% de los recursos.', target: 'recycle' }
    ],
    actions: [
      { id: 'instantOverhaul', name: 'Acelerar Proyecto Activo', desc: 'Consume un pulso de nanitas para restar 60 segundos a la construcción en curso.', cost: { metal: 1000, crystal: 500 }, cooldownSec: 180 }
    ]
  },
  vault: {
    title: 'Bóveda Subterránea Inexpugnable',
    ministry: 'infra',
    modes: [
      { id: 'safe_vault', name: 'Protección Total de Reservas', desc: 'Garantiza que el 50% de los recursos del planeta son inmunes a saqueo.', protectRate: 0.5 },
      { id: 'auto_market', name: 'Liquidación de Excedentes', desc: 'Si los almacenes alcanzan el 95%, vende el sobrante por créditos galácticos.', autoSell: true }
    ]
  },
  spaceElevator: {
    title: 'Control de Ascensión Orbital',
    ministry: 'infra',
    modes: [
      { id: 'standard', name: 'Tránsito de Pasajeros y Mineral', desc: 'Reduce el combustible de despegue en un 70%.', fuelDiscount: 0.7 },
      { id: 'mass_loading', name: 'Carga Orbital Express', desc: 'Los transportes se abastecen en órbita duplicando su velocidad de carga.', fastLoad: true }
    ],
    actions: [
      { id: 'orbitalDrop', name: 'Lanzamiento Catapultado de Flota', desc: 'Eyecta la flota en órbita con un impulso electromagnético inicial (+20% velocidad primer viaje).', cost: { deuterium: 200 }, cooldownSec: 120 }
    ]
  },

  // === CIENCIA ===
  researchLab: {
    title: 'Matriz Científica de I+D',
    ministry: 'science',
    modes: [
      { id: 'general', name: 'Investigación Abierta', desc: 'Reparto uniforme de recursos de cálculo para toda ciencia.', bonusBranch: null },
      { id: 'propulsion', name: 'Foco en Astrofísica y Propulsión', desc: '+25% velocidad para motores, hiperespacio y navegación.', bonusBranch: 'propulsion' },
      { id: 'military', name: 'Foco en Balística y Defensas', desc: '+25% velocidad para láseres, blindajes y escudos.', bonusBranch: 'military' },
      { id: 'energy', name: 'Foco en Física Cuántica y Reactores', desc: '+25% velocidad para energía cuántica y fusión.', bonusBranch: 'power' }
    ],
    actions: [
      { id: 'eurekaPulse', name: 'Simulación Algorítmica de I+D', desc: 'Inyecta cálculo experimental restando 60 segundos a la investigación en curso.', cost: { crystal: 800, deuterium: 400 }, cooldownSec: 180 }
    ]
  },
  aiCore: {
    title: 'Núcleo de Inteligencia Artificial',
    ministry: 'science',
    modes: [
      { id: 'tactics', name: 'Matriz Bélica de Predicción', desc: '+10% puntería y daño crítico para todas las flotas aliadas.', bonusCombat: 0.1 },
      { id: 'logistics', name: 'Optimización Algorítmica Colonial', desc: '-8% consumo de energía de toda la infraestructura del planeta.', energyDiscount: 0.08 }
    ],
    actions: [
      { id: 'simulateBattle', name: 'Ejecutar Simulación de Batalla', desc: 'Simula probabilidades tácticas del próximo enfrentamiento.', cost: { deuterium: 50 }, cooldownSec: 30 }
    ]
  },

  // === DEFENSA ===
  shipyard: {
    title: 'Dique Seco y Ensamblaje Naval',
    ministry: 'defense',
    modes: [
      { id: 'balanced', name: 'Cadena de Montaje Estándar', desc: 'Ensamblaje equilibrado de todas las clases de naves.', shipFocus: 'all' },
      { id: 'light_swarm', name: 'Línea de Enjambre Ligero', desc: '+30% velocidad para cazas y sondas de espionaje.', shipFocus: 'light' },
      { id: 'capital_docks', name: 'Diques para Naves Capitales', desc: '+25% velocidad para cruceros, acorazados y destructores.', shipFocus: 'capital' }
    ],
    actions: [
      { id: 'fastRefit', name: 'Modernización en Dique Seco (Retrofit)', desc: 'Actualiza escuadrones obsoletos con el último nivel de blindaje y armamento por una fracción de coste.', cost: { metal: 500, crystal: 300 }, cooldownSec: 120 }
    ]
  },
  missileSilo: {
    title: 'Baterías de Silos Subterráneos',
    ministry: 'defense',
    modes: [
      { id: 'abm_priority', name: 'Defensa Anti-Balística Automática', desc: 'Dispara interceptores al detectar misiles entrantes sin confirmación.', autoIntercept: true },
      { id: 'silo_stealth', name: 'Camuflaje Térmico de Silos', desc: 'Oculta la cantidad real de misiles frente a sondas de espionaje enemigas.', stealth: true }
    ],
    actions: [
      { id: 'fireInterplanetarySalvo', name: 'Disparar Salva Táctica MIP', desc: 'Lanza misiles interplanetarios contra colonias enemigas a alcance.', cost: { deuterium: 1000 }, cooldownSec: 300 }
    ]
  },
  militaryAcademy: {
    title: 'Colegio de Oficiales y Doctrina',
    ministry: 'defense',
    modes: [
      { id: 'assault', name: 'Doctrina de Choque y Asalto', desc: '+12% daño de naves de ataque en la primera ronda de combate.' },
      { id: 'bulwark', name: 'Doctrina de Bastión Defensivo', desc: '+15% resistencia de escudos y defensas planetarias.' }
    ],
    actions: [
      { id: 'trainAdmiral', name: 'Graduar Comandante Estelar', desc: 'Otorga un almirante con talentos especiales para liderar flotas.', cost: { crystal: 2000, deuterium: 1000 }, cooldownSec: 600 }
    ]
  },

  // === AGRICULTURA / POBLACIÓN / BIOSFERA ===
  townHall: {
    title: 'Gabinete Cívico y Censo Colonial',
    ministry: 'civics',
    modes: [
      { id: 'welfare', name: 'Estado de Bienestar y Salud', desc: '+15% felicidad de la población y aumento del índice de natalidad.', happinessBonus: 0.15 },
      { id: 'industrial_tax', name: 'Gravamen Industrial Extra', desc: '+20% ingresos en créditos fiscales a costa de un ligero descontento.', taxBonus: 0.2, happinessBonus: -0.1 }
    ],
    actions: [
      { id: 'organizeFestival', name: 'Celebrar Festival Interestelar', desc: 'Dispara temporalmente la moral ciudadana y la atracción de colonos.', cost: { crystal: 400 }, cooldownSec: 300 }
    ]
  },
  terraformer: {
    title: 'Consola Atmosférica de Terraformación',
    ministry: 'biosphere',
    modes: [
      { id: 'stabilize', name: 'Climatización Estable', desc: 'Reduce los efectos de temperaturas extremas en la producción de energía y minas.', weatherProof: true },
      { id: 'accelerate_clearing', name: 'Desbroce Tectónico Continuo', desc: 'Prepara el terreno para añadir parcelas habitables adicionales.', terraformFast: true }
    ],
    actions: [
      { id: 'clearHostileSector', name: 'Despejar Sector Hostil', desc: 'Descontamina una zona radiactiva o volcánica desbloqueando +1 parcela edificable.', cost: { metal: 10000, crystal: 5000, deuterium: 2000 }, cooldownSec: 600 }
    ]
  },
  prefabHousingUnit: {
    title: 'Consola de Alojamientos Prefabricados',
    ministry: 'civics',
    modes: [
      { id: 'high_density', name: 'Densificación Rápida', desc: '+20% capacidad residencial de los módulos compactos con consumo mínimo.', popCapBonus: 0.20 },
      { id: 'standard', name: 'Habitabilidad Estándar', desc: 'Confort óptimo para los trabajadores recién llegados.', popCapBonus: 0 }
    ],
    actions: [
      { id: 'rapidSubdivision', name: 'Subdivisión Modular Express', desc: 'Reconfigura tabiques internos liberando alojamiento de emergencia.', cost: { metal: 300, crystal: 150 }, cooldownSec: 180 }
    ]
  },
  arcologyAlpha: {
    title: 'Núcleo Central de la Arcología',
    ministry: 'civics',
    modes: [
      { id: 'ecumenopolis', name: 'Régimen de Megaciudad Autónoma', desc: '+15% productividad general en toda la arcología y soporte para millones de habitantes.', prodBonus: 1.15 },
      { id: 'subterranean_expansion', name: 'Apertura de Subniveles Profundos', desc: '+30% capacidad máxima de población de la arcología.', popCapBonus: 0.30 }
    ],
    actions: [
      { id: 'culturalSummit', name: 'Cumbre Ciudadana Colonial', desc: 'Aumenta la moral planetaria a niveles máximos mediante asambleas cívicas.', cost: { crystal: 1500, deuterium: 500 }, cooldownSec: 400 }
    ]
  },
  bioRegenClinic: {
    title: 'Laboratorio de Sanación Bio-Regenerativa',
    ministry: 'civics',
    modes: [
      { id: 'longevity', name: 'Terapia Génica de Longevidad', desc: '+25% esperanza de vida y reducción drástica de bajas por enfermedad.', healthBonus: 0.25 },
      { id: 'stamina_boost', name: 'Tratamiento de Eficiencia Celular', desc: '+10% resistencia física y menor propensión a accidentes laborales en minas.', staminaBonus: 0.10 }
    ],
    actions: [
      { id: 'cellularVaccineWave', name: 'Vacunación Planetaria Masiva', desc: 'Erradica brotes infecciosos y otorga inmunidad médica inmediata.', cost: { crystal: 800, deuterium: 400 }, cooldownSec: 300 }
    ]
  },
  urbanHydroponic: {
    title: 'Control Automatizado de Invernaderos',
    ministry: 'agriculture',
    modes: [
      { id: 'intensive_crop', name: 'Cosecha Hidropónica Acelerada', desc: '+35% producción de biomasa y nutrientes para la población planetaria.', foodBonus: 0.35 },
      { id: 'synthetic_protein', name: 'Síntesis de Proteína Pura', desc: 'Producción de alimentos de alta densidad energética para expediciones.', foodQuality: 1.2 }
    ],
    actions: [
      { id: 'nutrientSurge', name: 'Pulso de Nutrientes Esenciales', desc: 'Genera un excedente instantáneo de raciones alimentarias eliminando riesgos de hambruna.', cost: { crystal: 400, deuterium: 200 }, cooldownSec: 240 }
    ]
  },
  townHall: {
    title: 'Sede del Gobierno Cívico y Administración',
    ministry: 'civics',
    modes: [
      { id: 'open_doors', name: 'Censo y Acogida Abierta', desc: '+20% velocidad de llegada y radicación de nueva población inmigrante.', migrationBonus: 0.20 },
      { id: 'strict_audit', name: 'Fiscalización y Orden Cívico', desc: 'Optimiza la recaudación tributaria y mantiene control absoluto sobre desórdenes.', taxBonus: 0.15 }
    ],
    actions: [
      { id: 'extraordinaryCensus', name: 'Censo Imperial Extraordinario', desc: 'Realiza un empadronamiento general otorgando tributos adicionales inmediatos y reputación.', cost: { metal: 2000, crystal: 1000 }, cooldownSec: 480 }
    ]
  },
  waterTreatmentPlant: {
    title: 'Complejo de Tratamiento y Depuración Hídrica',
    ministry: 'agriculture',
    modes: [
      { id: 'mineral_recovery', name: 'Recuperación de Residuos Minerales', desc: 'Filtra metales disueltos en las aguas residuales generando metal adicional.', metalRecovery: 0.05 },
      { id: 'deep_purity', name: 'Purificación de Grado Cero', desc: 'Maximiza la pureza hídrica garantizando óptima salubridad y +10% salud global.', healthBonus: 0.10 }
    ],
    actions: [
      { id: 'aquiferFlush', name: 'Descarga Ecológica de Acuíferos', desc: 'Limpia sedimentos tóxicos subterráneos restaurando la habitabilidad ambiental.', cost: { metal: 1500, deuterium: 800 }, cooldownSec: 360 }
    ]
  },
  schoolEduCenter: {
    title: 'Universidad y Academia Tecnológica Colonial',
    ministry: 'culture',
    modes: [
      { id: 'applied_science', name: 'Especialización Científica Aplicada', desc: '+15% velocidad de generación de puntos de ciencia e investigación colonial.', scienceBonus: 0.15 },
      { id: 'civic_virtues', name: 'Doctrina Imperial y Cohesión Social', desc: 'Formación cívica patriótica que reduce a cero cualquier índice de descontento.', loyaltyBonus: 0.25 }
    ],
    actions: [
      { id: 'scientificSymposium', name: 'Simposio Galáctico de Innovación', desc: 'Reúne a las mentes más brillantes acelerando temporalmente las investigaciones activas.', cost: { crystal: 3000, deuterium: 1500 }, cooldownSec: 600 }
    ]
  },
  colonySupremeCourt: {
    title: 'Corte Suprema de Justicia y Mediación',
    ministry: 'justice',
    modes: [
      { id: 'commercial_arbitrage', name: 'Tribunal de Arbitraje Comercial', desc: 'Garantiza contratos justos reduciendo comisiones en el Mercado Galáctico.', marketFeeReduction: 0.05 },
      { id: 'unyielding_justice', name: 'Sentencias de Tolerancia Cero', desc: 'Elimina cualquier tipo de corrupción o fuga de recursos de los almacenes.', corruptionProtection: true }
    ],
    actions: [
      { id: 'judicialAmnesty', name: 'Edicto de Pacificación y Orden', desc: 'Resuelve litigios y disputas civiles elevando la moral pública planetaria al máximo.', cost: { metal: 1000, crystal: 500 }, cooldownSec: 300 }
    ]
  },
  permanentEmbassy: {
    title: 'Cancillería y Embajada Permanente Galáctica',
    ministry: 'diplomacy',
    modes: [
      { id: 'trade_envoys', name: 'Misiones Comerciales Interestelares', desc: '+10% ingresos comerciales en acuerdos con facciones neutrales o aliadas.', tradeBonus: 0.10 },
      { id: 'cultural_attaché', name: 'Diplomacia y Vínculos de Paz', desc: 'Mejora sostenida continua de la reputación imperial diplomática.', repGain: 0.05 }
    ],
    actions: [
      { id: 'humanitarianTreaty', name: 'Pacto de Asistencia Humanitaria', desc: 'Envía suministros diplomáticos a vecinos galácticos ganando +5 de reputación imperial directa.', cost: { crystal: 5000, deuterium: 2500 }, cooldownSec: 720 }
    ]
  }
};

export const BUILDING_OPERATIONS = {
  ...BASE_BUILDING_OPERATIONS,
  ...EXPANDED_BUILDING_OPERATIONS
};
