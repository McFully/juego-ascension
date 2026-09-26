import React, { useState } from 'react';
import { BuildingInteriorModal } from '../buildings/BuildingInteriorModal.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { calcRequiredPopulation } from '../../core.jsx';

export const MinistryBuildingsSection = ({
  ministryId,
  state,
  dispatch,
  currentPlanet,
  BUILDINGS,
  RESEARCH,
  ItemCard,
  buildingCost,
  calcBuildTime,
  meetsReq,
  buildingProdInfo,
  canAfford,
  GAME_SPEED,
  onOpenCodex,
  onBack
}) => {
  const [selectedBuildingForInterior, setSelectedBuildingForInterior] = useState(null);

  if (!BUILDINGS || !currentPlanet) return null;

  // Obtener edificios asignados a este ministerio
  const mapping = MINISTRY_MAPPING[ministryId];
  const assignedBuildingIds = mapping?.buildings || [];
  const ministryBuildings = Object.entries(BUILDINGS).filter(([id]) => assignedBuildingIds.includes(id));

  if (ministryBuildings.length === 0) {
    return (
      <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-md space-y-4">
        <div>
          <span className="text-3xl block mb-2">🏗️</span>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider">Sin Complejos de Obras</h4>
          <p className="text-xs text-slate-400 mt-1">
            Este departamento no cuenta con instalaciones de obras asignadas directamente.
          </p>
        </div>
        {onBack && (
          <div className="max-w-xs mx-auto">
            <ActionCardTile
              type="back"
              title="Atrio Ministerial"
              subtitle="Regresar a la Sede Central"
              icon="◀"
              badgeText="ATRIO"
              onClick={onBack}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="space-y-4 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3 items-stretch">
        {ministryBuildings.map(([id, b]) => {
          const totalPlanetBuildQueue = (state.buildQueue || []).filter(
            q => q.planetId === currentPlanet.id
          );
          const buildingBuildQueue = totalPlanetBuildQueue.filter(
            q => q.buildingId === id
          );
          const queuedCount = buildingBuildQueue.length;
          const lvl = currentPlanet.buildings?.[id] || 0;
          const targetLvl = lvl + queuedCount;
          const nextLvl = targetLvl + 1;

          const cost = buildingCost ? buildingCost(id, targetLvl, currentPlanet.buildings?.constructionCenter || 0) : {};
          const time = calcBuildTime ? calcBuildTime(
            cost,
            currentPlanet.buildings?.robotFactory || 0,
            currentPlanet.buildings?.naniteFactory || 0,
            GAME_SPEED,
            currentPlanet.buildings?.constructionCenter || 0
          ) : 0;

          const meets = meetsReq ? meetsReq(b.req, { ...currentPlanet.buildings, ...state.research }) : true;
          const requiredPopulation = calcRequiredPopulation(id, nextLvl);
          const currentPopulation = currentPlanet.population || 1000;
          const hasPop = currentPopulation >= requiredPopulation;
          const prodInfo = buildingProdInfo ? buildingProdInfo(
            id,
            lvl,
            state.research,
            currentPlanet.temperature,
            GAME_SPEED,
            currentPlanet
          ) : null;

          const extraLines = [];
          if (b.req && !meets && RESEARCH) {
            extraLines.push(
              `🔒 Requiere: ${Object.entries(b.req)
                .map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} ${v}`)
                .join(', ')}`
            );
          }
          if (!hasPop) {
            extraLines.push(`⚠️ Colonos insuficientes (requiere ${requiredPopulation}, colonia tiene ${currentPopulation})`);
          } else {
            extraLines.push(`👥 Población: ${currentPopulation}/${requiredPopulation}`);
          }
          if (queuedCount > 0) extraLines.push(`⏳ En cola: +${queuedCount} nivel(es)`);

          const activeBuildItem = buildingBuildQueue[0] || null;

          if (!ItemCard) return null;

          return (
            <ItemCard
              key={id}
              id={id}
              icon={b.icon}
              name={b.name}
              level={targetLvl}
              cost={cost}
              time={time}
              canAfford={canAfford ? canAfford(currentPlanet.resources, cost) : false}
              planetResources={currentPlanet?.resources}
              isQueueFull={totalPlanetBuildQueue.length >= 8}
              meetsRequirements={meets}
              lackOfPop={!hasPop}
              prodInfo={prodInfo}
              onAction={() => dispatch({ type: 'START_BUILDING', buildingId: id })}
              actionLabel={`Construir (Nv.${nextLvl})`}
              extra={extraLines.join(' | ') || null}
              onOpenCodex={onOpenCodex}
              category={b.cat}
              onOpenInterior={() => setSelectedBuildingForInterior(id)}
              activeQueueItem={activeBuildItem}
              queueItems={buildingBuildQueue}
              onCancelQueue={(queueId) => dispatch({ type: 'CANCEL_BUILD_QUEUE', queueId })}
              isAutoRestricted={Boolean(currentPlanet?.automatedExclusions?.[id])}
              onToggleAutoRestriction={() => dispatch({
                type: 'TOGGLE_AUTOMATION_RESTRICTION',
                planetId: currentPlanet?.id,
                targetId: id
              })}
            />
          );
        })}

        {/* Tarjeta de Retorno a la Sede al final del grid */}
        {onBack && (
          <ActionCardTile
            type="back"
            title={`Volver a ${mapping.name || 'Sede'}`}
            subtitle="Atrio principal del ministerio"
            icon="◀"
            badgeText="SEDE"
            onClick={onBack}
          />
        )}
      </div>

      {/* Modal Operativo Interactivo del Edificio */}
      {selectedBuildingForInterior && (
        <BuildingInteriorModal
          buildingId={selectedBuildingForInterior}
          buildingData={BUILDINGS[selectedBuildingForInterior]}
          level={currentPlanet.buildings?.[selectedBuildingForInterior] || 0}
          planet={currentPlanet}
          state={state}
          dispatch={dispatch}
          onClose={() => setSelectedBuildingForInterior(null)}
        />
      )}
    </section>
  );
};
