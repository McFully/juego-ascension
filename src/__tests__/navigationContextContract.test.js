import { describe, it, expect } from 'vitest';
import { GAME_TABS } from '../components/app/gameNavigation.js';
import { PARENT_MAP, NAV_LABELS } from '../components/navigation/NavigationContext.jsx';
import { processMinistriesTick } from '../reducers/tick/ministries/ministryTick.js';

describe('Phase 08 - Navigation, Empire vs Planet & Tax Contracts', () => {
  it('GAME_TABS and PARENT_MAP have matching parents for all hierarchy tabs', () => {
    const tabsMap = Object.fromEntries(GAME_TABS.map(t => [t.id, t]));

    // Both must register missiles
    expect(tabsMap.missiles).toBeDefined();
    expect(tabsMap.missiles.parent).toBe('defense');

    // Imperial senate & council must map to imperial_hub
    expect(tabsMap.imperial_senate.parent).toBe('imperial_hub');
    expect(tabsMap.imperial_council.parent).toBe('imperial_hub');

    expect(PARENT_MAP.imperial_senate).toBe('imperial_hub');
    expect(PARENT_MAP.imperial_council).toBe('imperial_hub');
    expect(PARENT_MAP.missiles).toBe('defense');

    // Colony network, missions, stats map to imperial_hub (Imperio: Mando Imperial)
    expect(PARENT_MAP.colony_network).toBe('imperial_hub');
    expect(PARENT_MAP.market).toBe('imperial_hub');
    expect(PARENT_MAP.missions).toBe('imperial_hub');
    expect(PARENT_MAP.stats).toBe('imperial_hub');
  });

  it('NAV_LABELS and GAME_TABS use unified naming for Alto Mando vs Mando Imperial', () => {
    const tabsMap = Object.fromEntries(GAME_TABS.map(t => [t.id, t]));
    expect(tabsMap.government.label).toContain('Alto Mando');
    expect(tabsMap.imperial_hub.label).toContain('Mando Imperial');
    expect(NAV_LABELS.government).toContain('Alto Mando');
    expect(NAV_LABELS.imperial_hub).toContain('Mando Imperial');
  });

  it('processMinistriesTick calculates taxes using world specific planet.taxRate', () => {
    const mockState = {
      gameTick: 1,
      ministries: {
        economy: {
          taxRate: 0.05, // Federal default 5%
          treasury: 100,
          automationEnabled: false
        }
      }
    };

    const mockPlanets = [
      {
        id: 'p1',
        name: 'Mundo A',
        taxRate: 0.30, // 30% local tax
      },
      {
        id: 'p2',
        name: 'Mundo B',
        taxRate: 0.10, // 10% local tax
      }
    ];

    const prodCache = new Map();
    // Metal hourly production: 3600 each -> 1 metal per second
    prodCache.set('p1', { metal: 3600 });
    prodCache.set('p2', { metal: 3600 });

    const res = processMinistriesTick(mockState, mockPlanets, prodCache);
    expect(res).toBeDefined();

    // Planet A: (3600 / 3600) * 0.30 * 2.0 = 0.60
    // Planet B: (3600 / 3600) * 0.10 * 2.0 = 0.20
    // Total metal tax = 0.80. Treasury increases by 0.80 from 100 -> 100.80
    // If federal fallback was used: (1 + 1) * 0.05 * 2 = 0.20 -> 100.20
    expect(res.ministries.economy.treasury).toBeCloseTo(100.80, 5);
  });
});
