import React from 'react';

export const FleetRelocationView = ({
  planets,
  fromPlanetId,
  setFromPlanetId,
  toPlanetId,
  setToPlanetId,
  fromPlanet,
  selectedShipsToMove,
  setSelectedShipsToMove,
  onExecuteRelocation
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Origen */}
      <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-cyan-500/20 space-y-4">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
          <span>🛫</span> Mundo de Origen
        </h3>
        <select
          value={fromPlanetId}
          onChange={(e) => {
            setFromPlanetId(e.target.value);
            setSelectedShipsToMove({});
          }}
          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
        >
          {planets.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} [{p.galaxy}:{p.system}:{p.position}]
            </option>
          ))}
        </select>

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          <span className="text-xs text-slate-400">Hangar disponible:</span>
          {Object.entries(fromPlanet?.fleet || {}).filter(([_, qty]) => qty > 0).length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-black/30 rounded-xl border border-white/5">
              No hay naves estacionadas en este mundo.
            </div>
          ) : (
            Object.entries(fromPlanet?.fleet || {}).map(([sId, qty]) => {
              if (qty <= 0) return null;
              const currentSelected = selectedShipsToMove[sId] || 0;
              return (
                <div key={sId} className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5 text-xs">
                  <div>
                    <div className="font-bold text-slate-200 capitalize">{sId}</div>
                    <div className="text-[10px] text-slate-400">Total: {qty}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max={qty}
                      value={currentSelected}
                      onChange={(e) => setSelectedShipsToMove({
                        ...selectedShipsToMove,
                        [sId]: Math.min(qty, Math.max(0, Number(e.target.value)))
                      })}
                      className="w-16 bg-black/80 border border-white/10 rounded-lg px-2 py-1 text-right text-xs font-mono text-cyan-300"
                    />
                    <button
                      onClick={() => setSelectedShipsToMove({ ...selectedShipsToMove, [sId]: qty })}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded text-slate-300 border border-white/5"
                    >
                      Max
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Destino */}
      <div className="p-5 rounded-2xl bg-[#060a16]/80 border border-indigo-500/20 space-y-4">
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
          <span>🛬</span> Mundo de Destino
        </h3>
        {planets.filter(p => p.id !== fromPlanetId).length === 0 ? (
          <div className="p-3 rounded-xl bg-black/50 border border-indigo-500/20 text-xs text-indigo-300/80 italic">
            Solo dispones de un mundo en tu red. Coloniza nuevos mundos para habilitar la reubicación de flotas.
          </div>
        ) : (
          <select
            value={toPlanetId}
            onChange={(e) => setToPlanetId(e.target.value)}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
          >
            {planets.filter(p => p.id !== fromPlanetId).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} [{p.galaxy}:{p.system}:{p.position}]
              </option>
            ))}
          </select>
        )}

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Distancia intercolonial:</span>
            <span className="font-mono text-indigo-300 font-bold">Enlace Seguro</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Estado de hangares receptores:</span>
            <span className="font-mono text-emerald-400">Operativo 100%</span>
          </div>
        </div>
      </div>

      {/* Despacho */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-[#0e1630] to-[#040711] border border-indigo-500/30 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">
            Consola de Reubicación
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transfiere escuadrones completos de forma directa entre los hangares de tus colonias aliadas.
          </p>
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
            Total naves a reubicar:{' '}
            <strong className="text-white font-mono text-sm">
              {Object.values(selectedShipsToMove).reduce((a, b) => a + b, 0)}
            </strong>
          </div>
        </div>

        <button
          onClick={onExecuteRelocation}
          disabled={
            fromPlanetId === toPlanetId ||
            Object.values(selectedShipsToMove).reduce((a, b) => a + b, 0) <= 0
          }
          className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
            fromPlanetId !== toPlanetId &&
            Object.values(selectedShipsToMove).reduce((a, b) => a + b, 0) > 0
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          Ejecutar Reubicación
        </button>
      </div>
    </div>
  );
};
