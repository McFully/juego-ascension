import { buildMinistriesState } from '../../../data/ministryState.js';
import { MINISTRY_MAPPING } from '../../../data/buildingOperationsData.js';
import { uid } from '../../../core.jsx';

/**
 * 1.6-2 — Rellena los ministerios que falten.
 *
 * Antes solo se reparaban 6 de los 17 a mano. `buildMinistriesState` completa
 * todos los de `MINISTRY_MAPPING` conservando lo que ya tuviera, así que una
 * partida vieja gana estado donde le faltaba sin perder lo que tenía.
 */
export const ensureMinistries = (state) => {
  const newState = { ...state };
  const before = newState.ministries || {};
  const after = buildMinistriesState(before);

  // Solo se devuelve un estado nuevo si de verdad ha cambiado algo: los ticks
  // dependents comparan por referencia.
  let changed = !newState.ministries;
  if (!changed) {
    for (const k of Object.keys(after)) {
      if (before[k] !== after[k]) { changed = true; break; }
    }
  }
  if (changed) newState.ministries = after;
  return newState;
};

export const processMinistriesTick = (state, newPlanets, prodCache) => {
  let newState = { ...state };
  const mins = newState.ministries || {};
  const taxRate = mins.economy?.taxRate || 0.1;

  // 1.6-7 — Automatización sin ministro = ministerio inerte, y no se decía nada.
  //
  // El jugador podía activar "autónomo" en un ministerio sin ministro nombrado
  // y ver que no pasaba nada, sin ninguna pista de por qué. Ahora se avisa una
  // sola vez por ministerio (no cada tick, que sería spam) y se deja constancia
  // para que la UI pueda marcarlo en rojo.
  const sinMinistro = [];
  for (const [minId, data] of Object.entries(mins)) {
    if (!data) continue;
    // El caso que avisa: autónomo ACTIVADO y sin ministro. Sin ministro el
    // ministerio no hace nada, y el jugador no tenía por qué saberlo.
    if (!data.automationEnabled) continue;
    if (data.minister) continue;
    if (newState.ministryNoopWarnings?.[minId]) continue; // ya avisado
    sinMinistro.push(minId);
  }
  if (sinMinistro.length > 0) {
    newState.ministryNoopWarnings = { ...(newState.ministryNoopWarnings || {}) };
    for (const minId of sinMinistro) newState.ministryNoopWarnings[minId] = true;

    const nombres = sinMinistro.map(id => MINISTRY_MAPPING[id]?.name || id);
    newState.notifications = [...(newState.notifications || []), {
      id: uid(),
      type: 'warning',
      message: `⚠️ Automatización activa sin ministro en: ${nombres.join(', ')}. Nomina un ministro o desactiva el autónomo, o no harán nada.`,
      timestamp: Date.now(),
    }];
  }
  // Si el jugador ya nombró ministro (o desactivó el autónomo), se olvida el
  // aviso para que pueda volver a activarse más adelante si vuelve a dejarlo solo.
  for (const [minId, data] of Object.entries(mins)) {
    if (!newState.ministryNoopWarnings?.[minId]) continue;
    if (data?.minister || !data?.automationEnabled) {
      newState.ministryNoopWarnings = { ...newState.ministryNoopWarnings };
      delete newState.ministryNoopWarnings[minId];
    }
  }
  
  // Economy: Tax collection based on metal production + civil businesses
  const totalMetalProd = newPlanets.reduce((acc, p) => {
    const pp = prodCache.get(p.id);
    return acc + ((pp ? pp.metal : 0) / 3600);
  }, 0);
  let businessTaxIncome = 0;
  newPlanets.forEach(p => {
    const b = p.civilBusinesses || { lowClass: 0, midClass: 0, highClass: 0 };
    businessTaxIncome += (b.lowClass || 0) * 5 + (b.midClass || 0) * 15 + (b.highClass || 0) * 50;
  });
  const taxIncome = totalMetalProd * taxRate * 2.0 + businessTaxIncome;
  newState.ministries = {
    ...newState.ministries,
    economy: {
      ...mins.economy,
      // Antes: `mins.economy.treasury`, que reventaba si el ministerio faltaba.
      // Una partida vieja podría llegar sin él.
      treasury: (mins.economy?.treasury || 0) + taxIncome,
      gdp: totalMetalProd * 3600,
    }
  };

  // Culture: Passive Reputation & Influence growth
  const unity = mins.culture?.socialUnity || 80;
  const propaganda = mins.culture?.propagandaLevel || 1;
  if (newState.gameTick % 60 === 0) {
    const hasAlliances = (newState.aiPlanets || []).some(ai => ai.alliance);
    const repGrowth = (unity > 70 ? 0.1 : 0) + (hasAlliances ? 0.2 : 0);
    newState.reputation = Math.min(100, (newState.reputation || 0) + repGrowth);
    
    // Influence growth
    const persuasion = (state.research?.persuasionSociology || 0) * 0.8;
    const stellarProp = (state.research?.stellarPropaganda || 0) * 0.6;
    const algoBurocracy = (state.research?.algorithmicBureaucracy || 0) * 0.5;
    const lawCode = (state.research?.galacticLawCode || 0) * 0.7;
    
    const govBonus = newPlanets.reduce((acc, pl) => {
      const b = pl.buildings || {};
      return acc + (b.sectorGovPalace || 0) * 0.2
                 + (b.financeMinistry || 0) * 0.15
                 + (b.permanentEmbassy || 0) * 0.25
                 + (b.councilChamber || 0) * 0.20
                 + (b.consulateHeadquarters || 0) * 0.18
                 + (b.colonySupremeCourt || 0) * 0.15;
    }, 0);
    
    const infGrowth = 1 + (propaganda * 0.5) + (unity > 90 ? 1 : 0) + persuasion + stellarProp + algoBurocracy + lawCode + govBonus;
    newState.influence = (newState.influence || 0) + infGrowth;
  }

  return newState;
};
