/**
 * uiAuditEngine.js — Motor de Inspección del DOM en Tiempo de Ejecución para Juego Ascensión.
 *
 * PRINCIPIO FUNDAMENTAL:
 * Código fuente ≠ interfaz realmente renderizada.
 * Este motor analiza el DOM computado real en el navegador (getBoundingClientRect,
 * getComputedStyle, visibilidad física, desbordamientos y elementos interactivos).
 */

const RELEVANT_CSS_PROPS = [
  'display', 'position', 'visibility', 'opacity', 'zIndex',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
  'margin', 'padding', 'gap',
  'flexDirection', 'alignItems', 'justifyContent',
  'gridTemplateColumns',
  'fontSize', 'fontWeight', 'color', 'backgroundColor',
  'border', 'borderRadius', 'boxShadow', 'overflow'
];

/**
 * Obtiene los estilos computados relevantes para un elemento.
 */
function extractComputedStyles(el) {
  if (!el || typeof window === 'undefined') return {};
  const computed = window.getComputedStyle(el);
  const styles = {};
  for (const prop of RELEVANT_CSS_PROPS) {
    styles[prop] = computed[prop] || '';
  }
  return styles;
}

/**
 * Evalúa si un elemento está visualmente visible en el DOM.
 */
function isElementVisible(el, rect, computed) {
  if (!el) return false;
  if (computed.display === 'none') return false;
  if (computed.visibility === 'hidden' || computed.visibility === 'collapse') return false;
  if (parseFloat(computed.opacity) === 0) return false;
  if (rect.width <= 0 && rect.height <= 0) return false;
  return true;
}

/**
 * Inspecciona todos los botones o elementos clicables en el documento.
 */
function auditButtons(root) {
  const buttonEls = Array.from(root.querySelectorAll('button, [role="button"], a[href], input[type="button"], input[type="submit"]'));
  
  return buttonEls.map((btn, index) => {
    const rect = btn.getBoundingClientRect();
    const computed = window.getComputedStyle(btn);
    const visible = isElementVisible(btn, rect, computed);
    const text = (btn.innerText || btn.textContent || '').trim().slice(0, 80);
    const ariaLabel = btn.getAttribute('aria-label') || '';
    const title = btn.getAttribute('title') || '';
    const auditId = btn.getAttribute('data-ui-audit-id') || '';
    const disabled = Boolean(btn.disabled || btn.getAttribute('aria-disabled') === 'true');
    const className = btn.className || '';

    // Clasificación de estado
    let status = 'OK';
    if (!visible && !disabled) {
      status = 'WARNING'; // Puede ser intencionado o solapado
    } else if (rect.width === 0 || rect.height === 0) {
      status = 'WARNING';
    }

    return {
      index,
      text,
      ariaLabel,
      title,
      auditId,
      disabled,
      status,
      className,
      geometry: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        bottom: Math.round(rect.bottom),
        right: Math.round(rect.right)
      },
      visibility: {
        visible,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        zIndex: computed.zIndex
      }
    };
  });
}

/**
 * Inspecciona todas las tarjetas principales del DOM.
 */
function auditCards(root) {
  // Selector de tarjetas: data-ui-audit-id, clases .card, .glass-deep, o contenedores de sección
  const selector = '[data-ui-audit-id], .card, .glass-deep, [class*="rounded-2xl"], [class*="rounded-3xl"]';
  const rawCards = Array.from(root.querySelectorAll(selector));

  // Filtrar contenedores significativos (ancho y alto mayores a 40px)
  const filtered = rawCards.filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width >= 40 && rect.height >= 40;
  });

  return filtered.map((card, index) => {
    const rect = card.getBoundingClientRect();
    const computed = window.getComputedStyle(card);
    const visible = isElementVisible(card, rect, computed);
    const auditId = card.getAttribute('data-ui-audit-id') || `card-${index}`;
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="font-bold"], [class*="font-black"]');
    const title = heading ? (heading.innerText || heading.textContent || '').trim().slice(0, 60) : '';
    const internalButtons = card.querySelectorAll('button, [role="button"]');

    return {
      index,
      auditId,
      title,
      className: card.className || '',
      buttonsCount: internalButtons.length,
      geometry: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      styles: {
        display: computed.display,
        position: computed.position,
        overflow: computed.overflow,
        zIndex: computed.zIndex,
        backgroundColor: computed.backgroundColor,
        border: computed.border
      },
      visible
    };
  });
}

