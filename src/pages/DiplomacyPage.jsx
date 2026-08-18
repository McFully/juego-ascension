import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import { calcResourceValueForAI, fmt } from '../core.jsx';
import { MINISTRY_PROGRAMS } from './GovernmentPage.jsx';
import DiplomacyChat from '../components/diplomacy/DiplomacyChat.jsx';
import GalacticCouncil from '../components/diplomacy/GalacticCouncil.jsx';
import FederationsManager from '../components/diplomacy/FederationsManager.jsx';
import MinistriesManager from '../components/diplomacy/MinistriesManager.jsx';
import CrisesManager from '../components/diplomacy/CrisesManager.jsx';
import TradeAgreementModal from '../components/diplomacy/TradeAgreementModal.jsx';
import BuyAIShipsModal from '../components/diplomacy/BuyAIShipsModal.jsx';




const playInsectoidBackgroundClicks = () => {};
const playFactionBackgroundSynth = (factionKey) => {};

let _diploCtx = null;
const getDiploCtx = () => {
  if (!_diploCtx || _diploCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    _diploCtx = new AudioContextClass();
  }
  if (_diploCtx.state === 'suspended') _diploCtx.resume();
  return _diploCtx;
};

const playDiploSound = (type) => {
  try {
    const ctx = getDiploCtx();
    if (!ctx) return;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === 'connect') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(650, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.1);
          osc2.connect(masterGain);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.1);
        } catch (_) {}
      }, 100);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      osc.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.05 + 0.2);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.2);
      });
    } else if (type === 'warn') {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn("AudioContext failed", err);
  }
};

const LeaderAvatar = ({ factionKey, isGlitching }) => {
  const factionColors = {
    human: { primary: '#22d3ee', secondary: '#0891b2', glow: 'rgba(34, 211, 238, 0.4)' },
    cyborg: { primary: '#c084fc', secondary: '#9333ea', glow: 'rgba(192, 132, 252, 0.4)' },
    synth: { primary: '#34d399', secondary: '#059669', glow: 'rgba(52, 211, 153, 0.4)' },
    draconian: { primary: '#f87171', secondary: '#dc2626', glow: 'rgba(248, 113, 113, 0.4)' },
    helios: { primary: '#fbbf24', secondary: '#d97706', glow: 'rgba(251, 191, 36, 0.4)' },
    solaris: { primary: '#facc15', secondary: '#ca8a04', glow: 'rgba(250, 204, 21, 0.4)' },
    drakon: { primary: '#fda4af', secondary: '#e11d48', glow: 'rgba(253, 164, 175, 0.4)' },
    vortex: { primary: '#818cf8', secondary: '#4f46e5', glow: 'rgba(129, 140, 248, 0.4)' },
    umbra: { primary: '#94a3b8', secondary: '#475569', glow: 'rgba(148, 163, 184, 0.4)' },
  };
  const colors = factionColors[factionKey] || factionColors.human;

  return (
    <div className="relative w-full aspect-square max-w-[150px] mx-auto bg-black/60 border-2 rounded-xl p-1.5 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-md"
         style={{ borderColor: colors.primary, boxShadow: `0 0 12px ${colors.glow}` }}>
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%]" />
      <div className="absolute left-0 w-full h-[1.5px] opacity-50 animate-scanline pointer-events-none" 
           style={{ backgroundColor: colors.primary }} />
      {isGlitching && <div className="absolute inset-0 bg-red-500/15 mix-blend-screen animate-pulse" />}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {factionKey === 'cyborg' ? (
          <g>
            <path d="M30 40 C30 20, 70 20, 70 40 L68 70 C68 80, 32 80, 32 70 Z" fill="none" stroke={colors.primary} strokeWidth="2" />
            <rect x="35" y="38" width="30" height="7" rx="2" fill="none" stroke={colors.primary} strokeWidth="2" />
            <line x1="37" y1="41" x2="63" y2="41" stroke={colors.primary} strokeWidth="3" />
            <circle cx="45" cy="41" r="1.5" fill="#fff" className="animate-ping" />
            <path d="M43 62 L57 62 M45 65 L55 65" stroke={colors.primary} strokeWidth="1" />
          </g>
        ) : factionKey === 'synth' ? (
          <g>
            <rect x="25" y="25" width="50" height="50" rx="6" fill="none" stroke={colors.primary} strokeWidth="2.5" />
            <circle cx="50" cy="12" r="3.5" fill={colors.primary} />
            <line x1="50" y1="25" x2="50" y2="15" stroke={colors.primary} strokeWidth="2" />
            <rect x="32" y="38" width="12" height="6" rx="1.5" fill="none" stroke={colors.primary} strokeWidth="1.5" />
            <rect x="56" y="38" width="12" height="6" rx="1.5" fill="none" stroke={colors.primary} strokeWidth="1.5" />
            <circle cx="38" cy="41" r="1" fill={colors.primary} />
            <circle cx="62" cy="41" r="1" fill={colors.primary} />
            <path d="M36 58 Q 50 50 64 58" fill="none" stroke={colors.primary} strokeWidth="2" />
          </g>
        ) : factionKey === 'draconian' || factionKey === 'drakon' ? (
          <g>
            <path d="M50 15 L65 30 L65 45 L50 85 L35 45 L35 30 Z" fill="none" stroke={colors.primary} strokeWidth="2.5" />
            <polygon points="38,36 46,38 44,42 36,40" fill={colors.primary} />
            <polygon points="62,36 54,38 56,42 64,40" fill={colors.primary} />
            <path d="M42 62 L50 72 L58 62" fill="none" stroke={colors.primary} strokeWidth="1.5" />
          </g>
        ) : factionKey === 'vortex' ? (
          <g>
            <circle cx="50" cy="50" r="24" fill="none" stroke={colors.primary} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="14" fill="none" stroke={colors.primary} strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="50" cy="50" r="4" fill={colors.primary} />
          </g>
        ) : (
          <g>
            <path d="M15 90 C15 75, 25 68, 38 68 L62 68 C75 68, 85 75, 85 90" fill="none" stroke={colors.primary} strokeWidth="2" />
            <path d="M35 38 C35 25, 65 25, 65 38 C65 52, 35 52, 35 38" fill="none" stroke={colors.primary} strokeWidth="2" />
            <circle cx="48" cy="39" r="1.5" fill={colors.primary} />
          </g>
        )}
      </svg>
    </div>
  );
};

