import { updatePlanet } from '../core.jsx';
import { SHIPS } from '../data/gameData.js';
import { calcStorage, getEffectiveTech, fmt, uid } from '../utils/formulas.js';
import { simulateCombat } from '../combat.js';

export const handleCombatMission = (mission, state) => {
  const attackerTech = mission.isAI ? (mission.from.research || {}) : state.research;
  const fleet = mission.fleet;

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

  // Intercepción de Patrulla Orbital y de Sistema Solar del jugador
  let interceptedByPatrol = null;
  if (mission.isAI && targetPlanet && Array.isArray(state.patrols)) {
    // Buscar patrulla orbital en este planeta exacto
    const orbitalPatrol = state.patrols.find(p => p.planetId === targetPlanet.id && p.status === 'active' && p.patrolType === 'orbital');
    // O patrulla de sistema en el mismo sistema solar
    const systemPatrol = state.patrols.find(p => p.galaxy === targetPlanet.galaxy && p.system === targetPlanet.system && p.status === 'active' && p.patrolType === 'system');
    
    const activePatrol = orbitalPatrol || systemPatrol;
    if (activePatrol && activePatrol.fleet && Object.keys(activePatrol.fleet).length > 0) {
      interceptedByPatrol = activePatrol;
      Object.entries(activePatrol.fleet).forEach(([id, qty]) => {
        mergedDefFleet[id] = (mergedDefFleet[id] || 0) + qty;
      });
      supportText += ` (🚨 ¡INTERCEPTADO EN ÓRBITA por tu ${activePatrol.patrolType === 'orbital' ? 'Patrulla Orbital' : 'Policía de Sistema'}!)`;
    }
  }

  if (mission.isAI && targetPlanet) {
    const activeAlly = state.aiPlanets.find(ai => ai.clanId && ai.relation >= 60);
    if (activeAlly && activeAlly.fleet) {
      Object.entries(activeAlly.fleet).forEach(([id, qty]) => {
        const supportQty = Math.floor(qty * 0.4);
        if (supportQty > 0) {
          mergedDefFleet[id] = (mergedDefFleet[id] || 0) + supportQty;
        }
      });
      supportText += ` (Reforzado por la flota aliada del Imperio ${activeAlly.name})`;
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
  let loot = { metal: 0, crystal: 0, deuterium: 0 };

  // Registrar bajas y victorias en SQLite para naves con matrícula
  if (!mission.isAI && typeof window !== "undefined" && window.electronAPI && typeof window.electronAPI.dbResolveCombatShips === "function") {
    const targetName = targetAI ? targetAI.name : (targetPlanet?.name || 'Sector Hostil');
    window.electronAPI.dbResolveCombatShips({
      missionId: mission.id,
      lossesByChassis: result.atkLosses || {},
      battleDetails: {
        gameTick: state.gameTick || 0,
        location: `${targetName} [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`,
        winner: result.winner
      }
    }).catch(e => console.warn("[Ascensión DB] Error al resolver combate en SQLite:", e));
  }

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
        const defLoot = {
          metal: Math.min(excess.metal, attackerCargo || maxLoot * (excess.metal / Math.max(1, totalExcess))) * lootReduction,
          crystal: Math.min(excess.crystal, attackerCargo || maxLoot * (excess.crystal / Math.max(1, totalExcess))) * lootReduction,
          deuterium: Math.min(excess.deuterium, attackerCargo || maxLoot * (excess.deuterium / Math.max(1, totalExcess))) * lootReduction,
        };
        newState = updatePlanet(newState, targetPlanet.id, p => ({
          ...p,
          resources: {
            metal: p.resources.metal - defLoot.metal,
            crystal: p.resources.crystal - defLoot.crystal,
            deuterium: p.resources.deuterium - defLoot.deuterium,
          },
          fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors },
        }));
        type = 'error'; message = `💀 Batalla perdida${supportText}. Perdiste ${fmt(defLoot.metal)}M, ${fmt(defLoot.crystal)}C, ${fmt(defLoot.deuterium)}D (Protegido por almacenes: ${fmt(protectedLimit.metal)}M/${fmt(protectedLimit.crystal)}C)`;
      }
    } else {
      newState.stats = { ...newState.stats, combatsDraw: newState.stats.combatsDraw + 1 };
      newState = updatePlanet(newState, targetPlanet.id, p => ({ ...p, fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors } }));
      type = 'warning'; message = `🤝 Combate empatado${supportText}`;
    }
  } else {
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
        const aiRes = targetAI.resources || { metal: 0, crystal: 0, deuterium: 0 };
        const totalAvail = aiRes.metal + aiRes.crystal + aiRes.deuterium;
        const halfAvail = totalAvail * 0.5;
        const canTake = Math.min(maxCargo, halfAvail);

        if (totalAvail > 0) {
          loot = {
            metal: Math.floor(canTake * (aiRes.metal / totalAvail)),
            crystal: Math.floor(canTake * (aiRes.crystal / totalAvail)),
            deuterium: Math.floor(canTake * (aiRes.deuterium / totalAvail)),
          };
        }

        newState.aiPlanets = state.aiPlanets.map(p => {
          if (p.id === targetAI.id) {
            return {
              ...p,
              resources: {
                metal: Math.max(0, (p.resources?.metal || 0) - loot.metal),
                crystal: Math.max(0, (p.resources?.crystal || 0) - loot.crystal),
                deuterium: Math.max(0, (p.resources?.deuterium || 0) - loot.deuterium),
              },
              fleet: result.defShipSurvivors,
              defenses: { ...p.defenses, ...result.defDefenseSurvivors },
              relation: newRelation,
              pna: pnaVal,
              alliance: allianceVal,
              trade: tradeVal,
              lastAttackedBy: state.playerName,
              lastAttackedTick: state.gameTick,
            };
          }
          return p;
        });
      } else {
        newState.aiPlanets = state.aiPlanets.map(p => {
          if (p.id === targetAI.id) {
            return {
              ...p,
              fleet: result.defShipSurvivors,
              defenses: { ...p.defenses, ...result.defDefenseSurvivors },
              relation: newRelation,
              pna: pnaVal,
              alliance: allianceVal,
              trade: tradeVal,
              lastAttackedBy: state.playerName,
              lastAttackedTick: state.gameTick,
            };
          }
          return p;
        });
      }

      if (isWar && (targetAI.pna || targetAI.alliance || targetAI.trade)) {
        newState.notifications = [...(newState.notifications || []), {
          id: uid(),
          type: 'error',
          message: `⚠️ Tratados cancelados con ${targetAI.name} debido al ataque. ¡El imperio enemigo declara la guerra!`,
          timestamp: Date.now()
        }];
      }
    } else if (targetPlanet) {
      if (result.winner === 'attacker') {
        const originPlanet = state.planets.find(p => p.id === mission.from.id);
        const isCommercial = originPlanet?.specialization === 'commercial';
        const cargoMultiplier = isCommercial ? 1.5 : 1.0;
        const maxCargo = Object.entries(result.atkSurvivors).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);
        const storage = calcStorage(targetPlanet.buildings);
        const excess = {
          metal: Math.max(0, targetPlanet.resources.metal - storage.metal * 0.1),
          crystal: Math.max(0, targetPlanet.resources.crystal - storage.crystal * 0.1),
          deuterium: Math.max(0, targetPlanet.resources.deuterium - storage.deuterium * 0.1),
        };
        const totalExcess = excess.metal + excess.crystal + excess.deuterium;
        const canTake = Math.min(maxCargo, totalExcess * 0.5);
        if (totalExcess > 0) {
          loot = {
            metal: Math.floor(canTake * (excess.metal / totalExcess)),
            crystal: Math.floor(canTake * (excess.crystal / totalExcess)),
            deuterium: Math.floor(canTake * (excess.deuterium / totalExcess)),
          };
        }
        newState = updatePlanet(newState, targetPlanet.id, p => ({
          ...p,
          resources: {
            metal: p.resources.metal - loot.metal,
            crystal: p.resources.crystal - loot.crystal,
            deuterium: p.resources.deuterium - loot.deuterium,
          },
          fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors },
        }));
      } else {
        newState = updatePlanet(newState, targetPlanet.id, p => ({ ...p, fleet: result.defShipSurvivors, defenses: { ...p.defenses, ...result.defDefenseSurvivors } }));
      }
    }

    if (result.winner === 'attacker') {
      newState.stats = { ...newState.stats, combatsWon: newState.stats.combatsWon + 1 };
      type = 'success';
      const lootStr = (loot.metal + loot.crystal + loot.deuterium > 0) ? ` Botín: ${fmt(loot.metal)}M/${fmt(loot.crystal)}C/${fmt(loot.deuterium)}D.` : '';
      message = `🏆 ¡Victoria en el asalto! Escombros: ${fmt(result.debris.metal)}M/${fmt(result.debris.crystal)}C.${lootStr}`;
      returnFleet = { ...result.atkSurvivors };
    } else if (result.winner === 'defender') {
      newState.stats = { ...newState.stats, combatsLost: newState.stats.combatsLost + 1 };
      type = 'error'; message = `💀 Ataque repelido. La flota atacante fue destruida o rechazada.`;
      returnFleet = { ...result.atkSurvivors };
    } else {
      newState.stats = { ...newState.stats, combatsDraw: newState.stats.combatsDraw + 1 };
      type = 'warning'; message = `🤝 Asalto en tablas tras el intercambio de fuego.`;
      returnFleet = { ...result.atkSurvivors };
    }
  }

  // Tactical Event modal generation
  let tacticalEvent = null;
  const isPlayerAttacking = !mission.isAI;
  const isPlayerDefending = !!mission.isAI;

  if (isPlayerAttacking) {
    const isWin = result.winner === 'attacker';
    const isLoss = result.winner === 'defender';
    const targetName = targetAI ? targetAI.name : (targetPlanet?.name || 'Objetivo desconocido');
    tacticalEvent = {
      id: uid(),
      type: 'combat',
      combatResult: isWin ? 'victory' : isLoss ? 'defeat' : 'draw',
      title: isWin ? '¡Victoria en el Asalto Espacial!' : isLoss ? 'Asalto Fallido - Flota Repelida' : 'Asalto Espacial en Tablas',
      subtitle: `Operación contra ${targetName} [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`,
      description: isWin 
        ? `Nuestras fuerzas han quebrado las defensas enemigas. Se han asegurado escombros y se han saqueado los almacenes de suministros antes del repliegue.`
        : isLoss 
        ? `Las defensas y naves enemigas superaron la capacidad de fuego de nuestra flota. Las unidades supervivientes inician el retorno a la base.`
        : `Ambos bandos intercambiaron fuego intenso sin un claro vencedor tras agotar munición y escudos.`,
      image: isWin ? 'Nave de Batalla.webp' : isLoss ? 'wreckField.webp' : 'Crucero.webp',
      resources: loot,
      debris: result.debris,
      losses: {
        playerLosses: atkLostTotal,
        enemyLosses: defLostTotal,
      },
      targetPlanetId: mission.from?.id,
      ministryId: 'defense',
      ministryName: 'Ministerio de Defensa y Operaciones Navales',
      voiceText: isWin 
        ? `Victoria confirmada en el asalto a ${targetName}. Botín asegurado.` 
        : `Informe de combate: ataque repelido en ${targetName}. Flota retornando.`
    };
  } else if (isPlayerDefending && targetPlanet) {
    const isWin = result.winner === 'defender';
    const isLoss = result.winner === 'attacker';
    tacticalEvent = {
      id: uid(),
      type: 'combat',
      combatResult: isWin ? 'victory' : isLoss ? 'defeat' : 'draw',
      title: isWin ? '¡Ataque Enemigo Repelido!' : isLoss ? '¡Alerta Roja: Brecha Defensiva!' : 'Enfrentamiento Orbital Empatado',
      subtitle: `Defensa de ${targetPlanet.name} [${targetPlanet.galaxy}:${targetPlanet.system}:${targetPlanet.position}]`,
      description: isWin
        ? `Nuestras baterías de defensa y guarnición orbital han aniquilado o puesto en fuga a la flota invasora. Los restos orbitales están listos para reciclar.`
        : isLoss
        ? `Las defensas planetarias han caído. El enemigo ha saqueado recursos vitales antes de retirarse.`
        : `El intercambio de disparos ha cesado sin que el invasor lograra doblegar el perímetro.`,
      image: isWin ? 'Nave de Batalla.webp' : isLoss ? 'wreckField.webp' : 'Crucero.webp',
      debris: result.debris,
      losses: {
        playerLosses: defLostTotal,
        enemyLosses: atkLostTotal,
      },
      targetPlanetId: targetPlanet.id,
      ministryId: 'defense',
      ministryName: 'Ministerio de Defensa y Operaciones Navales',
      voiceText: isWin 
        ? `Alerta táctica: El ataque enemigo en ${targetPlanet.name} ha sido repelido con éxito.` 
        : `Atención: El perímetro defensivo en ${targetPlanet.name} ha sido vulnerado.`
    };
  }

  // Debris field update
  const currentDebris = newState.debrisField || { metal: 0, crystal: 0 };
  newState.debrisField = {
    metal: currentDebris.metal + (result.debris.metal || 0),
    crystal: currentDebris.crystal + (result.debris.crystal || 0),
  };

  return { state: newState, type, message, returnFleet, tacticalEvent };
};
