import React from 'react';
import { SafeImg } from '../../assets.jsx';

export const MinistryCard = ({
  id,
  meta,
  mState,
  currentPlanet,
  onEnterMinistry,
  setLockedMinistryModal
}) => {
  const hasMinister = !!mState?.minister;
  const isAuto = hasMinister && (mState?.automationEnabled || mState?.autoManage);

  const ministryReqs = {
    science: { id: 'researchLab', name: 'Laboratorio de Investigación', location: 'Infraestructuras', locationId: 'infra' },
    war: { id: 'shipyard', name: 'Astillero Orbital', location: 'Infraestructuras', locationId: 'infra' },
    cybernetics: { id: 'researchLab', name: 'Laboratorio de Investigación', location: 'Infraestructuras', locationId: 'infra' },
    innovation: { id: 'naniteFactory', name: 'Fábrica de Nanitas', location: 'Infraestructuras', locationId: 'infra' },
    industry: { id: 'robotFactory', name: 'Fábrica de Robots', location: 'Infraestructuras', locationId: 'infra' },
    transport: { id: 'spacePort', name: 'Puerto Espacial', location: 'Logística', locationId: 'logistics' },
  };

  const req = ministryReqs[id];
  const pBuildings = currentPlanet?.buildings || {};
  const isUnlocked = !req || ((pBuildings[req.id] || 0) >= 1);

  let badgeText = 'VACANTE';
  let badgeClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

  if (!isUnlocked) {
    badgeText = '🔒 BLOQUEADO';
    badgeClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]';
  } else if (hasMinister) {
    if (isAuto) {
      badgeText = 'AUTÓNOMO';
      badgeClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse';
    } else {
      badgeText = 'ASIGNADO';
      badgeClasses = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  }

  const handleClick = () => {
    if (!isUnlocked) {
      if (window.playSfx) window.playSfx('warn');
      setLockedMinistryModal({
        ministryId: id,
        ministryName: meta.name,
        reqName: req.name,
        location: req.location,
        locationId: req.locationId
      });
      return;
    }
    onEnterMinistry(id);
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full ${
        !isUnlocked
          ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714]'
          : isAuto
            ? 'border-emerald-500/50 bg-[#06121a]/80 hover:border-emerald-400 hover:bg-[#0a1e2b] shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : hasMinister
              ? 'border-cyan-500/40 bg-[#060e1e]/80 hover:border-cyan-400 hover:bg-[#0a1730]'
              : 'border-slate-800 bg-[#060a14]/60 hover:border-slate-600 hover:bg-[#0a1020]'
      }`}
      title={!isUnlocked ? `Requiere construir: ${req.name} (${req.location})` : undefined}
    >
      <div className="relative w-full h-24 md:h-28 overflow-hidden bg-[#05070f] border-b border-white/10">
        <SafeImg
          id={meta.assetId || 'sectorGovPalace'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />

        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]">🔒</span>
          </div>
        )}

        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border backdrop-blur-sm flex items-center gap-1.5 ${badgeClasses}`}>
          {isAuto && isUnlocked && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
          )}
          {badgeText}
        </span>
      </div>

      <div className="p-2.5 md:p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-1">
            <h4 className={`text-xs md:text-sm font-bold uppercase tracking-wide truncate ${isUnlocked ? 'text-white group-hover:text-cyan-300' : 'text-slate-400'}`}>
              {meta.name.replace(/^Ministerio\s+(de\s+)?/i, '')}
            </h4>
          </div>

          {isUnlocked ? (
            <p className="text-[10px] md:text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-2 leading-tight">
              {meta.desc}
            </p>
          ) : (
            <div className="mt-1.5 p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[10px] font-mono leading-tight text-rose-300">
              <span className="font-bold block text-rose-400 flex items-center gap-1 mb-0.5">
                <span>⚠️</span> Requiere Sede:
              </span>
              <span>Construir <strong>{req.name}</strong> en {req.location}.</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
