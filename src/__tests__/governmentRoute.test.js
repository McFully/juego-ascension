import { describe, expect, it } from 'vitest';
import {
  COMMAND_CARD_TARGETS,
  buildGovernmentTab,
  parseGovernmentRoute,
  resolveNavParent,
} from '../utils/governmentRoute.js';

describe('ruta de gobierno determinista', () => {
  it('Banca Galáctica y las investigaciones de Finanzas son destinos distintos e independientes', () => {
    expect(COMMAND_CARD_TARGETS.planetaryBank).toBe('galactic_bank');
    const research = parseGovernmentRoute(COMMAND_CARD_TARGETS.financeResearch);

    expect(COMMAND_CARD_TARGETS.planetaryBank).not.toBe(COMMAND_CARD_TARGETS.financeResearch);
    expect(COMMAND_CARD_TARGETS.planetaryBank).not.toBe('ministry_finance_buildings');
    expect(research).toMatchObject({ level: 3, ministryId: 'finance', subview: 'research' });
  });

  it('Ministerios de la Lonja abre el distrito de ese mundo, no el Alto Mando ni Finanzas', () => {
    const route = parseGovernmentRoute(COMMAND_CARD_TARGETS.exchangeMinistries);
    expect(route).toMatchObject({ level: 1, ministryId: null, subview: 'overview' });
    expect(route.tab).not.toBe('government');
    expect(route.tab).not.toBe(COMMAND_CARD_TARGETS.planetaryBank);
    expect(route.tab).not.toBe(COMMAND_CARD_TARGETS.financeResearch);
  });

  it('el mismo tab se parsea igual todas las veces', () => {
    const tab = 'ministry_finance_buildings';
    expect(parseGovernmentRoute(tab)).toEqual(parseGovernmentRoute(tab));
  });

  it('ida y vuelta de cada despacho conserva ministerio y subvista', () => {
    for (const subview of ['buildings', 'research', 'programs', 'directives']) {
      const tab = buildGovernmentTab({ level: 3, ministryId: 'finance', subview });
      expect(parseGovernmentRoute(tab)).toMatchObject({
        level: 3,
        ministryId: 'finance',
        subview,
        tab,
      });
    }
  });

  it('un ministerio sin sufijo es el atrio, no investigaciones', () => {
    expect(parseGovernmentRoute('ministry_finance')).toMatchObject({
      level: 2,
      ministryId: 'finance',
      subview: 'overview',
    });
  });

  it('el padre de Banca es el atrio de Finanzas y el de ese atrio es el Alto Mando', () => {
    expect(resolveNavParent('ministry_finance_buildings', {})).toBe('ministry_finance');
    expect(resolveNavParent('ministry_finance', {})).toBe('government');
    expect(resolveNavParent('ministry_finance_research', {})).toBe('ministry_finance');
    expect(resolveNavParent('government_ministries', {})).toBe('government');
  });

  it('ciencia y finanzas no comparten ministerio al llevar sufijo', () => {
    expect(parseGovernmentRoute('ministry_science_research').ministryId).toBe('science');
    expect(parseGovernmentRoute('ministry_finance_buildings').ministryId).toBe('finance');
  });
});
