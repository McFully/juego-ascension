import { uid, calcStorage } from '../../../core.jsx';

export const processDialogueTransmissionTick = (state) => {
  let newState = { ...state };
  const now = Date.now();

  // 1. First contact trigger loop
  const undiscoveredAIs = (newState.aiPlanets || []).filter(p => !p.discovered);
  if (!newState.activeFirstContact && !newState.activeEvent && !newState.activeTransmission && undiscoveredAIs.length > 0) {
    const hasDiploCenter = newState.planets.some(p => (p.buildings?.diploCenter || 0) >= 1);
    const hasResearchLab = newState.planets.some(p => (p.buildings?.researchLab || 0) >= 1);
    
    let shouldTrigger = false;
    if (newState.gameTick === 10) {
      shouldTrigger = true;
    } else if (newState.gameTick % 120 === 0) {
      let chance = 0.15;
      if (hasResearchLab) chance += 0.10;
      if (hasDiploCenter) chance += 0.25;
      if (Math.random() < chance) shouldTrigger = true;
    }
    
    if (shouldTrigger) {
      const targetAI = undiscoveredAIs[Math.floor(Math.random() * undiscoveredAIs.length)];
      newState.activeFirstContact = {
        id: targetAI.id,
        faction: targetAI.faction,
        empireName: targetAI.empireName,
        name: targetAI.name,
        aiType: targetAI.aiType,
      };
    }
  }

  // 2. Proactive transmission trigger loop
  if (!newState.activeFirstContact && !newState.activeTransmission && !newState.activeEvent && newState.gameTick > 30 && newState.gameTick % 80 === 0) {
    const discoveredAIs = (newState.aiPlanets || []).filter(p => p.discovered);
    if (discoveredAIs.length > 0) {
      const homePlanet = newState.planets[0];
      const storage = calcStorage(homePlanet.buildings);
      const resources = homePlanet.resources || { metal: 0, crystal: 0, deuterium: 0 };

      const metalFull = resources.metal > storage.metal * 0.95;
      const crystalFull = resources.crystal > storage.crystal * 0.95;
      
      if ((metalFull || crystalFull) && Math.random() < 0.4) {
        const aiMerchant = discoveredAIs.find(ai => ai.strategy === 'merchant' || ai.aiPersonality === 'mercantilista') || discoveredAIs[0];
        newState.activeTransmission = {
          id: uid(),
          type: 'excess_resources',
          aiId: aiMerchant.id,
          faction: aiMerchant.faction,
          name: aiMerchant.name,
          message: `Saludos, Comandante. Nuestros escáneres mercantiles detectan que tus depósitos de ${metalFull ? 'Metal' : 'Cristal'} en ${homePlanet.name} están a rebosar. Te proponemos comprar tu excedente: te damos 40 puntos de Influencia a cambio de ${metalFull ? '25K Metal' : '15K Cristal'}. ¿Trato hecho?`,
          options: [
            {
              text: '✅ Vender excedente (Obtener +40 Influencia)',
              action: {
                type: 'DIPLOMACY_TRADE_EXCESS',
                payload: {
                  aiId: aiMerchant.id,
                  resource: metalFull ? 'metal' : 'crystal',
                  qty: metalFull ? 25000 : 15000,
                  influenceReward: 40
                }
              }
            },
            {
              text: '❌ Rechazar propuesta comercial.',
              action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
            }
          ]
        };
      } else {
        const playerShips = homePlanet.fleet || {};
        const getScore = (f) => (f.lightFighter || 0) * 1 + (f.cruiser || 0) * 4 + (f.battleship || 0) * 15 + (f.destroyer || 0) * 40;
        const pScore = getScore(playerShips);
        
        const aiHostile = discoveredAIs.find(ai => (ai.strategy === 'militarist' || ai.strategy === 'expansionist' || ai.aiPersonality === 'bélico') && (ai.relation || 0) < 0);
        if (aiHostile && pScore < 10 && Math.random() < 0.3) {
          newState.activeTransmission = {
            id: uid(),
            type: 'militaristic_threat',
            aiId: aiHostile.id,
            faction: aiHostile.faction,
            name: aiHostile.name,
            message: '¡Humano! Tus débiles defensas planetarias y la ausencia de una flota en condiciones son una ofensa a nuestra soberanía. Exigimos un tributo de 10K Metal y 5K Cristal para garantizar tu seguridad en el sector. ¿Vas a pagar o prefieres conocer la ira de nuestras flotas?',
            options: [
              {
                text: '💰 Pagar Tributo (-10K Metal, -5K Cristal)',
                action: {
                  type: 'DIPLOMACY_PAY_TRIBUTO_THREAT',
                  payload: {
                    aiId: aiHostile.id,
                    cost: { metal: 10000, crystal: 5000 }
                  }
                }
              },
              {
                text: '⚔️ Desafiar su ultimátum y prepararse.',
                action: {
                  type: 'DIPLOMACY_REJECT_TRIBUTO_THREAT',
                  payload: {
                    aiId: aiHostile.id
                  }
                }
              }
            ]
          };
        }
      }
    }
  }

  return newState;
};
