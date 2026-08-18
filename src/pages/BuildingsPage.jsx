import React, { useState } from 'react';

const BuildingsPage = ({ state, dispatch, currentPlanet, BUILDINGS, RESEARCH, S, ItemCard, buildingCost, calcBuildTime, meetsReq, buildingProdInfo, canAfford, GAME_SPEED, onOpenCodex }) => {
  const categories = [
    { key: 'resource', title: '⛏️ Recursos', color: 'amber' },
    { key: 'energy', title: '⚡ Energía', color: 'yellow' },
    { key: 'facility', title: '🏭 Instalaciones', color: 'cyan' },
    { key: 'storage', title: '📦 Almacenes', color: 'emerald' },
    { key: 'special', title: '⭐ Especiales', color: 'purple' },
    { key: 'advanced', title: '🔬 Avanzados', color: 'red' },
    { key: 'civil', title: '🏛️ Civiles', color: 'blue' },
    { key: 'government', title: '🏛️ Gobierno', color: 'indigo' },
  ];
  const [buildCat, setBuildCat] = useState('resource');

  return (
    <div className="space-y-4">
      <div className={S.tabBar}>
        {categories.map(c => (
          <button key={c.key} onClick={() => setBuildCat(c.key)}
            className={`${S.tab} ${buildCat === c.key ? S.tabActive : S.tabInactive}`}>
            {c.title}
          </button>
        ))}
      </div>
      {(() => {
        const items = Object.entries(BUILDINGS).filter(([, b]) => b.cat === buildCat);
        if (items.length === 0) return <p className="text-slate-500 text-sm">Sin edificios en esta categoría.</p>;
        return (
          <div className="grid grid-cols-5 gap-2 items-stretch">
            {items.map(([id, b]) => {
              const planetBuildQueue = (state.buildQueue || []).filter(q => q.planetId === currentPlanet.id && q.buildingId === id);
              const queuedCount = planetBuildQueue.length;
              const lvl = currentPlanet.buildings[id] || 0;
              const targetLvl = lvl + queuedCount;
              const nextLvl = targetLvl + 1;

              const cost = buildingCost(id, targetLvl, currentPlanet.buildings?.constructionCenter || 0);
              const time = calcBuildTime(cost, currentPlanet.buildings.robotFactory || 0, currentPlanet.buildings.naniteFactory || 0, GAME_SPEED, currentPlanet.buildings.constructionCenter || 0);
              const meets = meetsReq(b.req, { ...currentPlanet.buildings, ...state.research });
              const requiredPopulation = nextLvl * 150;
              const currentPopulation = currentPlanet.population || 1000;
              const hasPop = currentPopulation >= requiredPopulation;
              const prodInfo = buildingProdInfo(id, lvl, state.research, currentPlanet.temperature, GAME_SPEED, currentPlanet);
              const extraLines = [];
              if (b.req && !meets) extraLines.push(`🔒 Requiere: ${Object.entries(b.req).map(([k, v]) => `${RESEARCH[k]?.name || BUILDINGS[k]?.name || k} ${v}`).join(', ')}`);
              extraLines.push(`👥 Población: ${currentPopulation}/${requiredPopulation}`);
              if (queuedCount > 0) extraLines.push(`⏳ En cola: +${queuedCount} nivel(es)`);
              return (
                <ItemCard
                  key={id}
                  id={id}
                  icon={b.icon}
                  name={b.name}
                  level={targetLvl}
                  cost={cost}
                  time={time}
                  canAfford={canAfford(currentPlanet.resources, cost)}
                  meetsRequirements={meets && hasPop}
                  prodInfo={prodInfo}
                  onAction={() => dispatch({ type: 'START_BUILDING', buildingId: id })}
                  actionLabel={`Construir (Nv.${nextLvl})`}
                  extra={extraLines.join(' | ') || null}
                  onOpenCodex={onOpenCodex}
                  category={b.cat}
                />
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default BuildingsPage;
