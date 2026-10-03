import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * CONTRATO TDD FASE 15: SAVE vs COMMANDER.
 *
 * El nombre de la partida (saveName) y el nombre del comandante (playerName / commanderId)
 * deben ser identidades independientes:
 * 1. Renombrar un archivo/slot de guardado NO cambia el nombre del comandante.
 * 2. Cambiar el nombre del comandante en el perfil NO altera el nombre de la ranura de guardado ni el slug.
 * 3. Migración v4 añade save_name y commander_id a game_sessions sin pérdida de datos.
 * 4. listGameSessions expone saveName, playerName y gameMode para filtrado y récords.
 * 5. persistenceContract reconoce saveName y commanderId en IN_SESSION_COLUMN.
 */

describe('Fase 15: Save vs Commander Contract', () => {
  const dbManagerCode = readFileSync(
    join(process.cwd(), 'electron', 'database', 'dbManager.cjs'),
    'utf-8'
  );
  const gameRepoCode = readFileSync(
    join(process.cwd(), 'electron', 'database', 'gameRepository.cjs'),
    'utf-8'
  );
  const saveIpcCode = readFileSync(
    join(process.cwd(), 'electron', 'ipc', 'saveIpc.cjs'),
    'utf-8'
  );

  it('debe tener SCHEMA_VERSION >= 4 en dbManager.cjs y registrar columnas save_name y commander_id', () => {
    expect(dbManagerCode).toMatch(/const SCHEMA_VERSION = [4-9];/);
    expect(dbManagerCode).toMatch(/save_name TEXT/);
    expect(dbManagerCode).toMatch(/commander_id TEXT/);
    expect(dbManagerCode).toMatch(/name:\s*["']save_name_and_commander_id_columns["']/);
  });

  it('gameRepository debe persistir y cargar save_name y commander_id de forma desacoplada', () => {
    // Al guardar debe considerar state.saveName antes de fallback
    expect(gameRepoCode).toMatch(/save_name/);
    expect(gameRepoCode).toMatch(/commander_id/);
    // listGameSessions debe devolver gameMode y saveName
    expect(gameRepoCode).toMatch(/game_mode/);
    // renameGameSession debe actualizar save_name, NO player_name
    expect(gameRepoCode).toMatch(/UPDATE game_sessions[\s\S]*?SET slug = \?, save_name = \?, updated_at = \?/);
  });

  it('saveIpc debe usar saveName (o fallback) para slug y nombre de archivo sin mutar playerName', () => {
    // En save-game-named y sync debe priorizar data.saveName o data._saveName
    expect(saveIpcCode).toMatch(/data\.saveName\s*\|\|\s*data\._saveName/);
  });
});
