import React, { useState } from 'react';

const TechTreePage = ({ state, RESEARCH, S, meetsReq }) => {
  const [selTech, setSelTech] = useState(null);
  const allCats = [
    { key: 'power', title: '⚡ Energía', color: 'yellow' },
    { key: 'propulsion', title: '🚀 Propulsión', color: 'cyan' },
    { key: 'weapon', title: '⚔️ Armamento', color: 'red' },
    { key: 'defense', title: '🛡️ Defensa', color: 'emerald' },
    { key: 'utility', title: '💻 Utilidad', color: 'blue' },
    { key: 'economy', title: '💰 Economía', color: 'amber' },
    { key: 'ai', title: '🧠 IA', color: 'purple' },
    { key: 'engineering', title: '⚙️ Ingeniería', color: 'orange' },
    { key: 'exploration', title: '🌌 Exploración', color: 'indigo' },
    { key: 'military', title: '🎯 Militar', color: 'rose' },
    { key: 'civics', title: '🏥 Cívicas', color: 'teal' },
    { key: 'government', title: '🏛️ Gobierno', color: 'indigo' },
    { key: 'logistics', title: '📦 Logística', color: 'emerald' },
    { key: 'computer', title: '💻 Computación', color: 'blue' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">🌳 Árbol Tecnológico</h3>
      <p className="text-sm text-[var(--ue-text-dim)] mb-4">Selecciona una tecnología para ver sus requisitos y desbloqueos. Las líneas muestran prerrequisitos.</p>
      {allCats.map(cat => {
        const items = Object.entries(RESEARCH).filter(([, r]) => r.cat === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key} className={S.cardDeep + ' mb-3'}>
            <h4 className="font-semibold mb-3 text-[var(--ue-accent)] flex items-center gap-2">{cat.title}</h4>
            <div className="flex flex-wrap gap-2">
              {items.map(([id, r]) => {
                const lvl = state.research[id] || 0;
                const reqMet = meetsReq(r.req, state.research);
                const isSelected = selTech === id;
                return (
                  <button key={id} onClick={() => setSelTech(id)}
                    className={`px-3 py-2 rounded-xl border text-xs transition-all glass ${isSelected ? 'border-[var(--ue-accent)]/60 text-[var(--ue-accent)] shadow-[0_0_12px_rgba(6,182,212,0.15)]' : lvl > 0 ? 'border-emerald-500/30 text-emerald-300' : reqMet ? 'border-[var(--ue-accent)]/30 text-[var(--ue-accent)]' : 'border-white/10 text-slate-500'}`}>
                    <div className="flex items-center gap-1.5">
                      <span>{r.icon}</span>
                      <span className="font-medium">{r.name}</span>
                      {lvl > 0 && <span className="text-emerald-400 font-mono">Nv.{lvl}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selTech && (() => {
        const r = RESEARCH[selTech];
        const lvl = state.research[selTech] || 0;
        const reqs = r.req ? Object.entries(r.req) : [];
        const unlockedBy = Object.entries(RESEARCH).filter(([, v]) => v.req && v.req[selTech]);
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelTech(null)}>
            <div className="glass holographic border border-[var(--ue-accent)]/30 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">{r.icon} {r.name} <span className="text-xs text-[var(--ue-text-dim)]">Nv. {lvl}</span></h4>
              {reqs.length > 0 && (
                <div className="mb-4 glass rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-[var(--ue-text-dim)] mb-2">🔗 PRERREQUISITOS</div>
                  <div className="space-y-1 text-sm">
                    {reqs.map(([k, v]) => {
                      const has = (state.research[k] || 0) >= v;
                      return <div key={k} className={`flex justify-between ${has ? 'text-emerald-400' : 'text-red-400'}`}>
                        <span>{RESEARCH[k]?.icon} {RESEARCH[k]?.name || k}</span>
                        <span>Nv.{v} {has ? '✅' : '❌'}</span>
                      </div>;
                    })}
                  </div>
                </div>
              )}
              {unlockedBy.length > 0 && (
                <div className="mb-4 glass rounded-xl p-3 border border-white/10">
                  <div className="text-xs text-[var(--ue-text-dim)] mb-2">🔓 DESBLOQUEA</div>
                  <div className="space-y-1 text-sm">
                    {unlockedBy.map(([id]) => {
                      const has = state.research[id] > 0;
                      return <div key={id} className={`flex justify-between ${has ? 'text-emerald-400' : 'text-[var(--ue-accent)]'}`}>
                        <span>{RESEARCH[id]?.icon} {RESEARCH[id]?.name || id}</span>
                        <span>{has ? 'Investigada' : 'Disponible'}</span>
                      </div>;
                    })}
                  </div>
                </div>
              )}
              <div className="text-xs text-[var(--ue-text-dim)] mt-2 mb-4">
                Categoría: {allCats.find(c => c.key === r.cat)?.title || r.cat}
              </div>
              <button onClick={() => setSelTech(null)} className={`w-full ${S.btn} ${S.btnPrimary}`}>Cerrar</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TechTreePage;
