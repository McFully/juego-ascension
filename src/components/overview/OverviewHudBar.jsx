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
    <section className="relative z-30 flex flex-col bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl transition-all duration-300 animate-in fade-in w-full">
      {/* Fila 1: Recursos con Ancho Completo extendido hacia la derecha */}
      <div className="w-full overflow-visible">
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
          className="rounded-t-2xl overflow-visible border-b-0 w-full"
        />
      </div>

      {/* Separador Horizontal */}
      <div className="w-full h-[1px] bg-white/10" />

      {/* Fila 2: Mitad de altura inferior (Explorador + Telemetría + Emperador + Gobernanza + Ajustes) */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 flex-wrap bg-black/20 rounded-b-2xl min-h-[44px]">
        {/* Lado izquierdo de fila inferior: Imperio + Avatar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <span className="text-base">⚜️</span>
            <span>Imperio</span>
          </div>
        </div>

        {/* Lado derecho de fila inferior: Telemetría | MODO MANUAL | ACTIVAR GOBERNANZA | AJUSTES */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Telemetría Imperial */}
          <ImperialTelemetryTicker
            variant="header"
            events={telemetryEvents}
            unreadCount={unreadCount}
            requiresDecisionCount={requiresDecisionCount}
            onOpenInbox={() => safeSetActiveTab && safeSetActiveTab('telemetry')}
          />
          {/* Badge indicador del Emperador */}
          <div 
            className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs h-8 ${
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

          {/* Botón Gobernanza (Ocupa solo la mitad inferior de altura) */}
          <button
            type="button"
            onClick={() => {
              setEmperorModalOpen(true);
              if (window.playSfx) window.playSfx('click');
            }}
            className={`relative h-8 px-3 rounded-xl border border-white/15 overflow-hidden transition-all duration-200 cursor-pointer group flex items-center gap-1.5 text-center select-none shadow-none ${
              allPlanetsAuto
                ? 'bg-[#22070e] hover:bg-[#320a14] border-rose-500/40 text-rose-200 hover:text-white'
                : 'bg-[#051c14] hover:bg-[#072a1e] border-emerald-500/40 text-emerald-200 hover:text-white'
            }`}
            title="Configurar y gestionar la gobernanza del Emperador IA para el Imperio"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
              <SafeImg
                id={allPlanetsAuto ? "modeCancel" : "councilChamber"}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <span className="relative z-10 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <span>{allPlanetsAuto ? '🛑' : '👑'}</span>
              <span>{allPlanetsAuto ? 'Desactivar Gobernanza' : 'Activar Gobernanza'}</span>
            </span>
          </button>

          {/* Botón Ajustes (Ocupa solo la mitad inferior de altura) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="relative h-8 px-3 rounded-xl border border-white/15 overflow-hidden bg-[#060a16] hover:bg-[#0c1630] border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white transition-all duration-200 cursor-pointer group flex items-center gap-1.5 text-center select-none shadow-none"
            title="Ajustes de Sonido, Volúmenes y Partida"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 group-hover:opacity-60 transition-opacity">
              <SafeImg
                id="deepScanner"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <span className="relative z-10 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <span>⚙️</span>
              <span>Ajustes</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
