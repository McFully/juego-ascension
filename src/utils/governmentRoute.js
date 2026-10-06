/**
 * Ruta de gobierno. Una sola cadena decide nivel, ministerio y despacho.
 * El render lee esta cadena. No hay un segundo estado que pueda contradecirla.
 */

const DESK_SUBVIEWS = ['buildings', 'research', 'programs', 'directives'];

export const COMMAND_CARD_TARGETS = {
  exchangeMinistries: 'government_ministries',
  planetaryBank: 'ministry_finance_buildings',
  financeResearch: 'ministry_finance_research',
};

export function parseGovernmentRoute(activeTab) {
  if (!activeTab || activeTab === 'government') {
    return { level: 0, ministryId: null, subview: 'overview', tab: 'government' };
  }
  if (activeTab === 'government_ministries') {
    return { level: 1, ministryId: null, subview: 'overview', tab: 'government_ministries' };
  }
  if (typeof activeTab !== 'string' || !activeTab.startsWith('ministry_')) {
    return null;
  }

  const rest = activeTab.slice('ministry_'.length);
  for (const subview of DESK_SUBVIEWS) {
    const suffix = `_${subview}`;
    if (rest.endsWith(suffix) && rest.length > suffix.length) {
      return {
        level: 3,
        ministryId: rest.slice(0, -suffix.length),
        subview,
        tab: activeTab,
      };
    }
  }

  return { level: 2, ministryId: rest, subview: 'overview', tab: activeTab };
}

export function buildGovernmentTab({ level, ministryId, subview = 'overview' }) {
  if (!level || level <= 0) return 'government';
  if (level === 1 || !ministryId) return 'government_ministries';
  if (level >= 3 && subview && subview !== 'overview' && DESK_SUBVIEWS.includes(subview)) {
    return `ministry_${ministryId}_${subview}`;
  }
  return `ministry_${ministryId}`;
}

/** Padre de una vista. Los despachos cuelgan de su ministerio, y el ministerio del Alto Mando. */
export function resolveNavParent(viewId, explicitParents) {
  if (explicitParents && explicitParents[viewId]) return explicitParents[viewId];
  if (viewId === 'government_ministries' || viewId === 'government') return viewId === 'government' ? null : 'government';
  if (typeof viewId !== 'string' || !viewId.startsWith('ministry_')) return null;
  const route = parseGovernmentRoute(viewId);
  if (!route) return 'government';
  if (route.level >= 3) return `ministry_${route.ministryId}`;
  return 'government';
}
