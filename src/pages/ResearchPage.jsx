import React, { useState } from 'react';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { SafeImg } from '../assets.jsx';
import { calcPlanetResearchTime } from '../core.jsx';

const ResearchPage = ({ state, dispatch, currentPlanet, production, fmt, RESEARCH, BUILDINGS, S, ItemCard, researchCost, calcResearchTime, meetsReq, researchEffectInfo, canAfford, GAME_SPEED, onOpenCodex }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [macroFilter, setMacroFilter] = useState('all'); // 'all', 'military', 'civil'

  const categories = [
    { key: 'power', title: '⚡ Energía', icon: '⚡', type: 'civil' },
    { key: 'propulsion', title: '🚀 Propulsión', icon: '🚀', type: 'military' },
    { key: 'weapon', title: '⚔️ Armamento', icon: '⚔️', type: 'military' },
    { key: 'defense', title: '🛡️ Defensa', icon: '🛡️', type: 'military' },
    { key: 'military', title: '🎯 Militar Avanzado', icon: '🎯', type: 'military' },
    { key: 'utility', title: '💻 Utilidad', icon: '💻', type: 'civil' },
    { key: 'economy', title: '💰 Economía', icon: '💰', type: 'civil' },
    { key: 'ai', title: '🧠 IA', icon: '🧠', type: 'civil' },
    { key: 'engineering', title: '⚙️ Ingeniería', icon: '⚙️', type: 'civil' },
    { key: 'exploration', title: '🌌 Exploración', icon: '🌌', type: 'civil' },
    { key: 'civics', title: '🏥 Cívicas', icon: '🏥', type: 'civil' },
    { key: 'government', title: '🏛️ Gobierno', icon: '🏛️', type: 'civil' },
    { key: 'logistics', title: '📦 Logística', icon: '📦', type: 'civil' },
    { key: 'computer', title: '🖥️ Computación', icon: '🖥️', type: 'civil' },
  ];
  const [resCat, setResCat] = useState('power');

  const filteredCategories = categories.filter(c => macroFilter === 'all' || c.type === macroFilter);

  if (!currentPlanet.buildings.researchLab) {
    return (
      <div className={`${S.card} text-center py-12 view-enter max-w-xl mx-auto space-y-6`}>
        <div className="text-6xl mb-2">🔬</div>
        <h3 className="text-xl font-bold">Laboratorio Requerido</h3>
        <p className="text-slate-400 text-sm">Construye un Laboratorio de Investigación en el Complejo de Obras para desbloquear el árbol científico.</p>
        <div className="pt-2">
          <ActionCardTile
            type="back"
            title="Volver a Ciencia"
            subtitle="Regresar a Ciencia"
            icon="◀"
            badgeText="VOLVER"
            onClick={() => {
              if (navigateBack) navigateBack();
              else if (navigateTo) navigateTo('overview');
            }}
          />
        </div>
      </div>
    );
  }

  // Active research in queue
  const activeResearchQueue = state.researchQueue || [];

  return (
    <div className="space-y-4 view-enter">
      {/* DOM Superior Estandarizado del Planeta (Recursos + Producción/h + Miga de Pan) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Investigación Científica"
        breadcrumbIcon="🔬"
      />

      {/* Banner de Laboratorio Central */}
      <section className="bg-[#05070f]/80 rounded-2xl border border-white/8 p-5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔬</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
              Laboratorio Central de Investigación
            </h2>
            <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">
              Árbol Tecnológico e Innovación Teórica
            </p>
          </div>
        </div>
        {activeResearchQueue.length > 0 && (
          <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <div className="text-xs">
              <span className="text-slate-400 font-mono">Investigando: </span>
              <span className="text-amber-300 font-bold">{RESEARCH[activeResearchQueue[0].researchId]?.name || activeResearchQueue[0].researchId} (Nv.{activeResearchQueue[0].level})</span>
            </div>
          </div>
        )}
      </section>

      {/* Macro Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setMacroFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 focus-ring-game ${macroFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'bg-black/30 text-slate-400 border border-white/8 hover:text-white hover:bg-white/5'}`}
        >
          <span>🌐</span>
          <span>Todas las Ramas</span>
        </button>
        <button
          onClick={() => { setMacroFilter('civil'); setResCat('power'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 focus-ring-game ${macroFilter === 'civil' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : 'bg-black/30 text-slate-400 border border-white/8 hover:text-white hover:bg-white/5'}`}
        >
          <span>🏛️</span>
          <span>Ciencias Civiles y Economía</span>
        </button>
        <button
          onClick={() => { setMacroFilter('military'); setResCat('weapon'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 focus-ring-game ${macroFilter === 'military' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]' : 'bg-black/30 text-slate-400 border border-white/8 hover:text-white hover:bg-white/5'}`}
        >
          <span>⚔️</span>
          <span>Tecnología Militar y Armamento</span>
        </button>
      </div>

      {/* Selector de Ramas Tecnológicas en Grid de 5 Columnas con Volver al Final */}
      <div className="w-full space-y-3 py-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
            <span>🔬</span>
            <span>Ramas Científicas</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full items-stretch pt-2 pb-4">
          {filteredCategories.map(c => {
            const isSelected = resCat === c.key;
            const count = Object.values(RESEARCH).filter(r => r.cat === c.key).length;
            const branchAsset = c.key === 'power' ? 'energy'
              : c.key === 'propulsion' ? 'impulse'
              : c.key === 'weapon' || c.key === 'military' ? 'weapons'
              : c.key === 'defense' ? 'shields'
              : c.key === 'utility' || c.key === 'computer' ? 'computer'
              : c.key === 'economy' ? 'galacticTrade'
              : c.key === 'ai' ? 'aiStrategy'
              : c.key === 'engineering' ? 'nanoTech'
              : c.key === 'exploration' ? 'astrophysics'
              : c.key === 'logistics' ? 'advLogistics'
              : 'researchLab';

            return (
              <button
                key={c.key}
                onClick={() => {
                  setResCat(c.key);
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
                    id={branchAsset}
                    category={c.key}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                    isSelected
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-black/60 border-white/10 text-slate-400'
                  }`}>
                    {c.type === 'military' ? 'Militar' : 'Civil'}
                  </span>
                </div>

                {/* Cuerpo de la Tarjeta */}
                <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {c.title.replace(/^[^\s]+\s/, '')}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                      Investigaciones teóricas y experimentales en {c.title.replace(/^[^\s]+\s/, '').toLowerCase()}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                    <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                      {isSelected ? '● Rama Activa' : `${count} Proyectos`}
                    </span>
                    <span className={`transition-transform duration-200 ${isSelected ? 'text-cyan-300 translate-x-1' : 'text-cyan-400/70 group-hover:translate-x-1'}`}>
                      ➔
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Tarjeta de Retorno a Pantalla Anterior como la ÚLTIMA TARJETA del grid */}
          <ActionCardTile
            type="back"
            title="Volver"
            subtitle="Regresar a la pantalla anterior"
            icon="◀"
            assetId="commandCenter"
            badgeText="VOLVER"
            onClick={() => {
              if (window.playSfx) window.playSfx('click');
              if (navigateBack) navigateBack();
              else if (navigateTo) navigateTo('overview');
            }}
          />
        </div>
      </div>

      {/* Grid de Proyectos Científicos */}
      {(() => {
        const items = Object.entries(RESEARCH).filter(([, r]) => r.cat === resCat);
        if (items.length === 0) {
          return (
            <div className="p-8 text-center rounded-2xl bg-[#05070f]/50 border border-white/5 text-slate-500 text-sm">
              Sin investigaciones disponibles en esta rama científica.
            </div>
          );
        }
        return (
          <div className="w-full space-y-3 py-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
                <span>{categories.find(c => c.key === resCat)?.icon || '🔬'}</span>
                <span>Proyectos Científicos — {categories.find(c => c.key === resCat)?.title || 'Rama Activa'}</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {items.length} Proyectos Disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
              {items.map(([id, r]) => {
                const queuedCount = (state.researchQueue || []).filter(q => q.researchId === id).length;
                const researchLvl = state.research[id] || 0;
                const meets = meetsReq(r.req, { ...currentPlanet.buildings, ...state.research });
                const lvl = researchLvl;
                const targetLvl = lvl + queuedCount;
                const nextLvl = targetLvl + 1;

                const cost = researchCost(id, targetLvl, state.research?.aiStrategy || 0, currentPlanet.buildings?.constructionCenter || 0);
                const time = calcPlanetResearchTime(state, currentPlanet, cost);
                const prodInfo = researchEffectInfo(id, targetLvl);
                const extraLines = [];
                if (r.req && !meets) {
                  extraLines.push(`🔒 Requiere: ${Object.entries(r.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} Nv.${v}`).join(', ')}`);
                }
                if (queuedCount > 0) {
                  extraLines.push(`⏳ En cola: +${queuedCount} nivel(es)`);
                }
                const allResearchItems = (state.researchQueue || []).filter(q => q.researchId === id);
                const activeResearchItem = allResearchItems[0] || null;
                return (
                  <div key={id} className="w-full h-full">
                    <ItemCard
                      id={id}
                      icon={r.icon}
                      name={r.name}
                      level={targetLvl}
                      cost={cost}
                      time={time}
                      canAfford={canAfford(currentPlanet.resources, cost)}
                      planetResources={currentPlanet?.resources}
                      isQueueFull={(state.researchQueue || []).length >= 8}
                      meetsRequirements={meets}
                      prodInfo={prodInfo}
                      onAction={() => dispatch({ type: 'START_RESEARCH', researchId: id, planetId: currentPlanet.id })}
                      actionLabel={`Investigar (Nv.${nextLvl})` }
                      extra={extraLines.join(' | ') || null}
                      onOpenCodex={onOpenCodex}
                      category={r.cat}
                      activeQueueItem={activeResearchItem}
                      queueItems={allResearchItems}
                      onCancelQueue={(queueId) => dispatch({ type: 'CANCEL_RESEARCH_QUEUE', queueId })}
                    />
                  </div>
                );
              })}
              {/* Tarjeta de Retorno a Ciencia como última casilla del grid */}
              <ActionCardTile
                type="back"
                title="Volver a Ciencia"
                subtitle="Regresar a Ciencia"
                badgeText="VOLVER"
                onClick={() => {
                  if (navigateBack) navigateBack();
                  else if (navigateTo) navigateTo('overview');
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ResearchPage;
