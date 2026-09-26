import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  AI_STRATEGIES, meetsReq, canAfford, deduct, buildingCost, researchCost,
  shipCost, defenseCost, calcResourceValueForAI, calcProduction, calcStorage,
  uid, updatePlanet, getVirginPlanet, getPOIAtCoordinates, calcDistance,
  calcFlightTime, calcFuel, fleetSpeed
} from '../../core.jsx';

export const processAISimulation = (newState) => {
  const state = newState;
  // AI regeneration
  if (state.gameTick % 120 === 0 && newState.aiPlanets.length > 0) {
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

  // AI-AI interaction
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

      if (interactionRoll < warChance && !a.alliance && !b.alliance && aRelation < 0 && bRelation < 0) {
        // War declared AI-AI
        updatedAIs[aIdx] = { ...a, relation: Math.max(-100, aRelation - 30) };
        updatedAIs[bIdx] = { ...b, relation: Math.max(-100, bRelation - 30) };
      } else if (interactionRoll < warChance + allyChance && aRelation > 40 && bRelation > 40) {
        // Friendship / Alliance improvement
        updatedAIs[aIdx] = { ...a, relation: Math.min(100, aRelation + 20) };
        updatedAIs[bIdx] = { ...b, relation: Math.min(100, bRelation + 20) };
      } else {
        // Subtle drift
        const delta = Math.random() > 0.5 ? 2 : -2;
        updatedAIs[aIdx] = { ...a, relation: Math.max(-100, Math.min(100, aRelation + delta)) };
      }
    }
    newState.aiPlanets = updatedAIs;
  }

  // AI colonisation & ship building simulation
  newState.aiPlanets = (newState.aiPlanets || []).map(ai => {
    let p = ai;
    const strat = AI_STRATEGIES[ai.strategy] || { weight: { eco: 0.3, mil: 0.3, tech: 0.3 } };
    const level = ai.aiLevel || 1;
    const rate = 1 + level * 0.25;

    // Simulated resources
    let res = {
      metal: (p.resources?.metal || 0) + (rate * 30 * (strat.weight.eco || 0.3)),
      crystal: (p.resources?.crystal || 0) + (rate * 15 * (strat.weight.eco || 0.3)),
      deuterium: (p.resources?.deuterium || 0) + (rate * 8 * (strat.weight.eco || 0.3)),
    };

    // Cap at simulated storage
    const maxRes = level * 100000;
    res.metal = Math.min(res.metal, maxRes);
    res.crystal = Math.min(res.crystal, maxRes);
    res.deuterium = Math.min(res.deuterium, maxRes);

    // AI logic to colonize if it has colonizers
    if (p.fleet?.colonizer > 0 && Math.random() < 0.08) {
      const virgin = getVirginPlanet(newState);
      if (virgin) {
        const dist = calcDistance(p, virgin);
        const arrivalTime = Date.now() + calcFlightTime(dist, 4000, 5) * 1000;
        newState.fleetMissions = [...(newState.fleetMissions || []), {
          id: uid(), type: 'colonize', from: p, to: virgin, fleet: { colonizer: 1 }, resources: { metal: 0, crystal: 0, deuterium: 0 },
          departure: Date.now(), arrivalTime, isAI: true,
        }];
        const nextFleet = { ...p.fleet };
        nextFleet.colonizer = Math.max(0, nextFleet.colonizer - 1);
        if (nextFleet.colonizer === 0) delete nextFleet.colonizer;
        p = { ...p, fleet: nextFleet };
      }
    }

    // AI builds buildings
    const bChoices = ['metalMine', 'crystalMine', 'deutSynth', 'solarPlant', 'robotFactory', 'shipyard', 'researchLab'];
    const chosenB = bChoices[Math.floor(Math.random() * bChoices.length)];
    const curBLevel = p.buildings?.[chosenB] || 0;
    if (curBLevel < level * 5) {
      const cost = buildingCost(chosenB, curBLevel, p.buildings?.constructionCenter || 0);
      if (meetsReq(BUILDINGS[chosenB]?.req, { ...(p.buildings || {}), ...(p.research || {}) }) && canAfford(res, cost)) {
        res = deduct(res, cost);
        p = {
          ...p,
          buildings: { ...(p.buildings || {}), [chosenB]: curBLevel + 1 },
        };
      }
    }

    // AI researches
    const tChoices = ['weapons', 'shields', 'armour', 'combustion', 'impulse', 'hyperspace', 'plasma'];
    const chosenT = tChoices[Math.floor(Math.random() * tChoices.length)];
    const curTLevel = p.research?.[chosenT] || 0;
    if (curTLevel < level * 4) {
      const cost = researchCost(chosenT, curTLevel, p.research?.aiStrategy || 0, p.buildings?.constructionCenter || 0);
      if (meetsReq(RESEARCH[chosenT]?.req, p.research || {}) && canAfford(res, cost)) {
        res = deduct(res, cost);
        p = {
          ...p,
          research: { ...(p.research || {}), [chosenT]: curTLevel + 1 },
        };
      }
    }

    // AI builds ships
    const sChoices = ['lightFighter', 'heavyFighter', 'cruiser', 'battleship', 'recycler', 'espionageProbe'];
    const chosenS = sChoices[Math.floor(Math.random() * sChoices.length)];
    const cost = shipCost(chosenS, 1, p.buildings?.constructionCenter || 0);
    if (meetsReq(SHIPS[chosenS]?.req, { ...(p.buildings || {}), ...(p.research || {}) }) && canAfford(res, cost)) {
      res = deduct(res, cost);
      p = {
        ...p,
        fleet: { ...(p.fleet || {}), [chosenS]: (p.fleet?.[chosenS] || 0) + 1 },
      };
    }

    return { ...p, resources: res };
  });

  // Smarter AI: research priority based on strategy
  newState.aiPlanets = (newState.aiPlanets || []).map(ai => {
    const newAi = { ...ai, research: { ...(ai.research || {}) }, fleet: { ...(ai.fleet || {}) } };
    const strat = AI_STRATEGIES[ai.strategy] || {};
    const aiLvl = ai.aiLevel || 1;
    if (strat.weight?.mil > 0.4 && Math.random() < 0.02 * aiLvl) {
      newAi.research.weapons = (newAi.research.weapons || 0) + 1;
    } else if (strat.weight?.eco > 0.4 && Math.random() < 0.02 * aiLvl) {
      newAi.research.plasma = (newAi.research.plasma || 0) + 1;
    } else if (strat.weight?.tech > 0.4 && Math.random() < 0.02 * aiLvl) {
      newAi.research.computer = (newAi.research.computer || 0) + 1;
    }
    if (strat.name === 'Expansionista' && Math.random() < 0.005 * aiLvl && newState.planets.length < 25) {
      newAi.fleet.colonizer = (newAi.fleet.colonizer || 0) + 1;
    }
    return newAi;
  });

  // AI Utility-Based Decisions (game-development pattern: Utility AI / Scoring)
  if (Math.random() < 0.012 && state.aiPlanets.length > 0) {
    const aiSource = state.aiPlanets[Math.floor(Math.random() * state.aiPlanets.length)];
    const target = newState.planets[Math.floor(Math.random() * newState.planets.length)];
    if (aiSource && target) {
      const rel = aiSource.relation || 0;
      const dist = calcDistance(aiSource, target);
      const aiFleetPower = Object.values(aiSource.fleet || {}).reduce((sum, qty) => sum + qty, 0);
      const targetFleetPower = Object.values(target.fleet || {}).reduce((sum, qty) => sum + qty, 0);
      const targetDefPower = Object.values(target.defenses || {}).reduce((sum, qty) => sum + qty, 0);
      const targetWealth = ((target.resources?.metal || 0) + (target.resources?.crystal || 0) * 1.5 + (target.resources?.deuterium || 0) * 2);

      // 1. Scoring de Alianza y Comercio (Utility Aid)
      const aidUtility = (rel >= 40 ? 0.4 : 0) + (rel >= 75 ? 0.3 : 0) + (dist < 3000 ? 0.2 : 0);

      // 2. Scoring de Ataque (Utility Raid)
      const militaryAdvantage = aiFleetPower / Math.max(1, targetFleetPower + targetDefPower * 0.7);
      const distancePenalty = Math.min(0.5, dist / 8000);
      const greedFactor = Math.min(0.4, targetWealth / 500000);
      const hostilityBonus = rel < 0 ? Math.min(0.5, Math.abs(rel) / 100) : -0.3;

      const raidUtility = (militaryAdvantage > 1.2 ? 0.4 : 0) + greedFactor + hostilityBonus - distancePenalty;

      if (aidUtility > 0.5 && Math.random() < 0.4) {
        const gift = {
          metal: Math.floor((aiSource.aiLevel || 1) * 8000),
          crystal: Math.floor((aiSource.aiLevel || 1) * 4000),
          deuterium: Math.floor((aiSource.aiLevel || 1) * 2000),
        };
        const arrivalTime = Date.now() + calcFlightTime(dist, 8000, 10) * 1000;
        newState.fleetMissions = [...(newState.fleetMissions || []), {
          id: uid(), type: 'ally_trade', from: aiSource, to: target, fleet: { largeCargo: 2 }, resources: gift,
          departure: Date.now(), arrivalTime, isAI: true,
        }];
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `🤝 El Imperio aliado ${aiSource.empireName || aiSource.name} ha despachado una flota comercial con suministros estratégicos hacia ${target.name}`, timestamp: Date.now(),
        }];
      } else if (raidUtility > 0.35 && aiFleetPower > 10) {
        const fleetToSend = {};
        for (const [id, qty] of Object.entries(aiSource.fleet || {})) {
          if (qty > 0) fleetToSend[id] = Math.max(1, Math.floor(qty * 0.45));
        }
        if (Object.values(fleetToSend).some(v => v > 0)) {
          const spd = fleetSpeed(fleetToSend, aiSource.research || {}, aiSource.faction || 'human');
          if (spd > 0) {
            const arrivalTime = Date.now() + calcFlightTime(dist, spd, 5) * 1000;
            newState.fleetMissions = [...(newState.fleetMissions || []), {
              id: uid(), type: 'attack', from: aiSource, to: target, fleet: fleetToSend,
              departure: Date.now(), arrivalTime, isAI: true,
            }];
            newState.aiPlanets = newState.aiPlanets.map(p => p.id === aiSource.id ? { ...p, relation: Math.max(-100, (p.relation || 0) - 15) } : p);
            newState.notifications = [...(newState.notifications || []), {
              id: uid(), type: 'warning', message: `⚔️ Flota hostil detectada despegando desde ${aiSource.empireName || aiSource.name} [${aiSource.galaxy}:${aiSource.system}:${aiSource.position}] hacia ${target.name}`, timestamp: Date.now(),
            }];
            newState.aiPlanets = newState.aiPlanets.map(p => {
              if (p.id === aiSource.id) {
                const newFleet = { ...p.fleet };
                for (const [id, qty] of Object.entries(fleetToSend)) {
                  newFleet[id] = Math.max(0, (newFleet[id] || 0) - qty);
                  if (newFleet[id] <= 0) delete newFleet[id];
                }
                return { ...p, fleet: newFleet };
              }
              return p;
            });
          }
        }
      }
    }
  }

  return newState;
};
