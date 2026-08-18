import React, { useState, useEffect } from 'react';
import { S } from '../styles.js';

export const SettingsMenu = ({
  onClose,
  onSave,
  onLoad,
  onImport,
  onExport,
  soundEnabled,
  onToggleSound,
  onReturnToMenu,
  initialTab = 'menu'
}) => {
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

export default SettingsMenu;
