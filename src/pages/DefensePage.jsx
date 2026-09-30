import React from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { DefenseStatsBanner } from '../components/defense/DefenseStatsBanner.jsx';
import { DefenseQueueSection } from '../components/defense/DefenseQueueSection.jsx';
import { DefenseGrid } from '../components/defense/DefenseGrid.jsx';
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
  const bonus = (shipTimeBonus ? shipTimeBonus(currentPlanet?.buildings) : 1) * (currentPlanet?.specialization === 'military' ? 1.20 : 1.0);

  if (!currentPlanet.buildings.shipyard) {
    return (
      <div className={`${S.card} text-center py-12 view-enter max-w-xl mx-auto space-y-6`}>
        <div className="text-6xl mb-2">🛡️</div>
        <h3 className="text-xl font-bold">Instalaciones Defensivas Requeridas</h3>
        <p className="text-slate-400 text-sm">Construye un Astillero en el Complejo de Obras para activar el bastión defensivo de superficie.</p>
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

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Bastión Status) */}
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
    </div>
  );
};

export default DefensePage;
