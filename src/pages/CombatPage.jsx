import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CombatPage = ({ state, SHIPS, DEFENSES, S, ProgressBar, fmt }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [combatFilter, setCombatFilter] = useState('all'); // 'all' | 'attack' | 'defense'
  const [visibleLogsCount, setVisibleLogsCount] = useState(10);

  const activeMissions = state.fleetMissions || [];
  const incomingAttacks = activeMissions.filter(m => m.type === 'attack' && m.isAI);
  const playerExpeditions = activeMissions.filter(m => m.type === 'expedition' || (m.type === 'attack' && !m.isAI));

  const filteredLogs = state.combatLog.filter(log => {
    const isPlayerAtk = log.attacker.name === state.playerName;
    if (combatFilter === 'attack') return isPlayerAtk;
    if (combatFilter === 'defense') return !isPlayerAtk;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Overview Cards for Operations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={S.cardDeep + " border-red-500/25 bg-red-950/5"}>
          <div className="text-xs text-red-400 uppercase tracking-widest font-mono mb-1">Ataques Hostiles Detectados</div>
          <div className="text-3xl font-bold text-red-200">{incomingAttacks.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Sistemas de escaneo profundo rastreando vectores hostiles.</p>
        </div>

        <div className={S.cardDeep + " border-cyan-500/25 bg-cyan-950/5"}>
          <div className="text-xs text-cyan-400 uppercase tracking-widest font-mono mb-1">Operaciones Proactivas</div>
          <div className="text-3xl font-bold text-cyan-200">{playerExpeditions.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Flotas aliadas en tránsito a través de cuadrantes galácticos.</p>
        </div>

        <div className={S.cardDeep}>
          <div className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">Total Combates Históricos</div>
          <div className="text-3xl font-bold text-slate-200">{state.combatLog.length}</div>
          <p className="text-[10px] text-slate-500 mt-1">Registros tácticos almacenados en la base de datos local.</p>
        </div>
      </div>

      {/* Grid: Live Missions (Left) & Log (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Radar Militar en Vivo */}
        <div className={`${S.cardDeep} lg:col-span-5 flex flex-col`}>
          <h3 className="text-sm font-semibold mb-3 text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Radar de Operaciones Militares en Curso
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 flex-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            {incomingAttacks.map(m => {
              const remaining = Math.max(0, (m.arrivalTime - Date.now()) / 1000);
              return (
                <div key={m.id} className="p-2 bg-red-950/20 border border-red-500/30 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-red-400">⚠️ INVASIÓN DETECTADA</span>
                    <span className="font-mono font-bold text-red-200">{Math.ceil(remaining)}s</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Flota hostil de <span className="font-bold text-white">{m.from.name || "AI"}</span> se dirige a <span className="text-cyan-300">{m.to.name || "Tus coordenadas"}</span>.
                  </div>
                  <ProgressBar value={m.arrivalTime - Date.now()} max={m.arrivalTime - m.departureTime} color="from-red-600 to-amber-500" height="h-1" />
                </div>
              );
            })}

            {playerExpeditions.map(m => {
              const remaining = Math.max(0, (m.arrivalTime - Date.now()) / 1000);
              return (
                <div key={m.id} className="p-2 bg-cyan-950/20 border border-cyan-500/25 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-cyan-400 capitalize">🛸 Misión: {m.type}</span>
                    <span className="font-mono font-bold text-cyan-200">{Math.ceil(remaining)}s</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Flota despachada hacia <span className="text-slate-200">{m.to.name || `${m.to.galaxy}:${m.to.system}:${m.to.position}`}</span>.
                  </div>
                  <ProgressBar value={m.arrivalTime - Date.now()} max={m.arrivalTime - m.departureTime} color="from-cyan-500 to-indigo-500" height="h-1" />
                </div>
              );
            })}

            {activeMissions.length === 0 && (
              <div className="text-xs text-slate-500 italic text-center py-12">
                Ninguna flota militar en vuelo detectada por los sensores orbitales.
              </div>
            )}
          </div>
        </div>

        {/* Historial de Combates */}
        <div className={`${S.cardDeep} lg:col-span-7`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-2 border-b border-white/5">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">🗄️ Historial de Operaciones Finalizadas</h3>
            <div className="flex gap-1">
              {['all', 'attack', 'defense'].map(f => (
                <button
                  key={f}
                  onClick={() => setCombatFilter(f)}
                  className={`px-2 py-0.5 text-[9px] uppercase font-mono rounded-lg border transition-all ${
                    combatFilter === f 
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white' 
                      : 'border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'attack' ? 'Ataques' : 'Defensas'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            {filteredLogs.slice().reverse().slice(0, visibleLogsCount).map(c => {
              const isPlayerAtk = c.attacker.name === state.playerName;
              const isPlayerDef = c.defender.name === state.playerName;
              const playerWon = (isPlayerAtk && c.result.winner === 'attacker') || (isPlayerDef && c.result.winner === 'defender');
              const playerLost = (isPlayerAtk && c.result.winner === 'defender') || (isPlayerDef && c.result.winner === 'attacker');
              const winText = playerWon ? '🏆 Victoria' : playerLost ? '💀 Derrota' : '🤝 Empate';
              
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedReport(c)}
                  className={`p-2 rounded-xl border cursor-pointer bg-slate-950/20 hover:bg-slate-900/40 transition-all ${
                    playerWon ? 'border-emerald-500/20 hover:border-emerald-500/40' : playerLost ? 'border-red-500/20 hover:border-red-500/40' : 'border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-0.5 text-[11px]">
                    <span className={`font-bold uppercase tracking-wider ${playerWon ? 'text-emerald-400' : playerLost ? 'text-red-400' : 'text-amber-400'}`}>
                      {winText}
                    </span>
                    <span className="font-mono text-slate-600 text-[9px]">{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <span className="text-slate-100 font-semibold">{c.attacker.name}</span> → <span className="text-slate-100 font-semibold">{c.defender.name}</span> · {c.result.rounds.length} rondas
                  </div>
                  <div className="flex gap-2 text-[9px] text-slate-500 mt-0.5 flex-wrap">
                    {c.summary?.formation && <span className="capitalize">⚔️ {c.summary.formation}</span>}
                    <span>💀 {c.summary?.atkLostTotal || 0}/{c.summary?.defLostTotal || 0}</span>
                    <span>⛏️ {fmt(c.result.debris.metal)}M {fmt(c.result.debris.crystal)}C</span>
                  </div>
                </div>
              );
            })}

            {filteredLogs.length > visibleLogsCount && (
              <button 
                onClick={() => setVisibleLogsCount(prev => prev + 10)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-[10px] font-semibold text-slate-300 hover:text-white transition-all uppercase cursor-pointer"
              >
                Cargar más registros (+10)
              </button>
            )}

            {filteredLogs.length === 0 && (
              <div className="text-xs text-slate-500 italic text-center py-12">
                No hay operaciones registradas en esta categoría.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-deep border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto font-mono text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">📜 Registro Operativo de Batalla</h3>
              <span className="text-[10px] font-mono text-slate-500">{new Date(selectedReport.timestamp).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
                <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px] mb-1">🛸 Atacante</span>
                <span className="font-bold text-sm text-slate-100">{selectedReport.attacker.name}</span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Weap: +{(selectedReport.attacker.tech?.weapons||0)*10}% · Shld: +{(selectedReport.attacker.tech?.shields||0)*10}%
                </div>
              </div>
              <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3">
                <span className="text-red-400 font-bold uppercase tracking-wider block text-[10px] mb-1">🛡️ Defensor</span>
                <span className="font-bold text-sm text-slate-100">{selectedReport.defender.name}</span>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Weap: +{(selectedReport.defender.tech?.weapons||0)*10}% · Shld: +{(selectedReport.defender.tech?.shields||0)*10}%
                </div>
              </div>
            </div>

            {selectedReport.summary && (
              <div className="mb-4 bg-slate-950/40 rounded-xl p-3 border border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Bajas Atacante:</span>
                  <span className="text-red-400 font-bold">{selectedReport.summary.atkLostTotal} naves</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Bajas Defensor:</span>
                  <span className="text-red-400 font-bold">{selectedReport.summary.defLostTotal} unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Eficiencia Táctica:</span>
                  <span className="text-cyan-400 font-bold">{selectedReport.summary.efficiency}%</span>
                </div>
                {selectedReport.summary.formation && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Formación Usada:</span>
                    <span className="text-amber-400 font-bold capitalize">{selectedReport.summary.formation}</span>
                  </div>
                )}
                {selectedReport.summary.autoRetreatUsed && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Retirada Automática:</span>
                    <span className="text-emerald-400 font-bold">Activada</span>
                  </div>
                )}
                {selectedReport.summary.intelBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bonus Inteligencia:</span>
                    <span className="text-purple-400 font-bold">+{Math.round(selectedReport.summary.intelBonus * 100)}% ataque</span>
                  </div>
                )}
              </div>
            )}

            <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">⚔️ Cronología del Combate por Rondas</h4>
            <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-1">
              {selectedReport.result.rounds.map((r, i) => (
                <div key={i} className="bg-slate-950/60 rounded-xl p-2.5 border border-white/5 font-mono text-[11px]">
                  <div className="font-bold text-cyan-400 mb-1 flex justify-between">
                    <span>⚔️ RONDA {r.round}</span>
                    <span className="text-slate-500">Dmg total: {fmt(r.atkDmg + r.defDmg)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400">
                    <div>Atacantes Operativas: <span className="text-slate-200 font-bold">{r.atkAlive}</span></div>
                    <div>Defensores Operativas: <span className="text-slate-200 font-bold">{r.defAlive}</span></div>
                    <div>Daño Causado Atk: <span className="text-emerald-500">{fmt(r.atkDmg)}</span></div>
                    <div>Daño Causado Def: <span className="text-rose-400">{fmt(r.defDmg)}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <span className="font-bold text-emerald-400 block mb-1 text-[11px]">🏆 Naves supervivientes</span>
                {Object.entries(selectedReport.result.atkSurvivors || {}).map(([id, q]) => (
                  <div key={id} className="text-slate-400 text-[10px]">{SHIPS[id]?.icon || '🚀'} {SHIPS[id]?.name || id}: <span className="text-emerald-300">{q}</span></div>
                ))}
                {Object.keys(selectedReport.result.atkSurvivors || {}).length === 0 && <div className="text-slate-600 italic text-[10px]">Ninguna sobreviviente</div>}
              </div>
              <div>
                <span className="font-bold text-rose-400 block mb-1 text-[11px]">💀 Bajas atacante por tipo</span>
                {Object.entries(selectedReport.result.atkLosses || {}).map(([id, q]) => (
                  <div key={id} className="text-slate-400 text-[10px]">{SHIPS[id]?.icon || '🚀'} {SHIPS[id]?.name || id}: <span className="text-red-300">{q}</span></div>
                ))}
                {Object.keys(selectedReport.result.atkLosses || {}).length === 0 && <div className="text-slate-600 italic text-[10px]">Sin pérdidas</div>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 mt-2">
              <div>
                <span className="font-bold text-cyan-400 block mb-1 text-[11px]">🛡️ Defensas supervivientes</span>
                {Object.entries({...selectedReport.result.defShipSurvivors, ...selectedReport.result.defDefenseSurvivors}).map(([id, q]) => (
                  <div key={id} className="text-slate-400 text-[10px]">{(SHIPS[id] || DEFENSES[id])?.icon || '🛡️'} {(SHIPS[id] || DEFENSES[id])?.name || id}: <span className="text-cyan-300">{q}</span></div>
                ))}
                {Object.keys({...selectedReport.result.defShipSurvivors, ...selectedReport.result.defDefenseSurvivors}).length === 0 && <div className="text-slate-600 italic text-[10px]">Ninguna sobreviviente</div>}
              </div>
              <div>
                <span className="font-bold text-orange-400 block mb-1 text-[11px]">💥 Bajas defensor por tipo</span>
                {Object.entries({...selectedReport.result.defShipLosses, ...selectedReport.result.defDefenseLosses}).map(([id, q]) => (
                  <div key={id} className="text-slate-400 text-[10px]">{(SHIPS[id] || DEFENSES[id])?.icon || '💥'} {(SHIPS[id] || DEFENSES[id])?.name || id}: <span className="text-orange-300">{q}</span></div>
                ))}
                {Object.keys({...selectedReport.result.defShipLosses, ...selectedReport.result.defDefenseLosses}).length === 0 && <div className="text-slate-600 italic text-[10px]">Sin pérdidas</div>}
              </div>
            </div>

            <button onClick={() => setSelectedReport(null)} className={`w-full mt-5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-300 font-bold uppercase tracking-wider hover:text-white transition-all`}>
              Cerrar Registro Táctico
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CombatPage;
