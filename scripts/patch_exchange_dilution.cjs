const fs = require('fs');

let content = fs.readFileSync('src/reducers/economy/exchangeActions.js', 'utf8');

const target1 = `  const sharesEarned = Math.max(1, Math.floor(amount / 25000));
  const playerShares = (state.playerDaoShares || 100) + sharesEarned;
  const totalShares = (state.daoShares || 1000) + sharesEarned;`;

const replacement1 = `  // Cálculo de dilución matemática y capitalización robusta (Reglas 4, 6 y 7)
  const exchangePlanet = updatedPlanets.find(p => p.id === targetPlanetId || p.isExchangePlanet);
  let updatedCapitalization = exchangePlanet?.lonjaAutonomousState?.capitalization;
  let sharesEarned = Math.max(1, Math.floor(amount / 25000));
  
  if (updatedCapitalization) {
    const capResult = calculateCapitalContribution({
      currentCapitalization: updatedCapitalization,
      contributorId: 'player',
      contributionValue: amount
    });
    updatedCapitalization = capResult;
    const oldShares = exchangePlanet.lonjaAutonomousState.capitalization.shareholders?.['player']?.ordinaryShares || 100;
    const newShares = capResult.shareholders?.['player']?.ordinaryShares || 100;
    sharesEarned = Math.max(1, newShares - oldShares);
  }

  const playerShares = (state.playerDaoShares || 100) + sharesEarned;
  const totalShares = (state.daoShares || 1000) + sharesEarned;`;

const normalizedContent = content.replace(/\r\n/g, '\n');
if (normalizedContent.includes(target1)) {
  const newNormalized = normalizedContent.replace(target1, replacement1);
  fs.writeFileSync('src/reducers/economy/exchangeActions.js', newNormalized.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Parche de dilución aplicado correctamente.');
} else {
  console.log('target1 no encontrado en exchangeActions.js');
}
