import { useState, useCallback, useEffect, useRef } from "react";
import {
  sfx, startAmbient, stopAmbient, setMuted,
  playMenuMusic, playInGameMusic, stopMenuMusic,
  stopMinistryMusic, playSystemMusic, stopSystemMusic,
  stopVoice
} from "../audio.js";

export function useGameAudio({ state, activeTab }) {
  const [userMuted, setUserMuted] = useState(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('ascension_audio_settings');
        if (raw) return !!JSON.parse(raw).muted;
      }
    } catch (_) {}
    return false;
  });

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

  // Click & hover sound effects
  const lastHoverTimeRef = useRef(0);
  const lastHoverTargetRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  useEffect(() => {
    if (!state?.gameStarted) return;
    const clickHandler = (e) => {
      const target = e.target.closest("button, [role=\"button\"], .tab-btn");
      if (target) {
        const now = Date.now();
        if (now - lastClickTimeRef.current > 120) {
          lastClickTimeRef.current = now;
          const isTab = target.closest(".tab-btn");
          if (!isTab) {
            const pan = e.clientX ? (e.clientX / window.innerWidth) * 2 - 1 : 0;
            safeSfx(sfx.uiClick, pan);
          }
        }
      }
    };
    const hoverHandler = (e) => {
      const target = e.target.closest("button, [role=\"button\"], .tab-btn");
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
      const target = e.target.closest("button, [role=\"button\"], .tab-btn");
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
  }, [state?.gameStarted, safeSfx]);

  // Notifications audio
  const prevNotifLen = useRef(0);
  useEffect(() => {
    const n = state?.notifications || [];
    if (n.length > prevNotifLen.current) {
      const last = n[n.length - 1];
      const msg = last.message || "";
      const isBatchProduction = msg.includes("construido(s)") || msg.includes("listo(s)") || msg.includes("mejorado a nivel");
      const isAutomation = msg.includes("Autogestión") || msg.includes("Auto-Ruta") || msg.includes("Auto-");

      if (isBatchProduction || isAutomation) {
        // Silencio: no saturar
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
  }, [state?.notifications, safeSfx]);

  // Main menu vs In-game music
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (state?.gameStarted) {
        playInGameMusic();
      } else {
        playMenuMusic();
      }
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    
    if (state?.gameStarted) {
      playInGameMusic();
      startAmbient();
    } else {
      playMenuMusic();
      stopAmbient();
      stopSystemMusic();
      stopMinistryMusic();
      stopVoice();
    }
    
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      stopAmbient();
      stopMenuMusic();
      stopSystemMusic();
      stopMinistryMusic();
      stopVoice();
    };
  }, [state?.gameStarted, effectiveSoundEnabled]);

  // Contextual system music
  useEffect(() => {
    if (!state?.gameStarted) return;
    const isGovSection = activeTab === "government" || activeTab === "government_ministries" || (typeof activeTab === "string" && activeTab.startsWith("ministry_"));
    if (isGovSection) {
      stopSystemMusic(false);
      return;
    }

    if (activeTab) {
      playSystemMusic(activeTab);
    }
  }, [state?.gameStarted, activeTab]);

  // Tab & planet switch sfx
  const prevTab = useRef(activeTab);
  useEffect(() => {
    if (prevTab.current !== activeTab) { safeSfx(sfx.uiTab); prevTab.current = activeTab; }
  }, [activeTab, safeSfx]);

  const prevPlanet = useRef(state?.currentPlanetId);
  useEffect(() => {
    if (prevPlanet.current !== state?.currentPlanetId) { safeSfx(sfx.uiPlanet); prevPlanet.current = state?.currentPlanetId; }
  }, [state?.currentPlanetId, safeSfx]);

  return {
    effectiveSoundEnabled,
    toggleSound,
    safeSfx
  };
}
