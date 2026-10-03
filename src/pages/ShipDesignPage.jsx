import React, { useState } from 'react';
import { SafeImg } from '../assets.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { ShipChassisSelector } from '../components/shipDesign/ShipChassisSelector.jsx';
import { ShipModuleSlots } from '../components/shipDesign/ShipModuleSlots.jsx';
import { ShipBlueprintSchematic } from '../components/shipDesign/ShipBlueprintSchematic.jsx';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const ShipDesignPage = ({
  state,
  dispatch,
  currentPlanet,
  production,
  SHIP_CHASSIS,
  SHIP_WEAPONS,
  SHIP_ENGINES,
  SHIP_SHIELDS,
  SHIP_MODULES,
  S,
  ProgressBar,
  fmt,
  fmtTime,
  shipTimeBonus,
  calcCustomShipStats,
  calcCustomShipCost,
  calcCustomShipTime,
  canAfford,
  GAME_SPEED
}) => {
  const { navigateBack } = useNavigation();
  const [step, setStep] = useState(0); // 0=list, 1=editor
  const [editBlueprint, setEditBlueprint] = useState(null);
  const [bpName, setBpName] = useState('');
  const [bpChassis, setBpChassis] = useState('');
  const [bpWeapon, setBpWeapon] = useState('');
  const [bpEngine, setBpEngine] = useState('');
  const [bpShield, setBpShield] = useState('');
  const [bpModules, setBpModules] = useState([]);

  const hasShipyard = currentPlanet.buildings?.customShipyard > 0;

  const startNew = () => {
    setEditBlueprint(null); setBpName(''); setBpChassis(''); setBpWeapon('');
    setBpEngine(''); setBpShield(''); setBpModules([]); setStep(1);
  };

  const editExisting = (bp) => {
    setEditBlueprint(bp); setBpName(bp.name); setBpChassis(bp.chassis);
    setBpWeapon(bp.weapon || ''); setBpEngine(bp.engine || '');
    setBpShield(bp.shield || ''); setBpModules(bp.modules || []); setStep(1);
  };

  const toggleModule = (modId) => {
    setBpModules(prev => prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]);
  };

  const currentBp = {
    name: bpName, chassis: bpChassis, weapon: bpWeapon,
    engine: bpEngine, shield: bpShield, modules: bpModules,
  };
  const stats = bpChassis ? calcCustomShipStats(currentBp) : null;
  const buildCost = bpChassis ? calcCustomShipCost(currentBp, currentPlanet.buildings?.constructionCenter || 0) : null;
  const buildTime = bpChassis && hasShipyard ? calcCustomShipTime(currentBp, currentPlanet.buildings?.shipyard || 1, currentPlanet.buildings?.naniteFactory || 0, GAME_SPEED, shipTimeBonus(currentPlanet.buildings)) : 0;

  const handleSave = () => {
    if (!bpName.trim() || !bpChassis) return;
    dispatch({
      type: 'SAVE_BLUEPRINT',
      blueprint: {
        id: editBlueprint ? editBlueprint.id : Date.now().toString(),
        name: bpName.trim(),
        chassis: bpChassis,
        weapon: bpWeapon,
        engine: bpEngine,
        shield: bpShield,
        modules: bpModules,
      },
    });
    setStep(0);
  };

  const handleDelete = (bpId) => {
    dispatch({ type: 'DELETE_BLUEPRINT', blueprintId: bpId });
  };

  const handleBuildCustom = (bp) => {
    if (!hasShipyard) return;
    dispatch({ type: 'BUILD_CUSTOM_SHIP', blueprintId: bp.id, quantity: 1, planetId: currentPlanet.id });
  };

  return (
    <div className="space-y-4">
      {/* DOM Superior Estandarizado (Recursos + Explorador + Planos Status) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={step === 1 ? `Diseñador de Naves (${bpName || 'Borrador'})` : 'Diseñador de Naves'}
        breadcrumbIcon="🛠️"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom="Mando Imperial"
        backButtonIcon="👑"
        onBackToAltoMando={() => {
          if (navigateBack) navigateBack();
        }}
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Planos:</span>
              <span className="font-bold text-cyan-300">{(state.blueprints || []).length}/10</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
              hasShipyard ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-slate-900/60 border-white/10 text-slate-400'
            }`}>
              <span>{hasShipyard ? '⚡ Astillero Activo' : '🔒 Requiere Astillero'}</span>
            </div>
          </div>
        }
      />

      {/* Vista 0: Catálogo de Diseños */}
      {step === 0 && (
        <div className="space-y-6 view-enter">
          <div className="w-full space-y-3 py-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
                <span>🔧</span>
                <span>Mesa de Diseño y Planos Estelares</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {(state.blueprints || []).length} Planos Registrados
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full items-stretch pt-2 pb-4">
              <button
                onClick={startNew}
                className="group relative flex flex-col items-center justify-center p-6 rounded-3xl border border-dashed border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all cursor-pointer min-h-[260px] text-center"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Diseñar Nueva Nave</h4>
                <p className="text-[11px] text-slate-400 font-mono mt-1">Configura fuselaje, motores y ranuras de armas personalizadas</p>
              </button>

              {(state.blueprints || []).map(bp => {
                const bpStats = calcCustomShipStats(bp);
                const cost = calcCustomShipCost(bp, currentPlanet.buildings?.constructionCenter || 0);
                const affordable = canAfford(currentPlanet.resources, cost);
                const ch = SHIP_CHASSIS[bp.chassis];

                return (
                  <div key={bp.id} className="p-4 rounded-3xl bg-[#090d1f]/90 border border-white/10 flex flex-col justify-between min-h-[260px]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{ch?.icon || '🚀'}</span>
                        <div className="flex gap-1">
                          <button onClick={() => editExisting(bp)} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-cyan-300 cursor-pointer">Editar</button>
                          <button onClick={() => handleDelete(bp.id)} className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 text-[10px] font-mono text-red-300 cursor-pointer">Borrar</button>
                        </div>
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wide truncate">{bp.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 block mb-2">{ch?.name || bp.chassis}</span>

                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono p-2 rounded-xl bg-black/40 border border-white/5 mb-3">
                        <div>⚔️ Atk: <strong className="text-white">{bpStats.atk}</strong></div>
                        <div>🛡️ Shd: <strong className="text-white">{bpStats.shd}</strong></div>
                        <div>💪 Hull: <strong className="text-white">{bpStats.hull}</strong></div>
                        <div>🚀 Vel: <strong className="text-white">{fmt(bpStats.speed)}</strong></div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 space-y-0.5 mb-3">
                        <div>⛏️ Metal: {fmt(cost.metal)}</div>
                        <div>💎 Cristal: {fmt(cost.crystal)}</div>
                        {cost.deuterium > 0 && <div>⚗️ Deuterio: {fmt(cost.deuterium)}</div>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuildCustom(bp)}
                      disabled={!hasShipyard || !affordable}
                      className={`w-full py-2 rounded-xl font-bold font-mono text-xs uppercase transition-all cursor-pointer ${
                        hasShipyard && affordable
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                          : 'bg-white/10 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {!hasShipyard ? 'Requiere Astillero Especial' : affordable ? 'Construir Unidad' : 'Recursos Insuficientes'}
                    </button>
                  </div>
                );
              })}

              <ActionCardTile
                type="back"
                title="Volver"
                subtitle="Regresar a la pantalla anterior"
                badgeText="VOLVER"
                onClick={() => {
                  if (navigateBack) navigateBack();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vista 1: Editor de Fuselaje y Ranuras */}
      {step === 1 && (
        <div className="space-y-6 view-enter">
          <div className="p-6 rounded-3xl bg-[#090d1f]/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">Nombre del Modelo</label>
              <input
                type="text"
                value={bpName}
                onChange={e => setBpName(e.target.value)}
                placeholder="Ej. Fragata Clase Éxodo..."
                className="w-full bg-[#05070f] border border-white/20 rounded-xl px-4 py-2 text-white font-bold text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(0)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer">Cancelar</button>
              <button onClick={handleSave} disabled={!bpName.trim() || !bpChassis || (stats && stats.slotsUsed > stats.slotsMax)} className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">Guardar Plano</button>
            </div>
          </div>

          <ShipChassisSelector SHIP_CHASSIS={SHIP_CHASSIS} bpChassis={bpChassis} setBpChassis={setBpChassis} fmt={fmt} />

          {bpChassis && (
            <ShipBlueprintSchematic
              chassis={bpChassis}
              weapon={bpWeapon}
              engine={bpEngine}
              shield={bpShield}
              modules={bpModules}
              stats={stats}
              SHIP_CHASSIS={SHIP_CHASSIS}
              SHIP_WEAPONS={SHIP_WEAPONS}
              SHIP_ENGINES={SHIP_ENGINES}
              SHIP_SHIELDS={SHIP_SHIELDS}
              SHIP_MODULES={SHIP_MODULES}
            />
          )}

          {bpChassis && (
            <ShipModuleSlots
              stats={stats}
              bpWeapon={bpWeapon}
              setBpWeapon={setBpWeapon}
              SHIP_WEAPONS={SHIP_WEAPONS}
              bpEngine={bpEngine}
              setBpEngine={setBpEngine}
              SHIP_ENGINES={SHIP_ENGINES}
              bpShield={bpShield}
              setBpShield={setBpShield}
              SHIP_SHIELDS={SHIP_SHIELDS}
              bpModules={bpModules}
              toggleModule={toggleModule}
              SHIP_MODULES={SHIP_MODULES}
              fmt={fmt}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ShipDesignPage;
