export const ACHIEVEMENTS = [
  { id: 'first_building', name: 'Primer Paso', icon: '🏗️', desc: 'Construye tu primer edificio', check: s => s.totalBuildings >= 1 },
  { id: 'first_research', name: 'Científico', icon: '🔬', desc: 'Completa tu primera investigación', check: s => s.totalResearch >= 1 },
  { id: 'first_ship', name: 'Astillero Naval', icon: '🚀', desc: 'Construye tu primera nave', check: s => s.totalShips >= 1 },
  { id: 'first_combat', name: 'Bautismo de Fuego', icon: '⚔️', desc: 'Participa en tu primer combate', check: s => s.combatsWon + s.combatsLost + s.combatsDraw >= 1 },
  { id: 'first_colony', name: 'Expansión', icon: '🏴', desc: 'Funda tu primera colonia', check: s => s.coloniesFounded >= 1 },
  { id: 'first_moon', name: 'Luna Nueva', icon: '🌙', desc: 'Consigue tu primera luna', check: s => s.moonsCreated >= 1 },
  { id: 'resource_master', name: 'Magnate Minero', icon: '⛏️', desc: 'Reúne 1M de metal total', check: s => s.metalGathered >= 1e6 },
  { id: 'crystal_master', name: 'Cristalino', icon: '💎', desc: 'Reúne 500K de cristal total', check: s => s.crystalGathered >= 500000 },
  { id: 'fleet_commander', name: 'Comandante de Flota', icon: '🚢', desc: 'Construye 1000 naves', check: s => s.totalShips >= 1000 },
  { id: 'defense_network', name: 'Fortaleza', icon: '🛡️', desc: 'Construye 500 defensas', check: s => s.totalDefenses >= 500 },
  { id: 'builder', name: 'Arquitecto', icon: '🏛️', desc: 'Construye 100 niveles de edificios', check: s => s.totalBuildings >= 100 },
  { id: 'researcher', name: 'Erudito', icon: '📚', desc: 'Completa 30 investigaciones', check: s => s.totalResearch >= 30 },
  { id: 'warlord', name: 'Señor de la Guerra', icon: '💀', desc: 'Gana 25 combates', check: s => s.combatsWon >= 25 },
  { id: 'survivor', name: 'Superviviente', icon: '♟️', desc: 'Sobrevive a 10 derrotas', check: s => s.combatsLost >= 10 },
  { id: 'explorer', name: 'Explorador', icon: '🌌', desc: 'Completa 50 expediciones', check: s => (s.expeditionsCompleted || 0) >= 50 },
  { id: 'deathstar', name: 'Terror Cósmico', icon: '🌑', desc: 'Construye una Estrella de la Muerte', check: s => s.deathstarsBuilt >= 1 },
  { id: 'tech_advance', name: 'Avance Tecnológico', icon: '🔭', desc: 'Alcanza nivel 10 en cualquier tecnología', check: s => s.maxTechLevel >= 10 },
  { id: 'millionaire', name: 'Multimillonario', icon: '💰', desc: 'Acumula 10M de recursos totales', check: s => (s.metalGathered + s.crystalGathered + s.deuteriumGathered) >= 1e7 },
  { id: 'retrofitter', name: 'Modernizador', icon: '🔧', desc: 'Completa tu primera modernización', check: s => s.retrofitsCompleted >= 1 },
  { id: 'alien_artifact', name: 'Arqueólogo', icon: '🛸', desc: 'Encuentra un artefacto alienígena en expedición', check: s => s.artifactsFound >= 1 },
  { id: 'exchange_founder', name: 'Magnate de la Lonja', icon: '🏛️', desc: 'Despliega un Arca Mercantil y funda el Planeta Lonja', check: s => (s.planets || []).some(p => p.isExchangePlanet) },
  { id: 'dao_major_shareholder', name: 'Accionista Mayoritario', icon: '💎', desc: 'Alcanza al menos un 20% de participación en el pool del DAO', check: s => ((s.playerDaoShares || 0) / (s.daoShares || 1)) >= 0.2 },
];

export const RES_NAMES = { metal: 'Metal', crystal: 'Cristal', deuterium: 'Deuterio', credits: 'Créditos Estelares' };
export const RES_ICONS = { metal: '⛏️', crystal: '💎', deuterium: '⚗️', energy: '⚡', credits: '₢' };

