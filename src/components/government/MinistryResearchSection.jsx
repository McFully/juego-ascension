import React from 'react';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { calcPlanetResearchTime, getPlanetEffectiveLab, getMaxResearchQueueSlots } from '../../core.jsx';

/**
 * MinistryResearchSection — Panel de Tecnologías asignadas a un Ministerio de Nicho.
 * Muestra las investigaciones que corresponden a la cartera y permite investigarlas directamente.
 */
export const MinistryResearchSection = ({
  ministryId,
  state,
  dispatch,
  currentPlanet,
  RESEARCH,
  BUILDINGS,
  ItemCard,
  researchCost,
  calcResearchTime,
  meetsReq,
  researchEffectInfo,
  canAfford,
  GAME_SPEED,
  onOpenCodex,
  onBack
}) => {
  if (!RESEARCH || !currentPlanet) return null;

  const mapping = MINISTRY_MAPPING[ministryId] || {};
  const assignedResearchIds = mapping.research || [];
  const ministryTechs = Object.entries(RESEARCH).filter(([id]) => assignedResearchIds.includes(id));

  // Verificar si hay laboratorio construido o red compartida activa
  const effectiveLab = getPlanetEffectiveLab(state, currentPlanet);
  const isLabMissing = effectiveLab < 1;

  if (isLabMissing) {
    return (
      <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-8 text-center backdrop-blur-md space-y-4 max-w-xl mx-auto">
        <span className="text-4xl block">🔬</span>
        <h4 className="text-white font-bold text-base uppercase tracking-wider">Laboratorio Científico Requerido</h4>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Para que el <strong className="text-cyan-400">{mapping.name || 'Ministerio'}</strong> pueda desarrollar proyectos tecnológicos, la colonia debe contar previamente con un <strong className="text-emerald-400">Laboratorio de Investigación</strong> construido desde el <strong className="text-emerald-400">Ministerio de Infraestructuras</strong>.
        </p>
        <div className="pt-2 flex justify-center">
          <ActionCardTile
            type="back"
            title="Atrio Ministerial"
            subtitle="Regresar a la Sede Central"
            icon="◀"
            badgeText="ATRIO"
            onClick={onBack}
          />
        </div>
      </div>
    );
  }

  if (ministryTechs.length === 0) {
    return (
      <div className="bg-black/50 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-md space-y-4">
        <span className="text-3xl block">🔬</span>
        <h4 className="text-white font-bold text-sm uppercase tracking-wider">Sin Proyectos Tecnológicos</h4>
        <p className="text-xs text-slate-400">
          Este ministerio no cuenta con líneas de investigación directa en este ciclo.
        </p>
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

  const researchQueue = state.researchQueue || [];

  return (
    <section className="space-y-4 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
        {ministryTechs.map(([id, r]) => {
          const allInQueue = researchQueue.filter(q => q.researchId === id);
          const inQueue = allInQueue[0] || null;
          const queuedCount = allInQueue.length;
          const researchLvl = state.research?.[id] || 0;
          const reqBuildings = { ...(currentPlanet.buildings || {}), researchLab: effectiveLab };
          const meets = meetsReq ? meetsReq(r.req, { ...reqBuildings, ...(state.research || {}) }) : true;
          const lvl = researchLvl;
          const targetLvl = lvl + queuedCount;
          const nextLvl = targetLvl + 1;

          const cost = researchCost ? researchCost(
            id,
            targetLvl,
            state.research?.aiStrategy || 0,
            currentPlanet.buildings?.constructionCenter || 0
          ) : {};
          const time = calcPlanetResearchTime ? calcPlanetResearchTime(
            state,
            currentPlanet,
            cost
          ) : 0;
          const affordable = canAfford ? canAfford(currentPlanet.resources, cost) : false;
          const prodInfo = researchEffectInfo ? researchEffectInfo(id, targetLvl) : '';

          const extraLines = [];
          if (r.req && !meets) {
            extraLines.push(`🔒 Requiere: ${Object.entries(r.req).map(([k, v]) => `${RESEARCH?.[k]?.name || BUILDINGS?.[k]?.name || k} Nv.${v}`).join(', ')}`);
          }
          if (queuedCount > 0) {
            extraLines.push(`⏳ En cola: +${queuedCount} nivel(es)`);
          }

          return (
            <div key={id} id={`research-card-${id}`} className="relative transition-all duration-300">
              {ItemCard ? (
                <ItemCard
                  id={id}
                  name={r.name}
                  icon={r.icon}
                  level={targetLvl}
                  cost={cost}
                  time={time}
                  canAfford={affordable}
                  planetResources={currentPlanet?.resources}
                  isQueueFull={(state?.researchQueue || []).length >= getMaxResearchQueueSlots(state)}
                  meetsRequirements={meets}
                  prodInfo={prodInfo}
                  onAction={() => {
                    dispatch({ type: 'START_RESEARCH', researchId: id, planetId: currentPlanet.id });
                    if (window.playSfx) window.playSfx('build');
                  }}
                  actionLabel={`Investigar (Nv.${nextLvl})`}
                  extra={extraLines.join(' | ') || null}
                  onOpenCodex={onOpenCodex}
                  category={r.cat || 'science'}
                  activeQueueItem={inQueue}
                  queueItems={allInQueue}
                  onCancelQueue={(queueId) => dispatch({ type: 'CANCEL_RESEARCH_QUEUE', queueId })}
                  isAutoRestricted={Boolean(currentPlanet?.automatedExclusions?.[id])}
                  onToggleAutoRestriction={() => dispatch({
                    type: 'TOGGLE_AUTOMATION_RESTRICTION',
                    planetId: currentPlanet?.id,
                    targetId: id
                  })}
                />
              ) : (
                <div className="p-3 bg-black/40 border border-white/10 rounded-xl text-white">
                  <div className="font-bold">{r.name} (Nv. {lvl})</div>
                </div>
              )}
            </div>
          );
        })}

        {/* Tarjeta de Retorno al Atrio */}
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
    </section>
  );
};
