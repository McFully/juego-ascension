export const SECTOR_DOCTRINES = [
  {
    id: 'mining',
    name: 'Doctrina Minera y Energética',
    icon: '⛏️',
    color: '#f59e0b',
    desc: 'Prioriza la elevación de Minas de Metal, Cristal, Sintetizadores de Deuterio y Silos de Almacén.',
    priorityBuildings: ['metalMine', 'crystalMine', 'deutSynth', 'solarPlant', 'fusionPlant', 'metalStorage', 'crystalStorage', 'deutTank'],
    bonusText: '+20% Producción minera en el sector, -10% Consumo energético'
  },
  {
    id: 'bastion',
    name: 'Doctrina de Bastión y Flota',
    icon: '🛡️',
    color: '#ef4444',
    desc: 'Prioriza Astilleros, Silos de Misiles, Lanza-Misiles, Láseres y Cúpulas Defensivas.',
    priorityBuildings: ['shipyard', 'missileSilo', 'naniteFactory', 'robotFactory'],
    priorityDefenses: ['rocketLauncher', 'lightLaser', 'heavyLaser', 'ionCannon', 'gaussCannon', 'plasmaTurret', 'smallShieldDome', 'largeShieldDome'],
    bonusText: '+25% Velocidad de ensamblaje naval, +15% Escudos defensivos en el sector'
  },
  {
    id: 'science',
    name: 'Doctrina Tecnológica Cuántica',
    icon: '🔬',
    color: '#06b6d4',
    desc: 'Prioriza Laboratorios de Investigación, Fábricas de Nanobots y Plantas de Fusión.',
    priorityBuildings: ['researchLab', 'naniteFactory', 'fusionPlant', 'solarPlant'],
    bonusText: '+30% Velocidad de cómputo científico, -15% Coste de I+D en el sector'
  },
  {
    id: 'commercial',
    name: 'Doctrina Mercantil y Logística',
    icon: '💼',
    color: '#10b981',
    desc: 'Prioriza Mercados Galácticos, Centros Diplomáticos y Naves Cargueras para distribución rápida.',
    priorityBuildings: ['galacticMarket', 'diploCenter', 'metalStorage', 'crystalStorage', 'deutTank'],
    bonusText: '+25% Capacidad de carga de convoyes, +20% Tipos de cambio en mercado'
  }
];

export const VICEROY_CANDIDATES = [
  {
    id: 'viceroy_1',
    name: 'Barón Thorgar Vane',
    title: 'Virrey de los Yacimientos Profundos',
    icon: '🧔',
    favoredDoctrine: 'mining',
    desc: 'Veterano de perforaciones tectónicas en biomas volcánicos y estériles.',
    influenceCost: 25,
    sectorBonus: { miningProd: 15, buildSpeed: 10 }
  },
  {
    id: 'viceroy_2',
    name: 'Comodoro Valeriya Cross',
    title: 'Virreina de la Vanguardia Orbital',
    icon: '👩‍✈️',
    favoredDoctrine: 'bastion',
    desc: 'Estratega de fortificaciones fronterizas y despliegue rápido de baterías de misiles.',
    influenceCost: 30,
    sectorBonus: { defenseHull: 20, shipSpeed: 15 }
  },
  {
    id: 'viceroy_3',
    name: 'Archicanciller Soren Kael',
    title: 'Virrey del Cómputo Cuántico',
    icon: '🧑‍🔬',
    favoredDoctrine: 'science',
    desc: 'Pionero en redes de telemetría y aceleración de partículas.',
    influenceCost: 25,
    sectorBonus: { researchSpeed: 20, energyProd: 15 }
  },
  {
    id: 'viceroy_4',
    name: 'Cónsul Lyra Sterling',
    title: 'Virreina del Comercio Federado',
    icon: '👩‍💼',
    favoredDoctrine: 'commercial',
    desc: 'Magnate de convoyes mercantes interestelares y nivelación automática de recursos.',
    influenceCost: 25,
    sectorBonus: { tradeRates: 15, routeSpeed: 25 }
  }
];
