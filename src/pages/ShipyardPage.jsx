import React, { useState } from 'react';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SafeImg } from '../assets.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { ShipyardQueueSection } from '../components/shipyard/ShipyardQueueSection.jsx';
import { ShipProductionCard } from '../components/shipyard/ShipProductionCard.jsx';

const ShipyardPage = ({ state, dispatch, currentPlanet, production, SHIPS, RESEARCH, BUILDINGS, S, CardBanner, ProgressBar, fmt, fmtTime, shipTimeBonus, shipCost, calcShipTime, meetsReq, getShipStats, canAfford, constructionDiscount, GAME_SPEED, onOpenCodex }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [shipCat, setShipCat] = useState('civil');
  const [driveFilter, setDriveFilter] = useState('all');
  const bonus = shipTimeBonus(currentPlanet.buildings);

  if (!currentPlanet.buildings.shipyard) {
    return (
      <div className={`${S.card} text-center py-12 view-enter max-w-xl mx-auto space-y-6`}>
        <div className="text-6xl mb-2">🚀</div>
        <h3 className="text-xl font-bold">Astillero Naval Requerido</h3>
        <p className="text-slate-400 text-sm">Construye un Astillero en el Complejo de Obras para iniciar la manufactura de naves espaciales.</p>
        <div className="pt-2">
          <ActionCardTile
            type="back"
            title="Volver al Alto Mando"
            subtitle="Regresar al Alto Mando"
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

  const categories = [
    { key: 'civil', title: 'Naves Civiles', icon: '📦', assetId: 'smallCargo', subtitle: 'Cargueros, naves colonizadoras, recicladores y sondas de espionaje' },
    { key: 'military', title: 'Flota Militar', icon: '⚔️', assetId: 'battleship', subtitle: 'Cazas ligeros, cruceros de asalto, destructores y acorazados estelares' },
    { key: 'ammo', title: 'Munición y Despliegue', icon: '☄️', assetId: 'missileSilo', subtitle: 'Satélites solares, cápsulas orbitales y cargas tácticas' },
  ];

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Flota Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Astillero Naval"
        breadcrumbIcon="🚀"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#05070f]/70 border border-white/10 text-xs font-mono">
              <span className="text-cyan-400">Total Hangar:</span>
              <span className="font-bold text-white">{fmt(fleetSummary.totalCount)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs font-mono">
              <span className="text-rose-400">Ataque:</span>
              <span className="font-bold text-rose-300">{fmt(fleetSummary.totalAtk)}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
              <span className="text-emerald-400">Defensa:</span>
              <span className="font-bold text-emerald-300">{fmt(fleetSummary.totalDef)}</span>
            </div>
            {shipQueues.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono">
                <span className="text-slate-400">Ensamblando:</span>
                <span className="font-bold text-amber-300">{shipQueues.length}/5</span>
              </div>
            )}
          </div>
        }
      />

      {/* Cola de Producción Activa (Componente Modular) */}
      <ShipyardQueueSection
        shipQueues={shipQueues}
        customShipQueue={(state.customShipQueue || []).filter(item => item.planetId === currentPlanet.id)}
        blueprints={state.blueprints || []}
        SHIPS={SHIPS}
        fmt={fmt}
        fmtTime={fmtTime}
        ProgressBar={ProgressBar}
        dispatch={dispatch}
      />

      {/* Selector de Divisiones Navales en Grid Responsivo con Tarjeta Consola Central al Final */}
      <div className="w-full space-y-3 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
          {categories.map(c => {
            const isSelected = shipCat === c.key;
            const count = Object.entries(SHIPS).filter(([, s]) => s.cat === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => {
                  setShipCat(c.key);
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.02]'
                    : 'bg-[#090d1f]/90 border-white/10 hover:border-cyan-400/60 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                }`}
              >
                {/* Banner de Imagen Superior Grande */}
                <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
                  <SafeImg
                    id={c.assetId}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                    isSelected
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-black/60 border-white/10 text-slate-400'
                  }`}>
                    DIVISIÓN NAVAL
                  </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                      {c.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                    <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                      {isSelected ? '● Hangar Activo' : `${count} Modelos`}
                    </span>
                    <span className={`transition-transform duration-200 ${isSelected ? 'text-cyan-300 translate-x-1' : 'text-cyan-400/70 group-hover:translate-x-1'}`}>
                      ➔
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Carrusel / Grid de Naves con Filtros por Propulsión y Motor */}
      <div className="w-full space-y-3 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{categories.find(c => c.key === shipCat)?.icon || '🚀'}</span>
            <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase">
              Línea de Ensamblaje — {categories.find(c => c.key === shipCat)?.title || 'Categoría'}
            </h3>
          </div>

          {/* Filtro por Rango de Motor y Alcance */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="text-slate-500 mr-1 hidden sm:inline">Propulsión:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'combustion', label: '🔥 Sistémicos (Combustión)' },
              { id: 'impulse', label: '💨 Sectoriales (Impulso)' },
              { id: 'hyperspace', label: '🌀 Interestelares (Hiperespacio)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDriveFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                  driveFilter === f.id
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {(() => {
          const bonus = (shipTimeBonus ? shipTimeBonus(currentPlanet?.buildings) : 1) * (currentPlanet?.specialization === 'military' ? 1.20 : 1.0);
          const filteredShips = Object.entries(SHIPS)
            .filter(([, s]) => s.cat === shipCat)
            .filter(([, s]) => driveFilter === 'all' || s.drive === driveFilter);

          if (filteredShips.length === 0) {
            return (
              <div className="p-8 text-center rounded-2xl bg-[#05070f]/50 border border-white/5 text-slate-500 text-xs font-mono">
                No hay modelos de esta división naval con el motor seleccionado.
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
              {filteredShips.map(([id, s]) => (
                <ShipProductionCard
              key={id}
              id={id}
              s={s}
              currentPlanet={currentPlanet}
              state={state}
              meetsReq={meetsReq}
              canAfford={canAfford}
              shipCost={shipCost}
              calcShipTime={calcShipTime}
              getShipStats={getShipStats}
              constructionDiscount={constructionDiscount}
              GAME_SPEED={GAME_SPEED}
              bonus={bonus}
              CardBanner={CardBanner}
              S={S}
              fmt={fmt}
              fmtTime={fmtTime}
              onOpenCodex={onOpenCodex}
              dispatch={dispatch}
              RESEARCH={RESEARCH}
              BUILDINGS={BUILDINGS}
            />
          ))}
        </div>
      );
    })()}
      </div>
    </div>
  );
};

export default ShipyardPage;
