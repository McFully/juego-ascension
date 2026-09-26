import {
  uid, canAfford, deduct, clampResources, fmt, calcDistance, fleetSpeed, calcFlightTime, updatePlanet
} from '../../core.jsx';

export const handleDiplomacyTrade = (state, action) => {
  const { planetId, giveRes, takeRes } = action;
  if (!giveRes || !takeRes ||
      (giveRes.metal || 0) < 0 || (giveRes.crystal || 0) < 0 || (giveRes.deuterium || 0) < 0 ||
      (takeRes.metal || 0) < 0 || (takeRes.crystal || 0) < 0 || (takeRes.deuterium || 0) < 0) {
    return state;
  }
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;
  if (!canAfford(planet.resources, giveRes)) return state;
  const targetAI = state.aiPlanets.find(p => p.id === planetId);
  if (!targetAI) return state;

  // Economic valuation logic
  const metalVal = 1.0;
  const crystalVal = 2.0;
  const deutVal = 4.0;
  
  // AI multipliers based on strategy and personality
  let metalMult = 1.0;
  let crystalMult = 1.0;
  let deutMult = 1.0;
  if (targetAI.aiPersonality === 'bélico' || targetAI.strategy === 'militarist') {
    metalMult = 1.25;
    deutMult = 1.35;
  } else if (targetAI.aiPersonality === 'pacífico' || targetAI.strategy === 'technocrat') {
    crystalMult = 1.3;
    deutMult = 1.5;
  }

  const valGive = (giveRes.metal || 0) * metalVal * metalMult + 
                  (giveRes.crystal || 0) * crystalVal * crystalMult + 
                  (giveRes.deuterium || 0) * deutVal * deutMult;
                  
  const valTake = (takeRes.metal || 0) * metalVal * metalMult + 
                  (takeRes.crystal || 0) * crystalVal * crystalMult + 
                  (takeRes.deuterium || 0) * deutVal * deutMult;

  const ratio = valGive / Math.max(1, valTake);

  // Determine required ratio
  let reqRatio = 1.0; 
  if (targetAI.aiPersonality === 'mercantilista') {
    reqRatio = 0.85; 
  } else if (targetAI.aiPersonality === 'bélico' || targetAI.strategy === 'militarist') {
    reqRatio = 1.25; 
  }

  if (ratio < reqRatio) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(), type: 'warning', message: `🤝 ${targetAI.name} rechaza el trato por ser comercialmente desfavorable (Ratio: ${ratio.toFixed(2)} / Requerido: ${reqRatio})`, timestamp: Date.now()
      }]
    };
  }

  // Check physical reserves of target AI
  if ((targetAI.resources?.metal || 0) < (takeRes.metal || 0) ||
      (targetAI.resources?.crystal || 0) < (takeRes.crystal || 0) ||
      (targetAI.resources?.deuterium || 0) < (takeRes.deuterium || 0)) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(), type: 'warning', message: `🤝 ${targetAI.name} no dispone de suficientes reservas físicas para entregarte los recursos solicitados.`, timestamp: Date.now()
      }]
    };
  }

  // Check Cargo Capacities
  const playerSmallCargos = planet.fleet?.smallCargo || 0;
  const playerLargeCargos = planet.fleet?.largeCargo || 0;
  const aiSmallCargos = targetAI.fleet?.smallCargo || 0;
  const aiLargeCargos = targetAI.fleet?.largeCargo || 0;

  const playerTotal = (giveRes.metal || 0) + (giveRes.crystal || 0) + (giveRes.deuterium || 0);
  const aiTotal = (takeRes.metal || 0) + (takeRes.crystal || 0) + (takeRes.deuterium || 0);

  const playerCapMult = planet.specialization === 'commercial' ? 1.5 : 1.0;
  const playerCapacity = (playerSmallCargos * 5000 + playerLargeCargos * 25000) * playerCapMult;
  
  const aiCapMult = targetAI.specialization === 'commercial' ? 1.5 : 1.0;
  const aiCapacity = (aiSmallCargos * 5000 + aiLargeCargos * 25000) * aiCapMult;

  if (playerTotal > playerCapacity) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(), type: 'error', message: `❌ No tienes suficiente capacidad de carga en ${planet.name} (${fmt(playerCapacity)} unidades disponibles) para transportar la oferta.`, timestamp: Date.now()
      }]
    };
  }
  if (aiTotal > aiCapacity) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(), type: 'error', message: `❌ El imperio de ${targetAI.name} no dispone de suficiente capacidad de carga (${fmt(aiCapacity)} unidades disponibles) para transportar su parte.`, timestamp: Date.now()
      }]
    };
  }

  // Calculate cargos to use
  const calculateCargosNeeded = (total, smallHave, largeHave, capMult) => {
    const smallCap = 5000 * capMult;
    const largeCap = 25000 * capMult;
    let remaining = total;
    let largeUsed = Math.min(largeHave, Math.ceil(remaining / largeCap));
    remaining -= largeUsed * largeCap;
    let smallUsed = 0;
    if (remaining > 0) {
      smallUsed = Math.min(smallHave, Math.ceil(remaining / smallCap));
    }
    return { smallUsed, largeUsed };
  };

  const playerCargos = calculateCargosNeeded(playerTotal, playerSmallCargos, playerLargeCargos, playerCapMult);
  const aiCargos = calculateCargosNeeded(aiTotal, aiSmallCargos, aiLargeCargos, aiCapMult);

  // Deduct from Player Planet
  const newPlayerFleet = { ...planet.fleet };
  if (playerCargos.smallUsed > 0) {
    newPlayerFleet.smallCargo = (newPlayerFleet.smallCargo || 0) - playerCargos.smallUsed;
    if (newPlayerFleet.smallCargo <= 0) delete newPlayerFleet.smallCargo;
  }
  if (playerCargos.largeUsed > 0) {
    newPlayerFleet.largeCargo = (newPlayerFleet.largeCargo || 0) - playerCargos.largeUsed;
    if (newPlayerFleet.largeCargo <= 0) delete newPlayerFleet.largeCargo;
  }
  const newPlayerRes = clampResources(deduct(planet.resources, giveRes));

  // Deduct from AI Planet
  const newAIFleet = { ...(targetAI.fleet || {}) };
  if (aiCargos.smallUsed > 0) {
    newAIFleet.smallCargo = (newAIFleet.smallCargo || 0) - aiCargos.smallUsed;
    if (newAIFleet.smallCargo <= 0) delete newAIFleet.smallCargo;
  }
  if (aiCargos.largeUsed > 0) {
    newAIFleet.largeCargo = (newAIFleet.largeCargo || 0) - aiCargos.largeUsed;
    if (newAIFleet.largeCargo <= 0) delete newAIFleet.largeCargo;
  }
  const newAIRes = {
    metal: Math.max(0, (targetAI.resources?.metal || 0) - (takeRes.metal || 0)),
    crystal: Math.max(0, (targetAI.resources?.crystal || 0) - (takeRes.crystal || 0)),
    deuterium: Math.max(0, (targetAI.resources?.deuterium || 0) - (takeRes.deuterium || 0)),
  };

  // Calculate distances and flight times
  const dist = calcDistance(planet, targetAI);
  
  const playerDispatched = {};
  if (playerCargos.smallUsed > 0) playerDispatched.smallCargo = playerCargos.smallUsed;
  if (playerCargos.largeUsed > 0) playerDispatched.largeCargo = playerCargos.largeUsed;

  const aiDispatched = {};
  if (aiCargos.smallUsed > 0) aiDispatched.smallCargo = aiCargos.smallUsed;
  if (aiCargos.largeUsed > 0) aiDispatched.largeCargo = aiCargos.largeUsed;

  const playerSpd = fleetSpeed(playerDispatched, state.research, planet.faction || 'human', state.relics || []);
  const aiSpd = fleetSpeed(aiDispatched, targetAI.research || {}, targetAI.faction || 'human');

  const playerFlightTime = calcFlightTime(dist, playerSpd, 10);
  const aiFlightTime = calcFlightTime(dist, aiSpd, 10);

  // Dispatch missions
  const tradeSendMission = {
    id: uid(),
    type: 'trade_send',
    from: { id: planet.id, name: planet.name, galaxy: planet.galaxy, system: planet.system, position: planet.position },
    to: { id: targetAI.id, name: targetAI.name, galaxy: targetAI.galaxy, system: targetAI.system, position: targetAI.position },
    fleet: playerDispatched,
    resources: giveRes,
    fuel: 0,
    departure: Date.now(),
    arrivalTime: Date.now() + playerFlightTime * 1000,
    returnTime: Date.now() + playerFlightTime * 2000,
    isAI: false,
  };

  const tradeReceiveMission = {
    id: uid(),
    type: 'trade_receive',
    from: { id: targetAI.id, name: targetAI.name, galaxy: targetAI.galaxy, system: targetAI.system, position: targetAI.position },
    to: { id: planet.id, name: planet.name, galaxy: planet.galaxy, system: planet.system, position: planet.position },
    fleet: aiDispatched,
    resources: takeRes,
    fuel: 0,
    departure: Date.now(),
    arrivalTime: Date.now() + aiFlightTime * 1000,
    returnTime: Date.now() + aiFlightTime * 2000,
    isAI: true,
  };

  // Relations change
  let relationChange = 1;
  if (targetAI.aiPersonality === 'bélico') relationChange = 0;
  else if (targetAI.aiPersonality === 'mercantilista') relationChange = 3;

  const newAIPlanets = state.aiPlanets.map(p => {
    if (p.id === planetId) {
      return {
        ...p,
        relation: Math.min(100, Math.max(-100, p.relation + relationChange)),
        fleet: newAIFleet,
        resources: newAIRes,
      };
    }
    return p;
  });

  let newState = updatePlanet(state, planet.id, p => ({ ...p, fleet: newPlayerFleet, resources: newPlayerRes }));
  newState.aiPlanets = newAIPlanets;
  newState.fleetMissions = [...(state.fleetMissions || []), tradeSendMission, tradeReceiveMission];
  newState.notifications = [...(newState.notifications || []), {
    id: uid(), type: 'success', message: `🤝 Acuerdo comercial firmado. Cargueras de ambos imperios han despegado.`, timestamp: Date.now()
  }].slice(-100);
  return newState;
};

