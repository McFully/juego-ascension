import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';

export const TransmissionChannelGrid = ({
  categories,
  enrichedNotifs,
  selectedCategory,
  onSelectCategory,
  activeTransmission,
  onOpenInbox,
  onDismissLiveTransmission,
  onBack
}) => {
  return (
    <div className="w-full space-y-3 py-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm md:text-base font-black text-cyan-300 font-mono tracking-wider uppercase flex items-center gap-2">
          <span>📡</span>
          <span>Canales de Transmisión</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 w-full items-stretch pt-2 pb-4">
        {/*
          3.4-a — La tarjeta "SEÑAL EN VIVO" que ofrecía "Aceptar Transmisión"
          ya no tiene a qué aceptar: el overlay no se monta. Ahora la transmisión
          pendiente es una entrada más de la bandeja y el botón lleva allí.
        */}
        {activeTransmission && (
          <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-cyan-400/60 bg-gradient-to-b from-[#132c52]/95 via-[#0c1c38]/90 to-[#05070f] shadow-[0_0_35px_rgba(6,182,212,0.35)] select-none w-full h-full min-h-[260px]">
            <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-cyan-500/40">
              <SafeImg
                id="quantumTelecom"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500 text-black text-[10px] font-mono font-black tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.9)]">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>En Bandeja</span>
              </div>
            </div>

            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-base font-black text-cyan-200 uppercase tracking-wide transition-colors">
                  {activeTransmission.name || 'Transmisión Entrante'}
                </h4>
                <p className="text-xs text-slate-300 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                  {activeTransmission.message || 'Señal no decodificada detectada en el sector.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cyan-500/30 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="text-xs font-mono font-bold text-cyan-300 uppercase hover:text-cyan-200 transition-colors cursor-pointer"
                >
                  Leer en la bandeja
                </button>
                <button
                  onClick={onDismissLiveTransmission}
                  className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-red-950/60 border border-white/20 hover:border-red-500 text-slate-400 hover:text-red-300 font-mono text-[10px] uppercase transition-all cursor-pointer"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canales Estándar */}
        {categories.map(cat => {
          const count = enrichedNotifs.filter(n => cat.id === 'all' || n.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-[1.02]'
                  : 'bg-[#090d1f]/90 border-white/10 hover:border-cyan-400/60 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
              }`}
            >
              <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
                <SafeImg
                  id={cat.assetId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${
                  isSelected
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-black/60 border-white/10 text-slate-400'
                }`}>
                  {count} Despachos
                </span>
              </div>

              <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {cat.label}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                  <span className={isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'}>
                    {isSelected ? '● Sintonizado' : 'Sintonizar'}
                  </span>
                  <span className={`transition-transform duration-200 ${isSelected ? 'text-cyan-300 translate-x-1' : 'text-cyan-400/70 group-hover:translate-x-1'}`}>
                    ➔
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {/* Tarjeta de Retorno */}
        <ActionCardTile
          type="back"
          title="Volver Atrás"
          subtitle="Regresar a la pantalla anterior"
          icon="◀"
          assetId="commandCenter"
          badgeText="VOLVER"
          onClick={onBack}
        />
      </div>
    </div>
  );
};
