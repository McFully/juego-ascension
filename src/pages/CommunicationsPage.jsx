import React, { useState, useEffect } from 'react';


// Faction config to map names and match icons/portraits
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

// Programmatic transmission sound using Web Audio API
const playTransmissionSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Quick tech squeak + static pulse
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (_) {}
};

// Reusable leader portrait inside communications
const LeaderAvatarSmall = ({ factionKey }) => {
  const factionColors = {
    human: '#22d3ee',
    cyborg: '#c084fc',
    synth: '#34d399',
    draconian: '#f87171',
    helios: '#fbbf24',
    solaris: '#facc15',
    drakon: '#fda4af',
    vortex: '#818cf8',
    umbra: '#94a3b8',
  };
  const color = factionColors[factionKey] || '#22d3ee';

  return (
    <div className="relative w-12 h-12 rounded-lg bg-black/60 border overflow-hidden flex items-center justify-center shrink-0 shadow-md"
         style={{ borderColor: color + '50' }}>
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_2px]" />
      <svg viewBox="0 0 100 100" className="w-9 h-9" style={{ stroke: color, fill: 'none', strokeWidth: 2.5 }}>
        {factionKey === 'cyborg' ? (
          <g>
            <path d="M30 40 C30 20, 70 20, 70 40 L68 70 C68 80, 32 80, 32 70 Z" />
            <rect x="35" y="38" width="30" height="7" rx="2" />
            <line x1="37" y1="41" x2="63" y2="41" strokeWidth="3" />
          </g>
        ) : factionKey === 'synth' ? (
          <g>
            <rect x="25" y="25" width="50" height="50" rx="6" />
            <circle cx="50" cy="12" r="3.5" fill={color} />
            <line x1="50" y1="25" x2="50" y2="15" />
            <circle cx="38" cy="41" r="1.5" fill={color} />
            <circle cx="62" cy="41" r="1.5" fill={color} />
          </g>
        ) : factionKey === 'draconian' || factionKey === 'drakon' ? (
          <g>
            <path d="M50 15 L65 30 L65 45 L50 85 L35 45 L35 30 Z" />
            <polygon points="38,36 46,38 44,42 36,40" fill={color} />
            <polygon points="62,36 54,38 56,42 64,40" fill={color} />
          </g>
        ) : factionKey === 'vortex' ? (
          <g>
            <circle cx="50" cy="50" r="22" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="12" strokeDasharray="6 3" />
            <circle cx="50" cy="50" r="3.5" fill={color} />
          </g>
        ) : (
          <g>
            <path d="M20 88 C20 74, 30 68, 40 68 L60 68 C70 68, 80 74, 80 88" />
            <circle cx="50" cy="40" r="15" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const CommunicationsPage = ({ state, dispatch, S }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedNotifId, setSelectedNotifId] = useState(null);

  const notifications = state.notifications || [];

  // Categorize a raw notification string
  const getEnrichedNotif = (notif) => {
    const msg = notif.message || '';
    
    // Default categories & metadata
    let category = 'diplomacy';
    let sender = 'Almirantazgo del Imperio';
    let factionKey = 'human';
    let priority = 'medio'; // critico, alto, medio, bajo
    let typeName = 'Informe de Evento';

    // Search keywords
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
      typeName = 'ALERTA TÁCTICA';
    } else if (msg.includes('Exploración') || msg.includes('descubierto') || msg.includes('ruinas') || msg.includes('anomalía') || msg.includes('planeta') || msg.includes('salto')) {
      category = 'exploration';
      sender = 'Nave Exploradora';
      priority = 'bajo';
      typeName = 'Registro Científico';
    } else if (msg.includes('crisis') || msg.includes('colapso') || msg.includes('hambruna') || msg.includes('rebelión') || msg.includes('pandemia') || msg.includes('desastre')) {
      category = 'crisis';
      sender = 'Gabinete de Crisis';
      priority = 'critico';
      typeName = 'Comité de Emergencia';
    } else if (msg.includes('federal') || msg.includes('Federación')) {
      category = 'federation';
      sender = 'Alto Mando Federal';
      priority = 'medio';
      typeName = 'Edicto Federal';
    } else if (notif.type === 'success' && (msg.includes('aprobado') || msg.includes('Asamblea') || msg.includes('Consejo'))) {
      category = 'assembly';
      sender = 'Senado de la Asamblea';
      priority = 'alto';
      typeName = 'Decreto Galáctico';
    } else if (notif.type === 'success' || msg.includes('finalizada') || msg.includes('construido') || msg.includes('terminada')) {
      category = 'system';
      sender = 'IA de Gestión Planetaria';
      priority = 'bajo';
      typeName = 'Notificación de Infraestructura';
    }

    // Try matching factions inside message to improve lore
    for (const [key, details] of Object.entries(FACTIONS_LORE)) {
      if (msg.toLowerCase().includes(details.name.toLowerCase()) || msg.toLowerCase().includes(details.race.toLowerCase())) {
        factionKey = key;
        sender = details.leader;
        break;
      }
    }

    return {
      ...notif,
      category,
      sender,
      factionKey,
      priority,
      typeName,
    };
  };

  const enrichedNotifs = notifications.map(getEnrichedNotif);

  // Categories list definition (Only external channels, no internal logs or strategic commands)
  const categories = [
    { id: 'all', label: 'Bandeja Principal (Externa)', icon: 'radar' },
    { id: 'diplomacy', label: 'Diplomacia', icon: 'handshake' },
    { id: 'commerce', label: 'Comercio', icon: 'currency_exchange' },
    { id: 'intelligence', icon: 'shield_lock', label: 'Inteligencia' },
    { id: 'defense', label: 'Defensa Militar', icon: 'swords' },
    { id: 'exploration', label: 'Exploración', icon: 'explore' },
    { id: 'crisis', label: 'Crisis Globales', icon: 'warning' },
    { id: 'federation', label: 'Federación', icon: 'groups' },
    { id: 'assembly', label: 'Asamblea', icon: 'gavel' },
  ];

  // Filtered list: strict external-only filter (no system logs, no human internal command alerts)
  const filteredNotifs = enrichedNotifs.filter(
    n => {
      // Filter out internal system logs and player empire internal alerts (factionKey === 'human')
      if (n.category === 'system' || n.factionKey === 'human') return false;
      
      if (selectedCategory === 'all') return true;
      return n.category === selectedCategory;
    }
  );

  const selectedNotif = enrichedNotifs.find(n => n.id === selectedNotifId) || filteredNotifs[0];

  const handleSelectNotif = (notifId) => {
    playTransmissionSound();
    setSelectedNotifId(notifId);
    const found = enrichedNotifs.find(n => n.id === notifId);
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'critico': return 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse';
      case 'alto': return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'medio': return 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
      default: return 'bg-slate-500/20 border-white/10 text-slate-400';
    }
  };

  const getPriorityLabel = (prio) => {
    switch (prio) {
      case 'critico': return 'PRIORIDAD CRÍTICA';
      case 'alto': return 'PRIORIDAD ALTA';
      case 'medio': return 'PRIORIDAD MEDIA';
      default: return 'PRIORIDAD BAJA';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${S.cardDeep} flex justify-between items-center`}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">📡 Centro de Comunicaciones e Inteligencia</h2>
          <p className="text-xs text-slate-400">Escaneando canales sub-espaciales locales y transmisiones de hiper-red.</p>
        </div>
        <div className="text-xs font-mono text-emerald-400 animate-pulse uppercase">Conexión de Señal Estable</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sub-Sidebar: Categories & Counters */}
        <div className={`${S.cardDeep} lg:col-span-3 space-y-1.5 flex flex-col`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">Canales Frecuencia</h3>
          <div className="space-y-1">
            {categories.map(cat => {
              const count = enrichedNotifs.filter(n => cat.id === 'all' || n.category === cat.id).length;
              const unreadCount = enrichedNotifs.filter(n => (cat.id === 'all' || n.category === cat.id) && !n.read).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--ue-accent)]/20 border-[var(--ue-accent)]/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-black/20 border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  <div className="flex gap-1">
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1 rounded-full leading-tight font-sans">
                        {unreadCount}
                      </span>
                    )}
                    <span className="text-slate-600 text-[10px]">({count})</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              dispatch({ type: 'MARK_ALL_NOTIF_READ' });
              playTransmissionSound();
            }}
            className="w-full mt-4 py-2 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 rounded-xl text-xs font-semibold text-slate-300 font-mono transition-all"
          >
            ✓ Limpiar Bandeja de Entrada
          </button>
        </div>

        {/* Center: Transmissions List */}
        <div className={`${S.cardDeep} lg:col-span-4 flex flex-col`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 pl-1">Lista de Transmisiones</h3>
          <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1 flex-1">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-600 text-xs font-mono">
                No hay transmisiones recibidas en este canal.
              </div>
            ) : (
              filteredNotifs.map(notif => {
                const isSelected = selectedNotif && selectedNotif.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelectNotif(notif.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all flex gap-3 ${
                      isSelected
                        ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/80 text-white shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : notif.read
                        ? 'bg-black/30 border-white/5 text-slate-400 hover:border-white/10'
                        : 'bg-black/50 border-cyan-500/30 text-white hover:border-cyan-500/50'
                    }`}
                  >
                    <LeaderAvatarSmall factionKey={notif.factionKey} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-semibold text-xs truncate">{notif.sender}</span>
                        <span className={`text-[8px] font-mono px-1 rounded border uppercase ${getPriorityBadge(notif.priority)}`}>
                          {notif.priority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mb-1">{notif.message}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>{notif.typeName}</span>
                        <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Immersive Display Panel */}
        <div className={`${S.cardDeep} lg:col-span-5`}>
          {selectedNotif ? (
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-white/10">
                <div className="w-24 h-24 shrink-0 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />
                  <LeaderAvatarSmall factionKey={selectedNotif.factionKey} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(selectedNotif.priority)}`}>
                      {getPriorityLabel(selectedNotif.priority)}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                      {selectedNotif.typeName}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-0.5">{selectedNotif.sender}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Civilización: {FACTIONS_LORE[selectedNotif.factionKey]?.name || 'Consorcio Galáctico'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">
                    Fecha Estelar: {new Date(selectedNotif.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Message text with holo layout */}
              <div className="bg-[#05070f]/90 border border-white/5 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between holographic relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
                <p className="text-xs font-mono text-cyan-300 leading-relaxed z-10 whitespace-pre-wrap select-text pl-1 pr-1">
                  {selectedNotif.message}
                </p>
                <div className="flex justify-between items-center mt-3 z-10">

                  <div className="text-[8px] text-slate-600 font-mono uppercase select-none">
                    Frecuencia de Sub-Red: Encriptación Clase 4
                  </div>
                </div>
              </div>

              {/* Action buttons inside communications */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => dispatch({ type: 'DISMISS_NOTIF', payload: selectedNotif.id })}
                  className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/5 text-red-400 font-mono text-xs rounded-xl transition-all"
                >
                  ✕ Archivar Transmisión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-3">
              <span className="material-symbols-outlined text-4xl animate-pulse">satellite_alt</span>
              <p className="text-xs font-mono">Selecciona una transmisión para abrir el canal de datos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
