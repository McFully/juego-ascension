import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { calcResourceValueForAI, fmt } from "../core.jsx";
import { MINISTRY_PROGRAMS } from "./GovernmentPage.jsx";
import DiplomacyChat from "../components/diplomacy/DiplomacyChat.jsx";
import GalacticCouncil from "../components/diplomacy/GalacticCouncil.jsx";
import FederationsManager from "../components/diplomacy/FederationsManager.jsx";
import MinistriesManager from "../components/diplomacy/MinistriesManager.jsx";
import CrisesManager from "../components/diplomacy/CrisesManager.jsx";
import TradeAgreementModal from "../components/diplomacy/TradeAgreementModal.jsx";
import BuyAIShipsModal from "../components/diplomacy/BuyAIShipsModal.jsx";
import { playVoice } from "../audio.js";
import { LeaderAvatar, playDiploSound, getDiploCtx } from "../components/diplomacy/LeaderAvatar.jsx";
import { FACTION_DIALOGUES } from "../data/diplomacyDialogues.js";
import { getActionReply } from "../components/diplomacy/diplomaticActionReplies.js";
import { GameCarousel } from "../components/ui/GameCarousel.jsx";
import { ActionCardTile } from "../components/ui/ActionCardTile.jsx";
import { DiplomacyChamberSelector } from "../components/diplomacy/DiplomacyChamberSelector.jsx";
import { useNavigation } from "../components/navigation/NavigationContext.jsx";
import { SubsystemTopBanner } from "../components/navigation/SubsystemTopBanner.jsx";
import { SafeImg } from "../assets.jsx";

