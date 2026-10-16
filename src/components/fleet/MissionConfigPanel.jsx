import React from "react";
import { canColonizeNewPlanet, getMaxPlanets, getUsedColonySlots } from "../../utils/formulas.js";

export const MissionConfigPanel = ({
  target,
  currentPlanet,
  selectedShips,
  setSelectedShips,
  missionType,
  setMissionType,
  missionSpeed,
  setMissionSpeed,
  transportRes,
  setTransportRes,
  autoRetreat,
  setAutoRetreat,
  formation,
  setFormation,
  handleSimulate,
  sendFleet,
  shipStats,
  state,
  fmt,
  S
}) => {
  const astroLvl = state?.research?.astrophysics || 0;
  const maxPlanets = getMaxPlanets(astroLvl);
  const usedSlots = getUsedColonySlots(state);
  const hasColonySlot = canColonizeNewPlanet(state);

  return (
    <div className={S.cardDeep}>
      <h3 className="text-lg font-semibold mb-3">📋 Tipo de Misión</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {[
          { id: "attack", label: "⚔️ Atacar", available: target.occupied && target.isAI },
          { id: "planet_destruction", label: "🪐 Pulverizar Planeta", available: target.occupied && target.isAI && (currentPlanet.fleet.planetDestroyer || 0) > 0 },
          { id: "espionage", label: "👁️ Espiar", available: target.occupied && target.isAI && (currentPlanet.fleet.espionageProbe || 0) > 0 },
          { id: "transport", label: "📦 Transportar", available: target.occupied && !target.isAI },
          {
            id: "colonize",
            label: `🏴 Colonizar (${usedSlots}/${maxPlanets})`,
            available: !target.occupied && (currentPlanet.fleet.colonizer || 0) > 0 && hasColonySlot,
            title: !hasColonySlot ? `Límite colonial alcanzado (${usedSlots}/${maxPlanets}). Investiga Astrofísica.` : undefined
          },
          { id: "recycle", label: "♻️ Reciclar", available: (state.debrisField?.metal || 0) > 0 || (state.debrisField?.crystal || 0) > 0 },
          { id: "expedition", label: "🌌 Expedición", available: true },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMissionType(m.id)}
            disabled={!m.available}
            title={m.title}
            className={S.btn + " " + (missionType === m.id ? S.btnPrimary : S.btnGhost) + " " + (!m.available ? "opacity-40" : "")}
          >
            {m.label}
          </button>
        ))}
      </div>

      {missionType === "transport" && (
        <div className="space-y-3 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <label className="text-sm text-slate-300 font-semibold flex items-center gap-1.5">
              <span>📦</span> Recursos a transportar:
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const totalRes = (transportRes.metal || 0) + (transportRes.crystal || 0) + (transportRes.deuterium || 0);
                  if (totalRes <= 0) return;

                  const lgCargoCap = shipStats("largeCargo")?.cargo || 25000;
                  const smCargoCap = shipStats("smallCargo")?.cargo || 5000;
                  const availLg = currentPlanet.fleet.largeCargo || 0;
                  const availSm = currentPlanet.fleet.smallCargo || 0;

                  let needed = totalRes;
                  let useLg = 0;
                  let useSm = 0;

                  if (availLg > 0) {
                    useLg = Math.min(availLg, Math.ceil(needed / lgCargoCap));
                    needed -= useLg * lgCargoCap;
                  }
                  if (needed > 0 && availSm > 0) {
                    useSm = Math.min(availSm, Math.ceil(needed / smCargoCap));
                  }

                  setSelectedShips(prev => ({
                    ...prev,
                    ...(availLg > 0 ? { largeCargo: useLg } : {}),
                    ...(availSm > 0 ? { smallCargo: useSm } : {}),
                  }));
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
              >
                ⚡ Auto-asignar transportes
              </button>
              {(transportRes.metal > 0 || transportRes.crystal > 0 || transportRes.deuterium > 0) && (
                <button
                  type="button"
                  onClick={() => setTransportRes({ metal: 0, crystal: 0, deuterium: 0 })}
                  className="text-xs text-rose-400 hover:text-rose-300 font-mono underline cursor-pointer"
                >
                  Vaciar
                </button>
              )}
            </div>
          </div>

          {/* Inputs numéricos de recursos con saldo disponible */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Metal</span>
                <span className="text-slate-500">Disp: {fmt(currentPlanet.resources?.metal || 0)}</span>
              </div>
              <input
                type="number"
                min="0"
                max={currentPlanet.resources?.metal || 0}
                placeholder="Metal"
                value={transportRes.metal || ""}
                onChange={e => setTransportRes({ ...transportRes, metal: Math.max(0, Math.min(currentPlanet.resources?.metal || 0, parseInt(e.target.value) || 0)) })}
                className={S.input}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Cristal</span>
                <span className="text-slate-500">Disp: {fmt(currentPlanet.resources?.crystal || 0)}</span>
              </div>
              <input
                type="number"
                min="0"
                max={currentPlanet.resources?.crystal || 0}
                placeholder="Cristal"
                value={transportRes.crystal || ""}
                onChange={e => setTransportRes({ ...transportRes, crystal: Math.max(0, Math.min(currentPlanet.resources?.crystal || 0, parseInt(e.target.value) || 0)) })}
                className={S.input}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Deuterio</span>
                <span className="text-slate-500">Disp: {fmt(currentPlanet.resources?.deuterium || 0)}</span>
              </div>
              <input
                type="number"
                min="0"
                max={currentPlanet.resources?.deuterium || 0}
                placeholder="Deuterio"
                value={transportRes.deuterium || ""}
                onChange={e => setTransportRes({ ...transportRes, deuterium: Math.max(0, Math.min(currentPlanet.resources?.deuterium || 0, parseInt(e.target.value) || 0)) })}
                className={S.input}
              />
            </div>
          </div>

          {/* Suministro Balístico (Polvorín a transportar) */}
          <div className="bg-amber-950/20 border border-amber-500/25 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-amber-300 font-bold flex items-center gap-1.5">
                <span>💣</span>
                <span>Munición del Polvorín a Embarcar:</span>
              </span>
              <span className="text-[10px] text-slate-400">Reabastece colonias en guerra</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'heavyMissiles', label: '🚀 Cohetes', max: currentPlanet?.arsenal?.heavyMissiles ?? 100 },
                { key: 'kineticShells', label: '🎯 Obuses', max: currentPlanet?.arsenal?.kineticShells ?? 500 },
                { key: 'plasmaCells', label: '🟣 Plasma', max: currentPlanet?.arsenal?.plasmaCells ?? 250 },
              ].map((ammo) => (
                <div key={ammo.key} className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{ammo.label}</span>
                    <span className="text-amber-300/80">Disp: {ammo.max}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={ammo.max}
                    placeholder="0"
                    value={transportRes?.ordnance?.[ammo.key] || ""}
                    onChange={e => {
                      const val = Math.max(0, Math.min(ammo.max, parseInt(e.target.value) || 0));
                      setTransportRes({
                        ...transportRes,
                        ordnance: {
                          ...(transportRes?.ordnance || {}),
                          [ammo.key]: val
                        }
                      });
                    }}
                    className={S.input}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botones de llenado rápido según capacidad de bodega de las naves seleccionadas */}
          {(() => {
            const totalCargoCap = Object.entries(selectedShips || {}).reduce((acc, [id, qty]) => {
              const s = shipStats(id);
              return acc + ((s?.cargo || 0) * (qty || 0));
            }, 0);
            const currentTotalRes = (transportRes.metal || 0) + (transportRes.crystal || 0) + (transportRes.deuterium || 0);
            const remainingSpace = Math.max(0, totalCargoCap - currentTotalRes);

            const fillMaxResource = (resKey) => {
              if (totalCargoCap <= 0) return;
              const availRes = currentPlanet.resources?.[resKey] || 0;
              const otherRes = currentTotalRes - (transportRes[resKey] || 0);
              const spaceForThis = Math.max(0, totalCargoCap - otherRes);
              const amountToPut = Math.min(availRes, spaceForThis);
              setTransportRes(prev => ({ ...prev, [resKey]: amountToPut }));
            };

            const fillEqually = () => {
              if (totalCargoCap <= 0) return;
              const mAvail = currentPlanet.resources?.metal || 0;
              const cAvail = currentPlanet.resources?.crystal || 0;
              const dAvail = currentPlanet.resources?.deuterium || 0;
              const perResTarget = Math.floor(totalCargoCap / 3);
              const mPut = Math.min(mAvail, perResTarget);
              const cPut = Math.min(cAvail, perResTarget);
              const dPut = Math.min(dAvail, perResTarget);
              setTransportRes({ metal: mPut, crystal: cPut, deuterium: dPut });
            };

            return (
              <div className="space-y-2 pt-1 border-t border-white/5">
                {totalCargoCap > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] font-mono">
                      <span className="text-slate-400">Carga: </span>
                      <span className={currentTotalRes > totalCargoCap ? "text-rose-400 font-bold" : "text-cyan-300 font-bold"}>
                        {fmt(currentTotalRes)}
                      </span>
                      <span className="text-slate-500"> / {fmt(totalCargoCap)} uds</span>
                      {currentTotalRes > totalCargoCap && (
                        <span className="text-rose-400 ml-2 font-bold animate-pulse">⚠️ Sobrecarga</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => fillMaxResource('metal')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-mono border border-white/10"
                        title="Llenar bodega con Metal hasta el tope"
                      >
                        Máx Metal
                      </button>
                      <button
                        type="button"
                        onClick={() => fillMaxResource('crystal')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-mono border border-white/10"
                        title="Llenar bodega con Cristal hasta el tope"
                      >
                        Máx Cristal
                      </button>
                      <button
                        type="button"
                        onClick={() => fillMaxResource('deuterium')}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-mono border border-white/10"
                        title="Llenar bodega con Deuterio hasta el tope"
                      >
                        Máx Deuterio
                      </button>
                      <button
                        type="button"
                        onClick={fillEqually}
                        className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 rounded text-[10px] font-mono border border-cyan-500/40 font-bold"
                        title="Repartir capacidad equitativamente"
                      >
                        1/3 Cada uno
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-400/80 font-mono bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                    💡 Selecciona naves de carga (ej. Carguero Grande) en la lista superior para habilitar capacidad de bodega.
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-2">Velocidad de misión: {missionSpeed}/10</label>
        <input
          type="range" min="1" max="10" value={missionSpeed}
          onChange={e => setMissionSpeed(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {missionType === "attack" && (
        <div className="mb-4 flex items-center gap-2 glass p-2 rounded-xl border border-white/10">
          <input
            type="checkbox"
            id="auto-retreat-chk"
            checked={autoRetreat}
            onChange={e => setAutoRetreat(e.target.checked)}
            className="rounded border-white/20 text-[var(--ue-accent)] focus:ring-[var(--ue-accent)] bg-[#05070f] w-4 h-4 cursor-pointer"
          />
          <label htmlFor="auto-retreat-chk" className="text-xs text-slate-300 cursor-pointer select-none">
            🛡️ Activar retirada automática (si quedan menos del 30% de naves)
          </label>
        </div>
      )}

      {missionType === "attack" && (
        <div className="mb-4">
          <label className="text-sm text-[var(--ue-text-dim)] block mb-2">🛡️ Formación de Combate:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "standard", name: "Estándar", desc: "Sin modificadores." },
              { id: "vanguard", name: "Vanguardia", desc: "+20% Vel, +10% Atk, -15% Escudo" },
              { id: "artillery", name: "Artillería", desc: "-15% Vel, +25% Atk, +10% Escudo" },
              { id: "escort", name: "Escolta", desc: "+5% Vel, +15% Escudo, -5% Atk (segura)" },
              { id: "raider", name: "Asaltante", desc: "+10% Vel, +15% Atk, -10% Escudo (+15% escombros, alto riesgo)" },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormation(f.id)}
                className={"p-2 rounded-xl border transition-all text-left glass " + (formation === f.id ? "border-[var(--ue-accent)]/50 text-[var(--ue-accent)]" : "border-white/10 text-slate-400 hover:text-slate-200")}
              >
                <div className="text-xs font-semibold">{f.name}</div>
                <div className="text-[9px] text-slate-500 mt-1 leading-tight">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSimulate}
          disabled={Object.values(selectedShips).every(v => !v || v === 0)}
          className={"flex-1 " + S.btn + " " + S.btnGhost}
        >
          🔮 Simular
        </button>
        {(() => {
          const totalCargoCap = Object.entries(selectedShips || {}).reduce((acc, [id, qty]) => {
            const s = shipStats(id);
            return acc + ((s?.cargo || 0) * (qty || 0));
          }, 0);
          const totalRes = (transportRes.metal || 0) + (transportRes.crystal || 0) + (transportRes.deuterium || 0);
          const isOverloaded = missionType === "transport" && totalRes > totalCargoCap;
          const noShips = Object.values(selectedShips).every(v => !v || v === 0);
          const cantAfford = missionType === "transport" && (
            (transportRes.metal || 0) > (currentPlanet.resources?.metal || 0) ||
            (transportRes.crystal || 0) > (currentPlanet.resources?.crystal || 0) ||
            (transportRes.deuterium || 0) > (currentPlanet.resources?.deuterium || 0)
          );
          const isDisabled = noShips || isOverloaded || cantAfford;

          return (
            <button
              onClick={sendFleet}
              disabled={isDisabled}
              className={"flex-1 " + S.btn + " " + (!isDisabled ? S.btnPrimary : S.btnGhost + " opacity-50 cursor-not-allowed")}
              title={
                noShips ? "Selecciona naves primero" :
                isOverloaded ? "La carga excede la capacidad de bodega" :
                cantAfford ? "No tienes suficientes recursos en el planeta" :
                "Despachar flota a las coordenadas indicadas"
              }
            >
              {isOverloaded ? "⚠️ Sobrecarga" : cantAfford ? "⚠️ Recursos insuficientes" : "🚀 Enviar Flota"}
            </button>
          );
        })()}
      </div>
    </div>
  );
};
