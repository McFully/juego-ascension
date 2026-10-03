import { useEffect } from "react";
import { setSessionId, withSessionIdentity } from "../utils/sessionIdentity.js";

export function useAutosave({ state, saveRef, resettingRef, setLastSave }) {
  // Auto-save every 30s
  useEffect(() => {
    if (!state?.gameStarted || !window.electronAPI || resettingRef.current) return;

    const interval = setInterval(() => {
      if (resettingRef.current) return;
      const snap = withSessionIdentity(saveRef.current);
      const missions = (snap.fleetMissions || []).length;
      const qLens = `b${(snap.buildQueue||[]).length}s${(snap.shipQueue||[]).length}r${(snap.researchQueue||[]).length}`;
      console.log(`[Ascensión] Auto-save start | missions=${missions} queues=${qLens}`);
      window.electronAPI.saveGameNamed(snap).then(r => {
        if (r.success) {
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
  }, [state?.gameStarted, resettingRef, saveRef, setLastSave]);

  // Save on unload
  useEffect(() => {
    if (!state?.gameStarted || resettingRef.current) return;
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
  }, [state?.gameStarted, resettingRef, saveRef]);
}
