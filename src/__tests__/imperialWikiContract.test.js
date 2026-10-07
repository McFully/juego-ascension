import { describe, it, expect } from 'vitest';
import { WIKI_CATEGORIES, WIKI_ENTRIES } from '../data/wikiData.js';
import { GAME_TABS } from '../components/app/gameNavigation.js';
import { IMPERIAL_COMMAND_CARDS } from '../components/government/hub/imperialCommandCardsConfig.jsx';

describe('Contrato de la Gran Enciclopedia Imperial (Wiki)', () => {
  it('la pestaña wiki está registrada en el enrutador de navegación', () => {
    const wikiTab = GAME_TABS.find(t => t.id === 'wiki');
    expect(wikiTab).toBeDefined();
    expect(wikiTab.label).toContain('Enciclopedia Imperial');
    expect(wikiTab.quadrant).toBe('gov');
  });

  it('la tarjeta wiki está presente en la configuración del Mando Imperial', () => {
    expect(IMPERIAL_COMMAND_CARDS).toContain('wiki');
  });

  it('la base de datos canónica tiene categorías completas y artículos válidos', () => {
    expect(WIKI_CATEGORIES.length).toBeGreaterThanOrEqual(8);
    expect(WIKI_ENTRIES.length).toBeGreaterThanOrEqual(10);

    const categoriesSet = new Set(WIKI_CATEGORIES.map(c => c.id));
    categoriesSet.add('all');

    WIKI_ENTRIES.forEach(entry => {
      expect(entry.id).toBeDefined();
      expect(entry.title).toBeDefined();
      expect(entry.summary).toBeDefined();
      expect(categoriesSet.has(entry.category)).toBe(true);

      if (entry.parametricTable) {
        expect(Array.isArray(entry.parametricTable.headers)).toBe(true);
        expect(Array.isArray(entry.parametricTable.rows)).toBe(true);
        expect(entry.parametricTable.rows.length).toBeGreaterThan(0);
      }

      if (entry.formula) {
        expect(typeof entry.formula.expression).toBe('string');
      }
    });
  });

  it('el filtrado por búsqueda localiza términos canónicos (metal, deuterio, AMM)', () => {
    const searchMetal = WIKI_ENTRIES.filter(e => 
      e.title.toLowerCase().includes('metal') || e.tags?.includes('metal')
    );
    expect(searchMetal.length).toBeGreaterThan(0);

    const searchAMM = WIKI_ENTRIES.filter(e => 
      e.title.toLowerCase().includes('amm') || e.tags?.includes('amm')
    );
    expect(searchAMM.length).toBeGreaterThan(0);
  });
});
