import {
  SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES,
  AI_STRATEGIES, uid, calcDistance, calcFlightTime, fleetSpeed,
  RESEARCH, canAfford, deduct, clampResources, GAME_SPEED
} from '../../../core.jsx';
import { BUILDINGS } from '../../../data/catalog/index.js';
import { buildingCost } from '../../../utils/formulas/costFormulas.js';
import { calcProduction, calcStorage } from '../../../utils/formulas/productionFormulas.js';
import { rankResearch, AI_STRATEGY_CATEGORY_WEIGHTS } from './researchScoring.js';
import { ensureFactionProfile, recordFactionMemory, updateIntelLedger } from './factionProfileManager.js';
import { evaluateContextualRoll, calculateWarTension } from './contextualRng.js';
import { fallbackStrategicDirector, consultStrategicDirector, recalibrateDirectiveOnEvents } from './strategicAIDirector.js';
import { processEmergentChains } from './emergentEventEngine.js';
import { processInternalEvents } from './internalEventEngine.js';

/**
 * Orden y prioridades de construcción base.
 * La directiva estratégica activa reordena dinámicamente estos candidatos.
 */
const AI_BUILD_PRIORITY_KEYS = [
  'solarPlant',
  'metalMine',
  'crystalMine',
  'deutSynth',
  'robotFactory',
  'researchLab',
  'shipyard',
  'metalStorage',
  'crystalStorage',
  'deutStorage',
  'fusionReactor',
  'naniteFactory',
  'missileSilo'
];

/**
 * Devuelve un multiplicador de prioridad para un edificio según la directiva activa.
 * Permite que cada directiva acelere distintas ramas de construcción.
 */
function directiveBoost(buildingKey, directive) {
  if (!directive) return 0;
  switch (directive) {
    case 'MILITARIZE':
    case 'WAR_POSTURE':
      if (buildingKey === 'shipyard' || buildingKey === 'missileSilo') return 30;
      if (buildingKey === 'robotFactory') return 10;
      return 0;
    case 'TECH':
      if (buildingKey === 'researchLab' || buildingKey === 'naniteFactory') return 30;
      return 0;
    case 'EXPAND':
      if (buildingKey === 'shipyard') return 15;
      if (buildingKey === 'metalMine' || buildingKey === 'crystalMine') return 10;
      return 0;
    case 'FORTIFY':
      if (buildingKey === 'solarPlant' || buildingKey === 'fusionReactor') return 25;
      if (buildingKey === 'metalStorage' || buildingKey === 'crystalStorage' || buildingKey === 'deutStorage') return 15;
      return 0;
    case 'TRADE':
      if (buildingKey === 'metalMine' || buildingKey === 'crystalMine' || buildingKey === 'deutSynth') return 20;
      return 0;
    default:
      return 0;
  }
}

// --------------------------------------------------------------------------
// PERSISTENCIA ASÍNCRONA DE DIRECTIVAS IA (GEMINI)
// --------------------------------------------------------------------------
// Las respuestas de consultStrategicDirector() llegan asíncronamente fuera del
// tick. Se guardan en este mapa y se aplican en el siguiente tick sin bloquear el juego.
const pendingDirectives = new Map(); // factionId -> { directive, source, priority, reasoning, timestamp }
let lastStrategicConsultTick = -999;

