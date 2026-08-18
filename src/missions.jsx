import { updatePlanet, getVirginPlanet } from './core.jsx';
import { SHIPS, RESEARCH } from './data/gameData.js';
import { calcStorage, getEffectiveTech, getPOIAtCoordinates, fmt, uid } from './utils/formulas.js';
import { simulateCombat } from './combat.js';

const processMission = (mission, state) => {
  try {
  const attackerTech = mission.isAI ? (mission.from.research || {}) : state.research;
  const fleet = mission.fleet;

  if (mission.type === 'attack' || mission.type === 'planet_destruction') {
    let targetPlanet = state.planets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
    let targetAI = state.aiPlanets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);

    if (!targetPlanet && !targetAI) {
      console.warn('[Ascensión] processMission: target not found for attack mission', mission);
      return { state, type: 'error', message: 'Objetivo no encontrado (puede haber sido destruido)', returnFleet: mission.fleet || {} };
    }

    const defenderTech = targetAI ? (targetAI.research || {}) : getEffectiveTech(targetPlanet, state.research);
    const defFleet = targetAI ? targetAI.fleet : (targetPlanet?.fleet || {});
    const defDefenses = targetAI ? targetAI.defenses : (targetPlanet?.defenses || {});

    const atkFaction = mission.isAI ? (mission.from.faction || 'human') : (state.planets.find(p => p.id === mission.from.id)?.faction || 'human');
    const defFaction = targetAI ? (targetAI.faction || 'human') : (targetPlanet?.faction || 'human');

    let mergedDefFleet = { ...defFleet };
    let supportText = "";
    if (mission.isAI && targetPlanet) {
      const activeAlly = state.aiPlanets.find(ai => ai.clanId && ai.relation >= 60);
      if (activeAlly && activeAlly.fleet) {
        Object.entries(activeAlly.fleet).forEach(([id, qty]) => {
          const supportQty = Math.floor(qty * 0.4);
          if (supportQty > 0) {
            mergedDefFleet[id] = (mergedDefFleet[id] || 0) + supportQty;
          }
        });
        supportText = ` (Reforzado por la flota aliada del Imperio ${activeAlly.name})`;
      }
    }

    let intelBonus = 0;
    if (!mission.isAI) {
      const originPlanet = state.planets.find(p => p.id === mission.from.id);
      const spyLevel = originPlanet?.buildings?.spyCenter || 0;
      intelBonus += spyLevel * 0.02;
      const relicSpyMult = (state.relics || []).reduce((acc, r) => r.effect?.spyBonus ? acc * r.effect.spyBonus : acc, 1);
      intelBonus *= relicSpyMult;
      const recentSpy = (state.spyReports || []).find(r => r.targetId === targetAI?.id || (targetPlanet && r.coords && r.coords.galaxy === targetPlanet.galaxy && r.coords.system === targetPlanet.system && r.coords.position === targetPlanet.position));
      if (recentSpy) {
        if (recentSpy.intelLevel === 'high') intelBonus += 0.08;
        else if (recentSpy.intelLevel === 'full') intelBonus += 0.15;
      }
    }
    let result;
    try {
      result = simulateCombat(fleet, mergedDefFleet, defDefenses, attackerTech, defenderTech, 6, state.blueprints, atkFaction, defFaction, mission.autoRetreat || false, mission.formation || 'standard', intelBonus);
    } catch (e) {
      console.error('[Ascensión] simulateCombat (inside processMission) error:', e);
      result = { winner: 'defender', rounds: 0, atkLosses: {}, defLosses: {}, debris: { metal: 0, crystal: 0 }, atkSurvivors: fleet || {}, defShipSurvivors: {}, defDefenseSurvivors: {} };
    }
    const atkLostTotal = Object.values(result.atkLosses || {}).reduce((a, b) => a + b, 0);
    const defLostTotal = Object.values(result.defShipLosses || {}).reduce((a, b) => a + b, 0) + Object.values(result.defDefenseLosses || {}).reduce((a, b) => a + b, 0);
    const totalRounds = Array.isArray(result.rounds) ? result.rounds.length : 0;
    const efficiency = atkLostTotal + defLostTotal > 0 ? Math.round((defLostTotal / Math.max(1, atkLostTotal + defLostTotal)) * 100) : 50;

    const combat = {
      id: uid(), timestamp: Date.now(),
      attacker: { name: mission.isAI ? mission.from.name : state.playerName, fleet: mission.fleet, tech: attackerTech, faction: atkFaction },
      defender: { name: targetAI ? targetAI.name : (targetPlanet?.name || 'Planeta'), fleet: defFleet, defenses: defDefenses, tech: defenderTech, faction: defFaction },
      result,
      mission,
      summary: {
        atkLostTotal,
        defLostTotal,
        totalRounds,
        efficiency,
        formation: mission.formation || 'standard',
        autoRetreatUsed: !!result.retreated,
        intelBonus: intelBonus || 0,
      },
    };

    const newCL = [...(state.combatLog || []), combat];
    let newState = { ...state, combatLog: newCL.length > 50 ? newCL.slice(-50) : newCL };
    let type = 'info', message = '';
    let returnFleet = {};

    if (mission.isAI) {
      if (result.winner === 'defender') {
        newState.stats = { ...newState.stats, combatsWon: newState.stats.combatsWon + 1 };
        newState = updatePlanet(newState, targetPlanet.id, p => ({ ...p, fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors } }));
        type = 'success'; message = `🏆 ¡Victoria! Repeliste el ataque${supportText}. Escombros: ${fmt(result.debris.metal)}M/${fmt(result.debris.crystal)}C`;
      } else if (result.winner === 'attacker') {
        newState.stats = { ...newState.stats, combatsLost: newState.stats.combatsLost + 1 };
        if (!targetPlanet) {
          type = 'error'; message = `💀 Planeta objetivo destruido o abandonado durante el ataque.`;
          returnFleet = { ...result.atkSurvivors };
        } else if (mission.type === 'planet_destruction') {
          newState.planets = newState.planets.filter(p => p.id !== targetPlanet.id);
          if (newState.planets.length > 0) {
            newState.currentPlanetId = newState.planets[0].id;
          } else {
            newState.gameOver = { lost: true, reason: 'Todos tus planetas han sido reducidos a polvo cósmico por los Kaelish.' };
          }
          type = 'error'; message = `🪐 DESASTRE ABSOLUTO: Tu planeta ${targetPlanet.name} ha sido pulverizado por la flota enemiga.`;
        } else {
        const storage = calcStorage(targetPlanet.buildings);
        const vaultLvl = targetPlanet.buildings.vault || 0;
        const vaultPct = Math.min(0.5, vaultLvl * 0.05);
        const vaultMult = 1 + vaultPct;
        const protectedLimit = {
          metal: storage.metal * vaultMult,
          crystal: storage.crystal * vaultMult,
          deuterium: storage.deuterium * vaultMult,
        };
        const excess = {
          metal: Math.max(0, targetPlanet.resources.metal - protectedLimit.metal),
          crystal: Math.max(0, targetPlanet.resources.crystal - protectedLimit.crystal),
          deuterium: Math.max(0, targetPlanet.resources.deuterium - protectedLimit.deuterium),
        };
        const totalExcess = excess.metal + excess.crystal + excess.deuterium;
        const attackerCargo = Object.entries(result.atkSurvivors).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty, 0);
        const maxLoot = Math.min(attackerCargo, totalExcess * 0.5);
        const lootReduction = targetPlanet.specialization === 'commercial' ? 0.7 : 1.0;
        const loot = {
          metal: Math.min(excess.metal, attackerCargo || maxLoot * (excess.metal / Math.max(1, totalExcess))) * lootReduction,
          crystal: Math.min(excess.crystal, attackerCargo || maxLoot * (excess.crystal / Math.max(1, totalExcess))) * lootReduction,
          deuterium: Math.min(excess.deuterium, attackerCargo || maxLoot * (excess.deuterium / Math.max(1, totalExcess))) * lootReduction,
        };
        newState = updatePlanet(newState, targetPlanet.id, p => ({
          ...p,
          resources: {
            metal: p.resources.metal - loot.metal,
            crystal: p.resources.crystal - loot.crystal,
            deuterium: p.resources.deuterium - loot.deuterium,
          },
          fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors },
        }));
        type = 'error'; message = `💀 Batalla perdida${supportText}. Perdiste ${fmt(loot.metal)}M, ${fmt(loot.crystal)}C, ${fmt(loot.deuterium)}D (Protegido por almacenes: ${fmt(protectedLimit.metal)}M/${fmt(protectedLimit.crystal)}C)`;
        }
      } else {
        newState.stats = { ...newState.stats, combatsDraw: newState.stats.combatsDraw + 1 };
        newState = updatePlanet(newState, targetPlanet.id, p => ({ ...p, fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors } }));
        type = 'warning'; message = `🤝 Combate empatado${supportText}`;
      }
    } else {
      let loot = { metal: 0, crystal: 0, deuterium: 0 };
      if (targetAI) {
        let newRelation = Math.max(-100, (targetAI.relation || 0) - 40);
        let isWar = false;
        let pnaVal = targetAI.pna;
        let allianceVal = targetAI.alliance;
        let tradeVal = targetAI.trade;
        if (newRelation <= -50) {
          newRelation = -100;
          isWar = true;
          pnaVal = false;
          allianceVal = false;
          tradeVal = false;
        }

        newState.reputation = Math.max(-100, (state.reputation || 0) - 15);
        if (targetAI) {
          const aiIndex = newState.aiPlanets.findIndex(p => p.id === targetAI.id);
          if (aiIndex !== -1) {
            const currentAgg = newState.aiPlanets[aiIndex].aggression || 0.4;
            newState.aiPlanets[aiIndex] = {
              ...newState.aiPlanets[aiIndex],
              aggression: Math.min(0.95, currentAgg + 0.12),
              lastStrategyChange: state.gameTick,
            };
          }
        }

        if (result.winner === 'attacker') {
          const originPlanet = state.planets.find(p => p.id === mission.from.id);
          const isCommercial = originPlanet?.specialization === 'commercial';
          const cargoMultiplier = isCommercial ? 1.5 : 1.0;
          const maxCargo = Object.entries(result.atkSurvivors).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);
          const storage = calcStorage(targetAI.buildings);
          const excess = {
            metal: Math.max(0, (targetAI.resources?.metal || 0) - storage.metal),
            crystal: Math.max(0, (targetAI.resources?.crystal || 0) - storage.crystal),
            deuterium: Math.max(0, (targetAI.resources?.deuterium || 0) - storage.deuterium),
          };
          const totalExcess = excess.metal + excess.crystal + excess.deuterium;
          loot = {
            metal: Math.min(excess.metal, maxCargo / 3),
            crystal: Math.min(excess.crystal, maxCargo / 3),
            deuterium: Math.min(excess.deuterium, maxCargo / 3),
          };
        }

        newState.aiPlanets = state.aiPlanets.map(p => p.id === targetAI.id ? {
          ...p,
          resources: {
            metal: Math.max(0, (p.resources.metal || 0) - loot.metal),
            crystal: Math.max(0, (p.resources.crystal || 0) - loot.crystal),
            deuterium: Math.max(0, (p.resources.deuterium || 0) - loot.deuterium),
          },
          fleet: result.defShipSurvivors || {},
          defenses: { ...p.defenses, ...(result.defDefenseSurvivors || {}) },
          aiLevel: result.winner === 'attacker' ? Math.max(1, (p.aiLevel || 1) - 1) : (p.aiLevel || 1),
          relation: newRelation,
          pna: pnaVal,
          alliance: allianceVal,
          trade: tradeVal,
        } : p);

        if (isWar && (targetAI.pna || targetAI.alliance || targetAI.trade)) {
          newState.notifications = [...(newState.notifications || []), {
            id: uid(),
            type: 'error',
            message: `⚠️ Tratados cancelados con ${targetAI.name} debido a hostilidades. ¡Se ha declarado la guerra!`,
            timestamp: Date.now()
          }];
        }
      }

      if (result.winner === 'attacker') {
        newState.stats = { ...newState.stats, combatsWon: newState.stats.combatsWon + 1 };
        if (mission.type === 'planet_destruction') {
          if (targetAI) {
            newState.aiPlanets = newState.aiPlanets.filter(p => p.id !== targetAI.id);
            newState.notifications = [...(newState.notifications || []), {
              id: uid(),
              type: 'success',
              message: `🪐 APOCALIPSIS: El planeta ${targetAI.name} ha sido completamente pulverizado por tu Planeta Destructor.`,
              timestamp: Date.now()
            }];
            message = `🪐 Planeta pulverizado con éxito.`;
          }
        } else if (targetAI) {
          newState = updatePlanet(newState, mission.from.id, p => ({
            ...p,
            resources: {
              metal: p.resources.metal + loot.metal,
              crystal: p.resources.crystal + loot.crystal,
              deuterium: p.resources.deuterium + loot.deuterium,
            },
          }));
        }
        returnFleet = result.atkSurvivors;
        if (mission.type !== 'planet_destruction') {
          type = 'success'; message = `🏆 ¡Victoria! Botín: ${fmt(loot.metal)}M, ${fmt(loot.crystal)}C, ${fmt(loot.deuterium)}D`;
        } else {
          type = 'success';
        }
      } else if (result.winner === 'defender') {
        newState.stats = { ...newState.stats, combatsLost: newState.stats.combatsLost + 1 };
        type = 'error'; message = `💀 Batalla perdida en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`;
      } else {
        newState.stats = { ...newState.stats, combatsDraw: newState.stats.combatsDraw + 1 };
        returnFleet = result.atkSurvivors;
        type = 'warning'; message = `🤝 Combate empatado`;
      }
    }

    newState.debrisField = {
      metal: (newState.debrisField?.metal || 0) + result.debris.metal,
      crystal: (newState.debrisField?.crystal || 0) + result.debris.crystal,
    };

    const repairPct = mission.isAI ? 0 : Math.min(0.8, ((state.research.nanoTech || 0) * 0.05 + ((targetPlanet?.buildings?.nanoCenter || 0) * 0.03)));
    if (repairPct > 0 && result.defDefenseSurvivors && Object.keys(result.defDefenseSurvivors).length > 0 && targetPlanet) {
      newState = updatePlanet(newState, targetPlanet.id, p => {
        const repairedDefenses = { ...(p.defenses || {}) };
        for (const [defId, qty] of Object.entries(result.defDefenseSurvivors)) {
          repairedDefenses[defId] = Math.max(repairedDefenses[defId] || 0, qty + Math.floor(qty * repairPct));
        }
        return { ...p, defenses: repairedDefenses };
      });
    }

    if (!mission.isAI && result.debris.metal + result.debris.crystal >= 100000) {
      const moonChance = Math.min(0.2, (result.debris.metal + result.debris.crystal) / 100000 * 0.01);
      if (Math.random() < moonChance) {
        const targetPlanet = newState.planets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
        if (targetPlanet && !targetPlanet.moon) {
          newState = updatePlanet(newState, targetPlanet.id, p => ({
            ...p,
            moon: {
              id: uid(),
              name: `Luna de ${p.name}`,
              buildings: {},
              defenses: {},
              fleet: {},
            },
          }));
          newState.stats = { ...newState.stats, moonsCreated: newState.stats.moonsCreated + 1 };
          newState.notifications = [...(newState.notifications || []), {
            id: uid(), type: 'success', message: `🌙 ¡Luna formada en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]!`, timestamp: Date.now(),
          }];
        }
      }
    }

    return { state: newState, type, message, combat, returnFleet };
  }

  if (mission.type === 'colonize') {
    const { galaxy, system, position } = mission.to;
    const isOccupiedByPlayer = state.planets.some(p => p.galaxy === galaxy && p.system === system && p.position === position);
    const isOccupiedByAI = state.aiPlanets.some(p => p.galaxy === galaxy && p.system === system && p.position === position && !p.isVirgin);
    
    if (isOccupiedByPlayer || isOccupiedByAI) {
      return { state, type: 'warning', message: `🚫 Colonización fallida en [${galaxy}:${system}:${position}]: El planeta ya ha sido reclamado. Regresando flota.`, returnFleet: mission.fleet };
    }

    const colonizerQty = mission.fleet.colonizer || 0;
    if (colonizerQty < 1) {
      return { state, type: 'error', message: `🚫 Colonización fallida: No hay naves colonizadoras en la flota.`, returnFleet: mission.fleet };
    }

    const virgin = getVirginPlanet(galaxy, system, position);
    const newPlanet = {
      id: uid(),
      name: `Colonia ${state.planets.length}`,
      galaxy, system, position,
      temperature: virgin.temperature,
      resources: { metal: 500, crystal: 300, deuterium: 100 },
      buildings: {}, research: {}, fleet: {}, defenses: {},
      isHome: false,
      biome: virgin.biome,
      planetSize: virgin.planetSize,
      gravity: virgin.gravity,
      trait: virgin.trait,
    };

    const returnFleet = { ...mission.fleet };
    returnFleet.colonizer -= 1;
    if (returnFleet.colonizer <= 0) delete returnFleet.colonizer;

    let newState = { 
      ...state, 
      planets: [...state.planets, newPlanet],
      stats: { ...state.stats, coloniesFounded: state.stats.coloniesFounded + 1 }
    };

    return { state: newState, type: 'success', message: `🚩 ¡Nueva colonia fundada en [${galaxy}:${system}:${position}]! El colonizador se ha desmantelado para establecer el centro de mando.`, returnFleet };
  }

  if (mission.type === 'diplomacy') {
    const target = state.aiPlanets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
    let newState = { ...state };
    if (target) {
      const diploLvl = mission.from.buildings?.diploCenter || 0;
      const boost = 15 + diploLvl * 3;
      newState.aiPlanets = state.aiPlanets.map(p => p.id === target.id ? { ...p, relation: Math.min(100, (p.relation || 0) + boost) } : p);
      return { state: newState, type: 'success', message: `🤝 Delegación diplomática llegó a ${target.name}. Relación mejorada en +${boost} (Total: ${Math.min(100, (target.relation || 0) + boost)})`, returnFleet: mission.fleet };
    }
    return { state: newState, type: 'warning', message: `🤝 Imperio no encontrado en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}], misión cancelada`, returnFleet: mission.fleet };
  }

  if (mission.type === 'ally_trade') {
    const target = state.planets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
    let newState = { ...state };
    if (target) {
      const gift = mission.resources || { metal: 20000, crystal: 10000, deuterium: 5000 };
      newState = updatePlanet(newState, target.id, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + gift.metal,
          crystal: p.resources.crystal + gift.crystal,
          deuterium: p.resources.deuterium + gift.deuterium,
        },
      }));
      return { state: newState, type: 'success', message: `🤝 Flota comercial aliada llegó a ${target.name} trayendo regalos: +${fmt(gift.metal)}M, +${fmt(gift.crystal)}C, +${fmt(gift.deuterium)}D`, returnFleet: {} };
    }
    return { state: newState, type: 'info', message: `🤝 Flota mercantil se retiró.`, returnFleet: {} };
  }

  if (mission.type === 'espionage') {
    const target = state.aiPlanets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
    let newState = { ...state };

    if (target) {
      const spyTech = mission.from.research?.espionage || 0;
      const targetEspDef = target.espDefenseLvl || Math.floor((target.aiLevel || 1) * 0.5);
      const techDiff = spyTech - targetEspDef;

      const detectionChance = Math.max(0, Math.min(0.95, 0.20 - techDiff * 0.10));
      const detected = detectionChance > 0 && Math.random() < detectionChance;

      if (detected) {
        let newRelation = Math.max(-100, (target.relation || 0) - 20);
        let isWar = false;
        let pnaVal = target.pna;
        let allianceVal = target.alliance;
        let tradeVal = target.trade;
        if (newRelation <= -50) {
          newRelation = -100;
          isWar = true;
          pnaVal = false;
          allianceVal = false;
          tradeVal = false;
        }

        newState.reputation = Math.max(-100, (state.reputation || 0) - 5);
        newState.aiPlanets = state.aiPlanets.map(p => p.id === target.id ? {
          ...p,
          relation: newRelation,
          pna: pnaVal,
          alliance: allianceVal,
          trade: tradeVal
        } : p);

        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'warning',
          message: `⚠️ Sonda de espionaje detectada y destruida por ${target.name}. Relación reducida en -20.`,
          timestamp: Date.now()
        }];

        if (isWar && (target.pna || target.alliance || target.trade)) {
          newState.notifications = [...(newState.notifications || []), {
            id: uid(),
            type: 'error',
            message: `⚠️ Tratados cancelados con ${target.name} debido a hostilidades. ¡Se ha declarado la guerra!`,
            timestamp: Date.now()
          }];
        }

        return { state: newState, type: 'warning', message: `👁️ Sonda de espionaje detectada y neutralizada por ${target.name}`, returnFleet: {} };
      }

      let intelLevel = 'basic';
      let reportResources = null;
      let reportFleet = null;
      let reportDefenses = null;
      let reportBuildings = null;
      let extendedInfo = null;

      if (techDiff <= -3) {
        intelLevel = 'blocked';
        reportResources = { metal: '???', crystal: '???', deuterium: '???' };
        reportFleet = { lightFighter: '???' };
        reportDefenses = { rocketLauncher: '???' };
      } else if (techDiff <= 0) {
        intelLevel = 'low';
        const fleetPresent = Object.entries(target.fleet || {}).filter(([,q]) => q > 0).length > 0;
        reportResources = { metal: 'parcial', crystal: 'parcial', deuterium: 'parcial' };
        reportFleet = fleetPresent ? { estimated: true } : { none: true };
      } else if (techDiff <= 3) {
        intelLevel = 'medium';
        reportResources = {
          metal: Math.floor((target.resources?.metal || 0) * (0.7 + Math.random() * 0.3)),
          crystal: Math.floor((target.resources?.crystal || 0) * (0.7 + Math.random() * 0.3)),
          deuterium: Math.floor((target.resources?.deuterium || 0) * (0.7 + Math.random() * 0.3)),
        };
        reportFleet = { ...target.fleet };
        for (const key of Object.keys(reportFleet)) {
          reportFleet[key] = Math.floor(reportFleet[key] * (0.6 + Math.random() * 0.4));
        }
        reportDefenses = { ...target.defenses };
        for (const key of Object.keys(reportDefenses)) {
          reportDefenses[key] = Math.floor(reportDefenses[key] * (0.5 + Math.random() * 0.5));
        }
      } else if (techDiff <= 6) {
        intelLevel = 'high';
        reportResources = { ...target.resources };
        reportFleet = { ...target.fleet };
        reportDefenses = { ...target.defenses };
        reportBuildings = { ...target.buildings };
        extendedInfo = target.research ? { researchSnapshot: { ...target.research } } : null;
      } else {
        intelLevel = 'full';
        reportResources = { ...target.resources };
        reportFleet = { ...target.fleet };
        reportDefenses = { ...target.defenses };
        reportBuildings = { ...target.buildings };
        extendedInfo = {
          strategy: target.strategy,
          aggression: target.aggression,
          totalWins: target.totalWins || 0,
          totalLosses: target.totalLosses || 0,
          planetsConquered: target.planetsConquered || 0,
          planetsLost: target.planetsLost || 0,
          activityRecent: state.gameTick - (target.lastStrategyChange || 0) < 600 ? 'alta' : 'normal',
          expansionPattern: target.planetsConquered > target.planetsLost ? 'expansionista' : 'defensivo',
          behaviorPrediction: target.aggression > 0.6 ? 'probable ataque' : (target.diploTendency > 0.5 ? 'probable diplomacia' : 'incierto'),
          researchSnapshot: target.research ? { ...target.research } : null,
        };
      }

      const report = {
        id: uid(), timestamp: Date.now(),
        targetId: target.id,
        targetName: target.name,
        target: { name: target.name, galaxy: target.galaxy, system: target.system, position: target.position },
        coords: { galaxy: target.galaxy, system: target.system, position: target.position },
        intelLevel,
        resources: reportResources,
        buildings: reportBuildings,
        fleet: reportFleet,
        defenses: reportDefenses,
        extendedInfo,
      };
      const sr = [...(newState.spyReports || []), report];
      newState.spyReports = sr.length > 50 ? sr.slice(-50) : sr;
      return { state: newState, type: 'info', message: `👁️ ${intelLevel === 'blocked' ? 'Espionaje bloqueado' : `Informe de espionaje (${intelLevel}) de ${target.name}`}`, returnFleet: mission.fleet };
    }
    return { state: newState, type: 'warning', message: `👁️ No hay nada en [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`, returnFleet: mission.fleet };
  }

  if (mission.type === 'transport') {
    const target = state.planets.find(p => p.galaxy === mission.to.galaxy && p.system === mission.to.system && p.position === mission.to.position);
    let newState = { ...state };
    if (target) {
      newState = updatePlanet(newState, target.id, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + (mission.resources?.metal || 0),
          crystal: p.resources.crystal + (mission.resources?.crystal || 0),
          deuterium: p.resources.deuterium + (mission.resources?.deuterium || 0),
        },
      }));
      return { state: newState, type: 'success', message: `📦 Transporte completado a ${target.name}`, returnFleet: mission.fleet };
    }
    return { state: newState, type: 'warning', message: `📦 Destino no encontrado, flota regresando`, returnFleet: mission.fleet };
  }

  if (mission.type === 'trade_send') {
    const target = state.aiPlanets.find(p => p.id === mission.to.id);
    let newState = { ...state };
    if (target) {
      newState.aiPlanets = state.aiPlanets.map(p => {
        if (p.id === target.id) {
          return {
            ...p,
            resources: {
              metal: (p.resources?.metal || 0) + (mission.resources?.metal || 0),
              crystal: (p.resources?.crystal || 0) + (mission.resources?.crystal || 0),
              deuterium: (p.resources?.deuterium || 0) + (mission.resources?.deuterium || 0),
            }
          };
        }
        return p;
      });
      return { state: newState, type: 'success', message: `📦 Tus cargueras entregaron los recursos a ${target.name}. Iniciando viaje de retorno.`, returnFleet: mission.fleet };
    }
    return { state: newState, type: 'warning', message: `📦 Destino de comercio de la IA no encontrado, cargueras retornando`, returnFleet: mission.fleet };
  }

  if (mission.type === 'trade_receive') {
    const target = state.planets.find(p => p.id === mission.to.id);
    let newState = { ...state };
    if (target) {
      newState = updatePlanet(newState, target.id, p => ({
        ...p,
        resources: {
          metal: p.resources.metal + (mission.resources?.metal || 0),
          crystal: p.resources.crystal + (mission.resources?.crystal || 0),
          deuterium: p.resources.deuterium + (mission.resources?.deuterium || 0),
        }
      }));
      return { state: newState, type: 'success', message: `📦 Los cargueros de ${mission.from.name} entregaron recursos en tu planeta ${target.name}.`, returnFleet: mission.fleet };
    }
    return { state: newState, type: 'warning', message: `📦 Planeta destino no existe, cargueros de la IA retornando`, returnFleet: mission.fleet };
  }

  if (mission.type === 'recycle') {
    const debris = state.debrisField || { metal: 0, crystal: 0 };
    const isCommercial = mission.from.specialization === 'commercial';
    const cargoMultiplier = isCommercial ? 1.5 : 1.0;
    const maxCargo = Object.entries(fleet).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);
    const collected = {
      metal: Math.min(debris.metal, maxCargo / 2),
      crystal: Math.min(debris.crystal, maxCargo / 2),
    };
    let newState = updatePlanet(state, mission.from.id, p => ({
      ...p,
      resources: {
        metal: p.resources.metal + collected.metal,
        crystal: p.resources.crystal + collected.crystal,
        deuterium: p.resources.deuterium,
      },
    }));
    newState.debrisField = {
      metal: debris.metal - collected.metal,
      crystal: debris.crystal - collected.crystal,
    };
    return { state: newState, type: 'success', message: `♻️ Reciclado: ${fmt(collected.metal)}M, ${fmt(collected.crystal)}C`, returnFleet: mission.fleet };
  }

  if (mission.type === 'expedition') {
    const fleet = mission.fleet;
    const totalShips = Object.values(fleet).reduce((a, b) => a + b, 0);
    const isCommercial = mission.from.specialization === 'commercial';
    const cargoMultiplier = isCommercial ? 1.5 : 1.0;
    const cargoCap = Object.entries(fleet).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);
    
    const destPoi = getPOIAtCoordinates(mission.to.galaxy, mission.to.system, mission.to.position);
    const isPrecursorRuins = destPoi && destPoi.type === 'precursor_ruins';
    
    let roll = Math.random();
    if (isPrecursorRuins && roll > 0.33) {
      roll = roll * 0.5;
    }

    const events = [];

    if (roll < 0.08) {
      const fightWon = Math.random() < 0.65;
      if (fightWon) {
        const loot = { metal: Math.floor((5000 + Math.random() * 15000) * 50), crystal: Math.floor((3000 + Math.random() * 8000) * 50), deuterium: Math.floor((1000 + Math.random() * 5000) * 50) };
        let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + loot.metal, crystal: p.resources.crystal + loot.crystal, deuterium: p.resources.deuterium + loot.deuterium } }));
        events.push(`⚔️ ¡Emboscada Pirata Repelida! Tras un combate intenso en los anillos de un gigante gaseoso, capturaste sus cargueras: +${fmt(loot.metal)}M, +${fmt(loot.crystal)}C, +${fmt(loot.deuterium)}D`);
        return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
      } else {
        const lossRatio = 0.1 + Math.random() * 0.2;
        let survivors = {}; let totalLost = 0;
        for (const [id, qty] of Object.entries(fleet)) {
          const lost = Math.max(0, Math.floor(qty * lossRatio * Math.random()));
          if (lost > 0) totalLost += lost;
          if (qty - lost > 0) survivors[id] = qty - lost;
        }
        events.push(`💀 ¡Emboscada Pirata Desastrosa! Una flota de corsarios emboscó a tus naves desde el cinturón de asteroides. Perdiste ${totalLost} naves en la retirada.`);
        return { state, type: 'error', message: events.join(' • '), returnFleet: survivors || fleet };
      }
    }

    if (roll < 0.15) {
      const techNames = Object.keys(RESEARCH);
      const foundTech = techNames[Math.floor(Math.random() * techNames.length)];
      const tech = RESEARCH[foundTech];
      if (tech) {
        const currentLvl = state.research[foundTech] || 0;
        let newState = { ...state, research: { ...state.research, [foundTech]: currentLvl + 1 } };
        events.push(`🛸 ¡Archivo Histórico Alienígena! Tu sonda localizó una baliza de datos de una civilización extinta. Logramos descifrar planos científicos: ${tech.icon} ${tech.name} sube al nivel ${currentLvl + 1}`);
        return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet, foundArtifact: true };
      }
    }

    if (roll < 0.23) {
      const rareShips = ['battleship', 'destroyer', 'bomber', 'cruiser'];
      const foundId = rareShips[Math.floor(Math.random() * rareShips.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      const retFleet = { ...fleet };
      retFleet[foundId] = (retFleet[foundId] || 0) + qty;
      events.push(`🚀 ¡Astillero Derrelicto! Encontraste un antiguo hangar militar a la deriva y lograste reactivar los reactores de soporte: ${qty}x ${SHIPS[foundId].name} se unen a tu flota.`);
      return { state, type: 'success', message: events.join(' • '), returnFleet: retFleet };
    }

    if (roll < 0.33) {
      const multiplier = Math.max(1, cargoCap / 6000) * 50;
      const bonus = { metal: Math.floor((4000 + Math.random() * 16000) * multiplier), crystal: Math.floor((3000 + Math.random() * 10000) * multiplier), deuterium: Math.floor((1500 + Math.random() * 6000) * multiplier) };
      let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + bonus.metal, crystal: p.resources.crystal + bonus.crystal, deuterium: p.resources.deuterium + bonus.deuterium } }));
      events.push(`☄️ ¡Cinturón de Asteroides Minerales! Tus naves de carga realizaron una operación de minería a gran escala: +${fmt(bonus.metal)} Metal, +${fmt(bonus.crystal)} Cristal, +${fmt(bonus.deuterium)} Deuterio`);
      return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
    }

    if (roll < 0.40) {
      const warpBonus = Math.random() < 0.6;
      if (warpBonus) {
        const shipIds = Object.keys(SHIPS).filter(id => id !== 'deathstar' && SHIPS[id].cat === 'military');
        const foundId = shipIds[Math.floor(Math.random() * shipIds.length)];
        const qty = 2 + Math.floor(Math.random() * 4);
        const retFleet = { ...fleet };
        retFleet[foundId] = (retFleet[foundId] || 0) + qty;
        events.push(`🌀 ¡Brecha Dimensional! El hiperespacio se plegó sobre sí mismo de forma anómala, materializando naves extraviadas de otras épocas: +${qty}x ${SHIPS[foundId].name}`);
        return { state, type: 'success', message: events.join(' • '), returnFleet: retFleet };
      } else {
        const lossRatio = 0.15;
        let survivors = {}; let totalLost = 0;
        for (const [id, qty] of Object.entries(fleet)) {
          const lost = Math.max(0, Math.floor(qty * lossRatio * Math.random()));
          if (lost > 0) totalLost += lost;
          if (qty - lost > 0) survivors[id] = qty - lost;
        }
        events.push(`🌀 ¡Falla del Hiper-Motor! La fuerza gravitatoria de una singularidad desgarro la estructura molecular de algunas de tus naves: ${totalLost} naves perdidas en el vacío.`);
        return { state, type: 'error', message: events.join(' • '), returnFleet: survivors || fleet };
      }
    }

    if (roll < 0.48) {
      const refund = { metal: Math.floor((10000 + Math.random() * 25000) * 50), crystal: Math.floor((8000 + Math.random() * 15000) * 50) };
      let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium } }));
      events.push(`🏛️ ¡Contenedores Mercantes! Hallaron contenedores de carga criogénica sellados que contenían valiosas aleaciones comerciales: +${fmt(refund.metal)} Metal, +${fmt(refund.crystal)} Cristal`);
      return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
    }

    if (roll < 0.55) {
      const deutBonus = Math.floor((8000 + Math.random() * 24000) * 50);
      let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { ...p.resources, deuterium: p.resources.deuterium + deutBonus } }));
      events.push(`✨ ¡Nebulosa Radiante! Los sintetizadores cargaron al máximo los depósitos absorbiendo plasma de deuterio de alta pureza de la nube espacial: +${fmt(deutBonus)} Deuterio`);
      return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
    }

    if (roll < 0.61) {
      let newState = { ...state };
      let temporalAnomalyHappened = false;
      if (newState.buildQueue && newState.buildQueue.length > 0) {
        newState.buildQueue = newState.buildQueue.map(item => {
          if (item.planetId === mission.from.id) {
            temporalAnomalyHappened = true;
            return { ...item, endTime: item.endTime - 120000 };
          }
          return item;
        });
      }
      if (newState.researchQueue && newState.researchQueue.length > 0) {
        newState.researchQueue = newState.researchQueue.map(item => {
          temporalAnomalyHappened = true;
          return { ...item, endTime: item.endTime - 120000 };
        });
      }
      if (temporalAnomalyHappened) {
        events.push(`⏳ ¡Anomalía Espacio-Temporal! La flota atravesó un campo crono-activo que aceleró el flujo del tiempo local. Los proyectos de construcción e investigación activos avanzaron 2 minutos.`);
      } else {
        events.push(`⏳ ¡Anomalía Espacio-Temporal! El hiperespacio sufrió una leve fluctuación temporal, pero no se reportaron efectos en el sector al estar las colas de desarrollo inactivas.`);
      }
      return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
    }

    if (roll < 0.67) {
      const damagedFleet = {};
      let lostCount = 0;
      for (const [id, qty] of Object.entries(fleet)) {
        const isMilitary = SHIPS[id]?.cat === 'military';
        if (isMilitary) {
          const lost = Math.floor(qty * 0.1);
          lostCount += lost;
          if (qty - lost > 0) {
            damagedFleet[id] = qty - lost;
          }
        } else {
          damagedFleet[id] = qty;
        }
      }
      if (lostCount > 0) {
        events.push(`☢️ ¡Tormenta de Radiación Cósmica! Una oleada de partículas ionizantes atravesó el sector dañando las naves de combate expuestas. Perdiste un 10% de la armada de asalto (Total: -${lostCount} naves).`);
        return { state, type: 'error', message: events.join(' • '), returnFleet: damagedFleet };
      } else {
        events.push(`☢️ ¡Tormenta de Radiación Cósmica! Los escudos deflectores absorbieron la radiación sin sufrir bajas estructurales.`);
        return { state, type: 'warning', message: events.join(' • '), returnFleet: fleet };
      }
    }

    if (roll < 0.73) {
      let foundPoi = null;
      let foundCoords = null;
      const startSys = mission.from.system || 1;
      const startGal = mission.from.galaxy || 1;
      
      outerLoop:
      for (let g = startGal; g <= Math.min(5, startGal + 1); g++) {
        for (let s = Math.max(1, startSys - 5); s <= Math.min(100, startSys + 5); s++) {
          for (let p = 1; p <= 15; p++) {
            const poi = getPOIAtCoordinates(g, s, p);
            if (poi) {
              const isOccupiedByPlayer = state.planets.some(pl => pl.galaxy === g && pl.system === s && pl.position === p);
              const isOccupiedByAI = state.aiPlanets.some(pl => pl.galaxy === g && pl.system === s && pl.position === p && !pl.isVirgin);
              if (!isOccupiedByPlayer && !isOccupiedByAI) {
                foundPoi = poi;
                foundCoords = { galaxy: g, system: s, position: p };
                break outerLoop;
              }
            }
          }
        }
      }

      if (foundPoi) {
        events.push(`📡 ¡Baliza Precursora descifrada! Los escáneres interceptaron coordenadas estables que confirman un ${foundPoi.name} en [${foundCoords.galaxy}:${foundCoords.system}:${foundCoords.position}].`);
      } else {
        events.push(`📡 ¡Baliza Estelar Detectada! Hallamos un transpondedor orbital antiguo, pero sus datos geográficos estaban demasiado corruptos para leerlos.`);
      }
      return { state, type: 'success', message: events.join(' • '), returnFleet: fleet };
    }

    const rollEmpty = Math.random();
    if (rollEmpty < 0.25) {
      return { state, type: 'info', message: '🔭 Sector Inerte. Los sensores no detectaron señales de vida ni yacimientos en 2 pársecs.', returnFleet: fleet };
    } else if (rollEmpty < 0.5) {
      return { state, type: 'warning', message: '🔭 Radiación Cósmica. Las naves reportaron lecturas inestables pero no se produjo ningún incidente.', returnFleet: fleet };
    } else if (rollEmpty < 0.7) {
      return { state, type: 'info', message: '🔭 Nubes de Polvo Interestelar. La visibilidad es nula, el comandante ordenó regresar para evitar colisiones.', returnFleet: fleet };
    } else if (rollEmpty < 0.88) {
      return { state, type: 'success', message: '🔭 Pequeños Yacimientos. Lograron extraer recursos flotantes sueltos: +1K Metal, +600 Cristal', returnFleet: fleet };
    } else {
      const smallShips = ['espionageProbe', 'smallCargo', 'lightFighter'];
      const foundId = smallShips[Math.floor(Math.random() * smallShips.length)];
      const qty = 1 + Math.floor(Math.random() * 3);
      const retFleet = { ...fleet };
      retFleet[foundId] = (retFleet[foundId] || 0) + qty;
      return { state, type: 'success', message: `🔭 Flota de Reconocimiento. Encontraron sondas perdidas operativas que se reincorporaron: +${qty}x ${SHIPS[foundId].name}`, returnFleet: retFleet };
    }
  }

  return { state, type: 'info', message: 'Misión completada' };
  } catch (e) {
    console.error('[Ascensión] processMission top-level error:', e, mission?.type);
    return { state, type: 'error', message: 'Error interno procesando misión', returnFleet: mission?.fleet || {} };
  }
};

