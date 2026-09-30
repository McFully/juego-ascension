import React from "react";
import { CodexModal, RedAlertOverlay, PerimeterEmergencyAlert } from "../../ui.jsx";
import { GameSettingsModal } from "./GameSettingsModal";
import { DialogueBox2D } from "../dialogue/DialogueBox2D.jsx";
import { VictoryOverlay } from "./VictoryOverlay.jsx";
import { TutorialOverlay } from "./TutorialOverlay.jsx";

/**
 * AppOverlays — 3.4-a: nada de comunicación entrante se abre sola.
 *
 * Se han desmontado cuatro overlays que saltaban sin que el jugador los pidiera:
 *   - TacticalEventOverlay   (informes de misión)
 *   - NarrativeEventOverlay  (narrativas con decisión)
 *   - FirstContactOverlay    (primer contacto)
 *   - ActiveTransmissionOverlay (transmisiones en vivo)
 *
 * Todos ellos se acumulan ahora en `state.tacticalEventLog` y se leen desde la
 * bandeja de Telemetría, con contador de pendientes. El sonido y la voz pasan a
 * sonar al ABRIR un mensaje, no al recibirlo.
 *
 * Se dejan intactos, porque perderlos costaría caro al jugador:
 *   - PerimeterEmergencyAlert / RedAlertOverlay: estados continuos del mundo.
 *   - El ultimátum: expirar una decisión destructiva por no mirar un popup sería
 *     peor que el popup. Además queda anotado en la bandeja.
 *   - Tutorial, Victoria, ajustes y codex: fuera del alcance.
 */
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
          state={state}
          dispatch={dispatch}
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

      {/* Ultimátums — siguen siendo bloqueantes (ver el comentario de cabecera) */}
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

      {/* Tutorial Inicial Guiado */}
      {state.showTutorial && (
        <TutorialOverlay
          onComplete={() => dispatch({ type: "SET_TUTORIAL_COMPLETE" })}
        />
      )}

      {/* Fin de Partida / Victoria Imperial */}
      {(state.victory || state.gameOver) && (
        <VictoryOverlay
          victory={state.victory}
          gameOver={state.gameOver}
          onRestart={handleReturnToMenu}
          onClose={() => dispatch({ type: "DISMISS_VICTORY_OVERLAY" })}
        />
      )}
    </>
  );
};
