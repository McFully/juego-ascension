import React from 'react';
import { fmt } from '../core.jsx';
import { ImperialCommandHub } from '../components/government/ImperialCommandHub.jsx';
import { ImperialCouncilCabinet } from '../components/government/council/ImperialCouncilCabinet.jsx';
import { ImperialSenateView } from '../components/government/council/ImperialSenateView.jsx';
import { TacticalAdvisorView } from '../components/advisor/TacticalAdvisorView.jsx';
import { FloatingBackButton } from '../components/navigation/FloatingBackButton.jsx';

/**
 * ImperialCommandPage — Órganos de mando del imperio.
 *
 * Tres niveles, y ninguno pertenece a un planeta:
 *   hub   → Mando Imperial (sede central)
 *   advisor → Almirante Táctico IA (Gemini)
 *   council → Consejo Imperial de Ministros Supremos (10+ mundos)
 *   senate  → Senado Imperial Interplanetario (10+ mundos)
 *
 * Antes estos dos últimos colgaban de `GovernmentPage`, que es la del mundo
 * activo, y tomaban sus recursos de ahí. El imperio no se gobierna desde un
 * planeta, así que aquí no se lee `currentPlanet`.
 */
export const ImperialCommandPage = ({
  state,
  dispatch,
  currentPlanet,
  activeTab,
  setActiveTab,
  production,
  RESEARCH = {},
  fmt
}) => {
  const level = activeTab === 'tactical_advisor'
    ? 'advisor'
    : (activeTab === 'imperial_senate' ? 'senate' : (activeTab === 'imperial_council' ? 'council' : 'hub'));

  const goTo = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="space-y-4 view-enter pb-20">
      {level === 'advisor' && (
        <TacticalAdvisorView
          state={state}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          onBack={() => goTo('imperial_hub')}
        />
      )}
      {level === 'council' && (
        <ImperialCouncilCabinet
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          onBackToGoov={() => goTo('imperial_hub')}
        />
      )}

      {level === 'senate' && (
        <ImperialSenateView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          onBackToGoov={() => goTo('imperial_hub')}
          onNavigateTab={goTo}
        />
      )}

      {level === 'hub' && (
        <ImperialCommandHub
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          RESEARCH={RESEARCH}
          onNavigateTab={goTo}
          onBackToEmpire={() => goTo('overview')}
          showTopBar={true}
        />
      )}
    </div>
  );
};

export default ImperialCommandPage;