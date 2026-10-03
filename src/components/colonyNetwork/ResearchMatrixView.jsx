import React from 'react';
import { calcProduction, getMaxResearchQueueSlots } from '../../utils/formulas.js';

/**
 * Requisitos para que un planeta se conecte a la Matriz de Investigación:
 * 1. Laboratorio >= 3
 * 2. Energía de red generada >= 50 MW
 */
export const MIN_LAB_LEVEL_FOR_NETWORK = 3;
export const ENERGY_COST_PER_LINK = 50;

export const getPlanetLabLevel = (planet) => planet?.buildings?.researchLab || 0;

export const isPlanetEligibleForNetwork = (planet, state) => {
  const lab = getPlanetLabLevel(planet);
  // En Ascension, la energía no se almacena en resources, sino que es flujo de producción eléctrica (MW)
  let energyProd = planet?.resources?.energy || 0;
  try {
    const prod = calcProduction(
      planet?.buildings || {},
      state?.research || {},
      planet?.temperature ?? 20,
      1,
      planet?.faction || 'human',
      planet?.biome || null,
      planet?.gravity ?? null,
      planet?.trait || null,
      planet?.specialization || 'balanced',
      planet?.coords || null,
      planet?.taxRate || 0,
      state?.relics || []
    );
    energyProd = Math.max(energyProd, prod?.energyProd || 0);
  } catch (_) {}
  
  return {
    eligible: lab >= MIN_LAB_LEVEL_FOR_NETWORK && energyProd >= ENERGY_COST_PER_LINK,
    lab,
    hasLab: lab >= MIN_LAB_LEVEL_FOR_NETWORK,
    hasEnergy: energyProd >= ENERGY_COST_PER_LINK,
    energy: energyProd
  };
};

export const getMilestones = (totalLevels) => [
  { level: 25, label: 'Computación Cuántica', bonus: '-10% Tiempo Techs IA y Cómputo', unlocked: totalLevels >= 25 },
  { level: 50, label: 'Entrelazamiento Puro', bonus: '-10% Coste Deuterio en Propulsión y Energía', unlocked: totalLevels >= 50 },
  { level: 75, label: 'Sobrealimentación Neural', bonus: '+1 Ranura de Conexión Adicional', unlocked: totalLevels >= 75 },
  { level: 100, label: 'Mente Colmena Científica', bonus: '-25% Tiempo de Investigación Global', unlocked: totalLevels >= 100 }
];

