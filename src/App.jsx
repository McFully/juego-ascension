import React, { useState, useEffect, useReducer, useMemo, useCallback, useRef, Suspense, lazy } from 'react';
import TutorialOverlay from './components/TutorialOverlay';
import FirstContactOverlay from './components/FirstContactOverlay';
import ActiveTransmissionOverlay from './components/ActiveTransmissionOverlay';
import NewGameScreen from './components/NewGameScreen';

import { auditGameState, logTelemetry } from './utils/telemetry.js';
import { sfx, startAmbient, stopAmbient, setMuted, playMenuMusic, stopMenuMusic } from './audio.js';
import * as GameCore from './core.jsx';
import { getTranslator } from './i18n.js';

import { S } from './styles.js';
import { asset, CardImage, SafeImg, CardBanner } from './assets.jsx';
import { StarField, ProgressBar, Tooltip, ResourceBadge, ResourceBar, RedAlertOverlay, BadgeCounter, AttackAlert, QueueDisplay, ItemCard, CodexModal, NarrativeEventOverlay } from './ui.jsx';

import MissionsPage from './pages/MissionsPage';
import OverviewPage from './pages/OverviewPage';
import BuildingsPage from './pages/BuildingsPage';
import ResearchPage from './pages/ResearchPage';
import ShipyardPage from './pages/ShipyardPage';
import DefensePage from './pages/DefensePage';
const MissilesPage = lazy(() => import('./pages/MissilesPage'));
const GalaxyPage = lazy(() => import('./pages/GalaxyPage'));
const FleetPage = lazy(() => import('./pages/FleetPage'));
const CombatPage = lazy(() => import('./pages/CombatPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const MoonPage = lazy(() => import('./pages/MoonPage'));
const TechTreePage = lazy(() => import('./pages/TechTreePage'));
const ShipDesignPage = lazy(() => import('./pages/ShipDesignPage'));
const ReplayPage = lazy(() => import('./pages/ReplayPage'));
const DiplomacyPage = lazy(() => import('./pages/DiplomacyPage.jsx'));
const GovernmentPage = lazy(() => import('./pages/GovernmentPage.jsx').then(m => ({ default: m.GovernmentPage })));
const CommunicationsPage = lazy(() => import('./pages/CommunicationsPage.jsx').then(m => ({ default: m.CommunicationsPage })));

const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev');

const {
  TICK_MS, GAME_SPEED,
  ACHIEVEMENTS, MISSIONS, RES_NAMES, RES_ICONS,
  BUILDINGS, RESEARCH, SHIPS, DEFENSES,
  SHIP_CHASSIS, SHIP_WEAPONS, SHIP_ENGINES, SHIP_SHIELDS, SHIP_MODULES,
  MISSILES, MOON_BUILDINGS,
  BIOMES, BIOME_KEYS,
  FACTIONS,
  AI_STRATEGIES, AI_STRATEGY_KEYS,
  fmt, fmtTime, uid,
  buildingCost, researchCost, shipCost, defenseCost, canAfford, deduct, meetsReq,
  constructionDiscount,
  calcProduction, calcStorage,
  shipTimeBonus, researchTimeBonus,
  calcCustomShipCost, calcCustomShipTime, calcCustomShipStats,
  buildingProdDisplay, buildingProdInfo, researchEffectInfo, calcBuildTime, calcResearchTime, calcShipTime, calcDefenseTime,
  calcDistance, calcFlightTime, calcFuel, shipSpeed, fleetSpeed,
  getDefenseStats, getEffectiveTech, isOutdated, getShipStats,
  simulateCombat, createInitial, getGalacticAlignment,
  gameReducer
} = GameCore;


// ============ LOADING SCREEN WITH WATCHDOG ============
const LoadingScreen = ({ onForceReady }) => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStuck(true);
    }, 10000); // 10s watchdog
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center pt-0 p-6 text-center select-none font-sans relative overflow-hidden">
      <StarField />
      <div className="relative z-10 pointer-events-auto max-w-md glass-deep holographic rounded-2xl p-8 shadow-2xl flex flex-col items-center border border-white/10 fresnel mt-8">
        <img src={asset('logo-ascension.png')} alt="Ascensión" className="h-32 w-auto object-contain mb-6 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]" draggable={false} />
        <h1 className="text-xl font-bold text-[var(--ue-accent)] mb-2">Cargando Ascensión</h1>
        <p className="text-slate-400 text-xs mb-6">Iniciando sistemas y cargando partida local...</p>

        {stuck && (
          <div className="mt-4 space-y-3 w-full">
            <p className="text-red-400 text-xs font-semibold">El arranque está tomando más tiempo del esperado.</p>
            <button
              onClick={() => window.location.reload()}
              className={`${S.btn} ${S.btnPrimary} w-full px-6 py-2.5`}
            >
              Reintentar Carga
            </button>
            {onForceReady && (
              <button
                onClick={onForceReady}
                className={`${S.btn} ${S.btnGhost} w-full px-6 py-2.5`}
              >
                Continuar sin cargar
              </button>
            )}
            <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">
              Si el problema persiste, verifica que la aplicación tenga permisos de escritura en %APPDATA%/Ascension/.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============ MAIN MENU (PREMIUM AAA) ============
const MainMenu = ({ onContinue, onNewGame, onLoadGame, onImport, onExport, onExit, hasSaves, lastSaveName }) => {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden">
      {/* Background Cinematic FX */}
      <StarField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col items-center mb-12 group">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-700 animate-pulse" />
            <img src={asset('logo-ascension.png')} alt="Ascensión" className="h-48 w-auto object-contain relative drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" draggable={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">ASCENSIÓN</h1>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-[0.4em] font-mono">Elite Tactical Command Interface</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pointer-events-auto">
          {/* Main Action Group */}
          <div className="space-y-3">
            <button
              onClick={onContinue}
              disabled={!hasSaves}
              className={`w-full h-24 p-6 rounded-2xl border-2 transition-all flex flex-col justify-center relative overflow-hidden group ${
                hasSaves
                  ? 'bg-cyan-500/10 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/40 border-white/5 opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              {hasSaves && <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rotate-45 translate-x-8 -translate-y-8 border-l border-b border-cyan-500/30 group-hover:bg-cyan-500/20 transition-all" />}
              <span className="flex items-center gap-4 relative z-10">
                <span className="material-symbols-outlined text-3xl text-cyan-400 group-hover:scale-110 transition-transform">play_circle</span>
                <div className="text-left">
                  <div className="text-lg font-black uppercase italic tracking-tighter">Continuar</div>
                  <div className="text-[10px] text-cyan-400/60 font-mono truncate max-w-[160px]">{hasSaves ? (lastSaveName || 'PARTIDA RECIENTE') : 'SIN DATOS'}</div>
                </div>
              </span>
            </button>

            <button
              onClick={onNewGame}
              className="w-full py-4 px-6 rounded-2xl bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all group flex items-center gap-4"
            >
              <span className="material-symbols-outlined font-black group-hover:rotate-90 transition-transform duration-500">add_circle</span>
              <span className="text-lg font-black uppercase italic tracking-tighter">Nueva Expedición</span>
            </button>
          </div>

          {/* Secondary Action Group */}
          <div className="space-y-3">
            <button
              onClick={onLoadGame}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900/60 border-2 border-white/10 hover:border-white/30 transition-all flex items-center gap-4 group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">history</span>
              <span className="text-sm font-bold uppercase tracking-tight">Registros de Vuelo</span>
            </button>

            <div className="grid grid-cols-2 gap-3 h-[100px]">
               <button onClick={onImport} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all group">
                 <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">download</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Importar</span>
               </button>
               <button onClick={onExport} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all group">
                 <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">upload</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Exportar</span>
               </button>
            </div>
            
            <button
              onClick={onExit}
              className="w-full py-3 px-6 rounded-xl text-slate-600 hover:text-red-500 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono group-hover:tracking-[0.4em] transition-all italic">Terminal Off</span>
            </button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 animate-pulse opacity-40">
           <div className="text-[10px] font-mono text-cyan-500 tracking-[0.5em] uppercase">Security Protocol v4.8 Active</div>
           <div className="flex gap-2">
             {[1,2,3,4,5,6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />)}
           </div>
        </div>

        <div className="mt-auto pt-10 text-[9px] text-slate-700 font-mono uppercase tracking-widest">
          © 2026 Aritz Bahamonde Larxé · Ascension Core Engine · v{APP_VERSION}
        </div>
      </div>
    </div>
  );
};

// ============ NEW GAME SCREEN IMPORTED FROM COMPONENTS ============

// ============ LOAD GAME SCREEN ============
const LoadGameScreen = ({ onBack, onLoad }) => {
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renamingSlug, setRenamingSlug] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [error, setError] = useState(null);

  const loadSavesList = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.electronAPI && window.electronAPI.listSaves) {
        const result = await window.electronAPI.listSaves();
        if (result.success) {
          setSaves(result.saves || []);
        } else {
          setError(result.error || 'Error al listar partidas');
        }
      } else {
        setSaves([]);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSavesList();
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm('¿Eliminar esta partida permanentemente?')) return;
    try {
      await window.electronAPI.deleteSaveBySlug(slug);
      await loadSavesList();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRenameStart = (save) => {
    setRenamingSlug(save.slug);
    setRenameValue(save.name);
  };

  const handleRenameConfirm = async () => {
    if (!renameValue.trim() || !renamingSlug) return;
    try {
      const result = await window.electronAPI.renameSave(renamingSlug, renameValue.trim());
      if (result.success) {
        setRenamingSlug(null);
        setRenameValue('');
        await loadSavesList();
      } else {
        setError(result.error || 'Error al renombrar');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleExport = async (save) => {
    try {
      const loadResult = await window.electronAPI.loadSaveBySlug(save.slug);
      if (!loadResult.success) {
        setError(loadResult.error || 'Error al cargar para exportar');
        return;
      }
      const exportResult = await window.electronAPI.exportSaveToFile(loadResult.data, save.name);
      if (!exportResult.success && !exportResult.canceled) {
        setError(exportResult.error || 'Error al exportar');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDate = (mtime) => {
    const d = new Date(mtime);
    return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center p-6 select-none font-sans relative overflow-hidden">
      <StarField />
      <div className="relative z-10 pointer-events-auto w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold text-[var(--ue-accent)]">Cargar Partida</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-12">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            <p className="mt-3">Cargando partidas...</p>
          </div>
        ) : saves.length === 0 ? (
          <div className="glass-deep rounded-2xl p-12 text-center border border-white/10">
            <span className="material-symbols-outlined text-6xl text-slate-600">inbox</span>
            <p className="text-slate-400 mt-4">No hay partidas guardadas.</p>
            <p className="text-slate-500 text-sm mt-2">Crea una nueva partida o importa una.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {saves.map(save => (
              <div key={save.slug} className="glass-deep rounded-xl p-4 border border-white/10 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  {renamingSlug === save.slug ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={20}
                        className={S.input + ' flex-1'}
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenamingSlug(null); }}
                      />
                      <button onClick={handleRenameConfirm} className={`${S.btn} ${S.btnPrimary} text-xs px-3 py-1`}>
                        <span className="material-symbols-outlined text-sm">check</span>
                      </button>
                      <button onClick={() => setRenamingSlug(null)} className={`${S.btn} ${S.btnGhost} text-xs px-3 py-1`}>
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-slate-100 truncate">{save.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>🪐 {save.planetCount} planeta{save.planetCount !== 1 ? 's' : ''}</span>
                        <span>📅 {formatDate(save.mtime)}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onLoad(save.slug)}
                    className={`${S.btn} ${S.btnPrimary} text-xs px-3 py-2`}
                    title="Cargar partida"
                  >
                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                    <span className="ml-1">Cargar</span>
                  </button>
                  <button
                    onClick={() => handleRenameStart(save)}
                    className={`${S.btn} ${S.btnGhost} text-xs px-2 py-2`}
                    title="Renombrar"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleExport(save)}
                    className={`${S.btn} ${S.btnGhost} text-xs px-2 py-2`}
                    title="Exportar a archivo"
                  >
                    <span className="material-symbols-outlined text-sm">file_upload</span>
                  </button>
                  <button
                    onClick={() => handleDelete(save.slug)}
                    className={`${S.btn} ${S.btnGhost} text-xs px-2 py-2 text-slate-400 hover:text-red-400`}
                    title="Eliminar"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============ SETTINGS MENU (in-game) ============
const SettingsMenu = ({ onClose, onSave, onLoad, onImport, onExport, soundEnabled, onToggleSound, onReturnToMenu, initialTab = 'menu' }) => {
  const [tab, setTab] = useState(initialTab); // 'menu' | 'save' | 'load'
  const [saves, setSaves] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renamingSlug, setRenamingSlug] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const loadSavesList = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.electronAPI && window.electronAPI.listSaves) {
        const result = await window.electronAPI.listSaves();
        if (result.success) setSaves(result.saves || []);
        else setError(result.error || 'Error al listar partidas');
      } else {
        setSaves([]);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'load') loadSavesList();
  }, [tab]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setError(null);
    try {
      const result = await onSave(saveName.trim());
      if (result && result.success) {
        setSaveName('');
        setError('✓ Partida guardada internamente');
        setTimeout(() => { setError(null); setTab('menu'); }, 1200);
      } else {
        setError(result?.error || 'Error al guardar');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('¿Eliminar esta partida permanentemente?')) return;
    try {
      await window.electronAPI.deleteSaveBySlug(slug);
      await loadSavesList();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRenameStart = (save) => {
    setRenamingSlug(save.slug);
    setRenameValue(save.name);
  };

  const handleRenameConfirm = async () => {
    if (!renameValue.trim() || !renamingSlug) return;
    try {
      const result = await window.electronAPI.renameSave(renamingSlug, renameValue.trim());
      if (result.success) {
        setRenamingSlug(null);
        setRenameValue('');
        await loadSavesList();
      } else {
        setError(result.error || 'Error al renombrar');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLoadFromList = async (slug) => {
    try {
      await onLoad(slug);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleImport = async () => {
    setError(null);
    try {
      const result = await onImport();
      if (result && result.success) {
        onClose();
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleExport = async () => {
    setError(null);
    try {
      const result = await onExport();
      if (result && result.success) {
        setError('✓ Partida exportada');
        setTimeout(() => { setError(null); setTab('menu'); }, 1200);
      } else if (result && result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const formatDate = (mtime) => {
    const d = new Date(mtime);
    return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-deep holographic rounded-2xl p-6 border border-white/10 fresnel specular w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[var(--ue-accent)] flex items-center gap-2">
            <span className="material-symbols-outlined">settings</span>
            {tab === 'menu' && 'Configuración'}
            {tab === 'save' && 'Guardar Partida'}
            {tab === 'load' && 'Cargar Partida'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {tab !== 'menu' && (
          <button onClick={() => setTab('menu')} className="text-sm text-slate-400 hover:text-white mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Volver</span>
          </button>
        )}

        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${error.startsWith('✓') ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
            {error}
          </div>
        )}

        {tab === 'menu' && (
          <div className="space-y-2">
            <button onClick={() => setTab('save')} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} glass hover:bg-white/5`}>
              <span className="material-symbols-outlined text-[var(--ue-accent)]">save</span>
              <div>
                <div className="font-semibold">Guardar Partida</div>
                <div className="text-xs text-slate-400">Guardar la partida actual con un nombre interno</div>
              </div>
            </button>
            <button onClick={() => setTab('load')} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} glass hover:bg-white/5`}>
              <span className="material-symbols-outlined text-[var(--ue-accent)]">folder_open</span>
              <div>
                <div className="font-semibold">Cargar Partida</div>
                <div className="text-xs text-slate-400">Cargar una partida guardada internamente</div>
              </div>
            </button>
            <button onClick={handleImport} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} glass hover:bg-white/5`}>
              <span className="material-symbols-outlined text-[var(--ue-accent)]">file_download</span>
              <div>
                <div className="font-semibold">Importar Partida</div>
                <div className="text-xs text-slate-400">Cargar una partida desde un archivo externo</div>
              </div>
            </button>
            <button onClick={handleExport} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} glass hover:bg-white/5`}>
              <span className="material-symbols-outlined text-[var(--ue-accent)]">file_upload</span>
              <div>
                <div className="font-semibold">Exportar Partida</div>
                <div className="text-xs text-slate-400">Guardar la partida actual en un archivo externo</div>
              </div>
            </button>
            <div className="border-t border-white/10 my-3"></div>
            <button onClick={() => { if (window.confirm('¿Volver al menú principal? Se perderá el progreso no guardado.')) onReturnToMenu(); }} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} ${S.btnDanger}`}>
              <span className="material-symbols-outlined">logout</span>
              <div>
                <div className="font-semibold">Volver al Menú Principal</div>
                <div className="text-xs text-slate-400">Salir de la partida actual</div>
              </div>
            </button>
            <button onClick={onToggleSound} className={`w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all ${S.btn} glass hover:bg-white/5`}>
              <span className="material-symbols-outlined text-[var(--ue-accent)]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <div>
                <div className="font-semibold">{soundEnabled ? 'Silenciar Sonidos' : 'Activar Sonidos'}</div>
                <div className="text-xs text-slate-400">{soundEnabled ? 'Los efectos de sonido están activados' : 'Los efectos de sonido están silenciados'}</div>
              </div>
            </button>
          </div>
        )}

        {tab === 'save' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ue-text-dim)] uppercase tracking-wider mb-2">
                Nombre de la Partida
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Ej: Imperio de Artius"
                maxLength={20}
                className={S.input}
                autoFocus
                spellCheck={false}
              />
              <div className="text-[10px] text-slate-500 mt-1 font-mono">{saveName.length}/20</div>
            </div>
            <button
              onClick={handleSave}
              disabled={!saveName.trim() || saveName.trim().length < 2}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                saveName.trim().length >= 2
                  ? `${S.btn} ${S.btnPrimary}`
                  : 'bg-slate-900/40 border border-white/5 text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              💾 Guardar Partida
            </button>
          </div>
        )}

        {tab === 'load' && (
          <div>
            {loading ? (
              <div className="text-center text-slate-400 py-8">
                <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                <p className="mt-3 text-sm">Cargando partidas...</p>
              </div>
            ) : saves.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-5xl text-slate-600">inbox</span>
                <p className="mt-3">No hay partidas guardadas internamente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {saves.map(save => (
                  <div key={save.slug} className="glass rounded-xl p-3 border border-white/10 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      {renamingSlug === save.slug ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            maxLength={20}
                            className={S.input + ' flex-1 text-sm py-1'}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenamingSlug(null); }}
                          />
                          <button onClick={handleRenameConfirm} className={`${S.btn} ${S.btnPrimary} text-xs px-2 py-1`}>
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button onClick={() => setRenamingSlug(null)} className={`${S.btn} ${S.btnGhost} text-xs px-2 py-1`}>
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-100 text-sm truncate">{save.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            🪐 {save.planetCount} · 📅 {formatDate(save.mtime)}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleLoadFromList(save.slug)} className={`${S.btn} ${S.btnPrimary} text-xs px-2 py-1.5`} title="Cargar">
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </button>
                      <button onClick={() => handleRenameStart(save)} className={`${S.btn} ${S.btnGhost} text-xs px-1.5 py-1.5`} title="Renombrar">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button onClick={() => handleDelete(save.slug)} className={`${S.btn} ${S.btnGhost} text-xs px-1.5 py-1.5 text-slate-400 hover:text-red-400`} title="Eliminar">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};



// ============ APP PRINCIPAL ============
function App() {
  const [state, dispatch] = useReducer(gameReducer, { gameStarted: false });
  const [showTutorial, setShowTutorial] = useState(!localStorage.getItem('tutorialCompleted'));
  const [ready, setReady] = useState(false);
  const [activeCodexId, setActiveCodexId] = useState(null);
  
  const onOpenCodex = useCallback((id) => {
    setActiveCodexId(id);
    if (window.playSfx) window.playSfx('uiModal');
  }, []);

  const ItemCardWithCodex = useCallback((props) => (
    <ItemCard {...props} onOpenCodex={onOpenCodex} />
  ), [onOpenCodex]);

  // Menu state: 'main' | 'new' | 'load' (shown when !state.gameStarted)
  const [menuScreen, setMenuScreen] = useState('main');
  const [availableSaves, setAvailableSaves] = useState([]);
  const [lastSaveName, setLastSaveName] = useState('');
  // Spanish is fixed for now; settings and menus are part of the current game scope.
  const soundEnabled = true;
  const [userMuted, setUserMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('menu');
  const effectiveSoundEnabled = soundEnabled && !userMuted;
  const toggleSound = () => {
    setUserMuted(prev => {
      const next = !prev;
      try { setMuted(next); } catch (_) {}
      return next;
    });
  };
  const t = useMemo(() => getTranslator('es'), []);

  useEffect(() => {
    (async () => {
      console.log('[Ascensión] Boot: inicio');
      try {
        if (window.electronAPI) {
          console.log('[Ascensión] Boot: detectado Electron');
          // Listar partidas disponibles para el menú principal
          const listResult = await window.electronAPI.listSaves();
          if (listResult.success && listResult.saves) {
            setAvailableSaves(listResult.saves);
            if (listResult.saves.length > 0) {
              setLastSaveName(listResult.saves[0].name);
            }
          }
        }
      } catch (e) {
        console.error('[Ascensión] Boot error:', e);
        // Log boot errors to disk with context
        if (window.electronAPI && window.electronAPI.logError) {
          window.electronAPI.logError(`Boot error: ${e?.message || e}`, e?.stack || '', 'boot-load');
        }
       }
       console.log('[Ascensión] Boot: listo');
       setReady(true);
     })();
   }, []);

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [renaming, setRenaming] = useState(false);
    const [lastSave, setLastSave] = useState(Date.now());
    const [acceptTransmission, setAcceptTransmission] = useState(false);
    
    useEffect(() => {
      if (!state.activeTransmission) {
        setAcceptTransmission(false);
      }
    }, [state.activeTransmission]);
    // Legacy config menu removed; current settings live in SettingsMenu.

   // Enhanced global error logging with game context
   useEffect(() => {
     if (typeof window === 'undefined') return;

     const logWithContext = (message, stack = '', extra = '') => {
       try {
         if (window.electronAPI && window.electronAPI.logError) {
           const q = state;
           const ctx = `player=${state.playerName || 'unknown'}|planets=${state.planets?.length || 0}|missions=${state.fleetMissions?.length || 0}|queues=b${(q.buildQueue||[]).length}s${(q.shipQueue||[]).length}r${(q.researchQueue||[]).length}d${(q.defenseQueue||[]).length}rt${(q.retrofitQueue||[]).length}c${(q.customShipQueue||[]).length}|tab=${activeTab}|gameStarted=${state.gameStarted}`;
           window.electronAPI.logError(`${message}${extra ? ' | ' + extra : ''}`, stack, ctx);
         }
       } catch (_) {}
     };

     // Attach a helper to ErrorBoundary instance if possible (for richer logs)
     const originalComponentDidCatch = ErrorBoundary.prototype.componentDidCatch;
     ErrorBoundary.prototype.componentDidCatch = function (error, info) {
       const q = state;
       const ctx = `player=${state.playerName || 'unknown'}|planets=${state.planets?.length || 0}|missions=${state.fleetMissions?.length || 0}|queues=b${(q.buildQueue||[]).length}s${(q.shipQueue||[]).length}r${(q.researchQueue||[]).length}d${(q.defenseQueue||[]).length}rt${(q.retrofitQueue||[]).length}c${(q.customShipQueue||[]).length}`;
       if (window.electronAPI && window.electronAPI.logError) {
         window.electronAPI.logError(error?.message || String(error), error?.stack || info?.componentStack || '', ctx);
       }
       originalComponentDidCatch.call(this, error, info);
     };

     return () => {
       // Restore original on cleanup (defensive)
       ErrorBoundary.prototype.componentDidCatch = originalComponentDidCatch;
     };
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [state.playerName, state.planets?.length, activeTab, state.gameStarted]);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Shared ref for reliable auto-save + beforeunload (must be declared early)
  const saveRef = useRef(state);
  saveRef.current = state;

  // Critical fix for reset: prevents autosave from re-creating the save file
  // right after the user chose to reset.
  const resettingRef = useRef(false);

  // Refs for SFX throttling to prevent Web Audio congestion
  const lastHoverTimeRef = useRef(0);
  const lastHoverTargetRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  // Safe wrappers for critical pure functions (log to disk on failure)
  const safeCalcProduction = useCallback((...args) => {
    try {
      return calcProduction(...args);
    } catch (e) {
      console.error('[Ascensión] calcProduction error:', e, args);
      if (window.electronAPI && window.electronAPI.logError) {
        window.electronAPI.logError(`calcProduction crash: ${e?.message || e}`, e?.stack || '', `player=${state.playerName}`);
      }
      return { metal: 0, crystal: 0, deuterium: 0, energyProd: 0, energyCons: 0, energyBalance: 0, ratio: 1 };
    }
  }, [state.playerName]);

  const currentPlanet = state.planets?.find(p => p.id === state.currentPlanetId) || state.planets?.[0];
  const production = useMemo(() => currentPlanet ? safeCalcProduction(
    currentPlanet.buildings, state.research || {}, currentPlanet.temperature, GAME_SPEED,
    currentPlanet.faction || 'human', currentPlanet.biome, currentPlanet.gravity, currentPlanet.trait,
    currentPlanet.specialization, { galaxy: currentPlanet.galaxy, system: currentPlanet.system, position: currentPlanet.position },
    state.ministries?.economy?.taxRate || 0
  ) : { metal: 0, crystal: 0, deuterium: 0, energyBalance: 0, ratio: 1 }, [currentPlanet, state.research, state.ministries, safeCalcProduction]);
  const storage = useMemo(() => currentPlanet ? calcStorage(currentPlanet.buildings) : { metal: 0, crystal: 0, deuterium: 0 }, [currentPlanet]);

  // TICK interval (wrapped for disk logging on reducer errors)
  useEffect(() => {
    if (!state.gameStarted) return;
    const interval = setInterval(() => {
      try {
        dispatch({ type: 'TICK' });
        auditGameState(stateRef.current || state, production);
      } catch (e) {
        console.error('[Ascensión] TICK dispatch error:', e);
        logTelemetry('ERROR', 'Excepción en ciclo de juego (TICK)', {
          error: e?.message || e,
          stack: e?.stack || '',
          stateSnapshot: {
            playerName: state.playerName,
            gameTick: state.gameTick,
            planetsCount: (state.planets || []).length,
          },
        });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.gameStarted, production]);

  // Offline progress (safer: higher threshold, hard cap, one-time guard)
  const offlineProcessedRef = useRef(false);
  // Refs for rich offline feedback
  const offlineResourcesBeforeRef = useRef(null);
  const offlineEventsBeforeRef = useRef(null);

  useEffect(() => {
    if (!state.gameStarted || !state.lastTick || !ready || offlineProcessedRef.current) return;
    const elapsed = (Date.now() - state.lastTick) / 1000;
    if (elapsed <= 300) return; // only simulate if > 5 minutes offline
    const totalTicks = Math.min(Math.floor(elapsed), 1800); // max ~30 min simulation
    offlineProcessedRef.current = true;

    // Snapshot empire resources + events BEFORE simulation (for detailed feedback)
    const totalsBefore = {
      metal: (state.planets || []).reduce((sum, p) => sum + (p.resources?.metal || 0), 0),
      crystal: (state.planets || []).reduce((sum, p) => sum + (p.resources?.crystal || 0), 0),
      deuterium: (state.planets || []).reduce((sum, p) => sum + (p.resources?.deuterium || 0), 0),
    };
    offlineResourcesBeforeRef.current = totalsBefore;
    offlineEventsBeforeRef.current = {
      notifs: (state.notifications || []).length,
      galactic: (state.galacticEvents || []).length,
    };

    let completed = 0;
    const CHUNK = 200;
    const tickBatch = () => {
      const limit = Math.min(completed + CHUNK, totalTicks);
      for (let i = completed; i < limit; i++) {
        try {
          dispatch({ type: 'TICK' });
        } catch (e) {
          console.error('[Ascensión] Offline TICK error:', e);
          if (window.electronAPI && window.electronAPI.logError) {
            const snap = stateRef.current || state;
            window.electronAPI.logError(`Offline TICK error: ${e?.message || e}`, e?.stack || '', `offlineTick player=${snap.playerName} missions=${(snap.fleetMissions||[]).length}`);
          }
          break; // stop batch on error to avoid cascade
        }
      }
      completed = limit;
      if (completed < totalTicks) {
        requestAnimationFrame(tickBatch);
      } else {
        const hours = Math.floor(totalTicks / 3600);
        const mins = Math.floor((totalTicks % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        // Compute rich deltas for per-resource + events feedback
        const snap = stateRef.current;
        const before = offlineResourcesBeforeRef.current || { metal: 0, crystal: 0, deuterium: 0 };
        const after = {
          metal: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.metal || 0), 0),
          crystal: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.crystal || 0), 0),
          deuterium: (snap?.planets || []).reduce((sum, p) => sum + (p.resources?.deuterium || 0), 0),
        };
        const dMetal = Math.max(0, Math.floor(after.metal - before.metal));
        const dCrystal = Math.max(0, Math.floor(after.crystal - before.crystal));
        const dDeuterium = Math.max(0, Math.floor(after.deuterium - before.deuterium));

        const evBefore = offlineEventsBeforeRef.current || { notifs: 0, galactic: 0 };
        const notifNow = (snap?.notifications || []).length;
        const galNow = (snap?.galacticEvents || []).length;
        const processed = (notifNow - evBefore.notifs) + (galNow - evBefore.galactic);

        const richMessage = `⏱️ Progreso offline: ${timeStr} simulados\n⛏️ +${fmt(dMetal)} Metal  💎 +${fmt(dCrystal)} Cristal  ⚗️ +${fmt(dDeuterium)} Deuterio\n📡 ${processed} eventos/notificaciones procesados durante tu ausencia`;

        dispatch({ type: 'ADD_NOTIFICATION', payload: {
          type: 'success',
          message: richMessage
        }});

        // Clear snapshots
        offlineResourcesBeforeRef.current = null;
        offlineEventsBeforeRef.current = null;
      }
    };
    const rafId = requestAnimationFrame(tickBatch);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Cleanup welcome timeout on unmount
  useEffect(() => {
    return () => {
      if (startWelcomeTimeoutRef.current) clearTimeout(startWelcomeTimeoutRef.current);
    };
  }, []);

  // Auto-save every 30s (proper interval) — uses named save system
  useEffect(() => {
    if (!state.gameStarted || !window.electronAPI || resettingRef.current) return;

    const interval = setInterval(() => {
      if (resettingRef.current) return; // Critical: block any late ticks after user chose reset
      const snap = saveRef.current;
      const missions = (snap.fleetMissions || []).length;
      const qLens = `b${(snap.buildQueue||[]).length}s${(snap.shipQueue||[]).length}r${(snap.researchQueue||[]).length}`;
      console.log(`[Ascensión] Auto-save start | missions=${missions} queues=${qLens}`);
      window.electronAPI.saveGameNamed(snap).then(r => {
        if (r.success) {
          setLastSave(Date.now());
          console.log('[Ascensión] Auto-save ok');
        } else if (window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save failed: ${r.error || 'unknown'}`, '', `missions=${missions}`);
        }
      }).catch(e => {
        console.error('Auto-save error:', e);
        if (window.electronAPI && window.electronAPI.logError) {
          window.electronAPI.logError(`Auto-save exception: ${e?.message || e}`, e?.stack || '', `missions=${missions}`);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [state.gameStarted]);

  // Save on unload — uses named save system
  useEffect(() => {
    if (!state.gameStarted || resettingRef.current) return;
    const handler = () => {
      if (resettingRef.current) return; // Critical: do not save on unload if user is resetting
      if (window.electronAPI) {
        const snap = saveRef.current;
        const missions = (snap.fleetMissions || []).length;
        console.log(`[Ascensión] Save-on-unload | missions=${missions}`);
        try {
          // saveGameSync writes to legacy path; for named saves we use sync invoke to guarantee finish before unload
          window.electronAPI.saveGameNamedSync(snap);
        } catch (e) {
          if (window.electronAPI.logError) {
            window.electronAPI.logError(`Save-on-unload error: ${e?.message || e}`, e?.stack || '', `missions=${missions}`);
          }
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.gameStarted]);

  // Audio: init on first click
  useEffect(() => {
    const handler = () => { window.removeEventListener('click', handler); };
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, []);

  const safeSfx = useCallback((fn, ...args) => { if (effectiveSoundEnabled) fn(...args); }, [effectiveSoundEnabled]);

  // Audio: UI click + hover sounds via event delegation with dynamic stereo panning
  useEffect(() => {
    if (!state.gameStarted) return;
    const clickHandler = (e) => {
      const target = e.target.closest('button, [role="button"], .tab-btn, .sidebarTab');
      if (target) {
        const now = Date.now();
        if (now - lastClickTimeRef.current > 120) {
          lastClickTimeRef.current = now;
          // Evitar reproducir sfx.uiClick si es una pestaña (ya que el efecto de cambio de pestaña ejecuta sfx.uiTab)
          const isTab = target.closest('.sidebarTab') || target.classList.contains('sidebarTab') || target.closest('.tab-btn');
          if (!isTab) {
            const pan = e.clientX ? (e.clientX / window.innerWidth) * 2 - 1 : 0;
            safeSfx(sfx.uiClick, pan);
          }
        }
      }
    };
    const hoverHandler = (e) => {
      const target = e.target.closest('button, [role="button"], .tab-btn, .sidebarTab');
      if (target && target !== lastHoverTargetRef.current) {
        const now = Date.now();
        if (now - lastHoverTimeRef.current > 80) {
          lastHoverTargetRef.current = target;
          lastHoverTimeRef.current = now;
          const pan = e.clientX ? (e.clientX / window.innerWidth) * 2 - 1 : 0;
          safeSfx(sfx.uiHover, pan);
        }
      }
    };
    const mouseOutHandler = (e) => {
      const target = e.target.closest('button, [role="button"], .tab-btn, .sidebarTab');
      if (!target) {
        lastHoverTargetRef.current = null;
      }
    };
    document.addEventListener('click', clickHandler);
    document.addEventListener('mouseover', hoverHandler, true);
    document.addEventListener('mouseout', mouseOutHandler, true);
    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('mouseover', hoverHandler, true);
      document.removeEventListener('mouseout', mouseOutHandler, true);
    };
  }, [state.gameStarted, safeSfx]);

  // Audio: notification sounds
  const prevNotifLen = useRef(0);
  useEffect(() => {
    const n = state.notifications || [];
    if (n.length > prevNotifLen.current) {
      const last = n[n.length - 1];
      const msg = last.message || '';
      if (msg.includes('Autogestión') || msg.includes('Auto-Ruta')) {
        // Auto actions are silent
      } else if (last.isMission) {
        safeSfx(sfx.milestone);
      } else if (msg.includes('cancelada') || msg.includes('cancelado')) {
        if (msg.includes('Investigación')) safeSfx(sfx.researchCancel);
        else safeSfx(sfx.buildCancel);
      } else if (msg.includes('Tratado') || msg.includes('Alianza')) {
        safeSfx(sfx.diploTreaty);
      } else if (msg.includes('guerra') || msg.includes('Guerra')) {
        safeSfx(sfx.diploWar);
      } else if (msg.includes('tributo') || msg.includes('Tributo')) {
        safeSfx(sfx.diploTribute);
      } else if (last.type === 'success') {
        safeSfx(sfx.success);
      } else if (last.type === 'error') {
        safeSfx(sfx.error);
      } else if (last.type === 'warning') {
        safeSfx(sfx.warn);
      } else {
        safeSfx(sfx.notify);
      }
    }
    prevNotifLen.current = n.length;
  }, [state.notifications, safeSfx]);

  // Audio: play/resume music and AudioContext on first user click/keydown to bypass browser policy
  useEffect(() => {
    const handleFirstInteraction = () => {
      playMenuMusic();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    
    // Play music initially if already allowed
    playMenuMusic();
    
    if (state.gameStarted) {
      startAmbient();
    } else {
      stopAmbient();
    }
    
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      stopAmbient();
      stopMenuMusic();
    };
  }, [state.gameStarted, effectiveSoundEnabled]);

  // Audio: combat log
  const prevCombatLen = useRef(0);
  useEffect(() => {
    if (!state.gameStarted) return;
    const n = state.combatLog?.length || 0;
    if (n > prevCombatLen.current) safeSfx(sfx.combat);
    prevCombatLen.current = n;
  }, [state.combatLog, state.gameStarted, safeSfx]);

  // Audio: spy reports
  const prevSpyLen = useRef(0);
  useEffect(() => {
    if (!state.gameStarted) return;
    const n = state.spyReports?.length || 0;
    if (n > prevSpyLen.current) safeSfx(sfx.notifyInfo);
    prevSpyLen.current = n;
  }, [state.spyReports, state.gameStarted, safeSfx]);

  // Audio: new federation formed (diplomacy depth)
  const prevFedLen = useRef(0);
  useEffect(() => {
    if (!state.gameStarted) return;
    const n = (state.federations || []).length;
    if (n > prevFedLen.current) safeSfx(sfx.federationFormed);
    prevFedLen.current = n;
  }, [state.federations, state.gameStarted, safeSfx]);

  // Audio: fleet missions arriving
  const prevFleetLen = useRef(0);
  useEffect(() => {
    if (!state.gameStarted) return;
    const n = state.fleetMissions?.length || 0;
    if (n < prevFleetLen.current) safeSfx(sfx.fleetArrive);
    prevFleetLen.current = n;
  }, [state.fleetMissions, state.gameStarted, safeSfx]);

  // Audio: events
  const prevEventsLen = useRef(0);
  useEffect(() => {
    if (!state.gameStarted) return;
    const n = state.events?.length || 0;
    if (n > prevEventsLen.current) {
      const last = state.events[n - 1];
      if (last.id === 'alien') safeSfx(sfx.eventAlien);
      else if (last.id === 'asteroid') safeSfx(sfx.eventAsteroid);
      else if (last.id === 'storm') safeSfx(sfx.eventStorm);
      else if (last.id === 'merchant') safeSfx(sfx.eventMerchant);
      else if (last.id === 'nebula') safeSfx(sfx.eventNebula);
      else safeSfx(sfx.event);
    }
    prevEventsLen.current = n;
  }, [state.events, state.gameStarted, safeSfx]);

  // Audio: tab switch
  const prevTab = useRef(activeTab);
  useEffect(() => {
    if (prevTab.current !== activeTab) { safeSfx(sfx.uiTab); prevTab.current = activeTab; }
  }, [activeTab, safeSfx]);
  // Audio: planet switch
  const prevPlanet = useRef(state.currentPlanetId);
  useEffect(() => {
    if (prevPlanet.current !== state.currentPlanetId) { safeSfx(sfx.uiPlanet); prevPlanet.current = state.currentPlanetId; }
  }, [state.currentPlanetId, safeSfx]);

  const tabs = [
    { id: 'overview', label: t('tabOverview') },
    { id: 'missions', label: t('tabMissions') },
    { id: 'buildings', label: t('tabBuildings') },
    { id: 'research', label: t('tabResearch') },
    { id: 'techTree', label: t('tabTechTree'), parent: 'research' },
    { id: 'shipyard', label: t('tabShipyard') },
    { id: 'shipDesign', label: t('tabShipDesign'), parent: 'shipyard' },
    { id: 'defense', label: t('tabDefense') },
    { id: 'missiles', label: t('tabMissiles'), parent: 'defense' },
    { id: 'galaxy', label: t('tabGalaxy') },
    { id: 'fleet', label: t('tabFleet') },
    { id: 'combat', label: t('tabCombat') },
    { id: 'stats', label: t('tabStats') },
    { id: 'moon', label: t('tabMoon') },
    { id: 'communications', label: '📡 Comunicaciones' },
    { id: 'diplomacy', label: t('tabDiplomacy') },
    { id: 'government', label: '🏛️ Gobierno' },
  ];
  // Gating for advanced tabs: closer to original "single screen" / progressive reveal vision.
  // Early game shows fewer tabs; complexity unlocks with research/buildings.
  // No menus or selectors – purely state-driven.
  const isTabVisible = (id) => {
    const p = currentPlanet || state.planets?.[0];
    if (!p) return ['overview', 'missions'].includes(id);
    switch (id) {
      case 'communications':
        return true;
      case 'research':
      case 'techTree':
        return (p.buildings?.researchLab || 0) >= 1;
      case 'shipyard':
      case 'defense':
        return (p.buildings?.shipyard || 0) >= 1;
      case 'missiles':
        return (p.buildings?.missileSilo || 0) >= 1;
      case 'galaxy':
      case 'fleet':
      case 'combat':
        return (state.research?.weapons || 0) >= 1 || Object.keys(p.fleet || {}).some(k => (p.fleet[k] || 0) > 0);
      case 'moon':
        return !!p.moon || (p.buildings?.lunarBase || 0) >= 1;
      case 'shipDesign':
        return (p.buildings?.customShipyard || 0) >= 1;
      case 'diplomacy':
        return (state.aiPlanets || []).length > 0 || (p.buildings?.diploCenter || 0) >= 1;
      case 'stats':
        return ((state.combatsWon || 0) + (state.combatsLost || 0)) > 0;
      default:
        return true;
    }
  };

  const visibleTabs = useMemo(() => tabs.filter(t => isTabVisible(t.id)), [state.planets, state.currentPlanetId, state.research, state.aiPlanets, state.combatsWon, state.combatsLost, state.eventLog, currentPlanet]);

  // Ensure active tab is always visible (e.g. after load or gating change)
  useEffect(() => {
    if (!visibleTabs.some(t => t.id === activeTab)) {
      setActiveTab('overview');
    }
  }, [visibleTabs, activeTab]);

  const safeSetActiveTab = (id) => {
    if (visibleTabs.some(t => t.id === id)) {
      setActiveTab(id);
    } else {
      setActiveTab('overview');
    }
  };

  const unreadNotifs = (state.notifications || []).filter(n => !n.read && n.type !== 'success').length;
  const attackMissions = (state.fleetMissions || []).filter(m => m.type === 'attack' && m.isAI && m.remainingTicks <= 300);

  // Atajos de teclado
  const [showShortcuts, setShowShortcuts] = useState(false);

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Cambiar de pestaña con números (1-9 + 0 para las últimas)
      const keyNum = parseInt(e.key);
      if (!isNaN(keyNum)) {
        const idx = keyNum === 0 ? 9 : keyNum - 1;
        if (idx >= 0 && idx < visibleTabs.length) {
          setActiveTab(visibleTabs[idx].id);
          return;
        }
      }

      // Atajos de letra (teclado)
      const k = e.key.toLowerCase();
      const letterMap = {
        'r': 'research',
        'a': 'shipyard',
        'f': 'fleet',
        'g': 'galaxy',
        'd': 'defense',
        'm': 'missiles',
        'o': 'overview',
        'p': 'missions',
        'c': 'combat',
        's': 'stats',
        'l': 'moon',
        't': 'techTree',
        'i': 'diplomacy',
        'b': 'shipDesign',
      };
      if (letterMap[k]) {
        safeSetActiveTab(letterMap[k]);
        e.preventDefault();
        return;
      }

      // Escape: cerrar cosas
      if (e.key === 'Escape') {
        const snap = stateRef.current;
        if (snap) {
          if (snap.activeEvent) {
            dispatch({ type: 'CLEAR_ACTIVE_EVENT' });
          }
          if (snap.activeFirstContact) {
            dispatch({ type: 'DISMISS_FIRST_CONTACT' });
          }
          if (snap.activeTransmission) {
            dispatch({ type: 'DISMISS_TRANSMISSION' });
          }
        }
        setRenaming(false);
        setShowShortcuts(false);
        setSettingsOpen(false);
        setActiveCodexId(null);
      }

      // ? : toggle ayuda de atajos
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }

      // Flechas para planetas (ya existente, mejorado)
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const snap = stateRef.current;
        if (snap && snap.planets.length > 0) {
          const currentIdx = snap.planets.findIndex(p => p.id === snap.currentPlanetId);
          if (currentIdx !== -1) {
            let newIdx = currentIdx;
            if (e.key === 'ArrowRight') newIdx = (currentIdx + 1) % snap.planets.length;
            if (e.key === 'ArrowLeft') newIdx = (currentIdx - 1 + snap.planets.length) % snap.planets.length;
            dispatch({ type: 'SET_PLANET', payload: snap.planets[newIdx].id });
          }
        }
      }

      // [ y ] para cambiar pestaña rápidamente
      if (e.key === '[' || e.key === ']') {
        const currentIdx = visibleTabs.findIndex(t => t.id === activeTabRef.current);
        let newIdx = currentIdx;
        if (e.key === ']') newIdx = (currentIdx + 1) % visibleTabs.length;
        if (e.key === '[') newIdx = (currentIdx - 1 + visibleTabs.length) % visibleTabs.length;
        setActiveTab(visibleTabs[newIdx].id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch, visibleTabs]);

  const startWelcomeTimeoutRef = useRef(null);
  const handleStart = (name, mode = 'standard') => {
    // Fixed difficulty: easy (hidden). Default faction per rules (no selector).
    const initial = createInitial(name, 'human', mode);
    dispatch({ type: 'LOAD', payload: initial });

    // Mejora bienvenida + primeras notificaciones + guías sutiles iniciales (no invasivas)
    // Dispara notificaciones automáticas al comenzar nueva partida (guías iniciales)
    if (startWelcomeTimeoutRef.current) clearTimeout(startWelcomeTimeoutRef.current);
    startWelcomeTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'info',
        message: '🚀 Bienvenido, Comandante. Tu imperio espacial comienza ahora.'
      }});
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'info',
        message: '⛏️ Primer paso: Construye Minas de Metal y Cristal para generar recursos básicos.'
      }});
      dispatch({ type: 'ADD_NOTIFICATION', payload: {
        type: 'info',
        message: '🔬 Consejo: Investiga Combustión pronto para desbloquear tus primeras naves y explorar.'
      }});
    }, 650);
  };

  // Reset logic was previously fixed in reducer + handle. Save management now lives in the menu/settings flow.

  // === MAIN MENU HANDLERS ===
  const handleMenuContinue = async () => {
    if (availableSaves.length === 0) return;
    const last = availableSaves[0];
    if (window.electronAPI && window.electronAPI.loadSaveBySlug) {
      const result = await window.electronAPI.loadSaveBySlug(last.slug);
      if (result.success && result.data) {
        dispatch({ type: 'LOAD', payload: result.data });
      }
    }
  };

  const handleMenuNewGame = () => setMenuScreen('new');

  const handleMenuLoadGame = () => {
    setMenuScreen('load');
  };

  const handleMenuImport = async () => {
    if (!window.electronAPI || !window.electronAPI.importSaveFromFile) return;
    const result = await window.electronAPI.importSaveFromFile();
    if (result.success && result.data) {
      // Cargar directamente la partida importada
      dispatch({ type: 'LOAD', payload: result.data });
    } else if (result.error) {
      alert('Error al importar: ' + result.error);
    }
  };

  const handleMenuExport = async () => {
    // Si hay partida activa, exportarla; si no, avisar
    if (!state.gameStarted) {
      alert('No hay partida activa para exportar. Inicia o carga una partida primero.');
      return;
    }
    const result = await window.electronAPI.exportSaveToFile(state, state.playerName || 'partida');
    if (result.success) {
      alert('Partida exportada a: ' + result.path);
    } else if (result.error) {
      alert('Error al exportar: ' + result.error);
    }
  };

  const handleMenuExit = () => {
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    } else {
      window.close();
    }
  };

  const handleLoadFromList = async (slug) => {
    const result = await window.electronAPI.loadSaveBySlug(slug);
    if (result.success && result.data) {
      dispatch({ type: 'LOAD', payload: result.data });
    } else {
      alert('Error al cargar: ' + (result.error || 'desconocido'));
    }
  };

  // === IN-GAME SETTINGS HANDLERS ===
  const requireElectronAPI = () => {
    if (!window.electronAPI) {
      return { success: false, error: 'Funcionalidad de guardado no disponible (modo navegador). Ejecuta la app desde Electron.' };
    }
    return null;
  };

  const handleInGameSave = async (name) => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const snap = { ...saveRef.current, playerName: name };
    const result = await window.electronAPI.saveGameNamed(snap);
    if (result.success) {
      const list = await window.electronAPI.listSaves();
      if (list.success) setAvailableSaves(list.saves || []);
    }
    return result;
  };

  const handleInGameLoad = async (slug) => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.loadSaveBySlug(slug);
    if (result.success && result.data) {
      dispatch({ type: 'LOAD', payload: result.data });
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const handleInGameImport = async () => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.importSaveFromFile();
    if (result.success && result.data) {
      dispatch({ type: 'LOAD', payload: result.data });
      return { success: true };
    }
    return { success: false, error: result.error || 'Importación cancelada' };
  };

  const handleInGameExport = async () => {
    const guard = requireElectronAPI();
    if (guard) return guard;
    const result = await window.electronAPI.exportSaveToFile(saveRef.current, saveRef.current.playerName || 'partida');
    return result;
  };

  const handleReturnToMenu = () => {
    resettingRef.current = true;
    stopAmbient();
    dispatch({ type: 'RESET_GAME' });
  };

  if (!ready) {
    return <LoadingScreen onForceReady={() => setReady(true)} />;
  }

  if (!state.gameStarted) {
    if (menuScreen === 'new') {
      return <NewGameScreen onConfirm={handleStart} onBack={() => setMenuScreen('main')} />;
    }
    if (menuScreen === 'load') {
      return <LoadGameScreen onBack={() => setMenuScreen('main')} onLoad={handleLoadFromList} />;
    }
    return (
      <MainMenu
        onContinue={handleMenuContinue}
        onNewGame={handleMenuNewGame}
        onLoadGame={handleMenuLoadGame}
        onImport={handleMenuImport}
        onExport={handleMenuExport}
        onExit={handleMenuExit}
        hasSaves={availableSaves.length > 0}
        lastSaveName={lastSaveName}
      />
    );
  }

  if (!currentPlanet) {
    return <div className={S.page + ' flex items-center justify-center'}>Cargando...</div>;
  }

  return (
    <div className={S.page + ' flex flex-col min-h-screen'}>
      <StarField />
      
      {/* Alerta Roja de Emergencia */}
      <RedAlertOverlay missions={attackMissions} />
      
      {/* Narrative Events Overlay */}
      <NarrativeEventOverlay event={state.activeEvent} dispatch={dispatch} resources={currentPlanet.resources} />

      {/* Cinematic post-processing overlays (Unreal engine depth + film) */}
      <div className="fixed inset-0 pointer-events-none z-30 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.68)_96%)] vignette" />
      <div className="fixed inset-0 pointer-events-none z-30 opacity-[0.022] bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(255,255,255,0.7)_2px,rgba(255,255,255,0.7)_3px)] filmgrain" />
      {/* Subtle engine grid overlay for HUD authenticity */}
      <div className="fixed inset-0 pointer-events-none z-30 opacity-[0.008] bg-[linear-gradient(rgba(6,182,212,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.15)_1px,transparent_1px)]" style={{ backgroundSize: '28px 28px' }} />

      {/* DOM SUPERIOR */}
      {/* Logo: rectángulo independiente sobre el sidebar, mismo ancho (w-52), alineado perfectamente */}
      <div className="fixed top-0 left-0 z-50 w-52 h-16 bg-[#0a0d1a] border-b border-r border-white/10 flex items-center justify-center" aria-label="Logo de Ascensión">
        <img
          src={asset('logo-ascension.png')}
          alt="Ascensión"
          className="h-full w-auto object-contain py-0.5 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]"
          draggable={false}
        />
      </div>

      {/* Header: arranca tras el logo, ocupa resto del ancho */}
      <header className="fixed top-0 left-0 md:left-52 right-0 z-50 flex items-center justify-between h-16 bg-[#0a0d1a] border-b border-white/10 fresnel pointer-events-auto pl-6 pr-72">
        {/* CENTER: Recursos — metal, cristal, deuterio, energia, reputacion galactica */}
        <div className="flex-1 flex items-center justify-start gap-unit h-full min-w-0">
          <ResourceBar 
            planet={currentPlanet} 
            research={state.research} 
            reputation={state.reputation} 
            taxRate={state.ministries?.economy?.taxRate || 0}
            calcProduction={safeCalcProduction}
            calcStorage={calcStorage}
            getGalacticAlignment={getGalacticAlignment}
            GAME_SPEED={GAME_SPEED}
          />
        </div>

        {/* RIGHT: Controles — 🔊💾📂📥📤⚙️ pegados al borde derecho */}
        <div className="flex items-center gap-1.5 shrink-0 mr-4">
          <AttackAlert count={state.fleetMissions?.filter(m => m.type === 'attack' && m.isAI)?.length || 0} onClick={() => safeSetActiveTab('fleet')} />
          <BadgeCounter count={unreadNotifs} onClick={() => safeSetActiveTab('communications')} />
          
          {/* Silenciar */}
          <button
            onClick={toggleSound}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 border-2 border-amber-400 text-amber-200 hover:bg-amber-500/30 transition-all cursor-pointer"
            title={effectiveSoundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            aria-label={effectiveSoundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {effectiveSoundEnabled ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M3,9v6h4l5,5V4L7,9H3z M16.5,12c0-1.77-1.02-3.29-2.5-4.03v8.05C15.48,15.29,16.5,13.77,16.5,12z M14,3.23v2.06c2.89,0.86,5,3.54,5,6.71s-2.11,5.85-5,6.71v2.06c4.01-0.91,7-4.49,7-8.77S18.01,4.14,14,3.23z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16.5,12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45,2.45C16.42,12.42,16.5,12.21,16.5,12z M19,12c0,0.94-0.2,1.82-0.54,2.64l1.51,1.51C20.63,14.91,21,13.5,21,12c0-4.28-2.99-7.86-7-8.77v2.06C16.89,6.15,19,8.83,19,12z M4.27,3L3,4.27L7.73,9H3v6h4l5,5v-6.73l4.25,4.25C15.53,18.08,14.8,18.47,14,18.6v2.06c1.33-0.19,2.53-0.78,3.53-1.62l2.2,2.2l1.27-1.27L4.27,3z M12,4L9.91,6.09L12,8.18V4z"/>
              </svg>
            )}
          </button>

          {/* Ajustes */}
          <button
            onClick={() => { setSettingsTab('menu'); setSettingsOpen(true); }}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-500/20 border-2 border-slate-400 text-slate-200 hover:bg-slate-500/30 transition-all cursor-pointer"
            title="Ajustes"
            aria-label="Ajustes"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 c-0.12,0.21-0.08,0.47,0.12,0.61l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.70,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* In-Game Settings Menu (modal) */}
      {settingsOpen && (
        <SettingsMenu
          onClose={() => setSettingsOpen(false)}
          onSave={handleInGameSave}
          onLoad={handleInGameLoad}
          onImport={handleInGameImport}
          onExport={handleInGameExport}
          soundEnabled={effectiveSoundEnabled}
          onToggleSound={toggleSound}
          onReturnToMenu={handleReturnToMenu}
          initialTab={settingsTab}
        />
      )}
      {/* Planet Selector */}
      {state.planets.length > 1 && (
        <div className="absolute top-16 left-0 md:left-52 right-0 z-50 border-b border-white/10 bg-[#05070f]/70 px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {state.planets.map(p =>
              p.id === state.currentPlanetId ? (
                <div key={p.id} className={`${S.planetPill} ${S.planetPillActive} flex items-center gap-2 pr-1.5`}>
                  {renaming ? (
                    <input autoFocus className={S.input + ' text-sm py-0.5 px-1.5 max-w-[120px]'} defaultValue={currentPlanet.name}
                      maxLength={20}
                      onKeyDown={e => { if (e.key === 'Enter') { dispatch({ type: 'RENAME_PLANET', planetId: currentPlanet.id, name: e.target.value }); setRenaming(false); } if (e.key === 'Escape') setRenaming(false); }}
                      onBlur={e => { dispatch({ type: 'RENAME_PLANET', planetId: currentPlanet.id, name: e.target.value }); setRenaming(false); }} />
                  ) : (
                    <>
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-[10px] opacity-60">[{p.galaxy}:{p.system}:{p.position}]</span>
                      <button onClick={() => setRenaming(true)} className="ml-1 cursor-pointer hover:text-[var(--ue-accent)] opacity-50 hover:opacity-100 transition-all text-xs" title="Renombrar">✏️</button>
                    </>
                  )}
                </div>
              ) : (
                <div key={p.id} className={`${S.planetPill} ${S.planetPillInactive} flex items-center gap-2 pr-1.5`}>
                  <span onClick={() => dispatch({ type: 'SET_PLANET', payload: p.id })} className="cursor-pointer font-semibold">{p.name}</span>
                  <span className="text-[10px] opacity-65">[{p.galaxy}:{p.system}:{p.position}]</span>
                  <button onClick={() => { dispatch({ type: 'SET_PLANET', payload: p.id }); setTimeout(() => setRenaming(true), 50); }} className="ml-1 cursor-pointer hover:text-[var(--ue-accent)] opacity-40 hover:opacity-100 transition-all text-xs" title="Renombrar">✏️</button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full relative z-40">
        <aside className="hidden md:flex flex-col w-52 shrink-0 glass-deep border-r border-white/10 pt-2 pb-1.5 gap-0.5 fresnel pointer-events-auto">
          {visibleTabs.filter(t => !t.parent || activeTab === t.parent || activeTab === t.id).map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`${S.sidebarTab} ${activeTab === t.id ? S.sidebarTabActive : S.sidebarTabInactive} pointer-events-auto ${t.parent ? 'ml-6 pl-2 pr-2 py-1.5 text-xs w-[calc(100%-2rem)] opacity-80 border-l border-white/10 hover:border-[var(--ue-accent)]/45' : ''}`}
            >
              <span className={`${t.parent ? 'text-xs w-4' : 'text-lg w-6'} text-center shrink-0 text-white`}>{t.label.split(' ')[0]}</span>
              <span className={`truncate text-white ${t.parent ? 'font-medium' : 'font-semibold'}`}>{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </aside>

        {/* Mobile bottom nav - HUD style */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-deep border-t border-white/10 flex overflow-x-auto py-1.5 px-2 gap-1 pointer-events-auto">
          {visibleTabs.filter(t => !t.parent || activeTab === t.parent || activeTab === t.id).map(t => (
            <button key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] transition-all shrink-0 pointer-events-auto ${activeTab === t.id ? 'text-white bg-[var(--ue-accent)]/15 border border-[var(--ue-accent)]/40 emissive-cyan font-semibold' : 'text-white hover:text-white'} ${t.parent ? 'opacity-80 scale-95 border-l border-white/5 pl-1' : ''}`}
            >
              <span className="text-base">{t.label.split(' ')[0]}</span>
              <span className="truncate max-w-[60px]">{t.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className={`flex-1 px-4 pb-20 md:pb-4 ${state.planets.length > 1 ? 'pt-14' : 'pt-2'} overflow-x-hidden`}>
          <Suspense fallback={<div className="text-center text-slate-500 py-12">Cargando módulo...</div>}>
            {activeTab === 'overview' && <OverviewPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} production={production} storage={storage} MISSIONS={MISSIONS} BUILDINGS={BUILDINGS} RESEARCH={RESEARCH} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} QueueDisplay={QueueDisplay} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} isOutdated={isOutdated} onOpenCodex={onOpenCodex} />}
            {activeTab === 'missions' && <MissionsPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} setActiveTab={safeSetActiveTab} MISSIONS={MISSIONS} S={S} onOpenCodex={onOpenCodex} />}
            {activeTab === 'buildings' && <BuildingsPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} BUILDINGS={BUILDINGS} RESEARCH={RESEARCH} S={S} ItemCard={ItemCardWithCodex} buildingCost={buildingCost} calcBuildTime={calcBuildTime} meetsReq={meetsReq} buildingProdInfo={buildingProdInfo} canAfford={canAfford} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
            {activeTab === 'research' && <ResearchPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} RESEARCH={RESEARCH} BUILDINGS={BUILDINGS} S={S} ItemCard={ItemCardWithCodex} researchCost={researchCost} calcResearchTime={calcResearchTime} meetsReq={meetsReq} researchEffectInfo={researchEffectInfo} canAfford={canAfford} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
            {activeTab === 'shipyard' && <ShipyardPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} SHIPS={SHIPS} RESEARCH={RESEARCH} BUILDINGS={BUILDINGS} S={S} SafeImg={SafeImg} CardBanner={CardBanner} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} shipCost={shipCost} calcShipTime={calcShipTime} meetsReq={meetsReq} getShipStats={getShipStats} canAfford={canAfford} constructionDiscount={constructionDiscount} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
            {activeTab === 'defense' && <DefensePage state={state} dispatch={dispatch} currentPlanet={currentPlanet} DEFENSES={DEFENSES} RESEARCH={RESEARCH} S={S} SafeImg={SafeImg} CardBanner={CardBanner} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} defenseCost={defenseCost} calcDefenseTime={calcDefenseTime} meetsReq={meetsReq} getDefenseStats={getDefenseStats} getEffectiveTech={getEffectiveTech} canAfford={canAfford} constructionDiscount={constructionDiscount} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
            {activeTab === 'missiles' && <MissilesPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} MISSILES={MISSILES} S={S} fmt={fmt} canAfford={canAfford} constructionDiscount={constructionDiscount} onOpenCodex={onOpenCodex} />}
            {activeTab === 'galaxy' && <GalaxyPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} setSelectedTarget={setSelectedTarget} setActiveTab={safeSetActiveTab} S={S} fmt={fmt} fmtTime={fmtTime} onOpenCodex={onOpenCodex} />}
            {activeTab === 'fleet' && <FleetPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} selectedTarget={selectedTarget} setSelectedTarget={setSelectedTarget} SHIPS={SHIPS} DEFENSES={DEFENSES} BUILDINGS={BUILDINGS} SHIP_CHASSIS={SHIP_CHASSIS} S={S} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} getEffectiveTech={getEffectiveTech} simulateCombat={simulateCombat} getShipStats={getShipStats} calcCustomShipStats={calcCustomShipStats} onOpenCodex={onOpenCodex} />}
            {activeTab === 'combat' && <CombatPage state={state} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} ProgressBar={ProgressBar} fmt={fmt} onOpenCodex={onOpenCodex} />}
            {activeTab === 'stats' && <StatsPage state={state} ACHIEVEMENTS={ACHIEVEMENTS} SHIPS={SHIPS} DEFENSES={DEFENSES} S={S} fmt={fmt} fmtTime={fmtTime} onOpenCodex={onOpenCodex} />}
            {activeTab === 'moon' && <MoonPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} MOON_BUILDINGS={MOON_BUILDINGS} S={S} fmt={fmt} fmtTime={fmtTime} meetsReq={meetsReq} canAfford={canAfford} constructionDiscount={constructionDiscount} onOpenCodex={onOpenCodex} />}
            {activeTab === 'techTree' && <TechTreePage state={state} RESEARCH={RESEARCH} S={S} meetsReq={meetsReq} onOpenCodex={onOpenCodex} />}
            {activeTab === 'shipDesign' && <ShipDesignPage state={state} dispatch={dispatch} currentPlanet={currentPlanet} SHIP_CHASSIS={SHIP_CHASSIS} SHIP_WEAPONS={SHIP_WEAPONS} SHIP_ENGINES={SHIP_ENGINES} SHIP_SHIELDS={SHIP_SHIELDS} SHIP_MODULES={SHIP_MODULES} S={S} ProgressBar={ProgressBar} fmt={fmt} fmtTime={fmtTime} shipTimeBonus={shipTimeBonus} calcCustomShipStats={calcCustomShipStats} calcCustomShipCost={calcCustomShipCost} calcCustomShipTime={calcCustomShipTime} canAfford={canAfford} GAME_SPEED={GAME_SPEED} onOpenCodex={onOpenCodex} />}
            {activeTab === 'communications' && <CommunicationsPage state={state} dispatch={dispatch} S={S} onOpenCodex={onOpenCodex} />}
            {activeTab === 'government' && <GovernmentPage state={state} dispatch={dispatch} S={S} onOpenCodex={onOpenCodex} />}
            {activeTab === 'diplomacy' && <DiplomacyPage state={state} dispatch={dispatch} SHIPS={SHIPS} FACTIONS={FACTIONS} AI_STRATEGIES={AI_STRATEGIES} S={S} fmt={fmt} getGalacticAlignment={getGalacticAlignment} onOpenCodex={onOpenCodex} />}
          </Suspense>
        </main>      </div>

      {activeCodexId && (
        <CodexModal 
          id={activeCodexId} 
          onClose={() => setActiveCodexId(null)} 
          BUILDINGS={BUILDINGS}
          RESEARCH={RESEARCH}
          SHIPS={SHIPS}
          DEFENSES={DEFENSES}
        />
      )}

      {state.activeFirstContact && (
        <FirstContactOverlay 
          activeFirstContact={state.activeFirstContact}
          dispatch={dispatch}
        />
      )}

      {state.activeTransmission && (
        acceptTransmission ? (
          <ActiveTransmissionOverlay
            activeTransmission={state.activeTransmission}
            dispatch={dispatch}
          />
        ) : (
          <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-slate-900/95 border border-cyan-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-white pointer-events-auto backdrop-blur-md animate-in fade-in slide-in-from-top-4 font-mono">
            <div className="flex items-start gap-3">
              <span className="text-xl">📡</span>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold text-cyan-400">TRANSMISIÓN EN VIVO DETECTADA</h4>
                <p className="text-[10px] text-slate-300">Hay una transmisión en vivo entrante de {state.activeTransmission.name || 'Facción Desconocida'}. ¿Deseas aceptarla?</p>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setAcceptTransmission(true)} 
                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Aceptar
                  </button>
                  <button 
                    onClick={() => dispatch({ type: 'DISMISS_TRANSMISSION' })} 
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-medium transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      <footer className="relative z-20 text-center py-4 text-xs text-[var(--ue-text-dim)] border-t border-white/10 glass fresnel">
        © 2026 Aritz Bahamonde Larxé. All rights reserved. · v{APP_VERSION}
      </footer>
    </div>
  );
}

// ============ ERROR BOUNDARY CLASS ============
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070f] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="glass-deep holographic border border-red-500/30 rounded-2xl p-8 shadow-2xl fresnel specular">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Error Crítico Detectado</h1>
            <p className="text-slate-400 text-sm mb-6">
              El juego ha experimentado una excepción inesperada. Puedes intentar forzar un reintento o reiniciar la partida.
            </p>
            <pre className="bg-[#05070f]/80 p-3 rounded text-left text-xs font-mono text-red-300 overflow-auto max-h-32 mb-6 border border-red-950">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  if (this.props.onRetry) this.props.onRetry();
                  this.setState({ hasError: false, error: null });
                }}
                className={`${S.btn} ${S.btnDanger}`}
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className={`${S.btn} ${S.btnGhost}`}
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============ EXPORT CON ERROR BOUNDARY ============
export default function AppWithBoundary() {
  const [crashCount, setCrashCount] = useState(0);
  const handleRetry = () => setCrashCount(c => c + 1);
  return <ErrorBoundary key={crashCount} onRetry={handleRetry}><App /></ErrorBoundary>;
}
