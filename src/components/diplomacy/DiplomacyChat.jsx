import React, { useState } from 'react';
import { S } from '../../styles.js';

export const DiplomacyChat = ({
  aiList,
  activeContact,
  handleSelectContact,
  getIntelLevel,
  getRelationColor,
  FACTIONS,
  LeaderAvatar,
  dialogueText,
  isGlitching,
  chatHistory = {},
  handleDiplomaticAction,
  executeWarToggle
}) => {
  const [detailView, setDetailView] = useState(false);

  const getRelationText = (rel) => {
    return rel > 0 ? `+${rel}` : rel;
  };

  const getSenderName = (msg) => {
    return msg.sender === 'player' ? 'REPRESENTANTE' : activeContact?.faction?.toUpperCase() || 'IA';
  };

  const onSelectContact = (ai) => {
    handleSelectContact(ai);
    setDetailView(true);
  };

  const onBackToList = () => {
    setDetailView(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Faction selection list - hidden in detail view */}
      {!detailView && (
      <div className={`${S.cardDeep} lg:col-span-5 flex flex-col`}>
        <h3 className="text-sm font-semibold mb-3 text-slate-300 uppercase tracking-wider">📡 Receptores de Frecuencia Activos</h3>
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
          {aiList.length === 0 ? (
            <p className="text-slate-500 text-sm">No se encontraron imperios en la vecindad galáctica.</p>
          ) : (
            aiList.map(ai => {
              const isSelected = activeContact?.id === ai.id;
              const intelLvl = getIntelLevel(ai);
              return (
                <div key={ai.id} className={`glass-deep rounded-xl border transition-all ${isSelected ? 'border-[var(--ue-accent)]/80 shadow-[0_0_12px_rgba(34,211,238,0.2)] bg-white/5' : 'border-white/5 bg-black/20 hover:bg-white/5'}`}>
                  <button onClick={() => onSelectContact(ai)} className="w-full flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{FACTIONS[ai.faction]?.icon || '👽'}</span>
                      <div className="text-left">
                        <div className="font-semibold text-sm">{ai.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Firma: <span className="font-mono text-cyan-400">{FACTIONS[ai.faction]?.name || 'Civilización Desconocida'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-xs font-mono font-bold ${getRelationColor(ai.relation)}`}>
                        {getRelationText(ai.relation)}
                      </span>
                      <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Intel Nv.{intelLvl}</div>
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      )}

      {/* Narratives & Transmission Console */}
      <div className={`${detailView ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col`}>
        {activeContact && detailView && (
          <button onClick={onBackToList}
            className="self-start mb-2 px-3 py-1.5 border border-white/10 hover:border-cyan-500/50 rounded-xl text-[10px] text-slate-400 hover:text-cyan-400 font-mono transition-all flex items-center gap-1.5">
            ← Volver a Receptores
          </button>
        )}
        {activeContact ? (
          <div className="glass-deep rounded-2xl border border-cyan-500/30 p-4 flex-1 flex flex-col space-y-3 relative overflow-hidden bg-black/40">
            
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-500/80 border-b border-cyan-500/20 pb-2">
              <div>ENLACE: <span className="text-white">COMMS_QUANTUM_{activeContact.id.slice(0, 4).toUpperCase()}</span></div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-white">SEÑAL ESTABLE</span>
              </div>
            </div>

            {/* Nivel de Inteligencia Progress Bar */}
            {(() => {
              const intelLvl = getIntelLevel(activeContact);
              const trust = Math.min(100, Math.max(0, Math.floor(((activeContact.relation || 0) + 100) / 2)));
              const hostility = Math.min(100, Math.max(0, 50 - (activeContact.relation || 0)));
              const respect = Math.min(100, Math.max(0, 40 + (activeContact.aiLevel || 1) * 3));
              const fear = Math.min(100, Math.max(0, Math.min(100, Math.floor(30 + (activeContact.aiLevel || 1) * 4 - (activeContact.relation || 0) * 0.3))));
              const admiration = Math.min(100, Math.max(0, Math.floor(20 + (activeContact.relation || 0) * 0.5)));
              const affinity = activeContact.aiPersonality === 'pacífico' ? 70 : activeContact.aiPersonality === 'mercantilista' ? 50 : 25;

              return (
                <div className="space-y-4">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">NIVEL DE INTELIGENCIA TÁCTICA:</span>
                      <span className="text-cyan-400 font-bold">Nv. {intelLvl} / 5</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5].map(lvl => (
                        <div
                          key={lvl}
                          className={`h-1.5 rounded-full transition-all ${
                            lvl <= intelLvl ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[8px] text-slate-500 font-mono">
                      {intelLvl === 1 && "⚠️ Solo firma y bandera conocidas. Aumenta la relación para obtener más datos."}
                      {intelLvl === 2 && "✓ Identidad del líder y rasgos culturales descifrados."}
                      {intelLvl === 3 && "✓ Estimaciones económicas y tecnológicas descifradas."}
                      {intelLvl === 4 && "✓ Estructura de flota militar y sensores de defensa interceptados."}
                      {intelLvl === 5 && "✓ Perfil estratégico y prioridades internas al descubierto."}
                    </div>
                  </div>

                  {/* Leader Avatar & Identity with Masking */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-4">
                      {LeaderAvatar && <LeaderAvatar factionKey={activeContact.faction} isGlitching={intelLvl === 1 || isGlitching} />}
                    </div>
                    <div className="sm:col-span-8 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 font-mono">
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block">Líder</span>
                          <span className="font-bold text-slate-200 text-[11px]">
                            {intelLvl >= 2 ? activeContact.name : "🔐 [REQUIERE NV.2 INTEL]"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block">Filiación</span>
                          <span className="text-cyan-400 font-bold text-[11px]">
                            {FACTIONS[activeContact.faction]?.race || 'Desconocida'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block">Fuerza Militar</span>
                          <span className="text-slate-400 text-[10px]">
                            {intelLvl >= 3 ? `${activeContact.aiLevel * 230} Pts` : "🔐 [REQUIERE NV.3 INTEL]"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block">Economía</span>
                          <span className="text-slate-400 text-[10px]">
                            {intelLvl >= 3 ? `${activeContact.aiLevel * 180} Pts` : "🔐 [REQUIERE NV.3 INTEL]"}
                          </span>
                        </div>
                      </div>

                      {/* Relations Variables Grid */}
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono bg-black/30 p-2 rounded-lg border border-white/5">
                        <div className="text-center bg-cyan-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Confianza</span>
                          <span className="text-cyan-400 font-bold">{trust}%</span>
                        </div>
                        <div className="text-center bg-red-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Hostilidad</span>
                          <span className="text-red-400 font-bold">{hostility}%</span>
                        </div>
                        <div className="text-center bg-purple-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Respeto</span>
                          <span className="text-purple-400 font-bold">{respect}%</span>
                        </div>
                        <div className="text-center bg-amber-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Temor</span>
                          <span className="text-amber-400 font-bold">{fear}%</span>
                        </div>
                        <div className="text-center bg-blue-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Admiración</span>
                          <span className="text-blue-400 font-bold">{admiration}%</span>
                        </div>
                        <div className="text-center bg-emerald-950/30 p-1 rounded">
                          <span className="text-slate-500 block">Afinidad</span>
                          <span className="text-emerald-400 font-bold">{affinity}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level 4 and 5 details */}
                  {intelLvl >= 4 && (
                    <div className="p-2.5 bg-slate-950/50 rounded-xl border border-white/5 text-xs font-mono">
                      <span className="text-[9px] text-slate-500 uppercase block mb-1">Estructura Militar Detectada (Sensores Nv.4)</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-slate-300">
                        <div>轻 Cazadores: <span className="text-cyan-400 font-bold">~{activeContact.fleet?.lightFighter || 0}</span></div>
                        <div>中 Cruceros: <span className="text-purple-400 font-bold">~{activeContact.fleet?.cruiser || 0}</span></div>
                        <div>重 Acorazados: <span className="text-amber-400 font-bold">~{activeContact.fleet?.battleship || 0}</span></div>
                      </div>
                    </div>
                  )}

                  {intelLvl >= 5 && (
                    <div className="p-2.5 bg-cyan-950/10 rounded-xl border border-cyan-800/30 text-xs font-mono">
                      <span className="text-[9px] text-cyan-500 uppercase block mb-1">Objetivos Estratégicos (Sensores Nv.5)</span>
                      <div className="text-[10px] text-slate-300 space-y-1">
                        <div>• Objetivo Principal: <span className="text-emerald-400 font-bold">Monopolizar rutas del cuadrante</span></div>
                        <div>• Objetivo Secundario: <span className="text-slate-400">Contención militar de fronteras coloniales</span></div>
                      </div>
                    </div>
                  )}

                  {/* Chat Historico con Grid optimizado */}
                  <div className="flex-1 overflow-hidden flex flex-col min-h-[180px] bg-black/40 border border-white/5 rounded-xl">
                    <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Canal Seguro: {activeContact.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-emerald-500/80 font-mono uppercase">En Línea</span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0" id="chat-container">
                      {(chatHistory[activeContact.id] || []).length === 0 && !dialogueText && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2 py-10">
                          <div className="text-4xl">📡</div>
                          <div className="text-[10px] font-mono">Esperando transmisión de datos...</div>
                        </div>
                      )}

                      {(chatHistory[activeContact.id] || []).map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed font-mono ${
                            msg.sender === 'player' 
                              ? 'bg-blue-600/20 border border-blue-400/30 text-blue-100 rounded-tr-none' 
                              : 'bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-tl-none'
                          }`}>
                            <div className="text-[8px] opacity-40 mb-1 flex justify-between items-center">
                              <span>{getSenderName(msg)}</span>
                              <span className="ml-2">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            {msg.text}
                          </div>
                        </div>
                      ))}

                      {dialogueText && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] px-3 py-2 rounded-lg text-[11px] leading-relaxed bg-slate-800/60 border border-cyan-400/30 text-cyan-50 rounded-tl-none shadow-[0_0_10px_rgba(34,211,238,0.1)] font-mono">
                            <div className="text-[8px] text-cyan-400 opacity-60 mb-1 flex justify-between items-center">
                              <span>RECIBIENDO TRANSMISIÓN...</span>
                            </div>
                            {dialogueText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block">Consola de Acciones Diplomáticas</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* COOPERATIVAS */}
                      <div className="space-y-1.5 p-2 bg-slate-950/30 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block border-b border-white/5 pb-1 mb-1">Cooperación</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => handleDiplomaticAction('greet')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono">
                            👋 Saludo
                          </button>
                          <button onClick={() => handleDiplomaticAction('official_intro')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 5 Inf">
                            🏛️ Pres. Oficial
                          </button>
                          <button onClick={() => handleDiplomaticAction('cultural_exchange')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 10 Inf">
                            🎭 Int. Cultural
                          </button>
                          <button onClick={() => handleDiplomaticAction('scientific_exchange')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 15 Inf & 500 Deut">
                            🔬 Int. Científico
                          </button>
                        </div>
                      </div>

                      {/* TRATADOS */}
                      <div className="space-y-1.5 p-2 bg-slate-950/30 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block border-b border-white/5 pb-1 mb-1">Tratados y Acuerdos</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => handleDiplomaticAction('trade_agreement')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 15 Inf">
                            🤝 Ac. Comercial
                          </button>
                          <button onClick={() => handleDiplomaticAction('research_agreement')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 20 Inf">
                            🧪 Ac. Investig.
                          </button>
                          <button onClick={() => handleDiplomaticAction('transit_agreement')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 10 Inf">
                            🚀 Ac. Tránsito
                          </button>
                          <button onClick={() => handleDiplomaticAction('defense_agreement')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 25 Inf">
                            🛡️ Ac. Defensa
                          </button>
                        </div>
                      </div>

                      {/* PRESIÓN Y CONFLICTO */}
                      <div className="space-y-1.5 p-2 bg-slate-950/30 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block border-b border-white/5 pb-1 mb-1">Presión / Conflicto</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => handleDiplomaticAction('threat')} className="py-1 bg-red-950/45 hover:bg-red-900/40 border border-red-500/20 rounded text-[10px] text-red-400 font-mono">
                            ⚠️ Amenazar
                          </button>
                          <button onClick={() => handleDiplomaticAction('ultimatum')} className="py-1 bg-red-950/45 hover:bg-red-900/40 border border-red-500/20 rounded text-[10px] text-red-400 font-mono">
                            🚨 Ultimátum
                          </button>
                          <button onClick={() => handleDiplomaticAction('embargo')} className="py-1 bg-amber-950/45 hover:bg-amber-900/40 border border-amber-500/20 rounded text-[10px] text-amber-400 font-mono">
                            🚫 Embargo
                          </button>
                          <button onClick={() => handleDiplomaticAction('sanctions')} className="py-1 bg-amber-950/45 hover:bg-amber-900/40 border border-amber-500/20 rounded text-[10px] text-amber-400 font-mono">
                            🚫 Sanciones
                          </button>
                        </div>
                      </div>

                      {/* SOBERANÍA Y OTROS */}
                      <div className="space-y-1.5 p-2 bg-slate-950/30 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block border-b border-white/5 pb-1 mb-1">Soberanía / Ruptura</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button onClick={() => handleDiplomaticAction('protectorate')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 30 Inf">
                            👑 Protectorado
                          </button>
                          <button onClick={() => handleDiplomaticAction('vassalage')} className="py-1 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-[10px] text-white font-mono" title="Cuesta 50 Inf">
                            🔗 Vasallaje
                          </button>
                          <button onClick={() => handleDiplomaticAction('break_relations')} className="py-1 bg-red-950/40 hover:bg-red-900/30 border border-red-500/30 rounded text-[10px] text-red-300 font-mono">
                            💔 Romper Rel.
                          </button>
                          <button onClick={executeWarToggle} className="py-1 bg-red-900/60 hover:bg-red-800/60 border border-red-500 rounded text-[10px] text-white font-bold font-mono">
                            ⚔️ Declarar Guerra
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className={`${S.cardDeep} flex items-center justify-center min-h-[300px] text-slate-500 text-xs italic`}>
            Selecciona una firma de transmisiones de la lista para establecer enlace de comunicación.
          </div>
        )}
      </div>
    </div>
  );
};

export default DiplomacyChat;
