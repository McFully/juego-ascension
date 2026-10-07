const fs = require('fs');

let content = fs.readFileSync('src/reducers/economy/exchangeActions.js', 'utf8');

if (!content.includes('depositToClientVault')) {
  content = "import { depositToClientVault, scheduleFreightTransport } from '../../utils/galacticLonjaMarketMaker.js';\n" + content;

  const newActions = `

export const handleDepositToVault = (state, action) => {
  const { resource, amount, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const lonjaPlanet = planets[pIdx];
  if (!lonjaPlanet.lonjaAutonomousState) return state;

  const available = lonjaPlanet.resources?.[resource] || 0;
  if (available < amount) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: \`🚫 Recursos insuficientes en \${lonjaPlanet.name} para depositar en custodia.\`,
        timestamp: Date.now()
      }]
    };
  }

  const res = depositToClientVault({
    lonjaState: lonjaPlanet.lonjaAutonomousState,
    clientId: 'player',
    resource,
    amount
  });

  if (!res.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: \`🚫 \${res.reason}\`,
        timestamp: Date.now()
      }]
    };
  }

  // Deducir del inventario del planeta
  planets[pIdx] = {
    ...lonjaPlanet,
    resources: {
      ...lonjaPlanet.resources,
      [resource]: Math.max(0, available - amount)
    },
    lonjaAutonomousState: res.lonjaState
  };

  return {
    ...state,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: \`🏦 \${fmt(amount)} de \${resource} depositados bajo custodia en las Bóvedas Subterráneas.\`,
      timestamp: Date.now()
    }]
  };
};

export const handleContractFreight = (state, action) => {
  const { resource, amount, destinationPlanetId, planetId } = action;
  const planets = [...(state.planets || [])];
  const lonjaIdx = planets.findIndex(p => p.id === (planetId || state.currentPlanetId) || p.isExchangePlanet);
  const destPlanet = planets.find(p => p.id === destinationPlanetId);

  if (lonjaIdx === -1 || !destPlanet) return state;
  const lonjaPlanet = planets[lonjaIdx];
  if (!lonjaPlanet.lonjaAutonomousState) return state;

  const res = scheduleFreightTransport({
    lonjaState: lonjaPlanet.lonjaAutonomousState,
    clientId: 'player',
    destinationPlanet: destPlanet,
    resource,
    amount,
    distanceParsecs: 12
  });

  if (!res.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: \`🚫 \${res.reason}\`,
        timestamp: Date.now()
      }]
    };
  }

  const creditsAvail = state.credits || 0;
  if (creditsAvail < res.freightCost) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: \`🚫 Créditos insuficientes para abonar el flete (₢ \${fmt(res.freightCost)}).\`,
        timestamp: Date.now()
      }]
    };
  }

  planets[lonjaIdx] = {
    ...lonjaPlanet,
    lonjaAutonomousState: res.lonjaState
  };

  return {
    ...state,
    credits: creditsAvail - res.freightCost,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: \`🚚 Flete comercial despachado hacia \${destPlanet.name}: \${fmt(amount)} de \${resource} en tránsito.\`,
      timestamp: Date.now()
    }]
  };
};
`;

  content += newActions;
  fs.writeFileSync('src/reducers/economy/exchangeActions.js', content, 'utf8');
  console.log('handleDepositToVault y handleContractFreight añadidos a exchangeActions.js');
}
