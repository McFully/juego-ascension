const fs = require('fs');

let content = fs.readFileSync('src/reducers/tick/exchangeOrdersTick.js', 'utf8');

if (!content.includes('processMarketMakerTick')) {
  content = "import { processMarketMakerTick } from '../../utils/galacticLonjaMarketMaker.js';\n" + content;

  const targetFactionBlock = `  const factionSim = simulateFactionMarketActivity(
    spotState,
    currentTick,
    state.aiPlanets || [],
    exchangePlanet?.id || null
  );
  spotState = factionSim.exchangeState;
  let currentAiPlanets = factionSim.aiPlanets;`;

  const replacementFactionBlock = `  // 1. Market Maker Autónomo con respaldo real (Fase 07)
  if (exchangePlanet && exchangePlanet.lonjaAutonomousState) {
    const mmResult = processMarketMakerTick({
      lonjaPlanet: exchangePlanet,
      spotState,
      tick: currentTick
    });
    spotState = mmResult.spotState;
    const epIdx = (state.planets || []).findIndex(p => p.id === exchangePlanet.id);
    if (epIdx !== -1 && state.planets) {
      state.planets[epIdx] = mmResult.lonjaPlanet;
    }
  }

  const factionSim = simulateFactionMarketActivity(
    spotState,
    currentTick,
    state.aiPlanets || [],
    exchangePlanet?.id || null
  );
  spotState = factionSim.exchangeState;
  let currentAiPlanets = factionSim.aiPlanets;`;

  const norm = content.replace(/\r\n/g, '\n');
  if (norm.includes(targetFactionBlock)) {
    const newNorm = norm.replace(targetFactionBlock, replacementFactionBlock);
    fs.writeFileSync('src/reducers/tick/exchangeOrdersTick.js', newNorm.replace(/\n/g, '\r\n'), 'utf8');
    console.log('processMarketMakerTick integrado en exchangeOrdersTick.js');
  } else {
    console.log('targetFactionBlock no encontrado.');
  }
}
