import React from 'react';
import { HubCard } from './HubCard.jsx';

/**
 * buildCommandHubCards — Generador declarativo y modular de tarjetas para ImperialCommandHub.
 * Desacopla la vista de la configuración de tarjetas para mejorar la velocidad de renderizado.
 */
export function buildCommandHubCards({
  onEnterMinistries,
  onNavigateTab,
  onOpenPlanetarySenate,
  onBackToEmpire,
  ministryCount,
  activeMinistersCount,
  autoMinistriesCount,
  readyMissions,
  claimedCount,
  missions,
  fmt,
  state,
  currentPlanet,
  fleets,
  shipyardLevel,
  siloLevel,
  totalDefenses,
  totalMissiles,
  maxMissiles,
  totalShips,
  hasMoon,
  totalDebrisTons,
  dispatch
}) {
  return {
    ministries: (
      <HubCard
        onClick={onEnterMinistries}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="sectorGovPalace"
        badgeText={`${ministryCount} MINISTERIOS`}
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Ministerios"
        icon="🏛️"
        description={`Gobierno central: nombramiento de ministros, complejos de obras, programas y decretos en las ${ministryCount} carteras.`}
        footerLabel="Estado de carteras:"
        footerValue={`${activeMinistersCount}/${ministryCount} con ministro (${autoMinistriesCount} autónomos)`}
        footerValueClasses="text-emerald-400"
        footerAction={
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (dispatch && currentPlanet) {
                dispatch({ type: 'SET_PLANET_AUTO_GOVERNANCE', planetId: currentPlanet.id });
                if (window.playSfx) window.playSfx('click');
              }
            }}
            title={currentPlanet?.autoGovernance ? "Gobernador IA activo. Clic para cambiar a Manual" : "Gobernador Manual. Clic para activar Gobernador IA con todos los ministros"}
            className={`w-full py-1.5 px-3 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              currentPlanet?.autoGovernance
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/90 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#080d1e] border-white/20 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'
            }`}
          >
            <span>{currentPlanet?.autoGovernance ? '🤖' : '👤'}</span>
            <span>{currentPlanet?.autoGovernance ? 'Gobernador IA: Activo' : 'Activar Gobernador IA'}</span>
          </button>
        }
      />
    ),
    missions: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('missions')}
        borderColor="border-amber-500/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
        assetId="councilChamber"
        badgeText={readyMissions > 0 ? `⭐ ${readyMissions} POR RECLAMAR` : 'DIRECTIVAS'}
        badgeClasses={readyMissions > 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.7)] animate-pulse' : 'bg-black/70 text-amber-300 border border-amber-500/40'}
        title="Misiones y Directivas"
        icon="📜"
        titleHoverColor="group-hover:text-amber-300"
        description="Órdenes supremas de colonización, expansión militar y desarrollo tecnológico con recompensas sustanciales."
        footerLabel="Progreso de campaña:"
        footerValue={`${claimedCount}/${missions.length} completadas`}
        footerValueClasses="text-amber-300"
      />
    ),
    diplomacy: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('diplomacy')}
        borderColor="border-purple-500/30"
        hoverBorderColor="hover:border-purple-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="permanentEmbassy"
        badgeText="EXTERIOR"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Diplomacia y Alianzas"
        icon="🤝"
        titleHoverColor="group-hover:text-purple-300"
        description="Relaciones interestelares, tratados de paz, pactos comerciales de cooperación y diplomacia exterior."
        footerLabel="Influencia Política:"
        footerValue={`${fmt ? fmt(state?.influence || 0) : (state?.influence || 0)} Ptos`}
        footerValueClasses="text-purple-300"
      />
    ),
    planetary_senate: (
      <HubCard
        onClick={() => onOpenPlanetarySenate && onOpenPlanetarySenate()}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="sectorGovPalace"
        badgeText="LOCAL"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Senado Planetario"
        icon="🏛️"
        titleHoverColor="group-hover:text-cyan-300"
        description={`Asamblea local de ${currentPlanet?.name || 'este mundo'}: pacto tributario, moral ciudadana y delegación de procuradores.`}
        footerLabel="Procuradores al Trono:"
        footerValue={`${Math.max(1, Math.floor(((currentPlanet?.population || 1000) / 10000)) + 1)} Escaños`}
        footerValueClasses="text-cyan-300"
      />
    ),
    galaxy: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('galaxy')}
        borderColor="border-sky-500/30"
        hoverBorderColor="hover:border-sky-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(56,189,248,0.3)]"
        assetId="deepScanner"
        badgeText="MAPA ESTELAR"
        badgeClasses="bg-sky-950/80 text-sky-300 border border-sky-500/50"
        title="Navegación y Galaxia"
        icon="🌌"
        titleHoverColor="group-hover:text-sky-300"
        description="Exploración de sistemas estelares, localización de nuevos planetas vírgenes y control de convoyes en tránsito."
        footerLabel="Flotas en vuelo:"
        footerValue={`${fleets.length} en misión`}
        footerValueClasses="text-sky-300"
      />
    ),
    market: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('market')}
        borderColor="border-emerald-500/30"
        hoverBorderColor="hover:border-emerald-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]"
        assetId="galacticMarket"
        badgeText="COMERCIO"
        badgeClasses="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
        title="Mercado Galáctico"
        icon="💼"
        titleHoverColor="group-hover:text-emerald-300"
        description="Bolsa de valores espacial, intercambio de excedentes por créditos o deuterio y fletamento de transportes mercantes."
        footerLabel="Rutas comerciales:"
        footerValue={currentPlanet?.autoTrade ? 'Automatizadas' : 'Manual'}
        footerValueClasses="text-emerald-300"
      />
    ),
    defense: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('defense')}
        isLocked={shipyardLevel < 1 && siloLevel < 1}
        lockReason="Requiere construir un Astillero o Silo de Misiles en el Complejo de Obras para activar el bastión."
        borderColor="border-rose-500/30"
        hoverBorderColor="hover:border-rose-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(244,63,94,0.3)]"
        assetId="largeShieldDome"
        badgeText="DEFENSA"
        badgeClasses="bg-rose-950/80 text-rose-300 border border-rose-500/50"
        title="Defensa y Bastión"
        icon="🛡️"
        titleHoverColor="group-hover:text-rose-300"
        description="Baterías láser, torretas de plasma, cúpulas de escudo planetario y sistemas de intercepción orbital."
        footerLabel="Baterías planetarias:"
        footerValue={`${totalDefenses} activas`}
        footerValueClasses="text-rose-300"
      />
    ),
    missiles: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('missiles')}
        isLocked={siloLevel < 1}
        lockReason="Requiere construir un Silo de Misiles en el Complejo de Obras para fabricar y lanzar proyectiles."
        borderColor="border-orange-500/30"
        hoverBorderColor="hover:border-orange-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(249,115,22,0.3)]"
        assetId="missileSilo"
        badgeText="MISILES"
        badgeClasses="bg-orange-950/80 text-orange-300 border border-orange-500/50"
        title="Silos de Misiles"
        icon="🚀"
        titleHoverColor="group-hover:text-orange-300"
        description="Complejo balístico sub-orbital: misiles de intercepción defensiva y misiles interplanetarios de ataque nuclear."
        footerLabel="Capacidad de Silo:"
        footerValue={`${totalMissiles} / ${maxMissiles}`}
        footerValueClasses="text-orange-300"
      />
    ),
    shipyard: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('shipyard')}
        isLocked={shipyardLevel < 1}
        lockReason="Requiere construir un Astillero en el Complejo de Obras para iniciar la manufactura de naves."
        borderColor="border-blue-500/30"
        hoverBorderColor="hover:border-blue-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]"
        assetId="shipyard"
        badgeText="ARMADA"
        badgeClasses="bg-blue-950/80 text-blue-300 border border-blue-500/50"
        title="Astillero Orbital"
        icon="🏭"
        titleHoverColor="group-hover:text-blue-300"
        description="Líneas de ensamblaje naval: construcción en serie de cazas ligeros, destructores pesados y naves nodriza."
        footerLabel="En construcción:"
        footerValue={`${(state?.shipQueue || []).length} órdenes activas`}
        footerValueClasses="text-blue-300"
      />
    ),
    fleet: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('fleet')}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="battleship"
        badgeText="HANGAR"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Hangar de la Flota"
        icon="🛸"
        titleHoverColor="group-hover:text-cyan-300"
        description="Gestión táctica de naves estacionadas: inspección de cazas, fragatas, cruceros y cargueros listos para misión."
        footerLabel="Naves en base:"
        footerValue={`${totalShips} unidades operativas`}
        footerValueClasses="text-cyan-300"
      />
    ),
    shipDesign: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('shipDesign')}
        borderColor="border-teal-500/30"
        hoverBorderColor="hover:border-teal-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(20,184,166,0.3)]"
        assetId="robotFactory"
        badgeText="INGENIERÍA"
        badgeClasses="bg-teal-950/80 text-teal-300 border border-teal-500/50"
        title="Diseñador de Naves"
        icon="🔧"
        titleHoverColor="group-hover:text-teal-300"
        description="Taller naval de ingeniería: crea planos personalizados combinando armamento, escudos y motores avanzados."
        footerLabel="Planos guardados:"
        footerValue={`${(state?.blueprints || []).length} configurados`}
        footerValueClasses="text-teal-300"
      />
    ),
    combat: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('combat')}
        borderColor="border-red-500/30"
        hoverBorderColor="hover:border-red-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(239,68,68,0.3)]"
        assetId="plasmaTurret"
        badgeText="TÁCTICA"
        badgeClasses="bg-red-950/80 text-red-300 border border-red-500/50"
        title="Simulador de Batalla"
        icon="⚔️"
        titleHoverColor="group-hover:text-red-300"
        description="Predicción balística de combate espacial: simula enfrentamientos, porcentaje de bajas y botín estimado."
        footerLabel="Historial bélico:"
        footerValue={`${state?.combatsWon || 0}V / ${state?.combatsLost || 0}D`}
        footerValueClasses="text-red-300"
      />
    ),
    colony_network: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('colony_network')}
        borderColor="border-indigo-500/30"
        hoverBorderColor="hover:border-indigo-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
        assetId="terraformer"
        badgeText="LOGÍSTICA"
        badgeClasses="bg-indigo-950/80 text-indigo-300 border border-indigo-500/50"
        title="Red de Colonias"
        icon="🪐"
        titleHoverColor="group-hover:text-indigo-300"
        description="Gestión logística interplanetaria: rutas automáticas de transporte, nivelación de recursos y despliegue rápido de flotas."
        footerLabel="Mundos federados:"
        footerValue={`${(state?.planets || []).length} mundos`}
        footerValueClasses="text-indigo-300"
      />
    ),
    stats: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('stats')}
        borderColor="border-emerald-600/30"
        hoverBorderColor="hover:border-emerald-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]"
        assetId="sectorGovPalace"
        badgeText="STATS"
        badgeClasses="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
        title="Estadísticas del Imperio"
        icon="📊"
        titleHoverColor="group-hover:text-emerald-300"
        description="Registro histórico de combates, balance global de producción de recursos y censo colonial detallado."
        footerLabel="Logros imperiales:"
        footerValue={`${(state?.achievements || []).length} desbloqueados`}
        footerValueClasses="text-emerald-300"
      />
    ),
    moon: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('moon')}
        isLocked={!hasMoon}
        lockReason="Requiere formar un satélite lunar mediante restos de batallas orbitales masivas en el planeta."
        borderColor="border-slate-500/30"
        hoverBorderColor="hover:border-slate-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(148,163,184,0.3)]"
        assetId="lunarBase"
        badgeText="SATÉLITE"
        badgeClasses="bg-slate-900/90 text-slate-300 border border-slate-500/50"
        title="Base Lunar y Satélite"
        icon="🌑"
        titleHoverColor="group-hover:text-slate-300"
        description="Instalaciones en baja gravedad: sensores orbitales de largo alcance, salto cuántico y escáner phalanx."
        footerLabel="Estado orbital:"
        footerValue={hasMoon ? 'Base Activa' : 'Sin Satélite'}
        footerValueClasses={hasMoon ? 'text-cyan-300' : 'text-slate-500'}
      />
    ),
    debris: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('fleet')}
        isLocked={totalDebrisTons <= 0}
        lockReason="No hay escombros detectados en órbita. Los restos se generan tras batallas espaciales."
        borderColor="border-amber-600/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(217,119,6,0.3)]"
        assetId="wreckField"
        badgeText="RECOLECCIÓN"
        badgeClasses="bg-amber-950/80 text-amber-300 border border-amber-500/50"
        title="Campos de Escombros"
        icon="🪨"
        titleHoverColor="group-hover:text-amber-300"
        description="Restos orbitales recolectables: despacha flotas recicladoras desde Operaciones de Flota para recuperar metal y cristal."
        footerLabel="Chatarra orbital:"
        footerValue={`${fmt ? fmt(totalDebrisTons) : totalDebrisTons} Tons`}
        footerValueClasses="text-amber-300"
      />
    ),
    imperial_council: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('imperial_council')}
        isLocked={(state?.planets || []).length < 10 && !state?.imperialCouncilUnlocked}
        lockReason="Requiere administrar un Imperio de al menos 10 mundos para convocar el Consejo de Ministros Supremos."
        borderColor="border-amber-500/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
        assetId="councilChamber"
        badgeText="ALTA REPÚBLICA"
        badgeClasses="bg-amber-950/80 text-amber-300 border border-amber-500/50"
        title="Consejo Imperial"
        icon="👑"
        titleHoverColor="group-hover:text-amber-300"
        description="Gabinete federal supremo: ministros globales cuyas directivas y bonificaciones aplican a todos los mundos simultáneamente."
        footerLabel="Estado del Consejo:"
        footerValue={`${Object.keys(state?.imperialCouncil?.ministers || {}).length}/5 Ministros Supremos`}
        footerValueClasses="text-amber-300"
      />
    ),
    imperial_senate: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('imperial_senate')}
        isLocked={(state?.planets || []).length < 10 && !state?.imperialCouncilUnlocked}
        lockReason="Requiere administrar un Imperio de al menos 10 mundos para constituir la Cámara Alta Federal del Senado."
        borderColor="border-purple-500/30"
        hoverBorderColor="hover:border-purple-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="permanentEmbassy"
        badgeText="LEGISLATURA"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Senado Imperial"
        icon="🏛️"
        titleHoverColor="group-hover:text-purple-300"
        description="Cámara alta de delegados planetarios: debate leyes federales y utiliza Influencia política para orientar la votación."
        footerLabel="Leyes en Vigor:"
        footerValue={`${(state?.imperialCouncil?.passedBills || []).length} promulgadas`}
        footerValueClasses="text-purple-300"
      />
    ),
    back_to_empire: (
      <HubCard
        onClick={onBackToEmpire}
        borderColor="border-cyan-500/20"
        hoverBorderColor="hover:border-cyan-400/60"
        hoverShadow="hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        assetId="deepColonizationPsych"
        badgeText="IMPERIO"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40"
        title="Volver a Imperio"
        icon="🪐"
        titleHoverColor="group-hover:text-cyan-300"
        description="Regresa a la vista general del Imperio para consultar la producción de mundos, infraestructuras y colonias activas."
        footerLabel="Vista destino:"
        footerValue="Imperio General"
        footerValueClasses="text-cyan-300"
      />
    )
  };
}
