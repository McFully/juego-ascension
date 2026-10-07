import React, { useMemo, useState } from 'react';
import { HubTopBar } from './hub/HubTopBar.jsx';
import { CommandHubGrid } from './hub/CommandHubGrid.jsx';
import { useCardOrder } from './hub/useCardOrder.js';
import {
  EXCHANGE_COMMAND_CARDS,
  exchangeCommandStorageKey,
  buildExchangeCommandCards
} from './hub/exchangeCommandCardsConfig.jsx';
import { GalacticSpotExchangeView } from '../market/GalacticSpotExchangeView.jsx';
import { ExchangeDaoSubview } from './hub/ExchangeDaoSubview.jsx';
import { SafeImg } from '../../assets.jsx';
import { COMMAND_CARD_TARGETS } from '../../utils/governmentRoute.js';
import { initGalacticLonjaState } from '../../utils/galacticLonjaAutonomousCore.js';

/**
 * ExchangePlanetaryCommandHub — Alto Mando especializado de la Lonja Galáctica.
 * Conserva la cuadrícula de 12 tarjetas grandes y vistas interiores contextuales.
 */
export const ExchangePlanetaryCommandHub = React.memo(({
  state,
  dispatch,
  planet,
  production,
  fmt,
  onNavigateTab,
  onBackToEmpire
}) => {
  if (!planet) return null;

  // Garantizar autocuración defensiva si el save legacy no contenía lonjaAutonomousState
  const effectivePlanet = useMemo(() => {
    if (planet.lonjaAutonomousState) return planet;
    return {
      ...planet,
      lonjaAutonomousState: initGalacticLonjaState('player', planet.name || 'Lonja Galáctica Central')
    };
  }, [planet]);

  // Sub-vista interior activa cuando se abre una tarjeta ('grid' muestra la cuadrícula principal)
  const [activeSubview, setActiveSubview] = useState('grid'); // 'grid' | 'terminal' | 'megaprojects' | 'dao' | 'info_modal'
  const [renameValue, setRenameValue] = useState(planet?.name || '');

  const currentBuildings = planet?.buildings || {};
  const currentCredits = state?.credits || 0;
  const planetRes = planet?.resources || { metal: 0, crystal: 0, deuterium: 0 };

  // Datos del pool DAO
  const daoShares = state?.daoShares || 1000;
  const playerShares = state?.playerDaoShares || 100;
  const playerPercent = ((playerShares / daoShares) * 100).toFixed(2);
  const accumulatedDividends = Math.floor((state?.daoDividendPool || 250000) * (playerShares / daoShares));

  const handleClaimDividends = () => {
    if (accumulatedDividends <= 0) return;
    dispatch({
      type: 'CLAIM_DAO_DIVIDENDS',
      amount: accumulatedDividends
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  const exchangeBuildingsList = [
    'exchangeDocks',
    'exchangeVaults',
    'exchangeEngine',
    'exchangeBank',
    'exchangeBastion',
    'exchangeBunkers',
    'exchangePatrols',
    'exchangeBeacon'
  ];

  const cardsMap = useMemo(() => buildExchangeCommandCards({
    onOpenMinistriesOfPlanet: () => {
      if (onNavigateTab) onNavigateTab(COMMAND_CARD_TARGETS.exchangeMinistries);
    },
    onOpenDirectorate: () => setActiveSubview('directorate'),
    onOpenTerminal: () => setActiveSubview('terminal'),
    onOpenMegaprojects: () => setActiveSubview('megaprojects'),
    onOpenDaoFund: () => setActiveSubview('dao'),
    onOpenTradeRoutes: () => {
      if (onNavigateTab) onNavigateTab('galaxy');
    },
    onOpenSecurityBastion: () => {
      if (onNavigateTab) onNavigateTab('defense');
    },
    onOpenDefensiveSilos: () => {
      if (onNavigateTab) onNavigateTab('missiles');
    },
    onOpenMerchantShipyard: () => {
      if (onNavigateTab) onNavigateTab('shipyard');
    },
    onOpenCargoDocks: () => {
      if (onNavigateTab) onNavigateTab('fleet');
    },
    onOpenOrbitalBeacon: () => {
      if (onNavigateTab) onNavigateTab('moon');
    },
    onOpenScrapDepot: () => {
      if (onNavigateTab) onNavigateTab('fleet');
    },
    planet,
    state,
    fmt
  }), [onNavigateTab, planet, state, fmt]);

  const order = useCardOrder(exchangeCommandStorageKey(planet.id), EXCHANGE_COMMAND_CARDS);

  // Manejo de aportación fraccionada
  const [contributeAmount, setContributeAmount] = useState(50000);
  const [contributeRes, setContributeRes] = useState('metal');

  const handleContribute = (bKey, totalCost) => {
    const currentContrib = state.exchangeContributions?.[planet.id]?.[bKey] || { metal: 0, crystal: 0, deuterium: 0 };
    const needed = totalCost[contributeRes] - (currentContrib[contributeRes] || 0);
    const available = planetRes[contributeRes] || 0;
    const amountToGive = Math.min(available, Math.min(contributeAmount, Math.max(0, needed)));

    if (amountToGive <= 0) return;

    dispatch({
      type: 'CONTRIBUTE_EXCHANGE_PROJECT',
      planetId: planet.id,
      buildingId: bKey,
      resource: contributeRes,
      amount: amountToGive,
      totalCost
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  const handleContributeAll = (bKey, totalCost) => {
    dispatch({
      type: 'CONTRIBUTE_ALL_EXCHANGE_PROJECT',
      planetId: planet.id,
      buildingId: bKey,
      totalCost
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Barra Superior con migas de pan y telemetría */}
      <HubTopBar
        currentPlanet={planet}
        production={production}
        state={state}
        dispatch={dispatch}
        fmt={fmt}
        onBackToEmpire={() => {
          if (activeSubview !== 'grid') {
            setActiveSubview('grid');
          } else {
            onBackToEmpire();
          }
        }}
        hubLabel={
          activeSubview === 'megaprojects'
            ? 'Megaproyectos de la Lonja'
            : activeSubview === 'terminal'
            ? 'Terminal AMM'
            : activeSubview === 'dao'
            ? 'Fondo Soberano DAO'
            : 'Alto Mando Comercial'
        }
        backButtonLabelBottom={activeSubview !== 'grid' ? 'Alto Mando' : 'Imperio'}
        backButtonIcon={activeSubview !== 'grid' ? '👑' : '🪐'}
        isReordering={order.isReordering}
        onToggleReorder={() => order.setIsReordering(prev => !prev)}
        onResetOrder={order.handleResetOrder}
        showResources
      />

      {/* MODO 1: CUADRÍCULA TÁCTICA DE TARJETAS DE ALTO MANDO */}
      {activeSubview === 'grid' && (
        <CommandHubGrid
          cardsMap={cardsMap}
          cardOrder={order.cardOrder}
          columnsClass="lg:grid-cols-4 xl:grid-cols-6"
          {...order}
        />
      )}

      {/* MODO 2: SUB-VISTA TERMINAL BURSÁTIL CUÁNTICO (EXCHANGE SPOT REAL) */}
      {activeSubview === 'terminal' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubview('terminal')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-md cursor-pointer"
            >
              📈 Terminal Spot Real (Libro de Órdenes)
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('dao')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              🏛️ Directorio DAO y Acciones
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('megaprojects')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              🏗️ Megaproyectos
            </button>
          </div>
          <GalacticSpotExchangeView
            state={state}
            dispatch={dispatch}
            currentPlanet={effectivePlanet}
            fmt={fmt}
          />
        </div>
      )}

      {/* MODO 3: SUB-VISTA MEGAPROYECTOS DE CONSTRUCCIÓN */}
      {activeSubview === 'megaprojects' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubview('terminal')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              📈 Terminal AMM y Fletes
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('dao')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              🏛️ Directorio DAO y Acciones
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('megaprojects')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-md cursor-pointer"
            >
              🏗️ Megaproyectos
            </button>
          </div>
          {/* Selector de aportación rápida */}
          <div className="p-4 rounded-2xl bg-[#080d1e]/90 border border-purple-500/30 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🏗️</span> Financiación Colectiva Galáctica (Crowdfunding Multijugador e IA)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cualquier facción o IA puede aportar recursos fraccionados. Las acciones y dividendos del DAO se distribuyen según el porcentaje aportado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-300">Aportar:</span>
              {[10000, 50000, 250000, 1000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setContributeAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    contributeAmount === amt
                      ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {fmt(amt)}
                </button>
              ))}
              <div className="flex items-center gap-1 ml-2 bg-black/60 p-1 rounded-xl border border-white/10">
                {(['metal', 'crystal', 'deuterium']).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setContributeRes(r)}
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                      contributeRes === r
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r === 'metal' ? '⛏️ Met' : r === 'crystal' ? '💎 Cris' : '⚡ Deut'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exchangeBuildingsList.map((bKey) => {
              const currentLvl = currentBuildings[bKey] || 0;
              const nextLvl = currentLvl + 1;
              const costFactor = Math.pow(1.5, currentLvl);
              const metalReq = Math.floor(50000 * costFactor);
              const crystalReq = Math.floor(30000 * costFactor);
              const deutReq = Math.floor(15000 * costFactor);
              const totalCost = { metal: metalReq, crystal: crystalReq, deuterium: deutReq };

              const contributions = state.exchangeContributions?.[planet.id]?.[bKey] || { metal: 0, crystal: 0, deuterium: 0 };
              const currentContribM = contributions.metal || 0;
              const currentContribC = contributions.crystal || 0;
              const currentContribD = contributions.deuterium || 0;

              const totalRequired = metalReq + crystalReq + deutReq;
              const totalContributed = Math.min(metalReq, currentContribM) + Math.min(crystalReq, currentContribC) + Math.min(deutReq, currentContribD);
              const progressPct = Math.min(100, Math.round((totalContributed / totalRequired) * 100));

              const isCompleted = currentContribM >= metalReq && currentContribC >= crystalReq && currentContribD >= deutReq;
              const canContributeThis = (planetRes[contributeRes] || 0) > 0 && (contributions[contributeRes] || 0) < totalCost[contributeRes];

              return (
                <div key={bKey} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#070b16] border border-purple-500/30 hover:border-purple-400 shadow-xl transition-all duration-300 min-h-[360px]">
                  {/* Banner / Imagen de Cabecera Estandarizada */}
                  <div className="relative w-full h-32 overflow-hidden bg-[#05070f] border-b border-white/10 shrink-0">
                    <SafeImg id={bKey} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-purple-950/80 text-purple-300 border border-purple-500/50">
                      Nivel {currentLvl}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-black/70 text-slate-300 border border-white/20">
                      {progressPct}% Financiado
                    </span>
                  </div>

                  {/* Cuerpo Informativo */}
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors">
                        {bKey.replace('exchange', 'Módulo ')}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2">
                        Infraestructura comercial de la Lonja. Aportaciones comunitarias con reparto de dividendos DAO.
                      </p>
                    </div>

                    {/* Barras de Recursos Faltantes */}
                    <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] font-mono">
                      <div>
                        <div className="flex justify-between text-slate-400">
                          <span>Metal:</span>
                          <span className="text-amber-400">{fmt(currentContribM)} / {fmt(metalReq)}</span>
                        </div>
                        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (currentContribM / metalReq) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400">
                          <span>Cristal:</span>
                          <span className="text-cyan-400">{fmt(currentContribC)} / {fmt(crystalReq)}</span>
                        </div>
                        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (currentContribC / crystalReq) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400">
                          <span>Deuterio:</span>
                          <span className="text-emerald-400">{fmt(currentContribD)} / {fmt(deutReq)}</span>
                        </div>
                        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (currentContribD / deutReq) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Acciones: Aportar o Iniciar Obra */}
                    <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                      {(() => {
                        const isUnderConstruction = (state.buildQueue || []).some(
                          q => q.planetId === planet.id && q.buildingId === bKey
                        );
                        if (isUnderConstruction) {
                          return (
                            <div className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                              <span className="animate-spin text-sm">⚙️</span>
                              <span>En Construcción Orbital...</span>
                            </div>
                          );
                        }

                        if (isCompleted) {
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch({
                                  type: 'FINALIZE_EXCHANGE_PROJECT',
                                  planetId: planet.id,
                                  buildingId: bKey
                                });
                                if (window.playSfx) window.playSfx('build');
                              }}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-black uppercase text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
                            >
                              ¡Financiación 100%! Iniciar Obra Nvl {nextLvl}
                            </button>
                          );
                        }

                        const canContributeAny = (
                          ((planetRes.metal || 0) > 0 && currentContribM < metalReq) ||
                          ((planetRes.crystal || 0) > 0 && currentContribC < crystalReq) ||
                          ((planetRes.deuterium || 0) > 0 && currentContribD < deutReq)
                        );

                        return (
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={!canContributeAny}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContributeAll(bKey, totalCost);
                              }}
                              className={`w-full py-2.5 rounded-xl font-black uppercase text-xs font-mono transition-all select-none flex items-center justify-center gap-1.5 shadow-md ${
                                canContributeAny
                                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 active:scale-95 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer'
                                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                              }`}
                              title="Aportar todos los recursos faltantes disponibles en el planeta"
                            >
                              <span>⚡</span>
                              <span>Aportar Todo de Golpe</span>
                            </button>
                            <button
                              type="button"
                              disabled={!canContributeThis}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContribute(bKey, totalCost);
                              }}
                              className={`w-full py-2 rounded-xl font-bold uppercase text-[11px] font-mono transition-all select-none ${
                                canContributeThis
                                  ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 cursor-pointer active:scale-95'
                                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                              }`}
                            >
                              Aportar {fmt(contributeAmount)} {contributeRes === 'metal' ? 'Metal' : contributeRes === 'crystal' ? 'Cristal' : 'Deuterio'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODO 4: SUB-VISTA FONDO SOBERANO DAO Y MERCADO SECUNDARIO */}
      {activeSubview === 'dao' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setActiveSubview('terminal')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              📈 Terminal AMM y Fletes
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('dao')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-md cursor-pointer"
            >
              🏛️ Directorio DAO y Acciones
            </button>
            <button
              type="button"
              onClick={() => setActiveSubview('megaprojects')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase text-slate-400 hover:text-white bg-white/5 border border-white/5 cursor-pointer transition-all"
            >
              🏗️ Megaproyectos
            </button>
          </div>
          <ExchangeDaoSubview
            playerShares={playerShares}
            playerPercent={playerPercent}
            daoShares={daoShares}
            accumulatedDividends={accumulatedDividends}
            handleClaimDividends={handleClaimDividends}
            fmt={fmt}
            lonjaState={effectivePlanet?.lonjaAutonomousState}
            onVoteProposal={(proposalId, voteChoice) => {
              dispatch({
                type: 'VOTE_DAO_PROPOSAL',
                planetId: planet.id,
                proposalId,
                voteChoice
              });
            }}
            onTradeShares={({ side, shares, price }) => {
              dispatch({
                type: 'TRADE_LONJA_SHARES',
                planetId: planet.id,
                side,
                shares,
                price
              });
            }}
          />
        </div>
      )}

      {/* MODO 5: SUB-VISTA DIRECTORIO COMERCIAL */}
      {activeSubview === 'directorate' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-[#0d1326] border border-amber-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏛️</span> Acuerdos de Libre Comercio y Aduanas Francas
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El Directorio Comercial supervisa el estatus neutral de la Lonja. Todo carguero que accede a sus balizas queda protegido por los tratados de la Zona Franca, garantizando transferencias libres de gravámenes impositivos unilaterales.
            </p>
          </div>

          {/* Registro Oficial y Denominación de la Lonja */}
          <div className="p-6 rounded-2xl bg-[#080e1c] border border-cyan-500/30 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏷️</span> Registro y Denominación Oficial de la Lonja
            </h3>
            <p className="text-xs text-slate-400">
              Modifica el nombre oficial del enclave mercantil registrado en las cartas náuticas del Imperio.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={renameValue}
                maxLength={20}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nombre de la Lonja..."
                className="bg-black/70 border border-cyan-500/40 rounded-xl px-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-300 w-full sm:w-72"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = renameValue.trim();
                  if (trimmed && planet?.id && dispatch) {
                    dispatch({ type: 'RENAME_PLANET', planetId: planet.id, name: trimmed.slice(0, 20) });
                    if (window.playSfx) window.playSfx('tradeSuccess');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Guardar Nombre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
