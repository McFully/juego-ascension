import React from 'react';
import { S } from '../../styles.js';

export const GalacticCouncil = ({
  council,
  influence,
  dispatch,
  playDiploSound
}) => {
  const resolutions = council?.resolutionsPassed || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`${S.cardDeep} lg:col-span-2 space-y-4`}>
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">🌌 Asamblea de Civilizaciones Galácticas</h3>
        
        <div className="bg-slate-950/50 p-3 rounded-xl border border-cyan-500/20 text-xs space-y-1.5 font-mono text-slate-300">
          <span className="font-bold text-cyan-400 block">💡 ¿CÓMO FUNCIONA EL SENADO ESTELAR?</span>
          <p className="leading-relaxed text-[10px]">
            La Asamblea se reúne periódicamente cada <span className="text-white font-bold">400 ticks</span>. Cualquier imperio puede proponer leyes (dictámenes) a cambio de su influencia política. Una vez propuesta, las civilizaciones descubiertas votarán de manera autónoma según su nivel de relación y personalidad. Si una propuesta obtiene mayoría simple (&gt;50% de votos afirmativos), se aprueba y se convierte en Ley de cumplimiento obligatorio en toda la galaxia.
          </p>
        </div>

        {/* Sesión Activa de Votación del Consejo */}
        {council?.currentSession?.proposals && council.currentSession.proposals.length > 0 && (
          <div className="p-3.5 bg-cyan-950/30 rounded-xl border border-cyan-500/40 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Votaciones en Curso en el Senado
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Sesión Legislativa Activa</span>
            </div>
            <div className="space-y-2">
              {council.currentSession.proposals.map((prop) => {
                const myVote = council.currentSession.votes?.[prop.id]?.player;
                return (
                  <div key={prop.id} className="p-2.5 rounded-lg bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <span className="font-bold text-white text-xs block">{prop.title}</span>
                      <span className="text-[10px] text-slate-400">Proponente: {prop.proposer === 'player' ? 'Tu Imperio' : prop.proposer}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (playDiploSound) playDiploSound('success');
                          dispatch({ type: 'COUNCIL_VOTE', proposalId: prop.id, vote: 'yes' });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          myVote === 'yes'
                            ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        👍 A Favor
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (playDiploSound) playDiploSound('click');
                          dispatch({ type: 'COUNCIL_VOTE', proposalId: prop.id, vote: 'no' });
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                          myVote === 'no'
                            ? 'bg-rose-500 text-white border border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                            : 'bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300'
                        }`}
                      >
                        👎 En Contra
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Paz Galáctica */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-200 block">Resolución de Paz Galáctica</span>
                <span className="text-[10px] text-emerald-500 font-mono block">Beneficio: -30% Agresividad IA en todos los sectores galácticos.</span>
                <span className="text-[9px] text-amber-500 font-mono block">Riesgo: Reducción del 5% en la efectividad del ataque de tu armada.</span>
              </div>
              <button 
                onClick={() => { playDiploSound('success'); dispatch({ type: 'COUNCIL_PROPOSE_RESOLUTION', title: 'Resolución de Paz Galáctica', effect: { type: 'PEACE' }, cost: 25 }); }} 
                disabled={influence < 25} 
                className={`${S.btnSmall} ${S.btnPrimary} text-xs font-mono`}
              >
                Proponer (25 Puntos)
              </button>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex gap-4 border-t border-white/5 pt-2">
              <span>👍 Apoyos estimados: República Nova, Colectivo Zenith</span>
              <span>👎 Opositores estimados: Imperio Draconiano, Soberanía Drakon</span>
            </div>
          </div>

          {/* Subsidios Científicos */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-200 block">Subsidios Científicos y Cooperación</span>
                <span className="text-[10px] text-cyan-400 font-mono block">Beneficio: +10% de velocidad de investigación científica.</span>
                <span className="text-[9px] text-amber-500 font-mono block">Riesgo: Incrementa el coste de deuterio para reactores espaciales en 5%.</span>
              </div>
              <button 
                onClick={() => { playDiploSound('success'); dispatch({ type: 'COUNCIL_PROPOSE_RESOLUTION', title: 'Subsidios Científicos', effect: { type: 'RESEARCH_SUBSIDY' }, cost: 30 }); }} 
                disabled={influence < 30} 
                className={`${S.btnSmall} ${S.btnPrimary} text-xs font-mono`}
              >
                Proponer (30 Puntos)
              </button>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex gap-4 border-t border-white/5 pt-2">
              <span>👍 Apoyos estimados: Colectivo Zenith, Confederación Helios</span>
              <span>👎 Opositores estimados: Cábala Vortex</span>
            </div>
          </div>

          {/* Estandarización de Infraestructuras */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-200 block">Estandarización de Infraestructuras</span>
                <span className="text-[10px] text-emerald-500 font-mono block">Beneficio: +10% de velocidad de construcción de edificios.</span>
                <span className="text-[9px] text-amber-500 font-mono block">Riesgo: Incrementa el coste de metal de edificación en 5%.</span>
              </div>
              <button 
                onClick={() => { playDiploSound('success'); dispatch({ type: 'COUNCIL_PROPOSE_RESOLUTION', title: 'Estandarización de Infraestructuras', effect: { type: 'INFRASTRUCTURE' }, cost: 20 }); }} 
                disabled={influence < 20} 
                className={`${S.btnSmall} ${S.btnPrimary} text-xs font-mono`}
              >
                Proponer (20 Puntos)
              </button>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex gap-4 border-t border-white/5 pt-2">
              <span>👍 Apoyos estimados: República Nova, Imperio Solaris</span>
              <span>👎 Opositores estimados: Colectivo Zenith</span>
            </div>
          </div>

          {/* Decreto de Defensa contra el Vacío */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm text-slate-200 block">Decreto de Defensa contra el Vacío</span>
                <span className="text-[10px] text-red-400 font-mono block">Beneficio: +15% de escudo y ataque militar contra incursiones del vacío.</span>
                <span className="text-[9px] text-amber-500 font-mono block">Riesgo: Incrementa el consumo de deuterio general en 10%.</span>
              </div>
              <button 
                onClick={() => { playDiploSound('success'); dispatch({ type: 'COUNCIL_PROPOSE_RESOLUTION', title: 'Decreto de Defensa contra el Vacío', effect: { type: 'VACUUM_DEFENSE' }, cost: 40 }); }} 
                disabled={influence < 40} 
                className={`${S.btnSmall} ${S.btnPrimary} text-xs font-mono`}
              >
                Proponer (40 Puntos)
              </button>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex gap-4 border-t border-white/5 pt-2">
              <span>👍 Apoyos estimados: Imperio Draconiano, Protectorado Umbra</span>
              <span>👎 Opositores estimados: República Nova</span>
            </div>
          </div>
        </div>

        <div className="text-xs pt-2 border-t border-white/5 flex justify-between text-slate-400 font-mono">
          <span>Resoluciones Aprobadas en el Senado:</span>
          <span className="text-emerald-400 font-bold">{resolutions.length} Leyes vigentes</span>
        </div>
      </div>

      <div className={`${S.cardDeep} space-y-3`}>
        <h4 className="font-semibold text-sm text-slate-300 uppercase tracking-wider font-mono">Historial de Resoluciones</h4>
        <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
          {resolutions.map((res, i) => (
            <div key={i} className="text-xs p-2.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded-lg font-mono">
              📜 LEY APROBADA: {res.title || res}
            </div>
          ))}
          {resolutions.length === 0 && (
            <div className="text-xs italic text-slate-500 text-center py-6">Ninguna ley aprobada todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalacticCouncil;
