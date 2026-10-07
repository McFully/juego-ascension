import { describe, it, expect } from 'vitest';
import {
  initGalacticLonjaState,
  calculateCapitalContribution,
  recordTreasuryLedger,
  assessLonjaHealth,
  LON_HEALTH_STATES,
  LONJA_HEALTH_STATES,
  SHARE_CLASSES,
  FOUNDER_PROTECTED_PERCENT
} from '../utils/galacticLonjaAutonomousCore.js';

describe('Galactic Lonja Autonomous Core & Rules 4-23', () => {
  it('inicializa la Lonja con 10% protegido para el fundador e irrevocable', () => {
    const lonja = initGalacticLonjaState('commander_1', 'Lonja Galáctica Alpha');
    expect(lonja.isAutonomousEntity).toBe(true);
    expect(lonja.founderId).toBe('commander_1');
    expect(lonja.capitalization.founderProtectedPercent).toBe(10);
    expect(lonja.capitalization.shareholders['commander_1'].protectedSharesPercent).toBe(10);
    expect(lonja.capitalization.shareholders['commander_1'].ordinaryShares).toBe(100);
    expect(lonja.healthState).toBe(LONJA_HEALTH_STATES.NORMAL);
  });

  it('calcula la dilución matemática sin tocar el 10% del fundador', () => {
    const lonja = initGalacticLonjaState('commander_1');
    const cap1 = lonja.capitalization;
    
    // Nueva aportación de capital de un inversor externo (25M sobre 25M base = 50% de nuevas acciones ordinarias)
    const cap2 = calculateCapitalContribution({
      currentCapitalization: cap1,
      contributorId: 'investor_syndicate',
      contributionValue: 25000000,
      valuationReference: 25000000
    });

    expect(cap2.shareholders['commander_1'].protectedSharesPercent).toBe(10); // 10% intocable
    expect(cap2.shareholders['investor_syndicate'].ordinaryShares).toBeGreaterThan(0);
    expect(cap2.totalOrdinaryShares).toBeGreaterThan(cap1.totalOrdinaryShares);
  });

  it('registra movimientos de tesorería de forma inmutable y trazable', () => {
    let lonja = initGalacticLonjaState('commander_1');
    let t = lonja.treasury;
    
    t = recordTreasuryLedger(t, {
      origin: 'trade_commission',
      destination: 'lonja_vault',
      concept: 'Cobro de arancel spot',
      amount: 45000
    });

    expect(t.ledger.length).toBe(1);
    expect(t.ledger[0].concept).toBe('Cobro de arancel spot');
    expect(t.ledger[0].amount).toBe(45000);
    expect(t.ledger[0].status).toBe('SETTLED');
  });

  it('evalúa la salud financiera y prevención de quiebra en 4 estados', () => {
    expect(assessLonjaHealth({ credits: 2000000, reserves: { strategic: 1000000 } })).toBe(LONJA_HEALTH_STATES.NORMAL);
    expect(assessLonjaHealth({ credits: 800000, reserves: { strategic: 200000 } })).toBe(LONJA_HEALTH_STATES.PRECAUTION);
    expect(assessLonjaHealth({ credits: 200000, reserves: { strategic: 100000 } })).toBe(LONJA_HEALTH_STATES.PROTECTION);
    expect(assessLonjaHealth({ credits: 10000, reserves: { strategic: 10000 } })).toBe(LONJA_HEALTH_STATES.CRITICAL);
  });
});
