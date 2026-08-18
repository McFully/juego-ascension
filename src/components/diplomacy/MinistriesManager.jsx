import React from 'react';
import { S } from '../../styles.js';
import { fmt } from '../../core.jsx';
import { MINISTRY_PROGRAMS } from '../../pages/GovernmentPage.jsx';

export const MinistriesManager = ({
  state,
  resources,
  selectedMinistry,
  setSelectedMinistry,
  dispatch,
  playDiploSound,
  aiList,
  FACTIONS
}) => {
  const upgrades = state.ministryUpgrades || {};
  const currentMinUpgrades = upgrades[selectedMinistry] || {};
  const playerInfluence = state.influence || 0;
  
  const handleUpgradeProgram = (program) => {
    const lvl = currentMinUpgrades[program.id] || 0;
    if (lvl >= 5) return;

    const cost = {};
    Object.entries(program.baseCost).forEach(([resId, val]) => {
      cost[resId] = Math.floor(val * Math.pow(1.8, lvl));
    });

    let canBuy = true;
    if (cost.influence && playerInfluence < cost.influence) canBuy = false;
    if (cost.metal && resources.metal < cost.metal) canBuy = false;
    if (cost.crystal && resources.crystal < cost.crystal) canBuy = false;
    if (cost.deuterium && resources.deuterium < cost.deuterium) canBuy = false;

    if (!canBuy) {
      playDiploSound('warn');
      return;
    }

    playDiploSound('success');
    dispatch({
      type: 'MINISTRY_PROJECT',
      ministryId: selectedMinistry,
      cost,
      effect: {
        programId: program.id,
        level: lvl + 1
      }
    });
  };

  const ministryInfo = {
    economy: { title: '💼 Min. de Economía y Desarrollo Estelar', desc: 'Monitorea y subsidia los sectores industriales primarios para acelerar la acumulación de capital físico.', bonus: '+5% de tasa de recolección de metales en planetas coloniales.', color: 'text-amber-400' },
    defense: { title: '🛡️ Min. de Defensa y Seguridad Galáctica', desc: 'Dirección de tácticas defensivas, misileras y de modernización de cascos espaciales.', bonus: '+5% de resistencia estructural en cascos de naves.', color: 'text-red-400' },
    science: { title: '🔬 Min. de Ciencia y Desarrollo Tecnológico', desc: 'Investigación en redes neuronales, reactores y optimizaciones de laboratorios locales.', bonus: '+5% de velocidad en laboratorios de investigación.', color: 'text-cyan-400' },
    culture: { title: '🎭 Min. de Cultura y Prestigio Estelar', desc: 'Impulsa el prestigio de la República para aumentar la influencia galáctica.', bonus: '+10% de ganancia de influencia galáctica.', color: 'text-purple-400' },
    infra: { title: '🏗️ Min. de Infraestructura y Logística', desc: 'Coordinación de cadenas de construcción y optimización de transportes.', bonus: '-5% en tiempos de edificación orbital.', color: 'text-emerald-400' },
    intel: { title: '🕵️ Min. de Inteligencia y Redes de Espionaje', desc: 'Escaneo de redes cuánticas aliadas y enemigas para recolectar datos tácticos.', bonus: '+15% de defensa frente a espionaje hostil.', color: 'text-blue-400' }
  };

  const currentMinInfo = ministryInfo[selectedMinistry] || ministryInfo['economy'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Subtab sidebar for the 6 Ministries */}
      <div className={`${S.cardDeep} lg:col-span-3 space-y-1`}>
        <span className="text-[9px] text-slate-500 font-mono uppercase block mb-2 px-1">Carteras Ministeriales</span>
        {[
          { id: 'economy', label: '💼 Min. de Economía', color: 'text-amber-400' },
          { id: 'defense', label: '🛡️ Min. de Defensa', color: 'text-red-400' },
          { id: 'science', label: '🔬 Min. de Ciencia', color: 'text-cyan-400' },
          { id: 'culture', label: '🎭 Min. de Cultura', color: 'text-purple-400' },
          { id: 'infra', label: '🏗️ Min. de Infraestructura', color: 'text-emerald-400' },
          { id: 'intel', label: '🕵️ Min. de Inteligencia', color: 'text-blue-400' }
        ].map(min => (
          <button
            key={min.id}
            onClick={() => { playDiploSound('click'); setSelectedMinistry(min.id); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
              selectedMinistry === min.id
                ? 'bg-slate-900 border border-white/20 text-white font-bold'
                : 'bg-black/20 border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={min.color}>{min.label}</span>
          </button>
        ))}
      </div>

      {/* Main Ministry project and development pane */}
      <div className={`${S.cardDeep} lg:col-span-5 space-y-3 overflow-y-auto max-h-[500px]`}>
        <div className="space-y-2 font-mono text-xs pb-2 border-b border-white/5">
          <h4 className={`text-sm font-bold ${currentMinInfo.color}`}>{currentMinInfo.title}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">{currentMinInfo.desc}</p>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-white/5 space-y-1">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">BONIFICACIÓN MINISTERIAL ACTIVA:</span>
            <span className={`${currentMinInfo.color} font-bold block`}>{currentMinInfo.bonus}</span>
          </div>
        </div>

        <div className="space-y-2.5 pt-1">
          {MINISTRY_PROGRAMS[selectedMinistry]?.map(prog => {
            const lvl = currentMinUpgrades[prog.id] || 0;
            const cost = {};
            Object.entries(prog.baseCost).forEach(([resId, val]) => {
              cost[resId] = Math.floor(val * Math.pow(1.8, lvl));
            });

            let canBuy = true;
            if (cost.influence && playerInfluence < cost.influence) canBuy = false;
            if (cost.metal && resources.metal < cost.metal) canBuy = false;
            if (cost.crystal && resources.crystal < cost.crystal) canBuy = false;
            if (cost.deuterium && resources.deuterium < cost.deuterium) canBuy = false;

            return (
              <div key={prog.id} className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-200 block font-bold uppercase">{prog.name}</span>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{prog.desc}</p>
                  </div>
                  <span className="text-[9px] font-bold text-cyan-400 font-mono">Nv {lvl}/5</span>
                </div>

                <div className="flex gap-0.5 h-1 my-1">
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className={`flex-1 rounded-full ${step <= lvl ? 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.4)]' : 'bg-white/10'}`} />
                  ))}
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[9px] font-mono">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(cost).map(([resId, val]) => (
                      <span key={resId} className="bg-white/5 px-1 py-0.5 rounded border border-white/5 text-slate-300">
                        {resId === 'metal' && `⛏️ ${fmt(val)}`}
                        {resId === 'crystal' && `💎 ${fmt(val)}`}
                        {resId === 'deuterium' && `⚗️ ${fmt(val)}`}
                        {resId === 'influence' && `✨ ${fmt(val)}`}
                      </span>
                    ))}
                  </div>

                  {lvl >= 5 ? (
                    <span className="text-emerald-400 font-bold uppercase">Max</span>
                  ) : (
                    <button
                      onClick={() => handleUpgradeProgram(prog)}
                      disabled={!canBuy}
                      className={`py-0.5 px-2 rounded font-bold uppercase ${
                        canBuy 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-black' 
                          : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      Invertir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Graphs panel */}
      <div className="lg:col-span-4 space-y-4">
        <div className={`${S.cardDeep} space-y-3`}>
          <h3 className="font-bold text-sm text-slate-355 uppercase tracking-wider font-mono">📊 Relaciones Bilaterales</h3>
          <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5">
            <svg width="100%" height="150" className="mx-auto">
              <rect width="99%" height="140" fill="#030712" stroke="#1f2937" rx="6" />
              {aiList.slice(0, 8).map((a, i) => {
                const cx = 40 + i * 42;
                const cy = 70 + (i % 2 === 0 ? 15 : -15);
                return (
                  <g key={i}>
                    <line x1={cx} y1={cy} x2={100} y2={70} stroke="#1e293b" strokeWidth="1" />
                    <circle cx={cx} cy={cy} r="12" fill={(a.relation || 0) > 0 ? '#10b981' : '#ef4444'} className="opacity-80 animate-pulse" />
                    <text x={cx} y={cy + 4} fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">{FACTIONS[a.faction]?.icon || '👽'}</text>
                    <text x={cx} y={cy + 25} fill="#94a3b8" fontSize="8" textAnchor="middle">{a.name.slice(0, 6)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinistriesManager;
