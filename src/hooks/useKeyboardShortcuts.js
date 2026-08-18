import { useEffect, useRef } from 'react';

export default function useKeyboardShortcuts({
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
}) {
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
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

      // [ y ] para cambiar pestaña rápidamente
      if (e.key === '[' || e.key === ']') {
        const currentIdx = visibleTabs.findIndex(t => t.id === activeTabRef.current);
        let newIdx = currentIdx;
        if (e.key === ']') newIdx = (currentIdx + 1) % visibleTabs.length;
        if (e.key === '[') newIdx = (currentIdx - 1 + visibleTabs.length) % visibleTabs.length;
        setActiveTab(visibleTabs[newIdx].id);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, visibleTabs, safeSetActiveTab, setActiveTab, setRenaming, setShowShortcuts, setSettingsOpen, setActiveCodexId, stateRef]);
}
