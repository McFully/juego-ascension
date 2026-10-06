import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  parseGovernmentRoute,
  buildGovernmentTab,
  resolveNavParent,
  DESK_SUBVIEWS,
} from '../utils/governmentRoute.js';
import { GAME_TABS } from '../components/app/gameNavigation.js';
import { bestIntelLevel, intelIsKnown, INTEL_RANK } from '../utils/espionageFormulas.js';
import { handleEspionageMission } from '../missions/diploMission.js';

/**
 * NAVEGACIÓN Y PERSISTENCIA DEL DOSSIER DE INTELIGENCIA.
 *
 * El dossier no crea pantalla: cuelga del Ministerio de Inteligencia. Eso
 * significa que la navegación depende de `governmentRoute`, y si `espionage`
 * no estuviera en `DESK_SUBVIEWS` el botón abriría el ministerio entero en vez
 * del dossier. Estos tests fijan ese contrato.
 */

describe('ruta del dossier de inteligencia', () => {
  it('espionage es un despacho mas del ministerial', () => {
    expect(DESK_SUBVIEWS).toContain('espionage');
  });

  it('la ruta se genera sola, sin ids escritos a mano', () => {
    expect(buildGovernmentTab({ level: 3, ministryId: 'intel', subview: 'espionage' }))
      .toBe('ministry_intel_espionage');
  });

  it('se lee de vuelta como nivel 3 del ministerio de inteligencia', () => {
    expect(parseGovernmentRoute('ministry_intel_espionage')).toEqual({
      level: 3,
      ministryId: 'intel',
      subview: 'espionage',
      tab: 'ministry_intel_espionage',
    });
  });

  it('el dossier cuelga del ministerio, no del Alto Mando', () => {
    expect(resolveNavParent('ministry_intel_espionage')).toBe('ministry_intel');
  });

  it('el tab del ministerio de inteligencia existe en el catalogo', () => {
    const tab = GAME_TABS.find(t => t.id === 'ministry_intel');
    expect(tab).toBeDefined();
    expect(tab.parent).toBe('government');
  });

  it('no se cuela un tab raiz nuevo para el espionaje', () => {
    // El dossier no es una pantalla propia: si alguien lo suba al catalogo
    // raiz se rompe la arquitectura de tarjeta por ministry.
    expect(GAME_TABS.find(t => t.id === 'espionage')).toBeUndefined();
    expect(GAME_TABS.find(t => t.id === 'intel_dossier')).toBeUndefined();
  });

  it('la vista del dossier se monta desde el Alto Mando y no crea pagina nueva', () => {
    const gov = readFileSync(join(process.cwd(), 'src', 'pages', 'GovernmentPage.jsx'), 'utf-8');
    expect(gov).toContain('IntelDossierView');
    // Y no puede existir un pages/EspionagePage.jsx.
    expect(() => readFileSync(join(process.cwd(), 'src', 'pages', 'EspionagePage.jsx'), 'utf-8')).toThrow();
  });

  it('safeSetActiveTab acepta la ruta aunque no este en el catalogo', () => {
    // `ministry_intel_espionage` es un tab virtual: no esta en GAME_TABS, y por
    // eso `safeSetActiveTab` tiene la rama `startsWith('ministry_')`. Si esa
    // rama desapareciera, el boton caeria en el fallback a 'overview' y el
    // dossier seria inalcanzable sin ningun error visible.
    const app = readFileSync(join(process.cwd(), 'src', 'App.jsx'), 'utf-8');
    expect(app).toMatch(/startsWith\(["']ministry_["']\)/);
  });

  it('GameViewports monta el Alto Mando para cualquier ruta de ministerio', () => {
    const viewports = readFileSync(join(process.cwd(), 'src', 'components', 'app', 'GameViewports.jsx'), 'utf-8');
    expect(viewports).toMatch(/activeTab\.startsWith\(["']ministry_["']\)/);
  });

  it('el dossier se ofrece solo en el Ministerio de Inteligencia', () => {
    const desk = readFileSync(join(process.cwd(), 'src', 'components', 'government', 'MinistryDeskView.jsx'), 'utf-8');
    expect(desk).toContain('onOpenDossier');
    expect(desk).toMatch(/ministryId === ['"]intel['"]/);
    expect(desk).toMatch(/onClick=\{onOpenDossier\}/);
  });

  it('el breadcrumb nombra el dossier en vez de caer en el etiqueta por defecto', () => {
    const crumbs = readFileSync(join(process.cwd(), 'src', 'components', 'government', 'GovernmentBreadcrumbs.jsx'), 'utf-8');
    expect(crumbs).toContain('Dossier de Inteligencia');
  });
});

describe('niveles de inteligencia', () => {
  it('un informe mejor sustituye a otro peor, nunca al reves', () => {
    expect(bestIntelLevel('low', 'high')).toBe('high');
    expect(bestIntelLevel('full', 'blocked')).toBe('full');
    expect(bestIntelLevel(undefined, 'medium')).toBe('medium');
    expect(bestIntelLevel('high', undefined)).toBe('high');
  });

  it('solo se considera conocido a partir de nivel bajo', () => {
    expect(intelIsKnown('blocked')).toBe(false);
    expect(intelIsKnown('low')).toBe(true);
    expect(intelIsKnown('full')).toBe(true);
    expect(intelIsKnown(undefined)).toBe(false);
  });

  it('el rango es coherente con la escalera del resolver', () => {
    expect(INTEL_RANK.blocked).toBeLessThan(INTEL_RANK.low);
    expect(INTEL_RANK.low).toBeLessThan(INTEL_RANK.medium);
    expect(INTEL_RANK.medium).toBeLessThan(INTEL_RANK.high);
    expect(INTEL_RANK.high).toBeLessThan(INTEL_RANK.full);
  });
});

describe('el dossier acumula lo que se sabe de cada mundo', () => {
  const mision = {
    id: 'm1', type: 'espionage',
    from: { id: 'p1', name: 'Tierra' },
    to: { galaxy: 2, system: 2, position: 2 },
    fleet: { espionageProbe: 2 },
    isAI: false,
  };

  const espiar = (state, espDefenseLvl, spyTech = 8) => {
    const original = Math.random;
    Math.random = () => 0.99;
    try {
      return handleEspionageMission(mision, {
        ...state,
        research: { espionage: spyTech },
        gameTick: 500,
        aiPlanets: [{
          id: 'ai-1', name: 'Naxos', galaxy: 2, system: 2, position: 2, isAI: true, aiLevel: 10,
          espDefenseLvl,
          resources: { metal: 60000, crystal: 40000, deuterium: 30000 },
          buildings: { metalMine: 12 },
          fleet: { lightFighter: 55 },
          defenses: { rocketLauncher: 44 },
          research: { weapons: 7 },
          relation: 0,
        }],
      });
    } finally {
      Math.random = original;
    }
  };

  const base = () => ({
    planets: [mision.from],
    aiPlanets: [],
    research: { espionage: 9 },
    spyReports: [],
    planetIntel: {},
  });

  it('un informe mediocre deja el dossier en nivel bajo', () => {
    // espionage 4 contra defensa 4 = techDiff 0, tramo 'low'.
    const r = espiar(base(), 4, 4);
    expect(r.state.planetIntel['ai-1'].level).toBe('low');
    expect(r.state.planetIntel['ai-1'].resources.metal).toBe('parcial');
  });

  it('un informe bueno sube el nivel y guarda el dato exacto', () => {
    // espionage 8 contra defensa 4 = techDiff 4, tramo 'high'.
    const r = espiar(base(), 4, 8);
    expect(r.state.planetIntel['ai-1'].level).toBe('high');
    expect(r.state.planetIntel['ai-1'].resources.metal).toBe(60000);
    expect(r.state.planetIntel['ai-1'].buildings).toEqual({ metalMine: 12 });
  });

  it('un segundo informe no degrada lo ya aprendido', () => {
    const bueno = espiar(base(), 4, 8);
    // espionage 8 contra defensa 12 = techDiff -4: espionage bloqueado.
    const malo = espiar({ ...bueno.state, planetIntel: bueno.state.planetIntel }, 12, 8);
    expect(malo.state.spyReports.slice(-1)[0].intelLevel).toBe('blocked');
    expect(malo.state.planetIntel['ai-1'].level).toBe('high');
    expect(malo.state.planetIntel['ai-1'].buildings).toEqual({ metalMine: 12 });
    expect(malo.state.planetIntel['ai-1'].reports).toBe(2);
  });

  it('el dossier guarda identidad y coordenadas para poder consultarlo', () => {
    const r = espiar(base(), 2);
    expect(r.state.planetIntel['ai-1']).toMatchObject({
      id: 'ai-1',
      name: 'Naxos',
      coords: { galaxy: 2, system: 2, position: 2 },
    });
    expect(r.state.planetIntel['ai-1'].at).toBeGreaterThan(0);
  });

  it('un estado viejo sin planetIntel no rompe al espiar', () => {
    const s = base();
    delete s.planetIntel;
    const r = espiar(s, 2);
    expect(r.state.planetIntel['ai-1']).toBeDefined();
  });
});

describe('persistencia del dossier', () => {
  const repo = readFileSync(join(process.cwd(), 'electron', 'database', 'gameRepository.cjs'), 'utf-8');
  const migrator = readFileSync(join(process.cwd(), 'src', 'reducers', 'loadMigrator.js'), 'utf-8');
  const initial = readFileSync(join(process.cwd(), 'src', 'core', 'initialState.js'), 'utf-8');

  it('planetIntel y aiIntel estan en la allow-list de guardado', () => {
    const allow = repo.match(/const GLOBAL_STATE_KEYS = \[([\s\S]*?)\];/)[1];
    expect(allow).toContain('"planetIntel"');
    expect(allow).toContain('"aiIntel"');
  });

  it('el migrador les pone valor por defecto', () => {
    expect(migrator).toContain('planetIntel:');
    expect(migrator).toContain('aiIntel:');
  });

  it('el estado inicial los declara', () => {
    expect(initial).toContain('planetIntel: {}');
    expect(initial).toContain('aiIntel: {}');
  });
});
