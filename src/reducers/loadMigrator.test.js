import { describe, it, expect } from 'vitest';
import { migrateLoadState } from './loadMigrator.js';

describe('migrateLoadState', () => {
  it('migrates and establishes defaults for loaded state', () => {
    const raw = {
      playerName: 'Comandante',
      planets: [{ id: 'p1', name: 'Terra' }]
    };
    const migrated = migrateLoadState(raw);
    expect(migrated.version).toBe(4);
    expect(migrated.gameStarted).toBe(true);
    expect(Array.isArray(migrated.planets)).toBe(true);
    expect(migrated.planets[0].name).toBe('Terra');
  });

  it('sanitizes AI state if present', () => {
    const raw = {
      playerName: 'Test',
      planets: [],
      aiPlayers: [{ id: 'ai-1', name: 'Zorg', resources: {} }]
    };
    const migrated = migrateLoadState(raw);
    expect(migrated.aiPlayers).toBeDefined();
    expect(migrated.aiPlayers.length).toBe(1);
  });
});
