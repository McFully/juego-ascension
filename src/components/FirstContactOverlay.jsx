import React, { useState, useEffect, useRef } from 'react';


const FIRST_CONTACT_DIALOGUES = {
  human: {
    greeting: "Enlace cuántico establecido. Soy la Embajadora Vaelen de la República Nova. Detectamos sus motores de salto en el cuadrante. Esperamos que su presencia traiga paz y prosperidad a este sector.",
    options: [
      { text: "🤝 Responder con paz y cooperar militarmente.", delta: 15 },
      { text: "⚖️ Mantener relaciones diplomáticas estrictamente formales.", delta: 0 },
      { text: "💀 Amenazar su soberanía y reclamar el sector.", delta: -20 }
    ]
  },
  cyborg: {
    greeting: "01001001. Procesando firma térmica orgánica. Unidad de comunicación activa. Colectivo Zenith requiere intercambio de algoritmos de desarrollo. La resistencia a la optimización es ineficiente.",
    options: [
      { text: "💾 Ofrecer protocolos de datos e integrarse.", delta: 10 },
      { text: "⚙️ Establecer interfaz de intercambio de baja prioridad.", delta: 0 },
      { text: "⚡ Denegar acceso y blindar redes locales.", delta: -15 }
    ]
  },
  synth: {
    greeting: "Escaneo completado. Arquitectura de vida basada en carbono detectada. Transmisión sintonizada. Registramos vuestras coordenadas imperiales. Iniciando análisis de comportamiento galáctico.",
    options: [
      { text: "🔮 Compartir datos estelares pacíficamente.", delta: 15 },
      { text: "📁 Limitar transmisión a comunicaciones estándar.", delta: 0 },
      { text: "🚫 Interrumpir telemetría y declarar hostilidad.", delta: -15 }
    ]
  },
  draconian: {
    greeting: "¡Grrr... intrusos del espacio profundo! El Alto Consejo Drakon observa vuestras insignificantes colonias. Vuestros cascos de metal roban nuestra luz estelar. Rendir tributo u observar la ira del Imperio Draconiano.",
    options: [
      { text: "🛡️ Declarar intenciones pacíficas pero firmes.", delta: 5 },
      { text: "💰 Ofrecer un saludo diplomático distante.", delta: -5 },
      { text: "⚔️ Desafiar sus amenazas con insolencia.", delta: -25 }
    ]
  },
  drakon: {
    greeting: "¡Grrr... intrusos del espacio profundo! El Alto Consejo Drakon observa vuestras insignificantes colonias. Vuestros cascos de metal roban nuestra luz estelar. Rendir tributo u observar la ira del Imperio Draconiano.",
    options: [
      { text: "🛡️ Declarar intenciones pacíficas pero firmes.", delta: 5 },
      { text: "💰 Ofrecer un saludo diplomático distante.", delta: -5 },
      { text: "⚔️ Desafiar sus amenazas con insolencia.", delta: -25 }
    ]
  },
  vortex: {
    greeting: "Ondas gravitacionales colapsando... canal dimensional estabilizado. El Nexo del Vórtice os percibe. Sois fluctuaciones en el vacío estelar. Buscamos resonancia... ¿o interferencia?",
    options: [
      { text: "🌀 Sintonizar nuestras frecuencias con el Vórtice.", delta: 15 },
      { text: "⚓ Mantener escudos deflectores activos y observar.", delta: 0 },
      { text: "💥 Dispersar sus campos con energía disruptiva.", delta: -20 }
    ]
  },
  umbra: {
    greeting: "Señal encriptada. Sombras espaciales se deslizan en vuestro sensor orbital. El Enjambre Umbra escucha vuestras transmisiones térmicas. Os observamos desde el abismo de la nebulosa.",
    options: [
      { text: "👁️ Enviar señales de luz blanca y paz interestelar.", delta: 10 },
      { text: "🛰️ Reforzar satélites de escucha en la frontera.", delta: 0 },
      { text: "🔥 Purgar señales oscuras del espacio local.", delta: -20 }
    ]
  },
  default: {
    greeting: "Frecuencia sintonizada. Saludos del mando estelar del sector. Detectamos su baliza cuántica activa. Identifique su civilización y declare intenciones.",
    options: [
      { text: "🤝 Venimos en son de paz y hermandad estelar.", delta: 10 },
      { text: "⚖️ Saludos. Mantengamos fronteras soberanas y comercio.", delta: 0 },
      { text: "🚀 Vuestras posesiones ahora pertenecen a nuestra corona.", delta: -20 }
    ]
  }
};

