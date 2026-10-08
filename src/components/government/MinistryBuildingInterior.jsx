import React from 'react';
import { playVoice } from '../../audio.js';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { BUILDINGS } from '../../core.jsx';
import { SafeImg } from '../../assets.jsx';

export const CandidateCardsView = ({
  candidates = [],
  minister,
  handleAppoint
}) => (
  <div className="w-full space-y-4">
    {/* 4 Tarjetas una al lado de la otra, seguidas en línea, más altas con imagen cuadrada */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-stretch">
      {candidates.slice(0, 4).map((cand) => {
        const isCurrent = minister?.name === cand.name;
        return (
          <div
            key={cand.name}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left w-full ${
              isCurrent
                ? 'border-emerald-500/50 bg-[#051c14]/90 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                : 'border-white/10 hover:border-cyan-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]'
            }`}
          >
            {/* Imagen del candidato al 100% en proporción 1:1 (cuadrada) */}
            <div className="relative w-full aspect-square overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={cand.avatarId || "councilChamber"}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                fallback={<span className="text-4xl flex items-center justify-center h-full">{cand.icon}</span>}
              />
            </div>

            {/* Datos del candidato debajo de la imagen */}
            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                {/* Fila del nombre con Voz y Estado alineados a la derecha del todo */}
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-wide truncate group-hover:text-cyan-300 transition-colors">
                    {cand.name}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0 -translate-y-1">
                    {/* Escuchar voz */}
                    {cand.voiceId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoice(cand.voiceId);
                        }}
                        className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-black/80 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="Escuchar declaración del candidato"
                      >
                        <span>🔊</span>
                        <span>Voz</span>
                      </button>
                    )}

                    {/* Badge de estado: En el cargo / Candidato */}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                        : 'bg-black/80 text-slate-400 border-white/20'
                    }`}>
                      <span>{isCurrent ? '✓ En el cargo' : 'Candidato'}</span>
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider truncate mt-0.5">
                  {cand.trait}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 mt-1 font-semibold line-clamp-2 leading-tight">
                  {cand.effect}
                </p>
              </div>

              {/* Botón inmediatamente al final de la descripción sin espacios sobrantes */}
              <div className="pt-2.5">
                {isCurrent ? (
                  <div className="w-full py-2 text-center rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[11px] uppercase">
                    Ministro en Funciones
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleAppoint(cand);
                      if (window.playSfx) window.playSfx('click');
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95"
                  >
                    Investir Ministro
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  </div>
);

export const MinistryBuildingInterior = ({
  ministryId,
  meta,
  minState,
  minUpgrades,
  onOpenDesk,
  onOpenCandidates,
  candidates = [],
  onAppointMinister,
  onBack,
  dispatch,
  currentPlanet,
  fmt
}) => {
  const minister = minState.minister;
  const [showCandidates, setShowCandidates] = React.useState(false);
  const [pendingCandidate, setPendingCandidate] = React.useState(null);

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

  const handleSpeak = (cand) => {
    if (cand?.voiceId) {
      playVoice(cand.voiceId);
    } else if (minister?.voiceId) {
      playVoice(minister.voiceId);
    } else {
      playVoice('minister_economy_aritz');
    }
  };

  const handleAppoint = (cand) => {
    if (onAppointMinister) {
      onAppointMinister(cand);
    } else if (dispatch) {
      dispatch({ type: 'APPOINT_MINISTER', ministryId, minister: cand, planetId: currentPlanet?.id });
      if (cand?.voiceId) playVoice(cand.voiceId);
    }
  };

  if (showCandidates) {
    return (
      <CandidateCardsView
        candidates={candidates}
        minister={minister}
        handleAppoint={handleAppoint}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Main Action Chambers: Instalaciones, Investigaciones, Programas, Decretos e Investidura en 3x2 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full items-stretch">
        {/* Door 0: Gabinete Ministerial / Investidura */}
        <button 
          onClick={() => {
            if (minister?.voiceId) {
              playVoice(minister.voiceId);
            }
            onOpenDesk('candidates');
          }}
          className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-[355px] md:h-[365px] hover:scale-[1.01] active:scale-[0.98] cursor-pointer ${
            minState?.isAuto
              ? 'border-emerald-500/30 hover:border-emerald-400 bg-[#051c14]/85 hover:bg-[#072a1e] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]'
              : minister
                ? 'border-amber-500/30 hover:border-amber-400 bg-[#181105]/85 hover:bg-[#281c08] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]'
                : 'border-rose-500/30 hover:border-rose-400 bg-[#1c080b]/85 hover:bg-[#2c0d12] hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]'
          }`}
        >
          <div className="relative w-full flex-1 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg
              id="councilChamber"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
          </div>

          <div className="p-3 md:p-3.5 flex flex-col justify-start shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className={`text-base md:text-lg font-bold uppercase tracking-wide transition-colors truncate ${
                minState?.isAuto ? 'text-white group-hover:text-emerald-300' : minister ? 'text-white group-hover:text-amber-300' : 'text-white group-hover:text-rose-300'
              }`}>
                Gabinete Ministerial
              </h4>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!minister || !dispatch || !currentPlanet) return;
                  dispatch({
                    type: 'TOGGLE_MINISTRY_AUTOMATION',
                    planetId: currentPlanet.id,
                    ministryId
                  });
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`shrink-0 -translate-y-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-sm border flex items-center gap-1.5 transition-all ${
                  !minister
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 cursor-default'
                    : minState?.isAuto
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 hover:bg-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-pointer'
                      : 'bg-black/80 text-amber-300 border-amber-500/50 hover:border-cyan-400 hover:text-cyan-200 cursor-pointer'
                }`}
                title={!minister ? "Cartera vacante" : minState?.isAuto ? "Ministro Autónomo (ON). Clic para cambiar a Manual" : "Ministro Manual (OFF). Clic para activar Autónomo"}
              >
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  {minState?.isAuto && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                    minState?.isAuto ? 'bg-emerald-400' : minister ? 'bg-amber-400' : 'bg-rose-500'
                  }`}></span>
                </span>
                <span>{minState?.isAuto ? 'Autónomo' : minister ? 'Manual' : 'Vacante'}</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-mono mt-1 line-clamp-2 leading-snug">
              Investidura, evaluación de candidatos y relevo de la cartera ministerial.
            </p>
          </div>
        </button>
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
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-[355px] md:h-[365px] ${
              isRequirementBlocked 
                ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed' 
                : 'border-white/10 hover:border-emerald-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] active:scale-[0.98] cursor-pointer'
            }`}
          >
            <div className="relative w-full flex-1 overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={isRequirementBlocked ? 'vault' : 'constructionCenter'}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isRequirementBlocked ? 'opacity-40 filter grayscale' : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'
                }`}
              />
              {isRequirementBlocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                </div>
              )}
              {isRequirementBlocked && (
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>BLOQUEADO</span>
                </span>
              )}
            </div>

            <div className="p-3 md:p-3.5 flex flex-col justify-start shrink-0">
              <h4 className={`text-base md:text-lg font-bold uppercase tracking-wide truncate ${
                isRequirementBlocked ? 'text-slate-400' : 'text-white group-hover:text-emerald-300 transition-colors'
              }`}>
                Instalaciones
              </h4>
              {isRequirementBlocked ? (
                <div className="mt-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs font-mono leading-tight text-rose-300 flex items-center gap-1.5 truncate">
                  <span className="text-rose-400 shrink-0">⚠️</span>
                  <span className="truncate">Requisito: <strong className="text-rose-200">{requiredParentName}</strong></span>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-slate-400 font-mono mt-1 line-clamp-2 leading-snug">
                  Accede a las instalaciones bajo jurisdicción directa de este departamento.
                </p>
              )}
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
            className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-[355px] md:h-[365px] ${
              isResearchBlocked
                ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                : 'border-white/10 hover:border-cyan-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer'
            }`}
          >
            <div className="relative w-full flex-1 overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={isResearchBlocked ? 'vault' : 'expLab'}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isResearchBlocked ? 'opacity-40 filter grayscale' : 'opacity-85 group-hover:opacity-100 group-hover:scale-105'
                }`}
              />
              {isResearchBlocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                  <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                </div>
              )}
              {isResearchBlocked && (
                <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider backdrop-blur-md shadow-[0_0_10px_rgba(244,63,94,0.3)] bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>BLOQUEADO</span>
                </span>
              )}
            </div>

            <div className="p-3 md:p-3.5 flex flex-col justify-start shrink-0">
              <h4 className={`text-base md:text-lg font-bold uppercase tracking-wide truncate ${
                isResearchBlocked ? 'text-slate-400' : 'text-white group-hover:text-cyan-300 transition-colors'
              }`}>
                Investigaciones
              </h4>
              {isResearchBlocked ? (
                <div className="mt-1 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs font-mono leading-tight text-rose-300 flex items-center gap-1.5 truncate">
                  <span className="text-rose-400 shrink-0">⚠️</span>
                  <span className="truncate">Requisito: <strong className="text-rose-200">Laboratorio de investigación nivel 1</strong></span>
                </div>
              ) : (
                <p className="text-xs md:text-sm text-slate-400 font-mono mt-1 line-clamp-2 leading-snug">
                  Desarrolla tecnologías y patentes exclusivas adscritas a este departamento.
                </p>
              )}
            </div>
          </button>
        )}

        {/* Door 3: Despacho de Programas */}
        <button 
          onClick={() => onOpenDesk('programs')}
          className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-[355px] md:h-[365px] border-white/10 hover:border-amber-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full flex-1 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg
              id="financeMinistry"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
          </div>

          <div className="p-3 md:p-3.5 flex flex-col justify-start shrink-0">
            <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-amber-300 transition-colors truncate">
              Despacho de Programas
            </h4>
            <p className="text-xs md:text-sm text-slate-400 font-mono mt-1 line-clamp-2 leading-snug">
              Supervisa y financia los programas estratégicos de desarrollo ministerial.
            </p>
          </div>
        </button>

        {/* Door 4: Gabinete de Decretos */}
        <button 
          onClick={() => onOpenDesk('directives')}
          className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-[355px] md:h-[365px] border-white/10 hover:border-purple-400 bg-[#090d1f]/90 hover:bg-[#0e1633] hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:scale-[0.98] cursor-pointer"
        >
          <div className="relative w-full flex-1 overflow-hidden bg-[#05070f] border-b border-white/10">
            <SafeImg
              id="councilChamber"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
          </div>

          <div className="p-3 md:p-3.5 flex flex-col justify-start shrink-0">
            <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors truncate">
              Gabinete de Decretos
            </h4>
            <p className="text-xs md:text-sm text-slate-400 font-mono mt-1 line-clamp-2 leading-snug">
              Activa o deroga directivas imperiales vinculantes mediante el uso de tu influencia.
            </p>
          </div>
        </button>
      </section>
    </div>
  );
};
