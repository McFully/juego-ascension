import React from 'react';
import { playVoice } from '../../audio.js';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { BUILDINGS } from '../../core.jsx';
import { SafeImg } from '../../assets.jsx';

export const MinistryBuildingInterior = ({
  ministryId,
  meta,
  minState,
  minUpgrades,
  onOpenDesk,
  onOpenCandidates,
  onBack,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const minister = minState.minister;

  const mapping = MINISTRY_MAPPING[ministryId] || {};
  const hasBuildings = (mapping.buildings || []).length > 0;
  const hasResearch = (mapping.research || []).length > 0;

  // Comprobar si el ministerio requiere una edificación madre previa (ej. researchLab, shipyard) construida en Infraestructuras
  const requiredParentId = mapping.parentRequiredBuilding;
  const requiredParentLvl = requiredParentId ? (currentPlanet?.buildings?.[requiredParentId] || 0) : 1;
  const isRequirementBlocked = requiredParentId ? (requiredParentLvl < 1) : false;
  const requiredParentName = requiredParentId ? (BUILDINGS[requiredParentId]?.name || requiredParentId) : '';

  // Para investigaciones en los ministerios: bloqueado hasta construir Laboratorio de Investigación (salvo que ya esté en nivel >= 1)
  const labLevel = currentPlanet?.buildings?.researchLab || 0;
  const isResearchBlocked = labLevel < 1;

  const handleSpeak = () => {
    if (minister?.voiceId) {
      playVoice(minister.voiceId);
    } else {
      playVoice('minister_economy_aritz');
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Action Chambers: Instalaciones, Investigaciones, Programas, Decretos y Retorno a Ministerios */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-stretch">
        {/* Door 1: Instalaciones (Edificaciones de Construcción) */}
        {hasBuildings && (
          <button 
            onClick={() => {
              if (isRequirementBlocked) {
                if (window.playSfx) window.playSfx('denied');
                return;
              }
              onOpenDesk('buildings');
            }}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full ${
              isRequirementBlocked 
                ? 'border-amber-500/30 bg-amber-950/20 cursor-not-allowed opacity-80' 
                : 'border-white/10 hover:border-emerald-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] active:scale-[0.98] cursor-pointer'
            }`}
          >
            <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={isRequirementBlocked ? 'vault' : 'constructionCenter'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
              />
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border backdrop-blur-sm ${
                isRequirementBlocked 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              }`}>
                {isRequirementBlocked ? 'BLOQUEADO' : 'OBRAS'}
              </span>
            </div>

            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors truncate">
                  Instalaciones
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  {isRequirementBlocked 
                    ? `Requiere construir ${requiredParentName} en el Ministerio de Infraestructuras para operar.`
                    : 'Accede a las instalaciones bajo jurisdicción directa de este departamento.'}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Door 2: Investigaciones del Ministerio (si cuenta con ramas tecnológicas) */}
        {hasResearch && (
          <button 
            onClick={() => {
              if (isResearchBlocked) {
                if (window.playSfx) window.playSfx('denied');
                return;
              }
              onOpenDesk('research');
            }}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full ${
              isResearchBlocked
                ? 'border-amber-500/30 bg-amber-950/20 cursor-not-allowed opacity-80'
                : 'border-white/10 hover:border-cyan-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer'
            }`}
          >
            <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={isResearchBlocked ? 'vault' : 'expLab'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
              />
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border backdrop-blur-sm ${
                isResearchBlocked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
              }`}>
                {isResearchBlocked ? 'BLOQUEADO' : 'CIENCIA'}
              </span>
            </div>

            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Investigaciones
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  {isResearchBlocked
                    ? 'Bloqueado: Requiere construir el Laboratorio de Investigación en el Ministerio de Infraestructuras.'
                    : 'Desarrolla tecnologías y patentes exclusivas adscritas a este departamento.'}
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Door 3: Despacho de Programas */}
        <button 
          onClick={() => onOpenDesk('programs')}
          className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full border-white/10 hover:border-amber-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg
              id="financeMinistry"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
              DESPACHO
            </span>
          </div>

          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors truncate">
                Despacho de Programas
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                Supervisa y financia los programas estratégicos de desarrollo ministerial.
              </p>
            </div>
          </div>
        </button>

        {/* Door 4: Gabinete de Decretos */}
        <button 
          onClick={() => onOpenDesk('directives')}
          className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full border-white/10 hover:border-purple-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg
              id="councilChamber"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm">
              GABINETE
            </span>
          </div>

          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors truncate">
                Gabinete de Decretos
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                Activa o deroga directivas imperiales vinculantes mediante el uso de tu influencia.
              </p>
            </div>
          </div>
        </button>

        {/* Door 5: Volver a Ministerios */}
        <button 
          onClick={() => {
            if (window.playSfx) window.playSfx('click');
            if (onBack) onBack();
          }}
          className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full border-cyan-500/40 bg-[#061022]/80 hover:border-cyan-400 hover:bg-[#091836] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
            <SafeImg
              id="sectorGovPalace"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
            />
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border backdrop-blur-sm bg-cyan-950/80 text-cyan-300 border-cyan-500/50">
              RETORNO
            </span>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
              <span className="text-3xl text-cyan-300 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] transform group-hover:-translate-x-1 transition-transform">
                ◀
              </span>
            </div>
          </div>

          <div className="p-3 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-sm font-bold text-cyan-300 group-hover:text-white transition-colors uppercase tracking-wide truncate">
                Volver a Ministerios
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                Regresa a la avenida del Distrito Federal y catálogo general de ministerios.
              </p>
            </div>
          </div>
        </button>
      </section>
    </div>
  );
};
