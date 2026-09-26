import React, { useState, useEffect } from 'react';
import { GameCarousel } from '../components/ui/GameCarousel.jsx';
import { SafeImg } from '../assets.jsx';
import { useNavigation } from '../components/navigation/NavigationContext.jsx';
import { ActionCardTile } from '../components/ui/ActionCardTile.jsx';
import { MissionsChaptersGrid } from '../components/missions/MissionsChaptersGrid.jsx';
import { MissionsChapterDetail } from '../components/missions/MissionsChapterDetail.jsx';

import { CHAPTERS_INFO, ERAS_INFO } from '../data/chaptersData.js';
import { SubsystemTopBanner } from '../components/navigation/SubsystemTopBanner.jsx';

const MISSION_ASSET_MAP = {
  m1_metal: 'metalMine',
  m2_solar: 'solarPlant',
  m3_lab: 'researchLab',
  m4_deuterium: 'deutSynth',
  m5_energy_tech: 'energy',
  m6_shipyard: 'shipyard',
  m2_1_silo: 'missileSilo',
  m2_2_spy: 'spyCenter',
  m2_3_spytech: 'espionage',
  m2_4_defense: 'rocketLauncher',
  m2_5_laser: 'lightLaser',
  m2_6_heavy_laser: 'heavyLaser',
  m3_1_cargo: 'smallCargo',
  m3_2_col: 'colonizer',
  m3_3_newcol: 'advColonization',
  m3_4_spacenav: 'interstellarNav',
  m3_5_probe: 'espionageProbe',
  m3_6_diplo: 'diploCenter',
  m4_1_rep: 'historicImperialArchive',
  m4_2_pacts: 'treatyCoordinationOffice',
  m4_3_trade: 'galacticMarket',
  m4_4_influence: 'councilChamber',
  m4_5_alliance: 'permanentEmbassy',
  m5_1_econ: 'industrialComplex',
  m5_2_mil: 'militaryAcademy',
  m5_3_sci: 'expLab',
  m5_4_comm: 'systemTradeNetwork',
  m5_5_autotrade: 'centralLogisticHub',
  m6_1_weapons: 'weapons',
  m6_2_shields: 'shields',
  m6_3_cruiser: 'cruiser',
  m6_4_plasma: 'plasma',
  m6_5_combat: 'battleship',
  m7_1_capital: 'sectorGovPalace',
  m7_2_nano: 'naniteFactory',
  m7_3_federation: 'consulateHeadquarters',
  m7_4_custom: 'customShipyard',
  m7_5_deathstar: 'deathstar',
  m7_6_hegemony: 'singularity'
};

