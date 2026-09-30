// Catálogo comercial galáctico: Lotes navales de ocasión, contratos y mercado negro

export const MARKET_BASE_VALUES = {
  metal: 1.0,
  crystal: 1.65,
  deuterium: 3.3,
  credits: 1.0
};

// Naves usadas y de ocasión disponibles en el bazar
export const USED_SHIPS_CATALOG = [
  {
    id: 'used_small_cargo_bulk',
    shipId: 'smallCargo',
    title: 'Flotilla de Cargueras Ligeras Reacondicionadas',
    quantity: 5,
    condition: 'Grado B (Revisión de motores completada)',
    conditionPercent: 88,
    cost: { metal: 7500, crystal: 7500, deuterium: 500 },
    originalCost: { metal: 10000, crystal: 10000, deuterium: 0 },
    discountPercent: 25,
    seller: 'Consorcio Minero de Orión',
    description: 'Naves de transporte rápido con blindaje repasado y bodegas selladas para tránsito interplanetario.',
    icon: '📦'
  },
  {
    id: 'used_large_cargo_pair',
    shipId: 'largeCargo',
    title: 'Par de Supercargueros Clase Titán',
    quantity: 2,
    condition: 'Grado A (Casco reforzado)',
    conditionPercent: 95,
    cost: { metal: 9500, crystal: 9500, deuterium: 1000 },
    originalCost: { metal: 12000, crystal: 12000, deuterium: 0 },
    discountPercent: 20,
    seller: 'Sindicato de Fletes Altair',
    description: 'Diseñadas para transporte masivo de mineral bruto entre colonias lejanas.',
    icon: '🚚'
  },
  {
    id: 'used_heavy_fighters_squad',
    shipId: 'heavyFighter',
    title: 'Escuadrón Veterano de Cazadores Pesados',
    quantity: 4,
    condition: 'Grado B (Historial de combate activo)',
    conditionPercent: 82,
    cost: { metal: 18000, crystal: 12000, deuterium: 2000 },
    originalCost: { metal: 24000, crystal: 16000, deuterium: 0 },
    discountPercent: 25,
    seller: 'Veteranos Desmovilizados de Vega',
    description: 'Cazas con aviónica militar probada y baterías de iones calibradas.',
    icon: '🛩️'
  },
  {
    id: 'used_cruiser_refit',
    shipId: 'cruiser',
    title: 'Crucero de Asalto Clase Halcón Negro',
    quantity: 1,
    condition: 'Grado A+ (Reacondicionamiento total)',
    conditionPercent: 92,
    cost: { metal: 16000, crystal: 5500, deuterium: 2500 },
    originalCost: { metal: 20000, crystal: 7000, deuterium: 2000 },
    discountPercent: 20,
    seller: 'Compañía de Seguridad Centauri',
    description: 'Nave de patrulla y escolta pesada con cañones de pulso listos para entrar en servicio.',
    icon: '🚢'
  },
  {
    id: 'used_battleship_flagship',
    shipId: 'battleship',
    title: 'Nave de Batalla Retirada de la Guardia Federal',
    quantity: 1,
    condition: 'Grado B (Blindaje térmico con cicatrices balísticas)',
    conditionPercent: 85,
    cost: { metal: 36000, crystal: 12000, deuterium: 4000 },
    originalCost: { metal: 45000, crystal: 15000, deuterium: 0 },
    discountPercent: 20,
    seller: 'Arsenal Federal de Desmovilización',
    description: 'Monstruo de combate con generador de hiperespacio verificado y torretas láser sincronizadas.',
    icon: '⚓'
  },
  {
    id: 'used_recycler_fleet',
    shipId: 'recycler',
    title: 'Flotilla de Recicladores de Escombros',
    quantity: 3,
    condition: 'Grado B (Talleres de prensado en servicio)',
    conditionPercent: 80,
    cost: { metal: 22000, crystal: 13000, deuterium: 3000 },
    originalCost: { metal: 30000, crystal: 18000, deuterium: 6000 },
    discountPercent: 26,
    seller: 'Chatarreros Libres del Brazo Exterior',
    description: 'Garras de succión magnética y hornos de fundición integrados para limpiar campos de batalla.',
    icon: '♻️'
  }
];

