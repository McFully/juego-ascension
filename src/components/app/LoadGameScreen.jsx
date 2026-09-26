import React, { useState, useEffect } from 'react';
import { StarField } from '../../ui.jsx';
import { S } from '../../styles.js';

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
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📂</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Registros de Vuelo</h2>
              <p className="text-[10px] text-cyan-400 font-mono uppercase">Selecciona una ranura de guardado para reanudar la simulación</p>
            </div>
          </div>
          <span className="text-xs font-mono text-cyan-300 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            {saves.length} Ranuras Detectadas
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline font-mono text-xs">Cerrar</button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 py-16">
            <span className="text-4xl block animate-spin mb-3">⚙️</span>
            <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">Escaneando sector de almacenamiento...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 items-stretch">
            {saves.map(save => (
              <div 
                key={save.slug} 
                className="group relative flex flex-col justify-between bg-[#090d1f]/90 rounded-3xl p-5 border border-white/10 hover:border-cyan-400/60 hover:bg-[#0e1633] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💾</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Ranura
                    </span>
                  </div>

                  {renamingSlug === save.slug ? (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        maxLength={20}
                        className="w-full bg-black/60 border border-cyan-400 rounded-xl px-3 py-1.5 text-sm font-bold text-white outline-none font-mono"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenamingSlug(null); }}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleRenameConfirm} className="px-3 py-1 rounded-lg bg-cyan-500 text-black text-xs font-bold font-mono">
                          Guardar
                        </button>
                        <button onClick={() => setRenamingSlug(null)} className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 text-xs font-mono">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base font-bold text-white uppercase tracking-wide truncate group-hover:text-cyan-300 transition-colors">
                        {save.name}
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-1 space-y-0.5">
                        <div>🪐 {save.planetCount} planeta{save.planetCount !== 1 ? 's' : ''} en órbita</div>
                        <div className="text-[11px] text-slate-500">📅 {formatDate(save.mtime)}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onLoad(save.slug)}
                    className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Cargar</span>
                    <span>➔</span>
                  </button>
                  <button
                    onClick={() => handleRenameStart(save)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Renombrar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleExport(save)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                    title="Exportar"
                  >
                    📤
                  </button>
                  <button
                    onClick={() => handleDelete(save.slug)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Tarjeta de Retorno al Menú Principal */}
            <button
              onClick={onBack}
              className="group relative flex flex-col justify-between bg-gradient-to-b from-[#0c1830]/95 via-[#081024]/90 to-[#05070f] rounded-3xl p-5 border border-cyan-500/40 hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:scale-[1.02] transition-all min-h-[220px] select-none text-left cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-2xl text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  ◀
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                  VOLVER
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors">
                  Menú Principal
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Regresar a la pantalla de bienvenida
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400 font-mono font-semibold uppercase">
                <span>Retornar</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadGameScreen;
