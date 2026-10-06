import { queryGemini } from '../../../services/geminiService.js';

// Cooldown de reevaluación por IA: mínimo 120 segundos entre consultas automáticas
const AI_DIRECTOR_COOLDOWN_MS = 90000;
let lastDirectorCallTimestamp = 0;

/**
 * Genera la directiva estratégica para una facción destacada o en crisis.
 * 1. Intenta consultar a la IA (Gemini) con un resumen estructurado.
 * 2. Si no hay conexión, falla la API o hay cuota agotada, usa el Director Local (Fallback Determinista).
 * 3. Valida estrictamente la directiva: la IA no puede crear recursos ni saltarse reglas.
 */
export async function consultStrategicDirector(faction, universeSummary) {
  const now = Date.now();

  // Si está en cooldown o no es momento, devolver null para dejar que el motor determinista prosiga
  if (now - lastDirectorCallTimestamp < AI_DIRECTOR_COOLDOWN_MS) {
    return null;
  }

  const prompt = `
[DIRECTOR ESTRATÉGICO DE ASCENSIÓN]
Eres el consejero supremo de la facción espacial "${faction.empireName || faction.name}".
Personalidad de facción:
- Agresividad: ${(faction.profile?.aggressiveness || 0.5).toFixed(2)}
- Prudencia: ${(faction.profile?.prudence || 0.5).toFixed(2)}
- Ambición: ${(faction.profile?.ambition || 0.5).toFixed(2)}
- Enfoque: ${faction.strategy || 'balanced'}

Situación actual:
- Nivel de Poder: ${faction.aiLevel || 1}
- Recursos: Metal: ${Math.floor(faction.resources?.metal || 0)}, Cristal: ${Math.floor(faction.resources?.crystal || 0)}, Deuterio: ${Math.floor(faction.resources?.deuterium || 0)}
- Naves en flota: ${Object.values(faction.fleet || {}).reduce((a, b) => a + b, 0)}
- Defensas activas: ${Object.values(faction.defenses || {}).reduce((a, b) => a + b, 0)}
- Guerras ganadas/perdidas: ${faction.totalWins || 0} / ${faction.totalLosses || 0}
- Estado del universo: ${universeSummary}

Opciones estratégicas disponibles:
1. "EXPAND" (Colonizar y buscar mundos vírgenes)
2. "MILITARIZE" (Reforzar defensas y construir flota pesada)
3. "TECH" (Invertir intensamente en I+D científica)
4. "TRADE" (Apertura de rutas comerciales y acuerdos pacíficos)
5. "WAR_POSTURE" (Movilizar flotas para confrontar a rivales)
6. "FORTIFY" (Construir búnkeres y plantas de energía)

Responde ÚNICAMENTE en formato JSON con la siguiente estructura (sin comillas invertidas extra):
{
  "strategyDirective": "EXPAND" | "MILITARIZE" | "TECH" | "TRADE" | "WAR_POSTURE" | "FORTIFY",
  "priority": "HIGH" | "MEDIUM" | "DEFENSIVE",
  "reasoning": "Breve frase explicativa en español de por qué adoptan esta postura"
}
`.trim();

  try {
    lastDirectorCallTimestamp = now;
    const response = await queryGemini(prompt, {
      category: 'strategic_director',
      systemInstruction: 'Eres un director de simulación de alta estrategia espacial. Responde estrictamente con el JSON solicitado.',
      temperature: 0.6,
      useCache: true
    });

    if (response.success && response.text) {
      // Extraer JSON limpio
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validación estricta de directiva
        const validDirectives = ['EXPAND', 'MILITARIZE', 'TECH', 'TRADE', 'WAR_POSTURE', 'FORTIFY'];
        if (validDirectives.includes(parsed.strategyDirective)) {
          return {
            source: 'gemini_ai',
            directive: parsed.strategyDirective,
            priority: parsed.priority || 'MEDIUM',
            reasoning: parsed.reasoning || 'Decisión táctica del Alto Mando.',
            timestamp: now
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Strategic Director] Error en consulta IA, ejecutando fallback local:', err);
  }

  // Fallback local robusto (Offline / Cero Fallo)
  return fallbackStrategicDirector(faction);
}

/**
 * Director Estratégico Local de Emergencia (100% Offline y Determinista)
 */
export function fallbackStrategicDirector(faction) {
  const profile = faction.profile || {};
  const res = faction.resources || {};
  const b = faction.buildings || {};

  let directive = 'TRADE';
  let reasoning = 'Estabilización de tratados y balanza comercial.';

  if ((profile.aggressiveness || 0.5) > 0.7 && (res.metal || 0) > 20000) {
    directive = 'WAR_POSTURE';
    reasoning = 'Doctrina militar ofensiva ante la presencia de competidores.';
  } else if ((b.solarPlant || 0) < 5 || (b.metalMine || 0) < 5) {
    directive = 'FORTIFY';
    reasoning = 'Consolidación de infraestructuras básicas energéticas y mineras.';
  } else if ((profile.expansionLean || 0.4) > 0.6 && (res.metal || 0) > 15000) {
    directive = 'EXPAND';
    reasoning = 'Búsqueda de nuevos horizontes coloniales y recursos vírgenes.';
  } else if ((profile.techLean || 0.4) > 0.6) {
    directive = 'TECH';
    reasoning = 'Prioridad a la superioridad tecnológica e industrial.';
  }

  return {
    source: 'local_deterministic',
    directive,
    priority: 'MEDIUM',
    reasoning,
    timestamp: Date.now()
  };
}

/**
 * Recalibración reactiva e inmediata de directiva basada en eventos críticos recientes
 * Permite que una facción responda a guerras, saqueos, rebeliones o crisis sin esperar al tick 240.
 */
export function recalibrateDirectiveOnEvents(faction, recentEvents, currentTick) {
  if (!faction || !recentEvents || recentEvents.length === 0) return null;

  const relevant = recentEvents.filter(e => 
    e.tick && (currentTick - e.tick <= 60) && 
    (e.desc?.includes(faction.name) || e.desc?.includes(faction.empireName || ''))
  );

  if (relevant.length === 0) return null;

  const hasWar = relevant.some(e => e.type === 'war' || e.type === 'raid');
  const hasRebellion = relevant.some(e => e.type === 'rebellion' || e.type === 'crisis');
  const hasTechBreakthrough = relevant.some(e => e.type === 'tech_breakthrough' || e.type === 'tech_race');

  const now = Date.now();

  if (hasRebellion) {
    return {
      source: 'local_deterministic',
      directive: 'FORTIFY',
      priority: 'CRITICAL',
      reasoning: 'Respuesta de emergencia ante desestabilización interna o crisis.',
      timestamp: now
    };
  }

  if (hasWar) {
    const isAggressive = (faction.profile?.aggressiveness || 0.5) > 0.5;
    return {
      source: 'local_deterministic',
      directive: isAggressive ? 'WAR_POSTURE' : 'FORTIFY',
      priority: 'HIGH',
      reasoning: isAggressive ? 'Represalia militar inmediata ante conflicto bélico.' : 'Defensa y fortificación perimetral ante hostilidades.',
      timestamp: now
    };
  }

  if (hasTechBreakthrough && (faction.profile?.techLean || 0.4) > 0.45) {
    return {
      source: 'local_deterministic',
      directive: 'TECH',
      priority: 'HIGH',
      reasoning: 'Aprovechando impulso científico para consolidar ventaja tecnológica.',
      timestamp: now
    };
  }

  return null;
}

