import React from "react";
import { calcRemainingSeconds, calcTotalSeconds } from "../../core.jsx";
import { getMinistryResearchRoute } from "../../utils/researchMinistryResolver.js";

export const ConstructionQueuesPanel = ({ state, currentPlanet, BUILDINGS, RESEARCH, fmtTime, ProgressBar, dispatch, S, onNavigate }) => {
  const planetBuildQueue = [...(state.buildQueue || [])]
    .filter(item => item.planetId === currentPlanet.id)
    .sort((a, b) => (a.endTime || 0) - (b.endTime || 0));

  const sortedResearchQueue = [...(state.researchQueue || [])]
    .sort((a, b) => (a.endTime || 0) - (b.endTime || 0));

  const firstResearchTech = sortedResearchQueue[0]?.researchId;
  const generalResearchTarget = firstResearchTech
    ? getMinistryResearchRoute(firstResearchTech)
    : 'ministry_science_research';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {/* Buildings Under Construction (50%) */}
      <div className={S.cardDeep}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">🏗️ Edificios en Curso</h3>
          {onNavigate && (
            <button
              onClick={() => onNavigate('buildings')}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              Ir a Obras ➔
            </button>
          )}
        </div>
        {planetBuildQueue.length > 0 ? (
          <div className="flex flex-col h-full justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
              {/* Left Column (1-4) */}
              <div className="space-y-2">
                {planetBuildQueue.slice(0, 4).map((item, idx) => {
                  const info = BUILDINGS[item.buildingId];
                  const remaining = calcRemainingSeconds(item.endTime);
                  const total = calcTotalSeconds(item.startTime, item.endTime);
                  return (
                    <div key={item.id || idx} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-slate-200">{info?.icon} {info?.name} <span className="text-xs text-slate-400">→ Nv.{item.level}</span></span>
                        <span className="text-xs font-mono text-cyan-400">{fmtTime(remaining)}</span>
                      </div>
                      <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                      <div className="text-right mt-1">
                        <button onClick={() => dispatch({ type: "CANCEL_BUILD_QUEUE", queueId: item.id })} className="text-[10px] text-red-400 hover:text-red-300">✕ Cancelar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Right Column (5-8) */}
              <div className="space-y-2">
                {planetBuildQueue.slice(4, 8).map((item, idx) => {
                  const info = BUILDINGS[item.buildingId];
                  const remaining = calcRemainingSeconds(item.endTime);
                  const total = calcTotalSeconds(item.startTime, item.endTime);
                  return (
                    <div key={item.id || idx + 4} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-slate-200">{info?.icon} {info?.name} <span className="text-xs text-slate-400">→ Nv.{item.level}</span></span>
                        <span className="text-xs font-mono text-cyan-400">{fmtTime(remaining)}</span>
                      </div>
                      <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                      <div className="text-right mt-1">
                        <button onClick={() => dispatch({ type: "CANCEL_BUILD_QUEUE", queueId: item.id })} className="text-[10px] text-red-400 hover:text-red-300">✕ Cancelar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
            Sin construcciones en curso.
          </div>
        )}
      </div>

      {/* Research in progress */}
      <div className={S.cardDeep}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            🔬 Investigaciones
          </h3>
          {onNavigate && (
            <button
              onClick={() => onNavigate(generalResearchTarget)}
              className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all cursor-pointer"
            >
              Ir a I+D ➔
            </button>
          )}
        </div>

        {sortedResearchQueue.length > 0 ? (
          <div className="flex flex-col h-full justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
              {/* Left Column (1-4) */}
              <div className="space-y-2">
                {sortedResearchQueue.slice(0, 4).map((item, idx) => {
                  const info = RESEARCH[item.researchId];
                  const remaining = calcRemainingSeconds(item.endTime);
                  const total = calcTotalSeconds(item.startTime, item.endTime);
                  const destTab = getMinistryResearchRoute(item.researchId);

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => onNavigate && onNavigate(destTab)}
                      className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 hover:border-purple-400/60 hover:bg-slate-900/60 transition-all cursor-pointer group"
                      title="Ver investigación en su ministerio"
                    >
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                          {info?.icon} {info?.name}
                          <span className="text-xs text-slate-400">
                            {" "}
                            → Nv.{item.level}
                          </span>
                        </span>

                        <span className="text-xs font-mono text-purple-400">
                          {fmtTime(remaining)}
                        </span>
                      </div>

                      <ProgressBar
                        value={total - remaining}
                        max={total}
                        color="from-purple-500 to-indigo-500"
                      />

                      <div className="text-right mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({
                              type: "CANCEL_RESEARCH_QUEUE",
                              queueId: item.id,
                            });
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300"
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column (5-8) */}
              <div className="space-y-2">
                {sortedResearchQueue.slice(4, 8).map((item, idx) => {
                  const info = RESEARCH[item.researchId];
                  const remaining = calcRemainingSeconds(item.endTime);
                  const total = calcTotalSeconds(item.startTime, item.endTime);
                  const destTab = getMinistryResearchRoute(item.researchId);

                  return (
                    <div
                      key={item.id || idx + 4}
                      onClick={() => onNavigate && onNavigate(destTab)}
                      className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 hover:border-purple-400/60 hover:bg-slate-900/60 transition-all cursor-pointer group"
                      title="Ver investigación en su ministerio"
                    >
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                          {info?.icon} {info?.name}
                          <span className="text-xs text-slate-400">
                            {" "}
                            → Nv.{item.level}
                          </span>
                        </span>

                        <span className="text-xs font-mono text-purple-400">
                          {fmtTime(remaining)}
                        </span>
                      </div>

                      <ProgressBar
                        value={total - remaining}
                        max={total}
                        color="from-purple-500 to-indigo-500"
                      />

                      <div className="text-right mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({
                              type: "CANCEL_RESEARCH_QUEUE",
                              queueId: item.id,
                            });
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300"
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
            Sin investigaciones en curso.
          </div>
        )}
      </div>
    </div>
  );
};
