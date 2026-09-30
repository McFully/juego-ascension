/**
 * researchScoring.js — ÚNICO criterio de selección de investigación del juego.
 *
 * Antes había tres implementaciones distintas e inconsistentes:
 *   1. colonyGovernor.js   → "gana el primero del array" (sin puntuación)
 *   2. autoResearchTick.js → menor coste ponderado (ignora la duración)
 *   3. aiEmpireTick.js     → tres contadores hardcodeados con Math.random()
 *
 * Aquí vive la puntuación real, en una función pura y testeable, que usan las tres.
 *
 * Idea: la puntuación es un COSTE EFECTIVO. Menor puntuación = mejor candidata.
 * Se parte del coste real que hay que pagar y se divide por todos los bonificadores
 * que hacen que esa investigación valga más. Así el "mejor" siempre gana con un `<`
 * y la lógica es trivial de razonar.
 */

import { RESEARCH, BUILDINGS } from '../../../core.jsx';
import { researchCost, calcResearchTime, meetsResearchReq } from '../../../utils/formulas.js';
import { GAME_SPEED } from '../../../data/gameData.js';

/** Pesos de cristal y deuterio respecto al metal. El deuterio es el recurso escaso. */
const CRYSTAL_WEIGHT = 1.5;
const DEUTERIUM_WEIGHT = 3;

/** Coste ponderado plano, para comparar sin depender del nivel. */
export const weightedCost = (cost) =>
  (cost?.metal || 0) + (cost?.crystal || 0) * CRYSTAL_WEIGHT + (cost?.deuterium || 0) * DEUTERIUM_WEIGHT;

/**
 * 1.6 — `techFocus` del ministerio. Antes se declaraba en el estado y se escribía
 * desde la UI, pero ningún tick lo leía: el ajuste no hacía nada.
 * Cada foco se traduce a las categorías de RESEARCH que bonifica.
 */
export const TECH_FOCUS_CATEGORIES = {
  general:    [],
  military:   ['weapon', 'defense', 'propulsion'],
  economy:    ['economy', 'power', 'engineering'],
  exploration:['exploration', 'propulsion', 'utility'],
  technology: ['ai', 'utility', 'engineering'],
};

export const TECH_FOCUS_KEYS = Object.keys(TECH_FOCUS_CATEGORIES);

/** Etiquetas para la UI. */
export const TECH_FOCUS_LABELS = {
  general: 'General',
  military: 'Militar',
  economy: 'Económico',
  exploration: 'Exploración',
  technology: 'Tecnología',
};

/**
 * Devuelve las categorías a bonificar según el `techFocus` de un ministerio.
 * Un foco desconocido o ausente devuelve `[]` (no bonifica nada), de forma que
 * un valor corrupto en una partida guardada no rompe nada.
 */
export const focusCategoriesFor = (techFocus) =>
  TECH_FOCUS_CATEGORIES[techFocus] || [];

/**
 * Categoría de investigación que le resulta útil a cada ministerio.
 * Es el peso principal: un ministro prefiere lo suyo, pero puede salirse si otra cosa
 * es mucho más urgente (el resto de bonificadores pesa sobre esto).
 */
export const MINISTRY_CATEGORY_WEIGHTS = {
  energy:      { power: 1.00, engineering: 0.60, economy: 0.40 },
  resources:   { economy: 1.00, engineering: 0.60, power: 0.40 },
  industry:    { engineering: 1.00, economy: 0.80, ai: 0.40 },
  economy:     { economy: 1.00, engineering: 0.60, power: 0.40 },
  science:     { exploration: 1.00, utility: 0.80, propulsion: 0.60, power: 0.50, engineering: 0.50, ai: 0.40 },
  innovation:  { engineering: 1.00, utility: 0.80, ai: 0.60, exploration: 0.50 },
  cybernetics:{ ai: 1.00, utility: 0.80, engineering: 0.60 },
  defense:     { defense: 1.00, weapon: 0.70, ai: 0.40 },
  war:         { weapon: 1.00, propulsion: 0.70, defense: 0.60, ai: 0.40 },
  transport:   { propulsion: 1.00, engineering: 0.60, exploration: 0.50 },
  logistics:   { engineering: 1.00, propulsion: 0.60, economy: 0.60 },
  biosphere:   { engineering: 0.90, utility: 0.70, economy: 0.50 },
  agriculture: { economy: 0.80, engineering: 0.70, exploration: 0.40 },
  civics:      { economy: 0.80, utility: 0.60, exploration: 0.40 },
  diplomacy:   { utility: 0.90, exploration: 0.70, economy: 0.50 },
  intel:       { utility: 1.00, ai: 0.60, weapon: 0.40 },
  justice:     { utility: 0.70, defense: 0.50, economy: 0.50 },
  culture:     { utility: 0.70, economy: 0.50, exploration: 0.40 },
  infra:       { engineering: 0.90, power: 0.60, ai: 0.50, economy: 0.50 },
};

