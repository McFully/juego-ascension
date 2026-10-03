/**
 * Catálogo de Peculiaridades Geológicas e Hitos Ancestrales de los Planetas.
 * Confiere identidad única, bonificaciones pasivas y modulación en la Lonja local.
 */

export const PLANETARY_HERITAGE_TRAITS = {
  abyssal_titanium: {
    id: 'abyssal_titanium',
    name: 'Venas de Titanio Abisal',
    icon: '⛏️',
    type: 'geological',
    color: 'amber',
    desc: 'Gigantescas fracturas tectónicas repletas de titanio y minerales pesados.',
    bonusDesc: '+25% producción de Metal. Cotización de Metal reducida en su lonja local.',
    prodBonus: { metal: 0.25 },
    marketModifiers: { metal: 0.70, crystal: 1.10, deuterium: 1.15 }
  },
  resonant_silicon: {
    id: 'resonant_silicon',
    name: 'Estratos de Silicio Resonante',
    icon: '💎',
    type: 'geological',
    color: 'cyan',
    desc: 'Cavernas de prismas cuarcíferos con propiedades de resonancia piezoeléctrica pura.',
    bonusDesc: '+25% producción de Cristal. Cristal más asequible en la lonja local.',
    prodBonus: { crystal: 0.25 },
    marketModifiers: { metal: 1.10, crystal: 0.70, deuterium: 1.15 }
  },
  primeval_deuterium: {
    id: 'primeval_deuterium',
    name: 'Yacimiento de Deuterio Primigenio',
    icon: '🧪',
    type: 'geological',
    color: 'blue',
    desc: 'Bolsas subterráneas de isótopos pesados preservadas desde el colapso estelar del sistema.',
    bonusDesc: '+30% producción de Deuterio. Gran excedente y oferta en la lonja local.',
    prodBonus: { deuterium: 0.30 },
    marketModifiers: { metal: 1.15, crystal: 1.10, deuterium: 0.65 }
  },
  precursor_ruins: {
    id: 'precursor_ruins',
    name: 'Vestigios de Civilización Precursora',
    icon: '🏛️',
    type: 'archaeological',
    color: 'purple',
    desc: 'Monolitos y bibliotecas cuánticas en hibernación bajo la superficie continental.',
    bonusDesc: '+20% velocidad de investigación científica. Atrae a anticuarios y mercaderes.',
    prodBonus: { research: 0.20 },
    marketModifiers: { metal: 1.05, crystal: 1.05, deuterium: 1.05 }
  },
  hyperactive_geothermal: {
    id: 'hyperactive_geothermal',
    name: 'Geotermia Hiperactiva',
    icon: '⚡',
    type: 'energy',
    color: 'yellow',
    desc: 'Chimeneas hidrotermales hiperpresurizadas que ofrecen energía ilimitada a las plantas.',
    bonusDesc: '+35% generación energética global en el planeta.',
    prodBonus: { energyProd: 0.35 },
    marketModifiers: { metal: 0.90, crystal: 0.90, deuterium: 1.10 }
  },
  paradise_biosphere: {
    id: 'paradise_biosphere',
    name: 'Biosfera Paraíso',
    icon: '🌿',
    type: 'biological',
    color: 'emerald',
    desc: 'Un ecosistema simbiótico de flora fotosintética que potencia la salud y serenidad civil.',
    bonusDesc: '+40% crecimiento poblacional y +15 moral en el censo colonial.',
    prodBonus: { growth: 0.40, morale: 15 },
    marketModifiers: { metal: 1.05, crystal: 0.95, deuterium: 0.95 }
  },
  orbital_shipyards_heritage: {
    id: 'orbital_shipyards_heritage',
    name: 'Anillo Orbital Ingenieril',
    icon: '⚓',
    type: 'infrastructure',
    color: 'rose',
    desc: 'Un entramado orbital abandonado de anclajes magnéticos óptimo para montaje naval.',
    bonusDesc: '-20% tiempo de construcción naval y defensiva.',
    prodBonus: { shipTime: -0.20 },
    marketModifiers: { metal: 0.85, crystal: 1.15, deuterium: 1.00 }
  }
};

export const HERITAGE_KEYS = Object.keys(PLANETARY_HERITAGE_TRAITS);

/**
 * Obtiene o asigna el rasgo de herencia para un planeta determinado.
 */
export function getPlanetHeritage(planet) {
  if (!planet) return null;
  if (planet.heritageId && PLANETARY_HERITAGE_TRAITS[planet.heritageId]) {
    return PLANETARY_HERITAGE_TRAITS[planet.heritageId];
  }
  // Determinista según coordenadas o ID para planetas existentes sin rasgo asignado
  if (planet.isHome) {
    return PLANETARY_HERITAGE_TRAITS.precursor_ruins; // La capital tiene la cuna de los precursores
  }
  const seed = (planet.galaxy || 1) * 31 + (planet.system || 1) * 17 + (planet.position || 1) * 7;
  const key = HERITAGE_KEYS[Math.abs(seed) % HERITAGE_KEYS.length];
  return PLANETARY_HERITAGE_TRAITS[key];
}