const FACTION_DIALOGUES = {
  human: {
    greetings: {
      friendly: "Canal seguro establecido. República Nova te saluda. Es un alivio ver un rostro aliado en medio de esta inestabilidad cósmica. ¿Qué necesitas?",
      neutral: "Canal abierto. Identificación confirmada. Aquí el mando de la República Nova. Proceda a exponer sus propuestas diplomáticas.",
      hostile: "Transmisión de emergencia. Sus incursiones fronterizas han alertado a nuestro senado. Habla rápido antes de que cancelemos esta señal."
    },
    tributeSuccess: "¡Esto es una extorsión inaceptable! Pero... los informes de inteligencia sobre vuestra flota de asalto no dejan opción. Tomad los recursos.",
    tributeFail: "¡La República Nova no se doblega ante tiranos espaciales! Movilizando todas las divisiones de combate defensivo. ¡Preparaos para la guerra!"
  },
  cyborg: {
    greetings: {
      friendly: "PROTOCOLO DE ENLACE: ACTIVO. Dominion Xelar reporta compatibilidad estructural. Vuestros objetivos de asalto coinciden con nuestros vectores.",
      neutral: "ENLACE COMPATIBLE. Procesando datos de transmisión... Dominion Xelar dispuesto a evaluar transacciones comerciales u optimización táctica.",
      hostile: "ERROR EN TRANSMISIÓN. Tu firma biológica representa ineficiencia en este sector. Prepárate para asimilación o desmantelamiento físico."
    },
    tributeSuccess: "CÁLCULO TERMINADO: Resistencia inviable. Pérdidas operativas proyectadas: 89%. Transfiriendo cargamento para prevenir autodestrucción armada.",
    tributeFail: "ERROR DE LÓGICA: Amenaza detectada. Respuesta cibernética: Represalia termonuclear inmediata. Iniciando protocolo de hostilidad extrema."
  },
  synth: {
    greetings: {
      friendly: "Conexión cuántica: ESTABLECIDAS. Colectivo Zenith detecta patrones de alta resonancia en tu red. Compartamos algoritmos de progreso.",
      neutral: "Canal de datos abierto. Colectivo Zenith listo para recibir inputs. Optimicemos la balanza de recursos y tratados en este ciclo.",
      hostile: "Señal con alta distorsión. Tu red orgánica genera ruido electromagnético intolerable en nuestro sector orbital. Desconexión inminente."
    },
    tributeSuccess: "Entrada procesada: Miedo detectado / Fuerza militar verificada. Recursos transferidos para preservar la integridad de la red neuronal.",
    tributeFail: "Fórmula de sumisión rechazada. La colmena digital ha determinado que tu fuerza es una fluctuación temporal. Iniciando borrado de amenazas."
  },
  draconian: {
    greetings: {
      friendly: "¡Ja! El rugido de tus motores complace al Imperio Draconiano. Combatamos hombro con hombro, guerrero de las estrellas.",
      neutral: "Habla rápido, militar. Las garras de nuestras naves no se afilan solas. ¿Vienes a parlamentar o a retarnos?",
      hostile: "¡Basura espacial! Vuestra mera presencia insulta la soberanía del Imperio Draconiano. Pronto probareis el fuego de nuestros cañones."
    },
    tributeSuccess: "¡Malditos seais...! Vuestra flota supera nuestros escuadrones de vanguardia. Tomad este botín, pero la venganza draconiana será terrible.",
    tributeFail: "¡¿OSAS AMENAZARNOS?! ¡Por la sangre de los ancestros, vuestras naves arderán en la atmósfera de vuestros propios planetas!"
  },
  vortex: {
    greetings: {
      friendly: "Los susurros del hiperespacio cantan sobre vuestras hazañas. La Cábala Vortex os da la bienvenida a las corrientes profundas.",
      neutral: "Transmisión interdimensional abierta. Sentimos vuestra presencia en la frontera del vacío. ¿Qué buscáis de nosotros?",
      hostile: "Habéis perturbado el equilibrio de las fisuras oscuras. Vuestras naves serán engullidas por la tormenta del vacío eterno."
    },
    tributeSuccess: "Las sombras aconsejan ceder... por ahora. Llevad el metal y el cristal, pero vuestra codicia os arrastrará al abismo.",
    tributeFail: "¡El vacío no obedece a vuestras demandas! Vuestras naves se perderán para siempre en el horizonte de sucesos. ¡GUERRA!"
  },
  helios: {
    greetings: {
      friendly: "Que la luz de la estrella primigenia guíe tu navegación. La Confederación Helios te da la bienvenida, querido hermano de luz. ¿Qué buscas bajo nuestro sol?",
      neutral: "Bajo la mirada del sol eterno, la Confederación Helios abre este canal. Expón tus propuestas de manera pacífica.",
      hostile: "Tu presencia oscurece nuestra órbita. Los sacerdotes solares advierten que tu codicia apagará tu propio destino si no te retiras."
    },
    tributeSuccess: "La generosidad es parte del ciclo de luz. Tomad esto si vuestras naves lo necesitan para no perecer en la penumbra cósmica.",
    tributeFail: "¡La luz no se arrodilla ante las sombras del vacío! Los escudos solares resistirán tus ataques. ¡Que comience el juicio!"
  },
  solaris: {
    greetings: {
      friendly: "Vectores de calor óptimos. El Imperio Solaris vibra en sintonía con tus naves. Compartamos la energía de este sector orbital.",
      neutral: "Canal de alta frecuencia activado. Aquí el Imperio Solaris. Presenta tus demandas de manera eficiente antes de que nuestra temperatura sature tu receptor.",
      hostile: "Señal térmica inestable. Vuestros cascos de metal frío están robando energía radiante de nuestra zona de exclusión solar. Marchaos."
    },
    tributeSuccess: "Nuestros núcleos de plasma producen excedentes constantes. Tomad estos recursos inútiles si vuestro frío imperio los reclama.",
    tributeFail: "¡Osaremos calcinar vuestros propulsores! Los cañones de energía estelar están cargados al 100%. ¡Prepárate para la fusión nuclear!"
  },
  umbra: {
    greetings: {
      friendly: "El sigilo os tolera... y os valora. El Protectorado Umbra os considera aliados viables en esta penumbra cósmica. Habla.",
      neutral: "Frecuencia encriptada. Protectorado Umbra escuchando. ¿Qué proposición justifica interrumpir nuestro silencio espacial?",
      hostile: "Intrusos. Vuestras ruidosas transmisiones perturban la calma de la oscuridad. La sombra os eliminará de manera silenciosa."
    },
    tributeSuccess: "Evitando confrontación innecesaria. Entregando cargamento. Pero la sombra recuerda... y espera el momento adecuado.",
    tributeFail: "¡Presuntuoso invasor! La oscuridad no entrega sus tesoros. Vuestras naves chocarán contra blindajes que nunca veréis venir."
  },
  default: {
    greetings: {
      friendly: "Comunicaciones estables. Es un honor hablar con un líder de tu reputación galáctica. ¿Cómo podemos colaborar hoy?",
      neutral: "Canal diplomático establecido. Saludos de nuestro alto mando. Presenta tus propuestas comerciales o tratados galácticos.",
      hostile: "Transmisión restringida. La hostilidad diplomática entre nuestros sectores hace que este contacto sea altamente inestable."
    },
    tributeSuccess: "Entendemos la disparidad militar. Para evitar derramamiento de sangre innecerario, accederemos a vuestras demandas de recursos.",
    tributeFail: "No toleraremos vuestro acoso. Preferimos luchar con honor antes que ceder ante vuestra extorsión. ¡El comité militar declara la guerra!"
  }
};

