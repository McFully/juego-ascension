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
  'tactical_advisor',
  'missions',
  'diplomacy',
  'imperial_council',
  'imperial_senate',
  'colony_network',
  'combat',
  'shipDesign',
  'bank',
  'wiki'
];

export const IMPERIAL_COMMAND_STORAGE_KEY = 'ascension_cmd_hub_imperial_v3';

export function buildImperialCommandCards({
  onNavigateTab,
  onBackToEmpire,
  readyMissions,
  claimedCount,
  missions,
  fmt,
  state
}) {
  return {
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
        assetId="councilChamber"
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
        assetId="permanentEmbassy"
        badgeText="LEGISLATURA"
        badgeClasses="bg-purple-950/80 text-purple-300 border border-purple-500/50"
        title="Senado Imperial"
        icon="🏛️"
        titleHoverColor="group-hover:text-purple-300"
        description="Cámara alta de delegados planetarios: debate leyes federales y utiliza Influencia política para orientar la votación."
      />
    ),
    colony_network: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('colony_network')}
        borderColor="border-indigo-500/30"
        hoverBorderColor="hover:border-indigo-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
        assetId="logisticaHub"
        badgeText="LOGÍSTICA"
        badgeClasses="bg-indigo-950/80 text-indigo-300 border border-indigo-500/50"
        title="Logística"
        icon="🪐"
        titleHoverColor="group-hover:text-indigo-300"
        description="Gestión logística y científica: rutas de transporte, matriz neural de investigación compartida y despliegue de flotas."
      />
    ),
    bank: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab(COMMAND_CARD_TARGETS.planetaryBank)}
        borderColor="border-yellow-500/30"
        hoverBorderColor="hover:border-yellow-400"
        hoverShadow="hover:shadow-[0_0_35px_rgba(234,179,8,0.3)]"
        assetId="futuresExchange"
        badgeText="FINANZAS"
        badgeClasses="bg-yellow-950/80 text-yellow-300 border border-yellow-500/50"
        title="Banca Central"
        icon="🏦"
        titleHoverColor="group-hover:text-yellow-300"
        description="Servicios bancarios y de crédito estelar: custodia de activos, colocación de depósitos e intereses en el mercado interplanetario."
      />
    ),
    wiki: (
      <HubCard
        onClick={() => onNavigateTab && onNavigateTab('wiki')}
        borderColor="border-cyan-500/40"
        hoverBorderColor="hover:border-cyan-300"
        hoverShadow="hover:shadow-[0_0_35px_rgba(6,182,212,0.35)]"
        assetId="sectorGovPalace"
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
        assetId="sectorGovPalace"
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