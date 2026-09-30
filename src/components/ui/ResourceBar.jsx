import React from 'react';
import { fmt, calcPlanetMaxPop } from '../../core.jsx';

/**
 * ResourceBadge — Celda táctica de recurso estilo HUD espacial militar.
 */
export const ResourceBadge = React.memo(({ icon, label, value, rate, color = 'cyan', onClick, size = 'md' }) => {
  const iconMap = {
    metal: { sym: '⛏️', textCol: 'text-amber-400', border: 'border-amber-500/25', bg: 'from-amber-950/20' },
    crystal: { sym: '💎', textCol: 'text-cyan-400', border: 'border-cyan-500/25', bg: 'from-cyan-950/20' },
    deuterium: { sym: '⚗️', textCol: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'from-emerald-950/20' },
    energy: { sym: '⚡', textCol: 'text-yellow-400', border: 'border-yellow-500/25', bg: 'from-yellow-950/20' },
    slag: { sym: '🪨', textCol: 'text-orange-400', border: 'border-orange-500/25', bg: 'from-orange-950/20' },
    reputation: { sym: '🎖️', textCol: 'text-purple-400', border: 'border-purple-500/25', bg: 'from-purple-950/20' },
    population: { sym: '👥', textCol: 'text-teal-400', border: 'border-teal-500/25', bg: 'from-teal-950/20' },
  };

  const theme = iconMap[icon] || { sym: '📦', textCol: 'text-slate-300', border: 'border-white/10', bg: 'from-slate-900/20' };
  const isLarge = size === 'large';

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`${
        isLarge
          ? 'h-16 md:h-20 px-4 md:px-5 rounded-2xl gap-3 flex-1 min-w-[130px] md:min-w-[150px]'
          : 'h-11 px-3 rounded-xl gap-2 shrink-0'
      } bg-gradient-to-b ${theme.bg} to-[#060a16]/90 border ${theme.border} flex items-center select-none shadow-sm relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:scale-105 hover:border-cyan-400/60 transition-transform active:scale-95' : ''
      }`}
    >
      {/* Top accent light */}
      <div className="absolute top-0 left-2 right-2 h-[1px] bg-white/10" />

      <span className={`${isLarge ? 'text-2xl md:text-3xl' : 'text-base'} shrink-0 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`}>{theme.sym}</span>
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className={`${isLarge ? 'text-sm md:text-lg font-black tracking-tight' : 'text-[11px] font-black tracking-tight'} font-mono ${theme.textCol}`}>
            {typeof value === 'string' ? value : fmt(value)}
          </span>
          {rate !== undefined && (
            <span className={`${isLarge ? 'text-[10px] md:text-xs font-bold' : 'text-[9px] font-semibold'} font-mono text-emerald-400/90`}>
              +{fmt(rate)}/h
            </span>
          )}
        </div>
        <span className={`${isLarge ? 'text-[9px] md:text-[10px]' : 'text-[8px]'} font-mono uppercase tracking-widest text-slate-400 mt-1 font-bold`}>
          {label}
        </span>
      </div>
    </div>
  );
});

export const ResourceBar = React.memo(({ planet, research, reputation, taxRate = 0, calcProduction, calcStorage, getGalacticAlignment, GAME_SPEED }) => {
  if (!planet || !planet.resources) return <div className="text-[10px] text-slate-500 font-mono">Inicializando telemetría...</div>;
  let prod;
  try {
    prod = calcProduction(
      planet.buildings || {}, research || {}, planet.temperature || 20, GAME_SPEED,
      planet.faction || 'human', planet.biome, planet.gravity, planet.trait,
      planet.specialization, { galaxy: planet.galaxy, system: planet.system, position: planet.position }, taxRate
    );
  } catch (e) {
    prod = { metal: 0, crystal: 0, deuterium: 0, energyProd: 0, energyCons: 0, energyBalance: 0, ratio: 1 };
  }
  const energyPrefix = (prod.energyBalance || 0) >= 0 ? '+' : '';
  const displayRep = Math.round(reputation || 0);
  const repPrefix = displayRep > 0 ? '+' : '';

  const pop = planet.population || 1000;
  const popMetal = Math.round(pop * 0.00002 * 3600);
  const popCrystal = Math.round(pop * 0.00001 * 3600);
  const popDeut = Math.round(pop * 0.000005 * 3600);

  const netMetal = Math.max(0, prod.metal - popMetal);
  const netCrystal = Math.max(0, prod.crystal - popCrystal);
  const netDeut = Math.max(0, prod.deuterium - popDeut);

  const maxPop = calcPlanetMaxPop(planet);
  const netSlag = prod.slagNet !== undefined ? prod.slagNet : (prod.slag || 0);

  return (
    <div className="h-full flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
      <ResourceBadge icon="metal" label="Metal" value={planet.resources.metal || 0} rate={netMetal} />
      <ResourceBadge icon="crystal" label="Cristal" value={planet.resources.crystal || 0} rate={netCrystal} />
      <ResourceBadge icon="deuterium" label="Deuterio" value={planet.resources.deuterium || 0} rate={netDeut} />
      <ResourceBadge icon="energy" label="Energía" value={`${energyPrefix}${fmt(prod.energyBalance)}`} />
      <ResourceBadge icon="slag" label="Escoria" value={planet.resources.slag || 0} rate={netSlag} />
      <ResourceBadge icon="population" label="Censo" value={`${fmt(pop)}/${fmt(maxPop)}`} />
      <ResourceBadge icon="reputation" label="Reputación" value={`${repPrefix}${displayRep}`} />
    </div>
  );
});
