import { useState, useEffect, useRef } from "react";
import { clearSessionId } from "../utils/sessionIdentity.js";
import { useGameAudio } from "./useGameAudio.js";
import { useAutosave } from "./useAutosave.js";
import { useGameTick } from "./useGameTick.js";
import { useOfflineProgress } from "./useOfflineProgress.js";

export function useGameLifecycle({
  state,
  dispatch,
  journalRef,
  production,
  TICK_MS,
  activeTab,
  fmt
}) {
  const [ready, setReady] = useState(false);
  const [engineInfo, setEngineInfo] = useState("Detectando...");
  const [availableSaves, setAvailableSaves] = useState([]);
  const [lastSaveName, setLastSaveName] = useState("");
  const [lastSave, setLastSave] = useState(Date.now());

  const stateRef = useRef(state);
  stateRef.current = state;

  const saveRef = useRef(state);
  if (state && (state.gameStarted || (state.planets && state.planets.length > 0))) {
    saveRef.current = state;
  }

  // Al volver al menu la sesion deja de existir
  if (state && !state.gameStarted) {
    clearSessionId();
  }

  const resettingRef = useRef(false);

  // Boot initialization
  useEffect(() => {
    (async () => {
      console.log("[Ascensión] Boot: inicio");
      try {
        if (window.electronAPI) {
          console.log("[Ascensión] Boot: detectado Electron");
          const listResult = await window.electronAPI.listSaves();
          if (listResult.success && listResult.saves) {
            setAvailableSaves(listResult.saves);
            if (listResult.saves.length > 0) {
              setLastSaveName(listResult.saves[0].name);
            }
          }
        }
      } catch (e) {
        console.error("[Ascensión] Boot error:", e);
        if (window.electronAPI && window.electronAPI.logError) {
          window.electronAPI.logError(`Boot error: ${e?.message || e}`, e?.stack || "", "boot-load");
        }
      }
      setEngineInfo("Ascension Simulation Engine v4.0");
      console.log("[Ascensión] Boot: listo");
      setReady(true);
    })();
  }, []);

  // Sub-hook: Ciclo de Tick (Web Worker + Fallback síncrono)
  useGameTick({ state, dispatch, production, TICK_MS, stateRef, journalRef });

  // Sub-hook: Progreso Offline
  useOfflineProgress({ state, ready, dispatch, fmt, stateRef });

  // Sub-hook: Guardado automático e IPC sincronizado
  useAutosave({ state, saveRef, resettingRef, setLastSave });

  // Sub-hook: Audio, SFX y Músicas
  const { effectiveSoundEnabled, toggleSound, safeSfx } = useGameAudio({ state, activeTab });

  return {
    ready,
    setReady,
    engineInfo,
    availableSaves,
    setAvailableSaves,
    lastSaveName,
    setLastSaveName,
    effectiveSoundEnabled,
    toggleSound,
    safeSfx,
    stateRef,
    saveRef,
    resettingRef,
    lastSave,
    setLastSave
  };
}
