import React, { useState, useEffect } from 'react';
import { StarField } from '../ui.jsx';
import { S } from '../styles.js';

export const LoadGameScreen = ({ onBack, onLoad }) => {
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

export default LoadGameScreen;
