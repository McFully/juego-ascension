import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { playVoice } from '../../audio.js';
import { GovernmentResourceBar } from './GovernmentResourceBar.jsx';
import { IndependentReturnCard } from '../navigation/IndependentReturnCard.jsx';

export const GovernmentBreadcrumbs = ({
  currentLevel,
  ministryId,
  subview,
  onNavigate,
  onBackToEmpire,
  ministryMeta,
  currentPlanet,
  production,
  state,
  fmt,
  minState,
  planetId,
  dispatch
}) => {
  const [warningMsg, setWarningMsg] = useState('');
  const meta = ministryMeta?.[ministryId];
  const ministryDisplayName = meta 
    ? meta.name.replace(/^Ministerio\s+(de\s+|del\s+)?/i, '').replace(/^de\s+/i, '')
    : '';
  const isAuto = Boolean(minState?.automationEnabled);

  const handleBack = () => {
    if (window.playSfx) window.playSfx('click');
    if (currentLevel >= 3) {
      onNavigate(2, ministryId, 'overview');
    } else if (currentLevel === 2) {
      onNavigate(1);
    } else if (currentLevel === 1) {
      onNavigate(0);
    } else if (onBackToEmpire) {
      onBackToEmpire();
    }
  };

  const backLabelBottom = currentLevel >= 3 
    ? 'Ministerio' 
    : currentLevel === 2 
      ? 'Ministerios' 
      : 'Alto Mando';

  const backIcon = currentLevel >= 3 
    ? (meta?.icon || '🏛️') 
    : currentLevel === 2 
      ? '🏛️' 
      : '👑';

  const backImgId = currentLevel >= 3 
    ? meta?.assetId || 'sectorGovPalace' 
    : currentLevel === 2 
      ? 'sectorGovPalace' 
      : 'historicImperialArchive';

  return (
    <div className="relative z-30 flex flex-col xl:flex-row items-stretch gap-3 mb-4 w-full">
      {/* === DOM SUPERIOR: 2 FILAS CON SEPARADOR HORIZONTAL Y ANCHO COMPLETO === */}
      <nav className="flex-1 min-w-0 bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl flex flex-col justify-between">
        {/* FILA SUPERIOR: Recursos Tácticos Ancho Completo */}
        <div className="w-full overflow-x-auto">
          <GovernmentResourceBar
            currentPlanet={currentPlanet}
            production={production}
            state={state}
            fmt={fmt}
          />
        </div>

        {/* Separador Horizontal */}
        <div className="w-full h-[1px] bg-white/10" />

        {/* FILA INFERIOR: Explorador de navegación + Ministro activo */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/20 rounded-b-2xl flex-wrap min-h-[44px]">
          <div className="flex items-center gap-2 flex-wrap">
            {onBackToEmpire && (
              <>
                <button
                  type="button"
                  onClick={onBackToEmpire}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                  title="Volver a la superficie del Imperio"
                >
                  <span className="text-base">⚜️</span>
                  <span>Imperio</span>
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>

                {/* Botón directo a Mundos del Imperio */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    try {
                      if (typeof window !== "undefined") {
                        window.sessionStorage.setItem("ascension_target_section", "planets");
                      }
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets' } }));
                    } catch (_) {}
                    onBackToEmpire();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 font-bold text-xs transition-all cursor-pointer"
                  title="Volver a Mundos del Imperio"
                >
                  <span className="text-sm">🌍</span>
                  <span>Mundos del Imperio</span>
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>

                {/* Etiqueta del Planeta interactiva */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    const planetName = currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || '';
                    try {
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets', filter: planetName } }));
                    } catch (_) {}
                    onBackToEmpire();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer"
                  title="Ver este mundo en el Catálogo de Mundos del Imperio"
                >
                  <span className="text-sm">🪐</span>
                  <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
                  {currentPlanet?.galaxy !== undefined && (
                    <span className="text-cyan-400 font-mono text-[11px] font-black">
                      [{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}]
                    </span>
                  )}
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>
              </>
            )}

            {/* Nivel 0: Alto Mando */}
            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                onNavigate(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                currentLevel === 0 ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>👑</span>
              <span>Alto Mando</span>
            </button>

            {currentLevel >= 1 && (
              <>
                <span className="text-slate-600 font-bold text-sm">/</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    onNavigate(1);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    currentLevel === 1 ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏛️</span>
                  <span>Ministerios</span>
                </button>
              </>
            )}

            {currentLevel >= 2 && meta && (
              <>
                <span className="text-slate-600 font-bold text-sm">/</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    onNavigate(2, ministryId);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    currentLevel === 2 ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span className="truncate max-w-[120px]">{ministryDisplayName}</span>
                </button>
              </>
            )}

            {currentLevel >= 3 && subview && (
              <>
                <span className="text-slate-600 font-bold text-sm">/</span>
                <span className="text-cyan-400 font-bold px-2 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40">
                  {subview === 'actions' && '⚙️ Despacho'}
                  {subview === 'overview' && '📋 Sede'}
                  {subview === 'intel' && '🕵️ Dossier de Inteligencia'}
                  {subview === 'buildings' && '🏗️ Instalaciones'}
                  {subview === 'research' && '🔬 Investigaciones'}
                  {subview === 'programs' && '📊 Despacho de Programas'}
                  {subview === 'directives' && '📜 Gabinete de Decretos'}
                  {subview === 'candidates' && '🏛️ Gabinete Ministerial'}
                  {subview === 'espionage' && '🕵️ Dossier de Inteligencia'}
                </span>
              </>
            )}
          </div>

          {/* Lado derecho de fila inferior: Botón Interactivo de Ministro ON / OFF / Vacante */}
          {minState && (
            <button 
              type="button"
              disabled={!minState.minister}
              onClick={() => {
                const minister = minState?.minister;
                if (minister?.voiceId) {
                  playVoice(minister.voiceId);
                } else if (window.playSfx) {
                  window.playSfx('click');
                }
                if (dispatch && planetId && ministryId && minister) {
                  dispatch({
                    type: 'TOGGLE_MINISTRY_AUTOMATION',
                    planetId,
                    ministryId
                  });
                }
              }}
              className={`border rounded-xl px-3 py-1 flex items-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs h-8 ml-auto ${
                !minState.minister
                  ? 'bg-[#1c080b]/90 border-rose-500/50 text-rose-300 opacity-80 cursor-not-allowed'
                  : isAuto 
                    ? 'bg-[#051c14]/90 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer' 
                    : 'bg-[#181105]/90 border-amber-500/60 text-amber-300 hover:bg-amber-900/60 cursor-pointer'
              }`}
              title={
                !minState.minister 
                  ? "Cartera sin ministro asignado (Vacante)" 
                  : isAuto 
                    ? "Ministro Autónomo (ON). Clic para cambiar a Manual" 
                    : "Ministro Manual (OFF). Clic para activar Autónomo"
              }
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {isAuto && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAuto ? 'bg-emerald-400' : minState.minister ? 'bg-amber-400' : 'bg-rose-500'
                }`}></span>
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap">
                {isAuto ? '⚡ MINISTRO ON (AUTÓNOMO)' : minState.minister ? '👤 MINISTRO OFF (MANUAL)' : '⚠️ CARTERA VACANTE'}
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* === TARJETA INDEPENDIENTE Y SEPARADA DE VOLVER ATRÁS === */}
      <div className="shrink-0 w-full xl:w-52 flex items-stretch">
        <IndependentReturnCard
          onClick={handleBack}
          labelTop="VOLVER A"
          labelBottom={backLabelBottom}
          icon={backIcon}
          imgId={backImgId}
          accentColor="cyan"
        />
      </div>
    </div>
  );
};
