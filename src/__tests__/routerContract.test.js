import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { gameReducer } from '../reducers/index.js';
import { createInitial } from '../core/initialState.js';
import { canAfford } from '../utils/formulas/costFormulas.js';

/**
 * CONTRATO UI -> DOMINIO.
 *
 * Este archivo es la red que faltaba. Hasta ahora ningun test invoco
 * `gameReducer` (el router raiz): todos llamaban a los sub-reducers
 * directamente, asi que 27 acciones despachadas por la UI podian caer en
 * `default: return state` sin que nada se enterara. 223 tests en verde y el
 * Mercado Galactico, las Rutas de Suministro, el Senado Planetario, el retrofit
 * y la Base Lunar seguian muertos.
 *
 * El test lee el codigo fuente de la UI, extrae cada `type: '...'` despachado y
 * exige que el router lo encamine. Si alguien anade una accion a un componente
 * sin enrutarla, este test falla.
 */

const SRC = join(process.cwd(), 'src');

/** Acciones que pertenecen al reducer local de NavigationContext, no al juego. */
const NAVIGATION_LOCAL = new Set([
  'NAVIGATE_TO',
  'NAVIGATE_BACK',
  'NAVIGATE_ROOT',
  'SET_SUB_VIEW',
  'TOGGLE_HUD',
  'SET_DENSITY',
]);

/** Tipos que son valores de datos, no acciones (categorias, recursos, tipos de evento). */
const DATA_LIKE = new Set([
  'building', 'civil', 'colonize', 'combat', 'crisis', 'danger', 'defense',
  'discovery', 'energy', 'energy_boost', 'error', 'espionage',
  'espionage_alert', 'expedition', 'facility', 'fleet_reinforcement',
  'helium_belt', 'industry', 'info', 'INFRASTRUCTURE', 'intel_boost',
  'military', 'mine', 'module', 'PEACE', 'power', 'precursor_ruins',
  'recycle', 'research', 'RESEARCH_SUBSIDY', 'resource', 'resource_grant',
  'ship', 'start', 'storage', 'success', 'transport', 'VACUUM_DEFENSE',
  'warning', 'wormhole', 'UNKNOWN', 'RESET',
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(js|jsx)$/.test(entry) && !/\.test\.jsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Tipos de accion despachados desde la capa de UI (todo src/ menos reducers). */
function collectUiActionTypes() {
  const found = new Map();
  for (const file of walk(SRC)) {
    if (file.includes(`${'reducers'}\\`) || file.includes('/reducers/')) continue;
    const src = readFileSync(file, 'utf-8');
    const re = /type:\s*'([A-Z][A-Z_0-9]{3,})'/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const type = m[1];
      if (NAVIGATION_LOCAL.has(type) || DATA_LIKE.has(type)) continue;
      if (!found.has(type)) found.set(type, []);
      found.get(type).push(file);
    }
  }
  return found;
}

/** Tipos de accion que el router raiz declara como `case`. */
function collectRoutedTypes() {
  const src = readFileSync(join(SRC, 'reducers', 'index.js'), 'utf-8');
  const routed = new Set();
  const re = /case\s+'([A-Z][A-Z_0-9]*)'/g;
  let m;
  while ((m = re.exec(src)) !== null) routed.add(m[1]);
  return routed;
}

describe('contrato UI -> dominio', () => {
  const uiTypes = collectUiActionTypes();
  const routed = collectRoutedTypes();

  it('la extraccion de acciones encuentra trabajo real que verificar', () => {
    // Si el escaner se rompe y devuelve cero, el resto del archivo pasaria
    // en verde sin comprobar nada. Este test falla primero.
    expect(uiTypes.size).toBeGreaterThan(60);
  });

  it('toda accion despachada por la UI esta encaminada en gameReducer', () => {
    const sinRuta = [];
    for (const [type, files] of uiTypes) {
      if (!routed.has(type)) sinRuta.push(`${type}  <- ${[...new Set(files)].map(f => f.split(/[\\/]/).pop()).join(', ')}`);
    }
    expect(sinRuta.join('\n')).toBe('');
  });
});

describe('Senado Planetario: el pacto tributario llega al dominio', () => {
  const base = () => {
    const s = createInitial('Comandante');
    return s;
  };

  it('SET_PLANET_TAX_RATE escribe el impuesto en el planeta', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'SET_PLANET_TAX_RATE', planetId, taxRate: 0.25 });
    const p1 = s1.planets.find(p => p.id === planetId);
    expect(p1.taxRate).toBe(0.25);
  });

  it('el motor usa el pacto del planeta, no el del ministerio', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'SET_PLANET_TAX_RATE', planetId, taxRate: 0.25 });
    const p1 = s1.planets.find(p => p.id === planetId);
    // El motor recibe el taxRate del planeta: 25% de impuesto.
    expect(p1.taxRate).toBe(0.25);
    expect(s1.ministries.economy.taxRate).toBe(0.1);
  });

  it('el dominio acota el impuesto aunque la UI no lo haga', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    const alta = gameReducer(s0, { type: 'SET_PLANET_TAX_RATE', planetId, taxRate: 9 });
    expect(alta.planets.find(p => p.id === planetId).taxRate).toBe(0.5);
    const baja = gameReducer(s0, { type: 'SET_PLANET_TAX_RATE', planetId, taxRate: -3 });
    expect(baja.planets.find(p => p.id === planetId).taxRate).toBe(0);
  });

  it('un 0% explicito no se confunde con "sin valor"', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'SET_PLANET_TAX_RATE', planetId, taxRate: 0 });
    expect(s1.planets.find(p => p.id === planetId).taxRate).toBe(0);
  });

  it('TOGGLE_PLANET_LOCAL_DIRECTIVE alterna cada edicto local', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'TOGGLE_PLANET_LOCAL_DIRECTIVE', planetId, directive: 'subsidies' });
    expect(s1.planets.find(p => p.id === planetId).localDirectives.subsidies).toBe(true);
    const s2 = gameReducer(s1, { type: 'TOGGLE_PLANET_LOCAL_DIRECTIVE', planetId, directive: 'subsidies' });
    expect(s2.planets.find(p => p.id === planetId).localDirectives.subsidies).toBe(false);
  });

  it('un edicto no borra los demas', () => {
    const s0 = base();
    const planetId = s0.planets[0].id;
    let s = gameReducer(s0, { type: 'TOGGLE_PLANET_LOCAL_DIRECTIVE', planetId, directive: 'subsidies' });
    s = gameReducer(s, { type: 'TOGGLE_PLANET_LOCAL_DIRECTIVE', planetId, directive: 'martialLaw' });
    const d = s.planets.find(p => p.id === planetId).localDirectives;
    expect(d.subsidies).toBe(true);
    expect(d.martialLaw).toBe(true);
  });
});