const MissionsPage = ({ state, dispatch, currentPlanet, setActiveTab, MISSIONS, S, production, fmt }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const completedList = state.completedMissions || [];
  const activeList = state.activeMissions || [];
  const [selectedChap, setSelectedChap] = useState(1);
  const [selectedEra, setSelectedEra] = useState(1);
  const [viewMode, setViewMode] = useState('chapters'); // 'chapters' | 'chapter_detail'

  const isChapterCompleted = (chapId) => {
    const chapMissions = MISSIONS.filter(m => m.chap === chapId);
    if (chapMissions.length === 0) return false;
    return chapMissions.every(m => completedList.includes(m.id));
  };

  useEffect(() => {
    const firstIncomplete = CHAPTERS_INFO.find(ch => !isChapterCompleted(ch.id));
    if (firstIncomplete) {
      setSelectedChap(firstIncomplete.id);
      const era = ERAS_INFO.find(e => (e.chapters || []).includes(firstIncomplete.id));
      if (era) setSelectedEra(era.id);
    } else {
      setSelectedChap(CHAPTERS_INFO[CHAPTERS_INFO.length - 1].id);
      setSelectedEra(ERAS_INFO[ERAS_INFO.length - 1].id);
    }
  }, [completedList]);

  // Logic to auto-complete missions based on requirements
  useEffect(() => {
    activeList.forEach(mId => {
      const m = MISSIONS.find(m => m.id === mId);
      if (m && m.check(state, currentPlanet)) {
        dispatch({ type: 'COMPLETE_MISSION', missionId: mId });
      }
    });
  }, [state, currentPlanet, activeList, MISSIONS, dispatch]);

  // Determine if a chapter is unlocked (previous chapter must be 100% completed)
  const getChapterProgress = (chapId) => {
    const chapMissions = MISSIONS.filter(m => m.chap === chapId);
    if (chapMissions.length === 0) return 0;
    const completedChapMissions = chapMissions.filter(m => completedList.includes(m.id));
    return Math.round((completedChapMissions.length / chapMissions.length) * 100);
  };

  const isChapterUnlocked = (chapId) => {
    if (chapId === 1) return true;
    return getChapterProgress(chapId - 1) === 100;
  };

  const currentChapInfo = CHAPTERS_INFO.find(c => c.id === selectedChap) || CHAPTERS_INFO[0];
  const currentChapMissions = MISSIONS.filter(m => m.chap === selectedChap);

  const activeMission = MISSIONS.find(m => activeList.includes(m.id));

  const totalCompleted = completedList.length;
  const totalMissions = MISSIONS.length;
  const campaignProgress = Math.round((totalCompleted / totalMissions) * 100);

  const handleTopBack = () => {
    if (window.playSfx) window.playSfx('click');
    if (viewMode === 'chapter_detail') {
      setViewMode('chapters');
    } else if (navigateBack) {
      navigateBack();
    } else if (setActiveTab) {
      setActiveTab('overview');
    }
  };

  return (
    <div className="space-y-4 view-enter w-full">
      {/* Barra superior estándar con Recursos, Breadcrumb y Botón Volver Atrás */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={viewMode === 'chapter_detail' ? `Capítulo ${selectedChap}` : "Misiones Imperiales"}
        breadcrumbIcon="🎯"
        showBackToAltoMando={true}
        onBackToAltoMando={handleTopBack}
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom={viewMode === 'chapter_detail' ? "Capítulos" : "Alto Mando"}
        backButtonIcon={viewMode === 'chapter_detail' ? "◀" : "👑"}
        rightSlot={
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
            <div className="w-28 sm:w-36">
              <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-0.5">
                <span>Campaña</span>
                <span className="font-bold">{campaignProgress}%</span>
              </div>
              <div className="w-full bg-slate-950/80 rounded-full h-1.5 border border-white/5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${campaignProgress}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg whitespace-nowrap">
              {totalCompleted}/{totalMissions}
            </span>
          </div>
        }
      />

      {/* NIVEL 1: Selector de Eras y Capítulos Compacto (Sin scroll vertical masivo) */}
      {viewMode === 'chapters' && (
        <MissionsChaptersGrid
          erasInfo={ERAS_INFO}
          chaptersInfo={CHAPTERS_INFO}
          selectedEra={selectedEra}
          onSelectEra={(eraId) => setSelectedEra(eraId)}
          selectedChap={selectedChap}
          isChapterUnlocked={isChapterUnlocked}
          getChapterProgress={getChapterProgress}
          onSelectChapter={(chapId) => {
            setSelectedChap(chapId);
            setViewMode('chapter_detail');
          }}
          onNavigateBack={handleTopBack}
        />
      )}

      {/* NIVEL 2: Pantalla Dedicada con las Misiones del Capítulo Seleccionado */}
      {viewMode === 'chapter_detail' && (
        <MissionsChapterDetail
          currentChapInfo={currentChapInfo}
          currentChapMissions={currentChapMissions}
          completedList={completedList}
          activeList={activeList}
          missionAssetMap={MISSION_ASSET_MAP}
          onBackToChapters={() => {
            if (window.playSfx) window.playSfx('click');
            setViewMode('chapters');
          }}
        />
      )}

      {/* Cuadro de Misión Activa en Pantalla */}
      {activeMission && (
        <section className="relative overflow-hidden bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase border border-cyan-500/40 text-cyan-300 bg-cyan-500/10 rounded-full animate-pulse">
                  MISIÓN PRIORITARIA EN CURSO
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Capítulo {activeMission.chap}</span>
              </div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>{activeMission.icon}</span>
                <span>{activeMission.name}</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {activeMission.desc}
              </p>
            </div>
            <div className="shrink-0 bg-[#05070f]/80 border border-white/10 rounded-xl p-3 min-w-[220px]">
              <div className="text-[9px] text-slate-400 uppercase font-mono mb-1">Recompensa:</div>
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1 font-mono">
                🎁 {activeMission.rewardDesc}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default MissionsPage;
