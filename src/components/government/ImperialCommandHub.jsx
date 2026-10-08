import React, { useMemo } from 'react';
import { HubTopBar } from './hub/HubTopBar.jsx';
import { CommandHubGrid } from './hub/CommandHubGrid.jsx';
import { useCardOrder } from './hub/useCardOrder.js';
import {
  IMPERIAL_COMMAND_CARDS,
  IMPERIAL_COMMAND_STORAGE_KEY,
  buildImperialCommandCards
} from './hub/imperialCommandCardsConfig.jsx';

/**
 * ImperialCommandHub — Mando Imperial. La sede central del imperio.
 *
 * No es el mando de ningún mundo: no recibe `currentPlanet` para leer estado de
 * juego, solo el estado del imperio. Su tablero se guarda aparte del de cada
 * planeta, así que reordenar aquí no toca ningún mundo.
 */
export const ImperialCommandHub = React.memo(({
  state,
  dispatch,
  currentPlanet,
  production,
  fmt,
  onNavigateTab,
  onBackToEmpire,
  showTopBar = true
}) => {
  const missions = state?.missions || [];
  const claimedCount = (state?.claimedMissions || []).length;
  const readyMissions = missions.filter(m => m.progress >= m.target && !(state?.claimedMissions || []).includes(m.id)).length;

  const cardsMap = useMemo(() => buildImperialCommandCards({
    onNavigateTab,
    onBackToEmpire,
    readyMissions,
    claimedCount,
    missions,
    fmt,
    state
  }), [onNavigateTab, onBackToEmpire, readyMissions, claimedCount, missions, fmt, state]);

  const order = useCardOrder(IMPERIAL_COMMAND_STORAGE_KEY, IMPERIAL_COMMAND_CARDS);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {showTopBar && (
        <HubTopBar
          currentPlanet={currentPlanet}
          production={production}
          state={state}
          dispatch={dispatch}
          fmt={fmt}
          onBackToEmpire={onBackToEmpire}
          hubLabel="Mando Imperial"
          isReordering={order.isReordering}
          onToggleReorder={() => order.setIsReordering(prev => !prev)}
          onResetOrder={order.handleResetOrder}
          showResources={true}
        />
      )}

      <CommandHubGrid
        cardsMap={cardsMap}
        cardOrder={order.cardOrder}
        columnsClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
        {...order}
      />
    </div>
  );
});