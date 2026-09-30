import React, { useState } from 'react';
import { IMPERIAL_SENATE_BILLS } from '../../../data/imperialCouncilData.js';
import { SafeImg } from '../../../assets.jsx';

/**
 * ImperialSenateView — Cámara Alta Federal y Diplomacia del Imperio.
 * Estructurada en tarjetas grandes de alta fidelidad:
 * 1. Hemiciclo Imperial & Roster de Escaños
 * 2. Cuadrícula de Tarjetas:
 *    - Dictámenes y Leyes Federales en Deliberación
 *    - Diplomacia y Embajadas Galácticas
 *    - Facciones y Grupos de Presión
 *    - Leyes Promulgadas en Vigor
 */
export const ImperialSenateView = ({
  state,
  dispatch,
  fmt,
  onBackToGoov,
  onNavigateTab
}) => {
  const council = state?.imperialCouncil || { activeBills: [], passedBills: [] };
  const activeBills = council.activeBills || [];
  const passedBills = council.passedBills || [];
  const planets = state?.planets || [];
  const currentInfluence = state?.influence || 0;
  const [senateTab, setSenateTab] = useState('bills'); // 'bills' | 'diplomacy' | 'factions' | 'laws'

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
      {/* Cabecera Solemne del Senado */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-[#110b29] via-[#0c0821] to-[#070514] border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(168,85,247,0.35)]">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold">
                Cámara Alta Federal del Imperio
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {totalSenateSeats} Escaños Interplanetarios
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-0.5">
              Senado Imperial y Alta Diplomacia
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Órgano legislativo supremo de la civilización. Debate y promulgación de decretos interestelares, tratados con potencias alienígenas y arbitraje colonial.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-xs font-mono shadow-lg">
            <span className="text-slate-400 block text-[10px] uppercase">Influencia Política:</span>
            <span className="font-black text-purple-200 text-base">{fmt ? fmt(currentInfluence) : currentInfluence} Ptos</span>
          </div>
          {onBackToGoov && (
            <button
              onClick={onBackToGoov}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Mando Imperial</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas de la Cámara */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setSenateTab('bills');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            senateTab === 'bills'
              ? 'bg-purple-900/50 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📜</span>
          <span>Dictámenes Activos ({activeBills.length})</span>
        </button>

        <button
          onClick={() => {
            setSenateTab('diplomacy');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            senateTab === 'diplomacy'
              ? 'bg-purple-900/50 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🤝</span>
          <span>Diplomacia Exterior</span>
        </button>

        <button
          onClick={() => {
            setSenateTab('factions');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            senateTab === 'factions'
              ? 'bg-purple-900/50 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🗳️</span>
          <span>Hemiciclo y Facciones</span>
        </button>

        <button
          onClick={() => {
            setSenateTab('laws');
            if (window.playSfx) window.playSfx('click');
          }}
          className={`p-3.5 rounded-2xl border text-center font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            senateTab === 'laws'
              ? 'bg-purple-900/50 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>⚖️</span>
          <span>Leyes en Vigor ({passedBills.length})</span>
        </button>
      </div>

      {/* PESTAÑA 1: DICTÁMENES EN DISCUSIÓN */}
      {senateTab === 'bills' && (
        <div className="space-y-4">
          {activeBills.length === 0 ? (
            <div className="p-10 rounded-3xl bg-black/40 border border-white/10 text-center space-y-3">
              <div className="text-4xl">🕊️</div>
              <h4 className="text-base font-bold text-slate-200">El Senado no tiene dictámenes pendientes</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                La cámara se encuentra en receso de sesiones. Las facciones planetarias someterán a votación nuevas directivas federales en el próximo ciclo estelar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {activeBills.map(bill => {
                const lobbyCost = bill.influenceToLobby || 20;
                const canLobby = currentInfluence >= lobbyCost;

                return (
                  <div
                    key={bill.id}
                    className="p-6 rounded-3xl bg-[#0d0924]/90 border border-purple-500/30 hover:border-purple-400/60 transition-all flex flex-col justify-between space-y-5 shadow-xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 rounded-2xl bg-purple-950/70 border border-purple-500/40">
                            {bill.icon}
                          </span>
                          <div>
                            <span className="px-2.5 py-0.5 rounded text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {bill.category} • Propuesto por {bill.proposerFaction}
                            </span>
                            <h4 className="text-lg font-black text-white leading-tight mt-1">
                              {bill.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {bill.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                          <span className="font-bold block text-[10px] uppercase text-emerald-400">Impacto Positivo</span>
                          {bill.effects.positive}
                        </div>
                        <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
                          <span className="font-bold block text-[10px] uppercase text-rose-400">Coste de Oportunidad</span>
                          {bill.effects.negative}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleVote(bill.id, 'yes', false)}
                          className="py-3 px-4 rounded-2xl bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                        >
                          <span>✓</span>
                          <span>Apoyar Dictamen</span>
                        </button>
                        <button
                          onClick={() => handleVote(bill.id, 'no', false)}
                          className="py-3 px-4 rounded-2xl bg-rose-600/30 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
                        >
                          <span>✕</span>
                          <span>Rechazar Dictamen</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleVote(bill.id, 'yes', true)}
                        disabled={!canLobby}
                        className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border ${
                          canLobby
                            ? 'bg-purple-900/50 hover:bg-purple-800/70 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.35)]'
                            : 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <span>⚡</span>
                        <span>Presionar con Influencia Política ({lobbyCost} Ptos)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: DIPLOMACIA EXTERIOR */}
      {senateTab === 'diplomacy' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-[#0c0d22]/90 border border-cyan-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/40">🕊️</span>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Pactos de No Agresión</h3>
                    <p className="text-xs text-slate-400">Tratados de paz interestelar</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ratifica pactos fronterizos para garantizar que las rutas de cargueros entre sistemas operen sin interferencias hostiles.
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-cyan-300 font-mono">
                  Facciones Neutrales: 3 Tratados Activos
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      if (window.playSfx) window.playSfx('click');
                      onNavigateTab('diplomacy');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-200 text-xs font-bold transition-all text-center"
                  >
                    Gestionar en Cuerpo Diplomático →
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c0d22]/90 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-amber-950/70 border border-amber-500/40">💼</span>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Tratados Comerciales</h3>
                    <p className="text-xs text-slate-400">Apertura de aduanas espaciales</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Establece convenios de intercambio de deuterio y metales raros con las corporaciones mercantes independientes.
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-amber-300 font-mono">
                  Bonificación comercial: +8% Ganancia en Mercado
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      if (window.playSfx) window.playSfx('click');
                      onNavigateTab('market');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-950/40 border border-amber-500/40 hover:bg-amber-500/20 text-amber-200 text-xs font-bold transition-all text-center"
                  >
                    Abrir Mercado Galáctico →
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c0d22]/90 border border-rose-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-rose-950/70 border border-rose-500/40">⚔️</span>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase">Resolución de Guerra</h3>
                    <p className="text-xs text-slate-400">Sanción del Senado a invasiones</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El Senado puede declarar enemigos del imperio a facciones rivales, habilitando operaciones de bombardeo y asalto total.
                </p>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-rose-300 font-mono">
                  Doctrina de Defensa Activa
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => {
                      if (window.playSfx) window.playSfx('click');
                      onNavigateTab('diplomacy');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-500/20 text-rose-200 text-xs font-bold transition-all text-center"
                  >
                    Abrir Relaciones Diplomáticas →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: HEMICICLO Y FACCIONES */}
      {senateTab === 'factions' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-purple-950/20 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                  <span>🗳️</span>
                  <span>Escaños del Senado por Mundos Federados ({planets.length} Planetas)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cada colonia nombra procuradores según su censo demográfico e industrial.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-xs text-purple-300 font-mono font-bold">
                Total: {totalSenateSeats} Escaños
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {delegateRoster.map(d => (
                <div
                  key={d.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between ${
                    d.isHome
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold truncate">
                    <span className="truncate">{d.name}</span>
                    {d.isHome && <span className="text-[9px] text-amber-400">★ Capital</span>}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{d.biome || 'Templado'}</span>
                    <span className="font-mono font-bold text-purple-300">{d.seats} votos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: LEYES EN VIGOR */}
      {senateTab === 'laws' && (
        <div className="space-y-4">
          {passedBills.length === 0 ? (
            <div className="p-8 rounded-3xl bg-black/40 border border-white/10 text-center text-slate-400 text-xs">
              No hay leyes aprobadas todavía. Participa en las votaciones de la Cámara para promulgar decretos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passedBills.map(bill => (
                <div
                  key={bill.id}
                  className="p-5 rounded-3xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-4 shadow-lg"
                >
                  <span className="text-3xl p-2 rounded-2xl bg-purple-950/50 border border-purple-500/40">{bill.icon}</span>
                  <div className="text-xs space-y-1.5 flex-1">
                    <div className="font-bold text-white text-sm">{bill.title}</div>
                    <div className="text-emerald-300 text-xs">{bill.effects.positive}</div>
                    <div className="text-[10px] text-purple-400/80 font-mono">
                      Promulgada con {bill.yesSeats} votos a favor
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
