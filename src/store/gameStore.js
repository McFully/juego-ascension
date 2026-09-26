import { create } from 'zustand';
import { gameReducer } from '../reducers/index.js';

/**
 * useGameStore — Store atómico modular para Ascensión impulsado por Zustand.
 * Permite suscripciones atómicas por dominio (flota, planetas, recursos, diplomacia)
 * y expone compatibilidad total con el despachador clásico `dispatch({ type, payload })`.
 */
export const useGameStore = create((set, get) => ({
  state: {
    gameStarted: false,
    playerName: 'Comandante',
    planets: [],
    research: {},
    buildQueue: [],
    researchQueue: [],
    shipQueue: [],
    defenseQueue: [],
    fleetMissions: [],
    notifications: [],
    imperialCouncil: { ministers: {}, activeBills: [], passedBills: [], colonyDemands: [] },
  },

  // Despachador universal compatible con el reductor existente
  dispatch: (action) => {
    set((current) => {
      const nextState = gameReducer(current.state, action);
      return { state: nextState };
    });
  },

  // Asignador directo de estado (para carga de partidas o migraciones)
  setStateDirect: (newState) => {
    set({ state: newState });
  }
}));

// Selectores atómicos de alto rendimiento
export const useGameState = () => useGameStore((s) => s.state);
export const useGameDispatch = () => useGameStore((s) => s.dispatch);
export const usePlanets = () => useGameStore((s) => s.state.planets || []);
export const useCurrentPlanet = (planetId) => useGameStore((s) => (s.state.planets || []).find(p => p.id === planetId) || s.state.planets?.[0]);
export const useFleetMissions = () => useGameStore((s) => s.state.fleetMissions || []);
export const useResearchState = () => useGameStore((s) => s.state.research || {});
export const useNotifications = () => useGameStore((s) => s.state.notifications || []);
export const useImperialCouncil = () => useGameStore((s) => s.state.imperialCouncil);
