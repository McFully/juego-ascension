import React, { useState, useEffect } from 'react';
import {
  getAudioSettings,
  setMasterVolume,
  setMusicVolume,
  setSfxVolume,
  setWarVolume,
  setVoiceVolume,
  setOperationsVolume,
  setMuted,
  setMuffle,
  sfx,
  speakText,
  playTrack,
  getCurrentBgMusic
} from '../../audio.js';
import { AudioMixerSettings } from '../settings/AudioMixerSettings.jsx';
import { SaveLoadSettings } from '../settings/SaveLoadSettings.jsx';

const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev');
const GAME_CREDITS = 'Aritz Bahamonde Larxé';

export const GameSettingsModal = ({ onClose, onSave, onLoad, onImport, onExport, soundEnabled, onToggleSound, onReturnToMenu, initialTab = 'menu', state, dispatch }) => {
  const [tab, setTab] = useState(initialTab); // 'menu' | 'save' | 'load' | 'audio'
  const [saves, setSaves] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renamingSlug, setRenamingSlug] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Estado reactivo de audio sincronizado con audio.js
  const [audioConfig, setAudioConfig] = useState(() => getAudioSettings());

  // Efecto acústico diegético: atenuar frecuencias (lowpass) mientras la interfaz modal esté abierta
  useEffect(() => {
    setMuffle(true);
    return () => setMuffle(false);
  }, []);

  const handleMuteToggle = () => {
    const nextMuted = !audioConfig.muted;
    setMuted(nextMuted);
    setAudioConfig(getAudioSettings());
    if (onToggleSound && ((nextMuted && soundEnabled) || (!nextMuted && !soundEnabled))) {
      onToggleSound();
    }
  };

  const handleMasterChange = (val) => {
    const v = parseFloat(val);
    setMasterVolume(v);
    setAudioConfig(prev => ({ ...prev, masterVolume: v }));
  };

  const handleMusicChange = (val) => {
    const v = parseFloat(val);
    setMusicVolume(v);
    setAudioConfig(prev => ({ ...prev, musicVolume: v }));
    // Si la música de fondo está en pausa o no se ha iniciado, iniciarla para testear el volumen
    if (v > 0 && !audioConfig.muted) {
      try {
        const bg = getCurrentBgMusic();
        if (!bg || bg.paused) {
          playTrack('in_game');
        }
      } catch (_) {}
    }
  };

  const handleSfxChange = (val) => {
    const v = parseFloat(val);
    setSfxVolume(v);
    setAudioConfig(prev => ({ ...prev, sfxVolume: v }));
    try { sfx.uiClick(); } catch (_) {}
  };

  const handleWarChange = (val) => {
    const v = parseFloat(val);
    setWarVolume(v);
    setAudioConfig(prev => ({ ...prev, warVolume: v }));
    try { sfx.gaussCannon(); } catch (_) {}
  };

  const handleVoiceChange = (val) => {
    const v = parseFloat(val);
    setVoiceVolume(v);
    setAudioConfig(prev => ({ ...prev, voiceVolume: v }));
    try { speakText("Volumen ajustado"); } catch (_) {}
  };

  const handleOperationsChange = (val) => {
    const v = parseFloat(val);
    setOperationsVolume(v);
    setAudioConfig(prev => ({ ...prev, operationsVolume: v }));
    try { sfx.buildComplete(); } catch (_) {}
  };

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
            {tab === 'menu' && 'Ajustes'}
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
          <div className="space-y-4">
            <AudioMixerSettings
              audioConfig={audioConfig}
              onMuteToggle={handleMuteToggle}
              onMasterChange={handleMasterChange}
              onMusicChange={handleMusicChange}
              onSfxChange={handleSfxChange}
              onWarChange={handleWarChange}
              onVoiceChange={handleVoiceChange}
              onOperationsChange={handleOperationsChange}
            />
          </div>
        )}

        {(tab === 'save' || tab === 'load') && (
          <SaveLoadSettings
            tab={tab}
            saveName={saveName}
            setSaveName={setSaveName}
            handleSave={handleSave}
            loading={loading}
            saves={saves}
            renamingSlug={renamingSlug}
            setRenamingSlug={setRenamingSlug}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            handleRenameConfirm={handleRenameConfirm}
            handleRenameStart={handleRenameStart}
            handleLoadFromList={handleLoadFromList}
            handleDelete={handleDelete}
            formatDate={formatDate}
          />
        )}

        {/* PIE DE AJUSTES: CRÉDITOS Y VERSIÓN DEL SISTEMA */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">🌌</span>
            <span>Ascensión © 2026 — Creado por <strong className="text-slate-200">{GAME_CREDITS}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.25)]">
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSettingsModal;