/**
 * Fallback cuando no hay ministerio (IA rival sin sede, auto-ciencia global).
 * Categoría → factor. Lo que el juego no prioriza, se deja neutro.
 */
const NEUTRAL_CATEGORY_WEIGHT = 0.6;

/**
 * Traduce los pesos de estrategia de `AI_STRATEGIES` ({eco, mil, diplo, tech})
 * a las categorías reales de `RESEARCH`. Evita el gate `> 0.4` del código
 * anterior, por el que `diplomat` y `clanist` no investigaban nunca
 * (ninguno de sus tres ramas superaba 0.4).
 *
 * @param {object} stratWeight  objeto `weight` de una entrada de AI_STRATEGIES
 * @returns {object} categoría de investigación → peso (0..1)
 */
export const AI_STRATEGY_CATEGORY_WEIGHTS = (stratWeight = {}) => {
  const eco = stratWeight.eco || 0;
  const mil = stratWeight.mil || 0;
  const diplo = stratWeight.diplo || 0;
  const tech = stratWeight.tech || 0;
  return {
    // eco domina: minas, energía y producción de recursos.
    economy: 0.4 + eco * 1.2,
    power: 0.3 + eco * 0.9,
    engineering: 0.3 + eco * 0.7 + tech * 0.5,
    // mil: armas y defensas primero.
    weapon: 0.2 + mil * 1.4,
    defense: 0.2 + mil * 1.1,
    // diplo: lo que ayuda a expandirse y conocer la galaxia.
    exploration: 0.25 + diplo * 0.9 + tech * 0.5,
    utility: 0.3 + diplo * 0.7 + tech * 0.6,
    propulsion: 0.2 + mil * 0.5 + diplo * 0.5,
    // tech: inteligencia artificial y el resto.
    ai: 0.2 + tech * 1.4,
  };
};

/**
 * Devuelve los ids de investigación que desbloquea `techId` (directa e indirectamente).
 * Se usa para premiar investigar algo que abre muchas puertas.
 */
const buildUnlockGraph = () => {
  const graph = {};
  for (const [id, def] of Object.entries(RESEARCH)) {
    if (!def.req) continue;
    for (const key of Object.keys(def.req)) {
      if (!graph[key]) graph[key] = [];
      graph[key].push(id);
    }
  }
  return graph;
};

let _unlockGraph = null;
const getUnlockGraph = () => {
  if (!_unlockGraph) _unlockGraph = buildUnlockGraph();
  return _unlockGraph;
};

/** ¿Existe alguna investigación cuyo `req` incluya `techId`? */
export const unlocksSomething = (techId) => {
  const graph = getUnlockGraph();
  return (graph[techId] || []).length > 0;
};

/** ¿Cuántas investigaciones del catálogo dependen (directamente) de `techId`? */
export const unlockCount = (techId) => (getUnlockGraph()[techId] || []).length;

/**
 * Construye el conjunto de ids que son prerrequisito de algo que ya está en curso.
 * Si X está en la cola y Y es requisito de Z que está en la cola, investigar Y es urgente.
 */
export const buildPrereqUrgency = (researchQueue = []) => {
  const queued = new Set(researchQueue.map(q => q.researchId).filter(Boolean));
  const urgency = {};

  // Requisito de una tech que YA está en cola: urgente (peso 2 por tech encolada).
  for (const techId of queued) {
    const def = RESEARCH[techId];
    if (!def?.req) continue;
    for (const key of Object.keys(def.req)) {
      if (RESEARCH[key]) urgency[key] = (urgency[key] || 0) + 2;
    }
  }

  // tech que desbloquea algo en cola: también urgente (peso 1 por dependencia).
  for (const techId of Object.keys(RESEARCH)) {
    if (!urgency[techId]) continue;
    for (const dependent of getUnlockGraph()[techId] || []) {
      if (queued.has(dependent)) urgency[techId] += 1;
    }
  }

  return urgency;
};

/**
 * Detecta amenaza real en el estado, para subir el peso de lo militar solo si toca.
 * Antes `war` simplemente ganaba siempre; ahora sube cuando hay guerra o déficit.
 */
