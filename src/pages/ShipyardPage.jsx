import React, { useState } from 'react';

const ShipyardPage = ({ state, dispatch, currentPlanet, SHIPS, RESEARCH, BUILDINGS, S, CardBanner, ProgressBar, fmt, fmtTime, shipTimeBonus, shipCost, calcShipTime, meetsReq, getShipStats, canAfford, constructionDiscount, GAME_SPEED, onOpenCodex }) => {
  const [shipCat, setShipCat] = useState('civil');
  const bonus = shipTimeBonus(currentPlanet.buildings);

  if (!currentPlanet.buildings.shipyard) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🚀</div>
        <h3 className="text-xl mb-2">Astillero requerido</h3>
        <p className="text-slate-400">Construye un Astillero para fabricar naves.</p>
      </div>
    );
  }

  // Queue display for ships
  const shipQueues = state.shipQueue.filter(item => item.planetId === currentPlanet.id);

  // Calculate total fleet summary on current planet
  const fleetSummary = Object.entries(currentPlanet.fleet || {}).reduce(
    (acc, [shipId, qty]) => {
      if (qty <= 0) return acc;
      const stats = getShipStats(shipId, state.research, state.blueprints, 'human', currentPlanet.buildings) || SHIPS[shipId];
      acc.totalCount += qty;
      acc.totalAtk += qty * (stats.atk || 0);
      acc.totalDef += qty * ((stats.shd || 0) + (stats.hull || 0));
      return acc;
    },
    { totalCount: 0, totalAtk: 0, totalDef: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="bg-[#0b1021] border border-cyan-500/20 rounded-xl p-4 flex flex-wrap gap-6 items-center justify-around text-sm font-mono shadow-inner relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Total de Naves</div>
            <div className="text-lg font-black text-cyan-400">{fmt(fleetSummary.totalCount)}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Poder de Ataque Total</div>
            <div className="text-lg font-black text-red-400">{fmt(fleetSummary.totalAtk)}</div>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Poder de Defensa Total</div>
            <div className="text-lg font-black text-emerald-400">{fmt(fleetSummary.totalDef)}</div>
          </div>
        </div>
      </div>
      {shipQueues.length > 0 && (
        <div className={S.cardInner}>
          <h4 className="font-semibold mb-2 text-sm">🚀 Cola de Astillero ({shipQueues.length}/5)</h4>
          {shipQueues.map(item => {
            const s = SHIPS[item.shipId];
            const totalQty = item.quantity;
            const delivered = item.unitsDelivered || 0;
            const remainingQty = Math.max(1, totalQty - delivered);
            const remainingTime = Math.max(0, (item.endTime - Date.now()) / 1000);
            const totalTime = (item.endTime - item.startTime) / 1000;
            return (
              <div key={item.id} className="bg-slate-950/50 rounded p-2 mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm shrink-0">
                  <span>{s?.icon || '🚀'}</span>
                  <span className="font-medium text-slate-200">{fmt(remainingQty)}x {s?.name || item.shipId} <span className="text-[10px] text-slate-400">({delivered} en hangar)</span></span>
                  <span className="text-xs font-mono text-cyan-400">{fmtTime(remainingTime)}</span>
                </div>
                <div className="flex-1 mx-2">
                  <ProgressBar value={totalTime - remainingTime} max={totalTime} color="from-cyan-500 to-blue-500" height="h-1.5" />
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCEL_SHIP_QUEUE', queueId: item.id })}
                  className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded transition-all shrink-0 flex items-center gap-1"
                  title="Cancelar naves restantes y reembolsar 50% de recursos"
                >
                  ✕ Cancelar (50%)
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className={S.tabBar}>
        {[
          { key: 'civil', title: '📦 Civiles' },
          { key: 'military', title: '⚔️ Militares' },
          { key: 'ammo', title: '☄️ Munición' },
        ].map(c => (
          <button key={c.key} onClick={() => setShipCat(c.key)}
            className={`${S.tab} ${shipCat === c.key ? S.tabActive : S.tabInactive}`}>
            {c.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-2 items-stretch">
        {Object.entries(SHIPS).filter(([, s]) => s.cat === shipCat).map(([id, s]) => {
          const cost = shipCost(id, 1, currentPlanet.buildings?.constructionCenter || 0);
          const time = calcShipTime(id, 1, currentPlanet.buildings.shipyard, currentPlanet.buildings.naniteFactory || 0, GAME_SPEED, bonus);
          const meets = meetsReq(s.req, { ...currentPlanet.buildings, ...state.research });
          const count = currentPlanet.fleet[id] || 0;
          return (
            <div key={id} className={S.card}>
              <CardBanner id={id} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{s.name}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onOpenCodex(id); }}
                      className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-[var(--ue-accent)] hover:border-[var(--ue-accent)]/40 hover:bg-[var(--ue-accent)]/10 transition-all group/info"
                      title="Ver detalles"
                    >
                      <span className="material-symbols-outlined text-[10px] group-hover/info:scale-110 transition-transform">menu_book</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">En hangar: {fmt(count)}</div>
                </div>
                {count > 0 && <button onClick={() => dispatch({ type: 'SCRAP_SHIPS', shipId: id, quantity: Math.max(1, Math.floor(count/2)) })}
                  className="text-xs text-red-400/50 hover:text-red-300" title="Desguazar mitad">🗑️</button>}
              </div>
              {(() => {
                const st = getShipStats(id, state.research, state.blueprints, 'human', currentPlanet.buildings) || s;
                const dAtk = st.atk - s.atk;
                const dShd = st.shd - s.shd;
                const dHull = st.hull - s.hull;
                const dSpeed = st.speed - s.speed;
                const driveNames = { combustion: 'Combustión', impulse: 'Impulso', hyperspace: 'Hiperespacio' };
                return (
                  <div className="grid grid-cols-2 gap-1 text-xs mb-2 text-slate-400">
                    <div title={`Base: ${s.atk} | +${((state.research.weapons || 0) * 10)}% por Tecnología de Armas Nv${state.research.weapons || 0}`}>
                      ⚔️ Atk: <span className="text-slate-200">{s.atk}</span>
                      {dAtk > 0 && <span className="text-emerald-400 font-bold ml-1">+{dAtk.toFixed(0)}</span>}
                    </div>
                    <div title={`Base: ${s.shd} | +${((state.research.shields || 0) * 10)}% por Tecnología de Escudos Nv${state.research.shields || 0}`}>
                      🛡️ Shd: <span className="text-slate-200">{s.shd}</span>
                      {dShd > 0 && <span className="text-emerald-400 font-bold ml-1">+{dShd.toFixed(0)}</span>}
                    </div>
                    <div title={`Base: ${s.hull} | +${((state.research.armour || 0) * 8)}% por Tecnología de Blindaje Nv${state.research.armour || 0}`}>
                      💪 Hull: <span className="text-slate-200">{s.hull}</span>
                      {dHull > 0 && <span className="text-emerald-400 font-bold ml-1">+{dHull.toFixed(0)}</span>}
                    </div>
                    <div title={s.drive ? `Base: ${s.speed} | +${((state.research[s.drive] || 0) * (s.drive === 'combustion' ? 10 : s.drive === 'impulse' ? 20 : s.drive === 'hyperspace' ? 30 : 0))}% por Motor de ${driveNames[s.drive] || s.drive} Nv${state.research[s.drive] || 0}` : ''}>
                      🚀 Vel: <span className="text-slate-200">{fmt(s.speed)}</span>
                      {dSpeed > 0 && <span className="text-emerald-400 font-bold ml-1">+{fmt(dSpeed)}</span>}
                    </div>
                    <div>📦 Cargo: <span className="text-slate-200">{fmt(s.cargo)}</span></div>
                    <div>⛽ Fuel: <span className="text-slate-200">{s.fuel}/h</span></div>
                    <div className="col-span-2 flex gap-1 flex-wrap">
                      {s.drive && <span className={`text-[10px] px-1 rounded ${s.drive === 'hyperspace' ? 'bg-purple-500/20 text-purple-300' : s.drive === 'impulse' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>{driveNames[s.drive] || s.drive}</span>}
                      {s.rapid && <span className="text-[10px] px-1 rounded bg-red-500/20 text-red-300" title={Object.entries(s.rapid).map(([k, v]) => `x${v} contra ${SHIPS[k]?.name || k}`).join(', ')}>⚡ Fuego Rápido x{Object.values(s.rapid).reduce((a, b) => a + b, 0)}</span>}
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-1 mb-3 text-xs">
                {cost.metal > 0 && <div className="flex justify-between"><span className="text-amber-400">⛏️ Metal</span><span>{fmt(cost.metal)}</span></div>}
                {cost.crystal > 0 && <div className="flex justify-between"><span className="text-cyan-400">💎 Cristal</span><span>{fmt(cost.crystal)}</span></div>}
                {cost.deuterium > 0 && <div className="flex justify-between"><span className="text-emerald-400">⚗️ Deuterio</span><span>{fmt(cost.deuterium)}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">⏱️ Tiempo</span><span className="text-cyan-400">{fmtTime(time)}</span></div>
              </div>
              <div className="flex gap-1 mt-auto">
                {[1, 5, 10].map(q => (
                  <button key={q} onClick={() => dispatch({ type: 'START_SHIP', shipId: id, quantity: q })}
                    disabled={!canAfford(currentPlanet.resources, shipCost(id, q, currentPlanet.buildings?.constructionCenter || 0)) || !meets}
                    className={`flex-1 ${S.btn} text-xs ${canAfford(currentPlanet.resources, shipCost(id, q, currentPlanet.buildings?.constructionCenter || 0)) && meets ? S.btnPrimary : S.btnGhost}`}>
                    +{q}
                  </button>
                ))}
                <button onClick={() => {
                  const maxAfford = Math.max(1, Math.floor(Math.min(
                    (currentPlanet.resources.metal / (s.cost.m * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                    (currentPlanet.resources.crystal / (s.cost.c * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1)),
                    (currentPlanet.resources.deuterium / ((s.cost.d || 0) * constructionDiscount(currentPlanet.buildings?.constructionCenter || 0) || 1))
                  )));
                  if (maxAfford > 0) dispatch({ type: 'START_SHIP', shipId: id, quantity: maxAfford });
                }} disabled={!meets} className={`${S.btn} text-xs ${S.btnGhost}`}>
                  MAX
                </button>
              </div>
              {s.req && !meets && <div className="text-xs text-red-400 mt-2">Requiere: {Object.entries(s.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} ${v}`).join(', ')}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShipyardPage;
