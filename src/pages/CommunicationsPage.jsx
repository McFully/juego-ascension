import React, { useState } from 'react';
import { playVoice, getCtx, getSfxGain } from '../audio.js';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SafeImg } from '../assets.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import { TransmissionChannelGrid } from '../components/communications/TransmissionChannelGrid.jsx';
import { TransmissionFeedPanel } from '../components/communications/TransmissionFeedPanel.jsx';

const FACTIONS_LORE = {
  human: { name: 'República Nova', race: 'Humanos', icon: '👥', color: '#22d3ee', leader: 'Canciller Jonathan Vance' },
  cyborg: { name: 'Dominion Xelar', race: 'Cyborgs', icon: '🦾', color: '#c084fc', leader: 'Superordenador X1-Core' },
  synth: { name: 'Colectivo Zenith', race: 'IA Sintéticas', icon: '🤖', color: '#34d399', leader: 'Conciencia Directriz' },
  draconian: { name: 'Imperio Draconiano', race: 'Draconianos', icon: '🐲', color: '#f87171', leader: 'Señor de la Guerra Ghornak' },
  helios: { name: 'Confederación Helios', race: 'Helianos', icon: '☀️', color: '#fbbf24', leader: 'Emperador Helios III' },
  solaris: { name: 'Imperio Solaris', race: 'Solarios', icon: '👑', color: '#facc15', leader: 'Primarca Solar Varis' },
  drakon: { name: 'Soberanía Drakon', race: 'Drakonianos Supremos', icon: '⚔️', color: '#fda4af', leader: 'Alto General Kaelen' },
  vortex: { name: 'Cábala Vortex', race: 'Vacíos', icon: '🌀', color: '#818cf8', leader: 'El Susurrador del Vacío' },
  umbra: { name: 'Protectorado Umbra', race: 'Sorgs de Sombra', icon: '🖤', color: '#94a3b8', leader: 'Sombra Primordial' },
};

const playTransmissionSound = () => {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const targetNode = getSfxGain() || ctx.destination;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(targetNode);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (_) {}
};

