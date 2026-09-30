import React, { useState, useEffect, useReducer, useMemo, useCallback, useRef } from "react";
import NewGameScreen from "./components/NewGameScreen";
import { MainMenuScreen } from "./components/app/MainMenuScreen";
import { LoadGameScreen } from "./components/app/LoadGameScreen";
import { SaveGameScreen } from "./components/app/SaveGameScreen";
import { IntroSplashPreload } from "./components/app/IntroSplashPreload";
import { useGameKeyboardShortcuts } from "./hooks/useGameKeyboardShortcuts";
import { useGameLifecycle } from "./hooks/useGameLifecycle";
import { useAppSaveHandlers } from "./hooks/useAppSaveHandlers";
import { useUIDiagnostics } from "./hooks/useUIDiagnostics";
import { logTelemetry, getSnapshotTelemetry } from "./utils/telemetry.js";
import * as GameCore from "./core.jsx";
import { S } from "./styles.js";
import { SafeImg, CardBanner } from "./assets.jsx";
import { StarField, ProgressBar, QueueDisplay, ItemCard } from "./ui.jsx";
import { AppOverlays } from "./components/app/AppOverlays.jsx";
import { GameViewports } from "./components/app/GameViewports.jsx";
import { GAME_TABS, isTabUnlocked } from "./components/app/gameNavigation.js";
import { NavigationProvider } from "./components/navigation/NavigationContext.jsx";

