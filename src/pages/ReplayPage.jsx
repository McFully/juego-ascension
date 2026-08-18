import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ReplayPage = ({ state, dispatch, S }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [filterType, setFilterType] = useState('all');

  const eventLog = state.eventLog || [];

  // Categorize event types for icons and colors
  const getEventMeta = (type) => {
    switch (type) {
      case 'START_BUILDING':
      case 'BUILD_MOON_BUILDING':
        return { icon: '🏗️', color: 'text-emerald-400', label: 'Edificación' };
      case 'START_RESEARCH':
        return { icon: '🔬', color: 'text-cyan-400', label: 'Investigación' };
      case 'START_SHIP':
      case 'START_DEFENSE':
      case 'SEND_FLEET':
      case 'COLONIZE':
        return { icon: '🚀', color: 'text-purple-400', label: 'Militar/Flota' };
      case 'DIPLOMACY_TRADE':
      case 'DIPLOMACY_TRIBUTE':
      case 'DIPLOMACY_TREATY':
      case 'DIPLOMACY_DECLARE_WAR':
      case 'DIPLOMACY_ACCEPT_PROPOSAL':
      case 'DIPLOMACY_BETRAYAL_RESPONSE':
      case 'FORM_FEDERATION':
        return { icon: '🏛️', color: 'text-amber-400', label: 'Diplomacia' };
      case 'RESOLVE_CRISIS':
      case 'RESOLVE_DECISION_EVENT':
        return { icon: '⚠️', color: 'text-red-400', label: 'Crisis/Decisión' };
      default:
        return { icon: '⚙️', color: 'text-slate-400', label: 'Acción General' };
    }
  };

  // Replay playback logic
  useEffect(() => {
    if (!isPlaying) return;
    if (eventLog.length === 0) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentEventIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < eventLog.length) {
          const nextEvent = eventLog[nextIndex];
          dispatch(nextEvent.payload);
          return nextIndex;
        } else {
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, 1200 / replaySpeed);

    return () => clearInterval(interval);
  }, [isPlaying, eventLog, dispatch, replaySpeed]);

  const handleStepForward = () => {
    if (currentEventIndex < eventLog.length - 1) {
      const nextIndex = currentEventIndex + 1;
      const nextEvent = eventLog[nextIndex];
      dispatch(nextEvent.payload);
      setCurrentEventIndex(nextIndex);
    }
  };

  const handleStepBackward = () => {
    if (currentEventIndex >= 0) {
      // In a real system, rewinding requires restoring state to tick 0 and fast-forwarding
      // For this UI, we decrement index to allow navigation, and warn the user.
      setCurrentEventIndex(prev => prev - 1);
    }
  };

  const handleJumpToEvent = (index) => {
    if (index >= 0 && index < eventLog.length) {
      // Fast forward all events up to the selected index
      for (let i = 0; i <= index; i++) {
        dispatch(eventLog[i].payload);
      }
      setCurrentEventIndex(index);
    }
  };

  const filteredLogs = eventLog.filter(e => {
    if (filterType === 'all') return true;
    const meta = getEventMeta(e.type);
    return meta.label.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Explicación del sistema */}
      <div className={`${S.cardDeep} border border-cyan-500/20`}>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-2">📹 Registro Cronológico de Operaciones (Replay)</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          El núcleo informático de Ascensión registra automáticamente todas las directivas de mando en un búfer cronológico local. Este panel te permite reproducir, auditar y analizar tus decisiones estratégicas históricas. Revisa el orden de construcción, gestiona tus tiempos de respuesta y optimiza tu progreso táctico.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel de Control de Reproducción */}
        <div className={`${S.cardDeep} lg:col-span-5 flex flex-col space-y-4`}>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">🎛️ Consola de Simulación</h3>
          
          <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Eventos Registrados:</span>
              <span className="text-cyan-400 font-bold">{eventLog.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Índice del Cabezal:</span>
              <span className="text-white font-bold">{currentEventIndex + 1} / {eventLog.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tick de Mando Actual:</span>
              <span className="text-amber-300 font-bold">
                {currentEventIndex >= 0 && eventLog[currentEventIndex] ? eventLog[currentEventIndex].tick : 'N/A'}
              </span>
            </div>
          </div>

          {/* Botones de Control */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={handleStepBackward} 
              disabled={currentEventIndex < 0}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-200 hover:text-white transition-all uppercase cursor-pointer"
              title="Atrás"
            >
              ⏮️ Paso
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={eventLog.length === 0}
              className="py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold text-cyan-200 hover:text-white transition-all uppercase cursor-pointer"
            >
              {isPlaying ? "⏸️ Pausar" : "▶️ Reproducir"}
            </button>
            <button 
              onClick={handleStepForward}
              disabled={currentEventIndex >= eventLog.length - 1}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-200 hover:text-white transition-all uppercase cursor-pointer"
              title="Siguiente"
            >
              Paso ⏭️
            </button>
          </div>

          {/* Velocidad */}
          <div className="space-y-1.5 p-3 bg-slate-950/20 border border-white/5 rounded-xl">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Velocidad de Simulación:</span>
              <span className="text-cyan-400 font-bold">{replaySpeed}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.5" 
              value={replaySpeed} 
              onChange={e => setReplaySpeed(parseFloat(e.target.value))} 
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Filtros de la Línea de Tiempo */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Filtrar Categoría</span>
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'edificación', label: '🏗️ Infraest.' },
                { id: 'investigación', label: '🔬 Ciencia' },
                { id: 'militar', label: '🚀 Flotas' },
                { id: 'diplomacia', label: '🏛️ Dipl.' },
                { id: 'crisis', label: '⚠️ Sucesos' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2 py-1 text-[9px] uppercase font-mono rounded-lg border transition-all ${
                    filterType === f.id 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white' 
                      : 'border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Línea de Tiempo Detallada */}
        <div className={`${S.cardDeep} lg:col-span-7 flex flex-col`}>
          <h3 className="text-sm font-semibold mb-3 text-slate-200 uppercase tracking-wider font-mono">📅 Historial Cronológico Detallado</h3>
          
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            {filteredLogs.map((e, index) => {
              const meta = getEventMeta(e.type);
              const isActive = index === currentEventIndex;
              return (
                <div 
                  key={index} 
                  onClick={() => handleJumpToEvent(index)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.15)] text-white' 
                      : 'bg-slate-950/20 border-white/5 text-slate-400 hover:bg-slate-900/30'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                    <span className={`font-bold flex items-center gap-1 ${meta.color}`}>
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="text-slate-500">Tick: {e.tick}</span>
                  </div>
                  <div className="text-[11px] leading-relaxed font-mono">
                    Directiva: <span className="text-slate-200 font-semibold">{e.type}</span>
                  </div>
                  {e.payload?.payload && (
                    <div className="text-[9px] text-slate-500 mt-1 bg-black/40 p-1.5 rounded font-mono overflow-x-auto">
                      {JSON.stringify(e.payload.payload)}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLogs.length === 0 && (
              <div className="text-xs text-slate-500 italic text-center py-16 font-mono">
                No hay eventos registrados que coincidan con el filtro seleccionado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplayPage;
