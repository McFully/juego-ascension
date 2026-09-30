import React, { useMemo } from 'react';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import {
  buildResearchScoreConfig,
  rankResearch,
  TECH_FOCUS_KEYS,
  TECH_FOCUS_LABELS,
} from '../../reducers/tick/ai/researchScoring.js';
import { calcPlanetResearchTime } from '../../core.jsx';

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

  // Verificar si hay laboratorio construido
  const labLevel = currentPlanet.buildings?.researchLab || 0;
  const isLabMissing = labLevel < 1;

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

  // 1.6 — "Foco científico": el ajuste que el jugador elige pesa de verdad en el
  // scoring (researchScoring lo lee vía buildResearchScoreConfig). Antes se
  // guardaba y ningún tick lo miraba.
  const ministryState = state.ministries?.[ministryId] || {};
  const techFocus = ministryState.techFocus || 'general';

  // 1.6 — los candidatos que el ministerio consideraría, ordenados por puntuación real.
  // Sirve para que el jugador vea por qué se eligió lo que se eligió.
  const rankedCandidates = useMemo(() => {
    try {
      const config = buildResearchScoreConfig(state, currentPlanet, { ministryId });
      return rankResearch(config, Object.keys(RESEARCH))
        .slice(0, 5)
        .map(({ id: techId, score }) => ({
          id: techId,
          name: RESEARCH[techId]?.name || techId,
          score,
        }));
    } catch (e) {
      // La UI nunca debe romperse por un fallo de scoring.
      console.error('[MinistryResearchSection] scoring no disponible:', e);
      return [];
    }
  }, [state, currentPlanet, ministryId]);

  return (
    <section className="space-y-4 pt-1">
      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Foco Científico</h4>
            <p className="text-[10px] text-slate-400 font-mono">
              Prioriza estas categorías al elegir automáticamente.
            </p>
          </div>
          <select
            value={techFocus}
            onChange={(e) => dispatch({
              type: 'SET_MINISTRY_STATE',
              ministryId,
              patch: { techFocus: e.target.value },
            })}
            className="bg-[#05070f] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono cursor-pointer"
            aria-label="Foco científico del ministerio"
          >
            {TECH_FOCUS_KEYS.map((k) => (
              <option key={k} value={k}>{TECH_FOCUS_LABELS[k] || k}</option>
            ))}
          </select>
        </div>

        {rankedCandidates.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
              Candidatos por puntuación
            </p>
            <ul className="space-y-0.5">
              {rankedCandidates.map((c, i) => (
                <li key={c.id} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-300">
                    <span className="text-slate-500 mr-1.5">{i + 1}.</span>{c.name}
                  </span>
                  <span className="text-cyan-400">{c.score.toFixed(0)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-stretch">
        {ministryTechs.map(([id, r]) => {
          const allInQueue = researchQueue.filter(q => q.researchId === id);
          const inQueue = allInQueue[0] || null;
          const queuedCount = allInQueue.length;
          const researchLvl = state.research?.[id] || 0;
          const meets = meetsReq ? meetsReq(r.req, { ...(currentPlanet.buildings || {}), ...(state.research || {}) }) : true;
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
            <div key={id} className="relative">
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
                  isQueueFull={(state?.researchQueue || []).length >= 8}
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
