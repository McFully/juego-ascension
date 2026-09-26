import { MINISTRY_PROGRAMS } from '../data/ministriesData.js';
export { MINISTRY_PROGRAMS };

import React, { useState } from 'react';
import { MinisterCandidateModal } from '../components/government/MinisterCandidateModal';
import { MinistryPerformanceMetrics } from '../components/government/MinistryPerformanceMetrics';
import { CANDIDATES_POOL, MINISTRY_DIRECTIVES } from '../data/governmentPoliciesData.js';
import { playVoice, playMinistryMusic, stopMinistryMusic } from '../audio.js';

import { ImperialCommandHub } from '../components/government/ImperialCommandHub';
import { ImperialCouncilCabinet } from '../components/government/council/ImperialCouncilCabinet';
import { ImperialSenateView } from '../components/government/council/ImperialSenateView';
import { FederalDistrictView } from '../components/government/FederalDistrictView';
import { MinistryBuildingInterior } from '../components/government/MinistryBuildingInterior';
import { MinistryDeskView } from '../components/government/MinistryDeskView';
import { MinistryBuildingsSection } from '../components/government/MinistryBuildingsSection';
import { MinistryResearchSection } from '../components/government/MinistryResearchSection';
import { GovernmentBreadcrumbs } from '../components/government/GovernmentBreadcrumbs';
import { MINISTRY_METADATA } from '../data/ministryMetadata.js';
export { MINISTRY_METADATA };

