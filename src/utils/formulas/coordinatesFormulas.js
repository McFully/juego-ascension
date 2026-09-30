/**
 * Ascension - Calculo procedural de Puntos de Interes (POI) y coordenadas galacticas con memoización LRU/Map.
 */
const poiCache = new Map();

export const getPOIAtCoordinates = (galaxy, system, position) => {
  const g = galaxy || 1;
  const s = system || 1;
  const p = position || 1;
  const key = `${g}:${s}:${p}`;

  if (poiCache.has(key)) {
    return poiCache.get(key);
  }

  const seed = (g * 10000) + (s * 100) + p;
  const hash = Math.sin(seed) * 10000;
  const rand = hash - Math.floor(hash);

  let result = null;
  if (rand < 0.15) {
    if (rand < 0.05) {
      result = {
        type: 'wormhole',
        name: 'Agujero de Gusano',
        icon: '🌀',
        desc: 'Una singularidad estable que pliega el espacio-tiempo. Los viajes hacia este sistema consumen un 50% menos de Deuterio y tardan un 50% menos.'
      };
    } else if (rand < 0.10) {
      result = {
        type: 'helium_belt',
        name: 'Cinturon de Helio-3',
        icon: '🌌',
        desc: 'Una densa corriente de gases interestelares ricos en Helio-3. La produccion de Deuterio en las colonias fundadas aqui aumenta un 50%.'
      };
    } else {
      result = {
        type: 'precursor_ruins',
        name: 'Ruinas Ancestrales',
        icon: '🏛️',
        desc: 'Estructuras abandonadas de una civilizacion extinta altamente avanzada. Las expediciones a este sistema tienen el doble de probabilidad de encontrar tecnologia o naves abandonadas.'
      };
    }
  }

  poiCache.set(key, result);
  return result;
};
