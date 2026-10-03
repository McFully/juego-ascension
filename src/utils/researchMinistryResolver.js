import { MINISTRY_MAPPING } from '../data/buildingOperationsData.js';

// Prioridad preferente de ministerio por tecnología cuando está asignada a varios ministerios
const PRIMARY_MINISTRY_OVERRIDE = {
  // Propulsión y militar
  combustion: 'war',
  impulse: 'war',
  laser: 'war',
  ion: 'war',
  plasma: 'war',
  ballisticWeapons: 'war',
  advMissiles: 'war',
  orbitalArtillery: 'war',
  shields: 'defense',
  weapons: 'defense',
  armour: 'defense',
  defenseFields: 'defense',
  fortressTech: 'defense',
  nanoRepair: 'innovation',

  // Energía
  energy: 'energy',
  advReactors: 'energy',
  quantumEnergy: 'energy',
  quantumNetworks: 'energy',

  // Ciencia e hiperespacio
  astrophysics: 'science',
  hyperspace: 'science',
  quantumDrive: 'science',
  singularity: 'science',
  dimensionalExploration: 'science',
  galacticCartography: 'science',

  // Innovación e industria
  nanoTech: 'innovation',
  modularEng: 'infra',
  expDesign: 'innovation',
  cyberIntegration: 'innovation',
  industrialOpt: 'industry',

  // Economía y recursos
  miningAuto: 'resources',
  galacticTrade: 'economy',
  advLogistics: 'logistics',

  // IA y computación
  computer: 'cybernetics',
  aiTactics: 'cybernetics',
  aiProd: 'cybernetics',
  aiMilitary: 'cybernetics',
  aiStrategy: 'cybernetics',
  fullAuto: 'cybernetics',

  // Espionaje e inteligencia
  espionage: 'intel',
  advSensors: 'intel',
  galacticCrypto: 'intel',

  // Transporte y exploración
  interstellarNav: 'transport',
  deepScanner: 'biosphere',
  advColonization: 'civics'
};

/**
 * Obtiene el ID del ministerio rector para una tecnología determinada.
 * @param {string} researchId 
 * @returns {string} ID del ministerio (ej: 'war', 'energy', 'science')
 */
export function getMinistryForResearch(researchId) {
  if (!researchId) return 'science';
  if (PRIMARY_MINISTRY_OVERRIDE[researchId]) {
    return PRIMARY_MINISTRY_OVERRIDE[researchId];
  }
  for (const [minId, minData] of Object.entries(MINISTRY_MAPPING)) {
    if (minData.research && minData.research.includes(researchId)) {
      return minId;
    }
  }
  return 'science';
}

/**
 * Devuelve la clave de vista/tab para abrir la sección de investigaciones del ministerio correspondiente.
 * @param {string} researchId 
 * @returns {string} Clave de pestaña (ej: 'ministry_war_research')
 */
export function getMinistryResearchRoute(researchId) {
  const minId = getMinistryForResearch(researchId);
  return `ministry_${minId}_research`;
}
