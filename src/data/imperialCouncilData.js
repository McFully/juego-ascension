/**
 * Catálogo del Consejo Imperial, Senado y Sistema de Demandas Coloniales (10+ Planetas)
 */

export const IMPERIAL_COUNCIL_PORTFOLIOS = [
  {
    id: 'economy',
    name: 'Gran Cancillería de Economía y Hacienda',
    icon: '💼',
    color: '#f59e0b',
    desc: 'Regula aranceles globales, subsidios de obras y recaudación fiscal común en todos los mundos.',
    globalBonusText: '+15% Producción global de recursos, -8% Coste de infraestructuras en el Imperio',
    bonuses: { globalProd: 15, buildDiscount: 8 }
  },
  {
    id: 'resources',
    name: 'Comisariado Supremo de Minería y Energía',
    icon: '⛏️',
    color: '#d97706',
    desc: 'Coordina los convoyes de metal, núcleos geotérmicos y síntesis pesada en todas las colonias.',
    globalBonusText: '+20% Extracción de Metal y Deuterio, +15% Capacidad de almacenamiento imperial',
    bonuses: { metalProd: 20, deutProd: 20, storageBoost: 15 }
  },
  {
    id: 'defense',
    name: 'Alto Mando de Flota y Defensa Imperial',
    icon: '🛡️',
    color: '#ef4444',
    desc: 'Estandariza los astilleros navales, patrullas del espacio profundo y fortalezas de bastión.',
    globalBonusText: '+20% Velocidad de ensamblaje naval, +12% Escudos y estructura de naves imperiales',
    bonuses: { shipSpeed: 20, shipHull: 12, shipShield: 12 }
  },
  {
    id: 'science',
    name: 'Academia Imperial de Ciencias y Tecnologías',
    icon: '🔬',
    color: '#06b6d4',
    desc: 'Enlaza los laboratorios de todos los planetas en una red de cálculo cuántico unificado.',
    globalBonusText: '+25% Velocidad de Investigación, -10% Coste en Deuterio de I+D',
    bonuses: { researchSpeed: 25, researchCostRed: 10 }
  },
  {
    id: 'civics',
    name: 'Magisterio de Cohesión Social y Orden Federal',
    icon: '🏛️',
    color: '#8b5cf6',
    desc: 'Monitorea la lealtad colonial, satisface peticiones ciudadanas y regula la migración estelar.',
    globalBonusText: '+20% Estabilidad y moral de colonias, -50% Riesgo de protestas o huelgas',
    bonuses: { stability: 20, unrestReduction: 50 }
  }
];

export const IMPERIAL_COUNCIL_CANDIDATES = [
  {
    id: 'min_sup_1',
    name: 'Gran Canciller Alistair Thorne',
    portfolio: 'economy',
    title: 'Arquitecto del Mercado Federal',
    icon: '🤵',
    desc: 'Ex-gobernador del sector comercial central. Optimiza las arcas del imperio.',
    bonusKey: 'economy',
    influenceCost: 40
  },
  {
    id: 'min_sup_2',
    name: 'Directora Helena Vane',
    portfolio: 'resources',
    title: 'Pionera de la Minería Tectónica',
    icon: '👩‍🔧',
    desc: 'Experta en extracción masiva y estabilización de núcleos planetarios.',
    bonusKey: 'resources',
    influenceCost: 40
  },
  {
    id: 'min_sup_3',
    name: 'Almirante Supremo Marcus Vance',
    portfolio: 'defense',
    title: 'Héroe de la Tercera Frontera',
    icon: '🎖️',
    desc: 'Estratega de combate y maestro en despliegue de armadas estelares.',
    bonusKey: 'defense',
    influenceCost: 50
  },
  {
    id: 'min_sup_4',
    name: 'Dra. Selene Kaelis',
    portfolio: 'science',
    title: 'Matemática Cuántica de Vanguardia',
    icon: '👩‍🔬',
    desc: 'Creadora de la matriz de hiper-cálculo interplanetario.',
    bonusKey: 'science',
    influenceCost: 40
  },
  {
    id: 'min_sup_5',
    name: 'Tribuno Cassian Drake',
    portfolio: 'civics',
    title: 'Defensor de los Derechos Coloniales',
    icon: '⚖️',
    desc: 'Conciliador entre mundos mineros marginados y la metrópolis central.',
    bonusKey: 'civics',
    influenceCost: 35
  }
];

