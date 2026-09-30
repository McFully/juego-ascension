import {
  SHIPS,
  DEFENSES,
  FACTIONS
} from '../../data/gameData.js';
import { calcCustomShipStats } from './costFormulas.js';
import { shipSpeed } from './flightFormulas.js';

export const getDefenseStats = (id, tech, factionKey = 'human', buildings = {}, relics = []) => {
  const d = DEFENSES[id];
  if (!d) return null;
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  let atkMult = fact.bonuses.attack || 1.0;
  let defMult = fact.bonuses.defense || 1.0;
  const relicShdMult = (relics || []).reduce((acc, r) => r.effect?.defShd ? acc * r.effect.defShd : acc, 1);
  defMult *= relicShdMult;
  const resMult = fact.bonuses.resistance || 1.0;
  const milAcademy = (buildings.militaryAcademy || 0) * 0.03;
  atkMult *= (1 + milAcademy);

  const hullBonus = 1 + (tech?.armour || 0) * 0.08 + (tech?.nanoRepair || 0) * 0.03 + (tech?.fortressTech || 0) * 0.15;
  const shdBonus = 1 + (tech?.shields || 0) * 0.1 + (tech?.galacticCrypto || 0) * 0.02 + (tech?.aiStrategy || 0) * 0.03 + (tech?.defenseFields || 0) * 0.12 + (tech?.fortressTech || 0) * 0.10;
  let atkBonus = 1 + (tech?.weapons || 0) * 0.1 + (tech?.aiTactics || 0) * 0.02 + (tech?.aiMilitary || 0) * 0.03 + (tech?.gaussRailgunAccel || 0) * 0.10;

  // Bonificaciones especializadas por tecnología armamentística en defensas
  if (id === 'lightLaser' || id === 'heavyLaser') {
    atkBonus += (tech?.laser || 0) * 0.10;
  } else if (id === 'ionCannon') {
    atkBonus += (tech?.ion || 0) * 0.12;
  } else if (id === 'gaussCannon') {
    atkBonus += (tech?.ballisticWeapons || 0) * 0.15;
  } else if (id === 'rocketLauncher') {
    atkBonus += (tech?.advMissiles || 0) * 0.20;
  } else if (id === 'plasmaTurret') {
    atkBonus += (tech?.orbitalArtillery || 0) * 0.25;
  }

  return {
    hull: d.hull * hullBonus * resMult,
    shd: d.shd * shdBonus * defMult,
    atk: d.atk * atkBonus * atkMult,
  };
};

export const getEffectiveTech = (planet, globalResearch) => {
  if (planet && planet.retrofitTech && Object.keys(planet.retrofitTech).length > 0) {
    return planet.retrofitTech;
  }
  return globalResearch || {};
};

export const isOutdated = (planet, globalResearch) => {
  if (!planet || !globalResearch) return false;
  const t = planet.retrofitTech || {};
  return (globalResearch.weapons || 0) > (t.weapons || 0) ||
    (globalResearch.shields || 0) > (t.shields || 0) ||
    (globalResearch.armour || 0) > (t.armour || 0) ||
    (globalResearch.combustion || 0) > (t.combustion || 0) ||
    (globalResearch.impulse || 0) > (t.impulse || 0) ||
    (globalResearch.hyperspace || 0) > (t.hyperspace || 0);
};