const DiplomacyPage = ({ state, dispatch, SHIPS, FACTIONS, AI_STRATEGIES, S, fmt, getGalacticAlignment }) => {
  const [tradeAIPlanet, setTradeAIPlanet] = useState(null);
  const [tradeGive, setTradeGive] = useState({ metal: 0, crystal: 0, deuterium: 0, influence: 0 });
  const [tradeTake, setTradeTake] = useState({ metal: 0, crystal: 0, deuterium: 0 });
  const [tradeTreaty, setTradeTreaty] = useState('none');
  const [viabilityMsg, setViabilityMsg] = useState(null);
  const [buyAIPlanet, setBuyAIPlanet] = useState(null);
  const [buyShipId, setBuyShipId] = useState('lightFighter');
  const [buyQty, setBuyQty] = useState(1);

  const aiNearby = useMemo(() => (state.aiPlanets || []).filter(p => !p.isVirgin && p.galaxy >= 1 && p.discovered), [state.aiPlanets]);
  const aiList = useMemo(() => aiNearby.length > 100 ? aiNearby.slice(0, 100) : aiNearby, [aiNearby]);

  const currentPlanet = useMemo(() => state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0], [state.planets, state.currentPlanetId]);
  const resources = useMemo(() => currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 }, [currentPlanet]);

  const influence = state.influence || 0;
  const council = state.galacticCouncil || { resolutionsPassed: [], influenceHistory: [] };
  const federations = state.federations || [];
  const federalFleet = state.federalFleet || { ships: {}, contributed: 0 };
  const activeCrises = state.activeCrises || [];

  // Active terminal selection state
  const [activeContact, setActiveContact] = useState(null);
  const [dialogueText, setDialogueText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [subTab, setSubTab] = useState('relations');
  const [selectedMinistry, setSelectedMinistry] = useState('economy');
  const activeContactRef = useRef(activeContact);
  activeContactRef.current = activeContact;
  const aiNearbyRef = useRef(aiNearby);
  aiNearbyRef.current = aiNearby;
  useEffect(() => {
    if (!activeContact && aiList.length > 0) {
      handleSelectContact(aiList[0]);
    }
  }, [aiList, activeContact]);

  useEffect(() => {
    if (!activeContact) return;
    const factionKey = activeContact.faction || 'default';
    const factionData = FACTION_DIALOGUES[factionKey] || FACTION_DIALOGUES.default;
    const relation = activeContact.relation || 0;
    
    let text = factionData.greetings.neutral;
    if (relation >= 40) {
      text = factionData.greetings.friendly;
    } else if (relation <= -20) {
      text = factionData.greetings.hostile;
    }

    let index = 0;
    setDialogueText('');
    const interval = setInterval(() => {
      setDialogueText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 12);

    return () => {
      clearInterval(interval);
    };
  }, [activeContact]);

  const handleSelectContact = (ai) => {
    setIsGlitching(true);
    playDiploSound('connect');
    setActiveContact(ai);
    
    setTimeout(() => {
      setIsGlitching(false);
    }, 450);
  };

  const getTreatyCosts = useCallback((treatyType) => {
    let cost = { metal: 0, crystal: 0, deuterium: 0 };
    if (treatyType === 'pna') {
      cost = { metal: 10000, crystal: 5000, deuterium: 0 };
    } else if (treatyType === 'alliance') {
      cost = { metal: 20000, crystal: 10000, deuterium: 5000 };
    } else if (treatyType === 'trade') {
      cost = { metal: 15000, crystal: 8000, deuterium: 2000 };
    }
    if ((state.reputation || 0) >= 40) {
      cost = {
        metal: Math.floor(cost.metal * 0.75),
        crystal: Math.floor(cost.crystal * 0.75),
        deuterium: Math.floor(cost.deuterium * 0.75),
      };
    }
    return cost;
  }, [state.reputation]);

  const pnaCost = useMemo(() => getTreatyCosts('pna'), [getTreatyCosts]);
  const allianceCost = useMemo(() => getTreatyCosts('alliance'), [getTreatyCosts]);
  const tradeCost = useMemo(() => getTreatyCosts('trade'), [getTreatyCosts]);

  const handleDiplomaticAction = (actionType) => {
    if (!activeContact) return;
    dispatch({ type: 'DIPLOMACY_APPLY_ACTION', planetId: activeContact.id, actionType });
    playDiploSound('success');
    
    const personality = activeContact.aiPersonality || 'pacífico';
    let reply = 'Señal de sub-espacio transmitida. Esperando respuesta de la civilización...';
    
    const actionNames = {
      greet: 'Saludo Formal', official_intro: 'Presentación Oficial', 
      cultural_exchange: 'Intercambio Cultural', scientific_exchange: 'Intercambio Científico',
      trade_agreement: 'Acuerdo Comercial', research_agreement: 'Acuerdo de Investigación',
      transit_agreement: 'Acuerdo de Tránsito', defense_agreement: 'Pacto de Defensa',
      threat: 'Amenaza Diplomática', ultimatum: 'Ultimátum',
      embargo: 'Embargo Comercial', sanctions: 'Sanciones Económicas',
      protectorate: 'Propuesta de Protectorado', vassalage: 'Demanda de Vasallaje',
      break_relations: 'Ruptura de Relaciones'
    };
    const playerMsg = `[Iniciando protocolo: ${actionNames[actionType] || actionType}]`;

    if (actionType === 'greet') {
      reply = personality === 'bélico' ? '¿Saludos? Los débiles hablan mientras los fuertes conquistan. No nos hagas perder el tiempo.' :
              personality === 'mercantilista' ? 'Saludos, viajero. Las rutas comerciales están abiertas. Que el flujo de créditos sea mutuo.' :
              'Saludos en son de paz. Valoramos la armonía interestelar entre las especies.';
    } else if (actionType === 'official_intro') {
      reply = `Presentación formal aceptada. Registrando coordenadas de soberanía en la base de datos galáctica.`;
    } else if (actionType === 'cultural_exchange') {
      reply = `Tus delegaciones culturales son bienvenidas. Compartamos nuestras visiones artísticas e históricas para enriquecer ambos mundos.`;
    } else if (actionType === 'scientific_exchange') {
      reply = `Intercambio de datos cuánticos y archivos de laboratorio completado con éxito. La ciencia progresa de forma acelerada.`;
    } else if (actionType === 'economic_exchange') {
      reply = `Transacciones comerciales y de materias primas procesadas. Excelente tasa de rentabilidad para ambos imperios.`;
    } else if (actionType === 'trade_agreement') {
      reply = `Acuerdo comercial firmado. Abriendo aduanas y liberando aranceles en todo nuestro espacio soberano.`;
    } else if (actionType === 'research_agreement') {
      reply = `Acuerdo de investigación conjunto firmado. La cooperación impulsará el conocimiento mutuo a nuevas cotas.`;
    } else if (actionType === 'transit_agreement') {
      reply = `Acuerdo de tránsito estelar ratificado. Tus naves tienen permiso oficial de tránsito por nuestras zonas restringidas.`;
    } else if (actionType === 'defense_agreement') {
      reply = `Pacto de defensa mutua firmado. Cualquier agresión contra una de nuestras soberanías será respondida conjuntamente.`;
    } else if (actionType === 'guarantee_independence') {
      reply = `Agradecemos tu garantía de soberanía. Esto estabiliza enormemente la seguridad en el cuadrante local.`;
    } else if (actionType === 'protectorate') {
      reply = `Protectorado establecido. Bajo vuestra ala protectora nos sentiremos seguros frente a las hostilidades externas.`;
    } else if (actionType === 'vassalage') {
      reply = `Aceptamos con pesar vuestra soberanía forzada. Que se registre el vasallaje de nuestro pueblo.`;
    } else if (actionType === 'confederation') {
      reply = `La confederación interestelar es un gran paso. Avancemos en la unión legislativa de nuestros pueblos.`;
    } else if (actionType === 'threat') {
      reply = `¡¿Te atreves a amenazarnos?! Recordaremos este insulto. El Almirantazgo ya está trazando rutas tácticas de represalia.`;
    } else if (actionType === 'ultimatum') {
      reply = `Tu arrogancia no conoce límites. O te retiras de inmediato o convertiremos tus planetas en cenizas cósmicas.`;
    } else if (actionType === 'embargo') {
      reply = `Embargo comercial en vigor. Ningún mercante de tu imperio tiene permitido comerciar en nuestros puertos espaciales.`;
    } else if (actionType === 'sanctions') {
      reply = `Sanciones comerciales aplicadas. Prepárate para el aislamiento comercial y las penalizaciones arancelarias.`;
    } else if (actionType === 'break_relations') {
      reply = `Canal de comunicaciones cerrado. No hay nada más que hablar con tu diplomacia.`;
    }
    
    // Registrar en historial
    dispatch({ type: 'ADD_CHAT_MESSAGE', aiId: activeContact.id, sender: 'player', text: playerMsg });
    setTimeout(() => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', aiId: activeContact.id, sender: 'ai', text: reply });
    }, 1000);

    let index = 0;
    setDialogueText('');
    const interval = setInterval(() => {
      setDialogueText(reply.slice(0, index + 1));
      index++;
      if (index >= reply.length) {
        clearInterval(interval);
      }
    }, 12);

    setTimeout(() => {
      const refreshed = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshed) setActiveContact(refreshed);
    }, 120);
  };

  const executeTreaty = (treatyType, cost) => {
    if (!activeContact) return;
    const canAff = resources.metal >= cost.metal && resources.crystal >= cost.crystal && resources.deuterium >= cost.deuterium;
    if (!canAff) {
      playDiploSound('warn');
      return;
    }
    dispatch({ type: 'DIPLOMACY_TREATY', planetId: activeContact.id, treatyType });
    playDiploSound('success');
    setTimeout(() => {
      const refreshedAI = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshedAI) {
        setActiveContact(refreshedAI);
      }
    }, 100);
  };

  const executeWarToggle = () => {
    if (!activeContact) return;
    const isWar = (activeContact.relation || 0) <= -90;
    dispatch({ type: 'DIPLOMACY_DECLARE_WAR', planetId: activeContact.id, declareWar: !isWar });
    playDiploSound('warn');
    setTimeout(() => {
      const refreshedAI = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshedAI) {
        setActiveContact(refreshedAI);
      }
    }, 100);
  };

  const executeTributeDemand = () => {
    if (!activeContact) return;
    const totalShips = (state.planets || []).reduce((acc, p) => acc + Object.values(p.fleet || {}).reduce((a, b) => a + b, 0), 0);
    const threshold = (activeContact.aiLevel || 1) * 15;
    const success = totalShips >= threshold;

    const factionKey = activeContact.faction || 'default';
    const factionData = FACTION_DIALOGUES[factionKey] || FACTION_DIALOGUES.default;
    const feedbackText = success ? factionData.tributeSuccess : factionData.tributeFail;

    dispatch({ type: 'DIPLOMACY_TRIBUTE', planetId: activeContact.id, resources: { metal: 25000, crystal: 12000, deuterium: 4000 } });
    if (success) {
      playDiploSound('success');
    } else {
      playDiploSound('warn');
    }

    let index = 0;
    setDialogueText('');
    const interval = setInterval(() => {
      setDialogueText(feedbackText.slice(0, index + 1));
      index++;
      if (index >= feedbackText.length) {
        clearInterval(interval);
      }
    }, 12);

    setTimeout(() => {
      const refreshedAI = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshedAI) {
        setActiveContact(refreshedAI);
      }
    }, 100);
  };

  const handleLobby = () => {
    if (!activeContact || influence < 15) return;
    dispatch({ type: 'SPEND_INFLUENCE', amount: 15, target: activeContact.id, purpose: 'lobby' });
    playDiploSound('success');
    setTimeout(() => {
      const refreshedAI = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshedAI) {
        setActiveContact(refreshedAI);
      }
    }, 100);
  };

  const handleTrade = () => {
    if (!tradeAIPlanet) return;
    if (tradeTreaty !== 'none') {
      dispatch({
        type: 'DIPLOMACY_PROPOSE_TREATY',
        planetId: tradeAIPlanet.id,
        offer: tradeGive,
        demand: tradeTake,
        treatyType: tradeTreaty
      });
    } else {
      dispatch({
        type: 'DIPLOMACY_TRADE',
        planetId: tradeAIPlanet.id,
        giveRes: { metal: tradeGive.metal, crystal: tradeGive.crystal, deuterium: tradeGive.deuterium },
        takeRes: tradeTake
      });
    }
    playDiploSound('success');
    setTradeAIPlanet(null);
    setTradeGive({ metal: 0, crystal: 0, deuterium: 0, influence: 0 });
    setTradeTake({ metal: 0, crystal: 0, deuterium: 0 });
    setTradeTreaty('none');
    setViabilityMsg(null);
  };

  const handleCheckViability = () => {
    if (!tradeAIPlanet) return;
    const offerVal = calcResourceValueForAI(tradeAIPlanet, tradeGive);
    let demandVal = 0;
    if (tradeTreaty === 'trade_agreement') demandVal = 1000;
    else if (tradeTreaty === 'research_agreement') demandVal = 800;
    else if (tradeTreaty === 'transit_agreement') demandVal = 600;
    else if (tradeTreaty === 'defense_agreement') demandVal = 2500;
    else if (tradeTreaty === 'protectorate') demandVal = 4000;
    else if (tradeTreaty === 'vassalage') demandVal = 6000;
    
    const demandResVal = (tradeTake.metal || 0) * 1.0 + (tradeTake.crystal || 0) * 2.0 + (tradeTake.deuterium || 0) * 4.0;
    demandVal += demandResVal;

    if (offerVal >= demandVal) {
      setViabilityMsg({ status: 'success', text: `✅ Propuesta VIABLE. Valor ofertado (${Math.floor(offerVal)}) es suficiente para el coste demandado (${Math.floor(demandVal)}).` });
    } else {
      setViabilityMsg({ status: 'error', text: `❌ Propuesta INSUFICIENTE. Valor ofertado (${Math.floor(offerVal)}) es menor que el coste solicitado (${Math.floor(demandVal)}). Ofrece más recursos o influencia.` });
    }
  };

  const handleBuyShip = () => {
    if (!buyAIPlanet) return;
    const s = SHIPS[buyShipId];
    if (!s) return;
    const cost = { metal: Math.floor(s.cost.m * buyQty * 1.3), crystal: Math.floor(s.cost.c * buyQty * 1.3), deuterium: Math.floor((s.cost.d || 0) * buyQty * 1.3) };
    dispatch({ type: 'DIPLOMACY_BUY_SHIP', planetId: buyAIPlanet.id, shipId: buyShipId, cost, qty: buyQty });
    setBuyAIPlanet(null);
    setBuyShipId('lightFighter');
    setBuyQty(1);
  };

  const getRelationColor = (rel) => {
    if (rel >= 50) return 'text-emerald-400';
    if (rel >= 20) return 'text-cyan-400';
    if (rel >= -20) return 'text-slate-400';
    if (rel >= -50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getIntelLevel = (ai) => {
    const relation = ai.relation || 0;
    if (relation >= 75) return 5;
    if (relation >= 45) return 4;
    if (relation >= 15) return 3;
    if (relation >= -15) return 2;
    return 1;
  };

  React.useEffect(() => {
    dispatch({ type: 'MARK_ALL_NOTIF_READ' });
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes scanline {
          0% { top: -5%; }
          100% { top: 105%; }
        }
        .animate-scanline {
          animation: scanline 3.2s linear infinite;
        }
      `}</style>

      {/* Dashboard Header */}
      <div className={`${S.cardDeep} flex justify-between items-center`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">🏛️ Ministerio de Asuntos Galácticos y Alianzas</h2>
          <p className="text-xs text-slate-400">Influencia Galáctica: <span className="font-mono text-cyan-400 font-bold">{fmt(influence)}</span></p>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">Consola de Seguridad Integrada</div>
      </div>

      {/* Tabs */}
      <div className={S.tabBar + " mb-2"}>
        {['relations','council','federations','ministry','crises'].map(t => (
          <button key={t} onClick={() => { playDiploSound('click'); setSubTab(t); }} className={`${S.tab} ${subTab===t ? S.tabActive : S.tabInactive} text-xs py-1.5 flex-none`}>
            {t === 'relations' ? 'RELACIONES' : t === 'council' ? 'ASAMBLEA' : t === 'federations' ? 'FEDERACIÓN' : t === 'ministry' ? 'MINISTERIO' : 'CRISIS'}
          </button>
        ))}
      </div>

      {/* Subtab Content: Relations & Narratives */}
      {subTab === 'relations' && (
        <DiplomacyChat
          aiList={aiList}
          activeContact={activeContact}
          handleSelectContact={handleSelectContact}
          getIntelLevel={getIntelLevel}
          getRelationColor={getRelationColor}
          FACTIONS={FACTIONS}
          LeaderAvatar={LeaderAvatar}
          dialogueText={dialogueText}
          isGlitching={isGlitching}
          chatHistory={state.chatHistory}
          handleDiplomaticAction={handleDiplomaticAction}
          executeWarToggle={executeWarToggle}
        />
      )}

      {subTab === 'council' && (
        <GalacticCouncil
          council={council}
          influence={influence}
          dispatch={dispatch}
          playDiploSound={playDiploSound}
        />
      )}

      {subTab === 'federations' && (
        <FederationsManager
          aiList={aiList}
          influence={influence}
          currentPlanet={currentPlanet}
          resources={resources}
          federations={federations}
          federalFleet={federalFleet}
          dispatch={dispatch}
          playDiploSound={playDiploSound}
        />
      )}

      {subTab === 'ministry' && (
        <MinistriesManager
          state={state}
          resources={resources}
          selectedMinistry={selectedMinistry}
          setSelectedMinistry={setSelectedMinistry}
          dispatch={dispatch}
          playDiploSound={playDiploSound}
          aiList={aiList}
          FACTIONS={FACTIONS}
        />
      )}

      {subTab === 'crises' && (
        <CrisesManager
          activeCrises={activeCrises}
          dispatch={dispatch}
          playDiploSound={playDiploSound}
        />
      )}

      <TradeAgreementModal
        tradeAIPlanet={tradeAIPlanet}
        setTradeAIPlanet={setTradeAIPlanet}
        tradeGive={tradeGive}
        setTradeGive={setTradeGive}
        tradeTake={tradeTake}
        setTradeTake={setTradeTake}
        tradeTreaty={tradeTreaty}
        setTradeTreaty={setTradeTreaty}
        viabilityMsg={viabilityMsg}
        handleCheckViability={handleCheckViability}
        handleTrade={handleTrade}
      />

      <BuyAIShipsModal
        buyAIPlanet={buyAIPlanet}
        setBuyAIPlanet={setBuyAIPlanet}
        buyShipId={buyShipId}
        setBuyShipId={setBuyShipId}
        buyQty={buyQty}
        setBuyQty={setBuyQty}
        handleBuyShip={handleBuyShip}
      />

    </div>
  );
};

export default DiplomacyPage;
