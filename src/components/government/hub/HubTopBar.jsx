import React from 'react';
import { TacticalResourceRow } from '../../ui/TacticalResourceRow.jsx';
import { SafeImg } from '../../../assets.jsx';
import { getEffectiveTech, getDefenseStats } from '../../../utils/formulas.js';
import { IndependentReturnCard } from '../../navigation/IndependentReturnCard.jsx';

/**
 * HubTopBar — Barra superior estandarizada con telemetría de recursos y navegación de los hubs de mando.
 * Con botón volver desacoplado como tarjeta independiente y DOM superior de 2 filas con separador horizontal.
 */
export const HubTopBar = React.memo(({
  dispatch,
  currentPlanet,
  production,
  state,
  fmt,
  onBackToEmpire,
  hubLabel = 'Alto Mando',
  backButtonLabelTop = 'VOLVER A',
  backButtonLabelBottom = 'Imperio',
  backButtonIcon = '🪐',
  showResources = true,
  isReordering,
  onToggleReorder,
  onResetOrder
}) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState('');

  const handleSaveRename = () => {
    const trimmed = tempName.trim();
    if (trimmed && currentPlanet?.id && dispatch) {
      dispatch({ type: 'RENAME_PLANET', planetId: currentPlanet.id, name: trimmed.slice(0, 20) });
      if (window.playSfx) window.playSfx('tradeSuccess');
    }
    setIsEditingName(false);
  };

  return (
    <div className="relative z-30 flex flex-col xl:flex-row items-stretch gap-3 mb-4 w-full">
      {/* === DOM SUPERIOR: 2 FILAS CON SEPARADOR HORIZONTAL Y ANCHO COMPLETO === */}
      <section className="flex-1 min-w-0 bg-black/85 backdrop-blur-md rounded-2xl border border-white/10 text-xs font-mono shadow-2xl flex flex-col justify-between">
        {/* FILA SUPERIOR: Recursos Tácticos Ancho Completo */}
        <div className="w-full overflow-visible">
          {showResources ? (
            <TacticalResourceRow
              currentPlanet={currentPlanet}
              production={production}
              state={state}
              fmt={fmt}
              className="rounded-t-2xl overflow-visible border-b-0 w-full"
            >
              <div className="w-[1px] h-5 bg-white/15 shrink-0" />
              {/* Bastión Planetario */}
              {(() => {
                const defenses = currentPlanet?.defenses || {};
                const totalBatteries = Object.values(defenses).reduce((acc, qty) => acc + (qty || 0), 0);
                if (totalBatteries <= 0) return null;
                const effTech = getEffectiveTech(currentPlanet, state?.research);
                const faction = state?.faction || "human";
                let totalFirepower = 0;
                let totalShields = 0;
                for (const [defId, count] of Object.entries(defenses)) {
                  if (count > 0) {
                    const stats = getDefenseStats(defId, effTech, faction, currentPlanet?.buildings || {}, state?.relics || []);
                    if (stats) {
                      totalFirepower += (stats.atk || 0) * count;
                      totalShields += (stats.shd || 0) * count;
                    }
                  }
                }
                return (
                  <div key="bastion-telemetry" className="flex items-center">
                    <div className="w-[1px] h-5 bg-white/15 shrink-0" />
                    <div className="relative group/res flex items-center gap-2 px-2.5 hover:bg-white/5 rounded-lg transition-colors whitespace-nowrap cursor-help shrink-0" title="Bastión Planetario">
                      <span className="text-xl">🛡️</span>
                      <div className="flex items-baseline leading-none">
                        <span className="font-black text-rose-400 text-base md:text-lg">
                          {fmt ? fmt(totalFirepower) : totalFirepower}
                        </span>
                      </div>
                      <div className="hidden group-hover/res:block z-[120]">
                        <div className="absolute top-full right-0 mt-2 w-80 max-w-[320px] bg-[#060a18] border border-rose-500/50 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(244,63,94,0.2)] z-[120] text-left font-mono text-xs pointer-events-none whitespace-normal break-words">
                          <div className="flex items-center gap-2 border-b border-rose-500/30 pb-1.5 mb-2 font-bold text-white">
                            <span className="text-base">🛡️</span>
                            <span className="text-rose-300 uppercase tracking-wider">Bastión Planetario</span>
                          </div>
                          <div className="space-y-1 text-slate-300 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Potencia de Fuego (⚡):</span>
                              <span className="font-bold text-rose-400">{fmt ? fmt(totalFirepower) : totalFirepower}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Escudos Defensivos (🛡️):</span>
                              <span className="font-bold text-cyan-300">{fmt ? fmt(totalShields) : totalShields}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Baterías Desplegadas:</span>
                              <span className="font-bold text-white">{fmt ? fmt(totalBatteries) : totalBatteries} unidades</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 mt-1 leading-relaxed whitespace-normal break-words">
                              Defensas activas de superficie del planeta: torretas láser, cañones gauss, plasma y cúpulas de escudo.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </TacticalResourceRow>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-xl">🏛️</span>
              <div className="flex items-baseline leading-none">
                <span className="font-black text-purple-400 text-base md:text-lg">
                  {fmt ? fmt(state?.influence || 0) : (state?.influence || 0)}
                </span>
              </div>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {state?.planets?.length || 0} mundos · sin sede planetaria
              </span>
            </div>
          )}
        </div>

        {/* Separador Horizontal */}
        <div className="w-full h-[1px] bg-white/10" />

        {/* FILA INFERIOR: Miga de Pan + Reordenar Tarjetas */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-black/20 rounded-b-2xl flex-wrap min-h-[44px]">
          <div className="flex items-center gap-2 flex-wrap">
            {onBackToEmpire && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    onBackToEmpire();
                  }}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl transition-all text-slate-300 hover:text-white hover:bg-white/10 font-bold cursor-pointer text-sm"
                  title="Volver a la superficie del Imperio"
                >
                  <span className="text-base">⚜️</span>
                  <span>Imperio</span>
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>

                {/* Botón directo a Mundos del Imperio */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.playSfx) window.playSfx('click');
                    try {
                      if (typeof window !== "undefined") {
                        window.sessionStorage.setItem("ascension_target_section", "planets");
                      }
                      window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets' } }));
                    } catch (_) {}
                    onBackToEmpire();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 font-bold text-xs transition-all cursor-pointer"
                  title="Volver a Mundos del Imperio"
                >
                  <span className="text-sm">🌍</span>
                  <span>Mundos del Imperio</span>
                </button>
                <span className="text-slate-600 font-bold text-sm">/</span>

                {/* Etiqueta del Planeta interactiva con renombrado directo */}
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/90 border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    <input
                      type="text"
                      value={tempName}
                      maxLength={20}
                      autoFocus
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                      className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none w-28 px-1"
                    />
                    <button
                      type="button"
                      onClick={handleSaveRename}
                      className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer"
                      title="Guardar nuevo nombre"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-[10px] cursor-pointer"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.playSfx) window.playSfx('click');
                        const planetName = currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || '';
                        try {
                          window.dispatchEvent(new CustomEvent('ascension:open-section', { detail: { section: 'planets', filter: planetName } }));
                        } catch (_) {}
                        onBackToEmpire();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all cursor-pointer"
                      title="Ver este mundo en el Catálogo de Mundos del Imperio"
                    >
                      <span className="text-sm">🪐</span>
                      <span>{currentPlanet?.name || state?.planets?.find(p => p.isHome)?.name || 'Capital'}</span>
                      {currentPlanet?.galaxy !== undefined && (
                        <span className="text-cyan-400 font-mono text-[11px] font-black">
                          [{currentPlanet.galaxy}:{currentPlanet.system}:{currentPlanet.position}]
                        </span>
                      )}
                    </button>
                  </div>
                )}
                <span className="text-slate-600 font-bold text-sm">/</span>
              </>
            )}

            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="text-base">👑</span>
              <span>{hubLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* === TARJETA INDEPENDIENTE Y SEPARADA DE VOLVER A IMPERIO / ALTO MANDO === */}
      {onBackToEmpire && (
        <div className="shrink-0 w-full xl:w-52 flex items-stretch">
          <IndependentReturnCard
            onClick={onBackToEmpire}
            labelTop={backButtonLabelTop}
            labelBottom={backButtonLabelBottom}
            icon={backButtonIcon}
            imgId="deepColonizationPsych"
            accentColor="cyan"
          />
        </div>
      )}
    </div>
  );
});

export default HubTopBar;
