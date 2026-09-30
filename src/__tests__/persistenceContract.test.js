import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * CONTRATO DE PERSISTENCIA.
 *
 * La allow-list `GLOBAL_STATE_KEYS` de electron/database/gameRepository.cjs
 * decide que sobrevive a guardar. Durante años(frame de tiempo) fue una lista
 * corta que se escribio a mano: `currentPlanetId`, `patrols`,
 * `tacticalEventLog` y `lastTick` quedaron fuera, asi que al cargar la partida
 * el jugador reaparecia en otro planeta, sus patrullas habian desaparecido y
 * la bandeja de comunicaciones se vaciaba. Nada avisaba: el guardado contaba
 * como correcto.
 *
 * Estos tests no tocan la base de datos real. Comprueban el CONTRATO entre el
 * codigo: que toda clave que el juego escribe en su estado este en la
 * allow-list, salvo declaracion expresa de que es efimera.
 */

const SRC = join(process.cwd(), 'src');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(entry) && !/\.test\.jsx?$/.test(entry)) out.push(full);
  }
  return out;
}

const repo = readFileSync(
  join(process.cwd(), 'electron', 'database', 'gameRepository.cjs'),
  'utf-8'
);

const allowListMatch = repo.match(/const GLOBAL_STATE_KEYS = \[([\s\S]*?)\];/);
if (!allowListMatch) throw new Error('No se encontró GLOBAL_STATE_KEYS en gameRepository.cjs');

const PERSISTED = new Set(
  [...allowListMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
);

const queueListMatch = repo.match(/const QUEUE_KEYS = \[([\s\S]*?)\];/);
const QUEUES = new Set(
  [...queueListMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1])
);

/** Se guardan en su propia tabla, no en global_state_json. */
const IN_OWN_TABLE = new Set(['planets', 'aiPlanets', 'fleetMissions']);

/** Columnas de game_sessions. */
const IN_SESSION_COLUMN = new Set([
  'version', 'playerName', 'saveName', 'commanderId', 'gameStarted', 'gameTick', 'gameMode',
]);

/**
 * Claves que se declaran efimeras de forma explicita, con su motivo. Anadir
 * una aqui es una decision documentada, no una comodidad: el test de abajo
 * comprueba que no esten tambien en la allow-list.
 */
const EPHEMERAL = new Map([
  ['_sessionId', 'identidad de sesion: la reinyecta el proceso principal al cargar'],
  ['_saveSlug', 'alias de session.slug, no se usa en el juego'],
  ['_saveName', 'alias de player_name; la separacion real es la fase 15'],
  ['_createdAt', 'lo reconstructye game_sessions.created_at'],
]);

/** Subclaves de un planeta: viajan dentro de planets.data_json. */
const PLANET_SUBKEYS = new Set([
  'resources', 'buildings', 'fleet', 'defenses', 'retrofitTech', 'moon',
  'governance', 'biosphere', 'thermalGrid', 'demographics', 'research',
  'specialization', 'taxRate', 'localDirectives', 'ministries',
  'ministryUpgrades', 'autoTrade', 'automatedExclusions', 'fleetVariants',
  'defenseVariants', 'population', 'name', 'id', 'isHome', 'isVirgin',
  'galaxy', 'system', 'position', 'biome', 'planetSize', 'gravity', 'trait',
  'faction', 'is_ai', 'back', 'morale',
]);

/**
 * Claves de primer nivel que el juego escribe en SU estado.
 *
 * Solo se recorren los reducers: es donde vive el estado de la partida.
 * `NavigationContext` tiene su propio reducer local (pestaña activa, densidad
 * del panel, sub-vista, hud) que no es estado de partida y ya se persiste por
 * separado en localStorage. Incluirlo aqui daba falsos positivos.
 */
function collectLiveTopLevelKeys() {
  const keys = new Map(); // key -> donde se vio

  for (const file of walk(join(SRC, 'reducers'))) {
    const rel = file.split(/[\\/]/).slice(-2).join('/');
    const src = readFileSync(file, 'utf-8');

    // Asignaciones al state: newState.clave = / state.clave = / workingState.clave =
    for (const m of src.matchAll(/\b(?:newState|workingState|prevState|state|newStats|newPlanets)\.([A-Za-z_][A-Za-z0-9_]*)\s*=/g)) {
      if (!keys.has(m[1])) keys.set(m[1], rel);
    }
    // Propiedades del state en un objeto literal: { ...state, clave:
    for (const m of src.matchAll(/\.\.\.state,\s*\n?\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/g)) {
      if (!keys.has(m[1])) keys.set(m[1], rel);
    }
  }
  return keys;
}

