import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * ColonyStationCardGrid — Selector de Estaciones y Centros de Operaciones Coloniales.
 * Sustituye los botones de texto plano anteriores por Card Grids visuales de alto impacto.
 */
export const ColonyStationCardGrid = ({
  activeSubTab,
  onSelectSubTab,
  planetsCount = 0,
  activeRoutesCount = 0,
  pendingDemandsCount = 0,
  onBack
}) => {
  const stations = [
    {
      id: 'overview',
      title: 'Matriz Colonial en Vivo',
      subtitle: 'Censo interplanetario, nivel de acondicionamiento bio-atmosférico y telemetría de mundos.',
      badgeText: `${planetsCount} MUNDOS`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      assetId: 'geosphericEcoPark',
      icon: '🌐',
      stats: '100% Sincronizado'
    },
    {
      id: 'relocate',
      title: 'Reubicación Rápida de Flotas',
      subtitle: 'Transferencia directa e instantánea de escuadras navales y cazas entre hangares de colonias.',
      badgeText: 'DESPLIEGUE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      assetId: 'carrier',
      icon: '🚀',
      stats: 'Hangares Seguros'
    },
    {
      id: 'routes',
      title: 'Convoy Comercial',
      subtitle: 'Ordenanzas de convoy comercial: logística bilateral ida y vuelta con flete de escoria.',
      badgeText: `${activeRoutesCount}/10 CONVOYES`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      assetId: 'predictiveSupplyChain',
      icon: '🚚',
      stats: activeRoutesCount > 0 ? 'En Circulación' : 'Sin Rutas'
    },
    {
      id: 'demands',
      title: 'Demandas y Abastecimiento',
      subtitle: 'Requerimientos urgentes de materias primas y bienes de consumo en tus asentamientos.',
      badgeText: pendingDemandsCount > 0 ? `⚠️ ${pendingDemandsCount} URGENTES` : 'ABASTECIDO',
      badgeColor: pendingDemandsCount > 0 ? 'bg-amber-500 text-black animate-pulse' : 'bg-slate-800 text-slate-300 border-white/10',
      assetId: 'log_depot_exp',
      icon: '📦',
      stats: pendingDemandsCount > 0 ? 'Atención Requerida' : 'Equilibrio Óptimo'
    },
    {
      id: 'sectors',
      title: 'Prefecturas Coloniales',
      subtitle: 'Asignación de gobernadores coloniales, directivas civiles y autonomía de desarrollo.',
      badgeText: 'GOBIERNO',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      assetId: 'dir_ai_governance',
      icon: '🌌',
      stats: 'Directivas Activas'
    },
    {
      id: 'researchMatrix',
      title: 'Matriz de Investigación',
      subtitle: 'Sincronización cuántica de laboratorios coloniales para unificar la potencia de cálculo imperial.',
      badgeText: 'RED NEURAL',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      assetId: 'aiCore',
      icon: '🧠',
      stats: 'I+D Sincronizada'
    }
  ];

  return (
    <div className="w-full space-y-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-stretch pt-1 pb-3">
        {stations.map(st => {
          const isSelected = activeSubTab === st.id;

          return (
            <button
              key={st.id}
              onClick={() => {
                onSelectSubTab(st.id);
                if (window.playSfx) window.playSfx('click');
              }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[250px] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#131b3d]/95 via-[#0c122b]/90 to-[#040711] border-indigo-400 shadow-[0_0_35px_rgba(99,102,241,0.4)] scale-[1.02]'
                  : 'bg-[#060a16]/90 border-white/10 hover:border-indigo-400/60 hover:bg-[#0c132e] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]'
              }`}
            >
              {/* Imagen del Banner Superior */}
              <div className="relative w-full h-32 overflow-hidden bg-[#040711] border-b border-white/10">
                <SafeImg
                  id={st.assetId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${st.badgeColor}`}>
                  {st.badgeText}
                </span>
                <span className="absolute bottom-2 left-2 text-xl drop-shadow-md">
                  {st.icon}
                </span>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {st.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                    {st.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider font-semibold">
                  <span className={isSelected ? 'text-indigo-300' : 'text-slate-400 group-hover:text-indigo-400'}>
                    {isSelected ? '● Operativo' : st.stats}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
