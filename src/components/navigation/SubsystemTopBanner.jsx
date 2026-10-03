import React from 'react';
import { ResourceBreakdownTooltip } from '../ui/ResourceBreakdownTooltip.jsx';
import { useNavigation } from './NavigationContext.jsx';
import { SafeImg } from '../../assets.jsx';

export const SubsystemTopBanner = ({
  state,
  currentPlanet,
  production,
  fmt,
  breadcrumbTitle,
  breadcrumbIcon = '🚀',
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
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl mb-4">
      {/* === SECTOR IZQUIERDO: DIVIDIDO EN 2 FILAS (ARRIBA RECURSOS, ABAJO EXPLORADOR) === */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* FILA SUPERIOR: Recursos (Metal, Cristal, Deuterio, Energía, Reputación) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 overflow-visible bg-black/40 rounded-tl-2xl">
          {/* Metal */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
            <span className="text-xl shrink-0">⛏️</span>
            <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
              <span className="font-black text-amber-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.metal || 0) : (currentPlanet?.resources?.metal || 0)}
              </span>
              {production?.metal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold tabular-nums">
                  +{fmt ? fmt(production.metal) : production.metal}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block">
              <ResourceBreakdownTooltip
                resourceType="metal"
                breakdown={production?.breakdown}
                currentAmount={currentPlanet?.resources?.metal}
                prodVal={production?.metal}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Cristal */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
            <span className="text-xl shrink-0">💎</span>
            <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
              <span className="font-black text-cyan-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.crystal || 0) : (currentPlanet?.resources?.crystal || 0)}
              </span>
              {production?.crystal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold tabular-nums">
                  +{fmt ? fmt(production.crystal) : production.crystal}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block">
              <ResourceBreakdownTooltip
                resourceType="crystal"
                breakdown={production?.breakdown}
                currentAmount={currentPlanet?.resources?.crystal}
                prodVal={production?.crystal}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Deuterio */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[130px] sm:min-w-[145px]">
            <span className="text-xl shrink-0">⚗️</span>
            <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
              <span className="font-black text-emerald-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.deuterium || 0) : (currentPlanet?.resources?.deuterium || 0)}
              </span>
              {production?.deuterium !== undefined && (
                <span className="text-xs text-emerald-400 font-bold tabular-nums">
                  +{fmt ? fmt(production.deuterium) : production.deuterium}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block">
              <ResourceBreakdownTooltip
                resourceType="deuterium"
                breakdown={production?.breakdown}
                currentAmount={currentPlanet?.resources?.deuterium}
                prodVal={production?.deuterium}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Escoria Industrial */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[115px] sm:min-w-[130px]">
            <span className="text-xl shrink-0">🪨</span>
            <div className="flex items-baseline gap-1.5 leading-none tabular-nums">
              <span className="font-black text-orange-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.slag || 0) : (currentPlanet?.resources?.slag || 0)}
              </span>
              {production?.slagNet !== undefined && (
                <span className={`text-xs font-bold tabular-nums ${(production.slagNet || 0) <= 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {(production.slagNet || 0) > 0 ? `+${fmt ? fmt(production.slagNet) : production.slagNet}` : (fmt ? fmt(production.slagNet || 0) : (production.slagNet || 0))}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block z-[100]">
              <ResourceBreakdownTooltip
                resourceType="slag"
                breakdown={production?.breakdown}
                currentAmount={currentPlanet?.resources?.slag}
                prodVal={production?.slagNet}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Energía */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0 min-w-[90px] sm:min-w-[105px]">
            <span className="text-xl shrink-0">⚡</span>
            <div className="flex items-baseline leading-none tabular-nums">
              <span className="font-black text-yellow-400 text-base md:text-lg">
                {((production?.energyBalance ?? 0) >= 0 ? '+' : '')}{fmt ? fmt(production?.energyBalance ?? 0) : (production?.energyBalance ?? 0)}
              </span>
            </div>
            <div className="hidden group-hover/res:block">
              <ResourceBreakdownTooltip
                resourceType="energy"
                breakdown={production?.breakdown}
                currentAmount={production?.energyBalance}
                prodVal={production?.energyBalance}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Reputación */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Reputación Imperial">
            <span className="text-xl">🎖️</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-purple-400 text-base md:text-lg">
                {((Math.round(state?.reputation || 0)) > 0 ? '+' : '')}{Math.round(state?.reputation || 0)}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-purple-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(168,85,247,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center gap-2 border-b border-purple-500/30 pb-1.5 mb-2 font-bold text-white">
                  <span className="text-base">🎖️</span>
                  <span>Reputación Imperial Global</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Refleja el prestigio diplomático, comercial y la lealtad de la ciudadanía hacia el Imperio.
                </p>
                <div className="mt-2 pt-2 border-t border-purple-500/20 flex justify-between items-center text-[10px] text-purple-300 font-bold">
                  <span>Nivel de Prestigio</span>
                  <span>{Math.round(state?.reputation || 0)} Puntos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: Explorador de Rutas y Breadcrumb del Módulo */}
        <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-bl-2xl">
          <button
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

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <span className="text-base">{breadcrumbIcon}</span>
            <span>{breadcrumbTitle}</span>
          </div>
        </div>
      </div>

      {/* === LÍNEA DIVISORIA VERTICAL COMPLETA === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === SECTOR DERECHO: CONTEXTUAL DE PANTALLA + BOTÓN VOLVER A ALTO MANDO === */}
      <div className="flex items-stretch justify-between xl:justify-end bg-black/50 border-t xl:border-t-0 border-white/10 shrink-0">
        {rightSlot && (
          <div className="flex items-center px-3 py-2">
            {rightSlot}
          </div>
        )}

        {showBackToAltoMando && (
          <>
            {rightSlot && <div className="w-[1px] bg-white/15 self-stretch" />}
            <div className="flex items-stretch justify-center shrink-0 w-full xl:w-56 min-w-[190px]">
              <button
                type="button"
                onClick={handleBackToAltoMando}
                className="relative w-full h-full min-h-[58px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
                title={`Volver a ${backButtonLabelBottom}`}
              >
                {/* Imagen de fondo con SafeImg */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <SafeImg
                    id="historicImperialArchive"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-purple-950/20 group-hover:bg-purple-500/10 transition-colors duration-300" />
                </div>

                {/* Contenido frontal maximizado a todo el ancho */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
                  <span className="w-full text-center text-xs sm:text-sm font-mono font-black uppercase tracking-[0.18em] text-purple-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors whitespace-nowrap">
                    {backButtonLabelTop}
                  </span>
                  <span className="w-full text-center text-sm sm:text-base font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide group-hover:text-purple-100 transition-colors flex items-center justify-center gap-1.5 mt-1 whitespace-nowrap">
                    <span className="text-base shrink-0">{backButtonIcon}</span>
                    <span className="whitespace-nowrap">{backButtonLabelBottom}</span>
                  </span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
