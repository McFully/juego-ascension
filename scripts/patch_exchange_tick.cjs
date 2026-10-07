const fs = require('fs');

let content = fs.readFileSync('src/reducers/tick/exchangeOrdersTick.js', 'utf8');

const targetStr = `  return {
    ...state,
    planets: matchResult.planets,`;

const replacementStr = `  // Actualizar tesorería, comisiones y salud de la entidad autónoma Lonja (Reglas 17, 19, 21 y 22)
  const finalPlanets = (matchResult.planets || []).map(p => {
    if (p.isExchangePlanet && p.lonjaAutonomousState) {
      let t = p.lonjaAutonomousState.treasury;
      if (dividendPoolDelta > 0) {
        t = {
          ...t,
          credits: (t.credits || 0) + dividendPoolDelta,
          distributableProfits: (t.distributableProfits || 0) + Math.floor(dividendPoolDelta * (t.dividendDistributionRate || 0.30))
        };
        t = recordTreasuryLedger(t, {
          origin: 'spot_commissions',
          destination: 'lonja_treasury',
          concept: 'Comisiones de trading spot recaudadas en tick ' + currentTick,
          amount: dividendPoolDelta
        });
      }
      const newHealth = assessLonjaHealth(t);
      return {
        ...p,
        lonjaAutonomousState: {
          ...p.lonjaAutonomousState,
          treasury: t,
          healthState: newHealth
        }
      };
    }
    return p;
  });

  return {
    ...state,
    planets: finalPlanets,`;

const normalized = content.replace(/\r\n/g, '\n');
if (normalized.includes(targetStr)) {
  const newNormalized = normalized.replace(targetStr, replacementStr);
  fs.writeFileSync('src/reducers/tick/exchangeOrdersTick.js', newNormalized.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Parche de exchangeOrdersTick aplicado.');
} else {
  console.log('targetStr no encontrado.');
}
