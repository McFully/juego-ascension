import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';

/**
 * MissionsChaptersGrid — Cuadrícula modular y compacta de selección de capítulos por Eras Estratégicas.
 * Elimina el scroll masivo agrupando los 30 capítulos en 5 Eras de 6 capítulos.
 */
export const MissionsChaptersGrid = ({
  erasInfo = [],
  chaptersInfo = [],
  selectedEra = 1,
  onSelectEra,
  selectedChap,
  isChapterUnlocked,
  getChapterProgress,
  onSelectChapter,
  onNavigateBack
}) => {
  const currentEra = erasInfo.find(e => e.id === selectedEra) || erasInfo[0] || { chapters: [] };
  const eraChapters = chaptersInfo.filter(ch => (currentEra.chapters || []).includes(ch.id));

  // Progreso global de cada Era
  const getEraProgress = (era) => {
    const chaps = chaptersInfo.filter(ch => (era.chapters || []).includes(ch.id));
    if (chaps.length === 0) return 0;
    const totalProg = chaps.reduce((acc, ch) => acc + getChapterProgress(ch.id), 0);
    return Math.round(totalProg / chaps.length);
  };

  const isEraUnlocked = (era) => {
    if (era.id === 1) return true;
    const prevEra = erasInfo.find(e => e.id === era.id - 1);
    if (!prevEra) return true;
    return getEraProgress(prevEra) === 100;
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Selector de Eras Galácticas */}
      <div className="bg-[#080d1a]/90 border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {erasInfo.map(era => {
            const unlocked = isEraUnlocked(era);
            const progress = getEraProgress(era);
            const isSelected = selectedEra === era.id;

            return (
              <button
                key={era.id}
                type="button"
                onClick={() => {
                  if (unlocked) {
                    onSelectEra(era.id);
                    if (window.playSfx) window.playSfx('click');
                  }
                }}
                disabled={!unlocked}
                className={`relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all duration-200 select-none min-h-[110px] ${
                  !unlocked
                    ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                    : isSelected
                      ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_18px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400 cursor-pointer'
                      : 'border-white/10 bg-[#060a15]/80 hover:border-cyan-500/50 hover:bg-[#0c1426] cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 w-full mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-base shrink-0 ${!unlocked ? 'opacity-40 filter grayscale' : ''}`}>{era.icon}</span>
                      <span className={`text-xs font-bold uppercase tracking-tight truncate whitespace-nowrap ${
                        !unlocked ? 'text-slate-400' : 'text-white'
                      }`}>
                        {era.shortName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                      unlocked
                        ? progress === 100
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    }`}>
                      {unlocked ? `${progress}%` : (
                        <>
                          <span>🔒</span>
                          <span>BLOQUEADO</span>
                        </>
                      )}
                    </span>
                  </div>

                  {!unlocked ? (
                    <div className="mt-1 p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[10px] font-mono leading-tight text-rose-300">
                      <span className="font-bold block text-rose-400 flex items-center gap-1 mb-0.5">
                        <span>⚠️</span> Requisito Previo:
                      </span>
                      <span>Completar Capítulo {era.chapters[0] - 1}.</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-300/90 font-mono line-clamp-2 leading-snug">
                      {era.desc}
                    </p>
                  )}
                </div>

              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de los 6 capítulos de la Era (3 columnas fijas en md/xl para mostrar 3 arriba y 3 abajo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full flex-1 items-stretch pb-2">
        {eraChapters.map(ch => {
          const unlocked = isChapterUnlocked(ch.id);
          const progress = getChapterProgress(ch.id);
          const isSelected = selectedChap === ch.id;

          return (
            <button
              key={ch.id}
              onClick={() => {
                if (unlocked) {
                  onSelectChapter(ch.id);
                  if (window.playSfx) window.playSfx('click');
                }
              }}
              disabled={!unlocked}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 select-none text-left focus:outline-none w-full h-full min-h-[290px] xl:min-h-[310px] ${
                !unlocked
                  ? 'border-rose-900/40 bg-[#08040a]/70 hover:border-rose-500/50 hover:bg-[#120714] cursor-not-allowed'
                  : isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400 cursor-pointer'
                    : 'border-cyan-900/40 bg-[#070b14]/80 hover:border-cyan-500/60 hover:bg-[#0c1424] cursor-pointer'
              }`}
            >
              <div className="relative w-full h-44 xl:h-48 overflow-hidden bg-[#05070f] border-b border-white/10 shrink-0">
                <SafeImg
                  id={ch.assetId}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    !unlocked ? 'opacity-40 filter grayscale' : 'group-hover:scale-105'
                  }`}
                />

                {/* Pestillo / candado en el centro de la foto cuando está bloqueado */}
                {!unlocked && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">🔒</span>
                  </div>
                )}

                {/* Etiqueta arriba a la derecha */}
                <span className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border flex items-center gap-1 ${
                  unlocked
                    ? progress === 100
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}>
                  {unlocked ? `Progreso ${progress}%` : (
                    <>
                      <span>🔒</span>
                      <span>BLOQUEADO</span>
                    </>
                  )}
                </span>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className={`text-sm font-bold uppercase tracking-wide truncate ${
                    !unlocked ? 'text-slate-400' : 'text-white group-hover:text-cyan-300 transition-colors'
                  }`}>
                    {ch.name}
                  </h4>

                  {!unlocked ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] font-mono leading-tight text-rose-300">
                      <span className="font-bold block text-rose-400 flex items-center gap-1 mb-1">
                        <span>⚠️</span> Requisito Previo:
                      </span>
                      <span>Requiere completar Capítulo {ch.id - 1}.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-3 leading-relaxed">
                      {ch.intro}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MissionsChaptersGrid;
