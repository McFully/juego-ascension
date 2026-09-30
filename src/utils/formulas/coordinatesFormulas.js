/**
 * Ascension - Calculo procedural de Puntos de Interes (POI) y coordenadas galacticas.
 */
export const getPOIAtCoordinates = (galaxy, system, position) => {
  const seed = (galaxy * 10000) + (system * 100) + position;
  const hash = Math.sin(seed) * 10000;
  const rand = hash - Math.floor(hash);

  if (rand < 0.15) {
    if (rand < 0.05) {
      return {
        type: 'wormhole',
        name: 'Agujero de Gusano',
        icon: '🌀',
        desc: 'Una singularidad estable que pliega el espacio-tiempo. Los viajes hacia este sistema consumen un 50% menos de Deuterio y tardan un 50% menos.'
      };
    } else if (rand < 0.10) {
      return {
        type: 'helium_belt',
        name: 'Cinturon de Helio-3',
        icon: '🌌',
        desc: 'Una densa corriente de gases interestelares ricos en Helio-3. La produccion de Deuterio en las colonias fundadas aqui aumenta un 50%.'
      };
    } else {
      return {
        type: 'precursor_ruins',
        name: 'Ruinas Ancestrales',
        icon: '🏛️',
        desc: 'Estructuras abandonadas de una civilizacion extinta altamente avanzada. Las expediciones a este sistema tienen el doble de probabilidad de encontrar tecnologia o naves abandonadas.'
      };
    }
  }
  return null;
};
