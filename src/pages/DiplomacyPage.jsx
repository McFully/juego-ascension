import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { calcResourceValueForAI, fmt } from "../core.jsx";
import { MINISTRY_PROGRAMS } from "./GovernmentPage.jsx";
import DiplomacyChat from "../components/diplomacy/DiplomacyChat.jsx";
import GalacticCouncil from "../components/diplomacy/GalacticCouncil.jsx";
import FederationsManager from "../components/diplomacy/FederationsManager.jsx";
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
    if (tradeTreaty === 'trade_agreement' || tradeTreaty === 'trade_treaty') demandVal = 1000;
    else if (tradeTreaty === 'research_agreement') demandVal = 1500;
    else if (tradeTreaty === 'non_aggression' || tradeTreaty === 'transit_agreement') demandVal = 600;
    else if (tradeTreaty === 'defense_agreement' || tradeTreaty === 'defensive_pact') demandVal = 2500;
    else if (tradeTreaty === 'permanent_embassy') demandVal = 1800;
    else if (tradeTreaty === 'joint_expedition') demandVal = 3200;
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
          subTab === 'enclaves' ? 'Distrito Consular en Capital' :
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
              {subTab === 'enclaves' && 'Distrito Consular Imperial y Legaciones Extranjeras'}
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

          {subTab === 'enclaves' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Columna 1: Embajadas Extranjeras en nuestra Capital */}
              <div className="bg-[#090d1f]/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>🏛️</span>
                      <span>Embajadas Extranjeras en tu Capital</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Legaciones alienígenas autorizadas en {state.planets?.[0]?.name || 'tu Capital'}. Pagan canon horario en Créditos.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                    +{fmt((state.foreignEmbassiesInCapital || []).reduce((acc, e) => acc + (e.rentHourly || 180), 0))} Cr/h
                  </span>
                </div>

                {(state.foreignEmbassiesInCapital || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono text-xs bg-black/20 rounded-xl border border-white/5 p-4">
                    Ninguna facción extranjera tiene aún embajada en tu capital. Mantén relaciones amistosas (+25) para recibir solicitudes consulares o concédelas desde transmisiones diplomáticas.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(state.foreignEmbassiesInCapital || []).map((emb) => {
                      const aiPlanet = (state.aiPlanets || []).find(p => p.id === emb.aiId);
                      const rel = aiPlanet?.relation ?? 0;
                      return (
                        <div key={emb.aiId} className="bg-[#060916] border border-white/10 rounded-xl p-3 flex flex-col justify-between gap-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-white uppercase">{emb.empireName}</div>
                              <div className="text-[10px] font-mono text-slate-400">
                                Facción: <span className="text-cyan-300 uppercase">{emb.faction || 'alien'}</span> · Relación: <span className={rel >= 20 ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>{rel > 0 ? `+${rel}` : rel}</span>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="text-xs font-black text-emerald-300">+{emb.rentHourly || 180} Cr/h</div>
                              <div className="text-[9px] text-slate-400">Canon Consular</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'DIPLOMACY_RAISE_EMBASSY_RENT', aiId: emb.aiId })}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[10px] font-mono font-bold uppercase cursor-pointer transition-all"
                            >
                              💰 Subir Canon (+60 Cr/h | -8 Opinión)
                            </button>
                            <button
                              type="button"
                              onClick={() => dispatch({ type: 'DIPLOMACY_EXPEL_FOREIGN_EMBASSY', aiId: emb.aiId })}
                              className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold uppercase cursor-pointer transition-all"
                            >
                              🚫 Expulsar (-25)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Columna 2: Nuestras Embajadas Imperiales en el Extranjero */}
              <div className="bg-[#090d1f]/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>🌐</span>
                      <span>Nuestras Embajadas en Mundos Extranjeros</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Sedes diplomáticas abiertas por nuestro Imperio (Coste apertura: 2.500 Cr · Mantenimiento: -120 Cr/h).
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                    {(state.aiPlanets || []).filter(p => p.hasEmbassy || (p.activePacts || []).includes('permanent_embassy')).length} activas
                  </span>
                </div>

                {(state.aiPlanets || []).filter(p => p.hasEmbassy || (p.activePacts || []).includes('permanent_embassy')).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-mono text-xs bg-black/20 rounded-xl border border-white/5 p-4">
                    Aún no has fundado Embajadas Permanentes en planetas extranjeros. Propón una Embajada Permanente (2.500 Cr) en acuerdos comerciales o ábrela desde el Mapa Galáctico.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {(state.aiPlanets || []).filter(p => p.hasEmbassy || (p.activePacts || []).includes('permanent_embassy')).map((ai) => (
                      <div key={ai.id} className="bg-[#060916] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white uppercase">{ai.empireName || ai.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            Coordenadas: [{ai.galaxy}:{ai.system}:{ai.position}] · Relación: <span className="text-emerald-300 font-bold">{ai.relation ?? 0}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300 text-[10px] font-mono">
                          -120 Cr/h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
