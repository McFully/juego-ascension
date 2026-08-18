import React from 'react';
import { S } from '../../styles.js';
import { fmt } from '../../core.jsx';

export const FederationsManager = ({
  aiList,
  influence,
  currentPlanet,
  resources,
  federations,
  federalFleet,
  dispatch,
  playDiploSound
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className={`${S.cardDeep} lg:col-span-2 space-y-4`}>
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">🤝 Consejo de Alianzas y Fuerzas Federadas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-white/5 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-cyan-400 block font-mono">¿Qué es una Federación?</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Una unión indisoluble de civilizaciones aliadas para compartir recursos, tecnologías, bases orbitales y defensas planetarias frente a las amenazas de la galaxia.
            </p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-emerald-400 block font-mono">Ventajas y Responsabilidades</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Concede +15% de defensa militar, investigación conjunta rápida y acceso exclusivo al ejército federal compartido. Requiere contribuir periódicamente al tesoro federal.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-bold text-slate-200 block">Formar Federación Interestelar (o en Solitario)</span>
              <span className="text-[10px] text-slate-400 font-mono">Requisitos: 80 Puntos de Influencia. Si no hay aliados con Relación &gt;= 60, fundarás la alianza en solitario para expandirla después.</span>
            </div>
            <button 
              onClick={() => { playDiploSound('success'); dispatch({ type: 'FORM_FEDERATION', name: 'Alianza Cósmica del Jugador', memberIds: aiList.filter(a => (a.relation || 0) >= 60).map(a => a.id) }); }} 
              disabled={influence < 80} 
              className={`${S.btnSmall} ${S.btnPrimary} font-mono`}
            >
              Establecer Alianza (80 Influencia)
            </button>
          </div>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Contribuir a la Flota Federal</h4>
          <div className="flex gap-4 items-center">
            <span className="text-xs text-slate-400 font-mono">Entrega 3 Cazadores y 3000 Metal:</span>
            <button 
              onClick={() => { 
                playDiploSound('success'); 
                const availLF = currentPlanet?.fleet?.lightFighter || 0;
                const lfQty = Math.min(3, availLF);
                const shipObj = lfQty > 0 ? { lightFighter: lfQty } : {};
                const metalQty = Math.min(3000, Math.floor(resources.metal || 0));
                dispatch({ 
                  type: 'CONTRIBUTE_TO_FEDERAL_FLEET', 
                  resources: { metal: metalQty }, 
                  ships: shipObj 
                }); 
              }} 
              className={`${S.btnSmall} ${S.btnEmissive} font-mono`}
            >
              🚀 Despachar Flotilla
            </button>
          </div>
        </div>
      </div>

      <div className={`${S.cardDeep} space-y-4 font-mono`}>
        <h4 className="font-semibold text-sm text-slate-400 uppercase tracking-wider">Detalles de la Federación</h4>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-500">CONSEJO FEDERAL:</span>
            <span className="text-white font-bold">{federations.length > 0 ? 'Activo' : 'Inactivo'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-slate-500">ARMADA DE DEFENSA:</span>
            <span className="text-cyan-400 font-bold">{Object.values(federalFleet.ships||{}).reduce((a,b)=>a+b,0)} Naves</span>
          </div>
          
          <div>
            <span className="text-slate-500 uppercase text-[9px] block mb-1.5">Contribución Total del Jugador</span>
            <div className="bg-black/20 p-2 rounded border border-white/5 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Metal:</span>
                <span className="text-emerald-400">{fmt(federalFleet.contributions?.player?.metal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cristal:</span>
                <span className="text-blue-400">{fmt(federalFleet.contributions?.player?.crystal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deuterio:</span>
                <span className="text-purple-400">{fmt(federalFleet.contributions?.player?.deuterium || 0)}</span>
              </div>
              {Object.entries(federalFleet.contributions?.player?.ships || {}).length > 0 && (
                <div className="pt-1 mt-1 border-t border-white/5">
                  {Object.entries(federalFleet.contributions?.player?.ships).map(([id, qty]) => (
                    <div key={id} className="flex justify-between text-slate-500">
                      <span>{id}:</span>
                      <span>{qty}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-500 uppercase text-[9px] block mb-1.5">Naves en la Armada Federal</span>
            {Object.entries(federalFleet.ships || {}).map(([shipId, qty]) => (
              <div key={shipId} className="flex justify-between py-0.5 text-slate-400">
                <span>{shipId}:</span>
                <span>{qty} unidades</span>
              </div>
            ))}
            {Object.keys(federalFleet.ships || {}).length === 0 && (
              <div className="text-[10px] text-slate-600 italic">No hay naves en la armada federal.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FederationsManager;
