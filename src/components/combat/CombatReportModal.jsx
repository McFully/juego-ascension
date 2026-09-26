import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CombatTacticalArena2D } from './CombatTacticalArena2D.jsx';

export const CombatReportModal = ({ selectedReport, onClose, fmt, SHIPS, DEFENSES }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'tacticalArena'
  if (!selectedReport) return null;


  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-deep border border-cyan-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto font-mono text-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">📜 Registro Operativo de Batalla</h3>
            <div className="flex bg-black/40 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase transition-all cursor-pointer ${
                  activeTab === 'summary' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Resumen Táctico
              </button>
              <button
                onClick={() => setActiveTab('tacticalArena')}
                className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tacticalArena' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                Arena 2D en Vivo
              </button>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{new Date(selectedReport.timestamp).toLocaleString()}</span>
        </div>

        {activeTab === 'tacticalArena' ? (
          <div className="mb-4">
            <CombatTacticalArena2D
              report={selectedReport}
              onClose={onClose}
              fmt={fmt}
              SHIPS={SHIPS}
              DEFENSES={DEFENSES}
            />
          </div>
        ) : (
          <>


        {/* Punto 26: Banner cinemático de desenlace bélico */}
        <div className={`relative overflow-hidden rounded-xl p-4 mb-4 border flex items-center justify-between ${
          selectedReport.result?.winner === 'attacker'
            ? 'bg-gradient-to-r from-emerald-950/80 to-black/90 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
            : selectedReport.result?.winner === 'defender'
              ? 'bg-gradient-to-r from-red-950/80 to-black/90 border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
              : 'bg-gradient-to-r from-cyan-950/80 to-black/90 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
        }`}>
          <div className="space-y-0.5">
            <div className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
              DESENLACE TÁCTICO DE COMBATE
            </div>
            <div className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <span>{selectedReport.result?.winner === 'attacker' ? '🏆 Victoria de la Armada' : selectedReport.result?.winner === 'defender' ? '💀 Derrota Operativa' : '⚖️ Empate Táctico'}</span>
            </div>
          </div>
          <div className="text-3xl opacity-80 select-none">
            {selectedReport.result?.winner === 'attacker' ? '🚀' : selectedReport.result?.winner === 'defender' ? '💥' : '🛡️'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3">
            <span className="text-emerald-400 font-bold uppercase tracking-wider block text-[10px] mb-1">🛸 Atacante</span>
            <span className="font-bold text-sm text-slate-100">{selectedReport.attacker.name}</span>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Weap: +{(selectedReport.attacker.tech?.weapons||0)*10}% · Shld: +{(selectedReport.attacker.tech?.shields||0)*10}%
            </div>
            {selectedReport.summary?.formation && (
              <div className="text-[9px] text-cyan-400 mt-1 capitalize">Formación: {selectedReport.summary.formation}</div>
            )}
          </div>
          <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3">
            <span className="text-cyan-400 font-bold uppercase tracking-wider block text-[10px] mb-1">🛡️ Defensor</span>
            <span className="font-bold text-sm text-slate-100">{selectedReport.defender.name}</span>
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Weap: +{(selectedReport.defender.tech?.weapons||0)*10}% · Shld: +{(selectedReport.defender.tech?.shields||0)*10}%
            </div>
            {selectedReport.defender.coordinates && (
              <div className="text-[9px] text-slate-400 mt-1">Coord: [{selectedReport.defender.coordinates.galaxy}:{selectedReport.defender.coordinates.system}:{selectedReport.defender.coordinates.position}]</div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Cinemática por Rondas</span>
          {(selectedReport.result.rounds || []).map((r, i) => (
            <div key={i} className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-cyan-400">Ronda {r.round}</span>
                <span className="text-slate-400 text-[10px]">Atk Restantes: {r.atkAlive} · Def Restantes: {r.defAlive}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                <div>Daño Infligido Atacante: <span className="text-emerald-400 font-bold">{fmt(r.atkDmg)}</span></div>
                <div>Daño Infligido Defensor: <span className="text-cyan-400 font-bold">{fmt(r.defDmg)}</span></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 mb-4 space-y-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block">Escombros Espaciales Generados</span>
          <div className="flex gap-4 text-xs">
            <span className="text-amber-400 font-bold">⛏️ Metal: {fmt(selectedReport.result.debris.metal)}</span>
            <span className="text-cyan-400 font-bold">💎 Cristal: {fmt(selectedReport.result.debris.crystal)}</span>
          </div>
        </div>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Cerrar Informe
        </button>
      </motion.div>
    </div>
  );
};
