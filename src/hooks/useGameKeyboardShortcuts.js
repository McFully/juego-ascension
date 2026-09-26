import { useEffect } from 'react';

export const useGameKeyboardShortcuts = ({
  visibleTabs,
  activeTab,
  setActiveTab,
  safeSetActiveTab,
  dispatch,
  stateRef,
  setRenaming,
  setShowShortcuts,
  setSettingsOpen,
  setActiveCodexId
}) => {
  useEffect(() => {
    const handler = (e) => {
      // F11: Alternar pantalla completa (Electron o Navegador/DOM)
      if (e.key === 'F11') {
        e.preventDefault();
        if (window.electronAPI && typeof window.electronAPI.toggleFullscreen === 'function') {
          window.electronAPI.toggleFullscreen();
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        } else {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
        return;
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Cambiar de pestaña con números (1-9 + 0 para las últimas)
      const keyNum = parseInt(e.key);
      if (!isNaN(keyNum)) {
        const idx = keyNum === 0 ? 9 : keyNum - 1;
        if (idx >= 0 && idx < visibleTabs.length) {
          setActiveTab(visibleTabs[idx].id);
          return;
        }
      }

      // Atajos de letra (teclado)
      const k = e.key.toLowerCase();
      const letterMap = {
        'r': 'research',
        'a': 'shipyard',
        'f': 'fleet',
        'g': 'galaxy',
        'd': 'defense',
        'm': 'missiles',
        'o': 'overview',
        'p': 'missions',
        'c': 'combat',
        's': 'stats',
        'l': 'moon',
        't': 'techTree',
        'i': 'diplomacy',
        'b': 'shipDesign',
        'k': 'market',
        'n': 'colony_network',
      };
      if (letterMap[k]) {
        safeSetActiveTab(letterMap[k]);
        e.preventDefault();
        return;
      }

      // Escape: cerrar cosas
      if (e.key === 'Escape') {
        const snap = stateRef.current;
        if (snap) {
          if (snap.activeEvent) {
            dispatch({ type: 'CLEAR_ACTIVE_EVENT' });
          }
          if (snap.activeFirstContact) {
            dispatch({ type: 'DISMISS_FIRST_CONTACT' });
          }
          if (snap.activeTransmission) {
            dispatch({ type: 'DISMISS_TRANSMISSION' });
          }
        }
        setRenaming(false);
        setShowShortcuts(false);
        setSettingsOpen(false);
        setActiveCodexId(null);
      }

      // Backspace: volver a la pantalla anterior si no hay modal abierto
      if (e.key === 'Backspace') {
        const backBtn = document.querySelector('.breadcrumb-back');
        if (backBtn) {
          e.preventDefault();
          backBtn.click();
          return;
        }
      }

      // ? : toggle ayuda de atajos
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }

      // Flechas para planetas
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const snap = stateRef.current;
        if (snap && snap.planets.length > 0) {
          const currentIdx = snap.planets.findIndex(p => p.id === snap.currentPlanetId);
          if (currentIdx !== -1) {
            let newIdx = currentIdx;
            if (e.key === 'ArrowRight') newIdx = (currentIdx + 1) % snap.planets.length;
            if (e.key === 'ArrowLeft') newIdx = (currentIdx - 1 + snap.planets.length) % snap.planets.length;
            dispatch({ type: 'SET_PLANET', payload: snap.planets[newIdx].id });
          }
        }
      }

      // [ y ] para cambiar pestaña rápidamente (filtrando solo pestañas maestras)
      if (e.key === '[' || e.key === ']') {
        const majorTabs = visibleTabs.filter(t => !t.id.startsWith('ministry_'));
        const currentIdx = majorTabs.findIndex(t => t.id === activeTab);
        let newIdx = currentIdx !== -1 ? currentIdx : 0;
        if (e.key === ']') newIdx = (currentIdx + 1) % majorTabs.length;
        if (e.key === '[') newIdx = (currentIdx - 1 + majorTabs.length) % majorTabs.length;
        if (majorTabs[newIdx]) {
          setActiveTab(majorTabs[newIdx].id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, visibleTabs, activeTab, setActiveTab, safeSetActiveTab, stateRef, setRenaming, setShowShortcuts, setSettingsOpen, setActiveCodexId]);
};

export default useGameKeyboardShortcuts;
