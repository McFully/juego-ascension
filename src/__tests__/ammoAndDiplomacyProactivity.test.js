import { describe, it, expect } from 'vitest';
import { simulateCombat } from '../combat/combatEngine.js';
import { processDialogueTransmissionTick } from '../reducers/tick/events/dialogueTransmissionTick.js';
import { diplomacyReducer } from '../reducers/diplomacyReducer.js';
import { processFinancialBalanceTick } from '../reducers/tick/financialBalanceTick.js';

describe('Sistemas de Balística Real, Munición y Proactividad Diplomática', () => {
  it('deduce munición real del polvorín durante el combate y entra en silencio balístico si se agota', () => {
    const atkFleet = { lightFighter: 10 };
    const defFleet = {};
    const defDefenses = { rocketLauncher: 5 };
    const atkTech = { weapons: 0, shields: 0, armour: 0 };
    const defTech = { weapons: 0, shields: 0, armour: 0 };

    // Caso con munición suficiente
    const fullArsenal = { heavyMissiles: 50, kineticShells: 100, plasmaCells: 50 };
    const combatWithAmmo = simulateCombat(atkFleet, defFleet, defDefenses, atkTech, defTech, 3, [], 'human', 'human', false, 'standard', 0, [], fullArsenal);

    expect(combatWithAmmo.ammoSpent.heavyMissiles).toBeGreaterThan(0);
    expect(combatWithAmmo.remainingAmmo.heavyMissiles).toBeLessThan(50);

    // Caso con polvorín agotado (0 misiles)
    const emptyArsenal = { heavyMissiles: 0, kineticShells: 0, plasmaCells: 0 };
    const combatEmpty = simulateCombat(atkFleet, defFleet, defDefenses, atkTech, defTech, 3, [], 'human', 'human', false, 'standard', 0, [], emptyArsenal);

    expect(combatEmpty.ammoSpent.heavyMissiles).toBe(0);
    // El daño causado por defensas sin munición se reduce drásticamente (silencio balístico)
    const dmgFull = combatWithAmmo.rounds.reduce((acc, r) => acc + (r.defDmg || 0), 0);
    const dmgEmpty = combatEmpty.rounds.reduce((acc, r) => acc + (r.defDmg || 0), 0);
    expect(dmgEmpty).toBeLessThan(dmgFull);
  });

  it('permite a una IA diplomática solicitar proactivamente una embajada en la capital del jugador', () => {
    const mockState = {
      gameTick: 160,
      activeFirstContact: null,
      activeTransmission: null,
      activeEvent: null,
      planets: [{ id: 'p1', name: 'Terra', buildings: {}, resources: { metal: 100, crystal: 100, deuterium: 100 } }],
      aiPlanets: [{
        id: 'ai-diplo',
        name: 'Venerables de Vega',
        empireName: 'Consulado Vegano',
        faction: 'human',
        discovered: true,
        relation: 35,
        strategy: 'diplomat',
        aiPersonality: 'pacífico'
      }],
      foreignEmbassiesInCapital: []
    };

    // Forzar trigger de transmisión proactiva
    const nextState = processDialogueTransmissionTick(mockState);
    expect(nextState.activeTransmission).toBeTruthy();
    expect(nextState.activeTransmission.type).toBe('proactive_embassy_request');
    expect(nextState.activeTransmission.aiId).toBe('ai-diplo');
  });

  it('procesa la aceptación de embajada extranjera en la capital y remunera el alquiler horario', () => {
    const initialState = {
      planets: [{ id: 'p1', name: 'Terra' }],
      aiPlanets: [{ id: 'ai-diplo', name: 'Vega', relation: 30, activePacts: [] }],
      foreignEmbassiesInCapital: [],
      credits: 5000,
      reputation: 10,
      notifications: []
    };

    const action = {
      type: 'DIPLOMACY_ACCEPT_FOREIGN_EMBASSY',
      payload: {
        aiId: 'ai-diplo',
        rentHourly: 180,
        reputationBonus: 5,
        relationBonus: 15
      }
    };

    const stateAfterAccept = diplomacyReducer(initialState, action);
    expect(stateAfterAccept.foreignEmbassiesInCapital.length).toBe(1);
    expect(stateAfterAccept.foreignEmbassiesInCapital[0].rentHourly).toBe(180);
    expect(stateAfterAccept.aiPlanets[0].hasEmbassyInPlayerCapital).toBe(true);
    expect(stateAfterAccept.aiPlanets[0].relation).toBe(45);

    // Comprobar que financialBalanceTick contabiliza el canon de alquiler en los ingresos
    const stateAfterBalance = processFinancialBalanceTick(stateAfterAccept, Date.now());
    expect(stateAfterBalance.financialBalance.income.total).toBeGreaterThanOrEqual(180);
  });
});
