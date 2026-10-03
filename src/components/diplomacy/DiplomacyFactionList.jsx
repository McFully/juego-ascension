import React from 'react';
import { S } from '../../styles.js';

/**
 * DiplomacyFactionList — Lista lateral de receptores de frecuencia y selección de facciones alienígenas.
 */
export const DiplomacyFactionList = ({
  aiList = [],
  activeContact,
  getIntelLevel,
  FACTIONS,
  onSelectContact
}) => {
  return (
    <div className={`${S?.cardDeep || ''} w-full flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>📡</span>
          <span>Receptores Activos</span>
        </h3>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
          {aiList.length} Frecuencias
        </span>
      </div>
      <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
        {aiList.length === 0 ? (
          <p className="text-slate-500 text-xs py-8 text-center">No se encontraron imperios en la vecindad galáctica.</p>
        ) : (
          aiList.map(ai => {
            const isSelected = activeContact?.id === ai.id;
            const intelLvl = getIntelLevel(ai);
            return (
              <div key={ai.id} className={`rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'border-white/10 bg-[#060a16]/80 hover:border-cyan-500/50 hover:bg-[#0c1426]'
              }`}>
                <button
                  type="button"
                  onClick={() => onSelectContact(ai)}
                  className="w-full flex items-center justify-between p-2.5 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{FACTIONS[ai.faction]?.icon || '👽'}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate group-hover:text-cyan-300">{ai.name}</div>
                      <div className="text-[9.5px] text-slate-400 truncate font-mono">
                        {FACTIONS[ai.faction]?.name || 'Civilización Desconocida'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[10px] font-mono font-bold text-slate-300">
                      Nv. <span className="text-cyan-400">{intelLvl}</span>
                    </div>
                    <div className="text-[9.5px] font-mono">
                      {ai.relation > 20 ? '🟢 +'+ai.relation : ai.relation < -20 ? '🔴 '+ai.relation : '⚪ 0'}
                    </div>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DiplomacyFactionList;
