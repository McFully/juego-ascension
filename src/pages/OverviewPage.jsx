import React from 'react';

const OverviewPage = ({ state, dispatch, currentPlanet, production, storage, MISSIONS, BUILDINGS, RESEARCH, SHIPS, DEFENSES, S, QueueDisplay, ProgressBar, fmt, fmtTime, isOutdated }) => {
  const completedMissions = state.completedMissions || [];
  const activeMission = MISSIONS.find(m => !completedMissions.includes(m.id));

  return (
    <div className="space-y-2">
      {/* Row 1: Producción por Hora (50% Izquierda) | Almacenamiento, Recursos Globales y Defensas (50% Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left Half (50%): Production por Hora */}
        <div className={S.cardDeep + ' h-56 flex flex-col justify-between'}>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">📈 Producción por Hora</h3>
          {(() => {
            const pop = currentPlanet.population || 1000;
            const popMetal = Math.round(pop * 0.00002 * 3600);
            const popCrystal = Math.round(pop * 0.00001 * 3600);
            const popDeut = Math.round(pop * 0.000005 * 3600);
            const netMetal = Math.max(0, production.metal - popMetal);
            const netCrystal = Math.max(0, production.crystal - popCrystal);
            const netDeut = Math.max(0, production.deuterium - popDeut);

            return (
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-amber-400 font-bold">⛏️ Metal</span>
                    <span className="text-[9px] text-slate-400">Bruto: {fmt(production.metal)}</span>
                  </div>
                  <div className="text-base font-bold text-amber-300">+{fmt(netMetal)}/h</div>
                  <div className="flex justify-between text-[9px] text-slate-400 border-t border-amber-500/10 pt-0.5">
                    <span className="text-amber-400/80">👥 Civil: -{fmt(popMetal)}</span>
                    <span>{fmt(netMetal * 24)}/d</span>
                  </div>
                </div>
                <div className="glass-deep border border-[var(--ue-accent)]/20 rounded-xl p-2 flex flex-col justify-between fresnel specular">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-cyan-400 font-bold">💎 Cristal</span>
                    <span className="text-[9px] text-slate-400">Bruto: {fmt(production.crystal)}</span>
                  </div>
                  <div className="text-base font-bold text-cyan-300">+{fmt(netCrystal)}/h</div>
                  <div className="flex justify-between text-[9px] text-slate-400 border-t border-cyan-500/10 pt-0.5">
                    <span className="text-cyan-400/80">👥 Civil: -{fmt(popCrystal)}</span>
                    <span>{fmt(netCrystal * 24)}/d</span>
                  </div>
                </div>
                <div className="glass-deep border border-emerald-500/20 rounded-xl p-2 flex flex-col justify-between fresnel specular">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-400 font-bold">⚗️ Deut</span>
                    <span className="text-[9px] text-slate-400">Bruto: {fmt(production.deuterium)}</span>
                  </div>
                  <div className="text-base font-bold text-emerald-300">+{fmt(netDeut)}/h</div>
                  <div className="flex justify-between text-[9px] text-slate-400 border-t border-emerald-500/10 pt-0.5">
                    <span className="text-emerald-400/80">👥 Civil: -{fmt(popDeut)}</span>
                    <span>{fmt(netDeut * 24)}/d</span>
                  </div>
                </div>
                <div className={`rounded-lg p-2 border flex flex-col justify-between ${production.energyBalance >= 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-yellow-400 font-bold">⚡ Energía</span>
                    <span className="text-[9px] text-slate-400">Cons: -{fmt(production.energyCons)}</span>
                  </div>
                  <div className={`text-base font-bold ${production.energyBalance >= 0 ? 'text-yellow-300' : 'text-red-300'}`}>
                    {production.energyBalance >= 0 ? '+' : ''}{fmt(production.energyBalance)}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 border-t border-yellow-500/10 pt-0.5">
                    <span>Prod: {fmt(production.energyProd)}</span>
                    <span>{(production.ratio * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Half (50%): 3 Cards (Almacenamiento, Recursos Globales, Defensas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Storage */}
          <div className={S.cardDeep + ' h-56 flex flex-col justify-between'}>
            <h3 className="text-xs font-semibold mb-1 text-white truncate">📦 Almacenamiento</h3>
            {(() => { const vaultPct = Math.min(0.5, (currentPlanet.buildings.vault || 0) * 0.05); const vaultMult = 1 + vaultPct; return (
            <div className="space-y-2 flex-1 flex flex-col justify-center">
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-amber-400">⛏️ Metal</span>
                  <span className="text-slate-450">{fmt(currentPlanet.resources.metal)}</span>
                </div>
                <ProgressBar value={Math.min(currentPlanet.resources.metal, storage.metal * vaultMult)} max={storage.metal * vaultMult} color="from-amber-500 to-amber-600" height="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-cyan-400">💎 Cristal</span>
                  <span className="text-slate-450">{fmt(currentPlanet.resources.crystal)}</span>
                </div>
                <ProgressBar value={Math.min(currentPlanet.resources.crystal, storage.crystal * vaultMult)} max={storage.crystal * vaultMult} color="from-cyan-500 to-cyan-600" height="h-1.5" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span className="text-emerald-400">⚗️ Deuterio</span>
                  <span className="text-slate-450">{fmt(currentPlanet.resources.deuterium)}</span>
                </div>
                <ProgressBar value={Math.min(currentPlanet.resources.deuterium, storage.deuterium * vaultMult)} max={storage.deuterium * vaultMult} color="from-emerald-500 to-emerald-600" height="h-1.5" />
              </div>
            </div>
            )})()}
          </div>

          {/* Global Resources */}
          <div className={S.cardDeep + ' h-56 flex flex-col justify-between'}>
            <h3 className="text-xs font-semibold mb-1 text-white truncate">🌐 Recursos Globales</h3>
            <div className="grid grid-cols-1 gap-1.5 flex-1 justify-center">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5 flex justify-between items-center">
                <span className="text-[10px] text-amber-400">⛏️ Metal Total</span>
                <span className="text-xs font-bold text-amber-300">{fmt(state.planets.reduce((a, p) => a + p.resources.metal, 0))}</span>
              </div>
              <div className="glass-deep border border-[var(--ue-accent)]/20 rounded-xl px-2 py-1.5 flex justify-between items-center">
                <span className="text-[10px] text-cyan-400">💎 Cristal Total</span>
                <span className="text-xs font-bold text-cyan-300">{fmt(state.planets.reduce((a, p) => a + p.resources.crystal, 0))}</span>
              </div>
              <div className="glass-deep border border-emerald-500/20 rounded-xl px-2 py-1.5 flex justify-between items-center">
                <span className="text-[10px] text-emerald-400">⚗️ Deut Total</span>
                <span className="text-xs font-bold text-emerald-300">{fmt(state.planets.reduce((a, p) => a + p.resources.deuterium, 0))}</span>
              </div>
            </div>
          </div>

          {/* Defenses */}
          <div className={S.cardDeep + ' h-56 flex flex-col justify-between'}>
            <h3 className="text-xs font-semibold mb-1 text-white truncate">🛡️ Defensas</h3>
            {(() => {
              const defs = currentPlanet.defenses || {};
              const totalDefs = Object.values(defs).reduce((sum, q) => sum + (q || 0), 0);
              return (
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Defensivas</span>
                    <span className="text-base font-bold text-cyan-300">{fmt(totalDefs)}</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between text-slate-300">
                      <span>🚀 Lanzamisiles:</span>
                      <span className="font-mono text-cyan-400">{fmt(defs.rocketLauncher || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>🔴 Láseres:</span>
                      <span className="font-mono text-cyan-400">{fmt((defs.lightLaser || 0) + (defs.heavyLaser || 0))}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>🎯 Cañón Gauss:</span>
                      <span className="font-mono text-cyan-400">{fmt(defs.gaussCannon || 0)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Row 2: Edificios (50%) | Investigaciones (50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Buildings Under Construction (50%) */}
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">🏗️ Edificios en Curso</h3>
          {(() => {
            const planetBuildQueue = (state.buildQueue || []).filter(item => item.planetId === currentPlanet.id);
            return planetBuildQueue.length > 0 ? (
              <div className="flex flex-col h-full justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                  {/* Left Column (1-4) */}
                  <div className="space-y-2">
                    {planetBuildQueue.slice(0, 4).map((item, idx) => {
                      const info = BUILDINGS[item.buildingId];
                      const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
                      const total = (item.endTime - item.startTime) / 1000;
                      return (
                        <div key={item.id || idx} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-slate-200">{info?.icon} {info?.name} <span className="text-xs text-slate-400">→ Nv.{item.level}</span></span>
                            <span className="text-xs font-mono text-cyan-400">{fmtTime(remaining)}</span>
                          </div>
                          <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                          <div className="text-right mt-1">
                            <button onClick={() => dispatch({ type: 'CANCEL_BUILD_QUEUE', queueId: item.id })} className="text-[10px] text-red-400 hover:text-red-300">✕ Cancelar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Right Column (5-8) */}
                  <div className="space-y-2">
                    {planetBuildQueue.slice(4, 8).map((item, idx) => {
                      const info = BUILDINGS[item.buildingId];
                      const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
                      const total = (item.endTime - item.startTime) / 1000;
                      return (
                        <div key={item.id || idx + 4} className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3">
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-slate-200">{info?.icon} {info?.name} <span className="text-xs text-slate-400">→ Nv.{item.level}</span></span>
                            <span className="text-xs font-mono text-cyan-400">{fmtTime(remaining)}</span>
                          </div>
                          <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                          <div className="text-right mt-1">
                            <button onClick={() => dispatch({ type: 'CANCEL_BUILD_QUEUE', queueId: item.id })} className="text-[10px] text-red-400 hover:text-red-300">✕ Cancelar</button>
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
            );
          })()}
        </div>

{/* Research in progress */}
<div className={S.cardDeep}>
  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
    🔬 Investigaciones
  </h3>

  {state.researchQueue && state.researchQueue.length > 0 ? (
    <div className="flex flex-col h-full justify-between">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">

        {/* Left Column (1-4) */}
        <div className="space-y-2">
          {state.researchQueue.slice(0, 4).map((item, idx) => {
            const info = RESEARCH[item.researchId];
            const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
            const total = (item.endTime - item.startTime) / 1000;

            return (
              <div
                key={item.id || idx}
                className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3"
              >
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-medium text-slate-200">
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
                    onClick={() =>
                      dispatch({
                        type: "CANCEL_RESEARCH_QUEUE",
                        queueId: item.id,
                      })
                    }
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
          {state.researchQueue.slice(4, 8).map((item, idx) => {
            const info = RESEARCH[item.researchId];
            const remaining = Math.max(0, (item.endTime - Date.now()) / 1000);
            const total = (item.endTime - item.startTime) / 1000;

            return (
              <div
                key={item.id || idx + 4}
                className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-3"
              >
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-medium text-slate-200">
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
                    onClick={() =>
                      dispatch({
                        type: "CANCEL_RESEARCH_QUEUE",
                        queueId: item.id,
                      })
                    }
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
</div>   {/* cierra Research */}

</div>   {/* <-- ESTE FALTA. Cierra Row 2 */}

      {/* Row 3: Especialización (50%) | Flota (16.6%) | Modernización (16.6%) | Alianzas (16.6%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Planetary Specialization and Administration (50%) */}
        <div className={S.cardDeep}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2 text-white">🌟 Especialización y Administración</h3>
              <p className="text-xs text-slate-400">
                Especializa este planeta para obtener bonificaciones permanentes de producción, investigación, milicia o comercio.
              </p>
            </div>
            {!currentPlanet.isHome && (
              <div className="flex items-center gap-2 glass-deep p-2 rounded-xl border border-white/10 fresnel shrink-0">
                <label className="text-xs text-[var(--ue-text-dim)] cursor-pointer flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={!!currentPlanet.autoTrade}
                    onChange={() => dispatch({ type: 'PLANET_TOGGLE_AUTOTRADE', planetId: currentPlanet.id })}
                    className="rounded border-white/20 text-[var(--ue-accent)] focus:ring-[var(--ue-accent)] bg-[#05070f]"
                  />
                  🚚 Auto-enviar excedente a capital (&gt;75% almacén)
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* None */}
            <div onClick={() => { if (!currentPlanet.specialization) return; if (window.confirm('¿Remover especialización planetaria?')) dispatch({ type: 'PLANET_SPECIALIZE', planetId: currentPlanet.id, specialization: null }); }}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                !currentPlanet.specialization 
                  ? 'glass-deep border-[var(--ue-accent)]/30 text-slate-200 fresnel specular' 
                  : 'glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular'
              }`}>
              <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <span>⚪</span> Sin Especialidad
              </div>
              <div className="text-[11px] text-slate-450 leading-relaxed">Sin bonificaciones ni costes de mantenimiento energético extras.</div>
            </div>

            {/* Industrial */}
            <button 
              disabled={currentPlanet.specialization === 'industrial' || currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 10000}
              onClick={() => { if (window.confirm('¿Especializar en rama Industrial? Coste: 10K Metal, 10K Cristal.')) dispatch({ type: 'PLANET_SPECIALIZE', planetId: currentPlanet.id, specialization: 'industrial' }); }}
              title="Coste: 10K Metal, 10K Cristal"
              className={`glass rounded-xl p-3 text-left transition-all border ${
                currentPlanet.specialization === 'industrial' 
                  ? 'border-amber-500/40 text-amber-200 cursor-default' 
                  : (currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 10000)
                    ? 'border-white/5 text-slate-500 opacity-40 cursor-not-allowed'
                    : 'border-white/10 hover:border-white/20 text-slate-400'
              }`}>
              <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <span>⛏️</span> Industrial
              </div>
              <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+22% Metal/Cristal, +12% consumo Energía. Sinergia limitada pero fuerte para minas grandes.</div>
              {currentPlanet.specialization !== 'industrial' && (
                <div className="text-[10px] text-amber-400/80 font-mono">10K M / 10K C</div>
              )}
            </button>

            {/* Scientific */}
            <button 
              disabled={currentPlanet.specialization === 'scientific' || currentPlanet.resources.metal < 15000 || currentPlanet.resources.crystal < 10000 || currentPlanet.resources.deuterium < 5000}
              onClick={() => { if (window.confirm('¿Especializar en rama Científica? Coste: 15K Metal, 10K Cristal, 5K Deuterio.')) dispatch({ type: 'PLANET_SPECIALIZE', planetId: currentPlanet.id, specialization: 'scientific' }); }}
              title="Coste: 15K Metal, 10K Cristal, 5K Deuterio"
              className={`border rounded-lg p-3 text-left transition-all ${
                currentPlanet.specialization === 'scientific' 
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-200 cursor-default' 
                  : (currentPlanet.resources.metal < 15000 || currentPlanet.resources.crystal < 10000 || currentPlanet.resources.deuterium < 5000)
                    ? 'glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel'
                    : 'glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular'
              }`}>
              <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <span>🔬</span> Científico
              </div>
              <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+15% vel investigación, +15% Deuterio, -10% Metal. Ideal para tech rush.</div>
              {currentPlanet.specialization !== 'scientific' && (
                <div className="text-[10px] text-purple-400/80 font-mono">15K M / 10K C / 5K D</div>
              )}
            </button>

            {/* Military */}
            <button 
              disabled={currentPlanet.specialization === 'military' || currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 15000 || currentPlanet.resources.deuterium < 5000}
              onClick={() => { if (window.confirm('¿Especializar en rama Militar? Coste: 10K Metal, 15K Cristal, 5K Deuterio.')) dispatch({ type: 'PLANET_SPECIALIZE', planetId: currentPlanet.id, specialization: 'military' }); }}
              title="Coste: 10K Metal, 15K Cristal, 5K Deuterio"
              className={`border rounded-lg p-3 text-left transition-all ${
                currentPlanet.specialization === 'military' 
                  ? 'bg-red-500/10 border-red-500/40 text-red-200 cursor-default' 
                  : (currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 15000 || currentPlanet.resources.deuterium < 5000)
                    ? 'glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel'
                    : 'glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular'
              }`}>
              <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <span>⚔️</span> Militar
              </div>
              <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+20% vel construcción naves/defensas, -10% prod recursos. Enfoque militar.</div>
              {currentPlanet.specialization !== 'military' && (
                <div className="text-[10px] text-red-400/80 font-mono">10K M / 15K C / 5K D</div>
              )}
            </button>

            {/* Commercial */}
            <button 
              disabled={currentPlanet.specialization === 'commercial' || currentPlanet.resources.metal < 12000 || currentPlanet.resources.crystal < 12000 || currentPlanet.resources.deuterium < 2000}
              onClick={() => { if (window.confirm('¿Especializar en rama Comercial? Coste: 12K Metal, 12K Cristal, 2K Deuterio.')) dispatch({ type: 'PLANET_SPECIALIZE', planetId: currentPlanet.id, specialization: 'commercial' }); }}
              title="Coste: 12K Metal, 12K Cristal, 2K Deuterio"
              className={`border rounded-lg p-3 text-left transition-all ${
                currentPlanet.specialization === 'commercial' 
                  ? 'glass-deep border-[var(--ue-accent)]/40 text-[var(--ue-accent)] cursor-default emissive-cyan fresnel specular' 
                  : (currentPlanet.resources.metal < 12000 || currentPlanet.resources.crystal < 12000 || currentPlanet.resources.deuterium < 2000)
                    ? 'glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel'
                    : 'glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular'
              }`}>
              <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                <span>📦</span> Comercial
              </div>
              <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+5% prod base + sinergia modesta con ind/cient (ingresos pasivos internos). +50% carga naves, -30% saqueo IA.</div>
              {currentPlanet.specialization !== 'commercial' && (
                <div className="text-[10px] text-cyan-400/80 font-mono">12K M / 12K C / 2K D</div>
              )}
            </button>
          </div>
        </div>

        {/* 50% Restante dividido equitativamente en 33% cada una: Flota | Modernización | Alianzas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Fleet Summary (33% del 50%) */}
          <div className={S.cardDeep}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-white">🚀 Flota</h3>
            {Object.keys(currentPlanet.fleet).length === 0 ? (
              <p className="text-slate-400 text-xs">No tienes naves.</p>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                {Object.entries(currentPlanet.fleet).filter(([, q]) => q > 0).map(([id, qty]) => (
                  <div key={id} className="glass-deep rounded-xl p-1.5 flex items-center justify-between border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{SHIPS[id]?.icon}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[80px]">{SHIPS[id]?.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{fmt(qty)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modernización (33% del 50%) */}
          <div className={S.cardDeep}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-white">🔧 Modernización</h3>
            {isOutdated(currentPlanet, state.research) ? (
              <div className="text-[10px] text-amber-400 mb-2 bg-amber-500/10 rounded-lg p-1.5">
                ⚠️ Unidades desactualizadas.
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 mb-2">
                Actualiza tus unidades con las nuevas tecnologías.
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <button onClick={() => dispatch({ type: 'RETROFIT_FLEET' })}
                disabled={Object.keys(currentPlanet.fleet).length === 0 || state.retrofitQueue.length >= 3}
                className={`${S.btn} ${Object.keys(currentPlanet.fleet).length > 0 && state.retrofitQueue.length < 3 ? S.btnPrimary : S.btnGhost} text-[10px] py-1`}>
                🚀 Mod. Flota
              </button>
              <button onClick={() => dispatch({ type: 'RETROFIT_DEFENSES' })}
                disabled={Object.keys(currentPlanet.defenses).length === 0 || state.retrofitQueue.length >= 3}
                className={`${S.btn} ${Object.keys(currentPlanet.defenses).length > 0 && state.retrofitQueue.length < 3 ? S.btnPrimary : S.btnGhost} text-[10px] py-1`}>
                🛡️ Mod. Defensas
              </button>
            </div>
          </div>

          {/* Alliances (33% del 50%) */}
          <div className={S.cardDeep}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-white">🤝 Alianzas</h3>
            {state.aiPlanets.length > 0 ? (
              <>
                <button onClick={() => dispatch({ type: 'REQUEST_REINFORCEMENTS', targetPlanetId: currentPlanet.id })} className={`${S.btn} ${S.btnPrimary} text-[10px] py-1.5 w-full`}>
                  🆘 Solicitar Refuerzos
                </button>
                <p className="text-[9px] text-slate-400 mt-1.5">Pide ayuda a aliados.</p>
              </>
            ) : (
              <p className="text-slate-400 text-xs">Sin alianzas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Colas en Curso de Astillero (50%) y Defensas (50%) en paralelo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <QueueDisplay title="Astillero" icon="🚀" queue={state.shipQueue} names={SHIPS} color="blue" onCancel={id => dispatch({ type: 'CANCEL_SHIP_QUEUE', queueId: id })} />
        <QueueDisplay title="Defensas" icon="🛡️" queue={state.defenseQueue} names={DEFENSES} color="emerald" onCancel={id => dispatch({ type: 'CANCEL_DEFENSE_QUEUE', queueId: id })} />
      </div>

      {/* Naves Personalizadas (si existen) */}
      {(state.customShipQueue||[]).filter(q => q.planetId === currentPlanet.id).length > 0 && (
        <QueueDisplay title="Naves Personalizadas" icon="🔧" queue={(state.customShipQueue||[]).filter(q => q.planetId === currentPlanet.id).map(q => ({
          ...q,
          shipId: 'custom_' + q.blueprintId,
          buildingId: null,
          researchId: null,
          defenseId: null,
        }))} names={{...SHIPS, ...Object.fromEntries((state.blueprints||[]).map(b => ['custom_' + b.id, { name: b.name, icon: '🔧' }]))}} color="purple" onCancel={id => dispatch({ type: 'CANCEL_CUSTOM_SHIP_QUEUE', queueId: id })} />
      )}

      {/* Row 7: Active Missions */}
      {state.fleetMissions.filter(m => !m.isAI).length > 0 && (
        <div className={S.cardDeep}>
          <h3 className="text-lg font-semibold mb-3">🛸 Flotas en Vuelo</h3>
          <div className="space-y-2">
            {state.fleetMissions.filter(m => !m.isAI).map(m => {
              const isReturning = m.returning;
              const remaining = Math.max(0, (isReturning ? (m.returnTime - Date.now()) : (m.arrivalTime - Date.now())) / 1000);
              const total = (isReturning ? (m.returnTime - (m.returnDeparture || m.departure)) : (m.arrivalTime - m.departure)) / 1000;
              const ships = Object.values(m.fleet).reduce((a, b) => a + b, 0);
              return (
                <div key={m.id} className="bg-slate-950/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold capitalize">{isReturning ? `🚀 ${m.type} (regreso)` : m.type}</span>
                      <span className="text-xs text-slate-400 ml-2">
                        {isReturning ? `← [${m.from.galaxy}:${m.from.system}:${m.from.position}]` : `→ [${m.to.galaxy}:${m.to.system}:${m.to.position}]`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isReturning && (
                        <button onClick={() => dispatch({ type: 'CANCEL_MISSION', missionId: m.id })} className="text-xs text-red-400 hover:text-red-300">
                          ✕ Cancelar
                        </button>
                      )}
                      <div className="text-xs text-cyan-400">{ships} naves • {fmtTime(remaining)}</div>
                    </div>
                  </div>
                  <ProgressBar value={total - remaining} max={total} color="from-cyan-500 to-blue-500" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewPage;