const FirstContactOverlay = ({ activeFirstContact, dispatch }) => {
  const [decodingProgress, setDecodingProgress] = useState(0);
  const [isDecoding, setIsDecoding] = useState(true);
  const [typedText, setTypedText] = useState("");
  const typingTimerRef = useRef(null);

  const factionKey = activeFirstContact?.faction || 'default';
  const data = FIRST_CONTACT_DIALOGUES[factionKey] || FIRST_CONTACT_DIALOGUES.default;
  const greeting = data.greeting;

  // 1. Simular decodificación de señal inicial
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setIsDecoding(false);
      }
      setDecodingProgress(progress);
    }, 120);

    // Safety timeout: auto-dismiss after 30 seconds if stuck
    const safetyTimer = setTimeout(() => {
      dispatch({ type: 'DISMISS_FIRST_CONTACT' });
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [dispatch]);

  // 2. Efecto de texto progresivo y activación de voz procedimental al terminar la decodificación
  useEffect(() => {
    if (isDecoding || !activeFirstContact) return;



    let index = 0;
    setTypedText("");

    const typeNextChar = () => {
      if (index < greeting.length) {
        setTypedText(prev => prev + greeting[index]);
        index++;
        // Velocidad de escritura adaptativa
        const char = greeting[index - 1];
        let delay = 35;
        if (char === '.' || char === '!' || char === '?') delay = 350;
        else if (char === ',' || char === ';') delay = 150;
        
        typingTimerRef.current = setTimeout(typeNextChar, delay);
      }
    };

    typeNextChar();

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [isDecoding, greeting, factionKey, activeFirstContact?.name]);

  if (!activeFirstContact) return null;

  const handleSelectOption = (delta) => {
    dispatch({
      type: 'DISCOVER_AI',
      aiId: activeFirstContact.id,
      relationDelta: delta
    });
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
      {/* Film grain effect & scanlines specific to transmissions */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.7)_2px,rgba(255,255,255,0.7)_4px)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)]" />

      <div className="relative max-w-2xl w-full border border-white/10 bg-[#070b14]/90 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-500/40" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-500/40" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-500/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-500/40" />

        {/* Close button always visible */}
        <button onClick={() => { dispatch({ type: 'DISMISS_FIRST_CONTACT' }); }}
          className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all text-sm cursor-pointer"
          title="Cerrar (Escape)"
        >
          ✕
        </button>

        {isDecoding ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 border-t-4 border-r-4 border-cyan-400 rounded-full animate-spin" />
            </div>
            <h2 className="text-lg text-cyan-400 font-bold uppercase tracking-wider mb-2 animate-pulse">
              📡 Captando Señal de Radio Estelar
            </h2>
            <div className="text-[10px] text-slate-500 mb-6">
              COODENADAS: G{activeFirstContact.galaxy} - S{activeFirstContact.system} - P{activeFirstContact.position}
            </div>
            
            <div className="w-64 bg-slate-800/50 border border-slate-700 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-cyan-500 h-full rounded-full transition-all duration-150" 
                style={{ width: `${decodingProgress}%` }}
              />
            </div>
            <div className="text-xs text-cyan-300 font-bold">
              DECODIFICANDO SECUENCIA FRECUENCIAL: {decodingProgress}%
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Header: Sintonización exitosa */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                  Transmisión Establecida
                </span>
                <h2 className="text-xl font-black text-white mt-2">
                  PRIMER CONTACTO: {activeFirstContact.name || activeFirstContact.empireName}
                </h2>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <div>Firma: <span className={`font-bold capitalize ${getFactionColor()}`}>{factionKey}</span></div>
                <div>Planeta: {activeFirstContact.name}</div>
              </div>
            </div>

            {/* Video Feed / Waveform area */}
            <div className="relative w-full h-32 bg-[#03060d] border border-white/5 rounded-lg flex items-center justify-center overflow-hidden">
              {/* Grid backdrop */}
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)]" style={{ backgroundSize: '16px 16px' }} />
              
              {/* Radar circular sweeping lines */}
              <div className="absolute w-28 h-28 border border-cyan-500/10 rounded-full animate-ping" />
              
              {/* Oscilloscope wave simulator */}
              <div className="flex items-center gap-1">
                {[...Array(24)].map((_, i) => {
                  const delay = i * 0.08;
                  return (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-bounce`}
                      style={{ 
                        height: `${15 + Math.sin(i * 0.4) * 35 + Math.random() * 20}px`,
                        animationDelay: `${delay}s`,
                        animationDuration: '1.2s'
                      }}
                    />
                  );
                })}
              </div>

              <div className="absolute bottom-2 left-2 text-[9px] text-slate-500 flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Audio Activo / Traductor Cuántico Conectado
              </div>
            </div>

            {/* Dialogue text box */}
            <div className="bg-[#03060d]/80 border border-white/5 rounded-lg p-5 min-h-[100px] text-slate-200 text-sm leading-relaxed whitespace-pre-line relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-wider select-none">
                Mensaje Entrante
              </div>
              <p className="font-sans font-medium">{typedText}</p>
              {typedText.length < greeting.length && (
                <span className="inline-block w-2.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
              )}
            </div>

            {/* Response options */}
            {typedText.length >= greeting.length && (
              <div className="space-y-2.5 pt-2 animate-slideUp">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">
                  Selecciona una respuesta para el canal diplomático:
                </div>
                {data.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt.delta)}
                    className="w-full text-left px-5 py-3 rounded-lg border border-white/10 hover:border-cyan-500/40 bg-white/[0.01] hover:bg-cyan-500/[0.04] text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center justify-between group cursor-pointer"
                  >
                    <span>{opt.text}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 font-bold">
                      {opt.delta > 0 ? `+${opt.delta}` : opt.delta} Relación
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

export default FirstContactOverlay;
