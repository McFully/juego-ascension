import {
  SHIPS,
  FACTIONS
} from '../../data/gameData.js';

export const calcDistance = (a, b) => {
  if (a.galaxy !== b.galaxy) return 20000 * Math.abs(a.galaxy - b.galaxy);
  if (a.system !== b.system) return 2700 + 95 * Math.abs(a.system - b.system);
  return 5 + 5 * Math.abs(a.position - b.position);
};

export const calcFlightTime = (dist, speed, missionSpeed = 10, research = {}) => {
  const cartography = research?.galacticCartography || 0;
  const exploration = research?.dimensionalExploration || 0;
  const gravityCurrents = research?.gravityCurrents || 0;
  const compression = research?.hyperspaceCompression || 0;

  let speedMult = 1 + (cartography + exploration) * 0.05;

  if (dist <= 2700) {
    speedMult += gravityCurrents * 0.06;
  }
  if (dist > 20000) {
    speedMult += compression * 0.05;
  }

  const baseTime = (4743416 * Math.sqrt(dist)) / Math.max(1, speed * speedMult);
  const scaledTime = baseTime / (missionSpeed / 10);
  return Math.max(10, Math.round(scaledTime));
};

export const calcFuel = (dist, shipId, qty, driveLevel, research = {}, originPlanet = null) => {
  const s = SHIPS[shipId];
  if (!s) return 1;
  const speedBonus = 1 + driveLevel * 0.1;
  let fuelMult = 1.0;
  fuelMult -= (research.deuteriumLiquidCell || 0) * 0.04;
  fuelMult -= (research.magnetohydrodynamics || 0) * 0.05;
  fuelMult -= (research.solarPropulsionFreight || 0) * 0.06;

  if (originPlanet) {
    const grav = originPlanet.gravity !== undefined ? originPlanet.gravity : 2;
    const gravMults = [0.7, 0.85, 1.0, 1.2, 1.45];
    fuelMult *= (gravMults[grav] || 1.0);

    const b = originPlanet.buildings || {};
    if (b.spaceElevator > 0) {
      fuelMult *= 0.30;
    } else if (b.massDriver > 0) {
      fuelMult *= 0.60;
    }
  }

  fuelMult = Math.max(0.15, fuelMult);
  return Math.max(1, Math.floor(dist / 35000 * (s.fuel * qty) * Math.pow(speedBonus, -2) * fuelMult));
};

export const shipSpeed = (id, research, factionKey = 'human') => {
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  const speedBonus = fact.bonuses.speed || 1.0;
  if (id.startsWith('custom_')) {
    return Math.floor(5000 * speedBonus);
  }
  const s = SHIPS[id];
  let bonus = 0;
  if (s.drive === 'combustion') bonus = (research.combustion || 0) * 0.1;
  else if (s.drive === 'impulse') bonus = (research.impulse || 0) * 0.2;
  else if (s.drive === 'hyperspace') bonus = (research.hyperspace || 0) * 0.3;

  let alcubierreBonus = 0;
  if (['cruiser', 'battleship', 'bomber', 'destroyer', 'deathstar'].includes(id)) {
    alcubierreBonus = (research.alcubierreDrive || 0) * 0.20;
  }

  return Math.floor(s.speed * (1 + bonus + alcubierreBonus) * speedBonus);
};

export const fleetSpeed = (fleet, research, factionKey = 'human', relics = []) => {
  let minSpeed = Infinity;
  for (const [id, qty] of Object.entries(fleet)) {
    if (qty > 0) minSpeed = Math.min(minSpeed, shipSpeed(id, research, factionKey));
  }
  const relicSpeedMult = (relics || []).reduce((acc, r) => r.effect?.fleetSpeed ? acc * r.effect.fleetSpeed : acc, 1);
  return minSpeed === Infinity ? 0 : Math.floor(minSpeed * relicSpeedMult);
};
