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

              {/* Etiqueta del Planeta interactiva: clica para ir a Mundos del Imperio filtrado por este planeta */}
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

          {/* Badge Ministro Activo ON/OFF en la segunda línea del HUD */}
          {minState && (
            <div className="shrink-0 ml-auto flex items-center">
              <div 
                className={`border rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none transition-all text-xs ${
                  isAuto
                    ? 'bg-[#051c14]/90 border-emerald-500/50 text-emerald-300'
                    : minister
                      ? 'bg-[#211604]/90 border-amber-500/50 text-amber-300'
                      : 'bg-[#050814]/90 border-white/20 text-slate-300'
                }`}
                title="Estado de automatización del ministro titular"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  {isAuto && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isAuto ? 'bg-emerald-400' : minister ? 'bg-amber-400' : 'bg-slate-500'
                  }`}></span>
                </span>
                <span className="text-[10px] font-mono font-black uppercase tracking-wider whitespace-nowrap">
                  {isAuto ? '⚡ MINISTRO AUTÓNOMO (ON)' : minister ? '👤 MINISTRO MANUAL (OFF)' : '⚠️ CARTERA VACANTE'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === LÍNEA VERTICAL TOTAL DE SEPARACIÓN === */}
      <div className="hidden xl:block w-[1px] bg-white/15 self-stretch" />

      {/* === SECTOR DERECHO: RECUADRO MINISTRO (ALTO COMPLETO) + RETORNO === */}
      <div className="flex items-stretch justify-between xl:justify-end shrink-0 border-t xl:border-t-0 border-white/10 flex-wrap overflow-hidden rounded-r-2xl">
        {minState && (
          <button
            type="button"
            onClick={() => {
              if (minister?.voiceId) {
                playVoice(minister.voiceId);
              } else if (window.playSfx) {
                window.playSfx('click');
              }
              if (onOpenCandidates) {
                onOpenCandidates();
              }
            }}
            className={`relative min-h-[58px] min-w-[145px] flex flex-col items-center justify-center px-3 py-1.5 border-r border-white/10 overflow-hidden transition-all duration-300 cursor-pointer group text-center select-none shadow-none ${
              isAuto
                ? 'bg-[#051c14] hover:bg-[#072a1e]'
                : minister
                  ? 'bg-[#181105] hover:bg-[#281c08]'
                  : 'bg-[#1c080b] hover:bg-[#2c0d12]'
            }`}
            title={minister ? `${minister.name} · ${minister.trait}. Haz clic para gestionar o relevar.` : "Cartera vacante. Haz clic para investir ministro."}
          >
            {/* Imagen de fondo con retrato del ministro o fondo ministerial */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <SafeImg
                id={minister?.avatarId || meta?.assetId || "councilChamber"}
                className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500"
              />
              <div className={`absolute inset-0 transition-colors ${
                isAuto 
                  ? 'bg-emerald-950/40 group-hover:bg-emerald-500/20' 
                  : minister 
                    ? 'bg-amber-950/40 group-hover:bg-amber-500/20' 
                    : 'bg-rose-950/40 group-hover:bg-rose-500/20'
              }`} />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center leading-tight">
              <span className={`text-xs font-mono font-black uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wider flex items-center gap-1.5 ${
                isAuto ? 'text-emerald-200 group-hover:text-white' : minister ? 'text-amber-200 group-hover:text-white' : 'text-rose-200 group-hover:text-white'
              }`}>
                <span>{minister?.icon || '👤'}</span>
                <span className="truncate max-w-[125px]">{minister ? minister.name : 'Vacante'}</span>
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 ${
                isAuto ? 'text-emerald-300/80' : minister ? 'text-amber-300/80' : 'text-rose-300/80'
              }`}>
                {isAuto ? 'Activo (Autónomo)' : minister ? 'Manual (Asignado)' : 'Investir Ministro'}
              </span>
            </div>
          </button>
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
    </div>
  </nav>
);
};
