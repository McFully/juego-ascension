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
        const aiDiplomat = discoveredAIs.find(ai => (ai.relation || 0) >= 25 && !(newState.foreignEmbassiesInCapital || []).some(e => e.aiId === ai.id));
        const aiAllyNeedingAmmo = discoveredAIs.find(ai => (ai.relation || 0) >= 20);
        const playerArsenal = homePlanet.arsenal || { heavyMissiles: 100, kineticShells: 500, plasmaCells: 250 };

        if (aiDiplomat) {
          newState.activeTransmission = {
            id: uid(),
            type: 'proactive_embassy_request',
            aiId: aiDiplomat.id,
            faction: aiDiplomat.faction,
            name: aiDiplomat.name,
            message: `Saludos cordiales, ilustre Comandante. En vista de nuestros lazos fraternos y prosperidad mutua, el Alto Mando de ${aiDiplomat.empireName || aiDiplomat.name} solicita formalmente autorización para establecer una Embajada Permanente en vuestra capital. Pagaremos un canon de alquiler de +180 Cr/h a vuestro tesoro imperial y garantizaremos un flujo constante de inteligencia consular. ¿Aceptáis nuestra legación?`,
            options: [
              {
                text: '🏛️ Conceder Embajada en Capital (+180 Cr/h y +15 Opinión)',
                action: {
                  type: 'DIPLOMACY_ACCEPT_FOREIGN_EMBASSY',
                  payload: {
                    aiId: aiDiplomat.id,
                    rentHourly: 180,
                    reputationBonus: 5,
                    relationBonus: 15
                  }
                }
              },
              {
                text: '❌ Declinar por el momento.',
                action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
              }
            ]
          };
        } else if (aiAllyNeedingAmmo && (playerArsenal.heavyMissiles ?? 0) >= 50 && (playerArsenal.kineticShells ?? 0) >= 100 && Math.random() < 0.45) {
          newState.activeTransmission = {
            id: uid(),
            type: 'allied_ammo_request',
            aiId: aiAllyNeedingAmmo.id,
            faction: aiAllyNeedingAmmo.faction,
            name: aiAllyNeedingAmmo.name,
            message: `¡Comandante! Nuestras baterías orbitales en ${aiAllyNeedingAmmo.name} están al borde del Silencio Balístico tras repeler incursiones hostiles. Solicitamos un suministro urgente de 50 Cohetes Pesados y 100 Obuses Cinéticos de vuestro polvorín. Abonaremos 650 Créditos Imperiales al contado. ¿Nos enviáis la munición?`,
            options: [
              {
                text: '💣 Vender Suministro Balístico (-50 Cohetes, -100 Obuses -> +650 Cr y +15 Opinión)',
                action: {
                  type: 'DIPLOMACY_SELL_EMERGENCY_ORDNANCE',
                  payload: {
                    aiId: aiAllyNeedingAmmo.id,
                    heavyMissiles: 50,
                    kineticShells: 100,
                    creditsReward: 650,
                    relationBonus: 15
                  }
                }
              },
              {
                text: '❌ Denegar envío (Reservar polvorín propio).',
                action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
              }
            ]
          };
        } else if (aiHostile && pScore < 10 && Math.random() < 0.3) {
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
