import React, { useState } from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { DefenseStatsBanner } from '../components/defense/DefenseStatsBanner.jsx';
import { DefenseQueueSection } from '../components/defense/DefenseQueueSection.jsx';
import { DefenseGrid } from '../components/defense/DefenseGrid.jsx';
import { DefenseMissileSilosSection } from '../components/defense/DefenseMissileSilosSection.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

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
  const [defenseTab, setDefenseTab] = useState('surface'); // 'surface' | 'silos'
  const bonus = shipTimeBonus(currentPlanet.buildings);

  const siloLevel = currentPlanet.buildings?.missileSilo || 0;
  const maxMissiles = siloLevel * 10;
  const currentMissiles = currentPlanet.missiles || {};
  const totalUsed = Object.values(currentMissiles).reduce((a, b) => a + b, 0);
  const haveIPMs = currentMissiles.interplanetaryMissile || 0;
  const bonus = (shipTimeBonus ? shipTimeBonus(currentPlanet?.buildings) : 1) * (currentPlanet?.specialization === 'military' ? 1.20 : 1.0);

  if (!currentPlanet.buildings.shipyard && siloLevel < 1) {
    return (
      <div className={`${S.card} text-center py-12 view-enter max-w-xl mx-auto space-y-6`}>
        <div className="text-6xl mb-2">🛡️</div>
        <h3 className="text-xl font-bold">Instalaciones Defensivas Requeridas</h3>
        <p className="text-slate-400 text-sm">Construye un Astillero o un Silo de Misiles en el Complejo de Obras para activar el bastión defensivo.</p>
        <div className="pt-2">
          <ActionCardTile
            type="back"
            title="Volver"
            subtitle="Regresar a la pantalla anterior"
            icon="◀"
            badgeText="VOLVER"
            onClick={() => {
              if (navigateBack) navigateBack();
            }}
          />
        </div>
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

  const divisions = [
    {
      id: 'surface',
      name: 'Baterías de Superficie',
      desc: 'Cañones Gauss, láseres pesados y cúpulas de escudo planetario.',
      icon: '🛡️',
      assetId: 'globalShieldProj',
      countText: `${defenseSummary.totalCount} Baterías`,
      accent: 'emerald',
    },
    {
      id: 'silos',
      name: 'Silos de Misiles',
      desc: 'Misiles de intercepción y ojivas de crucero interplanetario.',
      icon: '🚀',
      assetId: 'missileSilo',
      countText: `${totalUsed}/${maxMissiles} Misiles`,
      accent: 'amber',
    },
  ];

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Silo Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Bastión Defensivo"
        breadcrumbIcon="🛡️"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Defensas:</span>
              <span className="font-bold text-cyan-300">{defenseSummary.totalCount} uds</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono">
              <span className="text-slate-400">Silo:</span>
              <span className="font-bold text-amber-300">{totalUsed}/{maxMissiles}</span>
            </div>
          </div>
        }
      />

      {/* Selector de Divisiones Defensivas */}
      <div className="w-full space-y-3 py-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>🛡️</span>
            <span>Bastión Defensivo Planetario</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full items-stretch pt-2 pb-4">
          {divisions.map((div) => {
            const isSelected = defenseTab === div.id;
            return (
              <button
                key={div.id}
                onClick={() => {
                  setDefenseTab(div.id);
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[220px] ${
                  isSelected
                    ? 'border-emerald-400 bg-gradient-to-b from-[#091f1a] to-[#040810] shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.02]'
                    : 'border-white/10 bg-[#090d1f]/90 hover:border-emerald-500/50 hover:bg-[#0e1633] hover:scale-[1.01]'
                }`}
              >
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-3xl">{div.icon}</span>
                      <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors">
                        {div.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-2">
                      {div.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                      {div.countText}
                    </span>
                    <span className="text-emerald-400 font-bold">➔</span>
                  </div>
                </div>
              </button>
            );
          })}

          <ActionCardTile
            type="back"
            title="Volver"
            subtitle="Regresar a la pantalla anterior"
            icon="◀"
            assetId="commandCenter"
            badgeText="VOLVER"
            onClick={() => {
              if (navigateBack) navigateBack();
            }}
          />
        </div>
      </div>

      {defenseTab === 'surface' ? (
        <>
          <DefenseStatsBanner defenseSummary={defenseSummary} fmt={fmt} />
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
        </>
      ) : (
        <DefenseMissileSilosSection
          siloLevel={siloLevel}
          currentMissiles={currentMissiles}
          totalUsed={totalUsed}
          maxMissiles={maxMissiles}
          haveIPMs={haveIPMs}
          MISSILES={MISSILES}
          currentPlanet={currentPlanet}
          constructionDiscount={constructionDiscount}
          canAfford={canAfford}
          dispatch={dispatch}
          fmt={fmt}
          S={S}
          onOpenCodex={onOpenCodex}
        />
      )}
    </div>
  );
};

export default DefensePage;
