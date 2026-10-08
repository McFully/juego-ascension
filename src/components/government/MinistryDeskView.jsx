import React, { useState } from 'react';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { REAL_IMAGES, getFallbackImage } from '../../data/assetsCatalog.js';

// Subcomponente individual para cada tarjeta de programa con selector de niveles e imagen
const MinistryProgramCard = ({
  prog,
  ministryId,
  currentLevel,
  planetResources,
  playerInfluence,
  onUpgradeProgram,
  fmt
}) => {
  // Estado local para seleccionar el nivel a previsualizar / financiar (1 a 5)
  // Por defecto se selecciona el siguiente nivel a desbloquear (o 5 si ya está al máximo)
  const defaultSelected = Math.min(5, Math.max(1, currentLevel + 1));
  const [selectedLvl, setSelectedLvl] = useState(defaultSelected);

  const isUnlockedLevel = currentLevel >= selectedLvl;
  const isNextToBuy = currentLevel + 1 === selectedLvl;
  const isLocked = selectedLvl > currentLevel + 1;

  // Cálculo del coste específico del nivel seleccionado
  const cost = {};
  Object.entries(prog.baseCost || {}).forEach(([resId, val]) => {
    cost[resId] = Math.floor(val * Math.pow(1.8, selectedLvl - 1));
  });

  const canAffordMetal = !cost.metal || ((planetResources?.metal ?? 0) >= cost.metal);
  const canAffordCrystal = !cost.crystal || ((planetResources?.crystal ?? 0) >= cost.crystal);
  const canAffordDeut = !cost.deuterium || ((planetResources?.deuterium ?? 0) >= cost.deuterium);
  const canAffordInf = !cost.influence || (playerInfluence >= cost.influence);
  const canBuy = isNextToBuy && canAffordMetal && canAffordCrystal && canAffordDeut && canAffordInf;

  // Imagen del programa: si existe en REAL_IMAGES, usarla; si no, fallback por categoría o ministerio
  const imageSrc = REAL_IMAGES[prog.id] || getFallbackImage(ministryId) || REAL_IMAGES.aiCore;

  const handlePrevLvl = (e) => {
    e.stopPropagation();
    setSelectedLvl(prev => Math.max(1, prev - 1));
    if (window.playSfx) window.playSfx('click');
  };

  const handleNextLvl = (e) => {
    e.stopPropagation();
    setSelectedLvl(prev => Math.min(5, prev + 1));
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="bg-[#050814]/90 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between backdrop-blur-md hover:border-cyan-500/40 transition-all shadow-xl min-h-[360px] group">
      <div>
        {/* Banner de Imagen Superior */}
        <div className="relative w-full h-36 bg-black/80 overflow-hidden border-b border-white/10">
          <img
            src={imageSrc}
            alt={prog.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />

          {/* Badge de Nivel Activo vs Seleccionado */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-cyan-500/40 shadow-lg">
            <span className="text-[10px] font-mono text-slate-300">ACTUAL:</span>
            <span className="text-xs font-mono font-bold text-cyan-300">{currentLevel}/5</span>
          </div>

          {/* Indicador de Rango de Luces */}
          <div className="absolute bottom-2.5 left-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full border transition-all ${
                  dot <= currentLevel
                    ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]'
                    : dot === selectedLvl
                    ? 'bg-amber-400/80 border-amber-300 animate-pulse'
                    : 'bg-black/60 border-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Cuerpo de Contenido */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {prog.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {prog.desc}
            </p>
          </div>

          {/* Selector de Nivel: Barra donde cada extremo es un botón completo con botón triangular grande */}
          <div className="flex items-stretch bg-[#02050e] border border-cyan-500/50 rounded-2xl overflow-hidden h-14 select-none shadow-[0_0_20px_rgba(6,182,212,0.2)] p-1 gap-1">
            {/* Esquina Izquierda: Botón completo */}
            <button
              type="button"
              disabled={selectedLvl <= 1}
              onClick={handlePrevLvl}
              className={`w-14 sm:w-16 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 ${
                selectedLvl > 1
                  ? 'bg-gradient-to-br from-[#4f86f7] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#3b82f6] active:from-[#1d4ed8] active:to-[#1e40af] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_8px_rgba(37,99,235,0.5)] border border-blue-300/50 cursor-pointer active:scale-95'
                  : 'bg-[#0a1224] text-slate-700 border border-white/5 cursor-not-allowed opacity-30'
              }`}
              title="Nivel anterior"
            >
              <svg className="w-7 h-7 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24">
                <path d="M16 5l-8 7 8 7V5z" />
              </svg>
            </button>

            {/* Centro: Texto de inspección */}
            <div className="flex-1 flex flex-col items-center justify-center px-2 bg-gradient-to-b from-[#081024] to-[#040817] rounded-xl border border-white/5 text-center">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-[0.22em] block leading-none">
                INSPECCIONANDO
              </span>
              <span className="text-sm font-mono font-black text-white mt-1 leading-none tracking-wide drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">
                Nivel {selectedLvl} de 5
              </span>
            </div>

            {/* Esquina Derecha: Botón completo (como en tu dibujo de Paint) */}
            <button
              type="button"
              disabled={selectedLvl >= 5}
              onClick={handleNextLvl}
              className={`w-14 sm:w-16 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150 ${
                selectedLvl < 5
                  ? 'bg-gradient-to-br from-[#4f86f7] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#3b82f6] active:from-[#1d4ed8] active:to-[#1e40af] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_2px_8px_rgba(37,99,235,0.5)] border border-blue-300/50 cursor-pointer active:scale-95'
                  : 'bg-[#0a1224] text-slate-700 border border-white/5 cursor-not-allowed opacity-30'
              }`}
              title="Siguiente nivel"
            >
              <svg className="w-7 h-7 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 24 24">
                <path d="M8 5l8 7-8 7V5z" />
              </svg>
            </button>
          </div>

          {/* Bonificación según nivel inspeccionado */}
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {prog.bonusText}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              (Efecto x{selectedLvl})
            </span>
          </div>
        </div>
      </div>

      {/* Footer y Acciones de Compra */}
      <div className="p-4 pt-0 border-t border-white/10 space-y-3">
        {/* Desglose de Coste del Nivel Seleccionado */}
        <div className="text-[10px] font-mono text-slate-400 flex flex-wrap gap-2 pt-3">
          <span>Coste Nivel {selectedLvl}: </span>
          {cost.metal && (
            <span className={canAffordMetal ? 'text-slate-200 font-bold' : 'text-rose-400 font-bold'}>
              {fmt ? fmt(cost.metal) : cost.metal} M
            </span>
          )}
          {cost.crystal && (
            <span className={canAffordCrystal ? 'text-cyan-200 font-bold' : 'text-rose-400 font-bold'}>
              {fmt ? fmt(cost.crystal) : cost.crystal} C
            </span>
          )}
          {cost.deuterium && (
            <span className={canAffordDeut ? 'text-emerald-200 font-bold' : 'text-rose-400 font-bold'}>
              {fmt ? fmt(cost.deuterium) : cost.deuterium} D
            </span>
          )}
          {cost.influence && (
            <span className={canAffordInf ? 'text-purple-300 font-bold' : 'text-rose-400 font-bold'}>
              {cost.influence} Inf
            </span>
          )}
        </div>

        {/* Botón de Financiación */}
        <button
          disabled={!canBuy}
          onClick={() => onUpgradeProgram(prog, cost)}
          className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
            isUnlockedLevel
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default'
              : isLocked
              ? 'bg-slate-900 text-slate-500 border border-white/5 cursor-not-allowed'
              : canBuy
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-lg shadow-cyan-500/30 active:scale-[0.98]'
              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
          }`}
        >
          {isUnlockedLevel
            ? '✓ Nivel ya Adquirido'
            : isLocked
            ? `Bloqueado (Requiere Nivel ${selectedLvl - 1})`
            : canBuy
            ? `Financiar Nivel ${selectedLvl}`
            : 'Recursos Insuficientes'}
        </button>
      </div>
    </div>
  );
};

export const MinistryDeskView = ({
  ministryId,
  subview,
  meta,
  minState,
  minUpgrades = {},
  programs = [],
  directives = [],
  onUpgradeProgram,
  onToggleDirective,
  onOpenDossier,
  onBack,
  planetResources,
  playerInfluence,
  fmt
}) => {
  return (
    <div className="space-y-4 pt-1">
      {/* Acceso al dossier. Solo el Ministerio de Inteligencia tiene uno. */}
      {ministryId === 'intel' && onOpenDossier && (
        <button
          type="button"
          onClick={onOpenDossier}
          className="w-full rounded-2xl border border-cyan-500/40 bg-cyan-950/25 px-4 py-3 text-left hover:bg-cyan-900/30 transition-colors flex items-center justify-between gap-3"
        >
          <span className="min-w-0">
            <span className="block text-xs font-black uppercase tracking-widest text-cyan-300">Dossier de Inteligencia</span>
            <span className="block text-[11px] text-slate-400 mt-0.5">
              Qué sabes de cada mundo enemigo y qué sigue oculto
            </span>
          </span>
          <span className="text-cyan-400 text-lg leading-none" aria-hidden="true">→</span>
        </button>
      )}

      {/* Subview 1: Programs (Tarjetas interactivas con imagen y selector de niveles) */}
      {subview === 'programs' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full items-stretch">
          {(programs || []).map((prog) => {
            const currentLevel = minUpgrades[prog.id] || 0;
            return (
              <MinistryProgramCard
                key={prog.id}
                prog={prog}
                ministryId={ministryId}
                currentLevel={currentLevel}
                planetResources={planetResources}
                playerInfluence={playerInfluence}
                onUpgradeProgram={onUpgradeProgram}
                fmt={fmt}
              />
            );
          })}
        </div>
      )}

      {/* Subview 2: Directives */}
      {subview === 'directives' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch">
          {(directives || []).map((dir) => {
            const isActive = minState.directives?.[dir.id];
            const dirImage = REAL_IMAGES[dir.id] || getFallbackImage(ministryId) || REAL_IMAGES.aiCore;

            return (
              <div
                key={dir.id}
                className={`border rounded-2xl overflow-hidden flex flex-col justify-between backdrop-blur-md transition-all shadow-xl min-h-[380px] md:min-h-[410px] group ${
                  isActive 
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-amber-950/30' 
                    : 'bg-[#050814]/90 border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col flex-1">
                  {/* Banner de Imagen para Decretos con mayor protagonismo */}
                  <div className="relative w-full flex-1 min-h-[170px] md:min-h-[190px] bg-black/80 overflow-hidden border-b border-white/10">
                    <img
                      src={dirImage}
                      alt={dir.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />

                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border shadow-md backdrop-blur-md ${
                        isActive 
                          ? 'bg-amber-500/30 text-amber-300 border-amber-500/60' 
                          : 'bg-black/70 text-slate-400 border-white/10'
                      }`}>
                        {isActive ? 'Decreto Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5 shrink-0">
                    <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {dir.name}
                    </h4>
                    {dir.desc && (
                      <p className="text-xs text-slate-300 leading-relaxed">{dir.desc}</p>
                    )}
                    <p className="text-xs font-mono text-amber-300 font-semibold leading-snug pt-0.5">
                      {dir.bonusText}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-2.5 border-t border-white/10 shrink-0">
                  <button
                    onClick={() => onToggleDirective(dir.id)}
                    className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 border border-amber-500/60 shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
                    }`}
                  >
                    {isActive ? 'Revocar Decreto' : 'Promulgar Decreto'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
