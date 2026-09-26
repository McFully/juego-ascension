import { CODEX_BUILDINGS } from './codex_modules/codexBuildings.js';
import { CODEX_RESEARCH } from './codex_modules/codexResearch.js';
import { CODEX_SHIPS_DEFENSES_MOONS } from './codex_modules/codexShipsDefensesMoons.js';
import { CODEX_EXPANDED_BUILDINGS } from './codex_modules/codexExpandedBuildings.js';
import { CODEX_EXPANDED_RESEARCH } from './codex_modules/codexExpandedResearch.js';

export const CODEX_DATA = {
  ...CODEX_BUILDINGS,
  ...CODEX_EXPANDED_BUILDINGS,
  ...CODEX_RESEARCH,
  ...CODEX_EXPANDED_RESEARCH,
  ...CODEX_SHIPS_DEFENSES_MOONS
};

export { CODEX_BUILDINGS, CODEX_EXPANDED_BUILDINGS, CODEX_RESEARCH, CODEX_EXPANDED_RESEARCH, CODEX_SHIPS_DEFENSES_MOONS };