export const GovernmentPage = ({
  state,
  dispatch,
  S,
  activeTab,
  setActiveTab,
  onOpenCodex,
  BUILDINGS,
  RESEARCH,
  ItemCard,
  buildingCost,
  calcBuildTime,
  meetsReq,
  buildingProdInfo,
  canAfford,
  GAME_SPEED,
  production,
  researchCost,
  calcResearchTime,
  researchEffectInfo
}) => {
  // Navegación Espacial por Niveles:
  // Nivel 0: Alto Mando Imperial (Hub de Mando y Órganos de Estado)
  // Nivel 1: Distrito Federal Exterior (19 Sedes Ministeriales)
  // Nivel 2: Interior del Edificio Ministerial
  // Nivel 3: Despacho de Acción (Programas, Decretos, Edificios, I+D)
  // Nivel 4: Consejo Imperial de Ministros Supremos (10+ Planetas)
  // Nivel 5: Senado Imperial Interplanetario (10+ Planetas)
  const [navLevel, setNavLevel] = useState(() => {
    if (activeTab === 'imperial_council') return 4;
    if (activeTab === 'imperial_senate') return 5;
    if (activeTab && activeTab.startsWith('ministry_')) return 2;
    if (activeTab === 'government_ministries') return 1;
    return 0; // Alto Mando Imperial por defecto al acceder a gobierno/imperio
  });
  const [activeMinistry, setActiveMinistry] = useState(() => {
    if (activeTab && activeTab.startsWith('ministry_')) {
      return activeTab.replace('ministry_', '');
    }
    return 'economy';
  });
  const [activeSubview, setActiveSubview] = useState('overview'); // 'overview' | 'programs' | 'directives'
  const [candidateModal, setCandidateModal] = useState(null);

  React.useEffect(() => {
    if (activeTab === 'imperial_council') {
      setNavLevel(4);
    } else if (activeTab === 'imperial_senate') {
      setNavLevel(5);
    } else if (activeTab && activeTab.startsWith('ministry_')) {
      const minKey = activeTab.replace('ministry_', '');
      setActiveMinistry(prevMin => {
        if (prevMin !== minKey) {
          setNavLevel(2);
          setActiveSubview('overview');
          return minKey;
        }
        return prevMin;
      });
    } else if (activeTab === 'government_ministries') {
      setNavLevel(1);
    } else if (activeTab === 'government') {
      setNavLevel(0);
    }
  }, [activeTab]);

  // Gestión de música de ministerios: al estar en nivel >= 2 suena el ministerio de forma continua.
  // Solo se detiene al salir del ministerio (navLevel < 2) o al desmontar GovernmentPage.
  const activeMinistryRef = React.useRef(activeMinistry);
  activeMinistryRef.current = activeMinistry;

  React.useEffect(() => {
    if (navLevel >= 2 && activeMinistry) {
      playMinistryMusic(activeMinistry);
    } else {
      stopMinistryMusic(true);
    }
  }, [navLevel >= 2, activeMinistry]);

  React.useEffect(() => {
    return () => {
      // Al salir definitivamente de la página de gobierno, restaurar música de menú
      stopMinistryMusic(true);
    };
  }, []);

  const currentPlanet = state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0];
  const planetResources = currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 };
  const playerInfluence = state.influence || 0;

  const ministries = currentPlanet?.ministries || state.ministries || {};
  const upgrades = state.ministryUpgrades || {};

  const fmt = (n) => new Intl.NumberFormat().format(Math.floor(n));

  const getMinistryState = (id) => {
    const minObj = ministries[id] || {};
    return {
      taxRate: 0.1,
      tradeSubsidies: false,
      treasury: 1000,
      gdp: 2500000,
      inflation: 0.02,
      conscriptionLevel: 'volunteer',
      combatDoctrine: 'balanced',
      patrolIntensity: 1,
      readyLevel: 85,
      researchGrants: 0.05,
      techFocus: 'general',
      experimentalProjects: [],
      propagandaLevel: 1,
      socialUnity: 80,
      eventsActive: [],
      maintenanceBudget: 0.05,
      logisticsLevel: 1,
      orbitalNetwork: false,
      espionageBudget: 0.1,
      counterIntelLevel: 1,
      sleeperCells: [],
      gridEfficiency: 0.95,
      solarFocus: true,
      deuteriumRationing: false,
      rationingLevel: 'standard',
      biosphereScrubbing: true,
      cropBioEngineering: false,
      courtCapacity: 80,
      corruptionIndex: 0.05,
      martialLawActive: false,
      trafficEfficiency: 0.9,
      priorityFreight: true,
      fuelSubsidy: false,
      automationEnabled: false,
      ...minObj,
      minister: minObj.minister || null,
      directives: minObj.directives || {},
    };
  };

  const handleNavigate = (targetLevel, minId = activeMinistry, subview = 'overview') => {
    setNavLevel(targetLevel);
    if (minId) setActiveMinistry(minId);
    setActiveSubview(subview);
    if (targetLevel === 0 && setActiveTab) {
      setActiveTab('government');
    } else if (targetLevel === 1 && setActiveTab) {
      setActiveTab('government_ministries');
    } else if (targetLevel >= 2 && minId && setActiveTab) {
      setActiveTab(`ministry_${minId}`);
    }
    if (window.playSfx) window.playSfx('click');
  };

  const handleEnterMinistry = (minId) => {
    setActiveMinistry(minId);
    setNavLevel(2);
    setActiveSubview('overview');
    if (setActiveTab) setActiveTab(`ministry_${minId}`);

    const mState = getMinistryState(minId);
    if (mState?.minister?.voiceId) {
      playVoice(mState.minister.voiceId);
    } else if (window.playSfx) {
      window.playSfx('click');
    }
  };

  const handleOpenDesk = (subview) => {
    setNavLevel(3);
    setActiveSubview(subview);
    if (window.playSfx) window.playSfx('click');
  };

  const handleAppointMinister = (candidate) => {
    const minId = candidateModal?.ministryId || activeMinistry;
    dispatch({ type: 'APPOINT_MINISTER', ministryId: minId, minister: candidate, planetId: currentPlanet?.id });
    setCandidateModal(null);
    if (candidate?.voiceId) {
      playVoice(candidate.voiceId);
    } else if (window.playSfx) {
      window.playSfx('click');
    }
  };

  const handleToggleDirective = (directiveId) => {
    dispatch({ type: 'TOGGLE_MINISTRY_DIRECTIVE', ministryId: activeMinistry, directiveId, planetId: currentPlanet?.id });
    if (window.playSfx) window.playSfx('click');
  };

  const handleUpgradeProgram = (programOrId, passedCost) => {
    let progObj = typeof programOrId === 'object' ? programOrId : null;
    if (!progObj) {
      const allProgs = MINISTRY_PROGRAMS[activeMinistry] || [];
      progObj = allProgs.find(p => p.id === programOrId);
    }
    if (!progObj) return;

    const currentMinUpgrades = upgrades[activeMinistry] || {};
    const lvl = currentMinUpgrades[progObj.id] || 0;
    if (lvl >= 5) return;

    const cost = passedCost || {};
    if (!passedCost) {
      Object.entries(progObj.baseCost).forEach(([resId, val]) => {
        cost[resId] = Math.floor(val * Math.pow(1.8, lvl));
      });
    }

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
      ministryId: activeMinistry,
      cost,
      effect: {
        programId: progObj.id,
        level: lvl + 1
      }
    });
  };

  const activeMeta = MINISTRY_METADATA[activeMinistry] || MINISTRY_METADATA.economy;
  const currentMinState = getMinistryState(activeMinistry);
  const currentMinUpgrades = upgrades[activeMinistry] || {};

  return (
    <div className="space-y-4 view-enter pb-20">
      {/* Breadcrumbs de Navegación Jerárquica del Gobierno (solo en niveles interiores) */}
      {navLevel > 1 && (
        <GovernmentBreadcrumbs
          currentLevel={navLevel}
          ministryId={activeMinistry}
          subview={activeSubview}
          onNavigate={handleNavigate}
          onBackToEmpire={() => {
            if (setActiveTab) setActiveTab('overview');
            if (window.playSfx) window.playSfx('click');
          }}
          ministryMeta={MINISTRY_METADATA}
          currentPlanet={currentPlanet}
          production={production}
          state={state}
          fmt={fmt}
          minState={currentMinState}
          minister={currentMinState?.minister}
          planetId={currentPlanet?.id}
          onOpenCandidates={() => {
            setCandidateModal({
              ministryId: activeMinistry,
              candidates: CANDIDATES_POOL[activeMinistry] || []
            });
            if (window.playSfx) window.playSfx('click');
          }}
          dispatch={dispatch}
        />
      )}

      {/* LEVEL 0: Alto Mando Imperial - Sede Central de Mando del Imperio */}
      {navLevel === 0 && (
        <ImperialCommandHub
          state={state}
          currentPlanet={currentPlanet}
          production={production}
          fmt={fmt}
          RESEARCH={RESEARCH}
          onEnterMinistries={() => handleNavigate(1)}
          onNavigateTab={(tab) => {
            if (setActiveTab) {
              setActiveTab(tab);
            }
          }}
          onBackToEmpire={() => {
            if (setActiveTab) setActiveTab('overview');
            if (window.playSfx) window.playSfx('click');
          }}
          ministryCount={Object.keys(MINISTRY_METADATA).length}
        />
      )}

      {/* LEVEL 1: Vista Exterior - Avenida de las Sedes Ministeriales */}
      {navLevel === 1 && (
        <FederalDistrictView
          ministryMeta={MINISTRY_METADATA}
          getMinistryState={getMinistryState}
          onEnterMinistry={handleEnterMinistry}
          onBackToEmpire={() => {
            if (setActiveTab) setActiveTab('overview');
            if (window.playSfx) window.playSfx('click');
          }}
          onBackToAltoMando={() => handleNavigate(0)}
          onNavigateToMinistry={(minId) => handleNavigate(2, minId, 'overview')}
          currentPlanet={currentPlanet}
          state={state}
          dispatch={dispatch}
          fmt={fmt}
          production={production}
        />
      )}

      {/* LEVEL 2: Interior del Edificio Ministerial (Atrio Central) */}
      {navLevel === 2 && (
        <div className="space-y-6">
          <MinistryBuildingInterior
            ministryId={activeMinistry}
            meta={activeMeta}
            minState={currentMinState}
            minUpgrades={currentMinUpgrades}
            onOpenDesk={handleOpenDesk}
            onOpenCandidates={() => setCandidateModal({ ministryId: activeMinistry, candidates: CANDIDATES_POOL[activeMinistry] })}
            onBack={() => handleNavigate(1)}
            dispatch={dispatch}
            currentPlanet={currentPlanet}
            fmt={fmt}
          />
        </div>
      )}

      {/* LEVEL 3: Despachos, Instalaciones e Investigaciones */}
      {navLevel === 3 && activeSubview === 'buildings' && (
        <MinistryBuildingsSection
          ministryId={activeMinistry}
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          BUILDINGS={BUILDINGS}
          RESEARCH={RESEARCH}
          ItemCard={ItemCard}
          buildingCost={buildingCost}
          calcBuildTime={calcBuildTime}
          meetsReq={meetsReq}
          buildingProdInfo={buildingProdInfo}
          canAfford={canAfford}
          GAME_SPEED={GAME_SPEED}
          onOpenCodex={onOpenCodex}
          onBack={() => handleNavigate(2)}
        />
      )}

      {navLevel === 3 && activeSubview === 'research' && (
        <MinistryResearchSection
          ministryId={activeMinistry}
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          BUILDINGS={BUILDINGS}
          RESEARCH={RESEARCH}
          ItemCard={ItemCard}
          researchCost={researchCost}
          calcResearchTime={calcResearchTime}
          meetsReq={meetsReq}
          researchEffectInfo={researchEffectInfo}
          canAfford={canAfford}
          GAME_SPEED={GAME_SPEED}
          onOpenCodex={onOpenCodex}
          onBack={() => handleNavigate(2)}
        />
      )}

      {navLevel === 3 && activeSubview !== 'buildings' && activeSubview !== 'research' && (
        <MinistryDeskView
          ministryId={activeMinistry}
          subview={activeSubview}
          meta={activeMeta}
          minState={currentMinState}
          minUpgrades={currentMinUpgrades}
          programs={MINISTRY_PROGRAMS[activeMinistry]}
          directives={MINISTRY_DIRECTIVES[activeMinistry]}
          onUpgradeProgram={handleUpgradeProgram}
          onToggleDirective={handleToggleDirective}
          onBack={() => handleNavigate(2)}
          planetResources={planetResources}
          playerInfluence={playerInfluence}
          fmt={fmt}
        />
      )}

      {/* LEVEL 4: Consejo Imperial de Ministros Supremos (10+ Planetas) */}
      {navLevel === 4 && (
        <ImperialCouncilCabinet
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
          onBackToGoov={() => handleNavigate(0)}
        />
      )}

      {/* LEVEL 5: Senado Imperial Interplanetario (10+ Planetas) */}
      {navLevel === 5 && (
        <ImperialSenateView
          state={state}
          dispatch={dispatch}
          currentPlanet={currentPlanet}
          fmt={fmt}
          onBackToGoov={() => handleNavigate(0)}
        />
      )}

      {/* Candidate Modal */}
      {candidateModal && (
        <MinisterCandidateModal
          candidates={candidateModal.candidates}
          ministryId={candidateModal.ministryId}
          onAppoint={handleAppointMinister}
          onClose={() => setCandidateModal(null)}
          playerInfluence={playerInfluence}
        />
      )}
    </div>
  );
};
