import { uid } from '../core.jsx';
import { VICEROY_CANDIDATES, SECTOR_DOCTRINES } from '../data/sectorsData.js';

export const sectorReducer = (state, action) => {
  const sectors = state.sectors || [];

  switch (action.type) {
    case 'CREATE_SECTOR': {
      const { name, planetIds = [] } = action;
      const newSector = {
        id: 'sector_' + uid(),
        name: name || Sector ,
        planetIds,
        viceroy: null,
        doctrine: 'mining',
        treasury: { metal: 0, crystal: 0, deuterium: 0 },
        taxRate: 0.10,
        autoBuildEnabled: true
      };

      return {
        ...state,
        sectors: [...sectors, newSector],
        notifications: [
          ...(state.notifications || []),
          {
            id: uid(),
            type: 'success',
            message: `🗺️ Nuevo Sector Territorial constituido: ${newSector.name}.`,
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'ASSIGN_PLANET_TO_SECTOR': {
      const { sectorId, planetId } = action;
      const nextSectors = sectors.map(sec => {
        if (sec.id === sectorId) {
          if (!sec.planetIds.includes(planetId)) {
            return { ...sec, planetIds: [...sec.planetIds, planetId] };
          }
          return sec;
        } else {
          return { ...sec, planetIds: sec.planetIds.filter(id => id !== planetId) };
        }
      });

      return {
        ...state,
        sectors: nextSectors
      };
    }

    case 'APPOINT_VICEROY': {
      const { sectorId, candidateId } = action;
      const candidate = VICEROY_CANDIDATES.find(c => c.id === candidateId);
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
              message: `🚫 Influencia insuficiente (${currentInf}/${candidate.influenceCost}) para nombrar al Virrey.`,
              timestamp: Date.now()
            }
          ]
        };
      }

      const nextSectors = sectors.map(sec => {
        if (sec.id === sectorId) {
          return {
            ...sec,
            viceroy: candidate,
            doctrine: candidate.favoredDoctrine || sec.doctrine
          };
        }
        return sec;
      });

      return {
        ...state,
        influence: currentInf - candidate.influenceCost,
        sectors: nextSectors,
        notifications: [
          ...(state.notifications || []),
          {
            id: uid(),
            type: 'success',
            message: `👑 ${candidate.name} asume el virreinato del Sector.`,
            timestamp: Date.now()
          }
        ]
      };
    }

    case 'SET_SECTOR_DOCTRINE': {
      const { sectorId, doctrine } = action;
      const nextSectors = sectors.map(sec => {
        if (sec.id === sectorId) {
          return { ...sec, doctrine };
        }
        return sec;
      });

      return {
        ...state,
        sectors: nextSectors
      };
    }

    case 'DELETE_SECTOR': {
      const { sectorId } = action;
      return {
        ...state,
        sectors: sectors.filter(s => s.id !== sectorId)
      };
    }

    default:
      return state;
  }
};
