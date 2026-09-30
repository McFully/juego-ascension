import { uid, fmt } from '../../utils/formulas.js';

/**
 * processPirateRaidTick — Evalúa periódicamente la amenaza de incursiones piratas sobre la Lonja Galáctica.
 * Si las bóvedas acumulan mucha riqueza y las defensas son bajas, se desata un asalto.
 */
export const processPirateRaidTick = (state) => {
  const exchangePlanet = (state.planets || []).find(p => p.isExchangePlanet);
  if (!exchangePlanet) return state;

  // Solo evaluar cada 120 ticks para no saturar
  if ((state.gameTick || 0) % 120 !== 0) return state;

  const buildings = exchangePlanet.buildings || {};
  const bastionLvl = buildings.exchangeBastion || 1;
  const patrolLvl = buildings.exchangePatrols || 1;
  const bunkersLvl = buildings.exchangeBunkers || 1;

  const resources = exchangePlanet.resources || {};
  const totalWealth = (resources.metal || 0) + (resources.crystal || 0) * 1.6 + (resources.deuterium || 0) * 3;

  // Si la riqueza en bóvedas es baja (< 100k equivalente), los piratas no se molestan
  if (totalWealth < 100000) return state;

  // Poder defensivo de la Lonja
  const defensePower = (bastionLvl * 50000) + (patrolLvl * 35000);
  // Poder de asalto pirata proporcional a la riqueza
  const raidPower = Math.floor(totalWealth * 0.15 * (0.8 + Math.random() * 0.4));

  let newState = { ...state };
  const notifications = [...(newState.notifications || [])];

  if (defensePower >= raidPower) {
    // Victoria defensiva: Se repelió el asalto
    const bountyBonus = Math.floor(raidPower * 0.05);
    newState.daoDividendPool = (newState.daoDividendPool || 250000) + bountyBonus;
    notifications.push({
      id: uid(),
      type: 'success',
      message: `🛡️ ¡Incursión Pirata Repelida en la Lonja! El Bastión y las Patrullas interceptaron a los corsarios. Botín interceptado de +${fmt(bountyBonus)} ₢ al Pool del DAO.`,
      timestamp: Date.now()
    });
  } else {
    // Brecha de seguridad: Saqueo parcial
    // Porcentaje protegido por los búnkeres blindados (del 20% al 80%)
    const protectionRatio = Math.min(0.8, 0.2 + (bunkersLvl * 0.1));
    const lootRatio = (1 - protectionRatio) * 0.25; // Se llevan hasta un 25% de lo expuesto

    const lostMetal = Math.floor((resources.metal || 0) * lootRatio);
    const lostCrystal = Math.floor((resources.crystal || 0) * lootRatio);
    const lostDeut = Math.floor((resources.deuterium || 0) * lootRatio);

    exchangePlanet.resources = {
      ...exchangePlanet.resources,
      metal: Math.max(0, (resources.metal || 0) - lostMetal),
      crystal: Math.max(0, (resources.crystal || 0) - lostCrystal),
      deuterium: Math.max(0, (resources.deuterium || 0) - lostDeut)
    };

    notifications.push({
      id: uid(),
      type: 'warning',
      message: `⚠️ ¡Alerta de Seguridad en la Lonja! Una flota corsaria rompió el perímetro: -${fmt(lostMetal)} Metal, -${fmt(lostCrystal)} Cristal, -${fmt(lostDeut)} Deuterio. Los Búnkeres protegieron el ${Math.round(protectionRatio * 100)}% de los activos.`,
      timestamp: Date.now()
    });
  }

  newState.notifications = notifications;
  return newState;
};
