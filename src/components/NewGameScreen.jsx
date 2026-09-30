import React, { useState, useEffect, useMemo } from 'react';
import { StarField } from '../ui.jsx';
import { SafeImg } from '../assets.jsx';

export const NewGameScreen = ({ onConfirm, onBack, availableSaves = [] }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('standard');
  const [maxStandardPlanets, setMaxStandardPlanets] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const calculateRecord = async () => {
      let maxCount = 0;

      if (Array.isArray(availableSaves)) {
        for (const s of availableSaves) {
          if (s.gameMode === 'standard' || !s.gameMode) {
            maxCount = Math.max(maxCount, s.planetCount || 0);
          }
        }
      }

      if (window.electronAPI && window.electronAPI.loadSaveBySlug && Array.isArray(availableSaves)) {
        try {
          for (const s of availableSaves) {
            const res = await window.electronAPI.loadSaveBySlug(s.slug);
            if (res && res.success && res.data) {
              const saveMode = res.data.gameMode || 'standard';
              if (saveMode === 'standard') {
                const count = Array.isArray(res.data.planets) ? res.data.planets.length : 0;
                if (count > maxCount) maxCount = count;
              }
            }
          }
        } catch (_) {}
      }


      if (isMounted) {
        setMaxStandardPlanets(maxCount);
      }
    };

    calculateRecord();
    return () => { isMounted = false; };
  }, [availableSaves]);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2 && trimmed.length <= 20;

  const gameModes = useMemo(() => [
    { 
      id: 'standard', 
      title: 'Ascensión Estándar', 
      icon: '⭐',
      assetId: 'modeStandard',
      badge: 'CLÁSICO',
      badgeColor: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/50',
      desc: 'Experiencia clásica y equilibrada. Coloniza mundos vírgenes, investiga el árbol tecnológico y domina a las IAs rivales.',
      unlocked: true,
      reqPlanets: 0
    },
    { 
      id: 'survivor', 
      title: 'Superviviente Solitario', 
      icon: '⚠️',
      assetId: 'modeSurvivor',
      badge: 'DESAFÍO',
      badgeColor: 'bg-amber-500/30 text-amber-200 border-amber-400/50',
      desc: 'Sin planeta natal garantizado. Comienzas con recursos de emergencia críticos en una nave nodriza dañada.',
      unlocked: maxStandardPlanets >= 10,
      reqPlanets: 10
    },
    { 
      id: 'decay', 
      title: 'Imperio en Decadencia', 
      icon: '🏛️',
      assetId: 'modeDecay',
      badge: 'COLAPSO',
      badgeColor: 'bg-rose-500/30 text-rose-200 border-rose-400/50',
      desc: 'Gestiona un imperio extenso en rápida fragmentación política. Estabiliza ministerios antes de que la anarquía lo consuma.',
      unlocked: maxStandardPlanets >= 20,
      reqPlanets: 20
    },
    { 
      id: 'corporate', 
      title: 'Hegemonía Corporativa', 
      icon: '💰',
      assetId: 'modeCorporate',
      badge: 'COMERCIO',
      badgeColor: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50',
      desc: 'Doctrina de mercado libre galáctico. Impon tu divisa, adquiere licencias y compra sistemas estelares enteros.',
      unlocked: maxStandardPlanets >= 30,
      reqPlanets: 30
    },
    { 
      id: 'roguelike', 
      title: 'Nébula de Guerra', 
      icon: '💀',
      assetId: 'modeRoguelike',
      badge: 'HARDCORE',
      badgeColor: 'bg-purple-500/30 text-purple-200 border-purple-400/50',
      desc: 'Muerte permanente y niebla de combate total. Incursiones hostiles ultrarrápidas sin avisos tempranos.',
      unlocked: maxStandardPlanets >= 50,
      reqPlanets: 50
    },
    {
      id: 'multiplayer',
      title: 'Multijugador Galáctico',
      icon: '🌐',
      assetId: 'modeMultiplayer',
      badge: 'PRÓXIMAMENTE',
      badgeColor: 'bg-slate-500/30 text-slate-300 border-slate-400/50',
      desc: 'Guerra y diplomacia en tiempo real contra comandantes humanos a través del hiperespacio cuántico.',
      unlocked: false,
      isUpcoming: true
    }
  ], [maxStandardPlanets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedModeObj = gameModes.find(m => m.id === mode);
    if (isValid && selectedModeObj && selectedModeObj.unlocked) {
      onConfirm(trimmed, mode);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-white flex flex-col justify-between p-4 md:p-8 select-none font-sans relative overflow-x-hidden">
      <StarField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Contenido Principal a Pantalla Completa Centrado en Altura */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-4 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full my-auto">
          
          {/* Panel Izquierdo: Identidad y Cancelar Expedición (Columna 4) */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-5">
            {/* Formulario de Mando */}
            <div className="bg-[#090d1f]/95 rounded-3xl p-6 border border-white/10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.25em] font-mono">
                  Identificación de Comandante
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NOMBRE CLAVE"
                  maxLength={20}
                  className="w-full bg-black/60 border border-cyan-500/40 rounded-2xl px-4 py-3.5 text-xl font-black italic tracking-wider uppercase focus:border-cyan-300 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all outline-none text-white font-mono"
                  autoFocus
                />
              </div>
              
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="text-base">🛡️</span>
                  <span className="text-[10px] font-black uppercase font-mono tracking-wider">Directiva Colonial</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  Tu nombre quedará registrado en los archivos del Consejo Galáctico y en los cuadros de mando de todas las estaciones y flotas.
                </p>
                {maxStandardPlanets > 0 && (
                  <p className="text-[11px] text-cyan-400/90 font-mono pt-1 border-t border-cyan-500/20">
                    Récord en Ascensión Estándar: <span className="font-bold text-white">{maxStandardPlanets}</span> planetas
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isValid || !gameModes.find(m => m.id === mode)?.unlocked}
                className="w-full h-14 rounded-2xl bg-cyan-500 text-black font-black text-base uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.35)] cursor-pointer"
              >
                <span>Comenzar Simulación</span>
                <span>➔</span>
              </button>
            </div>

            {/* Tarjeta de Retorno: Cancelar Expedición con Imagen Temática */}
            <button
              onClick={onBack}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0c1830]/95 via-[#081024]/90 to-[#05070f] hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:scale-[1.02] transition-all select-none text-left cursor-pointer min-h-[160px]"
            >
              <div className="relative w-full h-24 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                <SafeImg
                  id="modeCancel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081024]/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 backdrop-blur-md">
                  RETORNO
                </span>
                <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-cyan-300">
                  <span className="text-lg">◀</span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">VOLVER</span>
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                  Cancelar Expedición
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Regresar a la selección de opciones del menú principal
                </p>
              </div>
            </button>
          </div>

          {/* Panel Derecho: Selección de Modo en Pantalla Completa (Columna 8) */}
          <div className="lg:col-span-8 flex flex-col justify-center gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-widest font-mono">
                Selecciona la Doctrina de Expedición
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                6 Modos Tácticos Disponibles
              </span>
            </div>
            
            {/* Grid de Modos con Banners de Imagen */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 flex-1">
              {gameModes.map(m => {
                const isSelected = mode === m.id;
                const isUnlocked = m.unlocked;

                return (
                  <button
                    key={m.id}
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && setMode(m.id)}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left ${
                      !isUnlocked 
                        ? 'opacity-60 cursor-not-allowed border-white/5 bg-[#070b16]/70 grayscale-[35%]' 
                        : isSelected 
                          ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.02] cursor-pointer' 
                          : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                    } min-h-[220px]`}
                  >
                    {/* Banner de Imagen Superior */}
                    <div className="relative w-full h-28 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                      <SafeImg
                        id={m.assetId}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isUnlocked ? 'group-hover:scale-105' : 'opacity-40'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f]/80 via-transparent to-transparent pointer-events-none" />
                      
                      <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${m.badgeColor}`}>
                        {m.badge}
                      </span>

                      {isSelected && isUnlocked && (
                        <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                          ✓
                        </div>
                      )}

                      {!isUnlocked && (
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/80 border border-amber-500/50 rounded-lg flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300">
                          <span>🔒</span>
                          <span>BLOQUEADO</span>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-3 flex items-center gap-1.5 text-white">
                        <span className="text-base">{m.icon}</span>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${
                          !isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'
                        }`}>
                          {m.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>

                      {/* Mensaje de desbloqueo o estado */}
                      {!isUnlocked && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90">
                          {m.isUpcoming ? (
                            <span>⏳ Modo en desarrollo activo</span>
                          ) : (
                            <span>🔒 Requiere {m.reqPlanets} planetas en Ascensión Estándar ({maxStandardPlanets}/{m.reqPlanets})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full flex items-center justify-center py-2">
        <div className="text-[10px] font-mono text-cyan-400/50 uppercase tracking-[0.3em]">
          Protocolo de Expedición Galáctica Activo
        </div>
      </div>
    </div>
  );
};

export default NewGameScreen;
