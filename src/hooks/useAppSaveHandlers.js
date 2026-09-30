import { useCallback } from "react";
import { stopAmbient } from "../audio.js";
import { setSessionId, withSessionIdentity } from "../utils/sessionIdentity.js";

export function useAppSaveHandlers({
  state,
  dispatch,
  availableSaves,
  setAvailableSaves,
  setLastSaveName,
  saveRef,
  resettingRef,
  setMenuScreen
}) {
  const handleMenuContinue = async () => {
    if (availableSaves.length === 0) return;
    const last = availableSaves[0];
    if (window.electronAPI && window.electronAPI.loadSaveBySlug) {
      const result = await window.electronAPI.loadSaveBySlug(last.slug);
      if (result.success && result.data) {
        dispatch({ type: "LOAD", payload: result.data });
      }
    }
  };

  const handleMenuNewGame = () => setMenuScreen("new");
  const handleMenuLoadGame = () => setMenuScreen("load");
  const handleMenuSaveGame = () => setMenuScreen("save");

  const handleMenuImport = async () => {
    if (!window.electronAPI || !window.electronAPI.importSaveFromFile) return;
    const result = await window.electronAPI.importSaveFromFile();
    if (result.success && result.data) {
      const list = await window.electronAPI.listSaves();
      if (list.success) setAvailableSaves(list.saves || []);
      dispatch({ type: "LOAD", payload: result.data });
    } else if (result.error && !result.canceled) {
      alert("Error al importar: " + result.error);
    }
  };

  const handleMenuExport = async () => {
    if (!window.electronAPI || !window.electronAPI.exportSaveToFile) return;
    let dataToExport = state;
    let nameToExport = state?.playerName || "partida";

    if (!state.gameStarted) {
      if (availableSaves.length === 0) {
        alert("No hay partidas guardadas para exportar en este equipo.");
        return;
      }
      const last = availableSaves[0];
      const loadRes = await window.electronAPI.loadSaveBySlug(last.slug);
      if (loadRes.success && loadRes.data) {
        dataToExport = loadRes.data;
        nameToExport = dataToExport.playerName || last.name || "partida";
      } else {
        alert("No se pudo leer la partida para exportar.");
        return;
      }
    }

    const result = await window.electronAPI.exportSaveToFile(dataToExport, nameToExport);
    if (result.success) {
      alert("Partida exportada correctamente a: " + result.path);
    } else if (result.error && !result.canceled) {
      alert("Error al exportar: " + result.error);
    }
  };

  const handleMenuExit = () => {
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    } else {
      window.close();
    }
  };

  const handleLoadFromList = async (slug) => {
    const result = await window.electronAPI.loadSaveBySlug(slug);
    if (result.success && result.data) {
      dispatch({ type: "LOAD", payload: result.data });
    } else {
      alert("Error al cargar: " + (result.error || "desconocido"));
    }
  };

  const requireElectronAPI = () => {
    if (!window.electronAPI) {
      return { success: false, error: "Funcionalidad de guardado no disponible (modo navegador). Ejecuta la app desde Electron." };
    }
    return null;
  };

  const handleInGameSave = async (name) => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const currentSave = (saveRef.current && saveRef.current.planets && saveRef.current.planets.length > 0)
      ? saveRef.current
      : (state && state.planets && state.planets.length > 0 ? state : null);

    if (!currentSave) {
      return { success: false, error: "No hay una partida activa para guardar." };
    }

    const snap = {
      ...withSessionIdentity(currentSave),
      saveName: name,
      playerName: currentSave.playerName || state?.playerName || "Comandante",
      version: 4,
      gameStarted: true
    };
    const result = await window.electronAPI.saveGameNamed(snap);
    if (result.success) {
      if (result.sessionId) setSessionId(result.sessionId);
      const list = await window.electronAPI.listSaves();
      if (list.success) {
        setAvailableSaves(list.saves || []);
        if (list.saves && list.saves.length > 0 && setLastSaveName) {
          setLastSaveName(list.saves[0].name);
        }
      }
    }
    return result;
  };

  const handleInGameLoad = async (slug) => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.loadSaveBySlug(slug);
    if (result.success && result.data) {
      dispatch({ type: "LOAD", payload: result.data });
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const handleInGameImport = async () => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.importSaveFromFile();
    if (result.success && result.data) {
      dispatch({ type: "LOAD", payload: result.data });
      return { success: true };
    }
    return { success: false, error: result.error || "Importación cancelada" };
  };

  const handleInGameExport = async () => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.exportSaveToFile(saveRef.current, saveRef.current.playerName || "partida");
    return result;
  };

  const handleReturnToMenu = async () => {
    resettingRef.current = true;
    stopAmbient();
    if (window.electronAPI) {
      try {
        if (saveRef.current && saveRef.current.gameStarted && saveRef.current.playerName) {
          if (window.electronAPI.saveGameNamedSync) {
            window.electronAPI.saveGameNamedSync(saveRef.current);
          } else if (window.electronAPI.saveGameNamed) {
            await window.electronAPI.saveGameNamed(saveRef.current);
          }
        }
        if (window.electronAPI.listSaves) {
          const listResult = await window.electronAPI.listSaves();
          if (listResult.success && listResult.saves) {
            setAvailableSaves(listResult.saves);
            if (listResult.saves.length > 0 && setLastSaveName) {
              setLastSaveName(listResult.saves[0].name);
            }
          }
        }
      } catch (_) {}
    }
    setMenuScreen("main");
    dispatch({ type: "RESET_GAME" });
  };

  return {
    handleMenuContinue,
    handleMenuNewGame,
    handleMenuLoadGame,
    handleMenuSaveGame,
    handleMenuImport,
    handleMenuExport,
    handleMenuExit,
    handleLoadFromList,
    handleInGameSave,
    handleInGameLoad,
    handleInGameImport,
    handleInGameExport,
    handleReturnToMenu
  };
}
