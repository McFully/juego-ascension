import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * Resuelve el acceso directo contextual para cada misión hacia su destino exacto.
 */
const getMissionAction = (mission) => {
  if (!mission) return null;
  const id = mission.id;
  const targetTech = mission.targetTech;

  // Investigaciones científicas
  if (targetTech || id.includes('tech') || id.includes('astro') || id.includes('plasma') || id.includes('weapons') || id.includes('shields') || id.includes('armour') || id.includes('impulse') || id.includes('combustion') || id.includes('hyper') || id.includes('spacenav')) {
    return {
      target: 'research',
      label: 'Ir a Investigar',
      icon: '🔬',
      hint: 'Abre el Laboratorio Central'
    };
  }

  // Astillero y construcción de naves
  if (id.includes('cargo') || id.includes('col') || id.includes('probe') || id.includes('cruiser') || id.includes('battleship') || id.includes('terra_ship') || id === 'm6_shipyard' || id === 'm16_2_shipyard10') {
    if (id === 'm6_shipyard' || id === 'm16_2_shipyard10') {
      return {
        target: 'buildings',
        label: 'Ir a Edificar',
        icon: '🏗️',
        hint: 'Abre Complejo de Obras'
      };
    }
    return {
      target: 'shipyard',
      label: 'Construir Naves',
      icon: '🚀',
      hint: 'Abre el Astillero Naval'
    };
  }

  // Defensas planetarias
  if (id.includes('defense') || id.includes('laser') || id.includes('silo') || id.includes('dome')) {
    if (id.includes('silo')) {
      return {
        target: 'buildings',
        label: 'Construir Silo',
        icon: '🏗️',
        hint: 'Abre Complejo de Obras'
      };
    }
    return {
      target: 'defense',
      label: 'Desplegar Defensas',
      icon: '🛡️',
      hint: 'Abre Bastión Defensivo'
    };
  }

  // Diplomacia, tratados, alianzas y reputación
  if (id.includes('diplo') || id.includes('pacts') || id.includes('alliance') || id.includes('rep') || id.includes('influence')) {
    if (id === 'm5_1_diplo') {
      return {
        target: 'buildings',
        label: 'Construir Embajada',
        icon: '🏗️',
        hint: 'Abre Complejo de Obras'
      };
    }
    return {
      target: 'diplomacy',
      label: 'Mando Diplomático',
      icon: '🤝',
      hint: 'Abre Cuerpo Diplomático'
    };
  }

  // Comercio y rutas de mercado
  if (id.includes('market') || id.includes('trade') || id.includes('supply')) {
    if (id === 'm6_1_market') {
      return {
        target: 'buildings',
        label: 'Edificar Mercado',
        icon: '🏗️',
        hint: 'Abre Complejo de Obras'
      };
    }
    return {
      target: 'market',
      label: 'Ir al Mercado',
      icon: '💼',
      hint: 'Abre Mercado Galáctico'
    };
  }

  // Combate y simulador
  if (id.includes('combat')) {
    return {
      target: 'combat',
      label: 'Simulador Bélico',
      icon: '⚔️',
      hint: 'Abre Táctica y Combate'
    };
  }

  // Infraestructuras y minas generales
  if (id.includes('metal') || id.includes('solar') || id.includes('deuterium') || id.includes('lab') || id.includes('infra') || id.includes('storage') || id.includes('fusion') || id.includes('spy')) {
    return {
      target: 'buildings',
      label: 'Ir a Edificar',
      icon: '🏗️',
      hint: 'Abre Complejo de Obras'
    };
  }

  // Mundos, sectores y colonias
  if (id.includes('world') || id.includes('sector') || id.includes('newcol') || id.includes('pop')) {
    return {
      target: 'colony_network',
      label: 'Red de Colonias',
      icon: '🪐',
      hint: 'Abre Red de Mundos y Logística'
    };
  }

  return null;
};

export const MissionsChapterDetail = ({
  currentChapInfo,
  currentChapMissions,
  completedList,
  activeList,
  missionAssetMap,
  onNavigateTo,
  onBackToChapters
}) => {
  const completedCount = currentChapMissions.filter(m => completedList.includes(m.id)).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0d1a]/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="border-b border-white/10 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToChapters}
              className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all cursor-pointer text-sm font-bold"
              title="Volver a los Capítulos"
            >
              ◀ Volver a Capítulos
            </button>
            <span className="text-3xl">{currentChapInfo.icon}</span>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
                {currentChapInfo.name}
              </h3>
              <p className="text-xs text-slate-300 italic leading-relaxed mt-0.5 max-w-2xl">
                "{currentChapInfo.intro}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
              Completadas: {completedCount}/{currentChapMissions.length}
            </span>
          </div>
        </div>

        {/* Grid de Misiones con Tarjetas e Imágenes Dedicadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch tile-stagger">
          {currentChapMissions.map((m) => {
            const isCompleted = completedList.includes(m.id);
            const isLocked = m.req && !completedList.includes(m.req);
            const isActive = activeList.includes(m.id);
            const assetKey = missionAssetMap[m.id] || currentChapInfo.assetId;

            return (
              <div
                key={m.id}
                className={`
                  flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 relative
                  ${isCompleted
                    ? 'bg-[#06121a]/90 border-emerald-500/40 text-slate-300 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : isActive
                    ? 'bg-[#08152c]/95 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] text-slate-100'
                    : isLocked
                    ? 'bg-black/50 border-white/5 opacity-50 grayscale'
                    : 'bg-[#070c1e]/90 border-white/10 hover:border-cyan-500/40 text-slate-300'
                  }
                `}
              >
                {/* Banner de Imagen Temático para la Misión */}
                <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
                  <SafeImg
                    id={assetKey}
                    className="w-full h-full object-cover opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070c1e] via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute top-2.5 right-2.5">
                    {isCompleted ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 backdrop-blur-md shadow-md">
                        ✓ Cumplida
                      </span>
                    ) : isActive ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 animate-pulse backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                        ● Activa
                      </span>
                    ) : isLocked ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-md">
                        🔒 Bloqueada
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
                        Pendiente
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-3 flex items-center gap-2">
                    <span className="text-xl drop-shadow-md">{m.icon}</span>
                    <span className="font-black text-sm text-white drop-shadow-md tracking-wide">{m.name}</span>
                  </div>
                </div>

                {/* Contenido y Recompensa */}
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {m.desc}
                  </p>

                  <div className="space-y-2 mt-auto">
                    <div className="p-3 rounded-xl bg-[#030612]/90 border border-white/10">
                      <div className="text-[9px] text-slate-400 uppercase font-mono tracking-wider mb-1 flex items-center gap-1">
                        <span>🎁</span>
                        <span>Recompensa Imperial</span>
                      </div>
                      <div className="text-xs font-black text-cyan-300 font-mono">
                        {m.rewardDesc}
                      </div>
                    </div>

                    {/* Acceso Directo Contextual al lugar de ejecución */}
                    {(() => {
                      const action = getMissionAction(m);
                      if (!action || isCompleted || isLocked) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.playSfx) window.playSfx('click');
                            if (onNavigateTo) onNavigateTo(action.target);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all duration-200 cursor-pointer text-xs font-mono font-bold group/btn select-none shadow-md"
                          title={action.hint}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{action.icon}</span>
                            <span className="truncate">{action.label}</span>
                          </span>
                          <span className="text-cyan-400 group-hover/btn:translate-x-1 transition-transform">
                            ➔
                          </span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
