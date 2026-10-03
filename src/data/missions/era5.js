// ERA V: HEGEMONÍA Y SINGULARIDAD (Cap. 25 a 30)
export const ERA_V_MISSIONS = [
  // --- CAPÍTULO 25: Naves Insignia y Diseños Personalizados ---
  { id: 'm25_1_custom_yard', name: 'Astillero Modular', icon: '🔧', chap: 25, desc: 'Construye la Fábrica de Naves Personalizadas.', req: 'm24_2_five_hundred_fields', check: (s, p) => (p.buildings?.customShipyard || 0) >= 1, reward: { metal: 170000000, crystal: 140000000, deuterium: 90000000 }, rewardDesc: '+170M Metal, +140M Cristal, +90M Deuterio' },
  { id: 'm25_2_flagship', name: 'Nave Insignia Imperial', icon: '🛸', chap: 25, desc: 'Diseña y bota tu primera Nave Insignia personalizada.', req: 'm25_1_custom_yard', check: (s, p) => (s.blueprints || []).length >= 1, reward: { metal: 180000000, crystal: 150000000, deuterium: 100000000 }, rewardDesc: '+180M Metal, +150M Cristal, +100M Deuterio' },

  // --- CAPÍTULO 26: Bases Lunares y Phalanx ---
  { id: 'm26_1_moon_base', name: 'Ciudad Lunar', icon: '🌙', chap: 26, desc: 'Alcanza Base Lunar nivel 3 o superior en un satélite.', req: 'm25_2_flagship', check: (s, p) => (s.planets || []).some(pl => (pl.moon?.buildings?.lunarBase || 0) >= 3), reward: { metal: 190000000, crystal: 160000000, deuterium: 100000000 }, rewardDesc: '+190M Metal, +160M Cristal, +100M Deuterio' },
  { id: 'm26_2_phalanx', name: 'Sensor Phalanx', icon: '📡', chap: 26, desc: 'Construye un Sensor Phalanx en la Luna.', req: 'm26_1_moon_base', check: (s, p) => (s.planets || []).some(pl => (pl.moon?.buildings?.sensorPhalanx || 0) >= 1), reward: { metal: 200000000, crystal: 170000000, deuterium: 110000000 }, rewardDesc: '+200M Metal, +170M Cristal, +110M Deuterio' },

  // --- CAPÍTULO 27: Nanotecnología y Mega-Replicadores ---
  { id: 'm27_1_nanite', name: 'Fábrica de Nanobots', icon: '🧬', chap: 27, desc: 'Construye una Fábrica de Nanobots (nivel 2 o superior).', req: 'm26_2_phalanx', check: (s, p) => (p.buildings?.naniteFactory || 0) >= 2, reward: { metal: 220000000, crystal: 180000000, deuterium: 120000000 }, rewardDesc: '+220M Metal, +180M Cristal, +120M Deuterio' },
  { id: 'm27_2_nanite_speed', name: 'Línea de Ensamble Cuántica', icon: '⚡', chap: 27, desc: 'Alcanza nivel 4 de Nanobots en tu mundo capital.', req: 'm27_1_nanite', check: (s, p) => (p.buildings?.naniteFactory || 0) >= 4, reward: { metal: 240000000, crystal: 200000000, deuterium: 130000000 }, rewardDesc: '+240M Metal, +200K Cristal, +130M Deuterio' },

  // --- CAPÍTULO 28: Supremacía Militar Total ---
  { id: 'm28_1_armada', name: 'Armada Invencible', icon: '🚀', chap: 28, desc: 'Reúne más de 100 naves de guerra operativas en tu flota.', req: 'm27_2_nanite_speed', check: (s, p) => Object.values(p.fleet || {}).reduce((a, b) => a + b, 0) >= 100, reward: { metal: 260000000, crystal: 220000000, deuterium: 140000000 }, rewardDesc: '+260M Metal, +220M Cristal, +140M Deuterio' },
  { id: 'm28_2_conqueror', name: 'Conquistador de Sistemas', icon: '⚔️', chap: 28, desc: 'Alcanza al menos 10 victorias militares registradas en combate.', req: 'm28_1_armada', check: (s, p) => (s.combatsWon || 0) >= 10, reward: { metal: 280000000, crystal: 240000000, deuterium: 150000000 }, rewardDesc: '+280M Metal, +240M Cristal, +150M Deuterio' },

  // --- CAPÍTULO 29: La Estrella de la Muerte ---
  { id: 'm29_1_graviton', name: 'Tecnología de Gravitón', icon: '🌌', chap: 29, desc: 'Investiga Tecnología de Gravitón o Singularidad.', req: 'm28_2_conqueror', check: (s, p) => (s.research?.gravitation || 0) >= 1 || (s.research?.quantumEnergy || 0) >= 8, reward: { metal: 300000000, crystal: 250000000, deuterium: 160000000 }, rewardDesc: '+300M Metal, +250M Cristal, +160M Deuterio' },
  { id: 'm29_2_deathstar', name: 'Singularidad Gravitatoria', icon: '🌑', chap: 29, desc: 'Construye tu primera Estrella de la Muerte en el Astillero.', req: 'm29_1_graviton', check: (s, p) => (s.deathstarsBuilt || 0) >= 1, reward: { metal: 350000000, crystal: 300000000, deuterium: 200000000 }, rewardDesc: '+350M Metal, +300M Cristal, +200M Deuterio' },

  // --- CAPÍTULO 30: Ascensión Interestelar Absoluta ---
  { id: 'm30_1_fifteen_worlds', name: 'Imperio de Quince Mundos', icon: '🪐', chap: 30, desc: 'Gobierna al menos 15 planetas bajo la bandera de tu Imperio.', req: 'm29_2_deathstar', check: (s, p) => (s.planets || []).length >= 15, reward: { metal: 400000000, crystal: 350000000, deuterium: 220000000 }, rewardDesc: '+400M Metal, +350M Cristal, +220M Deuterio' },
  { id: 'm30_2_ascension', name: 'Ascensión Definitiva', icon: '👑', chap: 30, desc: 'Completa la Red Cuántica, ostenta la Estrella de la Muerte y supera los 100 niveles de I+D.', req: 'm30_1_fifteen_worlds', check: (s, p) => (s.deathstarsBuilt || 0) >= 1 && Object.values(s.research || {}).reduce((a, b) => a + b, 0) >= 100, reward: { metal: 500000000, crystal: 500000000, deuterium: 300000000 }, rewardDesc: '+500M Metal, +500M Cristal, +300M Deuterio' }
];
