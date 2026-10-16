import { calcRequiredPopulation } from './costFormulas.js';
import { BUILDINGS, RESEARCH } from '../../data/catalog/index.js';
import { SHIPS, DEFENSES } from '../../data/gameData.js';

/**
 * operatingExpensesFormulas.js
 * Cálculo unificado y canónico de mantenimiento estructural y nóminas de salarios
 * en créditos por hora y por día para todos los edificios, investigaciones, flotas y defensas.
 */

// Ratio base de salario por operario: 0.1 créditos/hora por colono/técnico empleado
const SALARY_PER_WORKER_HOUR = 0.1;
const SALARY_PER_SCIENTIST_HOUR = 0.25;
const SALARY_PER_CREW_HOUR = 0.15;
const SALARY_PER_SOLDIER_HOUR = 0.12;

/**
 * Calcula los gastos operativos de un edificio en función de su nivel.
 */
export const calcBuildingOperatingExpenses = (buildingId, level = 0) => {
  if (!buildingId || level <= 0) {
    return {
      requiredStaff: 0,
      maintenanceCreditsHour: 0,
      maintenanceCreditsDay: 0,
      salariesCreditsHour: 0,
      salariesCreditsDay: 0,
      totalCreditsHour: 0,
      totalCreditsDay: 0
    };
  }

  const b = BUILDINGS[buildingId];
  const requiredStaff = calcRequiredPopulation(buildingId, level);

  // Mantenimiento estructural base según coste y categoría
  const baseCostSum = (b?.cost?.m || 0) + (b?.cost?.c || 0) + (b?.cost?.d || 0);
  const factor = b?.factor || 1.5;
  const maintenancePerHour = Math.max(
    1,
    Math.floor((baseCostSum * Math.pow(factor, Math.min(level, 15)) * 0.00008) + (level * 5))
  );

  const salariesPerHour = Math.floor(requiredStaff * SALARY_PER_WORKER_HOUR);
  const totalPerHour = maintenancePerHour + salariesPerHour;

  return {
    requiredStaff,
    maintenanceCreditsHour: maintenancePerHour,
    maintenanceCreditsDay: maintenancePerHour * 24,
    salariesCreditsHour: salariesPerHour,
    salariesCreditsDay: salariesPerHour * 24,
    totalCreditsHour: totalPerHour,
    totalCreditsDay: totalPerHour * 24
  };
};

/**
 * Calcula los gastos operativos de una línea de investigación activa.
 */
export const calcResearchOperatingExpenses = (researchId, level = 0) => {
  if (!researchId || level <= 0) {
    return {
      requiredScientists: 0,
      maintenanceCreditsHour: 0,
      maintenanceCreditsDay: 0,
      salariesCreditsHour: 0,
      salariesCreditsDay: 0,
      totalCreditsHour: 0,
      totalCreditsDay: 0
    };
  }

  const r = RESEARCH[researchId];
  // Científicos requeridos según nivel
  const requiredScientists = Math.floor(10 * level + Math.pow(level, 1.8) * 8);

  const baseCostSum = (r?.cost?.m || 0) + (r?.cost?.c || 0) + (r?.cost?.d || 0);
  const maintenancePerHour = Math.max(
    2,
    Math.floor((baseCostSum * Math.pow(1.8, Math.min(level, 12)) * 0.0001) + (level * 8))
  );

  const salariesPerHour = Math.floor(requiredScientists * SALARY_PER_SCIENTIST_HOUR);
  const totalPerHour = maintenancePerHour + salariesPerHour;

  return {
    requiredScientists,
    maintenanceCreditsHour: maintenancePerHour,
    maintenanceCreditsDay: maintenancePerHour * 24,
    salariesCreditsHour: salariesPerHour,
    salariesCreditsDay: salariesPerHour * 24,
    totalCreditsHour: totalPerHour,
    totalCreditsDay: totalPerHour * 24
  };
};

/**
 * Calcula gastos operativos de naves (mantenimiento de hangar y nóminas de tripulación).
 */
export const calcShipOperatingExpenses = (shipId, count = 1) => {
  if (!shipId || count <= 0) {
    return {
      crew: 0,
      maintenanceCreditsHour: 0,
      maintenanceCreditsDay: 0,
      salariesCreditsHour: 0,
      salariesCreditsDay: 0,
      totalCreditsHour: 0,
      totalCreditsDay: 0
    };
  }

  const s = SHIPS[shipId];
  const unitCrew = s?.crew || (s?.cost?.m ? Math.max(1, Math.floor(s.cost.m / 2000)) : 1);
  const totalCrew = unitCrew * count;

  const unitCost = (s?.cost?.m || 0) + (s?.cost?.c || 0) + (s?.cost?.d || 0);
  const maintenancePerHour = Math.max(1, Math.floor((unitCost * 0.00005) * count));
  const salariesPerHour = Math.floor(totalCrew * SALARY_PER_CREW_HOUR);
  const totalPerHour = maintenancePerHour + salariesPerHour;

  return {
    crew: totalCrew,
    unitCrew,
    maintenanceCreditsHour: maintenancePerHour,
    maintenanceCreditsDay: maintenancePerHour * 24,
    salariesCreditsHour: salariesPerHour,
    salariesCreditsDay: salariesPerHour * 24,
    totalCreditsHour: totalPerHour,
    totalCreditsDay: totalPerHour * 24
  };
};

/**
 * Calcula gastos operativos de baterías defensivas (guarnición y mantenimiento balístico).
 */
export const calcDefenseOperatingExpenses = (defenseId, count = 1) => {
  if (!defenseId || count <= 0) {
    return {
      garrison: 0,
      maintenanceCreditsHour: 0,
      maintenanceCreditsDay: 0,
      salariesCreditsHour: 0,
      salariesCreditsDay: 0,
      totalCreditsHour: 0,
      totalCreditsDay: 0
    };
  }

  const d = DEFENSES[defenseId];
  const unitGarrison = d?.garrison || (d?.cost?.m ? Math.max(1, Math.floor(d.cost.m / 3000)) : 1);
  const totalGarrison = unitGarrison * count;

  const unitCost = (d?.cost?.m || 0) + (d?.cost?.c || 0) + (d?.cost?.d || 0);
  const maintenancePerHour = Math.max(1, Math.floor((unitCost * 0.00004) * count));
  const salariesPerHour = Math.floor(totalGarrison * SALARY_PER_SOLDIER_HOUR);
  const totalPerHour = maintenancePerHour + salariesPerHour;

  return {
    garrison: totalGarrison,
    unitGarrison,
    maintenanceCreditsHour: maintenancePerHour,
    maintenanceCreditsDay: maintenancePerHour * 24,
    salariesCreditsHour: salariesPerHour,
    salariesCreditsDay: salariesPerHour * 24,
    totalCreditsHour: totalPerHour,
    totalCreditsDay: totalPerHour * 24
  };
};
