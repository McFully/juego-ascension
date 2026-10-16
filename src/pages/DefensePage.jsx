import React from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { DefenseQueueSection } from '../components/defense/DefenseQueueSection.jsx';
import { DefenseGrid } from '../components/defense/DefenseGrid.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { ORDNANCE_BATCHES } from '../reducers/fleet/missileReducer.js';

const DefensePage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  DEFENSES,
  MISSILES,
  RESEARCH,
  S,
  CardBanner,
  ProgressBar,
  fmt,
  fmtTime,
  shipTimeBonus,
  defenseCost,
  calcDefenseTime,
  meetsReq,
  getDefenseStats,
  getEffectiveTech,
  canAfford,
  constructionDiscount,
  GAME_SPEED,
  onOpenCodex
}) => {
  const { navigateBack } = useNavigation();
  const bonus = (shipTimeBonus ? shipTimeBonus(currentPlanet?.buildings) : 1) * (currentPlanet?.specialization === 'military' ? 1.20 : 1.0);

  const hasShipyardFacility = Boolean(currentPlanet?.buildings?.shipyard || (currentPlanet?.isExchangePlanet && (currentPlanet?.buildings?.exchangeBastion || currentPlanet?.buildings?.exchangeDocks)));

  if (!hasShipyardFacility) {
    return (
      <div className={`${S.card} text-center py-12 view-enter max-w-xl mx-auto space-y-6`}>
        <div className="text-6xl mb-2">🛡️</div>
        <h3 className="text-xl font-bold">Instalaciones Defensivas Requeridas</h3>
        <p className="text-slate-400 text-sm">Construye un Astillero (o Bastión de Seguridad en la Lonja) para activar el bastión defensivo de superficie.</p>
      </div>
    );
  }

  const defQueues = (state.defenseQueue || []).filter(item => item.planetId === currentPlanet.id);

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

  const disc = constructionDiscount ? constructionDiscount(currentPlanet?.buildings?.constructionCenter || 0) : 1;
  const arsenal = currentPlanet?.arsenal || { heavyMissiles: 100, kineticShells: 500, plasmaCells: 250 };

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Bastión Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Defensas Planetarias"
        breadcrumbIcon="🛡️"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs font-mono" title="Polvorín Planetario: Reserva de munición balística y plasma">
              <span className="text-amber-300">💣 Polvorín:</span>
              <span className="text-white font-bold">🚀{arsenal.heavyMissiles ?? 100}</span>
              <span className="text-slate-400">|</span>
              <span className="text-amber-200">🎯{arsenal.kineticShells ?? 500}</span>
              <span className="text-slate-400">|</span>
              <span className="text-cyan-300">🟣{arsenal.plasmaCells ?? 250}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs font-mono" title="Guarnición militar asignada a las defensas de superficie">
              <span className="text-purple-300">🎖️ Guarnición:</span>
              <span className="font-bold text-white">{fmt(Math.floor((currentPlanet.population || 1000) * 0.15))} soldados</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Baterías:</span>
              <span className="font-bold text-cyan-300">{defenseSummary.totalCount} uds</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs font-mono">
              <span className="text-slate-400">Potencia:</span>
              <span className="font-bold text-rose-300">⚔️ {fmt(defenseSummary.totalAtk)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
              <span className="text-slate-400">Escudos:</span>
              <span className="font-bold text-emerald-300">🛡️ {fmt(defenseSummary.totalDef)}</span>
            </div>
          </div>
        }
      />

      {/* Polvorín Planetario y Fábrica de Munición Balística */}
      <div className="bg-[#090d1f]/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <span>💣</span>
              <span>Polvorín Planetario y Suministro Balístico</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Las baterías defensivas y flotas consumen munición real en combate. Si el polvorín se agota, caen en Silencio Balístico (20% daño).
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-500/30 text-amber-200">
            💰 Tesoro Imperial: <strong className="text-white">{fmt(state.credits ?? 0)} Cr</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(ORDNANCE_BATCHES).map((spec) => {
            const currentStock = arsenal[spec.id] ?? 0;
            const cost = {
              metal: Math.floor(spec.cost.metal * disc),
              crystal: Math.floor(spec.cost.crystal * disc),
              deuterium: Math.floor(spec.cost.deuterium * disc),
            };
            const affordable = canAfford(currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 }, cost) && (state.credits ?? 0) >= spec.creditsCost;

            return (
              <div key={spec.id} className="bg-[#060916] border border-white/10 hover:border-amber-400/40 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all">
                {/* Bloque 1: Situación Actual */}
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{spec.icon}</span>
                      <span>{spec.name}</span>
                    </span>
                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded ${currentStock > 20 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/60 text-rose-300 border border-rose-500/40 animate-pulse'}`}>
                      Reserva: {fmt(currentStock)} uds
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Uso: {spec.usedBy}</span>
                    <span className="text-emerald-400 font-bold">Lote: +{spec.batchSize} uds</span>
                  </div>
                </div>

                {/* Bloque 2: Censo y Logística de Artillería */}
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-300">👷 Artilleros de Polvorín:</span>
                  <span className="text-white font-bold">25 operarios / lote</span>
                </div>

                {/* Bloque 3: Costes y Fabricación */}
                <div className="space-y-2 pt-1 border-t border-white/5">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono">
                    <span className="text-amber-300">⛏️ {fmt(cost.metal)}</span>
                    <span className="text-cyan-300">💎 {fmt(cost.crystal)}</span>
                    <span className="text-emerald-300">⚗️ {fmt(cost.deuterium)}</span>
                    <span className="text-yellow-300 font-bold">💰 {spec.creditsCost} Cr</span>
                  </div>
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => dispatch({ type: 'BUILD_ORDNANCE', planetId: currentPlanet.id, ammoType: spec.id, batches: 1 })}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      affordable
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/60 text-slate-500 border border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    🔨 Fabricar +{spec.batchSize} {spec.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DefenseQueueSection defQueues={defQueues} DEFENSES={DEFENSES} fmt={fmt} fmtTime={fmtTime} ProgressBar={ProgressBar} dispatch={dispatch} />
      <DefenseGrid
        DEFENSES={DEFENSES}
        currentPlanet={currentPlanet}
        state={state}
        dispatch={dispatch}
        S={S}
        CardBanner={CardBanner}
        fmt={fmt}
        fmtTime={fmtTime}
        defenseCost={defenseCost}
        calcDefenseTime={calcDefenseTime}
        meetsReq={meetsReq}
        getDefenseStats={getDefenseStats}
        getEffectiveTech={getEffectiveTech}
        canAfford={canAfford}
        constructionDiscount={constructionDiscount}
        bonus={bonus}
        GAME_SPEED={GAME_SPEED}
        onOpenCodex={onOpenCodex}
        RESEARCH={RESEARCH}
        navigateBack={navigateBack}
      />
    </div>
  );
};

export default DefensePage;

