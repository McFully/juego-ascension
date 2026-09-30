import React from 'react';
import { HubCard } from './HubCard.jsx';
import { sharedCommandCards } from './sharedCommandCards.jsx';

/**
 * Catálogo del Mando Imperial.
 *
 * Son los órganos del imperio: misiones, diplomacia, consejo, senado, colonias,
 * estadísticas, ingeniería y táctica. Ninguna tarjeta de aquí depende del
 * planeta activo, porque el Mando Imperial no es el mando de ningún mundo.
 */
export const IMPERIAL_COMMAND_CARDS = [
  'missions',
  'diplomacy',
  'imperial_council',
  'imperial_senate',
  'colony_network',
  'combat',
  'shipDesign',
  'stats'
];

export const IMPERIAL_COMMAND_STORAGE_KEY = 'ascension_cmd_hub_imperial_v1';

export function buildImperialCommandCards({
  onNavigateTab,
  readyMissions,
  claimedCount,
  missions,
  fmt,
  state
}) {
  return {
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
    ...sharedCommandCards({ onNavigateTab, fmt, state })
  };
}