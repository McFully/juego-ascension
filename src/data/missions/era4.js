// ERA IV: ALTA REPÚBLICA Y MEGAPROYECTOS (Cap. 19 a 24)
export const ERA_IV_MISSIONS = [
  // --- CAPÍTULO 19: El Gabinete de Ministros Supremos ---
  { id: 'm19_1_supreme_min', name: 'Primer Ministro Supremo', icon: '👑', chap: 19, desc: 'Nombra a tu primer Ministro Supremo en el Consejo Imperial.', req: 'm18_2_influence_lobby', check: (s, p) => Object.keys(s.imperialCouncil?.ministers || {}).length >= 1, reward: { metal: 65000000, crystal: 50000000, deuterium: 30000000 }, rewardDesc: '+65M Metal, +50M Cristal, +30M Deuterio' },
  { id: 'm19_2_full_council', name: 'Gabinete Plenario', icon: '💼', chap: 19, desc: 'Cubre al menos 3 carteras del Consejo Imperial.', req: 'm19_1_supreme_min', check: (s, p) => Object.keys(s.imperialCouncil?.ministers || {}).length >= 3, reward: { metal: 75000000, crystal: 60000000, deuterium: 35000000 }, rewardDesc: '+75M Metal, +60M Cristal, +35M Deuterio' },

  // --- CAPÍTULO 20: Abastecimiento y Demandas Coloniales ---
  { id: 'm20_1_resolve_demand', name: 'Socorro Colonial', icon: '📦', chap: 20, desc: 'Despacha suministros y resuelve tu primera Demanda Colonial.', req: 'm19_2_full_council', check: (s, p) => (s.demandsResolvedCount || 0) >= 1, reward: { metal: 70000000, crystal: 55000000, deuterium: 35000000 }, rewardDesc: '+70M Metal, +55M Cristal, +35M Deuterio' },
  { id: 'm20_2_stable_colonies', name: 'Paz Social Federal', icon: '🕊️', chap: 20, desc: 'Resuelve al menos 3 Demandas Coloniales con éxito.', req: 'm20_1_resolve_demand', check: (s, p) => (s.demandsResolvedCount || 0) >= 3, reward: { metal: 80000000, crystal: 65000000, deuterium: 40000000 }, rewardDesc: '+80M Metal, +65M Cristal, +40M Deuterio' },

  // --- CAPÍTULO 21: La Iniciativa Cuántica Federal ---
  { id: 'm21_1_quantum_law', name: 'Aprobación del Megaproyecto', icon: '📜', chap: 21, desc: 'Promulga en el Senado la Ley de la Gran Red Cuántica.', req: 'm20_2_stable_colonies', check: (s, p) => (s.megaprojects?.quantumNetworkApproved), reward: { metal: 85000000, crystal: 70000000, deuterium: 45000000 }, rewardDesc: '+85M Metal, +70M Cristal, +45M Deuterio' },
  { id: 'm21_2_quantum_tech', name: 'Física Subespacial', icon: '🔬', chap: 21, desc: 'Investiga Redes Cuánticas a nivel 3 o superior.', req: 'm21_1_quantum_law', targetTech: 'quantumNetworks', check: (s, p) => (s.research?.quantumNetworks || 0) >= 3, reward: { metal: 90000000, crystal: 75000000, deuterium: 50000000 }, rewardDesc: '+90M Metal, +75M Cristal, +50M Deuterio' },

  // --- CAPÍTULO 22: Financiación de la Red Cuántica ---
  { id: 'm22_1_tax_boost', name: 'Impuesto de Megaproyecto', icon: '💰', chap: 22, desc: 'Aporta la Fase 1 del Portal Cuántico (Metal y Deuterio masivos).', req: 'm21_2_quantum_tech', check: (s, p) => (s.megaprojects?.quantumPortalStage || 0) >= 1, reward: { metal: 100000000, crystal: 80000000, deuterium: 50000000 }, rewardDesc: '+100M Metal, +80M Cristal, +50M Deuterio' },
  { id: 'm22_2_stage2', name: 'Matriz de Confinamiento', icon: '⚡', chap: 22, desc: 'Completa la Fase 2 del Megaproyecto Cuántico.', req: 'm22_1_tax_boost', check: (s, p) => (s.megaprojects?.quantumPortalStage || 0) >= 2, reward: { metal: 110000000, crystal: 90000000, deuterium: 55000000 }, rewardDesc: '+110M Metal, +90M Cristal, +55M Deuterio' },

  // --- CAPÍTULO 23: Activación del Portal Cuántico ---
  { id: 'm23_1_portal_online', name: 'Puerta Cuántica Activa', icon: '🌀', chap: 23, desc: 'Completa la Fase 3 y abre el primer Portal Cuántico del Imperio.', req: 'm22_2_stage2', check: (s, p) => (s.megaprojects?.quantumPortalStage || 0) >= 3, reward: { metal: 130000000, crystal: 100000000, deuterium: 60000000 }, rewardDesc: '+130M Metal, +100M Cristal, +60M Deuterio' },
  { id: 'm23_2_instant_jump', name: 'Salto Instantáneo', icon: '🚀', chap: 23, desc: 'Teletransporta una flota a través del Portal Cuántico.', req: 'm23_1_portal_online', check: (s, p) => (s.quantumJumpsExecuted || 0) >= 1, reward: { metal: 140000000, crystal: 110000000, deuterium: 70000000 }, rewardDesc: '+140M Metal, +110M Cristal, +70M Deuterio' },

  // --- CAPÍTULO 24: Terraingeniería a Escala Planetaria ---
  { id: 'm24_1_massive_terra', name: 'Génesis Ecológico', icon: '🌱', chap: 24, desc: 'Terraforma al menos 3 mundos hostiles en planetas prósperos.', req: 'm23_2_instant_jump', check: (s, p) => (s.planets || []).filter(pl => pl.terraformed).length >= 3, reward: { metal: 150000000, crystal: 120000000, deuterium: 80000000 }, rewardDesc: '+150M Metal, +120M Cristal, +80M Deuterio' },
  { id: 'm24_2_five_hundred_fields', name: 'Campos de Expansión', icon: '🏗️', chap: 24, desc: 'Alcanza más de 400 campos disponibles en un planeta terraformado.', req: 'm24_1_massive_terra', check: (s, p) => (s.planets || []).some(pl => (pl.planetSize || 100) >= 300), reward: { metal: 160000000, crystal: 130000000, deuterium: 85000000 }, rewardDesc: '+160M Metal, +130M Cristal, +85M Deuterio' },
];
