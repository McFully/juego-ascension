/**
 * wikiData.js — Base de Datos Canónica de la Gran Enciclopedia Imperial
 *
 * Contiene artículos estructurados, categorías temáticas, tablas paramétricas tipo Excel
 * y fórmulas matemáticas canónicas de Ascension.
 */

export const WIKI_CATEGORIES = [
  { id: 'all', label: 'Todo', icon: '🌌' },
  { id: 'economy', label: 'Economía e Industrias', icon: '⛏️' },
  { id: 'fleet', label: 'Armada y Astilleros', icon: '🚀' },
  { id: 'defense', label: 'Defensa y Bastiones', icon: '🛡️' },
  { id: 'research', label: 'Ciencia y Árbol Tecnológico', icon: '🔬' },
  { id: 'market', label: 'Lonja y Mercado AMM', icon: '💼' },
  { id: 'colonies', label: 'Colonización y Biomas', icon: '🪐' },
  { id: 'diplomacy', label: 'Diplomacia y Consejo', icon: '🤝' },
  { id: 'espionage', label: 'Inteligencia y Espionaje', icon: '📡' },
  { id: 'government', label: 'Ministerios y Alto Mando', icon: '👑' },
];

export const WIKI_ENTRIES = [
  // === ECONOMÍA E INDUSTRIAS ===
  {
    id: 'metal_mine',
    category: 'economy',
    title: 'Mina de Metal',
    subtitle: 'Extracción geológica de aleaciones estructurales',
    badge: 'EDIFICIO BÁSICO',
    tags: ['metal', 'produccion', 'mineria', 'escalado', 'energia'],
    summary: 'Columna vertebral de la industria imperial. Proporciona el recurso primario necesario para infraestructuras y cascos de naves.',
    guide: `
      La Mina de Metal extrae menas profundas mediante taladros térmicos y detonaciones de pulso.
      Su producción crece geométricamente por nivel, pero incrementa exponencialmente su demanda de energía.
      Si el planeta sufre un déficit energético, la producción efectiva se reduce de forma directamente proporcional al porcentaje de cobertura energética.
    `,
    formula: {
      title: 'Fórmula de Producción Horaria Base',
      expression: 'Producción = Math.floor(30 * nivel * Math.pow(1.1, nivel)) * multGeologia * multGobierno',
      notes: 'Afectada por la especialización planetaria minera (+20%), ministros de recursos y cobertura energética planetaria.'
    },
    parametricTable: {
      headers: ['Nivel', 'Metal Coste', 'Cristal Coste', 'Energía Req.', 'Prod/Hora', 'Retorno (Horas)'],
      rows: [
        [1, '60', '15', '11', '33/h', '2.2h'],
        [2, '90', '22', '13', '72/h', '1.5h'],
        [3, '135', '33', '16', '119/h', '1.4h'],
        [4, '202', '50', '20', '175/h', '1.4h'],
        [5, '303', '75', '24', '241/h', '1.5h'],
        [10, '2.3k', '576', '62', '778/h', '3.7h'],
        [15, '17.5k', '4.3k', '162', '2.2k/h', '9.9h'],
        [20, '133k', '33k', '420', '6.0k/h', '27.6h'],
      ]
    },
    indicators: [
      { label: 'Eficiencia Base', value: '100%', color: 'text-emerald-400' },
      { label: 'Escalado Coste', value: 'x1.5 por nivel', color: 'text-cyan-400' },
      { label: 'Escalado Prod.', value: 'x1.1 por nivel', color: 'text-amber-400' }
    ],
    media: {
      type: 'image',
      assetId: 'metalMine',
      caption: 'Esquema de perforación y silos de extracción superficial.'
    }
  },
  {
    id: 'crystal_mine',
    category: 'economy',
    title: 'Mina de Cristal',
    subtitle: 'Síntesis de cuarzo piezoeléctrico y silicatos cuánticos',
    badge: 'EDIFICIO CIENTÍFICO',
    tags: ['cristal', 'componentes', 'investigacion', 'escalado'],
    summary: 'Proporciona cristal para circuitos, escudos deflectores, computación y tecnologías avanzadas.',
    guide: `
      El cristal es un recurso más escaso y valioso que el metal. Resulta esencial para el avance tecnológico y la fabricación de escudos de defensa y naves científicas.
      Requiere un consumo moderado de deuterio para los procesos de enfriamiento por láser en niveles superiores.
    `,
    formula: {
      title: 'Fórmula de Producción Horaria Base',
      expression: 'Producción = Math.floor(20 * nivel * Math.pow(1.1, nivel)) * multGeologia * multGobierno',
      notes: 'Requiere proporcionalmente mayor ratio de inversión en cristal inicial.'
    },
    parametricTable: {
      headers: ['Nivel', 'Metal Coste', 'Cristal Coste', 'Energía Req.', 'Prod/Hora', 'Retorno (Horas)'],
      rows: [
        [1, '48', '24', '11', '22/h', '3.2h'],
        [2, '72', '36', '13', '48/h', '2.2h'],
        [3, '108', '54', '16', '79/h', '2.0h'],
        [4, '162', '81', '20', '117/h', '2.0h'],
        [5, '243', '121', '24', '161/h', '2.2h'],
        [10, '1.8k', '921', '62', '519/h', '5.2h'],
        [15, '14.0k', '7.0k', '162', '1.4k/h', '15.0h'],
        [20, '106k', '53k', '420', '4.0k/h', '39.7h'],
      ]
    },
    indicators: [
      { label: 'Eficiencia Base', value: '100%', color: 'text-emerald-400' },
      { label: 'Escalado Coste', value: 'x1.6 por nivel', color: 'text-cyan-400' },
      { label: 'Escalado Prod.', value: 'x1.1 por nivel', color: 'text-amber-400' }
    ],
    media: {
      type: 'image',
      assetId: 'crystalMine',
      caption: 'Refinería criogénica de cristales poliméricos.'
    }
  },
  {
    id: 'deut_synth',
    category: 'economy',
    title: 'Sintetizador de Deuterio',
    subtitle: 'Centrifugación molecular de isótopos pesados de hidrógeno',
    badge: 'COMBUSTIBLE NUCLEAR',
    tags: ['deuterio', 'combustible', 'fusion', 'propulsion', 'hiperespacio'],
    summary: 'Produce deuterio, el combustible universal para reactores de fusión, viajes estelares y sistemas de salto hiperespacial.',
    guide: `
      La extracción de deuterio es intensiva en consumo energético. En mundos fríos o gigantes helados, la tasa de rendimiento es significativamente superior debido a las concentraciones atmosféricas naturales.
    `,
    formula: {
      title: 'Fórmula de Producción Horaria Base',
      expression: 'Producción = Math.floor(10 * nivel * Math.pow(1.1, nivel) * (1.36 - 0.004 * tempMax)) * multGobierno',
      notes: 'La temperatura máxima del planeta influye inversamente en la producción (planetas fríos producen más).'
    },
    parametricTable: {
      headers: ['Nivel', 'Metal Coste', 'Cristal Coste', 'Energía Req.', 'Prod/Hora (20°C)', 'Retorno'],
      rows: [
        [1, '225', '75', '22', '12/h', '25.0h'],
        [2, '337', '112', '27', '26/h', '17.2h'],
        [3, '506', '168', '33', '43/h', '15.6h'],
        [4, '759', '253', '40', '63/h', '16.0h'],
        [5, '1.1k', '379', '49', '87/h', '17.0h'],
        [10, '8.6k', '2.8k', '126', '280/h', '40.7h'],
        [15, '65.7k', '21.9k', '327', '793/h', '110h'],
        [20, '499k', '166k', '850', '2.1k/h', '316h'],
      ]
    },
    indicators: [
      { label: 'Eficiencia Térmica', value: 'Planetas Fríos Óptimos', color: 'text-blue-400' },
      { label: 'Consumo Eléctrico', value: 'Elevado', color: 'text-red-400' },
      { label: 'Valor de Cambio AMM', value: '1 Deuterio = 3 Metal', color: 'text-emerald-400' }
    ],
    media: {
      type: 'image',
      assetId: 'deutSynth',
      caption: 'Separadores criogénicos e hidrociclones de deuterio.'
    }
  },
  {
    id: 'solar_plant',
    category: 'economy',
    title: 'Planta de Energía Solar',
    subtitle: 'Captación fotovoltaica orbital y conversión termoiónica',
    badge: 'RED ELÉCTRICA',
    tags: ['energia', 'red', 'solar', 'cobertura'],
    summary: 'Suministra energía limpia y constante para sostener las operaciones de minas e instalaciones de superficie.',
    guide: `
      La energía solar es el pilar de desarrollo temprano. Depende de la proximidad al sol del sistema (temperatura ambiente). En planetas lejanos o nublados, debe complementarse con reactores de fusión o satélites solares.
    `,
    formula: {
      title: 'Generación Eléctrica Solar',
      expression: 'Energía = Math.floor(20 * nivel * Math.pow(1.1, nivel))',
      notes: 'No consume combustible alguno.'
    },
    parametricTable: {
      headers: ['Nivel', 'Metal Coste', 'Cristal Coste', 'Energía Generada', 'Coste Total Eq.'],
      rows: [
        [1, '75', '30', '22', '105'],
        [2, '112', '45', '48', '157'],
        [3, '168', '67', '79', '235'],
        [4, '253', '101', '117', '354'],
        [5, '379', '151', '161', '530'],
        [10, '2.8k', '1.1k', '519', '3.9k'],
        [15, '21.9k', '8.7k', '1.4k', '30.6k'],
        [20, '166k', '66k', '4.0k', '232k'],
      ]
    },
    indicators: [
      { label: 'Consumo Combustible', value: '0 (Gratuito)', color: 'text-emerald-400' },
      { label: 'Riesgo de Sabotaje', value: 'Bajo', color: 'text-cyan-400' }
    ],
    media: {
      type: 'image',
      assetId: 'solarPlant',
      caption: 'Matriz de colectores fotovoltaicos de silicio hiperdenso.'
    }
  },

  // === ARMADA Y ASTILLEROS ===
  {
    id: 'cruiser_warship',
    category: 'fleet',
    title: 'Crucero Estelar',
    subtitle: 'Buque de escolta armado con baterías láser de pulso',
    badge: 'NAVE COMBATE',
    tags: ['armada', 'crucero', 'combate', 'fuego rapido', 'caza'],
    summary: 'Nave de ataque medio y defensa antiaérea especializada en barrer escuadrones de cazas ligeros mediante fuego rápido masivo.',
    guide: `
      Los cruceros son la espina dorsal de cualquier flota móvil. Su blindaje reforzado y sistemas de puntería avanzada les permiten infligir Fuego Rápido x6 contra Cazas Ligeros y x10 contra Lanzamisiles planetarios.
    `,
    formula: {
      title: 'Fuego Rápido (Rapid Fire)',
      expression: 'Probabilidad de disparo consecutivo = 1 - (1 / RF)',
      notes: 'Un RF de 6 otorga un 83.3% de probabilidad de volver a disparar a otro objetivo en el mismo turno.'
    },
    parametricTable: {
      headers: ['Estadística', 'Valor Base', 'Con Militar Lv 10', 'Con Militar Lv 20'],
      rows: [
        ['Ataque Láser', '400', '800 (+100%)', '1.2k (+200%)'],
        ['Escudo Deflector', '50', '100 (+100%)', '150 (+200%)'],
        ['Puntos de Casco', '27.0k', '54.0k (+100%)', '81.0k (+200%)'],
        ['Velocidad Base', '15.000 km/s', '18.000 km/s', '21.000 km/s'],
        ['Capacidad Carga', '800 u.', '800 u.', '800 u.'],
        ['Consumo Combustible', '300 deut.', '300 deut.', '300 deut.']
      ]
    },
    indicators: [
      { label: 'Fuego Rápido vs Caza Ligero', value: 'x6 turnos', color: 'text-emerald-400' },
      { label: 'Fuego Rápido vs Lanzamisiles', value: 'x10 turnos', color: 'text-emerald-400' },
      { label: 'Vulnerable a', value: 'Acorazados y Bombarderos', color: 'text-red-400' }
    ],
    media: {
      type: 'image',
      assetId: 'cruiser',
      caption: 'Crucero pesado de clase Centurión en formación de patrulla.'
    }
  },
  {
    id: 'battleship_flagship',
    category: 'fleet',
    title: 'Nave de Batalla',
    subtitle: 'Nave capital armada con baterías de iones y cañones de plasma pesados',
    badge: 'NAVE CAPITAL',
    tags: ['armada', 'capital', 'acorazado', 'asalto', 'destruccion'],
    summary: 'Destructora de defensas y buques de línea pesados. Su blindaje estructural resiste impactos masivos.',
    guide: `
      La Nave de Batalla es el símbolo del poder imperial. Diseñada para destruir defensas terrestres pesadas y perforar cascos acorazados. Su coste en metal y cristal es elevado, pero su presencia en el teatro bélico decide batallas.
    `,
    formula: {
      title: 'Eficacia de Perforación de Casco',
      expression: 'Daño Real = Daño - Escudo; Si Escudo <= 0 => Daño directo a Puntos de Estructura',
      notes: 'Si el daño a estructura supera el 30%, existe probabilidad porcentual de destrucción catastrófica instantánea.'
    },
    parametricTable: {
      headers: ['Estadística', 'Valor Base', 'Con Militar Lv 10', 'Con Militar Lv 20'],
      rows: [
        ['Ataque Plasma', '1.000', '2.000 (+100%)', '3.000 (+200%)'],
        ['Escudo Deflector', '200', '400 (+100%)', '600 (+200%)'],
        ['Puntos de Casco', '60.0k', '120.0k (+100%)', '180.0k (+200%)'],
        ['Velocidad Hiperespacio', '10.000 km/s', '13.000 km/s', '16.000 km/s'],
        ['Capacidad Carga', '1.500 u.', '1.500 u.', '1.500 u.'],
        ['Consumo Deuterio', '500 u.', '500 u.', '500 u.']
      ]
    },
    indicators: [
      { label: 'Fuego Rápido vs Sondas', value: 'x5', color: 'text-cyan-400' },
      { label: 'Resistencia Estructural', value: 'Ultra Alta', color: 'text-emerald-400' },
      { label: 'Coste Producción', value: '45k Metal / 15k Cristal', color: 'text-amber-400' }
    ],
    media: {
      type: 'image',
      assetId: 'battleship',
      caption: 'Acorazado clase Titán en maniobra de aproximación orbital.'
    }
  },

  // === DEFENSA Y BASTIONES ===
  {
    id: 'plasma_turret',
    category: 'defense',
    title: 'Torreta de Plasma',
    subtitle: 'Cañón térmico planetario de confinamiento magnético',
    badge: 'BASTIÓN PESADO',
    tags: ['defensa', 'bastion', 'plasma', 'anticapital'],
    summary: 'La pieza de artillería defensiva planetaria más destructiva del arsenal imperial.',
    guide: `
      Dispara esferas de deuterio ionizado a millones de grados Kelvin sostenidas por bobinas superconductoras. Es capaz de vaporizar cruceros y desintegrar escudos de naves nodriza de un solo disparo directo.
      El 70% de las torretas destruidas en combate se reparan automáticamente si el planeta resiste el asedio.
    `,
    formula: {
      title: 'Probabilidad de Reconstrucción Defensiva',
      expression: 'Probabilidad = 70% de las defensas destruidas vuelven al servicio tras el informe',
      notes: 'No aplica si el planeta sufre un bombardeo con misiles interplanetarios directos.'
    },
    parametricTable: {
      headers: ['Nivel de Defensa', 'Ataque Plasma', 'Escudo', 'Casco', 'Coste Metal', 'Coste Cristal'],
      rows: [
        ['Base', '3.000', '300', '100.0k', '50.0k', '50.0k'],
        ['Con Blindaje Lv 5', '3.000', '450', '150.0k', '-', '-'],
        ['Con Blindaje Lv 10', '3.000', '600', '200.0k', '-', '-'],
        ['Con Armas Lv 10', '6.000', '600', '200.0k', '-', '-'],
      ]
    },
    indicators: [
      { label: 'Daño por Disparo', value: '3.000 Pts Base', color: 'text-red-400' },
      { label: 'Ratio Reconstrucción', value: '70% post-batalla', color: 'text-emerald-400' },
      { label: 'Energía de Disparo', value: 'Autónoma', color: 'text-cyan-400' }
    ],
    media: {
      type: 'image',
      assetId: 'plasmaTurret',
      caption: 'Batería de plasma en superficie planetaria con domo blindado.'
    }
  },

  // === CIENCIA Y ÁRBOL TECNOLÓGICO ===
  {
    id: 'nanite_tech',
    category: 'research',
    title: 'Fábrica de Nanobots',
    subtitle: 'Autoensamblado molecular y manufactura subatómica instantánea',
    badge: 'TECNOLOGÍA CÚPULA',
    tags: ['nanobots', 'produccion', 'velocidad', 'construccion', 'astillero'],
    summary: 'Reduce a la mitad el tiempo de construcción de edificios, naves y defensas por cada nivel implementado.',
    guide: `
      La fábrica de nanobots despliega enjambres de autómatas a escala nanométrica que sintetizan aleaciones átomo por átomo.
      Cada nivel duplica la velocidad de obra y manufactura de astilleros, reduciendo exponencialmente las colas de espera.
    `,
    formula: {
      title: 'Fórmula de Tiempo de Construcción',
      expression: 'Tiempo = (CosteMetal + CosteCristal) / (2500 * (1 + NivelFabricaRobots) * Math.pow(2, NivelNanobots))',
      notes: 'Cada nivel de nanobots divide el tiempo total entre 2 (progresión geométrica de velocidad x2).'
    },
    parametricTable: {
      headers: ['Nivel Nanobots', 'Factor de Tiempo', 'Tiempo Obra (Ej. 10h)', 'Coste Metal', 'Coste Cristal'],
      rows: [
        [0, '100%', '10h 00m', '0', '0'],
        [1, '50%', '5h 00m', '1.0M', '500k'],
        [2, '25%', '2h 30m', '2.0M', '1.0M'],
        [3, '12.5%', '1h 15m', '4.0M', '2.0M'],
        [4, '6.25%', '37m 30s', '8.0M', '4.0M'],
        [5, '3.12%', '18m 45s', '16.0M', '8.0M'],
      ]
    },
    indicators: [
      { label: 'Reducción de Tiempo', value: '-50% por Nivel', color: 'text-emerald-400' },
      { label: 'Afecta a Astilleros', value: 'Sí (Total)', color: 'text-cyan-400' },
      { label: 'Afecta a Silos', value: 'Sí (Total)', color: 'text-cyan-400' }
    ],
    media: {
      type: 'image',
      assetId: 'naniteFactory',
      caption: 'Enjambre nanomecánico sintetizando superestructuras de grafeno.'
    }
  },

  // === LONJA Y MERCADO AMM ===
  {
    id: 'galactic_amm_market',
    category: 'market',
    title: 'Lonja y Mercado AMM',
    subtitle: 'Creador de Mercado Automatizado de Liquidez Constante',
    badge: 'SISTEMA FINANCIERO',
    tags: ['mercado', 'amm', 'lonja', 'intercambio', 'aranceles', 'precio'],
    summary: 'Plataforma descentralizada de comercio entre recursos que calcula tasas de cambio dinámicas según las reservas del pool.',
    guide: `
      La Lonja Galáctica funciona bajo una fórmula de producto constante de reserva o ratios AMM ajustados por volatilidad imperial.
      Comprar grandes cantidades de deuterio agota su pool y eleva su precio relativo en metal y cristal, mientras que vender recursos deprimidos estimula su cotización.
      Los ministros de economía reducen el margen de comisión y arbitraje del mercado.
    `,
    formula: {
      title: 'Tasa de Intercambio AMM',
      expression: 'Tasa Efectiva = (ReservaDestino / ReservaOrigen) * (1 - ArancelMercado)',
      notes: 'Arancel base del 5%, reducible hasta 1.5% mediante investigación comercial y ministros.'
    },
    parametricTable: {
      headers: ['Recurso Aporte', 'Recurso Recibido', 'Ratio Teórico', 'Deslizamiento (100k)', 'Deslizamiento (1M)'],
      rows: [
        ['Metal (3.0)', 'Cristal (1.5)', '0.50', '0.2%', '1.8%'],
        ['Metal (3.0)', 'Deuterio (1.0)', '0.33', '0.4%', '3.5%'],
        ['Cristal (2.0)', 'Metal (1.0)', '2.00', '0.2%', '1.7%'],
        ['Deuterio (1.0)', 'Metal (1.0)', '3.00', '0.3%', '2.9%'],
        ['Deuterio (1.0)', 'Cristal (1.0)', '1.50', '0.3%', '2.5%'],
      ]
    },
    indicators: [
      { label: 'Comisión Base', value: '3.5%', color: 'text-amber-400' },
      { label: 'Arbitraje Interplanetario', value: 'Activo', color: 'text-emerald-400' },
      { label: 'Soporte Créditos', value: 'Banco Imperial', color: 'text-purple-400' }
    ],
    media: {
      type: 'image',
      assetId: 'quantumTelecom',
      caption: 'Terminal de trading y book de órdenes algorítmico del AMM.'
    }
  },

  // === COLONIZACIÓN Y BIOMAS ===
  {
    id: 'colony_biomes',
    category: 'colonies',
    title: 'Colonización y Biomas Planetarios',
    subtitle: 'Morfología estelar, slots de superficie y temperaturas',
    badge: 'EXPANSIÓN TERRITORIAL',
    tags: ['colonizacion', 'planetas', 'biomas', 'slots', 'temperatura'],
    summary: 'Guía exhaustiva para el despliegue de naves colonizadoras y la optimización de mundos según su temperatura y bioma.',
    guide: `
      Los planetas en las posiciones 1 a 3 son extremadamente cálidos: sus satélites solares generan enormes cantidades de energía, pero sus sintetizadores de deuterio sufren penalizaciones térmicas.
      Los planetas en las posiciones 13 a 15 son mundos helados con producción récord de deuterio, idóneos para colonias energéticas o bases de aprovisionamiento de flotas de guerra.
    `,
    formula: {
      title: 'Slots de Superficie Máximos',
      expression: 'Slots = SlotsBase + NivelTerraformer * 5',
      notes: 'Cada nivel del Terraformador añade 5 campos edificables adicionales netos.'
    },
    parametricTable: {
      headers: ['Posición Orbital', 'Rango Térmico', 'Bono Solar', 'Bono Deuterio', 'Campos Medios'],
      rows: [
        ['1 a 3 (Interior)', '+80°C a +130°C', '+60%', '-40%', '160 - 200'],
        ['4 a 6 (Templada)', '+30°C a +70°C', '+20%', '-10%', '220 - 280'],
        ['7 a 9 (Media)', '0°C a +40°C', '0%', '0%', '240 - 310'],
        ['10 a 12 (Fría)', '-40°C a 0°C', '-20%', '+25%', '210 - 270'],
        ['13 a 15 (Exterior)', '-120°C a -50°C', '-50%', '+65%', '170 - 220'],
      ]
    },
    indicators: [
      { label: 'Mundo Ideal Equilibrado', value: 'Posición 8', color: 'text-emerald-400' },
      { label: 'Mundo Productor Deuterio', value: 'Posición 15', color: 'text-cyan-400' },
      { label: 'Mundo Solar/Granja', value: 'Posición 1', color: 'text-amber-400' }
    ],
    media: {
      type: 'image',
      assetId: 'terraformer',
      caption: 'Torre de terraformación atmosférica en planeta volcánico.'
    }
  },

  // === MINISTERIOS Y ALTO MANDO ===
  {
    id: 'imperial_ministries',
    category: 'government',
    title: 'Ministerios y Alto Mando',
    subtitle: 'Gabinete de ministros planetarios y Consejo Supremo Federal',
    badge: 'GOBERNANZA',
    tags: ['ministerios', 'consejo', 'senado', 'leyes', 'buffs', 'gabinete'],
    summary: 'Administración política del imperio: asignación de ministros, votos en el senado y decretos federales.',
    guide: `
      Cada planeta puede investir un gabinete con 15 carteras ministeriales (Minería, Industria, Ciencia, Defensa, etc.).
      Los ministros aportan multiplicadores pasivos acumulativos a la velocidad de obra, producción y defensa.
      Al superar los 10 mundos, se desbloquea el Consejo Imperial Supremo, cuyas directivas aplican a toda la federación planetaria a la vez.
    `,
    formula: {
      title: 'Bonificación Ministerial Acumulada',
      expression: 'Multiplicador = 1 + Suma(BonusMinistro * NivelFidelidad)',
      notes: 'La lealtad ministerial y las leyes aprobadas en el Senado potencian los efectos base.'
    },
    parametricTable: {
      headers: ['Cartera Ministerial', 'Efecto Primario', 'Escalado Nivel', 'Impacto Global'],
      rows: [
        ['Minería y Recursos', '+Producción Metal/Cristal', '+2.5% por nv.', 'Local / Federal'],
        ['Industria', '-Tiempo de Obras', '-3.0% por nv.', 'Local'],
        ['Ciencia', '-Tiempo de Investigación', '-2.0% por nv.', 'Matriz Neural'],
        ['Defensa', '+Casco y Escudos', '+4.0% por nv.', 'Local'],
        ['Guerra', '+Ataque de Flotas', '+3.5% por nv.', 'Flotas Asignadas'],
        ['Economía', '-Arancel AMM', '-0.2% por nv.', 'Mercado Global'],
      ]
    },
    indicators: [
      { label: 'Carteras Disponibles', value: '15 Ministerios', color: 'text-cyan-400' },
      { label: 'Desbloqueo Consejo', value: '10 Colonias', color: 'text-amber-400' },
      { label: 'Compatibilidad IA', value: 'Gobernador Autónomo', color: 'text-emerald-400' }
    ],
    media: {
      type: 'image',
      assetId: 'councilChamber',
      caption: 'Hemiciclo del Senado Imperial y cámara de debate federal.'
    }
  },

  // === DIPLOMACIA Y CUERPO DIPLOMÁTICO ===
  {
    id: 'diplomacy_relations',
    category: 'diplomacy',
    title: 'Diplomacia y Facciones Extranjeras',
    subtitle: 'Pactos de no agresión, alianzas de defensa y comercio interestelar',
    badge: 'RELACIONES EXTERIORES',
    tags: ['diplomacia', 'facciones', 'tratados', 'pactos', 'guerra'],
    summary: 'Gestión de la reputación exterior con imperios rivales y facciones galácticas independientes.',
    guide: `
      La diplomacia permite negociar tratados de comercio con tarifas preferenciales, pactos de investigación compartida y alianzas de defensa mutua.
      Mantener agregados diplomáticos permanentes e intercambiar delegaciones incrementa la influencia diplomática y previene invasiones coordinadas.
    `,
    formula: {
      title: 'Nivel de Relación Diplómatica',
      expression: 'Relación = RelaciónBase + TratadosVigentes * 15 - IncidentesFronterizos * 25',
      notes: 'Una relación superior a 75 permite solicitar un Pacto de Asistencia Mutua.'
    },
    parametricTable: {
      headers: ['Tratado', 'Efecto Mutuo', 'Coste Influencia', 'Duración Mínima'],
      rows: [
        ['Pacto de No Agresión', 'Inmunidad de ataques', '50 Pts', '30 Días'],
        ['Acuerdo Comercial', '-50% aranceles AMM', '100 Pts', '45 Días'],
        ['Matriz Científica', '+10% velocidad I+D', '150 Pts', '60 Días'],
        ['Alianza de Defensa', 'Apoyo de flota en asedios', '300 Pts', 'Indefinida'],
      ]
    },
    indicators: [
      { label: 'Estado Neutral', value: '0 a 49 pts', color: 'text-slate-400' },
      { label: 'Amistad / Alianza', value: '50 a 100 pts', color: 'text-emerald-400' },
      { label: 'Hostilidad Bélica', value: '< 0 pts', color: 'text-red-400' }
    ],
    media: {
      type: 'image',
      assetId: 'permanentEmbassy',
      caption: 'Embajada Imperial permanente y helipuertos de enlace exterior.'
    }
  },

  // === INTELIGENCIA Y ESPIONAJE ===
  {
    id: 'espionage_intelligence',
    category: 'espionage',
    title: 'Inteligencia, Espionaje y Radar',
    subtitle: 'Escaneo cuántico, sondas de espionaje y contraespionaje',
    badge: 'SEGURIDAD NACIONAL',
    tags: ['espionaje', 'sondas', 'radar', 'sensores', 'defensas', 'flota'],
    summary: 'Recopilación táctica de datos de planetas enemigos y protección ante infiltraciones enemigas.',
    guide: `
      Lanzar sondas de espionaje a mundos enemigos genera un informe de inteligencia. La profundidad de los datos revelados depende de la diferencia entre el nivel de Espionaje del atacante y el del defensor.
      A mayor diferencia a favor del atacante, más capas se revelan: Recursos -> Flotas en órbita -> Defensas terrestres -> Edificios -> Investigaciones.
    `,
    formula: {
      title: 'Capas de Detección de Espionaje',
      expression: 'Diferencia = NivelEspionajeAtacante - NivelEspionajeDefensor + (Sondas / 3)',
      notes: 'Diferencia >= 0: Recursos. Diferencia >= 2: Flota. Diferencia >= 5: Defensas. Diferencia >= 7: Edificios. Diferencia >= 9: Tecnologías.'
    },
    parametricTable: {
      headers: ['Diferencia Efectiva', 'Información Obtenida', 'Riesgo de Detección Flota'],
      rows: [
        ['< 0', 'Espionaje fallido / Sondas destruidas', '100%'],
        ['0 a 1', 'Solo Recursos en Almacén', '75%'],
        ['2 a 4', 'Recursos + Flota en Superficie', '50%'],
        ['5 a 6', 'Recursos + Flota + Defensas Bastión', '25%'],
        ['7 a 8', 'Todo lo anterior + Edificios de Superficie', '10%'],
        ['>= 9', 'Dossier Absoluto (Incluye Árbol Científico)', '0%'],
      ]
    },
    indicators: [
      { label: 'Detección Máxima', value: 'Con 10+ sondas', color: 'text-cyan-400' },
      { label: 'Contraespionaje', value: 'Nivel Investigación', color: 'text-amber-400' },
      { label: 'Defensa Terrestre', value: 'Silos Antimisil', color: 'text-emerald-400' }
    ],
    media: {
      type: 'image',
      assetId: 'hyperspaceRelay',
      caption: 'Estación de escucha e intercepción de señales hiperespaciales.'
    }
  }
];
