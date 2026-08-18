import React, { useState, useEffect, useRef } from 'react';


const ActiveTransmissionOverlay = ({ activeTransmission, dispatch }) => {
  const [decodingProgress, setDecodingProgress] = useState(0);
  const [isDecoding, setIsDecoding] = useState(true);
  const [typedText, setTypedText] = useState("");
  const typingTimerRef = useRef(null);

  const factionKey = activeTransmission?.faction || 'default';
  const greeting = activeTransmission?.message || "";

  // 1. Decodificar señal rápidamente
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsDecoding(false);
      }
      setDecodingProgress(progress);
    }, 60);

    // Safety timeout: auto-dismiss after 30 seconds if stuck
    const safetyTimer = setTimeout(() => {
      dispatch({ type: 'DISMISS_TRANSMISSION' });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [dispatch]);

  // 2. Transmisión typewriter y voz procedimental
  useEffect(() => {
    if (isDecoding || !activeTransmission) return;



    let index = 0;
    setTypedText("");

    const typeNextChar = () => {
      if (index < greeting.length) {
        setTypedText(prev => prev + greeting[index]);
        index++;
        const char = greeting[index - 1];
        let delay = 30;
        if (char === '.' || char === '!' || char === '?') delay = 300;
        else if (char === ',' || char === ';') delay = 120;
        
        typingTimerRef.current = setTimeout(typeNextChar, delay);
      }
    };

    typeNextChar();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [isDecoding, greeting, factionKey, activeTransmission?.name]);

  if (!activeTransmission) return null;

  const handleSelectOption = (action) => {
    dispatch(action);
  };

  const getFactionColor = () => {
    switch (factionKey) {
      case 'cyborg': return 'text-cyan-400 border-cyan-500/50 shadow-cyan-500/20';
      case 'synth': return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
      case 'draconian':
      case 'drakon': return 'text-red-500 border-red-500/50 shadow-red-500/20';
      case 'vortex': return 'text-purple-400 border-purple-500/50 shadow-purple-500/20';
      case 'umbra': return 'text-fuchsia-500 border-fuchsia-500/50 shadow-fuchsia-500/20';
      default: return 'text-amber-400 border-amber-500/50 shadow-amber-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020408]/95 backdrop-blur-md p-4 overflow-hidden select-none font-mono">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.7)_2px,rgba(255,255,255,0.7)_4px)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

      <div className="relative max-w-xl w-full border border-white/10 bg-[#070b14]/90 rounded-xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Decorative brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-500/40" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-500/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-500/40" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-500/40" />

        {/* Close button always visible */}
        <button onClick={() => { dispatch({ type: 'DISMISS_TRANSMISSION' }); }}
          className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm cursor-pointer"
          title="Cerrar (Escape)"
        >
          ✕
        </button>

        {isDecoding ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative w-14 h-14 mb-6">
              <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-t-4 border-r-4 border-amber-400 rounded-full animate-spin" />
            </div>
            <h2 className="text-sm text-amber-400 font-bold uppercase tracking-wider mb-2 animate-pulse">
              📡 Transmisión Interestelar Entrante
            </h2>
            <div className="w-48 bg-slate-800/50 border border-slate-700 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-100" 
                style={{ width: `${decodingProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-amber-300 font-bold">
              CONECTANDO CANAL: {decodingProgress}%
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] bg-amber-500/20 border border-amber-500/40 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">
                  📞 Transmisión en Vivo
                </span>
                <h2 className="text-sm font-bold text-white mt-1.5">
                  INTERRUPCIÓN ESTRATÉGICA: {activeTransmission.name}
                </h2>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>Facción: <span className={`font-bold capitalize ${getFactionColor()}`}>{factionKey}</span></div>
              </div>
            </div>

            {/* Waveform */}
            <div className="relative w-full h-20 bg-[#03060d] border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)]" style={{ backgroundSize: '12px 12px' }} />
              
              <div className="flex items-center gap-1.5">
                {[...Array(18)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-0.5 h-6 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-bounce"
                    style={{ 
                      height: `${10 + Math.sin(i * 0.5) * 20 + Math.random() * 10}px`,
                      animationDelay: `${i * 0.05}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Transmission text */}
            <div className="bg-[#03060d]/80 border border-white/5 rounded-lg p-4 min-h-[80px] text-slate-200 text-xs leading-relaxed whitespace-pre-line relative">
              <p className="font-sans font-medium">{typedText}</p>
              {typedText.length < greeting.length && (
                <span className="inline-block w-2 h-3 ml-1 bg-amber-400 animate-pulse align-middle" />
              )}
            </div>

            {/* Action Buttons */}
            {typedText.length >= greeting.length && (
              <div className="space-y-2 pt-1 animate-slideUp">
                {activeTransmission.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.action)}
                    className="w-full text-left px-4 py-2.5 rounded-lg border border-white/10 hover:border-amber-500/40 bg-white/[0.01] hover:bg-amber-500/[0.04] text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center justify-between group cursor-pointer"
                  >
                    <span>{opt.text}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-amber-400 font-bold font-mono">
                      Seleccionar
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTransmissionOverlay;