export const threatLevel = (state = {}) => {
  const score = (state.threatScore || 0);
  const inbound = (state.attackMissions || []).filter(m => m.targetPlanetId === state.currentPlanetId).length;
  const warActive = (state.wars || []).some(w => w.active) ? 1 : 0;
  const raw = score + inbound * 0.5 + warActive * 0.4;
  return Math.max(0, Math.min(1, raw));
};

/**
 * PUNTUACIÓN PRINCIPAL.
 *
 * @param {object} o
 * @param {string} o.id                 id de investigación
 * @param {object} o.rDef               definición (RESEARCH[id])
 * @param {number} o.level              nivel actual
 * @param {object} o.cost               researchCost(...) ya calculado
 * @param {number} o.labLevel           nivel de researchLab del planeta
 * @param {object} o.research           estado global de investigación
 * @param {object} o.buildings           edificios del planeta
 * @param {object} o.planetResources    recursos del planeta
 * @param {string} [o.ministryId]       ministerio que decide
 * @param {number} [o.GAME_SPEED]
 * @param {object} [o.ministries]       estado de ministerios (para researchGrants)
 * @param {Set}    [o.prioritizedTechs] techs que una misión activa pide ya
 * @param {object} [o.prereqUrgency]    salida de buildPrereqUrgency
 * @param {number} [o.threat]           0..1 salida de threatLevel
 * @param {string[]} [o.focusCategories] techFocus del ministerio (1.6-1)
 * @returns {number} menor = mejor.  -1 si la tech no es viable.
 */
export const scoreResearch = (o) => {
  const {
    id, rDef, level = 0, cost, labLevel = 0,
    research = {}, buildings = {}, planetResources = {},
    ministryId = null, GAME_SPEED: speed = GAME_SPEED, ministries = {},
    prioritizedTechs = null, prereqUrgency = null, threat = 0,
    focusCategories = null, constructionCenterLvl = 0,
    categoryWeights = null,
  } = o || {};

  if (!id || !rDef) return -1;

  // --- Filtros duros -----------------------------------------------------
  if (!rDef.cost) return -1;

  const ctx = { ...(buildings || {}), ...(research || {}) };
  if (!meetsResearchReq(rDef.req, ctx)) return -1;

  const effCost = cost && (cost.metal || cost.crystal || cost.deuterium)
    ? cost
    : researchCost(id, level, research?.aiStrategy || 0, constructionCenterLvl);

  const wCost = weightedCost(effCost);
  if (wCost <= 0) return -1;

  // Coste por unidad de "valor" de la tech. Un 1 significa coste bajo.
  let score = wCost;

  // --- Duración: premia lo rápido ---------------------------------------
  // El tiempo es un COSTE (ocupa el laboratorio), no un beneficio, así que se
  // MULTIPLICA: una tech larga puntúa más y queda al final. La puntuación
  // resultante se lee como "recursos gastados por hora de laboratorio", que es
  // justo lo que se quiere minimizar.
  //
  // Antes se dividía (`score /= timeUnits`), lo que con "menor = mejor"-premía
  // las techs MÁS LENTAS: exactamente el bug de 1.3 que este módulo debía arreglar.
  const rawTime = calcResearchTime(
    effCost,
    labLevel,
    speed,
    1,
    ministries || {},
    research
  );
  // Suelo: por debajo de un cuarto de hora la duración deja de distinguir techs
  // y solo añadiría ruido al comparador.
  const timeUnits = Math.max(0.25, (rawTime || 1) / 3600); // en horas
  score *= timeUnits;

  // --- Peso del ministerio ----------------------------------------------
  // `categoryWeights` tiene prioridad: permite que las IAs rivales investiguen
  // según su estrategia sin necesitar un ministerio ficticio.
  const catWeights = categoryWeights || MINISTRY_CATEGORY_WEIGHTS[ministryId] || null;
  let catWeight;
  if (catWeights && catWeights[rDef.cat] !== undefined) {
    catWeight = catWeights[rDef.cat];
  } else {
    // Sin coincidencia: el ministerio no tiene nada coherente con esta categoría.
    catWeight = NEUTRAL_CATEGORY_WEIGHT;
  }

  // La amenaza sube lo militar/defensivo y hunde todo lo demás proporcionalmente.
  if (threat > 0) {
    const martial = (rDef.cat === 'weapon' || rDef.cat === 'defense');
    catWeight *= martial ? (1 + threat * 1.5) : (1 - threat * 0.35);
  }

  // techFocus del ministerio (1.6-1): el jugador puede fijar categorías a priorizar.
  if (focusCategories && focusCategories.includes(rDef.cat)) {
    catWeight *= 3;
  }

  score /= Math.max(0.15, catWeight);

  // --- Prerrequisito de algo en curso: bonificación fuerte ---------------
  if (prereqUrgency && prereqUrgency[id]) {
    score *= Math.pow(0.05, Math.min(3, prereqUrgency[id]));
  }

  // --- Tech que una misión activa pide: bonificación fuerte -------------
  if (prioritizedTechs && prioritizedTechs.has(id)) {
    score *= 0.01;
  }

  // --- Tech que abre muchas otras puertas --------------------------------
  const opens = unlockCount(id);
  if (opens > 0) {
    // log-escala: la primera tech que abre algo vale, la décima también pero menos.
    score *= 1 / (1 + Math.log2(1 + opens));
  }

  // --- Coste plano como desempate ---------------------------------------
  // Segunda clave: si dos techs puntúan parecido, gana la más barata.
  // Se devuelve como parte alta del número para que el sort sea estable y determinista.
  return score;
};

