import React from 'react';
import { SafeImg } from '../../assets.jsx';

export const MinistryCard = ({
  id,
  meta,
  mState,
  currentPlanet,
  onEnterMinistry,
  setLockedMinistryModal,
  dispatch
}) => {
  const hasMinister = !!mState?.minister;
  const isAuto = hasMinister && (mState?.automationEnabled || mState?.autoManage);

  const ministryReqs = {
    science: { id: 'researchLab', name: 'Laboratorio de investigación nivel 1', location: 'Infraestructuras', locationId: 'infra' },
    war: { id: 'shipyard', name: 'Astillero orbital nivel 1', location: 'Infraestructuras', locationId: 'infra' },
    cybernetics: { id: 'researchLab', name: 'Laboratorio de investigación nivel 1', location: 'Infraestructuras', locationId: 'infra' },
    innovation: { id: 'naniteFactory', name: 'Fábrica de nanobits nivel 1', location: 'Infraestructuras', locationId: 'infra' },
    industry: { id: 'robotFactory', name: 'Fábrica de robots nivel 1', location: 'Infraestructuras', locationId: 'infra' },
    transport: { id: 'spacePort', name: 'Puerto espacial nivel 1', location: 'Logística', locationId: 'logistics' },
  };

  const req = ministryReqs[id];
  const pBuildings = currentPlanet?.buildings || {};
  const isUnlocked = !req || ((pBuildings[req.id] || 0) >= 1);

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

  const handleToggleMinisterAuto = (e) => {
    e.stopPropagation();
    if (!hasMinister || !dispatch || !currentPlanet) return;
    dispatch({
      type: 'TOGGLE_MINISTRY_AUTOMATION',
      planetId: currentPlanet.id,
      ministryId: id
    });
    if (window.playSfx) window.playSfx('click');
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
          className={`w-full h-full object-cover transition-transform duration-500 ${
            !isUnlocked ? 'opacity-40 filter grayscale' : 'opacity-90 group-hover:opacity-100 group-hover:scale-105'
          }`}
        />

        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
          </div>
        )}

        {!isUnlocked && (
          <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
            <span>🔒</span>
            <span>BLOQUEADO</span>
          </span>
        )}
      </div>

      <div className="p-2.5 md:p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <h4 className={`text-xs md:text-sm font-bold uppercase tracking-wide truncate ${isUnlocked ? 'text-white group-hover:text-cyan-300' : 'text-slate-400'}`}>
              {meta.name.replace(/^Ministerio\s+(de\s+)?/i, '')}
            </h4>

            {isUnlocked && (
              hasMinister ? (
                <div
                  onClick={handleToggleMinisterAuto}
                  className={`shrink-0 -translate-y-1 py-0.5 px-1.5 rounded-full font-mono text-[8.5px] font-bold uppercase tracking-wider border backdrop-blur-md transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 ${
                    isAuto
                      ? 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 hover:bg-emerald-900 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                      : 'bg-black/80 border-amber-500/50 text-amber-300 hover:border-cyan-400 hover:text-cyan-200'
                  }`}
                  title={isAuto ? "Ministro Autónomo (ON). Clic para cambiar a Manual" : "Ministro Manual (OFF). Clic para activar Autónomo"}
                >
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    {isAuto && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isAuto ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  </span>
                  <span>{isAuto ? 'Autónomo' : 'Manual'}</span>
                </div>
              ) : (
                <span className="shrink-0 -translate-y-1 px-1.5 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vacante
                </span>
              )
            )}
          </div>

          {isUnlocked ? (
            <p className="text-[10px] md:text-[11px] text-slate-400 font-mono mt-1.5 line-clamp-2 leading-tight">
              {meta.desc}
            </p>
          ) : (
            <div className="mt-1 px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[10px] md:text-[11px] font-mono leading-tight text-rose-300 flex items-center gap-1.5 truncate">
              <span className="text-rose-400 shrink-0">⚠️</span>
              <span className="truncate">Requisito: <strong className="text-rose-200">{req?.name}</strong></span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
