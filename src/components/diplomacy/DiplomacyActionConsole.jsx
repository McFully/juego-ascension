import React, { useState } from 'react';

/**
 * Acciones diplomáticas completas y detalladas con categorías visuales,
 * nombres sin abreviaturas, descripciones contextuales e indicadores de costes.
 */
const ACTION_CATEGORIES = [
  {
    id: 'cooperation',
    title: 'Cooperación y Diálogo',
    badge: 'Protocolos de Apertura',
    accent: 'cyan',
    borderColor: 'border-cyan-500/20',
    headerBg: 'from-cyan-950/40 to-transparent',
    headerText: 'text-cyan-300',
    actions: [
      {
        id: 'greet',
        name: 'Saludo Protocolario',
        shortDesc: 'Transmitir mensaje de cortesía interestelar',
        icon: '👋',
        costDesc: 'Gratuito',
        impact: '+2 Relación',
        impactColor: 'text-emerald-400',
        influenceCost: 0,
        resourcesCost: {}
      },
      {
        id: 'official_intro',
        name: 'Presentación Oficial',
        shortDesc: 'Acreditar embajada formal de Estado',
        icon: '🏛️',
        costDesc: '5 Influencia',
        impact: '+5 Relación',
        impactColor: 'text-emerald-400',
        influenceCost: 5,
        resourcesCost: {}
      },
      {
        id: 'cultural_exchange',
        name: 'Intercambio Cultural',
        shortDesc: 'Misiones bilaterales de arte, historia y lenguaje',
        icon: '🎭',
        costDesc: '10 Influencia',
        impact: '+12 Relación',
        impactColor: 'text-emerald-400',
        influenceCost: 10,
        resourcesCost: {}
      },
      {
        id: 'scientific_exchange',
        name: 'Intercambio Científico',
        shortDesc: 'Compartir archivos cuánticos y datos de laboratorio',
        icon: '🔬',
        costDesc: '15 Inf · 500 Deut',
        impact: '+15 Relación',
        impactColor: 'text-emerald-400',
        influenceCost: 15,
        resourcesCost: { deuterium: 500 }
      }
    ]
  },
  {
    id: 'treaties',
    title: 'Tratados y Acuerdos Vinculantes',
    badge: 'Derecho Interestelar',
    accent: 'blue',
    borderColor: 'border-blue-500/20',
    headerBg: 'from-blue-950/40 to-transparent',
    headerText: 'text-blue-300',
    actions: [
      {
        id: 'non_aggression',
        name: 'Pacto de No Agresión',
        shortDesc: 'Garantía mutua de cese de hostilidades fronterizas',
        icon: '📜',
        costDesc: '15 Inf · 10K Met · 5K Cris',
        impact: '+15 Relación · Paz Mutua',
        impactColor: 'text-cyan-400',
        influenceCost: 15,
        resourcesCost: { metal: 10000, crystal: 5000 },
        isPact: true,
        pactKey: 'pna'
      },
      {
        id: 'trade_agreement',
        name: 'Acuerdo Comercial',
        shortDesc: 'Apertura de aduanas y libre tránsito arancelario',
        icon: '🤝',
        costDesc: '15 Influencia',
        impact: '+10 Relación · Comercio',
        impactColor: 'text-emerald-400',
        influenceCost: 15,
        resourcesCost: {},
        isPact: true,
        pactKey: 'trade'
      },
      {
        id: 'research_agreement',
        name: 'Acuerdo de Investigación',
        shortDesc: 'Laboratorios coordinados y avances tecnológicos',
        icon: '🧪',
        costDesc: '20 Influencia',
        impact: '+15 Relación · I+D',
        impactColor: 'text-purple-400',
        influenceCost: 20,
        resourcesCost: {}
      },
      {
        id: 'transit_agreement',
        name: 'Acuerdo de Tránsito',
        shortDesc: 'Permiso de navegación libre en zonas soberanas',
        icon: '🚀',
        costDesc: '10 Influencia',
        impact: '+10 Relación · Vuelo Libre',
        impactColor: 'text-cyan-400',
        influenceCost: 10,
        resourcesCost: {}
      },
      {
        id: 'defense_agreement',
        name: 'Pacto de Defensa Mutua',
        shortDesc: 'Alianza defensiva de respuesta bélica coordinada',
        icon: '🛡️',
        costDesc: '25 Influencia',
        impact: '+20 Relación · Asistencia Militar',
        impactColor: 'text-amber-400',
        influenceCost: 25,
        resourcesCost: {},
        isPact: true,
        pactKey: 'defensivePact'
      }
    ]
  },
  {
    id: 'pressure',
    title: 'Presión y Coerción Estratégica',
    badge: 'Disuasión',
    accent: 'amber',
    borderColor: 'border-amber-500/20',
    headerBg: 'from-amber-950/40 to-transparent',
    headerText: 'text-amber-300',
    actions: [
      {
        id: 'threat',
        name: 'Amenaza Diplomática',
        shortDesc: 'Demostración de fuerza para intimidar al liderazgo',
        icon: '⚠️',
        costDesc: 'Sin Coste Material',
        impact: '-30 Relación · Tensión Bélica',
        impactColor: 'text-amber-400',
        influenceCost: 0,
        resourcesCost: {},
        isHostile: true
      },
      {
        id: 'ultimatum',
        name: 'Ultimátum de Soberanía',
        shortDesc: 'Exigencia taxativa antes de abrir fuego de invasión',
        icon: '🚨',
        costDesc: 'Crisis Máxima',
        impact: '-50 Relación · Riesgo Bélico',
        impactColor: 'text-red-400',
        influenceCost: 0,
        resourcesCost: {},
        isHostile: true
      },
      {
        id: 'embargo',
        name: 'Embargo Comercial',
        shortDesc: 'Clausura de puertos y decomiso de mercancías foráneas',
        icon: '🚫',
        costDesc: 'Bloqueo Portuario',
        impact: '-40 Relación · Cese Mercantil',
        impactColor: 'text-amber-400',
        influenceCost: 0,
        resourcesCost: {},
        isHostile: true
      },
      {
        id: 'sanctions',
        name: 'Sanciones Económicas',
        shortDesc: 'Penalizaciones arancelarias y congelación de activos',
        icon: '🛑',
        costDesc: 'Presión Financiera',
        impact: '-30 Relación · Aislamiento',
        impactColor: 'text-amber-400',
        influenceCost: 0,
        resourcesCost: {},
        isHostile: true
      }
    ]
  },
  {
    id: 'sovereignty',
    title: 'Soberanía, Alianzas y Conflicto',
    badge: 'Poder Imperial',
    accent: 'red',
    borderColor: 'border-red-500/20',
    headerBg: 'from-red-950/40 to-transparent',
    headerText: 'text-red-300',
    actions: [
      {
        id: 'protectorate',
        name: 'Ofrecer Protectorado',
        shortDesc: 'Poner a la facción bajo la tutela y escudo de tu flota',
        icon: '👑',
        costDesc: '30 Influencia',
        impact: '+20 Relación · Subordinación Pacífica',
        impactColor: 'text-purple-400',
        influenceCost: 30,
        resourcesCost: {}
      },
      {
        id: 'vassalage',
        name: 'Demandar Vasallaje',
        shortDesc: 'Exigir subordinación imperial y entrega tributaria',
        icon: '🔗',
        costDesc: '50 Influencia',
        impact: '-20 Relación · Sometimiento',
        impactColor: 'text-amber-400',
        influenceCost: 50,
        resourcesCost: {}
      },
      {
        id: 'break_relations',
        name: 'Ruptura de Relaciones',
        shortDesc: 'Expulsión de diplomáticos y anulación de tratados',
        icon: '💔',
        costDesc: 'Cierre Bilateral',
        impact: '-30 Relación · Anula Tratados',
        impactColor: 'text-red-400',
        influenceCost: 0,
        resourcesCost: {},
        isDangerous: true
      }
    ]
  }
];

