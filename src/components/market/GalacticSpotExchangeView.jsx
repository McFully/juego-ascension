import React, { useState, useMemo } from 'react';
import { SafeImg } from '../../assets.jsx';
import {
  INSTRUMENTS,
  ORDER_TYPES,
  ORDER_SIDES,
  ORDER_STATUS,
  getOrderBook,
  estimateMarketExecution,
  checkPhysicalAccess,
  toCandleArray,
  getMarketView
} from '../../utils/galacticSpotExchange.js';

/**
 * GalacticSpotExchangeView — Terminal Bursátil Spot Real de la Lonja Galáctica.
 * Cuenta con Order Book en tiempo real (Bids y Asks agregados), Depth Chart,
 * Gráfico Financiero de Velas/Línea, Órdenes Limit y Market con reserva física de activos
 * y validación de acceso físico al planeta.
 */
export const GalacticSpotExchangeView = ({
  state,
  dispatch,
  currentPlanet,
  fmt = (n) => n
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState('metal');
  const [orderSide, setOrderSide] = useState(ORDER_SIDES.BUY);
  const [orderType, setOrderType] = useState(ORDER_TYPES.LIMIT);
  const [amount, setAmount] = useState(50000);
  const [priceInput, setPriceInput] = useState('');
  const [stopPriceInput, setStopPriceInput] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [takeProfitInput, setTakeProfitInput] = useState('');
  const [ttlTicks, setTtlTicks] = useState('');
  const [placing, setPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState('book');
  const [candleInterval, setCandleInterval] = useState('1m');


  const spotState = state.spotExchange || {
    orders: [],
    trades: [],
    candles: {},
    lastPrices: { metal: 1.0, crystal: 1.65, deuterium: 3.3 },
    stats: {}
  };

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const currentCredits = state.credits || 0;
  const marketId = currentPlanet?.id || null;
  const marketView = useMemo(
    () => getMarketView(spotState, marketId),
    [spotState, marketId]
  );

  // Comprobar derecho de acceso físico server-side / engine-side
  const access = useMemo(() => {
    return checkPhysicalAccess(state, currentPlanet?.id);
  }, [state, currentPlanet?.id]);

  // Libro de Órdenes calculado
  const orderBook = useMemo(() => {
    return getOrderBook(spotState.orders || [], selectedInstrument, marketId);
  }, [spotState.orders, selectedInstrument, marketId]);

  const lastTradePrice = marketView.lastPrices?.[selectedInstrument];
  const seedPrice = selectedInstrument === 'metal' ? 1.0 : selectedInstrument === 'crystal' ? 1.65 : 3.30;
  const lastPrice = Number(lastTradePrice) > 0 ? Number(lastTradePrice) : seedPrice;
  const hasLocalPrint = (spotState.trades || []).some(
    t => t.instrument === selectedInstrument && (t.marketId || t.planetId) === marketId
  );
  const effectivePrice = priceInput !== '' ? Number(priceInput) : (orderSide === ORDER_SIDES.BUY ? (orderBook.bestAsk || lastPrice) : (orderBook.bestBid || lastPrice));

  // Estimación para Market Order (Slippage y Coste)
  const marketEstimate = useMemo(() => {
    if (orderType !== ORDER_TYPES.MARKET) return null;
    return estimateMarketExecution(spotState.orders || [], selectedInstrument, orderSide, amount, currentPlanet?.id);
  }, [spotState.orders, selectedInstrument, orderSide, amount, currentPlanet?.id, orderType]);

  // Historial de trades del instrumento
  const recentTrades = useMemo(() => {
    return (spotState.trades || []).filter(t =>
      t.instrument === selectedInstrument && (!marketId || (t.marketId || t.planetId) === marketId)
    ).slice(0, 30);
  }, [spotState.trades, selectedInstrument, marketId]);

  // Órdenes activas del jugador
  const myOrders = useMemo(() => {
    return (spotState.orders || []).filter(o => o.ownerId === 'player' && (o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED'));
  }, [spotState.orders]);

  const chartCandles = useMemo(() => {
    const raw = (marketView.candles?.[selectedInstrument] || []).map(toCandleArray).filter(Boolean);
    if (raw.length === 0) return [];
    const groupMap = { '1m': 1, '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440 };
    const group = groupMap[candleInterval] || 1;
    if (group === 1) return raw.slice(-40);
    const grouped = [];
    let bucket = null;
    for (const c of raw) {
      const bucketTs = Math.floor((c[0] || 0) / group) * group;
      if (!bucket || bucket[0] !== bucketTs) {
        if (bucket) grouped.push(bucket);
        bucket = [bucketTs, c[1], c[2], c[3], c[4], c[5]];
      } else {
        bucket[2] = Math.max(bucket[2], c[2]);
        bucket[3] = Math.min(bucket[3], c[3]);
        bucket[4] = c[4];
        bucket[5] = (bucket[5] || 0) + (c[5] || 0);
      }
    }
    if (bucket) grouped.push(bucket);
    return grouped.slice(-40);
  }, [marketView.candles, selectedInstrument, candleInterval]);

  const myHistory = useMemo(() => {
    return (spotState.orders || [])
      .filter(o => o.ownerId === 'player' && o.status !== ORDER_STATUS.OPEN && o.status !== ORDER_STATUS.PARTIALLY_FILLED)
      .slice(0, 20);
  }, [spotState.orders]);

  const reservedCredits = useMemo(() => {
    return myOrders.reduce((sum, o) => sum + (o.side === 'buy' ? (o.reservedCredits || 0) : 0), 0);
  }, [myOrders]);

  const reservedResource = useMemo(() => {
    return myOrders
      .filter(o => o.side === 'sell' && (o.instrument || o.resource) === selectedInstrument)
      .reduce((sum, o) => sum + (o.reservedResourceAmount ?? ((o.amount || 0) - (o.filledAmount || 0))), 0);
  }, [myOrders, selectedInstrument]);

  const instStats = marketView.stats?.[selectedInstrument] || {};


  // Coste estimado de la operación
  const estimatedCost = orderType === ORDER_TYPES.MARKET
    ? (marketEstimate?.estimatedCost || 0)
    : Math.floor(amount * effectivePrice);

  const canAfford = orderSide === ORDER_SIDES.BUY
    ? currentCredits >= estimatedCost
    : (planetRes[selectedInstrument] || 0) >= amount;

  const handlePlaceOrder = () => {
    if (!access.hasAccess || placing) return;
    if (amount <= 0 || !currentPlanet?.id) return;
    const isStopType = orderType === ORDER_TYPES.STOP || orderType === ORDER_TYPES.STOP_LIMIT;
    const isTakeProfit = orderType === ORDER_TYPES.TAKE_PROFIT;
    if (orderType === ORDER_TYPES.LIMIT && effectivePrice <= 0) return;
    if (isStopType && Number(stopPriceInput) <= 0) return;
    if (isTakeProfit && Number(takeProfitInput) <= 0) return;

    if (!canAfford) {
      if (window.playSfx) window.playSfx('uiError');
      return;
    }

    setPlacing(true);
    const ttl = Number(ttlTicks);
    const expiresAt = ttl > 0 ? (state.gameTick || 0) + ttl : undefined;
    const clientOrderId = `pl_${state.gameTick || 0}_${orderSide}_${orderType}_${selectedInstrument}_${amount}_${effectivePrice}_${stopPriceInput}_${takeProfitInput}`;

    const base = {
      resource: selectedInstrument,
      amount: Number(amount),
      planetId: currentPlanet.id,
      destinationPlanetId: currentPlanet.id,
      hasParkedShip: true,
      expiresAt,
      clientOrderId
    };

    if (orderType === ORDER_TYPES.MARKET) {
      const execTargetPrice = orderSide === ORDER_SIDES.BUY
        ? (orderBook.bestAsk || lastPrice * 1.05)
        : (orderBook.bestBid || lastPrice * 0.95);
      dispatch({
        type: 'CREATE_LIMIT_ORDER',
        ...base,
        orderType: orderSide === ORDER_SIDES.BUY ? 'buy' : 'sell',
        targetPrice: Number(execTargetPrice),
        spotOrderType: ORDER_TYPES.MARKET
      });
    } else if (isStopType) {
      dispatch({
        type: 'CREATE_LIMIT_ORDER',
        ...base,
        orderType: orderSide === ORDER_SIDES.BUY ? 'buy_limit' : 'sell_limit',
        targetPrice: Number(stopPriceInput) || effectivePrice,
        stopPrice: Number(stopPriceInput),
        limitPrice: orderType === ORDER_TYPES.STOP_LIMIT ? (Number(limitPriceInput) || Number(stopPriceInput)) : undefined,
        spotOrderType: orderType
      });
    } else if (isTakeProfit) {
      const tp = Number(takeProfitInput);
      dispatch({
        type: 'CREATE_LIMIT_ORDER',
        ...base,
        orderType: orderSide === ORDER_SIDES.BUY ? 'buy_limit' : 'sell_limit',
        targetPrice: tp,
        takeProfitPrice: tp,
        stopPrice: tp,
        spotOrderType: ORDER_TYPES.TAKE_PROFIT
      });
    } else {
      dispatch({
        type: 'CREATE_LIMIT_ORDER',
        ...base,
        orderType: orderSide === ORDER_SIDES.BUY ? 'buy_limit' : 'sell_limit',
        targetPrice: Number(effectivePrice)
      });
    }

    if (window.playSfx) window.playSfx('tradeSuccess');
    setTimeout(() => setPlacing(false), 400);
  };


  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editPriceInput, setEditPriceInput] = useState('');
  const [editAmountInput, setEditAmountInput] = useState('');

  const handleCancelOrder = (orderId) => {
    dispatch({
      type: 'CANCEL_LIMIT_ORDER',
      orderId
    });
    if (window.playSfx) window.playSfx('click');
  };

  const handleSaveOrderModification = (orderId) => {
    const p = Number(editPriceInput);
    const a = Number(editAmountInput);
    if (p <= 0 && a <= 0) {
      setEditingOrderId(null);
      return;
    }
    dispatch({
      type: 'MODIFY_SPOT_ORDER',
      orderId,
      newPrice: p > 0 ? p : undefined,
      newAmount: a > 0 ? a : undefined
    });
    setEditingOrderId(null);
    setEditPriceInput('');
    setEditAmountInput('');
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="space-y-4 w-full animate-fadeIn font-mono">
      {/* Ticker Superior de Mercados Spot */}
      <div className="p-3.5 rounded-2xl bg-black/60 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            GALACTIC SPOT EXCHANGE • {currentPlanet?.name || 'LONJA'}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            access.hasAccess
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {access.hasAccess ? 'AUTORIZACIÓN FÍSICA CONCEDIDA' : 'ACCESO DENEGADO'}
          </span>
        </div>

        {/* Selector de Instrumento */}
        <div className="flex items-center gap-2">
          {INSTRUMENTS.map(inst => {
            const isSelected = selectedInstrument === inst;
            const p = access.hasAccess
              ? (marketView.lastPrices?.[inst] || 1)
              : null;
            return (
              <button
                key={inst}
                onClick={() => {
                  setSelectedInstrument(inst);
                  setPriceInput('');
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all uppercase flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                <span>{inst === 'metal' ? '⛏️' : inst === 'crystal' ? '💎' : '⚗️'}</span>
                <span>{inst}</span>
                <span className="text-[10px] text-amber-300">{p == null ? '•••' : `${Number(p).toFixed(2)} ₢`}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner de Acceso Físico en caso de bloqueo */}
      {!access.hasAccess && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-3">
          <span className="text-2xl">🚫</span>
          <div>
            <div className="font-bold uppercase tracking-wider text-rose-300">Terminal Inaccesible Remotamente</div>
            <p className="text-[11px] text-rose-300/80 mt-0.5">{access.reason}</p>
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 flex flex-wrap gap-3 px-1">
        {access.hasAccess ? (
          <>
            <span>VWAP: <strong className="text-cyan-300">{Number(instStats.vwap || lastPrice).toFixed(3)} ₢</strong></span>
            <span>Var: <strong className={(instStats.change24h || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{(instStats.change24h || 0).toFixed(2)}%</strong></span>
          </>
        ) : (
          <span>Cotización local oculta</span>
        )}
        <span>Reservado: <strong className="text-amber-300">{fmt(reservedCredits)} ₢</strong> / <strong className="text-amber-300">{fmt(reservedResource)} {selectedInstrument}</strong></span>
      </div>

      {/* Grid Central del Terminal. Opción B: cancelar remoto permitido; operar exige presencia. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Columna Izquierda: Order Book y Profundidad (4 cols) */}
        <div className={`lg:col-span-4 p-4 rounded-2xl bg-[#060a16]/95 border border-white/10 space-y-3 ${!access.hasAccess ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>📖</span> Libro de Órdenes
            </h4>
            <div className="text-[10px] text-slate-400">
              Spread: <strong className="text-amber-400">{orderBook.spread !== null ? `${orderBook.spread} ₢` : 'N/A'}</strong>
            </div>
          </div>

          {/* ASKS (Ventas) */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 flex justify-between px-1 uppercase font-bold">
              <span>Precio (₢)</span>
              <span>Cantidad</span>
              <span>Acumulado</span>
            </div>
            <div className="space-y-0.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {orderBook.asks.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-2 text-center">Sin órdenes de venta abiertas</div>
              ) : (
                orderBook.asks.slice(0, 7).reverse().map((a, i) => (
                  <div
                    key={`ask_${i}`}
                    onClick={() => setPriceInput(a.price.toString())}
                    className="flex justify-between px-1.5 py-0.5 text-[11px] rounded bg-rose-500/5 hover:bg-rose-500/15 cursor-pointer transition-colors relative overflow-hidden"
                  >
                    <span className="text-rose-400 font-bold z-10">{a.price.toFixed(2)}</span>
                    <span className="text-slate-300 z-10">{fmt(a.amount)}</span>
                    <span className="text-slate-400 text-[10px] z-10">{fmt(a.cumulative)}</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none"
                      style={{ width: `${Math.min(100, (a.cumulative / 500000) * 100)}%` }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Último Precio Marcador */}
          <div className="py-2 px-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Última Transacción:</span>
            <span className="text-emerald-400 font-black text-sm">{hasLocalPrint ? `${lastPrice.toFixed(2)} ₢` : '---'}</span>
          </div>

          {/* BIDS (Compras) */}
          <div className="space-y-1">
            <div className="space-y-0.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {orderBook.bids.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-2 text-center">Sin órdenes de compra abiertas</div>
              ) : (
                orderBook.bids.slice(0, 7).map((b, i) => (
                  <div
                    key={`bid_${i}`}
                    onClick={() => setPriceInput(b.price.toString())}
                    className="flex justify-between px-1.5 py-0.5 text-[11px] rounded bg-emerald-500/5 hover:bg-emerald-500/15 cursor-pointer transition-colors relative overflow-hidden"
                  >
                    <span className="text-emerald-400 font-bold z-10">{b.price.toFixed(2)}</span>
                    <span className="text-slate-300 z-10">{fmt(b.amount)}</span>
                    <span className="text-slate-400 text-[10px] z-10">{fmt(b.cumulative)}</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none"
                      style={{ width: `${Math.min(100, (b.cumulative / 500000) * 100)}%` }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Columna Central: Gráfico y Pestañas de Visualización (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#060a16]/95 border border-white/10 flex flex-col gap-3">
          {!access.hasAccess && (activeTab === 'book' || activeTab === 'trades') && (
            <div className="text-[11px] text-rose-300/80 py-2 px-1">
              Cotizaciones, velas y tape de este mercado exigen presencia en el planeta.
            </div>
          )}
          {/* Cabecera de tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('book')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === 'book' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Velas
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === 'trades' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trades ({recentTrades.length})
              </button>
              <button
                onClick={() => setActiveTab('my_orders')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === 'my_orders' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mis Órdenes ({myOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('diag')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === 'diag' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Diagnóstico
              </button>
            </div>

            <div className="flex items-center gap-1">
              {['1m','5m','15m','1h','4h','1d'].map(iv => (
                <button
                  key={iv}
                  onClick={() => setCandleInterval(iv)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all uppercase ${
                    candleInterval === iv
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {iv}
                </button>
              ))}
            </div>
          </div>

          {/* Vista 1: Gráfico de Velas Candlestick OHLCV */}
          {activeTab === 'book' && !access.hasAccess && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-500 py-8 text-center">
              Mercado oculto sin presencia física.
            </div>
          )}
          {activeTab === 'book' && access.hasAccess && (() => {
            const W = 320, H = 110, VOLH = 20;
            const n = chartCandles.length;
            if (n === 0) {
              return (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
                  <span className="text-3xl opacity-30">📊</span>
                  <div className="text-[11px] text-slate-500">Sin historial de velas todavía.</div>
                  <div className="text-[10px] text-slate-600 max-w-[220px]">Las velas OHLCV aparecerán cuando el motor de matching ejecute las primeras operaciones reales con contrapartida.</div>
                </div>
              );
            }
            const closes = chartCandles.map(c => c[4]);
            const highs  = chartCandles.map(c => c[2]);
            const lows   = chartCandles.map(c => c[3]);
            const allVols = chartCandles.map(c => c[5] || 0);
            const minP = Math.min(...lows)   * 0.998;
            const maxP = Math.max(...highs)  * 1.002;
            const maxV = Math.max(...allVols, 1);
            const priceRange = maxP - minP || 0.01;
            const candleW = Math.max(4, Math.floor(W / n) - 2);
            const gap = Math.floor(W / n);

            const toY = (p) => H - ((p - minP) / priceRange) * H;
            return (
              <div className="flex flex-col gap-2 flex-1">
                {/* Panel de OHLCV del último candle */}
                {(() => {
                  const last = chartCandles[n - 1];
                  const bullish = last[4] >= last[1];
                  return (
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 px-1">
                      <span className="text-slate-300 font-bold uppercase">{selectedInstrument} / ₢ · {candleInterval}</span>
                      <span>O:<strong className="text-white ml-0.5">{last[1].toFixed(3)}</strong></span>
                      <span>H:<strong className="text-emerald-400 ml-0.5">{last[2].toFixed(3)}</strong></span>
                      <span>L:<strong className="text-rose-400 ml-0.5">{last[3].toFixed(3)}</strong></span>
                      <span>C:<strong className={`ml-0.5 ${bullish ? 'text-emerald-400' : 'text-rose-400'}`}>{last[4].toFixed(3)}</strong></span>
                    </div>
                  );
                })()}
                {/* SVG Candlestick */}
                <svg viewBox={`0 0 ${W} ${H + VOLH + 4}`} className="w-full rounded-lg bg-black/60 border border-white/5" preserveAspectRatio="none">
                  {/* Grid de precio */}
                  {[0.25, 0.5, 0.75].map(pct => (
                    <line key={pct} x1="0" y1={H * pct} x2={W} y2={H * pct} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  ))}
                  {/* Velas */}
                  {chartCandles.map((c, idx) => {
                    const [ts, open, high, low, close, vol] = c;
                    const bullish = close >= open;
                    const color = bullish ? '#10b981' : '#f43f5e';
                    const colorFade = bullish ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)';
                    const x = idx * gap + gap / 2;
                    const bodyTop = toY(Math.max(open, close));
                    const bodyBot = toY(Math.min(open, close));
                    const bodyH = Math.max(1, bodyBot - bodyTop);
                    const wickTop = toY(high);
                    const wickBot = toY(low);
                    // Volumen
                    const volH = (vol / maxV) * VOLH;
                    return (
                      <g key={idx}>
                        {/* Mecha */}
                        <line x1={x} y1={wickTop} x2={x} y2={wickBot} stroke={color} strokeWidth="1" />
                        {/* Cuerpo */}
                        <rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} fillOpacity="0.9" rx="0.5" />
                        {/* Barra de volumen */}
                        <rect x={x - candleW / 2} y={H + 4 + VOLH - volH} width={candleW} height={volH} fill={colorFade} rx="0.5" />
                      </g>
                    );
                  })}
                  {/* Línea de último precio */}
                  <line x1="0" y1={toY(lastPrice)} x2={W} y2={toY(lastPrice)} stroke="rgba(251,191,36,0.5)" strokeDasharray="4 3" strokeWidth="0.8" />
                  {/* Etiqueta precio actual */}
                  <rect x={W - 44} y={toY(lastPrice) - 7} width={42} height={12} fill="#1a1a2e" rx="2" />
                  <text x={W - 23} y={toY(lastPrice) + 2} textAnchor="middle" fill="#fbbf24" fontSize="7" fontFamily="monospace">{lastPrice.toFixed(3)}</text>
                </svg>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-slate-400">Mejor Compra</div>
                    <div className="text-emerald-400 font-bold mt-0.5">{orderBook.bestBid ? `${orderBook.bestBid.toFixed(2)} ₢` : '---'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-slate-400">Mejor Venta</div>
                    <div className="text-rose-400 font-bold mt-0.5">{orderBook.bestAsk ? `${orderBook.bestAsk.toFixed(2)} ₢` : '---'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-slate-400">Volumen 24h</div>
                    <div className="text-cyan-400 font-bold mt-0.5">{fmt(instStats.volume || 0)} u.</div>
                  </div>
                </div>
              </div>
            );
          })()}



          {/* Vista 2: Historial de Trades Auditados */}
          {activeTab === 'trades' && !access.hasAccess && (
            <div className="flex-1 flex items-center justify-center text-[11px] text-slate-500 py-8 text-center">
              Tape oculto sin presencia física.
            </div>
          )}
          {activeTab === 'trades' && access.hasAccess && (
            <div className="space-y-1.5 flex-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              <div className="text-[10px] text-slate-500 flex justify-between px-1 uppercase font-bold border-b border-white/5 pb-1">
                <span>Precio</span>
                <span>Cantidad</span>
                <span>Total (₢)</span>
                <span>Comprador</span>
              </div>
              {recentTrades.length === 0 ? (
                <div className="text-[11px] text-slate-500 py-6 text-center">No hay ejecuciones registradas todavía</div>
              ) : (
                recentTrades.map((t, idx) => (
                  <div key={t.id || idx} className="flex justify-between items-center text-[10px] px-1 py-0.5 rounded bg-white/5">
                    <span className="text-emerald-400 font-bold">{t.price.toFixed(2)} ₢</span>
                    <span className="text-slate-300">{fmt(t.amount)}</span>
                    <span className="text-amber-300">{fmt(t.total)} ₢</span>
                    <span className={`text-[9px] px-1 rounded ${t.buyerId === 'player' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400'}`}>
                      {t.buyerId === 'player' ? 'IMPERIO' : 'FACCIÓN'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Vista 3: Órdenes del Jugador Abiertas */}
          {activeTab === 'my_orders' && (
            <div className="space-y-1.5 flex-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {myOrders.length === 0 ? (
                <div className="text-[11px] text-slate-500 py-4 text-center">No tienes órdenes activas en este libro</div>
              ) : (
                myOrders.map(o => {
                  const isEditing = editingOrderId === o.id;
                  const remaining = (o.amount || 0) - (o.filledAmount || 0);
                  return (
                    <div key={o.id} className="p-2 rounded-xl bg-black/60 border border-cyan-500/30 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              o.side === 'buy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {o.side === 'buy' ? 'COMPRA' : 'VENTA'}
                            </span>
                            <span className="font-bold text-white capitalize">{o.instrument || o.resource}</span>
                            <span className="text-[9px] px-1 rounded bg-white/5 text-slate-400 uppercase font-mono">{o.type || 'limit'}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {fmt(remaining)} u. @ {o.price || o.targetPrice} ₢
                            {o.stopPrice ? ` (Stop: ${o.stopPrice} ₢)` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (isEditing) {
                                setEditingOrderId(null);
                              } else {
                                setEditingOrderId(o.id);
                                setEditPriceInput((o.price || o.targetPrice || '').toString());
                                setEditAmountInput(o.amount ? o.amount.toString() : '');
                              }
                            }}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                          >
                            {isEditing ? 'Cerrar' : 'Editar'}
                          </button>
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Panel de Edición Inline */}
                      {isEditing && (
                        <div className="p-2 rounded-lg bg-black/80 border border-amber-500/30 space-y-1.5 pt-1.5 mt-1">
                          <div className="text-[9px] text-amber-400/80">⚠️ Modificar precio o cantidad reinicia la prioridad temporal de la orden.</div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <span className="text-[9px] text-slate-400">Nuevo Precio (₢):</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={editPriceInput}
                                onChange={e => setEditPriceInput(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-white font-mono"
                              />
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400">Nueva Cantidad:</span>
                              <input
                                type="number"
                                step="1000"
                                min="1000"
                                value={editAmountInput}
                                onChange={e => setEditAmountInput(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded px-1.5 py-0.5 text-[10px] text-white font-mono"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveOrderModification(o.id)}
                            className="w-full py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              {myHistory.length > 0 && (
                <div className="pt-2 mt-2 border-t border-white/10 space-y-1">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Historial propio</div>
                  {myHistory.map(o => (
                    <div key={o.id} className="flex justify-between text-[10px] text-slate-400 px-1">
                      <span className="uppercase">{o.side} {o.instrument}</span>
                      <span className="text-slate-300">{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista 4: Panel de Diagnóstico y Observabilidad Interna (§54) */}
          {activeTab === 'diag' && (
            <div className="space-y-2 flex-1 max-h-[220px] overflow-y-auto custom-scrollbar pr-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold uppercase">
                  <span>Auditoría de Ejecución y Estado del Motor</span>
                  <span>Tick #{state.gameTick || 0}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-black/50 p-2 rounded border border-white/5 space-y-0.5">
                    <span className="text-slate-400">Total Órdenes en Libro:</span>
                    <div className="font-mono text-white text-xs font-bold">{(spotState.orders || []).length}</div>
                  </div>
                  <div className="bg-black/50 p-2 rounded border border-white/5 space-y-0.5">
                    <span className="text-slate-400">Órdenes Jugador:</span>
                    <div className="font-mono text-cyan-300 text-xs font-bold">{myOrders.length}</div>
                  </div>
                  <div className="bg-black/50 p-2 rounded border border-white/5 space-y-0.5">
                    <span className="text-slate-400">Total Trades Históricos:</span>
                    <div className="font-mono text-emerald-300 text-xs font-bold">{(spotState.trades || []).length}</div>
                  </div>
                  <div className="bg-black/50 p-2 rounded border border-white/5 space-y-0.5">
                    <span className="text-slate-400">Spread Actual ({selectedInstrument}):</span>
                    <div className="font-mono text-amber-300 text-xs font-bold">{orderBook.spread !== null ? `${orderBook.spread} ₢` : 'N/A (Sin cruce)'}</div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Diagnóstico por Orden del Jugador:</div>
                  {myOrders.length === 0 ? (
                    <div className="text-slate-500 text-[10px] italic">No hay órdenes activas del jugador para auditar.</div>
                  ) : (
                    myOrders.map(o => {
                      let reason = 'En cola esperando contrapartida compatible.';
                      if (o.type === 'stop' || o.type === 'stop_limit') {
                        reason = `Esperando activación Stop (Actual: ${lastPrice.toFixed(2)} ₢ vs Stop: ${o.stopPrice} ₢).`;
                      } else if (o.type === 'take_profit') {
                        reason = `Esperando Take-Profit (Actual: ${lastPrice.toFixed(2)} ₢ vs TP: ${o.takeProfitPrice || o.stopPrice} ₢).`;
                      } else if (o.side === 'buy' && orderBook.bestAsk && o.price < orderBook.bestAsk) {
                        reason = `Precio de compra (${o.price} ₢) inferior a la mejor venta (${orderBook.bestAsk.toFixed(2)} ₢).`;
                      } else if (o.side === 'sell' && orderBook.bestBid && o.price > orderBook.bestBid) {
                        reason = `Precio de venta (${o.price} ₢) superior a la mejor compra (${orderBook.bestBid.toFixed(2)} ₢).`;
                      }
                      return (
                        <div key={o.id} className="p-1.5 rounded bg-black/60 border border-white/5 space-y-0.5 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">{o.instrument} ({o.side.toUpperCase()}) @ {o.price} ₢</span>
                            <span className="text-cyan-400 font-mono text-[9px]">{o.status}</span>
                          </div>
                          <div className="text-slate-400 text-[9px]">💡 {reason}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Creación de Órdenes (3 cols) */}
        <div className={`lg:col-span-3 p-4 rounded-2xl bg-[#060a16]/95 border border-emerald-500/30 space-y-3 flex flex-col justify-between ${!access.hasAccess ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
              <span>⚡</span> Crear Orden Spot
            </h4>

            {/* Selector Buy / Sell */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setOrderSide(ORDER_SIDES.BUY)}
                className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                  orderSide === ORDER_SIDES.BUY
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Comprar
              </button>
              <button
                onClick={() => setOrderSide(ORDER_SIDES.SELL)}
                className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                  orderSide === ORDER_SIDES.SELL
                    ? 'bg-rose-500 text-black border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Vender
              </button>
            </div>

            {/* Tipo de Orden */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setOrderType(ORDER_TYPES.LIMIT)}
                className={`py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                  orderType === ORDER_TYPES.LIMIT
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5'
                }`}
              >
                Límite
              </button>
              <button
                onClick={() => setOrderType(ORDER_TYPES.MARKET)}
                className={`py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                  orderType === ORDER_TYPES.MARKET
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5'
                }`}
              >
                Mercado
              </button>
              <button
                onClick={() => setOrderType(ORDER_TYPES.STOP)}
                className={`py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                  orderType === ORDER_TYPES.STOP
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5'
                }`}
              >
                Stop
              </button>
              <button
                onClick={() => setOrderType(ORDER_TYPES.STOP_LIMIT)}
                className={`py-1 rounded text-[10px] font-bold uppercase transition-all border ${
                  orderType === ORDER_TYPES.STOP_LIMIT
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5'
                }`}
              >
                Stop-Límite
              </button>
              <button
                onClick={() => setOrderType(ORDER_TYPES.TAKE_PROFIT)}
                className={`py-1 rounded text-[10px] font-bold uppercase transition-all border col-span-2 ${
                  orderType === ORDER_TYPES.TAKE_PROFIT
                    ? 'bg-lime-500/20 text-lime-300 border-lime-500/60'
                    : 'bg-black/40 text-slate-400 border-white/5'
                }`}
              >
                Take-Profit
              </button>
            </div>

            {/* Input Precio Límite (solo tipo LIMIT) */}
            {orderType === ORDER_TYPES.LIMIT && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 flex justify-between">
                  <span>Precio Límite (₢):</span>
                  <span className="text-amber-300">{effectivePrice.toFixed(2)} ₢</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={priceInput}
                  placeholder={effectivePrice.toFixed(2)}
                  onChange={e => setPriceInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {/* Inputs Stop Price + Limit Price (para STOP y STOP_LIMIT) */}
            {(orderType === ORDER_TYPES.STOP || orderType === ORDER_TYPES.STOP_LIMIT) && (
              <div className="space-y-1.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-orange-300 flex justify-between">
                    <span>Precio de Activación Stop (₢):</span>
                    <span>{lastPrice.toFixed(2)} ₢ ahora</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={stopPriceInput}
                    placeholder={lastPrice.toFixed(2)}
                    onChange={e => setStopPriceInput(e.target.value)}
                    className="w-full bg-black/60 border border-orange-500/30 rounded-lg px-2.5 py-1.5 text-xs text-orange-300 font-mono focus:outline-none focus:border-orange-400"
                  />
                </div>
                {orderType === ORDER_TYPES.STOP_LIMIT && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-300">Precio Límite al Activar (₢):</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={limitPriceInput}
                      placeholder={(Number(stopPriceInput) || lastPrice).toFixed(2)}
                      onChange={e => setLimitPriceInput(e.target.value)}
                      className="w-full bg-black/60 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
                <div className="text-[9px] text-orange-400/70 italic">
                  {orderType === ORDER_TYPES.STOP
                    ? 'La orden se ejecuta a mercado cuando el precio cruce el nivel de activación.'
                    : 'La orden se convierte en Límite cuando el precio cruce el nivel de activación.'}
                </div>
              </div>
            )}

            {orderType === ORDER_TYPES.TAKE_PROFIT && (
              <div className="space-y-1">
                <label className="text-[10px] text-lime-300 flex justify-between">
                  <span>Precio Take-Profit (₢):</span>
                  <span>{lastPrice.toFixed(2)} ₢ ahora</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={takeProfitInput}
                  placeholder={lastPrice.toFixed(2)}
                  onChange={e => setTakeProfitInput(e.target.value)}
                  className="w-full bg-black/60 border border-lime-500/30 rounded-lg px-2.5 py-1.5 text-xs text-lime-300 font-mono focus:outline-none focus:border-lime-400"
                />
                <div className="text-[9px] text-lime-400/70 italic">
                  {orderSide === ORDER_SIDES.SELL
                    ? 'Se activa como límite de venta cuando el precio sube hasta este nivel.'
                    : 'Se activa como límite de compra cuando el precio baja hasta este nivel.'}
                </div>
              </div>
            )}



            {/* Input Cantidad */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 flex justify-between">
                <span>Cantidad ({selectedInstrument}):</span>
                <span className="text-slate-300">
                  {orderSide === ORDER_SIDES.BUY ? `Tesoro: ${fmt(currentCredits)} ₢` : `Disp: ${fmt(planetRes[selectedInstrument] || 0)}`}
                </span>
              </label>
              <input
                type="number"
                step="10000"
                min="1000"
                value={amount}
                onChange={e => setAmount(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
              />
              <div className="flex gap-1 pt-0.5">
                {[0.25, 0.5, 0.75, 1].map(pct => (
                  <button
                    key={pct}
                    onClick={() => {
                      if (orderSide === ORDER_SIDES.BUY) {
                        const maxAffordable = Math.floor(currentCredits / (effectivePrice || 1));
                        setAmount(Math.max(1000, Math.floor(maxAffordable * pct)));
                      } else {
                        setAmount(Math.max(1000, Math.floor((planetRes[selectedInstrument] || 0) * pct)));
                      }
                    }}
                    className="flex-1 py-0.5 bg-white/5 hover:bg-white/10 text-[9px] rounded text-slate-300 border border-white/5"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 flex justify-between">
                <span>Vigencia (ticks, vacío = sin caducidad)</span>
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={ttlTicks}
                placeholder="∞"
                onChange={e => setTtlTicks(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Resumen de Liquidación */}
            <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1 text-[10px]">
              <div className="flex justify-between text-slate-400">
                <span>Total Estimado:</span>
                <span className="font-bold text-amber-300">{fmt(estimatedCost)} ₢</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Arancel (1%):</span>
                <span className="font-bold text-rose-400">{fmt(Math.floor(estimatedCost * 0.01))} ₢</span>
              </div>
              {orderType === ORDER_TYPES.MARKET && marketEstimate && (
                <div className="flex justify-between text-cyan-300 border-t border-white/5 pt-1">
                  <span>Slippage estimado:</span>
                  <span>{marketEstimate.slippage}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Botón de Ejecución Directa con Protección contra doble ejecución */}
          <button
            onClick={handlePlaceOrder}
            disabled={!canAfford || amount <= 0 || placing || !access.hasAccess}
            className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg transition-all ${
              canAfford && amount > 0 && !placing
                ? orderSide === ORDER_SIDES.BUY
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:brightness-110 active:scale-95'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:brightness-110 active:scale-95'
                : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {placing
              ? 'Registrando…'
              : canAfford
                ? `${orderSide === ORDER_SIDES.BUY ? 'Comprar' : 'Vender'} ${selectedInstrument}`
                : (orderSide === ORDER_SIDES.BUY ? 'Fondos Insuficientes' : 'Recursos Insuficientes')}
          </button>
        </div>

      </div>
    </div>
  );
};
