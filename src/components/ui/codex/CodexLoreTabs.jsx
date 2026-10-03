import React from 'react';

export const CodexLoreTab = React.memo(({ data }) => {
  return (
    <div className="space-y-6">
      <section className="relative p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4">
        <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-2 font-mono">
          <span>📜</span>
          <span>Registro de Archivos Históricos e Inteligencia</span>
        </h4>
        <p className="text-sm text-slate-200 font-serif leading-relaxed italic pl-4 border-l-2 border-cyan-500/50">
          "{data.lore}"
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Orígenes Tecnológicos</span>
          <p className="text-slate-300 leading-relaxed">
            Desarrollado bajo los decretos de estandarización colonial del cuadrante central. Su arquitectura emplea aleaciones compuestas y sellados cuánticos tolerantes a biomas extremos.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Impacto en la Civilización</span>
          <p className="text-slate-300 leading-relaxed">
            Asegura la autosuficiencia de las poblaciones de frontera y proporciona las bases operativas indispensables para sostener las cadenas logísticas del Imperio.
          </p>
        </div>
      </div>
    </div>
  );
});

export const CodexOperationsTab = React.memo(({ data }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-3 font-mono">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span>⚙️</span>
            <span>Especificaciones Técnicas</span>
          </h4>
          <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
            {typeof data.stats === 'string' ? (
              <p className="text-slate-300 leading-relaxed">{data.stats}</p>
            ) : (
              data.stats
            )}
          </div>
        </section>

        <section className="space-y-3 font-mono">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <span>🎖️</span>
            <span>Protocolo Operativo de Campo</span>
          </h4>
          <div className="bg-black/50 rounded-2xl p-4 border border-white/10 text-xs text-slate-300 leading-relaxed">
            {data.usage}
          </div>
        </section>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs space-y-2">
        <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-widest block">Condiciones Ambientales Toleradas</span>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">✓ Mundos Templados</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">✓ Mundos Desérticos y Volcánicos</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">✓ Océanos de Metano y Mundos Helados</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">✓ Vacío Orbital e Hiperespacio</span>
        </div>
      </div>
    </div>
  );
});
