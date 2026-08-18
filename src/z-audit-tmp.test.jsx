import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { BUILDINGS, RESEARCH, SHIPS, DEFENSES, MISSILES, MOON_BUILDINGS } from './core.jsx';
import { CODEX_DATA } from './data/codex.js';
import { EXPANDED_BUILDINGS, EXPANDED_RESEARCH } from './data/expandedContent.js';

describe('AUDIT tmp', () => {
  it('dump', () => {
    const cats = { BUILDINGS, RESEARCH, SHIPS, DEFENSES, MISSILES, MOON_BUILDINGS };
    const codexKeys = Object.keys(CODEX_DATA);
    const report = {};

    for (const [cat, data] of Object.entries(cats)) {
      const ids = Object.keys(data);
      const withCodex = ids.filter(id => CODEX_DATA[id]);
      const missing = ids.filter(id => !CODEX_DATA[id]);
      report[cat] = {
        total: ids.length,
        withCodex: withCodex.length,
        missing: missing,
      };
    }

    const emptyCodex = [];
    const qualitativeCodex = [];
    for (const [id, e] of Object.entries(CODEX_DATA)) {
      const fields = ['lore', 'stats', 'usage'].filter(k => !e[k] || !String(e[k]).trim());
      if (fields.length) emptyCodex.push({ id, missing: fields });
      const stats = String(e.stats || '');
      const hasNumber = /\d/.test(stats);
      const hasPercent = /%/.test(stats);
      if (!hasNumber) qualitativeCodex.push({ id, stats });
      else if (!hasPercent) qualitativeCodex.push({ id, stats, note: 'sin %' });
    }

    const noPerLevel = [];
    for (const [id, r] of Object.entries(RESEARCH)) {
      if (!r.perLevel) noPerLevel.push(id);
    }
    report.noPerLevelResearch = noPerLevel;

    const buildingFieldsReview = {};
    for (const [id, b] of Object.entries(BUILDINGS)) {
      const hasMech = !!(b.prod || b.energyGen || b.deutCons || b.factor || b.energy || b.baseProd);
      if (!hasMech) buildingFieldsReview[id] = { fields: Object.keys(b) };
    }
    report.buildingsSinCamposMecanicos = buildingFieldsReview;

    report.emptyCodex = emptyCodex;
    report.qualitativeCodex = qualitativeCodex;
    report.codexHas = {
      totalCodex: codexKeys.length,
      buildingKeys: codexKeys.filter(k => BUILDINGS[k]).length,
      researchKeys: codexKeys.filter(k => RESEARCH[k]).length,
      shipKeys: codexKeys.filter(k => SHIPS[k]).length,
      defenseKeys: codexKeys.filter(k => DEFENSES[k]).length,
      moonKeys: codexKeys.filter(k => MOON_BUILDINGS[k]).length,
      missileKeys: codexKeys.filter(k => MISSILES[k]).length,
      orphanCodex: codexKeys.filter(k => !BUILDINGS[k] && !RESEARCH[k] && !SHIPS[k] && !DEFENSES[k] && !MISSILES[k] && !MOON_BUILDINGS[k]),
    };

    const out = JSON.stringify(report, null, 2);
    fs.writeFileSync('C:/Users/Aritz/AppData/Local/Temp/opencode/audit-report.json', out);
    fs.writeFileSync('C:/Users/Aritz/AppData/Local/Temp/opencode/buildings-ids.txt', Object.keys(BUILDINGS).join('\n'));
    fs.writeFileSync('C:/Users/Aritz/AppData/Local/Temp/opencode/research-ids.txt', Object.keys(RESEARCH).join('\n'));
    console.log('AUDIT DONE');
    expect(true).toBe(true);
  });
});