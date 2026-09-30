export const BIOMES = {
  desert: {
    name: 'Desértico',
    desc: 'Altísima irradiación estelar. Óptimo para celdas solares, pero con escasez de agua líquida.',
    bonus: { metal: 0.25 },
    penalty: { crystal: -0.1 },
    energyMod: 1.5, // +50% Rendimiento Solar
    growthMod: 0.8, // -20% Crecimiento Poblacional
    specialization: 'solar_power',
    color: 'amber'
  },
  oceanic: {
    name: 'Oceánico',
    desc: 'Mundos cubiertos de agua profunda. Excelentes para soporte biológico y cultivos flotantes.',
    bonus: { crystal: 0.25 },
    penalty: { deuterium: -0.1 },
    energyMod: 0.9,
    growthMod: 1.4, // +40% Crecimiento Poblacional
    buildSpaceMod: 0.8, // -20% Espacio en superficie
    specialization: 'aquaculture',
    color: 'blue'
  },
  volcanic: {
    name: 'Volcánico',
    desc: 'Corteza inestable y fisuras de magma. Riquísimo en metales pesados y energía geotérmica masiva.',
    bonus: { metal: 0.60, deuterium: 0.25 },
    penalty: { crystal: -0.25 },
    energyMod: 1.75, // +75% Energía Geotérmica/Fusión
    growthMod: 0.5, // -50% Crecimiento Poblacional (ambiente letal)
    specialization: 'heavy_foundry',
    color: 'red'
  },
  tundra: {
    name: 'Tundra',
    desc: 'Valles permafrost y lagos subglaciares. Refrigeración pasiva para centros de computación.',
    bonus: { deuterium: 0.35 },
    penalty: { metal: -0.1 },
    researchMod: 1.2, // +20% Investigación Científica
    energyMod: 1.0,
    growthMod: 0.9,
    specialization: 'cryo_research',
    color: 'slate'
  },
  temperate: {
    name: 'Templado',
    desc: 'Biosfera equilibrada tipo Tierra. Alta estabilidad y desarrollo industrial orgánico.',
    bonus: { metal: 0.15, crystal: 0.15 },
    penalty: {},
    energyMod: 1.0,
    growthMod: 1.2, // +20% Crecimiento Poblacional
    specialization: 'balanced_colony',
    color: 'green'
  },
  toxic: {
    name: 'Tóxico',
    desc: 'Atmósferas ácidas e hidrocarburos volátiles. Síntesis química acelerada.',
    bonus: { crystal: 0.40, deuterium: 0.15 },
    penalty: { metal: -0.20 },
    energyMod: 0.85,
    growthMod: 0.6,
    specialization: 'chemical_synthesis',
    color: 'purple'
  },
  frozen: {
    name: 'Helado',
    desc: 'Casquetes polares perpetuos. Enfriamiento cuántico de supercomputadores y reservas de deuterio sólido.',
    bonus: { deuterium: 0.50 },
    penalty: { metal: -0.25, crystal: -0.15 },
    researchMod: 1.35, // +35% Investigación
    energyMod: 0.8,
    growthMod: 0.65,
    specialization: 'deep_cryogenics',
    color: 'cyan'
  },
  exotic: {
    name: 'Exótico',
    desc: 'Planeta anómalo con flora bioluminiscente y yacimientos hiperdensos de todos los elementos.',
    bonus: { metal: 0.25, crystal: 0.25, deuterium: 0.25 },
    penalty: {},
    researchMod: 1.25,
    energyMod: 1.25,
    growthMod: 1.1,
    specialization: 'prime_anomaly',
    color: 'pink'
  },
  barren: {
    name: 'Yermo',
    desc: 'Rocas inertes sin atmósfera. Excelente cimentación para silos subterráneos y bastiones militares.',
    bonus: {},
    penalty: { metal: -0.05, crystal: -0.05 },
    defenseMod: 1.3, // +30% Eficacia defensiva
    energyMod: 0.9,
    growthMod: 0.7,
    specialization: 'military_bastion',
    color: 'stone'
  },
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
  { name: 'Suelos Ricos', desc: '+10% producción metal', effect: { metal: 0.1 } },
  { name: 'Cristales Nativos', desc: '+10% producción cristal', effect: { crystal: 0.1 } },
  { name: 'Océanos de Deuterio', desc: '+15% producción deuterio', effect: { deuterium: 0.15 } },
  { name: 'Campo Magnético', desc: '-10% tiempo construcción', effect: { buildTime: -0.1 } },
  { name: 'Ruinas Antiguas', desc: '+10% investigación', effect: { research: 0.1 } },
  { name: 'Clima Extremo', desc: '-10% producción general', effect: { malus: 0.1 } },
  { name: 'Yermo Radioactivo', desc: '-15% producción, +5% defensa', effect: { malus: 0.15, defense: 0.05 } },
  { name: 'Ecosistema Frágil', desc: '-20% tamaño efectivo', effect: { sizeMalus: 0.2 } },
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

// ==========================================
// ARQUITECTURA DE PLANETA VIVO Y GOBERNANZA
// ==========================================

export const BIOME_THERMAL_PROFILES = {
  volcanic: { baseTempC: 85, dissipationMW: 2500, geothermalPotential: 2.0 },
  desert: { baseTempC: 45, dissipationMW: 3500, geothermalPotential: 0.8 },
  ocean: { baseTempC: 18, dissipationMW: 6000, geothermalPotential: 1.2 },
  tundra: { baseTempC: -15, dissipationMW: 7500, geothermalPotential: 1.0 },
  temperate: { baseTempC: 15, dissipationMW: 5000, geothermalPotential: 1.0 },
  toxic: { baseTempC: 60, dissipationMW: 3000, geothermalPotential: 1.5 },
  frozen: { baseTempC: -60, dissipationMW: 9000, geothermalPotential: 0.6 },
  exotic: { baseTempC: 22, dissipationMW: 6500, geothermalPotential: 1.8 },
  barren: { baseTempC: 5, dissipationMW: 4000, geothermalPotential: 0.5 },
};

export const GOVERNOR_TRAITS = [
  { id: 'technocrat_pragmatic', name: 'Tecnócrata Pragmático', icon: '🤖', desc: '+15% velocidad I+D, -10% consumo de energía industrial.', scienceMod: 1.15, energyConsMod: 0.90 },
  { id: 'industrial_tycoon', name: 'Magnate de la Industria', icon: '🏭', desc: '+20% producción de metal/cristal, +15% polución.', prodMod: 1.20, pollutionMod: 1.15 },
  { id: 'humanist_reformer', name: 'Reformador Humanista', icon: '🕊️', desc: '+25% moral civil, +15% crecimiento poblacional, +10% consumo de servicios.', moraleMod: 1.25, growthMod: 1.15 },
  { id: 'iron_disciplinarian', name: 'Comandante de Hierro', icon: '🎖️', desc: '+20% defensa local, -50% malestar civil, -5% moral.', defenseMod: 1.20, unrestMod: 0.50, moraleMod: 0.95 },
  { id: 'green_terraformer', name: 'Ecologista Planetario', icon: '🌱', desc: '-40% polución, +20% eficiencia agrícola, -5% producción minera.', pollutionMod: 0.60, foodMod: 1.20, prodMod: 0.95 },
];

export const MINISTERIAL_SUBTASKS = {
  infra: [
    { id: 'seal_domes', name: 'Sellado Hermético de Cúpulas', icon: '🛡️', desc: 'Previene fugas atmosféricas. Consume 15 Deuterio/tick.', costDeut: 15, effect: 'leak_prevention' },
    { id: 'hyperloop_logistics', name: 'Arterias Maglev Subterráneas', icon: '🚄', desc: '+10% rendimiento de factorías. Consume 20 Energía.', energyReq: 20, effect: 'factory_boost' },
    { id: 'sludge_filtration', name: 'Depuración Catalítica de Residuos', icon: '🧪', desc: 'Reduce activamente 0.5 polución/tick. Consume 25 Cristal.', costCryst: 25, effect: 'pollution_reduction' },
  ],
  energy: [
    { id: 'radiator_arrays', name: 'Despliegue de Radiadores Criogénicos', icon: '❄️', desc: '+25% capacidad de disipación térmica planetaria.', effect: 'extra_dissipation' },
    { id: 'reactor_overdrive', name: 'Sobrecarga de Fusión', icon: '⚡', desc: '+20% energía total, genera +500 MW de calor residual.', effect: 'energy_overdrive' },
    { id: 'emergency_batteries', name: 'Redundancia Superconductora', icon: '🔋', desc: 'Elimina riesgo de apagones por sobrecarga.', effect: 'blackout_immunity' },
  ],
  economy: [
    { id: 'automation_subsidies', name: 'Subsidios a la Automatización', icon: '🤖', desc: '+10% producción de minas sin necesitar mano de obra adicional.', effect: 'mine_automation' },
    { id: 'ration_war_metal', name: 'Prioridad Bélica de Materiales', icon: '⚔️', desc: '+15% velocidad de astilleros navales, -5 moral civil.', effect: 'shipyard_haste' },
  ],
  welfare: [
    { id: 'fertility_stimulus', name: 'Estímulo Poblacional', icon: '🍼', desc: '+30% natalidad colonial. Consume 30 Alimentos/tick.', effect: 'fertility_boost' },
    { id: 'cellular_regen', name: 'Clínicas Celulares Avanzadas', icon: '🧬', desc: 'Mantiene la salud planetaria en 100%. Consume 10 Cristal/tick.', costCryst: 10, effect: 'health_boost' },
  ],
  defense: [
    { id: 'silo_hardening', name: 'Acorazamiento de Silos Subterráneos', icon: '🛡️', desc: 'Los silos y bastiones sufren un 30% menos de daño en incursiones.', effect: 'defense_hardening' },
    { id: 'counter_espionage', name: 'Vigilancia de Frontera', icon: '👁️', desc: '+50% probabilidad de capturar espías enemigos antes de infiltrarse.', effect: 'counter_intel' },
  ]
};