export const getShipStats = (id, tech, blueprints, factionKey = 'human', buildings = {}, relics = []) => {
  const fact = FACTIONS[factionKey] || FACTIONS.human;
  let atkMult = fact.bonuses.attack || 1.0;
  const milAcademy = (buildings.militaryAcademy || 0) * 0.03;
  atkMult *= (1 + milAcademy);
  const relicAtkMult = (relics || []).reduce((acc, r) => r.effect?.fleetAtk ? acc * r.effect.fleetAtk : acc, 1);
  atkMult *= relicAtkMult;
  const defMult = fact.bonuses.defense || 1.0;
  const resMult = fact.bonuses.resistance || 1.0;
  const speedBonus = fact.bonuses.speed || 1.0;

  let hullBonus = 1 + (tech?.armour || 0) * 0.08 + (tech?.nanoRepair || 0) * 0.03 + (tech?.latticeMaterials || 0) * 0.05 + (tech?.nanobotRepairSwarms || 0) * 0.02;
  const shdBonus = 1 + (tech?.shields || 0) * 0.1 + (tech?.galacticCrypto || 0) * 0.02 + (tech?.aiStrategy || 0) * 0.03;
  let atkBonus = 1 + (tech?.weapons || 0) * 0.1 + (tech?.aiTactics || 0) * 0.02 + (tech?.aiMilitary || 0) * 0.03;

  // Conexión de armamento especializado a naves de guerra
  if (['cruiser', 'lightFighter', 'heavyFighter'].includes(id)) {
    atkBonus += (tech?.laser || 0) * 0.05;
  }
  if (['destroyer', 'battleship'].includes(id)) {
    atkBonus += (tech?.ion || 0) * 0.06;
  }
  if (['heavyFighter', 'cruiser'].includes(id)) {
    atkBonus += (tech?.ballisticWeapons || 0) * 0.05;
  }
  if (['bomber', 'interplanetaryMissile'].includes(id)) {
    atkBonus += (tech?.advMissiles || 0) * 0.10;
  }
  if (['deathstar', 'planetDestroyer', 'battleship'].includes(id)) {
    atkBonus += (tech?.orbitalArtillery || 0) * 0.10;
  }

  if (['smallCargo', 'lightFighter', 'espionageProbe'].includes(id)) {
    hullBonus += (tech?.grapheneTitanium || 0) * 0.08;
  }
  if (id === 'lightFighter') {
    atkBonus += (tech?.geneticWarAlgorithm || 0) * 0.04;
  }

  let cargoMult = 1.0;
  if (['smallCargo', 'largeCargo'].includes(id)) {
    cargoMult += (tech?.orbitalLogisticExpert || 0) * 0.10 + (tech?.molecularCargoCompress || 0) * 0.15 + (tech?.advLogistics || 0) * 0.10;
  }

  if (id.startsWith('custom_')) {
    const bp = blueprints?.find(b => id === 'custom_' + b.id);
    if (bp) {
      const s = calcCustomShipStats(bp);
      const shd = s.shd * shdBonus * defMult;
      const atk = s.atk * atkBonus * atkMult;
      const hull = s.hull * hullBonus * resMult;

      let driveBonus = 0;
      if (bp.engine === 'basicCombustion' || bp.engine === 'advCombustion') {
        driveBonus = (tech?.combustion || 0) * 0.10;
      } else if (bp.engine === 'basicImpulse' || bp.engine === 'advImpulse') {
        driveBonus = (tech?.impulse || 0) * 0.20;
      } else if (bp.engine === 'hyperDrive') {
        driveBonus = (tech?.hyperspace || 0) * 0.30;
      } else if (bp.engine === 'quantumEngine') {
        driveBonus = (tech?.quantumDrive || 0) * 0.15;
      }

      const dimExplorationMult = 1 + (tech?.dimensionalExploration || 0) * 0.05;
      const speed = Math.floor(s.speed * (1 + driveBonus) * speedBonus * dimExplorationMult);

      return { hull, shd, atk, speed, cargo: Math.floor(s.cargo * cargoMult), fuel: 10, rapid: {} };
    }
  }
  const ship = SHIPS[id];
  if (!ship) return null;
  return {
    hull: ship.hull * hullBonus * resMult,
    shd: ship.shd * shdBonus * defMult,
    atk: ship.atk * atkBonus * atkMult,
    speed: shipSpeed(id, tech || {}, factionKey),
    cargo: Math.floor(ship.cargo * cargoMult),
    fuel: ship.fuel,
    rapid: ship.rapid || {},
  };
};
