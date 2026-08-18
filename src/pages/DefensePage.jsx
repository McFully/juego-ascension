import React from 'react';

const DefensePage = ({ state, dispatch, currentPlanet, DEFENSES, RESEARCH, S, CardBanner, ProgressBar, fmt, fmtTime, shipTimeBonus, defenseCost, calcDefenseTime, meetsReq, getDefenseStats, getEffectiveTech, canAfford, constructionDiscount, GAME_SPEED, onOpenCodex }) => {
  const bonus = shipTimeBonus(currentPlanet.buildings);

  if (!currentPlanet.buildings.shipyard) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🛡️</div>
        <h3 className="text-xl mb-2">Astillero requerido</h3>
        <p className="text-slate-400">Construye un Astillero para fabricar defensas.</p>
      </div>
    );
  }

  const defQueues = state.defenseQueue.filter(item => item.planetId === currentPlanet.id);

  const defenseSummary = Object.entries(currentPlanet.defenses || {}).reduce(
    (acc, [defId, qty]) => {
      if (qty <= 0) return acc;
      const stats = getDefenseStats(defId, getEffectiveTech(currentPlanet, state.research), 'human', currentPlanet.buildings) || DEFENSES[defId];
      acc.totalCount += qty;
      acc.totalAtk += qty * (stats.atk || 0);
      acc.totalDef += qty * ((stats.shd || 0) + (stats.hull || 0));
      return acc;
    },
    { totalCount: 0, totalAtk: 0, totalDef: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="bg-[#0b1021] border border-emerald-500/20 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-around text-sm font-mono shadow-inner relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total de Estructuras</div>
            <div className="text-lg font-black text-emerald-400">{fmt(defenseSummary.totalCount)}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Poder de Ataque Total</div>
            <div className="text-lg font-black text-red-400">{fmt(defenseSummary.totalAtk)}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xl">💪</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Poder de Defensa Total</div>
            <div className="text-lg font-black text-cyan-400">{fmt(defenseSummary.totalDef)}</div>
          </div>
        </div>
      </div>
      {defQueues.length > 0 && (
        <div className={S.cardInner}>
          <h4 className="font-semibold mb-2 text-sm">🛡️ Cola de Defensas ({defQueues.length}/5)</h4>
          {defQueues.map(item => {
            const d = DEFENSES[item.defenseId];
            const totalQty = item.quantity;
            const delivered = item.unitsDelivered || 0;
            const remainingQty = Math.max(1, totalQty - delivered);
            const remainingTime = Math.max(0, (item.endTime - Date.now()) / 1000);
            const totalTime = (item.endTime - item.startTime) / 1000;
            return (
              <div key={item.id} className="bg-slate-950/50 rounded p-2 mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm shrink-0">
                  <span>{d?.icon || '🛡️'}</span>
                  <span className="font-medium text-slate-200">{fmt(remainingQty)}x {d?.name || item.defenseId} <span className="text-[10px] text-slate-400">({delivered} listos)</span></span>
                  <span className="text-xs font-mono text-cyan-400">{fmtTime(remainingTime)}</span>
                </div>
                <div className="flex-1 mx-2">
                  <ProgressBar value={totalTime - remainingTime} max={totalTime} color="from-emerald-500 to-teal-500" height="h-1.5" />
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCEL_DEFENSE_QUEUE', queueId: item.id })}
                  className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded transition-all shrink-0 flex items-center gap-1"
                  title="Cancelar construcciones restantes y reembolsar 50% de recursos"
                >
                  ✕ Cancelar (50%)
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 items-stretch">
        {Object.entries(DEFENSES).map(([id, d]) => {
          const cost = defenseCost(id, 1, currentPlanet.buildings?.constructionCenter || 0);
          const time = calcDefenseTime(id, 1, currentPlanet.buildings.shipyard, currentPlanet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
          const meets = meetsReq(d.req, state.research);
          const count = currentPlanet.defenses[id] || 0;
          const maxReached = d.max && count >= d.max;
          return (
            <div key={id} className={S.card}>
              <CardBanner id={id} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{d.name}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                      className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all group/info"
                      title="Ver detalles"
                    >
                      <span className="material-symbols-outlined text-[10px] group-hover/info:scale-110 transition-transform">menu_book</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">Instaladas: {fmt(count)}{d.max ? ` / ${d.max}` : ''}</div>
                </div>
                {count > 0 && <button onClick={() => dispatch({ type: 'SCRAP_DEFENSES', defenseId: id, quantity: Math.max(1, Math.floor(count/2)) })}
                  className="text-xs text-red-400/50 hover:text-red-300" title="Retirar mitad">🗑️</button>}
              </div>
              {(() => {
                const ds = getDefenseStats(id, getEffectiveTech(currentPlanet, state.research), 'human', currentPlanet.buildings) || d;
                const dAtk = ds.atk - d.atk;
                const dShd = ds.shd - d.shd;
                const dHull = ds.hull - d.hull;
                return (
                  <div className="grid grid-cols-2 gap-1 text-xs mb-3 text-slate-400">
                    <div title={`Base: ${d.atk} | +${((state.research.weapons || 0) * 10)}% por Tecnología de Armas Nv${state.research.weapons || 0}`}>
                      ⚔️ Atk: <span className="text-slate-200">{d.atk}</span>
                      {dAtk > 0 && <span className="text-emerald-400 font-bold ml-1">+{dAtk.toFixed(0)}</span>}
                    </div>
                    <div title={`Base: ${d.shd} | +${((state.research.shields || 0) * 10)}% por Tecnología de Escudos Nv${state.research.shields || 0}`}>
                      🛡️ Shd: <span className="text-slate-200">{d.shd}</span>
                      {dShd > 0 && <span className="text-emerald-400 font-bold ml-1">+{dShd.toFixed(0)}</span>}
                    </div>
                    <div title={`Base: ${d.hull} | +${((state.research.armour || 0) * 8)}% por Tecnología de Blindaje Nv${state.research.armour || 0}`}>
                      💪 Hull: <span className="text-slate-200">{d.hull}</span>
                      {dHull > 0 && <span className="text-emerald-400 font-bold ml-1">+{dHull.toFixed(0)}</span>}
                    </div>
                    <div>⏱️ <span className="text-slate-200">{fmtTime(time)}</span></div>
                  </div>
                );
              })()}
              <div className="space-y-1 mb-3 text-xs">
                {cost.metal > 0 && <div className="flex justify-between"><span className="text-amber-400">⛏️ Metal</span><span>{fmt(cost.metal)}</span></div>}
                {cost.crystal > 0 && <div className="flex justify-between"><span className="text-cyan-400">💎 Cristal</span><span>{fmt(cost.crystal)}</span></div>}
                {cost.deuterium > 0 && <div className="flex justify-between"><span className="text-emerald-400">⚗️ Deuterio</span><span>{fmt(cost.deuterium)}</span></div>}
              </div>
              <div className="flex gap-1 mt-auto">
                {[1, 5, 10].map(q => (
                  <button key={q} onClick={() => dispatch({ type: 'START_DEFENSE', defenseId: id, quantity: q })}
                    disabled={!canAfford(currentPlanet.resources, defenseCost(id, q, currentPlanet.buildings?.constructionCenter || 0)) || !meets || maxReached}
                    className={`flex-1 ${S.btn} text-xs ${canAfford(currentPlanet.resources, defenseCost(id, q, currentPlanet.buildings?.constructionCenter || 0)) && meets && !maxReached ? S.btnPrimary : S.btnGhost}`}>
                    +{q}
                  </button>
                ))}
                <button onClick={() => {
                  const maxAfford = Math.max(1, Math.floor(Math.min(
                    (currentPlanet.resources.metal / (d.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                    (currentPlanet.resources.crystal / (d.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                    (currentPlanet.resources.deuterium / ((d.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1))
                  )));
                  if (maxAfford > 0) dispatch({ type: 'START_DEFENSE', defenseId: id, quantity: maxAfford });
                }} disabled={!meets || maxReached} className={`${S.btn} text-xs ${S.btnGhost}`}>
                  MAX
                </button>
              </div>
              {d.req && !meets && <div className="text-xs text-red-400 mt-2">Requiere: {Object.entries(d.req).map(([k, v]) => `${RESEARCH[k]?.name || k} ${v}`).join(', ')}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DefensePage;