const returnFleetToOrigin = (state, mission) => {
  const fleet = mission.fleet || {};
  if (Object.keys(fleet).length === 0) return state;

  const isPlayerOrigin = state.planets.some(p => p.id === mission.from.id);
  if (isPlayerOrigin) {
    return updatePlanet(state, mission.from.id, p => ({
      ...p,
      fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
        acc[id] = (acc[id] || 0) + qty;
        return acc;
      }, { ...p.fleet }),
    }));
  }

  const isAIOrigin = state.aiPlanets.some(p => p.id === mission.from.id);
  if (isAIOrigin) {
    return {
      ...state,
      aiPlanets: state.aiPlanets.map(p => {
        if (p.id === mission.from.id) {
          return {
            ...p,
            fleet: Object.entries(fleet).reduce((acc, [id, qty]) => {
              acc[id] = (acc[id] || 0) + qty;
              return acc;
            }, { ...(p.fleet || {}) }),
          };
        }
        return p;
      })
    };
  }

  console.warn('[Ascensión] returnFleetToOrigin: origin planet no longer exists', mission.from);
  return state;
};

const processEvent = (event, state) => {
  const planet = state.planets.find(p => p.id === state.currentPlanetId) || state.planets[0];
  let newState = { ...state };
  let desc = '', type = 'info';

  switch (event.type) {
    case 'resource': {
      const bonus = { metal: 500 + Math.random() * 3000, crystal: 300 + Math.random() * 2000 };
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...p.resources, metal: p.resources.metal + bonus.metal, crystal: p.resources.crystal + bonus.crystal },
      }));
      desc = `+${fmt(bonus.metal)}M, +${fmt(bonus.crystal)}C`;
      type = 'success';
      break;
    }
    case 'trade': {
      const bonus = 1000 + Math.random() * 5000;
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...p.resources, deuterium: p.resources.deuterium + bonus },
      }));
      desc = `+${fmt(bonus)} Deuterio`;
      type = 'success';
      break;
    }
    case 'hazard': {
      const loss = 0.05 + Math.random() * 0.1;
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: {
          metal: p.resources.metal * (1 - loss),
          crystal: p.resources.crystal * (1 - loss),
          deuterium: p.resources.deuterium * (1 - loss),
        },
      }));
      desc = `-${(loss * 100).toFixed(0)}% recursos`;
      type = 'warning';
      break;
    }
    case 'tech': {
      const techKeys = Object.keys(RESEARCH);
      const randomTech = techKeys[Math.floor(Math.random() * techKeys.length)];
      const currentLvl = state.research[randomTech] || 0;
      newState.research = { ...newState.research, [randomTech]: currentLvl + 1 };
      desc = `+1 nivel en ${RESEARCH[randomTech].name}`;
      type = 'success';
      break;
    }
    default: {
      const bonus = { metal: 300 + Math.random() * 2000, crystal: 200 + Math.random() * 1500 };
      newState = updatePlanet(newState, planet.id, p => ({
        ...p, resources: { ...p.resources, metal: p.resources.metal + bonus.metal, crystal: p.resources.crystal + bonus.crystal },
      }));
      desc = `Hallazgo inesperado: +${fmt(bonus.metal)}M, +${fmt(bonus.crystal)}C`;
      type = 'success';
      break;
    }
  }
  return { state: newState, desc, type };
};

export { processMission, returnFleetToOrigin, processEvent };
