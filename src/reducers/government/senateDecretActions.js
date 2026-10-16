import { uid, updatePlanet } from '../../core.jsx';

/**
 * Catálogo de Decretos Mayores del Senado financiados por la Tesorería Imperial.
 */
export const SENATE_DECREES = {
  decr_colonial_subsidy: {
    id: 'decr_colonial_subsidy',
    name: 'Subsidio de Colonización Acelerada',
    icon: '🚀',
    costCredits: 50000,
    desc: 'Inyecta 5.000 de cada recurso básico en todas las colonias del imperio.',
    effect: 'colonial_boost'
  },
  decr_industrial_plan: {
    id: 'decr_industrial_plan',
    name: 'Plan Quinquenal Industrial',
    icon: '🏭',
    costCredits: 100000,
    desc: 'Otorga un bonus directo de producción de metal y cristal en todo el imperio.',
    effect: 'production_boost'
  },
  decr_social_welfare: {
    id: 'decr_social_welfare',
    name: 'Fondo de Bienestar y Cohesión Social',
    icon: '🕊️',
    costCredits: 30000,
    desc: 'Eleva en +20 la moral ciudadana y reduce el descontento en todos los mundos.',
    effect: 'social_relief'
  },
  decr_fuel_reserve: {
    id: 'decr_fuel_reserve',
    name: 'Reserva Estratégica de Combustible',
    icon: '⛽',
    costCredits: 60000,
    desc: 'Inyecta 25.000 de Deuterio en los silos de la capital imperial.',
    effect: 'fuel_injection'
  }
};

/**
 * Ejecuta un Decreto Mayor del Senado utilizando fondos de la Tesorería.
 */
export const handleExecuteSenateDecree = (state, action) => {
  const { decreeId } = action;
  const decree = SENATE_DECREES[decreeId];
  if (!decree) return state;

  const currentTreasury = state.ministries?.economy?.treasury || 0;
  if (currentTreasury < decree.costCredits) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: `⚠️ Tesorería insuficiente: se requieren ${decree.costCredits.toLocaleString()} créditos imperiales.`,
        timestamp: Date.now()
      }]
    };
  }

  // Deducir fondos de la tesorería imperial
  const newTreasury = Math.max(0, currentTreasury - decree.costCredits);
  let newState = {
    ...state,
    ministries: {
      ...state.ministries,
      economy: {
        ...state.ministries?.economy,
        treasury: newTreasury
      }
    }
  };

  // Aplicar efecto del decreto
  if (decreeId === 'decr_colonial_subsidy') {
    newState.planets = newState.planets.map(p => ({
      ...p,
      resources: {
        ...p.resources,
        metal: (p.resources.metal || 0) + 5000,
        crystal: (p.resources.crystal || 0) + 5000,
        deuterium: (p.resources.deuterium || 0) + 5000
      }
    }));
  } else if (decreeId === 'decr_social_welfare') {
    newState.planets = newState.planets.map(p => {
      const demo = p.demographics ? { ...p.demographics } : { morale: 80, unrest: 5 };
      return {
        ...p,
        demographics: {
          ...demo,
          morale: Math.min(100, (demo.morale || 80) + 20),
          unrest: Math.max(0, (demo.unrest || 5) - 15)
        }
      };
    });
  } else if (decreeId === 'decr_fuel_reserve') {
    const homePlanet = newState.planets.find(p => p.isHome) || newState.planets[0];
    if (homePlanet) {
      newState = updatePlanet(newState, homePlanet.id, p => ({
        ...p,
        resources: {
          ...p.resources,
          deuterium: (p.resources.deuterium || 0) + 25000
        }
      }));
    }
  } else if (decreeId === 'decr_industrial_plan') {
    newState.activeSenateBuffs = {
      ...(newState.activeSenateBuffs || {}),
      industrialPlanExpires: Date.now() + 3600 * 1000 // 1 hora de duración
    };
  }

  newState.notifications = [
    ...(newState.notifications || []),
    {
      id: uid(),
      type: 'success',
      message: `🏛️ Decreto promulgado: "${decree.name}". Fondos ejecutados: -${decree.costCredits.toLocaleString()} créditos.`,
      timestamp: Date.now()
    }
  ];

  return newState;
};
