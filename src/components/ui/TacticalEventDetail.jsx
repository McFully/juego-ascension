import React, { useEffect } from 'react';
import { asset, REAL_IMAGES } from '../../assets.jsx';
import { sfx, speakText } from '../../audio.js';
import { fmt } from '../../utils/formulas.js';

/**
 * TacticalEventDetail — Presentación de UNA entrada del registro táctico.
 *
 * 3.7 — Se extrajo el bloque de presentación de `TacticalEventOverlay.jsx`
 * (manifiesto de recursos, bajas, escombros, flota retornada, ficha de planeta y
 * ficha de ministro) para reutilizarlo tal cual en la bandeja, SIN reescribirlo.
 *
 * Diferencias deliberadas respecto al overlay que le dio origen:
 *   - no es un overlay de pantalla completa: es contenido embebido, que la
 *     bandeja coloca donde quiere;
 *   - el `sfx` y la voz suenan al ABRIR el mensaje, no al recibirlo. Es el
 *     cambio de fondo del paso 3.4: nada interrumpe sola, y el sonido llega
 *     cuando el jugador decide mirar.
 *
 * El paginador y el overlay de pantalla completa siguen siendo responsabilidad
 * de quien lo usa.
 */
export const TacticalEventDetail = ({
  event,
  onNavigatePlanet = null,
  onChoose = null,
  footer = null,
  autoPlayAudio = true,
}) => {
  const eventId = event?.id;

  useEffect(() => {
    if (!event || !autoPlayAudio) return;

    if (event.type === 'colonize') {
      sfx.milestone?.();
    } else if (event.type === 'transport' || event.type === 'transport_return') {
      sfx.heavyRelayClick?.();
    } else if (event.type === 'expedition' || event.type === 'espionage' || event.type === 'espionage_return') {
      sfx.tacticalSonarPing?.();
    } else if (event.type === 'combat') {
      if (event.combatResult === 'victory') sfx.success?.();
      else if (event.combatResult === 'defeat') sfx.notifyDanger?.();
      else sfx.warn?.();
    } else if (event.type === 'espionage_alert') {
      sfx.notifyDanger?.();
    } else {
      sfx.uiModal?.();
    }

    const prefix = event.minister ? `Comunicado de ${event.minister.name}. ` : '';
    const voiceText = `${prefix}${event.voiceText || event.title || 'Acontecimiento táctico'}. ${event.subtitle || ''}`;
    if (voiceText) {
      speakText(voiceText, { minister: event.minister });
    }
    // Solo al cambiar de mensaje: no en cada render ni en cada tick.
  }, [eventId, autoPlayAudio]);

  if (!event) return null;

  const isColonize = event.type === 'colonize';
  const isCombat = event.type === 'combat';
  const isReturnEvent = event.type === 'transport_return'
    || event.type === 'recycle_return'
    || event.type === 'espionage_return'
    || event.type === 'combat_return';

  const headerBadgeColor = isColonize
    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
    : (event.type === 'transport' || event.type === 'transport_return')
    ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
    : event.type === 'expedition'
    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
    : (event.type === 'recycle' || event.type === 'recycle_return')
    ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
    : (isCombat || event.type === 'combat_return' || event.type === 'espionage_alert')
    ? (event.combatResult === 'defeat' || event.type === 'espionage_alert' ? 'border-red-500/50 bg-red-500/20 text-red-300' : 'border-rose-500/50 bg-rose-500/20 text-rose-300')
    : 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300';

  const badgeIcon = isColonize
    ? 'flag'
    : event.type === 'transport'
    ? 'local_shipping'
    : event.type === 'transport_return'
    ? 'warehouse'
    : event.type === 'expedition'
    ? 'explore'
    : event.type === 'recycle'
    ? 'recycling'
    : event.type === 'recycle_return'
    ? 'domain_verification'
    : isCombat
    ? (event.combatResult === 'victory' ? 'military_tech' : event.combatResult === 'defeat' ? 'emergency' : 'swords')
    : event.type === 'combat_return'
    ? 'shield'
    : event.type === 'espionage'
    ? 'visibility'
    : event.type === 'espionage_alert'
    ? 'warning'
    : 'radar';

  const badgeLabel = isColonize
    ? 'Expansión Imperial • Nueva Colonia'
    : event.type === 'transport'
    ? 'Logística Imperial • Entrega de Carga'
    : event.type === 'transport_return'
    ? 'Logística Imperial • Retorno a Base'
    : event.type === 'expedition'
    ? 'Exploración Profunda • Retorno de Expedición'
    : event.type === 'recycle'
    ? 'Operación Táctica • Reciclaje Orbital'
    : event.type === 'recycle_return'
    ? 'Operación Táctica • Recicladores en Base'
    : isCombat
    ? (event.combatResult === 'victory' ? 'Combate Naval • Victoria' : event.combatResult === 'defeat' ? 'Combate Naval • Derrota' : 'Combate Naval • Tablas')
    : event.type === 'combat_return'
    ? 'Flota Naval • Repliegue en Silos'
    : event.type === 'espionage'
    ? 'Servicio de Inteligencia • Informe Orbital'
    : event.type === 'espionage_alert'
    ? 'Alerta de Inteligencia • Sonda Interceptada'
    : 'Servicio de Inteligencia • Sonda Recuperada';

  const imgSource = event.image
    ? (REAL_IMAGES[event.image] || asset(event.image))
    : null;

  return (
    <div className="bg-slate-950/95 border-2 border-cyan-500/40 rounded-3xl w-full overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.25)]">
      <div className="relative h-44 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10">
        {imgSource ? (
          <img src={imgSource} alt={event.title} className="w-full h-full object-cover scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 text-cyan-500">
            <span className="material-symbols-outlined text-9xl">{badgeIcon}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className={`absolute top-4 left-5 px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-[0.25em] z-20 backdrop-blur-md flex items-center gap-2 ${headerBadgeColor}`}>
          <span className="material-symbols-outlined text-[14px]">{badgeIcon}</span>
          <span>{badgeLabel}</span>
        </div>

        <div className="absolute bottom-4 left-6 right-6 z-20">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
            {event.title}
          </h2>
          {event.subtitle && (
            <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
              {event.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {event.minister && (
          <div className="flex items-center justify-between p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-xl overflow-hidden relative">
                {event.minister.avatarId ? (
                  <img
                    src={asset(`${event.minister.avatarId}.jpg`)}
                    alt={event.minister.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{event.minister.icon || '👤'}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white font-mono">{event.minister.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[9px] text-cyan-300 font-mono uppercase font-bold border border-cyan-500/30">
                    Ministro a Cargo
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  {event.ministryName || 'Gabinete Imperial'} • {event.minister.trait || 'Oficial Imperial'}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-cyan-400 text-lg opacity-80 mr-2">record_voice_over</span>
          </div>
        )}

        {event.description && (
          <div className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            <span className="material-symbols-outlined text-2xl text-cyan-400 mt-0.5">description</span>
            <p className="text-sm text-slate-300 font-sans leading-relaxed">
              {event.description}
            </p>
          </div>
        )}

        {event.resources && Object.keys(event.resources).length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
              {isCombat ? 'Botín de Guerra Obtenido' : 'Manifiesto de Recursos Transferidos'}
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>Metal
                </div>
                <span className="text-base font-bold text-white font-mono mt-1">
                  +{fmt(event.resources.metal || 0)}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>Cristal
                </div>
                <span className="text-base font-bold text-cyan-200 font-mono mt-1">
                  +{fmt(event.resources.crystal || 0)}
                </span>
              </div>
              <div className="bg-slate-900/80 border border-cyan-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>Deuterio
                </div>
                <span className="text-base font-bold text-emerald-200 font-mono mt-1">
                  +{fmt(event.resources.deuterium || 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {isCombat && (
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
              Evaluación Táctica de Bajas y Escombros
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Resultado</span>
                <span className={`text-xs font-bold uppercase ${event.combatResult === 'victory' ? 'text-emerald-400' : event.combatResult === 'defeat' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {event.combatResult === 'victory' ? 'Victoria' : event.combatResult === 'defeat' ? 'Derrota' : 'Tablas'}
                </span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Bajas Propias</span>
                <span className="text-xs font-bold text-rose-300">{event.losses?.playerLosses ?? 0} unid.</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Bajas Hostiles</span>
                <span className="text-xs font-bold text-emerald-300">{event.losses?.enemyLosses ?? 0} unid.</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Escombros</span>
                <span className="text-xs font-bold text-cyan-300">{fmt((event.debris?.metal || 0) + (event.debris?.crystal || 0))}</span>
              </div>
            </div>
          </div>
        )}

        {isReturnEvent && event.returnedFleet && Object.keys(event.returnedFleet).length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
              Naves Reincorporadas al Hangar
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(event.returnedFleet)
                .filter(([, qty]) => qty > 0)
                .map(([shipId, qty]) => (
                  <div key={shipId} className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{qty}x</span>
                    <span className="text-xs text-cyan-300">{shipId}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {isColonize && event.planetDetails && (
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] block">
              Ficha de Reconocimiento Geológico
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Bioma</span>
                <span className="text-xs font-bold text-white uppercase">{event.planetDetails.biome || 'Estándar'}</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Tamaño</span>
                <span className="text-xs font-bold text-white">{event.planetDetails.planetSize || 100} campos</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Temperatura</span>
                <span className="text-xs font-bold text-white">{event.planetDetails.temperature || 20}°C</span>
              </div>
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Gravedad</span>
                <span className="text-xs font-bold text-white">{event.planetDetails.gravity || 1} G</span>
              </div>
            </div>
          </div>
        )}

        {/* Opciones pendientes: la decisión se toma aquí, no en un overlay aparte. */}
        {Array.isArray(event.options) && event.options.length > 0 && (
          <div className="space-y-2 border-t border-white/10 pt-4">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.25em] block">
              Requiere decisión
            </span>
            {event.options.map((opt, i) => (
              <div key={opt.id || opt.text || i}>
                {opt.text && (
                  <p className="text-xs text-slate-300 mb-1.5">{opt.text}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onChoose) onChoose(i, opt);
                    else if (event.onChoose) event.onChoose(i, opt);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-200 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                >
                  Elegir
                </button>
              </div>
            ))}
          </div>
        )}

        {footer !== null && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
            <div />
            <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
              {event.targetPlanetId && onNavigatePlanet && (
                <button
                  onClick={() => onNavigatePlanet(event.targetPlanetId)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">public</span>
                  <span>Ver Planeta</span>
                </button>
              )}
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