export const CommunicationsPage = ({ state, dispatch, currentPlanet, production, fmt, S, onOpenDiplomacy, setActiveTab }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNotifId, setSelectedNotifId] = useState(null);

  const notifications = state.notifications || [];
  const activeTransmission = state.activeTransmission;

  const getEnrichedNotif = (notif) => {
    const msg = notif.message || '';
    let category = 'diplomacy';
    let sender = 'Almirantazgo del Imperio';
    let factionKey = 'human';
    let priority = 'medio';
    let typeName = 'Informe de Evento';

    if (msg.includes('Logro') || msg.includes('Misión') || msg.includes('misión') || msg.includes('Capítulo')) {
      category = 'missions';
      sender = 'Comando Estratégico';
      priority = 'alto';
      typeName = 'Directiva Operacional';
    } else if (msg.includes('Pacto') || msg.includes('diplom') || msg.includes('Aliado') || msg.includes('PNA') || msg.includes('Alianza') || msg.includes('insultado') || msg.includes('relaciones')) {
      category = 'diplomacy';
      sender = 'Asuntos Galácticos';
      priority = 'alto';
      typeName = 'Transmisión Consular';
    } else if (msg.includes('comercial') || msg.includes('trato') || msg.includes('recursos') || msg.includes('Metal') || msg.includes('Cristal') || msg.includes('Deuterio') || msg.includes('tributo') || msg.includes('Exigir')) {
      category = 'commerce';
      sender = 'Logística de Comercio';
      priority = 'medio';
      typeName = 'Manifiesto de Carga';
    } else if (msg.includes('espionaje') || msg.includes('sensor') || msg.includes('detectado') || msg.includes('inteligencia') || msg.includes('informe')) {
      category = 'intelligence';
      sender = 'Servicio Secreto Imperial';
      priority = 'alto';
      typeName = 'Reporte de Inteligencia';
    } else if (msg.includes('Ataque') || msg.includes('guerra') || msg.includes('batalla') || msg.includes('misil') || msg.includes('Flota') || msg.includes('naves') || msg.includes('refuerzos')) {
      category = 'defense';
      sender = 'Mando de Defensa Espacial';
      priority = 'critico';
      typeName = 'Alerta Táctica';
    }

    Object.keys(FACTIONS_LORE).forEach(key => {
      if (msg.includes(FACTIONS_LORE[key].name) || msg.includes(FACTIONS_LORE[key].race)) {
        factionKey = key;
        sender = FACTIONS_LORE[key].leader;
      }
    });

    return { ...notif, category, sender, factionKey, priority, typeName };
  };

  const enrichedNotifs = notifications.map(getEnrichedNotif);

  const categories = [
    { id: 'all', label: 'Bandeja Global', icon: '📡', assetId: 'quantumTelecom', subtitle: 'Todas las transmisiones y alertas del cuadrante' },
    { id: 'diplomacy', label: 'Diplomacia', icon: '🤝', assetId: 'permanentEmbassy', subtitle: 'Pactos federativos, acuerdos de paz y visitas' },
    { id: 'commerce', label: 'Comercio', icon: '💰', assetId: 'financeMinistry', subtitle: 'Manifiestos mercantiles e intercambios de recursos' },
    { id: 'intelligence', label: 'Inteligencia', icon: '🕵️', assetId: 'tacticalListeningNetwork', subtitle: 'Informes de sondas de espionaje y alertas de contraespionaje' },
    { id: 'defense', label: 'Defensa Militar', icon: '⚔️', assetId: 'internalSecurityMinistry', subtitle: 'Alertas de incursión, combates navales y estado bélico' },
  ];

  const filteredNotifs = enrichedNotifs.filter(n => {
    if (n.category === 'system' || n.factionKey === 'human') return false;
    if (selectedCategory === 'all') return true;
    return n.category === selectedCategory;
  });

  const selectedNotif = enrichedNotifs.find(n => n.id === selectedNotifId) || filteredNotifs[0];

  const handleSelectNotif = (notifId) => {
    playTransmissionSound();
    setSelectedNotifId(notifId);
    const found = enrichedNotifs.find(n => n.id === notifId);
    if (found) {
      if (found.category === 'defense') {
        playVoice('alert_fleet_combat');
      } else if (found.factionKey && found.factionKey !== 'human') {
        playVoice(`diplo_${found.factionKey}_greeting`);
      } else if (found.factionKey === 'human') {
        playVoice('diplo_human_greeting');
      }
    }
  };

  // 3.4-a — La transmisión ya no se "acepta": se lee en la bandeja.
  const handleOpenInbox = () => {
    if (setActiveTab) setActiveTab('telemetry');
  };

  const handleDismissLiveTransmission = (e) => {
    e.stopPropagation();
    dispatch({ type: 'DISMISS_TRANSMISSION' });
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="space-y-6 view-enter w-full">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Comunicaciones Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Red de Inteligencia y Enlace"
        parentHub="imperial_hub"
        breadcrumbIcon="📡"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Mensajes:</span>
              <span className="font-bold text-cyan-300">{notifications.length}</span>
            </div>
            <button
              onClick={() => {
                dispatch({ type: 'MARK_ALL_NOTIF_READ' });
                playTransmissionSound();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 font-mono text-xs uppercase transition-all cursor-pointer shadow-sm"
              title="Marcar todas las transmisiones como leídas"
            >
              ✓ Marcar Todo Leído
            </button>
          </div>
        }
      />

      {/* Tarjetas de Canales y Transmisiones en Grid Responsivo */}
      <TransmissionChannelGrid
        categories={categories}
        enrichedNotifs={enrichedNotifs}
        selectedCategory={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          playTransmissionSound();
        }}
        activeTransmission={activeTransmission}
        onOpenInbox={handleOpenInbox}
        onDismissLiveTransmission={handleDismissLiveTransmission}
        onBack={() => {
          if (navigateBack) navigateBack();
        }}
      />

      {/* Grid de Paneles: Transmisiones y Visor Holográfico */}
      <TransmissionFeedPanel
        filteredNotifs={filteredNotifs}
        selectedNotif={selectedNotif}
        onSelectNotif={handleSelectNotif}
        factionsLore={FACTIONS_LORE}
      />
    </div>
  );
};

export default CommunicationsPage;
