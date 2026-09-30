import {
  RESEARCH, researchCost, clampResources, deduct, canAfford, meetsResearchReq, uid
} from '../../../core.jsx';
import { calcPlanetResearchTime } from '../../../utils/formulas/researchTiming.js';
import { stampTimeMult } from '../queues/queueTiming.js';
import { rankResearch, buildResearchScoreConfig } from '../ai/researchScoring.js';

export const processAutoResearchTick = (state) => {
  let newState = { ...state };
  if ((newState.researchQueue || []).length >= 8) return newState;

  for (const cp of newState.planets) {
    if ((newState.researchQueue || []).length >= 8) break;
    const cpScience = cp.ministries?.science || newState.ministries?.science;
    if (!cpScience?.automationEnabled) continue;

    const isAlreadyResearchingType = (rId) => (newState.researchQueue || []).some(q => q.researchId === rId);

    // Detectar techs priorizadas por misiones activas
    const activeMissionIds = newState.activeMissions || [];
    const prioritizedTechs = new Set();
    if (newState.missions) {
      newState.missions.forEach(m => {
        if (activeMissionIds.includes(m.id) || !m.req || (newState.completedMissions || []).includes(m.req)) {
          if (m.targetTech) prioritizedTechs.add(m.targetTech);
        }
      });
    }

    // Construir lista de candidatos: todas las investigaciones no en cola y no excluidas
    const allCandidates = Object.keys(RESEARCH).filter(id => {
      if (isAlreadyResearchingType(id)) return false;
      if (cp.automatedExclusions?.[id]) return false;
      return true;
    });

    // Usar scoring real (incluye misiones, costes, prerrequisitos, unlocks, etc.)
    const scoreConfig = buildResearchScoreConfig(newState, cp, {
      prioritizedTechs,
      exclude: cp.automatedExclusions,
    });
    const ranked = rankResearch(scoreConfig, allCandidates);

    const cheapestResearch = ranked.length > 0 ? ranked[0].id : null;
    
    if (cheapestResearch) {
      const currentLvl = newState.research[cheapestResearch] || 0;
      const targetLvl = currentLvl + 1;
      const cost = researchCost(cheapestResearch, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
      const newRes = clampResources(deduct(cp.resources, cost));
      newState.planets = newState.planets.map(p => p.id === cp.id ? { ...p, resources: newRes } : p);
      
      // Fuente única de verdad: incluye techs de investigación, researchGrants,
      // ministro de ciencia, synchronousOptical, facción y especialización.
      const researchTimeVal = calcPlanetResearchTime(newState, cp, cost);

      const startTime = Date.now();
      const endTime = startTime + researchTimeVal * 1000;

      newState.researchQueue = [...(newState.researchQueue || []), stampTimeMult(newState, 'research', {
        id: uid(),
        planetId: cp.id,
        researchId: cheapestResearch,
        startTime,
        endTime,
        level: targetLvl,
        auto: true
      })];
    }
  }
  return newState;
};
