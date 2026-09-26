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
      <h3 className="text-sm font-semibold mb-3 text-slate-300 uppercase tracking-wider">📡 Receptores de Frecuencia Activos</h3>
      <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
        {aiList.length === 0 ? (
          <p className="text-slate-500 text-sm">No se encontraron imperios en la vecindad galáctica.</p>
        ) : (
          aiList.map(ai => {
            const isSelected = activeContact?.id === ai.id;
            const intelLvl = getIntelLevel(ai);
            return (
              <div key={ai.id} className={`glass-deep rounded-xl border transition-all ${
                isSelected ? 'border-cyan-500 bg-cyan-950/30' : 'border-white/5 hover:border-white/20'
              }`}>
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
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-300">
                      Nivel Intel: <span className="text-cyan-400">{intelLvl}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {ai.relation > 20 ? '🟢 Amistoso' : ai.relation < -20 ? '🔴 Hostil' : '⚪ Neutral'}
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