export const handleDiplomacyTribute = (state, action) => {
  const { planetId, resources } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;
  const targetAI = state.aiPlanets.find(p => p.id === planetId);
  if (!targetAI) return state;

  const totalShips = state.planets.reduce((acc, p) => acc + Object.values(p.fleet || {}).reduce((a, b) => a + b, 0), 0);
  const threshold = (targetAI.aiLevel || 1) * 15;
  const success = totalShips >= threshold;

  let newState = { ...state };
  if (success) {
    newState = updatePlanet(newState, planet.id, p => ({
      ...p,
      resources: {
        metal: p.resources.metal + (resources.metal || 0),
        crystal: p.resources.crystal + (resources.crystal || 0),
        deuterium: p.resources.deuterium + (resources.deuterium || 0),
      }
    }));
    newState.aiPlanets = state.aiPlanets.map(p => {
      if (p.id === planetId) {
        return { ...p, relation: Math.max(-100, p.relation - 30) };
      }
      return p;
    });
    
    newState.reputation = Math.max(-100, (state.reputation || 0) - 10);

    newState.notifications = [...(newState.notifications || []), {
      id: uid(), type: 'success', message: `💸 ¡Éxito! El tributo ha sido entregado por miedo a tu flota.`, timestamp: Date.now()
    }];
  } else {
    newState.aiPlanets = state.aiPlanets.map(p => {
      if (p.id === planetId) {
        return { ...p, relation: -100 };
      }
      return p;
    });

    newState.reputation = Math.max(-100, (state.reputation || 0) - 5);

    newState.notifications = [...(newState.notifications || []), {
      id: uid(), type: 'error', message: `⚠️ ¡Rechazado! Han insultado a tu mensajero y declarado la guerra.`, timestamp: Date.now()
    }];
  }
  return newState;
};
