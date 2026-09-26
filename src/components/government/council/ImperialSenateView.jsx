import React from 'react';
import { IMPERIAL_SENATE_BILLS } from '../../../data/imperialCouncilData.js';

export const ImperialSenateView = ({
  state,
  dispatch,
  currentPlanet,
  fmt,
  onBackToGoov
}) => {
  const council = state?.imperialCouncil || { activeBills: [], passedBills: [] };
  const activeBills = council.activeBills || [];
  const passedBills = council.passedBills || [];
  const planets = state?.planets || [];
  const currentInfluence = state?.influence || 0;

  // Cálculo de escaños por planeta
  const delegateRoster = planets.map(p => {
    const seats = Math.max(1, Math.floor((p.population || 1000) / 10000) + 1);
    return {
      id: p.id,
      name: p.name,
      biome: p.biome,
      seats,
      isHome: p.isHome
    };
  });

  const totalSenateSeats = delegateRoster.reduce((sum, d) => sum + d.seats, 0);

  const handleVote = (billId, vote, lobbyWithInfluence) => {
    if (window.playSfx) window.playSfx('click');
    dispatch({
      type: 'VOTE_SENATE_BILL',
      billId,
      vote,
      lobbyWithInfluence
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabecera del Senado */}
      <div className="p-5 rounded-2xl bg-[#0a081e]/90 border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-2xl shadow-inner">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold">
                Cámara Alta Federal
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {totalSenateSeats} Escaños Representados
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              Senado Imperial Interplanetario
            </h2>
            <p className="text-xs text-slate-400">
              Debate y promulgación de leyes federales. Los delegados votan según los intereses climáticos y demográficos de cada colonia.
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
              onClick={onBackToGoov}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Alto Mando</span>
            </button>
          )}
        </div>
      </div>

      {/* Roster de Representación Territorial */}
      <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
            <span>🗳️</span>
            <span>Delegaciones Planetarias en la Cámara ({planets.length} Mundos)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Total: {totalSenateSeats} Escaños
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {delegateRoster.map(d => (
            <div
              key={d.id}
              className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between ${
                d.isHome
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold truncate">
                <span className="truncate">{d.name}</span>
                {d.isHome && <span className="text-[9px] text-amber-400">★ Capital</span>}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="capitalize">{d.biome || 'Templado'}</span>
                <span className="font-mono font-bold text-purple-300">{d.seats} votos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos de Ley en Deliberación */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>📜</span>
            <span>Dictámenes en Discusión ({activeBills.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Nuevos proyectos cada 200 ciclos estelares
          </span>
        </div>

        {activeBills.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
            <div className="text-3xl">🕊️</div>
            <h4 className="text-sm font-bold text-slate-300">El Senado no tiene dictámenes pendientes</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              La cámara se encuentra en receso de sesiones. Las facciones coloniales presentarán nuevas resoluciones en el próximo ciclo legislativo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeBills.map(bill => {
              const lobbyCost = bill.influenceToLobby || 20;
              const canLobby = currentInfluence >= lobbyCost;

              return (
                <div
                  key={bill.id}
                  className="p-5 rounded-2xl bg-[#090b1c]/90 border border-purple-500/30 hover:border-purple-400/60 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-2 rounded-xl bg-purple-950/60 border border-purple-500/40">
                          {bill.icon}
                        </span>
                        <div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {bill.category} • {bill.proposerFaction}
                          </span>
                          <h4 className="text-base font-bold text-white leading-tight mt-0.5">
                            {bill.title}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {bill.description}
                    </p>

                    {/* Efectos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                        <span className="font-bold block text-[10px] uppercase text-emerald-400">Beneficio Federal</span>
                        {bill.effects.positive}
                      </div>
                      <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300">
                        <span className="font-bold block text-[10px] uppercase text-rose-400">Coste de Oportunidad</span>
                        {bill.effects.negative}
                      </div>
                    </div>

                    {/* Tendencia de Votación */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
                      <div>
                        <span className="text-emerald-400 font-medium">Favorece a biomas: </span>
                        {(bill.favoredBiomes || []).join(', ') || 'Varios'}
                      </div>
                      <div>
                        <span className="text-rose-400 font-medium">Rechazado por biomas: </span>
                        {(bill.opposedBiomes || []).join(', ') || 'Varios'}
                      </div>
                    </div>
                  </div>

                  {/* Botones de Voto y Presión Política */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleVote(bill.id, 'yes', false)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>✓</span>
                        <span>Votar a Favor</span>
                      </button>
                      <button
                        onClick={() => handleVote(bill.id, 'no', false)}
                        className="py-2.5 px-3 rounded-xl bg-rose-600/30 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>✕</span>
                        <span>Votar en Contra</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleVote(bill.id, 'yes', true)}
                      disabled={!canLobby}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border ${
                        canLobby
                          ? 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>⚡</span>
                      <span>Comprar Votos Neutrales ({lobbyCost} Influencia)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leyes y Edictos Promulgados */}
      {passedBills.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>📜</span>
            <span>Leyes Promulgadas en Vigor ({passedBills.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {passedBills.map(bill => (
              <div
                key={bill.id}
                className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3"
              >
                <span className="text-xl">{bill.icon}</span>
                <div className="text-xs space-y-1 flex-1">
                  <div className="font-bold text-white">{bill.title}</div>
                  <div className="text-emerald-300 text-[11px]">{bill.effects.positive}</div>
                  <div className="text-[10px] text-purple-400/80 font-mono">
                    Aprobada por {bill.yesSeats} votos contra {bill.noSeats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
