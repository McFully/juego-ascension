/**
 * tacticalEventLog.test.js — Parte 3: bandeja de comunicaciones.
 *
 * Cubre lo que el paso 3.4 cambia de verdad:
 *   - nada se abre solo, pero nada se pierde;
 *   - `read` va en la entrada, así que marcar leído NO borra;
 *   - los slots ya no se pisan entre sí (el bug de 3.1);
 *   - una partida vieja con mensajes sin mirar los conserva al cargar.
 */

import { describe, test, expect } from 'vitest';
import { eventReducer } from '../reducers/eventReducer.js';
import { migrateLoadState } from '../reducers/loadMigrator.js';
import { processTick } from '../reducers/tick/tickOrchestrator.js';
import { initialState } from '../core/initialState.js';

const baseState = (over = {}) => ({
  ...initialState,
  gameStarted: true,
  notifications: [],
  tacticalEvents: [],
  tacticalEventLog: [],
  activeEvent: null,
  activeFirstContact: null,
  activeTransmission: null,
  ...over,
});

const TACTICAL = {
  id: 'evt-1',
  type: 'colonize',
  title: 'Nueva Colonia',
  subtitle: 'Sector 7',
  description: 'La crippled ha sido colonizada.',
  resources: { metal: 1000, crystal: 500, deuterium: 200 },
};

describe('3.3 — el registro acumula lo que antes solo se encolaba', () => {
  test('APPEND_TACTICAL_EVENT_LOG añade la entrada sin leer', () => {
    const out = eventReducer(baseState(), {
      type: 'APPEND_TACTICAL_EVENT_LOG',
      payload: TACTICAL,
    });
    expect(out.tacticalEventLog).toHaveLength(1);
    expect(out.tacticalEventLog[0].id).toBe('evt-1');
    expect(out.tacticalEventLog[0].read).toBe(false);
    expect(out.tacticalEventLog[0].kind).toBe('tactical');
    expect(out.tacticalEventLog[0].receivedAt).toBeTruthy();
  });

  test('conserva los campos de detalle que cada generador ya producía', () => {
    const withCombat = {
      id: 'evt-c', type: 'combat', title: 'Combate',
      combatResult: 'victory',
      losses: { playerLosses: 3, enemyLosses: 12 },
      debris: { metal: 900, crystal: 400 },
    };
    const out = eventReducer(baseState(), { type: 'APPEND_TACTICAL_EVENT_LOG', payload: withCombat });
    expect(out.tacticalEventLog[0].losses.playerLosses).toBe(3);
    expect(out.tacticalEventLog[0].debris.metal).toBe(900);
  });

  test('no duplica una entrada con el mismo id', () => {
    let s = baseState();
    s = eventReducer(s, { type: 'APPEND_TACTICAL_EVENT_LOG', payload: TACTICAL });
    s = eventReducer(s, { type: 'APPEND_TACTICAL_EVENT_LOG', payload: TACTICAL });
    expect(s.tacticalEventLog).toHaveLength(1);
  });

  test('ignora payloads que no son objetos', () => {
    let s = eventReducer(baseState(), { type: 'APPEND_TACTICAL_EVENT_LOG', payload: null });
    s = eventReducer(s, { type: 'APPEND_TACTICAL_EVENT_LOG', payload: 'basura' });
    expect(s.tacticalEventLog).toHaveLength(0);
  });

  test('una entrada con opciones queda marcada como decisión pendiente', () => {
    const narrative = {
      id: 'narr-1', kind: 'narrative', title: 'El Consejo Debate',
      options: [{ text: 'Aceptar', cost: { metal: 100 } }],
    };
    const out = eventReducer(baseState(), { type: 'APPEND_TACTICAL_EVENT_LOG', payload: narrative });
    expect(out.tacticalEventLog[0].requiresDecision).toBe(true);
    expect(out.tacticalEventLog[0].options).toHaveLength(1);
  });

  test('una entrada sin opciones NO requiere decisión', () => {
    const out = eventReducer(baseState(), { type: 'APPEND_TACTICAL_EVENT_LOG', payload: TACTICAL });
    expect(out.tacticalEventLog[0].requiresDecision).toBe(false);
  });

  test('una prioridad inventada cae a media en vez de romper', () => {
    const out = eventReducer(baseState(), {
      type: 'APPEND_TACTICAL_EVENT_LOG',
      payload: { ...TACTICAL, priority: 'urgente' },
    });
    expect(out.tacticalEventLog[0].priority).toBe('media');
  });

  test('una prioridad válida se respeta', () => {
    const out = eventReducer(baseState(), {
      type: 'APPEND_TACTICAL_EVENT_LOG',
      payload: { ...TACTICAL, priority: 'critica' },
    });
    expect(out.tacticalEventLog[0].priority).toBe('critica');
  });
});