const DiplomacyPage = ({ state, dispatch, currentPlanet: propPlanet, production, SHIPS, FACTIONS, AI_STRATEGIES, S, fmt, getGalacticAlignment, setActiveTab }) => {
  const { navigateTo, navigateBack } = useNavigation();
  const [tradeAIPlanet, setTradeAIPlanet] = useState(null);
  const [tradeGive, setTradeGive] = useState({ metal: 0, crystal: 0, deuterium: 0, influence: 0 });
  const [tradeTake, setTradeTake] = useState({ metal: 0, crystal: 0, deuterium: 0 });
  const [tradeTreaty, setTradeTreaty] = useState('none');
  const [viabilityMsg, setViabilityMsg] = useState(null);
  const [buyAIPlanet, setBuyAIPlanet] = useState(null);
  const [buyShipId, setBuyShipId] = useState('lightFighter');
  const [buyQty, setBuyQty] = useState(1);

  const aiNearby = useMemo(() => (state.aiPlanets || []).filter(p => !p.isVirgin && p.galaxy >= 1 && p.discovered), [state.aiPlanets]);
  const aiList = useMemo(() => aiNearby.length > 100 ? aiNearby.slice(0, 100) : aiNearby, [aiNearby]);

  const currentPlanet = useMemo(() => state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0], [state.planets, state.currentPlanetId]);
  const resources = useMemo(() => currentPlanet?.resources || { metal: 0, crystal: 0, deuterium: 0 }, [currentPlanet]);

  const influence = state.influence || 0;
  const council = state.galacticCouncil || { resolutionsPassed: [], influenceHistory: [] };
  const federations = state.federations || [];
  const federalFleet = state.federalFleet || { ships: {}, contributed: 0 };
  const activeCrises = state.activeCrises || [];

  const [activeContact, setActiveContact] = useState(null);
  const [dialogueText, setDialogueText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const [subTab, setSubTab] = useState(null); // null = Selector de Cámaras, 'relations' | 'council' | 'federations' | 'crises' = Cámara activa
  const [selectedMinistry, setSelectedMinistry] = useState('economy');
  const activeContactRef = useRef(activeContact);
  activeContactRef.current = activeContact;
  const aiNearbyRef = useRef(aiNearby);
  aiNearbyRef.current = aiNearby;

  useEffect(() => {
    if (!activeContact && aiList.length > 0) {
      handleSelectContact(aiList[0]);
    }
  }, [aiList, activeContact]);

  useEffect(() => {
    if (!activeContact) return;
    const factionKey = activeContact.faction || 'default';
    const factionData = FACTION_DIALOGUES[factionKey] || FACTION_DIALOGUES.default;
    const relation = activeContact.relation || 0;
    
    let text = factionData.greetings.neutral;
    if (relation >= 40) {
      text = factionData.greetings.friendly;
    } else if (relation <= -20) {
      text = factionData.greetings.hostile;
    }

    let index = 0;
    setDialogueText('');
    const interval = setInterval(() => {
      setDialogueText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 12);

    const voiceKey = relation <= -20 && (factionKey === 'human' || factionKey === 'cyborg')
      ? `diplo_${factionKey}_hostile`
      : `diplo_${factionKey}_greeting`;
    playVoice(voiceKey);

    return () => {
      clearInterval(interval);
    };
  }, [activeContact]);

  const handleSelectContact = (ai) => {
    setIsGlitching(true);
    playDiploSound('connect');
    setActiveContact(ai);
    
    setTimeout(() => {
      setIsGlitching(false);
    }, 450);
  };

  const getTreatyCosts = useCallback((treatyType) => {
    let cost = { metal: 0, crystal: 0, deuterium: 0 };
    if (treatyType === 'pna') {
      cost = { metal: 10000, crystal: 5000, deuterium: 0 };
    } else if (treatyType === 'alliance') {
      cost = { metal: 20000, crystal: 10000, deuterium: 5000 };
    } else if (treatyType === 'trade') {
      cost = { metal: 15000, crystal: 8000, deuterium: 2000 };
    }
    if ((state.reputation || 0) >= 40) {
      cost = {
        metal: Math.floor(cost.metal * 0.75),
        crystal: Math.floor(cost.crystal * 0.75),
        deuterium: Math.floor(cost.deuterium * 0.75),
      };
    }
    return cost;
  }, [state.reputation]);

  const handleDiplomaticAction = (actionType) => {
    if (!activeContact) return;
    dispatch({ type: 'DIPLOMACY_APPLY_ACTION', planetId: activeContact.id, actionType });
    playDiploSound('success');
    const personality = activeContact.aiPersonality || 'pacífico';
    const { playerMsg, reply } = getActionReply(actionType, personality);
    dispatch({ type: 'ADD_CHAT_MESSAGE', aiId: activeContact.id, sender: 'player', text: playerMsg });
    setTimeout(() => {
      dispatch({ type: 'ADD_CHAT_MESSAGE', aiId: activeContact.id, sender: 'ai', text: reply });
    }, 1000);

    let index = 0;
    setDialogueText('');
    const interval = setInterval(() => {
      setDialogueText(reply.slice(0, index + 1));
      index++;
      if (index >= reply.length) {
        clearInterval(interval);
      }
    }, 12);

    setTimeout(() => {
      const refreshed = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshed) setActiveContact(refreshed);
    }, 120);
  };

  const executeWarToggle = () => {
    if (!activeContact) return;
    const isWar = (activeContact.relation || 0) <= -90;
    dispatch({ type: 'DIPLOMACY_DECLARE_WAR', planetId: activeContact.id, declareWar: !isWar });
    playDiploSound('warn');
    setTimeout(() => {
      const refreshedAI = aiNearbyRef.current.find(p => p.id === activeContactRef.current?.id);
      if (refreshedAI) {
        setActiveContact(refreshedAI);
      }
    }, 100);
  };

  const handleTrade = () => {
    if (!tradeAIPlanet) return;
    if (tradeTreaty !== 'none') {
      dispatch({
        type: 'DIPLOMACY_PROPOSE_TREATY',
        planetId: tradeAIPlanet.id,
        offer: tradeGive,
        demand: tradeTake,
        treatyType: tradeTreaty
      });
    } else {
      dispatch({
        type: 'DIPLOMACY_TRADE',
        planetId: tradeAIPlanet.id,
        giveRes: { metal: tradeGive.metal, crystal: tradeGive.crystal, deuterium: tradeGive.deuterium },
        takeRes: tradeTake
      });
    }
    playDiploSound('success');
    setTradeAIPlanet(null);
    setTradeGive({ metal: 0, crystal: 0, deuterium: 0, influence: 0 });
    setTradeTake({ metal: 0, crystal: 0, deuterium: 0 });
    setTradeTreaty('none');
    setViabilityMsg(null);
  };

  const handleCheckViability = () => {
    if (!tradeAIPlanet) return;
    const offerVal = calcResourceValueForAI(tradeAIPlanet, tradeGive);
    let demandVal = 0;
    if (tradeTreaty === 'trade_agreement') demandVal = 1000;
    else if (tradeTreaty === 'research_agreement') demandVal = 800;
    else if (tradeTreaty === 'transit_agreement') demandVal = 600;
    else if (tradeTreaty === 'defense_agreement') demandVal = 2500;
    else if (tradeTreaty === 'protectorate') demandVal = 4000;
    else if (tradeTreaty === 'vassalage') demandVal = 6000;
    
    const demandResVal = (tradeTake.metal || 0) * 1.0 + (tradeTake.crystal || 0) * 2.0 + (tradeTake.deuterium || 0) * 4.0;
    demandVal += demandResVal;

    if (offerVal >= demandVal) {
      setViabilityMsg({ status: 'success', text: `✅ Propuesta VIABLE. Valor ofertado (${Math.floor(offerVal)}) es suficiente para el coste demandado (${Math.floor(demandVal)}).` });
    } else {
      setViabilityMsg({ status: 'error', text: `❌ Propuesta INSUFICIENTE. Valor ofertado (${Math.floor(offerVal)}) es menor que el coste solicitado (${Math.floor(demandVal)}). Ofrece más recursos o influencia.` });
    }
  };

  const handleBuyShip = () => {
    if (!buyAIPlanet) return;
    const s = SHIPS[buyShipId];
    if (!s) return;
    const cost = { metal: Math.floor(s.cost.m * buyQty * 1.3), crystal: Math.floor(s.cost.c * buyQty * 1.3), deuterium: Math.floor((s.cost.d || 0) * buyQty * 1.3) };
    dispatch({ type: 'DIPLOMACY_BUY_SHIP', planetId: buyAIPlanet.id, shipId: buyShipId, cost, qty: buyQty });
    setBuyAIPlanet(null);
    setBuyShipId('lightFighter');
    setBuyQty(1);
  };

  const getRelationColor = (rel) => {
    if (rel >= 50) return 'text-emerald-400';
    if (rel >= 20) return 'text-cyan-400';
    if (rel >= -20) return 'text-slate-400';
    if (rel >= -50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getIntelLevel = (ai) => {
    const relation = ai.relation || 0;
    if (relation >= 75) return 5;
    if (relation >= 45) return 4;
    if (relation >= 15) return 3;
    if (relation >= -15) return 2;
    return 1;
  };

  useEffect(() => {
    dispatch({ type: 'MARK_ALL_NOTIF_READ' });
  }, [dispatch]);

  return (
    <div className="space-y-4 view-enter">
      <style>{`
        @keyframes scanline {
          0% { top: -5%; }
          100% { top: 105%; }
        }
        .animate-scanline {
          animation: scanline 3.2s linear infinite;
        }
      `}</style>

      {/* DOM Superior Estandarizado (Recursos + Explorador + Volver al Mando Imperial) */}
      <SubsystemTopBanner
        state={state}
        currentPlanet={propPlanet || currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle={
          subTab === 'relations' ? 'Embajada y Líderes Extraterrestres' :
          subTab === 'council' ? 'Consejo Galáctico Soberano' :
          subTab === 'federations' ? 'Pactos Federativos' :
          subTab === 'crises' ? 'Mando de Alertas y Crisis' :
          'Cuerpo Diplomático Interestelar'
        }
        breadcrumbIcon="🤝"
        parentHub="imperial_hub"
        backButtonLabelTop="VOLVER A"
        backButtonLabelBottom={subTab ? 'Cámaras' : 'Mando Imperial'}
        backButtonIcon={subTab ? '🤝' : '👑'}
        onBackToAltoMando={() => {
          if (subTab) {
            setSubTab(null);
          } else {
            if (setActiveTab) setActiveTab('imperial_hub');
            if (navigateTo) navigateTo('imperial_hub');
            if (window.playSfx) window.playSfx('click');
          }
        }}
      />

      {/* Cancillería Imperial Header */}
      <section className="bg-[#0b1021]/90 border border-purple-500/25 rounded-2xl p-4 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤝</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Cuerpo Diplomático Interestelar</h2>
            <p className="text-[10px] text-purple-400 font-mono uppercase">
              {subTab === 'relations' && 'Embajada y Líderes Extraterrestres'}
              {subTab === 'council' && 'Consejo Galáctico Soberano'}
              {subTab === 'federations' && 'Pactos Federativos y Armada Federal'}
              {subTab === 'crises' && 'Mando de Alertas y Crisis Cósmicas'}
              {!subTab && 'Tratados Bilaterales · Consejo Galáctico · Gestión de Crisis'}
            </p>
          </div>
        </div>
      </section>

      {/* NIVEL 1: Selector de Cámaras en Grid */}
      {!subTab && (
        <DiplomacyChamberSelector
          onSelectChamber={(id) => setSubTab(id)}
          playDiploSound={playDiploSound}
          onBack={() => {
            if (navigateBack) navigateBack();
            else if (navigateTo) navigateTo('overview');
          }}
        />
      )}

      {/* NIVEL 2: Vista Dedicada de la Cámara Seleccionada */}
      {subTab && (
        <div className="space-y-4 animate-in fade-in duration-200">

          {subTab === 'relations' && (
            <DiplomacyChat
              aiList={aiList}
              activeContact={activeContact}
              handleSelectContact={handleSelectContact}
              getIntelLevel={getIntelLevel}
              getRelationColor={getRelationColor}
              FACTIONS={FACTIONS}
              LeaderAvatar={LeaderAvatar}
              dialogueText={dialogueText}
              isGlitching={isGlitching}
              chatHistory={state.chatHistory}
              handleDiplomaticAction={handleDiplomaticAction}
              executeWarToggle={executeWarToggle}
              influence={influence}
              resources={resources}
              onOpenTradeModal={(ai) => {
                setTradeAIPlanet(ai);
                setTradeGive({ metal: 0, crystal: 0, deuterium: 0, influence: 0 });
                setTradeTake({ metal: 0, crystal: 0, deuterium: 0 });
                setTradeTreaty('none');
                setViabilityMsg(null);
              }}
              onOpenBuyShipsModal={(ai) => {
                setBuyAIPlanet(ai);
                setBuyShipId('lightFighter');
                setBuyQty(1);
              }}
            />
          )}

          {subTab === 'council' && (
            <GalacticCouncil
              council={council}
              influence={influence}
              dispatch={dispatch}
              playDiploSound={playDiploSound}
            />
          )}

          {subTab === 'federations' && (
            <FederationsManager
              aiList={aiList}
              influence={influence}
              currentPlanet={currentPlanet}
              resources={resources}
              federations={federations}
              federalFleet={federalFleet}
              dispatch={dispatch}
              playDiploSound={playDiploSound}
            />
          )}

          {subTab === 'crises' && (
            <CrisesManager
              activeCrises={activeCrises}
              dispatch={dispatch}
              playDiploSound={playDiploSound}
            />
          )}
        </div>
      )}

      <TradeAgreementModal
        tradeAIPlanet={tradeAIPlanet}
        setTradeAIPlanet={setTradeAIPlanet}
        tradeGive={tradeGive}
        setTradeGive={setTradeGive}
        tradeTake={tradeTake}
        setTradeTake={setTradeTake}
        tradeTreaty={tradeTreaty}
        setTradeTreaty={setTradeTreaty}
        viabilityMsg={viabilityMsg}
        handleCheckViability={handleCheckViability}
        handleTrade={handleTrade}
      />

      <BuyAIShipsModal
        buyAIPlanet={buyAIPlanet}
        setBuyAIPlanet={setBuyAIPlanet}
        buyShipId={buyShipId}
        setBuyShipId={setBuyShipId}
        buyQty={buyQty}
        setBuyQty={setBuyQty}
        handleBuyShip={handleBuyShip}
      />
    </div>
  );
};

export default DiplomacyPage;