// Artículos y cargamentos del Mercado Negro
export const BLACK_MARKET_CATALOG = [
  {
    id: 'bm_overcharged_coils',
    title: 'Bobinas Cuánticas Sobrecargadas',
    category: 'Ingeniería Experimental',
    cost: { metal: 50000, crystal: 40000, deuterium: 30000 },
    icon: '⚡',
    effectType: 'energy_boost',
    description: 'Módulos energéticos de contrabando que inyectan plasma puro a la red planetaria.',
    benefitText: '+15.000 de Energía inmediata de emergencia y reservas estabilizadas.',
    oneTimeBonus: { energy: 15000, metal: 25000 }
  },
  {
    id: 'bm_military_surplus_crate',
    title: 'Contenedor Secreto de Armamento Táctico',
    category: 'Material Clasificado',
    cost: { metal: 80000, crystal: 50000, deuterium: 20000 },
    icon: '🎖️',
    effectType: 'fleet_reinforcement',
    description: 'Cargamento de cazadores y torretas de defensa selladas en gravedad cero.',
    benefitText: 'Despliegue inmediato de 6 Cazadores Pesados y 4 Láseres Pesados en el bastión.',
    grantFleet: { heavyFighter: 6 },
    grantDefenses: { heavyLaser: 4 }
  },
  {
    id: 'bm_deuterium_hypercells',
    title: 'Hiperceldas de Deuterio Enriquecido',
    category: 'Combustible Estratégico',
    cost: { metal: 120000, crystal: 60000, deuterium: 0 },
    icon: '⚗️',
    effectType: 'resource_grant',
    description: 'Combustible refinado sustraído de estaciones de repostaje militares.',
    benefitText: '+45.000 de Deuterio puro ingresado en tus almacenes planetarios.',
    grantResources: { deuterium: 45000 }
  },
  {
    id: 'bm_spy_network_codes',
    title: 'Claves Criptográficas de la Red Espía Neutral',
    category: 'Inteligencia',
    cost: { metal: 30000, crystal: 30000, deuterium: 25000 },
    icon: '🕵️',
    effectType: 'intel_boost',
    description: 'Filtra frecuencias de comunicaciones y rutas de transporte de todas las facciones.',
    benefitText: '+250 Puntos de Influencia Política y 10 Sondas de Espionaje de última generación.',
    grantInfluence: 250,
    grantFleet: { espionageProbe: 10 }
  }
];

// Contratos ampliados de comercio corporativo
export const CORPORATE_CONTRACTS = [
  {
    id: 'c1',
    client: 'Consorcio Minero de Orión',
    demandRes: 'metal',
    demandAmount: 150000,
    rewardRes: 'crystal',
    rewardAmount: 95000,
    bonusCredits: '50.000 Créditos',
    description: 'Suministro urgente de aleaciones de acero pesado para reparar el anillo orbital de la estación minera.'
  },
  {
    id: 'c2',
    client: 'Laboratorios de la Alianza Sirius',
    demandRes: 'crystal',
    demandAmount: 80000,
    rewardRes: 'deuterium',
    rewardAmount: 48000,
    bonusCredits: '30.000 Créditos',
    description: 'Cristales de silicio de alta pureza solicitados para calibrar lentes de aceleradores cuánticos.'
  },
  {
    id: 'c3',
    client: 'Flota Expedicionaria del Brazo Espiral',
    demandRes: 'deuterium',
    demandAmount: 60000,
    rewardRes: 'metal',
    rewardAmount: 220000,
    bonusCredits: '80.000 Créditos',
    description: 'Carga prioritaria de combustible criogénico para reabastecer destructores de patrulla exterior.'
  },
  {
    id: 'c4',
    client: 'Colonia Agrícola de Próxima Centauri',
    demandRes: 'metal',
    demandAmount: 90000,
    rewardRes: 'deuterium',
    rewardAmount: 32000,
    bonusCredits: '40.000 Créditos',
    description: 'Estructuras modulares para la construcción de domos hidropónicos de cultivo masivo.'
  },
  {
    id: 'c5',
    client: 'Liga de Comerciantes Libres de Vega',
    demandRes: 'crystal',
    demandAmount: 120000,
    rewardRes: 'metal',
    rewardAmount: 210000,
    bonusCredits: '65.000 Créditos',
    description: 'Microprocesadores ópticos y componentes refractarios para cargueros interestelares.'
  }
];
