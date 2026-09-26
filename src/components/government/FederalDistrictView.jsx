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

      {/* Grid Responsivo de Sedes Ministeriales (5x4 = 19 carteras + 1 tarjeta de retorno) */}
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
            />
          ))}

          {/* Tarjeta 20: Volver al Alto Mando */}
          <button
            onClick={() => {
              if (window.playSfx) window.playSfx('click');
              if (onBackToEmpire) onBackToEmpire();
            }}
            className="group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-200 select-none text-left focus:outline-none w-full h-full border-cyan-500/40 bg-[#061022]/80 hover:border-cyan-400 hover:bg-[#091836] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] active:scale-[0.98] cursor-pointer"
          >
            <div className="relative w-full h-24 md:h-28 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
              <SafeImg
                id="commandCenter"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider border backdrop-blur-sm bg-cyan-950/80 text-cyan-300 border-cyan-500/50">
                RETORNO
              </span>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                <span className="text-3xl text-cyan-300 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] transform group-hover:-translate-x-1 transition-transform">
                  ◀
                </span>
              </div>
            </div>

            <div className="p-2.5 md:p-3 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wide truncate text-cyan-300 group-hover:text-white transition-colors">
                  Alto Mando
                </h4>
                <p className="text-[10px] md:text-[11px] text-slate-400 font-mono mt-0.5 line-clamp-2 leading-tight">
                  Regresa a la sede de mando supremo y gestión general de órganos del imperio.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
    );
  };

