import {
  RESEARCH, researchCost, clampResources, deduct, canAfford, meetsReq,
  researchTimeBonus, calcResearchTime, uid, GAME_SPEED
} from '../../../core.jsx';

export const processAutoResearchTick = (state) => {
  let newState = { ...state };
  if ((newState.researchQueue || []).length >= 8) return newState;

  for (const cp of newState.planets) {
    if ((newState.researchQueue || []).length >= 8) break;
    const cpScience = cp.ministries?.science || newState.ministries?.science;
    if (!cpScience?.automationEnabled) continue;

    const isAlreadyResearchingType = (rId) => (newState.researchQueue || []).some(q => q.researchId === rId);
    let bestResearch = null;
    let lowestPriorityScore = Infinity;

    // Detectar si alguna misión activa pide una investigación específica
    const activeMissionIds = newState.activeMissions || [];
    const prioritizedTechs = new Set();
    if (newState.missions) {
      newState.missions.forEach(m => {
        if (activeMissionIds.includes(m.id) || !m.req || (newState.completedMissions || []).includes(m.req)) {
          if (m.targetTech) prioritizedTechs.add(m.targetTech);
        }
      });
    }

    for (const [id, r] of Object.entries(RESEARCH)) {
      if (isAlreadyResearchingType(id)) continue;
      if (cp.automatedExclusions?.[id]) continue;
      
      const currentLvl = newState.research[id] || 0;
      const cost = researchCost(id, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
      const costSum = (cost.metal || 0) + (cost.crystal || 0) * 1.5 + (cost.deuterium || 0) * 3;
      
      // Si la investigación es prioritaria por misión activa, reducimos drásticamente su score para que gane
      const priorityMultiplier = prioritizedTechs.has(id) ? 0.01 : 1.0;
      const finalScore = costSum * priorityMultiplier;

      if (finalScore < lowestPriorityScore && canAfford(cp.resources, cost) && meetsReq(r.req, { ...cp.buildings, ...newState.research })) {
        bestResearch = id;
        lowestPriorityScore = finalScore;
      }
    }
    
    const cheapestResearch = bestResearch;
    
    if (cheapestResearch) {
      const currentLvl = newState.research[cheapestResearch] || 0;
      const targetLvl = currentLvl + 1;
      const cost = researchCost(cheapestResearch, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
      const newRes = clampResources(deduct(cp.resources, cost));
      newState.planets = newState.planets.map(p => p.id === cp.id ? { ...p, resources: newRes } : p);
      
      const speedBonus = researchTimeBonus(cp.buildings, newState.research);
      const totalSpeedMultiplier = (1 + speedBonus) * (1 + (cpScience?.researchGrants || 0.05));
      const researchTimeVal = calcResearchTime(cost, cp.buildings?.researchLab || 0, GAME_SPEED, totalSpeedMultiplier, newState.research);
      
      const startTime = Date.now();
      const endTime = startTime + researchTimeVal * 1000;
      
      newState.researchQueue = [...(newState.researchQueue || []), {
        id: uid(),
        planetId: cp.id,
        researchId: cheapestResearch,
        startTime,
        endTime,
        level: targetLvl,
        auto: true
      }];
    }
  }
  return newState;
};
