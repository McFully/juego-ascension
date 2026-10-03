import { useEffect, useRef } from "react";

export function useOfflineProgress({ state, ready, dispatch, fmt, stateRef }) {
  const offlineProcessedRef = useRef(false);
  const offlineResourcesBeforeRef = useRef(null);
  const offlineEventsBeforeRef = useRef(null);
  const lastSessionIdRef = useRef(state?._sessionId || state?.playerName);

  useEffect(() => {
    const currentSession = state?._sessionId || state?.playerName;
    if (currentSession !== lastSessionIdRef.current) {
      offlineProcessedRef.current = false;
      lastSessionIdRef.current = currentSession;
    }
  }, [state?._sessionId, state?.playerName]);

  useEffect(() => {
    if (!state?.gameStarted || !state?.lastTick || !ready || offlineProcessedRef.current) return;
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
  }, [ready, dispatch, fmt, state, stateRef]);
}
