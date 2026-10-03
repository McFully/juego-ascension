import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export const GovernorDelegationModal = ({
  isOpen,
  onClose,
  currentPlanet,
  onToggleGovernance,
  dispatch
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentMode = currentPlanet?.governorDirectiveMode || 'autonomous_only';

  const DIRECTIVE_OPTIONS = [
    {
      id: 'autonomous_only',
      title: '1. Solo Autónomos Activos',
      icon: '⚙️',
      summary: 'Gestiona únicamente las carteras que tengan un ministro asignado y hayan sido activadas manualmente en modo autónomo.',
      detail: 'Si ningún ministerio está en modo autónomo, el gobernador permanecerá en espera y no ejecutará ninguna acción.'
    },
    {
      id: 'assigned_all',
      title: '2. Todos los Asignados (Activos o en Pausa)',
      icon: '👥',
      summary: 'Gestiona todas las carteras con ministro asignado, sin importar si estaban previamente activadas o pausadas.',
      detail: 'Aprovecha a todos los ministros nombrados para coordinar obras y tecnologías en sus áreas.'
    },
    {
      id: 'full_auto',
      title: '3. Plena Autonomía e Investidura Total',
      icon: '👑',
      summary: 'El gobernador selecciona al mejor ministro, lo pone en autónomo y lo gestiona de forma integral.',
      detail: 'A medida que se construyen nuevos edificios y se desbloquean ministerios, evalúa candidatos, los nombra, coordina y optimiza.'
    }
  ];

  const handleSelectMode = (modeId) => {
    if (dispatch && currentPlanet?.id) {
      dispatch({
        type: 'SET_PLANET_GOVERNOR_DIRECTIVE_MODE',
        planetId: currentPlanet.id,
        directiveMode: modeId
      });
      if (window.playSfx) window.playSfx('click');
    }
  };

  const content = (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 w-screen h-screen animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="p-6 md:p-8 rounded-3xl bg-[#090d1f] border border-cyan-500/40 max-w-4xl w-full space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative m-auto animate-in zoom-in-95 duration-200 font-mono"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Protocolo de Gobernador Territorial
              </h3>
              <p className="text-[10px] text-cyan-400 uppercase">
                Directrices de Autonomía Colonial · {currentPlanet?.name || 'Colonia Central'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar (Escape)"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Selecciona la <strong className="text-white">Directriz de Mando</strong> que determinará cómo la IA del Gobernador coordina los ministerios de esta colonia:
          </p>
          
          {/* Selector de 3 Opciones de Directriz Verticales (Izquierda, Centro y Derecha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {DIRECTIVE_OPTIONS.map(opt => {
              const isSelected = currentMode === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectMode(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] select-none text-left ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                      : 'bg-[#05070f] border-white/10 hover:border-cyan-500/40 hover:bg-[#0c1630]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{opt.icon}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : 'bg-black/60 text-slate-400 border-white/10'
                      }`}>
                        {isSelected ? '✓ Activa' : 'Elegir'}
                      </span>
                    </div>

                    <div className={`font-black text-xs sm:text-sm tracking-wide leading-snug ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                      {opt.title}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {opt.summary}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight italic pt-2 border-t border-white/5">
                    {opt.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            currentPlanet?.autoGovernance
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                {currentPlanet?.autoGovernance ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                  </>
                ) : (
                  <span className="inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                )}
              </span>
              <span>
                Estado actual: <strong className={currentPlanet?.autoGovernance ? 'text-emerald-300 font-bold' : 'text-slate-300'}>
                  {currentPlanet?.autoGovernance ? 'MODO AUTÓNOMO ACTIVO' : 'CONTROL MANUAL EXCLUSIVO'}
                </strong>
              </span>
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
              currentPlanet?.autoGovernance ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}>
              {currentPlanet?.autoGovernance ? '🤖 En Operación' : '👤 Manual'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              onToggleGovernance();
              onClose();
            }}
            className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              currentPlanet?.autoGovernance
                ? 'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          >
            <span>{currentPlanet?.autoGovernance ? '🛑' : '⚡'}</span>
            <span>{currentPlanet?.autoGovernance ? 'Revocar Gobernador (Cambiar a Manual)' : 'Activar Gobernador Autónomo'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export const EmperorDelegationModal = ({
  isOpen,
  onClose,
  state,
  dispatch
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const planets = state?.planets || [];
  const allActive = planets.length > 0 && planets.every(p => Boolean(p.autoGovernance));
  const someActive = planets.some(p => Boolean(p.autoGovernance));
  const currentMode = state?.emperorDirectiveMode || 'autonomous_only';

  const DIRECTIVE_OPTIONS = [
    {
      id: 'autonomous_only',
      title: '1. Solo Autónomos Activos',
      icon: '⚙️',
      summary: 'Ordena gestionar en cada colonia solo ministerios con ministro asignado y activados previamente en autónomo.',
      detail: 'Mantiene las asignaciones individuales sin forzar la activación de carteras pausadas.'
    },
    {
      id: 'assigned_all',
      title: '2. Todos los Asignados en Todo el Imperio',
      icon: '👥',
      summary: 'Activa y coordina todas las carteras ministeriales con ministro asignado en cualquiera de tus mundos.',
      detail: 'Aprovecha a todos los ministros nombrados en el imperio para ejecutar obras y proyectos.'
    },
    {
      id: 'full_auto',
      title: '3. Plena Autonomía Imperial e Investidura Total',
      icon: '👑',
      summary: 'La IA del Emperador asigna automáticamente al mejor candidato a cada cartera desbloqueada en cada planeta.',
      detail: 'Gobierno imperial 100% autónomo: nombra ministros, optimiza y coordina todas las colonias sin microgestión.'
    }
  ];

  const handleSelectMode = (modeId) => {
    if (dispatch) {
      dispatch({
        type: 'SET_EMPEROR_DIRECTIVE_MODE',
        directiveMode: modeId
      });
      if (window.playSfx) window.playSfx('click');
    }
  };

  const handleToggleEmperor = () => {
    if (dispatch) {
      dispatch({
        type: 'SET_EMPEROR_AUTO_GOVERNANCE',
        autoGovernance: !allActive
      });
      if (window.playSfx) window.playSfx('click');
    }
  };

  const content = (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 w-screen h-screen animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="p-6 md:p-8 rounded-3xl bg-[#090d1f] border border-cyan-500/40 max-w-4xl w-full space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative m-auto animate-in zoom-in-95 duration-200 font-mono"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Protocolo de Emperador IA
              </h3>
              <p className="text-[10px] text-cyan-400 uppercase">
                Directrices de Autonomía Imperial · Todos los Planetas ({planets.length} mundos)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cerrar (Escape)"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            Selecciona la <strong className="text-white">Directriz Suprema</strong> que determinará cómo la IA del Emperador coordina todos los planetas y ministerios:
          </p>
          
          {/* Selector de 3 Opciones de Directriz Verticales (Izquierda, Centro y Derecha) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
            {DIRECTIVE_OPTIONS.map(opt => {
              const isSelected = currentMode === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectMode(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[220px] select-none text-left ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] scale-[1.01]'
                      : 'bg-[#05070f] border-white/10 hover:border-cyan-500/40 hover:bg-[#0c1630]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{opt.icon}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                          : 'bg-black/60 text-slate-400 border-white/10'
                      }`}>
                        {isSelected ? '✓ Activa' : 'Elegir'}
                      </span>
                    </div>

                    <div className={`font-black text-xs sm:text-sm tracking-wide leading-snug ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                      {opt.title}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {opt.summary}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight italic pt-2 border-t border-white/5">
                    {opt.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            allActive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : someActive
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                {allActive || someActive ? (
                  <>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${allActive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${allActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></span>
                  </>
                ) : (
                  <span className="inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
                )}
              </span>
              <span>
                Estado global: <strong className={allActive ? 'text-emerald-300 font-bold' : someActive ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                  {allActive 
                    ? 'EMPERADOR ACTIVO EN TODOS LOS PLANETAS' 
                    : someActive 
                      ? 'PARCIALMENTE DELEGADO' 
                      : 'CONTROL MANUAL GENERAL'}
                </strong>
              </span>
            </div>
            <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
              allActive 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : someActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}>
              {allActive ? '👑 Pleno' : someActive ? '⚡ Parcial' : '👤 Manual'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => {
              handleToggleEmperor();
              onClose();
            }}
            className={`flex-1 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
              allActive
                ? 'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
          >
            <span>{allActive ? '🛑' : '👑'}</span>
            <span>{allActive ? 'Desactivar Emperador IA (Pausar todos)' : 'Activar Emperador IA (Todos los planetas)'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold uppercase transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