/**
 * Detecta problemas de geometría y colisiones en la interfaz.
 */
function detectVisualIssues(root, buttons, cards) {
  const issues = [];
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  // 1. Detección de elementos interactivos que desbordan el viewport horizontalmente
  buttons.forEach(b => {
    if (b.geometry.right > winW && b.visibility.visible) {
      issues.push({
        type: 'VIEWPORT_OVERFLOW',
        severity: 'HIGH',
        element: 'button',
        id: b.auditId || b.text,
        details: `Botón fuera del ancho de pantalla: right ${b.geometry.right}px > viewport ${winW}px`
      });
    }
  });

  // 2. Detección de tarjetas con dimensiones anormales
  cards.forEach(c => {
    if (c.visible && c.geometry.width > winW + 20) {
      issues.push({
        type: 'CARD_OVERFLOW',
        severity: 'MEDIUM',
        element: 'card',
        id: c.auditId,
        details: `Tarjeta desborda ancho de pantalla: width ${c.geometry.width}px > viewport ${winW}px`
      });
    }
  });

  return issues;
}

/**
 * Detecta componentes complejos como Canvas, SVG y tablas.
 */
function auditComplexElements(root) {
  const canvases = Array.from(root.querySelectorAll('canvas')).map((cv, i) => {
    const r = cv.getBoundingClientRect();
    return {
      index: i,
      tag: 'CANVAS',
      width: Math.round(r.width),
      height: Math.round(r.height),
      visible: r.width > 0 && r.height > 0
    };
  });

  const svgs = Array.from(root.querySelectorAll('svg')).map((s, i) => {
    const r = s.getBoundingClientRect();
    return {
      index: i,
      tag: 'SVG',
      width: Math.round(r.width),
      height: Math.round(r.height)
    };
  });

  const tables = Array.from(root.querySelectorAll('table')).map((tbl, i) => {
    const r = tbl.getBoundingClientRect();
    return {
      index: i,
      tag: 'TABLE',
      rows: tbl.rows ? tbl.rows.length : 0,
      width: Math.round(r.width),
      height: Math.round(r.height)
    };
  });

  return {
    canvasesCount: canvases.length,
    canvases,
    svgsCount: svgs.length,
    tablesCount: tables.length,
    tables
  };
}

/**
 * Ejecuta una auditoría completa sobre la pantalla activa.
 */
export async function executeCurrentScreenAudit({ activeTab, currentPlanet, appVersion }) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    throw new Error('El auditor visual requiere un entorno de navegador con DOM activo.');
  }

  const root = document.getElementById('root') || document.body;
  const timestamp = new Date().toISOString();
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;

  const buttons = auditButtons(root);
  const cards = auditCards(root);
  const complex = auditComplexElements(root);
  const visualIssues = detectVisualIssues(root, buttons, cards);

  const auditData = {
    auditVersion: '1.0.0',
    timestamp,
    application: {
      name: 'Juego Ascensión',
      version: appVersion || 'dev',
      environment: 'Electron / Windows'
    },
    viewport: {
      width: winW,
      height: winH,
      devicePixelRatio: dpr
    },
    screen: {
      activeTab: activeTab || 'overview',
      currentPlanet: currentPlanet ? { id: currentPlanet.id, name: currentPlanet.name } : null
    },
    summary: {
      totalButtons: buttons.length,
      visibleButtons: buttons.filter(b => b.visibility.visible).length,
      totalCards: cards.length,
      visibleCards: cards.filter(c => c.visible).length,
      issuesCount: visualIssues.length,
      canvasesCount: complex.canvasesCount,
      tablesCount: complex.tablesCount
    },
    cards,
    buttons,
    complexElements: complex,
    visualIssues
  };

  return auditData;
}
