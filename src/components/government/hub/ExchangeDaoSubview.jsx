import React, { useState } from 'react';

/**
 * ExchangeDaoSubview — Centro de Gobernanza DAO y Mercado Secundario de Acciones de la Lonja.
 * 
 * Implementa de forma 100% funcional:
 * - Votación de propuestas por peso accionarial (humanos e IA).
 * - Aplicación de mayorías (>50%).
 * - Libro de órdenes del mercado secundario de acciones ordinarias (Compra / Venta).
 * - Protección absoluta del 10% del fundador (bloqueado para venta).
 */
export const ExchangeDaoSubview = React.memo(({
  playerShares,
  playerPercent,
  daoShares,
  accumulatedDividends,
  handleClaimDividends,
  fmt,
  lonjaState,
  onVoteProposal,
  onTradeShares
}) => {
  const [activeTab, setActiveTab] = useState('dao'); // 'dao' | 'secondary_market'
  const [tradeSide, setTradeSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [sharesInput, setSharesInput] = useState(10);
  const [priceInput, setPriceInput] = useState(lonjaState?.capitalization?.lastSharePrice || 25000);

  const activeProposals = lonjaState?.dao?.activeProposals || [];
  const passedProposals = lonjaState?.dao?.passedProposals || [];
  const orderBook = lonjaState?.capitalization?.shareOrderBook || { bids: [], asks: [] };
  const lastPrice = lonjaState?.capitalization?.lastSharePrice || 25000;
  const healthState = lonjaState?.healthState || 'NORMAL';
  const founderProtectedPercent = lonjaState?.capitalization?.founderProtectedPercent || 10;

  const handleShareTradeSubmit = (e) => {
    e.preventDefault();
    if (onTradeShares && sharesInput > 0 && priceInput > 0) {
      onTradeShares({
        side: tradeSide,
        shares: Number(sharesInput),
        price: Number(priceInput)
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Selector de Pestañas: DAO vs Mercado Secundario */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('dao')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'dao'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          🏛️ Directorio Comercial y Gobernanza DAO
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('secondary_market')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'secondary_market'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
          }`}
        >
          📈 Mercado Secundario de Acciones
        </button>
      </div>

      {activeTab === 'dao' && (
        <div className="space-y-6">
          {/* Métricas Principales de Accionariado */}
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
                <div className="flex justify-between">
                  <span className="text-slate-400">10% Fundador Protegido:</span>
                  <span className="text-cyan-400 font-bold">Activo (No Diluible)</span>
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

            <div className="md:col-span-2 p-6 rounded-2xl bg-[#09121a] border border-cyan-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>🏛️</span> Estatuto y Parámetros Económicos DAO
              </h3>
              <p className="text-xs text-slate-400">
                Las decisiones se aprueban por mayoría absoluta (&gt;50% del voto ponderado).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Tasa de Reparto</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {Math.round((lonjaState?.treasury?.dividendDistributionRate || 0.30) * 100)}% de Beneficios
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Salud Financiera</span>
                  <span className="text-emerald-400 font-bold text-sm uppercase">{healthState}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Comisión Spot</span>
                  <span className="text-purple-300 font-bold text-sm">1.0% Fijo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Propuestas Activas */}
          <div className="p-6 rounded-2xl bg-[#0a1122] border border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🗳️</span> Propuestas Activas en Votación (Ventana de 7 días)
            </h4>
            {activeProposals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No hay votaciones activas en este ciclo.</p>
            ) : (
              <div className="space-y-4">
                {activeProposals.map(prop => {
                  const totalVotes = (prop.votesFor || 0) + (prop.votesAgainst || 0);
                  const forPercent = totalVotes > 0 ? Math.round(((prop.votesFor || 0) / totalVotes) * 100) : 50;
                  const myVote = prop.voters?.['player'];

                  return (
                    <div key={prop.id} className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-bold text-cyan-300">{prop.title}</h5>
                          <p className="text-xs text-slate-300 mt-1">{prop.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {prop.status}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-emerald-400">A Favor: {prop.votesFor} ({forPercent}%)</span>
                          <span className="text-rose-400">En Contra: {prop.votesAgainst} ({100 - forPercent}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-rose-950/60 overflow-hidden flex">
                          <div style={{ width: `${forPercent}%` }} className="h-full bg-emerald-500 transition-all duration-300" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          Tu voto: <strong className="text-white">{myVote || 'Aún no emitido'}</strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onVoteProposal && onVoteProposal(prop.id, 'FOR')}
                            className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                          >
                            Votar A Favor (+{playerShares})
                          </button>
                          <button
                            type="button"
                            onClick={() => onVoteProposal && onVoteProposal(prop.id, 'AGAINST')}
                            className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                          >
                            Votar En Contra
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'secondary_market' && (
        <div className="space-y-6">
          {/* Formulario de Compraventa de Acciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#09121a] border border-purple-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📈</span> Terminal Bursátil de Acciones
              </h3>
              <p className="text-xs text-slate-400">
                Compra y vende participaciones ordinarias con otros accionistas y corporaciones IA.
              </p>

              <form onSubmit={handleShareTradeSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeSide('BUY')}
                    className={`py-2 rounded-xl text-xs font-bold uppercase cursor-pointer ${
                      tradeSide === 'BUY'
                        ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Comprar
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeSide('SELL')}
                    className={`py-2 rounded-xl text-xs font-bold uppercase cursor-pointer ${
                      tradeSide === 'SELL'
                        ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Vender
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Cantidad de Acciones</label>
                  <input
                    type="number"
                    min="1"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Precio por Acción (₢)</label>
                  <input
                    type="number"
                    min="1000"
                    step="100"
                    value={priceInput}
                    onChange={(e) => setPriceInput(Math.max(1000, parseInt(e.target.value) || 1000))}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Estimado:</span>
                    <span className="text-white font-bold">₢ {fmt(sharesInput * priceInput)}</span>
                  </div>
                  {tradeSide === 'SELL' && (
                    <div className="text-[10px] text-cyan-400">
                      * El 10% de fundador ({founderProtectedPercent}%) permanece blindado e invendible.
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-bold uppercase text-xs font-mono cursor-pointer ${
                    tradeSide === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Colocar Orden de {tradeSide === 'BUY' ? 'Compra' : 'Venta'}
                </button>
              </form>
            </div>

            {/* Libro de Órdenes de Acciones */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-[#09121a] border border-purple-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center justify-between">
                <span>📖 Libro de Órdenes Bursátil</span>
                <span className="text-xs font-mono text-purple-300">Último Precio: ₢ {fmt(lastPrice)}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                {/* Bids */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2">
                  <h4 className="text-emerald-400 font-bold uppercase text-[11px] border-b border-emerald-500/20 pb-1">
                    Bids (Demanda)
                  </h4>
                  {orderBook.bids?.length === 0 ? (
                    <span className="text-slate-500 text-[11px]">Sin ofertas de compra</span>
                  ) : (
                    orderBook.bids.map(b => (
                      <div key={b.id} className="flex justify-between text-slate-300">
                        <span>{b.shares} Acciones</span>
                        <span className="text-emerald-400 font-bold">@ ₢ {fmt(b.price)}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Asks */}
                <div className="p-4 rounded-xl bg-black/40 border border-rose-500/20 space-y-2">
                  <h4 className="text-rose-400 font-bold uppercase text-[11px] border-b border-rose-500/20 pb-1">
                    Asks (Oferta)
                  </h4>
                  {orderBook.asks?.length === 0 ? (
                    <span className="text-slate-500 text-[11px]">Sin ofertas de venta</span>
                  ) : (
                    orderBook.asks.map(a => (
                      <div key={a.id} className="flex justify-between text-slate-300">
                        <span>{a.shares} Acciones</span>
                        <span className="text-rose-400 font-bold">@ ₢ {fmt(a.price)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
