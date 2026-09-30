import React, { useState, useEffect, useRef } from 'react';
import { DialogueBox2D } from './dialogue/DialogueBox2D.jsx';

/**
 * ⚠️ SIN USO desde el paso 3.4 — no se monta en `AppOverlays.jsx`.
 *
 * El primer contacto ya no interrumpe la partida: se vuelca a
 * `state.tacticalEventLog` (kind: 'firstContact') y se lee en la bandeja,
 * `src/pages/TelemetryPage.jsx`.
 *
 * Se conserva, sin borrar: los `FIRST_CONTACT_DIALOGUES` de aquí son guion, y
 * `DialogueBox2D` sigue usándose (por ejemplo, para el ultimátum, que sí es
 * bloqueante).
 */

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
      case 'cyborg': return 'Mente Colectiva Cuántica';
      case 'synth': return 'Nodo Lógico Sintético';
      case 'vortex': return 'Entidad del Abismo';
      case 'umbra': return 'Consciencia Oscura';
      case 'draconian':
      case 'drakon': return 'Señor de Guerra Draconiano';
      default: return 'Delegado Diplomático';
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
      default: return 'diplo_solaris_greeting';
    }
  };

  return (
    <DialogueBox2D
      isOpen={true}
      speakerSide="right"
      speakerName={activeFirstContact.empireName || activeFirstContact.name || 'Civilización Desconocida'}
      speakerRole={getSpeakerRole()}
      leftCharacter={{ name: 'Comandante Imperial', avatarKey: 'player' }}
      rightCharacter={{ 
        name: activeFirstContact.empireName || activeFirstContact.name || 'Emisario Alienígena', 
        avatarKey: getAvatarKey() 
      }}
      message={greeting}
      voiceKey={getVoiceKey()}
      options={data.options.map((opt, i) => ({
        text: opt.text,
        actionKey: String(i),
        variant: opt.delta > 0 ? 'peace' : opt.delta < 0 ? 'danger' : 'neutral'
      }))}
      onSelectOption={(idxStr) => {
        const idx = parseInt(idxStr, 10);
        const opt = data.options[idx];
        if (opt) {
          handleSelectOption(opt.delta);
        }
      }}
      onClose={() => dispatch({ type: 'DISMISS_FIRST_CONTACT' })}
    />
  );
};

export default FirstContactOverlay;
