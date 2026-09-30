import React, { useState } from 'react';
import { SafeImg } from '../../assets.jsx';
import { playVoice } from '../../audio.js';
import { ResourceBreakdownTooltip } from '../ui/ResourceBreakdownTooltip.jsx';

import { GovernmentResourceBar } from './GovernmentResourceBar.jsx';

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
  minister,
  planetId,
  onOpenCandidates,
  dispatch
}) => {
  const [warningMsg, setWarningMsg] = useState('');
  const meta = ministryMeta?.[ministryId];
  const ministryDisplayName = meta 
    ? meta.name.replace(/^Ministerio\s+(de\s+|del\s+)?/i, '').replace(/^de\s+/i, '')
    : '';
  const isAuto = Boolean(minState?.automationEnabled);

  return (
    <nav className="relative z-30 flex flex-col xl:flex-row items-stretch justify-between bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono mb-4 shadow-2xl">
      {/* === SECTOR IZQUIERDO: DIVIDIDO EN 2 FILAS (ARRIBA RECURSOS, ABAJO EXPLORADOR) === */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* FILA SUPERIOR: Recursos (Metal, Cristal, Deuterio, Energía, Reputación) Submodularizada */}
        <GovernmentResourceBar
          currentPlanet={currentPlanet}
          production={production}
          state={state}
          fmt={fmt}
        />

        {/* FILA INFERIOR: Explorador de navegación e imperio / alto mando / ministerios */}
        <div className="flex items-center gap-2 px-4 py-2 flex-wrap bg-black/20">
          {onBackToEmpire && (
            <>
              <button
                onClick={onBackToEmpire}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                title="Volver a la superficie del Imperio"
              >
                <span className="text-base">⚜️</span>
                <span>Imperio</span>
              </button>
              <span className="text-slate-600 font-bold text-sm">/</span>

              {/* Etiqueta del Planeta Sede del Alto Mando */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-bold text-xs" title="Sede del Alto Mando">
                <span className="text-sm">🌍</span>
                <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
              </div>
              <span className="text-slate-600 font-bold text-sm">/</span>
            </>
          )}

          <button
            onClick={() => onNavigate(0)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
            title="Ir al Alto Mando"
          >
            <span className="text-base">👑</span>
            <span>Alto Mando</span>
          </button>
          <span className="text-slate-600 font-bold text-sm">/</span>

          <button
            onClick={() => onNavigate(1)}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-sm ${
              currentLevel === 1 
                ? 'text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-500/40' 
                : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold'
            }`}
            title="Ir a Ministerios"
          >
            <span className="text-base">🏛️</span>
            <span>Ministerios</span>
          </button>

          {currentLevel >= 2 && meta && (
            <>
              <span className="text-slate-600 font-bold text-sm">/</span>
              <button
                onClick={() => onNavigate(2, ministryId, 'overview')}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-sm ${
                  currentLevel === 2 
                    ? 'text-white font-bold bg-white/15 border border-white/20' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold'
                }`}
              >
                <span className="text-base">{meta.icon}</span>
                <span>{ministryDisplayName}</span>
              </button>
            </>
          )}

          {currentLevel >= 3 && subview && subview !== 'overview' && (
            <>
              <span className="text-slate-600 font-bold text-sm">/</span>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl text-white font-bold bg-white/15 border border-white/20 text-sm">
                <span className="text-base">
                  {subview === 'buildings' ? '🏗️' : subview === 'research' ? '🔬' : subview === 'programs' ? '💼' : '📜'}
                </span>
                <span>
                  {subview === 'buildings' ? 'Instalaciones' : subview === 'research' ? 'Investigaciones' : subview === 'programs' ? 'Despacho de Programas' : 'Gabinete de Decretos'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* === LÍNEA VERTICAL TOTAL DE SEPARACIÓN === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === SECTOR DERECHO: MINISTRO, INVESTIDURA Y MODO AUTÓNOMO (UNIFICADO VERTICALMENTE) === */}
      {minState && (
        <div className="flex items-center justify-between xl:justify-end gap-3.5 px-4 py-2 bg-black/50 shrink-0 border-t xl:border-t-0 border-white/10">
          {/* Info del Ministro */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (minister?.voiceId) {
                  playVoice(minister.voiceId);
                } else if (window.playSfx) {
                  window.playSfx('click');
                }
              }}
              title={minister ? (minister.voiceId ? "Haz clic para escuchar la voz del ministro" : "Ministro activo") : undefined}
              className={`w-9 h-9 rounded-xl overflow-hidden border border-white/15 bg-cyan-950/40 flex items-center justify-center shrink-0 shadow-sm transition-all ${
                minister ? 'hover:border-cyan-400 hover:scale-105 cursor-pointer' : ''
              }`}
            >
              {minister?.avatarId ? (
                <SafeImg 
                  id={minister.avatarId} 
                  className="w-full h-full object-cover object-top" 
                  fallback={<span className="text-xl">{minister ? minister.icon : '❓'}</span>}
                />
              ) : (
                <span className="text-xl">{minister ? minister.icon : '❓'}</span>
              )}
            </button>
            <div className="leading-tight">
              <span 
                onClick={() => {
                  if (minister?.voiceId) {
                    playVoice(minister.voiceId);
                  } else if (window.playSfx) {
                    window.playSfx('click');
                  }
                }}
                title={minister ? (minister.voiceId ? "Haz clic para escuchar su voz" : "Ministro activo") : undefined}
                className={`text-sm font-bold text-white block tracking-wide ${
                  minister ? 'hover:text-cyan-400 cursor-pointer transition-colors' : ''
                }`}
              >
                {minister ? minister.name : 'Vacante'}
              </span>
              <span className="text-xs text-slate-400 block truncate max-w-[170px]">
                {minister ? minister.trait : 'Sin ministro asignado'}
              </span>
            </div>
          </div>

          {/* Separador */}
          <div className="h-7 w-[1px] bg-white/20" />

          {/* Botón Cambiar / Investir */}
          {onOpenCandidates && (
            <button
              onClick={onOpenCandidates}
              className="px-3 py-1.5 bg-white/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white text-xs font-bold font-mono rounded-xl border border-white/20 hover:border-cyan-400/50 transition-all uppercase tracking-wider cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
            >
              {minister ? 'Cambiar' : 'Investir'}
            </button>
          )}

          {/* Separador */}
          <div className="h-7 w-[1px] bg-white/20" />

          {/* Interruptor de Autogestión / Manual */}
          <div className="relative">
            <div
              onClick={() => {
                if (dispatch && ministryId) {
                  dispatch({ 
                    type: 'TOGGLE_MINISTRY_AUTOMATION', 
                    ministryId, 
                    planetId: planetId || currentPlanet?.id 
                  });
                  if (window.playSfx) window.playSfx('click');
                }
              }}
              className="flex items-center gap-2 select-none p-1 rounded-xl transition-all cursor-pointer hover:bg-white/5"
              title={
                isAuto 
                  ? 'Modo Autónomo activo. Haz click para pasar a Manual' 
                  : 'Modo Manual. Haz click para activar Autónomo'
              }
            >
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 flex items-center border ${
                  isAuto 
                    ? 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)] justify-end' 
                    : !minister
                      ? 'bg-slate-900 border-dashed border-amber-500/40 justify-start'
                      : 'bg-slate-900 border-white/20 justify-start'
                }`}
              >
                <div className={`w-4 h-4 rounded-full shadow-md transform duration-200 ${
                  !minister && !isAuto ? 'bg-amber-400/80' : 'bg-white'
                }`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-mono font-black uppercase tracking-wider transition-colors ${
                  isAuto 
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
                    : !minister
                      ? 'text-amber-400'
                      : 'text-slate-400 hover:text-slate-200'
                }`}>
                  {isAuto ? 'Automático' : 'Manual'}
                </span>
              </div>
            </div>

            {/* Tooltip / Mensaje de advertencia flotante */}
            {warningMsg && (
              <div className="absolute bottom-full mb-2 right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-lg bg-amber-950/95 border border-amber-400/60 text-amber-200 text-[11px] font-bold font-mono shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{warningMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === LÍNEA VERTICAL TOTAL DE SEPARACIÓN HACIA EL BOTÓN VOLVER === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === HABITÁCULO DERECHO EXTREMO: TARJETA VOLVER ATRÁS === */}
      <div className="flex items-stretch justify-center shrink-0 border-t xl:border-t-0 border-white/10 w-full xl:w-44">
        <button
          type="button"
          onClick={() => {
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
          }}
          className="relative w-full h-full min-h-[56px] flex flex-col items-center justify-center px-2 py-1.5 overflow-hidden bg-[#060a16] hover:bg-[#0c1328] transition-all duration-300 cursor-pointer group text-center select-none"
          title={
            currentLevel >= 3
              ? `Volver a la sede del ${meta?.name || 'Ministerio'}`
              : currentLevel === 2
                ? 'Volver a la avenida de Ministerios'
                : 'Volver al Alto Mando'
          }
        >
          {/* Imagen de fondo nítida y visual sin degradado negro */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <SafeImg
              id={currentLevel >= 3 ? meta?.assetId || 'sectorGovPalace' : currentLevel === 2 ? 'sectorGovPalace' : 'historicImperialArchive'}
              className="w-full h-full object-cover object-center opacity-75 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-cyan-950/20 group-hover:bg-cyan-500/10 transition-colors duration-300" />
          </div>

          {/* Contenido frontal maximizado a todo el ancho */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full min-w-0 leading-none px-1">
            <span className="w-full text-center text-lg sm:text-xl font-mono font-black uppercase tracking-[0.28em] text-cyan-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] transition-colors">
              VOLVER A
            </span>
            <span className="w-full text-center text-base sm:text-lg font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wider truncate group-hover:text-cyan-100 transition-colors flex items-center justify-center gap-1.5 mt-1">
              <span className="text-base shrink-0">
                {currentLevel >= 3 ? (meta?.icon || '🏛️') : currentLevel === 2 ? '🏛️' : '👑'}
              </span>
              <span className="truncate">
                {currentLevel >= 3 ? 'Ministerio' : currentLevel === 2 ? 'Ministerios' : 'Alto Mando'}
              </span>
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
};