export const NARRATIVE_EVENTS = [
  {
    id: 'first_expansion',
    title: 'Nueva Frontera',
    type: 'info',
    image: 'event_first_expansion.jpg',
    description: 'Nuestros sensores detectan una anomalía en un sector cercano que podría ser ideal para la colonización. El Alto Mando sugiere preparar naves colonizadoras.',
    triggerCondition: (s) => s.totalBuildings > 5 && (s.planets?.length || 0) === 1,
    options: [
      {
        text: 'Entendido, prepararemos la expedición.',
        bonus: '+5 Puntos de Influencia imperial.',
        penalty: null,
        impact: (s) => ({ ...s, influence: (s.influence || 0) + 5 })
      }
    ]
  },
  {
    id: 'economic_boom',
    title: 'Auge Económico',
    type: 'success',
    image: 'event_economic_boom.jpg',
    description: 'Un descubrimiento en las técnicas de minería ha disparado la eficiencia en todas nuestras colonias. ¡Es un buen momento para reinvertir!',
    triggerCondition: (s) => (s.gameTick || 0) > 600 && Math.random() < 0.3,
    options: [
      {
        text: 'Excelente noticia.',
        bonus: '+5.000 Metal y +2.500 Cristal en cada planeta.',
        penalty: null,
        impact: (s) => {
          const newState = { ...s };
          newState.planets = newState.planets.map(p => ({
            ...p,
            resources: {
              ...p.resources,
              metal: (p.resources.metal || 0) + 5000,
              crystal: (p.resources.crystal || 0) + 2500
            }
          }));
          return newState;
        }
      }
    ]
  },
  {
    id: 'space_pirates',
    title: 'Piratas Espaciales',
    type: 'crisis',
    image: 'event_space_pirates.jpg',
    description: 'Una banda de piratas ha sido detectada merodeando nuestras rutas comerciales. Debemos reforzar nuestras defensas.',
    triggerCondition: (s) => s.totalShips > 20 && Math.random() < 0.2,
    options: [
      {
        text: 'Enviad patrullas.',
        bonus: '+2 Reputación galáctica por defender el comercio.',
        penalty: 'Riesgo de desgaste en patrullas navales.',
        impact: (s) => ({ ...s, reputation: (s.reputation || 0) + 2 })
      },
      {
        text: 'Ignoradlos por ahora.',
        bonus: 'Ahorro de recursos y combustible.',
        penalty: '-5 Reputación galáctica por negligencia defensiva.',
        impact: (s) => ({ ...s, reputation: (s.reputation || 0) - 5 })
      }
    ]
  },
  {
    id: 'ancient_ruins',
    title: 'Ruinas Antiguas',
    type: 'info',
    image: 'event_ancient_ruins.jpg',
    description: 'Sondeos profundos en uno de nuestros asteroides cercanos han revelado una estructura enterrada de origen desconocido. Podría contener tecnología valiosa.',
    triggerCondition: (s) => (s.gameTick || 0) > 300 && Math.random() < 0.15,
    options: [
      {
        text: 'Excavar el sitio arqueológico.',
        bonus: '+1 Nivel gratuito en una investigación científica activa.',
        penalty: 'Riesgo de despertar defensas o radiación ancestral.',
        impact: (s) => {
          const newState = { ...s };
          const techKeys = Object.keys(s.research || {}).filter(k => (s.research[k] || 0) > 0);
          if (techKeys.length > 0) {
            const pick = techKeys[Math.floor(Math.random() * techKeys.length)];
            newState.research = { ...newState.research, [pick]: (newState.research[pick] || 0) + 1 };
          }
          return newState;
        }
      },
      {
        text: 'Sellar el área por seguridad.',
        bonus: '+3 Reputación galáctica por prudencia diplomática y científica.',
        penalty: 'Pérdida irrecuperable de secretos tecnológicos olvidados.',
        impact: (s) => ({ ...s, reputation: (s.reputation || 0) + 3 })
      }
    ]
  },
  {
    id: 'colonial_tensions',
    title: 'Tensiones Coloniales',
    type: 'crisis',
    image: 'event_space_pirates.jpg',
    description: 'Aumentan las protestas en nuestras colonias ante la falta de representación en el senado galáctico. Grupos separatistas están ganando apoyo.',
    triggerCondition: (s) => s.planets.length >= 3 && Math.random() < 0.12,
    options: [
      {
        text: 'Prometer reformas y mayor autonomía.',
        bonus: '+10 Puntos de Influencia en las colonias.',
        penalty: 'Menor control centralizado en los mundos exteriores.',
        impact: (s) => ({ ...s, influence: (s.influence || 0) + 10 })
      },
      {
        text: 'Desplegar fuerzas de seguridad.',
        bonus: 'Restablecimiento inmediato del orden colonial.',
        penalty: '-5 Reputación galáctica por represión civil.',
        impact: (s) => ({ ...s, reputation: (s.reputation || 0) - 5 })
      }
    ]
  },
  {
    id: 'solar_flare',
    title: 'Tormenta Solar Masiva',
    type: 'crisis',
    image: 'event_solar_flare.jpg',
    description: 'Una tormenta solar de proporciones épicas se dirige hacia nuestros planetas. Los sistemas de comunicación y energía podrían verse gravemente afectados.',
    triggerCondition: (s) => (s.gameTick || 0) > 800 && Math.random() < 0.1,
    options: [
      {
        text: 'Activar escudos planetarios de emergencia.',
        bonus: 'Protección absoluta de infraestructuras y colonos.',
        penalty: 'Consumo de -200 Energía en cada planeta.',
        impact: (s) => {
          const newState = { ...s };
          newState.planets = newState.planets.map(p => ({
            ...p,
            resources: {
              ...p.resources,
              energy: (p.resources.energy || 0) - 200
            }
          }));
          return newState;
        }
      },
      {
        text: 'Confinar a la población en refugios subterráneos.',
        bonus: 'Cero coste energético en la red de escudos.',
        penalty: 'Caída temporal del rendimiento productivo civil.',
        impact: (s) => ({ ...s })
      }
    ]
  }
];