export const processAIEmpireTick = (state) => {
  let newState = { ...state };
  if (!newState.aiPlanets || newState.aiPlanets.length === 0) return newState;

  const now = Date.now();
  const tick = Number(state.gameTick) || 0;

  // --------------------------------------------------------------------------
  // 0. PERFILES DE FACCIÓN: LAZY INIT + DIRECTIVA ESTRATÉGICA
  // --------------------------------------------------------------------------
  // 1. Aplica directivas de Gemini que hayan llegado asíncronamente desde el último tick.
  // 2. Si no tiene perfil, lo inicializa de forma determinista.
  // 3. Si no tiene directiva, usa el fallback determinista local.
  newState.aiPlanets = newState.aiPlanets.map(planet => {
    if (!planet || planet.isVirgin) return planet;

    let profiled = ensureFactionProfile(planet);

    // ¿Llegó una directiva de Gemini en segundo plano para esta facción?
    if (pendingDirectives.has(planet.id)) {
      const geminiDir = pendingDirectives.get(planet.id);
      pendingDirectives.delete(planet.id);
      profiled = { ...profiled, strategicDirective: geminiDir };
    } else {
      // Recalibración reactiva si hubo eventos críticos recientes que afecten a esta facción
      const reactiveDir = recalibrateDirectiveOnEvents(profiled, newState.galacticEvents, tick);
      if (reactiveDir) {
        profiled = { ...profiled, strategicDirective: reactiveDir };
      } else if (!profiled.strategicDirective) {
        // Si la facción aún no tiene directiva, calcular con el fallback local
        const dir = fallbackStrategicDirector(profiled);
        profiled = { ...profiled, strategicDirective: dir };
      }
    }

    return profiled;
  });

  // --------------------------------------------------------------------------
  // 1. ECONOMÍA ACTIVA CONTINUA: PRODUCCIÓN MINERA Y ALMACENAMIENTO LOCAL
  // --------------------------------------------------------------------------
  newState.aiPlanets = newState.aiPlanets.map(planet => {
    if (!planet || planet.isVirgin) return planet;

    const b = planet.buildings || {};
    const r = planet.research || {};
    const faction = planet.faction || 'human';
    const temp = planet.temperature !== undefined ? planet.temperature : 20;

    const prod = calcProduction(
      b, r, temp, GAME_SPEED || 1, faction,
      planet.biome || null,
      planet.gravity !== undefined ? planet.gravity : null,
      planet.trait || null,
      planet.specialization || null,
      { galaxy: planet.galaxy, system: planet.system, position: planet.position },
      0, []
    );

    const storage = calcStorage(b, r);
    const curRes = planet.resources || { metal: 0, crystal: 0, deuterium: 0 };

    const ratio = typeof prod.ratio === 'number' ? prod.ratio : 1.0;
    const addedM = Math.max(0, (prod.metal * ratio) / 3600);
    const addedC = Math.max(0, (prod.crystal * ratio) / 3600);
    const addedD = Math.max(0, (prod.deuterium * ratio) / 3600);

    const maxCapM = Math.max(storage.metal || 1000000, curRes.metal || 0);
    const maxCapC = Math.max(storage.crystal || 1000000, curRes.crystal || 0);
    const maxCapD = Math.max(storage.deuterium || 1000000, curRes.deuterium || 0);

    return {
      ...planet,
      resources: clampResources({
        metal: Math.min((curRes.metal || 0) + addedM, maxCapM),
        crystal: Math.min((curRes.crystal || 0) + addedC, maxCapC),
        deuterium: Math.min((curRes.deuterium || 0) + addedD, maxCapD)
      })
    };
  });

  // --------------------------------------------------------------------------
  // 2. CONSTRUCCIÓN Y DESARROLLO INDUSTRIAL ORGÁNICO (guiado por directiva)
  // --------------------------------------------------------------------------
  if (tick % 15 === 0) {
    newState.aiPlanets = newState.aiPlanets.map((planet, idx) => {
      if (!planet || planet.isVirgin) return planet;
      if ((idx + tick) % 3 !== 0) return planet;

      const buildings = { ...(planet.buildings || {}) };
      let resources = { ...(planet.resources || {}) };
      const strat = AI_STRATEGIES[planet.strategy] || {};
      const directive = planet.strategicDirective?.directive || null;

      const solarLvl = buildings.solarPlant || 0;
      const metalLvl = buildings.metalMine || 0;
      const crystalLvl = buildings.crystalMine || 0;

      let candidateKey = null;
      if (solarLvl < Math.max(metalLvl, crystalLvl)) {
        candidateKey = 'solarPlant';
      } else {
        const candidates = [...AI_BUILD_PRIORITY_KEYS].sort((a, b) => {
          let scoreA = 10;
          let scoreB = 10;
          if (a.includes('Mine') || a.includes('Synth')) scoreA += (strat.weight?.eco || 0.3) * 20;
          if (b.includes('Mine') || b.includes('Synth')) scoreB += (strat.weight?.eco || 0.3) * 20;
          if (a === 'shipyard' || a === 'missileSilo') scoreA += (strat.weight?.mil || 0.3) * 20;
          if (b === 'shipyard' || b === 'missileSilo') scoreB += (strat.weight?.mil || 0.3) * 20;
          if (a === 'researchLab') scoreA += (strat.weight?.tech || 0.3) * 20;
          if (b === 'researchLab') scoreB += (strat.weight?.tech || 0.3) * 20;
          scoreA += directiveBoost(a, directive);
          scoreB += directiveBoost(b, directive);
          return scoreB - scoreA;
        });

        for (const k of candidates) {
          const curLvl = buildings[k] || 0;
          const cost = buildingCost(k, curLvl, buildings.constructionCenter || 0);
          if (canAfford(resources, cost)) {
            candidateKey = k;
            break;
          }
        }
      }

      if (candidateKey) {
        const curLvl = buildings[candidateKey] || 0;
        const cost = buildingCost(candidateKey, curLvl, buildings.constructionCenter || 0);
        if (canAfford(resources, cost)) {
          resources = clampResources(deduct(resources, cost));
          buildings[candidateKey] = curLvl + 1;

          const totalKeyInfra = (buildings.metalMine || 0) + (buildings.crystalMine || 0) + (buildings.deutSynth || 0);
          const computedAiLevel = Math.max(planet.aiLevel || 1, Math.floor(totalKeyInfra / 4) + 1);

          return { ...planet, buildings, resources, aiLevel: computedAiLevel };
        }
      }

      return { ...planet, buildings, resources };
    });
  }

  // --------------------------------------------------------------------------
  // 3. INVESTIGACIÓN Y PROGRESIÓN TECNOLÓGICA INTELIGENTE
  // --------------------------------------------------------------------------
  newState.aiPlanets = newState.aiPlanets.map(ai => {
    if (!ai || ai.isVirgin) return ai;

    const newAi = { ...ai, research: { ...(ai.research || {}) }, fleet: { ...(ai.fleet || {}) } };
    const strat = AI_STRATEGIES[ai.strategy] || {};
    const aiLvl = ai.aiLevel || 1;
    const labLevel = ai.buildings?.researchLab || 0;

    const techBoost = ai.strategicDirective?.directive === 'TECH' ? 0.1 : 0;
    const researchProb = 0.05 * aiLvl + techBoost;

    if (labLevel >= 1 && (tick % 15 === 0 || Math.random() < researchProb)) {
      const catWeights = AI_STRATEGY_CATEGORY_WEIGHTS(strat.weight);
      const config = {
        state: null,
        research: newAi.research,
        buildings: ai.buildings || {},
        planetResources: newAi.resources || {},
        labLevel,
        constructionCenterLvl: ai.buildings?.constructionCenter || 0,
        categoryWeights: catWeights,
        threat: strat.warTendency || 0,
        GAME_SPEED: GAME_SPEED || 1,
        ministries: {},
      };

      const candidates = Object.keys(RESEARCH).filter(id => (newAi.research[id] || 0) < 25);
      const ranked = rankResearch(config, candidates);

      for (const { id, cost } of ranked) {
        if (!canAfford(newAi.resources, cost)) continue;
        newAi.research[id] = (newAi.research[id] || 0) + 1;
        newAi.resources = clampResources(deduct(newAi.resources, cost));
        break;
      }
    }

    return newAi;
  });

  // --------------------------------------------------------------------------
  // 4. EXPANSIÓN TERRITORIAL Y COLONIZACIÓN ACTIVA DE MUNDOS VÍRGENES
  // --------------------------------------------------------------------------
  if (tick > 0 && tick % 60 === 0 && newState.aiPlanets.length > 0) {
    const candidateAIs = newState.aiPlanets.filter(ai => {
      if (!ai || ai.isVirgin) return false;
      const wantsExpand = ai.strategicDirective?.directive === 'EXPAND';
      const hasColonizer = (ai.fleet?.colonizer || 0) >= 1;
      const hasRes = (ai.resources?.metal || 0) >= 15000 &&
                     (ai.resources?.crystal || 0) >= 20000 &&
                     (ai.resources?.deuterium || 0) >= 10000;
      // Si ya tiene una nave colonizadora construida, la colonización es 100% certera.
      // Si sólo tiene recursos, evalúa la decisión con el azar contextual ponderado.
      if (hasColonizer) return true;
      if (!hasRes) return false;
      const expandRoll = evaluateContextualRoll({
        baseProb: wantsExpand ? 0.6 : 0.25,
        modifiers: [{ name: 'hasRes', value: 0.2 }],
        profileFactor: (ai.profile?.expansionLean || 0.4) * 0.2,
        historyFactor: 0,
        noiseFactor: 0.05
      });
      return expandRoll.success;
    });

    if (candidateAIs.length > 0) {
      const expandingAI = candidateAIs[Math.floor(Math.random() * candidateAIs.length)];
      if (expandingAI) {
        const sysOccupied = new Set([
          ...(newState.planets || []).filter(p => p.galaxy === expandingAI.galaxy && p.system === expandingAI.system).map(p => p.position),
          ...(newState.aiPlanets || []).filter(p => p.galaxy === expandingAI.galaxy && p.system === expandingAI.system).map(p => p.position)
        ]);

        let freePos = null;
        for (let pos = 1; pos <= 15; pos++) {
          if (!sysOccupied.has(pos)) { freePos = pos; break; }
        }

        let targetGalaxy = expandingAI.galaxy;
        let targetSystem = expandingAI.system;
        if (!freePos) {
          const neighborSys = Math.max(1, targetSystem + (Math.random() < 0.5 ? 1 : -1));
          const neighborOccupied = new Set([
            ...(newState.planets || []).filter(p => p.galaxy === targetGalaxy && p.system === neighborSys).map(p => p.position),
            ...(newState.aiPlanets || []).filter(p => p.galaxy === targetGalaxy && p.system === neighborSys).map(p => p.position)
          ]);
          for (let pos = 1; pos <= 15; pos++) {
            if (!neighborOccupied.has(pos)) { freePos = pos; targetSystem = neighborSys; break; }
          }
        }

        if (freePos) {
          const aiIndex = newState.aiPlanets.findIndex(p => p.id === expandingAI.id);
          if (aiIndex !== -1) {
            const currentAI = newState.aiPlanets[aiIndex];
            const updatedFleet = { ...(currentAI.fleet || {}) };
            let updatedRes = { ...(currentAI.resources || {}) };

            if ((updatedFleet.colonizer || 0) >= 1) {
              updatedFleet.colonizer -= 1;
              if (updatedFleet.colonizer <= 0) delete updatedFleet.colonizer;
            } else {
              updatedRes = clampResources({
                metal: Math.max(0, (updatedRes.metal || 0) - 15000),
                crystal: Math.max(0, (updatedRes.crystal || 0) - 20000),
                deuterium: Math.max(0, (updatedRes.deuterium || 0) - 10000)
              });
            }

            const colonyLevel = Math.max(1, Math.floor((currentAI.aiLevel || 1) * 0.6));
            const newColonyId = uid();
            const newColony = {
              id: newColonyId,
              name: `${currentAI.empireName || currentAI.name} Prime-${freePos}`,
              galaxy: targetGalaxy,
              system: targetSystem,
              position: freePos,
              temperature: -20 + Math.floor(Math.random() * 80),
              isAI: true,
              aiLevel: colonyLevel,
              relation: currentAI.relation || 0,
              discovered: Boolean(currentAI.discovered),
              aiType: currentAI.aiType || 'balanced',
              aiPersonality: currentAI.aiPersonality || 'pacífico',
              faction: currentAI.faction || 'human',
              empireName: currentAI.empireName || currentAI.name,
              race: currentAI.race || 'Humano',
              economicLvl: colonyLevel,
              militaryLvl: colonyLevel,
              biome: 'temperate',
              planetSize: 120 + Math.floor(Math.random() * 80),
              gravity: 1,
              trait: null,
              strategy: currentAI.strategy || 'balanced',
              aggression: currentAI.aggression || 0.4,
              profile: currentAI.profile ? { ...currentAI.profile } : undefined,
              memory: currentAI.memory ? { ...currentAI.memory } : undefined,
              strategicDirective: currentAI.strategicDirective ? { ...currentAI.strategicDirective } : undefined,
              buildings: {
                metalMine: Math.max(1, colonyLevel * 2),
                crystalMine: Math.max(1, Math.floor(colonyLevel * 1.5)),
                deutSynth: Math.max(1, colonyLevel),
                solarPlant: Math.max(2, colonyLevel * 2 + 1),
                robotFactory: Math.max(1, Math.floor(colonyLevel * 0.8)),
                shipyard: Math.max(1, Math.floor(colonyLevel * 0.5)),
                researchLab: 1
              },
              research: { ...(currentAI.research || {}) },
              resources: { metal: 5000 * colonyLevel, crystal: 3000 * colonyLevel, deuterium: 1500 * colonyLevel },
              fleet: { lightFighter: colonyLevel * 3 },
              defenses: { rocketLauncher: colonyLevel * 5 }
            };

            const updatedAIs = [...newState.aiPlanets];
            updatedAIs[aiIndex] = {
              ...currentAI,
              fleet: updatedFleet,
              resources: updatedRes,
              planetsConquered: (currentAI.planetsConquered || 0) + 1
            };
            updatedAIs.push(newColony);
            newState.aiPlanets = updatedAIs;

            const ge = {
              id: uid(), tick, type: 'colonize',
              title: '🚀 Expansión Interestelar',
              desc: `${currentAI.empireName || currentAI.name} ha colonizado [${targetGalaxy}:${targetSystem}:${freePos}] siguiendo directiva ${currentAI.strategicDirective?.directive || 'EXPAND'}.`,
              timestamp: now
            };
            newState.galacticEvents = [...(newState.galacticEvents || []), ge].slice(-200);
          }
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. RECONSTRUCCIÓN Y ESCALADO PROGRESIVO DE FLOTAS Y DEFENSAS
  // --------------------------------------------------------------------------
  if (tick % 120 === 0 && newState.aiPlanets.length > 0) {
    const aiBPs = (newState.blueprints || []).filter(bp => bp.isAI);
    if (aiBPs.length < 5) {
      const chassisKeys = Object.keys(SHIP_CHASSIS);
      const weapons = Object.keys(SHIP_WEAPONS);
      const engines = Object.keys(SHIP_ENGINES);
      const shields = Object.keys(SHIP_SHIELDS);
      const modules = Object.keys(SHIP_MODULES);
      const chassis = chassisKeys[Math.floor(Math.random() * chassisKeys.length)];
      const newBP = {
        id: 'ai_' + Math.random().toString(36).substring(2, 9),
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
      const directive = p.strategicDirective?.directive || null;
      const milBoost = (directive === 'MILITARIZE' || directive === 'WAR_POSTURE') ? 1.5 : 1.0;
      const regenRate = Math.max(1, Math.floor((p.aiLevel || 1) * 0.25 * milBoost));
      const newFleet = { ...(p.fleet || {}) };

      for (const id of ['lightFighter', 'heavyFighter', 'cruiser', 'battleship']) {
        const current = newFleet[id] || 0;
        const target = Math.floor((p.aiLevel || 1) * 6 * milBoost);
        if (current < target) {
          newFleet[id] = Math.min(target, current + Math.ceil(regenRate * (1 + Math.random())));
        }
      }

      // Producción y mantenimiento de sondas de espionaje para IA
      const spyTech = p.research?.espionage || 0;
      if (spyTech >= 2) {
        const currentProbes = newFleet.espionageProbe || 0;
        const probeTarget = Math.max(2, Math.min(10, Math.floor((p.aiLevel || 1) * 2)));
        if (currentProbes < probeTarget) {
          newFleet.espionageProbe = currentProbes + 1;
        }
      }

      if ((p.aiLevel || 1) >= 5) {
        const currentAIBlueprints = (newState.blueprints || []).filter(bp => bp.isAI);
        if (currentAIBlueprints.length > 0) {
          const selectedBP = currentAIBlueprints[Math.floor(Math.random() * currentAIBlueprints.length)];
          const customId = 'custom_' + selectedBP.id;
          const currentCustomCount = newFleet[customId] || 0;
          const customTarget = Math.floor((p.aiLevel || 1) * 3);
          if (currentCustomCount < customTarget) {
            newFleet[customId] = Math.min(customTarget, currentCustomCount + Math.ceil(regenRate));
          }
        }
      }

      const newDefenses = { ...(p.defenses || {}) };
      const fortifyBoost = directive === 'FORTIFY' ? 2.0 : 1.0;
      const defTarget = Math.floor((p.aiLevel || 1) * 12 * fortifyBoost);
      const curDef = Object.values(newDefenses).reduce((a, b) => a + b, 0);
      if (curDef < defTarget) {
        newDefenses.rocketLauncher = (newDefenses.rocketLauncher || 0) + Math.ceil(regenRate * 2);
        newDefenses.lightLaser = (newDefenses.lightLaser || 0) + Math.ceil(regenRate);
      }

      return { ...p, fleet: newFleet, defenses: newDefenses };
    });
  }

  // --------------------------------------------------------------------------
  // 6. DINÁMICA DIPLOMÁTICA, GUERRAS Y TRATADOS EMERGENTES (contextual RNG)
  // --------------------------------------------------------------------------
  if (tick > 0 && tick % 180 === 0 && newState.aiPlanets.length > 1) {
    const aiList = [...newState.aiPlanets];
    const updatedAIs = [...aiList];
    const numInteractions = Math.min(50, Math.max(2, Math.floor(aiList.length * 0.03)));
    const newEvents = [];

    for (let i = 0; i < numInteractions; i++) {
      const aIdx = Math.floor(Math.random() * aiList.length);
      let bIdx;
      do { bIdx = Math.floor(Math.random() * aiList.length); } while (bIdx === aIdx);
      const a = updatedAIs[aIdx];
      const b = updatedAIs[bIdx];
      if (!a || !b) continue;

      const dist = calcDistance(a, b);
      const effectiveDist = Math.max(1, dist / 1000);
      const interactionChance = Math.min(0.35, 1 / effectiveDist);
      if (Math.random() > interactionChance) continue;

      const aRelation = a.relation || 0;
      const bRelation = b.relation || 0;
      const avgRelation = (aRelation + bRelation) / 2;

      // Actualizar información imperfecta (reconocimiento e inteligencia sobre el vecino)
      updatedAIs[aIdx] = updateIntelLedger(updatedAIs[aIdx], b, tick);
      updatedAIs[bIdx] = updateIntelLedger(updatedAIs[bIdx], a, tick);
      const curA = updatedAIs[aIdx];
      const curB = updatedAIs[bIdx];

      // ── GUERRA (contextual RNG ponderado) ───────────────────────────────
      const warTension = calculateWarTension(a, b, newState);
      const dirA = a.strategicDirective?.directive;
      const warPostureBoost = (dirA === 'WAR_POSTURE') ? 0.15 : 0;

      const warResult = evaluateContextualRoll({
        baseProb: warTension.finalProb + warPostureBoost,
        modifiers: [{ name: 'relationFactor', value: -(avgRelation / 200) }],
        profileFactor: (a.profile?.aggressiveness || 0.5) * 0.1,
        historyFactor: ((a.memory?.betrayals || []).filter(x => x.factionId === b.id).length) * 0.08,
        noiseFactor: 0.04
      });

      if (warResult.success && a.aiLevel > b.aiLevel * 0.6) {
        const atkPower = a.aiLevel * (1 + (a.militaryLvl || 1) * 0.1);
        const defPower = b.aiLevel * (1 + (b.militaryLvl || 1) * 0.1);
        const totalPower = atkPower + defPower;
        const atkWinChance = totalPower > 0 ? atkPower / totalPower : 0.5;

        const techA = Object.values(a.research || {}).reduce((s, v) => s + v, 0);
        const techB = Object.values(b.research || {}).reduce((s, v) => s + v, 0);
        const techBonus = techA > techB ? 0.05 : techA < techB ? -0.05 : 0;
        const finalWinChance = Math.max(0.05, Math.min(0.95, atkWinChance + techBonus));

        if (Math.random() < finalWinChance) {
          const updatedB = recordFactionMemory({ ...updatedAIs[bIdx] }, {
            type: 'war_ended', targetId: a.id, targetName: a.empireName || a.name, won: false, tick
          });
          updatedAIs[aIdx] = {
            ...updatedAIs[aIdx],
            aiLevel: (a.aiLevel || 1) + 1,
            planetsConquered: (a.planetsConquered || 0) + 1,
            totalWins: (a.totalWins || 0) + 1,
            warsDeclared: (a.warsDeclared || 0) + 1
          };
          updatedAIs[bIdx] = {
            ...updatedB,
            aiLevel: Math.max(1, (b.aiLevel || 1) - 1),
            resources: {
              metal: Math.floor((b.resources?.metal || 0) * 0.7),
              crystal: Math.floor((b.resources?.crystal || 0) * 0.7),
              deuterium: Math.floor((b.resources?.deuterium || 0) * 0.7)
            },
            planetsLost: (b.planetsLost || 0) + 1,
            totalLosses: (b.totalLosses || 0) + 1,
            warsReceived: (b.warsReceived || 0) + 1,
            relation: Math.max(-100, (b.relation || 0) - 35)
          };
          newEvents.push({
            id: uid(), tick, type: 'war',
            title: '⚔️ Guerra Interestelar',
            desc: `${a.empireName || a.name} ha derrotado a ${b.empireName || b.name}. Directiva: ${dirA || 'AGGRESSIVE'}.`,
            source: 'war_contextual',
            timestamp: now
          });
        } else {
          const updatedA = recordFactionMemory({ ...updatedAIs[aIdx] }, {
            type: 'war_ended', targetId: b.id, targetName: b.empireName || b.name, won: false, tick
          });
          updatedAIs[aIdx] = { ...updatedA, totalLosses: (a.totalLosses || 0) + 1, warsDeclared: (a.warsDeclared || 0) + 1 };
          updatedAIs[bIdx] = { ...updatedAIs[bIdx], totalWins: (b.totalWins || 0) + 1 };
          newEvents.push({
            id: uid(), tick, type: 'war',
            title: '🛡️ Defensa Exitosa',
            desc: `${b.empireName || b.name} ha repelido el ataque de ${a.empireName || a.name}.`,
            source: 'war_contextual',
            timestamp: now
          });
        }
        continue;
      }

      // ── ALIANZA / MEJORA DE RELACIÓN ────────────────────────────────────
      const allyProb = evaluateContextualRoll({
        baseProb: 0.10,
        modifiers: [{ name: 'relation', value: avgRelation / 300 }],
        profileFactor: ((a.profile?.diplomaticLean || 0.4) + (b.profile?.diplomaticLean || 0.4)) * 0.05,
        historyFactor: 0,
        noiseFactor: 0.03
      });

      if (allyProb.success) {
        const boost = 15 + Math.floor(Math.random() * 20);
        updatedAIs[aIdx] = { ...updatedAIs[aIdx], relation: Math.min(100, (updatedAIs[aIdx].relation || 0) + boost) };
        updatedAIs[bIdx] = { ...updatedAIs[bIdx], relation: Math.min(100, (updatedAIs[bIdx].relation || 0) + boost) };
        if ((updatedAIs[aIdx].relation || 0) > 60) {
          const updatedA = recordFactionMemory({ ...updatedAIs[aIdx] }, {
            type: 'aid', targetId: b.id, targetName: b.empireName || b.name, tick, reason: 'alliance'
          });
          updatedAIs[aIdx] = updatedA;
        }
        continue;
      }

      // ── COMERCIO ─────────────────────────────────────────────────────────
      const tradeProb = evaluateContextualRoll({
        baseProb: 0.15,
        modifiers: [{ name: 'commercialLean', value: (a.profile?.commercialLean || 0.45) * 0.1 }],
        profileFactor: dirA === 'TRADE' ? 0.15 : 0,
        historyFactor: 0,
        noiseFactor: 0.03
      });

      if (tradeProb.success) {
        if (!updatedAIs[aIdx].tradeRoutes) updatedAIs[aIdx] = { ...updatedAIs[aIdx], tradeRoutes: [] };
        if (!updatedAIs[bIdx].tradeRoutes) updatedAIs[bIdx] = { ...updatedAIs[bIdx], tradeRoutes: [] };
        if ((updatedAIs[aIdx].tradeRoutes?.length || 0) < 5) {
          updatedAIs[aIdx] = { ...updatedAIs[aIdx], tradeRoutes: [...(updatedAIs[aIdx].tradeRoutes || []), { partnerId: b.id, established: now, volume: Math.floor(500 + Math.random() * 2000) }] };
        }
        if ((updatedAIs[bIdx].tradeRoutes?.length || 0) < 5) {
          updatedAIs[bIdx] = { ...updatedAIs[bIdx], tradeRoutes: [...(updatedAIs[bIdx].tradeRoutes || []), { partnerId: a.id, established: now, volume: Math.floor(500 + Math.random() * 2000) }] };
        }
        continue;
      }

      // ── SAQUEO OPORTUNISTA ───────────────────────────────────────────────
      const raidProb = evaluateContextualRoll({
        baseProb: 0.05,
        modifiers: [{ name: 'aggr', value: (a.profile?.aggressiveness || 0.5) * 0.1 }],
        profileFactor: (a.aiLevel || 1) > (b.aiLevel || 1) * 1.3 ? 0.1 : -0.1,
        historyFactor: 0,
        noiseFactor: 0.02
      });

      if (raidProb.success && a.aiLevel > b.aiLevel * 0.7) {
        const loot = {
          metal: Math.floor(200 + Math.random() * 800) * (a.aiLevel || 1),
          crystal: Math.floor(100 + Math.random() * 400) * (a.aiLevel || 1)
        };
        updatedAIs[aIdx] = { ...updatedAIs[aIdx], resources: { metal: (updatedAIs[aIdx].resources?.metal || 0) + loot.metal, crystal: (updatedAIs[aIdx].resources?.crystal || 0) + loot.crystal, deuterium: updatedAIs[aIdx].resources?.deuterium || 0 }, relation: Math.max(-100, (updatedAIs[aIdx].relation || 0) - 10) };
        updatedAIs[bIdx] = { ...updatedAIs[bIdx], resources: { metal: Math.max(0, (updatedAIs[bIdx].resources?.metal || 0) - loot.metal), crystal: Math.max(0, (updatedAIs[bIdx].resources?.crystal || 0) - loot.crystal), deuterium: updatedAIs[bIdx].resources?.deuterium || 0 }, relation: Math.max(-100, (updatedAIs[bIdx].relation || 0) - 15) };
        const updatedB2 = recordFactionMemory({ ...updatedAIs[bIdx] }, {
          type: 'betrayal', targetId: a.id, targetName: a.empireName || a.name, tick, reason: 'raid'
        });
        updatedAIs[bIdx] = updatedB2;
      }
    }

    newState.aiPlanets = updatedAIs;
    if (newEvents.length > 0) {
      newState.galacticEvents = [...(newState.galacticEvents || []), ...newEvents].slice(-200);
    }

    // ── 6.5. EFECTO MARIPOSA: MOTOR DE EVENTOS EMERGENTES ENCADENADOS ──────
    // Se ejecuta tras la diplomacia directa: las guerras y cambios territoriales
    // recientes desencadenan crisis, oportunismo vecino, coaliciones o carreras I+D.
    const emergentResult = processEmergentChains(newState, tick, now);
    newState.aiPlanets = emergentResult.aiPlanets;
    newState.galacticEvents = emergentResult.galacticEvents;
  }

  // --------------------------------------------------------------------------
  // 6.6. EVENTOS INTERNOS DE FACCIÓN (cada ~90 ticks)
  // --------------------------------------------------------------------------
  // Rebeliones civiles, crisis políticas, golpes de estado, superciclos comerciales
  // y saltos científicos espontáneos en función de la estabilidad de cada potencia.
  if (tick > 0 && tick % 90 === 0 && newState.aiPlanets.length > 0) {
    const internalResult = processInternalEvents(newState, tick, now);
    newState.aiPlanets = internalResult.aiPlanets;
    newState.galacticEvents = internalResult.galacticEvents;
  }

  // --------------------------------------------------------------------------
  // 7. DIRECTOR ESTRATÉGICO AUTÓNOMO (async, cada ~240 ticks — sin bloquear)
  // --------------------------------------------------------------------------
  // Selecciona la facción más activa y consulta al Director (Gemini API).
  // La respuesta se guarda en `pendingDirectives` y se aplica en el Paso 0
  // del siguiente tick. Esto garantiza que la IA sí influye en el estado real.
  if (tick > 0 && tick % 240 === 0 && (tick - lastStrategicConsultTick) >= 240) {
    lastStrategicConsultTick = tick;

    const activeFactions = newState.aiPlanets.filter(p => p && !p.isVirgin);
    if (activeFactions.length > 0) {
      const featured = [...activeFactions].sort((x, y) => {
        const xScore = (x.aiLevel || 1) + (x.totalWins || 0) * 0.5 - (x.totalLosses || 0) * 0.3;
        const yScore = (y.aiLevel || 1) + (y.totalWins || 0) * 0.5 - (y.totalLosses || 0) * 0.3;
        return yScore - xScore;
      })[0];

      if (featured) {
        const universeSummary = `${activeFactions.length} facciones activas. Tick ${tick}. ` +
          `Líder: ${featured.empireName || featured.name} (nivel ${featured.aiLevel || 1}). ` +
          `Guerras recientes: ${newState.galacticEvents?.filter(e => e.type === 'war' && tick - e.tick < 240).length || 0}.`;

        consultStrategicDirector(featured, universeSummary).then(directive => {
          if (!directive) return;
          // Guardar en pendingDirectives para que el Paso 0 del próximo tick
          // aplique esta directiva al objeto de la facción
          pendingDirectives.set(featured.id, directive);

          // Registrar en eventos galácticos para trazabilidad en UI
          console.log(`[Ascension Director] ${featured.empireName || featured.name}: ${directive.directive} (${directive.source}) — "${directive.reasoning}"`);
        }).catch(() => {/* fallback local ya activo */});
      }
    }
  }

  return newState;
};
