import React from 'react';
import { motion } from 'framer-motion';

export const CombatSimulatorModal = ({ simResult, setSimResult, state, target, simDefTech, SHIPS, DEFENSES, ProgressBar, fmt, S }) => {
  if (!simResult) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSimResult(null)}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-space-800 border border-cyan-500/40 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" 
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">🔮 Simulación de Combate</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
            <div className="font-semibold text-emerald-300 mb-1">🛸 Atacante</div>
            <div className="text-sm">{state.playerName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Atk+{(state.research.weapons||0)*10}% Esc+{(state.research.shields||0)*10}% Bla+{(state.research.armour||0)*8}%</div>
            <div className="text-xs text-slate-400 mt-1">{Object.values(simResult.atkSurvivors).reduce((a, b) => a + b, 0)} sobrevivientes</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="font-semibold text-red-300 mb-1">🛡️ Defensor</div>
            <div className="text-sm">{target?.isAI ? target?.name : 'Tu planeta'}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Atk+{(simDefTech.weapons||0)*10}% Esc+{(simDefTech.shields||0)*10}% Bla+{(simDefTech.armour||0)*8}%</div>
            <div className="text-xs text-slate-400 mt-1">
              {Object.values(simResult.defShipSurvivors || {}).reduce((a, b) => a + b, 0)} naves, {Object.values(simResult.defDefenseSurvivors || {}).reduce((a, b) => a + b, 0)} defensas
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          {simResult.winner === 'attacker' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <div className="text-4xl mb-1">🏆</div>
              <div className="text-2xl font-bold text-emerald-400">Victoria</div>
            </motion.div>
          )}
          {simResult.winner === 'defender' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <div className="text-4xl mb-1">💀</div>
              <div className="text-2xl font-bold text-red-400">Derrota</div>
            </motion.div>
          )}
          {simResult.winner === 'draw' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
              <div className="text-4xl mb-1">🤝</div>
              <div className="text-2xl font-bold text-amber-400">Empate</div>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="font-semibold mb-1 text-emerald-300">Naves sobrevivientes</div>
            {Object.entries(simResult.atkSurvivors || {}).map(([id, q]) => (
              <motion.div key={id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-slate-400">{SHIPS[id]?.name || id}: {q}</motion.div>
            ))}
            {Object.keys(simResult.atkSurvivors || {}).length === 0 && <div className="text-xs text-slate-400">Ninguna</div>}
          </div>
          <div>
            <div className="font-semibold mb-1 text-red-300">Sobrevivientes</div>
            {Object.entries({...simResult.defShipSurvivors, ...simResult.defDefenseSurvivors}).map(([id, q]) => (
              <motion.div key={id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-slate-400">{(SHIPS[id] || DEFENSES[id])?.name || id}: {q}</motion.div>
            ))}
            {Object.keys({...simResult.defShipSurvivors, ...simResult.defDefenseSurvivors}).length === 0 && <div className="text-xs text-slate-400">Ninguna</div>}
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-4">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Escombros: {fmt(simResult.debris.metal)}M / {fmt(simResult.debris.crystal)}C
          </motion.span>
          <motion.span className="ml-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Rondas: {simResult.rounds.length}
          </motion.span>
        </div>

        <h4 className="font-semibold mb-2 text-sm text-cyan-300 flex items-center justify-between font-mono">
          <span>⚔️ Telemetría de Rondas de Combate</span>
          <span className="text-[10px] text-slate-500 font-normal">Impactos Gauss y Disipación de Escudos</span>
        </h4>
        <div className="space-y-2 mb-4 font-mono">
          {simResult.rounds.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}>
              <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-2.5 text-xs shadow-md">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Ronda {r.round}
                  </span>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-400">⚡ Láser: {fmt(r.atkDmg)}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-rose-400">💥 Gauss: {fmt(r.defDmg)}</span>
                  </div>
                </div>

                {/* Visualizador de Fuerza Táctica Relativa */}
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-1.5 bg-black/40 p-1.5 rounded-lg border border-white/5">
                  <div className="flex justify-between text-emerald-300">
                    <span>🛸 Atacante: {r.atkAlive}</span>
                    <span className="text-slate-500">{r.atkShots || 0} disparos</span>
                  </div>
                  <div className="flex justify-between text-rose-300">
                    <span>🛡️ Defensor: {r.defAlive}</span>
                    <span className="text-slate-500">{r.defShots || 0} salvas</span>
                  </div>
                </div>

                <ProgressBar 
                  value={r.atkAlive} 
                  max={Math.max(r.atkAlive + r.defAlive, 1)} 
                  color={r.atkAlive >= r.defAlive ? 'from-cyan-500 via-emerald-500 to-teal-400' : 'from-rose-500 via-red-500 to-amber-500'} 
                  height="h-1.5" 
                />
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => setSimResult(null)} 
          className="w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 hover:text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
        >
          Cerrar Simulación
        </button>
      </motion.div>
    </div>
  );
};
