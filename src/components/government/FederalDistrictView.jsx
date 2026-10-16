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

  const [selectedCabinet, setSelectedCabinet] = useState('all');

  const MACRO_CABINETS = {
    all: { label: 'Todas las Sedes', icon: '🏛️', list: null },
    industry: {
      label: 'Desarrollo e Industria',
      icon: '🏭',
      list: ['infra', 'resources', 'industry', 'economy', 'finance', 'energy', 'transport', 'logistics']
    },
    science: {
      label: 'Ciencia y Tecnología',
      icon: '🔬',
      list: ['science', 'innovation', 'cybernetics']
    },
    society: {
      label: 'Sociedad y Biosfera',
      icon: '🌱',
      list: ['biosphere', 'agriculture', 'civics', 'culture']
    },
    security: {
      label: 'Seguridad y Estado',
      icon: '🛡️',
      list: ['defense', 'war', 'intel', 'justice', 'diplomacy']
    }
  };

  const filteredEntries = Object.entries(ministryMeta).filter(([id]) => {
    if (selectedCabinet === 'all') return true;
    const allowed = MACRO_CABINETS[selectedCabinet]?.list || [];
    return allowed.includes(id);
  });

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

      {/* Selector de Macro-Gabinetes Ejecutivos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {Object.entries(MACRO_CABINETS).map(([cabKey, cab]) => {
          const count = cab.list ? cab.list.filter(id => ministryMeta[id]).length : Object.keys(ministryMeta).length;
          const isSelected = selectedCabinet === cabKey;
          return (
            <button
              key={cabKey}
              onClick={() => {
                setSelectedCabinet(cabKey);
                if (window.playSfx) window.playSfx('click');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{cab.icon}</span>
              <span>{cab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${isSelected ? 'bg-cyan-500/30 text-cyan-200' : 'bg-white/10 text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

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

      {/* Grid Responsivo de Sedes Ministeriales */}
      <div className="w-full pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full items-stretch pb-2">
          {filteredEntries.map(([id, meta]) => (
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

