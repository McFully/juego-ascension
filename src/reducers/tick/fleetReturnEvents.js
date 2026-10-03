import { uid } from '../../core.jsx';
import { eventReducer } from '../eventReducer.js';

export function createFleetReturnEvent(m, newState) {
  const isTransport = m.type === 'transport';
  const isRecycle = m.type === 'recycle';
  const isEspionage = m.type === 'espionage';
  const isAttack = m.type === 'attack' || m.type === 'planet_destruction';

  let returnEvent = null;
  const originPlanetName = m.from?.name || 'Base Imperial';

  if (isTransport) {
    returnEvent = {
      id: uid(),
      type: 'transport_return',
      title: 'Retorno Logístico Completado',
      subtitle: `Atraque en ${originPlanetName}`,
      description: `Los convoyes de transporte han concluido su ruta comercial y han atracado de regreso en los muelles de atraque de ${originPlanetName}. Las tripulaciones están listas para nueva orden de flete.`,
      image: 'Carguera Pequeña.webp',
      targetPlanetId: m.from.id,
      returnedFleet: m.fleet,
      ministryId: 'transport',
      ministryName: 'Ministerio de Transporte y Tránsito',
      voiceText: `Convoy logístico de vuelta en ${originPlanetName}. Atraque confirmado.`
    };
  } else if (isRecycle) {
    returnEvent = {
      id: uid(),
      type: 'recycle_return',
      title: 'Flota de Reciclaje en Base',
      subtitle: `Atraque en ${originPlanetName}`,
      description: `Las naves recicladoras han tocado tierra en ${originPlanetName}. Los materiales rescatados han sido descargados en los almacenes centrales y la maquinaria pesada entra en ciclo de mantenimiento.`,
      image: 'Reciclador.webp',
      targetPlanetId: m.from.id,
      returnedFleet: m.fleet,
      ministryId: 'resources',
      ministryName: 'Ministerio de Recursos y Minería',
      voiceText: `Recicladores atracados en ${originPlanetName}. Materiales procesados.`
    };
  } else if (isEspionage) {
    returnEvent = {
      id: uid(),
      type: 'espionage_return',
      title: 'Sonda de Reconocimiento Recuperada',
      subtitle: `Atraque en ${originPlanetName}`,
      description: `La sonda de espionaje ha completado su vector de telemetría y aterriza de vuelta en las instalaciones de inteligencia de ${originPlanetName}.`,
      image: 'Sonda Espionaje.webp',
      targetPlanetId: m.from.id,
      returnedFleet: m.fleet,
      ministryId: 'defense',
      ministryName: 'Ministerio de Defensa e Inteligencia',
      voiceText: `Sonda de espionaje recuperada en ${originPlanetName}. Datos encriptados descargados.`
    };
  } else if (isAttack) {
    returnEvent = {
      id: uid(),
      type: 'combat_return',
      title: 'Flota de Combate Atracada',
      subtitle: `Atraque en ${originPlanetName}`,
      description: `Los escuadrones de ataque han finalizado el repliegue táctico y vuelven a estar operativos en los silos y hangares de ${originPlanetName}.`,
      image: 'Nave de Batalla.webp',
      targetPlanetId: m.from.id,
      returnedFleet: m.fleet,
      ministryId: 'defense',
      ministryName: 'Ministerio de Defensa y Operaciones Navales',
      voiceText: `Flota de combate de vuelta en ${originPlanetName}. Reabastecimiento en curso.`
    };
  }

  if (returnEvent) {
    if (returnEvent.ministryId) {
      const currentPl = newState.planets?.find(p => p.id === returnEvent.targetPlanetId) || newState.planets?.[0];
      const assignedMinister = currentPl?.ministries?.[returnEvent.ministryId]?.minister || newState.ministries?.[returnEvent.ministryId]?.minister || null;
      if (assignedMinister) {
        returnEvent.minister = assignedMinister;
      }
    }
  }

  return returnEvent;
}

export function appendFleetReturnTacticalEvent(state, returnEvent) {
  let newState = { ...state, tacticalEvents: [...(state.tacticalEvents || []), returnEvent] };
  return eventReducer(newState, {
    type: 'APPEND_TACTICAL_EVENT_LOG',
    payload: { ...returnEvent, kind: 'tactical', read: false },
  });
}
