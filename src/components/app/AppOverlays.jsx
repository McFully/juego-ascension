import React from "react";
import { CodexModal, NarrativeEventOverlay, RedAlertOverlay, PerimeterEmergencyAlert, TacticalEventOverlay } from "../../ui.jsx";
import { GameSettingsModal } from "./GameSettingsModal";
import FirstContactOverlay from "../FirstContactOverlay";
import ActiveTransmissionOverlay from "../ActiveTransmissionOverlay";
import { DialogueBox2D } from "../dialogue/DialogueBox2D.jsx";

export const AppOverlays = ({
  attackMissions,
  state,
  dispatch,
  currentPlanet,
  settingsOpen,
  setSettingsOpen,
  handleInGameSave,
  handleInGameLoad,
  handleInGameImport,
  handleInGameExport,
  effectiveSoundEnabled,
  toggleSound,
  handleReturnToMenu,
  settingsTab,
  activeCodexId,
  setActiveCodexId,
  acceptTransmission,
  setAcceptTransmission,
  BUILDINGS,
  RESEARCH,
  SHIPS,
  DEFENSES
}) => {
  const isUnderSiege = attackMissions && attackMissions.length > 0;
  const hasEnergyCrisis = (currentPlanet?.production?.energyBalance ?? 0) < 0;

  return (
    <>
      {/* Halo de Alerta Perimetral Suave (Punto 18) */}
      <PerimeterEmergencyAlert isUnderSiege={isUnderSiege} hasEnergyCrisis={hasEnergyCrisis} />

      {/* Alerta Roja de Emergencia */}
      <RedAlertOverlay missions={attackMissions} />
      
      {/* Tactical Events Overlay (Colonización, Manifiestos de Carga, Expediciones y Reciclaje) tiene prioridad máxima para reportes de misiones */}
      <TacticalEventOverlay 
        events={state.tacticalEvents}
        onDismiss={(id) => dispatch({ type: 'DISMISS_TACTICAL_EVENT', payload: id })}
        onDismissAll={() => dispatch({ type: 'DISMISS_ALL_TACTICAL_EVENTS' })}
        onNavigatePlanet={(planetId) => dispatch({ type: 'SET_PLANET', planetId })}
      />

      {/* Narrative Events Overlay (solo visible cuando no hay eventos tácticos bloqueando la vista) */}
      {(!state.tacticalEvents || state.tacticalEvents.length === 0) && (
        <NarrativeEventOverlay event={state.activeEvent} dispatch={dispatch} resources={currentPlanet?.resources} />
      )}

      {/* In-Game Settings Menu (modal) */}
      {settingsOpen && (
        <GameSettingsModal
          onClose={() => setSettingsOpen(false)}
          onSave={handleInGameSave}
          onLoad={handleInGameLoad}
          onImport={handleInGameImport}
          onExport={handleInGameExport}
          soundEnabled={effectiveSoundEnabled}
          onToggleSound={toggleSound}
          onReturnToMenu={handleReturnToMenu}
          initialTab={settingsTab}
        />
      )}

      {/* Codex Modal */}
      {activeCodexId && (
        <CodexModal 
          id={activeCodexId} 
          onClose={() => setActiveCodexId(null)} 
          BUILDINGS={BUILDINGS}
          RESEARCH={RESEARCH}
          SHIPS={SHIPS}
          DEFENSES={DEFENSES}
        />
      )}

      {/* Primer Contacto */}
      {state.activeFirstContact && (
        <FirstContactOverlay 
          activeFirstContact={state.activeFirstContact}
          dispatch={dispatch}
        />
      )}

      {/* Transmisiones en Vivo: sólo se muestra el visor interactivo cuando se acepta desde su tarjeta */}
      {state.activeTransmission && acceptTransmission && (
        <ActiveTransmissionOverlay
          activeTransmission={state.activeTransmission}
          dispatch={dispatch}
        />
      )}

      {/* Ultimátums */}
      {state.activeUltimatum && (
        <DialogueBox2D
          isOpen={true}
          speakerSide="right"
          speakerName={state.activeUltimatum.aiName || "Emisario Hostil"}
          speakerRole="Alto Mando Belicista"
          leftCharacter={{ name: state.playerName || "Comandante Imperial", avatarKey: "player" }}
          rightCharacter={{ name: state.activeUltimatum.aiName || "Señor de la Guerra", avatarKey: "warlord" }}
          message={state.activeUltimatum.message || "Exigimos tributo inmediato de mineral o tus colonias serán arrasadas."}
          options={[
            { text: "⚔️ Rechazar ultimátum y combatir", actionKey: "reject", variant: "danger" },
            { text: "💰 Pagar tributo pacificador", actionKey: "pay", variant: "neutral" }
          ]}
          onSelectOption={(key) => {
            if (key === "pay") {
              dispatch({
                type: "DIPLOMACY_PAY_TRIBUTO_THREAT",
                payload: { aiId: state.activeUltimatum.aiId, cost: { metal: 10000, crystal: 5000 } }
              });
            } else {
              dispatch({
                type: "DIPLOMACY_REJECT_TRIBUTO_THREAT",
                payload: { aiId: state.activeUltimatum.aiId }
              });
            }
            dispatch({ type: "DISMISS_ULTIMATUM" });
          }}
          onClose={() => dispatch({ type: "DISMISS_ULTIMATUM" })}
        />
      )}
    </>
  );
};
