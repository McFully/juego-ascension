// Ministry Specific programs configuration (4 detailed levels per ministry)
export const MINISTRY_PROGRAMS = {
  economy: [
    { id: 'mining_subsidy', name: 'Subsidios de Extracción Minera', desc: 'Financia taladros orbitales. Aumenta producción de metales.', baseCost: { metal: 10000, crystal: 5000 }, bonusText: '+10% Producción por nivel' },
    { id: 'trade_network', name: 'Red Comercial Sub-espacial', desc: 'Rutas comerciales hiperlumínicas automáticas.', baseCost: { metal: 15000, deuterium: 5000 }, bonusText: '+8% Ganancia de Créditos por nivel' },
    { id: 'industrial_zones', name: 'Zonas Francas Industriales', desc: 'Incentiva fábricas locales en las colonias.', baseCost: { crystal: 12000, deuterium: 8000 }, bonusText: '-6% Coste de Edificaciones por nivel' },
    { id: 'agri_synth', name: 'Complejos Agro-sintéticos', desc: 'Biosferas automatizadas de alta densidad alimentaria.', baseCost: { metal: 8000, crystal: 8000 }, bonusText: '+5% Crecimiento de Población por nivel' }
  ],
  defense: [
    { id: 'armour_plating', name: 'Modernización de Blindajes', desc: 'Revestimientos pesados para cascos navales.', baseCost: { metal: 12000, deuterium: 4000 }, bonusText: '+8% HP de Naves por nivel' },
    { id: 'weapon_opt', name: 'Optimización de Cañones Láser', desc: 'Focalizadores de plasma de alta estabilidad.', baseCost: { crystal: 10000, deuterium: 6000 }, bonusText: '+10% Ataque de Naves por nivel' },
    { id: 'shield_freq', name: 'Moduladores de Escudo Cuánticos', desc: 'Previene penetración de proyectiles cinéticos.', baseCost: { crystal: 15000, influence: 50 }, bonusText: '+8% Escudos por nivel' },
    { id: 'def_grid', name: 'Red de Defensa Satelital', desc: 'Satélites de defensa orbitales interconectados.', baseCost: { metal: 20000, crystal: 10000 }, bonusText: '+12% Fuerza de Defensas por nivel' }
  ],
  science: [
    { id: 'neural_quantum', name: 'Red Neuronal Cuántica', desc: 'Investigación computacional avanzada.', baseCost: { crystal: 8000, deuterium: 8000 }, bonusText: '+15% Velocidad de I+D por nivel' },
    { id: 'reactor_tech', name: 'Fusión de Helio-3 Avanzada', desc: 'Reactores de pulso magnético de alto rendimiento.', baseCost: { metal: 10000, deuterium: 12000 }, bonusText: '+10% Energía de Colonias por nivel' },
    { id: 'physics_lab', name: 'Laboratorio de Micro-gravedad', desc: 'Física aplicada al motor de salto e hiper-propulsores.', baseCost: { crystal: 12000, deuterium: 10000 }, bonusText: '+8% Velocidad de Flota por nivel' },
    { id: 'nanobot_reconstruct', name: 'Nanobots de Reparación', desc: 'Algoritmos auto-reparadores integrados en el chasis.', baseCost: { metal: 18000, crystal: 12000 }, bonusText: '+5% Auto-reparación en combate por nivel' }
  ],
  culture: [
    { id: 'galas_propaganda', name: 'Galas de Prestigio Estelar', desc: 'Ceremonias de gala para el senado galáctico.', baseCost: { crystal: 5000, influence: 20 }, bonusText: '+20 Reputación Galáctica por nivel' },
    { id: 'social_monuments', name: 'Monumentos Federales', desc: 'Estatues gigantescas de unidad en las metrópolis.', baseCost: { metal: 20000, crystal: 10000 }, bonusText: '+10% Unidad Social por nivel' },
    { id: 'heritage_broadcast', name: 'Transmisor de Identidad Nova', desc: 'Canales de hiper-red de alta frecuencia cultural.', baseCost: { metal: 12000, influence: 30 }, bonusText: '+12% Influencia por ciclo por nivel' },
    { id: 'immigrant_center', name: 'Políticas de Puertas Abiertas', desc: 'Atrae refugiados del borde exterior.', baseCost: { metal: 10000, crystal: 8000 }, bonusText: '+10% Migración interestelar por nivel' }
  ],
  infra: [
    { id: 'orbital_roads', name: 'Super-Autovías Orbitales', desc: 'Logística orbital integrada y automatizada.', baseCost: { metal: 12000, crystal: 6000 }, bonusText: '-10% Tiempo de Edificación por nivel' },
    { id: 'cargo_drones', name: 'Enjambres de Drones de Carga', desc: 'Distribución y almacenamiento automatizado.', baseCost: { metal: 10000, crystal: 10000 }, bonusText: '+15% Capacidad de Carga por nivel' },
    { id: 'nanite_scaffolding', name: 'Andamiaje de Nanitas', desc: 'Constructores microscópicos inteligentes.', baseCost: { crystal: 16000, deuterium: 8000 }, bonusText: '-8% Coste de Instalaciones por nivel' },
    { id: 'deep_mines', name: 'Técnicas de Minería Profunda', desc: 'Pozos térmicos para acceder al núcleo planetario.', baseCost: { metal: 25000, deuterium: 12000 }, bonusText: '+12% Rendimiento de Minas por nivel' }
  ],
  intel: [
    { id: 'hawk_eye', name: 'Operación Ojo de Halcón', desc: 'Satélites espía y decodificadores tácticos.', baseCost: { crystal: 8000, influence: 20 }, bonusText: '+15% Defensa frente a espionaje por nivel' },
    { id: 'sleeper_net', name: 'Red de Células Durmientes', desc: 'Infiltración pasiva en las capitales de IAs.', baseCost: { crystal: 12000, deuterium: 8000 }, bonusText: '+10% Intel Máxima de IAs por nivel' },
    { id: 'quantum_scrambler', name: 'Inhibidores de Red Cuántica', desc: 'Interfiere transmisiones sub-espacio enemigas.', baseCost: { metal: 15000, crystal: 10000 }, bonusText: '+15% Detección de flotas hostiles por nivel' },
    { id: 'black_ops', name: 'Operaciones Encubiertas', desc: 'Cursos de entrenamiento para comandos de infiltración.', baseCost: { crystal: 18000, deuterium: 12000 }, bonusText: '+8% Éxito de misiones de sabotaje por nivel' }
  ]
};

