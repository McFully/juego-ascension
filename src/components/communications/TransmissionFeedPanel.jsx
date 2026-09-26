import React from 'react';

export const TransmissionFeedPanel = ({
  filteredNotifs,
  selectedNotif,
  onSelectNotif,
  factionsLore
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
      {/* Lista de Transmisiones */}
      <div className="lg:col-span-5 p-5 rounded-3xl bg-[#090d1f]/90 border border-white/10 space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Canal de Transmisiones ({filteredNotifs.length})
        </h3>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No se registran señales en este canal.
            </div>
          ) : (
            filteredNotifs.map(notif => {
              const isSelected = selectedNotif && selectedNotif.id === notif.id;

              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotif(notif.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                      : 'bg-[#05070f] border-white/5 hover:border-cyan-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white uppercase">{notif.sender}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {notif.typeName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-mono">{notif.message}</p>
                  </div>
                  <span className="text-xs text-cyan-400/60 font-mono">➔</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Visor Holográfico de Mensaje */}
      <div className="lg:col-span-7 p-6 rounded-3xl bg-[#070c1f] border border-cyan-500/30 flex flex-col justify-between shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        {selectedNotif ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="text-4xl p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                {factionsLore[selectedNotif.factionKey]?.icon || '📡'}
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase">{selectedNotif.sender}</h3>
                <span className="text-xs font-mono text-cyan-300">
                  Facción: {factionsLore[selectedNotif.factionKey]?.name || 'Neutral'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#05070f] border border-white/5 text-sm font-mono text-slate-200 leading-relaxed min-h-[150px]">
              {selectedNotif.message}
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-slate-500 pt-2 border-t border-white/5">
              <span>Tipo: {selectedNotif.typeName}</span>
              <span>Prioridad: {selectedNotif.priority}</span>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Selecciona una transmisión para decodificar su señal.
          </div>
        )}
      </div>
    </div>
  );
};
