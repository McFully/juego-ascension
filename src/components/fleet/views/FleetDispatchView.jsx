import React from 'react';
import { DestinationSelectorSection } from '../DestinationSelectorSection.jsx';
import { FleetSelectionList } from '../FleetSelectionList.jsx';
import { MissionConfigPanel } from '../MissionConfigPanel.jsx';

export const FleetDispatchView = ({
  target,
  setSelectedTarget,
  currentPlanet,
  state,
  dispatch,
  selectedShips,
  setSelectedShips,
  filter,
  setFilter,
  availableShips,
  shipDisplayIcon,
  shipDisplayName,
  shipStats,
  toggleShip,
  missionType,
  setMissionType,
  missionSpeed,
  setMissionSpeed,
  transportRes,
  setTransportRes,
  autoRetreat,
  setAutoRetreat,
  formation,
  setFormation,
  handleSimulate,
  sendFleet,
  fmt,
  S
}) => {
  return (
    <div className="space-y-4">
      <DestinationSelectorSection
        target={target}
        setSelectedTarget={setSelectedTarget}
        currentPlanet={currentPlanet}
        shipDisplayIcon={shipDisplayIcon}
        shipDisplayName={shipDisplayName}
        shipStats={shipStats}
        fmt={fmt}
        S={S}
      />

      {target && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Columna Izquierda (50%): Despacho y Asignación de Escuadrones */}
          <div className="w-full">
            <FleetSelectionList
              state={state}
              dispatch={dispatch}
              currentPlanet={currentPlanet}
              target={target}
              selectedShips={selectedShips}
              setSelectedShips={setSelectedShips}
              filter={filter}
              setFilter={setFilter}
              availableShips={availableShips}
              shipDisplayIcon={shipDisplayIcon}
              shipDisplayName={shipDisplayName}
              shipStats={shipStats}
              toggleShip={toggleShip}
              fmt={fmt}
              S={S}
            />
          </div>

          {/* Columna Derecha (50%): Tipo de Misión y Parámetros Tácticos */}
          <div className="w-full">
            <MissionConfigPanel
              target={target}
              currentPlanet={currentPlanet}
              selectedShips={selectedShips}
              setSelectedShips={setSelectedShips}
              missionType={missionType}
              setMissionType={setMissionType}
              missionSpeed={missionSpeed}
              setMissionSpeed={setMissionSpeed}
              transportRes={transportRes}
              setTransportRes={setTransportRes}
              autoRetreat={autoRetreat}
              setAutoRetreat={setAutoRetreat}
              formation={formation}
              setFormation={setFormation}
              handleSimulate={handleSimulate}
              sendFleet={sendFleet}
              shipStats={shipStats}
              state={state}
              fmt={fmt}
              S={S}
            />
          </div>
        </div>
      )}
    </div>
  );
};
