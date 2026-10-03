import React from 'react';
import { SafeImg } from '../../assets.jsx';

/**
 * MarketDistrictCardGrid — Selector de Distritos Mercantiles Galácticos en formato Card Grid.
 * Sustituye los botones planos anteriores en GalacticMarketPage.jsx.
 */
export const MarketDistrictCardGrid = ({
  activeSubTab,
  onSelectSubTab,
  contractsCount = 0,
  blackMarketOffersCount = 0,
  automatedRulesCount = 0
}) => {
  const districts = [
    {
      id: 'exchange',
      title: 'Bolsa de Materias Primas',
      subtitle: 'Arbitraje de commodities (Metal, Cristal, Deuterio y Escoria) con cotizaciones dinámicas.',
      badgeText: 'SPOT MARKET',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      assetId: 'exchangeBank',
      icon: '📈',
      stats: 'Cotizaciones 24/7'
    },
    {
      id: 'used_ships',
      title: 'Lonja Naval de Ocasión',
      subtitle: 'Compraventa de naves usadas, excedentes de guerra y cascos desmilitarizados.',
      badgeText: 'SUBASTAS',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      assetId: 'exchangeDocks',
      icon: '⚓',
      stats: 'Lotes de Ocasión'
    },
    {
      id: 'contracts',
      title: 'Licitaciones Corporativas',
      subtitle: 'Contratos corporativos interestelares de suministro con recompensas millonarias en créditos.',
      badgeText: `${contractsCount} CONTRATOS`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      assetId: 'tradeHubTheorems',
      icon: '📜',
      stats: 'Licitaciones Abiertas'
    },
    {
      id: 'black_market',
      title: 'Bazar Negro y Contrabando',
      subtitle: 'Tráfico de reliquias proscritas, planos experimentales y subastas sin aranceles aduaneros.',
      badgeText: 'CLANDESTINO',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      assetId: 'arbitrage_tribunals',
      icon: '🕶️',
      stats: 'Vigilancia Baja'
    },
    {
      id: 'automated_rules',
      title: 'Mesa Algorítmica y Fletes',
      subtitle: 'Algoritmos automatizados de arbitraje para compraventa con stop-loss e inversión en fletes.',
      badgeText: `${automatedRulesCount} REGLAS`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      assetId: 'dir_quantum_crypto',
      icon: '🤖',
      stats: 'Trading Autónomo'
    },
    {
      id: 'bilateral_routes',
      title: 'Rutas Comerciales Bilaterales',
      subtitle: 'Tratados y enlaces de suministro continuo entre planetas del imperio para cosechar dividendos en créditos.',
      badgeText: 'ENLACES IMPERIALES',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      assetId: 'exchangeDocks',
      icon: '🌐',
      stats: 'Rutas Directas'
    }
  ];

  return (
    <div className="w-full space-y-4 py-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm md:text-base font-black text-emerald-300 font-mono tracking-wider uppercase flex items-center gap-2">
          <span>🏛️</span>
          <span>Distritos Financieros y Lonjas Galácticas</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          6 Mercados Habilitados
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 w-full items-stretch pt-1 pb-3">
        {districts.map(d => {
          const isSelected = activeSubTab === d.id;

          return (
            <button
              key={d.id}
              onClick={() => {
                onSelectSubTab(d.id);
                if (window.playSfx) window.playSfx('click');
              }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[250px] ${
                isSelected
                  ? 'bg-gradient-to-b from-[#102a24]/95 via-[#0c1f1c]/90 to-[#040711] border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.4)] scale-[1.02]'
                  : 'bg-[#060a16]/90 border-white/10 hover:border-emerald-400/60 hover:bg-[#0b171c] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]'
              }`}
            >
              {/* Imagen Banner */}
              <div className="relative w-full h-32 overflow-hidden bg-[#040711] border-b border-white/10">
                <SafeImg
                  id={d.assetId}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${d.badgeColor}`}>
                  {d.badgeText}
                </span>
                <span className="absolute bottom-2 left-2 text-xl drop-shadow-md">
                  {d.icon}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {d.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                    {d.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider font-semibold">
                  <span className={isSelected ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-400'}>
                    {isSelected ? '● Cotizando' : d.stats}
                  </span>
                  <span className={`transition-transform duration-200 ${isSelected ? 'text-emerald-300 translate-x-1' : 'text-emerald-400/70 group-hover:translate-x-1'}`}>
                    ➔
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
