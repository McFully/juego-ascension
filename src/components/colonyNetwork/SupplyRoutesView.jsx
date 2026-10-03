import React, { useState } from 'react';
import { SHIPS } from '../../data/game/shipsData.js';
import { SupplyRouteManifestEditor } from './SupplyRouteManifestEditor.jsx';

export const SupplyRoutesView = ({
  planets,
  tradeRoutes = [],
  dispatch
}) => {
  const [fromId, setFromId] = useState(planets[0]?.id || '');
  const [toId, setToId] = useState(planets[1]?.id || planets[0]?.id || '');
  
  // Tramo de Ida
  const [outboundRes, setOutboundRes] = useState('metal');
  const [outboundMode, setOutboundMode] = useState('fixed'); // 'fixed' | 'surplus' | 'all'
  const [outboundAmount, setOutboundAmount] = useState(50000);
  const [minReserveOutbound, setMinReserveOutbound] = useState(10000);

  // Tramo de Retorno (Bilateral Patrician III)
  const [returnMode, setReturnMode] = useState('ballast'); // 'ballast' (vacío) | 'cargo'
  const [returnRes, setReturnRes] = useState('crystal');
  const [returnAmount, setReturnAmount] = useState(25000);

  // Asignación de Cargueros Dedicados al Convoy
  const [assignedSmallCargo, setAssignedSmallCargo] = useState(0);
  const [assignedLargeCargo, setAssignedLargeCargo] = useState(2);
  const [assignedHeavyFreighter, setAssignedHeavyFreighter] = useState(1);
  const [assignedCargoTitan, setAssignedCargoTitan] = useState(0);

  const fromPlanet = planets.find(p => p.id === fromId);
  const toPlanet = planets.find(p => p.id === toId);

  // Validación de alcance físico (Sistema solar vs Galaxia/Universo)
  const isSameSystem = Boolean(
    fromPlanet && toPlanet &&
    fromPlanet.galaxy === toPlanet.galaxy &&
    fromPlanet.system === toPlanet.system
  );

  const availableFleet = fromPlanet?.fleet || {};
  const maxSmall = availableFleet.smallCargo || 0;
  const maxLarge = availableFleet.largeCargo || 0;
  const maxHeavy = availableFleet.heavyFreighter || 0;
  const maxTitan = availableFleet.cargoTitan || 0;

  // Advertencia de motor si se intenta asignar smallCargo a ruta interestelar
  const hasInterstellarSmallCargoWarning = !isSameSystem && assignedSmallCargo > 0;

  // Capacidad de bodega total del convoy
  const totalConvoyCapacity = (
    (assignedSmallCargo * (SHIPS.smallCargo?.cargo || 5000)) +
    (assignedLargeCargo * (SHIPS.largeCargo?.cargo || 25000)) +
    (assignedHeavyFreighter * (SHIPS.heavyFreighter?.cargo || 120000)) +
    (assignedCargoTitan * (SHIPS.cargoTitan?.cargo || 500000))
  );

  const totalAssignedShips = assignedSmallCargo + assignedLargeCargo + assignedHeavyFreighter + assignedCargoTitan;

  const resLabels = {
    metal: '⛏️ Metal',
    crystal: '💎 Cristal',
    deuterium: '⚗️ Deuterio',
    slag: '🌋 Escoria (Slag)'
  };

  const handleCreateRoute = () => {
    if (!fromId || !toId || fromId === toId) return;
    if (totalAssignedShips <= 0) return;
    if (hasInterstellarSmallCargoWarning) return;

    dispatch({
      type: 'ADD_PATRICIAN_TRADE_ROUTE',
      route: {
        id: 'route_' + Date.now(),
        fromId,
        toId,
        isSameSystem,
        outbound: {
          resource: outboundRes,
          mode: outboundMode,
          amount: outboundAmount,
          minReserve: minReserveOutbound
        },
        returnTrip: {
          mode: returnMode,
          resource: returnMode === 'cargo' ? returnRes : null,
          amount: returnMode === 'cargo' ? returnAmount : 0
        },
        ships: {
          smallCargo: assignedSmallCargo,
          largeCargo: assignedLargeCargo,
          heavyFreighter: assignedHeavyFreighter,
          cargoTitan: assignedCargoTitan
        },
        capacity: totalConvoyCapacity,
        active: true,
        createdAt: Date.now()
      }
    });

    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  return (
    <div className="space-y-6">
      {/* Creador de Convoy Bilateral Estilo Patrician III (Modularizado) */}
      <SupplyRouteManifestEditor
        planets={planets}
        fromId={fromId}
        setFromId={setFromId}
        toId={toId}
        setToId={setToId}
        isSameSystem={isSameSystem}
        fromPlanet={fromPlanet}
        toPlanet={toPlanet}
        outboundRes={outboundRes}
        setOutboundRes={setOutboundRes}
        outboundAmount={outboundAmount}
        setOutboundAmount={setOutboundAmount}
        minReserveOutbound={minReserveOutbound}
        setMinReserveOutbound={setMinReserveOutbound}
        returnMode={returnMode}
        setReturnMode={setReturnMode}
        returnRes={returnRes}
        setReturnRes={setReturnRes}
        returnAmount={returnAmount}
        setReturnAmount={setReturnAmount}
        assignedSmallCargo={assignedSmallCargo}
        setAssignedSmallCargo={setAssignedSmallCargo}
        assignedLargeCargo={assignedLargeCargo}
        setAssignedLargeCargo={setAssignedLargeCargo}
        assignedHeavyFreighter={assignedHeavyFreighter}
        setAssignedHeavyFreighter={setAssignedHeavyFreighter}
        assignedCargoTitan={assignedCargoTitan}
        setAssignedCargoTitan={setAssignedCargoTitan}
        maxSmall={maxSmall}
        maxLarge={maxLarge}
        maxHeavy={maxHeavy}
        maxTitan={maxTitan}
        hasInterstellarSmallCargoWarning={hasInterstellarSmallCargoWarning}
        totalConvoyCapacity={totalConvoyCapacity}
        canCreateRoute={
          Boolean(fromId && toId && fromId !== toId &&
          totalAssignedShips > 0 &&
          !hasInterstellarSmallCargoWarning &&
          tradeRoutes.length < 10)
        }
        onCreateRoute={handleCreateRoute}
      />

      {/* Listado de Rutas Patrician III */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Convoyes Comerciales Activos ({tradeRoutes.length}/10)
        </h4>

        {tradeRoutes.length === 0 ? (
          <div className="p-8 text-center bg-black/40 rounded-3xl border border-white/5 space-y-2">
            <span className="text-3xl opacity-60">🛸</span>
            <p className="text-xs text-slate-400 font-mono">
              No hay convoyes comerciales armados. Establece una ruta superior para canalizar materias primas y escoria de forma autónoma.
            </p>
          </div>
        ) : (
          tradeRoutes.map((route) => {
            const originPlanet = planets.find(p => p.id === route.fromId);
            const targetPlanet = planets.find(p => p.id === route.toId);

            return (
              <div
                key={route.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  route.active
                    ? 'bg-indigo-950/25 border-indigo-500/40 shadow-sm'
                    : 'bg-black/40 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-lg shadow-inner">
                    🚚
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="text-indigo-300">{originPlanet?.name || 'Origen'}</span>
                      <span className="text-slate-400">⇄</span>
                      <span className="text-cyan-300">{targetPlanet?.name || 'Destino'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-mono">
                        {route.isSameSystem ? 'Intra-Sistema' : 'Interestelar'}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-300 mt-1 space-y-0.5">
                      <div>
                        Ida: <strong className="text-white">{resLabels[route.outbound?.resource] || route.outbound?.resource || 'Metal'}</strong> ({route.outbound?.amount?.toLocaleString() || 'Surplus'})
                        {route.outbound?.minReserve > 0 && <span className="text-amber-300/80"> · Res. mín: {route.outbound.minReserve.toLocaleString()}</span>}
                      </div>
                      <div>
                        Retorno: {route.returnTrip?.mode === 'cargo' ? (
                          <strong className="text-cyan-300">{resLabels[route.returnTrip.resource] || route.returnTrip.resource} ({route.returnTrip.amount?.toLocaleString()})</strong>
                        ) : (
                          <span className="text-slate-400 italic">En Lastre (Vacío)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_TRADE_ROUTE', routeId: route.id })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      route.active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {route.active ? '✓ En Servicio' : 'Pausado'}
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'REMOVE_TRADE_ROUTE', routeId: route.id })}
                    className="px-2.5 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 border border-rose-500/20 cursor-pointer"
                    title="Desarmar convoy y retornar naves"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
