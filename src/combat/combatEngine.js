import { getShipStats, getDefenseStats, calcCustomShipCost } from '../utils/formulas.js';
import { DEFENSES, SHIPS } from '../data/gameData.js';

export const simulateCombat = (attackerFleet, defenderFleet, defenderDefenses, atkTech, defTech, maxRounds = 6, blueprints = [], atkFaction = 'human', defFaction = 'human', autoRetreat = false, formation = 'standard', intelBonus = 0, relics = []) => {
  try {
  const initialAtkCount = Object.values(attackerFleet).reduce((a, b) => a + b, 0);
  const totalUnits = initialAtkCount + Object.values(defenderFleet).reduce((a, b) => a + b, 0) + Object.values(defenderDefenses).reduce((a, b) => a + b, 0);
  const useGroup = totalUnits > 500;
  let didRetreat = false;

  if (!useGroup) {
    const units = [];
    for (const [id, qty] of Object.entries(attackerFleet)) {
      if (qty > 0) {
        const s = getShipStats(id, atkTech, blueprints, atkFaction, {}, relics);
        if (s) {
          let hull = s.hull;
          let shd = s.shd;
          let atk = s.atk;

          // Integración de Doctrinas de Combate de Defensa
          const defMins = (atkTech && atkTech.ministries) || {};
          const combatDoctrine = defMins.defense?.combatDoctrine || 'balanced';
          const defMinister = defMins.defense?.minister;
          
          if (combatDoctrine === 'offensive') {
            atk *= 1.15;
            shd *= 0.90;
          } else if (combatDoctrine === 'defensive') {
            shd *= 1.15;
            atk *= 0.90;
          }

          if (defMinister?.bonus === 'fleetAttack') {
            atk *= 1.12;
          }

          if (formation === 'vanguard') {
            atk *= 1.10;
            shd *= 0.85;
          } else if (formation === 'artillery') {
            atk *= 1.25;
            shd *= 1.10;
          } else if (formation === 'escort') {
            shd *= 1.15;
            atk *= 0.95;
          } else if (formation === 'raider') {
            atk *= 1.15;
            shd *= 0.90;
          }
          if (intelBonus > 0) atk *= (1 + intelBonus);
          for (let i = 0; i < qty; i++) units.push({ side: 'attacker', id, hull, maxHull: hull, shield: shd, maxShield: shd, atk, rapid: s.rapid, alive: true });
        }
      }
    }
    for (const [id, qty] of Object.entries(defenderFleet)) {
      if (qty > 0) {
        const s = getShipStats(id, defTech, blueprints, defFaction, {}, relics);
        if (s) for (let i = 0; i < qty; i++) units.push({ side: 'defender', id, hull: s.hull, maxHull: s.hull, shield: s.shd, maxShield: s.shd, atk: s.atk, rapid: s.rapid, alive: true });
      }
    }
    // Revisar si el defensor dispone de guerra electrónica (ECM)
    const hasECM = (defenderDefenses?.electronicWarfareHub || 0) > 0;
    const ecmPenalty = hasECM ? 0.80 : 1.0; // -20% daño recibido de flotas en órbita

    for (const [id, qty] of Object.entries(defenderDefenses)) {
      if (qty > 0 && DEFENSES[id]) {
        const ds = getDefenseStats(id, defTech, defFaction, {}, relics);
        const dDef = DEFENSES[id];
        for (let i = 0; i < qty; i++) {
          units.push({
            side: 'defender',
            id,
            hull: ds.hull,
            maxHull: ds.hull,
            shield: ds.shd,
            maxShield: ds.shd,
            atk: ds.atk,
            rapid: dDef.rapid || {},
            alive: true,
            shieldType: dDef.shieldType || 'standard',
            isRetractable: !!dDef.isRetractable,
          });
        }
      }
    }

    const rounds = []; let round = 0;
    const alive = (side) => units.filter(u => u.side === side && u.alive);

    while (round < maxRounds) {
      round++;
      units.forEach(u => { if (u.alive) u.shield = u.maxShield; });
      const atk = alive('attacker'), def = alive('defender');
      if (atk.length === 0 || def.length === 0) break;

      if (autoRetreat && atk.length < initialAtkCount * 0.3) {
        didRetreat = true;
        rounds.push({ round, atkAlive: atk.length, defAlive: def.length, atkDmg: 0, defDmg: 0, retreated: true });
        break;
      }

      let atkDmg = 0, defDmg = 0;
      for (const a of atk) {
        let shots = 1, safety = 100;
        while (shots > 0 && safety-- > 0) {
          const t = alive('defender'); if (t.length === 0) break;
          // Las baterías retráctiles están ocultas bajo roca en Ronda 1 y no pueden ser blanco directo si hay otros objetivos
          const validTargets = (round === 1 && t.some(u => !u.isRetractable))
            ? t.filter(u => !u.isRetractable)
            : t;
          const target = validTargets[Math.floor(Math.random() * validTargets.length)];

          let dmg = a.atk * ecmPenalty;

          // Absorción de daño según el tipo de escudo
          if (target.shieldType === 'thermal') {
            // Escudo térmico: gran absorción contra cazas/bombarderos de energía
            dmg *= 0.85;
          } else if (target.shieldType === 'kinetic') {
            // Escudo cinético: neutraliza impactos balísticos directos
            dmg *= 0.85;
          }

          if (target.shield >= dmg) { target.shield -= dmg; dmg = 0; }
          else { dmg -= target.shield; target.shield = 0; target.hull -= dmg; }
          atkDmg += a.atk * ecmPenalty;
          if (target.hull <= 0 || (target.hull < target.maxHull * 0.7 && Math.random() < (1 - target.hull / target.maxHull))) {
            target.alive = false;
          }
          const rf = a.rapid[target.id] || 0;
          if (rf > 1 && Math.random() < (rf - 1) / rf) {
          } else {
            shots--;
          }
        }
      }
      for (const d of alive('defender')) {
        let shots = 1, safety = 100;
        while (shots > 0 && safety-- > 0) {
          const t = alive('attacker'); if (t.length === 0) break;
          const target = t[Math.floor(Math.random() * t.length)];
          let dmg = d.atk;
          if (target.shield >= dmg) { target.shield -= dmg; dmg = 0; }
          else { dmg -= target.shield; target.shield = 0; target.hull -= dmg; }
          defDmg += d.atk;
          if (target.hull <= 0 || (target.hull < target.maxHull * 0.7 && Math.random() < (1 - target.hull / target.maxHull))) {
            target.alive = false;
          }
          const rf = d.rapid[target.id] || 0;
          if (rf > 1 && Math.random() < (rf - 1) / rf) {
          } else {
            shots--;
          }
        }
      }
      const atkShots = units.filter(u => u.side === 'attacker' && u.alive).length;
      const defShots = units.filter(u => u.side === 'defender' && u.alive).length;
      rounds.push({ round, atkAlive: alive('attacker').length, defAlive: alive('defender').length, atkDmg, defDmg, atkShots, defShots });
    }

    const atkSurv = {}, defShipSurv = {}, defDefenseSurv = {};
    units.filter(u => u.side === 'attacker' && u.alive).forEach(u => { atkSurv[u.id] = (atkSurv[u.id] || 0) + 1; });
    units.filter(u => u.side === 'defender' && u.alive).forEach(u => {
      if (SHIPS[u.id]) defShipSurv[u.id] = (defShipSurv[u.id] || 0) + 1;
      else defDefenseSurv[u.id] = (defDefenseSurv[u.id] || 0) + 1;
    });

    const atkLosses = {};
    for (const [id, qty] of Object.entries(attackerFleet)) {
      const lost = qty - (atkSurv[id] || 0);
      if (lost > 0) atkLosses[id] = lost;
    }
    const defShipLosses = {};
    for (const [id, qty] of Object.entries(defenderFleet)) {
      const lost = qty - (defShipSurv[id] || 0);
      if (lost > 0) defShipLosses[id] = lost;
    }
    const defDefenseLosses = {};
    for (const [id, qty] of Object.entries(defenderDefenses)) {
      const lost = qty - (defDefenseSurv[id] || 0);
      if (lost > 0) defDefenseLosses[id] = lost;
    }

    let debrisMetal = 0, debrisCrystal = 0;
    units.filter(u => !u.alive).forEach(u => {
      if (SHIPS[u.id]) { debrisMetal += SHIPS[u.id].cost.m * 0.3; debrisCrystal += SHIPS[u.id].cost.c * 0.3; }
      else if (u.id.startsWith('custom_')) {
        const bp = blueprints?.find(b => u.id === 'custom_' + b.id);
        if (bp) { const c = calcCustomShipCost(bp); debrisMetal += c.metal * 0.3; debrisCrystal += c.crystal * 0.3; }
      } else if (DEFENSES[u.id]) {
        debrisMetal += DEFENSES[u.id].cost.m * 0.3;
        debrisCrystal += DEFENSES[u.id].cost.c * 0.3;
      }
    });
    if (formation === 'raider') {
      debrisMetal *= 1.15;
      debrisCrystal *= 1.15;
    }

    const atkAlive = Object.values(atkSurv).reduce((a, b) => a + b, 0);
    const defAlive = Object.values(defShipSurv).reduce((a, b) => a + b, 0) + Object.values(defDefenseSurv).reduce((a, b) => a + b, 0);
    let winner = 'draw';
    if (atkAlive > 0 && defAlive === 0) winner = 'attacker';
    else if (defAlive > 0 && atkAlive === 0) winner = 'defender';
    if (didRetreat) winner = 'defender';

    return { winner, rounds, atkSurvivors: atkSurv, defShipSurvivors: defShipSurv, defDefenseSurvivors: defDefenseSurv, atkLosses, defShipLosses, defDefenseLosses, retreated: didRetreat, debris: { metal: debrisMetal, crystal: debrisCrystal } };
  }

  function buildGroups(fleet, defenses, tech, factionKey = 'human', isAttacker = false) {
    const groups = {};
    for (const [id, qty] of Object.entries(fleet)) {
      if (qty > 0) {
        const s = getShipStats(id, tech, blueprints, factionKey, {}, relics);
        if (s) {
          let hull = s.hull;
          let shd = s.shd;
          let atk = s.atk;
          if (isAttacker) {
            if (formation === 'vanguard') {
              atk *= 1.10;
              shd *= 0.85;
            } else if (formation === 'artillery') {
              atk *= 1.25;
              shd *= 1.10;
            } else if (formation === 'escort') {
              shd *= 1.15;
              atk *= 0.95;
            } else if (formation === 'raider') {
              atk *= 1.15;
              shd *= 0.90;
            }
          }
          if (isAttacker && intelBonus > 0) atk *= (1 + intelBonus);
          groups[id] = { id, qty, hull, maxHull: hull, shield: shd, maxShield: shd, atk, rapid: s.rapid, totalHull: qty * hull };
        }
      }
    }
    for (const [id, qty] of Object.entries(defenses)) {
      if (qty > 0 && DEFENSES[id]) {
        const ds = getDefenseStats(id, tech, factionKey, {}, relics);
        groups['def_' + id] = { id, qty, hull: ds.hull, maxHull: ds.hull, shield: ds.shd, maxShield: ds.shd, atk: ds.atk, rapid: DEFENSES[id].rapid || {}, totalHull: qty * ds.hull };
      }
    }
    return groups;
  }

  const atkGroups = buildGroups(attackerFleet, {}, atkTech, atkFaction, true);
  const defGroups = buildGroups(defenderFleet, defenderDefenses, defTech, defFaction, false);

  const rounds = [];
  let round = 0;

  while (round < maxRounds) {
    round++;
    for (const g of Object.values(atkGroups)) g.shield = g.maxShield;
    for (const g of Object.values(defGroups)) g.shield = g.maxShield;

    const atkList = Object.values(atkGroups).filter(g => g.qty > 0);
    const defList = Object.values(defGroups).filter(g => g.qty > 0);
    if (atkList.length === 0 || defList.length === 0) break;

    const currentAtkCount = atkList.reduce((a, g) => a + g.qty, 0);
    if (autoRetreat && currentAtkCount < initialAtkCount * 0.3) {
      didRetreat = true;
      rounds.push({ round, atkAlive: currentAtkCount, defAlive: defList.reduce((a, g) => a + g.qty, 0), atkDmg: 0, defDmg: 0, retreated: true });
      break;
    }

    const hasGroupECM = (defenderDefenses?.electronicWarfareHub || 0) > 0;
    const groupEcmPenalty = hasGroupECM ? 0.80 : 1.0;
    let atkDmg = 0, defDmg = 0;

    for (const g of atkList) {
      const defTarget = defList[Math.floor(Math.random() * defList.length)];
      if (!defTarget) continue;
      let shots = g.qty;
      const rapidBonus = g.rapid[defTarget.id.replace('def_', '')] || 1;
      shots *= rapidBonus;
      const totalDmg = shots * g.atk * groupEcmPenalty;
      atkDmg += totalDmg;
      let remaining = totalDmg;
      const shieldAbsorb = Math.min(remaining, defTarget.shield * defTarget.qty);
      remaining -= shieldAbsorb;
      defTarget.shield -= Math.ceil(shieldAbsorb / Math.max(1, defTarget.qty));
      if (remaining > 0) {
        defTarget.totalHull = Math.max(0, defTarget.totalHull - remaining);
        const dead = Math.max(0, Math.floor(defTarget.qty - defTarget.totalHull / defTarget.maxHull));
        defTarget.qty = Math.max(0, defTarget.qty - dead);
        defTarget.totalHull = Math.max(0, defTarget.totalHull - dead * defTarget.maxHull);
      }
    }

    for (const g of defList) {
      const atkTarget = atkList[Math.floor(Math.random() * atkList.length)];
      if (!atkTarget) continue;
      let shots = g.qty;
      const rapidBonus = g.rapid[atkTarget.id] || 1;
      shots *= rapidBonus;
      const totalDmg = shots * g.atk;
      defDmg += totalDmg;
      let remaining = totalDmg;
      const shieldAbsorb = Math.min(remaining, atkTarget.shield * atkTarget.qty);
      remaining -= shieldAbsorb;
      atkTarget.shield -= Math.ceil(shieldAbsorb / Math.max(1, atkTarget.qty));
      if (remaining > 0) {
        atkTarget.totalHull = Math.max(0, atkTarget.totalHull - remaining);
        const dead = Math.max(0, Math.floor(atkTarget.qty - atkTarget.totalHull / atkTarget.maxHull));
        atkTarget.qty = Math.max(0, atkTarget.qty - dead);
        atkTarget.totalHull = Math.max(0, atkTarget.totalHull - dead * atkTarget.maxHull);
      }
    }

    rounds.push({ round, atkAlive: atkList.reduce((a, g) => a + g.qty, 0), defAlive: defList.reduce((a, g) => a + g.qty, 0), atkDmg, defDmg });
  }

  const atkSurv = {}; const defShipSurv = {}; const defDefenseSurv = {};
  for (const [key, g] of Object.entries(atkGroups)) if (g.qty > 0) atkSurv[key] = g.qty;
  for (const [key, g] of Object.entries(defGroups)) {
    if (g.qty > 0) {
      if (key.startsWith('def_')) defDefenseSurv[key.replace('def_', '')] = g.qty;
      else defShipSurv[key] = g.qty;
    }
  }

  const atkLosses = {};
  for (const [id, qty] of Object.entries(attackerFleet)) {
    const lost = qty - (atkSurv[id] || 0);
    if (lost > 0) atkLosses[id] = lost;
  }
  const defShipLosses = {};
  for (const [id, qty] of Object.entries(defenderFleet)) {
    const lost = qty - (defShipSurv[id] || 0);
    if (lost > 0) defShipLosses[id] = lost;
  }
  const defDefenseLosses = {};
  for (const [id, qty] of Object.entries(defenderDefenses)) {
    const lost = qty - (defDefenseSurv[id] || 0);
    if (lost > 0) defDefenseLosses[id] = lost;
  }

  const calcLostDebris = (id, lost) => {
    if (SHIPS[id]) return { m: SHIPS[id].cost.m * 0.3 * lost, c: SHIPS[id].cost.c * 0.3 * lost };
    if (id.startsWith('custom_')) {
      const bp = blueprints?.find(b => id === 'custom_' + b.id);
      if (bp) { const c = calcCustomShipCost(bp); return { m: c.metal * 0.3 * lost, c: c.crystal * 0.3 * lost }; }
    }
    return { m: 0, c: 0 };
  };

  let debrisMetal = 0, debrisCrystal = 0;
  for (const [id, qty] of Object.entries(attackerFleet)) {
    const lost = qty - (atkSurv[id] || 0);
    if (lost > 0) { const d = calcLostDebris(id, lost); debrisMetal += d.m; debrisCrystal += d.c; }
  }
  for (const [id, qty] of Object.entries(defenderFleet)) {
    const lost = qty - (defShipSurv[id] || 0);
    if (lost > 0) { const d = calcLostDebris(id, lost); debrisMetal += d.m; debrisCrystal += d.c; }
  }
  if (formation === 'raider') {
    debrisMetal *= 1.15;
    debrisCrystal *= 1.15;
  }

  const atkAlive = Object.values(atkSurv).reduce((a, b) => a + b, 0);
  const defAlive = Object.values(defShipSurv).reduce((a, b) => a + b, 0) + Object.values(defDefenseSurv).reduce((a, b) => a + b, 0);

  let winner = 'draw';
  if (atkAlive > 0 && defAlive === 0) winner = 'attacker';
  else if (defAlive > 0 && atkAlive === 0) winner = 'defender';
  if (didRetreat) winner = 'defender';

  return { winner, rounds, atkSurvivors: atkSurv, defShipSurvivors: defShipSurv, defDefenseSurvivors: defDefenseSurv, atkLosses, defShipLosses, defDefenseLosses, retreated: didRetreat, debris: { metal: debrisMetal, crystal: debrisCrystal } };
  } catch (e) {
    console.error('[Ascensión] simulateCombat top-level error:', e);
    return { winner: 'draw', rounds: 0, atkSurvivors: attackerFleet || {}, defShipSurvivors: defenderFleet || {}, defDefenseSurvivors: defenderDefenses || {}, debris: { metal: 0, crystal: 0 }, error: true };
  }
};
