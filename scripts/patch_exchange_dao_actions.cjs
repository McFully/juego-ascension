const fs = require('fs');

let content = fs.readFileSync('src/reducers/economy/exchangeActions.js', 'utf8');

if (!content.includes('castDaoVote')) {
  content = content.replace(
    "import { calculateCapitalContribution, recordTreasuryLedger } from '../../utils/galacticLonjaAutonomousCore.js';",
    "import { calculateCapitalContribution, recordTreasuryLedger, castDaoVote, placeShareOrder } from '../../utils/galacticLonjaAutonomousCore.js';"
  );

  const newActions = `

export const handleVoteDaoProposal = (state, action) => {
  const { proposalId, voteChoice, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const targetPlanet = planets[pIdx];
  if (!targetPlanet.lonjaAutonomousState) return state;

  const updatedLonja = castDaoVote({
    lonjaState: targetPlanet.lonjaAutonomousState,
    proposalId,
    voterId: 'player',
    voteChoice
  });

  planets[pIdx] = {
    ...targetPlanet,
    lonjaAutonomousState: updatedLonja
  };

  return {
    ...state,
    planets,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'info',
      message: \`🗳️ Voto emitido (\${voteChoice}) en la propuesta \${proposalId}.\`,
      timestamp: Date.now()
    }]
  };
};

export const handleTradeLonjaShares = (state, action) => {
  const { side, shares, price, planetId } = action;
  const targetPlanetId = planetId || state.currentPlanetId;
  const planets = [...(state.planets || [])];
  const pIdx = planets.findIndex(p => p.id === targetPlanetId || p.isExchangePlanet);
  if (pIdx === -1) return state;

  const targetPlanet = planets[pIdx];
  if (!targetPlanet.lonjaAutonomousState) return state;

  const totalCost = shares * price;
  const creditsAvail = state.credits || 0;

  if (side === 'BUY' && creditsAvail < totalCost) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: '🚫 Créditos insuficientes para comprar acciones en el mercado secundario.',
        timestamp: Date.now()
      }]
    };
  }

  const result = placeShareOrder({
    lonjaState: targetPlanet.lonjaAutonomousState,
    traderId: 'player',
    side,
    shares,
    price,
    creditsAvailable: creditsAvail
  });

  if (!result.success) {
    return {
      ...state,
      notifications: [...(state.notifications || []), {
        id: uid(),
        type: 'warning',
        message: \`🚫 \${result.reason}\`,
        timestamp: Date.now()
      }]
    };
  }

  planets[pIdx] = {
    ...targetPlanet,
    lonjaAutonomousState: result.lonjaState
  };

  let newCredits = creditsAvail;
  if (side === 'BUY') {
    newCredits -= totalCost;
  }

  const playerOrdinary = result.lonjaState.capitalization?.shareholders?.['player']?.ordinaryShares || 100;

  return {
    ...state,
    credits: newCredits,
    planets,
    playerDaoShares: playerOrdinary,
    notifications: [...(state.notifications || []), {
      id: uid(),
      type: 'success',
      message: \`📈 Orden de \${side === 'BUY' ? 'compra' : 'venta'} de \${shares} acciones registrada a ₢ \${fmt(price)} c/u.\`,
      timestamp: Date.now()
    }]
  };
};
`;

  content += newActions;
  fs.writeFileSync('src/reducers/economy/exchangeActions.js', content, 'utf8');
  console.log('Nuevas acciones de DAO y mercado secundario añadidas a exchangeActions.js');
}
