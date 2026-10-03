// Catálogo único de edificios e investigaciones.
// Fuente de verdad: TODO el juego debe leer BUILDINGS/RESEARCH desde aquí,
// nunca rehacer el merge base + expandido por su cuenta.
import { BUILDINGS as BASE_BUILDINGS } from '../game/buildingsData.js';
import { RESEARCH as BASE_RESEARCH } from '../game/researchData.js';
import { EXPANDED_BUILDINGS } from '../expanded/expandedBuildings.js';
import { EXPANDED_RESEARCH } from '../expanded/expandedResearch.js';

// Detecta claves repetidas entre base y expandido: con spread ganaría el
// expandido en silencio y la versión base quedaría como código muerto.
export const findDuplicateKeys = (base, expanded) =>
  Object.keys(expanded).filter(k => Object.prototype.hasOwnProperty.call(base, k));

const mergeCatalog = (label, base, expanded) => {
  const dups = findDuplicateKeys(base, expanded);
  if (dups.length > 0) {
    console.warn(`[Ascension] Catálogo ${label}: claves duplicadas (gana expandido): ${dups.join(', ')}`);
  }
  return { ...base, ...expanded };
};

export const BUILDINGS = mergeCatalog('BUILDINGS', BASE_BUILDINGS, EXPANDED_BUILDINGS);
export const RESEARCH = mergeCatalog('RESEARCH', BASE_RESEARCH, EXPANDED_RESEARCH);
