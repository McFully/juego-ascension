import React, { useState } from 'react';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const TechTreePage = ({ state, currentPlanet, production, fmt, RESEARCH, S, meetsReq, onOpenCodex, setActiveTab, safeSetActiveTab }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [selTech, setSelTech] = useState(null);
  const allCats = [
    { key: 'power', title: '⚡ Energía y Reactores' },
    { key: 'propulsion', title: '🚀 Motores y Propulsión' },
    { key: 'weapon', title: '⚔️ Balística y Láser' },
    { key: 'defense', title: '🛡️ Escudos y Blindaje' },
    { key: 'utility', title: '💻 Computación y Red' },
    { key: 'economy', title: '💰 Industria y Minería' },
    { key: 'ai', title: '🧠 IA Estratégica' },
    { key: 'engineering', title: '⚙️ Nanorobótica' },
    { key: 'exploration', title: '🌌 Exploración Espacial' },
    { key: 'military', title: '🎯 Tácticas Militares' },
    { key: 'civics', title: '🏥 Cívica y Población' },
    { key: 'government', title: '🏛️ Administración Federal' },
  ];

  const totalResearchCount = Object.keys(RESEARCH || {}).length;
  const researchedCount = Object.values(state.research || {}).filter(lvl => lvl > 0).length;

  return (
    <div className="space-y-6 view-enter w-full">
      {/* DOM Superior Estandarizado (Recursos + Explorador + I+D Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Árbol Tecnológico Interestelar"
        breadcrumbIcon="🌌"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Progreso:</span>
              <span className="font-bold text-cyan-300">{researchedCount}/{totalResearchCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs font-mono">
              <span className="text-slate-400">Laboratorio:</span>
              <span className="font-bold text-purple-300">Nvl {currentPlanet?.buildings?.lab || 0}</span>
            </div>
          </div>
        }
      />

      {/* Categorías y Tarjetas */}
      <div className="space-y-6">
        {allCats.map(cat => {
          const items = Object.entries(RESEARCH).filter(([, r]) => r.cat === cat.key);
          if (items.length === 0) return null;

          return (
            <div key={cat.key} className="p-5 rounded-3xl bg-[#090d1f]/80 border border-white/10 space-y-3">
              <h3 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                {cat.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map(([id, r]) => {
                  const lvl = state.research[id] || 0;
                  const reqMet = meetsReq(r.req, { ...(currentPlanet?.buildings || {}), ...state.research });
                  const isSelected = selTech === id;

                  return (
                    <button
                      key={id}
                      onClick={() => setSelTech(id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                          : lvl > 0
                          ? 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-400'
                          : reqMet
                          ? 'border-cyan-500/30 bg-[#060a17] hover:border-cyan-400'
                          : 'border-white/5 bg-[#05070f] opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{r.icon}</span>
                        {lvl > 0 ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            Nv. {lvl}
                          </span>
                        ) : reqMet ? (
                          <span className="text-[10px] font-mono text-cyan-300">Disponible</span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500">Bloqueada</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase line-clamp-1">{r.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Holográfico de Detalle */}
      {selTech && (() => {
        const r = RESEARCH[selTech];
        const lvl = state.research[selTech] || 0;
        const reqs = r.req ? Object.entries(r.req) : [];

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelTech(null)}>
            <div className="p-6 rounded-3xl bg-[#090e21] border border-cyan-500/40 max-w-md w-full space-y-4 shadow-[0_0_50px_rgba(6,182,212,0.3)]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{r.icon}</span>
                <div>
                  <h3 className="text-lg font-black text-white uppercase">{r.name}</h3>
                  <span className="text-xs font-mono text-cyan-300">Nivel actual investigado: {lvl}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">{r.desc}</p>
              {reqs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Prerrequisitos:</span>
                  {reqs.map(([reqId, reqLvl]) => {
                    const have = state.research[reqId] || 0;
                    const met = have >= reqLvl;
                    return (
                      <div key={reqId} className="flex justify-between text-xs font-mono">
                        <span className={met ? 'text-emerald-400' : 'text-rose-400'}>
                          {RESEARCH[reqId]?.name || reqId}
                        </span>
                        <span className="text-slate-400">Req: Nv.{reqLvl} (Tienes: {have})</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const fn = safeSetActiveTab || setActiveTab;
                    if (fn) fn('research');
                    setSelTech(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  🔬 Investigar en Laboratorio ➔
                </button>
                <button
                  onClick={() => setSelTech(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tarjeta de Retorno a Pantalla Anterior */}
      <div className="pt-2">
        <ActionCardTile
          type="back"
          title="Volver Atrás"
          subtitle="Regresar a la pantalla anterior"
          icon="◀"
          assetId="researchLab"
          badgeText="VOLVER"
          onClick={() => {
            if (navigateBack) navigateBack();
            else if (safeSetActiveTab) safeSetActiveTab('research');
            else if (setActiveTab) setActiveTab('research');
            else if (navigateTo) navigateTo('research');
          }}
        />
      </div>
    </div>
  );
};

export default TechTreePage;
