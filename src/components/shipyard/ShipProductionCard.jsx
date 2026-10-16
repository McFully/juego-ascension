import React from 'react';
import { AutomationRestrictionToggle } from '../ui/AutomationRestrictionToggle.jsx';
import { extractShipTechSnapshot, calculateTechGeneration } from '../../utils/formulas/retrofitFormulas.js';
import { calcShipOperatingExpenses } from '../../utils/formulas/operatingExpensesFormulas.js';

export const ShipProductionCard = ({
  id,
  s,
  currentPlanet,
  state,
  meetsReq,
  canAfford,
  shipCost,
  calcShipTime,
  getShipStats,
  constructionDiscount,
  GAME_SPEED,
  bonus,
  CardBanner,
  S,
  fmt,
  fmtTime,
  onOpenCodex,
  dispatch,
  RESEARCH,
  BUILDINGS
}) => {
  const cost = shipCost(id, 1, currentPlanet.buildings?.constructionCenter || 0);
  const mins = currentPlanet.ministries || state.ministries || {};
  const time = calcShipTime(id, 1, currentPlanet.buildings?.shipyard || 0, currentPlanet.buildings?.naniteFactory || 0, GAME_SPEED, bonus, mins);
  const meets = meetsReq(s.req, { ...currentPlanet.buildings, ...state.research });
  const count = currentPlanet?.fleet?.[id] || 0;
  const affordable1 = canAfford(currentPlanet.resources, cost);

  const st = getShipStats(id, state.research, state.blueprints, 'human', currentPlanet.buildings) || s;
  const dAtk = st.atk - s.atk;
  const dShd = st.shd - s.shd;
  const dHull = st.hull - s.hull;

  return (
    <div className="w-full h-full">
      <div className={`relative flex flex-col justify-between h-full rounded-2xl border transition-all duration-300 overflow-hidden p-4 ${
        !meets
          ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed shadow-[0_0_20px_rgba(244,63,94,0.06)]'
          : `${S.card}`
      }`}>
        <div>
          <div className="relative overflow-hidden rounded-xl mb-3">
            <CardBanner id={id} isLocked={!meets} />
            
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

            <AutomationRestrictionToggle
              isRestricted={Boolean(currentPlanet?.automatedExclusions?.[id])}
              onToggle={() => dispatch({
                type: 'TOGGLE_AUTOMATION_RESTRICTION',
                planetId: currentPlanet?.id,
                targetId: id
              })}
            />
          </div>
          
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-black">
                  Mk.{calculateTechGeneration(extractShipTechSnapshot(state.research || {}))}
                </span>
                {s.drive && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    s.drive === 'combustion' 
                      ? 'bg-amber-950/80 border border-amber-500/40 text-amber-300' 
                      : s.drive === 'impulse'
                        ? 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300'
                        : 'bg-purple-950/80 border border-purple-500/40 text-purple-300'
                  }`} title={s.range === 'system' ? 'Propulsión Química: Solo Sistema Solar' : s.range === 'galaxy' ? 'Impulso Iónico: Galaxia Local' : 'Hiperespacio: Intergaláctico'}>
                    {s.drive === 'combustion' ? '🔥 Sistémico' : s.drive === 'impulse' ? '💨 Sectorial' : '🌀 Interestelar'}
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-cyan-400">En hangar: {fmt(count)}</div>
            </div>
            {count > 0 && (
              <button
                onClick={() => dispatch({ type: 'SCRAP_SHIPS', shipId: id, quantity: Math.max(1, Math.floor(count/2)) })}
                className="text-xs text-red-400/60 hover:text-red-300 p-1 hover:bg-red-500/10 rounded cursor-pointer"
                title="Desguazar mitad y recuperar chatarra"
              >
                🗑️
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px] p-2 rounded-xl bg-[#05070f]/60 border border-white/5 font-mono mb-2">
            <div>
              <span className="text-slate-500">⚔️ Atk: </span>
              <span className="text-slate-100 font-bold">{Math.round(st.atk)}</span>
              {dAtk > 0 && <span className="text-emerald-400 ml-0.5 text-[9px]">(+{Math.round(dAtk)})</span>}
            </div>
            <div>
              <span className="text-slate-500">🛡️ Shd: </span>
              <span className="text-slate-100 font-bold">{Math.round(st.shd)}</span>
              {dShd > 0 && <span className="text-emerald-400 ml-0.5 text-[9px]">(+{Math.round(dShd)})</span>}
            </div>
            <div>
              <span className="text-slate-500">💪 Hull: </span>
              <span className="text-slate-100 font-bold">{Math.round(st.hull)}</span>
              {dHull > 0 && <span className="text-emerald-400 ml-0.5 text-[9px]">(+{Math.round(dHull)})</span>}
            </div>
            <div>
              <span className="text-slate-500">🚀 Vel: </span>
              <span className="text-slate-100 font-bold">{fmt(st.speed || s.speed)}</span>
            </div>
            <div className="col-span-2 text-slate-500">
              📦 Cargo: <span className="text-amber-300 font-bold">{fmt(st.cargo || s.cargo)}</span> | ⛽ {s.fuel}/h
            </div>
          </div>

          {/* BLOQUE 2: Censo, Mantenimiento y Salarios */}
          {(() => {
            const shipExpenses = calcShipOperatingExpenses(id, 1);
            return (
              <div className="flex flex-col gap-1 mb-2 text-[10px] font-mono">
                <div className="p-1.5 px-2 rounded-xl bg-[#05070f]/60 border border-white/5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span>👨‍🚀</span>
                    <span className="text-[9px] uppercase tracking-wider">Tripulación requerida:</span>
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {fmt(shipExpenses.crew)} tripulantes / ud
                  </span>
                </div>
                <div className="p-1.5 px-2 rounded-xl bg-[#030611]/70 border border-amber-500/15 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 text-[9px] text-amber-300/80 uppercase">
                      <span>🛸</span> Mantenimiento Hangar:
                    </span>
                    <span className="text-amber-200 font-bold">
                      {fmt(shipExpenses.maintenanceCreditsHour)} cr/h <span className="text-slate-500 text-[8px]">({fmt(shipExpenses.maintenanceCreditsDay)}/d)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 border-t border-white/5 pt-0.5">
                    <span className="flex items-center gap-1 text-[9px] text-cyan-300/80 uppercase">
                      <span>💼</span> Nómina Tripulación:
                    </span>
                    <span className="text-cyan-200 font-bold">
                      {fmt(shipExpenses.salariesCreditsHour)} cr/h <span className="text-slate-500 text-[8px]">({fmt(shipExpenses.salariesCreditsDay)}/d)</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* BLOQUE 3: Coste de Fabricación y Tiempo */}
          <div className="space-y-0.5 text-[10px] font-mono p-2 rounded-xl bg-[#05070f]/40 border border-white/5 mb-3">
            {cost.metal > 0 && (
              <div className="flex justify-between">
                <span className="text-amber-400">⛏️ Metal</span>
                <span className={`font-medium ${(currentPlanet?.resources?.metal ?? 0) >= cost.metal ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(cost.metal)}
                </span>
              </div>
            )}
            {cost.crystal > 0 && (
              <div className="flex justify-between">
                <span className="text-cyan-400">💎 Cristal</span>
                <span className={`font-medium ${(currentPlanet?.resources?.crystal ?? 0) >= cost.crystal ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(cost.crystal)}
                </span>
              </div>
            )}
            {cost.deuterium > 0 && (
              <div className="flex justify-between">
                <span className="text-emerald-400">⚗️ Deuterio</span>
                <span className={`font-medium ${(currentPlanet?.resources?.deuterium ?? 0) >= cost.deuterium ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmt(cost.deuterium)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/5 pt-0.5"><span className="text-slate-500">⏱ Tiempo ud.</span><span className="text-cyan-400">{fmtTime(time)}</span></div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            {[1, 5, 10].map(q => {
              const qCost = shipCost(id, q, currentPlanet.buildings?.constructionCenter || 0);
              const canQ = canAfford(currentPlanet.resources, qCost) && meets;
              return (
                <button
                  key={q}
                  onClick={() => dispatch({ type: 'START_SHIP', shipId: id, quantity: q })}
                  disabled={!canQ}
                  className={`flex-1 py-1 rounded-lg font-mono text-xs font-bold transition-all focus-ring-game ${
                    canQ
                      ? 'bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-200 border border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer active:scale-95'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
                  }`}
                  title={`Construir +${q} ${s.name}`}
                >
                  +{q}
                </button>
              );
            })}
            <button
              onClick={() => {
                const pRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
                const maxAfford = Math.max(1, Math.floor(Math.min(
                  (pRes.metal / (s.cost.m * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1)),
                  (pRes.crystal / (s.cost.c * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1)),
                  (pRes.deuterium / ((s.cost.d || 0) * constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) || 1))
                )));
                if (maxAfford > 0) dispatch({ type: 'START_SHIP', shipId: id, quantity: maxAfford });
              }}
              disabled={!meets || !affordable1}
              className={`py-1 px-3 rounded-lg font-mono text-xs font-black transition-all focus-ring-game ${
                meets && affordable1
                  ? 'bg-gradient-to-r from-cyan-600/30 to-emerald-600/30 hover:from-cyan-500/40 hover:to-emerald-500/40 text-white border border-cyan-400/50 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)] cursor-pointer active:scale-95'
                  : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed opacity-50'
              }`}
              title="Construir el máximo de unidades posible según recursos disponibles"
            >
              MAX
            </button>
            {onOpenCodex && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenCodex && onOpenCodex(id); }}
                className="py-1 px-2.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 font-mono text-xs font-bold"
                title="Ver detalles de la nave en Codex"
              >
                <span>📋</span>
                <span className="hidden sm:inline">Ver Detalles</span>
              </button>
            )}
          </div>
          {s.req && !meets && (
            <div className="text-[10px] text-red-400 mt-2 p-1.5 rounded-lg bg-red-950/30 border border-red-500/20 leading-tight font-mono flex items-center gap-1.5">
              <span>🔒</span>
              <span>Requisito: {Object.entries(s.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} Nv.${v}`).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
