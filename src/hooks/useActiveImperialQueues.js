import { useMemo } from 'react';

export const useActiveImperialQueues = (state, BUILDINGS, RESEARCH, SHIPS, DEFENSES) => {
  const buildQueue = state?.buildQueue || [];
  const researchQueue = state?.researchQueue || [];
  const shipQueue = state?.shipQueue || [];
  const customShipQueue = state?.customShipQueue || [];
  const defenseQueue = state?.defenseQueue || [];
  const blueprints = state?.blueprints || [];

  return useMemo(() => {
    const items = [];
    const now = Date.now();

    buildQueue.forEach(q => {
      const remainingSec = Math.max(0, Math.round(((q.endTime || now) - now) / 1000));
      const totalSec = Math.max(1, Math.round(((q.endTime || now) - (q.startTime || now)) / 1000));
      const planetObj = state.planets?.find(p => p.id === q.planetId);
      items.push({
        queueId: q.id,
        planetId: q.planetId,
        planetName: planetObj?.name || 'Colonia',
        type: 'building',
        category: BUILDINGS?.[q.buildingId]?.cat || 'resource',
        icon: BUILDINGS?.[q.buildingId]?.icon || '🏗️',
        name: BUILDINGS?.[q.buildingId]?.name || q.buildingId,
        detail: `Nivel ${q.level}`,
        remaining: remainingSec,
        total: totalSec,
        id: q.buildingId,
        typeLabel: 'Edificio'
      });
    });

    researchQueue.forEach(q => {
      const remainingSec = Math.max(0, Math.round(((q.endTime || now) - now) / 1000));
      const totalSec = Math.max(1, Math.round(((q.endTime || now) - (q.startTime || now)) / 1000));
      const planetObj = state.planets?.find(p => p.id === q.planetId);
      items.push({
        queueId: q.id,
        planetId: q.planetId,
        planetName: planetObj?.name || 'Imperio',
        type: 'research',
        category: RESEARCH?.[q.researchId]?.cat || 'science',
        icon: RESEARCH?.[q.researchId]?.icon || '🔬',
        name: RESEARCH?.[q.researchId]?.name || q.researchId,
        detail: `Nivel ${q.level}`,
        remaining: remainingSec,
        total: totalSec,
        id: q.researchId,
        typeLabel: 'Investigación'
      });
    });

    shipQueue.forEach(q => {
      const remainingSec = Math.max(0, Math.round(((q.endTime || now) - now) / 1000));
      const totalSec = Math.max(1, Math.round(((q.endTime || now) - (q.startTime || now)) / 1000));
      const totalQty = q.quantity || 1;
      const delivered = q.unitsDelivered || 0;
      const pending = Math.max(0, totalQty - delivered);
      const planetObj = state.planets?.find(p => p.id === q.planetId);
      const customBp = blueprints.find(b => 'custom_' + b.id === q.shipId || b.id === q.shipId);
      const shipName = SHIPS?.[q.shipId]?.name || customBp?.name || q.shipId;
      const shipIcon = SHIPS?.[q.shipId]?.icon || customBp?.icon || '🚀';
      const detailText = delivered > 0 
        ? `${pending} pendientes (${delivered}/${totalQty} en base)` 
        : `x${totalQty} unidades`;

      items.push({
        queueId: q.id,
        planetId: q.planetId,
        planetName: planetObj?.name || 'Astillero',
        type: 'ship',
        category: 'military',
        icon: shipIcon,
        name: shipName,
        detail: detailText,
        remaining: remainingSec,
        total: totalSec,
        id: q.shipId,
        typeLabel: 'Flota'
      });
    });

    customShipQueue.forEach(q => {
      const remainingSec = Math.max(0, Math.round(((q.endTime || now) - now) / 1000));
      const totalSec = Math.max(1, Math.round(((q.endTime || now) - (q.startTime || now)) / 1000));
      const totalQty = q.quantity || 1;
      const delivered = q.unitsDelivered || 0;
      const pending = Math.max(0, totalQty - delivered);
      const planetObj = state.planets?.find(p => p.id === q.planetId);
      const customBp = blueprints.find(b => b.id === q.blueprintId);
      const detailText = delivered > 0 
        ? `${pending} pendientes (${delivered}/${totalQty} en base)` 
        : `x${totalQty} unidades`;

      items.push({
        queueId: q.id,
        planetId: q.planetId,
        planetName: planetObj?.name || 'Astillero Personalizado',
        type: 'ship',
        category: 'military',
        icon: customBp?.icon || '🛠️',
        name: customBp?.name || 'Nave Prototipo',
        detail: detailText,
        remaining: remainingSec,
        total: totalSec,
        id: q.blueprintId,
        typeLabel: 'Nave Personalizada'
      });
    });

    defenseQueue.forEach(q => {
      const remainingSec = Math.max(0, Math.round(((q.endTime || now) - now) / 1000));
      const totalSec = Math.max(1, Math.round(((q.endTime || now) - (q.startTime || now)) / 1000));
      const totalQty = q.quantity || 1;
      const delivered = q.unitsDelivered || 0;
      const pending = Math.max(0, totalQty - delivered);
      const planetObj = state.planets?.find(p => p.id === q.planetId);
      const detailText = delivered > 0 
        ? `${pending} pendientes (${delivered}/${totalQty} en base)` 
        : `x${totalQty} defensas`;

      items.push({
        queueId: q.id,
        planetId: q.planetId,
        planetName: planetObj?.name || 'Defensa',
        type: 'defense',
        category: 'defense',
        icon: DEFENSES?.[q.defenseId]?.icon || '🛡️',
        name: DEFENSES?.[q.defenseId]?.name || q.defenseId,
        detail: detailText,
        remaining: remainingSec,
        total: totalSec,
        id: q.defenseId,
        typeLabel: 'Defensa'
      });
    });

    return items;
  }, [buildQueue, researchQueue, shipQueue, customShipQueue, defenseQueue, blueprints, BUILDINGS, RESEARCH, SHIPS, DEFENSES, state?.planets]);
};