const APP_VERSION = (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev");

const {
  TICK_MS, GAME_SPEED,
  ACHIEVEMENTS, MISSIONS,
  BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES,
  MISSILES, MOON_BUILDINGS,
  FACTIONS,
  AI_STRATEGIES,
  fmt, fmtTime,
  buildingCost, researchCost, shipCost, defenseCost, canAfford, meetsResearchReq,
  constructionDiscount,
  calcProduction, calcStorage,
  shipTimeBonus,
  calcCustomShipCost, calcCustomShipTime, calcCustomShipStats,
  buildingProdInfo, researchEffectInfo, calcBuildTime, calcResearchTime, calcShipTime, calcDefenseTime,
  getDefenseStats, getEffectiveTech, isOutdated, getShipStats,
  simulateCombat, createInitial, getGalacticAlignment,
  gameReducer
} = GameCore;

function App() {
  const [state, dispatch] = useReducer(gameReducer, { gameStarted: false });
  const [activeCodexId, setActiveCodexId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.lastActiveGameState = {
        ...state,
        activeTab
      };
    }
  }, [state, activeTab]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [renaming, setRenaming] = useState(false);
  // 3.4-a — `acceptTransmission` eliminado: nada de aperturas automáticas.
  const [menuScreen, setMenuScreen] = useState("main");
  const [introComplete, setIntroComplete] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("menu");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(() => {
    try {
      return typeof localStorage !== "undefined" ? localStorage.getItem("ascension_crt_enabled") === "true" : false;
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    const onCrtToggle = (e) => {
      setCrtEnabled(!!e.detail?.enabled);
    };
    window.addEventListener("ascension:crt-toggle", onCrtToggle);
    return () => window.removeEventListener("ascension:crt-toggle", onCrtToggle);
  }, []);

  const onOpenCodex = useCallback((id) => {
    setActiveCodexId(id);
    if (window.playSfx) window.playSfx("uiModal");
  }, []);

  const currentPlanet = state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0];

  // ItemCard se usa directamente como referencia estable a nivel de módulo (importado en línea 15).
  // Las props onOpenCodex y planetResources se pasan desde cada página que lo necesita.
  const ItemCardWithCodex = ItemCard;

  const safeCalcProduction = useCallback((...args) => {
    try {
      return calcProduction(...args);
    } catch (e) {
      console.error("[Ascensión] calcProduction error:", e, args);
      if (window.electronAPI && window.electronAPI.logError) {
        window.electronAPI.logError(`calcProduction crash: ${e?.message || e}`, e?.stack || "", `player=${state.playerName}`);
      }
      return { metal: 0, crystal: 0, deuterium: 0, energyProd: 0, energyCons: 0, energyBalance: 0, ratio: 1 };
    }
  }, [state.playerName]);

  const production = useMemo(() => {
    if (!currentPlanet) return { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };
    const rawProd = safeCalcProduction(
      currentPlanet.buildings, state.research || {}, currentPlanet.temperature, GAME_SPEED,
      currentPlanet.faction || "human", currentPlanet.biome, currentPlanet.gravity, currentPlanet.trait,
      currentPlanet.specialization, { galaxy: currentPlanet.galaxy, system: currentPlanet.system, position: currentPlanet.position },
      state.ministries?.economy?.taxRate || 0
    );
    if (!rawProd || !rawProd.breakdown) return rawProd || { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 };

    const pop = currentPlanet.population || 1000;
    const popMetal = Math.round(pop * 0.00002 * 3600);
    const popCrystal = Math.round(pop * 0.00001 * 3600);
    const popDeut = Math.round(pop * 0.000005 * 3600);

    const b = rawProd.breakdown;
    if (b.metal) {
      b.metal.popConsumption = popMetal;
      b.metal.netTotal = Math.max(0, (rawProd.metal || 0) - popMetal);
    }
    if (b.crystal) {
      b.crystal.popConsumption = popCrystal;
      b.crystal.netTotal = Math.max(0, (rawProd.crystal || 0) - popCrystal);
    }
    if (b.deuterium) {
      b.deuterium.popConsumption = popDeut;
      b.deuterium.netTotal = Math.max(0, (rawProd.deuterium || 0) - popDeut);
    }
    return rawProd;
  }, [currentPlanet, state.research, state.ministries, safeCalcProduction]);

  const storage = useMemo(() => currentPlanet ? calcStorage(currentPlanet.buildings) : { metal: 0, crystal: 0, deuterium: 0 }, [currentPlanet]);

  useUIDiagnostics(activeTab, currentPlanet);

  const {
    ready,
    setReady,
    engineInfo,
    availableSaves,
    setAvailableSaves,
    lastSaveName,
    setLastSaveName,
    effectiveSoundEnabled,
    toggleSound,
    stateRef,
    saveRef,
    resettingRef
  } = useGameLifecycle({
    state,
    dispatch,
    production,
    TICK_MS,
    activeTab,
    fmt
  });

  const {
    handleMenuContinue,
    handleMenuNewGame,
    handleMenuLoadGame,
    handleMenuSaveGame,
    handleMenuImport,
    handleMenuExport,
    handleMenuExit,
    handleLoadFromList,
    handleInGameSave,
    handleInGameLoad,
    handleInGameImport,
    handleInGameExport,
    handleReturnToMenu
  } = useAppSaveHandlers({
    state,
    dispatch,
    availableSaves,
    setAvailableSaves,
    setLastSaveName,
    saveRef,
    resettingRef,
    setMenuScreen
  });

  const refreshSaveList = useCallback(async () => {
    try {
      const listResult = window.electronAPI && window.electronAPI.listSaves ? await window.electronAPI.listSaves() : null;
      if (listResult && listResult.success) {
        setAvailableSaves(listResult.saves || []);
        if (listResult.saves && listResult.saves.length > 0) {
          setLastSaveName(listResult.saves[0].name);
        } else {
          setLastSaveName("");
        }
      }
    } catch (_) {}
  }, [setAvailableSaves, setLastSaveName]);

  // 3.4-a — Se eliminó el flag `acceptTransmission` y el efecto que lo forzaba a
  // false: las transmisiones ya no se abren solas, se leen desde la bandeja.

  const visibleTabs = useMemo(() => GAME_TABS.filter(t => isTabUnlocked(t.id, currentPlanet, state)), [state.planets, state.currentPlanetId, state.research, state.aiPlanets, state.combatsWon, state.combatsLost, currentPlanet]);

  useEffect(() => {
    const isGovVirtualTab = activeTab === "government_ministries" || (typeof activeTab === "string" && activeTab.startsWith("ministry_"));
    if (!isGovVirtualTab && !visibleTabs.some(t => t.id === activeTab)) {
      setActiveTab("overview");
    }
  }, [visibleTabs, activeTab]);

  const safeSetActiveTab = (id) => {
    const isGovVirtualTab = id === "government_ministries" || (typeof id === "string" && id.startsWith("ministry_"));
    if (isGovVirtualTab || visibleTabs.some(t => t.id === id)) {
      setActiveTab(id);
    } else {
      setActiveTab("overview");
    }
  };

  const unreadNotifs = (state.notifications || []).filter(n => !n.read && n.type !== "success").length;
  // 3.5-a — El contador real de la bandeja: la verdad es contar los !read del log.
  const unreadComms = (state.tacticalEventLog || []).filter(e => !e.read).length;
  const attackMissions = (state.fleetMissions || []).filter(m => m.type === "attack" && m.isAI && m.remainingTicks <= 300);

  useGameKeyboardShortcuts({
    visibleTabs,
    activeTab,
    setActiveTab,
    safeSetActiveTab,
    dispatch,
    stateRef,
    setRenaming,
    setShowShortcuts,
    setSettingsOpen,
    setActiveCodexId
  });

  const startWelcomeTimeoutRef = useRef(null);
  const handleStart = (name, mode = "standard") => {
    const initial = createInitial(name, "human", mode);
    dispatch({ type: "LOAD", payload: initial });

    if (startWelcomeTimeoutRef.current) clearTimeout(startWelcomeTimeoutRef.current);
    startWelcomeTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "ADD_NOTIFICATION", payload: {
        type: "info",
        message: "🚀 Bienvenido, Comandante. Tu imperio espacial comienza ahora."
      }});
      dispatch({ type: "ADD_NOTIFICATION", payload: {
        type: "info",
        message: "⛏️ Primer paso: Construye Minas de Metal y Cristal para generar recursos básicos."
      }});
      dispatch({ type: "ADD_NOTIFICATION", payload: {
        type: "info",
        message: "🔬 Consejo: Investiga Combustión pronto para desbloquear tus primeras naves y explorar."
      }});
    }, 650);
  };

  if (!state.gameStarted) {
    if (!ready || !introComplete) {
      return (
        <IntroSplashPreload
          ready={ready}
          onForceReady={() => {
            setReady(true);
            setIntroComplete(true);
          }}
          onComplete={() => {
            if (ready) {
              setIntroComplete(true);
            }
          }}
        />
      );
    }
    if (menuScreen === "new") {
      return <NewGameScreen onConfirm={handleStart} onBack={() => setMenuScreen("main")} availableSaves={availableSaves} />;
    }
    if (menuScreen === "load") {
      return <LoadGameScreen onBack={() => setMenuScreen("main")} onLoad={handleLoadFromList} />;
    }
    if (menuScreen === "save") {
      return (
        <SaveGameScreen
          onBack={() => setMenuScreen("main")}
          onSave={handleInGameSave}
          defaultName={state.playerName || (availableSaves.length > 0 ? availableSaves[0].name : "")}
        />
      );
    }
    const handleExportLogs = async () => {
      try {
        const snapshot = getSnapshotTelemetry(state);
        if (window.electronAPI && window.electronAPI.exportLogs) {
          const res = await window.electronAPI.exportLogs(snapshot);
          if (res.success) {
            alert("✓ Archivo de Logs y Telemetría 360 guardado correctamente en:\n" + res.path);
          } else if (res.error && !res.canceled) {
            alert("Error al exportar logs: " + res.error);
          }
        } else {
          // Fallback para navegador web
          const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ascension_telemetry_logs_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          alert("✓ Telemetría y logs exportados como archivo JSON.");
        }
      } catch (err) {
        alert("Error al procesar la exportación: " + (err?.message || err));
      }
    };

    return (
      <>
        <MainMenuScreen
          onContinue={handleMenuContinue}
          onNewGame={handleMenuNewGame}
          onLoadGame={handleMenuLoadGame}
          onImport={handleMenuImport}
          onExport={handleMenuExport}
          onSaveGame={handleMenuSaveGame}
          onExit={handleMenuExit}
          onExportLogs={handleExportLogs}
          hasSaves={availableSaves.length > 0}
          lastSaveName={lastSaveName}
        />
      </>
    );
  }

  if (!currentPlanet) {
    return <div className={S.page + " flex items-center justify-center"}>Cargando...</div>;
  }

  return (
    <div className={S.page + " flex flex-col min-h-screen"}>
      <StarField />
      {crtEnabled && <div className="crt-overlay" aria-hidden="true" />}

      <AppOverlays
        attackMissions={attackMissions}
        state={state}
        dispatch={dispatch}
        currentPlanet={currentPlanet}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleInGameSave={handleInGameSave}
        handleInGameLoad={handleInGameLoad}
        handleInGameImport={handleInGameImport}
        handleInGameExport={handleInGameExport}
        effectiveSoundEnabled={effectiveSoundEnabled}
        toggleSound={toggleSound}
        handleReturnToMenu={handleReturnToMenu}
        settingsTab={settingsTab}
        activeCodexId={activeCodexId}
        setActiveCodexId={setActiveCodexId}
        BUILDINGS={BUILDINGS}
        RESEARCH={RESEARCH}
        SHIPS={SHIPS}
        DEFENSES={DEFENSES}
      />

      <NavigationProvider onTabChange={safeSetActiveTab} activeTab={activeTab}>
        {/* Viewport Principal de Juego — 100% Pantalla Completa y Ancho Máximo */}
        <main id="main-game-viewport" className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden p-2 md:p-6">
          <div className="flex-1 w-full">
            <GameViewports
                activeTab={activeTab}
            state={state}
            dispatch={dispatch}
            currentPlanet={currentPlanet}
            production={production}
            storage={storage}
            MISSIONS={MISSIONS}
            BUILDINGS={BUILDINGS}
            RESEARCH={RESEARCH}
            SHIPS={SHIPS}
            DEFENSES={DEFENSES}
            SHIP_CHASSIS={SHIP_CHASSIS}
            SHIP_WEAPONS={SHIP_WEAPONS}
            SHIP_ENGINES={SHIP_ENGINES}
            SHIP_SHIELDS={SHIP_SHIELDS}
            SHIP_MODULES={SHIP_MODULES}
            MISSILES={MISSILES}
            MOON_BUILDINGS={MOON_BUILDINGS}
            FACTIONS={FACTIONS}
            AI_STRATEGIES={AI_STRATEGIES}
            S={S}
            QueueDisplay={QueueDisplay}
            ProgressBar={ProgressBar}
            fmt={fmt}
            fmtTime={fmtTime}
            isOutdated={isOutdated}
            onOpenCodex={onOpenCodex}
            safeSetActiveTab={safeSetActiveTab}
            ItemCardWithCodex={ItemCardWithCodex}
            buildingCost={buildingCost}
            calcBuildTime={calcBuildTime}
            meetsReq={meetsResearchReq}
            buildingProdInfo={buildingProdInfo}
            canAfford={canAfford}
            GAME_SPEED={GAME_SPEED}
            researchCost={researchCost}
            calcResearchTime={calcResearchTime}
            researchEffectInfo={researchEffectInfo}
            SafeImg={SafeImg}
            CardBanner={CardBanner}
            shipTimeBonus={shipTimeBonus}
            shipCost={shipCost}
            calcShipTime={calcShipTime}
            getShipStats={getShipStats}
            constructionDiscount={constructionDiscount}
            defenseCost={defenseCost}
            calcDefenseTime={calcDefenseTime}
            getDefenseStats={getDefenseStats}
            getEffectiveTech={getEffectiveTech}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            simulateCombat={simulateCombat}
            calcCustomShipStats={calcCustomShipStats}
            ACHIEVEMENTS={ACHIEVEMENTS}
            calcCustomShipCost={calcCustomShipCost}
            calcCustomShipTime={calcCustomShipTime}
            getGalacticAlignment={getGalacticAlignment}
            onOpenSettings={() => setSettingsOpen(true)}
            onReturnToMenu={handleReturnToMenu}
          />
            </div>
          </main>
      </NavigationProvider>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    try {
      const activeState = (typeof window !== 'undefined' && window.lastActiveGameState) ? window.lastActiveGameState : null;
      logTelemetry("ERROR", `ErrorBoundary capturó excepción: ${error?.message || error}`, {
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        gameState: activeState ? {
          playerName: activeState.playerName,
          currentPlanetId: activeState.currentPlanetId,
          gameTick: activeState.gameTick,
        } : null
      });
    } catch (_) {}
  }

  handleExportFromCrash = async () => {
    try {
      const activeState = (typeof window !== 'undefined' && window.lastActiveGameState) ? window.lastActiveGameState : null;
      const snapshot = getSnapshotTelemetry(activeState);
      if (window.electronAPI && window.electronAPI.exportLogs) {
        const res = await window.electronAPI.exportLogs(snapshot);
        if (res.success) {
          alert("✓ Archivo de Logs y Telemetría guardado correctamente en:\n" + res.path);
        } else if (res.error && !res.canceled) {
          alert("Error al exportar logs: " + res.error);
        }
      } else {
        const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ascension_crash_logs_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert("✓ Logs de excepción descargados como JSON.");
      }
    } catch (err) {
      alert("Error al exportar logs: " + (err?.message || err));
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="glass-deep holographic border border-red-500/30 rounded-2xl p-8 shadow-2xl fresnel specular max-w-xl w-full">
            <div className="text-6xl mb-4 animate-bounce">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error Crítico Detectado</h1>
            <p className="text-slate-400 text-sm mb-6">
              El juego ha experimentado una excepción inesperada. Los detalles técnicos han quedado registrados en la telemetría interna.
            </p>
            <pre className="bg-[#05070f]/80 p-3 rounded text-left text-xs font-mono text-red-300 overflow-auto max-h-36 mb-6 border border-red-950/80 whitespace-pre-wrap">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => {
                  if (this.props.onRetry) this.props.onRetry();
                  this.setState({ hasError: false, error: null });
                }}
                className={S.btn + " " + S.btnDanger}
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className={S.btn + " " + S.btnGhost}
              >
                Recargar
              </button>
              <button
                onClick={this.handleExportFromCrash}
                className={S.btn + " " + S.btnPrimary}
              >
                📊 Exportar Logs
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AppWithBoundary() {
  const [crashCount, setCrashCount] = useState(0);
  const handleRetry = () => setCrashCount(c => c + 1);
  return <ErrorBoundary key={crashCount} onRetry={handleRetry}><App /></ErrorBoundary>;
}
