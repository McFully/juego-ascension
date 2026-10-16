import React from 'react';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { AutomationRestrictionToggle } from '../ui/AutomationRestrictionToggle.jsx';
import {
  extractDefenseTechSnapshot,
  calculateTechGeneration,
  isVariantOutdated,
  calculateRetrofitUnitCost
} from '../../utils/formulas/retrofitFormulas.js';

export const DefenseGrid = ({
  DEFENSES,
  currentPlanet,
  state,
  dispatch,
  S,
  CardBanner,
  fmt,
  fmtTime,
  defenseCost,
  calcDefenseTime,
  meetsReq,
  getDefenseStats,
  getEffectiveTech,
  canAfford,
  constructionDiscount,
  bonus,
  GAME_SPEED,
  onOpenCodex,
  RESEARCH,
  navigateBack
}) => {
  return (
    <div className="w-full space-y-3 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full items-stretch pt-2 pb-4">
        {Object.entries(DEFENSES).map(([id, d]) => {
          const cost = defenseCost(id, 1, currentPlanet.buildings?.constructionCenter || 0);
          const mins = currentPlanet.ministries || state.ministries || {};
          const time = calcDefenseTime(id, 1, currentPlanet.buildings.shipyard, currentPlanet.buildings.naniteFactory || 0, GAME_SPEED, bonus, mins);
          const meets = meetsReq(d.req, { ...currentPlanet.buildings, ...state.research });
          const count = currentPlanet.defenses[id] || 0;
          const maxReached = (d.max && count >= d.max) || false;
          const affordable1 = canAfford(currentPlanet.resources, cost);

          const ds = getDefenseStats(id, getEffectiveTech(currentPlanet, state.research), 'human', currentPlanet.buildings) || d;
          const dAtk = ds.atk - d.atk;
          const dShd = ds.shd - d.shd;
          const dHull = ds.hull - d.hull;

          const queuedItem = (state.defenseQueue || []).find(q => q.defenseId === id && q.planetId === currentPlanet.id);
          const isCalibrating = Boolean(queuedItem);

          return (
            <div key={id} className="w-full h-full">
              <div className={`relative flex flex-col justify-between h-full rounded-2xl border transition-all duration-300 overflow-hidden ${
                !meets 
                  ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed shadow-[0_0_20px_rgba(244,63,94,0.06)]' 
                  : maxReached 
                    ? 'border-amber-500/30 bg-[#090d1d]/85 shadow-[0_0_20px_rgba(245,158,11,0.08)]' 
                    : !affordable1 
                      ? 'border-cyan-900/30 bg-[#080d1e]/85' 
                      : 'border-cyan-500/30 bg-gradient-to-b from-[#0c142b] to-[#070c18] hover:border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.12)]'
              }`}>
                <div>
                  {/* Banner visual con overlay de estado y candado de automatización */}
                  <div className="relative group overflow-hidden">
                    <CardBanner id={id} isLocked={!meets} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-black/30 pointer-events-none" />

                    {!meets && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}

                    {!meets && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/90 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 z-20">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    
                    {/* Badge de cantidad apostada flotante sobre el banner */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/80 border border-white/10 backdrop-blur-md">
                      <span className={`w-2 h-2 rounded-full ${isCalibrating ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                      <span className="text-[11px] font-mono font-bold text-white">
                        {fmt(count)} {d.max ? <span className="text-slate-400 font-normal">/ {d.max}</span> : ''}
                      </span>
                    </div>

                    {isCalibrating && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/60 text-[9px] font-mono font-bold text-amber-200 shadow-lg animate-pulse">
                        <span>⚙️</span>
                        <span>CALIBRANDO ({queuedItem.quantity - (queuedItem.unitsDelivered || 0)})</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 z-10">
                      <AutomationRestrictionToggle
                        isRestricted={Boolean(currentPlanet?.automatedExclusions?.[id])}
                        onToggle={() => dispatch({
                          type: 'TOGGLE_AUTOMATION_RESTRICTION',
                          planetId: currentPlanet?.id,
                          targetId: id
                        })}
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    {/* Encabezado con Nombre y Nivel Mk de Vanguardia */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm tracking-wide group-hover:text-cyan-300 transition-colors">
                            {d.name}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-black">
                            Mk.{calculateTechGeneration(extractDefenseTechSnapshot(state.research || {}))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* HUD Balístico Táctico Visual - Valores Estándar Consolidados */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] mb-2.5">
                      <div className="flex flex-col items-center justify-center py-1 px-0.5 rounded-lg bg-red-950/20 border border-red-500/15 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold flex items-center gap-0.5">⚔️ Atk</span>
                        <span className="font-bold text-slate-100">{Math.round(ds.atk)}</span>
                        {dAtk > 0 && <span className="text-[8px] text-emerald-400 font-semibold">(+{Math.round(dAtk)})</span>}
                      </div>
                      <div className="flex flex-col items-center justify-center py-1 px-0.5 rounded-lg bg-cyan-950/20 border border-cyan-500/15 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-0.5">🛡️ Shd</span>
                        <span className="font-bold text-slate-100">{Math.round(ds.shd)}</span>
                        {dShd > 0 && <span className="text-[8px] text-emerald-400 font-semibold">(+{Math.round(dShd)})</span>}
                      </div>
                      <div className="flex flex-col items-center justify-center py-1 px-0.5 rounded-lg bg-amber-950/20 border border-amber-500/15 text-center">
                        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-0.5">🧱 Blind</span>
                        <span className="font-bold text-slate-100">{Math.round(ds.hull)}</span>
                        {dHull > 0 && <span className="text-[8px] text-emerald-400 font-semibold">(+{Math.round(dHull)})</span>}
                      </div>
                    </div>

                    {/* Desglose de Baterías Desplegadas de Versiones Anteriores */}
                    {(() => {
                      const currentTech = extractDefenseTechSnapshot(state.research || {});
                      const defVariants = Object.values(currentPlanet?.defenseVariants || {})
                        .filter(v => v && v.baseId === id && v.count > 0);
                      const obsoleteVariants = defVariants.filter(v => isVariantOutdated(v.techSnapshot, currentTech, 'defense'));

                      if (obsoleteVariants.length === 0) return null;

                      return (
                        <div className="mb-2 p-2 rounded-xl bg-amber-950/25 border border-amber-500/30 space-y-1.5 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span className="flex items-center gap-1">
                              <span>⚠️</span>
                              <span>Baterías Antiguas:</span>
                            </span>
                            <span>{obsoleteVariants.reduce((a, b) => a + b.count, 0)} uds</span>
                          </div>
                          {obsoleteVariants.map(ov => {
                            const costRetrofit = calculateRetrofitUnitCost(id, ov.techSnapshot, currentTech, 'defense');
                            const totalRetroCost = {
                              metal: costRetrofit.metal * ov.count,
                              crystal: costRetrofit.crystal * ov.count,
                              deuterium: costRetrofit.deuterium * ov.count
                            };
                            const canAffordRetro = canAfford(currentPlanet.resources, totalRetroCost);

                            return (
                              <div key={ov.variantKey} className="flex items-center justify-between gap-1 pt-1 border-t border-amber-500/20">
                                <span className="text-amber-400 text-[9px]">Mk.{ov.techGen || 1} ({ov.count})</span>
                                <button
                                  onClick={() => {
                                    dispatch({
                                      type: 'RETROFIT_DEFENSE_VARIANT',
                                      variantKey: ov.variantKey,
                                      count: ov.count,
                                      planetId: currentPlanet?.id
                                    });
                                    if (window.playSfx) window.playSfx('click');
                                  }}
                                  disabled={!canAffordRetro}
                                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition ${
                                    canAffordRetro
                                      ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-sm'
                                      : 'bg-white/5 text-slate-500 cursor-not-allowed'
                                  }`}
                                  title={`Mejorar a Mk.${calculateTechGeneration(currentTech)} por ${fmt(totalRetroCost.metal)}M / ${fmt(totalRetroCost.crystal)}C / ${fmt(totalRetroCost.deuterium)}D`}
                                >
                                  Actualizar
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* BLOQUE 2: Censo y Guarnición Requerida */}
                    <div className="p-2 rounded-xl bg-[#05070f]/60 border border-white/5 font-mono text-[10px] mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span>🎖️</span>
                        <span className="text-[9px] uppercase tracking-wider">Guarnición requerida:</span>
                      </span>
                      <span className="text-cyan-300 font-bold">
                        {fmt(Math.round(d.garrison ? d.garrison * 10 : 2))} soldados / ud
                      </span>
                    </div>

                    {/* Costes e Indicador de Tiempo */}
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 mb-2 font-mono text-[10px]">
                      <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-white/5">
                        <span className="flex items-center gap-1">⏱ Ensamblaje:</span>
                        <span className="text-cyan-300 font-semibold">{fmtTime(time)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {cost.metal > 0 && (
                          <div className={`flex items-center gap-1 font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>⛏️</span>
                            <span>{fmt(cost.metal)}</span>
                          </div>
                        )}
                        {cost.crystal > 0 && (
                          <div className={`flex items-center gap-1 font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>💎</span>
                            <span>{fmt(cost.crystal)}</span>
                          </div>
                        )}
                        {cost.deuterium > 0 && (
                          <div className={`flex items-center gap-1 font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>⚗️</span>
                            <span>{fmt(cost.deuterium)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botonera de Despliegue Operativo */}
                <div className="p-3 pt-0">
                  <div className="flex items-center gap-1.5">
                    {[1, 5, 10].map(q => {
                      const qCost = defenseCost(id, q, currentPlanet.buildings?.constructionCenter || 0);
                      const canQ = canAfford(currentPlanet.resources, qCost) && meets && !maxReached;
                      return (
                        <button
                          key={q}
                          onClick={() => {
                            dispatch({ type: 'START_DEFENSE', defenseId: id, quantity: q, planetId: currentPlanet?.id });
                            if (window.playSfx) window.playSfx('build');
                          }}
                          disabled={!canQ}
                          className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all focus-ring-game ${
                            canQ 
                              ? 'bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer active:scale-95' 
                              : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                          }`}
                          title={`Desplegar +${q} ${d.name}`}
                        >
                          +{q}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        const pRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
                        const maxAfford = Math.max(1, Math.floor(Math.min(
                          (pRes.metal / (d.cost.m * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1)),
                          (pRes.crystal / (d.cost.c * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1)),
                          (pRes.deuterium / ((d.cost.d || 0) * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1))
                        )));
                        if (maxAfford > 0) {
                          dispatch({ type: 'START_DEFENSE', defenseId: id, quantity: maxAfford, planetId: currentPlanet?.id });
                          if (window.playSfx) window.playSfx('build');
                        }
                      }}
                      disabled={!meets || maxReached || !affordable1}
                      className={`py-1.5 px-3 rounded-lg font-mono text-xs font-black transition-all focus-ring-game ${
                        meets && !maxReached && affordable1
                          ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 hover:from-cyan-500/40 hover:to-emerald-500/40 text-white border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer active:scale-95'
                          : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                      }`}
                      title="Desplegar el máximo de baterías posible"
                    >
                      MAX
                    </button>
                    {onOpenCodex && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenCodex && onOpenCodex(id); }}
                        className="py-1.5 px-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 font-mono text-xs font-bold"
                        title="Ver detalles de la defensa en Codex"
                      >
                        <span>📋</span>
                        <span className="hidden sm:inline">Ver Detalles</span>
                      </button>
                    )}
                  </div>

                  {count > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">Activas: <strong className="text-cyan-300">{count}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Desmantelar 1x ${d.name}? Recuperarás el 35% de sus recursos de construcción.`)) {
                            dispatch({ type: 'SCRAP_DEFENSES', planetId: currentPlanet?.id, defenseId: id, quantity: 1 });
                            if (window.playSfx) window.playSfx('click');
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Desmantelar 1x ${d.name} (+35% reembolso)`}
                      >
                        <span>♻️ Reciclar (35%)</span>
                      </button>
                    </div>
                  )}

                  {d.req && !meets && (
                    <div className="text-[10px] text-red-400 mt-2 p-1.5 rounded-lg bg-red-950/30 border border-red-500/20 leading-tight font-mono flex items-center gap-1.5">
                      <span>🔒</span>
                      <span>Requisito: {Object.entries(d.req).map(([k, v]) => `${RESEARCH[k]?.name || k} Nv.${v}`).join(', ')}</span>
                    </div>
                  )}
                  {maxReached && (
                    <div className="text-[10px] text-amber-400 mt-2 p-1.5 rounded-lg bg-amber-950/30 border border-amber-500/20 font-mono text-center">
                      Límite planetario alcanzado ({d.max})
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
