import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';
import { SafeImg } from '../../assets.jsx';
import { GovernorDelegationModal } from './GovernorDelegationModal.jsx';
import { MinistryLockedModal } from './MinistryLockedModal.jsx';
import { MinistryCard } from './MinistryCard.jsx';
import { FederalDistrictHeader } from './FederalDistrictHeader.jsx';

export const FederalDistrictView = ({
  ministryMeta,
  getMinistryState,
  onEnterMinistry,
  onBackToEmpire,
  onBackToAltoMando,
  currentPlanet,
  state,
  dispatch,
  fmt,
  production,
  onNavigateToMinistry
}) => {
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [lockedMinistryModal, setLockedMinistryModal] = useState(null);

  const handleToggleGovernance = () => {
    dispatch({
      type: 'SET_PLANET_AUTO_GOVERNANCE',
      planetId: currentPlanet?.id,
      autoGovernance: !currentPlanet?.autoGovernance,
    });
    if (window.playSfx) window.playSfx('click');
  };

  return (
    <div className="space-y-4">
      {/* Barra de Navegación, Gobernador y Recursos Estandarizados */}
      <FederalDistrictHeader
        currentPlanet={currentPlanet}
        state={state}
        dispatch={dispatch}
        fmt={fmt}
        production={production}
        onBackToEmpire={onBackToEmpire}
        onBackToAltoMando={onBackToAltoMando}
        onOpenDelegation={() => setShowDelegationModal(true)}
      />

      {/* Renderizado de Modales mediante Portal al body */}
      {typeof document !== 'undefined' && document.body && showDelegationModal && ReactDOM.createPortal(
        <GovernorDelegationModal
          isOpen={showDelegationModal}
          onClose={() => setShowDelegationModal(false)}
          currentPlanet={currentPlanet}
          onToggleGovernance={handleToggleGovernance}
          dispatch={dispatch}
        />,
        document.body
      )}

      {typeof document !== 'undefined' && document.body && lockedMinistryModal && ReactDOM.createPortal(
        <MinistryLockedModal
          isOpen={Boolean(lockedMinistryModal)}
          onClose={() => setLockedMinistryModal(null)}
          data={lockedMinistryModal}
          onNavigateToMinistry={onNavigateToMinistry}
        />,
        document.body
      )}

      {/* Grid Responsivo de Sedes Ministeriales (20 carteras ministeriales oficiales completas) */}
      <div className="w-full pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full items-stretch pb-2">
          {Object.entries(ministryMeta).map(([id, meta]) => (
            <MinistryCard
              key={id}
              id={id}
              meta={meta}
              mState={getMinistryState ? getMinistryState(id) : null}
              currentPlanet={currentPlanet}
              onEnterMinistry={onEnterMinistry}
              setLockedMinistryModal={setLockedMinistryModal}
              dispatch={dispatch}
            />
          ))}
        </div>
      </div>
    </div>
    );
  };