describe('Gobernador local y automatizacion ministerial', () => {
  it('SET_PLANET_GOVERNOR escribe en el planeta, no en el imperio', () => {
    const s0 = createInitial('Comandante');
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'SET_PLANET_GOVERNOR', payload: { planetId, governor: 'ibarra' } });
    expect(s1.planets.find(p => p.id === planetId).governance.governor).toBe('ibarra');
  });

  it('SET_MINISTRY_AUTOMATION llega al dominio (full_auto del gobernador IA)', () => {
    const s0 = createInitial('Comandante');
    const planetId = s0.planets[0].id;
    const s1 = gameReducer(s0, { type: 'SET_MINISTRY_AUTOMATION', ministryId: 'economy', planetId, enabled: true });
    expect(s1.planets.find(p => p.id === planetId).ministries.economy.automationEnabled).toBe(true);
  });
});

describe('DISMISS_ULTIMATUM', () => {
  it('cierra el ultimatum sin pagar tributo', () => {
    const s0 = { ...createInitial('Comandante'), activeUltimatum: { aiId: 'a1', cost: { metal: 10000 } } };
    const s1 = gameReducer(s0, { type: 'DISMISS_ULTIMATUM' });
    expect(s1.activeUltimatum).toBeNull();
    expect(s1.planets[0].resources).toEqual(s0.planets[0].resources);
  });

  it('sin ultimatum no inventa estado', () => {
    const s0 = createInitial('Comandante');
    const s1 = gameReducer(s0, { type: 'DISMISS_ULTIMATUM' });
    expect(s1).toBe(s0);
  });
});

describe('firma de canAfford: (recursos, coste)', () => {
  it('la firma real es (res, cost)', () => {
    expect(canAfford({ metal: 100, crystal: 0, deuterium: 0 }, { metal: 50 })).toBe(true);
    expect(canAfford({ metal: 10, crystal: 0, deuterium: 0 }, { metal: 50 })).toBe(false);
  });

  it('los argumentos invertidos darian el resultado contrario', () => {
    const res = { metal: 10, crystal: 0, deuterium: 0 };
    const cost = { metal: 50 };
    expect(canAfford(res, cost)).toBe(false);
    // Asi de roto estaban MoonPage y MissilesPage: el boton se encendia
    // cuando NO se podia pagar.
    expect(canAfford(cost, res)).toBe(true);
  });
});

describe('cartas del hub que antes no se renderizaban', () => {
  it('el hub de un mundo incluye las tarjetas compartidas que ahora si existen', async () => {
    const { PLANETARY_COMMAND_CARDS, buildPlanetaryCommandCards } = await import(
      '../components/government/hub/planetaryCommandCardsConfig.jsx'
    );
    expect(PLANETARY_COMMAND_CARDS).toContain('shipDesign');
    expect(PLANETARY_COMMAND_CARDS).toContain('combat');

    const cards = buildPlanetaryCommandCards({
      onEnterMinistries: () => {},
      onNavigateTab: () => {},
      onOpenPlanetarySenate: () => {},
      onBackToEmpire: () => {},
      ministryCount: 19,
      activeMinistersCount: 0,
      autoMinistriesCount: 0,
      fmt: (n) => String(n),
      state: createInitial('Comandante'),
      planet: createInitial('Comandante').planets[0],
      fleets: [],
      shipyardLevel: 0,
      siloLevel: 0,
    });
    // Cada id declarado en el tablero debe tener una tarjeta construida.
    for (const id of PLANETARY_COMMAND_CARDS) {
      expect(cards[id]).toBeTruthy();
    }
  });
});