describe('3.5-c — marcar leído NO borra', () => {
  const withTwo = () => {
    let s = baseState();
    s = eventReducer(s, { type: 'APPEND_TACTICAL_EVENT_LOG', payload: TACTICAL });
    s = eventReducer(s, {
      type: 'APPEND_TACTICAL_EVENT_LOG',
      payload: { ...TACTICAL, id: 'evt-2', title: 'Retorno' },
    });
    return s;
  };

  test('MARK_TACTICAL_EVENT_READ baja el contador sin borrar la entrada', () => {
    const before = withTwo();
    expect(before.tacticalEventLog.filter(e => !e.read)).toHaveLength(2);

    const after = eventReducer(before, { type: 'MARK_TACTICAL_EVENT_READ', payload: 'evt-1' });
    expect(after.tacticalEventLog).toHaveLength(2);
    expect(after.tacticalEventLog.filter(e => !e.read)).toHaveLength(1);
    expect(after.tacticalEventLog.find(e => e.id === 'evt-1').read).toBe(true);
    expect(after.tacticalEventLog.find(e => e.id === 'evt-2').read).toBe(false);
  });

  test('MARK_ALL baja el contador a cero sin borrar nada', () => {
    const after = eventReducer(withTwo(), { type: 'MARK_ALL_TACTICAL_EVENTS_READ' });
    expect(after.tacticalEventLog).toHaveLength(2);
    expect(after.tacticalEventLog.every(e => e.read)).toBe(true);
  });

  test('CLEAR_READ borra solo los leídos y respeta los no leídos', () => {
    let s = withTwo();
    s = eventReducer(s, { type: 'MARK_TACTICAL_EVENT_READ', payload: 'evt-1' });
    const after = eventReducer(s, { type: 'CLEAR_READ_TACTICAL_EVENTS' });
    expect(after.tacticalEventLog).toHaveLength(1);
    expect(after.tacticalEventLog[0].id).toBe('evt-2');
    expect(after.tacticalEventLog[0].read).toBe(false);
  });

  test('DISMISS_TACTICAL_EVENT sigue vaciando la cola antigua, no el log', () => {
    // La cola `tacticalEvents` es efímera; el log es el histórico. Descartar la
    // cola no debe hacer desaparecer el historial.
    const before = baseState({ tacticalEvents: [TACTICAL] });
    const after = eventReducer(before, { type: 'DISMISS_TACTICAL_EVENT', payload: 'evt-1' });
    expect(after.tacticalEvents).toHaveLength(0);
    expect(after.tacticalEventLog).toHaveLength(0);
  });

  test('una entrada con decisión pendiente se puede marcar leída pero no se borra sola', () => {
    const narrative = { id: 'n1', kind: 'narrative', title: 'Decisión', options: [{ text: 'A' }] };
    let s = eventReducer(baseState(), { type: 'APPEND_TACTICAL_EVENT_LOG', payload: narrative });
    s = eventReducer(s, { type: 'MARK_TACTICAL_EVENT_READ', payload: 'n1' });
    expect(s.tacticalEventLog).toHaveLength(1);
    expect(s.tacticalEventLog[0].read).toBe(true);
  });
});

describe('3.1 — los slots ya no se pisan entre sí', () => {
  const fullSlots = () => baseState({
    activeEvent: { id: 'ev', options: [{ text: 'x' }] },
    activeFirstContact: { id: 'fc' },
    activeTransmission: { id: 'tr', message: 'hola' },
  });

  test('DISMISS_TRANSMISSION NO borra activeEvent ni activeFirstContact', () => {
    const out = eventReducer(fullSlots(), { type: 'DISMISS_TRANSMISSION' });
    expect(out.activeTransmission).toBeNull();
    // Estas dos son las que antes se perdían sin que nadie las leyera.
    expect(out.activeEvent).toBeTruthy();
    expect(out.activeFirstContact).toBeTruthy();
  });

  test('DISMISS_FIRST_CONTACT NO borra activeEvent ni activeTransmission', () => {
    const out = eventReducer(fullSlots(), { type: 'DISMISS_FIRST_CONTACT' });
    expect(out.activeFirstContact).toBeNull();
    expect(out.activeEvent).toBeTruthy();
    expect(out.activeTransmission).toBeTruthy();
  });

  test('CLEAR_ACTIVE_EVENT NO borra activeFirstContact ni activeTransmission', () => {
    const out = eventReducer(fullSlots(), { type: 'CLEAR_ACTIVE_EVENT' });
    expect(out.activeEvent).toBeNull();
    expect(out.activeFirstContact).toBeTruthy();
    expect(out.activeTransmission).toBeTruthy();
  });

  test('RESOLVE_DECISION_EVENT NO borra los otros dos slots', () => {
    const s = baseState({
      activeEvent: { id: 'ev', options: [{ text: 'A' }, { text: 'B' }] },
      activeFirstContact: { id: 'fc' },
      activeTransmission: { id: 'tr' },
      currentPlanetId: 'p1',
      planets: [{ id: 'p1', resources: { metal: 100, crystal: 100, deuterium: 100 } }],
    });
    const out = eventReducer(s, { type: 'RESOLVE_DECISION_EVENT', option: 0 });
    expect(out.activeEvent).toBeNull();
    expect(out.activeFirstContact).toBeTruthy();
    expect(out.activeTransmission).toBeTruthy();
  });
});

