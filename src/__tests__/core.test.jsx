import { describe, it, expect } from 'vitest';
import { gameReducer, createInitial, MISSIONS } from '../core.jsx';

describe('gameReducer', () => {
  it('should initialize game state correctly', () => {
    const initialState = createInitial('Comandante');
    expect(initialState.gameStarted).toBe(true);
    expect(initialState.planets.length).toBeGreaterThan(0);
    expect(initialState.playerName).toBe('Comandante');
  });

  it('should return default state for unknown actions', () => {
    const state = createInitial('Comandante');
    const newState = gameReducer(state, { type: 'UNKNOWN' });
    expect(newState).toEqual(state);
  });

  it('should handle START_MISSION', () => {
    const state = createInitial('Comandante');
    const missionId = MISSIONS[0].id;
    const action = { type: 'START_MISSION', missionId };
    const newState = gameReducer(state, action);
    expect(newState.activeMissions).toContain(missionId);
  });

  it('should handle COMPLETE_MISSION', () => {
    let state = createInitial('Comandante');
    const mission = MISSIONS[0];
    state.activeMissions = [mission.id];
    
    // Simulate mission requirement met
    const action = { type: 'COMPLETE_MISSION', missionId: mission.id };
    const newState = gameReducer(state, action);
    
    expect(newState.activeMissions).not.toContain(mission.id);
    expect(newState.completedMissions).toContain(mission.id);
    // Check reward
    const planet = newState.planets.find(p => p.id === newState.currentPlanetId);
    expect(planet.resources.metal).toBeGreaterThan(800);
  });
});
