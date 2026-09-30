import { describe, it, expect } from 'vitest';
import {
  IMPERIAL_COMMAND_CARDS,
  IMPERIAL_COMMAND_STORAGE_KEY
} from '../components/government/hub/imperialCommandCardsConfig.jsx';
import {
  PLANETARY_COMMAND_CARDS,
  planetaryCommandStorageKey
} from '../components/government/hub/planetaryCommandCardsConfig.jsx';

/**
 * El tablero del imperio y el de cada mundo son dos cosas distintas.
 * Se comprueba sobre las claves y los catálogos, que es donde se mezclaban:
 * antes ambos hubs usaban `ascension_cmd_hub_planet_v1`.
 */
describe('tableros de mando independientes', () => {
  it('el tablero del imperio tiene su propia clave, que no es la de ningún mundo', () => {
    const clavesMundos = ['p-a', 'p-b', 'lonja'].map(planetaryCommandStorageKey);
    expect(clavesMundos).not.toContain(IMPERIAL_COMMAND_STORAGE_KEY);
    expect(new Set(clavesMundos).size).toBe(3);
  });

  it('cada clave de mundo incluye su planetId', () => {
    expect(planetaryCommandStorageKey('tierra')).toContain('tierra');
    expect(planetaryCommandStorageKey('tierra')).not.toBe(planetaryCommandStorageKey('marte'));
  });

  it('un mundo sin planetId no reutiliza el tablero de otro mundo', () => {
    expect(planetaryCommandStorageKey(undefined)).not.toBe(planetaryCommandStorageKey('tierra'));
  });

  it('el tablero imperial no incluye los ministerios de un mundo', () => {
    expect(IMPERIAL_COMMAND_CARDS).not.toContain('ministries');
    expect(IMPERIAL_COMMAND_CARDS).not.toContain('planetary_senate');
    expect(IMPERIAL_COMMAND_CARDS).not.toContain('back_to_empire');
  });

  it('el tablero de un mundo tiene su gobierno local y el retorno al imperio', () => {
    expect(PLANETARY_COMMAND_CARDS).toContain('ministries');
    expect(PLANETARY_COMMAND_CARDS).toContain('planetary_senate');
    expect(PLANETARY_COMMAND_CARDS[PLANETARY_COMMAND_CARDS.length - 1]).toBe('back_to_empire');
  });

  it('los órganos del imperio no cuelgan de un mundo', () => {
    expect(IMPERIAL_COMMAND_CARDS).toContain('imperial_council');
    expect(IMPERIAL_COMMAND_CARDS).toContain('imperial_senate');
    expect(PLANETARY_COMMAND_CARDS).not.toContain('imperial_council');
    expect(PLANETARY_COMMAND_CARDS).not.toContain('imperial_senate');
  });
});