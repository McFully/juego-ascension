import React from 'react';
import { BIOMES } from '../../data/game/galaxyData.js';

export const PlanetTerraformingView = ({
  planet,
  dispatch,
  currentPlanet,
  fmt,
  onFinishTerraforming
}) => {
  const terraformProgress = planet.terraformingProgress || 0;
  const isTerraformingActive = planet.isTerraformingActive || false;
  const hasTerraformerShipInOrbit = (planet.fleet?.terraformerShip || 0) >= 1;

  const handleStartAtmosphericConditioning = () => {
    if (!hasTerraformerShipInOrbit) return;
    dispatch({
      type: 'START_PLANET_TERRAFORMING',
      planetId: planet.id
    });
    if (window.playSfx) window.playSfx('build');
  };

  return (
    <div className="p-6 rounded-3xl bg-[#070b16]/95 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)] space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-3xl shadow-inner">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                Fase de Acondicionamiento Atmosférico
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Bioma Actual: {BIOMES[planet.biome]?.name || planet.biome || 'Templado'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider mt-0.5">
              Estabilización y Terraformación de {planet.name}
            </h2>
            <p className="text-xs text-slate-300">
              Mundo extremo u hostil con parcelas limitadas ({planet.planetSize || 100} campos). Despliega una Nave Terraformatriz en órbita para liberar cientos de parcelas útiles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
            hasTerraformerShipInOrbit
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {hasTerraformerShipInOrbit ? '✓ Nave Terraformatriz en Órbita' : '⚠ Requiere Nave Terraformatriz'}
          </span>
        </div>
      </div>

      {/* Métricas de Biosfera en Transformación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Presión Atmosférica</span>
          <div className="text-lg font-bold text-cyan-300 font-mono">
            {isTerraformingActive ? '0.85 atm' : '0.12 atm'}
          </div>
          <span className="text-[10px] text-slate-500">Objetivo ideal: 1.00 atm</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Toxicidad Ambiental</span>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {isTerraformingActive ? '12% (En declive)' : '78% (Inhóspito)'}
          </div>
          <span className="text-[10px] text-slate-500">Purificación biológica activa</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Campos Actuales</span>
          <div className="text-lg font-bold text-amber-300 font-mono">
            {planet.planetSize || 100} parcelas
          </div>
          <span className="text-[10px] text-slate-500">+300 campos al finalizar</span>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">Temperatura Superficial</span>
          <div className="text-lg font-bold text-purple-300 font-mono">
            {planet.temperature || 20} °C
          </div>
          <span className="text-[10px] text-slate-500">Estabilización térmica en curso</span>
        </div>
      </div>

      {/* Barra de Progreso de Terraformación */}
      <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex justify-between text-xs font-mono font-bold">
          <span className="text-white">Progreso de Estabilización Planetaria:</span>
          <span className="text-emerald-400">{terraformProgress}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${terraformProgress}%` }}
          />
        </div>
      </div>

      {/* Botones de Mando */}
      <div className="flex justify-end gap-3 pt-2">
        {!isTerraformingActive ? (
          <button
            onClick={handleStartAtmosphericConditioning}
            disabled={!hasTerraformerShipInOrbit}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              hasTerraformerShipInOrbit
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <span>🌱</span>
            <span>Iniciar Acondicionamiento Atmosférico</span>
          </button>
        ) : (
          <div className="px-5 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            <span>Nave Terraformatriz operando en órbita...</span>
          </div>
        )}
      </div>
    </div>
  );
};
