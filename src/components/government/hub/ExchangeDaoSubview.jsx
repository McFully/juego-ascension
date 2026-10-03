import React from 'react';

export const ExchangeDaoSubview = React.memo(({
  playerShares,
  playerPercent,
  daoShares,
  accumulatedDividends,
  handleClaimDividends,
  fmt
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#09121a] border border-emerald-500/30 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>💎</span> Bóveda de Dividendos
          </h3>
          <p className="text-xs text-slate-400">
            Participaciones acumuladas del fondo común de la Zona Franca.
          </p>
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tus Acciones:</span>
              <span className="text-emerald-400 font-bold">{playerShares} ({playerPercent}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Pool DAO:</span>
              <span className="text-slate-200">{daoShares} Acciones</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="text-slate-400">Dividendos Pendientes:</span>
              <span className="text-amber-300 font-bold text-sm">₢ {fmt(accumulatedDividends)}</span>
            </div>
          </div>
          <button
            type="button"
            disabled={accumulatedDividends <= 0}
            onClick={handleClaimDividends}
            className={`w-full py-2.5 rounded-xl font-bold uppercase text-xs font-mono transition-all cursor-pointer ${
              accumulatedDividends > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
            }`}
          >
            Cobrar Dividendos ₢
          </button>
        </div>

        <div className="md:col-span-2 p-6 rounded-2xl bg-[#09121a] border border-emerald-500/30 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🏛️</span> Estatuto y Gobernanza de Accionistas
          </h3>
          <p className="text-xs text-slate-400">
            La posesión de acciones confiere derecho a voto sobre modificaciones de spread bancario y desgravaciones portuarias en la red neutral.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-slate-400 block text-[10px]">Tasa de Descuento en AMM</span>
              <span className="text-cyan-300 font-bold text-sm">-1.5% Fijo</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/10">
              <span className="text-slate-400 block text-[10px]">Rango de Auditoría Fiscal</span>
              <span className="text-purple-300 font-bold text-sm">Inmunidad Nivel 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
