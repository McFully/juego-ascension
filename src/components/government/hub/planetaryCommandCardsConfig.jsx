import React from 'react';
import { HubCard } from './HubCard.jsx';
import { COMMAND_CARD_TARGETS } from '../../../utils/governmentRoute.js';

/**
 * Catálogo del Alto Mando de un mundo.
 *
 * Todo lo que se gobierna en un planeta: su gabinete de ministerios, su senado
 * local, sus defensas, su flota y sus industries. La última tarjeta es el
 * retorno al Imperio y es inamovible.
 *
 * El orden de estas tarjetas se guarda por `planetId`: cada mundo tiene su
 * propio tablero aunque dos mundos se llamen igual.
 */
export const PLANETARY_COMMAND_CARDS = [
  'ministries',
  'planetary_senate',
  'galaxy',
  'market',
  'defense',
  'missiles',
  'shipyard',
  'fleet',
  'bank',
  'moon',
  'debris'
];

export const planetaryCommandStorageKey = (planetId) =>
  `ascension_cmd_hub_planet_${planetId || 'unknown'}_v1`;

export function buildPlanetaryCommandCards({
  onEnterMinistries,
  onNavigateTab,
  onOpenPlanetarySenate,
  onBackToEmpire,
  ministryCount,
  activeMinistersCount,
  autoMinistriesCount,
  fmt,
  state,
  planet,
  fleets,
  shipyardLevel,
  siloLevel,
  totalDefenses,
  totalMissiles,
  maxMissiles,
  totalShips,
  hasMoon,
  totalDebrisTons,
  bankLevel = (planet?.buildings?.exchangeBank || planet?.buildings?.futuresExchange || 0),
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
              if (dispatch && planet) {
                dispatch({ type: 'SET_PLANET_AUTO_GOVERNANCE', planetId: planet.id });
                if (window.playSfx) window.playSfx('click');
              }
            }}
            title={planet?.autoGovernance ? "Gobernador IA activo. Clic para cambiar a Manual" : "Gobernador Manual. Clic para activar Gobernador IA con todos los ministros"}
            className={`w-full py-1.5 px-3 rounded-xl font-mono text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              planet?.autoGovernance
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/90 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-[#080d1e] border-white/20 text-slate-300 hover:border-cyan-400 hover:text-cyan-200'
            }`}
          >
            <span>{planet?.autoGovernance ? '🤖' : '👤'}</span>
            <span>{planet?.autoGovernance ? 'Gobernador IA: Activo' : 'Activar Gobernador IA'}</span>
          </button>
        }
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
        description={`Asamblea local de ${planet?.name || 'este mundo'}: pacto tributario, moral ciudadana y delegación de procuradores.`}
        footerLabel="Procuradores al Trono:"
        footerValue={`${Math.max(1, Math.floor(((planet?.population || 1000) / 10000)) + 1)} Escaños`}
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
        footerValue={planet?.autoTrade ? 'Automatizadas' : 'Manual'}
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
    bank: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab(COMMAND_CARD_TARGETS.planetaryBank)}
        isLocked={bankLevel < 1}
        lockReason="Requiere construir la Banca Galáctica Central (Nv. 1) en el Ministerio de Finanzas para desbloquear los servicios bancarios."
        borderColor="border-yellow-500/30"
        hoverBorderColor="hover:border-yellow-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(234,179,8,0.3)]"
        assetId="futuresExchange"
        badgeText="FINANZAS"
        badgeClasses="bg-yellow-950/80 text-yellow-300 border border-yellow-500/50"
        title="Banca Galáctica"
        icon="🏦"
        titleHoverColor="group-hover:text-yellow-300"
        description="Servicios bancarios y de crédito estelar: custodia de activos, colocación de depósitos e intereses en el mercado interplanetario."
        footerLabel="Nivel de Banca:"
        footerValue={bankLevel > 0 ? `Nv. ${bankLevel} Operativo` : 'Bloqueado'}
        footerValueClasses={bankLevel > 0 ? 'text-yellow-300' : 'text-slate-500'}
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
    )
  };
}