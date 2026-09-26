import { uid, calcStorage } from '../../../core.jsx';

export const processNotificationsAndFirstContact = (newState) => {
  // Auto-expire notifications
  newState.notifications = (newState.notifications || []).map(n => {
    if (n.expiresAt && Date.now() > n.expiresAt) {
      return { ...n, expired: true, read: true };
    }
    return n;
  });

  // First contact trigger
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
      if (Math.random() < chance) {
        shouldTrigger = true;
      }
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

  // Proactive transmissions
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
              text: `✅ Vender excedente (Obtener +40 Influencia)`,
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
            message: `¡Humano! Tus débiles defensas planetarias y la ausencia de una flota en condiciones son una ofensa a nuestra soberanía. Exigimos un tributo de 10K Metal y 5K Cristal para garantizar tu seguridad en el sector. ¿Vas a pagar o prefieres conocer la ira de nuestras flotas?`,
            options: [
              {
                text: `💰 Pagar Tributo (-10K Metal, -5K Cristal)`,
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

  // Diplomatic event proposals from AI
  if (!newState.activeFirstContact && !newState.activeTransmission && !newState.activeEvent && newState.gameTick > 100 && newState.gameTick % 120 === 0 && Math.random() < 0.5) {
    const discoveredAIs = (newState.aiPlanets || []).filter(p => p.discovered && p.id !== 'crisis_invaders');
    const candidates = discoveredAIs.filter(ai => {
      const rel = ai.relation || 0;
      const hasPna = ai.pna || ai.activePacts?.includes('pna');
      const hasAlliance = ai.alliance || ai.activePacts?.includes('alliance');
      const hasTrade = ai.trade || ai.activePacts?.includes('trade');
      if (rel >= 30 && !hasPna && Math.random() < 0.15) return 'pna';
      if (rel >= 40 && !hasTrade && Math.random() < 0.15) return 'trade';
      if (rel >= 60 && !hasAlliance && Math.random() < 0.1) return 'alliance';
      if (rel < -20 && (ai.strategy === 'militarist' || ai.strategy === 'expansionist') && Math.random() < 0.12) return 'demand';
      return null;
    });

    if (candidates.length > 0) {
      const ai = candidates[Math.floor(Math.random() * candidates.length)];
      const rel = ai.relation || 0;
      const treatMap = { pna: 'Pacto de No Agresión', trade: 'Acuerdo Comercial', alliance: 'Alianza Militar' };

      if (rel >= 30) {
        const tt = rel >= 60 ? 'alliance' : (rel >= 40 ? 'trade' : 'pna');
        if (!ai[tt] && !ai.activePacts?.includes(tt)) {
          const treatyName = treatMap[tt];
          newState.activeTransmission = {
            id: uid(),
            type: 'diplo_proposal_' + tt,
            aiId: ai.id,
            faction: ai.faction,
            name: ai.name,
            message: `${ai.empireName} te extiende una oferta formal: deseamos firmar un ${treatyName} con tu imperio. ¿Aceptas esta propuesta para fortalecer nuestros lazos?`,
            options: [
              {
                text: `✅ Aceptar ${treatyName} (Relación +10)`,
                action: { type: 'DIPLOMACY_ACCEPT_PROPOSAL', payload: { aiId: ai.id, treatyType: tt } }
              },
              {
                text: '❌ Rechazar propuesta.',
                action: { type: 'DIPLOMACY_CLOSE_TRANSMISSION' }
              }
            ]
          };
        }
      } else if (rel < -20) {
        newState.activeTransmission = {
          id: uid(),
          type: 'diplo_demand',
          aiId: ai.id,
          faction: ai.faction,
          name: ai.name,
          message: `${ai.empireName} exige tu sumisión. Entréganos 15K Metal y 8K Cristal como tributo o nuestras flotas arrasarán tus colonias.`,
          options: [
            {
              text: '💰 Pagar tributo (15K M, 8K C, Rel +5)',
              action: { type: 'DIPLOMACY_PAY_TRIBUTO_THREAT', payload: { aiId: ai.id, cost: { metal: 15000, crystal: 8000 } } }
            },
            {
              text: '⚔️ Desafiar y preparar defensa.',
              action: { type: 'DIPLOMACY_REJECT_TRIBUTO_THREAT', payload: { aiId: ai.id } }
            }
          ]
        };
      }
    }
  }

  // AI betrayal: break pact if relation drops too low
  if (newState.gameTick > 200 && newState.gameTick % 150 === 0 && Math.random() < 0.08) {
    const aiWithPacts = (newState.aiPlanets || []).filter(p => p.discovered && (p.pna || p.alliance || p.trade) && (p.relation || 0) < -10);
    if (aiWithPacts.length > 0) {
      const ai = aiWithPacts[Math.floor(Math.random() * aiWithPacts.length)];
      const pactType = ai.alliance ? 'alliance' : (ai.trade ? 'trade' : 'pna');
      const pactNames = { alliance: 'Alianza Militar', trade: 'Acuerdo Comercial', pna: 'Pacto de No Agresión' };
      newState.activeTransmission = {
        id: uid(),
        type: 'diplo_betrayal',
        aiId: ai.id,
        faction: ai.faction,
        name: ai.name,
        message: `¡${ai.empireName} ha roto unilateralmente el ${pactNames[pactType]}! Denuncian que hemos violado los términos del acuerdo. Las relaciones se deterioran gravemente.`,
        options: [
          {
            text: '😤 Denunciar su traición (Rel -20)',
            action: { type: 'DIPLOMACY_BETRAYAL_RESPONSE', payload: { aiId: ai.id, pactType, response: 'denounce' } }
          },
          {
            text: '😐 Aceptar la ruptura con dignidad (Rel -10)',
            action: { type: 'DIPLOMACY_BETRAYAL_RESPONSE', payload: { aiId: ai.id, pactType, response: 'accept' } }
          }
        ]
      };
    }
  }

  return newState;
};
