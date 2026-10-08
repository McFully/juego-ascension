import React from 'react';
import { useNavigation } from './NavigationContext.jsx';
import { TacticalResourceRow } from '../ui/TacticalResourceRow.jsx';
import { IndependentReturnCard } from './IndependentReturnCard.jsx';

export const SubsystemTopBanner = ({
  state,
  currentPlanet,
  production,
  fmt,
  breadcrumbTitle,
  breadcrumbIcon = '🚀',
  breadcrumbs = null, // Array opcional de items: [{ label, icon, onClick, active }]
  rightSlot = null,
  showBackToAltoMando = true,
  onBackToAltoMando = null,
  backButtonLabelTop = 'VOLVER A',
  backButtonLabelBottom = 'Alto Mando',
  backButtonIcon = '👑',
  parentHub = 'auto' // 'auto' | 'government' | 'imperial_hub'
}) => {
  const { navigateTo, activeView } = useNavigation();

  // Determinar si la pantalla actual pertenece a la rama de Mando Imperial o Alto Mando
  const isImperialBranch = parentHub === 'imperial_hub' || (
    parentHub === 'auto' && (
      backButtonLabelBottom?.toLowerCase().includes('mando imperial') ||
      activeView === 'missions' ||
      activeView === 'diplomacy' ||
      activeView === 'combat' ||
      activeView === 'stats' ||
      activeView === 'wiki' ||
      activeView === 'shipDesign' ||
      activeView === 'colony_network' ||
      activeView === 'imperial_council' ||
      activeView === 'imperial_senate'
    )
  );

  const handleBackToAltoMando = () => {
    if (window.playSfx) window.playSfx('click');
    if (onBackToAltoMando) {
      onBackToAltoMando();
    } else if (navigateTo) {
      navigateTo(isImperialBranch ? 'imperial_hub' : 'government');
    }
  };

  return (
    <div className="relative z-30 flex flex-col xl:flex-row items-stretch gap-3 mb-4 w-full">
      {/* === DOM SUPERIOR: 2 FILAS CON SEPARADOR HORIZONTAL Y ANCHO COMPLETO === */}
      <section className="flex-1 min-w-0 bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl flex flex-col justify-between">
        {/* FILA SUPERIOR: Fila unificada de recursos tácticos (sin la palabra créditos) */}
        <div className="w-full overflow-x-auto">
          <TacticalResourceRow
            resources={currentPlanet?.resources}
            production={production}
            currentPlanet={currentPlanet}
            state={state}
            fmt={fmt}
            className="rounded-t-2xl overflow-visible border-b-0 w-full"
          />
        </div>

        {/* Separador Horizontal */}
        <div className="w-full h-[1px] bg-white/10" />

        {/* FILA INFERIOR: Explorador de Rutas y Breadcrumb del Módulo */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-black/20 rounded-b-2xl flex-wrap min-h-[44px]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                if (navigateTo) navigateTo('overview');
              }}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-bold cursor-pointer"
              title="Ir a Vista General del Imperio"
            >
              <span>⚜️</span>
              <span>Imperio</span>
            </button>

            <span className="text-slate-600 font-bold text-sm">/</span>

            {isImperialBranch ? (
              /* Rama Imperial: Directo a Mando Imperial (sin planeta local) */
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'command_hub' } }));
                    }
                    if (navigateTo) navigateTo('overview');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                  title="Ir a Mando Imperial"
                >
                  <span className="text-base">👑</span>
                  <span>Mando Imperial</span>
                </button>
              </>
            ) : (
              /* Rama Planetaria: Planeta local -> Alto Mando */
              <>
                {/* Botón directo a Mundos del Imperio */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    try {
                      if (typeof window !== "undefined") {
                        window.sessionStorage.setItem("ascension_target_section", "planets");
                      }
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets' } }));
                    } catch (_) {}
                    if (navigateTo) navigateTo('overview');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 font-bold text-xs transition-all cursor-pointer"
                  title="Volver a Mundos del Imperio"
                >
                  <span className="text-sm">🌍</span>
                  <span>Mundos del Imperio</span>
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>

                {/* Etiqueta del Planeta Sede del Alto Mando interactiva */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    const planetName = currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || '';
                    try {
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets', filter: planetName } }));
                    } catch (_) {}
                    if (navigateTo) navigateTo('overview');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer"
                  title="Ver este mundo en el Catálogo de Mundos del Imperio"
                >
                  <span className="text-sm">🪐</span>
                  <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
                  {currentPlanet?.galaxy !== undefined && (
                    <span className="text-cyan-400 font-mono text-[11px] font-black">
                      [{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}]
                    </span>
                  )}
                </button>

                <span className="text-slate-600 font-bold text-sm">/</span>

                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    if (navigateTo) navigateTo('government');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                  title="Ir al Alto Mando"
                >
                  <span className="text-base">👑</span>
                  <span>Alto Mando</span>
                </button>
              </>
            )}

            <span className="text-slate-600 font-bold text-sm">/</span>

            {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-600 font-bold text-sm">/</span>}
                  {crumb.onClick && !crumb.active ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.playSfx) window.playSfx('click');
                        crumb.onClick();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                      title={crumb.label}
                    >
                      {crumb.icon && <span className="text-base">{crumb.icon}</span>}
                      <span>{crumb.label}</span>
                    </button>
                  ) : (
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)] ${
                      crumb.badge 
                        ? 'bg-amber-950/50 border-amber-500/40 text-amber-300' 
                        : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    }`}>
                      {crumb.icon && <span className="text-base">{crumb.icon}</span>}
                      <span>{crumb.label}</span>
                    </div>
                  )}
                </React.Fragment>
              ))
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
                <span className="text-base">{breadcrumbIcon}</span>
                <span>{breadcrumbTitle}</span>
              </div>
            )}
          </div>

          {rightSlot && (
            <div className="flex items-center ml-auto">
              {rightSlot}
            </div>
          )}
        </div>
      </section>

      {/* === TARJETA INDEPENDIENTE Y SEPARADA DE VOLVER ATRÁS === */}
      {showBackToAltoMando && (
        <div className="shrink-0 w-full xl:w-56 flex items-stretch">
          <IndependentReturnCard
            onClick={handleBackToAltoMando}
            labelTop={backButtonLabelTop}
            labelBottom={backButtonLabelBottom}
            icon={backButtonIcon}
            imgId="historicImperialArchive"
            accentColor={isImperialBranch ? 'purple' : 'cyan'}
          />
        </div>
      )}
    </div>
  );
};