/**
 * Elige la mejor investigación de una lista de candidatos.
 * Devuelve `{ id, score }` o `null` si ninguna es viable.
 *
 * @param {object} o         mismos parámetros que scoreResearch
 * @param {string[]} o.candidates  ids a considerar
 * @param {Set}      [o.exclude]   ids ya en cola o vetados
 * @param {object}   [o.canAffordFn] función (resources, cost) => bool
 */
export const pickBestResearch = (o) => {
  const { candidates = [], exclude = null, canAffordFn = null } = o || {};
  let best = null;
  let bestScore = Infinity;

  for (const id of candidates) {
    if (exclude && exclude.has(id)) continue;
    const rDef = RESEARCH[id];
    if (!rDef) continue;

    const level = o.research?.[id] || 0;
    const cost = researchCost(
      id, level,
      o.research?.aiStrategy || 0,
      o.constructionCenterLvl || 0
    );
    if (canAffordFn && !canAffordFn(o.planetResources || {}, cost)) continue;

    const s = scoreResearch({ ...o, id, rDef, level, cost });
    if (s < 0) continue;
    if (s < bestScore) {
      bestScore = s;
      best = { id, score: s, cost, rDef, level };
    }
  }

  return best;
};

/**
 * Ordena una lista de ids de investigación por idoneidad para un ministerio.
 * Expuesto para poder depurar desde la UI ("¿por qué no eligió esto?").
 */
export const rankResearch = (o, candidates) => {
  return (candidates || [])
    .map((id) => {
      const rDef = RESEARCH[id];
      if (!rDef) return null;
      const level = o?.research?.[id] || 0;
      const cost = researchCost(id, level, o?.research?.aiStrategy || 0, o?.constructionCenterLvl || 0);
      return { id, rDef, cost, score: scoreResearch({ ...o, id, rDef, level, cost }) };
    })
    .filter((x) => x && x.score >= 0)
    .sort((a, b) => a.score - b.score);
};

/** ¿Tiene el ministerio alguna tech viable? Útil para la UI y para tests. */
export const ministryHasViableResearch = (o, candidates) => {
  return rankResearch(o, candidates).length > 0;
};

export { RESEARCH, BUILDINGS };

/**
 * Construye el objeto de configuración completo para scoreResearch/rankResearch
 * a partir del estado global y un planeta.
 */
export const buildResearchScoreConfig = (state, planet, options = {}) => {
  const ministries = planet.ministries || state.ministries || {};
  const labLevel = planet.buildings?.researchLab || 0;

  // 1.6 — el `techFocus` del ministerio decide qué categorías se bonifican.
  // El ministerio de ciencia es el único que declara techFocus hoy, pero se lee
  // el que corresponda al ministryId que decide, con science como reserva.
  const ministryForFocus = (options.ministryId && ministries[options.ministryId])
    || ministries.science
    || {};
  const focusCategories = options.focusCategories
    || focusCategoriesFor(ministryForFocus.techFocus);

  return {
    state,
    planetId: planet.id,
    research: state.research || {},
    buildings: planet.buildings || {},
    planetResources: planet.resources || {},
    labLevel,
    ministries,
    ministryId: options.ministryId || null,
    GAME_SPEED,
    prioritizedTechs: options.prioritizedTechs || null,
    exclude: options.exclude || null,
    focusCategories: focusCategories.length > 0 ? focusCategories : null,
    constructionCenterLvl: planet.buildings?.constructionCenter || 0,
    threat: options.threat || 0,
    prereqUrgency: options.prereqUrgency || null,
    categoryWeights: options.categoryWeights || null,
  };
};
