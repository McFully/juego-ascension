import React from 'react';
import { SafeImg } from '../../../assets.jsx';

export const FleetHubCardGrid = ({
  currentPlanet,
  totalShipsInHangar,
  playerActiveMissions,
  state,
  target,
  setActiveCardView,
  setShowRegistryModal,
  navigateBack,
  fmt
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* TARJETA 1: Inventario de la Flota en Tierra */}
        <button
          onClick={() => {
            setActiveCardView('inventory');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/30 hover:border-cyan-400 bg-gradient-to-b from-[#0e1b38]/95 to-[#060a14] hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="battleship" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                Inventario de Flota
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Naves en {currentPlanet?.name || 'Tierra'}, unidades en el espacio exterior y destruidas.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
              <span>{fmt(totalShipsInHangar)} naves</span>
            </div>
          </div>
        </button>

        {/* TARJETA 2: Flotas en Vuelo */}
        <button
          onClick={() => {
            setActiveCardView('in_flight');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-blue-500/30 hover:border-blue-400 bg-gradient-to-b from-[#0d1836]/95 to-[#060914] hover:shadow-[0_0_35px_rgba(59,130,246,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="cruiser" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-blue-300 transition-colors">
                Flotas en Vuelo
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Monitoreo en tiempo real de misiones en tránsito y vectores de retorno.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-blue-300">
              <span>{playerActiveMissions.length} misiones</span>
            </div>
          </div>
        </button>

        {/* TARJETA 3: Rutas Comerciales Automáticas */}
        <button
          onClick={() => {
            setActiveCardView('trade_routes');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/30 hover:border-amber-400 bg-gradient-to-b from-[#24170c]/95 to-[#0a0705] hover:shadow-[0_0_35px_rgba(245,158,11,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="largeCargo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                Rutas Comerciales
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Fletes automáticos de punto a punto, intercambios recíprocos y bucles.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
              <span>{(state.tradeRoutes || []).length} rutas</span>
            </div>
          </div>
        </button>

        {/* TARJETA 4: Despacho Táctico / Destino */}
        <button
          onClick={() => {
            setActiveCardView('dispatch');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-emerald-500/30 hover:border-emerald-400 bg-gradient-to-b from-[#0c221a]/95 to-[#050e0a] hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="destroyer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors">
                Despacho Táctico
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Asignación de flotas para ataque, transporte o colonización hacia coordenadas.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-emerald-300">
              <span>{target ? "Destino Fijado" : "Configurar"}</span>
            </div>
          </div>
        </button>

        {/* TARJETA 5: Informes de Espionaje */}
        <button
          onClick={() => {
            setActiveCardView('spy_reports');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-purple-500/30 hover:border-purple-400 bg-gradient-to-b from-[#1c1033]/95 to-[#080512] hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="spyProbe" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors">
                Informes de Espionaje
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Telemetría de defensas y flotas enemigas recopiladas por sondas espía.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-purple-300">
              <span>{(state.spyReports || []).length} informes</span>
            </div>
          </div>
        </button>

        {/* TARJETA 6: Patrullas y Seguridad Orbital */}
        <button
          onClick={() => {
            setActiveCardView('patrols');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 hover:border-cyan-300 bg-gradient-to-b from-[#0a233c]/95 to-[#040c17] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg id="patrol_orbital" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                Patrullas y Seguridad
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Escudo orbital activo y policía de sistema. Interceptación automática de hostiles.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
              <span>{(state.patrols || []).length} escuadrones</span>
            </div>
          </div>
        </button>

        {/* TARJETA 7: Registro Naval Imperial (Matrículas y Cascos SQLite) */}
        <button
          onClick={() => {
            setShowRegistryModal(true);
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-amber-500/40 hover:border-amber-300 bg-gradient-to-b from-[#2b1e07]/95 to-[#0e0a02] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
            <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🎖️</span>
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors">
                Registro de Cascos
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Matrículas permanentes, astillero natal, bitácoras y condecoraciones de cada nave.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
              <span>Auditoría de Cascos</span>
            </div>
          </div>
        </button>

        {/* TARJETA 8: Reubicación y Traslado de Naves */}
        <button
          onClick={() => {
            setActiveCardView('relocate');
            if (window.playSfx) window.playSfx('click');
          }}
          className="group relative flex flex-col overflow-hidden rounded-3xl border border-indigo-500/40 hover:border-indigo-300 bg-gradient-to-b from-[#151336]/95 to-[#080614] hover:shadow-[0_0_35px_rgba(99,102,241,0.4)] transition-all duration-300 select-none cursor-pointer text-left focus:outline-none min-h-[260px]"
        >
          <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
            <SafeImg id="carrier" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
          </div>
          <div className="p-4 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-indigo-300 transition-colors">
                Asignar y Trasladar Naves
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                Reubica y transfiere permanentemente escuadrones a los hangares de tus otros mundos aliados.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono font-bold text-indigo-300">
              <span>{state.planets?.length || 1} mundos</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