export const IMPERIAL_SENATE_BILLS = [
  {
    id: 'bill_naval_mobilization',
    title: 'Ley de Movilización Naval Permanente',
    icon: '🚀',
    category: 'Militar',
    proposerFaction: 'Militaristas',
    description: 'Prioriza los astilleros imperiales para la defensa del cuadrante. Aumenta la producción naval pero grava a las industrias pacíficas.',
    effects: {
      positive: '+25% Velocidad de Astilleros en todo el Imperio',
      negative: '-5% Producción de Cristal en Colonias Agrícolas'
    },
    favoredBiomes: ['volcanic', 'barren'],
    opposedBiomes: ['temperate', 'oceanic'],
    influenceToLobby: 25
  },
  {
    id: 'bill_mining_subsidies',
    title: 'Edicto de Equidad Geológica e Infraestructura',
    icon: '⛏️',
    category: 'Económica',
    proposerFaction: 'Industrialistas',
    description: 'Establece precios de garantía y subsidios de maquinaria pesada para los mundos de extracción profunda.',
    effects: {
      positive: '+20% Producción de Metal y Deuterio',
      negative: '-8% Tasa de crecimiento de Población civil'
    },
    favoredBiomes: ['volcanic', 'desert'],
    opposedBiomes: ['temperate'],
    influenceToLobby: 20
  },
  {
    id: 'bill_academic_network',
    title: 'Tratado de Libertad y Cómputo Cuántico',
    icon: '🔬',
    category: 'Científica',
    proposerFaction: 'Tecnócratas',
    description: 'Interconecta todas las redes académicas planetarias y libera patentes federales.',
    effects: {
      positive: '+20% Velocidad de Investigación Científica',
      negative: '-10% Capacidad de almacenamiento comercial'
    },
    favoredBiomes: ['frozen', 'ice'],
    opposedBiomes: ['volcanic'],
    influenceToLobby: 30
  },
  {
    id: 'bill_colonial_welfare',
    title: 'Carta Magna de Bienestar de Frontera',
    icon: '🌱',
    category: 'Civil',
    proposerFaction: 'Progresistas',
    description: 'Destina fondos de la capital para garantizar hospitales, biomas templados y reservas hídricas en colonias lejanas.',
    effects: {
      positive: '+30% Crecimiento de Población y +15% Felicidad',
      negative: '-5% Metal entregado al fisco central'
    },
    favoredBiomes: ['temperate', 'oceanic'],
    opposedBiomes: ['barren', 'desert'],
    influenceToLobby: 25
  },
  {
    id: 'bill_quantum_network',
    title: 'Acta de Construcción de la Gran Red Cuántica Imperial',
    icon: '🌀',
    category: 'Megaproyecto',
    proposerFaction: 'Alta República',
    description: 'Autoriza la financiación interestelar y despliegue del Portal Cuántico Federal para permitir saltos instantáneos entre mundos.',
    effects: {
      positive: 'Desbloquea el Megaproyecto del Portal Cuántico y reduce a 1 ciclo el viaje entre mundos enlazados',
      negative: 'Aplica una tasa temporal del 5% sobre la recaudación imperial de metal y deuterio'
    },
    favoredBiomes: ['frozen', 'ice', 'temperate'],
    opposedBiomes: ['barren'],
    influenceToLobby: 35
  }
];

export const COLONY_DEMAND_TYPES = {
  food_supplies: {
    title: 'Déficit de Suministros Vitales',
    icon: '🍞',
    desc: 'Los colonos carecen de reservas alimentarias y bienes de soporte vital. Exigen un envío urgente de Cristal y Metal.',
    reqRes: { metal: 10000, crystal: 5000 },
    penalty: '-30% Producción de recursos mientras dure el desabastecimiento.',
    reward: '+10 Moral colonial y +15 Influencia.'
  },
  energy_grid: {
    title: 'Sobrecarga de Red Energética',
    icon: '⚡',
    desc: 'Las turbinas y reactores locales sufren fallos por frío extremo o demanda industrial. Requieren Deuterio refinado.',
    reqRes: { deuterium: 6000 },
    penalty: '-40% Eficiencia de edificios.',
    reward: '+10 Estabilidad planetaria y +10 Influencia.'
  },
  heavy_machinery: {
    title: 'Demanda de Taladros y Maquinaria',
    icon: '⚙️',
    desc: 'Vetas profundas descubiertas pero inaccesibles sin aleaciones pesadas importadas de la capital.',
    reqRes: { metal: 20000 },
    penalty: 'Paralización de proyectos de expansión.',
    reward: '+25% Extracción de Metal temporal y +20 Influencia.'
  }
};
