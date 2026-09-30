import React, { useMemo } from 'react';
import { HubTopBar } from './hub/HubTopBar.jsx';
import { CommandHubGrid } from './hub/CommandHubGrid.jsx';
import { useCardOrder } from './hub/useCardOrder.js';
import {
  PLANETARY_COMMAND_CARDS,
  planetaryCommandStorageKey,
  buildPlanetaryCommandCards
} from './hub/planetaryCommandCardsConfig.jsx';

/**
 * PlanetaryCommandHub — Alto Mando de UN mundo.
 *
 * Exige `planet` de forma explícita. Nada aquí se deduce de `currentPlanetId`:
 * cada mundo tiene su gabinete, su senado, sus defensas y su tablero. Dos
 * mundos con el mismo nombre siguen siendo dos hubs distintos, porque la clave
 * del tablero incluye el `planetId`.
 */
export const PlanetaryCommandHub = React.memo(({
  state,
  dispatch,
  planet,
  production,
  fmt,
  ministryCount = 19,
  onEnterMinistries,
  onNavigateTab,
  onOpenPlanetarySenate,
  onBackToEmpire,
  showTopBar = true
}) => {
  if (!planet) return null;

  const pMinistries = planet.ministries || {};
  const activeMinistersCount = Object.values(pMinistries).filter(m => m?.minister).length;
  const autoMinistriesCount = Object.values(pMinistries).filter(m => m?.minister && (m.automationEnabled || m.autoManage)).length;

  const fleets = state?.fleets || [];

  const researchLabLevel = planet.buildings?.researchLab || 0;
  const totalDefenses = Object.values(planet.defenses || {}).reduce((a, b) => a + b, 0);
  const totalShips = Object.values(planet.fleet || {}).reduce((a, b) => a + b, 0);
  const totalMissiles = Object.values(planet.missiles || {}).reduce((a, b) => a + b, 0);
  const siloLevel = planet.buildings?.missileSilo || 0;
  const shipyardLevel = planet.buildings?.shipyard || 0;
  const maxMissiles = siloLevel * 10;
  const hasMoon = !!planet.moon;
  const localDebris = (planet.debris?.metal || 0) + (planet.debris?.crystal || 0);
  const globalDebris = (state?.debrisField?.metal || 0) + (state?.debrisField?.crystal || 0);
  const totalDebrisTons = localDebris > 0 ? localDebris : globalDebris;

  const cardsMap = useMemo(() => buildPlanetaryCommandCards({
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
    dispatch
  }), [
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
    dispatch
  ]);

  const order = useCardOrder(planetaryCommandStorageKey(planet.id), PLANETARY_COMMAND_CARDS);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {showTopBar && (
        <HubTopBar
          currentPlanet={planet}
          production={production}
          state={state}
          dispatch={dispatch}
          fmt={fmt}
          onBackToEmpire={onBackToEmpire}
          hubLabel={`Alto Mando · ${planet.name || 'Mundo'}`}
          isReordering={order.isReordering}
          onToggleReorder={() => order.setIsReordering(prev => !prev)}
          onResetOrder={order.handleResetOrder}
          showResources
        />
      )}

      <CommandHubGrid
        cardsMap={cardsMap}
        cardOrder={order.cardOrder}
        lockedCardId="back_to_empire"
        columnsClass="lg:grid-cols-4 xl:grid-cols-6"
        {...order}
      />
    </div>
  );
});