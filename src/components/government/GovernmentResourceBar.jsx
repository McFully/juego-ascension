import React from 'react';
import { TacticalResourceRow } from '../ui/TacticalResourceRow.jsx';

/**
 * GovernmentResourceBar — Fila superior de recursos en tiempo real
 * para la cabecera ministerial de GovernmentPage.
 */
export const GovernmentResourceBar = React.memo(({ currentPlanet, production, state, fmt }) => {
  return (
    <TacticalResourceRow
      currentPlanet={currentPlanet}
      production={production}
      state={state}
      fmt={fmt}
    />
  );
});
