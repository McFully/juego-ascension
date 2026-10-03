import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * TacticalListeningChannelGrid — Selector de Frecuencias y Canales Tácticos en Card Grid.
 * Sustituye los botones planos anteriores en TelemetryPage.jsx.
 */
export const TacticalListeningChannelGrid = ({
  filter,
  onSelectFilter,
  counts = {},
  unreadByCat = {}
}) => {
  const channels = [
    {
      id: 'all',
      title: 'Bandeja Táctica Global',
      subtitle: 'Flujo completo de transmisiones, incidentes y telemetría de todos los cuadrantes.',
      assetId: 'quantumTelecom',
      icon: '📡',
      badgeText: 'CANAL MADRE'
    },
    {
      id: 'combat',
      title: 'Batallas y Alertas Bélicas',
      subtitle: 'Reportes de bajas navales, impactos de bombardeo y defensas de perímetro.',
      assetId: 'internalSecurityMinistry',
      icon: '⚔️',
      badgeText: 'TEATRO BÉLICO'
    },
    {
      id: 'transport',
      title: 'Logística y Convoyes',
      subtitle: 'Manifiestos de atraque, llegadas de flotas de carga y suministros coloniales.',
      assetId: 'predictiveSupplyChain',
      icon: '🚚',
      badgeText: 'MERCANTE'
    },
    {
      id: 'espionage',
      title: 'Inteligencia y Espionaje',
      subtitle: 'Barridos de sensor phalanx, sondas de reconocimiento e intercepción de señales.',
      assetId: 'deepScanner',
      icon: '🕵️',
      badgeText: 'CLASIFICADO'
    },
    {
      id: 'diplomatic',
      title: 'Despacho Diplomático',
      subtitle: 'Comunicaciones directas de líderes alienígenas, pactos y ultimátums interestelares.',
      assetId: 'permanentEmbassy',
      icon: '🤝',
      badgeText: 'CONSULAR'
    },
    {
      id: 'colonization',
      title: 'Fundación y Asentamientos',
      subtitle: 'Llegada de arcas de expansión, informes de colonización y terraformación.',
      assetId: 'geosphericEcoPark',
      icon: '🪐',
      badgeText: 'EXPANSIÓN'
    }
  ];

  return (
    <div className="w-full space-y-3 py-1">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs md:text-sm font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
          <span>📡</span>
          <span>Frecuencias y Canales de Escucha Táctica</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400">
          Recepción Criptográfica Activa
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full items-stretch pb-2">
        {channels.map(ch => {
          const isSelected = filter === ch.id;
          const totalCount = counts[ch.id] || 0;
          const unread = unreadByCat[ch.id] || 0;

          return (
            <button
              key={ch.id}
              onClick={() => {
                onSelectFilter(ch.id);
                if (window.playSfx) window.playSfx('click');
              }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[190px] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#13283d]/95 via-[#0c1b2b]/90 to-[#040711] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.35)] scale-[1.02]'
                  : 'bg-[#060a16]/90 border-white/10 hover:border-cyan-400/60 hover:bg-[#0c1a2e] hover:scale-[1.02]'
              }`}
            >
              {/* Banner Imagen */}
              <div className="relative w-full h-24 overflow-hidden bg-[#040711] border-b border-white/10">
                <SafeImg
                  id={ch.assetId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                  unread > 0
                    ? 'bg-red-500/80 border-red-400 text-white animate-pulse'
                    : 'bg-black/60 border-white/10 text-slate-300'
                }`}>
                  {unread > 0 ? `${unread} NUEVOS` : `${totalCount}`}
                </span>
                <span className="absolute bottom-1.5 left-2 text-base drop-shadow-md">
                  {ch.icon}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {ch.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-2 leading-relaxed">
                    {ch.subtitle}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold">
                  <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                    {isSelected ? '● Sintonizado' : `${totalCount} Entradas`}
                  </span>
                  <span className={`transition-transform duration-200 ${isSelected ? 'text-cyan-300 translate-x-1' : 'text-cyan-400/70 group-hover:translate-x-1'}`}>
                    ➔
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
