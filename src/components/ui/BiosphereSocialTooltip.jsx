import React from 'react';
import { fmt as defaultFmt } from '../../core.jsx';

/**
 * BiosphereSocialTooltip — Tarjeta de auditoría táctica ambiental y demográfica.
 * Si isImperial es true, muestra la lista de todos los planetas con su estado en esta métrica.
 * Si isImperial es false, muestra el desglose atómico de los sistemas vitales del planeta activo.
 */
export const BiosphereSocialTooltip = React.memo(({
  metricType,
  currentPlanet,
  state,
  fmt = defaultFmt
}) => {
  const isImperial = !currentPlanet || currentPlanet.isImperialSummary;
  const planets = state?.planets || [];

  const metricMeta = {
    air: {
      name: 'Calidad Atmosférica y Respirabilidad',
      icon: '🌬️',
      color: 'text-sky-300',
      border: 'border-sky-500/40',
      glow: 'rgba(56,189,248,0.15)'
    },
    water: {
      name: 'Reserva Hídrica y Soporte Vital',
      icon: '💧',
      color: 'text-cyan-400',
      border: 'border-cyan-500/40',
      glow: 'rgba(6,182,212,0.15)'
    },
    pollution: {
      name: 'Degradación Ecológica y Polución',
      icon: '☣️',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      glow: 'rgba(16,185,129,0.15)'
    },
    thermal: {
      name: 'Red Térmica y Climatización',
      icon: '🌡️',
      color: 'text-amber-400',
      border: 'border-amber-500/40',
      glow: 'rgba(245,158,11,0.15)'
    },
    society: {
      name: 'Moral Colonial y Cohesión Civil',
      icon: '👥',
      color: 'text-teal-300',
      border: 'border-teal-500/40',
      glow: 'rgba(20,184,166,0.15)'
    }
  }[metricType] || {
    name: 'Sensor Vital',
    icon: '📊',
    color: 'text-white',
    border: 'border-white/20',
    glow: 'rgba(255,255,255,0.05)'
  };

  const getPlanetBio = (p) => {
    const b = p?.biosphere || {};
    const t = p?.thermalGrid || {};
    const d = p?.demographics || {};
    return {
      pressureAtm: b.pressureAtm !== undefined ? b.pressureAtm : (p?.biome === 'barren' ? 0.05 : 1.0),
      o2Level: b.o2Level !== undefined ? b.o2Level : (p?.biome === 'barren' || p?.biome === 'toxic' ? 0.02 : 0.21),
      waterReserveDays: b.waterReserveDays !== undefined ? b.waterReserveDays : 120,
      caloricSupplyRatio: b.caloricSupplyRatio !== undefined ? b.caloricSupplyRatio : 1.0,
      radiationShieldActive: b.radiationShieldActive !== undefined ? b.radiationShieldActive : true,
      pollutionLevel: b.pollutionLevel !== undefined ? b.pollutionLevel : 5.0,
      heatGeneratedMW: t.heatGeneratedMW !== undefined ? t.heatGeneratedMW : 1200,
      heatDissipatedMW: t.heatDissipatedMW !== undefined ? t.heatDissipatedMW : 5000,
      atmosphericTempC: t.atmosphericTempC !== undefined ? t.atmosphericTempC : 18.0,
      blackoutRisk: t.blackoutRisk !== undefined ? t.blackoutRisk : 0.0,
      morale: d.morale !== undefined ? d.morale : 85,
      healthIndex: d.healthIndex !== undefined ? d.healthIndex : 92,
      unrest: d.unrest !== undefined ? d.unrest : 3
    };
  };

  return (
    <div
      className="absolute top-full left-0 mt-2 w-84 sm:w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto bg-[#050814]/95 border border-cyan-500/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,1)] z-[150] text-left font-mono text-xs pointer-events-none backdrop-blur-xl"
      style={{ boxShadow: `0 20px 50px rgba(0,0,0,1), 0 0 30px ${metricMeta.glow}` }}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2 mb-2.5">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{metricMeta.icon}</span>
          <span className={`${metricMeta.color} uppercase tracking-wider font-black text-sm`}>{metricMeta.name}</span>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 uppercase tracking-widest font-black">
          {isImperial ? 'CENSO IMPERIAL' : 'AUDITORÍA PLANETA'}
        </div>
      </div>

      {/* CASO A: AUDITORÍA A NIVEL IMPERIO (LISTADO DE PLANETAS) */}
      {isImperial ? (
        <div className="space-y-2">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Telemetría comparativa entre colonias:
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {planets.map((p) => {
              const bio = getPlanetBio(p);
              let valText = '';
              let statusColor = 'text-emerald-400';

              if (metricType === 'air') {
                valText = `${Math.round(bio.o2Level * 100)}% O₂ (${bio.pressureAtm.toFixed(2)} atm)`;
                if (bio.o2Level < 0.15 || bio.pressureAtm < 0.5) statusColor = 'text-rose-400';
              } else if (metricType === 'water') {
                valText = `${bio.waterReserveDays} días`;
                if (bio.waterReserveDays < 30) statusColor = 'text-rose-400';
                else if (bio.waterReserveDays < 60) statusColor = 'text-amber-400';
              } else if (metricType === 'pollution') {
                valText = `${bio.pollutionLevel.toFixed(1)}%`;
                if (bio.pollutionLevel > 25) statusColor = 'text-rose-400';
                else if (bio.pollutionLevel > 15) statusColor = 'text-amber-400';
              } else if (metricType === 'thermal') {
                valText = `${bio.atmosphericTempC.toFixed(1)}°C`;
                if (bio.atmosphericTempC > 45 || bio.atmosphericTempC < -10) statusColor = 'text-rose-400';
              } else if (metricType === 'society') {
                valText = `${bio.morale}% moral / ${bio.healthIndex}% salud`;
                if (bio.morale < 50 || bio.unrest > 20) statusColor = 'text-rose-400';
                else if (bio.morale < 70) statusColor = 'text-amber-400';
              }

              return (
                <div key={p.id || p.name} className="flex justify-between items-center bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5 text-[11px]">
                  <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                    <span className="text-slate-400 text-xs">🪐</span>
                    <span className="text-white font-bold truncate">{p.name || 'Colonia'}</span>
                  </div>
                  <span className={`font-mono font-bold shrink-0 ${statusColor}`}>
                    {valText}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-white/10 mt-1">
            Los valores fuera de rango óptimo activan penalizaciones en crecimiento demográfico y productividad minera.
          </div>
        </div>
      ) : (
        /* CASO B: AUDITORÍA A NIVEL PLANETA CONCRETO (DESGLOSE COMPLETO) */
        (() => {
          const bio = getPlanetBio(currentPlanet);

          if (metricType === 'air') {
            return (
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Concentración de Oxígeno (O₂):</span>
                  <span className="font-bold text-sky-300">{Math.round(bio.o2Level * 100)}%</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Presión Barométrica en Superficie:</span>
                  <span className="font-bold text-white">{bio.pressureAtm.toFixed(2)} atm</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Escudo Atmosférico Antirradiación:</span>
                  <span className={`font-bold ${bio.radiationShieldActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {bio.radiationShieldActive ? 'ACTIVO (100% Cobertura)' : 'INACTIVO'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  El aire óptimo mantiene al 100% el rendimiento biológico de los obreros coloniales.
                </div>
              </div>
            );
          }

          if (metricType === 'water') {
            return (
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Autonomía Hídrica de Acuíferos:</span>
                  <span className="font-bold text-cyan-300">{bio.waterReserveDays} días</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Ratio de Abastecimiento Calórico:</span>
                  <span className="font-bold text-emerald-400">{(bio.caloricSupplyRatio * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Seguridad Alimentaria:</span>
                  <span className="font-bold text-white">Garantizada por Hidroponía</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  Las reservas por encima de 60 días evitan hambrunas y caídas de censo durante asedios navales.
                </div>
              </div>
            );
          }

          if (metricType === 'pollution') {
            return (
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Nivel de Polución Superficial:</span>
                  <span className={`font-bold ${bio.pollutionLevel > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {bio.pollutionLevel.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Emisiones de Complejos Industriales:</span>
                  <span className="font-bold text-amber-400">Moderadas</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Filtros Ecológicos y Depuradoras:</span>
                  <span className="font-bold text-emerald-400">Operativos</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  Una polución baja maximiza la natalidad y evita penalizaciones en la producción de alimentos.
                </div>
              </div>
            );
          }

          if (metricType === 'thermal') {
            return (
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Temperatura Atmosférica Media:</span>
                  <span className="font-bold text-amber-300">{bio.atmosphericTempC.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Carga Térmica Industrial:</span>
                  <span className="font-bold text-white">{fmt(bio.heatGeneratedMW)} MW</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Capacidad Disipadora Geotérmica:</span>
                  <span className="font-bold text-cyan-300">{fmt(bio.heatDissipatedMW)} MW</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Riesgo de Apagón Térmico:</span>
                  <span className={`font-bold ${bio.blackoutRisk > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {(bio.blackoutRisk * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  La estabilidad térmica previene sobrecalentamientos en reactores y centros de investigación.
                </div>
              </div>
            );
          }

          if (metricType === 'society') {
            return (
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Moral y Aprobación Colonial:</span>
                  <span className="font-bold text-teal-300">{bio.morale}%</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Índice Sanitario Hospitalario:</span>
                  <span className="font-bold text-emerald-400">{bio.healthIndex}%</span>
                </div>
                <div className="flex justify-between bg-black/40 p-2 rounded-lg border border-white/5">
                  <span className="text-slate-400">Índice de Agitación / Disturbios:</span>
                  <span className={`font-bold ${bio.unrest > 10 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {bio.unrest}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  Una moral elevada multiplica la recaudación fiscal y acelera los turnos de construcción.
                </div>
              </div>
            );
          }

          return null;
        })()
      )}
    </div>
  );
});
