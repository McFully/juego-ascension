import React from 'react';
import { HubCard } from './HubCard.jsx';

/**
 * Catálogo del Alto Mando de la Lonja Galáctica (Zona Franca Comercial).
 *
 * 12 tarjetas atómicas especializadas para la administración financiera,
 * logística, megaproyectos y defensa neutral de la Lonja.
 */
export const EXCHANGE_COMMAND_CARDS = [
  'ministries_of_planet',
  'directorate',
  'terminal',
  'megaprojects',
  'dao_fund',
  'trade_routes',
  'security_bastion',
  'defensive_silos',
  'merchant_shipyard',
  'cargo_docks',
  'orbital_beacon',
  'scrap_depot'
];

export const exchangeCommandStorageKey = (planetId) =>
  `ascension_cmd_hub_exchange_${planetId || 'default'}_v2`;

export function buildExchangeCommandCards({
  onOpenMinistriesOfPlanet,
  onOpenDirectorate,
  onOpenTerminal,
  onOpenMegaprojects,
  onOpenDaoFund,
  onOpenTradeRoutes,
  onOpenSecurityBastion,
  onOpenDefensiveSilos,
  onOpenMerchantShipyard,
  onOpenCargoDocks,
  onOpenOrbitalBeacon,
  onOpenScrapDepot,
  planet,
  state,
  fmt
}) {
  const currentCredits = state?.credits || 0;
  const daoShares = state?.daoShares || 1000;
  const playerShares = state?.playerDaoShares || 100;
  const playerPercent = ((playerShares / daoShares) * 100).toFixed(1);
  const totalDefenses = Object.values(planet?.defenses || {}).reduce((a, b) => a + b, 0);
  const totalMissiles = Object.values(planet?.missiles || {}).reduce((a, b) => a + b, 0);
  const totalShips = Object.values(planet?.fleet || {}).reduce((a, b) => a + b, 0);
  const totalDebris = (planet?.debris?.metal || 0) + (planet?.debris?.crystal || 0);

  return {
    ministries_of_planet: (
      <HubCard
        onClick={onOpenMinistriesOfPlanet}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="ministryCouncil"
        badgeText="GOBIERNO"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Ministerios de este planeta"
        icon="🏛️"
        titleHoverColor="group-hover:text-cyan-300"
        description="Gabinete de ministros activo en este enclave. Gestiona las carteras de política interior, economía y administración de la Zona Franca."
        footerLabel="Estado del gabinete:"
        footerValue="Ministerios Activos"
        footerValueClasses="text-cyan-300"
      />
    ),

    directorate: (
      <HubCard
        onClick={onOpenDirectorate}
        borderColor="border-amber-500/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
        assetId="councilChamber"
        badgeText="ZONA FRANCA"
        badgeClasses="bg-amber-950/80 text-amber-300 border border-amber-500/50"
        title="Directorio Comercial"
        icon="🏛️"
        titleHoverColor="group-hover:text-amber-300"
        description="Consejo rector de la Zona Franca. Dictamina directrices fiscales, regulación de tasas portuarias y protocolos aduaneros con facciones interestelares."
        footerLabel="Estatus legal:"
        footerValue="Paz Neutra Garantizada"
        footerValueClasses="text-emerald-300"
      />
    ),

    terminal: (
      <HubCard
        onClick={onOpenTerminal}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="exchangeEngine"
        badgeText="FINANZAS AMM"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Terminal Bursátil Cuántico"
        icon="📈"
        titleHoverColor="group-hover:text-cyan-300"
        description="Mesa de operaciones interplanetarias. Ejecuta órdenes directas de compraventa de recursos masivos y fija posturas límite de mercado."
        footerLabel="Créditos disponibles:"
        footerValue={`₢ ${fmt ? fmt(currentCredits) : currentCredits}`}
        footerValueClasses="text-cyan-300"
      />
    ),

    megaprojects: (
      <HubCard
        onClick={onOpenMegaprojects}
        borderColor="border-purple-500/30"
        hoverBorderColor="hover:border-purple-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="terraformer"
        badgeText="OBRAS ÉPICAS"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Megaproyectos de Construcción"
        icon="🏗️"
        titleHoverColor="group-hover:text-purple-300"
        description="Ingeniería planetaria colosal. Promueve la edificación de la Gran Bóveda de Reserva, Anillos de Aceleración y Cámaras Cuánticas."
        footerLabel="Infraestructuras:"
        footerValue={`${Object.keys(planet?.buildings || {}).length} Módulos Activos`}
        footerValueClasses="text-purple-300"
      />
    ),

    dao_fund: (
      <HubCard
        onClick={onOpenDaoFund}
        borderColor="border-emerald-500/30"
        hoverBorderColor="hover:border-emerald-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]"
        assetId="exchangeBank"
        badgeText="PATRIMONIO DAO"
        badgeClasses="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
        title="Fondo Soberano DAO"
        icon="💎"
        titleHoverColor="group-hover:text-emerald-300"
        description="Custodia comunitaria de capitales y participaciones. Reparto periódico de dividendos devengados por volumen de tránsito transaccional."
        footerLabel="Participación imperial:"
        footerValue={`${playerPercent}% del Capital Social`}
        footerValueClasses="text-emerald-300"
      />
    ),

    trade_routes: (
      <HubCard
        onClick={onOpenTradeRoutes}
        borderColor="border-blue-500/30"
        hoverBorderColor="hover:border-blue-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]"
        assetId="deepScanner"
        badgeText="CORREDORES"
        badgeClasses="bg-blue-950/80 text-blue-300 border border-blue-500/50"
        title="Red de Rutas Comerciales"
        icon="🌌"
        titleHoverColor="group-hover:text-blue-300"
        description="Radar de navegación y balizamiento. Supervisa el flujo de convoyes extranjeros e imperiales con destino u origen en este enclave franco."
        footerLabel="Tránsito galáctico:"
        footerValue="Enlace Abierto G1-G5"
        footerValueClasses="text-blue-300"
      />
    ),

    security_bastion: (
      <HubCard
        onClick={onOpenSecurityBastion}
        borderColor="border-indigo-500/30"
        hoverBorderColor="hover:border-indigo-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
        assetId="exchangeBastion"
        badgeText="DEFENSA NEUTRA"
        badgeClasses="bg-indigo-950/80 text-indigo-300 border border-indigo-500/50"
        title="Bastión de Seguridad Franca"
        icon="🛡️"
        titleHoverColor="group-hover:text-indigo-300"
        description="Anillo defensivo perimetral de la Lonja. Baterías automatizadas de plasma y escudos ionizados encargados de neutralizar actos de piratería."
        footerLabel="Baterías fijas:"
        footerValue={`${fmt ? fmt(totalDefenses) : totalDefenses} Instaladas`}
        footerValueClasses="text-indigo-300"
      />
    ),

    defensive_silos: (
      <HubCard
        onClick={onOpenDefensiveSilos}
        borderColor="border-rose-500/30"
        hoverBorderColor="hover:border-rose-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(244,63,94,0.3)]"
        assetId="missileSilo"
        badgeText="DISUASIÓN"
        badgeClasses="bg-rose-950/80 text-rose-300 border border-rose-500/50"
        title="Red de Silos Defensivos"
        icon="🚀"
        titleHoverColor="group-hover:text-rose-300"
        description="Pozos de lanzamiento blindados bajo superficie. Almacena ojivas de interdicción balística para repeler asedios sin infringir tratados de paz."
        footerLabel="Ojivas en recámara:"
        footerValue={`${fmt ? fmt(totalMissiles) : totalMissiles} Misiles`}
        footerValueClasses="text-rose-300"
      />
    ),

    merchant_shipyard: (
      <HubCard
        onClick={onOpenMerchantShipyard}
        borderColor="border-cyan-500/30"
        hoverBorderColor="hover:border-cyan-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.3)]"
        assetId="shipyard"
        badgeText="ASTILLERO"
        badgeClasses="bg-cyan-950/80 text-cyan-300 border border-cyan-500/50"
        title="Astillero Mercantil"
        icon="🛠️"
        titleHoverColor="group-hover:text-cyan-300"
        description="Complejo industrial de ensamblaje naval. Especializado en construcción de cargueros pesados y readaptación de cascos para transporte masivo."
        footerLabel="Capacidad de quilla:"
        footerValue="Nivel Industrial Comercial"
        footerValueClasses="text-cyan-300"
      />
    ),

    cargo_docks: (
      <HubCard
        onClick={onOpenCargoDocks}
        borderColor="border-amber-500/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
        assetId="exchangeDocks"
        badgeText="LOGÍSTICA"
        badgeClasses="bg-amber-950/80 text-amber-300 border border-amber-500/50"
        title="Dársena de Mercantes"
        icon="🛸"
        titleHoverColor="group-hover:text-amber-300"
        description="Áreas de estacionamiento presurizado y descarga simultánea. Monitorea las bodegas de carga amarradas en dársena y naves de escolta mercante."
        footerLabel="Naves amarradas:"
        footerValue={`${fmt ? fmt(totalShips) : totalShips} Unidades`}
        footerValueClasses="text-amber-300"
      />
    ),

    orbital_beacon: (
      <HubCard
        onClick={onOpenOrbitalBeacon}
        borderColor="border-purple-500/30"
        hoverBorderColor="hover:border-purple-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="exchangeBeacon"
        badgeText="BALIZAMIENTO"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Baliza Orbital Cuántica"
        icon="🌙"
        titleHoverColor="group-hover:text-purple-300"
        description="Faro taquiónico anclado en órbita geoestacionaria. Emite señales de salto seguro y calcula las tasas portuarias automáticas de aproximación."
        footerLabel="Transpondedor:"
        footerValue="Emisión Omnidireccional"
        footerValueClasses="text-purple-300"
      />
    ),

    scrap_depot: (
      <HubCard
        onClick={onOpenScrapDepot}
        borderColor="border-yellow-600/30"
        hoverBorderColor="hover:border-yellow-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(202,138,4,0.3)]"
        assetId="wreckField"
        badgeText="DESGUACE"
        badgeClasses="bg-yellow-950/80 text-yellow-300 border border-yellow-500/50"
        title="Depósito de Chatarras"
        icon="🪨"
        titleHoverColor="group-hover:text-yellow-300"
        description="Centro de triaje y trituración de restos espaciales. Transforma el chatarrizado de cargueros accidentados en metal y cristal refinados."
        footerLabel="Chatarra acumulada:"
        footerValue={`${fmt ? fmt(totalDebris) : totalDebris} Tons`}
        footerValueClasses="text-yellow-300"
      />
    )
  };
}
