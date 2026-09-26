import { describe, it, expect } from 'vitest';
import { MINISTRY_PROGRAMS } from './ministriesData.js';

describe('ministriesData', () => {
  it('contains definitions for all standard ministries', () => {
    const expected = ['economy', 'defense', 'science', 'culture', 'infra', 'intel'];
    expected.forEach(min => {
      expect(MINISTRY_PROGRAMS[min]).toBeDefined();
      expect(Array.isArray(MINISTRY_PROGRAMS[min])).toBe(true);
      expect(MINISTRY_PROGRAMS[min].length).toBeGreaterThan(0);
    });
  });

  it('ensures each program has an id, name and baseCost', () => {
    Object.values(MINISTRY_PROGRAMS).flat().forEach(prog => {
      expect(prog.id).toBeDefined();
      expect(prog.name).toBeDefined();
      expect(prog.baseCost).toBeDefined();
    });
  });
});
