import React, { useEffect } from 'react';
import { CardBanner } from '../../assets.jsx';
import { fmt } from '../../core.jsx';
import { CODEX_DATA } from '../../data/codex.js';
import { setMuffle } from '../../audio.js';

export const CodexModal = React.memo(({ id, onClose, BUILDINGS, RESEARCH, SHIPS, DEFENSES }) => {
  useEffect(() => {
    setMuffle(true);
    return () => setMuffle(false);
  }, []);

  const resolvedName = CODEX_DATA[id]?.name || SHIPS?.[id]?.name || DEFENSES?.[id]?.name || BUILDINGS?.[id]?.name || RESEARCH?.[id]?.name || id;
  const data = CODEX_DATA[id] || {
    name: resolvedName,
    lore: "No disponible en los archivos de inteligencia actuales.",
    stats: "No disponible",
    usage: "No disponible",
  };

  const getTechStats = () => {
    if (SHIPS && SHIPS[id]) {
      const s = SHIPS[id];
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono">
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ATAQUE</span><span className="text-rose-400 font-bold">{fmt(s.atk)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ESCUDO</span><span className="text-cyan-400 font-bold">{fmt(s.shd)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CASCO</span><span className="text-emerald-400 font-bold">{fmt(s.hull)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CARGA</span><span className="text-amber-400 font-bold">{fmt(s.cargo)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">VELOCIDAD</span><span className="text-blue-400 font-bold">{fmt(s.speed)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">MOTOR</span><span className="text-slate-300 uppercase">{s.drive || 'N/A'}</span></div>
        </div>
      );
    }
    if (DEFENSES && DEFENSES[id]) {
      const d = DEFENSES[id];
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-mono">
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ATAQUE</span><span className="text-rose-400 font-bold">{fmt(d.atk)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ESCUDO</span><span className="text-cyan-400 font-bold">{fmt(d.shd)}</span></div>
          <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">CASCO</span><span className="text-emerald-400 font-bold">{fmt(d.hull)}</span></div>
        </div>
      );
    }
    return <p className="text-xs text-slate-400 font-mono leading-relaxed">{data.stats}</p>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 zoom-in-95" onClick={onClose}>
      <div className="bg-[#0a0c14] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="relative h-64 bg-black/60 flex items-center justify-center overflow-hidden border-b border-white/5 shrink-0">
          <CardBanner id={id} className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%]" />
          <div className="absolute bottom-6 left-8 z-20">
            <div className="text-[10px] font-black text-[var(--ue-accent)] uppercase tracking-[0.3em] mb-1 drop-shadow-md">Registro de Inteligencia</div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{data.name}</h2>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all z-30 group">
            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>
        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_40%)]">
          <section className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[var(--ue-accent)]/20 rounded-full"></div>
            <h4 className="text-[11px] font-black text-[var(--ue-accent)] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">history_edu</span>Archivos Históricos
            </h4>
            <p className="text-sm text-slate-300 font-serif leading-relaxed italic pl-2 border-l border-white/5">"{data.lore}"</p>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">settings_suggest</span>Especificaciones Técnicas
              </h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">{getTechStats()}</div>
            </section>
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">military_tech</span>Protocolo Operativo
              </h4>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-xs text-slate-400 font-mono leading-relaxed">{data.usage}</p>
              </div>
            </section>
          </div>
          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
              <span className="material-symbols-outlined text-blue-400">tips_and_updates</span>
              <p className="text-[10px] text-slate-500 font-mono">RECOMENDACIÓN: Mantener niveles equilibrados para optimizar el consumo de energía y la eficiencia estructural.</p>
            </div>
          </div>
        </div>
        <div className="bg-black/60 p-5 border-t border-white/5 flex justify-between items-center px-10 shrink-0">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">NRIA DATABASE · NO. 8449-ALPHA</span>
            <span className="text-[8px] text-slate-700 font-mono">Holographic Encrypted Stream · v1.0.64</span>
          </div>
          <button onClick={onClose} className="py-2.5 px-8 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white/10 hover:border-white/20 transition-all tracking-widest">Desconectar</button>
        </div>
      </div>
    </div>
  );
});
