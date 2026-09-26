import React from "react";

export const PlanetarySpecializationCard = ({ currentPlanet, dispatch, S }) => {
  return (
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
                onChange={() => dispatch({ type: "PLANET_TOGGLE_AUTOTRADE", planetId: currentPlanet.id })}
                className="rounded border-white/20 text-[var(--ue-accent)] focus:ring-[var(--ue-accent)] bg-[#05070f]"
              />
              🚚 Auto-enviar excedente a capital (&gt;75% almacén)
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {/* None */}
        <div onClick={() => { if (!currentPlanet.specialization) return; if (window.confirm("¿Remover especialización planetaria?")) dispatch({ type: "PLANET_SPECIALIZE", planetId: currentPlanet.id, specialization: null }); }}
          className={"border rounded-lg p-3 cursor-pointer transition-all " + (
            !currentPlanet.specialization 
              ? "glass-deep border-[var(--ue-accent)]/30 text-slate-200 fresnel specular" 
              : "glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular"
          )}>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span>⚪</span> Sin Especialidad
          </div>
          <div className="text-[11px] text-slate-450 leading-relaxed">Sin bonificaciones ni costes de mantenimiento energético extras.</div>
        </div>

        {/* Industrial */}
        <button 
          disabled={currentPlanet.specialization === "industrial" || currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 10000}
          onClick={() => { if (window.confirm("¿Especializar en rama Industrial? Coste: 10K Metal, 10K Cristal.")) dispatch({ type: "PLANET_SPECIALIZE", planetId: currentPlanet.id, specialization: "industrial" }); }}
          title="Coste: 10K Metal, 10K Cristal"
          className={"glass rounded-xl p-3 text-left transition-all border " + (
            currentPlanet.specialization === "industrial" 
              ? "border-amber-500/40 text-amber-200 cursor-default" 
              : (currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 10000)
                ? "border-white/5 text-slate-500 opacity-40 cursor-not-allowed"
                : "border-white/10 hover:border-white/20 text-slate-400"
          )}>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span>⛏️</span> Industrial
          </div>
          <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+22% Metal/Cristal, +12% consumo Energía. Sinergia limitada pero fuerte para minas grandes.</div>
          {currentPlanet.specialization !== "industrial" && (
            <div className="text-[10px] text-amber-400/80 font-mono">10K M / 10K C</div>
          )}
        </button>

        {/* Scientific */}
        <button 
          disabled={currentPlanet.specialization === "scientific" || currentPlanet.resources.metal < 15000 || currentPlanet.resources.crystal < 10000 || currentPlanet.resources.deuterium < 5000}
          onClick={() => { if (window.confirm("¿Especializar en rama Científica? Coste: 15K Metal, 10K Cristal, 5K Deuterio.")) dispatch({ type: "PLANET_SPECIALIZE", planetId: currentPlanet.id, specialization: "scientific" }); }}
          title="Coste: 15K Metal, 10K Cristal, 5K Deuterio"
          className={"border rounded-lg p-3 text-left transition-all " + (
            currentPlanet.specialization === "scientific" 
              ? "bg-purple-500/10 border-purple-500/40 text-purple-200 cursor-default" 
              : (currentPlanet.resources.metal < 15000 || currentPlanet.resources.crystal < 10000 || currentPlanet.resources.deuterium < 5000)
                ? "glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel"
                : "glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular"
          )}>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span>🔬</span> Científico
          </div>
          <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+15% vel investigación, +15% Deuterio, -10% Metal. Ideal para tech rush.</div>
          {currentPlanet.specialization !== "scientific" && (
            <div className="text-[10px] text-purple-400/80 font-mono">15K M / 10K C / 5K D</div>
          )}
        </button>

        {/* Military */}
        <button 
          disabled={currentPlanet.specialization === "military" || currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 15000 || currentPlanet.resources.deuterium < 5000}
          onClick={() => { if (window.confirm("¿Especializar en rama Militar? Coste: 10K Metal, 15K Cristal, 5K Deuterio.")) dispatch({ type: "PLANET_SPECIALIZE", planetId: currentPlanet.id, specialization: "military" }); }}
          title="Coste: 10K Metal, 15K Cristal, 5K Deuterio"
          className={"border rounded-lg p-3 text-left transition-all " + (
            currentPlanet.specialization === "military" 
              ? "bg-red-500/10 border-red-500/40 text-red-200 cursor-default" 
              : (currentPlanet.resources.metal < 10000 || currentPlanet.resources.crystal < 15000 || currentPlanet.resources.deuterium < 5000)
                ? "glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel"
                : "glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular"
          )}>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span>⚔️</span> Militar
          </div>
          <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+20% vel construcción naves/defensas, -10% prod recursos. Enfoque militar.</div>
          {currentPlanet.specialization !== "military" && (
            <div className="text-[10px] text-red-400/80 font-mono">10K M / 15K C / 5K D</div>
          )}
        </button>

        {/* Commercial */}
        <button 
          disabled={currentPlanet.specialization === "commercial" || currentPlanet.resources.metal < 12000 || currentPlanet.resources.crystal < 12000 || currentPlanet.resources.deuterium < 2000}
          onClick={() => { if (window.confirm("¿Especializar en rama Comercial? Coste: 12K Metal, 12K Cristal, 2K Deuterio.")) dispatch({ type: "PLANET_SPECIALIZE", planetId: currentPlanet.id, specialization: "commercial" }); }}
          title="Coste: 12K Metal, 12K Cristal, 2K Deuterio"
          className={"border rounded-lg p-3 text-left transition-all " + (
            currentPlanet.specialization === "commercial" 
              ? "glass-deep border-[var(--ue-accent)]/40 text-[var(--ue-accent)] cursor-default emissive-cyan fresnel specular" 
              : (currentPlanet.resources.metal < 12000 || currentPlanet.resources.crystal < 12000 || currentPlanet.resources.deuterium < 2000)
                ? "glass-deep border-white/5 text-slate-500 opacity-40 cursor-not-allowed fresnel"
                : "glass-deep border-white/10 hover:border-[var(--ue-accent)]/20 text-slate-400 fresnel specular"
          )}>
          <div className="text-sm font-semibold mb-1 flex items-center gap-1.5">
            <span>📦</span> Comercial
          </div>
          <div className="text-[11px] text-slate-450 leading-relaxed mb-2">+5% prod base + sinergia modesta con ind/cient (ingresos pasivos internos). +50% carga naves, -30% saqueo IA.</div>
          {currentPlanet.specialization !== "commercial" && (
            <div className="text-[10px] text-cyan-400/80 font-mono">12K M / 12K C / 2K D</div>
          )}
        </button>
      </div>
    </div>
  );
};
