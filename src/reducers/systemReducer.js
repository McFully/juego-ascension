import {
  GAME_SPEED, FACTIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  MOON_BUILDINGS, MISSIONS, MISSILES, BIOME_KEYS, AI_STRATEGIES,
  NARRATIVE_EVENTS, EVENTS, checkAchievements, checkMissions, clampResources,
  fmt, uid, buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct,
  calcResourceValueForAI, meetsReq, calcProduction, calcStorage, shipTimeBonus,
  researchTimeBonus, calcCustomShipCost, calcCustomShipTime, calcBuildTime,
  calcResearchTime, calcShipTime, calcDefenseTime, calcDistance, calcFlightTime,
  calcFuel, fleetSpeed, getPOIAtCoordinates, getVirginPlanet,
  updatePlanet, shouldKeepNotification,
  SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES
} from '../core.jsx';
import { processMission, returnFleetToOrigin, processEvent } from '../missions.jsx';


export const systemReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_GAME': {
      return { gameStarted: false };
    }
    case 'LOAD': {
      const defaults = {
        fleetPresets: [],
        achievements: [],
        stats: { totalBuildings: 0, totalShips: 0, totalDefenses: 0, totalResearch: 0, combatsWon: 0, combatsLost: 0, combatsDraw: 0, metalGathered: 0, crystalGathered: 0, deuteriumGathered: 0, metalSpent: 0, crystalSpent: 0, deuteriumSpent: 0, playTime: 0, coloniesFounded: 0, moonsCreated: 0, expeditionsCompleted: 0, artifactsFound: 0, deathstarsBuilt: 0, maxTechLevel: 0, retrofitsCompleted: 0 },
        research: { weapons: 0, shields: 0, armour: 0, combustion: 0, impulse: 0, hyperspace: 0, espionage: 0, computer: 0, astrophysics: 0, energyTech: 0, laserTech: 0, ionTech: 0, plasma: 0, intergalacticNetwork: 0, gravitation: 0, nanoTech: 0, terraforming: 0 },
        governmentPolicies: { socialOrder: 100, corruption: 0, liberty: 50 },
        debrisField: { metal: 0, crystal: 0 }
      };
      const payload = action.payload || {};
      const migrated = {
        ...payload,
        version: 3,
        gameStarted: payload.gameStarted !== undefined ? payload.gameStarted : true,
        activeEvent: payload.activeEvent || null,
        fleetPresets: Array.isArray(payload.fleetPresets) ? payload.fleetPresets : [],
        achievements: Array.isArray(payload.achievements) ? payload.achievements : [],
        stats: { ...defaults.stats, ...(payload.stats || {}) },
        research: { ...defaults.research, ...(payload.research || {}) },
        governmentPolicies: { ...defaults.governmentPolicies, ...(payload.governmentPolicies || {}) },
        planets: (Array.isArray(payload.planets) ? payload.planets : []).map(p => ({
          ...p,
          retrofitTech: p.retrofitTech || {},
          biome: p.biome || 'temperate',
          planetSize: p.planetSize || 100,
          gravity: p.gravity !== undefined ? p.gravity : 2,
          trait: p.trait || null,
        })),
        aiPlanets: (Array.isArray(payload.aiPlanets) ? payload.aiPlanets : []).filter(p => p && typeof p === 'object' && !p.isVirgin).map(p => {
          const strategyKey = p.strategy || ['expansionist','militarist','merchant','technocrat','diplomat','clanist','chaotic'][Math.floor(Math.random() * 7)];
          const personality = p.aiPersonality || (
            (strategyKey === 'militarist' || strategyKey === 'expansionist') ? 'bélico' :
            (strategyKey === 'merchant' || strategyKey === 'diplomat') ? 'mercantilista' : 'pacífico'
          );
          return {
            ...p,
            relation: p.relation !== undefined ? p.relation : 0,
            discovered: p.discovered !== undefined ? p.discovered : true,
            strategy: strategyKey,
            aiPersonality: personality,
            aggression: p.aggression !== undefined ? p.aggression : (0.3 + Math.random() * 0.5),
            riskTolerance: p.riskTolerance !== undefined ? p.riskTolerance : (0.3 + Math.random() * 0.5),
            lossTolerance: p.lossTolerance !== undefined ? p.lossTolerance : (0.2 + Math.random() * 0.4),
            biome: p.biome || BIOME_KEYS[Math.floor(Math.random() * BIOME_KEYS.length)],
            planetSize: p.planetSize || PLANET_SIZES[Math.floor(Math.random() * PLANET_SIZES.length)],
            gravity: p.gravity !== undefined ? p.gravity : Math.floor(Math.random() * 5),
            trait: p.trait || null,
            totalWins: p.totalWins || 0,
            totalLosses: p.totalLosses || 0,
            warsDeclared: p.warsDeclared || 0,
            warsReceived: p.warsReceived || 0,
            activePacts: Array.isArray(p.activePacts) ? p.activePacts : [],
          };
        }),
        buildQueue: Array.isArray(payload.buildQueue) ? payload.buildQueue : [],
        researchQueue: Array.isArray(payload.researchQueue) ? payload.researchQueue : [],
        shipQueue: Array.isArray(payload.shipQueue) ? payload.shipQueue : [],
        defenseQueue: Array.isArray(payload.defenseQueue) ? payload.defenseQueue : [],
        customShipQueue: Array.isArray(payload.customShipQueue) ? payload.customShipQueue : [],
        retrofitQueue: Array.isArray(payload.retrofitQueue) ? payload.retrofitQueue : [],
        shipyardQueue: Array.isArray(payload.shipyardQueue) ? payload.shipyardQueue : [],
        missileQueue: Array.isArray(payload.missileQueue) ? payload.missileQueue : [],
        fleetMissions: Array.isArray(payload.fleetMissions) ? payload.fleetMissions : [],
        combatLog: Array.isArray(payload.combatLog) ? payload.combatLog : [],
        spyReports: Array.isArray(payload.spyReports) ? payload.spyReports : [],
        events: Array.isArray(payload.events) ? payload.events : [],
        notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
        blueprints: Array.isArray(payload.blueprints) ? payload.blueprints : [],
        debrisField: { ...defaults.debrisField, ...(payload.debrisField || {}) },
        clans: Array.isArray(payload.clans) ? payload.clans : [],
        galacticEvents: Array.isArray(payload.galacticEvents) ? payload.galacticEvents : [],
        tradeRoutes: Array.isArray(payload.tradeRoutes) ? payload.tradeRoutes : [],
        leaders: Array.isArray(payload.leaders) ? payload.leaders : [],
        activeMissions: Array.isArray(payload.activeMissions) ? payload.activeMissions : [],
        completedMissions: Array.isArray(payload.completedMissions) ? payload.completedMissions : [],
        relics: Array.isArray(payload.relics) ? payload.relics : [],
        activeEvents: Array.isArray(payload.activeEvents) ? payload.activeEvents : [],
        totalAICount: payload.totalAICount || (payload.aiPlanets || []).length,
        // New diplomacy and narrative fields for compatibility
        influence: payload.influence ?? 50,
        reputation: payload.reputation ?? 0,
        adventureLogs: Array.isArray(payload.adventureLogs) ? payload.adventureLogs : [],
        eventLog: Array.isArray(payload.eventLog) ? payload.eventLog : [],
        galacticCouncil: payload.galacticCouncil || { lastSessionTick: 0, currentSession: null, resolutionsPassed: [], influenceHistory: [] },
        federations: payload.federations || [],
        federalFleet: payload.federalFleet || { metal: 0, crystal: 0, deuterium: 0, ships: {} },
        diplomaticHistory: payload.diplomaticHistory || [],
        activeCrises: payload.activeCrises || [],
        ministries: payload.ministries || {
          economy: { taxRate: payload.gameMode === 'decay' ? 0.3 : 0.1, tradeSubsidies: false, treasury: payload.gameMode === 'decay' ? -50000 : 1000, gdp: 0, automationEnabled: false },
          defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false },
          science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false },
          culture: { propagandaLevel: 1, socialUnity: payload.gameMode === 'decay' ? 20 : 80, eventsActive: [], automationEnabled: false },
          infra: { maintenanceBudget: payload.gameMode === 'decay' ? 0.01 : 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false },
          intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false }
        },
      };
      return { ...migrated, notifications: [{ id: uid(), type: 'success', message: '💾 Partida cargada con éxito (v3)', timestamp: Date.now() }] };
    }
    case 'TICK': {
      const now = Date.now();
      let newState = { ...state, gameTick: state.gameTick + 1, lastTick: now };

      // === HARDENING: Ensure ministries exist to prevent crash in old saves ===
      if (!newState.ministries) {
        newState.ministries = {
          economy: { taxRate: 0.1, tradeSubsidies: false, treasury: 1000, gdp: 0, automationEnabled: false },
          defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false },
          science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false },
          culture: { propagandaLevel: 1, socialUnity: 80, eventsActive: [], automationEnabled: false },
          infra: { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false },
          intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false }
        };
      }
      if (!newState.ministries.economy) newState.ministries.economy = { taxRate: 0.1, treasury: 1000, gdp: 0, automationEnabled: false };
      if (!newState.ministries.defense) newState.ministries.defense = { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, automationEnabled: false };
      if (!newState.ministries.science) newState.ministries.science = { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false };
      if (!newState.ministries.culture) newState.ministries.culture = { propagandaLevel: 1, socialUnity: 80, eventsActive: [], automationEnabled: false };
      if (!newState.ministries.infra) newState.ministries.infra = { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false };
      if (!newState.ministries.intel) newState.ministries.intel = { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false };

      // === NARRATIVE LOGIC (NO PAUSA LA PRODUCCIÓN) ===
      if (newState.gameTick > 0 && newState.gameTick % 60 === 0 && !newState.activeEvent && !newState.activeFirstContact && !newState.activeTransmission) {
        for (const event of NARRATIVE_EVENTS) {
          if (!newState.triggeredNarrativeEvents?.includes(event.id) && event.triggerCondition(newState)) {
            newState.activeEvent = event;
            newState.triggeredNarrativeEvents = [...(newState.triggeredNarrativeEvents || []), event.id];
            newState.notifications = [...(newState.notifications || []), {
              id: uid(),
              type: event.type === 'crisis' ? 'error' : 'info',
              message: `📡 TRANSMISIÓN URGENTE: ${event.title}. Requiere tu atención inmediata en Visión General.`,
              timestamp: now
            }];
            break; // Solo un evento por minuto
          }
        }
      }
      // === END NARRATIVE LOGIC ===

      // Cache calcProduction for ALL planets — avoids 3x calls per planet per tick
      const prodCache = new Map();
      const storageCache = new Map();
      for (const planet of state.planets) {
        let prod;
        try {
          prod = calcProduction(planet.buildings, state.research, planet.temperature, GAME_SPEED, planet.faction || 'human', planet.biome, planet.gravity, planet.trait, planet.specialization, { galaxy: planet.galaxy, system: planet.system, position: planet.position }, state.ministries?.economy?.taxRate || 0);
        } catch (e) {
          console.error('[Ascensión] calcProduction in TICK error:', e, planet.id);
          prod = { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
        }
        prodCache.set(planet.id, prod);
        storageCache.set(planet.id, calcStorage(planet.buildings));
      }

      const newPlanets = state.planets.map(planet => {
        let p = planet;
        const prod = prodCache.get(p.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
        const storage = storageCache.get(p.id) || { metal: 0, crystal: 0, deuterium: 0 };
        let newRes = {
          metal: Math.min((p.resources.metal || 0) + prod.metal / 3600, storage.metal),
          crystal: Math.min((p.resources.crystal || 0) + prod.crystal / 3600, storage.crystal),
          deuterium: Math.min(Math.max(0, (p.resources.deuterium || 0) + prod.deuterium / 3600), storage.deuterium),
        };
        newRes = clampResources(newRes);

        // Civil Population consumption and growth (reducido un 90%)
        const pop = p.population || 1000;
        const metalCons = pop * 0.00002;
        const crystalCons = pop * 0.00001;
        const deutCons = pop * 0.000005;

        let hasFamine = false;
        if (newRes.metal >= metalCons && newRes.crystal >= crystalCons && newRes.deuterium >= deutCons) {
          newRes.metal -= metalCons;
          newRes.crystal -= crystalCons;
          newRes.deuterium -= deutCons;
        } else {
          hasFamine = true;
          newRes.metal = Math.max(0, newRes.metal - metalCons);
          newRes.crystal = Math.max(0, newRes.crystal - crystalCons);
          newRes.deuterium = Math.max(0, newRes.deuterium - deutCons);
        }

        let nextPop = pop;
        if (!hasFamine) {
          const townHallLvl = p.buildings?.townHall || 0;
          const healthCenterLvl = p.buildings?.healthCenter || 0;
          const arcologyLvl = p.buildings?.arcologyAlpha || 0;
          const prefabLvl = p.buildings?.prefabHousingUnit || 0;
          const bioClinicLvl = p.buildings?.bioRegenClinic || 0;
          const hydroLvlB = p.buildings?.urbanHydroponic || 0;
          
          const maxPop = 5000 + healthCenterLvl * 250000 + arcologyLvl * 10000 + prefabLvl * 2000 + bioClinicLvl * 8000 + hydroLvlB * 3000;
          
          if (pop < maxPop) {
            const bioLvl = state.research?.orbitalSanitaryBio || 0;
            const hydroLvl = state.research?.multiproposeHydroponic || 0;
            const sleepLvl = state.research?.acceleratedSleepBio || 0;
            const growthMult = 1 + bioLvl * 0.06 + hydroLvl * 0.05 + sleepLvl * 0.03;
            
            const growth = Math.floor((2 + townHallLvl * 150 + bioClinicLvl * 30) * growthMult);
            nextPop = Math.min(maxPop, pop + growth);
          }
        }

        if (p.specialization === 'commercial') {
          const hasIndustrial = state.planets.some(pp => pp.specialization === 'industrial');
          const hasScientific = state.planets.some(pp => pp.specialization === 'scientific');
          if (hasIndustrial) newRes.metal = Math.min(newRes.metal + Math.floor(prod.metal / 9000), storage.metal);
          if (hasScientific) newRes.deuterium = Math.min(Math.max(0, newRes.deuterium + Math.floor(prod.deuterium / 9000)), storage.deuterium);
        }

        let retrofitTech = { ...p.retrofitTech };
        const fields = ['weapons', 'shields', 'armour', 'combustion', 'impulse', 'hyperspace'];
        let needsUpgrade = false;
        for (const f of fields) {
          if ((retrofitTech[f] || 0) < (state.research[f] || 0)) {
            needsUpgrade = true;
            break;
          }
        }
        if (needsUpgrade) {
          const upgradeCost = { metal: 2, crystal: 1, deuterium: 0.5 };
          if (newRes.metal >= upgradeCost.metal && newRes.crystal >= upgradeCost.crystal && newRes.deuterium >= upgradeCost.deuterium) {
            newRes.metal -= upgradeCost.metal;
            newRes.crystal -= upgradeCost.crystal;
            newRes.deuterium -= upgradeCost.deuterium;
            for (const f of fields) {
              const currentLvl = retrofitTech[f] || 0;
              const globalLvl = state.research[f] || 0;
              if (currentLvl < globalLvl) {
                retrofitTech[f] = currentLvl + 1;
                break;
              }
            }
          }
        }
        return { ...p, resources: newRes, population: nextPop, retrofitTech };
      });
      newState.planets = newPlanets;

      // Update stats (use cached prod for current planet)
      const cp = newPlanets.find(p => p.id === state.currentPlanetId) || newPlanets[0];
      const prod = prodCache.get(cp.id) || { metal: 0, crystal: 0, deuterium: 0 };
      
      // === MINISTRY TICK LOGIC ===
      const mins = newState.ministries || {};
      const taxRate = mins.economy?.taxRate || 0.1;
      const researchGrants = mins.science?.researchGrants || 0.05;
      const maintenance = mins.infra?.maintenanceBudget || 0.05;
      // Economy: Tax collection based on metal production + civil businesses (use cached prod per planet)
      const totalMetalProd = newPlanets.reduce((acc, p) => {
        const pp = prodCache.get(p.id);
        return acc + ((pp ? pp.metal : 0) / 3600);
      }, 0);
      let businessTaxIncome = 0;
      newPlanets.forEach(p => {
        const b = p.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
        businessTaxIncome += (b.lowClass || 0) * 5 + (b.midClass || 0) * 15 + (b.highClass || 0) * 50;
      });
      const taxIncome = totalMetalProd * taxRate * 2.0 + businessTaxIncome; // 1 Metal ~ 2 Credits + Business taxes
      newState.ministries = {
        ...newState.ministries,
        economy: {
          ...newState.ministries.economy,
          treasury: (mins.economy.treasury || 0) + taxIncome,
          gdp: totalMetalProd * 3600,
        }
      };
      // Culture: Passive Reputation & Influence growth
      const unity = mins.culture?.socialUnity || 80;
      const propaganda = mins.culture?.propagandaLevel || 1;
      if (newState.gameTick % 60 === 0) {
        // Reputation growth (+0.1 if unity is high, +0.2 if alliances exist)
        const hasAlliances = (newState.aiPlanets || []).some(ai => ai.alliance);
        const repGrowth = (unity > 70 ? 0.1 : 0) + (hasAlliances ? 0.2 : 0);
        newState.reputation = Math.min(100, (newState.reputation || 0) + repGrowth);
        
        // Influence growth
        const persuasion = (state.research?.persuasionSociology || 0) * 0.8;
        const stellarProp = (state.research?.stellarPropaganda || 0) * 0.6;
        const algoBurocracy = (state.research?.algorithmicBureaucracy || 0) * 0.5;
        const lawCode = (state.research?.galacticLawCode || 0) * 0.7;
        
        // Government buildings bonus
        const govBonus = newPlanets.reduce((acc, pl) => {
          const b = pl.buildings || {};
          return acc + (b.sectorGovPalace || 0) * 0.2
                     + (b.financeMinistry || 0) * 0.15
                     + (b.permanentEmbassy || 0) * 0.25
                     + (b.councilChamber || 0) * 0.20
                     + (b.consulateHeadquarters || 0) * 0.18
                     + (b.colonySupremeCourt || 0) * 0.15;
        }, 0);
        
        const infGrowth = 1 + (propaganda * 0.5) + (unity > 90 ? 1 : 0) + persuasion + stellarProp + algoBurocracy + lawCode + govBonus;
        newState.influence = (newState.influence || 0) + infGrowth;
      }
      // === END MINISTRY LOGIC ===

      newState.stats = {
        ...newState.stats,
        playTime: newState.stats.playTime + 1,
        metalGathered: newState.stats.metalGathered + prod.metal / 3600,
        crystalGathered: newState.stats.crystalGathered + prod.crystal / 3600,
        deuteriumGathered: newState.stats.deuteriumGathered + prod.deuterium / 3600,
      };

      // Process retrofit queue
      const newRetrofitQueue = [];
      for (const item of state.retrofitQueue || []) {
        if (Date.now() >= item.endTime) {
          if (item.type === 'fleet') {
            newState = updatePlanet(newState, item.planetId, p => ({
              ...p,
              fleet: Object.entries(item.fleetSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.fleet }),
              retrofitTech: { weapons: state.research.weapons || 0, shields: state.research.shields || 0, armour: state.research.armour || 0, combustion: state.research.combustion || 0, impulse: state.research.impulse || 0, hyperspace: state.research.hyperspace || 0 },
            }));
          } else if (item.type === 'defense') {
            newState = updatePlanet(newState, item.planetId, p => ({
              ...p,
              defenses: Object.entries(item.defenseSnapshot).reduce((acc, [id, qty]) => { acc[id] = (acc[id] || 0) + qty; return acc; }, { ...p.defenses }),
              retrofitTech: { weapons: state.research.weapons || 0, shields: state.research.shields || 0, armour: state.research.armour || 0 },
            }));
          }
          newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🔧 Modernización completada en ${item.planetId === state.currentPlanetId ? 'planeta actual' : 'colonia'}`, timestamp: Date.now() }];
        } else {
          newRetrofitQueue.push(item);
        }
      }
      newState.retrofitQueue = newRetrofitQueue;

      // Process build queue - all completed items
      const newBuildQueue = [];
      for (const item of state.buildQueue) {
        if (Date.now() >= item.endTime) {
          const planet = state.planets.find(p => p.id === item.planetId);
          const oldLevel = planet?.buildings?.[item.buildingId] || 0;
          newState = updatePlanet(newState, item.planetId, p => ({
            ...p,
            buildings: { ...p.buildings, [item.buildingId]: (p.buildings[item.buildingId] || 0) + 1 },
          }));
          if (!item.auto) {
            newState.notifications = [...newState.notifications, {
              id: uid(), type: 'success', message: `🏗️ ${BUILDINGS[item.buildingId].name} mejorado a nivel ${oldLevel + 1}`, timestamp: Date.now(),
            }];
          }
          newState.stats = { ...newState.stats, totalBuildings: newState.stats.totalBuildings + 1 };
        } else {
          newBuildQueue.push(item);
        }
      }
      newState.buildQueue = newBuildQueue;

      // Process research queue - all completed items
      const newResearchQueue = [];
      for (const item of state.researchQueue) {
        const validTimes = !isNaN(item.endTime) && !isNaN(item.startTime) && item.endTime > item.startTime;
        const ready = Date.now() >= item.endTime;
        // Items con tiempos inválidos o ya completados: aplicar nivel o reembolsar si no cumple req
        if (!validTimes || ready) {
          const rDef = RESEARCH[item.researchId];
          const reqMet = !rDef || !rDef.req || meetsReq(rDef.req, newState.research);
          if (!reqMet) {
            // Req no cumple: reembolsar recursos y descartar slot
            const p = newState.planets.find(pl => pl.id === item.planetId);
            if (p) {
              const refundCost = researchCost(item.researchId, (newState.research[item.researchId] || 0), newState.research?.aiStrategy || 0, p.buildings?.constructionCenter || 0);
              newState = updatePlanet(newState, item.planetId, pl => ({
                ...pl,
                resources: clampResources({
                  metal: (pl.resources.metal || 0) + refundCost.metal,
                  crystal: (pl.resources.crystal || 0) + refundCost.crystal,
                  deuterium: (pl.resources.deuterium || 0) + refundCost.deuterium,
                }),
              }));
            }
            newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warning', message: `🔬 Investigación "${rDef?.name || item.researchId}" cancelada: requisitos no cumplidos. Recursos reembolsados.`, timestamp: Date.now() }];
            continue;
          }
          const oldLevel = state.research[item.researchId] || 0;
          newState.research = { ...newState.research, [item.researchId]: oldLevel + 1 };
          const newLvl = oldLevel + 1;
          newState.stats = { ...newState.stats, totalResearch: newState.stats.totalResearch + 1, maxTechLevel: Math.max(newState.stats.maxTechLevel || 0, newLvl) };
          if (!item.auto) {
            newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🔬 ${rDef?.name || item.researchId} nivel ${newLvl}`, timestamp: Date.now() }];
          }
          continue;
        }
        newResearchQueue.push(item);
      }
      newState.researchQueue = newResearchQueue;

      // Retroactive tech application: when research completes, update ALL existing units
      // This ensures tech upgrades apply to fleet and defenses without extra cost
      newState.planets = newState.planets.map(p => {
        const retrofitFields = ['weapons','shields','armour','combustion','impulse','hyperspace'];
        const newRetrofit = { ...(p.retrofitTech || {}) };
        let changed = false;
        for (const f of retrofitFields) {
          if ((newRetrofit[f] || 0) < (newState.research[f] || 0)) {
            newRetrofit[f] = newState.research[f] || 0;
            changed = true;
          }
        }
        return changed ? { ...p, retrofitTech: newRetrofit } : p;
      });

      // Process ship queue - all completed items
      // Process ship queue - unidad por unidad
      const newShipQueue = [];
      for (const item of state.shipQueue) {
        const now = Date.now();
        const totalDuration = item.endTime - item.startTime;
        const totalQty = item.quantity;
        if (totalQty <= 0 || totalDuration <= 0) continue;

        const unitTime = totalDuration / totalQty;
        const elapsedTime = now - item.startTime;
        const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
        const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

        if (newlyCompleted > 0) {
          newState = updatePlanet(newState, item.planetId, p => ({
            ...p,
            fleet: { ...p.fleet, [item.shipId]: (p.fleet[item.shipId] || 0) + newlyCompleted },
          }));
          newState.notifications = [...(newState.notifications || []), {
            id: uid(), type: 'success', message: `🚀 ${newlyCompleted}x ${SHIPS[item.shipId]?.name || item.shipId} listo(s)`, timestamp: Date.now(),
          }];
          newState.stats = { ...newState.stats, totalShips: newState.stats.totalShips + newlyCompleted };
        }

        if (completedUnits >= totalQty || now >= item.endTime) {
          // Completada toda la tanda
        } else {
          newShipQueue.push({
            ...item,
            unitsDelivered: completedUnits
          });
        }
      }
      newState.shipQueue = newShipQueue;

      // Process defense queue - unidad por unidad
      const newDefenseQueue = [];
      for (const item of state.defenseQueue) {
        const now = Date.now();
        const totalDuration = item.endTime - item.startTime;
        const totalQty = item.quantity;
        if (totalQty <= 0 || totalDuration <= 0) continue;

        const unitTime = totalDuration / totalQty;
        const elapsedTime = now - item.startTime;
        const completedUnits = Math.min(totalQty, Math.floor(elapsedTime / unitTime));
        const newlyCompleted = completedUnits - (item.unitsDelivered || 0);

        if (newlyCompleted > 0) {
          newState = updatePlanet(newState, item.planetId, p => ({
            ...p,
            defenses: { ...p.defenses, [item.defenseId]: (p.defenses[item.defenseId] || 0) + newlyCompleted },
          }));
          if (!item.auto) {
            newState.notifications = [...(newState.notifications || []), {
              id: uid(), type: 'success', message: `🛡️ ${newlyCompleted}x ${DEFENSES[item.defenseId]?.name || item.defenseId} construido(s)`, timestamp: Date.now(),
            }];
          }
          newState.stats = { ...newState.stats, totalDefenses: newState.stats.totalDefenses + newlyCompleted };
        }

        if (completedUnits >= totalQty || now >= item.endTime) {
          // Completada toda la tanda
        } else {
          newDefenseQueue.push({
            ...item,
            unitsDelivered: completedUnits
          });
        }
      }
      newState.defenseQueue = newDefenseQueue;

      // Process custom ship queue
      const newCustomQueue = [];
      let customNotifSent = false;
      for (const item of state.customShipQueue || []) {
        if (Date.now() >= item.endTime) {
          const bp = state.blueprints.find(b => b.id === item.blueprintId);
          if (bp) {
            newState = updatePlanet(newState, item.planetId, p => ({
              ...p,
              fleet: { ...p.fleet, ['custom_' + bp.id]: (p.fleet['custom_' + bp.id] || 0) + item.quantity },
            }));
          }
          if (!customNotifSent) {
            newState.notifications = [...(newState.notifications || []), {
              id: uid(), type: 'success', message: `🔧 ${item.quantity}x nave personalizada lista`, timestamp: Date.now(),
            }];
            customNotifSent = true;
          }
        } else {
          newCustomQueue.push(item);
        }
      }
      newState.customShipQueue = newCustomQueue;

      // Process fleet missions
      if (Array.isArray(state.fleetMissions) && state.fleetMissions.length > 0) {
        const ongoingMissions = [];

        for (const m of state.fleetMissions) {
          if (m.returning) {
            // Return flight completed - give ships back
            if (Date.now() >= m.returnTime) {
              newState = returnFleetToOrigin(newState, m);
              newState.notifications = [...(newState.notifications || []), {
                id: uid(), type: 'info', message: `🚀 Flota regresó a ${m.from.name || 'origen'}`, timestamp: Date.now(),
              }];
            } else {
              ongoingMissions.push(m);
            }
          } else if (Date.now() >= m.arrivalTime) {
            if (m.type === 'ally_reinforce') {
              newState = updatePlanet(newState, m.to.id, p => ({
                ...p,
                fleet: Object.entries(m.fleet).reduce((acc, [id, qty]) => {
                  acc[id] = (acc[id] || 0) + qty;
                  return acc;
                }, { ...p.fleet }),
              }));
              newState.notifications = [...newState.notifications, { id: uid(), type: 'success', message: `🚀 Refuerzos aliados llegaron a ${m.to.name}`, timestamp: Date.now() }];
              // Schedule return flight for ally reinforcement fleet
              const retreatDist = calcDistance(m.to, m.from);
              const retreatSpd = fleetSpeed(m.fleet, m.from.research || {}, m.from.faction || 'human');
              if (retreatSpd > 0) {
                const retreatTime = calcFlightTime(retreatDist, retreatSpd, 10, m.from.research || {});
                ongoingMissions.push({
                  ...m,
                  fleet: m.fleet,
                  returning: true,
                  returnDeparture: Date.now(),
                  returnTime: Date.now() + retreatTime * 1000,
                });
              }
              continue;
            }
            // Process the mission action (defensive)
            let result;
            try {
              result = processMission(m, newState);
            } catch (e) {
              console.error('[Ascensión] processMission error:', e, m);
              result = { state: newState, type: 'error', message: 'Error procesando misión', returnFleet: m.fleet || {} };
            }
            newState = result.state;



            // Schedule return flight (for player missions, and for AI trade/transport missions)
            const returnFleet = result.returnFleet || {};
            if (Object.keys(returnFleet).length > 0) {
              const dist = calcDistance(m.from, m.to);
              if (!m.isAI) {
                const playerFaction = newState.planets.find(p => p.id === m.from.id)?.faction || 'human';
                const spd = fleetSpeed(returnFleet, newState.research, playerFaction);
                if (spd > 0) {
                  const flightTime = calcFlightTime(dist, spd, 10, newState.research);
                  ongoingMissions.push({
                    ...m,
                    fleet: returnFleet,
                    returning: true,
                    returnDeparture: Date.now(),
                    returnTime: Date.now() + flightTime * 1000,
                  });
                }
              } else if (m.type === 'trade_receive') {
                // Return flight for AI trade cargueros
                const aiFaction = newState.aiPlanets.find(p => p.id === m.from.id)?.faction || 'human';
                const spd = fleetSpeed(returnFleet, m.from.research || {}, aiFaction);
                if (spd > 0) {
                  const flightTime = calcFlightTime(dist, spd, 10, m.from.research || {});
                  ongoingMissions.push({
                    ...m,
                    fleet: returnFleet,
                    returning: true,
                    returnDeparture: Date.now(),
                    returnTime: Date.now() + flightTime * 1000,
                  });
                }
              }
            }

            // Track expeditions and artifacts
            if (m.type === 'expedition') {
              newState.stats = { ...newState.stats, expeditionsCompleted: (newState.stats.expeditionsCompleted || 0) + 1 };
              if (result.foundArtifact) {
                newState.stats = { ...newState.stats, artifactsFound: (newState.stats.artifactsFound || 0) + 1 };
              }
            }

            if (!m.autoRoute) {
              newState.notifications = [...(newState.notifications || []), {
                id: uid(), type: result.type, message: result.message, timestamp: Date.now(),
              }];
            }
          } else {
            ongoingMissions.push(m);
          }
        }
        newState.fleetMissions = ongoingMissions;
      }

      // Random events
      if (Math.random() < 0.008) {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        const effect = processEvent(event, newState);
        newState = effect.state;
        const currentEvents = [...(newState.events || []), { ...event, timestamp: Date.now(), effect: effect.desc }];
        newState.events = currentEvents.length > 30 ? currentEvents.slice(-30) : currentEvents;
        newState.notifications = [...(newState.notifications || []), {
          id: uid(), type: effect.type, message: `${event.icon} ${event.name}: ${effect.desc}`, timestamp: Date.now(),
        }];
      }

      // AI regeneration (slowly rebuild fleets and defenses)
      if (state.gameTick % 120 === 0 && newState.aiPlanets.length > 0) {
        // Ensure some AI blueprints exist
        const aiBPs = (newState.blueprints || []).filter(bp => bp.isAI);
        if (aiBPs.length < 5) {
          const chassisKeys = Object.keys(SHIP_CHASSIS);
          const weapons = Object.keys(SHIP_WEAPONS);
          const engines = Object.keys(SHIP_ENGINES);
          const shields = Object.keys(SHIP_SHIELDS);
          const modules = Object.keys(SHIP_MODULES);
          
          const chassis = chassisKeys[Math.floor(Math.random() * chassisKeys.length)];
          const bpId = 'ai_' + Math.random().toString(36).substring(2, 9);
          const newBP = {
            id: bpId,
            name: `Nave Prototipo ${chassis.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
            chassis,
            weapon: weapons[Math.floor(Math.random() * weapons.length)],
            engine: engines[Math.floor(Math.random() * engines.length)],
            shield: shields[Math.floor(Math.random() * shields.length)],
            modules: [modules[Math.floor(Math.random() * modules.length)]],
            isAI: true
          };
          newState.blueprints = [...(newState.blueprints || []), newBP];
        }

        newState.aiPlanets = newState.aiPlanets.map(p => {
          const regenRate = Math.max(0.5, (p.aiLevel || 1) * 0.1);
          const newFleet = { ...(p.fleet || {}) };
          for (const id of ['lightFighter', 'heavyFighter', 'cruiser', 'battleship']) {
            const current = newFleet[id] || 0;
            const target = Math.floor((p.aiLevel || 1) * 5);
            if (current < target) {
              newFleet[id] = Math.min(target, current + Math.ceil(regenRate * (1 + Math.random())));
            }
          }

          // Build custom ships (only if high level AI)
          if ((p.aiLevel || 1) >= 5) {
            const currentAIBlueprints = (newState.blueprints || []).filter(bp => bp.isAI);
            if (currentAIBlueprints.length > 0) {
              const selectedBP = currentAIBlueprints[Math.floor(Math.random() * currentAIBlueprints.length)];
              const customId = 'custom_' + selectedBP.id;
              const currentCustomCount = newFleet[customId] || 0;
              const customTarget = Math.floor((p.aiLevel || 1) * 2);
              if (currentCustomCount < customTarget) {
                newFleet[customId] = Math.min(customTarget, currentCustomCount + Math.ceil(regenRate));
              }
            }
          }

          const newDefenses = { ...(p.defenses || {}) };
          const defTarget = Math.floor((p.aiLevel || 1) * 10);
          const curDef = Object.values(newDefenses).reduce((a, b) => a + b, 0);
          if (curDef < defTarget) {
            newDefenses.rocketLauncher = (newDefenses.rocketLauncher || 0) + Math.ceil(regenRate * 2);
            newDefenses.lightLaser = (newDefenses.lightLaser || 0) + Math.ceil(regenRate);
          }
          return { ...p, fleet: newFleet, defenses: newDefenses };
        });
      }

      // ============ EMERGENT AI-AI INTERACTION SYSTEM ============
      // Every 180 ticks, process global AI-AI interactions
      if (state.gameTick > 0 && state.gameTick % 180 === 0 && state.aiPlanets.length > 1) {
        const aiList = [...state.aiPlanets];
        const updatedAIs = [...aiList];

        // Pick random pairs of AI empires to interact
        const numInteractions = Math.min(50, Math.floor(aiList.length * 0.01));
        for (let i = 0; i < numInteractions; i++) {
          const aIdx = Math.floor(Math.random() * aiList.length);
          let bIdx;
          do { bIdx = Math.floor(Math.random() * aiList.length); } while (bIdx === aIdx);
          const a = updatedAIs[aIdx];
          const b = updatedAIs[bIdx];
          if (!a || !b) continue;

          const dist = calcDistance(a, b);
          const effectiveDist = Math.max(1, dist / 1000);
          const interactionChance = Math.min(0.3, 1 / effectiveDist);

          if (Math.random() > interactionChance) continue;

          const aStrategy = AI_STRATEGIES[a.strategy] || AI_STRATEGIES.expansionist;

          const bStrategy = AI_STRATEGIES[b.strategy] || AI_STRATEGIES.expansionist;
          const aRelation = a.relation || 0;
          const bRelation = b.relation || 0;

          // Determine interaction type based on strategies and relations
          const aAggression = a.aggression || 0.5;
          const bAggression = b.aggression || 0.5;
          const avgAggression = (aAggression + bAggression) / 2;
          const relationFactor = (aRelation + bRelation) / 200; // -1 to 1

          let interactionRoll = Math.random();
          const warChance = Math.max(0, avgAggression * (1 - relationFactor) * 0.15);
          const allyChance = Math.max(0, (1 - avgAggression) * (1 + relationFactor) * 0.1);
          const tradeChance = 0.15;
          const raidChance = Math.max(0, (aAggression - 0.4) * (1 - relationFactor) * 0.1);

          if (interactionRoll < warChance) {
            // AI-AI war declaration
            if (a.aiLevel > b.aiLevel * 0.6) {
              const updatedA = { ...updatedAIs[aIdx], warsDeclared: (updatedAIs[aIdx].warsDeclared || 0) + 1, relation: Math.max(-100, (updatedAIs[aIdx].relation || 0) - 30) };
              const updatedB = { ...updatedAIs[bIdx], warsReceived: (updatedAIs[bIdx].warsReceived || 0) + 1, relation: Math.max(-100, (updatedAIs[bIdx].relation || 0) - 30) };
              updatedAIs[aIdx] = updatedA;
              updatedAIs[bIdx] = updatedB;

              // Combat simulation: determine winner
              const atkPower = updatedA.aiLevel * (1 + (updatedA.militaryLvl || 1) * 0.1);
              const defPower = updatedB.aiLevel * (1 + (updatedB.militaryLvl || 1) * 0.1);
              const totalPower = atkPower + defPower;
              const atkWinChance = atkPower / totalPower;

              if (Math.random() < atkWinChance) {
                // Attacker wins - loot and possibly conquer
                updatedAIs[aIdx] = { ...updatedA, aiLevel: updatedA.aiLevel + 1, planetsConquered: (updatedA.planetsConquered || 0) + 1, totalWins: (updatedA.totalWins || 0) + 1 };
                updatedAIs[bIdx] = { ...updatedB, aiLevel: Math.max(1, updatedB.aiLevel - 2), resources: { metal: Math.floor((updatedB.resources?.metal || 0) * 0.5), crystal: Math.floor((updatedB.resources?.crystal || 0) * 0.5), deuterium: Math.floor((updatedB.resources?.deuterium || 0) * 0.5) }, planetsLost: (updatedB.planetsLost || 0) + 1, totalLosses: (updatedB.totalLosses || 0) + 1 };
                 const ge = { id: uid(), tick: state.gameTick, type: 'war', title: `� Guerra Interestelar`, desc: `${a.empireName} ha derrotado a ${b.empireName} en batalla.`, timestamp: Date.now() };
                newState.galacticEvents = [...(newState.galacticEvents || []), ge].slice(-200);
              } else {
                updatedAIs[aIdx] = { ...updatedA, totalLosses: (updatedA.totalLosses || 0) + 1 };
                updatedAIs[bIdx] = { ...updatedB, totalWins: (updatedB.totalWins || 0) + 1 };
                 const ge = { id: uid(), tick: state.gameTick, type: 'war', title: `=� Defensa Exitosa`, desc: `${b.empireName} ha repelido el ataque de ${a.empireName}.`, timestamp: Date.now() };
                newState.galacticEvents = [...(newState.galacticEvents || []), ge].slice(-200);
              }
            }
          } else if (interactionRoll < warChance + allyChance) {
            // Alliance formation
            const relationBoost = 15 + Math.floor(Math.random() * 20);
            updatedAIs[aIdx] = { ...updatedAIs[aIdx], relation: Math.min(100, (updatedAIs[aIdx].relation || 0) + relationBoost) };
            updatedAIs[bIdx] = { ...updatedAIs[bIdx], relation: Math.min(100, (updatedAIs[bIdx].relation || 0) + relationBoost) };
          } else if (interactionRoll < warChance + allyChance + tradeChance) {
            // Trade route established
            if (!updatedAIs[aIdx].tradeRoutes) updatedAIs[aIdx].tradeRoutes = [];
            if (!updatedAIs[bIdx].tradeRoutes) updatedAIs[bIdx].tradeRoutes = [];
            if (updatedAIs[aIdx].tradeRoutes.length < 5) {
              updatedAIs[aIdx].tradeRoutes.push({ partnerId: b.id, established: Date.now(), volume: Math.floor(500 + Math.random() * 2000) });
            }
            if (updatedAIs[bIdx].tradeRoutes.length < 5) {
              updatedAIs[bIdx].tradeRoutes.push({ partnerId: a.id, established: Date.now(), volume: Math.floor(500 + Math.random() * 2000) });
            }
          } else if (interactionRoll < warChance + allyChance + tradeChance + raidChance) {
            // Raid - attacker gets small loot
            if (a.aiLevel > b.aiLevel * 0.7) {
              const loot = { metal: Math.floor(200 + Math.random() * 800) * a.aiLevel, crystal: Math.floor(100 + Math.random() * 400) * a.aiLevel };
              updatedAIs[aIdx] = { ...updatedAIs[aIdx], resources: { metal: (updatedAIs[aIdx].resources?.metal || 0) + loot.metal, crystal: (updatedAIs[aIdx].resources?.crystal || 0) + loot.crystal, deuterium: (updatedAIs[aIdx].resources?.deuterium || 0) } };
              updatedAIs[bIdx] = { ...updatedAIs[bIdx], resources: { metal: Math.max(0, (updatedAIs[bIdx].resources?.metal || 0) - loot.metal), crystal: Math.max(0, (updatedAIs[bIdx].resources?.crystal || 0) - loot.crystal), deuterium: (updatedAIs[bIdx].resources?.deuterium || 0) } };
              updatedAIs[aIdx] = { ...updatedAIs[aIdx], relation: Math.max(-100, (updatedAIs[aIdx].relation || 0) - 10) };
              updatedAIs[bIdx] = { ...updatedAIs[bIdx], relation: Math.max(-100, (updatedAIs[bIdx].relation || 0) - 15) };
            }
          }
        }
        newState.aiPlanets = updatedAIs;
      }

      // ============ FEDERATION MEMBER JOINING ============
      // Every 180 ticks, check if allies want to join the player's federation(s)
      if (state.gameTick > 0 && state.gameTick % 180 === 0 && newState.federations && newState.federations.length > 0) {
        newState.federations = newState.federations.map(fed => {
          if (fed.members.includes('player')) {
            const potentialJoins = newState.aiPlanets.filter(ai => (ai.relation || 0) >= 60 && !fed.members.includes(ai.id));
            let newMembers = [...fed.members];
            let joinedNames = [];
            potentialJoins.forEach(ai => {
              if (Math.random() < 0.25) { // 25% chance of joining when relation is >= 60
                newMembers.push(ai.id);
                joinedNames.push(ai.empireName || ai.name);
              }
            });
            if (joinedNames.length > 0) {
              newState.notifications = [...(newState.notifications || []), {
                id: uid(),
                type: 'success',
                message: `🤝 ${joinedNames.join(', ')} se ha(n) unido a tu alianza/ejército mutuo: "${fed.name}"!`,
                timestamp: Date.now()
              }];
              return { ...fed, members: newMembers };
            }
          }
          return fed;
        });
      }

      // ============ AI STRATEGY EVOLUTION ============
      // Every 300 ticks, AIs may change strategy based on performance
      if (state.gameTick > 0 && state.gameTick % 300 === 0) {
        newState.aiPlanets = newState.aiPlanets.map(p => {
          const ratio = ((p.totalWins || 0) + 1) / ((p.totalLosses || 0) + 1);
          const stability = p.factionStability || 0.7;
          let newStrategy = p.strategy;

          if (ratio > 2 && stability > 0.6) {
            // Winning a lot: may become more aggressive or expansionist
            if (Math.random() < 0.2) newStrategy = Math.random() < 0.5 ? 'expansionist' : 'militarist';
          } else if (ratio < 0.5) {
            // Losing a lot: may become defensive or diplomatic
            if (Math.random() < 0.25) newStrategy = Math.random() < 0.5 ? 'diplomat' : 'merchant';
          } else if (stability < 0.3) {
            // Low stability: may become chaotic
            if (Math.random() < 0.3) newStrategy = 'chaotic';
          }

          // Update parameters based on experience
          return {
            ...p,
            strategy: newStrategy,
            aggression: Math.max(0.1, Math.min(0.9, p.aggression + (ratio > 1 ? 0.01 : -0.01))),
            factionStability: Math.max(0.1, Math.min(1, stability + (ratio > 1 ? 0.005 : -0.005))),
            lossTolerance: Math.max(0.1, Math.min(0.9, p.lossTolerance + (ratio > 1 ? 0.005 : -0.01))),
          };
        });
      }

      // Clan system removed (audit cleanup).
      // The simulation logic was disabled (produced no UI, cost CPU every 600 ticks, bloated saves).
      // State field `clans: []` and migration are kept for backward compatibility with old saves.
      // If clans are ever revived, re-add the structures + logic.

      // ============ ECONOMIC SANCTIONS & BLOCKADES ============
      // Every 400 ticks, check for trade route disruptions
      if (state.gameTick > 0 && state.gameTick % 400 === 0) {
        newState.aiPlanets = newState.aiPlanets.map(p => {
          const routes = p.tradeRoutes || [];
          if (routes.length === 0) return p;
          const disrupted = routes.filter(r => {
            const partner = newState.aiPlanets.find(ai => ai.id === r.partnerId);
            return !partner || (partner.relation || 0) < -30;
          });
          const activeRoutes = routes.filter(r => !disrupted.some(d => d.partnerId === r.partnerId));
          return { ...p, tradeRoutes: activeRoutes };
        });
      }

      // ============ AUTO-TRADE ROUTES BETWEEN COLONIES ============
      // Autogestión: cada 1 tick
      if (newState.gameTick > 0) {
        const capital = newState.planets.find(pl => pl.isHome);
        if (capital) {
          newState.planets = newState.planets.map(colony => {
            if (colony.isHome || !colony.autoTrade) return colony;

            const storage = calcStorage(colony.buildings);
            const excess = {
              metal: Math.max(0, colony.resources.metal - storage.metal * 0.75),
              crystal: Math.max(0, colony.resources.crystal - storage.crystal * 0.75),
              deuterium: Math.max(0, colony.resources.deuterium - storage.deuterium * 0.75),
            };
            const totalExcess = excess.metal + excess.crystal + excess.deuterium;
            if (totalExcess <= 5000) return colony; // too small to send

            // Check cargo ships
            const smallCargos = colony.fleet?.smallCargo || 0;
            const largeCargos = colony.fleet?.largeCargo || 0;
            if (smallCargos === 0 && largeCargos === 0) return colony;

            // Determine cargo multiplier (if commercial specialization is active)
            const isCommercial = colony.specialization === 'commercial';
            const cargoMult = isCommercial ? 1.5 : 1.0;
            
            // Calculate how much we can carry
            const smallCap = 5000 * cargoMult;
            const largeCap = 25000 * cargoMult;
            
            let metalToSend = 0;
            let crystalToSend = 0;
            let deutToSend = 0;
            let smallUsed = 0;
            let largeUsed = 0;

            let totalCapAvailable = largeCargos * largeCap + smallCargos * smallCap;
            if (totalCapAvailable === 0) return colony;

            let carryAmount = Math.min(totalExcess, totalCapAvailable);
            
            const ratio = carryAmount / totalExcess;
            metalToSend = Math.floor(excess.metal * ratio);
            crystalToSend = Math.floor(excess.crystal * ratio);
            deutToSend = Math.floor(excess.deuterium * ratio);

            let remainingCargoNeeded = carryAmount;
            
            const largeNeeded = Math.min(largeCargos, Math.ceil(remainingCargoNeeded / largeCap));
            largeUsed = largeNeeded;
            remainingCargoNeeded -= largeUsed * largeCap;

            if (remainingCargoNeeded > 0) {
              const smallNeeded = Math.min(smallCargos, Math.ceil(remainingCargoNeeded / smallCap));
              smallUsed = smallNeeded;
            }

            const dispatchedFleet = {};
            if (largeUsed > 0) dispatchedFleet.largeCargo = largeUsed;
            if (smallUsed > 0) dispatchedFleet.smallCargo = smallUsed;

            const updatedColony = {
              ...colony,
              resources: {
                metal: Math.max(0, colony.resources.metal - metalToSend),
                crystal: Math.max(0, colony.resources.crystal - crystalToSend),
                deuterium: Math.max(0, colony.resources.deuterium - deutToSend),
              },
              fleet: {
                ...colony.fleet,
                smallCargo: Math.max(0, (colony.fleet.smallCargo || 0) - smallUsed),
                largeCargo: Math.max(0, (colony.fleet.largeCargo || 0) - largeUsed),
              }
            };
            if (updatedColony.fleet.smallCargo === 0) delete updatedColony.fleet.smallCargo;
            if (updatedColony.fleet.largeCargo === 0) delete updatedColony.fleet.largeCargo;

            // Dispatch transport mission
            const dist = calcDistance(colony, capital);
            const playerFaction = colony.faction || 'human';
            const spd = fleetSpeed(dispatchedFleet, newState.research, playerFaction);
            const flightTime = calcFlightTime(dist, spd, 10, newState.research);
            const arrivalTime = Date.now() + flightTime * 1000;
            const returnTime = arrivalTime + flightTime * 1000;

            newState.fleetMissions = [...(newState.fleetMissions || []), {
              id: uid(),
              type: 'transport',
              from: { id: colony.id, name: colony.name, galaxy: colony.galaxy, system: colony.system, position: colony.position, specialization: colony.specialization },
              to: { id: capital.id, name: capital.name, galaxy: capital.galaxy, system: capital.system, position: capital.position },
              fleet: dispatchedFleet,
              resources: { metal: metalToSend, crystal: crystalToSend, deuterium: deutToSend },
              fuel: 0,
              departure: Date.now(),
              arrivalTime,
              returnTime,
              isAI: false,
              autoRoute: true
            }];

            newState.notifications = [...(newState.notifications || []), {
              id: uid(),
              type: 'info',
              message: `🚚 Auto-Ruta: Despegó convoy desde ${colony.name} hacia capital llevando ${fmt(metalToSend)}M, ${fmt(crystalToSend)}C, ${fmt(deutToSend)}D`,
              timestamp: Date.now()
            }];
            return updatedColony;
          });
        }
      }
      // ============ AUTO-RESEARCH SYSTEM ============
      for (const cp of newState.planets) {
        const cpScience = cp.ministries?.science || newState.ministries?.science;
        if (!cpScience?.automationEnabled) continue;

        const isAlreadyResearchingType = (rId) => (newState.researchQueue || []).some(q => q.researchId === rId);
        let cheapestResearch = null;
        let lowestCostValue = Infinity;
        
        for (const [id, r] of Object.entries(RESEARCH)) {
          if (isAlreadyResearchingType(id)) continue;
          
          const currentLvl = newState.research[id] || 0;
          const cost = researchCost(id, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
          const costSum = (cost.metal || 0) + (cost.crystal || 0) * 1.5 + (cost.deuterium || 0) * 3;
          if (costSum < lowestCostValue && canAfford(cp.resources, cost) && meetsReq(r.req, { ...cp.buildings, ...newState.research })) {
            cheapestResearch = id;
            lowestCostValue = costSum;
          }
        }
        
        if (cheapestResearch) {
          const currentLvl = newState.research[cheapestResearch] || 0;
          const targetLvl = currentLvl + 1;
          const cost = researchCost(cheapestResearch, currentLvl, newState.research?.aiStrategy || 0, cp.buildings?.constructionCenter || 0);
          const newRes = clampResources(deduct(cp.resources, cost));
          newState.planets = newState.planets.map(p => p.id === cp.id ? { ...p, resources: newRes } : p);
          
          const speedBonus = researchTimeBonus(cp.buildings, newState.research);
          const totalSpeedMultiplier = (1 + speedBonus) * (1 + (cpScience?.researchGrants || 0.05));
          const researchTimeVal = calcResearchTime(cost, cp.buildings?.researchLab || 0, GAME_SPEED, totalSpeedMultiplier, newState.research);
          
          const startTime = Date.now();
          const endTime = startTime + researchTimeVal * 1000;
          
          newState.researchQueue = [...(newState.researchQueue || []), {
            id: uid(),
            planetId: cp.id,
            researchId: cheapestResearch,
            startTime,
            endTime,
            level: targetLvl,
            auto: true
          }];
        }
      }

      // ============ AUTO-BUILD SYSTEM FOR PLANETS ============
      // Autogestión activa por planeta → construye cada tick si la autogestión local o global de infra/ciencia está activa.
      newState.planets = newState.planets.map(planet => {
        const pInfra = planet.ministries?.infra || newState.ministries?.infra;
        const pScience = planet.ministries?.science || newState.ministries?.science;
        const isAutoManageActive = pInfra?.automationEnabled || pScience?.directives?.dir_ai_trust;
        if (!isAutoManageActive) return planet;

        const isAlreadyBuildingType = (bId) => newState.buildQueue.some(q => q.planetId === planet.id && q.buildingId === bId);

        const prod = prodCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
        const storage = storageCache.get(planet.id) || { metal: 0, crystal: 0, deuterium: 0 };
        const buildings = planet.buildings || {};
        const currentPop = planet.population || 1000;

        let didQueue = false;

        const candidates = [];
        
        // 1. PRIORIDAD ABSOLUTA ENERGÉTICA: Evitar siempre quedarse con energía en negativo.
        const currentEnergyBalance = prod.energyBalance || 0;
        const energyNeed = currentEnergyBalance < 20;
        const solarLevel = buildings.solarPlant || 0;
        // A partir de Nv.10 de Planta Solar, no se prioriza construir más plantas solares:
        // la autogestión se centra en Reactor de Fusión (desbloqueado en solar 10) y, si el
        // margen energético es sano, se enfoca en otras construcciones (minas, infraestructura).
        const useFusionFirst = solarLevel >= 10;

        if (energyNeed) {
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
        
        // 2. Storage near full
        if (planet.resources.metal > storage.metal * 0.85 && !isAlreadyBuildingType('metalStorage')) candidates.push('metalStorage');
        if (planet.resources.crystal > storage.crystal * 0.85 && !isAlreadyBuildingType('crystalStorage')) candidates.push('crystalStorage');
        if (planet.resources.deuterium > storage.deuterium * 0.85 && !isAlreadyBuildingType('deutStorage')) candidates.push('deutStorage');
        
        // 3. Facilities
        const rFactory = buildings.robotFactory || 0;
        const mMine = buildings.metalMine || 0;
        const cMine = buildings.crystalMine || 0;
        const dSynth = buildings.deutSynth || 0;
        const rLab = buildings.researchLab || 0;
        
        if (rFactory < 15 && rFactory < Math.floor(mMine / 2.5) + 1 && !isAlreadyBuildingType('robotFactory')) candidates.push('robotFactory');
        if (rLab < 12 && rLab < Math.floor(cMine / 2) && !isAlreadyBuildingType('researchLab')) candidates.push('researchLab');
        
        // Dynamic mines
        if (!energyNeed || currentEnergyBalance >= 10) {
          if (mMine <= cMine + 3 && !isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
          if (cMine <= dSynth + 2 && !isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
          if (dSynth <= cMine - 2 && !isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
        }
        
        // Fallback seguro de minas únicamente si el margen energético no es negativo
        if (currentEnergyBalance >= 5) {
          if (!isAlreadyBuildingType('metalMine')) candidates.push('metalMine');
          if (!isAlreadyBuildingType('crystalMine')) candidates.push('crystalMine');
          if (!isAlreadyBuildingType('deutSynth')) candidates.push('deutSynth');
        }

        // Try candidates
        for (const bId of candidates) {
          if (didQueue) break;
          const currentLvl = buildings[bId] || 0;
          const targetLvl = currentLvl + 1;
          const requiredPopulation = Math.max(0, Math.floor(targetLvl * 20));
          
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
              return {
                ...planet,
                resources: newRes
              };
            }
          }
        }

        // GARANTÍA FINAL DE ENERGÍA / INFRAESTRUCTURA
        if (!didQueue) {
          // Con solar ya en Nv.10+, la garantía de energía se cubre con fusión/orbital,
          // nunca con más plantas solares (ilógico seguir subiéndolas con energía sobrada).
          const forceOrder = currentEnergyBalance < 10
            ? (solarLevel >= 10
              ? ['fusionReactor', 'geoPlant', 'orbitalEnergy', 'metalMine', 'crystalMine', 'deutSynth']
              : ['solarPlant', 'fusionReactor', 'geoPlant', 'metalMine', 'crystalMine', 'deutSynth'])
            : (solarLevel >= 10
              ? ['metalMine', 'crystalMine', 'deutSynth', 'fusionReactor', 'geoPlant', 'orbitalEnergy']
              : ['metalMine', 'crystalMine', 'deutSynth', 'solarPlant', 'fusionReactor']);
          for (const bId of forceOrder) {
            if (isAlreadyBuildingType(bId)) continue;
            const currentLvl = buildings[bId] || 0;
            const targetLvl = currentLvl + 1;
            const requiredPopulation = Math.max(0, Math.floor(targetLvl * 15));
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

      // ============ AUTO-ECONOMY SYSTEM ============
      newState.planets = newState.planets.map(planet => {
        const pEco = planet.ministries?.economy || newState.ministries?.economy;
        if (!pEco?.automationEnabled) return planet;

        const cost = { metal: 20000, crystal: 10000, deuterium: 5000 };
        if (canAfford(planet.resources, cost)) {
          const currentBusinesses = planet.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
          let businessType = 'lowClass';
          if ((currentBusinesses.lowClass || 0) > (currentBusinesses.midClass || 0) * 2) {
            businessType = 'midClass';
          }
          if ((currentBusinesses.midClass || 0) > (currentBusinesses.highClass || 0) * 2) {
            businessType = 'highClass';
          }
          
          const nextBusinesses = {
            ...currentBusinesses,
            [businessType]: (currentBusinesses[businessType] || 0) + 1
          };
          
          return {
            ...planet,
            resources: deduct(planet.resources, cost),
            civilBusinesses: nextBusinesses
          };
        }
        return planet;
      });

      // ============ AUTO-DEFENSE SYSTEM ============
      newState.planets = newState.planets.map(planet => {
        const pDef = planet.ministries?.defense || newState.ministries?.defense;
        if (!pDef?.automationEnabled) return planet;

        const isAlreadyDefendingType = (dId) => newState.defenseQueue && newState.defenseQueue.some(q => q.planetId === planet.id && q.defenseId === dId);
        if (isAlreadyDefendingType('rocketLauncher')) return planet;

        const defenseId = 'rocketLauncher';
        const cost = defenseCost(defenseId, 1, planet.buildings?.constructionCenter || 0);
        if (canAfford(planet.resources, cost) && meetsReq(DEFENSES[defenseId].req, { ...planet.buildings, ...newState.research })) {
          const newRes = clampResources(deduct(planet.resources, cost));
          const defenseTimeVal = calcDefenseTime(defenseId, 1, planet.buildings?.shipyard || 0, planet.buildings?.naniteFactory || 0, GAME_SPEED);
          const startTime = Date.now();
          const endTime = startTime + defenseTimeVal * 1000;

          newState.defenseQueue = [...(newState.defenseQueue || []), {
            id: uid(),
            planetId: planet.id,
            defenseId,
            quantity: 1,
            startTime,
            endTime,
            auto: true
          }];

          return {
            ...planet,
            resources: newRes
          };
        }
        return planet;
      });

      // Treaties ticks and forced trade decrement
      if (newState.aiPlanets && newState.aiPlanets.length > 0) {
        let deuteriumDeduction = 0;
        let crystalAddition = 0;
        let triggeredTrades = [];

        newState.aiPlanets = newState.aiPlanets.map(p => {
          let updated = { ...p };
          
          if (updated.pna && updated.pnaTicks > 0) {
            updated.pnaTicks -= 1;
            if (updated.pnaTicks === 0) {
              updated.pna = false;
              newState.notifications = [...(newState.notifications || []), {
                id: uid(),
                type: 'warning',
                message: `📜 El Pacto de No Agresión con ${updated.name} ha expirado.`,
                timestamp: Date.now()
              }];
            }
          }
          
          if (updated.alliance && updated.allianceTicks > 0) {
            updated.allianceTicks -= 1;
            if (updated.allianceTicks === 0) {
              updated.alliance = false;
              newState.notifications = [...(newState.notifications || []), {
                id: uid(),
                type: 'warning',
                message: `📜 La Alianza Militar con ${updated.name} ha expirado.`,
                timestamp: Date.now()
              }];
            }
          }

          if (updated.trade && updated.tradeTicks > 0) {
            updated.tradeTicks -= 1;
            
            // Increment relation slightly over time during active trade
            updated.relation = Math.min(100, (updated.relation || 0) + 0.1);

            // Automatic resource exchange every 30 ticks
            if (updated.tradeTicks % 30 === 0) {
              triggeredTrades.push(updated.name);
              deuteriumDeduction += 1000;
              crystalAddition += 2000;
            }

            if (updated.tradeTicks === 0) {
              updated.trade = false;
              newState.notifications = [...(newState.notifications || []), {
                id: uid(),
                type: 'warning',
                message: `📜 El Acuerdo de Comercio Forzado con ${updated.name} ha expirado.`,
                timestamp: Date.now()
              }];
            }
          }

          return updated;
        });

        // Apply any triggered forced trades
        if (triggeredTrades.length > 0) {
          const cp = newState.planets.find(pl => pl.id === newState.currentPlanetId);
          if (cp && cp.resources.deuterium >= deuteriumDeduction) {
            newState = updatePlanet(newState, cp.id, playerPlanet => ({
              ...playerPlanet,
              resources: {
                ...playerPlanet.resources,
                deuterium: playerPlanet.resources.deuterium - deuteriumDeduction,
                crystal: playerPlanet.resources.crystal + crystalAddition
              }
            }));
            triggeredTrades.forEach(name => {
              newState.notifications = [...(newState.notifications || []), {
                id: uid(),
                type: 'success',
                message: `🔄 Intercambio de Comercio Forzado con ${name}: -1,000 Deuterio ➔ +2,000 Cristal`,
                timestamp: Date.now()
              }];
            });
          }
        }
      }

      // AI actions (dynamic diplomacy-based behaviors)
      // Proactive Event Dispatcher completely pruned (audit cleanup).
      // Large block of personality-based event definitions + logic removed because:
      // - Feature was never finished (no resolution UI in App.jsx).
      // - Trigger was disabled to prevent orphaned `activeEvent` in player state.
      // State field `activeEvent` + CLEAR/RESOLVE actions kept for save compatibility.
      // If revived: re-implement the generator + full modal in App.
      const ENABLE_PROACTIVE_EVENTS = false;
      if (ENABLE_PROACTIVE_EVENTS && newState.gameTick > 0 && newState.gameTick % 60 === 0 && newState.aiPlanets.length > 0 && !newState.activeEvent) {
        // (pruned - see comment above)
      }

      // === NEW: Periodic Galactic Council (Assemblies + AI Voting Logic) ===
      if (newState.gameTick % 400 === 0 && (newState.aiPlanets || []).length >= 3) {
        const council = newState.galacticCouncil || { resolutionsPassed: [], influenceHistory: [] };
        const session = council.currentSession || { id: uid(), tick: newState.gameTick, proposals: [], votes: {} };

        // AI generates proposals
        if (Math.random() < 0.6 && (session.proposals || []).length < 2) {
          const ai = newState.aiPlanets[Math.floor(Math.random() * newState.aiPlanets.length)];
          session.proposals = [...(session.proposals || []), {
            id: uid(), title: `Propuesta de ${ai.name}`, effect: { type: 'DIPLOMATIC_BOOST' }, proposer: ai.id
          }];
        }

        // AI voting (based on relation + strategy for intrigue)
        (newState.aiPlanets || []).forEach(ai => {
          (session.proposals || []).forEach(p => {
            if (!session.votes[p.id]) session.votes[p.id] = {};
            const rel = ai.relation || 0;
            const vote = rel > 10 ? 'yes' : (rel < -20 ? 'no' : 'abstain');
            session.votes[p.id][ai.id] = vote;
          });
        });

        // Tally and apply simple effects
        (session.proposals || []).forEach(p => {
          const v = session.votes[p.id] || {};
          const yesCount = Object.values(v).filter(x => x === 'yes').length;
          if (yesCount > (Object.keys(v).length / 2)) {
            newState.influence = (newState.influence || 0) + 10;
            newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'success', message: `🌌 Dictamen del Consejo aprobado: ${p.title}`, timestamp: Date.now() }];
            (newState.galacticCouncil.resolutionsPassed || []).push(p);
          }
        });

        newState.galacticCouncil = { ...council, lastSessionTick: newState.gameTick, currentSession: null, influenceHistory: [...(council.influenceHistory || []), { tick: newState.gameTick, val: newState.influence }] };
      }

      // Expand crises: spawn new narrative crises periodically if diplomacy advanced
      if ((newState.research?.diplomacy || 0) >= 2 && newState.gameTick % 250 === 0 && Math.random() < 0.5 && (newState.activeCrises || []).length < 2) {
        const crisisTypes = [
          { title: 'Crisis de Recursos', desc: 'Escasez afecta producción.', options: [ {text: 'Compartir recursos (-influencia)', effect:{influence:-15}}, {text: 'Ignorar (pérdida de relación)', effect:{rel:-10}} ] },
          { title: 'Rebelión en Colonia IA', desc: 'Una IA menor se rebela.', options: [ {text: 'Sofocar (gasta flota)', effect:{shipsLoss: true}}, {text: 'Negociar (gana influencia)', effect:{influence:+10}} ] },
          { title: 'Embargo Comercial', desc: 'Bloqueo en rutas.', options: [ {text: 'Romper embargo (-rel con todos)', effect:{relAll:-5}}, {text: 'Negociar paz', effect:{influence:+5}} ] }
        ];
        const c = crisisTypes[Math.floor(Math.random()*crisisTypes.length)];
        newState.activeCrises = [...(newState.activeCrises || []), {
          id: uid(),
          title: c.title,
          description: c.desc,
          options: c.options,
          aiInvolved: []
        }];
        newState.notifications = [...(newState.notifications || []), { id: uid(), type: 'warn', message: `⚠️ Nueva crisis: ${c.title}`, timestamp: Date.now() }];
      }
      // AI actions (dynamic diplomacy-based behaviors)
      // Smarter AI: research priority based on strategy (balanced rate to avoid runaway power)
      newState.aiPlanets = (newState.aiPlanets || []).map(ai => {
        const newAi = { ...ai, research: { ...(ai.research || {}) }, fleet: { ...(ai.fleet || {}) } };
        const strat = AI_STRATEGIES[ai.strategy] || {};
        const aiLvl = ai.aiLevel || 1;
        if (strat.weight?.mil > 0.4 && Math.random() < 0.02 * aiLvl) {
          newAi.research.weapons = (newAi.research.weapons || 0) + 1;
        } else if (strat.weight?.eco > 0.4 && Math.random() < 0.02 * aiLvl) {
          newAi.research.plasma = (newAi.research.plasma || 0) + 1;
        } else if (strat.weight?.tech > 0.4 && Math.random() < 0.02 * aiLvl) {
          newAi.research.computer = (newAi.research.computer || 0) + 1;
        }
        // proactive expansion for expansionist (rarer, level gated)
        if (strat.name === 'Expansionista' && Math.random() < 0.005 * aiLvl && newState.planets.length < 25) {
          newAi.fleet.colonizer = (newAi.fleet.colonizer || 0) + 1;
        }
        return newAi;
      });

      if (Math.random() < 0.007 && state.aiPlanets.length > 0) {
        const aiSource = state.aiPlanets[Math.floor(Math.random() * state.aiPlanets.length)];
        const target = newState.planets[Math.floor(Math.random() * newState.planets.length)];
        if (aiSource && target) {
          const rel = aiSource.relation || 0;
          
          if (rel >= 50 && Math.random() < 0.4) {
            // Allied trade mission: AI sends cargo carrying resources as a gift
            const gift = {
              metal: Math.floor((aiSource.aiLevel || 1) * 8000),
              crystal: Math.floor((aiSource.aiLevel || 1) * 4000),
              deuterium: Math.floor((aiSource.aiLevel || 1) * 2000),
            };
            const dist = calcDistance(aiSource, target);
            const arrivalTime = Date.now() + calcFlightTime(dist, 8000, 10, aiSource.research || {}) * 1000;
            newState.fleetMissions = [...(newState.fleetMissions || []), {
              id: uid(), type: 'ally_trade', from: aiSource, to: target, fleet: { largeCargo: 2 }, resources: gift,
              departure: Date.now(), arrivalTime, isAI: true,
            }];
            newState.notifications = [...(newState.notifications || []), {
              id: uid(), type: 'success', message: `🤝 El Imperio aliado ${aiSource.empireName || aiSource.name} ha despachado una flota comercial con cargamentos de regalo hacia ${target.name}`, timestamp: Date.now(),
            }];
          } else if (rel <= -30 || (rel < 50 && Math.random() < 0.15)) {
            // Hostile or neutral attack mission (allies never attack!)
            if (aiSource.fleet && Object.values(aiSource.fleet).some(v => v > 10)) {
              const fleetToSend = {};
              for (const [id, qty] of Object.entries(aiSource.fleet)) {
                fleetToSend[id] = Math.floor(qty * 0.5);
              }
              if (Object.values(fleetToSend).some(v => v > 0)) {
                const dist = calcDistance(aiSource, target);
                const spd = fleetSpeed(fleetToSend, aiSource.research || {}, aiSource.faction || 'human');
                if (spd > 0) {
                  const arrivalTime = Date.now() + calcFlightTime(dist, spd, 5, aiSource.research || {}) * 1000;
                  newState.fleetMissions = [...(newState.fleetMissions || []), {
                    id: uid(), type: 'attack', from: aiSource, to: target, fleet: fleetToSend,
                    departure: Date.now(), arrivalTime, isAI: true,
                  }];
                  // Attack degrades relation
                  newState.aiPlanets = newState.aiPlanets.map(p => p.id === aiSource.id ? { ...p, relation: Math.max(-100, (p.relation || 0) - 15) } : p);
                  newState.notifications = [...(newState.notifications || []), {
                    id: uid(), type: 'warning', message: `� Flota hostil detectada despegando desde ${aiSource.empireName || aiSource.name} [${aiSource.galaxy}:${aiSource.system}:${aiSource.position}]`, timestamp: Date.now(),
                  }];
                  // Deduct sent fleet from AI planet
                  newState.aiPlanets = newState.aiPlanets.map(p => {
                    if (p.id === aiSource.id) {
                      const newFleet = { ...p.fleet };
                      for (const [id, qty] of Object.entries(fleetToSend)) {
                        newFleet[id] = Math.max(0, (newFleet[id] || 0) - qty);
                        if (newFleet[id] <= 0) delete newFleet[id];
                      }
                      return { ...p, fleet: newFleet };
                    }
                    return p;
                  });
                }
              }
            }
          }
        }
      }

      // Auto-expire notifications with deadlines
      newState.notifications = (newState.notifications || []).map(n => {
        if (n.expiresAt && Date.now() > n.expiresAt) {
          return { ...n, expired: true, read: true };
        }
        return n;
      });

      // Check achievements
      newState = checkAchievements(newState);

      // Check missions
      newState = checkMissions(newState);

      // --- FIRST CONTACT TRIGGER LOOP ---
      const undiscoveredAIs = (newState.aiPlanets || []).filter(p => !p.discovered);
      if (!newState.activeFirstContact && !newState.activeEvent && !newState.activeTransmission && undiscoveredAIs.length > 0) {
        const hasDiploCenter = newState.planets.some(p => (p.buildings?.diploCenter || 0) >= 1);
        const hasResearchLab = newState.planets.some(p => (p.buildings?.researchLab || 0) >= 1);
        
        let shouldTrigger = false;
        if (newState.gameTick === 10) {
          shouldTrigger = true;
        } else if (newState.gameTick % 120 === 0) {
          let chance = 0.15;
          if (hasResearchLab) chance += 0.10;
          if (hasDiploCenter) chance += 0.25;
          if (Math.random() < chance) {
            shouldTrigger = true;
          }
        }
        
        if (shouldTrigger) {
          const targetAI = undiscoveredAIs[Math.floor(Math.random() * undiscoveredAIs.length)];
          newState.activeFirstContact = {
            id: targetAI.id,
            faction: targetAI.faction,
            empireName: targetAI.empireName,
            name: targetAI.name,
            aiType: targetAI.aiType,
          };
        }
      }
      // --- PROACTIVE TRANSMISSION TRIGGER LOOP ---
      if (!newState.activeFirstContact && !newState.activeTransmission && !newState.activeEvent && newState.gameTick > 30 && newState.gameTick % 80 === 0) {
        const discoveredAIs = (newState.aiPlanets || []).filter(p => p.discovered);
        if (discoveredAIs.length > 0) {
          const homePlanet = newState.planets[0];
          const storage = calcStorage(homePlanet.buildings);
          const resources = homePlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };

          const metalFull = resources.metal > storage.metal * 0.95;
          const crystalFull = resources.crystal > storage.crystal * 0.95;
          
          if ((metalFull || crystalFull) && Math.random() < 0.4) {
            const aiMerchant = discoveredAIs.find(ai => ai.strategy === 'merchant' || ai.aiPersonality === 'mercantilista') || discoveredAIs[0];
            newState.activeTransmission = {
              id: uid(),
              type: 'excess_resources',
              aiId: aiMerchant.id,
              faction: aiMerchant.faction,
              name: aiMerchant.name,
              message: `Saludos, Comandante. Nuestros escáneres mercantiles detectan que tus depósitos de ${metalFull ? 'Metal' : 'Cristal'} en ${homePlanet.name} están a rebosar. Te proponemos comprar tu excedente: te damos 40 puntos de Influencia a cambio de ${metalFull ? '25K Metal' : '15K Cristal'}. ¿Trato hecho?`,
              options: [
                {
                  text: `✅ Vender excedente (Obtener +40 Influencia)`,
                  action: {
                    type: 'DIPLOMACY_TRADE_EXCESS',
                    payload: {
                      aiId: aiMerchant.id,
                      resource: metalFull ? 'metal' : 'crystal',
                      qty: metalFull ? 25000 : 15000,
                      influenceReward: 40
                    }
                  }
                },
                {
                  text: '❌ Rechazar propuesta comercial.',
                  action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
                }
              ]
            };
          } else {
            const playerShips = homePlanet.fleet || {};
            const getScore = (f) => (f.lightFighter || 0) * 1 + (f.cruiser || 0) * 4 + (f.battleship || 0) * 15 + (f.destroyer || 0) * 40;
            const pScore = getScore(playerShips);
            
            const aiHostile = discoveredAIs.find(ai => (ai.strategy === 'militarist' || ai.strategy === 'expansionist' || ai.aiPersonality === 'bélico') && (ai.relation || 0) < 0);
            if (aiHostile && pScore < 10 && Math.random() < 0.3) {
              newState.activeTransmission = {
                id: uid(),
                type: 'militaristic_threat',
                aiId: aiHostile.id,
                faction: aiHostile.faction,
                name: aiHostile.name,
                message: `¡Humano! Tus débiles defensas planetarias y la ausencia de una flota en condiciones son una ofensa a nuestra soberanía. Exigimos un tributo de 10K Metal y 5K Cristal para garantizar tu seguridad en el sector. ¿Vas a pagar o prefieres conocer la ira de nuestras flotas?`,
                options: [
                  {
                    text: `💰 Pagar Tributo (-10K Metal, -5K Cristal)`,
                    action: {
                      type: 'DIPLOMACY_PAY_TRIBUTO_THREAT',
                      payload: {
                        aiId: aiHostile.id,
                        cost: { metal: 10000, crystal: 5000 }
                      }
                    }
                  },
                  {
                    text: '⚔️ Desafiar su ultimátum y prepararse.',
                    action: {
                      type: 'DIPLOMACY_REJECT_TRIBUTO_THREAT',
                      payload: {
                        aiId: aiHostile.id
                      }
                    }
                  }
                ]
              };
            }
          }
        }
      }

      newState = checkAchievements(newState);
      newState = checkMissions(newState);
      return newState;
    }

    default:
      return state;
  }
};