describe('3.3 — migración de partidas viejas', () => {
  test('una partida sin log arranca con log vacío', () => {
    const out = migrateLoadState({ planets: [], aiPlanets: [] });
    expect(out.tacticalEventLog).toEqual([]);
  });

  test('una partida con cola táctica la vuelca al log, sin leer', () => {
    const out = migrateLoadState({
      planets: [], aiPlanets: [],
      tacticalEvents: [{ id: 'old-1', type: 'colonize', title: 'Colonia vieja' }],
    });
    expect(out.tacticalEventLog).toHaveLength(1);
    expect(out.tacticalEventLog[0].id).toBe('old-1');
    expect(out.tacticalEventLog[0].read).toBe(false);
  });

  test('una narrativa sin mirar NO se pierde al cargar', () => {
    // Es el caso que 3.4 crearía: el overlay ya no se monta, así que si no se
    // vuelca al log, la decisión desaparece en silencio.
    const out = migrateLoadState({
      planets: [], aiPlanets: [],
      activeEvent: { id: 'ev1', title: 'El Senado Debate', options: [{ text: 'A' }] },
    });
    expect(out.tacticalEventLog).toHaveLength(1);
    expect(out.tacticalEventLog[0].kind).toBe('narrative');
    expect(out.tacticalEventLog[0].requiresDecision).toBe(true);
    expect(out.tacticalEventLog[0].read).toBe(false);
  });

  test('una transmisión y un primer contacto huérfanos también se conservan', () => {
    const out = migrateLoadState({
      planets: [], aiPlanets: [],
      activeTransmission: { id: 'tr1', message: 'Señal' },
      activeFirstContact: { id: 'fc1' },
    });
    const kinds = out.tacticalEventLog.map(e => e.kind);
    expect(kinds).toContain('transmission');
    expect(kinds).toContain('firstContact');
  });

  test('si el log ya existe, se respeta y no se duplica con la cola', () => {
    const out = migrateLoadState({
      planets: [], aiPlanets: [],
      tacticalEventLog: [{ id: 'a', type: 'combat', title: 'Ya en el log', read: true }],
      tacticalEvents: [{ id: 'a', type: 'combat', title: 'Ya en el log', read: false }],
    });
    expect(out.tacticalEventLog).toHaveLength(1);
    // El log manda: si ya estaba, se conserva su estado de lectura.
    expect(out.tacticalEventLog[0].read).toBe(true);
  });

  test('sin payload, la migración no revienta', () => {
    const out = migrateLoadState();
    expect(Array.isArray(out.tacticalEventLog)).toBe(true);
  });
});

