import { GAME_TABS } from '../components/app/gameNavigation.js';
import { resolveNavParent } from './governmentRoute.js';

/** Un padre por pantalla. Sale del catálogo. No hay un segundo mapa. */
export const PARENT_MAP = Object.fromEntries(
  GAME_TABS.filter((tab) => tab.parent).map((tab) => [tab.id, tab.parent])
);

const HISTORY_LIMIT = 40;

export function parentOf(viewId) {
  return resolveNavParent(viewId, PARENT_MAP);
}

export function buildPath(viewId) {
  if (!viewId || viewId === 'overview') return ['overview'];
  const path = [viewId];
  let current = viewId;
  const seen = new Set();
  while (parentOf(current) && !seen.has(current)) {
    seen.add(current);
    current = parentOf(current);
    path.unshift(current);
  }
  if (path[0] !== 'overview') path.unshift('overview');
  return path;
}

export function scopeSubView(scope, id) {
  return `${scope}:${id}`;
}

export function readScopedSubView(subView, scope, allowed, fallback) {
  const token = `${scope}:`;
  if (typeof subView !== 'string' || !subView.startsWith(token)) return fallback;
  const id = subView.slice(token.length);
  if (allowed && !allowed.includes(id)) return fallback;
  return id;
}

function pushHistory(history, frame) {
  if (!frame?.viewId) return history || [];
  const list = history || [];
  const last = list[list.length - 1];
  if (last && last.viewId === frame.viewId && last.subView === (frame.subView ?? null)) return list;
  const next = list.concat({ viewId: frame.viewId, subView: frame.subView ?? null });
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function createInitialNavState(activeTab = 'overview') {
  const viewId = activeTab || 'overview';
  return {
    path: buildPath(viewId),
    activeView: viewId,
    subView: null,
    previousView: null,
    history: [],
  };
}

/** Destino de Atrás: la visita anterior. Si no hay, el padre del catálogo. */
export function backTarget(state) {
  const frame = state?.history?.[state.history.length - 1];
  if (frame?.viewId) return { viewId: frame.viewId, subView: frame.subView ?? null };
  const parent = parentOf(state?.activeView);
  if (parent) return { viewId: parent, subView: null };
  if (state?.activeView && state.activeView !== 'overview') return { viewId: 'overview', subView: null };
  return null;
}

export function navReducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE_TO': {
      if (!action.viewId) return state;
      if (action.viewId === state.activeView && action.subView === undefined) return state;
      const history = action.record === false
        ? (state.history || [])
        : pushHistory(state.history, { viewId: state.activeView, subView: state.subView });
      return {
        ...state,
        path: buildPath(action.viewId),
        activeView: action.viewId,
        subView: action.subView === undefined ? null : action.subView,
        previousView: state.activeView,
        history,
      };
    }
    case 'NAVIGATE_BACK': {
      const target = backTarget(state);
      if (!target) return state;
      const history = state.history?.length ? state.history.slice(0, -1) : state.history || [];
      const usedHistory = Boolean(state.history?.length);
      return {
        ...state,
        path: buildPath(target.viewId),
        activeView: target.viewId,
        subView: usedHistory ? target.subView : null,
        previousView: state.activeView,
        history: usedHistory ? history : state.history || [],
      };
    }
    case 'NAVIGATE_ROOT':
      return {
        ...state,
        path: ['overview'],
        activeView: 'overview',
        subView: null,
        previousView: state.activeView,
        history: [],
      };
    case 'SET_SUB_VIEW': {
      const nextSub = action.subViewId ?? null;
      if (nextSub === state.subView) return state;
      const history = action.record === false
        ? (state.history || [])
        : pushHistory(state.history, { viewId: state.activeView, subView: state.subView });
      return { ...state, subView: nextSub, history };
    }
    default:
      return state;
  }
}
