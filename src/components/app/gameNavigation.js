export const GAME_TABS = [
  // === I. GOBERNANZA & COLONIAS ===
  { id: "overview", label: "🪐 Imperio", quadrant: "gov" },
  { id: "government", label: "👑 Alto Mando", quadrant: "gov" },
  { id: "ministry_infra", label: "🏗️ Infraestructuras", quadrant: "gov", parent: "government" },
  { id: "ministry_resources", label: "⛏️ Minería y Recursos", quadrant: "gov", parent: "government" },
  { id: "ministry_industry", label: "🏭 Industria", quadrant: "gov", parent: "government" },
  { id: "ministry_economy", label: "💼 Economía", quadrant: "gov", parent: "government" },
  { id: "ministry_energy", label: "⚡ Energía", quadrant: "gov", parent: "government" },
  { id: "ministry_science", label: "🔬 Ciencia", quadrant: "gov", parent: "government" },
  { id: "ministry_innovation", label: "💡 Innovación", quadrant: "gov", parent: "government" },
  { id: "ministry_cybernetics", label: "🧠 Cibernética e IA", quadrant: "gov", parent: "government" },
  { id: "ministry_defense", label: "🛡️ Defensa", quadrant: "gov", parent: "government" },
  { id: "ministry_war", label: "⚔️ Guerra", quadrant: "gov", parent: "government" },
  { id: "ministry_transport", label: "🚄 Transporte", quadrant: "gov", parent: "government" },
  { id: "ministry_logistics", label: "📦 Logística", quadrant: "gov", parent: "government" },
  { id: "ministry_biosphere", label: "🌍 Biosfera y Ecología", quadrant: "gov", parent: "government" },
  { id: "ministry_agriculture", label: "🌱 Agricultura", quadrant: "gov", parent: "government" },
  { id: "ministry_civics", label: "🏛️ Asuntos Civiles", quadrant: "gov", parent: "government" },
  { id: "ministry_diplomacy", label: "🤝 Diplomacia", quadrant: "gov", parent: "government" },
  { id: "ministry_intel", label: "🕵️ Inteligencia", quadrant: "gov", parent: "government" },
  { id: "ministry_justice", label: "⚖️ Justicia y Orden Federal", quadrant: "gov", parent: "government" },
  { id: "ministry_culture", label: "🎭 Cultura y Propaganda", quadrant: "gov", parent: "government" },
  { id: "colony_network", label: "🪐 Red de Colonias", quadrant: "gov", parent: "overview" },
  { id: "market", label: "💼 Mercado Galáctico", quadrant: "gov", parent: "overview" },
  { id: "missions", label: "🎯 Misiones y Objetivos", quadrant: "gov", parent: "overview" },
  { id: "stats", label: "📊 Estadísticas del Imperio", quadrant: "gov", parent: "overview" },

  // === I.b. MANDO IMPERIAL ===
  // Órganos del imperio. Sin `parent`: no cuelgan del gabinete de un planeta
  // porque no son asunto de ningún mundo. Se abren desde `ImperialCommandPage`.
  { id: "imperial_hub", label: "👑 Mando Imperial", quadrant: "imperial" },
  { id: "tactical_advisor", label: "🧠 Almirante Táctico IA", quadrant: "imperial", parent: "imperial_hub" },
  { id: "imperial_council", label: "⚖️ Consejo Imperial", quadrant: "imperial", parent: "imperial_hub" },
  { id: "imperial_senate", label: "🏛️ Senado Imperial", quadrant: "imperial", parent: "imperial_hub" },

  // === II. INFRAESTRUCTURA & CIENCIA ===
  { id: "buildings", label: "🏗️ Complejo de Obras", quadrant: "infra" },
  { id: "techTree", label: "🌌 Árbol Tecnológico", quadrant: "infra", parent: "ministry_science" },

  // === III. ALTO MANDO MILITAR ===
  { id: "shipyard", label: "🚀 Astillero Naval", quadrant: "military" },
  { id: "shipDesign", label: "🔧 Diseñador de Naves", quadrant: "military", parent: "shipyard" },
  { id: "fleet", label: "🛸 Hangar de la Flota", quadrant: "military" },
  { id: "defense", label: "🛡️ Bastión y Silos Defensivos", quadrant: "military" },
  { id: "missiles", label: "🚀 Silos de Misiles", quadrant: "military", parent: "defense" },
  { id: "combat", label: "⚔️ Simulador de Batalla", quadrant: "military", parent: "fleet" },
  { id: "moon", label: "🌙 Base Lunar", quadrant: "military" },

  // === IV. GALAXIA & DIPLOMACIA ===
  { id: "galaxy", label: "🌌 Mapa Estelar", quadrant: "galaxy" },
  { id: "diplomacy", label: "🤝 Cuerpo Diplomático", quadrant: "galaxy" },
  { id: "communications", label: "📡 Red de Inteligencia", quadrant: "galaxy", parent: "diplomacy" },
  // 3.5-b — Bandeja de comunicaciones. Vive junto a la Red de Inteligencia
  // porque es donde el jugador va a leer lo que antes saltaba solo en pantalla.
  { id: "telemetry", label: "📥 Registro Táctico", quadrant: "galaxy", parent: "communications" },
  // Simulación autónoma — auditoría de facciones y Director Estratégico
  { id: "galactic_observatory", label: "🔭 Observatorio Galáctico", quadrant: "galaxy", parent: "galaxy" },
];

export const isTabUnlocked = (id, currentPlanet, state) => {
  return true;
};
