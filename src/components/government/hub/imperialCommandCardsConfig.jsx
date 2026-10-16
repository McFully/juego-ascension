import React from 'react';
import { HubCard } from './HubCard.jsx';
import { sharedCommandCards } from './sharedCommandCards.jsx';
import { COMMAND_CARD_TARGETS } from '../../../utils/governmentRoute.js';

/**
 * Catálogo del Mando Imperial.
 *
 * Son los órganos del imperio: misiones, diplomacia, consejo, senado, colonias,
 * estadísticas, ingeniería y táctica. Ninguna tarjeta de aquí depende del
 * planeta activo, porque el Mando Imperial no es el mando de ningún mundo.
 */
export const IMPERIAL_COMMAND_CARDS = [
  'galaxy',
  'imperial_fleet',
  'tactical_advisor',
  'missions',
  'diplomacy',
  'colony_network',
  'market',
  'communications',
  'imperial_council',
  'imperial_senate',
  'combat',
  'shipDesign',
  'bank',
  'wiki'
];

export const IMPERIAL_COMMAND_STORAGE_KEY = 'ascension_cmd_hub_imperial_v5';

export function buildImperialCommandCards({
  onNavigateTab,
  onBackToEmpire,
  readyMissions,
  claimedCount,
  missions,
  fmt,
  state
}) {
  const activeFleetMissions = (state?.fleetMissions || []).filter(m => !m.isAI);
  const totalPlanets = (state?.planets || []).length;

  return {
    galaxy: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('galaxy')}
        borderColor="border-sky-500/40"
        hoverBorderColor="hover:border-sky-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(56,189,248,0.35)]"
        assetId="cartografiaEstelar"
        badgeText="MAPA ESTELAR"
        badgeClasses="bg-sky-950/90 text-sky-300 border border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
        title="Cartografía"
        icon="🌌"
        titleHoverColor="group-hover:text-sky-300"
        description="Mando geopolítico y mapa estelar: exploración de sistemas, escaneo de mundos ajenos y despacho de expediciones y flotas imperiales."
        footerLabel="Flotas en misión:"
        footerValue={`${activeFleetMissions.length} activas`}
        footerValueClasses="text-sky-300"
      />
    ),
    imperial_fleet: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('imperial_fleet')}
        borderColor="border-cyan-500/40"
        hoverBorderColor="hover:border-cyan-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
        assetId="battleship"
        badgeText="ALMIRANTAZGO"
        badgeClasses="bg-cyan-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
        title="Almirantazgo y Operaciones Imperiales"
        icon="🛸"
        titleHoverColor="group-hover:text-cyan-300"
        description="Mando supremo naval: radar de incursiones enemigas, monitor de flotas en tránsito, convoyes comerciales y despacho federal."
        footerLabel="En tránsito:"
        footerValue={`${activeFleetMissions.length} misiones`}
        footerValueClasses="text-cyan-300"
      />
    ),
    tactical_advisor: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('tactical_advisor')}
        borderColor="border-cyan-500/40"
        hoverBorderColor="hover:border-cyan-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
        assetId="quantumTelecom"
        badgeText="IA ACTIVA"
        badgeClasses="bg-cyan-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
        title="Almirante Táctico IA"
        icon="🧠"
        titleHoverColor="group-hover:text-cyan-300"
        description="Enlace neuronal cuántico con el Núcleo Gemini: auditoría estratégica del imperio, asesoría bélica y telemetría avanzada."
      />
    ),
    missions: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('missions')}
        borderColor="border-amber-500/30"
        hoverBorderColor="hover:border-amber-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]"
        assetId="imperialMissionsHub"
        badgeText={readyMissions > 0 ? `⭐ ${readyMissions} POR RECLAMAR` : 'DIRECTIVAS'}
        badgeClasses={readyMissions > 0 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.7)] animate-pulse' : 'bg-black/70 text-amber-300 border border-amber-500/40'}
        title="Misiones"
        icon="📜"
        titleHoverColor="group-hover:text-amber-300"
        description="Órdenes supremas de colonización, expansión militar y desarrollo tecnológico con recompensas sustanciales."
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
      />
    ),
    colony_network: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('colony_network')}
        borderColor="border-indigo-500/30"
        hoverBorderColor="hover:border-indigo-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
        assetId="logisticaHub"
        badgeText="RED FEDERAL"
        badgeClasses="bg-indigo-950/80 text-indigo-300 border border-indigo-500/50"
        title="Red de Colonias y Logística"
        icon="🪐"
        titleHoverColor="group-hover:text-indigo-300"
        description="Gestión logística federal: rutas de suministro, balance de recursos entre mundos, matriz de investigación y reubicación de flotas."
        footerLabel="Mundos del imperio:"
        footerValue={`${totalPlanets} colonias`}
        footerValueClasses="text-indigo-300"
      />
    ),
    market: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('market')}
        borderColor="border-emerald-500/30"
        hoverBorderColor="hover:border-emerald-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]"
        assetId="galacticGrandBazaar"
        badgeText="COMERCIO FEDERAL"
        badgeClasses="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
        title="Mercado y Comercio Galáctico"
        icon="💼"
        titleHoverColor="group-hover:text-emerald-300"
        description="Bolsa de valores espacial, intercambio de materias primas spot, contratos corporativos, arbitraje y bazar de naves usadas."
        footerLabel="Créditos Estelares:"
        footerValue={`${fmt ? fmt(state?.credits || 0) : (state?.credits || 0)} ¢`}
        footerValueClasses="text-emerald-300"
      />
    ),
    communications: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('communications')}
        borderColor="border-blue-500/30"
        hoverBorderColor="hover:border-blue-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]"
        assetId="deepScanner"
        badgeText="INTELIGENCIA"
        badgeClasses="bg-blue-950/80 text-blue-300 border border-blue-500/50"
        title="Red de Escucha e Inteligencia"
        icon="📡"
        titleHoverColor="group-hover:text-blue-300"
        description="Centro de transmisiones, intercepción de señales extraterrestres, reportes tácticos de almirantazgo y registro de eventos."
      />
    ),
    imperial_council: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('imperial_council')}
        isLocked={(state?.planets || []).length < 10 && !state?.imperialCouncilUnlocked}
        lockReason="Tener al menos 10 planetas."
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
      />
    ),
    imperial_senate: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('imperial_senate')}
        isLocked={(state?.planets || []).length < 10 && !state?.imperialCouncilUnlocked}
        lockReason="Tener al menos 10 planetas."
        borderColor="border-purple-500/30"
        hoverBorderColor="hover:border-purple-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="imperialSenateChamber"
        badgeText="LEGISLATURA"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Senado Imperial"
        icon="🏛️"
        titleHoverColor="group-hover:text-purple-300"
        description="Cámara alta de delegados planetarios: debate leyes federales y utiliza Influencia política para orientar la votación."
      />
    ),
    bank: (() => {
      const imperialBankLevel = Array.isArray(state?.planets)
        ? Math.max(0, ...state.planets.map(p => p.buildings?.exchangeBank || 0))
        : 0;
      return (
        <HubCard
          onClick={() => onNavigateTab && onNavigateTab(COMMAND_CARD_TARGETS.galacticBank)}
          isLocked={imperialBankLevel < 1}
          lockReason="Banca Galáctica Central nivel 1 en cualquier planeta."
          borderColor="border-yellow-500/30"
          hoverBorderColor="hover:border-yellow-400"
          hoverShadow="hover:shadow-[0_0_35px_rgba(234,179,8,0.3)]"
          assetId="exchangeBank"
          badgeText="FINANZAS"
          badgeClasses="bg-yellow-950/80 text-yellow-300 border border-yellow-500/50"
          title="Banca Galáctica Central"
          icon="💎"
          titleHoverColor="group-hover:text-yellow-300"
          description="Cámara de compensación y tesorería del imperio: gestiona el cupo federal transferible desde las bancas planetarias."
          footerLabel="Nivel Federal:"
          footerValue={imperialBankLevel > 0 ? `Nv. ${imperialBankLevel} Operativo` : 'Bloqueado'}
          footerValueClasses={imperialBankLevel > 0 ? 'text-yellow-300' : 'text-slate-500'}
        />
      );
    })(),
    wiki: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('wiki')}
        borderColor="border-cyan-500/40"
        hoverBorderColor="hover:border-cyan-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
        assetId="imperialCodexArchive"
        badgeText="MANUAL DE MANDO"
        badgeClasses="bg-cyan-950/90 text-cyan-300 border border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
        title="Enciclopedia Imperial"
        icon="📚"
        titleHoverColor="group-hover:text-cyan-300"
        description="Codex Magnus, manuales tácticos, tablas de escalado paramétrico y guías operativas."
      />
    ),
    stats: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('stats')}
        borderColor="border-emerald-600/30"
        hoverBorderColor="hover:border-emerald-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(168,85,247,0.3)]"
        assetId="imperialStatisticsCore"
        badgeText="STATS"
        badgeClasses="bg-emerald-950/80 text-emerald-300 border border-emerald-500/50"
        title="Estadísticas del Imperio"
        icon="📊"
        titleHoverColor="group-hover:text-emerald-300"
        description="Registro histórico de combates, balance global de producción de recursos y censo colonial detallado."
      />
    ),
    ...sharedCommandCards({ onNavigateTab, fmt, state })
  };
}