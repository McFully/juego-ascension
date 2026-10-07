const fs = require('fs');

let content = fs.readFileSync('src/missions/diploMission.js', 'utf8');

const targetImport = "import { getPlanetHeritage } from '../data/planetaryHeritageData.js';\nimport { initGalacticLonjaState } from '../utils/galacticLonjaAutonomousCore.js';";
const replacementImport = "export { handleColonizeMission } from './colonizeMission.js';";

const targetFunction = `export const handleColonizeMission = (mission, state, getVirginPlanet) => {
  const { galaxy, system, position } = mission.to;
  const targetExisting = state.planets.find(p => p.galaxy === galaxy && p.system === system && p.position === position);
  if (targetExisting) {
    return {
      state,
      type: 'warning',
      message: \`🚫 Colonización abortada: La posición [\${galaxy}:\${system}:\${position}] ya está ocupada por \${targetExisting.name}. Regresando flota colonizadora.\`,
      returnFleet: mission.fleet
    };
  }

  const astroLvl = state.research?.astrophysics || 0;
  const maxPlanets = getMaxPlanets(astroLvl);
  if ((state.planets || []).length >= maxPlanets) {
    return {
      state,
      type: 'warning',
      message: \`🚫 Colonización abortada en [\${galaxy}:\${system}:\${position}]: Límite imperial de planetas alcanzado (\${state.planets.length}/\${maxPlanets}). Regresando colonizador a salvo.\`,
      returnFleet: mission.fleet
    };
  }

  const isCommercialColonizer = (mission.fleet.commercialColonizer || 0) >= 1;
  const colonizerQty = (mission.fleet.colonizer || 0) + (mission.fleet.commercialColonizer || 0);
  if (colonizerQty < 1) {
    return { state, type: 'error', message: \`🚫 Colonización fallida: No hay naves colonizadoras en la flota.\`, returnFleet: mission.fleet };
  }

  // Verificar regla de unicidad: Máximo 1 Planeta Lonja por galaxia
  if (isCommercialColonizer) {
    const existingExchange = (state.planets || []).find(p => p.galaxy === galaxy && p.isExchangePlanet);
    if (existingExchange) {
      return {
        state,
        type: 'warning',
        message: \`🚫 Colonización de Lonja rechazada: Ya existe un Planeta Lonja en la galaxia \${galaxy} (\${existingExchange.name}). Regresando Arca Mercantil.\`,
        returnFleet: mission.fleet
      };
    }
  }

  const virgin = getVirginPlanet(galaxy, system, position);
  const newPlanet = {
    id: uid(),
    name: isCommercialColonizer ? \`Lonja Galáctica G\${galaxy}\` : \`Colonia \${state.planets.length}\`,
    galaxy, system, position,
    temperature: virgin.temperature,
    resources: isCommercialColonizer ? { metal: 50000, crystal: 50000, deuterium: 25000, slag: 0 } : { metal: 500, crystal: 300, deuterium: 100, slag: 0 },
    buildings: isCommercialColonizer ? { exchangeDocks: 1, exchangeVaults: 1, exchangeEngine: 1, exchangeBank: 1, exchangeBastion: 1, slagRecycler: 1, slagStorage: 1 } : { slagRecycler: 1, slagStorage: 1 },
    research: {}, fleet: {}, defenses: {},
    isHome: false,
    isExchangePlanet: !!isCommercialColonizer,
    planetType: isCommercialColonizer ? 'exchange' : 'standard',
    biome: isCommercialColonizer ? 'city' : virgin.biome,
    planetSize: virgin.planetSize + (state.research?.advColonization || 0) * 2,
    gravity: virgin.gravity,
    trait: isCommercialColonizer ? 'Eje Mercantil Cuántico' : virgin.trait,
    heritageId: isCommercialColonizer ? 'orbital_shipyards_heritage' : getPlanetHeritage(virgin)?.id,
    lonjaAutonomousState: isCommercialColonizer ? initGalacticLonjaState(state.playerFounderId || 'player', \`Lonja Galáctica G\${galaxy}\`) : undefined,
  };

  const returnFleet = { ...mission.fleet };
  if (isCommercialColonizer) {
    returnFleet.commercialColonizer -= 1;
    if (returnFleet.commercialColonizer <= 0) delete returnFleet.commercialColonizer;
  } else {
    returnFleet.colonizer -= 1;
    if (returnFleet.colonizer <= 0) delete returnFleet.colonizer;
  }

  let newState = { 
    ...state, 
    planets: [...state.planets, newPlanet],
    stats: { ...state.stats, coloniesFounded: state.stats.coloniesFounded + 1 }
  };

  return { 
    state: newState, 
    type: 'success', 
    message: isCommercialColonizer
      ? \`🏛️ ¡Arca Mercantil desplegada! Se ha fundado el Planeta Lonja Galáctico en [\${galaxy}:\${system}:\${position}].\`
      : \`🚩 ¡Nueva colonia fundada en [\${galaxy}:\${system}:\${position}]! El colonizador se ha desmantelado para establecer el centro de mando.\`, 
    returnFleet,
    tacticalEvent: {
      id: uid(),
      type: 'colonize',
      title: '¡Nueva Colonia Fundada!',
      subtitle: \`\${newPlanet.name} [\${galaxy}:\${system}:\${position}]\`,
      description: \`El módulo colonizador ha completado la secuencia de aterrizaje y se ha reconvertido en el centro de mando inicial. Se han asegurado las reservas energéticas y los primeros colonos comienzan la prospección del terreno.\`,
      planetDetails: {
        biome: newPlanet.biome,
        planetSize: newPlanet.planetSize,
        temperature: newPlanet.temperature,
        gravity: newPlanet.gravity,
      },
      resources: newPlanet.resources,
      targetPlanetId: newPlanet.id,
      image: 'colonizer',
      ministryId: 'civics',
      ministryName: 'Ministerio de Asuntos Civiles y Colonización',
      voiceText: \`Nueva colonia establecida en el sector \${galaxy}, sistema \${system}. Mando operativo en línea.\`
    }
  };
};`;

const norm = content.replace(/\r\n/g, '\n');
if (norm.includes(targetFunction)) {
  let newNorm = norm.replace(targetFunction, '');
  newNorm = newNorm.replace(targetImport, replacementImport);
  fs.writeFileSync('src/missions/diploMission.js', newNorm.replace(/\n/g, '\r\n'), 'utf8');
  console.log('diploMission.js refactorizado con reexportación limpia de handleColonizeMission.');
} else {
  console.log('targetFunction no encontrada.');
}
