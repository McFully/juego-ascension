import React, { useState } from 'react';
import { IMPERIAL_COUNCIL_PORTFOLIOS, IMPERIAL_COUNCIL_CANDIDATES } from '../../../data/imperialCouncilData.js';

export const ImperialCouncilCabinet = ({
  state,
  dispatch,
  fmt,
  onBackToGoov
}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState('economy');
  const council = state?.imperialCouncil || { ministers: {} };
  const currentMinisters = council.ministers || {};
  const currentInfluence = state?.influence || 0;

  const activePortfolio = IMPERIAL_COUNCIL_PORTFOLIOS.find(p => p.id === selectedPortfolio) || IMPERIAL_COUNCIL_PORTFOLIOS[0];
  const assignedMinister = currentMinisters[activePortfolio.id];

  const candidate = IMPERIAL_COUNCIL_CANDIDATES.find(c => c.portfolio === activePortfolio.id);

  const handleAppoint = () => {
    if (!candidate) return;
    if (window.playSfx) window.playSfx('click');
    dispatch({
      type: 'APPOINT_IMPERIAL_MINISTER',
      candidateId: candidate.id
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera del Consejo Supremo */}
      <div className="p-5 rounded-2xl bg-[#090e1e]/90 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-2xl shadow-inner">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                Alta República Imperial
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {state?.planets?.length || 0} Mundos Integrados
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              Consejo de Ministros Supremos
            </h2>
            <p className="text-xs text-slate-400">
              Gobierno centralizado de la República: un Ministro del Consejo dicta la política de toda su cartera sobre los {state?.planets?.length || 0} planetas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono">
            <span className="text-slate-400">Influencia: </span>
            <span className="font-bold text-purple-300 text-sm">{fmt ? fmt(currentInfluence) : currentInfluence}</span>
          </div>
          {onBackToGoov && (
            <button
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                onBackToGoov();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all text-xs font-mono font-bold cursor-pointer"
            >
              ◀ Volver al Mando Imperial
            </button>
          )}
        </div>
      </div>

      {/* Selector de Cartera Ministerial */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {IMPERIAL_COUNCIL_PORTFOLIOS.map(p => {
          const hasMinister = Boolean(currentMinisters[p.id]);
          const isSelected = selectedPortfolio === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                setSelectedPortfolio(p.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                  : 'bg-[#060a16]/70 border-white/10 hover:border-white/20 hover:bg-[#0c1328]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{p.icon}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  hasMinister ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {hasMinister ? 'TITULAR' : 'VACANTE'}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight mt-2">{p.name}</h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalle de la Cartera Activa y Ministro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Descripción y Bonificaciones Globales */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#080d1e]/80 border border-white/10 space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="text-3xl">{activePortfolio.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">{activePortfolio.name}</h3>
              <p className="text-xs text-slate-300">{activePortfolio.desc}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono font-bold uppercase">
              <span>⭐</span> Efecto Federal Activo en Todos los Mundos
            </div>
            <p className="text-sm font-semibold text-emerald-300 font-mono">
              {activePortfolio.globalBonusText}
            </p>
            <p className="text-[11px] text-slate-400">
              Esta bonificación se aplica de forma multiplicativa a las colonias sin necesidad de asignar gobernadores individuales.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#05070f] border border-white/8 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              Alcance Imperial de la Cartera
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Mundos Gobernados</span>
                <span className="text-base font-bold text-cyan-300 font-mono">{state?.planets?.length || 0}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Delegaciones Locales</span>
                <span className="text-base font-bold text-emerald-300 font-mono">100% Sincronizadas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Estado de Cartera</span>
                <span className="text-base font-bold text-amber-300 font-mono">
                  {assignedMinister ? 'Activa' : 'Acéfala'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-mono">Voto en el Senado</span>
                <span className="text-base font-bold text-purple-300 font-mono">+1 Voto de Calidad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Candidato y Nombramiento */}
        <div className="p-5 rounded-2xl bg-[#080d1e]/80 border border-white/10 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
              <span>Candidato al Gabinete Supremo</span>
              <span className="text-amber-400">🏛️ Nivel Federal</span>
            </h4>

            {candidate ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
                    {candidate.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{candidate.name}</h4>
                    <p className="text-xs text-amber-300 font-mono font-semibold">{candidate.title}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#05070f] p-3 rounded-xl border border-white/5">
                  "{candidate.desc}"
                </p>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Coste de Nombramiento:</span>
                  <span className="font-bold text-purple-300">{candidate.influenceCost} Influencia</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No hay candidatos disponibles para esta cartera.
              </div>
            )}
          </div>

          <div>
            {assignedMinister ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-300 block">
                  ✓ Ministro Supremo en Funciones
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {assignedMinister.name} dirige esta cartera en todo el Imperio.
                </span>
              </div>
            ) : (
              <button
                onClick={handleAppoint}
                disabled={!candidate || currentInfluence < candidate.influenceCost}
                className={`w-full py-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  !candidate || currentInfluence < candidate.influenceCost
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                }`}
              >
                Proclamar Ministro Supremo ({candidate?.influenceCost || 0} Inf)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
