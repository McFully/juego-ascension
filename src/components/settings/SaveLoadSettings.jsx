import React from 'react';
import { S } from '../../styles.js';

export const SaveLoadSettings = ({
  tab,
  saveName,
  setSaveName,
  handleSave,
  loading,
  saves,
  renamingSlug,
  setRenamingSlug,
  renameValue,
  setRenameValue,
  handleRenameConfirm,
  handleRenameStart,
  handleLoadFromList,
  handleDelete,
  formatDate
}) => {
  if (tab === 'save') {
    return (
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
    );
  }

  if (tab === 'load') {
    return (
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
    );
  }

  return null;
};
