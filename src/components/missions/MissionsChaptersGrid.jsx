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
                className={`relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none min-h-[110px] ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_18px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : unlocked
                      ? 'border-white/10 bg-[#060a15]/80 hover:border-cyan-500/50 hover:bg-[#0c1426]'
                      : 'border-white/5 bg-black/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 w-full mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{era.icon}</span>
                      <span className="text-xs font-bold text-white uppercase tracking-tight truncate whitespace-nowrap">
                        {era.shortName}
                      </span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      unlocked
                        ? progress === 100
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                        : 'bg-black/80 text-slate-500 border border-white/5'
                    }`}>
                      {unlocked ? `${progress}%` : '🔒'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300/90 font-mono line-clamp-2 leading-snug">
                    {era.desc}
                  </p>
                </div>

                <div className="text-[10px] text-cyan-400/90 font-mono mt-2 pt-1.5 border-t border-white/5 font-semibold">
                  Capítulos del {era.chapters[0]} al {era.chapters[era.chapters.length - 1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de los 6 capítulos de la Era + Botón de Retorno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full items-stretch pb-4">
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
              className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[250px] ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                  : unlocked
                    ? 'border-cyan-900/40 bg-[#070b14]/80 hover:border-cyan-500/60 hover:bg-[#0c1424]'
                    : 'border-slate-800/50 bg-[#04060a]/60 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="relative w-full h-36 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg
                  id={ch.assetId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                  unlocked
                    ? progress === 100
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    : 'bg-black/80 text-slate-500 border-slate-700/50'
                }`}>
                  {unlocked ? `Progreso ${progress}%` : 'Bloqueado'}
                </span>
                <span className="absolute bottom-2 left-2.5 text-lg drop-shadow">
                  {ch.icon}
                </span>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {ch.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                    {ch.intro}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                  <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                    {unlocked ? 'Entrar a Misiones' : `🔒 Requiere Cap. ${ch.id - 1}`}
                  </span>
                  <span className="text-cyan-400/70 group-hover:translate-x-1 transition-transform duration-200">
                    ➔
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        <ActionCardTile
          type="back"
          title="Volver Atrás"
          subtitle="Regresar a la pantalla anterior"
          icon="◀"
          assetId="commandCenter"
          badgeText="VOLVER"
          onClick={onNavigateBack}
        />
      </div>
    </div>
  );
};

export default MissionsChaptersGrid;
