import { describe, expect, it } from 'vitest';
import {
  BANK_RESOURCES,
  initGalacticBankState,
  calcBankCapacity,
  validateDeposit,
  validateWithdraw,
  processBankLiquidation
} from '../utils/galacticBankCore.js';
import { COMMAND_CARD_TARGETS } from '../utils/governmentRoute.js';
import { PLANETARY_COMMAND_CARDS } from '../components/government/hub/planetaryCommandCardsConfig.jsx';
import { IMPERIAL_COMMAND_CARDS } from '../components/government/hub/imperialCommandCardsConfig.jsx';
import { GAME_TABS } from '../components/app/gameNavigation.js';
import { economyReducer } from '../reducers/economyReducer.js';
import { migrateLoadState } from '../reducers/loadMigrator.js';

describe('Banca Galáctica — Core Funcional & Integración X-Wars', () => {
  // 1. Ruta y navegación independiente
  it('1. la tarjeta Banca Planetaria y Banca Galáctica tienen destinos propios y no abren Ministerios/Finanzas/Instalaciones', () => {
    expect(COMMAND_CARD_TARGETS.planetaryBank).toBe('planetary_bank');
    expect(COMMAND_CARD_TARGETS.galacticBank).toBe('galactic_bank');
    expect(COMMAND_CARD_TARGETS.planetaryBank).not.toContain('ministry');
    expect(COMMAND_CARD_TARGETS.planetaryBank).not.toContain('buildings');

    // Comprobar que está en las tarjetas de mando planetario e imperial
    expect(PLANETARY_COMMAND_CARDS).toContain('bank');
    expect(IMPERIAL_COMMAND_CARDS).toContain('bank');

    // Comprobar registro en GAME_TABS
    const bankTab = GAME_TABS.find(t => t.id === 'galactic_bank');
    expect(bankTab).toBeDefined();
    expect(bankTab.id).toBe('galactic_bank');

    const planetBankTab = GAME_TABS.find(t => t.id === 'planetary_bank');
    expect(planetBankTab).toBeDefined();
    expect(planetBankTab.id).toBe('planetary_bank');
  });

  // 2. Recursos soportados
  it('2. trabaja exclusivamente con los recursos reales del juego (metal, crystal, deuterium, credits)', () => {
    expect(BANK_RESOURCES).toEqual(['metal', 'crystal', 'deuterium', 'credits']);
  });

  // 3. Inicialización del estado
  it('3. inicializa el estado con saldos seguros, tasas e histórico sin undefined', () => {
    const bank = initGalacticBankState();
    expect(bank.balances).toMatchObject({ metal: 0, crystal: 0, deuterium: 0, credits: 0 });
    expect(bank.interestRates).toBeDefined();
    expect(bank.history).toEqual([]);
    expect(bank.nextLiquidation).toBeGreaterThan(Date.now());
  });

  // 4. Capacidad bancaria escalable de la Banca Galáctica Central (20.000 por nivel de exchangeBank)
  it('4. calcula capacidad bancaria de la Banca Galáctica Central (20.000 por nivel de exchangeBank)', () => {
    const emptyState = { planets: [] };
    const baseMetalCap = calcBankCapacity(emptyState, 'metal');
    expect(baseMetalCap).toBe(0);

    const builtState = {
      planets: [
        { buildings: { exchangeBank: 2 } }
      ]
    };
    // Nivel 2 * 20.000 = 40.000
    const upgradedCap = calcBankCapacity(builtState, 'metal');
    expect(upgradedCap).toBe(40000);
  });

  // 5. Validación de depósito válida
  it('5. valida depósito correcto dentro de fondos y capacidad', () => {
    const res = validateDeposit('metal', 500000, 1000000, 0, 10000000);
    expect(res.valid).toBe(true);
    expect(res.amount).toBe(500000);
  });

  // 6. Rechazo de depósito por fondos insuficientes
  it('6. rechaza depósito si la cantidad supera los fondos disponibles', () => {
    const res = validateDeposit('metal', 1500000, 1000000, 0, 10000000);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Fondos insuficientes');
  });

  // 7. Rechazo de depósito por exceder capacidad
  it('7. rechaza depósito si supera la capacidad bancaria restante', () => {
    const res = validateDeposit('metal', 6000000, 10000000, 6000000, 10000000);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Capacidad bancaria excedida');
  });

  // 8. Rechazo de entradas inválidas (negativos, decimales, NaN)
  it('8. rechaza valores negativos, NaN y cero', () => {
    expect(validateDeposit('metal', -500, 1000, 0, 10000).valid).toBe(false);
    expect(validateDeposit('metal', 0, 1000, 0, 10000).valid).toBe(false);
    expect(validateDeposit('metal', NaN, 1000, 0, 10000).valid).toBe(false);
    expect(validateWithdraw('metal', -100, 500).valid).toBe(false);
    expect(validateWithdraw('metal', NaN, 500).valid).toBe(false);
  });

  // 9. Ejecución de depósito en Reducer (planeta y créditos)
  it('9. ejecuta depósito restando del planeta y sumando a la banca atómicamente', () => {
    const initialState = {
      currentPlanetId: 'p1',
      credits: 5000,
      planets: [
        { id: 'p1', buildings: { exchangeBank: 5 }, resources: { metal: 200000, crystal: 50000, deuterium: 10000 } }
      ],
      galacticBank: initGalacticBankState()
    };

    const action = {
      type: 'BANK_DEPOSIT',
      payload: { resource: 'metal', amount: 50000, planetId: 'p1' }
    };

    const stateAfter = economyReducer(initialState, action);
    expect(stateAfter.planets[0].resources.metal).toBe(150000);
    expect(stateAfter.galacticBank.balances.metal).toBe(50000);
    expect(stateAfter.galacticBank.history.length).toBe(1);
    expect(stateAfter.galacticBank.history[0].type).toBe('DEPOSIT');
  });

  // 10. Ejecución de depósito de créditos estelares
  it('10. ejecuta depósito de créditos estelares del imperio', () => {
    const initialState = {
      credits: 10000,
      planets: [{ id: 'p1', buildings: { exchangeBank: 1 }, resources: { metal: 0 } }],
      galacticBank: initGalacticBankState()
    };

    const action = {
      type: 'BANK_DEPOSIT',
      payload: { resource: 'credits', amount: 4000 }
    };

    const stateAfter = economyReducer(initialState, action);
    expect(stateAfter.credits).toBe(6000);
    expect(stateAfter.galacticBank.balances.credits).toBe(4000);
  });

  // 11. Ejecución de retirada en Reducer
  it('11. ejecuta retirada sumando al planeta y restando de la banca atómicamente', () => {
    const initialBank = initGalacticBankState();
    initialBank.balances.metal = 50000;

    const initialState = {
      currentPlanetId: 'p1',
      planets: [
        { id: 'p1', resources: { metal: 100000, crystal: 0, deuterium: 0 } }
      ],
      galacticBank: initialBank
    };

    const action = {
      type: 'BANK_WITHDRAW',
      payload: { resource: 'metal', amount: 30000, planetId: 'p1' }
    };

    const stateAfter = economyReducer(initialState, action);
    expect(stateAfter.planets[0].resources.metal).toBe(130000);
    expect(stateAfter.galacticBank.balances.metal).toBe(20000);
    expect(stateAfter.galacticBank.history.length).toBe(1);
    expect(stateAfter.galacticBank.history[0].type).toBe('WITHDRAW');
  });

  // 12. Rechazo de retirada por encima del saldo bancario
  it('12. rechaza retirada superior al saldo bancario', () => {
    const res = validateWithdraw('crystal', 10000, 5000);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Saldo bancario insuficiente');
  });

  // 13. Cálculo de interés positivo (+1%)
  it('13. calcula interés positivo de liquidación diaria correctamente', () => {
    const bank = initGalacticBankState();
    bank.balances.metal = 1000000;
    bank.interestRates.metal = 0.01; // +1.00%
    const now = bank.nextLiquidation + 1000;

    const { bankState, liquidationsCount, totalYield } = processBankLiquidation(bank, now);
    expect(liquidationsCount).toBe(1);
    expect(bankState.balances.metal).toBe(1010000);
    expect(totalYield.metal).toBe(10000);
  });

  // 14. Cálculo de interés cero (0%)
  it('14. conserva el saldo intacto si la tasa es 0%', () => {
    const bank = initGalacticBankState();
    bank.balances.crystal = 500000;
    bank.interestRates.crystal = 0;
    const now = bank.nextLiquidation + 1000;

    const { bankState, liquidationsCount } = processBankLiquidation(bank, now);
    expect(liquidationsCount).toBe(1);
    expect(bankState.balances.crystal).toBe(500000);
  });

  // 15. Cálculo de interés negativo / coste de custodia (-1%)
  it('15. calcula coste de custodia / interés negativo sin rebasar cero', () => {
    const bank = initGalacticBankState();
    bank.balances.deuterium = 100000;
    bank.interestRates.deuterium = -0.01; // -1%
    const now = bank.nextLiquidation + 1000;

    const { bankState, liquidationsCount } = processBankLiquidation(bank, now);
    expect(liquidationsCount).toBe(1);
    expect(bankState.balances.deuterium).toBe(99000);
  });

  // 16. Liquidación acumulada (Catch-up) sin doble cobro
  it('16. procesa múltiples liquidaciones tras periodo offline sin duplicar ni perder timestamp', () => {
    const bank = initGalacticBankState();
    bank.balances.credits = 10000;
    bank.interestRates.credits = 0.02; // +2% por día
    const DAY = 86400000;
    const now = bank.nextLiquidation + (DAY * 2.5); // Han pasado 3 liquidaciones

    const { bankState, liquidationsCount } = processBankLiquidation(bank, now);
    expect(liquidationsCount).toBe(3);
    expect(bankState.nextLiquidation).toBeGreaterThan(now);
  });

  // 17. Independencia del planeta (Acceso 24/7 desde cualquier mundo)
  it('17. permite retirar a cualquier planeta seleccionado sin restricciones físicas de nave', () => {
    const bank = initGalacticBankState();
    bank.balances.metal = 50000;

    const state = {
      planets: [
        { id: 'planet_alpha', resources: { metal: 0 } },
        { id: 'planet_beta', resources: { metal: 0 } }
      ],
      galacticBank: bank
    };

    // Retirada hacia planet_beta
    const result = economyReducer(state, {
      type: 'BANK_WITHDRAW',
      payload: { resource: 'metal', amount: 20000, planetId: 'planet_beta' }
    });

    expect(result.planets.find(p => p.id === 'planet_beta').resources.metal).toBe(20000);
    expect(result.planets.find(p => p.id === 'planet_alpha').resources.metal).toBe(0);
    expect(result.galacticBank.balances.metal).toBe(30000);
  });

  // 18. Migración de saves v4 retrocompatible
  it('18. migra partidas existentes inicializando galacticBank sin crashear', () => {
    const legacySave = {
      version: 3,
      playerName: 'Comandante',
      gameStarted: true,
      credits: 2500,
      planets: [{ id: 'p1', resources: { metal: 100 } }]
    };

    const migrated = migrateLoadState(legacySave);
    expect(migrated.galacticBank).toBeDefined();
    expect(migrated.galacticBank.balances).toBeDefined();
    expect(migrated.galacticBank.balances.metal).toBe(0);
  });
});
