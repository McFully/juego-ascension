// ERA III: SUPREMACÍA Y GUERRA (Cap. 13 a 18)
export const ERA_III_MISSIONS = [
  // --- CAPÍTULO 13: Fusión y Cañones de Plasma ---
  { id: 'm13_1_fusion', name: 'Reactores de Fusión', icon: '☢️', chap: 13, desc: 'Construye una Planta de Fusión (nivel 3 o superior).', req: 'm12_2_viceroy_doc', check: (s, p) => (p.buildings?.fusionPlant || 0) >= 3, reward: { metal: 18000000, crystal: 15000000, deuterium: 8000000 }, rewardDesc: '+18M Metal, +15M Cristal, +8M Deuterio' },
  { id: 'm13_2_plasma', name: 'Tecnología de Plasma', icon: '🔥', chap: 13, desc: 'Investiga Tecnología de Plasma (nivel 1 o superior).', req: 'm13_1_fusion', targetTech: 'plasma', check: (s, p) => (s.research?.plasma || 0) >= 1, reward: { metal: 20000000, crystal: 16000000, deuterium: 9000000 }, rewardDesc: '+20M Metal, +16M Cristal, +9M Deuterio' },

  // --- CAPÍTULO 14: Escuadrón de Cruceros y Victoria Bélica ---
  { id: 'm14_1_cruiser', name: 'Escuadrón de Cruceros', icon: '🚢', chap: 14, desc: 'Construye al menos 10 Cruceros de Combate.', req: 'm13_2_plasma', check: (s, p) => (p.fleet?.cruiser || 0) >= 10, reward: { metal: 22000000, crystal: 15000000, deuterium: 8000000 }, rewardDesc: '+22M Metal, +15M Cristal, +8M Deuterio' },
  { id: 'm14_2_combat', name: 'Primera Victoria Bélica', icon: '🏆', chap: 14, desc: 'Gana tu primer combate contra una flota enemiga.', req: 'm14_1_cruiser', check: (s, p) => (s.combatsWon || 0) >= 1, reward: { metal: 25000000, crystal: 18000000, deuterium: 10000000 }, rewardDesc: '+25M Metal, +18M Cristal, +10M Deuterio' },

  // --- CAPÍTULO 15: Terraformación de Mundos ---
  { id: 'm15_1_terra_ship', name: 'Nave Terraformatriz', icon: '🌱', chap: 15, desc: 'Construye una Nave Terraformatriz Orbital.', req: 'm14_2_combat', check: (s, p) => (p.fleet?.terraformerShip || 0) >= 1 || (s.planets || []).some(pl => (pl.fleet?.terraformerShip || 0) >= 1), reward: { metal: 25000000, crystal: 20000000, deuterium: 12000000 }, rewardDesc: '+25M Metal, +20M Cristal, +12M Deuterio' },
  { id: 'm15_2_terra_mission', name: 'Mundo Acondicionado', icon: '🌍', chap: 15, desc: 'Completa con éxito la terraformación de un mundo hostil.', req: 'm15_1_terra_ship', check: (s, p) => (s.planets || []).some(pl => pl.terraformed), reward: { metal: 30000000, crystal: 25000000, deuterium: 15000000 }, rewardDesc: '+30M Metal, +25M Cristal, +15M Deuterio' },

  // --- CAPÍTULO 16: Astilleros Titánicos ---
  { id: 'm16_1_battleship', name: 'Acorazados de Batalla', icon: '⚔️', chap: 16, desc: 'Construye al menos 5 Acorazados.', req: 'm15_2_terra_mission', check: (s, p) => (p.fleet?.battleship || 0) >= 5, reward: { metal: 35000000, crystal: 25000000, deuterium: 15000000 }, rewardDesc: '+35M Metal, +25M Cristal, +15M Deuterio' },
  { id: 'm16_2_shipyard10', name: 'Astillero Nivel 10', icon: '🏭', chap: 16, desc: 'Alcanza nivel 10 de Astillero en tu mundo capital.', req: 'm16_1_battleship', check: (s, p) => (p.buildings?.shipyard || 0) >= 10, reward: { metal: 40000000, crystal: 30000000, deuterium: 18000000 }, rewardDesc: '+40M Metal, +30M Cristal, +18M Deuterio' },

  // --- CAPÍTULO 17: La Frontera de los 10 Mundos ---
  { id: 'm17_1_astro6', name: 'Astrofísica Imperial', icon: '🌌', chap: 17, desc: 'Investiga Astrofísica a nivel 6 o superior.', req: 'm16_2_shipyard10', targetTech: 'astrophysics', check: (s, p) => (s.research?.astrophysics || 0) >= 6, reward: { metal: 45000000, crystal: 35000000, deuterium: 20000000 }, rewardDesc: '+45M Metal, +35M Cristal, +20M Deuterio' },
  { id: 'm17_2_ten_worlds', name: 'El Hito de los 10 Mundos', icon: '👑', chap: 17, desc: 'Alcanza al menos 10 colonias y activa la Alta República.', req: 'm17_1_astro6', check: (s, p) => (s.planets || []).length >= 10, reward: { metal: 50000000, crystal: 40000000, deuterium: 25000000 }, rewardDesc: '+50M Metal, +40M Cristal, +25M Deuterio' },

  // --- CAPÍTULO 18: Primeras Leyes del Senado ---
  { id: 'm18_1_senate_vote', name: 'Voto en la Cámara Alta', icon: '🏛️', chap: 18, desc: 'Participa en la votación de tu primer dictamen del Senado Imperial.', req: 'm17_2_ten_worlds', check: (s, p) => (s.imperialCouncil?.passedBills || []).length >= 1, reward: { metal: 55000000, crystal: 40000000, deuterium: 25000000 }, rewardDesc: '+55M Metal, +40M Cristal, +25M Deuterio' },
  { id: 'm18_2_influence_lobby', name: 'Presión Parlamentaria', icon: '⚡', chap: 18, desc: 'Utiliza Influencia para comprar votos neutrales en el Senado.', req: 'm18_1_senate_vote', check: (s, p) => (s.influenceSpentInSenate || 0) >= 20 || (s.imperialCouncil?.passedBills || []).length >= 2, reward: { metal: 60000000, crystal: 45000000, deuterium: 30000000 }, rewardDesc: '+60M Metal, +45M Cristal, +30M Deuterio' },
];