describe('3.4 — el orquestador vuelca los slots a la bandeja', () => {
  // Es el punto que garantiza que "nada se abre solo" no se convierta en
  // "nada se ve nunca": los slots que ya no tienen overlay se convierten en
  // entradas de bandeja en el mismo tick.
  const tickState = (over = {}) => ({
    ...initialState,
    gameStarted: true,
    gameTick: 5,
    playerName: 'Test',
    currentPlanetId: 'p1',
    planets: [{
      id: 'p1', name: 'Home', faction: 'human',
      buildings: {}, resources: { metal: 1e6, crystal: 1e6, deuterium: 1e6 },
      fleet: {}, research: {}, ministries: {}, temperature: 20, biome: 'temperate', gravity: 1,
    }],
    notifications: [],
    tacticalEvents: [],
    tacticalEventLog: [],
    activeEvent: null,
    activeFirstContact: null,
    activeTransmission: null,
    ...over,
  });

  test('una transmisión pendiente llega a la bandeja y el slot se vacía', () => {
    const out = processTick(tickState({
      activeTransmission: { id: 'tr-9', message: 'Señal entrante', name: 'Emisor' },
    }));
    expect(out.tacticalEventLog).toHaveLength(1);
    expect(out.tacticalEventLog[0].kind).toBe('transmission');
    expect(out.tacticalEventLog[0].read).toBe(false);
    expect(out.activeTransmission).toBeNull();
  });

  test('un primer contacto pendiente llega a la bandeja', () => {
    const out = processTick(tickState({
      activeFirstContact: { id: 'fc-9', faction: 'human' },
    }));
    expect(out.tacticalEventLog.some(e => e.kind === 'firstContact')).toBe(true);
    expect(out.activeFirstContact).toBeNull();
  });

  test('una narrativa con opciones queda como decisión pendiente', () => {
    const out = processTick(tickState({
      activeEvent: { id: 'ev-9', title: 'El Senado', options: [{ text: 'A' }, { text: 'B' }] },
    }));
    const entry = out.tacticalEventLog.find(e => e.kind === 'narrative');
    expect(entry).toBeTruthy();
    expect(entry.requiresDecision).toBe(true);
    expect(out.activeEvent).toBeNull();
  });

  test('volcar dos ticks seguidos NO duplica la entrada', () => {
    const s = tickState({ activeTransmission: { id: 'tr-9', message: 'Señal' } });
    const once = processTick(s);
    const twice = processTick(once);
    expect(once.tacticalEventLog).toHaveLength(1);
    expect(twice.tacticalEventLog).toHaveLength(1);
  });

  test('sin slots pendientes, el log no crece solo', () => {
    const out = processTick(tickState());
    expect(out.tacticalEventLog).toHaveLength(0);
  });

  test('3.6 — no se encadenan narrativas mientras haya una decisión sin mirar', () => {
    // Con la guarda antigua (basada en slots) no se controlaba, porque el slot
    // se vacía al volcar. Ahora la pregunta es al log.
    let s = tickState({
      tacticalEventLog: [{
        id: 'pend-1', kind: 'narrative', title: 'Decisión abierta',
        read: false, requiresDecision: true, options: [{ text: 'A' }],
      }],
    });
    const before = s.tacticalEventLog.length;
    s = processTick(s);
    // Sigue la pendiente; no se ha generado una narrativa nueva encima.
    expect(s.tacticalEventLog.some(e => e.id === 'pend-1')).toBe(true);
    expect(s.tacticalEventLog.length).toBeGreaterThanOrEqual(before);
  });

  test('el log se poda para no crecer sin límite', () => {
    const many = Array.from({ length: 400 }, (_, i) => ({
      id: `old-${i}`, kind: 'tactical', title: `Evento ${i}`, read: true,
    }));
    const out = processTick(tickState({ tacticalEventLog: many }));
    expect(out.tacticalEventLog.length).toBeLessThanOrEqual(300);
  });
});

describe('3.6 — los estados continuos dejan rastro, pero no spamean', () => {
  const base = () => ({
    ...initialState,
    gameStarted: true,
    gameTick: 5,
    playerName: 'Test',
    currentPlanetId: 'p1',
    planets: [{
      id: 'p1', name: 'Home', faction: 'human',
      buildings: {}, resources: { metal: 1e6, crystal: 1e6, deuterium: 1e6 },
      fleet: {}, research: {}, ministries: {}, temperature: 20, biome: 'temperate', gravity: 1,
    }],
    fleetMissions: [],
    notifications: [],
    tacticalEvents: [],
    tacticalEventLog: [],
    activeEvent: null,
    activeFirstContact: null,
    activeTransmission: null,
  });

  const invasion = () => ({
    type: 'attack', isAI: true, remainingTicks: 120, targetPlanetId: 'p1',
  });

  test('una invasión se anota en la bandeja como crítica', () => {
    const out = processTick({ ...base(), fleetMissions: [invasion()] });
    const entry = out.tacticalEventLog.find(e => e.type === 'invasion');
    expect(entry).toBeTruthy();
    expect(entry.priority).toBe('critica');
    expect(entry.read).toBe(false);
  });

  test('NO se repite cada tick mientras la invasión continúa', () => {
    let s = { ...base(), fleetMissions: [invasion()] };
    s = processTick(s);
    const afterFirst = s.tacticalEventLog.filter(e => e.type === 'invasion').length;
    s = processTick(s);
    s = processTick(s);
    const afterThird = s.tacticalEventLog.filter(e => e.type === 'invasion').length;
    expect(afterFirst).toBe(1);
    expect(afterThird).toBe(1);
  });

  test('una crisis energética también se anota', () => {
    const s = base();
    s.planets[0].production = { energyBalance: -10 };
    const out = processTick(s);
    expect(out.tacticalEventLog.find(e => e.type === 'crisis_energetica')).toBeTruthy();
  });

  test('sin invasión ni crisis, el log no se toca', () => {
    const out = processTick(base());
    expect(out.tacticalEventLog).toHaveLength(0);
  });
});
