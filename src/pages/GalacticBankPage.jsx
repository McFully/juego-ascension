import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import {
  BANK_RESOURCES,
  RESOURCE_INFO,
  calcBankCapacity,
  validateDeposit,
  validateWithdraw,
  formatCountdown
} from '../utils/galacticBankCore.js';

export const GalacticBankPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt = (v) => Math.floor(v || 0).toLocaleString(),
  setActiveTab
}) => {
  const { navigateTo } = useNavigation();
  const [selectedResource, setSelectedResource] = useState('metal');
  const [opMode, setOpMode] = useState('deposit'); // 'deposit' | 'withdraw'
  const [amountInput, setAmountInput] = useState('');
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }
  const [now, setNow] = useState(Date.now());

  // Reloj en tiempo real para la cuenta atrás de liquidación
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bankState = state?.galacticBank || {};
  const balances = bankState?.balances || { metal: 0, crystal: 0, deuterium: 0, credits: 0 };
  const interestRates = bankState?.interestRates || { metal: 0.01, crystal: 0.01, deuterium: 0.005, credits: 0.015 };
  const stats = bankState?.stats || {};
  const history = bankState?.history || [];

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const imperialCredits = state?.credits || 0;

  // Balance disponible para operar
  const availableInPlanetOrEmpire = selectedResource === 'credits' 
    ? imperialCredits 
    : (planetRes[selectedResource] || 0);

  const depositedInBank = balances[selectedResource] || 0;
  const resourceCapacity = useMemo(() => calcBankCapacity(state, selectedResource), [state, selectedResource]);
  const currentInterestRate = interestRates[selectedResource] || 0;
  const remainingAllowance = Math.max(0, resourceCapacity - depositedInBank);

  // Totales consolidados para las tarjetas de resumen
  const totalDepositedVolume = (balances.metal || 0) + (balances.crystal || 0) + (balances.deuterium || 0);
  const totalCapacityVolume = calcBankCapacity(state, 'metal') + calcBankCapacity(state, 'crystal') + calcBankCapacity(state, 'deuterium');
  const globalCapacityPct = totalCapacityVolume > 0 ? Math.min(100, (totalDepositedVolume / totalCapacityVolume) * 100) : 0;

  // Validación en vivo
  const numericAmount = Math.floor(Number(amountInput) || 0);
  const currentValidation = useMemo(() => {
    if (!amountInput || numericAmount <= 0) return null;
    if (opMode === 'deposit') {
      return validateDeposit(selectedResource, numericAmount, availableInPlanetOrEmpire, depositedInBank, resourceCapacity);
    } else {
      return validateWithdraw(selectedResource, numericAmount, depositedInBank);
    }
  }, [opMode, selectedResource, numericAmount, availableInPlanetOrEmpire, depositedInBank, resourceCapacity]);

  // Selección rápida de porcentaje
  const handleSetPercent = (pct) => {
    if (window.playSfx) window.playSfx('click');
    let targetAmount = 0;
    if (opMode === 'deposit') {
      const maxPossible = Math.min(availableInPlanetOrEmpire, remainingAllowance);
      targetAmount = Math.floor(maxPossible * pct);
    } else {
      targetAmount = Math.floor(depositedInBank * pct);
    }
    setAmountInput(targetAmount > 0 ? String(targetAmount) : '');
    setFeedback(null);
  };

  // Ejecución de la operación
  const handleExecuteOperation = () => {
    if (!currentValidation || !currentValidation.valid) {
      setFeedback({ type: 'error', message: currentValidation?.error || 'Cantidad inválida para la operación.' });
      if (window.playSfx) window.playSfx('error');
      return;
    }

    if (opMode === 'deposit') {
      dispatch({
        type: 'BANK_DEPOSIT',
        payload: {
          resource: selectedResource,
          amount: numericAmount,
          planetId: currentPlanet?.id
        }
      });
      setFeedback({
        type: 'success',
        message: `Depósito ejecutado con éxito: +${fmt(numericAmount)} ${RESOURCE_INFO[selectedResource]?.name} transferidos a la reserva.`
      });
    } else {
      dispatch({
        type: 'BANK_WITHDRAW',
        payload: {
          resource: selectedResource,
          amount: numericAmount,
          planetId: currentPlanet?.id
        }
      });
      setFeedback({
        type: 'success',
        message: `Retirada autorizada: ${fmt(numericAmount)} ${RESOURCE_INFO[selectedResource]?.name} abonados a tu disponibilidad inmediata.`
      });
    }

    if (window.playSfx) window.playSfx('complete');
    setAmountInput('');
  };

  // Liquidación forzada manual
  const handleForceLiquidation = () => {
    if (window.playSfx) window.playSfx('click');
    dispatch({ type: 'BANK_PROCESS_LIQUIDATION' });
    setFeedback({
      type: 'info',
      message: 'Liquidación diaria procesada manualmente. Dividendos y retenciones consolidados.'
    });
  };

  const nextLiquidationCountdown = formatCountdown(bankState?.nextLiquidation || 0, now);

  return (
    <div className="bank-institution-theme flex flex-col w-full min-h-screen text-slate-100 space-y-3 relative">
      {/* Telón arquitectónico que anula y cubre por completo el fondo estelar */}
      <div className="bank-institution-bg" aria-hidden="true" />

      {/* Contenido en plano superior */}
      <div className="relative z-10 flex flex-col w-full space-y-3">
        {/* Banner superior HUD y navegación */}
        <SubsystemTopBanner
          state={state}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          breadcrumbIcon="💎"
          breadcrumbTitle="Banca Galáctica Central"
          backButtonLabelTop="VOLVER A"
          backButtonLabelBottom="Mando Imperial"
          backButtonIcon="👑"
          onBackToAltoMando={() => {
            if (setActiveTab) setActiveTab('imperial_hub');
            else if (navigateTo) navigateTo('imperial_hub');
          }}
        />

        {/* HEADER HERO DE LA INSTITUCIÓN - SEDE CENTRAL ARQUITECTÓNICA */}
        <div className="relative overflow-hidden rounded-2xl bank-marble-panel p-4 shadow-2xl -mt-3 border border-slate-400/30">
          {/* Malla arquitectónica y motivos de columnas de edificio */}
          <div className="absolute right-0 top-0 bottom-0 w-96 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-transparent to-transparent" />
          <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none text-9xl">
            🏛️
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">🏛️</span>
                <h1 className="text-xl sm:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm font-sans">
                  BANCA GALÁCTICA CENTRAL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest font-bold bg-slate-800 border border-slate-500/50 text-slate-200 uppercase">
                  Sede Central
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed font-sans">
                Edificio Institucional del Tesoro Soberano. Custodia federal compartida con bóvedas de hormigón reforzado y titanio blindado. Fondos protegidos ante fluctuaciones galácticas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-black/60 border border-slate-500/40 rounded-xl px-3.5 py-2 backdrop-blur-md self-start md:self-auto shadow-inner">
              <div className="text-right">
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Cierre de Ciclo Diario</span>
                <span className="text-sm sm:text-base font-mono font-black text-amber-300">{nextLiquidationCountdown}</span>
              </div>
              {now >= (bankState?.nextLiquidation || 0) && (
                <button
                  onClick={handleForceLiquidation}
                  className="px-3.5 py-1.5 rounded-lg bank-btn-chrome text-xs font-bold tracking-wide transition-all shadow-lg active:scale-95"
                >
                  Liquidar Ahora
                </button>
              )}
            </div>
          </div>
        </div>

      {/* 8 TARJETAS EN UNA SOLA LÍNEA CON ESTILO BÓVEDA / TITANIO / CROMO */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5">
        {/* 1. Volumen en Custodia */}
        <div className="bank-vault-card rounded-xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider truncate">En Custodia</span>
            <span className="text-slate-300 text-xs">📦</span>
          </div>
          <div className="text-base lg:text-lg font-black text-white font-mono truncate">
            {fmt(totalDepositedVolume)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between truncate">
            <span>Créditos:</span>
            <span className="font-mono text-amber-300 font-semibold">{fmt(balances.credits || 0)} ₵</span>
          </div>
        </div>

        {/* 2. Ocupación de Bóveda */}
        <div className="bank-vault-card rounded-xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider truncate">Ocupación</span>
            <span className="text-slate-300 text-xs">🏛️</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base lg:text-lg font-black text-slate-100 font-mono">{globalCapacityPct.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-400 font-mono truncate">/{fmt(totalCapacityVolume)}</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1 mt-1.5 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-500 ${globalCapacityPct > 90 ? 'bg-red-400' : globalCapacityPct > 70 ? 'bg-amber-400' : 'bg-gradient-to-r from-slate-200 to-slate-400'}`}
              style={{ width: `${globalCapacityPct}%` }}
            />
          </div>
        </div>

        {/* 3. Dividendos Históricos */}
        <div className="bank-vault-card rounded-xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider truncate">Dividendos</span>
            <span className="text-emerald-400 text-xs">📈</span>
          </div>
          <div className="text-base lg:text-lg font-black text-emerald-400 font-mono truncate">
            +{fmt(stats.totalInterestEarned || 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between truncate">
            <span>Ciclos:</span>
            <span className="font-mono text-slate-200">{stats.liquidationsProcessed || 0}</span>
          </div>
        </div>

        {/* 4. Interés Activo */}
        <div className="bank-vault-card rounded-xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase tracking-wider truncate">Interés Base</span>
            <span className="text-slate-300 text-xs">⚖️</span>
          </div>
          <div className="text-base lg:text-lg font-black text-slate-200 font-mono truncate">
            +{(interestRates.metal * 100).toFixed(2)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between truncate">
            <span>Créditos:</span>
            <span className="font-mono text-amber-300">+{(interestRates.credits * 100).toFixed(2)}%</span>
          </div>
        </div>

        {/* 5, 6, 7, 8. Las 4 Cuentas de Recursos */}
        {BANK_RESOURCES.map((resKey) => {
          const info = RESOURCE_INFO[resKey];
          const isSelected = selectedResource === resKey;
          const bankBal = balances[resKey] || 0;
          const cap = calcBankCapacity(state, resKey);
          const rate = interestRates[resKey] || 0;
          const ratePct = (rate * 100).toFixed(2);
          const rateSign = rate > 0 ? '+' : '';

          return (
            <button
              key={resKey}
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSelectedResource(resKey);
                setAmountInput('');
                setFeedback(null);
              }}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-white shadow-xl shadow-black/80 ring-1 ring-white/60'
                  : 'bank-vault-card hover:border-slate-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{info.icon}</span>
                  <span className="font-bold text-xs tracking-wide text-white truncate">{info.name}</span>
                </div>
                <span className={`text-[9px] font-mono px-1 py-0.5 rounded border ${
                  rate > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : rate < 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-slate-700/20 text-slate-400 border-slate-600/30'
                }`}>
                  {rateSign}{ratePct}%
                </span>
              </div>

              <div className="space-y-0.5 font-mono text-[11px] mt-1">
                <div className="flex justify-between text-slate-400 truncate">
                  <span>Banco:</span>
                  <span className="text-white font-semibold">{fmt(bankBal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px] truncate">
                  <span>Cap:</span>
                  <span>{fmt(cap)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ÁREA PRINCIPAL DE OPERACIONES: 3 TARJETAS EN LA MISMA LÍNEA (1/3 CADA UNA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* TARJETA 1 (1/3): TERMINAL OPERATIVA */}
        <div className="bank-marble-panel rounded-2xl p-5 shadow-2xl flex flex-col justify-between border border-slate-500/30">
          <div>
            {/* Cabecera y Selector de Modo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-500/20 gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Terminal Financiera</span>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{RESOURCE_INFO[selectedResource]?.icon}</span>
                  <span className="text-slate-100">{RESOURCE_INFO[selectedResource]?.name}</span>
                </h2>
              </div>

              {/* Botones de alternancia Depositar / Retirar */}
              <div className="flex bg-black/60 p-1 rounded-xl border border-slate-600/40 self-start sm:self-auto shadow-inner">
                <button
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setOpMode('deposit');
                    setAmountInput('');
                    setFeedback(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    opMode === 'deposit'
                      ? 'bank-btn-chrome shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📥 Depositar
                </button>
                <button
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setOpMode('withdraw');
                    setAmountInput('');
                    setFeedback(null);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    opMode === 'withdraw'
                      ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white border border-slate-400/50 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📤 Retirar
                </button>
              </div>
            </div>

            {/* Comparativa Cara a Cara de Fondos */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="bg-black/50 border border-slate-700/50 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
                  {selectedResource === 'credits' ? 'Créditos (Imperio)' : `En ${currentPlanet?.name || 'Planeta'}`}
                </span>
                <div className="text-base font-mono font-bold text-slate-200 mt-0.5 truncate">
                  {fmt(availableInPlanetOrEmpire)} <span className="text-[10px] text-slate-500 font-normal">{RESOURCE_INFO[selectedResource]?.unit}</span>
                </div>
              </div>

              <div className="bg-black/50 border border-slate-700/50 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">En Bóveda Blindada</span>
                <div className="text-base font-mono font-bold text-white mt-0.5 truncate">
                  {fmt(depositedInBank)} <span className="text-[10px] text-slate-500 font-normal">{RESOURCE_INFO[selectedResource]?.unit}</span>
                </div>
              </div>
            </div>

            {/* Campo de Entrada de Monto */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">
                  {opMode === 'deposit' ? 'A Depositar:' : 'A Retirar:'}
                </label>
                {opMode === 'deposit' && (
                  <span className="text-slate-400 font-mono text-[11px] truncate">
                    Cupo Libre: <span className="text-white font-semibold">{fmt(remainingAllowance)}</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setFeedback(null);
                  }}
                  placeholder="Cantidad a transferir..."
                  className="w-full bg-black/70 border border-slate-600/60 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-all placeholder:text-slate-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
                  {RESOURCE_INFO[selectedResource]?.unit}
                </span>
              </div>

              {/* Botones de porcentaje rápido */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleSetPercent(pct)}
                    className="py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-300 hover:text-white border border-slate-600/30 transition-all active:scale-95"
                  >
                    {pct === 1.0 ? 'MÁX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              {/* Estado de validación interactivo */}
              {amountInput && currentValidation && !currentValidation.valid && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <span>⚠️</span>
                  <span className="text-[11px] leading-tight">{currentValidation.error}</span>
                </div>
              )}
            </div>

            {/* FEEDBACK INTEGRADO DENTRO DE LA TARJETA */}
            {feedback && (
              <div
                className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  feedback.type === 'error'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : feedback.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-800/80 border-slate-500/40 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 leading-snug">
                  <span>{feedback.type === 'error' ? '⚠️' : feedback.type === 'success' ? '✅' : 'ℹ️'}</span>
                  <span className="text-[11px]">{feedback.message}</span>
                </div>
                <button
                  onClick={() => setFeedback(null)}
                  className="text-xs opacity-60 hover:opacity-100 px-1.5 py-0.5 ml-1 text-slate-300"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Botón de Confirmación Principal */}
          <div className="pt-4">
            <button
              onClick={handleExecuteOperation}
              disabled={!currentValidation || !currentValidation.valid}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                currentValidation && currentValidation.valid
                  ? opMode === 'deposit'
                    ? 'bank-btn-chrome font-black active:scale-[0.99]'
                    : 'bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white border border-slate-400/60 font-black shadow-lg active:scale-[0.99]'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{opMode === 'deposit' ? '📥 Confirmar Depósito' : '📤 Autorizar Retirada'}</span>
              {currentValidation?.valid && <span>({fmt(numericAmount)} {RESOURCE_INFO[selectedResource]?.unit})</span>}
            </button>
          </div>
        </div>

        {/* TARJETA 2 (1/3): REGULACIÓN BANCARIA */}
        <div className="bank-marble-panel rounded-2xl p-5 shadow-2xl flex flex-col justify-between border border-slate-500/30">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Regulación Institucional</span>
            <h3 className="text-base font-bold text-white mt-0.5 mb-3 flex items-center gap-2">
              <span>📜</span>
              <span>Estatuto y Condiciones del Tesoro</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between pb-2 border-b border-slate-700/40">
                <span className="text-slate-400">Tipo de Interés Vigente:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {currentInterestRate > 0 ? `+${(currentInterestRate * 100).toFixed(2)}%` : `${(currentInterestRate * 100).toFixed(2)}%`} diario
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-700/40">
                <span className="text-slate-400">Disponibilidad de Fondos:</span>
                <span className="text-slate-200 font-semibold">Inmediata (24/7)</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-700/40">
                <span className="text-slate-400">Periodo de Liquidación:</span>
                <span className="text-slate-300">Cada 24h reales de juego</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Protección Antisaqueo:</span>
                <span className="text-emerald-300 font-semibold">Bóveda Subterránea 100%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
            🏛️ <strong>Disposición Federal:</strong> Los activos depositados en la Banca Galáctica se consolidan en el tesoro federal. Puedes retirarlos desde cualquier colonia sin incurrir en costes de transporte o flete espacial.
          </div>
        </div>

        {/* TARJETA 3 (1/3): AMPLIACIÓN DE CAPACIDAD */}
        <div className="bank-marble-panel rounded-2xl p-5 shadow-2xl flex flex-col justify-between border border-slate-500/30">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-semibold">Ampliación de Bóvedas</span>
            <h3 className="text-base font-bold text-white mt-0.5 mb-2 flex items-center gap-2">
              <span>🏢</span>
              <span>Infraestructura Edilicia</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              El cupo máximo disponible para operar en el Alto Mando depende del nivel de la <strong>Banca Galáctica Central</strong> construida en tus mundos (<strong>20.000 unidades por nivel</strong>).
            </p>

            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-700/40">
                <span className="text-slate-400">Nivel de Instalación:</span>
                <span className="text-white font-bold">Nv. {Math.max(0, ...((state?.planets || []).map(p => p.buildings?.exchangeBank || 0)))}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-700/40">
                <span className="text-slate-400">Cupo Federal Máximo:</span>
                <span className="text-slate-100 font-bold">{fmt(resourceCapacity)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-slate-700/40">
                <span className="text-slate-400">Cupo Disponible:</span>
                <span className="text-emerald-400 font-bold">{fmt(remainingAllowance)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
            💎 <strong>Gestión Territorial:</strong> Eleva la <em>Banca Galáctica Central</em> en el Ministerio de Finanzas de tus colonias para ampliar la capacidad de custodia de la entidad central.
          </div>
        </div>
      </div>

      {/* HISTORIAL AUDITABLE DE TRANSACCIONES */}
      <div className="bank-marble-panel rounded-2xl p-5 shadow-2xl border border-slate-500/30">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider font-semibold">Libro Mayor de Contabilidad</span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>Registro de Operaciones y Liquidaciones</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{history.length} asientos</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-mono">
            No se han registrado operaciones bancarias recientes en el libro contable imperial.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700/50">
                  <th className="py-2 px-2">Tipo</th>
                  <th className="py-2 px-2">Recurso</th>
                  <th className="py-2 px-2 text-right">Monto</th>
                  <th className="py-2 px-2 text-right">Saldo Resultante</th>
                  <th className="py-2 px-2 text-right">Fecha/Hora</th>
                  <th className="py-2 px-2">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.slice(0, 20).map((tx) => {
                  const isDeposit = tx.type === 'DEPOSIT';
                  const isWithdraw = tx.type === 'WITHDRAW';
                  const isInterest = tx.type === 'INTEREST';

                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isDeposit
                            ? 'bg-slate-700 text-white border border-slate-400/50'
                            : isWithdraw
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-600'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {isDeposit ? 'DEPÓSITO' : isWithdraw ? 'RETIRADA' : 'INTERÉS'}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-semibold text-slate-200">
                        {RESOURCE_INFO[tx.resource]?.name || tx.resource}
                      </td>
                      <td className={`py-2 px-2 text-right font-bold ${
                        isDeposit || isInterest ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {isDeposit || isInterest ? `+${fmt(tx.amount)}` : `-${fmt(tx.amount)}`}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-300">
                        {fmt(tx.resultingBalance)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-400">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2 px-2 text-slate-400 truncate max-w-xs">
                        {tx.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
