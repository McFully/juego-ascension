import {
  uid, canAfford, deduct, updatePlanet, SHIPS
} from '../../core.jsx';
import { recordFactionMemory, updateIntelLedger } from '../tick/ai/factionProfileManager.js';

export const handleDiplomacyApplyAction = (state, action) => {
  const { planetId, actionType } = action;
  const targetAI = state.aiPlanets.find(p => p.id === planetId);
  if (!targetAI) return state;

  const playerPlanet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
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
    case 'non_aggression':
      influenceCost = 15;
      resCost.metal = 10000;
      resCost.crystal = 5000;
      relationChange = 15;
      msg = `📜 Pacto de No Agresión suscrito formalmente con ${targetAI.empireName}.`;
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
      
      if (actionType === 'trade_agreement') {
        updated.trade = true;
        updated.tradeTicks = 300;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'trade', 'trade_treaty', 'trade_agreement']));
      }
      if (actionType === 'non_aggression') {
        updated.pna = true;
        updated.pnaTicks = 300;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'pna', 'non_aggression']));
      }
      if (actionType === 'defense_agreement') {
        updated.defensivePact = true;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'defense_agreement', 'defensive_pact']));
      }
      if (actionType === 'break_relations') {
        updated.trade = false;
        updated.alliance = false;
        updated.pna = false;
        updated.defensivePact = false;
        updated.activePacts = [];
        return recordFactionMemory(updated, {
          type: 'betrayal',
          targetId: 'player',
          targetName: state.playerName || 'Comandante Humano',
          tick: Number(state.gameTick) || 0,
          reason: 'ruptura_unilateral_de_relaciones'
        });
      }

      if (['trade_agreement', 'defense_agreement', 'cultural_exchange', 'scientific_exchange', 'economic_exchange'].includes(actionType)) {
        return recordFactionMemory(updated, {
          type: 'aid',
          targetId: 'player',
          targetName: state.playerName || 'Comandante Humano',
          tick: Number(state.gameTick) || 0,
          reason: `acuerdo_${actionType}`
        });
      }

      return updated;
    }
    return p;
  });

  newState.notifications = [...(newState.notifications || []), {
    id: uid(), type, message: msg, timestamp: Date.now()
  }];

  return newState;
};

export const handleDiplomacyTreaty = (state, action) => {
  const { planetId, treatyType } = action;
  const targetAI = state.aiPlanets.find(p => p.id === planetId);
  if (!targetAI) return state;

  const playerPlanet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!playerPlanet) return state;

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

  if ((state.reputation || 0) >= 40) {
    cost = {
      metal: Math.floor(cost.metal * 0.75),
      crystal: Math.floor(cost.crystal * 0.75),
      deuterium: Math.floor(cost.deuterium * 0.75),
    };
  }

  if ((targetAI.relation || 0) < reqRelation) {
    return state;
  }
  if (!canAfford(playerPlanet.resources, cost)) {
    return state;
  }

  let newState = updatePlanet(state, playerPlanet.id, p => ({
    ...p,
    resources: deduct(p.resources, cost)
  }));

  newState.reputation = Math.min(100, Math.max(-100, (state.reputation || 0) + (treatyType === 'alliance' ? 20 : 10)));

  newState.aiPlanets = newState.aiPlanets.map(p => {
    if (p.id === planetId) {
      const updated = { ...p };
      if (treatyType === 'pna') {
        updated.pna = true;
        updated.pnaTicks = 300;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'pna', 'non_aggression']));
      } else if (treatyType === 'alliance') {
        updated.alliance = true;
        updated.allianceTicks = 500;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'alliance']));
      } else if (treatyType === 'trade') {
        updated.trade = true;
        updated.tradeTicks = 300;
        updated.activePacts = Array.from(new Set([...(updated.activePacts || []), 'trade', 'trade_treaty']));
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
};

export const handleDiplomacyDeclareWar = (state, action) => {
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
      const updated = {
        ...p,
        relation: declareWar ? -100 : 0,
        pna: false,
        alliance: false
      };
      if (declareWar) {
        return recordFactionMemory(updated, {
          type: 'betrayal',
          targetId: 'player',
          targetName: state.playerName || 'Comandante Humano',
          tick: Number(state.gameTick) || 0,
          reason: 'declaracion_de_guerra'
        });
      } else {
        return recordFactionMemory(updated, {
          type: 'war_ended',
          targetId: 'player',
          targetName: state.playerName || 'Comandante Humano',
          won: true,
          tick: Number(state.gameTick) || 0
        });
      }
    }
    return p;
  });

  newState.reputation = Math.min(100, Math.max(-100, (state.reputation || 0) + (declareWar ? -20 : 10)));

  newState.notifications = [...(newState.notifications || []), {
    id: uid(), type: declareWar ? 'error' : 'success', message: declareWar ? `⚠️ Estado de Guerra Declarado` : `🤝 Proposición de Paz Aceptada`, timestamp: Date.now()
  }];
  return newState;
};

export const handleDiplomacyBuyShip = (state, action) => {
  const { planetId, shipId, cost, qty } = action;
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  if (!planet) return state;

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
};
