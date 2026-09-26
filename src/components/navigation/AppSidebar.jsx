import React, { useMemo } from 'react';

/**
 * AppSidebar — Command Tower Lateral de Élite.
 * Chasis militar oscuro con bahías tácticas, divisiones biseladas,
 * LEDs de estado activo, microbarras de telemetría y footer de reactor.
 */
export const AppSidebar = React.memo(({ visibleTabs, activeTab, onSelectTab, state, currentPlanet }) => {
  const quadrants = [
    { id: 'gov', title: 'GOBERNANZA', icon: '🪐' },
    { id: 'infra', title: 'INFRAESTRUCTURA', icon: '🔬' },
    { id: 'military', title: 'ALTO MANDO', icon: '⚔️' },
    { id: 'galaxy', title: 'GALAXIA', icon: '🌌' },
  ];

  // Telemetría en vivo del estado del imperio
  const indicators = useMemo(() => {
    if (!state || !currentPlanet) return {};
    const buildQueue = state.buildQueue || [];
    const researchQueue = state.researchQueue || [];
    const shipQueue = state.shipQueue || [];
    const defenseQueue = state.defenseQueue || [];

    return {
      buildings: { counter: buildQueue.length, status: buildQueue.length > 0 ? 'building' : null },
      research: { counter: researchQueue.length, status: researchQueue.length > 0 ? 'building' : null, progress: researchQueue.length > 0 ? Math.round((1 - (researchQueue[0]?.remainingTicks || 0) / (researchQueue[0]?.totalTicks || 1)) * 100) : null },
      shipyard: { counter: shipQueue.length, status: shipQueue.length > 0 ? 'building' : null },
      defense: { counter: defenseQueue.length, status: defenseQueue.length > 0 ? 'building' : null },
      fleet: { counter: Object.values(currentPlanet.fleet || {}).reduce((a, b) => a + b, 0) },
      missions: { counter: ((state.activeMissions || []).length + (state.fleetMissions || []).length) || null },
      communications: { 
        counter: (state.notifications || []).filter(n => !n.read && n.type !== 'success').length || (state.activeTransmission ? '!' : null),
        status: state.activeTransmission ? 'building' : null
      },
    };
  }, [state, currentPlanet]);

  const getIndicator = (tabId) => indicators[tabId] || {};

  return (
    <>
      {/* Desktop Command Tower Sidebar */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 bg-gradient-to-b from-[#060a16] via-[#080d1e] to-[#040711] border-r border-cyan-500/20 pt-2 pb-3 gap-0 pointer-events-auto overflow-y-auto max-h-[calc(100vh-4rem)] custom-scrollbar select-none shadow-[4px_0_24px_rgba(0,0,0,0.7)]"
        role="navigation"
        aria-label="Torre de mando del imperio"
      >
        {quadrants.map(q => {
          const qTabs = visibleTabs.filter(t => {
            if (t.quadrant !== q.id) return false;
            if (!t.parent) return true;
            const activeParent = visibleTabs.find(vt => vt.id === activeTab)?.parent;
            return activeTab === t.parent || activeTab === t.id || activeParent === t.parent;
          });
          if (qTabs.length === 0) return null;

          return (
            <div key={q.id} className="mb-2">
              {/* Encabezado de Bahía Militar */}
              <div className="px-3 py-1 flex items-center justify-between border-b border-white/5 mx-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs opacity-75">{q.icon}</span>
                  <span className="text-[9px] font-mono font-black uppercase tracking-[0.16em] text-cyan-400/80">
                    {q.title}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/30" />
              </div>

              {/* Botones tácticos de mando */}
              <div className="space-y-0.5 px-1.5">
                {qTabs.map(t => {
                  const isActive = activeTab === t.id;
                  const isChild = !!t.parent;
                  const ind = getIndicator(t.id);
                  const parts = t.label.split(' ');
                  const tabIcon = parts[0];
                  const tabName = parts.slice(1).join(' ');

                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTab(t.id)}
                      className={`
                        relative flex items-center gap-2.5 w-full text-left transition-all duration-200
                        ${isChild ? 'pl-6 pr-2.5 py-1.5 text-xs' : 'px-3 py-2 text-[12px]'}
                        rounded-xl border
                        ${isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                          : 'bg-[#05070f]/40 border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/10 font-medium'
                        }
                        focus-visible:outline-none focus-ring-game pointer-events-auto
                      `}
                      aria-current={isActive ? 'page' : undefined}
                      tabIndex={0}
                    >
                      {/* Indicador LED lateral activo */}
                      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-300 ${
                        isActive ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] scale-y-100' : 'bg-transparent scale-y-0'
                      }`} />

                      {/* Icono de la estación */}
                      <span className={`${isChild ? 'text-xs w-4' : 'text-base w-5'} text-center shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`}>
                        {tabIcon}
                      </span>

                      {/* Nombre con tipografía espacial */}
                      <span className="flex-1 truncate tracking-wide">
                        {tabName}
                      </span>

                      {/* Luz de actividad en curso */}
                      {ind.status === 'building' && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" title="Actividad en curso" />
                      )}

                      {/* Badge numérico de alerta o cola */}
                      {ind.counter > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-md bg-[#05070f] border border-cyan-500/40 text-[9px] font-bold text-cyan-300 font-mono shrink-0 shadow-inner">
                          {ind.counter > 99 ? '99+' : ind.counter}
                        </span>
                      )}

                      {/* Barra de progreso de laboratorio o construcción */}
                      {ind.progress != null && (
                        <div className="absolute bottom-0.5 left-7 right-3 h-[2px] bg-black/40 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style={{ width: `${ind.progress}%` }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Reactor Core Status Panel en la base del sidebar */}
        <div className="mt-auto pt-3 px-3 border-t border-white/5">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-center">
            <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 uppercase">
              <span>REACTOR NÚCLEO</span>
              <span className="text-emerald-400 font-bold">100% OPERATIVO</span>
            </div>
            <div className="w-full bg-[#05070f] h-1 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-full animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060a16]/98 border-t border-cyan-500/20 flex overflow-x-auto py-2 px-2 gap-1.5 pointer-events-auto backdrop-blur-xl">
        {visibleTabs.filter(t => {
          if (!t.parent) return true;
          const activeParent = visibleTabs.find(vt => vt.id === activeTab)?.parent;
          return activeTab === t.parent || activeTab === t.id || activeParent === t.parent;
        }).map(t => {
          const isActive = activeTab === t.id;
          const parts = t.label.split(' ');
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 pointer-events-auto transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <span>{parts[0]}</span>
              <span className="hidden sm:inline">{parts.slice(1).join(' ')}</span>
            </button>
          );
        })}
      </div>
    </>
  );
});
