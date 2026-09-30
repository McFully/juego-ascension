import { useState, useEffect, useRef, useCallback } from "react";
import { processColonyGovernor } from "../reducers/colonyGovernor.js";
import { auditGameState, logTelemetry } from "../utils/telemetry.js";
import { setSessionId, clearSessionId, withSessionIdentity } from "../utils/sessionIdentity.js";
import {
  sfx, startAmbient, stopAmbient, setMuted,
  playMenuMusic, playInGameMusic, stopMenuMusic,
  playSystemMusic, stopSystemMusic
} from "../audio.js";

export function useGameLifecycle({
  state,
  dispatch,
  production,
  TICK_MS,
  activeTab,
  fmt
}) {
  const [ready, setReady] = useState(false);
  const [engineInfo, setEngineInfo] = useState("Detectando...");
  const [availableSaves, setAvailableSaves] = useState([]);
  const [lastSaveName, setLastSaveName] = useState("");
  const [userMuted, setUserMuted] = useState(false);
  const [lastSave, setLastSave] = useState(Date.now());

  const soundEnabled = true;
  const effectiveSoundEnabled = soundEnabled && !userMuted;

  const toggleSound = () => {
    setUserMuted(prev => {
      const next = !prev;
      try { setMuted(next); } catch (_) {}
      return next;
    });
  };

  const safeSfx = useCallback((fn, ...args) => {
    if (effectiveSoundEnabled) fn(...args);
  }, [effectiveSoundEnabled]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const saveRef = useRef(state);
  if (state && (state.gameStarted || (state.planets && state.planets.length > 0))) {
    saveRef.current = state;
  }

  // Al volver al menu la sesion deja de existir: si no se limpia, una partida
  // nueva heredaria el id de la anterior y la machacaria al primer guardado.
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

  // Tick interval con Web Worker en segundo plano (Fallback síncrono si no hay soporte)
  const productionRef = useRef(production);
  productionRef.current = production;

  useEffect(() => {
    if (!state.gameStarted) return;

    let worker = null;
    let isProcessingTick = false;
    let lastTickSentTime = 0;

    try {
      if (typeof Worker !== 'undefined') {
        worker = new Worker(new URL('../workers/game.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = (e) => {
          try {
            const { action, payload } = e.data || {};
            if (action === 'TICK_SUCCESS' && payload?.newState) {
              dispatch({ type: 'APPLY_TICK_STATE', payload: payload.newState });
              try { processColonyGovernor(payload.newState, dispatch); } catch (gErr) { console.error('[Ascensión] Governor error:', gErr); }
              try { auditGameState(payload.newState, productionRef.current); } catch (aErr) { console.error('[Ascensión] Audit error:', aErr); }
            } else if (action === 'TICK_ERROR') {
              console.warn('[Ascensión] Worker TICK error, procesando fallback síncrono:', payload?.error);
              dispatch({ type: 'TICK' });
            }
          } finally {
            isProcessingTick = false;
          }
        };
        worker.onerror = (err) => {
          console.warn('[Ascensión] Worker exception, ejecutando fallback:', err);
          isProcessingTick = false;
        };
      }
    } catch (workerInitErr) {
      console.warn('[Ascensión] No se pudo inicializar Web Worker, usando hilo principal:', workerInitErr);
      worker = null;
    }

    const interval = setInterval(() => {
      try {
        const currentState = stateRef.current || state;
        const now = Date.now();

        // Watchdog: si el worker tarda más de 3.5s en responder, desbloquear bandera
        if (isProcessingTick && (now - lastTickSentTime > 3500)) {
          console.warn('[Ascensión] Watchdog: Worker tick tardó demasiado, forzando desbloqueo');
          isProcessingTick = false;
        }

        if (worker && !isProcessingTick) {
          isProcessingTick = true;
          lastTickSentTime = now;
          try {
            worker.postMessage({
              action: 'TICK',
              payload: { state: currentState, tickId: now }
            });
          } catch (postErr) {
            console.error('[Ascensión] worker.postMessage error, ejecutando fallback síncrono:', postErr);
            isProcessingTick = false;
            dispatch({ type: 'TICK' });
          }
        } else if (!worker) {
          dispatch({ type: 'TICK' });
          try { processColonyGovernor(stateRef.current || state, dispatch); } catch (_) {}
          try { auditGameState(stateRef.current || state, productionRef.current); } catch (_) {}
        }
      } catch (e) {
        console.error('[Ascensión] TICK dispatch error:', e);
        logTelemetry('ERROR', 'Excepción en ciclo de juego (TICK)', {
          error: e?.message || e,
          stack: e?.stack || '',
          stateSnapshot: {
            playerName: state.playerName,
            gameTick: state.gameTick,
            planetsCount: (state.planets || []).length,
          },
        });
      }
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      if (worker) {
        try { worker.terminate(); } catch (_) {}
      }
    };
  }, [state.gameStarted, TICK_MS, dispatch]);

  // Offline progress simulation
  const offlineProcessedRef = useRef(false);
  const offlineResourcesBeforeRef = useRef(null);
  const offlineEventsBeforeRef = useRef(null);

  useEffect(() => {
    if (!state.gameStarted || !state.lastTick || !ready || offlineProcessedRef.current) return;
    const elapsed = (Date.now() - state.lastTick) / 1000;
    if (elapsed <= 300) return;
    const totalTicks = Math.min(Math.floor(elapsed), 1800);
    offlineProcessedRef.current = true;

    const totalsBefore = {
      metal: (state.planets || []).reduce((sum, p) => sum + (p.resources?.metal || 0), 0),
      crystal: (state.planets || []).reduce((sum, p) => sum + (p.resources?.crystal || 0), 0),
      deuterium: (state.planets || []).reduce((sum, p) => sum + (p.resources?.deuterium || 0), 0),
    };
    offlineResourcesBeforeRef.current = totalsBefore;
    offlineEventsBeforeRef.current = {
      notifs: (state.notifications || []).length,
      galactic: (state.galacticEvents || []).length,
    };

    let completed = 0;
    const CHUNK = 50;
    let timerId = null;
    const tickBatch = () => {
      const limit = Math.min(completed + CHUNK, totalTicks);
      for (let i = completed; i < limit; i++) {
        try {
          dispatch({ type: "TICK" });
        } catch (e) {
          console.error("[Ascensión] Offline TICK error:", e);
          if (window.electronAPI && window.electronAPI.logError) {
            const snap = stateRef.current || state;
            window.electronAPI.logError(`Offline TICK error: ${e?.message || e}`, e?.stack || "", `offlineTick player=${snap.playerName} missions=${(snap.fleetMissions||[]).length}`);
          }
          break;
        }
      }
      completed = limit;
      if (completed < totalTicks) {
        timerId = setTimeout(tickBatch, 16);
      } else {
        const hours = Math.floor(totalTicks / 3600);
        const mins = Math.floor((totalTicks % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const snap = stateRef.current;
        const before = offlineResourcesBeforeRef.current || { metal: 0, crystal: 0, deuterium: 0 };
        const after = {
          metal: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.metal || 0), 0),
          crystal: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.crystal || 0), 0),
          deuterium: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.deuterium || 0), 0),
        };
        const dMetal = Math.max(0, Math.floor(after.metal - before.metal));
        const dCrystal = Math.max(0, Math.floor(after.crystal - before.crystal));
        const dDeuterium = Math.max(0, Math.floor(after.deuterium - before.deuterium));

        const evBefore = offlineEventsBeforeRef.current || { notifs: 0, galactic: 0 };
        const notifNow = (snap?.notifications || []).length;
        const galNow = (snap?.galacticEvents || []).length;
        const processed = (notifNow - evBefore.notifs) + (galNow - evBefore.galactic);

        const richMessage = `⏱️ Progreso offline: ${timeStr} simulados\n⛏️ +${fmt(dMetal)} Metal  💎 +${fmt(dCrystal)} Cristal  ⚗️ +${fmt(dDeuterium)} Deuterio\n📡 ${processed} eventos/notificaciones procesados durante tu ausencia`;

        dispatch({ type: "ADD_NOTIFICATION", payload: {
          type: "success",
          message: richMessage
        }});

        offlineResourcesBeforeRef.current = null;
        offlineEventsBeforeRef.current = null;
      }
    };
    timerId = setTimeout(tickBatch, 32);
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [ready]);

  // Auto-save every 30s
  useEffect(() => {
    if (!state.gameStarted || !window.electronAPI || resettingRef.current) return;

    const interval = setInterval(() => {
      if (resettingRef.current) return;
      const snap = withSessionIdentity(saveRef.current);
      const missions = (snap.fleetMissions || []).length;
      const qLens = `b${(snap.buildQueue||[]).length}s${(snap.shipQueue||[]).length}r${(snap.researchQueue||[]).length}`;
      console.log(`[Ascensión] Auto-save start | missions=${missions} queues=${qLens}`);
      window.electronAPI.saveGameNamed(snap).then(r => {
        if (r.success) {
          // Guardar el id devuelto es lo que evita que el siguiente
          // auto-guardado abra una sesión nueva.
          if (r.sessionId) setSessionId(r.sessionId);
          setLastSave(Date.now());
          console.log("[Ascensión] Auto-save ok");
        } else if (window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save failed: ${r.error || "unknown"}`, "", `missions=${missions}`);
        }
      }).catch(e => {
        console.error("Auto-save error:", e);
        if (window.electronAPI && window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save exception: ${e?.message || e}`, e?.stack || "", `missions=${missions}`);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.gameStarted]);

  // Save on unload
  useEffect(() => {
    if (!state.gameStarted || resettingRef.current) return;
    const handler = () => {
      if (resettingRef.current) return;
      if (window.electronAPI) {
        const snap = withSessionIdentity(saveRef.current);
        const missions = (snap.fleetMissions || []).length;
        console.log(`[Ascensión] Save-on-unload | missions=${missions}`);
        try {
          const r = window.electronAPI.saveGameNamedSync(snap);
          if (r && r.success && r.sessionId) setSessionId(r.sessionId);
        } catch (e) {
          if (window.electronAPI.logError) {
            window.electronAPI.logError(`Save-on-unload error: ${e?.message || e}`, e?.stack || "", `missions=${missions}`);
          }
        }
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.gameStarted]);

  // Sound effects on game events
  const lastHoverTimeRef = useRef(0);
  const lastHoverTargetRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  useEffect(() => {
    if (!state.gameStarted) return;
    const clickHandler = (e) => {
      const target = e.target.closest("button, [role=\"button\"], .tab-btn, .sidebarTab");
      if (target) {
        const now = Date.now();
        if (now - lastClickTimeRef.current > 120) {
          lastClickTimeRef.current = now;
          const isTab = target.closest(".sidebarTab") || target.classList.contains("sidebarTab") || target.closest(".tab-btn");
          if (!isTab) {
            const pan = e.clientX ? (e.clientX / window.innerWidth) * 2 - 1 : 0;
            safeSfx(sfx.uiClick, pan);
          }
        }
      }
    };
    const hoverHandler = (e) => {
      const target = e.target.closest("button, [role=\"button\"], .tab-btn, .sidebarTab");
      if (target && target !== lastHoverTargetRef.current) {
        const now = Date.now();
        if (now - lastHoverTimeRef.current > 80) {
          lastHoverTargetRef.current = target;
          lastHoverTimeRef.current = now;
          const pan = e.clientX ? (e.clientX / window.innerWidth) * 2 - 1 : 0;
          safeSfx(sfx.uiHover, pan);
        }
      }
    };
    const mouseOutHandler = (e) => {
      const target = e.target.closest("button, [role=\"button\"], .tab-btn, .sidebarTab");
      if (!target) {
        lastHoverTargetRef.current = null;
      }
    };
    document.addEventListener("click", clickHandler);
    document.addEventListener("mouseover", hoverHandler, true);
    document.addEventListener("mouseout", mouseOutHandler, true);
    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("mouseover", hoverHandler, true);
      document.removeEventListener("mouseout", mouseOutHandler, true);
    };
  }, [state.gameStarted, safeSfx]);

  // Notifications audio
  const prevNotifLen = useRef(0);
  useEffect(() => {
    const n = state.notifications || [];
    if (n.length > prevNotifLen.current) {
      const last = n[n.length - 1];
      const msg = last.message || "";
      // Silenciar eventos periódicos o masivos del motor de juego (colas, defensas, naves, automatizaciones)
      const isBatchProduction = msg.includes("construido(s)") || msg.includes("listo(s)") || msg.includes("mejorado a nivel");
      const isAutomation = msg.includes("Autogestión") || msg.includes("Auto-Ruta") || msg.includes("Auto-");

      if (isBatchProduction || isAutomation) {
        // Silencio: no saturar la interfaz háptica con clics continuos en cada unidad completada
      } else if (last.isMission) {
        safeSfx(sfx.milestone);
      } else if (msg.includes("cancelada") || msg.includes("cancelado")) {
        if (msg.includes("Investigación")) safeSfx(sfx.researchCancel);
        else safeSfx(sfx.buildCancel);
      } else if (msg.includes("Tratado") || msg.includes("Alianza")) {
        safeSfx(sfx.diploTreaty);
      } else if (msg.includes("guerra") || msg.includes("Guerra")) {
        safeSfx(sfx.diploWar);
      } else if (msg.includes("tributo") || msg.includes("Tributo")) {
        safeSfx(sfx.diploTribute);
      } else if (last.type === "success") {
        safeSfx(sfx.success);
      } else if (last.type === "error") {
        safeSfx(sfx.error);
      } else if (last.type === "warning") {
        safeSfx(sfx.warn);
      } else {
        safeSfx(sfx.notify);
      }
    }
    prevNotifLen.current = n.length;
  }, [state.notifications, safeSfx]);

  // Play music based on game state (main menu vs empire in-game)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (state.gameStarted) {
        playInGameMusic();
      } else {
        playMenuMusic();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    
    if (state.gameStarted) {
      playInGameMusic();
      startAmbient();
    } else {
      playMenuMusic();
      stopAmbient();
      stopSystemMusic();
    }
    
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      stopAmbient();
      stopMenuMusic();
      stopSystemMusic();
    };
  }, [state.gameStarted, effectiveSoundEnabled]);

  // Música contextual de sistemas/pantallas tácticas
  useEffect(() => {
    if (!state.gameStarted) return;
    const isGovSection = activeTab === "government" || activeTab === "government_ministries" || (typeof activeTab === "string" && activeTab.startsWith("ministry_"));
    if (isGovSection) {
      // El módulo de gobierno gestiona su propia música (stopSystemMusic para permitir ministerios)
      stopSystemMusic(false);
      return;
    }

    if (activeTab) {
      playSystemMusic(activeTab);
    }
  }, [state.gameStarted, activeTab]);

  // Tab and planet switch sfx
  const prevTab = useRef(activeTab);
  useEffect(() => {
    if (prevTab.current !== activeTab) { safeSfx(sfx.uiTab); prevTab.current = activeTab; }
  }, [activeTab, safeSfx]);

  const prevPlanet = useRef(state.currentPlanetId);
  useEffect(() => {
    if (prevPlanet.current !== state.currentPlanetId) { safeSfx(sfx.uiPlanet); prevPlanet.current = state.currentPlanetId; }
  }, [state.currentPlanetId, safeSfx]);

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
