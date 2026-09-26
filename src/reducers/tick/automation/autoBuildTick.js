import {
  BUILDINGS, buildingCost, clampResources, deduct, canAfford, meetsReq,
  calcBuildTime, uid, GAME_SPEED, calcRequiredPopulation
} from '../../../core.jsx';

export const processAutoBuildTick = (state, prodCache, storageCache) => {
  let newState = { ...state };
  
  newState.planets = newState.planets.map(planet => {
    const planetMinistries = planet.ministries || {};
    const isGovernorActive = Boolean(planet.autoGovernance);
    const directiveMode = planet.governorDirectiveMode || 'autonomous_only';

    // Detectar si el planeta pertenece a un Sector con Virrey y Doctrina
    const sectors = newState.sectors || [];
    const planetSector = sectors.find(sec => (sec.planetIds || []).includes(planet.id));
    const sectorDoctrineId = planetSector?.doctrine;
    const hasViceroy = Boolean(planetSector?.viceroy);

    // Determinar qué ministerios están autorizados a construir
    const isMinistryAllowed = (minId) => {
      // Si el sector tiene Virrey, autoriza automáticamente las ramas afines a su doctrina
      if (hasViceroy) {
        if (sectorDoctrineId === 'mining' && ['resources', 'energy', 'logistics', 'infra'].includes(minId)) return true;
        if (sectorDoctrineId === 'bastion' && ['infra', 'energy'].includes(minId)) return true;
        if (sectorDoctrineId === 'science' && ['science', 'energy', 'infra'].includes(minId)) return true;
        if (sectorDoctrineId === 'commercial' && ['logistics', 'infra'].includes(minId)) return true;
      }

      const minData = planetMinistries[minId];
      if (isGovernorActive) {
        if (directiveMode === 'autonomous_only') {
          return Boolean(minData?.minister && minData?.automationEnabled);
        } else if (directiveMode === 'assigned_all' || directiveMode === 'full_auto') {
          return Boolean(minData?.minister);
        }
      }
      return Boolean(minData?.automationEnabled);
    };

    const allowInfra = isMinistryAllowed('infra');
    const allowScience = isMinistryAllowed('science');
    const allowEnergy = isMinistryAllowed('energy');
    const allowResources = isMinistryAllowed('resources');
    const allowLogistics = isMinistryAllowed('logistics');
    const allowCivics = isMinistryAllowed('civics');
    const allowAgri = isMinistryAllowed('agriculture');

    // Si ningún ministerio relevante está activo para construcción, no hacer nada
    if (!allowInfra && !allowScience && !allowEnergy && !allowResources && !allowLogistics && !allowCivics && !allowAgri) {
      return planet;
    }

    const currentPlanetQueue = newState.buildQueue.filter(q => q.planetId === planet.id);
    if (currentPlanetQueue.length >= 8) return planet;

    const isAlreadyBuildingType = (bId) => newState.buildQueue.some(q => q.planetId === planet.id && q.buildingId === bId);
    const prod = prodCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const storage = storageCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0 };
    const buildings = planet.buildings || {};
    const currentPop = planet.population || 1000;

    let didQueue = false;
    const candidates = [];
    
    // 1. Energía (Solo si Ministerio de Energía está autorizado)
    const currentEnergyBalance = prod.energyBalance || 0;
    const energyNeed = currentEnergyBalance < 20;
    const solarLevel = buildings.solarPlant || 0;
    const useFusionFirst = solarLevel >= 10;

    if (allowEnergy && energyNeed) {
      const energySources = useFusionFirst
        ? ['fusionReactor', 'geoPlant', 'orbitalEnergy', 'quantumReactor']
        : ['solarPlant', 'fusionReactor', 'geoPlant', 'orbitalEnergy'];
      for (const pId of energySources) {
        if (isAlreadyBuildingType(pId)) continue;
        if (meetsReq(BUILDINGS[pId] ? BUILDINGS[pId].req : null, { ...planet.buildings, ...newState.research })) {
          candidates.push(pId);
          break;
        }
      }
    }
    
    // 2. Necesidad Civil y Demográfica (Solo si Ministerio Civil o Agrícola está autorizado)
    // Si la población se acerca al tope de vivienda o no hay suficiente mano de obra para minas
    if (allowCivics || allowAgri) {
      const prefabLvl = buildings.prefabHousingUnit || 0;
      const arcologyLvl = buildings.arcologyAlpha || 0;
      const healthLvl = buildings.healthCenter || 0;
      const hydroLvl = buildings.urbanHydroponic || 0;

      // Calcular capacidad aproximada
      const approxCap = 5000 + prefabLvl * 12000 + healthLvl * 25000 + arcologyLvl * 200000;
      const isPopPressured = currentPop >= approxCap * 0.75;

      if (allowCivics) {
        if (isPopPressured) {
          if (prefabLvl < 15 && !isAlreadyBuildingType('prefabHousingUnit')) {
            candidates.push('prefabHousingUnit');
          } else if (arcologyLvl < 10 && !isAlreadyBuildingType('arcologyAlpha')) {
            candidates.push('arcologyAlpha');
          }
        }
        if (healthLvl < Math.floor(currentPop / 20000) + 1 && !isAlreadyBuildingType('healthCenter')) {
          candidates.push('healthCenter');
        }
      }
      if (allowAgri && hydroLvl < Math.floor(currentPop / 15000) + 1 && !isAlreadyBuildingType('urbanHydroponic')) {
        candidates.push('urbanHydroponic');
      }
    }

    // 3. Almacenes (Solo si Ministerio de Logística está autorizado)
    if (allowLogistics) {
      if (planet.resources.metal > storage.metal * 0.85 && !isAlreadyBuildingType('metalStorage')) candidates.push('metalStorage');
      if (planet.resources.crystal > storage.crystal * 0.85 && !isAlreadyBuildingType('crystalStorage')) candidates.push('crystalStorage');
      if (planet.resources.deuterium > storage.deuterium * 0.85 && !isAlreadyBuildingType('deutStorage')) candidates.push('deutStorage');
    }
    
    // 4. Instalaciones e I+D (Solo si Infraestructura o Ciencia están autorizados)
    const rFactory = buildings.robotFactory || 0;
    const mMine = buildings.metalMine || 0;
    const cMine = buildings.crystalMine || 0;
    const dSynth = buildings.deutSynth || 0;
    const rLab = buildings.researchLab || 0;
    
    if (allowInfra && rFactory < 15 && rFactory < Math.floor(mMine / 2.5) + 1 && !isAlreadyBuildingType('robotFactory')) candidates.push('robotFactory');
    if (allowScience && rLab < 12 && rLab < Math.floor(cMine / 2) && !isAlreadyBuildingType('researchLab')) candidates.push('researchLab');
    
    // 5. Minas (Solo si Ministerio de Recursos está autorizado)
    if (allowResources) {
      if (!energyNeed || currentEnergyBalance >= 10) {
        if (mMine <= cMine + 3 && !isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
        if (cMine <= dSynth + 2 && !isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
        if (dSynth <= cMine - 2 && !isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
      }
      
      if (currentEnergyBalance >= 5) {
        if (!isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
        if (!isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
        if (!isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
      }
    }

    for (const bId of candidates) {
      if (didQueue) break;
      // Veto estricto e irrefutable: ninguna IA (Emperador, Gobernador o Ministro) puede tocar un elemento vetado
      if (planet.automatedExclusions?.[bId]) continue;

      const currentLvl = buildings[bId] || 0;
      const targetLvl = currentLvl + 1;
      const requiredPopulation = calcRequiredPopulation(bId, targetLvl);
      
      if (currentPop >= requiredPopulation) {
        const cost = buildingCost(bId, targetLvl - 1, buildings?.constructionCenter || 0);
        if (canAfford(planet.resources, cost) && meetsReq(BUILDINGS[bId] ? BUILDINGS[bId].req : null, { ...planet.buildings, ...newState.research })) {
          const newRes = clampResources(deduct(planet.resources, cost));
          const buildTimeVal = calcBuildTime(cost, buildings.robotFactory || 0, buildings.naniteFactory || 0, GAME_SPEED, buildings.constructionCenter || 0, {}, newState.research, buildings);
          const startTime = Date.now();
          const endTime = startTime + buildTimeVal * 1000;
          
          newState.buildQueue = [...newState.buildQueue, {
            id: uid(),
            planetId: planet.id,
            buildingId: bId,
            startTime,
            endTime,
            level: targetLvl,
            auto: true
          }];
          
          didQueue = true;
          return { ...planet, resources: newRes };
        }
      }
    }

    // Fallback garantizado: Solo construir tipos cuyo ministerio esté permitido
    if (!didQueue) {
      const allowedPool = [];
      if (allowEnergy) {
        allowedPool.push(solarLevel >= 10 ? 'fusionReactor' : 'solarPlant', 'geoPlant');
      }
      if (allowResources) {
        allowedPool.push('metalMine', 'crystalMine', 'deutSynth');
      }
      if (allowInfra) {
        allowedPool.push('robotFactory', 'constructionCenter');
      }
      if (allowCivics) {
        allowedPool.push('prefabHousingUnit', 'healthCenter');
      }
      if (allowAgri) {
        allowedPool.push('urbanHydroponic');
      }

      for (const bId of allowedPool) {
        if (isAlreadyBuildingType(bId)) continue;
        // Veto estricto e irrefutable: ninguna IA (Emperador, Gobernador o Ministro) puede tocar un elemento vetado
        if (planet.automatedExclusions?.[bId]) continue;

        const currentLvl = buildings[bId] || 0;
        const targetLvl = currentLvl + 1;
        const requiredPopulation = calcRequiredPopulation(bId, targetLvl);
        if (currentPop >= requiredPopulation) {
          const cost = buildingCost(bId, targetLvl - 1, buildings?.constructionCenter || 0);
          if (BUILDINGS[bId] && canAfford(planet.resources, cost) && meetsReq(BUILDINGS[bId].req, { ...planet.buildings, ...newState.research })) {
            const newRes = clampResources(deduct(planet.resources, cost));
            const buildTimeVal = calcBuildTime(cost, buildings.robotFactory || 0, buildings.naniteFactory || 0, GAME_SPEED, buildings.constructionCenter || 0, {}, newState.research, buildings);
            const startTime = Date.now();
            const endTime = startTime + buildTimeVal * 1000;

            newState.buildQueue = [...newState.buildQueue, {
              id: uid(),
              planetId: planet.id,
              buildingId: bId,
              startTime,
              endTime,
              level: targetLvl,
              auto: true
            }];
            return { ...planet, resources: newRes };
          }
        }
      }
    }
    
    return planet;
  });

  return newState;
};
