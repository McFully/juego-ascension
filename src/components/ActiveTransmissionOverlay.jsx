import React, { useState, useEffect } from 'react';
import { DialogueBox2D } from './dialogue/DialogueBox2D.jsx';

const ActiveTransmissionOverlay = ({ activeTransmission, dispatch }) => {
  const [decodingProgress, setDecodingProgress] = useState(0);
  const [isDecoding, setIsDecoding] = useState(true);

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

  // 2. Control de cierre y ciclo de vida de la transmisión
  useEffect(() => {
    if (!activeTransmission) return;
  }, [activeTransmission]);

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

  const getAvatarKey = () => {
    switch (factionKey) {
      case 'cyborg':
      case 'synth':
        return 'cyborg';
      case 'vortex':
      case 'umbra':
        return 'vortex';
      case 'draconian':
      case 'drakon':
        return 'warlord';
      default:
        return 'merchant';
    }
  };

  const getSpeakerRole = () => {
    switch (factionKey) {
      case 'cyborg': return 'Enlace de Datos Sintético';
      case 'synth': return 'Mente Cuántica';
      case 'vortex': return 'Emisario del Abismo';
      case 'umbra': return 'Sombras del Vacío';
      case 'draconian':
      case 'drakon': return 'Comandante Bélico';
      default: return 'Oficial de Comunicaciones';
    }
  };

  const getVoiceKey = () => {
    switch (factionKey) {
      case 'umbra': return 'diplo_umbra_greeting';
      case 'vortex': return 'diplo_vortex_greeting';
      case 'cyborg': return 'diplo_cyborg_greeting';
      case 'synth': return 'diplo_synth_greeting';
      case 'draconian':
      case 'drakon': return 'diplo_draconian_greeting';
      case 'helios': return 'diplo_helios_greeting';
      case 'solaris': return 'diplo_solaris_greeting';
      case 'human': return 'diplo_human_greeting';
      default: return 'diplo_umbra_greeting';
    }
  };

  return (
    <DialogueBox2D
      isOpen={true}
      speakerSide="right"
      speakerName={activeTransmission.name || 'Emisario Estelar'}
      speakerRole={getSpeakerRole()}
      leftCharacter={{ name: 'Comandante Imperial', avatarKey: 'player' }}
      rightCharacter={{ 
        name: activeTransmission.name || 'Transmisión Extraterrestre', 
        avatarKey: getAvatarKey() 
      }}
      message={greeting}
      voiceKey={getVoiceKey()}
      options={(activeTransmission.options || []).map((opt, i) => ({
        text: opt.text,
        actionKey: String(i),
        variant: i === 0 ? 'peace' : i === 1 ? 'neutral' : 'danger'
      }))}
      onSelectOption={(idxStr) => {
        const idx = parseInt(idxStr, 10);
        const opt = activeTransmission.options?.[idx];
        if (opt) {
          handleSelectOption(opt.action);
        }
      }}
      onClose={() => dispatch({ type: 'DISMISS_TRANSMISSION' })}
    />
  );
};

export default ActiveTransmissionOverlay;
