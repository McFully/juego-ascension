import React, { useEffect } from 'react';
import { asset, REAL_IMAGES } from '../../assets.jsx';
import { sfx, speakText } from '../../audio.js';
import { fmt } from '../../utils/formulas.js';

export const TacticalEventOverlay = React.memo(({ events = [], onDismiss, onDismissAll, onNavigatePlanet }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const totalEvents = events?.length || 0;

  // Ajustar currentIndex si events se reduce o queda fuera de rango
  React.useEffect(() => {
    if (currentIndex >= totalEvents && totalEvents > 0) {
      setCurrentIndex(totalEvents - 1);
    }
  }, [currentIndex, totalEvents]);

  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, totalEvents - 1));
  const currentEvent = events && events.length > 0 ? events[safeIndex] : null;

  useEffect(() => {
    if (currentEvent) {
      if (currentEvent.type === 'colonize') {
        sfx.milestone?.();
      } else if (currentEvent.type === 'transport' || currentEvent.type === 'transport_return') {
        sfx.heavyRelayClick?.();
      } else if (currentEvent.type === 'expedition' || currentEvent.type === 'espionage' || currentEvent.type === 'espionage_return') {
        sfx.tacticalSonarPing?.();
      } else if (currentEvent.type === 'combat') {
        if (currentEvent.combatResult === 'victory') sfx.success?.();
        else if (currentEvent.combatResult === 'defeat') sfx.notifyDanger?.();
        else sfx.warn?.();
      } else if (currentEvent.type === 'espionage_alert') {
        sfx.notifyDanger?.();
      } else {
        sfx.uiModal?.();
      }

      const prefix = currentEvent.minister ? `Comunicado de ${currentEvent.minister.name}. ` : '';
      const voiceText = `${prefix}${currentEvent.voiceText || currentEvent.title || 'Acontecimiento táctico'}. ${currentEvent.subtitle || ''}`;
      
      if (voiceText) {
        speakText(voiceText, { minister: currentEvent.minister });
      }
    }
  }, [currentEvent?.id]);

  if (!currentEvent) return null;

  const isColonize = currentEvent.type === 'colonize';
  const isTransport = currentEvent.type === 'transport';
  const isTransportReturn = currentEvent.type === 'transport_return';
  const isExpedition = currentEvent.type === 'expedition';
  const isRecycle = currentEvent.type === 'recycle';
  const isRecycleReturn = currentEvent.type === 'recycle_return';
  const isCombat = currentEvent.type === 'combat';
  const isCombatReturn = currentEvent.type === 'combat_return';
  const isEspionage = currentEvent.type === 'espionage';
  const isEspionageAlert = currentEvent.type === 'espionage_alert';
  const isEspionageReturn = currentEvent.type === 'espionage_return';

  const isReturnEvent = isTransportReturn || isRecycleReturn || isEspionageReturn || isCombatReturn;

  const headerBadgeColor = isColonize 
    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
    : (isTransport || isTransportReturn)
    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
    : isExpedition
    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
    : (isRecycle || isRecycleReturn)
    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
    : (isCombat || isCombatReturn || isEspionageAlert)
    ? (currentEvent.combatResult === 'defeat' || isEspionageAlert ? 'border-red-500/50 bg-red-500/20 text-red-300' : 'border-rose-500/50 bg-rose-500/20 text-rose-300')
    : 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300';

  const badgeIcon = isColonize 
    ? 'flag' 
    : isTransport 
    ? 'local_shipping' 
    : isTransportReturn
    ? 'warehouse'
    : isExpedition 
    ? 'explore' 
    : isRecycle 
    ? 'recycling' 
    : isRecycleReturn
    ? 'domain_verification'
    : isCombat
    ? (currentEvent.combatResult === 'victory' ? 'military_tech' : currentEvent.combatResult === 'defeat' ? 'emergency' : 'swords')
    : isCombatReturn
    ? 'shield'
    : isEspionage
    ? 'visibility'
    : isEspionageAlert
    ? 'warning'
    : 'radar';

  const badgeLabel = isColonize 
    ? 'Expansión Imperial • Nueva Colonia' 
    : isTransport 
    ? 'Logística Imperial • Entrega de Carga' 
    : isTransportReturn
    ? 'Logística Imperial • Retorno a Base'
    : isExpedition
    ? 'Exploración Profunda • Retorno de Expedición'
    : isRecycle
    ? 'Operación Táctica • Reciclaje Orbital'
    : isRecycleReturn
    ? 'Operación Táctica • Recicladores en Base'
    : isCombat
    ? (currentEvent.combatResult === 'victory' ? 'Combate Naval • Victoria' : currentEvent.combatResult === 'defeat' ? 'Combate Naval • Derrota' : 'Combate Naval • Tablas')
    : isCombatReturn
    ? 'Flota Naval • Repliegue en Silos'
    : isEspionage
    ? 'Servicio de Inteligencia • Informe Orbital'
    : isEspionageAlert
    ? 'Alerta de Inteligencia • Sonda Interceptada'
    : 'Servicio de Inteligencia • Sonda Recuperada';

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.25)] relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Cabecera / Banner */}
        <div className="relative h-48 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10">
          {(() => {
            const imgSource = currentEvent.image 
              ? (REAL_IMAGES[currentEvent.image] || asset(currentEvent.image)) 
              : null;
            return imgSource ? (
              <img 
                src={imgSource} 
                alt={currentEvent.title} 
                className="w-full h-full object-cover scale-105" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-10 text-cyan-500">
                <span className="material-symbols-outlined text-9xl">{badgeIcon}</span>
              </div>
            );
          })()}

          {/* Gradiente sutil inferior */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Badge superior */}
          <div className={`absolute top-4 left-5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-[0.25em] z-20 backdrop-blur-md flex items-center gap-2 ${headerBadgeColor}`}>
            <span className="material-symbols-outlined text-[14px]">{badgeIcon}</span>
            <span>{badgeLabel}</span>
          </div>

          {/* Paginador interactivo de cola si hay más de 1 evento */}
          {totalEvents > 1 && (
            <div className="absolute top-4 right-16 flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/40 rounded-xl p-0.5 z-20 backdrop-blur-md">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={safeIndex === 0}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  safeIndex === 0 
                    ? 'opacity-30 cursor-not-allowed text-slate-500' 
                    : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-white cursor-pointer active:scale-95'
                }`}
                title="Informe anterior"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              <span className="px-2 text-[11px] text-cyan-300 font-mono font-bold select-none">
                {safeIndex + 1} de {totalEvents} informes
              </span>

              <button
                onClick={() => setCurrentIndex(prev => Math.min(totalEvents - 1, prev + 1))}
                disabled={safeIndex >= totalEvents - 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  safeIndex >= totalEvents - 1 
                    ? 'opacity-30 cursor-not-allowed text-slate-500' 
                    : 'text-cyan-300 hover:bg-cyan-500/20 hover:text-white cursor-pointer active:scale-95'
                }`}
                title="Informe siguiente"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}

          {/* Botón Cerrar */}
          <button 
            onClick={() => onDismiss(currentEvent.id)} 
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-black/60 border border-white/15 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all z-30 cursor-pointer group"
            title="Descartar informe"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>

          {/* Título en banner */}
          <div className="absolute bottom-4 left-6 right-6 z-20">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
              {currentEvent.title}
            </h2>
            {currentEvent.subtitle && (
              <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
                {currentEvent.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Cuerpo del acontecimiento */}
        <div className="p-6 space-y-6">
          
          {/* Ficha del Ministro a cargo (si está asignado) */}
          {currentEvent.minister && (
            <div className="flex items-center justify-between p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-xl overflow-hidden relative">
                  {currentEvent.minister.avatarId ? (
                    <img 
                      src={asset(`${currentEvent.minister.avatarId}.jpg`)} 
                      alt={currentEvent.minister.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{currentEvent.minister.icon || '👤'}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{currentEvent.minister.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[9px] text-cyan-300 font-mono uppercase font-bold border border-cyan-500/30">
                      Ministro a Cargo
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    {currentEvent.ministryName || 'Gabinete Imperial'} • {currentEvent.minister.trait || 'Oficial Imperial'}
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-cyan-400 text-lg opacity-80 mr-2">record_voice_over</span>
            </div>
          )}

          {/* Mensaje o Descripción */}
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="material-symbols-outlined text-2xl text-cyan-400 mt-0.5">description</span>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {currentEvent.description}
            </p>
          </div>

          {/* Desglose de Recursos / Carga (Transporte o Reciclaje o Saqueo) */}
          {currentEvent.resources && Object.keys(currentEvent.resources).length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
                {isCombat ? 'Botín de Guerra Obtenido' : 'Manifiesto de Recursos Transferidos'}
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Metal
                  </div>
                  <span className="text-base font-bold text-white font-mono mt-1">
                    +{fmt(currentEvent.resources.metal || 0)}
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    Cristal
                  </div>
                  <span className="text-base font-bold text-cyan-200 font-mono mt-1">
                    +{fmt(currentEvent.resources.crystal || 0)}
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Deuterio
                  </div>
                  <span className="text-base font-bold text-emerald-200 font-mono mt-1">
                    +{fmt(currentEvent.resources.deuterium || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Ficha de Combate (Bajas y Escombros) */}
          {isCombat && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
                Evaluación Táctica de Bajas y Escombros
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Resultado</span>
                  <span className={`text-xs font-bold uppercase ${currentEvent.combatResult === 'victory' ? 'text-emerald-400' : currentEvent.combatResult === 'defeat' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {currentEvent.combatResult === 'victory' ? 'Victoria' : currentEvent.combatResult === 'defeat' ? 'Derrota' : 'Tablas'}
                  </span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Bajas Propias</span>
                  <span className="text-xs font-bold text-rose-300">{currentEvent.losses?.playerLosses ?? 0} unid.</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Bajas Hostiles</span>
                  <span className="text-xs font-bold text-emerald-300">{currentEvent.losses?.enemyLosses ?? 0} unid.</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Escombros</span>
                  <span className="text-xs font-bold text-cyan-300">{fmt((currentEvent.debris?.metal || 0) + (currentEvent.debris?.crystal || 0))}</span>
                </div>
              </div>
            </div>
          )}

          {/* Ficha de Flota Retornada a Hangares */}
          {isReturnEvent && currentEvent.returnedFleet && Object.keys(currentEvent.returnedFleet).length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
                Naves Reincorporadas al Hangar
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentEvent.returnedFleet)
                  .filter(([, qty]) => qty > 0)
                  .map(([shipId, qty]) => (
                    <div key={shipId} className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{qty}x</span>
                      <span className="text-xs text-cyan-300">{shipId}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Ficha técnica del planeta si es Colonización */}
          {isColonize && currentEvent.planetDetails && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
                Ficha de Reconocimiento Geológico
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Bioma</span>
                  <span className="text-xs font-bold text-white uppercase">{currentEvent.planetDetails.biome || 'Estándar'}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Tamaño</span>
                  <span className="text-xs font-bold text-white">{currentEvent.planetDetails.planetSize || 100} campos</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Temperatura</span>
                  <span className="text-xs font-bold text-white">{currentEvent.planetDetails.temperature || 20}°C</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase">Gravedad</span>
                  <span className="text-xs font-bold text-white">{currentEvent.planetDetails.gravity || 1} G</span>
                </div>
              </div>
            </div>
          )}

          {/* Acciones del Comandante */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            {totalEvents > 1 ? (
              <button
                onClick={onDismissAll}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/15 text-xs text-slate-300 hover:text-white hover:border-white/30 transition-all cursor-pointer font-mono uppercase"
              >
                Cerrar todos ({totalEvents})
              </button>
            ) : <div />}

            <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
              {currentEvent.targetPlanetId && onNavigatePlanet && (
                <button
                  onClick={() => {
                    onNavigatePlanet(currentEvent.targetPlanetId);
                    onDismiss(currentEvent.id);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">public</span>
                  <span>Ver Planeta</span>
                </button>
              )}

              <button
                onClick={() => onDismiss(currentEvent.id)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>Entendido</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});
