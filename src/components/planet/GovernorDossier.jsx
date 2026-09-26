import React from 'react';
import { TacticalHologramAvatar } from '../dialogue/TacticalHologramAvatar';

export const GovernorDossier = ({ governor, onDismiss }) => {
  if (!governor) {
    return (
      <div className="bg-black/40 border border-dashed border-white/10 rounded-2xl p-6 text-center space-y-2">
        <div className="text-3xl">👤</div>
        <div className="text-sm font-bold text-slate-300">Vacante de Mando Colonial</div>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          El planeta opera bajo administración burocrática básica sin bonificadores de liderazgo. Asigna un gobernador para optimizar la colonia.
        </p>
      </div>
    );
  }

  const getGovernorAvatarKey = (id) => {
    switch (id) {
      case 'technocrat_pragmatic': return 'scientist';
      case 'iron_disciplinarian': return 'player';
      case 'industrial_tycoon': return 'merchant';
      case 'green_terraformer': return 'cyborg';
      default: return 'player';
    }
  };

  const getGovernorTone = (id) => {
    switch (id) {
      case 'technocrat_pragmatic': return 'cyan';
      case 'iron_disciplinarian': return 'red';
      case 'industrial_tycoon': return 'amber';
      case 'green_terraformer': return 'emerald';
      default: return 'cyan';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-[#0a1224] to-black border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
      {/* Holograma Táctico del Gobernador */}
      <div className="shrink-0">
        <TacticalHologramAvatar
          avatarKey={getGovernorAvatarKey(governor.id)}
          name={governor.name}
          isSpeaker={true}
          factionTone={getGovernorTone(governor.id)}
        />
      </div>


      {/* Datos del Expediente */}
      <div className="space-y-1.5 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-base font-bold text-white tracking-wide">{governor.name}</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
            Expediente Activo
          </span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">{governor.desc}</p>
        
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] font-mono text-slate-400">
          <span>Lealtad: <span className="text-emerald-400 font-bold">98%</span></span>
          <span>Mandato: <span className="text-cyan-400 font-bold">Ciclo Activo</span></span>
          <span>Eficiencia de Mando: <span className="text-amber-400 font-bold">+18%</span></span>
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs text-red-400 hover:text-red-300 font-mono px-3 py-1 rounded-lg border border-red-500/20 bg-red-950/20 transition-all shrink-0 self-center sm:self-start"
        >
          Relevar Mando
        </button>
      )}
    </div>
  );
};