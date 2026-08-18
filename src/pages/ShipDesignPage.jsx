import React, { useState } from 'react';

const ShipDesignPage = ({ state, dispatch, currentPlanet, SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES, S, ProgressBar, fmt, fmtTime, shipTimeBonus, calcCustomShipStats, calcCustomShipCost, calcCustomShipTime, canAfford, GAME_SPEED }) => {
  const [step, setStep] = useState(0); // 0=list, 1=editor
  const [editBlueprint, setEditBlueprint] = useState(null);
  const [bpName, setBpName] = useState('');
  const [bpChassis, setBpChassis] = useState('');
  const [bpWeapon, setBpWeapon] = useState('');
  const [bpEngine, setBpEngine] = useState('');
  const [bpShield, setBpShield] = useState('');
  const [bpModules, setBpModules] = useState([]);

  const hasShipyard = currentPlanet.buildings.customShipyard > 0;

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
  const buildTime = bpChassis && hasShipyard ? calcCustomShipTime(currentBp, currentPlanet.buildings.shipyard, currentPlanet.buildings.naniteFactory || 0, GAME_SPEED, shipTimeBonus(currentPlanet.buildings)) : 0;

  const customFleet = Object.entries(currentPlanet.fleet || {}).filter(([id]) => id.startsWith('custom_'));

  if (!hasShipyard) {
    return (
      <div className={`${S.card} text-center py-12`}>
        <div className="text-6xl mb-4">🔧</div>
        <h3 className="text-xl mb-2">Fábrica de Naves Personalizadas requerida</h3>
        <p className="text-slate-400">Construye la Fábrica de Naves Personalizadas en Edificios → Avanzados.</p>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setStep(0)} className={`${S.btn} ${S.btnGhost}`}>← Volver</button>
          <h3 className="text-lg font-semibold">
            {editBlueprint ? `Editando: ${editBlueprint.name}` : 'Nuevo Diseño'}
          </h3>
        </div>

        <div className={S.card}>
          <label className="text-sm text-slate-400 block mb-1">Nombre de la nave</label>
          <input type="text" className={S.input} value={bpName} onChange={e => setBpName(e.target.value)} placeholder="Mi nave personalizada..." maxLength={30} />
        </div>

        <div className={S.card}>
          <h4 className="font-semibold mb-3">1. Chasis (define capacidad base)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(SHIP_CHASSIS).map(([id, c]) => (
              <button key={id} onClick={() => setBpChassis(id)}
                className={`p-2 rounded-lg border text-left text-sm transition-all ${bpChassis === id ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'glass border-white/10 hover:border-[var(--ue-accent)]/30'}`}>
                <div className="flex items-center gap-2 mb-1"><span className="text-xl">{c.icon}</span><span className="font-semibold">{c.name}</span></div>
                <div className="text-xs text-slate-400">💪 {c.hull} 📦 {fmt(c.cargo)} 🚀 {fmt(c.speed)}</div>
                <div className="text-xs text-slate-400">Ranuras: {c.slots}</div>
              </button>
            ))}
          </div>
        </div>

        {bpChassis && (<>
          <div className={S.card}>
            <h4 className="font-semibold mb-3">2. Armamento ({stats?.slotsUsed || 0}/{stats?.slotsMax || 0} ranuras)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button key="none" onClick={() => setBpWeapon('')}
                className={`p-2 rounded-lg border text-center text-sm transition-all ${!bpWeapon ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'glass border-white/10 hover:border-[var(--ue-accent)]/30'}`}>
                <div className="text-xs">Ninguno</div>
              </button>
              {Object.entries(SHIP_WEAPONS).map(([id, w]) => (
                <button key={id} onClick={() => setBpWeapon(id)}
                  className={`p-2 rounded-lg border text-left text-sm transition-all ${bpWeapon === id ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{w.icon}</span><span className="font-semibold">{w.name}</span></div>
                  <div className="text-xs text-slate-400">⚔️ {w.atk} ⚡{w.energy} 🔲{w.slots}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={S.card}>
            <h4 className="font-semibold mb-3">3. Motor</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {/* Nota: Módulos nuevos como Sigilo (tradeoff velocidad) y Comercial (+cargo) tienen efectos negativos/positivos claros en stats. */}
              <button key="none" onClick={() => setBpEngine('')}
                className={`p-2 rounded-lg border text-center text-sm transition-all ${!bpEngine ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                <div className="text-xs">Ninguno</div>
              </button>
              {Object.entries(SHIP_ENGINES).map(([id, e]) => (
                <button key={id} onClick={() => setBpEngine(id)}
                  className={`p-2 rounded-lg border text-left text-sm transition-all ${bpEngine === id ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{e.icon}</span><span className="font-semibold">{e.name}</span></div>
                  <div className="text-xs text-slate-400">🚀 {fmt(e.speed)} ⚡{e.energy} 🔲{e.slots}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={S.card}>
            <h4 className="font-semibold mb-3">4. Escudo</h4>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
              <button key="none" onClick={() => setBpShield('')}
                className={`p-2 rounded-lg border text-center text-sm transition-all ${!bpShield ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                <div className="text-xs">Ninguno</div>
              </button>
              {Object.entries(SHIP_SHIELDS).map(([id, s]) => (
                <button key={id} onClick={() => setBpShield(id)}
                  className={`p-2 rounded-lg border text-left text-sm transition-all ${bpShield === id ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{s.icon}</span><span className="font-semibold">{s.name}</span></div>
                  <div className="text-xs text-slate-400">🛡️ {s.shd} ⚡{s.energy} 🔲{s.slots}</div>
                </button>
              ))}
            </div>
          </div>

          <div className={S.card}>
            <h4 className="font-semibold mb-3">5. Módulos especiales (opcional)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(SHIP_MODULES).map(([id, m]) => {
                const selected = bpModules.includes(id);
                return (
                  <button key={id} onClick={() => toggleModule(id)}
                    className={`p-2 rounded-lg border text-left text-sm transition-all ${selected ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/50' : 'bg-slate-955/50 border-slate-800 hover:border-slate-600'}`}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{m.icon}</span><span className="font-semibold">{m.name}</span></div>
                    <div className="text-[10px] text-slate-400">
                      🔲 {m.slots} slots | {
                        id === 'ionDeflector' ? '+40% Escudos, +20% Coste Cristal' :
                        id === 'plasmaInjector' ? '+35% Velocidad, +25% Coste Deut' :
                        id === 'gaussBattery' ? '+50% Ataque, -15% Velocidad' :
                        Object.entries(m.bonus).map(([k, v]) => `${k === 'cargo' ? 'Carga' : k === 'hull' ? 'Estructura' : k === 'speed' ? 'Velocidad' : k === 'atk' ? 'Ataque' : k === 'shd' ? 'Escudo' : k === 'energy' ? 'Energía' : k}+${v}`).join(' ')
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>)}

        {/* Preview */}
        {stats && (
          <div className={S.card}>
            <h4 className="font-semibold mb-3">📋 Vista previa: {bpName || 'Sin nombre'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">⚔️ Ataque</div>
                <div className="text-lg font-bold text-red-300">{stats.atk}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">🛡️ Escudo</div>
                <div className="text-lg font-bold text-blue-300">{stats.shd}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">💪 Hull</div>
                <div className="text-lg font-bold text-green-300">{fmt(stats.hull)}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">🚀 Velocidad</div>
                <div className="text-lg font-bold text-cyan-300">{fmt(stats.speed)}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">📦 Carga</div>
                <div className="text-lg font-bold text-amber-300">{fmt(stats.cargo)}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">⚡ Energía</div>
                <div className="text-lg font-bold text-yellow-300">{stats.energy}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">🔲 Ranuras</div>
                <div className="text-lg font-bold text-purple-300">{stats.slotsUsed}/{stats.slotsMax}</div>
              </div>
              <div className="glass-deep border border-white/10 fresnel specular rounded-lg p-2 text-center">
                <div className="text-xs text-slate-400">⏱️ Tiempo</div>
                <div className="text-lg font-bold text-cyan-300">{fmtTime(buildTime)}</div>
              </div>
            </div>
            {buildCost && (
              <div className="flex gap-4 text-xs mb-3">
                <span className="text-amber-400">⛏️ {fmt(buildCost.metal)}</span>
                <span className="text-cyan-400">💎 {fmt(buildCost.crystal)}</span>
                <span className="text-emerald-400">⚗️ {fmt(buildCost.deuterium)}</span>
              </div>
            )}
            <button
              onClick={() => dispatch({ type: 'SAVE_BLUEPRINT', blueprint: { ...currentBp, id: editBlueprint?.id } })}
              disabled={!bpName || !bpChassis}
              className={`w-full ${S.btn} ${bpName && bpChassis ? S.btnPrimary : S.btnGhost}`}
            >
              {editBlueprint ? '💾 Actualizar diseño' : '💾 Guardar diseño'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🔧 Diseño de Naves ({state.blueprints.length}/20)</h3>
        <button onClick={startNew} className={`${S.btn} ${S.btnPrimary}`}>+ Nuevo diseño</button>
      </div>

      {/* Custom ship queue */}
      {state.customShipQueue.filter(q => q.planetId === currentPlanet.id).length > 0 && (
        <div className={S.cardInner}>
          <h4 className="font-semibold mb-2 text-sm">🔧 Cola de fabricación</h4>
          {state.customShipQueue.filter(q => q.planetId === currentPlanet.id).map(item => {
            const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
            const total = (item.endTime - item.startTime) / 1000;
            return (
              <div key={item.id} className="bg-slate-955/50 rounded p-2 mb-2 flex items-center justify-between">
                <span className="text-sm">{item.quantity}x nave personalizada</span>
                <span className="text-xs text-cyan-400">{fmtTime(remaining)}</span>
                <div className="flex-1 mx-4">
                  <ProgressBar value={total - remaining} max={total} color="from-purple-500 to-pink-500" height="h-1.5" />
                </div>
                <button onClick={() => dispatch({ type: 'CANCEL_CUSTOM_SHIP_QUEUE', queueId: item.id })} className="text-[10px] text-red-400/50 hover:text-red-300 ml-2">✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom ships in hangar */}
      {customFleet.length > 0 && (
        <div className={S.card}>
          <h4 className="font-semibold mb-3">🚀 Naves personalizadas en hangar</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {customFleet.map(([id, qty]) => {
              const bp = state.blueprints.find(b => id === 'custom_' + b.id);
              return (
                <div key={id} className="bg-slate-955/50 rounded p-2 flex items-center gap-2">
                  <span className="text-2xl">{bp ? SHIP_CHASSIS[bp.chassis]?.icon : '🔧'}</span>
                  <div>
                    <div className="text-xs text-slate-400">{bp?.name || 'Personalizada'}</div>
                    <div className="text-sm font-semibold">{fmt(qty)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blueprint list */}
      {state.blueprints.length === 0 ? (
        <div className={`${S.card} text-center py-8`}>
          <div className="text-4xl mb-3">🔧</div>
          <p className="text-slate-400">No tienes diseños guardados. Crea tu primera nave personalizada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2 items-stretch">
          {state.blueprints.map(bp => {
            const s = calcCustomShipStats(bp);
            const c = calcCustomShipCost(bp, currentPlanet.buildings?.constructionCenter || 0);
            const chassis = SHIP_CHASSIS[bp.chassis];
            return (
              <div key={bp.id} className={S.card}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{chassis?.icon || '🔧'}</div>
                    <div>
                      <div className="font-semibold">{bp.name}</div>
                      <div className="text-xs text-slate-400">{chassis?.name || 'Sin chasis'}</div>
                    </div>
                  </div>
                  <button onClick={() => dispatch({ type: 'DELETE_BLUEPRINT', id: bp.id })} className="text-xs text-red-400 hover:text-red-300">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs mb-3 text-slate-400">
                  <div>⚔️ {s.atk}</div><div>🛡️ {s.shd}</div>
                  <div>💪 {fmt(s.hull)}</div><div>🚀 {fmt(s.speed)}</div>
                  <div>📦 {fmt(s.cargo)}</div><div>🔲 {s.slotsUsed}/{s.slotsMax}</div>
                </div>
                <div className="text-xs flex gap-2 mb-3 text-slate-400">
                  <span className="text-amber-400">⛏️ {fmt(c.metal)}</span>
                  <span className="text-cyan-400">💎 {fmt(c.crystal)}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => editExisting(bp)} className={`flex-1 ${S.btn} ${S.btnGhost} text-xs`}>✏️ Editar</button>
                  <button
                    onClick={() => {
                      const qty = 1;
                      const totalCost = { metal: c.metal * qty, crystal: c.crystal * qty, deuterium: c.deuterium * qty };
                      if (canAfford(currentPlanet.resources, totalCost)) {
                        dispatch({ type: 'BUILD_CUSTOM_SHIP', blueprintId: bp.id, quantity: qty });
                      }
                    }}
                    disabled={!canAfford(currentPlanet.resources, c) || !hasShipyard}
                    className={`flex-1 ${S.btn} text-xs ${canAfford(currentPlanet.resources, c) && hasShipyard ? S.btnPrimary : S.btnGhost}`}
                  >
                    Fabricar (1)
                  </button>
                  <button
                    onClick={() => {
                      const qty = 5;
                      const totalCost = { metal: c.metal * qty, crystal: c.crystal * qty, deuterium: c.deuterium * qty };
                      if (canAfford(currentPlanet.resources, totalCost)) {
                        dispatch({ type: 'BUILD_CUSTOM_SHIP', blueprintId: bp.id, quantity: qty });
                      }
                    }}
                    disabled={!canAfford(currentPlanet.resources, { metal: c.metal * 5, crystal: c.crystal * 5, deuterium: c.deuterium * 5 }) || !hasShipyard}
                    className={`flex-1 ${S.btn} text-xs ${canAfford(currentPlanet.resources, { metal: c.metal * 5, crystal: c.crystal * 5, deuterium: c.deuterium * 5 }) && hasShipyard ? S.btnPrimary : S.btnGhost}`}
                  >
                    +5
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipDesignPage;