describe('contrato de persistencia', () => {
  const live = collectLiveTopLevelKeys();

  it('el escaner encuentra claves que verificar', () => {
    // Si el escaner se rompe, el resto pasaria en verde sin comprobar nada.
    expect(live.size).toBeGreaterThan(20);
  });

  it('la allow-list no esta vacia y cubre el estado base', () => {
    expect(PERSISTED.size).toBeGreaterThan(30);
    for (const clave of ['research', 'stats', 'ministries', 'currentPlanetId', 'patrols', 'tacticalEventLog', 'lastTick']) {
      expect(PERSISTED.has(clave)).toBe(true);
    }
  });

  it('toda clave que el juego escribe sobrevive al guardado', () => {
    const perdido = [];
    for (const [clave, donde] of live) {
      if (PERSISTED.has(clave)) continue;
      if (QUEUES.has(clave)) continue;
      if (IN_OWN_TABLE.has(clave)) continue;
      if (IN_SESSION_COLUMN.has(clave)) continue;
      if (EPHEMERAL.has(clave)) continue;
      if (PLANET_SUBKEYS.has(clave)) continue;
      perdido.push(`${clave}  <- ${donde}`);
    }
    expect(perdido.sort().join('\n')).toBe('');
  });

  it('no hay claves duplicadas en la allow-list', () => {
    const todos = [...allowListMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
    const dupes = todos.filter((k, i) => todos.indexOf(k) !== i);
    expect(dupes).toEqual([]);
  });

  it('toda clave declarada efimera lo esta de verdad', () => {
    // Una clave marcada como efimera que ademas se persiste es una contradiccion
    // que esconderia el futuro breakage.
    for (const clave of EPHEMERAL.keys()) {
      expect(PERSISTED.has(clave)).toBe(false);
    }
  });

  it('ningun componente muta el estado de la partida directamente', () => {
    // El estado solo se cambia por dispatch. Si un componente hace
    // `state.algo = ...`, ese cambio no pasa por el router y no se persiste.
    const ofensores = [];
    for (const file of walk(SRC)) {
      if (file.includes(`${'reducers'}\\`) || file.includes('/reducers/')) continue;
      const src = readFileSync(file, 'utf-8');
      for (const m of src.matchAll(/\bstate\.([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)/g)) {
        ofensores.push(`${file.split(/[\\/]/).pop()}: ${m[0].trim()}`);
      }
    }
    expect(ofensores.join('\n')).toBe('');
  });
});

describe('seguridad del contrato de persistencia', () => {
  const dbManager = readFileSync(join(process.cwd(), 'electron', 'database', 'dbManager.cjs'), 'utf-8');
  const mainCjs = readFileSync(join(process.cwd(), 'electron', 'main.cjs'), 'utf-8');
  const backupManager = readFileSync(join(process.cwd(), 'electron', 'ipc', 'backupManager.cjs'), 'utf-8');

  it('el esquema tiene version y migraciones idempotentes', () => {
    expect(dbManager).toContain('SCHEMA_VERSION');
    expect(dbManager).toContain('schema_version');
    expect(dbManager).toContain('ALTER TABLE ships ADD COLUMN session_id');
    // Nada destructivo en las migraciones.
    expect(dbManager).not.toMatch(/ALTER TABLE[\s\S]{0,80}DROP COLUMN/);
  });

  it('el backup hace checkpoint del WAL antes de copiar', () => {
    expect(backupManager).toContain('beforeCopy');
    // Y ya no copia el WAL a un lado que nadie lee.
    expect(backupManager).not.toContain('backupPath + "-wal")\n      }');
    expect(dbManager).toContain('wal_checkpoint(TRUNCATE)');
  });

  it('el guardado devuelve el sessionId para que el renderer lo reutilice', () => {
    const saveIpc = readFileSync(join(process.cwd(), 'electron', 'ipc', 'saveIpc.cjs'), 'utf-8');
    expect(saveIpc).toContain('sessionId: saved.sessionId');
  });

  it('exportar quita la identidad de sesion e importar genera una nueva', () => {
    expect(repo).toContain('function toExportPayload');
    expect(repo).toMatch(/function importSessionFromJson[\s\S]{0,400}delete payload\._sessionId/);
  });

  it('cargar tambien valida el save, no solo guardar', () => {
    const saveIpc = readFileSync(join(process.cwd(), 'electron', 'ipc', 'saveIpc.cjs'), 'utf-8');
    const load = saveIpc.slice(saveIpc.indexOf('load-save-by-slug'), saveIpc.indexOf('save-game-named'));
    expect(load).toContain('validateSaveData');
  });

  it('el canal de migracion de json sanea el slug', () => {
    const canal = mainCjs.slice(mainCjs.indexOf('db-migrate-json'), mainCjs.indexOf('db-migrate-json') + 600);
    expect(canal).toMatch(/\[a-z0-9-\]\{1,80\}/);
    expect(canal).toContain('..');
  });

  it('el renderer no puede abrir ventanas ni navegar fuera', () => {
    expect(mainCjs).toContain('setWindowOpenHandler');
    expect(mainCjs).toContain('will-navigate');
  });

  it('las respuestas HTML llevan CSP', () => {
    expect(mainCjs).toContain('Content-Security-Policy');
    expect(mainCjs).toContain("script-src 'self'");
  });

  it('borrar una sesion no toca las naves sin sesion de partidas antiguas', () => {
    const borrar = repo.slice(repo.indexOf('function deleteGameSession'), repo.indexOf('function renameGameSession'));
    expect(borrar).toContain('DELETE FROM ships WHERE session_id = ?');
    // Nunca un DELETE masivo de ships.
    expect(borrar).not.toMatch(/DELETE FROM ships(?! WHERE)/);
  });
});