export const FACTIONS = {
  human: {
    name: 'República Nova',
    race: 'Humanos',
    color: 'cyan',
    bgColor: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300',
    icon: '👥',
    techStyle: 'Industrial y adaptable',
    lore: 'Una facción humana democrática nacida de las cenizas de la vieja Tierra. Su adaptabilidad e ingenio científico les permite investigar un 10% más rápido.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.10, resistance: 1.0 }
  },
  cyborg: {
    name: 'Dominion Xelar',
    race: 'Cyborgs',
    color: 'purple',
    bgColor: 'bg-purple-500/10 border-purple-500/40 text-purple-300',
    icon: '🦾',
    techStyle: 'Cibernética avanzada',
    lore: 'Seres fusionados con tecnología. Buscan la perfección cibernética, otorgándoles un 10% más de ataque militar y un 10% de resistencia estructural.',
    bonuses: { attack: 1.10, defense: 1.0, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.0, research: 1.05, resistance: 1.10 }
  },
  synth: {
    name: 'Colectivo Zenith',
    race: 'IA Sintéticas',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
    icon: '🤖',
    techStyle: 'Redes neuronales cuánticas',
    lore: 'Una colmena digital autoconsciente. Optimizan la producción en un 10% y los reactores energéticos rinden un 15% más.',
    bonuses: { attack: 1.0, defense: 1.0, production: 1.10, energy: 1.15, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.0 }
  },
  draconian: {
    name: 'Imperio Draconiano',
    race: 'Draconianos',
    color: 'red',
    bgColor: 'bg-red-500/10 border-red-500/40 text-red-300',
    icon: '🐲',
    techStyle: 'Balística pesada y asalto',
    lore: 'Una raza guerrera y belicosa orientada a la conquista física. Obtienen un 15% de bonificación al ataque aéreo y terrestre.',
    bonuses: { attack: 1.15, defense: 1.10, production: 0.95, energy: 1.0, speed: 1.0, espionage: 1.0, research: 1.0, resistance: 1.10 }
  },
  helios: {
    name: 'Confederación Helios',
    race: 'Helianos',
    color: 'amber',
    bgColor: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    icon: '☀️',
    techStyle: 'Propulsión termonuclear solar',
    lore: 'Adoradores de las estrellas que dominan la energía solar. Sus motores viajan un 5% más rápido y producen un 10% más de energía solar.',
    bonuses: { attack: 1.0, defense: 1.05, production: 1.05, energy: 1.10, speed: 1.05, espionage: 1.0, research: 1.0, resistance: 1.0 }
  },
  solaris: {
    name: 'Imperio Solaris',
    race: 'Solarios',
    color: 'yellow',
    bgColor: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300',
    icon: '👑',
    techStyle: 'Reactores estelares puros',
    lore: 'Descendientes de civilizaciones de plasma. Generan un 20% más de energía pero sus sensores de espionaje sufren un 5% de penalización.',
    bonuses: { attack: 1.05, defense: 1.05, production: 1.0, energy: 1.20, speed: 1.0, espionage: 0.95, research: 1.05, resistance: 1.0 }
  },
  drakon: {
    name: 'Soberanía Drakon',
    race: 'Drakonianos Supremos',
    color: 'rose',
    bgColor: 'bg-rose-500/10 border-rose-500/40 text-rose-300',
    icon: '⚔️',
    techStyle: 'Plasma pesado y blindajes',
    lore: 'Una facción de reptiles modificados genéticamente para resistir cualquier tormenta cósmica. Su defensa estructural es 15% superior.',
    bonuses: { attack: 1.10, defense: 1.15, production: 1.0, energy: 0.95, speed: 1.0, espionage: 1.05, research: 1.0, resistance: 1.10 }
  },
  vortex: {
    name: 'Cábala Vortex',
    race: 'Vacíos',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
    icon: '🌀',
    techStyle: 'Motores hiperespaciales de vacío',
    lore: 'Una misteriosa orden que habita en las fisuras hiperespaciales. Su velocidad de flota es 15% mayor y el espionaje aumenta 20%.',
    bonuses: { attack: 1.05, defense: 1.0, production: 1.0, energy: 1.0, speed: 1.15, espionage: 1.20, research: 1.0, resistance: 0.95 }
  },
  umbra: {
    name: 'Protectorado Umbra',
    race: 'Sorgs de Sombra',
    color: 'slate',
    bgColor: 'bg-slate-500/10 border-slate-500/40 text-slate-300',
    icon: '🖤',
    techStyle: 'Nanoestructuras oscuras',
    lore: 'Una sociedad que vive en la oscuridad profunda del espacio. Sus naves tienen un 15% más de resistencia y 15% de espionaje.',
    bonuses: { attack: 1.0, defense: 1.10, production: 1.0, energy: 1.05, speed: 1.0, espionage: 1.15, research: 1.0, resistance: 1.15 }
  }
};

