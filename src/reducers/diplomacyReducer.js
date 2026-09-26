import {
  uid, canAfford, deduct, calcResourceValueForAI
} from '../core.jsx';
import { handleDiplomacyTrade, handleDiplomacyTribute } from './diplomacy/tradeDiplomacyReducer.js';
import {
  handleDiplomacyApplyAction, handleDiplomacyTreaty, handleDiplomacyDeclareWar, handleDiplomacyBuyShip
} from './diplomacy/actionsDiplomacyReducer.js';
import {
  handleCouncilProposeResolution, handleCouncilVote, handleFormFederation, handleContributeToFederalFleet
} from './diplomacy/councilFederationReducer.js';


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
          const isPna = treatyType === 'non_aggression' || treatyType === 'pna';
          const isTrade = treatyType === 'trade_treaty' || treatyType === 'trade';
          const isDef = treatyType === 'defensive_pact' || treatyType === 'defense_agreement';
          return {
            ...p,
            activePacts: Array.from(new Set([...pacts, treatyType, isPna ? 'pna' : null, isTrade ? 'trade' : null].filter(Boolean))),
            pna: isPna ? true : p.pna,
            pnaTicks: isPna ? 300 : p.pnaTicks,
            trade: isTrade ? true : p.trade,
            tradeTicks: isTrade ? 300 : p.tradeTicks,
            defensivePact: isDef ? true : p.defensivePact,
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
      return handleDiplomacyTrade(state, action);
    }

    case 'DIPLOMACY_TRIBUTE': {
      return handleDiplomacyTribute(state, action);
    }

    case 'DIPLOMACY_APPLY_ACTION': {
      return handleDiplomacyApplyAction(state, action);
    }

    case 'DIPLOMACY_TREATY': {
      return handleDiplomacyTreaty(state, action);
    }

    case 'DIPLOMACY_DECLARE_WAR': {
      return handleDiplomacyDeclareWar(state, action);
    }

    case 'DIPLOMACY_BUY_SHIP': {
      return handleDiplomacyBuyShip(state, action);
    }

    case 'COUNCIL_PROPOSE_RESOLUTION': {
      return handleCouncilProposeResolution(state, action);
    }

    case 'COUNCIL_VOTE': {
      return handleCouncilVote(state, action);
    }

    case 'FORM_FEDERATION': {
      return handleFormFederation(state, action);
    }

    case 'CONTRIBUTE_TO_FEDERAL_FLEET': {
      return handleContributeToFederalFleet(state, action);
    }

    case 'SPEND_INFLUENCE': {
      const { amount, target, purpose } = action;
      if ((state.influence || 0) < amount) return state;
      let newInfluence = (state.influence || 0) - amount;
      let newState = { ...state, influence: newInfluence };
      if (purpose === 'lobby' && target) {
        newState.aiPlanets = newState.aiPlanets.map(p => p.id === target ? { ...p, relation: Math.min(100, (p.relation || 0) + 15) } : p);
      }
      return newState;
    }

    default:
      return state;
  }
};
