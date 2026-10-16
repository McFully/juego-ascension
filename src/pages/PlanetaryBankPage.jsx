import React, { useState, useMemo } from 'react';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';
import {
  BANK_RESOURCES,
  RESOURCE_INFO,
  calcPlanetaryBankCapacity,
  calcBankCapacity,
  getPlanetaryBankState
} from '../utils/galacticBankCore.js';

export const PlanetaryBankPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt = (v) => Math.floor(v || 0).toLocaleString(),
  setActiveTab
}) => {
  const { navigateTo } = useNavigation();
  const [selectedResource, setSelectedResource] = useState('metal');
  const [opMode, setOpMode] = useState('deposit'); // 'deposit' | 'withdraw' | 'transfer'
  const [amountInput, setAmountInput] = useState('');
  const [feedback, setFeedback] = useState(null);

  const bankLvl = currentPlanet?.buildings?.financeMinistry || 0;
  const exchangeBankLvl = currentPlanet?.buildings?.exchangeBank || 0;

  // Estado seguro del banco local
  const localBank = useMemo(() => getPlanetaryBankState(currentPlanet), [currentPlanet]);
  const balances = localBank.balances;
  const history = localBank.history || [];

  const planetRes = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const imperialCredits = state?.credits || 0;

  // Saldo disponible en planeta (para depositar)
  const availableInPlanet = selectedResource === 'credits' 
    ? imperialCredits 
    : (planetRes[selectedResource] || 0);

  // Saldo en bóveda planetaria
  const depositedInLocalBank = balances[selectedResource] || 0;

  // Capacidad de la banca planetaria local (ej. 1M base por nivel)
  const localCapacity = useMemo(() => calcPlanetaryBankCapacity(currentPlanet, selectedResource), [currentPlanet, selectedResource]);
  const remainingLocalAllowance = Math.max(0, localCapacity - depositedInLocalBank);

  // Cupo federal en la Banca Galáctica Central (20.000 por nivel de exchangeBank)
  const galacticBankState = state?.galacticBank?.balances || {};
  const inGalacticBank = galacticBankState[selectedResource] || 0;
  const galacticMaxCapacity = useMemo(() => calcBankCapacity(state, selectedResource), [state, selectedResource]);
  const galacticRemainingSpace = Math.max(0, galacticMaxCapacity - inGalacticBank);

  // Totales locales
  const totalLocalDeposited = (balances.metal || 0) + (balances.crystal || 0) + (balances.deuterium || 0);
  const totalLocalCapacity = calcPlanetaryBankCapacity(currentPlanet, 'metal') + 
                             calcPlanetaryBankCapacity(currentPlanet, 'crystal') + 
                             calcPlanetaryBankCapacity(currentPlanet, 'deuterium');
  const localOccupancyPct = totalLocalCapacity > 0 ? Math.min(100, (totalLocalDeposited / totalLocalCapacity) * 100) : 0;

  // Validación numérica
  const numericAmount = Math.floor(Number(amountInput) || 0);
  const currentValidation = useMemo(() => {
    if (!amountInput || numericAmount <= 0) return null;
    if (bankLvl < 1) {
      return { valid: false, error: 'Se requiere Banca Planetaria nivel 1.' };
    }

    if (opMode === 'deposit') {
      if (numericAmount > availableInPlanet) {
        return { valid: false, error: `Fondos insuficientes en ${currentPlanet?.name || 'el planeta'}.` };
      }
      if (numericAmount > remainingLocalAllowance) {
        return { valid: false, error: 'Excede la capacidad de la Banca Planetaria.' };
      }
      return { valid: true };
    } else if (opMode === 'withdraw') {
      if (numericAmount > depositedInLocalBank) {
        return { valid: false, error: 'Cantidad superior al saldo en la Banca Planetaria.' };
      }
      return { valid: true };
    } else if (opMode === 'transfer') {
      if (exchangeBankLvl < 1) {
        return { valid: false, error: 'Requiere construir Banca Galáctica Central en este planeta.' };
      }
      if (numericAmount > depositedInLocalBank) {
        return { valid: false, error: 'Saldo insuficiente en la Banca Planetaria.' };
      }
      if (numericAmount > galacticRemainingSpace) {
        return { valid: false, error: `Excede el cupo de la Banca Galáctica Central (quedan ${fmt(galacticRemainingSpace)}).` };
      }
      return { valid: true };
    }
    return null;
  }, [opMode, numericAmount, bankLvl, availableInPlanet, remainingLocalAllowance, depositedInLocalBank, exchangeBankLvl, galacticRemainingSpace, currentPlanet, fmt]);

  // Selección rápida de porcentaje
  const handleSetPercent = (pct) => {
    if (window.playSfx) window.playSfx('click');
    let target = 0;
    if (opMode === 'deposit') {
      const maxPossible = Math.min(availableInPlanet, remainingLocalAllowance);
      target = Math.floor(maxPossible * pct);
    } else if (opMode === 'withdraw') {
      target = Math.floor(depositedInLocalBank * pct);
    } else if (opMode === 'transfer') {
      const maxPossible = Math.min(depositedInLocalBank, galacticRemainingSpace);
      target = Math.floor(maxPossible * pct);
    }
    setAmountInput(target > 0 ? String(target) : '');
    setFeedback(null);
  };

  // Ejecutar acción
  const handleExecute = () => {
    if (!currentValidation || !currentValidation.valid) {
      setFeedback({ type: 'error', message: currentValidation?.error || 'Operación inválida.' });
      if (window.playSfx) window.playSfx('error');
      return;
    }

    if (opMode === 'deposit') {
      dispatch({
        type: 'PLANETARY_BANK_DEPOSIT',
        payload: {
          resource: selectedResource,
          amount: numericAmount,
          planetId: currentPlanet?.id
        }
      });
      setFeedback({
        type: 'success',
        message: `+${fmt(numericAmount)} ${RESOURCE_INFO[selectedResource]?.name} depositados en la Banca Planetaria de ${currentPlanet?.name}.`
      });
    } else if (opMode === 'withdraw') {
      dispatch({
        type: 'PLANETARY_BANK_WITHDRAW',
        payload: {
          resource: selectedResource,
          amount: numericAmount,
          planetId: currentPlanet?.id
        }
      });
      setFeedback({
        type: 'success',
        message: `${fmt(numericAmount)} ${RESOURCE_INFO[selectedResource]?.name} devueltos a los almacenes de ${currentPlanet?.name}.`
      });
    } else if (opMode === 'transfer') {
      dispatch({
        type: 'TRANSFER_TO_GALACTIC_BANK',
        payload: {
          resource: selectedResource,
          amount: numericAmount,
          planetId: currentPlanet?.id
        }
      });
      setFeedback({
        type: 'success',
        message: `Transferencia autorizada: +${fmt(numericAmount)} ${RESOURCE_INFO[selectedResource]?.name} enviados a la Banca Galáctica Central.`
      });
    }

    setAmountInput('');
  };

  return (
    <div className="flex flex-col w-full min-h-screen text-slate-100 space-y-3">
      {/* Banner superior HUD y navegación */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbIcon="🏦"
        breadcrumbTitle={`Banca Planetaria — ${currentPlanet?.name || 'Mundo'}`}
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Alto Mando"
        backButtonIcon="🪐"
        onBackToAltoMando={() => {
          if (setActiveTab) setActiveTab('overview');
          else if (navigateTo) navigateTo('overview');
        }}
      />

      {/* HEADER HERO DE LA INSTITUCIÓN */}
      <div className="relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-slate-950 via-yellow-950/20 to-slate-900 p-3.5 shadow-2xl -mt-3">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-8xl">
          🏦
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏦</span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500">
                BANCA PLANETARIA — {currentPlanet?.name?.toUpperCase() || 'COLONIA'}
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Cámara de custodia y fondos exclusivos de este mundo colonial. Los saldos aquí depositados pertenecen de forma única e intransferible a <strong>{currentPlanet?.name}</strong> y no se suman al Mando Imperial salvo que construyas la instalación de <strong>Banca Galáctica Central</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-black/50 border border-yellow-500/30 rounded-xl px-3 py-2 backdrop-blur-sm self-start md:self-auto">
            <div className="text-right">
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-mono">Nivel de Instalación</span>
              <span className="text-sm sm:text-base font-mono font-bold text-yellow-300">
                {bankLvl > 0 ? `Nv. ${bankLvl} Operativa` : 'Bloqueada (Nv. 0)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5">
        {/* 1. Volumen en Custodia Local */}
        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase truncate">Custodia Local</span>
            <span className="text-yellow-400 text-xs">📦</span>
          </div>
          <div className="text-base lg:text-lg font-black text-yellow-300 font-mono truncate">
            {fmt(totalLocalDeposited)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between truncate">
            <span>Mundo:</span>
            <span className="font-mono text-slate-300 font-semibold truncate">{currentPlanet?.name}</span>
          </div>
        </div>

        {/* 2. Ocupación de Bóveda Local */}
        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase truncate">Ocupación</span>
            <span className="text-amber-400 text-xs">🏢</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base lg:text-lg font-black text-white font-mono">{localOccupancyPct.toFixed(1)}%</span>
            <span className="text-[10px] text-slate-400 font-mono truncate">/{fmt(totalLocalCapacity)}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 ${localOccupancyPct > 90 ? 'bg-red-500' : localOccupancyPct > 70 ? 'bg-amber-400' : 'bg-yellow-400'}`}
              style={{ width: `${localOccupancyPct}%` }}
            />
          </div>
        </div>

        {/* 3. Conexión Federal */}
        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase truncate">Enlace Federal</span>
            <span className="text-cyan-400 text-xs">🌐</span>
          </div>
          <div className="text-sm font-black text-cyan-300 font-mono truncate">
            {exchangeBankLvl > 0 ? `Nv. ${exchangeBankLvl} Activo` : 'Sin Enlace'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {exchangeBankLvl > 0 ? `Cupo: ${fmt(galacticMaxCapacity)}` : 'Requiere Instalación'}
          </div>
        </div>

        {/* 4. Aislamiento Soberano */}
        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-3 shadow-lg backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-mono uppercase truncate">Soberanía</span>
            <span className="text-emerald-400 text-xs">🛡️</span>
          </div>
          <div className="text-sm font-black text-emerald-300 font-mono truncate">
            100% Protegido
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            A salvo de saqueos
          </div>
        </div>

        {/* 5, 6, 7, 8. Las 4 Cuentas de Recursos Locales */}
        {BANK_RESOURCES.map((resKey) => {
          const info = RESOURCE_INFO[resKey];
          const isSelected = selectedResource === resKey;
          const bankBal = balances[resKey] || 0;
          const cap = calcPlanetaryBankCapacity(currentPlanet, resKey);

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
                  ? 'bg-gradient-to-b from-yellow-950/90 to-slate-900 border-yellow-400 shadow-lg shadow-yellow-950/50 ring-1 ring-yellow-400/50'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base">{info.icon}</span>
                  <span className="font-bold text-xs tracking-wide text-white truncate">{info.name}</span>
                </div>
              </div>
              <div className="text-sm sm:text-base font-black font-mono text-white truncate my-1">
                {fmt(bankBal)} <span className="text-[10px] text-slate-400 font-normal">{info.unit}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px] truncate">
                <span>Cap:</span>
                <span>{fmt(cap)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ÁREA PRINCIPAL: 3 TARJETAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* TARJETA 1: TERMINAL OPERATIVA LOCAL */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase text-yellow-400 tracking-wider">Cámara de Operaciones</span>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{RESOURCE_INFO[selectedResource]?.icon}</span>
                  <span>{RESOURCE_INFO[selectedResource]?.name}</span>
                </h2>
              </div>

              {/* Selector de Modos */}
              <div className="flex flex-wrap bg-black/60 p-1 rounded-xl border border-white/10 gap-1 self-start sm:self-auto">
                <button
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setOpMode('deposit');
                    setAmountInput('');
                    setFeedback(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    opMode === 'deposit'
                      ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-md'
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    opMode === 'withdraw'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📤 Retirar
                </button>
                <button
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    setOpMode('transfer');
                    setAmountInput('');
                    setFeedback(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    opMode === 'transfer'
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💎 A Mando Imperial
                </button>
              </div>
            </div>

            {/* Comparativa Fondos */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
                  En Almacén ({currentPlanet?.name})
                </span>
                <div className="text-base font-mono font-bold text-sky-300 mt-0.5 truncate">
                  {fmt(availableInPlanet)} <span className="text-[10px] text-slate-500 font-normal">{RESOURCE_INFO[selectedResource]?.unit}</span>
                </div>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block truncate">
                  En Banca Planetaria
                </span>
                <div className="text-base font-mono font-bold text-yellow-300 mt-0.5 truncate">
                  {fmt(depositedInLocalBank)} <span className="text-[10px] text-slate-500 font-normal">{RESOURCE_INFO[selectedResource]?.unit}</span>
                </div>
              </div>
            </div>

            {/* Campo de Entrada */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">
                  {opMode === 'deposit' ? 'A Depositar:' : opMode === 'withdraw' ? 'A Retirar:' : 'A Transferir a Banca Galáctica Central:'}
                </label>
                {opMode === 'deposit' && (
                  <span className="text-slate-400 font-mono text-[11px] truncate">
                    Libre: <span className="text-white font-semibold">{fmt(remainingLocalAllowance)}</span>
                  </span>
                )}
                {opMode === 'transfer' && (
                  <span className="text-slate-400 font-mono text-[11px] truncate">
                    Cupo Federal: <span className="text-cyan-300 font-semibold">{fmt(galacticRemainingSpace)}</span>
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
                  placeholder="Cantidad..."
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-base font-mono font-bold text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-slate-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400 pointer-events-none">
                  {RESOURCE_INFO[selectedResource]?.unit}
                </span>
              </div>

              {/* Botones de Porcentaje */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleSetPercent(pct)}
                    className="py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-slate-300 hover:text-white border border-white/5 transition-all active:scale-95"
                  >
                    {pct === 1.0 ? 'MÁX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              {amountInput && currentValidation && !currentValidation.valid && (
                <div className="text-xs text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <span>⚠️</span>
                  <span className="text-[11px] leading-tight">{currentValidation.error}</span>
                </div>
              )}
            </div>

            {feedback && (
              <div
                className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  feedback.type === 'error'
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center gap-1.5 leading-snug">
                  <span>{feedback.type === 'error' ? '⚠️' : '✅'}</span>
                  <span className="text-[11px]">{feedback.message}</span>
                </div>
                <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100 px-1.5 py-0.5 text-slate-300">
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleExecute}
              disabled={!currentValidation || !currentValidation.valid}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 ${
                currentValidation && currentValidation.valid
                  ? opMode === 'deposit'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black shadow-yellow-500/20 active:scale-[0.99]'
                    : opMode === 'withdraw'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black shadow-purple-500/20 active:scale-[0.99]'
                    : 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black shadow-cyan-500/20 active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{opMode === 'deposit' ? '📥 Depositar en Planeta' : opMode === 'withdraw' ? '📤 Retirar al Almacén' : '💎 Transferir a Banca Galáctica Central'}</span>
              {currentValidation?.valid && <span>({fmt(numericAmount)} {RESOURCE_INFO[selectedResource]?.unit})</span>}
            </button>
          </div>
        </div>

        {/* TARJETA 2: REGLAS Y SOBERANÍA LOCAL */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-amber-400 tracking-wider">Regulación Local</span>
            <h3 className="text-base font-bold text-white mt-0.5 mb-3 flex items-center gap-2">
              <span>📜</span>
              <span>Custodia Exclusiva Planetaria</span>
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Jurisdicción:</span>
                <span className="font-mono font-bold text-yellow-300">{currentPlanet?.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Saldos Sumados a Imperio:</span>
                <span className="text-rose-400 font-semibold">No (Soberanía Local)</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/5">
                <span className="text-slate-400">Disponibilidad Local:</span>
                <span className="text-emerald-300 font-semibold">Inmediata (Sin Coste)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Protección Antisaqueo:</span>
                <span className="text-emerald-300 font-semibold">Bóveda Planetaria 100%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-yellow-950/30 border border-yellow-500/20 text-[11px] text-yellow-200 leading-relaxed">
            🪐 <strong>Principio de Soberanía:</strong> Cada planeta gestiona sus propios saldos. Si deseas disponer de estos recursos fuera del planeta en el Mando Imperial (Banca Galáctica Central), debes construir la instalación <em>Banca Galáctica Central</em> en este mundo.
          </div>
        </div>

        {/* TARJETA 3: ENLACE Y TRANSFERENCIA FEDERAL */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase text-cyan-400 tracking-wider">Instalación Federal</span>
            <h3 className="text-base font-bold text-white mt-0.5 mb-2 flex items-center gap-2">
              <span>💎</span>
              <span>Banca Galáctica Central</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Permite transferir fondos de la Banca Planetaria hacia la <strong>Banca Galáctica Central</strong> accesible desde el Mando Imperial.
            </p>

            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400">Estado en {currentPlanet?.name}:</span>
                <span className={`font-bold ${exchangeBankLvl > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {exchangeBankLvl > 0 ? `Nv. ${exchangeBankLvl} Operativa` : 'No Construida'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400">Cupo Federal Máximo:</span>
                <span className="text-cyan-300 font-bold">{fmt(galacticMaxCapacity)}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
                <span className="text-slate-400">Cupo Disponible:</span>
                <span className="text-emerald-400 font-bold">{fmt(galacticRemainingSpace)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200 leading-relaxed">
            💎 <strong>Requisito:</strong> Construye la instalación <em>Banca Galáctica Central</em> en el Ministerio de Finanzas y Banca para desbloquear y elevar el límite transferible hacia el Mando Imperial.
          </div>
        </div>
      </div>

      {/* HISTORIAL LOCAL */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-xs font-mono uppercase text-yellow-400 tracking-wider">Libro Contable Local</span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>Registro de Operaciones en {currentPlanet?.name}</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{history.length} entradas</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs font-mono">
            No se han registrado operaciones bancarias recientes en esta colonia.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-slate-400 border-b border-white/5">
                  <th className="py-2 px-2">Tipo</th>
                  <th className="py-2 px-2">Recurso</th>
                  <th className="py-2 px-2 text-right">Monto</th>
                  <th className="py-2 px-2 text-right">Saldo Resultante</th>
                  <th className="py-2 px-2 text-right">Fecha/Hora</th>
                  <th className="py-2 px-2">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.slice(0, 20).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : tx.type === 'WITHDRAW'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-semibold text-slate-200">
                      {RESOURCE_INFO[tx.resource]?.name || tx.resource}
                    </td>
                    <td className={`py-2 px-2 text-right font-bold ${
                      tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-purple-300'
                    }`}>
                      {tx.amount > 0 ? `+${fmt(tx.amount)}` : `${fmt(tx.amount)}`}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-300">
                      {fmt(tx.resultingBalance)}
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2 px-2 text-slate-400 truncate max-w-xs">
                      {tx.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetaryBankPage;