export const ResearchMatrixView = ({
  state,
  dispatch,
  fmt
}) => {
  const planets = state?.planets || [];
  const network = state?.researchNetwork || {
    baseSlots: 2,
    linkedPlanetIds: []
  };

  // Calcular slots totales
  const totalLabLevelsAcrossNetwork = network.linkedPlanetIds.reduce((sum, pid) => {
    const p = planets.find(item => item.id === pid);
    return sum + (p?.buildings?.researchLab || 0);
  }, 0);

  const homePlanet = planets.find(p => p.isHome) || planets[0];
  const bonusSlots = totalLabLevelsAcrossNetwork >= 75 ? 1 : 0;
  const maxSlots = (network.baseSlots || 2) + bonusSlots;
  const usedSlots = (network.linkedPlanetIds || []).filter(pid => pid !== homePlanet?.id).length;

  const milestones = getMilestones(totalLabLevelsAcrossNetwork);

  // Multiplicador total de velocidad de cálculo: 1 + (niveles * 0.08)
  const speedMult = 1 + (totalLabLevelsAcrossNetwork * 0.08);

  const handleToggleLink = (planetId) => {
    dispatch({
      type: 'TOGGLE_RESEARCH_NODE_LINK',
      planetId
    });
    if (window.playSfx) window.playSfx('click');
  };

  const handleUpgradeSlot = () => {
    dispatch({
      type: 'UPGRADE_RESEARCH_NETWORK_SLOT'
    });
    if (window.playSfx) window.playSfx('tradeSuccess');
  };

  // Coste de subir ranura: Base 5000 Metal, 10000 Cristal, 5000 Deuterio escalado
  const nextSlotCost = {
    metal: (network.baseSlots || 2) * 8000,
    crystal: (network.baseSlots || 2) * 15000,
    deuterium: (network.baseSlots || 2) * 8000
  };

  // Comprobar si algún planeta puede costearlo (o recursos globales/primer planeta)
  const capitalPlanet = planets.find(p => p.isHome) || planets[0];
  const canAffordSlot = capitalPlanet &&
    (capitalPlanet.resources?.metal || 0) >= nextSlotCost.metal &&
    (capitalPlanet.resources?.crystal || 0) >= nextSlotCost.crystal &&
    (capitalPlanet.resources?.deuterium || 0) >= nextSlotCost.deuterium;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera Táctica del Mando Científico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-6 shadow-[0_0_40px_rgba(79,70,229,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                🧠
              </span>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  Matriz de Investigación Interplanetaria
                </h3>
                <p className="text-xs text-indigo-300/80 font-mono">
                  Sincronización Cuántica de Laboratorios Coloniales
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enlaza las instalaciones científicas de tus mundos para consolidar su capacidad de cálculo en una única mente de investigación compartida.
            </p>
          </div>

          {/* Estadísticas de Rendimiento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/60 border border-indigo-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ranuras Enlace</span>
              <span className="text-lg font-black text-indigo-300 font-mono">
                {usedSlots} / {maxSlots}
              </span>
            </div>
            <div className="bg-black/60 border border-purple-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cola de Inv.</span>
              <span className="text-lg font-black text-purple-300 font-mono">
                {(state.researchQueue || []).length} / {getMaxResearchQueueSlots(state)}
              </span>
            </div>
            <div className="bg-black/60 border border-cyan-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potencia Neural</span>
              <span className="text-lg font-black text-cyan-300 font-mono">
                Nv. {totalLabLevelsAcrossNetwork}
              </span>
            </div>
            <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Velocidad</span>
              <span className="text-lg font-black text-emerald-300 font-mono">
                x{speedMult.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón Mejorar Ranura */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-2">
            <span>Siguiente Ranura de Enlace:</span>
            <span className="text-slate-200 font-mono">
              {fmt(nextSlotCost.metal)} Metal | {fmt(nextSlotCost.crystal)} Cristal | {fmt(nextSlotCost.deuterium)} Deuterio
            </span>
          </div>
          <button
            onClick={handleUpgradeSlot}
            disabled={!canAffordSlot}
            className={`px-4 py-2 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              canAffordSlot
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:brightness-110 active:scale-95'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <span>⚡</span>
            <span>Ampliar Capacidad del Enlace</span>
          </button>
        </div>
      </div>

      {/* Grid de Nodos Planetarios */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <span>📡</span>
          <span>Nodos Planetarios Disponibles</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {planets.map((planet) => {
            const isLinked = (network.linkedPlanetIds || []).includes(planet.id);
            const { eligible, lab, hasLab, hasEnergy, energy } = isPlanetEligibleForNetwork(planet, state);
            const canLink = !isLinked && eligible && usedSlots < maxSlots;

            return (
              <div
                key={planet.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isLinked
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500/60 shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-xs font-mono text-indigo-400 block mb-0.5">
                      {planet.coordinates?.galaxy ? `[${planet.coordinates.galaxy}:${planet.coordinates.system}:${planet.coordinates.position}]` : 'COLONIA'}
                    </span>
                    <h5 className="font-bold text-white text-base flex items-center gap-2">
                      {planet.name}
                      {planet.isHome && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SEDE
                        </span>
                      )}
                    </h5>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isLinked
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : eligible
                        ? 'bg-slate-800 text-slate-300 border-white/10'
                        : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isLinked ? 'Enlazado' : eligible ? 'Disponible' : 'No Apto'}
                  </span>
                </div>

                {/* Métricas del Planeta */}
                <div className="space-y-1.5 text-xs mb-4 bg-black/40 rounded-lg p-2.5 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Laboratorio:</span>
                    <span className={`font-mono font-bold ${hasLab ? 'text-cyan-300' : 'text-rose-400'}`}>
                      Nv. {lab} {!hasLab && `(Mín. ${MIN_LAB_LEVEL_FOR_NETWORK})`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Energía Red:</span>
                    <span className={`font-mono font-bold ${hasEnergy ? 'text-amber-300' : 'text-rose-400'}`}>
                      {fmt(energy)} / {ENERGY_COST_PER_LINK} MW
                    </span>
                  </div>
                </div>

                {/* Botón de Enlace */}
                <div>
                  {isLinked ? (
                    <button
                      onClick={() => handleToggleLink(planet.id)}
                      className="w-full py-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/30 transition-all"
                    >
                      Desconectar Enlace
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleLink(planet.id)}
                      disabled={!canLink}
                      className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                        canLink
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                          : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {usedSlots >= maxSlots
                        ? 'Sin Ranuras Libres'
                        : !hasLab
                        ? 'Requiere Laboratorio Nv. 3'
                        : !hasEnergy
                        ? 'Energía Insuficiente'
                        : 'Sincronizar a la Red'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hitos Imperiales Acumulados */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <span>🏆</span>
          <span>Hitos de Potencia de Cálculo Imperial</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {milestones.map((m) => (
            <div
              key={m.level}
              className={`p-3 rounded-xl border transition-all ${
                m.unlocked
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'bg-black/30 border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  m.unlocked ? 'bg-indigo-500 text-black font-bold' : 'bg-white/10 text-slate-400'
                }`}>
                  Nv. {m.level} Total
                </span>
                <span className="text-xs">{m.unlocked ? '✅' : '🔒'}</span>
              </div>
              <h6 className={`font-bold text-xs mb-1 ${m.unlocked ? 'text-white' : 'text-slate-400'}`}>
                {m.label}
              </h6>
              <p className="text-[11px] text-slate-400 leading-snug">
                {m.bonus}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
