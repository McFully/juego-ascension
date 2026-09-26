import React, { useState } from 'react';
import { GOVERNOR_TRAITS, MINISTERIAL_SUBTASKS, BIOME_THERMAL_PROFILES } from '../../data/gameData.js';
import { BIOMES } from '../../data/game/galaxyData.js';
import { GovernorDossier } from './GovernorDossier.jsx';
import { calcPlanetMaxPop } from '../../core.jsx';

export const LivingPlanetPanel = ({ planet, dispatch, fmt }) => {
  const [activeTab, setActiveTab] = useState('biosphere'); // 'biosphere' | 'thermal' | 'governance'

  if (!planet) return null;

  const bio = planet.biosphere || {
    pressureAtm: 1.0,
    o2Level: 0.21,
    waterReserveDays: 120,
    caloricSupplyRatio: 1.0,
    radiationShieldActive: true,
    pollutionLevel: 5.0,
  };

  const thermal = planet.thermalGrid || {
    heatGeneratedMW: 1200,
    heatDissipatedMW: 5000,
    atmosphericTempC: 18.0,
    blackoutRisk: 0.0,
    coolingEfficiency: 1.0,
  };

  const demo = planet.demographics || {
    primaryLabor: 25000,
    technicians: 17500,
    intellectuals: 7500,
    morale: 85,
    healthIndex: 92,
    unrest: 3,
  };

  const gov = planet.governance || {
    governor: null,
    localMinistries: {
      infra: { budgetShare: 0.20, activeTasks: [] },
      energy: { budgetShare: 0.20, activeTasks: [] },
      economy: { budgetShare: 0.20, activeTasks: [] },
      welfare: { budgetShare: 0.20, activeTasks: [] },
      defense: { budgetShare: 0.20, activeTasks: [] },
    }
  };

  const thermalProfile = BIOME_THERMAL_PROFILES[planet.biome] || BIOME_THERMAL_PROFILES.temperate;

  const maxPop = calcPlanetMaxPop(planet);
  const currentPop = planet.population || 0;
  const popRatio = maxPop > 0 ? Math.min(100, Math.round((currentPop / maxPop) * 100)) : 0;

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-md">
      {/* Header con pestañas orgánicas */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🪐</span>
            <span>Ecosistema y Gobernanza Viva: {planet.name}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>Bioma: <span className="text-cyan-400 capitalize">{BIOMES[planet.biome]?.name || planet.biome || 'Templado'}</span></span>
            <span>•</span>
            <span>Población: <span className="text-emerald-400 font-bold font-mono">{fmt(currentPop)}</span> / <span className="text-slate-300 font-mono">{fmt(maxPop)}</span></span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${popRatio >= 90 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : popRatio >= 75 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {popRatio}% Capacidad
            </span>
          </div>
        </div>
        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('biosphere')}
            className={`px-3 py-1 text-xs rounded-lg transition-all font-medium ${activeTab === 'biosphere' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-400 hover:text-white'}`}
          >
            🌱 Soporte Vital
          </button>
          <button
            onClick={() => setActiveTab('thermal')}
            className={`px-3 py-1 text-xs rounded-lg transition-all font-medium ${activeTab === 'thermal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'text-slate-400 hover:text-white'}`}
          >
            🔥 Termodinámica
          </button>
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-3 py-1 text-xs rounded-lg transition-all font-medium ${activeTab === 'governance' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:text-white'}`}
          >
            🏛️ Gabinete Colonial
          </button>
        </div>
      </div>

      {/* Pestaña: Biosfera y Soporte Vital */}
      {activeTab === 'biosphere' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Presión y Oxígeno</span>
            <div className="text-base font-bold text-white font-mono">{bio.pressureAtm?.toFixed?.(2) || '1.00'} atm</div>
            <div className="text-xs text-slate-400">Fracción O₂: <span className="text-cyan-400">{((bio.o2Level || 0.21) * 100).toFixed(1)}%</span></div>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Autonomía Hídrica</span>
            <div className="text-base font-bold text-cyan-400 font-mono">{bio.waterReserveDays || 120} días</div>
            <div className="text-xs text-slate-400">Reciclaje cerrado: <span className="text-emerald-400">96.5%</span></div>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Polución Industrial</span>
            <div className={`text-base font-bold font-mono ${(bio.pollutionLevel || 0) > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
              {(bio.pollutionLevel || 0).toFixed(1)} / 100
            </div>
            <div className="text-xs text-slate-400">Índice de Salud: <span className="text-emerald-400">{demo.healthIndex || 92}%</span></div>
          </div>

          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1 md:col-span-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span>🏘️</span>
                <span>Censo Residencial y Capacidad Habitacional</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-white">
                {fmt(currentPop)} / {fmt(maxPop)} hab ({popRatio}%)
              </span>
            </div>
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 rounded-full ${popRatio >= 90 ? 'bg-gradient-to-r from-amber-500 to-red-500' : popRatio >= 75 ? 'bg-gradient-to-r from-cyan-500 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'}`}
                style={{ width: `${Math.min(100, Math.max(2, popRatio))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>{popRatio >= 90 ? '⚠️ Saturación de vivienda: frena el crecimiento' : popRatio >= 75 ? '⚡ Expansión recomendada' : '✅ Espacio residencial disponible'}</span>
              <span>Estratos: {fmt(demo.primaryLabor || 0)} Obreros • {fmt(demo.technicians || 0)} Técnicos • {fmt(demo.intellectuals || 0)} Intelectuales</span>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña: Matriz Térmica */}
      {activeTab === 'thermal' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Temperatura Atmosférica</span>
              <div className={`text-base font-bold font-mono ${thermal.atmosphericTempC > 45 ? 'text-red-400' : thermal.atmosphericTempC < 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                {thermal.atmosphericTempC?.toFixed?.(1) || '18.0'} °C
              </div>
              <div className="text-xs text-slate-400">Base del Bioma: {thermalProfile.baseTempC} °C</div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Calor Industrial Generado</span>
              <div className="text-base font-bold text-red-400 font-mono">{fmt(thermal.heatGeneratedMW || 0)} MW</div>
              <div className="text-xs text-slate-400">Minas, refinerías y reactores</div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Capacidad de Disipación</span>
              <div className="text-base font-bold text-cyan-400 font-mono">{fmt(thermal.heatDissipatedMW || 0)} MW</div>
              <div className="text-xs text-slate-400">Radiadores y atmósfera</div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña: Gabinete y Subtareas */}
      {activeTab === 'governance' && (
        <div className="space-y-4">
          {/* Alerta de Huelga Obrera si el malestar es crítico */}
          {((demo.unrest || 0) >= 60 || (demo.morale || 85) < 30) && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-3 flex items-center gap-3 text-red-300 text-xs">
              <span className="text-xl animate-bounce">⚠️</span>
              <div>
                <div className="font-bold text-red-400 uppercase">Huelga Obrera y Gremial Activa</div>
                <div className="text-[11px] text-slate-300">
                  La producción industrial ha colapsado al 20%. Eleva la moral asignando presupuesto de bienestar o subsidios de raciones.
                </div>
              </div>
            </div>
          )}

          {/* Alerta de Fuga de Presión Atmosférica */}
          {bio.leakDetected && (
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-3 flex items-center gap-3 text-amber-300 text-xs">
              <span className="text-xl animate-pulse">💨</span>
              <div>
                <div className="font-bold text-amber-400 uppercase">Fuga Atmosférica en Cúpulas</div>
                <div className="text-[11px] text-slate-300">
                  El bioma exterior está comprometiendo las zonas habitables. Activa la subtarea "Sellado Hermético de Cúpulas" para evitar bajas.
                </div>
              </div>
            </div>
          )}

          {/* Expediente del Gobernador en funciones con retrato local */}
          <GovernorDossier
            governor={gov.governor}
            onDismiss={gov.governor ? () => dispatch({
              type: 'SET_PLANET_GOVERNOR',
              payload: { planetId: planet.id, governor: null }
            }) : null}
          />

          {/* Selección y Relevo de Gobernador */}
          <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
            <div className="text-xs font-bold text-slate-300">Candidatos al Mando Colonial</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {GOVERNOR_TRAITS.map(t => {
                const isSelected = gov.governor?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => dispatch({
                      type: 'SET_PLANET_GOVERNOR',
                      payload: { planetId: planet.id, governor: isSelected ? null : t }
                    })}
                    className={`p-2 rounded-lg border text-left transition-all ${isSelected ? 'border-cyan-500/50 bg-cyan-950/20 text-white' : 'border-white/5 bg-black/20 text-slate-400 hover:text-white'}`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtareas Ministeriales Interactivas */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">Directivas Ministeriales Activas</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(MINISTERIAL_SUBTASKS).flatMap(([minKey, tasks]) =>
                tasks.map(task => {
                  const activeTasks = gov.localMinistries?.[minKey]?.activeTasks || [];
                  const isActive = activeTasks.includes(task.id);

                  return (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${isActive ? 'border-indigo-500/40 bg-indigo-950/20' : 'border-white/5 bg-black/20'}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{task.icon}</span>
                          <span>{task.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{task.desc}</div>
                      </div>
                      <button
                        onClick={() => dispatch({
                          type: 'TOGGLE_LOCAL_MINISTERIAL_SUBTASK',
                          payload: { planetId: planet.id, ministryKey: minKey, taskId: task.id }
                        })}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all border ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
                      >
                        {isActive ? 'Activo' : 'Asignar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};