import React, { createContext, useContext, useCallback, useMemo, useReducer } from 'react';

/**
 * NavigationContext — Sistema de navegación jerárquica de videojuego.
 * Reemplaza el simple activeTab/setActiveTab con un stack de navegación
 * que soporta profundidad, breadcrumbs y retroceso contextual.
 */

const LABELS = {
  overview: '⚜️ Imperio',
  imperial_hub: '👑 Mando Imperial',
  imperial_council: '⚖️ Consejo Imperial',
  imperial_senate: '🏛️ Senado Imperial',
  // El gobierno es el Alto Mando de un mundo concreto, nunca del imperio.
  government: '👑 Alto Mando',
  ministry_infra: '🏗️ Infraestructuras',
  ministry_resources: '⛏️ Minería y Recursos',
  ministry_industry: '🏭 Industria',
  ministry_economy: '💼 Economía',
  ministry_energy: '⚡ Energía',
  ministry_science: '🔬 Ciencia',
  ministry_innovation: '💡 Innovación',
  ministry_cybernetics: '🧠 Cibernética e IA',
  ministry_defense: '🛡️ Defensa',
  ministry_war: '⚔️ Guerra',
  ministry_transport: '🚄 Transporte',
  ministry_logistics: '📦 Logística',
  ministry_biosphere: '🌍 Biosfera y Ecología',
  ministry_agriculture: '🌱 Agricultura',
  ministry_civics: '🏛️ Asuntos Civiles',
  ministry_diplomacy: '🤝 Diplomacia',
  ministry_intel: '🕵️ Inteligencia',
  ministry_justice: '⚖️ Justicia y Orden Federal',
  ministry_culture: '🎭 Cultura y Propaganda',
  missions: '🎯 Misiones',
  stats: '📊 Estadísticas del Imperio',
  buildings: '🏗️ Complejo de Obras',
  research: '🔬 Laboratorio Central',
  techTree: '🌌 Árbol Tecnológico',
  shipyard: '🚀 Astillero Naval',
  shipDesign: '🔧 Diseñador de Naves',
  fleet: '🛸 Hangar de la Flota',
  defense: '🛡️ Bastión Defensivo',
  combat: '⚔️ Simulador de Batalla',
  moon: '🌙 Base Lunar',
  galaxy: '🌌 Mapa Estelar',
  diplomacy: '🤝 Cuerpo Diplomático',
  communications: '📡 Red de Inteligencia',
  missiles: '🚀 Silos de Misiles',
  replay: '📼 Replay',
  colony_network: '🪐 Red de Colonias',
  market: '💼 Mercado Galáctico',
};

// Jerarquía de navegación — define qué padre tiene cada vista
const PARENT_MAP = {
  // Órganos de Mando Imperial: las 8 tarjetas cuelgan de Mando Imperial
  missions: 'imperial_hub',
  diplomacy: 'imperial_hub',
  imperial_council: 'imperial_hub',
  imperial_senate: 'imperial_hub',
  colony_network: 'imperial_hub',
  combat: 'imperial_hub',
  shipDesign: 'imperial_hub',
  stats: 'imperial_hub',

  // Nivel superior del imperio
  market: 'overview',

  // Nivel militar planetario
  missiles: 'defense',

  // Ciencia
  techTree: 'government',

  // Diplomacia e Inteligencia
  communications: 'diplomacy',
  telemetry: 'communications',

  // Ministerios del Alto Mando planetario
  ministry_infra: 'government',
  ministry_resources: 'government',
  ministry_industry: 'government',
  ministry_economy: 'government',
  ministry_energy: 'government',
  ministry_science: 'government',
  ministry_innovation: 'government',
  ministry_cybernetics: 'government',
  ministry_defense: 'government',
  ministry_war: 'government',
  ministry_transport: 'government',
  ministry_logistics: 'government',
  ministry_biosphere: 'government',
  ministry_agriculture: 'government',
  ministry_civics: 'government',
  ministry_diplomacy: 'government',
  ministry_intel: 'government',
  ministry_justice: 'government',
  ministry_culture: 'government',
};

function buildPath(viewId) {
  if (viewId === 'overview') return ['overview'];
  const path = [viewId];
  let current = viewId;
  while (PARENT_MAP[current]) {
    current = PARENT_MAP[current];
    path.unshift(current);
  }
  if (path[0] !== 'overview') {
    path.unshift('overview');
  }
  return path;
}

function navReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE_TO': {
      const newPath = buildPath(action.viewId);
      return {
        ...state,
        path: newPath,
        activeView: action.viewId,
        subView: null,
        previousView: state.activeView,
      };
    }
    case 'NAVIGATE_BACK': {
      if (state.path.length <= 1) return state;
      const newPath = state.path.slice(0, -1);
      return {
        ...state,
        path: newPath,
        activeView: newPath[newPath.length - 1],
        subView: null,
        previousView: state.activeView,
      };
    }
    case 'NAVIGATE_ROOT':
      return {
        ...state,
        path: ['overview'],
        activeView: 'overview',
        subView: null,
        previousView: state.activeView,
      };
    case 'SET_SUB_VIEW':
      return { ...state, subView: action.subViewId };
    case 'TOGGLE_HUD':
      return { ...state, hudVisible: !state.hudVisible };
    case 'SET_DENSITY':
      return { ...state, densityMode: action.densityMode };
    default:
      return state;
  }
}

const NavigationContext = createContext(null);

export function NavigationProvider({ children, onTabChange, activeTab = 'overview' }) {
  const [state, dispatch] = useReducer(navReducer, {
    path: [activeTab || 'overview'],
    activeView: activeTab || 'overview',
    subView: null,
    previousView: null,
    hudVisible: true,
    densityMode: typeof localStorage !== 'undefined' && localStorage.getItem('ascension_density_mode') === 'compact' ? 'compact' : 'visual',
  });

  // Sincronizar estado interno si activeTab cambia externamente
  React.useEffect(() => {
    if (activeTab && activeTab !== state.activeView) {
      dispatch({ type: 'NAVIGATE_TO', viewId: activeTab });
    }
  }, [activeTab]);

  const navigateTo = useCallback((viewId) => {
    dispatch({ type: 'NAVIGATE_TO', viewId });
    if (onTabChange) onTabChange(viewId);
  }, [onTabChange]);

  const navigateBack = useCallback(() => {
    dispatch({ type: 'NAVIGATE_BACK' });
    // We need to compute what the previous view would be
    // so we call onTabChange with the correct value
  }, []);

  // Wrapper that also calls onTabChange for backwards nav
  const navigateBackWithSync = useCallback(() => {
    const prevPath = state.path;
    let targetView = 'overview';
    if (prevPath.length > 1) {
      targetView = prevPath[prevPath.length - 2];
      dispatch({ type: 'NAVIGATE_BACK' });
    } else if (state.previousView && state.previousView !== state.activeView) {
      targetView = state.previousView;
      dispatch({ type: 'NAVIGATE_TO', viewId: targetView });
    } else if (PARENT_MAP[state.activeView]) {
      targetView = PARENT_MAP[state.activeView];
      dispatch({ type: 'NAVIGATE_TO', viewId: targetView });
    }
    if (onTabChange) onTabChange(targetView);
  }, [state.path, state.previousView, state.activeView, onTabChange]);

  // Soporte global de retorno por teclado (Escape, Backspace)
  React.useEffect(() => {
    const handleGlobalBackKey = (e) => {
      // Ignorar si el usuario está escribiendo en un input, textarea o select
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'Escape' || e.key === 'Backspace') {
        if (state.path.length > 1) {
          e.preventDefault();
          navigateBackWithSync();
          if (window.playSfx) window.playSfx('click');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalBackKey);
    return () => window.removeEventListener('keydown', handleGlobalBackKey);
  }, [state.path, navigateBackWithSync]);

  const navigateToRoot = useCallback(() => {
    dispatch({ type: 'NAVIGATE_ROOT' });
    if (onTabChange) onTabChange('overview');
  }, [onTabChange]);

  const setSubView = useCallback((id) => {
    dispatch({ type: 'SET_SUB_VIEW', subViewId: id });
  }, []);

  const canGoBack = Boolean(
    state.path.length > 1 ||
    (state.previousView && state.previousView !== state.activeView) ||
    PARENT_MAP[state.activeView]
  );

  const breadcrumbs = useMemo(() => {
    return state.path.map(id => ({
      id,
      label: LABELS[id] || id,
    }));
  }, [state.path]);

  const toggleHud = useCallback(() => {
    dispatch({ type: 'TOGGLE_HUD' });
  }, []);

  const setDensityMode = useCallback((mode) => {
    const validMode = mode === 'compact' ? 'compact' : 'visual';
    dispatch({ type: 'SET_DENSITY', densityMode: validMode });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ascension_density_mode', validMode);
      }
    } catch (_) {}
  }, []);

  // Soporte de atajos de teclado para Cabina Panorámica (tecla H o F11)
  React.useEffect(() => {
    const handleHudShortcut = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        toggleHud();
      }
    };
    window.addEventListener('keydown', handleHudShortcut);
    return () => window.removeEventListener('keydown', handleHudShortcut);
  }, [toggleHud]);

  const value = useMemo(() => ({
    ...state,
    breadcrumbs,
    canGoBack,
    navigateTo,
    navigateBack: navigateBackWithSync,
    navigateToRoot,
    setSubView,
    toggleHud,
    setDensityMode,
    LABELS,
  }), [state, breadcrumbs, canGoBack, navigateTo, navigateBackWithSync, navigateToRoot, setSubView, toggleHud, setDensityMode]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}

export { LABELS as NAV_LABELS, PARENT_MAP };
