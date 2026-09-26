import { ACHIEVEMENTS } from '../data/gameConstants.js';
import { MISSIONS } from '../data/missionsData.js';

export const checkAchievements = (state) => {
  let ns = { ...state, achievements: [...(state.achievements || [])] };
  for (const a of ACHIEVEMENTS) {
    if (!(ns.achievements || []).includes(a.id) && a.check(ns.stats || {})) {
      ns.achievements.push(a.id);
      ns.notifications = [...(ns.notifications || []), { id: Math.random().toString(36).slice(2, 11), type: 'success', message: `🏆 Logro: ${a.icon} ${a.name}`, timestamp: Date.now() }];
    }
  }
  return ns;
};

export const checkMissions = (state) => {
  let ns = { ...state, completedMissions: [...(state.completedMissions || [])] };
  const currentPlanet = ns.planets.find(p => p.id === ns.currentPlanetId) || ns.planets[0];
  if (!currentPlanet) return ns;

  for (const m of MISSIONS) {
    if (!ns.completedMissions.includes(m.id)) {
      const isUnlocked = !m.req || ns.completedMissions.includes(m.req);
      if (isUnlocked && m.check(ns, currentPlanet)) {
        ns.completedMissions.push(m.id);
        
        ns.planets = ns.planets.map(p => {
          if (p.id === currentPlanet.id) {
            return {
              ...p,
              resources: {
                metal: p.resources.metal + (m.reward.metal || 0),
                crystal: p.resources.crystal + (m.reward.crystal || 0),
                deuterium: p.resources.deuterium + (m.reward.deuterium || 0)
              }
            };
          }
          return p;
        });

        ns.notifications = [...(ns.notifications || []), {
          id: Math.random().toString(36).slice(2, 11),
          type: 'success',
          message: `🎯 ¡Misión Cumplida! ${m.icon} ${m.name}. Recompensa: ${m.rewardDesc}`,
          timestamp: Date.now(),
          isMission: true
        }];
      }
    }
  }
  return ns;
};