// Reliquias/Artefactos descubribles en expediciones
export const ARTIFACTS = [
  { id: 'crystal_heart', name: 'Corazón de Cristal', icon: '💎', desc: 'Núcleo cristalino pulsante. Aumenta producción de cristal +15%.', effect: { crystalProd: 1.15 } },
  { id: 'quantum_core', name: 'Núcleo Cuántico', icon: '⚛️', desc: 'Reactor cuántico alienígena. Energía +20%.', effect: { energyProd: 1.20 } },
  { id: 'war_drone', name: 'Dron de Guerra Ancestral', icon: '🤖', desc: 'Autómata de combate milenario. +10% ataque flota.', effect: { fleetAtk: 1.10 } },
  { id: 'shield_matrix', name: 'Matriz de Escudos', icon: '🛡️', desc: 'Campo de fuerza intacto de una civilización perdida. +15% escudos defensas.', effect: { defShd: 1.15 } },
  { id: 'titan_gear', name: 'Engranaje Titán', icon: '⚙️', desc: 'Mecanismo de precisión imposible. Velocidad construcción +10%.', effect: { buildSpeed: 1.10 } },
  { id: 'void_map', name: 'Mapa del Vacío', icon: '🗺️', desc: 'Cartografía dimensional. Velocidad flota +12%.', effect: { fleetSpeed: 1.12 } },
  { id: 'nexus_eye', name: 'Ojo del Nexo', icon: '👁️', desc: 'Sensor cuántico omnidireccional. +15% espionaje.', effect: { spyBonus: 1.15 } },
  { id: 'forge_prime', name: 'Forja Primigenia', icon: '🔨', desc: 'Yunque de aleación imposible. Producción metal +15%.', effect: { metalProd: 1.15 } },
];
