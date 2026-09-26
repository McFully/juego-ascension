import React, { useState, useEffect } from 'react';
import { sfx, speakText, playVoice, stopVoice } from '../../audio';
import { TacticalHologramAvatar } from './TacticalHologramAvatar';

const FREQ_MAP = {
  player: 540,
  warlord: 220,
  merchant: 680,
  scientist: 820,
  cyborg: 320,
  vortex: 950,
};

/**
 * Consola Táctica de Comunicación Interestelar / Primer Contacto y Diálogos
 */
export const DialogueBox2D = ({
  isOpen = true,
  speakerSide = 'right', // 'left' (Jugador) | 'right' (Interlocutor)
  speakerName = 'Emisario Galáctico',
  speakerRole = 'Líder de Facción',
  leftCharacter = { name: 'Comandante Imperial', avatarKey: 'player' },
  rightCharacter = { name: 'Gran Señor Kaelen', avatarKey: 'warlord' },
  message = '¿Te atreves a desafiar nuestra hegemonía en el sector? Exigimos tributo inmediato de mineral o tus silos arderán.',
  voiceKey = null,
  options = [
    { text: '⚔️ Rechazar ultimátum y declarar hostilidad.', actionKey: 'reject', variant: 'danger' },
    { text: '🤝 Proponer tratado de no agresión y abrir comercio.', actionKey: 'trade', variant: 'peace' },
    { text: '💰 Pagar 10.000 de Metal para comprar tiempo.', actionKey: 'tribute', variant: 'neutral' }
  ],
  onSelectOption,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Efecto máquina de escribir con bips y reproducción de voz HD (con fallback TTS)
  useEffect(() => {
    setDisplayedText('');
    setIsTypingComplete(false);

    // Mapear voz HD según prop explícito o avatar del interlocutor
    const activeAvatar = speakerSide === 'left' ? leftCharacter.avatarKey : rightCharacter.avatarKey;
    const resolvedVoiceKey = voiceKey || (
      activeAvatar === 'cyborg' ? 'diplo_cyborg_greeting' :
      activeAvatar === 'vortex' ? 'diplo_vortex_greeting' :
      activeAvatar === 'warlord' ? 'diplo_draconian_greeting' :
      activeAvatar === 'merchant' ? 'diplo_solaris_greeting' :
      activeAvatar === 'scientist' ? 'diplo_synth_greeting' :
      null
    );

    if (resolvedVoiceKey) {
      playVoice(resolvedVoiceKey);
    }
    let index = 0;

    const toneFreq = FREQ_MAP[activeAvatar] || 500;

    const timer = setInterval(() => {
      if (index < message.length) {
        const char = message.charAt(index);
        setDisplayedText(prev => prev + char);
        index++;
        if (char !== ' ' && index % 2 === 0) {
          try {
            sfx.dialogChar(toneFreq);
          } catch (_) {}
        }
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 20);

    return () => {
      clearInterval(timer);
      stopVoice();
    };
  }, [message, speakerSide, voiceKey, leftCharacter.avatarKey, rightCharacter.avatarKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black/75 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200 pointer-events-auto">
      {/* Escena de Enlace Holográfico Táctico de Puente de Mando */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-end px-4 sm:px-12 md:px-20 mb-4 z-10 pointer-events-none select-none">
        {/* Terminal Izquierdo: Comandante Imperial */}
        <TacticalHologramAvatar
          avatarKey={leftCharacter.avatarKey}
          name={leftCharacter.name}
          isSpeaker={speakerSide === 'left'}
          factionTone="cyan"
        />

        {/* Indicador de Transmisión Cuántica en el centro */}
        <div className="hidden sm:flex flex-col items-center mb-6 opacity-75">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>ENLACE TÁCTICO CUÁNTICO ACTIVO</span>
          </div>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-2" />
        </div>

        {/* Terminal Derecho: Interlocutor Alien / NPC */}
        <TacticalHologramAvatar
          avatarKey={rightCharacter.avatarKey}
          name={rightCharacter.name}
          isSpeaker={speakerSide === 'right'}
          factionTone={
            rightCharacter.avatarKey === 'warlord' ? 'red' :
            rightCharacter.avatarKey === 'vortex' ? 'purple' :
            rightCharacter.avatarKey === 'cyborg' ? 'emerald' :
            'amber'
          }
        />
      </div>

      {/* Consola Militar de Transmisión y Respuesta */}
      <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-[#0a0f24]/98 via-[#060a17]/98 to-[#03060f]/98 border border-cyan-500/40 rounded-2xl p-5 md:p-7 shadow-[0_0_40px_rgba(6,182,212,0.2)] relative z-20 backdrop-blur-xl">
        {/* Barra de cabecera con telemetría de enlace */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <div className="bg-[#0b132b] text-cyan-300 text-xs font-mono font-bold uppercase px-3 py-1 rounded-lg border border-cyan-500/40 tracking-wider flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span>{speakerName}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-normal">{speakerRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline font-mono text-xs text-slate-500">CANAL SEC-09 // PROTOCOLO DE CONTACTO</span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-[#121c3b] border border-cyan-500/40 text-slate-300 hover:text-white hover:border-cyan-400 hover:bg-cyan-950 font-mono text-xs flex items-center justify-center shadow transition-all cursor-pointer"
                title="Cerrar Transmisión"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Texto Teletipo de la Transmisión */}
        <div className="min-h-[56px] max-h-[150px] overflow-y-auto pr-2 text-sm md:text-base text-slate-100 font-mono font-medium leading-relaxed mb-4">
          {displayedText}
          {!isTypingComplete && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Opciones de Interacción Táctica — Siempre en una única línea uniforme */}
        <div className="pt-3 border-t border-white/10 w-full">
          <div className="grid grid-flow-col auto-cols-fr gap-2.5 w-full items-center">
            {options.map((opt, i) => {
              const isDanger = opt.variant === 'danger';
              const isPeace = opt.variant === 'peace';

              let btnClasses = 'border font-mono font-bold px-2.5 py-2.5 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis w-full min-w-0 ';
              
              // Ajuste dinámico de tamaño de fuente según longitud del texto
              const len = (opt.text || '').length;
              const textSizeClass = len > 50 ? 'text-[10px] md:text-[11px]' : len > 35 ? 'text-[11px] md:text-xs' : 'text-xs md:text-sm';

              if (isDanger) {
                btnClasses += `bg-red-950/60 border-red-500/60 text-red-200 hover:bg-red-900/80 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)] ${textSizeClass}`;
              } else if (isPeace) {
                btnClasses += `bg-emerald-950/60 border-emerald-500/60 text-emerald-200 hover:bg-emerald-900/80 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] ${textSizeClass}`;
              } else {
                btnClasses += `bg-cyan-950/60 border-cyan-500/60 text-cyan-200 hover:bg-cyan-900/80 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ${textSizeClass}`;
              }

              return (
                <button
                  key={i}
                  onClick={() => onSelectOption?.(opt.actionKey)}
                  className={btnClasses}
                  title={opt.text}
                >
                  <span className="truncate w-full text-center">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};