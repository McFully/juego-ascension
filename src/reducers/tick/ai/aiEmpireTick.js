import {
  SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES,
  AI_STRATEGIES, uid, calcDistance, calcFlightTime, fleetSpeed,
  RESEARCH, canAfford, deduct, clampResources, GAME_SPEED
} from '../../../core.jsx';
import { rankResearch, AI_STRATEGY_CATEGORY_WEIGHTS } from './researchScoring.js';

export const processAIEmpireTick = (state) => {
  let newState = { ...state };
  const now = Date.now();

  // AI regeneration (slowly rebuild fleets and defenses)
  if (state.gameTick % 120 === 0 && newState.aiPlanets.length > 0) {
    const aiBPs = (newState.blueprints || []).filter(bp => bp.isAI);
    if (aiBPs.length < 5) {
      const chassisKeys = Object.keys(SHIP_CHASSIS);
      const weapons = Object.keys(SHIP_WEAPONS);
      const engines = Object.keys(SHIP_ENGINES);
      const shields = Object.keys(SHIP_SHIELDS);
      const modules = Object.keys(SHIP_MODULES);
      
      const chassis = chassisKeys[Math.floor(Math.random() * chassisKeys.length)];
      const bpId = 'ai_' + Math.random().toString(36).substring(2, 9);
      const newBP = {
        id: bpId,
        name: `Nave Prototipo ${chassis.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
        chassis,
        weapon: weapons[Math.floor(Math.random() * weapons.length)],
        engine: engines[Math.floor(Math.random() * engines.length)],
        shield: shields[Math.floor(Math.random() * shields.length)],
        modules: [modules[Math.floor(Math.random() * modules.length)]],
        isAI: true
      };
      newState.blueprints = [...(newState.blueprints || []), newBP];
    }

    newState.aiPlanets = newState.aiPlanets.map(p => {
      const regenRate = Math.max(0.5, (p.aiLevel || 1) * 0.1);
      const newFleet = { ...(p.fleet || {}) };
      for (const id of ['lightFighter', 'heavyFighter', 'cruiser', 'battleship']) {
        const current = newFleet[id] || 0;
        const target = Math.floor((p.aiLevel || 1) * 5);
        if (current < target) {
          newFleet[id] = Math.min(target, current + Math.ceil(regenRate * (1 + Math.random())));
        }
      }

      if ((p.aiLevel || 1) >= 5) {
        const currentAIBlueprints = (newState.blueprints || []).filter(bp => bp.isAI);
        if (currentAIBlueprints.length > 0) {
          const selectedBP = currentAIBlueprints[Math.floor(Math.random() * currentAIBlueprints.length)];
          const customId = 'custom_' + selectedBP.id;
          const currentCustomCount = newFleet[customId] || 0;
          const customTarget = Math.floor((p.aiLevel || 1) * 2);
          if (currentCustomCount < customTarget) {
            newFleet[customId] = Math.min(customTarget, currentCustomCount + Math.ceil(regenRate));
          }
        }
      }

      const newDefenses = { ...(p.defenses || {}) };
      const defTarget = Math.floor((p.aiLevel || 1) * 10);
      const curDef = Object.values(newDefenses).reduce((a, b) => a + b, 0);
      if (curDef < defTarget) {
        newDefenses.rocketLauncher = (newDefenses.rocketLauncher || 0) + Math.ceil(regenRate * 2);
        newDefenses.lightLaser = (newDefenses.lightLaser || 0) + Math.ceil(regenRate);
      }
      return { ...p, fleet: newFleet, defenses: newDefenses };
    });
  }

  // Emergent AI-AI interaction system
  if (state.gameTick > 0 && state.gameTick % 180 === 0 && state.aiPlanets.length > 1) {
    const aiList = [...state.aiPlanets];
    const updatedAIs = [...aiList];
    const numInteractions = Math.min(50, Math.floor(aiList.length * 0.01));

    for (let i = 0; i < numInteractions; i++) {
      const aIdx = Math.floor(Math.random() * aiList.length);
      let bIdx;
      do { bIdx = Math.floor(Math.random() * aiList.length); } while (bIdx === aIdx);
      const a = updatedAIs[aIdx];
      const b = updatedAIs[bIdx];
      if (!a || !b) continue;

      const dist = calcDistance(a, b);
      const effectiveDist = Math.max(1, dist / 1000);
      const interactionChance = Math.min(0.3, 1 / effectiveDist);

      if (Math.random() > interactionChance) continue;

      const aRelation = a.relation || 0;
      const bRelation = b.relation || 0;
      const aAggression = a.aggression || 0.5;
      const bAggression = b.aggression || 0.5;
      const avgAggression = (aAggression + bAggression) / 2;
      const relationFactor = (aRelation + bRelation) / 200;

      let interactionRoll = Math.random();
      const warChance = Math.max(0, avgAggression * (1 - relationFactor) * 0.15);
      const allyChance = Math.max(0, (1 - avgAggression) * (1 + relationFactor) * 0.1);
      const tradeChance = 0.15;
      const raidChance = Math.max(0, (aAggression - 0.4) * (1 - relationFactor) * 0.1);

      if (interactionRoll < warChance) {
        if (a.aiLevel > b.aiLevel * 0.6) {
          const updatedA = { ...updatedAIs[aIdx], warsDeclared: (updatedAIs[aIdx].warsDeclared || 0) + 1, relation: Math.max(-100, (updatedAIs[aIdx].relation || 0) - 30) };
          const updatedB = { ...updatedAIs[bIdx], warsReceived: (updatedAIs[bIdx].warsReceived || 0) + 1, relation: Math.max(-100, (updatedAIs[bIdx].relation || 0) - 30) };
          updatedAIs[aIdx] = updatedA;
          updatedAIs[bIdx] = updatedB;

          const atkPower = updatedA.aiLevel * (1 + (updatedA.militaryLvl || 1) * 0.1);
          const defPower = updatedB.aiLevel * (1 + (updatedB.militaryLvl || 1) * 0.1);
          const totalPower = atkPower + defPower;
          const atkWinChance = atkPower / totalPower;

          if (Math.random() < atkWinChance) {
            updatedAIs[aIdx] = { ...updatedA, aiLevel: updatedA.aiLevel + 1, planetsConquered: (updatedA.planetsConquered || 0) + 1, totalWins: (updatedA.totalWins || 0) + 1 };
            updatedAIs[bIdx] = { ...updatedB, aiLevel: Math.max(1, updatedB.aiLevel - 2), resources: { metal: Math.floor((updatedB.resources?.metal || 0) * 0.5), crystal: Math.floor((updatedB.resources?.crystal || 0) * 0.5), deuterium: Math.floor((updatedB.resources?.deuterium || 0) * 0.5) }, planetsLost: (updatedB.planetsLost || 0) + 1, totalLosses: (updatedB.totalLosses || 0) + 1 };
            const ge = { id: uid(), tick: state.gameTick, type: 'war', title: '⚔️ Guerra Interestelar', desc: `${a.empireName} ha derrotado a ${b.empireName} en batalla.`, timestamp: now };
            newState.galacticEvents = [...(newState.galacticEvents || []), ge].slice(-200);
          } else {
            updatedAIs[aIdx] = { ...updatedA, totalLosses: (updatedA.totalLosses || 0) + 1 };
            updatedAIs[bIdx] = { ...updatedB, totalWins: (updatedB.totalWins || 0) + 1 };
            const ge = { id: uid(), tick: state.gameTick, type: 'war', title: '🛡️ Defensa Exitosa', desc: `${b.empireName} ha repelido el ataque de ${a.empireName}.`, timestamp: now };
            newState.galacticEvents = [...(newState.galacticEvents || []), ge].slice(-200);
          }
        }
      } else if (interactionRoll < warChance + allyChance) {
        const relationBoost = 15 + Math.floor(Math.random() * 20);
        updatedAIs[aIdx] = { ...updatedAIs[aIdx], relation: Math.min(100, (updatedAIs[aIdx].relation || 0) + relationBoost) };
        updatedAIs[bIdx] = { ...updatedAIs[bIdx], relation: Math.min(100, (updatedAIs[bIdx].relation || 0) + relationBoost) };
      } else if (interactionRoll < warChance + allyChance + tradeChance) {
        if (!updatedAIs[aIdx].tradeRoutes) updatedAIs[aIdx].tradeRoutes = [];
        if (!updatedAIs[bIdx].tradeRoutes) updatedAIs[bIdx].tradeRoutes = [];
        if (updatedAIs[aIdx].tradeRoutes.length < 5) {
          updatedAIs[aIdx].tradeRoutes.push({ partnerId: b.id, established: now, volume: Math.floor(500 + Math.random() * 2000) });
        }
        if (updatedAIs[bIdx].tradeRoutes.length < 5) {
          updatedAIs[bIdx].tradeRoutes.push({ partnerId: a.id, established: now, volume: Math.floor(500 + Math.random() * 2000) });
        }
      } else if (interactionRoll < warChance + allyChance + tradeChance + raidChance) {
        if (a.aiLevel > b.aiLevel * 0.7) {
          const loot = { metal: Math.floor(200 + Math.random() * 800) * a.aiLevel, crystal: Math.floor(100 + Math.random() * 400) * a.aiLevel };
          updatedAIs[aIdx] = { ...updatedAIs[aIdx], resources: { metal: (updatedAIs[aIdx].resources?.metal || 0) + loot.metal, crystal: (updatedAIs[aIdx].resources?.crystal || 0) + loot.crystal, deuterium: (updatedAIs[aIdx].resources?.deuterium || 0) } };
          updatedAIs[bIdx] = { ...updatedAIs[bIdx], resources: { metal: Math.max(0, (updatedAIs[bIdx].resources?.metal || 0) - loot.metal), crystal: Math.max(0, (updatedAIs[bIdx].resources?.crystal || 0) - loot.crystal), deuterium: (updatedAIs[bIdx].resources?.deuterium || 0) } };
          updatedAIs[aIdx] = { ...updatedAIs[aIdx], relation: Math.max(-100, (updatedAIs[aIdx].relation || 0) - 10) };
          updatedAIs[bIdx] = { ...updatedAIs[bIdx], relation: Math.max(-100, (updatedAIs[bIdx].relation || 0) - 15) };
        }
      }
    }
    newState.aiPlanets = updatedAIs;
  }

  // AI research and expansion priority
  // 1.4: la decisión la toma researchScoring, igual que el jugador y los ministros.
  // El azar solo marca el ritmo (cada cuántos ticks investigar), nunca la qué.
  newState.aiPlanets = (newState.aiPlanets || []).map(ai => {
    const newAi = { ...ai, research: { ...(ai.research || {}) }, fleet: { ...(ai.fleet || {}) } };
    const strat = AI_STRATEGIES[ai.strategy] || {};
    const aiLvl = ai.aiLevel || 1;
    const labLevel = ai.buildings?.researchLab || 0;

    // Sin laboratorio no se investiga, igual que el jugador.
    if (labLevel >= 1 && Math.random() < 0.02 * aiLvl) {
      const catWeights = AI_STRATEGY_CATEGORY_WEIGHTS(strat.weight);
      // El estado de investigación de la IA es el suyo propio, no el del jugador.
      const config = {
        state: null,
        research: newAi.research,
        buildings: ai.buildings || {},
        planetResources: ai.resources || {},
        labLevel,
        constructionCenterLvl: ai.buildings?.constructionCenter || 0,
        categoryWeights: catWeights,
        // Una estrategia beligerante (warTendency alto) prioriza lo defensivo.
        threat: strat.warTendency || 0,
        GAME_SPEED,
        ministries: {},
      };
      const candidates = Object.keys(RESEARCH).filter(id => newAi.research[id] === undefined || newAi.research[id] < 20);
      const ranked = rankResearch(config, candidates);

      // La primera viable y pagable es la que elige la IA.
      for (const { id, cost } of ranked) {
        if (!canAfford(ai.resources, cost)) continue;
        newAi.research[id] = (newAi.research[id] || 0) + 1;
        newAi.resources = clampResources(deduct(ai.resources, cost));
        break;
      }
    }

    if (strat.name === 'Expansionista' && Math.random() < 0.005 * aiLvl && newState.planets.length < 25) {
      newAi.fleet.colonizer = (newAi.fleet.colonizer || 0) + 1;
    }
    return newAi;
  });

  return newState;
};
