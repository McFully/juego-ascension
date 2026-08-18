import {
  checkAchievements, checkMissions, getVirginPlanet,
  updatePlanet, shouldKeepNotification,
  clampResources, fmt, uid, buildingCost, researchCost, shipCost, defenseCost,
  canAfford, deduct, calcResourceValueForAI, meetsReq, calcProduction, calcStorage,
  shipTimeBonus, researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates
} from '../core.jsx';
import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS
} from '../data/gameData.js';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';


export const diplomacyReducer = (state, action) => {
  const getCurrentPlanet = () => state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  switch (action.type) {
    case 'DISCOVER_AI': {
      const { aiId, relationDelta } = action;
      const updatedAIPlanets = state.aiPlanets.map(p => {
        if (p.id === aiId) {
          return {
            ...p,
            discovered: true,
            relation: Math.max(-100, Math.min(100, (p.relation || 0) + (relationDelta || 0)))
          };
        }
        return p;
      });
      return {
        ...state,
        aiPlanets: updatedAIPlanets,
        activeFirstContact: null,
        activeEvent: null,
        activeTransmission: null
      };
    }

    case 'DIPLOMACY_PROPOSE_TREATY': {
      const { planetId, offer, demand, treatyType } = action;
      const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
      const targetAI = state.aiPlanets.find(p => p.id === planetId);
      if (!planet || !targetAI) return state;

      const offerCost = {
        metal: offer.metal || 0,
        crystal: offer.crystal || 0,
        deuterium: offer.deuterium || 0
      };
      const offerInfluence = offer.influence || 0;
      if (!canAfford(planet.resources, offerCost) || (state.influence || 0) < offerInfluence) {
        return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '💸 No puedes permitirte esta oferta diplomática.', timestamp: Date.now() }] };
      }

      if ((targetAI.activePacts || []).includes(treatyType)) {
        return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '🤝 Ya tienes este pacto activo con esta facción.', timestamp: Date.now() }] };
      }

      const offerVal = calcResourceValueForAI(targetAI, offer);
      let demandVal = 0;
      if (treatyType === 'trade_treaty') demandVal = 1000;
      else if (treatyType === 'non_aggression') demandVal = 600;
      else if (treatyType === 'defensive_pact') demandVal = 2500;

      const demandResVal = (demand.metal || 0) * 1.0 + (demand.crystal || 0) * 2.0 + (demand.deuterium || 0) * 4.0;
      demandVal += demandResVal;

      if (offerVal < demandVal) {
        return { ...state, notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: `❌ ${targetAI.empireName || targetAI.name} rechaza la oferta por considerarla insuficiente.`, timestamp: Date.now() }] };
      }

      let newPlanetRes = deduct(planet.resources, offerCost);
      newPlanetRes.metal += (demand.metal || 0);
      newPlanetRes.crystal += (demand.crystal || 0);
      newPlanetRes.deuterium += (demand.deuterium || 0);

      const updatedPlanets = state.planets.map(p => p.id === planet.id ? { ...p, resources: newPlanetRes } : p);
      const updatedAIPlanets = state.aiPlanets.map(p => {
        if (p.id === targetAI.id) {
          const pacts = p.activePacts || [];
          return {
            ...p,
            activePacts: [...pacts, treatyType],
            relation: Math.min(100, (p.relation || 0) + 12)
          };
        }
        return p;
      });

      return {
        ...state,
        planets: updatedPlanets,
        aiPlanets: updatedAIPlanets,
        influence: Math.max(0, (state.influence || 0) - offerInfluence),
        notifications: [...(state.notifications || []), { id: uid(), type: 'success', message: `✅ Tratado firmado con ${targetAI.empireName || targetAI.name}: ${treatyType}`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_CLOSE_TRANSMISSION': {
      return { ...state, activeTransmission: null };
    }

    case 'DIPLOMACY_TRADE_EXCESS': {
      const { aiId, resource, qty, influenceReward } = action.payload;
      const planet = state.planets[0];
      if (!planet) return state;
      
      const cost = { metal: 0, crystal: 0, deuterium: 0 };
      cost[resource] = qty;
      
      if (!canAfford(planet.resources, cost)) {
        return {
          ...state,
          activeTransmission: null,
          notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '⚠️ Ya no tienes suficientes recursos para completar el trato.', timestamp: Date.now() }]
        };
      }
      
      const updatedPlanets = state.planets.map((p, idx) => idx === 0 ? { ...p, resources: deduct(p.resources, cost) } : p);
      const targetAI = state.aiPlanets.find(p => p.id === aiId);
      
      return {
        ...state,
        planets: updatedPlanets,
        influence: (state.influence || 0) + influenceReward,
        activeTransmission: null,
        notifications: [...(state.notifications || []), { id: uid(), type: 'success', message: `💰 Vendiste excedentes a ${targetAI?.empireName || targetAI?.name}. Ganaste +${influenceReward} de Influencia.`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_PAY_TRIBUTO_THREAT': {
      const { aiId, cost } = action.payload;
      const planet = state.planets[0];
      if (!planet) return state;
      
      if (!canAfford(planet.resources, cost)) {
        return {
          ...state,
          activeTransmission: null,
          notifications: [...(state.notifications || []), { id: uid(), type: 'warning', message: '⚠️ No pudiste pagar el tributo a tiempo. El enemigo te desprecia.', timestamp: Date.now() }]
        };
      }
      
      const updatedPlanets = state.planets.map((p, idx) => idx === 0 ? { ...p, resources: deduct(p.resources, cost) } : p);
      const updatedAIPlanets = state.aiPlanets.map(p => {
        if (p.id === aiId) {
          return { ...p, relation: Math.min(100, (p.relation || 0) + 15) };
        }
        return p;
      });
      const targetAI = state.aiPlanets.find(p => p.id === aiId);
      
      return {
        ...state,
        planets: updatedPlanets,
        aiPlanets: updatedAIPlanets,
        activeTransmission: null,
        notifications: [...(state.notifications || []), { id: uid(), type: 'success', message: `💰 Pagaste tributo a ${targetAI?.empireName || targetAI?.name}. Relación +15`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_REJECT_TRIBUTO_THREAT': {
      const { aiId } = action.payload;
      const updatedAIPlanets = state.aiPlanets.map(p => {
        if (p.id === aiId) {
          return { ...p, relation: Math.max(-100, (p.relation || 0) - 25) };
        }
        return p;
      });
      const targetAI = state.aiPlanets.find(p => p.id === aiId);
      
      return {
        ...state,
        aiPlanets: updatedAIPlanets,
        activeTransmission: null,
        notifications: [...(state.notifications || []), { id: uid(), type: 'danger', message: `⚔️ Rechazaste el chantaje de ${targetAI?.empireName || targetAI?.name}. Relación -25. ¡Cuidado con sus flotas!`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_ACCEPT_PROPOSAL': {
      const { aiId, treatyType } = action.payload;
      const ai = state.aiPlanets.find(p => p.id === aiId);
      if (!ai) return { ...state, activeTransmission: null };
      const treatyNames = { pna: 'Pacto de No Agresión', trade: 'Acuerdo Comercial', alliance: 'Alianza Militar' };
      const treatyDurations = { pna: 300, trade: 300, alliance: 500 };
      const updatedAi = state.aiPlanets.map(p => {
        if (p.id === aiId) {
          const newPacts = [...(p.activePacts || []), treatyType];
          return {
            ...p,
            relation: Math.min(100, (p.relation || 0) + 10),
            [treatyType]: true,
            [`${treatyType}Ticks`]: treatyDurations[treatyType] || 300,
            activePacts: newPacts,
          };
        }
        return p;
      });
      return {
        ...state,
        aiPlanets: updatedAi,
        reputation: Math.min(100, (state.reputation || 0) + 5),
        activeTransmission: null,
        notifications: [...(state.notifications || []), { id: uid(), type: 'success', message: `✅ ${ai.empireName || ai.name} firmó ${treatyNames[treatyType] || treatyType}. Relación +10.`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_BETRAYAL_RESPONSE': {
      const { aiId, pactType, response } = action.payload;
      const ai = state.aiPlanets.find(p => p.id === aiId);
      if (!ai) return { ...state, activeTransmission: null };
      const relDelta = response === 'denounce' ? -20 : -10;
      const repDelta = response === 'denounce' ? -5 : -3;
      const updatedAi = state.aiPlanets.map(p => {
        if (p.id === aiId) {
          const newPacts = (p.activePacts || []).filter(pt => pt !== pactType);
          return {
            ...p,
            relation: Math.max(-100, (p.relation || 0) + relDelta),
            [pactType]: false,
            [`${pactType}Ticks`]: 0,
            activePacts: newPacts,
          };
        }
        return p;
      });
      return {
        ...state,
        aiPlanets: updatedAi,
        reputation: Math.max(-100, (state.reputation || 0) + repDelta),
        activeTransmission: null,
        notifications: [...(state.notifications || []), { id: uid(), type: 'error', message: `💔 ${ai.empireName || ai.name} rompió el pacto. Relación ${relDelta}. ${response === 'denounce' ? 'Su traición quedará registrada.' : 'Aceptamos la ruptura con dignidad.'}`, timestamp: Date.now() }]
      };
    }

    case 'DIPLOMACY_TRADE': {
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

      // Determine required ratio (merchant/pacifist/easy is lower, militarist/hard is higher)
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
    }

    case 'DIPLOMACY_TRIBUTE': {
      const { planetId, resources } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;
      const targetAI = state.aiPlanets.find(p => p.id === planetId);
      if (!targetAI) return state;

      // Demanding tribute success depends on player's overall military power vs AI level
      // Simple formula: if player total ships > AI level * 15, success!
      const totalShips = state.planets.reduce((acc, p) => acc + Object.values(p.fleet || {}).reduce((a, b) => a + b, 0), 0);
      const threshold = (targetAI.aiLevel || 1) * 15;
      const success = totalShips >= threshold;

      let newState = { ...state };
      if (success) {
        // Collect resources
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
            return { ...p, relation: Math.max(-100, p.relation - 30) }; // heavily degrades relationship
          }
          return p;
        });
        
        // Demanding tribute reduces reputation (-10)
        newState.reputation = Math.max(-100, (state.reputation || 0) - 10);

        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'success', message: `💸 ¡Éxito! El tributo ha sido entregado por miedo a tu flota.`, timestamp: Date.now()
        }];
      } else {
        // Demands fails, relationship crashes, war declared
        newState.aiPlanets = state.aiPlanets.map(p => {
          if (p.id === planetId) {
            return { ...p, relation: -100 }; // War!
          }
          return p;
        });

        // Rejected demand reduces reputation (-5)
        newState.reputation = Math.max(-100, (state.reputation || 0) - 5);

        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: 'error', message: `⚠️ ¡Rechazado! Han insultado a tu mensajero y declarado la guerra.`, timestamp: Date.now()
        }];
      }
      return newState;
    }

    case 'DIPLOMACY_APPLY_ACTION': {
      const { planetId, actionType } = action;
      const targetAI = state.aiPlanets.find(p => p.id === planetId);
      if (!targetAI) return state;

      const playerPlanet = getCurrentPlanet();
      if (!playerPlanet) return state;

      let influenceCost = 0;
      let resCost = { metal: 0, crystal: 0, deuterium: 0 };
      let relationChange = 0;
      let msg = '';
      let type = 'info';

      switch (actionType) {
        case 'greet':
          relationChange = 2;
          msg = `🤝 Saludo diplomático enviado a ${targetAI.empireName}.`;
          break;
        case 'official_intro':
          influenceCost = 5;
          relationChange = 5;
          msg = `🏛️ Presentación oficial realizada con el líder de ${targetAI.empireName}.`;
          break;
        case 'cultural_exchange':
          influenceCost = 10;
          relationChange = 12;
          msg = `🎭 Intercambio cultural iniciado con ${targetAI.empireName}.`;
          break;
        case 'scientific_exchange':
          influenceCost = 15;
          resCost.deuterium = 500;
          relationChange = 15;
          msg = `🔬 Intercambio científico acordado con ${targetAI.empireName}.`;
          break;
        case 'economic_exchange':
          resCost.metal = 5000;
          resCost.crystal = 2500;
          relationChange = 15;
          msg = `💼 Intercambio económico establecido con ${targetAI.empireName}.`;
          break;
        case 'trade_agreement':
          influenceCost = 15;
          relationChange = 10;
          msg = `🤝 Acuerdo comercial formalizado con ${targetAI.empireName}.`;
          break;
        case 'research_agreement':
          influenceCost = 20;
          relationChange = 15;
          msg = `🧪 Acuerdo de investigación firmado con ${targetAI.empireName}.`;
          break;
        case 'transit_agreement':
          influenceCost = 10;
          relationChange = 10;
          msg = `🚀 Acuerdo de tránsito estelar ratificado con ${targetAI.empireName}.`;
          break;
        case 'defense_agreement':
          influenceCost = 25;
          relationChange = 20;
          msg = `🛡️ Acuerdo de defensa mutua firmado con ${targetAI.empireName}.`;
          break;
        case 'guarantee_independence':
          influenceCost = 15;
          relationChange = 15;
          msg = `🛡️ Garantía de independencia proclamada para ${targetAI.empireName}.`;
          break;
        case 'protectorate':
          influenceCost = 30;
          relationChange = 20;
          msg = `👑 Establecido protectorado sobre ${targetAI.empireName}.`;
          break;
        case 'vassalage':
          influenceCost = 50;
          relationChange = -20;
          msg = `🔗 Exigido vasallaje de soberanía sobre ${targetAI.empireName}.`;
          break;
        case 'confederation':
          influenceCost = 45;
          relationChange = 30;
          msg = `🏛️ Confederación interestelar propuesta a ${targetAI.empireName}.`;
          break;
        case 'ultimatum':
          relationChange = -50;
          msg = `⚠️ Ultimátum de soberanía enviado a ${targetAI.empireName}. Las relaciones se desploman.`;
          type = 'error';
          break;
        case 'threat':
          relationChange = -30;
          msg = `⚠️ Amenaza diplomática formal a ${targetAI.empireName}. Aumenta la tensión.`;
          type = 'warning';
          break;
        case 'intl_mediation':
          influenceCost = 15;
          relationChange = 15;
          msg = `🏛️ Mediación internacional solicitada para arbitrar disputas con ${targetAI.empireName}.`;
          break;
        case 'embargo':
          relationChange = -40;
          msg = `🚫 Embargo económico declarado contra ${targetAI.empireName}.`;
          type = 'error';
          break;
        case 'sanctions':
          relationChange = -30;
          msg = `🚫 Sanciones comerciales aplicadas contra ${targetAI.empireName}.`;
          type = 'warning';
          break;
        case 'break_relations':
          relationChange = -30;
          msg = `💔 Ruptura oficial de relaciones diplomáticas con ${targetAI.empireName}.`;
          type = 'error';
          break;
        default:
          return state;
      }

      if (state.influence < influenceCost) {
        return {
          ...state,
          notifications: [...(state.notifications || []), { id: uid(), type: 'error', message: '❌ Influencia insuficiente.', timestamp: Date.now() }]
        };
      }
      if (!canAfford(playerPlanet.resources, resCost)) {
        return {
          ...state,
          notifications: [...(state.notifications || []), { id: uid(), type: 'error', message: '❌ Recursos insuficientes.', timestamp: Date.now() }]
        };
      }

      let newState = updatePlanet(state, playerPlanet.id, p => ({
        ...p,
        resources: deduct(p.resources, resCost)
      }));

      newState.influence = Math.max(0, newState.influence - influenceCost);

      newState.aiPlanets = newState.aiPlanets.map(p => {
        if (p.id === planetId) {
          const updated = { ...p };
          updated.relation = Math.min(100, Math.max(-100, (p.relation || 0) + relationChange));
          
          if (actionType === 'trade_agreement') { updated.trade = true; updated.tradeTicks = 300; }
          if (actionType === 'defense_agreement') { updated.defensivePact = true; }
          if (actionType === 'break_relations') {
            updated.trade = false;
            updated.alliance = false;
            updated.pna = false;
            updated.defensivePact = false;
          }
          return updated;
        }
        return p;
      });

      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type, message: msg, timestamp: Date.now()
      }];

      return newState;
    }

    case 'DIPLOMACY_TREATY': {
      const { planetId, treatyType } = action; // 'pna', 'alliance', or 'trade'
      const targetAI = state.aiPlanets.find(p => p.id === planetId);
      if (!targetAI) return state;

      const playerPlanet = getCurrentPlanet();
      if (!playerPlanet) return state;

      // Define requirements
      let reqRelation = 0;
      let cost = { metal: 0, crystal: 0, deuterium: 0 };
      
      if (treatyType === 'pna') {
        reqRelation = 20;
        cost = { metal: 10000, crystal: 5000, deuterium: 0 };
      } else if (treatyType === 'alliance') {
        reqRelation = 60;
        cost = { metal: 20000, crystal: 10000, deuterium: 5000 };
      } else if (treatyType === 'trade') {
        reqRelation = 40;
        cost = { metal: 15000, crystal: 8000, deuterium: 2000 };
      }

      // High reputation discount (-25% cost)
      if ((state.reputation || 0) >= 40) {
        cost = {
          metal: Math.floor(cost.metal * 0.75),
          crystal: Math.floor(cost.crystal * 0.75),
          deuterium: Math.floor(cost.deuterium * 0.75),
        };
      }

      if ((targetAI.relation || 0) < reqRelation) {
        return state; // not enough relation
      }
      if (!canAfford(playerPlanet.resources, cost)) {
        return state; // cannot afford
      }

      let newState = updatePlanet(state, playerPlanet.id, p => ({
        ...p,
        resources: deduct(p.resources, cost)
      }));

      // Sign treaty increases reputation (+20 for alliance, +10 for others)
      newState.reputation = Math.min(100, Math.max(-100, (state.reputation || 0) + (treatyType === 'alliance' ? 20 : 10)));

      newState.aiPlanets = newState.aiPlanets.map(p => {
        if (p.id === planetId) {
          const updated = { ...p };
          if (treatyType === 'pna') {
            updated.pna = true;
            updated.pnaTicks = 300;
          } else if (treatyType === 'alliance') {
            updated.alliance = true;
            updated.allianceTicks = 500;
          } else if (treatyType === 'trade') {
            updated.trade = true;
            updated.tradeTicks = 300;
          }
          updated.relation = Math.min(100, (p.relation || 0) + 10);
          return updated;
        }
        return p;
      });

      let treatyName = 'Pacto de No Agresión';
      if (treatyType === 'alliance') treatyName = 'Alianza Militar';
      if (treatyType === 'trade') treatyName = 'Acuerdo Comercial Forzado';

      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type: 'success', message: `📜 Tratado firmado: ${treatyName}`, timestamp: Date.now()
      }];
      return newState;
    }

    case 'DIPLOMACY_DECLARE_WAR': {
      const { planetId, declareWar } = action;
      if (!declareWar && (state.reputation || 0) < -40) {
        return {
          ...state,
          notifications: [...(state.notifications || []), {
            id: uid(),
            type: 'error',
            message: '❌ Proposición de Paz rechazada: Tu reputación galáctica es demasiado baja.',
            timestamp: Date.now()
          }]
        };
      }
      let newState = { ...state };
      newState.aiPlanets = state.aiPlanets.map(p => {
        if (p.id === planetId) {
          return {
            ...p,
            relation: declareWar ? -100 : 0,
            pna: false,
            alliance: false
          };
        }
        return p;
      });

      // Declare war decreases reputation (-20), peace increases it (+10)
      newState.reputation = Math.min(100, Math.max(-100, (state.reputation || 0) + (declareWar ? -20 : 10)));

      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type: declareWar ? 'error' : 'success', message: declareWar ? `⚠️ Estado de Guerra Declarado` : `🤝 Proposición de Paz Aceptada`, timestamp: Date.now()
      }];
      return newState;
    }

    case 'DIPLOMACY_BUY_SHIP': {
      const { planetId, shipId, cost, qty } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;

      // High reputation discount (-20% cost)
      let finalCost = { ...cost };
      if ((state.reputation || 0) >= 40) {
        finalCost = {
          metal: Math.floor(cost.metal * 0.80),
          crystal: Math.floor(cost.crystal * 0.80),
          deuterium: Math.floor((cost.deuterium || 0) * 0.80),
        };
      }

      if (!canAfford(planet.resources, finalCost)) return state;

      let newState = updatePlanet(state, planet.id, p => ({
        ...p,
        resources: deduct(p.resources, finalCost),
        fleet: { ...p.fleet, [shipId]: (p.fleet[shipId] || 0) + qty }
      }));

      // Mercantilist loves trade
      newState.aiPlanets = newState.aiPlanets.map(p => {
        if (p.id === planetId) {
          return { ...p, relation: Math.min(100, p.relation + 5) };
        }
        return p;
      });



      newState.notifications = [...(newState.notifications || []), {
        id: uid(), type: 'success', message: `🚀 Naves compradas en el astillero comercial: ${qty}x ${SHIPS[shipId]?.name || shipId}`, timestamp: Date.now()
      }];
      return newState;
    }

    // ============================================================
    // NEW: GALACTIC DIPLOMACY OVERHAUL (synthesis of 20 improvements)
    // Assemblies, voting, resolutions (dictámenes), federated army,
    // hierarchical federations, influence/prestige, crises (adventure),
    // rich ministry logic, AI voting with intrigue, story hooks.
    // ============================================================

    case 'COUNCIL_PROPOSE_RESOLUTION': {
      const { title, effect, cost } = action;
      if (!state.galacticCouncil || (state.influence || 0) < (cost || 20)) return state;
      const session = state.galacticCouncil.currentSession || {
        id: uid(),
        tick: state.gameTick,
        proposals: [],
        votes: {}
      };
      const proposal = {
        id: uid(),
        title,
        effect, // e.g. { type: 'PEACE_ENFORCEMENT', value: 1 } or 'TRADE_BOOST'
        proposer: 'player',
        votes: {}
      };
      session.proposals = [...(session.proposals || []), proposal];
      return {
        ...state,
        influence: (state.influence || 0) - (cost || 20),
        galacticCouncil: { ...state.galacticCouncil, currentSession: session }
      };
    }

    case 'COUNCIL_VOTE': {
      const { proposalId, vote } = action; // vote: 'yes' | 'no' | 'abstain'
      const session = state.galacticCouncil?.currentSession;
      if (!session) return state;
      const newVotes = { ...(session.votes || {}), [proposalId]: { ...(session.votes?.[proposalId] || {}), player: vote } };
      return {
        ...state,
        galacticCouncil: {
          ...state.galacticCouncil,
          currentSession: { ...session, votes: newVotes }
        }
      };
    }

    case 'FORM_FEDERATION': {
      const { name, memberIds } = action;
      const finalMembers = [...new Set(['player', ...(memberIds || [])])];
      if ((state.influence || 0) < 80 || finalMembers.length < 1) return state;
      const newFed = {
        id: uid(),
        name: name || 'Nueva Federación',
        members: finalMembers,
        leader: 'player',
        level: 1,
        createdTick: state.gameTick,
        bonuses: { production: 0.05, defense: 0.1 }
      };
      return {
        ...state,
        influence: (state.influence || 0) - 80,
        federations: [...(state.federations || []), newFed]
      };
    }

    case 'CONTRIBUTE_TO_FEDERAL_FLEET': {
      const { resources, ships } = action;
      const planet = getCurrentPlanet();
      if (!planet) return state;
      
      // Verify resources
      if (resources && !canAfford(planet.resources, resources)) return state;
      
      // Verify ships
      if (ships) {
        for (const [id, qty] of Object.entries(ships)) {
          if (qty < 0 || (planet.fleet[id] || 0) < qty) return state;
        }
      }
      
      // Deduct resources
      let newResources = planet.resources;
      if (resources) {
        newResources = deduct(newResources, resources);
      }
      
      // Deduct ships
      const newFleet = { ...planet.fleet };
      if (ships) {
        for (const [id, qty] of Object.entries(ships)) {
          newFleet[id] = (newFleet[id] || 0) - qty;
          if (newFleet[id] <= 0) delete newFleet[id];
        }
      }
      
      let newState = updatePlanet(state, planet.id, p => ({
        ...p,
        resources: newResources,
        fleet: newFleet
      }));
      
      // Accumulate in federal fleet
      const oldShips = newState.federalFleet?.ships || {};
      const newFedShips = { ...oldShips };
      if (ships) {
        for (const [id, qty] of Object.entries(ships)) {
          newFedShips[id] = (newFedShips[id] || 0) + qty;
        }
      }
      
      // Track contribution
      const contrib = state.federalFleet?.contributions?.player || { metal: 0, crystal: 0, deuterium: 0, ships: {} };
      const newContrib = {
        metal: contrib.metal + (resources?.metal || 0),
        crystal: contrib.crystal + (resources?.crystal || 0),
        deuterium: contrib.deuterium + (resources?.deuterium || 0),
        ships: { ...contrib.ships }
      };
      if (ships) {
        Object.entries(ships).forEach(([id, qty]) => {
          newContrib.ships[id] = (newContrib.ships[id] || 0) + qty;
        });
      }

      newState.federalFleet = {
        metal: (state.federalFleet?.metal || 0) + (resources?.metal || 0),
        crystal: (state.federalFleet?.crystal || 0) + (resources?.crystal || 0),
        deuterium: (state.federalFleet?.deuterium || 0) + (resources?.deuterium || 0),
        ships: newFedShips,
        contributions: {
          ...(state.federalFleet?.contributions || {}),
          player: newContrib
        }
      };
      
      newState.notifications = [...(newState.notifications || []), {
        id: uid(),
        type: 'success',
        message: `🤝 Has contribuido con recursos y/o naves al Ejército Federal. Aportes registrados.`,
        timestamp: Date.now()
      }];
      
      return newState;
    }

    case 'SPEND_INFLUENCE': {
      const { amount, target, purpose } = action;
      if ((state.influence || 0) < amount) return state;
      let newInfluence = (state.influence || 0) - amount;
      let newState = { ...state, influence: newInfluence };
      if (purpose === 'lobby' && target) {
        // Boost relation with AI
        newState.aiPlanets = newState.aiPlanets.map(p => p.id === target ? { ...p, relation: Math.min(100, (p.relation || 0) + 15) } : p);
      }
      return newState;
    }

    default:
      return state;
  }
};
