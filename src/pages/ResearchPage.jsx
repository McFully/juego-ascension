import React, { useState } from 'react';

const ResearchPage = ({ state, dispatch, currentPlanet, RESEARCH, BUILDINGS, S, ItemCard, researchCost, calcResearchTime, meetsReq, researchEffectInfo, canAfford, GAME_SPEED, onOpenCodex }) => {
  const categories = [
    { key: 'power', title: '⚡ Energía' },
    { key: 'propulsion', title: '🚀 Propulsión' },
    { key: 'weapon', title: '⚔️ Armamento' },
    { key: 'defense', title: '🛡️ Defensa' },
    { key: 'utility', title: '💻 Utilidad' },
    { key: 'economy', title: '💰 Economía' },
    { key: 'ai', title: '🧠 IA' },
    { key: 'engineering', title: '⚙️ Ingeniería' },
    { key: 'exploration', title: '🌌 Exploración' },
    { key: 'military', title: '🎯 Militar' },
    { key: 'civics', title: '🏥 Cívicas' },
    { key: 'government', title: '🏛️ Gobierno' },
    { key: 'logistics', title: '📦 Logística' },
    { key: 'computer', title: '💻 Computación' },
  ];
  const [resCat, setResCat] = useState('power');

  if (!currentPlanet.buildings.researchLab) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl mb-2">Laboratorio requerido</h3>
        <p className="text-slate-400">Construye un Laboratorio de Investigación para investigar tecnologías.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 mb-2 p-1.5 glass-deep border border-white/10 rounded-2xl shadow-inner fresnel w-full">
        {categories.map(c => (
          <button key={c.key} onClick={() => setResCat(c.key)}
            className={`${S.tab} w-full text-center text-[10px] sm:text-[11px] px-1 py-1.5 truncate ${resCat === c.key ? S.tabActive : S.tabInactive}`}
            title={c.title}>
            {c.title}
          </button>
        ))}
      </div>
      {(() => {
        const items = Object.entries(RESEARCH).filter(([, r]) => r.cat === resCat);
        if (items.length === 0) return <p className="text-slate-500 text-sm">Sin investigaciones en esta categoría.</p>;
        return (
          <div className="grid grid-cols-5 gap-2 items-stretch">
            {items.map(([id, r]) => {
              const queuedCount = (state.researchQueue || []).filter(q => q.researchId === id).length;
              const researchLvl = state.research[id] || 0;
              const meets = meetsReq(r.req, { ...currentPlanet.buildings, ...state.research });
              // Tarjeta bloqueada (requisitos sin cumplir): se muestra que no está desbloqueada (nivel 0)
              const lvl = meets ? researchLvl : 0;
              const targetLvl = lvl + queuedCount;
              const nextLvl = targetLvl + 1;

              const cost = researchCost(id, targetLvl, state.research?.aiStrategy || 0, currentPlanet.buildings?.constructionCenter || 0);
              const time = calcResearchTime(cost, currentPlanet.buildings.researchLab, GAME_SPEED);
              const prodInfo = researchEffectInfo(id, targetLvl);
              const extraLines = [];
              if (r.req && !meets) extraLines.push(`🔒 Requiere: ${Object.entries(r.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} ${v}`).join(', ')}`);
              if (queuedCount > 0) extraLines.push(`⏳ En cola: +${queuedCount} nivel(es)`);
              return (
                <ItemCard
                  id={id} key={id}
                  icon={r.icon}
                  name={r.name}
                  level={targetLvl}
                  cost={cost}
                  time={time}
                  canAfford={canAfford(currentPlanet.resources, cost)}
                  meetsRequirements={meets}
                  prodInfo={prodInfo}
                  onAction={() => dispatch({ type: 'START_RESEARCH', researchId: id })}
                  actionLabel={`Investigar (Nv.${nextLvl})`}
                  extra={extraLines.join(' | ') || null}
                  onOpenCodex={onOpenCodex}
                  category={r.cat}
                />
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default ResearchPage;
