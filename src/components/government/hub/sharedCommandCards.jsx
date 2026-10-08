import React from 'react';
import { HubCard } from './HubCard.jsx';

/**
 * Tarjetas que existen tanto en el hub del imperio como en el de un mundo.
 *
 * El astillero de diseño y el simulador de batalla son herramientas del
 *ufacturero, no de un gobierno concreto, así que se comparten. Lo que no se
 * comparte es el estado que leen: el hub del imperio nunca les pasa el planeta
 * activo, así que aquí solo entran datos del imperio.
 */
export const sharedCommandCards = ({ onNavigateTab, fmt, state }) => ({
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
    />
  ),
  combat: (
    <HubCard
      onClick={() => onNavigateTab && onNavigateTab('combat')}
      borderColor="border-red-500/30"
      hoverBorderColor="hover:border-red-400"
      hoverShadow="hover:shadow-[0_0_35px_rgba(239,68,68,0.3)]"
      assetId="centroGuerra"
      badgeText="TÁCTICA"
      badgeClasses="bg-red-950/80 text-red-300 border border-red-500/50"
      title="Centro de Guerra"
      icon="⚔️"
      titleHoverColor="group-hover:text-red-300"
      description="Predicción balística de combate espacial: simula enfrentamientos, porcentaje de bajas y botín estimado."
    />
  ),
});