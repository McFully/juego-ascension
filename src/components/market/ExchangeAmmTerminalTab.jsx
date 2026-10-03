import React, { useState } from 'react';

export const ExchangeAmmTerminalTab = ({
  planetRes: propPlanetRes,
  currentBuildings: propCurrentBuildings,
  executionMode: propExecutionMode,
  setExecutionMode: propSetExecutionMode,
  orderType: propOrderType,
  setOrderType: propSetOrderType,
  selectedRes: propSelectedRes,
  setSelectedRes: propSetSelectedRes,
  tradeAmount: propTradeAmount,
  setTradeAmount: propSetTradeAmount,
  limitTargetPrice: propLimitTargetPrice,
  setLimitTargetPrice: propSetLimitTargetPrice,
  state,
  dispatch,
  currentPlanet,
  fmt = (n) => n
}) => {
  const [localExecutionMode, setLocalExecutionMode] = useState('market');
  const [localOrderType, setLocalOrderType] = useState('buy');
  const [localSelectedRes, setLocalSelectedRes] = useState('metal');
  const [localTradeAmount, setLocalTradeAmount] = useState(100000);
  const [localLimitTargetPrice, setLocalLimitTargetPrice] = useState(1.0);

  const executionMode = propExecutionMode ?? localExecutionMode;
  const setExecutionMode = propSetExecutionMode ?? setLocalExecutionMode;
  const orderType = propOrderType ?? localOrderType;
  const setOrderType = propSetOrderType ?? setLocalOrderType;
  const selectedRes = propSelectedRes ?? localSelectedRes;
  const setSelectedRes = propSetSelectedRes ?? setLocalSelectedRes;
  const tradeAmount = propTradeAmount ?? localTradeAmount;
  const setTradeAmount = propSetTradeAmount ?? setLocalTradeAmount;
  const limitTargetPrice = propLimitTargetPrice ?? localLimitTargetPrice;
  const setLimitTargetPrice = propSetLimitTargetPrice ?? setLocalLimitTargetPrice;

  const planetRes = propPlanetRes || currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const currentBuildings = propCurrentBuildings || currentPlanet?.buildings || {};
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Cotizaciones y Bóvedas */}
      <div className="p-5 rounded-2xl bg-[#070b16]/90 border border-amber-500/20 space-y-4">
        <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <span>🏦</span> Bóvedas de Custodia Física
        </h3>
        <div className="space-y-3">
          {[
            { key: 'metal', name: 'Metal Bruto', icon: '⛏️', color: 'text-cyan-300', rate: '1.02 ₢' },
            { key: 'crystal', name: 'Cristal Refinado', icon: '💎', color: 'text-emerald-300', rate: '1.68 ₢' },
            { key: 'deuterium', name: 'Deuterio Cuántico', icon: '⚗️', color: 'text-amber-300', rate: '3.35 ₢' }
          ].map(r => (
            <div key={r.key} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{r.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white">{r.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Cotización: {r.rate}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-mono font-bold ${r.color}`}>
                  {fmt(planetRes[r.key] || 0)}
                </div>
                <div className="text-[9px] text-slate-500 font-mono">En custodia</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-400 space-y-2">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <span>🛡️</span> Garantía de Búnkeres Blindados
          </div>
          <p className="text-[11px] leading-relaxed">
            Nivel de Búnker {currentBuildings.exchangeBunkers || 1}: El 40% de los recursos depositados no puede ser saqueado bajo ninguna circunstancia.
          </p>
        </div>
      </div>

      {/* Columna Central: Órdenes y Operaciones */}
      <div className="p-5 rounded-2xl bg-[#070b16]/90 border border-white/10 space-y-4">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span> Consola de Operación AMM
        </h3>

        {/* Modo de Ejecución: Inmediata vs Limit */}
        <div className="flex gap-2">
          <button
            onClick={() => setExecutionMode('market')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
              executionMode === 'market'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
                : 'bg-black/40 text-slate-400 border border-white/5'
            }`}
          >
            A Mercado (Inmediata)
          </button>
          <button
            onClick={() => setExecutionMode('limit')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
              executionMode === 'limit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
                : 'bg-black/40 text-slate-400 border border-white/5'
            }`}
          >
            Orden Limit (+Parking)
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              orderType === 'buy'
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Comprar Materia Prima
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              orderType === 'sell'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Vender Excedente
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">Seleccionar Materia Prima:</label>
          <div className="grid grid-cols-3 gap-2">
            {['metal', 'crystal', 'deuterium'].map(r => (
              <button
                key={r}
                onClick={() => setSelectedRes(r)}
                className={`py-2 px-2 rounded-xl text-xs font-mono font-bold capitalize border transition-all ${
                  selectedRes === r
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {r === 'metal' ? '⛏️ Metal' : r === 'crystal' ? '💎 Cristal' : '⚗️ Deuterio'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 flex justify-between">
            <span>Cantidad a negociar:</span>
            <span className="font-mono text-slate-300">{fmt(tradeAmount)} u.</span>
          </label>
          <input
            type="number"
            min="10000"
            step="50000"
            value={tradeAmount}
            onChange={e => setTradeAmount(Math.max(10000, Number(e.target.value)))}
            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
          />
        </div>

        {executionMode === 'limit' && (
          <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-cyan-500/20">
            <label className="text-xs text-cyan-300 flex justify-between">
              <span>Precio Límite Disparador:</span>
              <span className="font-mono">{limitTargetPrice} ₢ / u.</span>
            </label>
            <input
              type="number"
              step="0.05"
              value={limitTargetPrice}
              onChange={e => setLimitTargetPrice(Math.max(0.1, Number(e.target.value)))}
              className="w-full bg-black/80 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
            />
            <div className="text-[10px] text-slate-400">
              {orderType === 'buy' ? 'Se comprará automáticamente cuando cotice a este precio o menos.' : 'Se venderá automáticamente cuando cotice a este precio o más.'}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (executionMode === 'limit') {
              dispatch({
                type: 'CREATE_LIMIT_ORDER',
                orderType: orderType === 'buy' ? 'buy_limit' : 'sell_limit',
                resource: selectedRes,
                amount: tradeAmount,
                targetPrice: limitTargetPrice,
                hasParkedShip: true,
                destinationPlanetId: currentPlanet.id
              });
            } else if (orderType === 'buy') {
              dispatch({
                type: 'MARKET_TRADE',
                planetId: currentPlanet.id,
                sellResource: 'credits',
                buyResource: selectedRes,
                sellAmount: Math.floor(tradeAmount * (selectedRes === 'metal' ? 1.02 : selectedRes === 'crystal' ? 1.68 : 3.35)),
                buyAmount: tradeAmount
              });
            } else {
              dispatch({
                type: 'MARKET_TRADE',
                planetId: currentPlanet.id,
                sellResource: selectedRes,
                buyResource: 'credits',
                sellAmount: tradeAmount,
                buyAmount: Math.floor(tradeAmount * (selectedRes === 'metal' ? 0.98 : selectedRes === 'crystal' ? 1.60 : 3.20))
              });
            }
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold uppercase tracking-wider text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          {executionMode === 'limit' ? 'Atracar Nave y Registrar Orden Limit' : 'Ejecutar Transacción Inmediata'}
        </button>
      </div>

      {/* Columna Derecha: Parking Logístico y Órdenes Activas */}
      <div className="p-5 rounded-2xl bg-[#070b16]/90 border border-cyan-500/20 space-y-4">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
          <span>🛸 Parking y Muelles de Atraque</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {(state.exchangeOrders || []).length} / {(currentBuildings.exchangeDocks || 1) * 10} Slots
          </span>
        </h3>

        {(state.exchangeOrders || []).length === 0 ? (
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
            <div className="text-xs text-white font-bold">Muelles Disponibles</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No hay naves atracadas esperando órdenes Limit. Puedes atracar transportes para esperar cotizaciones ventajosas.
            </p>
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
              ✓ Tarifa de parking: {Math.max(10, Math.floor(50 / (currentBuildings.exchangeDocks || 1)))} ₢ / ciclo.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {(state.exchangeOrders || []).map(o => (
              <div key={o.id} className="p-3 rounded-xl bg-black/50 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${o.type === 'buy_limit' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                      {o.type === 'buy_limit' ? 'COMPRA LIMIT' : 'VENTA LIMIT'}
                    </span>
                    <span className="text-xs font-bold text-white uppercase">{o.resource}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    {fmt(o.amount)} u. @ {o.targetPrice} ₢
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'CANCEL_LIMIT_ORDER', orderId: o.id })}
                  className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono hover:bg-rose-500 hover:text-black transition-all"
                >
                  Liberar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
