import React, { useState } from 'react';

export const AutomatedTradeRulesView = ({
  state,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const [autoSellMetal, setAutoSellMetal] = useState(false);
  const [autoSellCrystal, setAutoSellCrystal] = useState(false);
  const [autoBuyDeut, setAutoBuyDeut] = useState(false);
  const [thresholdPercent, setThresholdPercent] = useState(85);

  const handleSavePolicy = () => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `tr_${Date.now()}`,
        type: 'info',
        message: `🤖 Directrices comerciales automáticas calibradas para ${currentPlanet?.name || 'la capital'}.`,
        timestamp: Date.now()
      }
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-5 rounded-2xl bg-[#080d1e]/90 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>🤖</span>
            <span>Consola de Comercio y Flete Automatizado</span>
          </h2>
          <p className="text-xs text-slate-400">
            Define algoritmos de compra y venta automática para evitar desbordamiento de almacenes o desabastecimiento de combustible.
          </p>
        </div>
        <button
          onClick={handleSavePolicy}
          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:brightness-110 active:scale-[0.98]"
        >
          Guardar Directrices Algorítmicas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Regla 1 */}
        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>⛏️</span> Venta de Metal Excedente
            </span>
            <input
              type="checkbox"
              checked={autoSellMetal}
              onChange={(e) => setAutoSellMetal(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-400">
            Convierte automáticamente el metal sobrante en cristal cuando los depósitos superen el {thresholdPercent}% de capacidad.
          </p>
          <div className="text-[11px] font-mono text-cyan-400">
            Estado: {autoSellMetal ? '🟢 Algoritmo Activo' : '⚪ Desactivado'}
          </div>
        </div>

        {/* Regla 2 */}
        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>💎</span> Venta de Cristal Excedente
            </span>
            <input
              type="checkbox"
              checked={autoSellCrystal}
              onChange={(e) => setAutoSellCrystal(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-400">
            Convierte automáticamente excedentes de cristal en deuterio para mantener tanques criogénicos siempre llenos.
          </p>
          <div className="text-[11px] font-mono text-emerald-400">
            Estado: {autoSellCrystal ? '🟢 Algoritmo Activo' : '⚪ Desactivado'}
          </div>
        </div>

        {/* Regla 3 */}
        <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>⚗️</span> Reserva Estratégica de Deuterio
            </span>
            <input
              type="checkbox"
              checked={autoBuyDeut}
              onChange={(e) => setAutoBuyDeut(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-500 focus:ring-0 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-400">
            Si la flota entra en alerta de combustible (&lt;20%), adquiere lotes de deuterio al mejor precio disponible en el mercado.
          </p>
          <div className="text-[11px] font-mono text-amber-400">
            Estado: {autoBuyDeut ? '🟢 Algoritmo Activo' : '⚪ Desactivado'}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs text-slate-300">
        <span>Umbral de saturación de almacenes para liquidación automática:</span>
        <div className="flex items-center gap-2">
          {[70, 80, 85, 90, 95].map((val) => (
            <button
              key={val}
              onClick={() => setThresholdPercent(val)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs border ${
                thresholdPercent === val
                  ? 'bg-indigo-500 text-white border-indigo-400 font-bold'
                  : 'bg-black/40 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {val}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
