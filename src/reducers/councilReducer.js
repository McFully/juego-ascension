import { uid, updatePlanet, canAfford, deduct } from '../core.jsx';
import { IMPERIAL_COUNCIL_CANDIDATES, IMPERIAL_SENATE_BILLS, COLONY_DEMAND_TYPES } from '../data/imperialCouncilData.js';

export const councilReducer = (state, action) => {
  switch (action.type) {
    case 'APPOINT_IMPERIAL_MINISTER': {
      const { candidateId } = action;
      const candidate = IMPERIAL_COUNCIL_CANDIDATES.find(c => c.id === candidateId);
      if (!candidate) return state;

      const currentInf = state.influence || 0;
      if (currentInf < candidate.influenceCost) {
        return {
          ...state,
          notifications: [
            ...(state.notifications || []),
            {
              id: uid(),
              type: 'warning',
              message: `🚫 Influencia insuficiente (${currentInf}/${candidate.influenceCost}) para nombrar al Ministro Supremo.`,
              timestamp: Date.now()
            }
          ]
        };
      }

      const existingCouncil = state.imperialCouncil || { ministers: {}, activeBills: [], passedBills: [], colonyDemands: [] };
      const nextMinisters = {
        ...(existingCouncil.ministers || {}),
        [candidate.portfolio]: candidate
      };

      return {
        ...state,
        influence: currentInf - candidate.influenceCost,
        imperialCouncil: {
          ...existingCouncil,
          ministers: nextMinisters
        },
        notifications: [
          ...(state.notifications || []),
          {
            id: uid(),
            type: 'success',
            message: `👑 ${candidate.name} asume la ${candidate.title}. Sus directivas se aplican a todos los mundos del Imperio.`,
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'VOTE_SENATE_BILL': {
      const { billId, vote, lobbyWithInfluence } = action; // vote: 'yes' | 'no'
      const council = state.imperialCouncil || { ministers: {}, activeBills: [], passedBills: [], colonyDemands: [] };
      const currentActive = council.activeBills || [];
      const bill = currentActive.find(b => b.id === billId);
      if (!bill) return state;

      let influenceCost = 0;
      if (lobbyWithInfluence) {
        influenceCost = bill.influenceToLobby || 20;
        if ((state.influence || 0) < influenceCost) {
          return {
            ...state,
            notifications: [
              ...(state.notifications || []),
              {
                id: uid(),
                type: 'warning',
                message: `🚫 Se requieren ${influenceCost} de Influencia para presionar al Senado.`,
                timestamp: Date.now()
              }
            ]
          };
        }
      }

      // Votación de los mundos según ideología y bioma
      let yesSeats = 0;
      let noSeats = 0;
      const planets = state.planets || [];

      planets.forEach(p => {
        const seats = Math.max(1, Math.floor((p.population || 1000) / 10000) + 1);
        const isFavored = (bill.favoredBiomes || []).includes(p.biome);
        const isOpposed = (bill.opposedBiomes || []).includes(p.biome);

        if (p.isHome) {
          // El voto del mundo capital sigue la elección del jugador
          if (vote === 'yes') yesSeats += seats;
          else noSeats += seats;
        } else if (isFavored) {
          yesSeats += seats;
        } else if (isOpposed) {
          noSeats += seats;
        } else {
          // Neutrales se inclinan si el jugador gasta influencia
          if (lobbyWithInfluence) {
            if (vote === 'yes') yesSeats += seats;
            else noSeats += seats;
          } else {
            if (Math.random() > 0.5) yesSeats += seats;
            else noSeats += seats;
          }
        }
      });

      const passed = yesSeats > noSeats;
      const nextActive = currentActive.filter(b => b.id !== billId);
      const nextPassed = passed
        ? [...(council.passedBills || []), { ...bill, passedTick: state.gameTick, yesSeats, noSeats }]
        : (council.passedBills || []);

      let nextMegaprojects = state.megaprojects || { quantumNetworkApproved: false, quantumPortalStage: 0 };
      if (passed && billId === 'bill_quantum_network') {
        nextMegaprojects = {
          ...nextMegaprojects,
          quantumNetworkApproved: true
        };
      }

      return {
        ...state,
        influence: Math.max(0, (state.influence || 0) - influenceCost),
        megaprojects: nextMegaprojects,
        imperialCouncil: {
          ...council,
          activeBills: nextActive,
          passedBills: nextPassed
        },
        notifications: [
          ...(state.notifications || []),
          {
            id: uid(),
            type: passed ? 'success' : 'info',
            message: passed
              ? `📜 Dictamen Aprobado por el Senado [${yesSeats} vs ${noSeats} escaños]: ${bill.title}.`
              : `🗳️ Proyecto Rechazado en el Senado [${yesSeats} vs ${noSeats} escaños]: ${bill.title}.`,
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'RESOLVE_COLONY_DEMAND': {
      const { demandId, planetId } = action;
      const council = state.imperialCouncil || { ministers: {}, activeBills: [], passedBills: [], colonyDemands: [] };
      const demands = council.colonyDemands || [];
      const demand = demands.find(d => d.id === demandId);
      if (!demand) return state;

      const originPlanet = state.planets.find(p => p.id === (planetId || state.currentPlanetId)) || state.planets[0];
      if (!originPlanet) return state;

      const reqRes = demand.reqRes || {};
      if (!canAfford(originPlanet.resources, reqRes)) {
        return {
          ...state,
          notifications: [
            ...(state.notifications || []),
            {
              id: uid(),
              type: 'warning',
              message: `🚫 Recursos insuficientes en ${originPlanet.name} para abastecer la demanda colonial.`,
              timestamp: Date.now()
            }
          ]
        };
      }

      let newState = updatePlanet(state, originPlanet.id, p => ({
        ...p,
        resources: deduct(p.resources, reqRes)
      }));

      // Beneficio en el planeta destino
      if (demand.targetPlanetId) {
        newState = updatePlanet(newState, demand.targetPlanetId, p => ({
          ...p,
          population: (p.population || 1000) + 150
        }));
      }

      const nextDemands = demands.filter(d => d.id !== demandId);

      return {
        ...newState,
        influence: (newState.influence || 0) + 15,
        imperialCouncil: {
          ...council,
          colonyDemands: nextDemands
        },
        notifications: [
          ...(newState.notifications || []),
          {
            id: uid(),
            type: 'success',
            message: `🚚 ¡Demanda satisfecha en ${demand.planetName}! La colonia recupera su estabilidad plena y premia al Imperio con +15 Influencia.`,
            timestamp: Date.now()
          }
        ]
      };
    }

    default:
      return state;
  }
};
