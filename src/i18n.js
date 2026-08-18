export const translations = {
  es: {
    // Header & Resources
    playerName: "Comandante",
    metal: "Metal",
    crystal: "Cristal",
    deuterium: "Deuterio",
    energy: "Energía",
    storage: "Almacenamiento",
    productionPerHour: "Producción por Hora",
    productionPerDay: "Producción por Día",
    globalResources: "Recursos Globales",
    fleetSummary: "Flota",
    defenses: "Defensas",
    retrofit: "Modernización",
    retrofitFleet: "Modernizar Flota",
    retrofitDefenses: "Modernizar Defensas",
    flightMissions: "Flotas en Vuelo",
    reinforcements: "Solicitar Ayuda",
    
    // Sidebar Tabs
    tabOverview: "🏠 Resumen",
    tabMissions: "📋 Misiones",
    tabBuildings: "🏗️ Edificios",
    tabResearch: "🔬 Investigación",
    tabShipyard: "🚀 Astillero",
    tabDefense: "🛡️ Defensas",
    tabMissiles: "🎯 Misiles",
    tabGalaxy: "🌌 Galaxia",
    tabFleet: "⚔️ Flota",
    tabCombat: "📜 Combates",
    tabStats: "📊 Stats",
    tabMoon: "🌙 Luna",
    tabTechTree: "🌳 Árbol",
    tabShipDesign: "🔧 Diseño",
    tabDiplomacy: "🤝 Diplomacia",
    tabSettings: "⚙️ Ajustes",
    
    // Settings
    settingsTitle: "Ajustes del Sistema",
    language: "Idioma",
    soundEffects: "Efectos de Sonido",
    enabled: "Activado",
    disabled: "Desactivado",
    saveGame: "Guardar Partida",
    loadGame: "Cargar Partida",
    resetGame: "Reiniciar Partida",
    
    // Missions / Campaign
    activeMissionLabel: "MISIÓN ACTIVA",
    campaignProgress: "Progreso de Campaña",
    completed: "Completada",
    active: "Activa",
    locked: "Bloqueada",
    pending: "Pendiente",
    rewardLabel: "Recompensa:",
    rewardGranted: "Se otorga automáticamente al cumplir el objetivo."
  }
};

export const getTranslator = (lang) => {
  return (key) => {
    return translations.es[key] || key;
  };
};
