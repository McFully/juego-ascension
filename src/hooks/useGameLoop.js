import { useEffect, useRef } from 'react';
import { TICK_MS } from '../core.jsx';

export default function useGameLoop({
  state,
  ready,
  dispatch,
  stateRef,
  saveRef,
  resettingRef,
  setLastSave,
  startWelcomeTimeoutRef,
  fmt
}) {
  const offlineProcessedRef = useRef(false);
  const offlineResourcesBeforeRef = useRef(null);
  const offlineEventsBeforeRef = useRef(null);

  // TICK interval (wrapped for disk logging on reducer errors)
  useEffect(() => {
    if (!state.gameStarted) return;
    const interval = setInterval(() => {
      try {
        dispatch({ type: 'TICK' });
      } catch (e) {
        console.error('[Ascensión] TICK dispatch error:', e);
        if (window.electronAPI && window.electronAPI.logError) {
          const snap = stateRef.current || state;
          const ctx = `player=${snap.playerName}|missions=${(snap.fleetMissions||[]).length}|tick=${snap.gameTick||0}`;
          window.electronAPI.logError(`TICK error: ${e?.message || e}`, e?.stack || '', ctx);
        }
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.gameStarted, dispatch, state, stateRef]);

  // Offline progress (safer: higher threshold, hard cap, one-time guard)
  useEffect(() => {
    if (!state.gameStarted || !state.lastTick || !ready || offlineProcessedRef.current) return;
    const elapsed = (Date.now() - state.lastTick) / 1000;
    if (elapsed <= 300) return; // only simulate if > 5 minutes offline
    const totalTicks = Math.min(Math.floor(elapsed), 1800); // max ~30 min simulation
    offlineProcessedRef.current = true;

    // Snapshot empire resources + events BEFORE simulation (for detailed feedback)
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
    const CHUNK = 200;
    const tickBatch = () => {
      const limit = Math.min(completed + CHUNK, totalTicks);
      for (let i = completed; i < limit; i++) {
        try {
          dispatch({ type: 'TICK' });
        } catch (e) {
          console.error('[Ascensión] Offline TICK error:', e);
          if (window.electronAPI && window.electronAPI.logError) {
            const snap = stateRef.current || state;
            window.electronAPI.logError(`Offline TICK error: ${e?.message || e}`, e?.stack || '', `offlineTick player=${snap.playerName} missions=${(snap.fleetMissions||[]).length}`);
          }
          break; // stop batch on error to avoid cascade
        }
      }
      completed = limit;
      if (completed < totalTicks) {
        requestAnimationFrame(tickBatch);
      } else {
        const hours = Math.floor(totalTicks / 3600);
        const mins = Math.floor((totalTicks % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        // Compute rich deltas for per-resource + events feedback
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

        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          type: 'success',
          message: richMessage
        }});

        // Clear snapshots
        offlineResourcesBeforeRef.current = null;
        offlineEventsBeforeRef.current = null;
      }
    };
    const rafId = requestAnimationFrame(tickBatch);
    return () => cancelAnimationFrame(rafId);
  }, [ready, state.gameStarted, state.lastTick, state.planets, state.notifications, state.galacticEvents, dispatch, stateRef, fmt]);

  // Cleanup welcome timeout on unmount
  useEffect(() => {
    return () => {
      if (startWelcomeTimeoutRef.current) clearTimeout(startWelcomeTimeoutRef.current);
    };
  }, [startWelcomeTimeoutRef]);

  // Auto-save every 30s (proper interval) — uses named save system
  useEffect(() => {
    if (!state.gameStarted || !window.electronAPI || resettingRef.current) return;

    const interval = setInterval(() => {
      if (resettingRef.current) return; // Critical: block any late ticks after user chose reset
      const snap = saveRef.current;
      const missions = (snap.fleetMissions || []).length;
      const qLens = `b${(snap.buildQueue||[]).length}s${(snap.shipQueue||[]).length}r${(snap.researchQueue||[]).length}`;
      console.log(`[Ascensión] Auto-save start | missions=${missions} queues=${qLens}`);
      window.electronAPI.saveGameNamed(snap).then(r => {
        if (r.success) {
          setLastSave(Date.now());
          console.log('[Ascensión] Auto-save ok');
        } else if (window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save failed: ${r.error || 'unknown'}`, '', `missions=${missions}`);
        }
      }).catch(e => {
        console.error('Auto-save error:', e);
        if (window.electronAPI && window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save exception: ${e?.message || e}`, e?.stack || '', `missions=${missions}`);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.gameStarted, setLastSave, saveRef, resettingRef]);

  // Save on unload — uses named save system
  useEffect(() => {
    if (!state.gameStarted || resettingRef.current) return;
    const handler = () => {
      if (resettingRef.current) return; // Critical: do not save on unload if user is resetting
      if (window.electronAPI) {
        const snap = saveRef.current;
        const missions = (snap.fleetMissions || []).length;
        console.log(`[Ascensión] Save-on-unload | missions=${missions}`);
        try {
          window.electronAPI.saveGameNamedSync(snap);
        } catch (e) {
          if (window.electronAPI.logError) {
            window.electronAPI.logError(`Save-on-unload error: ${e?.message || e}`, e?.stack || '', `missions=${missions}`);
          }
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.gameStarted, saveRef, resettingRef]);
}
