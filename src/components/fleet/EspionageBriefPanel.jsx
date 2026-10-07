import React from 'react';
import {
  countProbes,
  getEspionageMissionCost,
  getTargetEspDefense,
  getEspionageCountermeasures,
  getFleetStealth,
  computeEspionageDetection,
  applyIntelCeiling,
  getIntelCeilingBonus,
  getFactionEspionageMult,
  getFactionEspionageDiffBonus,
  DETECTION_MAX,
} from '../../utils/espionageFormulas.js';
import { getEffectiveTech } from '../../utils/formulas/combatFormulas.js';

/**
 * INFORME PREVIO DE ESPIONAJE.
 *
 * Antes de lanzar una sonda no se veía nada: ni coste, ni riesgo, ni hasta qué
 * nivel de inteligencia era posible llegar. El jugador descubria el resultado
 * cuando ya no podia hacer nada. Este panel muestra la misma aritmética que
 * aplica `handleEspionageMission`, con los mismos datos, para que la decisión
 * sea informada y no una apuesta a ciegas.
 */

const INTEL_LABELS = {
  blocked: 'Bloqueado — no sabrás nada',
  low: 'Básico — recursos aproximados',
  medium: 'Medio — cifras con margen de error',
  high: 'Alto — exacto e investigación',
  full: 'Completo — incluye intención y patrón',
};

const INTEL_ORDER = ['blocked', 'low', 'medium', 'high', 'full'];

/** Traduce un `techDiff` al nivel que daria la escalera del resolver. */
function nivelDesdeDiff(techDiff) {
  if (techDiff <= -3) return 'blocked';
  if (techDiff <= 0) return 'low';
  if (techDiff <= 3) return 'medium';
  if (techDiff <= 6) return 'high';
  return 'full';
}

export const EspionageBriefPanel = ({ state, currentPlanet, target, selectedShips, fmt }) => {
  const sondas = countProbes(selectedShips);
  const disponibles = countProbes(currentPlanet?.fleet);

  const targetAI = (state?.aiPlanets || []).find(p =>
    target && p.galaxy === target.galaxy && p.system === target.system && p.position === target.position
  );

  const spyTech = getEffectiveTech(currentPlanet, state?.research)?.espionage || 0;
  const coste = getEspionageMissionCost(sondas, spyTech);

  let riesgo = null;
  let techo = null;
  let nivelEsperado = null;

  if (targetAI) {
    const defensa = getTargetEspDefense(targetAI);
    const rawDiff = spyTech - defensa;
    const countermeasures = getEspionageCountermeasures(currentPlanet, state);
    const sigilo = getFleetStealth(selectedShips, state?.blueprints || []);
    riesgo = computeEspionageDetection({ techDiff: rawDiff, countermeasures, stealth: sigilo });

    const factionMult = getFactionEspionageMult(currentPlanet?.faction || 'human');
    techo = applyIntelCeiling(rawDiff, getIntelCeilingBonus(state) + getFactionEspionageDiffBonus(factionMult));
    nivelEsperado = nivelDesdeDiff(techo);
  }

  const recursos = currentPlanet?.resources || {};
  const deuteriumOk = (recursos.deuterium || 0) >= coste.deuterium;
  const cristalOk = (recursos.crystal || 0) >= coste.crystal;

  const Fila = ({ etiqueta, valor, tono = 'text-slate-200', nota }) => (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-white/5 last:border-0">
      <span className="text-[11px] uppercase tracking-wide text-slate-400">{etiqueta}</span>
      <span className={`text-xs font-mono font-bold ${tono}`}>
        {valor}
        {nota && <span className="ml-1.5 text-[10px] font-normal text-slate-500">{nota}</span>}
      </span>
    </div>
  );

  return (
    <section className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-300">Informe previo de espionaje</h3>
        <span className="text-[10px] font-mono text-slate-500">
          Espionaje nv. {spyTech}
        </span>
      </header>

      {sondas <= 0 && (
        <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg px-3 py-2">
          Selecciona al menos una sonda para lanzar una operación de espionaje.
        </p>
      )}

      <div>
        <Fila
          etiqueta="Sondas asignadas"
          valor={`${sondas} / ${disponibles}`}
          tono={sondas > 0 ? 'text-blue-300' : 'text-amber-300'}
        />
        <Fila
          etiqueta="Coste operativo"
          valor={`${fmt(coste.deuterium)} deut · ${fmt(coste.crystal)} crist`}
          tono={deuteriumOk && cristalOk ? 'text-slate-200' : 'text-red-400'}
          nota={!deuteriumOk || !cristalOk ? 'insuficiente' : undefined}
        />
        <Fila
          etiqueta="Deuterio en base"
          valor={`${(recursos.deuterium || 0).toLocaleString('es-ES')} deut disponibles`}
          tono="text-slate-300"
        />
      </div>

      {targetAI && riesgo !== null && (
        <div>
          <Fila
            etiqueta="Riesgo de detección"
            valor={riesgo > 0.6 ? 'Muy Alto (~70-90%)' : riesgo > 0.35 ? 'Moderado (~40-60%)' : 'Bajo (<30%)'}
            tono={riesgo > 0.5 ? 'text-red-400' : riesgo > 0.2 ? 'text-amber-300' : 'text-emerald-400'}
          />
          <Fila
            etiqueta="Inteligencia máxima"
            valor={nivelEsperado.toUpperCase()}
            tono="text-cyan-300"
            nota={INTEL_LABELS[nivelEsperado]}
          />
          {nivelEsperado === INTEL_ORDER[0] && (
            <p className="text-[11px] text-red-400/90 pt-1.5 leading-relaxed">
              Tu tecnología no supera la contraespionaje del objetivo. La sonda gastará
              recursos y probablemente solo devolverá datos inútiles.
            </p>
          )}
        </div>
      )}

      {!targetAI && (
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Selecciona un planeta enemigo yaoccupied para ver el riesgo y el nivel de inteligencia posible.
        </p>
      )}

      <p className="text-[10px] text-slate-500 leading-relaxed">
        Riesgo máximo posible: {Math.round(DETECTION_MAX * 100)}%. Ninguna sonda es indetectable.
      </p>
    </section>
  );
};
