export const MINISTRY_DIRECTIVES = {
  resources: [
    { id: 'dir_overmine', name: 'Decreto de Explotación Intensiva', desc: '+20% Producción de Metal y Cristal, -10% Estabilidad Colonial', cost: '15 ptos Influencia' },
    { id: 'dir_geoscan', name: 'Prospección Geológica Orbital', desc: '+15% Hallazgos de vetas ricas de deuterio, +5% consumo energético', cost: '10 ptos Influencia' },
    { id: 'dir_miner_union', name: 'Convenio Federal de Mineros', desc: '+10% Felicidad y Población minera, -5% velocidad de extracción', cost: '15 ptos Influencia' }
  ],
  economy: [
    { id: 'dir_pyme', name: 'Fomento a Colonos Autónomos', desc: '+10% Producción de Cristal, -5% Ingresos Tributarios', cost: '10 ptos Influencia' },
    { id: 'dir_heavy', name: 'Decreto de Industria Pesada', desc: '+15% Producción de Metal, -10% Velocidad de I+D', cost: '15 ptos Influencia' },
    { id: 'dir_tariff', name: 'Aranceles del Borde Exterior', desc: '+20% Ingresos de Mercado, -15 Relación con facciones', cost: '20 ptos Influencia' }
  ],
  defense: [
    { id: 'dir_conscript', name: 'Ley de Leva Militar Obligatoria', desc: '-15% Tiempo de Caza, -5% Producción colonial', cost: '15 ptos Influencia' },
    { id: 'dir_doctrine', name: 'Doctrina de Fuego Concentrado', desc: '+10% Ataque de Flota, -10% HP de Naves', cost: '20 ptos Influencia' },
    { id: 'dir_patrol', name: 'Patrullas Sistemáticas', desc: '+25% Éxito contra piratas, +50 créditos/h coste', cost: '10 ptos Influencia' }
  ],
  science: [
    { id: 'dir_ai_trust', name: 'Comisión de IA Autogestionada', desc: '+15% Eficiencia de laboratorios, -10% Seguridad del Sistema', cost: '10 ptos Influencia' },
    { id: 'dir_black_project', name: 'Inversión en Proyectos Negros', desc: '+20% Probabilidad de tecnologías raras, +15% coste de Deuterio', cost: '25 ptos Influencia' },
    { id: 'dir_open_source', name: 'Ciencia Compartida Federal', desc: '+10% Relación con IAs Democráticas, +5% tiempo I+D propio', cost: '15 ptos Influencia' }
  ],
  culture: [
    { id: 'dir_censorship', name: 'Control de Transmisión Pública', desc: '+10% Unidad Social, -10% Producción de Cristal', cost: '10 ptos Influencia' },
    { id: 'dir_holiday', name: 'Festival Federal Anual', desc: '+15% Felicidad de Colonias, -100 Créditos por ciclo', cost: '20 ptos Influencia' },
    { id: 'dir_propaganda', name: 'Campaña de Patriotismo Nova', desc: '+15% Ganancia de Influencia, -15 Relaciones Exteriores', cost: '15 ptos Influencia' }
  ],
  infra: [
    { id: 'dir_green_build', name: 'Plan de Bio-Cúpulas Integradas', desc: '+10% Crecimiento de Población, +5% Tiempo de Edificación', cost: '10 ptos Influencia' },
    { id: 'dir_rapid', name: 'Protocolos de Montaje Acelerado', desc: '-15% Tiempo de Construcción, +10% Coste de Metal', cost: '20 ptos Influencia' },
    { id: 'dir_grid_opt', name: 'Optimización de Red de Fusión', desc: '+15% Energía generada, -5% Producción de Deuterio', cost: '15 ptos Influencia' }
  ],
  intel: [
    { id: 'dir_wiretap', name: 'Hiper-Red de Escucha Ciudadana', desc: '+15% Contra-espionaje, -5% Unidad Social', cost: '15 ptos Influencia' },
    { id: 'dir_blackmail', name: 'Chantajes Diplomáticos Activos', desc: '+15% Probabilidad de acuerdo comercial, -10 Reputación', cost: '25 ptos Influencia' },
    { id: 'dir_counter', name: 'Campaña de Falsa Información', desc: '+20% Defensa contra espionaje, +10% Coste de Inteligencia', cost: '15 ptos Influencia' }
  ],
  energy: [
    { id: 'dir_overcharge', name: 'Sobrecarga de Condensadores Federales', desc: '+25% Energía Global producida, -5% Vida Útil de Reactores', cost: '15 ptos Influencia' },
    { id: 'dir_eco_power', name: 'Subsidio a Centrales Geotérmicas', desc: '+20% Rendimiento Geotérmico, -10% Coste de Obras Térmicas', cost: '10 ptos Influencia' },
    { id: 'dir_rationing', name: 'Racionamiento de Energía Industrial', desc: 'Prioriza escudos y flotas (+10% Defensa), -5% Minas', cost: '20 ptos Influencia' }
  ],
  agriculture: [
    { id: 'dir_ration_pack', name: 'Distribución Universal de Raciones', desc: '+20% Crecimiento Poblacional, -5% Ingresos Tributarios', cost: '10 ptos Influencia' },
    { id: 'dir_eco_scrub', name: 'Filtrado Atmosférico Intensivo', desc: '-30% Polución en Colonias, +5% Consumo Eléctrico', cost: '15 ptos Influencia' },
    { id: 'dir_genetic_crops', name: 'Autorización de Cultivos Mutagénicos', desc: '+25% Alimento Hidropónico, -5 Reputación con Facciones Verdes', cost: '20 ptos Influencia' }
  ],
  justice: [
    { id: 'dir_anti_corruption', name: 'Campaña Federal Anticorrupción', desc: '+15% Recaudación Tributaria, -5% Felicidad de Élites', cost: '15 ptos Influencia' },
    { id: 'dir_martial_order', name: 'Decreto de Pacificación Civil', desc: '-40% Frecuencia de Disturbios, +10% Coste Mantenimiento', cost: '20 ptos Influencia' },
    { id: 'dir_open_courts', name: 'Tribunales Abiertos de Garantías', desc: '+15% Unidad Social y Prestigio Legal, -10 ptos Influencia', cost: '10 ptos Influencia' }
  ],
  transport: [
    { id: 'dir_freight_corridor', name: 'Corredores Preferentes de Carga', desc: '+25% Velocidad de Rutas Comerciales, -10% Consumo Combustible', cost: '15 ptos Influencia' },
    { id: 'dir_zero_gravity_dock', name: 'Prioridad de Atraque Militar y Mercante', desc: '-25% Tiempo de Carga y Descarga en Puertos', cost: '10 ptos Influencia' },
    { id: 'dir_subsidized_fuel', name: 'Subsidio Imperial de Deuterio', desc: '-20% Consumo de Vuelo de Flotas, -5% Deuterio Almacenado', cost: '20 ptos Influencia' }
  ],
  industry: [
    { id: 'dir_heavy_refine', name: 'Sobrecarga de Hornos Moleculares', desc: '+20% Producción de Refinerías, +10% Polución Planetaria', cost: '15 ptos Influencia' },
    { id: 'dir_standard_parts', name: 'Estandarización Obligatoria de Chasis', desc: '-15% Coste de Edificaciones Industriales, -5% Flexibilidad Técnica', cost: '10 ptos Influencia' },
    { id: 'dir_shift_work', name: 'Turnos Triples de Factoría', desc: '-25% Tiempo de Construcción de Complejos, -5% Felicidad de Obreros', cost: '20 ptos Influencia' }
  ],
  innovation: [
    { id: 'dir_patent_pool', name: 'Socialización de Patentes Federales', desc: '-15% Coste de Investigación Tecnológica, -5% Ingresos de Crédito', cost: '15 ptos Influencia' },
    { id: 'dir_unsafe_testing', name: 'Protocolos de Ensayo Rápido', desc: '+25% Velocidad de Nuevos Diseños, +5% Probabilidad de Avería Menor', cost: '20 ptos Influencia' },
    { id: 'dir_nano_subsidy', name: 'Subvención a Laboratorios de Nanitas', desc: '+15% Rendimiento de Fábrica de Nanobots, 10 ptos Influencia de mantenimiento', cost: '10 ptos Influencia' }
  ],
  cybernetics: [
    { id: 'dir_ai_governance', name: 'Transferencia de Poder a Nodos IA', desc: '+20% Eficiencia de Colonias Autónomas, -10% Unidad Civil', cost: '20 ptos Influencia' },
    { id: 'dir_quantum_crypto', name: 'Cifrado Cuántico Absoluto', desc: '+30% Inmunidad a Hackeo y Espionaje, +5% Consumo de Energía', cost: '15 ptos Influencia' },
    { id: 'dir_auto_allocation', name: 'Reasignación Automatizada de Recursos', desc: 'Previene atascos en almacenes, equilibra flujos de carga', cost: '10 ptos Influencia' }
  ],
  war: [
    { id: 'dir_total_mobilization', name: 'Movilización Marcial del Almirantazgo', desc: '+20% Ataque y Velocidad de Flota, -10% Crecimiento de Población', cost: '25 ptos Influencia' },
    { id: 'dir_fast_shipyard', name: 'Producción Militar Prioritaria', desc: '-20% Tiempo de Construcción de Naves, +10% Coste de Metal', cost: '15 ptos Influencia' },
    { id: 'dir_veteran_doctrine', name: 'Doctrina de Fuego y Maniobra', desc: '+15% Daño Crítico en Naves Insignia, +10% Consumo de Deuterio', cost: '20 ptos Influencia' }
  ],
  logistics: [
    { id: 'dir_priority_cargo', name: 'Pases de Tránsito Preferente', desc: '+30% Velocidad de Naves de Carga, -5% Capacidad de Caza Militar', cost: '15 ptos Influencia' },
    { id: 'dir_expanded_vaults', name: 'Bóvedas Subterráneas Blindadas', desc: '+25% Capacidad de Silos y Almacenes, +5% Coste de Obras', cost: '10 ptos Influencia' },
    { id: 'dir_salvage_fleet', name: 'Equipos de Reclamación Orbital', desc: '+20% Retorno de Reciclaje de Naves y Defensas', cost: '15 ptos Influencia' }
  ],
  biosphere: [
    { id: 'dir_forced_terra', name: 'Terraformación Acelerada de Impacto', desc: '-30% Tiempo de Terraformado, -15% Producción Colonial Temporal', cost: '20 ptos Influencia' },
    { id: 'dir_sanctuary_zones', name: 'Reservas Naturales Protegidas', desc: '+20% Felicidad y Orden Ciudadano, -5% Terreno Edificable', cost: '10 ptos Influencia' },
    { id: 'dir_extreme_adaptation', name: 'Adaptación Genética al Clima Extremo', desc: 'Permite habitar mundos con radiación o frío sin penalizaciones', cost: '25 ptos Influencia' }
  ],
  civics: [
    { id: 'dir_civic_solidarity', name: 'Pacto Federal de Solidaridad Ciudadana', desc: '+25% Crecimiento Poblacional, -5% Recaudación Tributaria', cost: '15 ptos Influencia' },
    { id: 'dir_meritocracy', name: 'Estatuto de Mérito y Eficiencia', desc: '+15% Eficiencia de Todas las Obras, -5% Felicidad', cost: '20 ptos Influencia' },
    { id: 'dir_public_assembly', name: 'Asambleas Abiertas de Colonos', desc: '+20% Estabilidad y Resistencia a Sabotajes, -5 ptos Influencia por ciclo', cost: '10 ptos Influencia' }
  ],
  diplomacy: [
    { id: 'dir_open_embassies', name: 'Canales Diplomáticos de Alta Frecuencia', desc: '+20% Reputación con Imperios Vecinos, -10% Éxito de Espionaje Propio', cost: '15 ptos Influencia' },
    { id: 'dir_embargo', name: 'Decreto de Sanciones Comerciales', desc: '-30% Comercio a Facción Hostil, +15% Cohesión Interna', cost: '20 ptos Influencia' },
    { id: 'dir_defensive_pact', name: 'Protocolo de Seguridad Interestelar', desc: '+25% Flota de Refuerzo Federal en Caso de Agresión', cost: '25 ptos Influencia' }
  ]
};
