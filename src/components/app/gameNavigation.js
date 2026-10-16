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
  { id: "colony_network", label: "🪐 Red de Colonias y Logística", quadrant: "imperial", parent: "overview" },
  { id: "sectors", label: "🗺️ Sectores Coloniales", quadrant: "imperial", parent: "colony_network" },
  { id: "market", label: "💼 Mercado y Comercio Galáctico", quadrant: "imperial", parent: "imperial_hub" },
  { id: "planetary_bank", label: "🏦 Banca Planetaria", quadrant: "gov", parent: "overview" },
  { id: "galactic_bank", label: "💎 Banca Galáctica Central", quadrant: "imperial", parent: "imperial_hub" },
  { id: "missions", label: "🎯 Misiones y Objetivos", quadrant: "gov", parent: "overview" },
  { id: "wiki", label: "📚 Enciclopedia Imperial", quadrant: "gov", parent: "overview" },
  { id: "stats", label: "📊 Estadísticas del Imperio", quadrant: "gov", parent: "wiki" },
  { id: "replay", label: "📼 Registro Histórico", quadrant: "gov", parent: "stats" },

  // === I.b. MANDO IMPERIAL ===
  // Órganos del imperio. Sin `parent`: no cuelgan del gabinete de un planeta
  // porque no son asunto de ningún mundo. Se abren desde `ImperialCommandPage`.
  { id: "imperial_hub", label: "👑 Mando Imperial", quadrant: "imperial" },
  { id: "galaxy", label: "🌌 Cartografía", quadrant: "imperial", parent: "imperial_hub" },
  { id: "imperial_fleet", label: "🛸 Almirantazgo y Operaciones Imperiales", quadrant: "imperial", parent: "imperial_hub" },
  { id: "tactical_advisor", label: "🧠 Almirante Táctico IA", quadrant: "imperial", parent: "imperial_hub" },
  { id: "imperial_council", label: "⚖️ Consejo Imperial", quadrant: "imperial", parent: "imperial_hub" },
  { id: "imperial_senate", label: "🏛️ Senado Imperial", quadrant: "imperial", parent: "imperial_hub" },
  { id: "diplomacy", label: "🤝 Cuerpo Diplomático", quadrant: "imperial" },
  { id: "communications", label: "📡 Red de Inteligencia", quadrant: "imperial", parent: "imperial_hub" },
  { id: "telemetry", label: "📥 Registro Táctico", quadrant: "imperial", parent: "communications" },
  { id: "galactic_observatory", label: "🔭 Observatorio Galáctico", quadrant: "imperial", parent: "galaxy" },

  // === II. INFRAESTRUCTURA & CIENCIA ===
  { id: "buildings", label: "🏗️ Complejo de Obras", quadrant: "infra" },
  { id: "techTree", label: "🌌 Árbol Tecnológico", quadrant: "infra", parent: "ministry_science" },

  // === III. ALTO MANDO MILITAR Y LOGÍSTICA LOCAL ===
  { id: "shipyard", label: "🚀 Astillero Naval", quadrant: "military" },
  { id: "shipDesign", label: "🔧 Diseñador de Naves", quadrant: "imperial", parent: "shipyard" },
  { id: "fleet", label: "🛸 Guarnición y Hangar Local", quadrant: "military" },
  { id: "local_market", label: "💼 Puerto de Carga y Lonja Local", quadrant: "gov", parent: "government" },
  { id: "defense", label: "🛡️ Bastión y Silos Defensivos", quadrant: "military" },
  { id: "missiles", label: "🚀 Silos de Misiles", quadrant: "military", parent: "defense" },
  { id: "combat", label: "⚔️ Centro de Guerra y Simulador", quadrant: "imperial", parent: "fleet" },
  { id: "moon", label: "🌙 Base Lunar", quadrant: "military" },
];

export const isTabUnlocked = (id, currentPlanet, state) => {
  return true;
};
