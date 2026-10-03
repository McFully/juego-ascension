import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { ActionCardTile } from '../ui/ActionCardTile.jsx';

export const DiplomacyChamberSelector = ({ onSelectChamber, playDiploSound, onBack }) => {
  const chambers = [
    { id: 'relations', label: 'Embajada y Líderes', icon: '🤝', assetId: 'permanentEmbassy', subtitle: 'Contacto directo con imperios alienígenas, pactos y comercio' },
    { id: 'council', label: 'Consejo Galáctico', icon: '🏛️', assetId: 'sectorGovPalace', subtitle: 'Votación de resoluciones interestelares y hegemonía política' },
    { id: 'federations', label: 'Pactos Federativos', icon: '🛡️', assetId: 'battleship', subtitle: 'Alianzas militares, flota federal conjunta y defensa mutua' },
    { id: 'crises', label: 'Alertas de Crisis', icon: '⚠️', assetId: 'plasmaTurret', subtitle: 'Amenazas interestelares, plagas cósmicas y frentes bélicos' },
  ];

  return (
    <div className="w-full space-y-3 py-2 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full items-stretch pt-1 pb-4">
        {chambers.map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (playDiploSound) playDiploSound('click');
              onSelectChamber(t.id);
            }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] bg-[#090d1f]/90 border-white/10 hover:border-purple-400/60 hover:bg-[#0e1633] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]"
          >
            {/* Banner de Imagen Superior Grande */}
            <div className="relative w-full h-36 md:h-40 overflow-hidden bg-[#05070f] border-b border-white/10">
              <SafeImg
                id={t.assetId}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border bg-black/60 border-white/10 text-slate-400">
                DIPLOMACIA
              </span>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h4 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-purple-300 transition-colors line-clamp-1">
                  {t.label}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1.5 line-clamp-2 leading-relaxed">
                  {t.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase tracking-wider font-semibold">
                <span className="text-slate-400 group-hover:text-purple-400">
                  Entrar a Cámara
                </span>
                <span className="text-purple-400/70 group-hover:translate-x-1 transition-transform duration-200">
                  ➔
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* Tarjeta de Retorno a Pantalla Anterior */}
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
