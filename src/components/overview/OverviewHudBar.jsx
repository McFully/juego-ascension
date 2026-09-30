import React from 'react';
import { TacticalResourceRow } from "../ui/TacticalResourceRow.jsx";
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
  onOpenSettings,
  safeSetActiveTab
}) {
  // 3.5-a — La fuente correcta es `state.tacticalEventLog`. Antes se leía
  // `state.history || state.logs`, campos que no existen ni en initialState ni
  // en ningún reducer, así que el registro llegaba siempre vacío y el ticker caía
  // a su texto de relleno.
  const log = state?.tacticalEventLog || [];
  const telemetryEvents = log.slice(-40).map((e) => ({
    id: e.id,
    text: e.title || e.subtitle || e.text || 'Comunicación entrante',
    time: e.receivedAt || Date.now(),
    read: Boolean(e.read),
    requiresDecision: Boolean(e.requiresDecision),
    priority: e.priority || 'media',
    kind: e.kind || 'tactical',
  }));
  const unreadCount = log.filter((e) => !e.read).length;
  const requiresDecisionCount = log.filter((e) => !e.read && e.requiresDecision).length;

  if (!hudVisible) return null;

  return (
    <section className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl transition-all duration-300 animate-in fade-in">
      {/* Lado Izquierdo: Fila 1 Recursos con Separadores, Fila 2 Miga de Pan e Identidad */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Fila 1: Recursos con Separadores Verticales Unificados */}
        <TacticalResourceRow
          resources={imperialTotals}
          production={{
            metal: imperialTotals.prodMetal,
            crystal: imperialTotals.prodCrystal,
            deuterium: imperialTotals.prodDeuterium,
            energyBalance: imperialTotals.energyBalance,
            slagNet: imperialTotals.prodSlag,
            breakdown: imperialTotals.breakdown
          }}
          militaryPower={totalFleetMilitaryPower}
          state={state}
          fmt={fmt}
          className="rounded-tl-2xl overflow-visible"
        />

        {/* Fila 2: Explorador de Navegacion e Identidad de Dominio + Telemetría y Badge del Emperador a la Derecha */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 flex-wrap bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="text-base">⚜️</span>
              <span>Imperio</span>
            </div>

            {/* Avatar circular del Comandante Supremo */}
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-xs font-mono">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400 bg-[#050914] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                {state?.avatarUrl || state?.playerAvatar || state?.avatar_url ? (
                  <img
                    src={state.avatarUrl || state.playerAvatar || state.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs">👨‍🚀</span>
                )}
              </div>
              <span className="font-bold text-slate-200 tracking-wide pr-1">
                {state?.playerName || 'Comandante'}
              </span>
            </div>
          </div>

          {/* Bloque alineado a la derecha: Telemetría Imperial a la izquierda + Badge Emperador a su derecha */}
          <div className="shrink-0 ml-auto flex items-center gap-2.5">
            <ImperialTelemetryTicker
              variant="header"
              events={telemetryEvents}
              unreadCount={unreadCount}
              requiresDecisionCount={requiresDecisionCount}
              onOpenInbox={() => safeSetActiveTab && safeSetActiveTab('telemetry')}
            />

            {/* Badge indicador del Emperador */}
            <div 
              className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs ${
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
