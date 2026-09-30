import { updatePlanet, uid } from '../core.jsx';
import { SHIPS, RESEARCH } from '../data/gameData.js';
import { getPOIAtCoordinates, fmt } from '../utils/formulas.js';

export const handleExpeditionMission = (mission, state) => {
  const fleet = mission.fleet;
  const isCommercial = mission.from.specialization === 'commercial';
  const cargoMultiplier = isCommercial ? 1.5 : 1.0;
  const cargoCap = Object.entries(fleet).reduce((acc, [id, qty]) => acc + (SHIPS[id]?.cargo || 0) * qty * cargoMultiplier, 0);

  const destPoi = getPOIAtCoordinates(mission.to.galaxy, mission.to.system, mission.to.position);
  const isPrecursorRuins = destPoi && destPoi.type === 'precursor_ruins';

  let roll = Math.random();
  if (isPrecursorRuins && roll > 0.33) {
    roll = roll * 0.5;
  }

  const events = [];

  if (roll < 0.08) {
    const fightWon = Math.random() < 0.65;
    if (fightWon) {
      const loot = { metal: Math.floor((5000 + Math.random() * 15000) * 50), crystal: Math.floor((3000 + Math.random() * 8000) * 50), deuterium: Math.floor((1000 + Math.random() * 5000) * 50) };
      let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + loot.metal, crystal: p.resources.crystal + loot.crystal, deuterium: p.resources.deuterium + loot.deuterium } }));
      events.push(`⚔️ ¡Emboscada Pirata Repelida! Tras un combate intenso en los anillos de un gigante gaseoso, capturaste sus cargueras: +${fmt(loot.metal)}M, +${fmt(loot.crystal)}C, +${fmt(loot.deuterium)}D`);
      return { 
        state: newState, 
        type: 'success', 
        message: events.join(' • '), 
        returnFleet: fleet,
        tacticalEvent: {
          id: uid(),
          type: 'expedition',
          title: 'Emboscada Pirata Repelida',
          subtitle: `Coordenadas [${mission.to.galaxy}:${mission.to.system}:${mission.to.position}]`,
          description: `La expedición sufrió una emboscada en el cinturón de asteroides, pero las defensas coordinadas lograron aniquilar a los atacantes y capturar cargueros repletos de botín.`,
          resources: loot,
          targetPlanetId: mission.from.id,
          image: 'heavyFighter',
          ministryId: 'defense',
          ministryName: 'Ministerio de Defensa y Flota Imperial',
          voiceText: `Emboscada pirata repelida con éxito en la expedición. Recursos capturados y asegurados.`
        }
      };
    } else {
      const lossRatio = 0.1 + Math.random() * 0.2;
      let survivors = {}; let totalLost = 0;
      for (const [id, qty] of Object.entries(fleet)) {
        const lost = Math.max(0, Math.floor(qty * lossRatio * Math.random()));
        if (lost > 0) totalLost += lost;
        if (qty - lost > 0) survivors[id] = qty - lost;
      }
      events.push(`💀 ¡Emboscada Pirata Desastrosa! Una flota de corsarios emboscó a tus naves desde el cinturón de asteroides. Perdiste ${totalLost} naves en la retirada.`);
      return { state, type: 'error', message: events.join(' • '), returnFleet: survivors || fleet };
    }
  }

  if (roll < 0.15) {
    const techNames = Object.keys(RESEARCH);
    const foundTech = techNames[Math.floor(Math.random() * techNames.length)];
    const tech = RESEARCH[foundTech];
    if (tech) {
      const currentLvl = state.research[foundTech] || 0;
      let newState = { ...state, research: { ...state.research, [foundTech]: currentLvl + 1 } };
      events.push(`🛸 ¡Archivo Histórico Alienígena! Tu sonda localizó una baliza de datos de una civilización extinta. Logramos descifrar planos científicos: ${tech.icon} ${tech.name} sube al nivel ${currentLvl + 1}`);
      return { 
        state: newState, 
        type: 'success', 
        message: events.join(' • '), 
        returnFleet: fleet, 
        foundArtifact: true,
        tacticalEvent: {
          id: uid(),
          type: 'expedition',
          title: '¡Archivo Alienígena Descifrado!',
          subtitle: `Investigación Avanzada: ${tech.name}`,
          description: `La expedición ha localizado un banco de memoria milenario a la deriva. Los científicos han extraído planos de diseño revolucionarios que incrementan inmediatamente el nivel de ${tech.name} a nivel ${currentLvl + 1}.`,
          targetPlanetId: mission.from.id,
          image: 'advResearchCenter',
          ministryId: 'science',
          ministryName: 'Ministerio de Ciencia e Innovación Cuántica',
          voiceText: `Archivo alienígena descifrado. Avance científico aplicado al imperio.`
        }
      };
    }
  }

  if (roll < 0.23) {
    const rareShips = ['battleship', 'destroyer', 'bomber', 'cruiser'];
    const foundId = rareShips[Math.floor(Math.random() * rareShips.length)];
    const qty = 1 + Math.floor(Math.random() * 3);
    const retFleet = { ...fleet };
    retFleet[foundId] = (retFleet[foundId] || 0) + qty;
    events.push(`🚀 ¡Astillero Derrelicto! Encontraste un antiguo hangar militar a la deriva y lograste reactivar los reactores de soporte: ${qty}x ${SHIPS[foundId].name} se unen a tu flota.`);
    return { 
      state, 
      type: 'success', 
      message: events.join(' • '), 
      returnFleet: retFleet,
      tacticalEvent: {
        id: uid(),
        type: 'expedition',
        title: '¡Astillero Derrelicto Descubierto!',
        subtitle: `Refuerzos de Flota Recuperados`,
        description: `Los ingenieros de la expedición lograron penetrar un complejo automatizado intacto y poner en marcha los sistemas de soporte vital. Se han incorporado ${qty}x ${SHIPS[foundId]?.name || 'naves de guerra'} a la dotación imperial.`,
        targetPlanetId: mission.from.id,
        image: foundId,
        ministryId: 'defense',
        ministryName: 'Ministerio de Defensa y Operaciones Navales',
        voiceText: `Astillero derrelicto descubierto. Naves operativas incorporadas a la flota.`
      }
    };
  }

  if (roll < 0.33) {
    const multiplier = Math.max(1, cargoCap / 6000) * 50;
    const bonus = { metal: Math.floor((4000 + Math.random() * 16000) * multiplier), crystal: Math.floor((3000 + Math.random() * 10000) * multiplier), deuterium: Math.floor((1500 + Math.random() * 6000) * multiplier) };
    let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + bonus.metal, crystal: p.resources.crystal + bonus.crystal, deuterium: p.resources.deuterium + bonus.deuterium } }));
    events.push(`☄️ ¡Cinturón de Asteroides Minerales! Tus naves de carga realizaron una operación de minería a gran escala: +${fmt(bonus.metal)} Metal, +${fmt(bonus.crystal)} Cristal, +${fmt(bonus.deuterium)} Deuterio`);
    return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
  }

  if (roll < 0.40) {
    const warpBonus = Math.random() < 0.6;
    if (warpBonus) {
      const shipIds = Object.keys(SHIPS).filter(id => id !== 'deathstar' && SHIPS[id].cat === 'military');
      const foundId = shipIds[Math.floor(Math.random() * shipIds.length)];
      const qty = 2 + Math.floor(Math.random() * 4);
      const retFleet = { ...fleet };
      retFleet[foundId] = (retFleet[foundId] || 0) + qty;
      events.push(`🌀 ¡Brecha Dimensional! El hiperespacio se plegó sobre sí mismo de forma anómala, materializando naves extraviadas de otras épocas: +${qty}x ${SHIPS[foundId].name}`);
      return { state, type: 'success', message: events.join(' • '), returnFleet: retFleet };
    } else {
      const lossRatio = 0.15;
      let survivors = {}; let totalLost = 0;
      for (const [id, qty] of Object.entries(fleet)) {
        const lost = Math.max(0, Math.floor(qty * lossRatio * Math.random()));
        if (lost > 0) totalLost += lost;
        if (qty - lost > 0) survivors[id] = qty - lost;
      }
      events.push(`🌀 ¡Falla del Hiper-Motor! La fuerza gravitatoria de una singularidad desgarro la estructura molecular de algunas de tus naves: ${totalLost} naves perdidas en el vacío.`);
      return { state, type: 'error', message: events.join(' • '), returnFleet: survivors || fleet };
    }
  }

  if (roll < 0.48) {
    const refund = { metal: Math.floor((10000 + Math.random() * 25000) * 50), crystal: Math.floor((8000 + Math.random() * 15000) * 50) };
    let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { metal: p.resources.metal + refund.metal, crystal: p.resources.crystal + refund.crystal, deuterium: p.resources.deuterium } }));
    events.push(`🏛️ ¡Contenedores Mercantes! Hallaron contenedores de carga criogénica sellados que contenían valiosas aleaciones comerciales: +${fmt(refund.metal)} Metal, +${fmt(refund.crystal)} Cristal`);
    return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
  }

  if (roll < 0.55) {
    const deutBonus = Math.floor((8000 + Math.random() * 24000) * 50);
    let newState = updatePlanet(state, mission.from.id, p => ({ ...p, resources: { ...p.resources, deuterium: p.resources.deuterium + deutBonus } }));
    events.push(`✨ ¡Nebulosa Radiante! Los sintetizadores cargaron al máximo los depósitos absorbiendo plasma de deuterio de alta pureza de la nube espacial: +${fmt(deutBonus)} Deuterio`);
    return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
  }

  if (roll < 0.61) {
    let newState = { ...state };
    let temporalAnomalyHappened = false;
    if (newState.buildQueue && newState.buildQueue.length > 0) {
      newState.buildQueue = newState.buildQueue.map(item => {
        if (item.planetId === mission.from.id) {
          temporalAnomalyHappened = true;
          return { ...item, endTime: item.endTime - 120000 };
        }
        return item;
      });
    }
    if (newState.researchQueue && newState.researchQueue.length > 0) {
      newState.researchQueue = newState.researchQueue.map(item => {
        if (item.planetId === mission.from.id) {
          temporalAnomalyHappened = true;
          return {
            ...item,
            startTime: (item.startTime || Date.now()) - 120000,
            endTime: item.endTime - 120000
          };
        }
        return item;
      });
    }
    if (temporalAnomalyHappened) {
      events.push(`⏳ ¡Anomalía Espacio-Temporal! La flota atravesó un campo crono-activo que aceleró el flujo del tiempo local. Los proyectos de construcción e investigación activos avanzaron 2 minutos.`);
    } else {
      events.push(`⏳ ¡Anomalía Espacio-Temporal! El hiperespacio sufrió una leve fluctuación temporal, pero no se reportaron efectos en el sector al estar las colas de desarrollo inactivas.`);
    }
    return { state: newState, type: 'success', message: events.join(' • '), returnFleet: fleet };
  }

  if (roll < 0.67) {
    const damagedFleet = {};
    let lostCount = 0;
    for (const [id, qty] of Object.entries(fleet)) {
      const isMilitary = SHIPS[id]?.cat === 'military';
      if (isMilitary) {
        const lost = Math.floor(qty * 0.1);
        lostCount += lost;
        if (qty - lost > 0) {
          damagedFleet[id] = qty - lost;
        }
      } else {
        damagedFleet[id] = qty;
      }
    }
    if (lostCount > 0) {
      events.push(`☢️ ¡Tormenta de Radiación Cósmica! Una oleada de partículas ionizantes atravesó el sector dañando las naves de combate expuestas. Perdiste un 10% de la armada de asalto (Total: -${lostCount} naves).`);
      return { state, type: 'error', message: events.join(' • '), returnFleet: damagedFleet };
    } else {
      events.push(`☢️ ¡Tormenta de Radiación Cósmica! Los escudos deflectores absorbieron la radiación sin sufrir bajas estructurales.`);
      return { state, type: 'warning', message: events.join(' • '), returnFleet: fleet };
    }
  }

  if (roll < 0.73) {
    let foundPoi = null;
    let foundCoords = null;
    const startSys = mission.from.system || 1;
    const startGal = mission.from.galaxy || 1;
    
    outerLoop:
    for (let g = startGal; g <= Math.min(5, startGal + 1); g++) {
      for (let s = Math.max(1, startSys - 5); s <= Math.min(100, startSys + 5); s++) {
        for (let p = 1; p <= 15; p++) {
          const poi = getPOIAtCoordinates(g, s, p);
          if (poi) {
            const isOccupiedByPlayer = state.planets.some(pl => pl.galaxy === g && pl.system === s && pl.position === p);
            const isOccupiedByAI = state.aiPlanets.some(pl => pl.galaxy === g && pl.system === s && pl.position === p && !pl.isVirgin);
            if (!isOccupiedByPlayer && !isOccupiedByAI) {
              foundPoi = poi;
              foundCoords = { galaxy: g, system: s, position: p };
              break outerLoop;
            }
          }
        }
      }
    }

    if (foundPoi) {
      events.push(`📡 ¡Baliza Precursora descifrada! Los escáneres interceptaron coordenadas estables que confirman un ${foundPoi.name} en [${foundCoords.galaxy}:${foundCoords.system}:${foundCoords.position}].`);
    } else {
      events.push(`📡 ¡Baliza Estelar Detectada! Hallamos un transpondedor orbital antiguo, pero sus datos geográficos estaban demasiado corruptos para leerlos.`);
    }
    return { state, type: 'success', message: events.join(' • '), returnFleet: fleet };
  }

  const rollEmpty = Math.random();
  if (rollEmpty < 0.25) {
    return { state, type: 'info', message: '🔭 Sector Inerte. Los sensores no detectaron señales de vida ni yacimientos en 2 pársecs.', returnFleet: fleet };
  } else if (rollEmpty < 0.5) {
    return { state, type: 'warning', message: '🔭 Radiación Cósmica. Las naves reportaron lecturas inestables pero no se produjo ningún incidente.', returnFleet: fleet };
  } else if (rollEmpty < 0.7) {
    return { state, type: 'info', message: '🔭 Nubes de Polvo Interestelar. La visibilidad es nula, el comandante ordenó regresar para evitar colisiones.', returnFleet: fleet };
  } else if (rollEmpty < 0.88) {
    return { state, type: 'success', message: '🔭 Pequeños Yacimientos. Lograron extraer recursos flotantes sueltos: +1K Metal, +600 Cristal', returnFleet: fleet };
  } else {
    const smallShips = ['espionageProbe', 'smallCargo', 'lightFighter'];
    const foundId = smallShips[Math.floor(Math.random() * smallShips.length)];
    const qty = 1 + Math.floor(Math.random() * 3);
    const retFleet = { ...fleet };
    retFleet[foundId] = (retFleet[foundId] || 0) + qty;
    return { state, type: 'success', message: `🔭 Flota de Reconocimiento. Encontraron sondas perdidas operativas que se reincorporaron: +${qty}x ${SHIPS[foundId].name}`, returnFleet: retFleet };
  }
};
