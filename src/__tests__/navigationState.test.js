import { describe, expect, it } from 'vitest';
import { GAME_TABS } from '../components/app/gameNavigation.js';
import {
  PARENT_MAP,
  backTarget,
  createInitialNavState,
  navReducer,
  parentOf,
  scopeSubView,
} from '../utils/navigationState.js';

function go(state, viewId) {
  return navReducer(state, { type: 'NAVIGATE_TO', viewId });
}

describe('historial de navegación', () => {
  it('el catálogo y el mapa de padres son el mismo', () => {
    for (const tab of GAME_TABS) {
      if (!tab.parent) continue;
      expect(PARENT_MAP[tab.id]).toBe(tab.parent);
      expect(parentOf(tab.id)).toBe(tab.parent);
    }
    expect(parentOf('combat')).toBe('fleet');
    expect(parentOf('shipDesign')).toBe('shipyard');
    expect(parentOf('techTree')).toBe('ministry_science');
    expect(parentOf('missions')).toBe('overview');
    expect(parentOf('stats')).toBe('overview');
    expect(parentOf('colony_network')).toBe('overview');
    expect(parentOf('diplomacy')).toBeNull();
    expect(parentOf('imperial_council')).toBe('imperial_hub');
  });

  it('Atrás vuelve a la pantalla desde la que entraste', () => {
    let state = createInitialNavState('fleet');
    state = go(state, 'combat');
    expect(backTarget(state).viewId).toBe('fleet');
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('fleet');

    state = createInitialNavState('imperial_hub');
    state = go(state, 'combat');
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('imperial_hub');

    state = createInitialNavState('shipyard');
    state = go(state, 'shipDesign');
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('shipyard');

    state = createInitialNavState('ministry_science');
    state = go(state, 'techTree');
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('ministry_science');
  });

  it('sin historial, Atrás usa el padre del catálogo', () => {
    const combat = createInitialNavState('combat');
    expect(backTarget(combat).viewId).toBe('fleet');
    const tree = createInitialNavState('techTree');
    expect(backTarget(tree).viewId).toBe('ministry_science');
    const missions = createInitialNavState('missions');
    expect(backTarget(missions).viewId).toBe('overview');
  });

  it('Atrás cierra la sección antes de salir de la pantalla', () => {
    let state = createInitialNavState('market');
    state = navReducer(state, { type: 'SET_SUB_VIEW', subViewId: scopeSubView('market', 'used_ships') });
    state = navReducer(state, { type: 'SET_SUB_VIEW', subViewId: scopeSubView('market', 'contracts') });
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('market');
    expect(state.subView).toBe('market:used_ships');
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('market');
    expect(state.subView).toBeNull();
  });

  it('cambiar de pantalla guarda la sección y Atrás la recupera', () => {
    let state = createInitialNavState('overview');
    state = navReducer(state, { type: 'SET_SUB_VIEW', subViewId: scopeSubView('empire', 'planets') });
    state = go(state, 'government');
    expect(state.subView).toBeNull();
    state = navReducer(state, { type: 'NAVIGATE_BACK' });
    expect(state.activeView).toBe('overview');
    expect(state.subView).toBe('empire:planets');
  });
});