import React, { useState } from 'react';
import { MinisterCandidateModal } from '../components/government/MinisterCandidateModal';
import { MinistryPerformanceMetrics } from '../components/government/MinistryPerformanceMetrics';

export const GovernmentPage = ({ state, dispatch, S }) => {
  const [selectedMinistry, setSelectedMinistry] = useState('economy');
  const [candidateModal, setCandidateModal] = useState(null); // { ministryId, candidates }
  
  const currentPlanet = state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0];
  const planetResources = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const playerInfluence = state.influence || 0;

  const ministries = currentPlanet?.ministries || state.ministries || {};
  const upgrades = state.ministryUpgrades || {};

  const fmt = (n) => new Intl.NumberFormat().format(Math.floor(n));

  // Default ministry configuration with fallback values
  const getMinistryState = (id) => {
    const defaultStates = {
      economy: { taxRate: 0.1, tradeSubsidies: false, treasury: 1000, gdp: 2500000, inflation: 0.02, automationEnabled: false },
      defense: { conscriptionLevel: 'volunteer', combatDoctrine: 'balanced', patrolIntensity: 1, readyLevel: 85, automationEnabled: false },
      science: { researchGrants: 0.05, techFocus: 'general', experimentalProjects: [], automationEnabled: false },
      culture: { propagandaLevel: 1, socialUnity: 80, eventsActive: [], automationEnabled: false },
      infra: { maintenanceBudget: 0.05, logisticsLevel: 1, orbitalNetwork: false, automationEnabled: false },
      intel: { espionageBudget: 0.1, counterIntelLevel: 1, sleeperCells: [], automationEnabled: false }
    };
    return {
      ...defaultStates[id],
      ...(ministries[id] || {}),
      minister: ministries[id]?.minister || null,
      directives: ministries[id]?.directives || {},
    };
  };

  // Global candidates data for hiring ministers
  const CANDIDATES_POOL = {
    economy: [
      { name: 'Aritz Elkar', trait: 'Industrialista Pragmático', effect: '+15% Producción de Metal en colonias, -5% Felicidad', icon: '👤', bonus: 'metalProd', desc: 'Ex-CEO del Sindicato Minero de Altair.' },
      { name: 'Valeria Rossi', trait: 'Financiera Estelar', effect: '+20% Créditos Generados, +10% Coste Logístico', icon: '👩‍💼', bonus: 'creditsProd', desc: 'Anterior Directora del Banco de Créditos de Centauri.' }
    ],
    defense: [
      { name: 'Gral. Marcus Cole', trait: 'Halcon Táctico', effect: '+12% Ataque de Flotas, +15% Coste de Combustible', icon: '👮', bonus: 'fleetAttack', desc: 'Héroe de la Batalla de Nova-6.' },
      { name: 'Alm. Roger Vance', trait: 'Estratega Logístico', effect: '-15% Coste de Naves, +5% Tiempo de Construcción', icon: '👨‍✈️', bonus: 'shipCostReduction', desc: 'Ingeniero militar veterano del Almirantazgo.' }
    ],
    science: [
      { name: 'Dra. Valerie Vance', trait: 'Investigadora Cuántica', effect: '+15% Velocidad de Investigación, +10% Coste de Deuterio', icon: '👩‍🔬', bonus: 'researchSpeed', desc: 'Premio Nobel Galáctico en Astrofísica Cuántica.' },
      { name: 'Prof. Kaelen Zenith', trait: 'Red Neuronal Artificial', effect: '+25% Investigación de Fusión, -5% Escudos de Naves', icon: '🤖', bonus: 'fusionResearch', desc: 'Holograma de Inteligencia Colectiva Zenith.' }
    ],
    culture: [
      { name: 'Lady Lyra Solar', trait: 'Diplomática de Alta Cuna', effect: '+25% Generación de Influencia Galáctica', icon: '👸', bonus: 'influenceGain', desc: 'Embajadora plenipotenciaria del Imperio Solaris.' },
      { name: 'Director Varis', trait: 'Maestro de Ceremonias', effect: '+15% Unidad Social, -5% Producción Colonial', icon: '🎭', bonus: 'socialUnity', desc: 'Famoso dramaturgo y cineasta de la República.' }
    ],
    infra: [
      { name: 'Elena Rostova', trait: 'Arquitecta de Megatrabajos', effect: '-12% Tiempo de Edificación de Estructuras', icon: '👷‍♀️', bonus: 'buildTime', desc: 'Directora del megaproyecto de las Autovías Orbitales.' },
      { name: 'Logístico Kaelen', trait: 'Coordinador de Rutas', effect: '+20% Capacidad de Carga de Naves', icon: '🚛', bonus: 'cargoCapacity', desc: 'Ex-jefe de logística de la Federación Helios.' }
    ],
    intel: [
      { name: 'Serafina Umbra', trait: 'Sombra del Vacío', effect: '+25% Eficacia de Contra-espionaje, -10% Reputación', icon: '👤', bonus: 'counterEspionage', desc: 'Agente encubierta del Protectorado Umbra.' },
      { name: 'Sombra 01', trait: 'Analista de Big Data', effect: '+20% Velocidad de Espionaje Activo, +10% Consumo de Energía', icon: '💻', bonus: 'activeEspionage', desc: 'IA renegada dedicada al descifrado sub-espacial.' }
    ]
  };

  // Ministry Specific Directives (Togglable Policies)
  const MINISTRY_DIRECTIVES = {
    economy: [
      { id: 'dir_pyme', name: 'Fomento a Colonos Autónomos', desc: '+10% Producción de Cristal, -5% Ingresos Tributarios', cost: '10 ptos Influencia' },
      { id: 'dir_heavy', name: 'Decreto de Industria Pesada', desc: '+15% Producción de Metal, -10% Velocidad de I+D', cost: '15 ptos Influencia' },
      { id: 'dir_tariff', name: 'Aranceles del Borde Exterior', desc: '+20% Ingresos de Mercado, -15 Relación con facciones', cost: '20 ptos Influencia' }
    ],
    defense: [
      { id: 'dir_conscript', name: 'Ley de Leva Militar Obligatoria', desc: '-15% Tiempo de Caza, -5% Producción colonial', cost: '15 ptos Influencia' },
      { id: 'dir_doctrine', name: 'Doctrina de Fuego Concentrado', desc: '+10% Ataque de Flota, -10% HP de Naves', cost: '20 ptos Influencia' },
      { id: 'dir_patrol', name: 'Patrullas Sistemáticas', desc: '+25% Éxito contra piratas, +50 créditos/h coste', cost: '10 ptos Influencia' }
    ],
    science: [
      { id: 'dir_ai_trust', name: 'Comisión de IA Autogestionada', desc: '+15% Eficiencia de laboratorios, -10% Seguridad del Sistema', cost: '10 ptos Influencia' },
      { id: 'dir_black_project', name: 'Inversión en Proyectos Negros', desc: '+20% Probabilidad de tecnologías raras, +15% coste de Deuterio', cost: '25 ptos Influencia' },
      { id: 'dir_open_source', name: 'Ciencia Compartida Federal', desc: '+10% Relación con IAs Democráticas, +5% tiempo I+D propio', cost: '15 ptos Influencia' }
    ],
    culture: [
      { id: 'dir_censorship', name: 'Control de Transmisión Pública', desc: '+10% Unidad Social, -10% Producción de Cristal', cost: '10 ptos Influencia' },
      { id: 'dir_holiday', name: 'Festival Federal Anual', desc: '+15% Felicidad de Colonias, -100 Créditos por ciclo', cost: '20 ptos Influencia' },
      { id: 'dir_propaganda', name: 'Campaña de Patriotismo Nova', desc: '+15% Ganancia de Influencia, -15 Relaciones Exteriores', cost: '15 ptos Influencia' }
    ],
    infra: [
      { id: 'dir_green_build', name: 'Plan de Bio-Cúpulas Integradas', desc: '+10% Crecimiento de Población, +5% Tiempo de Edificación', cost: '10 ptos Influencia' },
      { id: 'dir_rapid', name: 'Protocolos de Montaje Acelerado', desc: '-15% Tiempo de Construcción, +10% Coste de Metal', cost: '20 ptos Influencia' },
      { id: 'dir_grid_opt', name: 'Optimización de Red de Fusión', desc: '+15% Energía generada, -5% Producción de Deuterio', cost: '15 ptos Influencia' }
    ],
    intel: [
      { id: 'dir_wiretap', name: 'Hiper-Red de Escucha Ciudadana', desc: '+15% Contra-espionaje, -5% Unidad Social', cost: '15 ptos Influencia' },
      { id: 'dir_blackmail', name: 'Chantajes Diplomáticos Activos', desc: '+15% Probabilidad de acuerdo comercial, -10 Reputación', cost: '25 ptos Influencia' },
      { id: 'dir_counter', name: 'Campaña de Falsa Información', desc: '+20% Defensa contra espionaje, +10% Coste de Inteligencia', cost: '15 ptos Influencia' }
    ]
  };

  const currentMinState = getMinistryState(selectedMinistry);
  const currentMinUpgrades = upgrades[selectedMinistry] || {};

  const handleAppointMinister = (candidate) => {
    dispatch({ type: 'APPOINT_MINISTER', ministryId: candidateModal.ministryId, minister: candidate, planetId: currentPlanet?.id });
    setCandidateModal(null);
    if (window.playSfx) window.playSfx('click');
  };

  const handleToggleDirective = (directiveId) => {
    dispatch({ type: 'TOGGLE_MINISTRY_DIRECTIVE', ministryId: selectedMinistry, directiveId, planetId: currentPlanet?.id });
    if (window.playSfx) window.playSfx('click');
  };

  const handleUpgradeProgram = (program) => {
    const lvl = currentMinUpgrades[program.id] || 0;
    if (lvl >= 5) return;

    // Calculate cost based on level (exponent scale)
    const cost = {};
    Object.entries(program.baseCost).forEach(([resId, val]) => {
      cost[resId] = Math.floor(val * Math.pow(1.8, lvl));
    });

    // Check affordability
    let canBuy = true;
    if (cost.influence && playerInfluence < cost.influence) canBuy = false;
    if (cost.metal && planetResources.metal < cost.metal) canBuy = false;
    if (cost.crystal && planetResources.crystal < cost.crystal) canBuy = false;
    if (cost.deuterium && planetResources.deuterium < cost.deuterium) canBuy = false;

    if (!canBuy) {
      if (window.playSfx) window.playSfx('warn');
      return;
    }

    if (window.playSfx) window.playSfx('success');
    dispatch({
      type: 'MINISTRY_PROJECT',
      ministryId: selectedMinistry,
      cost,
      effect: {
        programId: program.id,
        level: lvl + 1
      }
    });
  };

  const renderMinisterCard = (minId, name) => {
    const minState = getMinistryState(minId);
    const hasAutomation = ['economy', 'science', 'infra', 'defense', 'culture', 'intel'].includes(minId);
    return (
      <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-[var(--ue-accent)]/20 transition-all">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--ue-accent)]/10 border border-[var(--ue-accent)]/20 flex items-center justify-center text-xl">
              {minState.minister ? minState.minister.icon : '❓'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">{name}</div>
              <div className="text-xs font-bold text-white truncate">{minState.minister ? minState.minister.name : 'Puesto Vacante'}</div>
            </div>
          </div>

          {/* Toggle Automation (pestillo) */}
          {hasAutomation && (
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">🤖 Auto-gestión</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'TOGGLE_MINISTRY_AUTOMATION', ministryId: minId });
                  if (window.playSfx) window.playSfx('click');
                }}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${minState.automationEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 border border-white/10 justify-start'}`}
                title="Activar/Desactivar Auto-gestión"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md transform duration-200" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px] text-slate-400 italic truncate max-w-[100px]">
            {minState.minister ? minState.minister.trait : 'No hay bonificaciones'}
          </span>
          <button 
            onClick={() => setCandidateModal({ ministryId: minId, candidates: CANDIDATES_POOL[minId] })}
            className="py-1 px-2 text-[9px] font-bold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-300 hover:text-black rounded border border-cyan-400/20 transition-all uppercase"
          >
            {minState.minister ? 'Reemplazar' : 'Investir'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--ue-accent)]/10 border border-[var(--ue-accent)]/30 flex items-center justify-center text-[var(--ue-accent)]">
            <span className="material-symbols-outlined text-3xl animate-pulse">account_balance</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Gabinete Federal de la República</h2>
            <p className="text-xs text-slate-400 font-mono uppercase">Administración y Autogestión Territorial</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {state.planets?.length > 1 && (
            <div className="glass-deep px-3 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-2">
              <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">Planeta / Colonia:</span>
              <select
                value={currentPlanet?.id}
                onChange={e => dispatch({ type: 'SET_CURRENT_PLANET', planetId: e.target.value })}
                className="bg-black/60 text-white font-mono text-xs border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-cyan-400"
              >
                {state.planets.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.isHome ? '🪐' : '🛰️'} {p.name} ({p.galaxy}:{p.system}:{p.position})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="glass-deep px-4 py-2 rounded-lg border border-white/5">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Influencia Galáctica</span>
            <span className="text-purple-400 font-mono font-bold">{fmt(playerInfluence)} ptos</span>
          </div>
          <div className="glass-deep px-4 py-2 rounded-lg border border-white/5">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Reputación Galáctica</span>
            <span className={`font-mono font-bold ${(state.reputation || 0) >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>{fmt(state.reputation || 0)}</span>
          </div>
        </div>
      </header>

      {/* 900% Expanded Cabinet Boardroom Layout */}
      <section className="bg-black/35 rounded-2xl border border-white/5 p-6 backdrop-blur-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none -mr-32 -mt-32 blur-[120px] rounded-full bg-cyan-500"></div>
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--ue-accent)]">groups</span>
              Consejo de Ministros ({currentPlanet?.name || 'Local'})
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Gabinete de autogestión específico para este planeta o colonia</p>
          </div>
          <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Sesión Autónoma</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {renderMinisterCard('economy', '💼 Min. de Economía')}
          {renderMinisterCard('defense', '🛡️ Min. de Defensa')}
          {renderMinisterCard('science', '🔬 Min. de Ciencia')}
          {renderMinisterCard('culture', '🎭 Min. de Cultura')}
          {renderMinisterCard('infra', '🏗️ Min. de Infraestructura')}
          {renderMinisterCard('intel', '🕵️ Min. de Inteligencia')}
        </div>
      </section>

      {/* Main Boardroom Workspace: Sub-navigation & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar selection */}
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: 'economy', name: 'Economía', icon: 'payments', color: 'text-amber-400', desc: 'Impuestos y Comercio' },
            { id: 'defense', name: 'Defensa', icon: 'security', color: 'text-red-400', desc: 'Doctrinas y Escudos' },
            { id: 'science', name: 'Ciencia', icon: 'biotech', color: 'text-cyan-400', desc: 'Becas I+D e Innovación' },
            { id: 'culture', name: 'Cultura', icon: 'theater_comedy', color: 'text-purple-400', desc: 'Unidad y Prestigio' },
            { id: 'infra', name: 'Infraestructura', icon: 'construction', color: 'text-emerald-400', desc: 'Logística y Minas' },
            { id: 'intel', name: 'Inteligencia', icon: 'visibility', color: 'text-blue-400', desc: 'Espionaje y Criptoanálisis' },
            { id: 'council', name: 'Consejo Galáctico', icon: 'gavel', color: 'text-emerald-500', desc: 'Votos y Resoluciones' }
          ].map(min => (
            <button
              key={min.id}
              onClick={() => { setSelectedMinistry(min.id); if (window.playSfx) window.playSfx('click'); }}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 group ${
                selectedMinistry === min.id 
                ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                : 'bg-black/30 border-white/5 hover:border-white/20'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${min.color}`}>{min.icon}</span>
              <div className="text-left">
                <div className="text-xs font-bold text-white uppercase">{min.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{min.desc}</div>
              </div>
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 space-y-6">
          {selectedMinistry === 'council' ? (
            <div className="bg-black/40 p-8 rounded-2xl border border-white/5 backdrop-blur-xl text-center space-y-4">
              <span className="material-symbols-outlined text-6xl text-emerald-400">gavel</span>
              <h3 className="text-xl font-black text-white uppercase">Consejo Galáctico Interplanetario</h3>
              <p className="text-sm text-slate-400 max-w-lg mx-auto font-mono">
                Las resoluciones federales afectan el estatus diplomático y comercial de todo tu imperio y sus colonias.
              </p>
            </div>
          ) : (
            <div className="bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-xl space-y-6">
              {/* Department Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[var(--ue-accent)] text-2xl">
                    {selectedMinistry === 'economy' && 'payments'}
                    {selectedMinistry === 'defense' && 'security'}
                    {selectedMinistry === 'science' && 'biotech'}
                    {selectedMinistry === 'culture' && 'theater_comedy'}
                    {selectedMinistry === 'infra' && 'construction'}
                    {selectedMinistry === 'intel' && 'visibility'}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                      Ministerio de {selectedMinistry.toUpperCase()} ({currentPlanet?.name || 'Local'})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Administrado por: {currentMinState.minister ? currentMinState.minister.name : 'Puesto Vacante (Falta Ministro)'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {['economy', 'science', 'infra', 'defense', 'culture', 'intel'].includes(selectedMinistry) && (
                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1 rounded-xl">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">Auto-gestión en {currentPlanet?.name}</span>
                      <button
                        onClick={() => {
                          dispatch({ type: 'TOGGLE_MINISTRY_AUTOMATION', ministryId: selectedMinistry, planetId: currentPlanet?.id });
                          if (window.playSfx) window.playSfx('click');
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center ${currentMinState.automationEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 border border-white/10 justify-start'}`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                  )}
                  {currentMinState.minister && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 uppercase tracking-widest">Garante Activo</span>
                  )}
                </div>
              </div>

                  {/* Tax Rate Slider for Economy Ministry */}
                  {selectedMinistry === 'economy' && (
                    <div className="mb-4 p-4 glass-deep rounded-xl border border-amber-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">💰 Tasa de Impuestos en {currentPlanet?.name}</label>
                        <span className="text-sm font-mono font-bold text-amber-300">{(currentMinState.taxRate * 100).toFixed(0)}%</span>
                      </div>
                      <input type="range" min="0" max="50" value={Math.round((currentMinState.taxRate || 0) * 100)}
                        onChange={e => dispatch({ type: 'UPDATE_MINISTRY_POLICY', ministry: 'economy', key: 'taxRate', value: parseInt(e.target.value) / 100, planetId: currentPlanet?.id })}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-amber-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>0% (Máxima producción)</span>
                        <span>50% (Máxima recaudación)</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                        {currentMinState.taxRate < 0.1 ? '✅ Producción casi al máximo. La economía florece.' :
                         currentMinState.taxRate < 0.25 ? '📊 Tipo moderado. Balance producción/recaudación aceptable.' :
                         currentMinState.taxRate < 0.4 ? '⚠️ Impuestos elevados. La producción se resiente pero el tesoro crece.' :
                         '🔴 Impuestos muy altos. La productividad cae drásticamente.'}
                      </p>
                    </div>
                  )}

                  {/* Department Panels: Left: Upgrade Programs / Right: Stats & Directives */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Upgrade Programs (4 multi-level upgrade programs) */}
                <div className="xl:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Programas de Inversión Pública (Mejoras de Nivel)</h4>
                  <div className="space-y-3">
                    {MINISTRY_PROGRAMS[selectedMinistry].map(prog => {
                      const lvl = currentMinUpgrades[prog.id] || 0;
                      
                      // Calculate dynamic level cost
                      const cost = {};
                      Object.entries(prog.baseCost).forEach(([resId, val]) => {
                        cost[resId] = Math.floor(val * Math.pow(1.8, lvl));
                      });

                      // Check affordable
                      let canBuy = true;
                      if (cost.influence && playerInfluence < cost.influence) canBuy = false;
                      if (cost.metal && planetResources.metal < cost.metal) canBuy = false;
                      if (cost.crystal && planetResources.crystal < cost.crystal) canBuy = false;
                      if (cost.deuterium && planetResources.deuterium < cost.deuterium) canBuy = false;

                      return (
                        <div key={prog.id} className="bg-black/25 border border-white/5 hover:border-white/10 rounded-xl p-3.5 space-y-2 transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold text-white uppercase">{prog.name}</div>
                              <p className="text-[10px] text-slate-400 mt-1">{prog.desc}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Progreso</span>
                              <span className="text-[10px] font-bold text-[var(--ue-accent)] font-mono">Nivel {lvl} / 5</span>
                            </div>
                          </div>

                          {/* Level indicator ticks */}
                          <div className="flex gap-1 h-1.5 my-2">
                            {[1, 2, 3, 4, 5].map(step => (
                              <div key={step} className={`flex-1 rounded-full ${step <= lvl ? 'bg-[var(--ue-accent)] shadow-[0_0_6px_rgba(34,211,238,0.4)]' : 'bg-white/10'}`} />
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                            <div className="flex gap-2.5 items-center">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Coste:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(cost).map(([resId, val]) => (
                                  <span key={resId} className="text-[9px] font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    {resId === 'metal' && `⛏️ ${fmt(val)}`}
                                    {resId === 'crystal' && `💎 ${fmt(val)}`}
                                    {resId === 'deuterium' && `⚗️ ${fmt(val)}`}
                                    {resId === 'influence' && `✨ ${fmt(val)} ptos`}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {lvl >= 5 ? (
                              <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Completo</span>
                            ) : (
                              <button
                                onClick={() => handleUpgradeProgram(prog)}
                                disabled={!canBuy}
                                className={`py-1 px-3 text-[10px] font-bold uppercase rounded transition-all ${
                                  canBuy 
                                  ? 'bg-[var(--ue-accent)] text-black hover:bg-cyan-300' 
                                  : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                                }`}
                              >
                                Financiar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Directives & Custom Stats */}
                <div className="xl:col-span-5 space-y-5">
                  <MinistryPerformanceMetrics
                    selectedMinistry={selectedMinistry}
                    currentPlanet={currentPlanet}
                    currentMinUpgrades={currentMinUpgrades}
                    currentMinState={currentMinState}
                    planetResources={planetResources}
                    fmt={fmt}
                    dispatch={dispatch}
                  />

                  {/* Togglable Directives (Policies) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Directrices Departamentales Activas</h4>
                    <div className="space-y-2">
                      {MINISTRY_DIRECTIVES[selectedMinistry].map(dir => {
                        const active = currentMinState.directives[dir.id] || false;
                        return (
                          <div 
                            key={dir.id}
                            onClick={() => handleToggleDirective(dir.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              active 
                              ? 'bg-[var(--ue-accent)]/10 border-[var(--ue-accent)]/45' 
                              : 'bg-black/25 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="pr-3">
                              <div className="text-xs font-bold text-white">{dir.name}</div>
                              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{dir.desc}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[8px] font-mono text-slate-500 bg-white/5 px-1 rounded border border-white/5">{dir.cost}</span>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${active ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-white/20 bg-black/40'}`}>
                                {active && <span className="text-[9px] font-black">✓</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Candidate Modal Overlay for Investing Ministers */}
      <MinisterCandidateModal
        candidateModal={candidateModal}
        setCandidateModal={setCandidateModal}
        handleAppointMinister={handleAppointMinister}
      />
    </div>
  );
};