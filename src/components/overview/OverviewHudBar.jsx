import React from 'react';
import { ResourceBreakdownTooltip } from "../ui/ResourceBreakdownTooltip.jsx";
import { ImperialTelemetryTicker } from "../navigation/ImperialTelemetryTicker.jsx";
import { SafeImg } from "../../assets.jsx";

/**
 * OverviewHudBar: Barra de telemetria, censo y recursos consolidada (HUD de 2 filas)
 * para la vista imperial de OverviewPage.
 */
export default function OverviewHudBar({
  hudVisible,
  imperialTotals,
  totalFleetMilitaryPower,
  state,
  fmt,
  allPlanetsAuto,
  somePlanetsAuto,
  setEmperorModalOpen,
  dispatch,
  handleOpenMenu,
  onOpenSettings
}) {
  if (!hudVisible) return null;

  return (
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl transition-all duration-300 animate-in fade-in">
      {/* Lado Izquierdo: Fila 1 Recursos con Separadores, Fila 2 Miga de Pan e Identidad */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Fila 1: Recursos con Separadores Verticales */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 py-2 border-b border-white/10 overflow-visible bg-black/40 rounded-tl-2xl">
          {/* Metal */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⛏️</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-amber-400 text-base md:text-lg">
                {fmt ? fmt(imperialTotals.metal) : imperialTotals.metal}
              </span>
              {imperialTotals.prodMetal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
                  +{fmt ? fmt(imperialTotals.prodMetal) : imperialTotals.prodMetal}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block z-[100]">
              <ResourceBreakdownTooltip
                resourceType="metal"
                breakdown={imperialTotals.breakdown}
                currentAmount={imperialTotals.metal}
                prodVal={imperialTotals.prodMetal}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Cristal */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">💎</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-cyan-400 text-base md:text-lg">
                {fmt ? fmt(imperialTotals.crystal) : imperialTotals.crystal}
              </span>
              {imperialTotals.prodCrystal !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
                  +{fmt ? fmt(imperialTotals.prodCrystal) : imperialTotals.prodCrystal}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block z-[100]">
              <ResourceBreakdownTooltip
                resourceType="crystal"
                breakdown={imperialTotals.breakdown}
                currentAmount={imperialTotals.crystal}
                prodVal={imperialTotals.prodCrystal}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Deuterio */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⚗️</span>
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="font-black text-emerald-400 text-base md:text-lg">
                {fmt ? fmt(imperialTotals.deuterium) : imperialTotals.deuterium}
              </span>
              {imperialTotals.prodDeuterium !== undefined && (
                <span className="text-xs text-emerald-400 font-bold">
                  +{fmt ? fmt(imperialTotals.prodDeuterium) : imperialTotals.prodDeuterium}
                </span>
              )}
            </div>
            <div className="hidden group-hover/res:block z-[100]">
              <ResourceBreakdownTooltip
                resourceType="deuterium"
                breakdown={imperialTotals.breakdown}
                currentAmount={imperialTotals.deuterium}
                prodVal={imperialTotals.prodDeuterium}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Energia */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0">
            <span className="text-xl">⚡</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-yellow-400 text-base md:text-lg">
                {((imperialTotals.energyBalance ?? 0) >= 0 ? '+' : '')}{fmt ? fmt(imperialTotals.energyBalance ?? 0) : (imperialTotals.energyBalance ?? 0)}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[100]">
              <ResourceBreakdownTooltip
                resourceType="energy"
                breakdown={imperialTotals.breakdown}
                currentAmount={imperialTotals.energyBalance}
                prodVal={imperialTotals.energyBalance}
              />
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Reputacion */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Reputacion Imperial Global">
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
                  <span className="text-purple-300 uppercase tracking-wider">Reputación Imperial</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rango Actual:</span>
                    <span className="font-bold text-white">{Math.round(state?.reputation || 0)} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estatus Diplomático:</span>
                    <span className="text-purple-300 font-bold">{(state?.reputation || 0) >= 0 ? 'Respetado' : 'Hostil'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                    La reputación imperial influye en acuerdos diplomáticos, comercio galáctico y obediencia ciudadana.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Poder Militar de Flota */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Poder Militar de Flotas Imperiales">
            <span className="text-xl">🚀</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-rose-400 text-base md:text-lg">
                {fmt ? fmt(totalFleetMilitaryPower) : totalFleetMilitaryPower}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-rose-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(244,63,94,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center gap-2 border-b border-rose-500/30 pb-1.5 mb-2 font-bold text-white">
                  <span className="text-base">🚀</span>
                  <span className="text-rose-300 uppercase tracking-wider">Poder Militar de Flota</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fuerza Ofensiva Total:</span>
                    <span className="font-bold text-rose-300">{fmt ? fmt(totalFleetMilitaryPower) : totalFleetMilitaryPower}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                    Suma ponderada de potencia de fuego, escudos y cascos de todas las naves en colonias y en misiones navales activas.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Censo Poblacional Imperial */}
          <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Censo Imperial Global">
            <span className="text-xl">👥</span>
            <div className="flex items-baseline leading-none">
              <span className="font-black text-teal-300 text-base md:text-lg">
                {fmt ? fmt(imperialTotals.totalPop || 0) : (imperialTotals.totalPop || 0)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono ml-1">
                / {fmt ? fmt(imperialTotals.totalMaxPop || 0) : (imperialTotals.totalMaxPop || 0)}
              </span>
            </div>
            <div className="hidden group-hover/res:block z-[120]">
              <div className="absolute top-full left-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-teal-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(20,184,166,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                <div className="flex items-center gap-2 border-b border-teal-500/30 pb-1.5 mb-2 font-bold text-white">
                  <span className="text-base">👥</span>
                  <span className="text-teal-300 uppercase tracking-wider">Censo Poblacional Imperial</span>
                </div>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Población Total:</span>
                    <span className="font-bold text-teal-300">{fmt ? fmt(imperialTotals.totalPop || 0) : imperialTotals.totalPop} hab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Capacidad Habitacional:</span>
                    <span className="font-bold text-white">{fmt ? fmt(imperialTotals.totalMaxPop || 0) : imperialTotals.totalMaxPop} hab</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ocupación Imperial:</span>
                    <span className="font-bold text-cyan-300">
                      {imperialTotals.totalMaxPop > 0 ? Math.min(100, Math.round((imperialTotals.totalPop / imperialTotals.totalMaxPop) * 100)) : 0}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                    Suma agregada de ciudadanos y capacidad residencial de todas las colonias del imperio.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-5 bg-white/15 shrink-0" />

          {/* Estado del Emperador en la Fila Superior */}
          <div className="shrink-0 ml-auto pl-2 flex items-center gap-2">
            {/* Badge indicador del Emperador en el Domo Superior */}
            <div 
              className={`border rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs ${
                allPlanetsAuto
                  ? 'bg-[#051c14]/90 border-emerald-500/50 text-emerald-300'
                  : somePlanetsAuto
                    ? 'bg-[#211604]/90 border-amber-500/50 text-amber-300'
                    : 'bg-[#050814]/90 border-white/20 text-slate-300'
              }`}
              title="Estado del sistema de gobernanza imperial"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {(allPlanetsAuto || somePlanetsAuto) && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allPlanetsAuto ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  allPlanetsAuto ? 'bg-emerald-400' : somePlanetsAuto ? 'bg-amber-400' : 'bg-slate-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap">
                {allPlanetsAuto ? '👑 EMPERADOR ACTIVO' : somePlanetsAuto ? '⚡ EMPERADOR PARCIAL' : '👤 MODO MANUAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Fila 2: Explorador de Navegacion e Identidad de Dominio + Telemetría Imperial debajo */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 flex-wrap bg-black/20">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-base">⚜️</span>
            <span>Imperio</span>
          </div>

          <div className="shrink-0 ml-auto flex items-center">
            <ImperialTelemetryTicker 
              variant="header"
              events={(state.history || state.logs || []).map((l, i) => ({
                id: i,
                text: typeof l === 'string' ? l : l.message || l.text || 'Operacion imperial ejecutada',
                time: l.timestamp || l.time || Date.now()
              }))} 
            />
          </div>
        </div>
      </div>

      {/* Separador vertical total */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* Lado Derecho: Activar/Desactivar Gobernanza, Ajustes y Menú Principal */}
      <div className="flex items-stretch justify-between xl:justify-end shrink-0 border-t xl:border-t-0 border-white/10 flex-wrap overflow-hidden rounded-r-2xl">
        
        {/* BOTÓN 1: ACTIVAR / DESACTIVAR GOBERNANZA (ABRE MODAL DE PROTOCOLO DEL EMPERADOR IA) */}
        <button
          type="button"
          onClick={() => {
            setEmperorModalOpen(true);
            if (window.playSfx) window.playSfx('click');
          }}
          className={`relative min-h-[58px] min-w-[135px] flex flex-col items-center justify-center px-3 py-1.5 border-r border-white/10 overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none shadow-none ${
            allPlanetsAuto
              ? 'bg-[#22070e] hover:bg-[#320a14]'
              : 'bg-[#051c14] hover:bg-[#072a1e]'
          }`}
          title="Configurar y gestionar la gobernanza del Emperador IA para el Imperio"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id={allPlanetsAuto ? "modeCancel" : "councilChamber"}
              className="w-full h-full object-cover object-center opacity-50 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
            />
            <div className={`absolute inset-0 transition-colors ${
              allPlanetsAuto ? 'bg-rose-950/40 group-hover:bg-rose-500/20' : 'bg-emerald-950/40 group-hover:bg-emerald-500/20'
            }`} />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center leading-tight">
            <span className={`text-xs font-mono font-black uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wider flex items-center gap-1 ${
              allPlanetsAuto ? 'text-rose-200 group-hover:text-white' : 'text-emerald-200 group-hover:text-white'
            }`}>
              <span>{allPlanetsAuto ? '🛑' : '👑'}</span>
              <span>{allPlanetsAuto ? 'Desactivar' : 'Activar'}</span>
            </span>
            <span className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 ${
              allPlanetsAuto ? 'text-rose-300/80' : 'text-emerald-300/80'
            }`}>
              {allPlanetsAuto ? 'Gobernanza Activa' : 'Gobernanza IA'}
            </span>
          </div>
        </button>

        {/* BOTÓN 2: AJUSTES */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="relative min-h-[58px] min-w-[135px] flex flex-col items-center justify-center px-3 py-1.5 border-r border-white/10 overflow-hidden bg-[#060a16] hover:bg-[#0c1630] transition-all duration-300 cursor-pointer group text-center select-none shadow-none"
          title="Ajustes de Sonido, Volúmenes y Partida"
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id="deepScanner"
              className="w-full h-full object-cover object-center opacity-45 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-cyan-950/20 transition-colors" />
          </div>
          <div className="relative z-10 flex items-center justify-center leading-tight">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-cyan-200 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <span>⚙️</span> Ajustes
            </span>
          </div>
        </button>

        {/* BOTÓN 3: VOLVER A MENÚ PRINCIPAL (ESTÁNDAR IDÉNTICO A HUBTOPBAR VOLVER A IMPERIO) */}
        <div className="flex items-stretch justify-center shrink-0 w-full xl:w-44">
          <button
            type="button"
            onClick={handleOpenMenu}
            className="relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
            title="Volver a Menú Principal (Continuar o Cargar Partida)"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <SafeImg
                id="menuContinue"
                className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-cyan-950/20 group-hover:bg-cyan-500/10 transition-colors duration-300" />
            </div>

            {/* Contenido frontal maximizado a todo el ancho */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
              <span className="w-full text-center text-lg sm:text-xl font-mono font-black uppercase tracking-[0.28em] text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors">
                VOLVER A
              </span>
              <span className="w-full text-center text-xs sm:text-sm font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-tight group-hover:text-cyan-100 transition-colors flex items-center justify-center gap-1.5 mt-1 whitespace-nowrap">
                <span className="text-sm shrink-0">🏠</span>
                <span>Menú Principal</span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
