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
  backButtonIcon = '👑'
}) => {
  const { navigateTo } = useNavigation();

  const handleBackToAltoMando = () => {
    if (window.playSfx) window.playSfx('click');
    if (onBackToAltoMando) {
      onBackToAltoMando();
    } else if (navigateTo) {
      navigateTo('government');
    }
  };

  return (
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl mb-4">
      {/* === SECTOR IZQUIERDO: DIVIDIDO EN 2 FILAS (ARRIBA RECURSOS, ABAJO EXPLORADOR) === */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* FILA SUPERIOR: Recursos (Metal, Cristal, Deuterio, Energía, Reputación) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 overflow-visible bg-black/40 rounded-tl-2xl">
          {/* Metal */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⛏️</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-amber-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.metal || 0) : (currentPlanet?.resources?.metal || 0)}
              </span>
              {production?.metal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
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
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">💎</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-cyan-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.crystal || 0) : (currentPlanet?.resources?.crystal || 0)}
              </span>
              {production?.crystal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
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
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⚗️</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-emerald-400 text-base md:text-lg">
                {fmt ? fmt(currentPlanet?.resources?.deuterium || 0) : (currentPlanet?.resources?.deuterium || 0)}
              </span>
              {production?.deuterium !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
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

          {/* Energía */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⚡</span>
            <div className="flex items-baseline leading-none">
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

          {/* Etiqueta del Planeta Sede del Alto Mando */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-xs" title="Sede del Alto Mando">
            <span className="text-sm">🌍</span>
            <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
          </div>

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
            <div className="flex items-stretch justify-center shrink-0 w-full xl:w-48">
              <button
                type="button"
                onClick={handleBackToAltoMando}
                className="relative w-full h-full min-h-[58px] flex flex-col items-center justify-center px-0.5 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
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
                  <span className="w-full text-center text-lg sm:text-xl font-mono font-black uppercase tracking-[0.28em] text-purple-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors">
                    {backButtonLabelTop}
                  </span>
                  <span className="w-full text-center text-base sm:text-lg font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-purple-100 transition-colors flex items-center justify-center gap-1.5 mt-1">
                    <span className="text-base shrink-0">{backButtonIcon}</span>
                    <span className="truncate">{backButtonLabelBottom}</span>
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
