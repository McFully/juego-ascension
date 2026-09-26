import React from 'react';
import { AutomationRestrictionToggle } from '../ui/AutomationRestrictionToggle.jsx';
import { extractShipTechSnapshot, calculateTechGeneration } from '../../utils/formulas/retrofitFormulas.js';

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
  const time = calcShipTime(id, 1, currentPlanet.buildings?.shipyard || 0, currentPlanet.buildings?.naniteFactory || 0, GAME_SPEED, bonus);
  const meets = meetsReq(s.req, { ...currentPlanet.buildings, ...state.research });
  const count = currentPlanet?.fleet?.[id] || 0;
  const affordable1 = canAfford(currentPlanet.resources, cost);

  const st = getShipStats(id, state.research, state.blueprints, 'human', currentPlanet.buildings) || s;
  const dAtk = st.atk - s.atk;
  const dShd = st.shd - s.shd;
  const dHull = st.hull - s.hull;

  return (
    <div className="w-full h-full">
      <div className={`${S.card} relative flex flex-col justify-between h-full`}>
        <div>
          <div className="relative">
            <CardBanner id={id} />
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
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono font-black">
                  Mk.{calculateTechGeneration(extractShipTechSnapshot(state.research || {}))}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                  className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                  title="Ver detalles"
                >
                  <span className="material-symbols-outlined text-[10px]">menu_book</span>
                </button>
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
          <div className="flex gap-1">
            {[1, 5, 10].map(q => {
              const qCost = shipCost(id, q, currentPlanet.buildings?.constructionCenter || 0);
              const canQ = canAfford(currentPlanet.resources, qCost) && meets;
              return (
                <button
                  key={q}
                  onClick={() => dispatch({ type: 'START_SHIP', shipId: id, quantity: q })}
                  disabled={!canQ}
                  className="flex-1 text-[11px] py-1 focus-ring-game"
                >
                  +{q}
                </button>
              );
            })}
            <button
              onClick={() => {
                const maxAfford = Math.max(1, Math.floor(Math.min(
                  (currentPlanet.resources.metal / (s.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                  (currentPlanet.resources.crystal / (s.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                  (currentPlanet.resources.deuterium / ((s.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1))
                )));
                if (maxAfford > 0) dispatch({ type: 'START_SHIP', shipId: id, quantity: maxAfford });
              }}
              disabled={!meets || !affordable1}
              className={`${S.btn} text-[11px] py-1 px-2.5 focus-ring-game font-bold`}
            >
              MAX
            </button>
          </div>
          {s.req && !meets && (
            <div className="text-[9px] text-red-400 mt-1.5 leading-tight font-mono">
              🔒 Requiere: {Object.entries(s.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} Nv. ${v}`).join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
