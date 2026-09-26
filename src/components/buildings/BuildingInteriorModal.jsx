import React, { useState } from 'react';
import { BUILDING_OPERATIONS, MINISTRY_MAPPING } from '../../data/buildingOperationsData.js';
import { buildingCost, canAfford, calcRequiredPopulation, meetsReq, fmt, BUILDINGS } from '../../core.jsx';

export const BuildingInteriorModal = ({
  buildingId,
  buildingData,
  level,
  planet,
  state,
  dispatch,
  onClose
}) => {
  const opData = BUILDING_OPERATIONS[buildingId];
  const ministry = opData ? MINISTRY_MAPPING[opData.ministry] : null;

  // Modos activos guardados en el planeta para este edificio (o 'standard' / primero por defecto)
  const currentModeId = planet?.buildingModes?.[buildingId] || opData?.modes?.[0]?.id || 'standard';
  const [activeMode, setActiveMode] = useState(currentModeId);
  const [feedback, setFeedback] = useState(null);

  if (!opData) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl max-w-md w-full text-center space-y-4">
          <div className="text-3xl">{buildingData?.icon || '🏗️'}</div>
          <h2 className="text-xl font-bold text-white">{buildingData?.name || 'Instalación'}</h2>
          <p className="text-sm text-slate-400">
            Esta instalación opera en régimen pasivo continuo integrado en la red colonial.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium border border-slate-600 transition"
          >
            Cerrar Consola
          </button>
        </div>
      </div>
    );
  }

  const handleSelectMode = (modeId) => {
    setActiveMode(modeId);
    if (dispatch) {
      dispatch({
        type: 'SET_BUILDING_MODE',
        planetId: planet.id,
        buildingId,
        modeId
      });
    }
    setFeedback(`Modo "${opData.modes.find(m => m.id === modeId)?.name}" sincronizado con éxito.`);
    if (window.playSfx) window.playSfx('click');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExecuteAction = (action) => {
    const res = planet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
    const cost = action.cost || {};
    const canAfford = (!cost.metal || res.metal >= cost.metal) &&
                      (!cost.crystal || res.crystal >= cost.crystal) &&
                      (!cost.deuterium || res.deuterium >= cost.deuterium);

    if (!canAfford) {
      setFeedback('⚠️ Recursos insuficientes para ejecutar este protocolo.');
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (dispatch) {
      dispatch({
        type: 'EXECUTE_BUILDING_ACTION',
        planetId: planet.id,
        buildingId,
        actionId: action.id,
        cost: action.cost
      });
    }

    setFeedback(`Protocolo "${action.name}" ejecutado.`);
    if (window.playSfx) window.playSfx('build');
    setTimeout(() => setFeedback(null), 3500);
  };

  // Cálculo de coste y requisitos para ampliar de nivel este edificio directamente
  const planetBuildQueue = (state?.buildQueue || []).filter(q => q.planetId === planet?.id);
  const queuedCount = planetBuildQueue.filter(q => q.buildingId === buildingId).length;
  const nextLvl = level + queuedCount + 1;
  const bData = buildingData || (BUILDINGS && BUILDINGS[buildingId]) || {};
  const cost = buildingCost ? buildingCost(buildingId, nextLvl - 1, planet?.buildings?.constructionCenter || 0) : {};
  const affordable = canAfford ? canAfford(planet?.resources || {}, cost) : false;
  const meets = meetsReq ? meetsReq(bData?.req, { ...(planet?.buildings || {}), ...(state?.research || {}) }) : true;
  const currentPop = planet?.population || 1000;
  const reqPop = calcRequiredPopulation ? calcRequiredPopulation(buildingId, nextLvl) : 0;
  const hasPop = currentPop >= reqPop;
  const queueFull = planetBuildQueue.length >= 8;
  const canBuildNow = affordable && meets && hasPop && !queueFull;

  const handleBuildUpgrade = () => {
    if (!canBuildNow || !dispatch) return;
    dispatch({ type: 'START_BUILDING', buildingId, planetId: planet?.id });
    setFeedback(`Orden de construcción emitida: ${bData?.name || 'Edificio'} Nv.${nextLvl}`);
    if (window.playSfx) window.playSfx('build');
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-2xl max-w-2xl w-full shadow-2xl shadow-cyan-950/50 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Cabecera de la Consola con Botón de Construir/Ampliar integrado */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-inner shrink-0">
              {buildingData?.icon || '🏛️'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white tracking-wide truncate">{buildingData?.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shrink-0">
                  NIVEL {level}
                </span>
                {queuedCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 shrink-0">
                    +{queuedCount} en cola
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <span>{opData.title}</span>
                {ministry && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded border border-slate-700 text-slate-300 bg-slate-800/80 shrink-0">
                    {ministry.icon} {ministry.name}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón Construir / Ampliar */}
            <button
              type="button"
              onClick={handleBuildUpgrade}
              disabled={!canBuildNow}
              title={
                !meets ? 'Requisitos no cumplidos' :
                !hasPop ? `Falta población (${currentPop}/${reqPop})` :
                queueFull ? 'Cola de construcción llena (8/8)' :
                !affordable ? 'Recursos insuficientes' :
                `Construir Nivel ${nextLvl}`
              }
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                canBuildNow
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95'
                  : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>🏗️</span>
              <span>
                {canBuildNow 
                  ? `Construir (Nv.${nextLvl})` 
                  : !affordable 
                  ? 'Sin recursos' 
                  : !hasPop 
                  ? 'Falta Población' 
                  : queueFull 
                  ? 'Cola llena (8/8)' 
                  : `Nv.${nextLvl}`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/80 rounded-lg transition cursor-pointer"
              aria-label="Cerrar consola"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notificación Feedback */}
        {feedback && (
          <div className="bg-cyan-950/90 border-b border-cyan-500/50 text-cyan-300 text-xs px-4 py-2 font-mono flex items-center justify-between animate-in slide-in-from-top-2">
            <span>{feedback}</span>
          </div>
        )}

        {/* Contenido Modular */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* SECCIÓN 1: MODOS OPERATIVOS */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span>⚙️</span> Régimen Operativo de la Instalación
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">1 seleccionado activo</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {opData.modes.map(mode => {
                const isSelected = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleSelectMode(mode.id)}
                    className={`p-3.5 rounded-xl text-left border transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {mode.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                            EN LÍNEA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{mode.desc}</p>
                    </div>
                    <div className="mt-1">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-cyan-400 bg-cyan-950' : 'border-slate-600'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 2: PROTOCOLOS Y ACCIONES ACTIVAS */}
          {opData.actions && opData.actions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>⚡</span> Protocolos y Directivas Inmediatas
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Ejecución instantánea</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {opData.actions.map(action => (
                  <div
                    key={action.id}
                    className="p-3.5 bg-slate-900/70 border border-slate-800/90 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-medium text-white">{action.name}</h4>
                      <p className="text-xs text-slate-400">{action.desc}</p>
                      {action.cost && Object.keys(action.cost).length > 0 && (
                        <div className="text-[11px] font-mono text-amber-300/90 flex gap-2 pt-1">
                          {action.cost.metal && <span>⛏️ {action.cost.metal} Metal</span>}
                          {action.cost.crystal && <span>💎 {action.cost.crystal} Cristal</span>}
                          {action.cost.deuterium && <span>⚗️ {action.cost.deuterium} Deuterio</span>}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleExecuteAction(action)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold rounded-lg shadow-md transition whitespace-nowrap active:scale-95"
                    >
                      Ejecutar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: FICHA DE AUTOGESTIÓN MINISTERIAL */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span>🏛️</span> Supervisión Delegada de Estado
              </span>
              <span className="text-emerald-400 font-mono">Conectado a Red Gubernamental</span>
            </div>
            <p>
              Este complejo está subordinado a las directrices emitidas por el {ministry?.name || 'Gabinete'}.
              Las políticas de autogestión y cuotas de presupuesto asignadas en la sede ministerial regirán su operación en caso de emergencia colonial.
            </p>
          </div>

        </div>

        {/* Barra de Estado Inferior */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Terminal: {planet?.name || 'Colonia'} // ID: {buildingId}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition"
          >
            Salir de la Consola
          </button>
        </div>

      </div>
    </div>
  );
};
