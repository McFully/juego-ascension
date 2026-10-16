import React, { useState, useEffect, useMemo } from 'react';
import { StarField } from '../ui.jsx';
import { SafeImg } from '../assets.jsx';

export const NewGameScreen = ({ onConfirm, onBack, availableSaves = [] }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('standard');
  const [maxStandardPlanets, setMaxStandardPlanets] = useState(0);

  useEffect(() => {
    let maxCount = 0;
    if (Array.isArray(availableSaves)) {
      for (const s of availableSaves) {
        if (s.gameMode === 'standard' || !s.gameMode) {
          maxCount = Math.max(maxCount, s.planetCount || 0);
        }
      }
    }
    setMaxStandardPlanets(maxCount);
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

      {/* Contenido Principal a Pantalla Completa Centrado en Altura con Grid Unificado 4x2 */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-4 flex-1 flex flex-col justify-center">
        <div className="w-full my-auto space-y-4">


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 w-full items-stretch">
            
            {/* Casilla 1: Identificación de Comandante (Mismas dimensiones y estilo de tarjeta) */}
            <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#101c38]/95 via-[#091226]/90 to-[#05070f] shadow-[0_0_25px_rgba(6,182,212,0.25)] select-none text-left min-h-[290px]">
              <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                <SafeImg
                  id="councilChamber"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091226]/80 via-transparent to-transparent pointer-events-none" />
              </div>

              <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider font-mono block">
                    Identificación de Comandante
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NOMBRE CLAVE"
                    maxLength={20}
                    className="w-full bg-black/70 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm font-black italic tracking-wider uppercase focus:border-cyan-300 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all outline-none text-white font-mono"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 font-mono leading-tight">
                    Registrado en los archivos del Consejo Galáctico y flotas imperiales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || !gameModes.find(m => m.id === mode)?.unlocked}
                  className="w-full h-10 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer shrink-0"
                >
                  Iniciar Expedición
                </button>
              </div>
            </div>

            {/* Casilla 2: Modo 1 - Ascensión Estándar */}
            {(() => {
              const m = gameModes[0];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left cursor-pointer min-h-[290px] ${
                    isSelected
                      ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01]'
                      : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633]'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f]/80 via-transparent to-transparent pointer-events-none" />
                    {isSelected && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-4 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* Casilla 3: Modo 2 - Superviviente Solitario */}
            {(() => {
              const m = gameModes[1];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left min-h-[290px] ${
                    !isUnlocked
                      ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                      : isSelected
                        ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01] cursor-pointer'
                        : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className={`w-full h-full object-cover transition-transform duration-700 ${!isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:scale-105'}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    {isSelected && isUnlocked && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${!isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    {!isUnlocked && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                        <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                          <span>⚠️</span> Requisito:
                        </span>
                        <span>Requiere {m.reqPlanets} planetas en Ascensión Estándar ({maxStandardPlanets}/{m.reqPlanets}).</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* Casilla 4: Modo 3 - Imperio en Decadencia */}
            {(() => {
              const m = gameModes[2];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left min-h-[290px] ${
                    !isUnlocked
                      ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                      : isSelected
                        ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01] cursor-pointer'
                        : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className={`w-full h-full object-cover transition-transform duration-700 ${!isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:scale-105'}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    {isSelected && isUnlocked && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${!isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    {!isUnlocked && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                        <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                          <span>⚠️</span> Requisito:
                        </span>
                        <span>Requiere {m.reqPlanets} planetas en Ascensión Estándar ({maxStandardPlanets}/{m.reqPlanets}).</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* Casilla 5: Volver atrás (Mismas dimensiones y estilo alineada en fila 2) */}
            <button
              onClick={onBack}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0c1830]/95 via-[#081024]/90 to-[#05070f] hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:scale-[1.01] transition-all select-none text-left cursor-pointer min-h-[290px]"
            >
              <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                <SafeImg
                  id="modeCancel"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081024]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                    Volver atrás
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                    Retornar al panel principal y operaciones del mando.
                  </p>
                </div>
              </div>
            </button>

            {/* Casilla 6: Modo 4 - Hegemonía Corporativa */}
            {(() => {
              const m = gameModes[3];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left min-h-[290px] ${
                    !isUnlocked
                      ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                      : isSelected
                        ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01] cursor-pointer'
                        : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className={`w-full h-full object-cover transition-transform duration-700 ${!isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:scale-105'}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    {isSelected && isUnlocked && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${!isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    {!isUnlocked && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                        <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                          <span>⚠️</span> Requisito:
                        </span>
                        <span>Requiere {m.reqPlanets} planetas en Ascensión Estándar ({maxStandardPlanets}/{m.reqPlanets}).</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* Casilla 7: Modo 5 - Nébula de Guerra */}
            {(() => {
              const m = gameModes[4];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left min-h-[290px] ${
                    !isUnlocked
                      ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                      : isSelected
                        ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01] cursor-pointer'
                        : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className={`w-full h-full object-cover transition-transform duration-700 ${!isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:scale-105'}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    {isSelected && isUnlocked && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${!isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    {!isUnlocked && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                        <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                          <span>⚠️</span> Requisito:
                        </span>
                        <span>Requiere {m.reqPlanets} planetas en Ascensión Estándar ({maxStandardPlanets}/{m.reqPlanets}).</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

            {/* Casilla 8: Modo 6 - Multijugador Galáctico */}
            {(() => {
              const m = gameModes[5];
              const isSelected = mode === m.id;
              const isUnlocked = m.unlocked;
              return (
                <button
                  key={m.id}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && setMode(m.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left min-h-[290px] ${
                    !isUnlocked
                      ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                      : isSelected
                        ? 'border-cyan-300 bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.01] cursor-pointer'
                        : 'border-white/10 bg-[#090d1f]/80 hover:border-white/25 hover:bg-[#0e1633] cursor-pointer'
                  }`}
                >
                  <div className="relative w-full h-32 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
                    <SafeImg
                      id={m.assetId}
                      className={`w-full h-full object-cover transition-transform duration-700 ${!isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:scale-105'}`}
                    />
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                        <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                        <span>🔒</span>
                        <span>BLOQUEADO</span>
                      </span>
                    )}
                    {isSelected && isUnlocked && (
                      <div className="absolute top-2.5 left-2.5 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center text-black font-black text-xs shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${!isUnlocked ? 'text-slate-400' : isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-3 leading-relaxed">
                        {m.desc}
                      </p>
                    </div>
                    {!isUnlocked && (
                      <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                        <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                          <span>⚠️</span> Requisito:
                        </span>
                        <span>Modo en desarrollo activo. Próximamente disponible.</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })()}

          </div>
        </div>
      </div>


    </div>
  );
};

export default NewGameScreen;