export const DiplomacyActionConsole = ({
  activeContact,
  handleDiplomaticAction,
  executeWarToggle,
  influence = 0,
  resources = {}
}) => {
  const [filterCategory, setFilterCategory] = useState('all');

  const isWar = (activeContact?.relation || 0) <= -90;
  const isPnaActive = Boolean(activeContact?.pna || activeContact?.activePacts?.includes('pna') || activeContact?.activePacts?.includes('non_aggression'));
  const isTradeActive = Boolean(activeContact?.trade || activeContact?.activePacts?.includes('trade') || activeContact?.activePacts?.includes('trade_treaty') || activeContact?.activePacts?.includes('trade_agreement'));
  const isDefenseActive = Boolean(activeContact?.defensivePact || activeContact?.activePacts?.includes('defense_agreement') || activeContact?.activePacts?.includes('defensive_pact'));

  const checkAffordable = (action) => {
    if (influence < (action.influenceCost || 0)) return false;
    const rc = action.resourcesCost || {};
    if ((rc.metal || 0) > (resources.metal || 0)) return false;
    if ((rc.crystal || 0) > (resources.crystal || 0)) return false;
    if ((rc.deuterium || 0) > (resources.deuterium || 0)) return false;
    return true;
  };

  const getPactStatus = (actionId) => {
    if (actionId === 'non_aggression' && isPnaActive) return 'ACTIVO';
    if (actionId === 'trade_agreement' && isTradeActive) return 'ACTIVO';
    if (actionId === 'defense_agreement' && isDefenseActive) return 'ACTIVO';
    return null;
  };

  const visibleCategories = filterCategory === 'all'
    ? ACTION_CATEGORIES
    : ACTION_CATEGORIES.filter(c => c.id === filterCategory);

  return (
    <div className="space-y-3 pt-2">
      {/* Encabezado Principal y Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              Consola de Acciones y Tratados Diplomáticos
            </h4>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Interacciones oficiales con {activeContact?.name || 'la civilización receptora'}
          </p>
        </div>

        {/* Pestañas de categoría rápida */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterCategory('cooperation')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === 'cooperation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Cooperación
          </button>
          <button
            onClick={() => setFilterCategory('treaties')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === 'treaties'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Tratados
          </button>
          <button
            onClick={() => setFilterCategory('pressure')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === 'pressure'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Presión
          </button>
          <button
            onClick={() => setFilterCategory('sovereignty')}
            className={`px-2 py-1 rounded text-[10px] font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === 'sovereignty'
                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                : 'bg-black/30 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Soberanía
          </button>
        </div>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {visibleCategories.map(cat => (
          <div
            key={cat.id}
            className={`p-3 bg-[#060a17]/80 border ${cat.borderColor} rounded-xl space-y-2 flex flex-col justify-between shadow-lg relative overflow-hidden`}
          >
            {/* Header de Categoría */}
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
              <span className={`text-[11px] font-bold font-mono uppercase tracking-wide ${cat.headerText} flex items-center gap-1.5`}>
                <span>{cat.title}</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                {cat.badge}
              </span>
            </div>

            {/* Grid de Botones de Acción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.actions.map(action => {
                const affordable = checkAffordable(action);
                const pactStatus = getPactStatus(action.id);
                const isActionActive = Boolean(pactStatus);

                return (
                  <button
                    key={action.id}
                    onClick={() => handleDiplomaticAction(action.id)}
                    disabled={isActionActive}
                    className={`group relative p-2.5 rounded-lg border text-left font-mono transition-all flex flex-col justify-between select-none cursor-pointer ${
                      isActionActive
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 opacity-90 cursor-default'
                        : action.isDangerous
                        ? 'bg-red-950/30 hover:bg-red-900/40 border-red-500/30 hover:border-red-400 text-red-300'
                        : action.isHostile
                        ? 'bg-amber-950/25 hover:bg-amber-900/35 border-amber-500/25 hover:border-amber-400/50 text-amber-300'
                        : 'bg-[#090e21] hover:bg-[#111938] border-white/10 hover:border-cyan-500/50 text-slate-200'
                    } ${!affordable && !isActionActive ? 'opacity-50 hover:border-red-500/40' : ''}`}
                    title={`${action.name}: ${action.shortDesc} (${action.costDesc})`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-sm">{action.icon}</span>
                          <span className="text-[11px] font-bold truncate text-white group-hover:text-cyan-300 transition-colors">
                            {action.name}
                          </span>
                        </div>
                        {isActionActive && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            VIGENTE
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 line-clamp-1 leading-tight mb-2">
                        {action.shortDesc}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[8.5px]">
                      <span className="text-slate-400 truncate">
                        {action.costDesc}
                      </span>
                      <span className={`font-semibold ${action.impactColor} whitespace-nowrap`}>
                        {action.impact}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Botón especial de Guerra / Paz dentro de Soberanía */}
              {cat.id === 'sovereignty' && (
                <button
                  onClick={executeWarToggle}
                  className={`p-2.5 rounded-lg border font-mono transition-all flex flex-col justify-between select-none cursor-pointer text-left ${
                    isWar
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-red-950/50 hover:bg-red-900/60 border-red-500/60 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{isWar ? '🕊️' : '⚔️'}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          {isWar ? 'Proponer Paz' : 'Declarar Guerra'}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                        isWar ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                      }`}>
                        {isWar ? 'HOSTIL' : 'CRÍTICO'}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-300 line-clamp-1 leading-tight mb-2">
                      {isWar ? 'Restablecer el cese al fuego formal' : 'Abrir fuego total y romper diplomacia'}
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8.5px]">
                    <span className="text-slate-300">
                      {isWar ? 'Req. Reputación > -40' : 'Aviso Bélico General'}
                    </span>
                    <span className={`font-bold ${isWar ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isWar ? '+10 Rep · Neutral' : '-20 Rep · Hostil -100'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiplomacyActionConsole;
