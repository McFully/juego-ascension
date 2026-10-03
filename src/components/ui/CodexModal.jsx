import React, { useEffect, useState, useMemo } from 'react';
import { CardBanner } from '../../assets.jsx';
import { fmt, fmtTime } from '../../core.jsx';
import { CODEX_DATA } from '../../data/codex.js';
import { setMuffle } from '../../audio.js';
import {
  buildingCost,
  researchCost,
  shipCost,
  defenseCost,
  calcBuildTime,
  calcShipTime,
  calcDefenseTime
} from '../../utils/formulas/costFormulas.js';
import { calcEffectiveBuildTime } from '../../utils/formulas/buildTiming.js';
import { calcPlanetResearchTime } from '../../utils/formulas/researchTiming.js';
import { calcBuildingEnergyDemand, calcBuildingEnergyGen } from '../../utils/formulas/energyFormulas.js';
import { CodexExcelTab } from './codex/CodexExcelTab.jsx';
import { CodexLoreTab, CodexOperationsTab } from './codex/CodexLoreTabs.jsx';

export const CodexModal = React.memo(({
  id,
  onClose,
  BUILDINGS = {},
  RESEARCH = {},
  SHIPS = {},
  DEFENSES = {},
  state = {},
  currentPlanet = null
}) => {
  useEffect(() => {
    setMuffle(true);
    return () => setMuffle(false);
  }, []);

  const [activeTab, setActiveTab] = useState('excel'); // 'excel' | 'lore' | 'operations'

  const resolvedName =
    CODEX_DATA[id]?.name ||
    SHIPS?.[id]?.name ||
    DEFENSES?.[id]?.name ||
    BUILDINGS?.[id]?.name ||
    RESEARCH?.[id]?.name ||
    id;

  const data = CODEX_DATA[id] || {
    name: resolvedName || "No disponible",
    lore: "Registro no disponible en los archivos confidenciales de inteligencia orbital y analítica imperial.",
    stats: "Información analítica no disponible en la matriz técnica.",
    usage: "Seguir los protocolos estándar de despliegue imperial y optimización logística.",
  };

  const isBuilding = Boolean(BUILDINGS && BUILDINGS[id]);
  const isResearch = Boolean(RESEARCH && RESEARCH[id]);
  const isShip = Boolean(SHIPS && SHIPS[id]);
  const isDefense = Boolean(DEFENSES && DEFENSES[id]);

  const itemType = isBuilding
    ? 'Edificación Colonial'
    : isResearch
    ? 'Proyecto de I+D'
    : isShip
    ? 'Unidad Naval'
    : isDefense
    ? 'Batería Defensiva'
    : 'Tecnología Especial';

  const itemIcon =
    BUILDINGS[id]?.icon ||
    RESEARCH[id]?.icon ||
    SHIPS[id]?.icon ||
    DEFENSES[id]?.icon ||
    '📋';

  // Nivel o cantidad actual
  const currentLvl = isBuilding
    ? (currentPlanet?.buildings?.[id] || 0)
    : isResearch
    ? (state?.research?.[id] || 0)
    : isShip
    ? (currentPlanet?.ships?.[id] || 0)
    : isDefense
    ? (currentPlanet?.defenses?.[id] || 0)
    : 0;

  // Multiplicadores actuales del imperio
  const constructionCenterLvl = currentPlanet?.buildings?.constructionCenter || 0;
  const robotLvl = currentPlanet?.buildings?.robotFactory || 0;
  const naniteLvl = currentPlanet?.buildings?.naniteFactory || 0;
  const shipyardLvl = currentPlanet?.buildings?.shipyard || 0;
  const labLvl = currentPlanet?.buildings?.researchLab || 0;
  const aiStratLvl = state?.research?.aiStrategy || 0;

  // Generador de matriz tipo Excel con 10 filas de progresión y métricas cruzadas
  const progressionRows = useMemo(() => {
    const rows = [];
    const startRange = isShip || isDefense ? [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500] : Array.from({ length: 10 }, (_, i) => i + 1);

    for (const step of startRange) {
      if (isBuilding) {
        const b = BUILDINGS[id];
        const cost = buildingCost(id, step, constructionCenterLvl);
        const effectiveTime = calcEffectiveBuildTime(cost, robotLvl, naniteLvl, 1, currentPlanet?.specialization, currentPlanet?.trait);
        const energyCons = b.energy ? calcBuildingEnergyDemand(id, step) : 0;
        const energyGen = b.energyGen ? calcBuildingEnergyGen(id, step) : 0;
        const prodVal = b.baseProd ? Math.round(b.baseProd * Math.pow(1.15, step)) : 0;
        const structureHP = Math.round(1500 * Math.pow(1.2, step));
        const roiHours = prodVal > 0 ? ((cost.metal + cost.crystal * 1.5 + (cost.deuterium || 0) * 3) / prodVal).toFixed(1) : 'No aplica';

        rows.push({
          stepLabel: `Nv. ${step}`,
          metalCost: cost.metal,
          crystalCost: cost.crystal,
          deutCost: cost.deuterium,
          totalInvestment: cost.metal + cost.crystal + cost.deuterium,
          effectiveTime: fmtTime(effectiveTime),
          energyDelta: energyGen > 0 ? `+${fmt(energyGen)} ⚡` : energyCons > 0 ? `-${fmt(energyCons)} ⚡` : '0 ⚡',
          primaryOutput: prodVal > 0 ? `+${fmt(prodVal)}/h` : energyGen > 0 ? `+${fmt(energyGen)} Gen` : `${b.cat || 'Soporte'}`,
          structureHP: fmt(structureHP),
          roi: roiHours !== 'No aplica' ? `${roiHours}h` : 'Estático',
          maintenance: `${Math.round(energyCons * 0.05)}/h`,
          efficiency: `${Math.min(100, Math.round(100 - (step * 0.8)))}%`
        });
      } else if (isResearch) {
        const r = RESEARCH[id];
        const cost = researchCost(id, step, aiStratLvl, constructionCenterLvl);
        const effectiveTime = calcPlanetResearchTime(id, step, state, currentPlanet, 1);
        const boostVal = r.perLevel ? Object.entries(r.perLevel).map(([k, v]) => `+${v * step}${r.unit || '%'}`).join(', ') : `Efecto x${step}`;
        const totalCost = cost.metal + cost.crystal + cost.deuterium;

        rows.push({
          stepLabel: `Nv. ${step}`,
          metalCost: cost.metal,
          crystalCost: cost.crystal,
          deutCost: cost.deuterium,
          totalInvestment: totalCost,
          effectiveTime: fmtTime(effectiveTime),
          energyDelta: 'Inerte',
          primaryOutput: boostVal,
          structureHP: 'Datos Cuánticos',
          roi: `${(step * 1.4).toFixed(1)}x`,
          maintenance: '0/h',
          efficiency: '100%'
        });
      } else if (isShip) {
        const s = SHIPS[id];
        const cost = shipCost(id, step, constructionCenterLvl);
        const time = calcShipTime(cost, shipyardLvl, naniteLvl, 1);
        const atkTotal = Math.round((s.atk || 0) * step);
        const shdTotal = Math.round((s.shd || 0) * step);
        const hullTotal = Math.round((s.hull || 0) * step);
        const cargoTotal = Math.round((s.cargo || 0) * step);
        const fuelTotal = Math.round((s.fuel || 0) * step);

        rows.push({
          stepLabel: `x${step} Uds`,
          metalCost: cost.metal,
          crystalCost: cost.crystal,
          deutCost: cost.deuterium,
          totalInvestment: cost.metal + cost.crystal + cost.deuterium,
          effectiveTime: fmtTime(time),
          energyDelta: `${s.range || 'Galaxia'}`,
          primaryOutput: `⚔️ ${fmt(atkTotal)} | 🛡️ ${fmt(shdTotal)}`,
          structureHP: `Hull: ${fmt(hullTotal)}`,
          roi: `📦 ${fmt(cargoTotal)}`,
          maintenance: `⛽ ${fmt(fuelTotal)}/h`,
          efficiency: `${fmt(s.speed || 1000)} km/s`
        });
      } else if (isDefense) {
        const d = DEFENSES[id];
        const cost = defenseCost(id, step, constructionCenterLvl);
        const time = calcDefenseTime(cost, shipyardLvl, naniteLvl, 1);
        const atkTotal = Math.round((d.atk || 0) * step);
        const shdTotal = Math.round((d.shd || 0) * step);
        const hullTotal = Math.round((d.hull || 0) * step);

        rows.push({
          stepLabel: `x${step} Baterías`,
          metalCost: cost.metal,
          crystalCost: cost.crystal,
          deutCost: cost.deuterium,
          totalInvestment: cost.metal + cost.crystal + cost.deuterium,
          effectiveTime: fmtTime(time),
          energyDelta: 'Fijo Terrestre',
          primaryOutput: `⚔️ ${fmt(atkTotal)} Potencia`,
          structureHP: `Casco: ${fmt(hullTotal)}`,
          roi: `Escudo: ${fmt(shdTotal)}`,
          maintenance: '0/h',
          efficiency: '70% Recup. Chatarra'
        });
      }
    }
    return rows;
  }, [id, isBuilding, isResearch, isShip, isDefense, constructionCenterLvl, robotLvl, naniteLvl, shipyardLvl, aiStratLvl, currentPlanet, state, BUILDINGS, RESEARCH, SHIPS, DEFENSES]);

  // KPIs y Métricas de Inteligencia para la cabecera
  const kpiMetrics = useMemo(() => {
    const rawCost = isBuilding ? buildingCost(id, 1, 0)
      : isResearch ? researchCost(id, 1, 0, 0)
      : isShip ? shipCost(id, 1, 0)
      : isDefense ? defenseCost(id, 1, 0)
      : { metal: 0, crystal: 0, deuterium: 0 };

    const discCost = isBuilding ? buildingCost(id, 1, constructionCenterLvl)
      : isResearch ? researchCost(id, 1, aiStratLvl, constructionCenterLvl)
      : isShip ? shipCost(id, 1, constructionCenterLvl)
      : isDefense ? defenseCost(id, 1, constructionCenterLvl)
      : { metal: 0, crystal: 0, deuterium: 0 };

    const discountPerc = rawCost.metal > 0 ? Math.round((1 - (discCost.metal / rawCost.metal)) * 100) : 0;

    return [
      { label: 'Categoría Operativa', value: itemType, icon: '🏷️', color: 'text-cyan-300' },
      { label: 'Estado en este Mundo', value: isShip || isDefense ? `${fmt(currentLvl)} unidades` : `Nivel ${currentLvl}`, icon: '📍', color: 'text-emerald-400' },
      { label: 'Descuento Infraestructura', value: `${discountPerc}% Aplicado`, icon: '📉', color: 'text-amber-300' },
      { label: 'Factor Progresión Coste', value: isBuilding ? `x${BUILDINGS[id]?.factor || 1.8}` : isResearch ? `x${RESEARCH[id]?.factor || 2.0}` : 'Lineal unitario', icon: '📈', color: 'text-blue-300' },
      { label: 'Impacto Energético Base', value: isBuilding ? (BUILDINGS[id]?.energyGen ? `+${BUILDINGS[id].energyGen} ⚡` : `${BUILDINGS[id]?.energy || 0} ⚡`) : 'Neutro', icon: '⚡', color: 'text-yellow-400' },
      { label: 'Tiempo Base de Ensamblaje', value: fmtTime(progressionRows[0]?.effectiveTime ? 60 : 30), icon: '⏱️', color: 'text-slate-200' },
      { label: 'Mitigación de Riesgos', value: 'Blindaje Magnético Nivel 4', icon: '🛡️', color: 'text-purple-300' },
      { label: 'Índice de Amortización (ROI)', value: isBuilding ? '14.2 Horas promedio' : isShip ? 'Inmediato en combate' : 'Estructural Permanente', icon: '💎', color: 'text-emerald-300' },
      { label: 'Sinergia Ministerial', value: 'Ministerio de Industria y Minas', icon: '🏛️', color: 'text-amber-400' },
      { label: 'Emisiones Residuales', value: id === 'slagRecycler' ? '-150.000 ton/h (Ultra-Purga)' : '0.04% polución controlada', icon: '🪨', color: 'text-orange-400' },
      { label: 'Cuotas de Mano de Obra', value: 'Operación 95% Automatizada', icon: '🤖', color: 'text-teal-300' },
      { label: 'Resiliencia ante Incursión', value: 'Clase Militar reforzada A-1', icon: '🚀', color: 'text-rose-400' }
    ];
  }, [id, isBuilding, isResearch, isShip, isDefense, itemType, currentLvl, constructionCenterLvl, aiStratLvl, progressionRows, BUILDINGS, RESEARCH]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#070b18] border border-cyan-500/30 rounded-3xl w-full max-w-[1230px] 2xl:max-w-[1300px] overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* CABECERA PRINCIPAL CON BANNER Y DATOS */}
        <div className="relative h-44 sm:h-52 bg-[#030611] flex items-center justify-between overflow-hidden border-b border-cyan-500/20 shrink-0">
          <CardBanner id={id} className="w-full h-full object-cover scale-105 opacity-40 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b18] via-[#070b18]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(0,255,255,0.03),rgba(0,0,0,0.01),rgba(0,255,255,0.03))] bg-[size:100%_4px,3px_100%] pointer-events-none" />

          {/* Información Táctica de Cabecera */}
          <div className="absolute bottom-4 left-6 sm:left-8 z-20 flex items-end gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/80 border-2 border-cyan-400/60 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md">
              {itemIcon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {itemType}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: <span className="text-white font-bold">{id}</span>
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase italic tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] mt-0.5">
                {data.name}
              </h2>
            </div>
          </div>

          {/* Botón de Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-6 w-11 h-11 rounded-2xl bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-rose-600/30 hover:border-rose-400 transition-all z-30 group cursor-pointer shadow-lg"
            title="Cerrar Ficha Técnica"
          >
            <span className="text-lg font-bold group-hover:scale-125 transition-transform text-white">✕</span>
          </button>
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#091024] border-b border-white/10 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('excel')}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>📊</span>
              <span>Matriz Analítica Excel (10 Rangos)</span>
            </button>
            <button
              onClick={() => setActiveTab('lore')}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lore'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>📜</span>
              <span>Archivos Históricos y Lore</span>
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'operations'
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>⚙️</span>
              <span>Protocolo y Especificaciones</span>
            </button>
          </div>

          <span className="text-[11px] text-cyan-400 font-bold hidden md:inline">
            Terminal Analítica Integral Imperial v4.0.2
          </span>
        </div>

        {/* CONTENIDO CENTRAL */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_50%)]">
          {activeTab === 'excel' && (
            <CodexExcelTab
              kpiMetrics={kpiMetrics}
              progressionRows={progressionRows}
              isBuilding={isBuilding}
              isResearch={isResearch}
              currentLvl={currentLvl}
            />
          )}

          {activeTab === 'lore' && (
            <CodexLoreTab data={data} />
          )}

          {activeTab === 'operations' && (
            <CodexOperationsTab data={data} />
          )}
        </div>

        {/* PIE DE PÁGINA */}
        <div className="bg-[#050814] p-4 border-t border-white/10 flex justify-between items-center px-8 shrink-0">
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">
              BASE DE INTELIGENCIA DE ASCENSIÓN · PROTOCOLO OMEGA
            </span>
            <span className="text-[9px] text-slate-500">
              Datos verificados en tiempo real · Archivos militares desclasificados
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 bg-cyan-600 hover:bg-cyan-500 text-black rounded-xl text-xs font-mono font-black uppercase transition-all tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
});
