import React, { useState, useEffect } from 'react';
import { StarField } from '../../ui.jsx';
import { S } from '../../styles.js';

export const SaveGameScreen = ({ onBack, onSave, defaultName = '' }) => {
  const [saveName, setSaveName] = useState(defaultName || '');
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const loadSavesList = async () => {
    setLoading(true);
    try {
      if (window.electronAPI && window.electronAPI.listSaves) {
        const result = await window.electronAPI.listSaves();
        if (result.success) {
          setSaves(result.saves || []);
        }
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadSavesList();
  }, []);

  const handleConfirmSave = async () => {
    const finalName = saveName.trim();
    if (!finalName || finalName.length < 2) return;
    setSaving(true);
    setError(null);
    try {
      const res = await onSave(finalName);
      if (res && res.success) {
        setMsg(`✓ Partida guardada con éxito: "${finalName}"`);
        await loadSavesList();
        setTimeout(() => {
          onBack();
        }, 1200);
      } else {
        setError(res?.error || 'Error al guardar la partida');
      }
    } catch (e) {
      setError(e.message || 'Excepción al guardar');
    }
    setSaving(false);
  };

  const formatDate = (mtime) => {
    try {
      const d = new Date(mtime);
      return d.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (_) {
      return '';
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-white flex flex-col justify-between p-4 md:p-8 select-none font-sans relative overflow-x-hidden">
      <StarField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💾</span>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-cyan-300 uppercase tracking-wider font-mono">
              Guardar Partida
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Elige el nombre que desees. La partida quedará fechada y protegida con respaldo automático.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-cyan-400 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-md flex items-center gap-2"
        >
          <span>◀</span>
          <span>Volver al Menú</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto py-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Formulario de guardado con nombre */}
        <div className="glass rounded-2xl p-6 border border-cyan-500/30 bg-[#090d1f]/95 space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <h2 className="text-base font-bold text-white uppercase tracking-wide font-mono flex items-center gap-2">
            <span>✍️</span>
            <span>Nombre de la Partida</span>
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            Introduce el nombre con el que quieres identificar este punto del imperio. Se añadirá la fecha y hora exacta en el registro del sistema.
          </p>

          <div>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Ej: Imperio Solar - Expansión"
              maxLength={35}
              className={S.input + ' w-full py-3 px-4 text-base font-mono border-cyan-500/40 focus:border-cyan-300'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmSave();
              }}
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
              <span>Mínimo 2 caracteres</span>
              <span>{saveName.length}/35</span>
            </div>
          </div>

          {msg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              {msg}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirmSave}
            disabled={saving || !saveName.trim() || saveName.trim().length < 2}
            className={`w-full py-3.5 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
              saveName.trim().length >= 2 && !saving
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/50 text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <span>{saving ? '⏳ Guardando...' : '💾 Confirmar Guardado'}</span>
          </button>
        </div>

        {/* Historial de partidas guardadas con fecha */}
        <div className="glass rounded-2xl p-6 border border-white/10 bg-[#090d1f]/90 space-y-4 max-h-[460px] flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide font-mono flex items-center gap-2">
              <span>📅</span>
              <span>Partidas Guardadas ({saves.length})</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Por fecha descendente</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-10 text-slate-500 font-mono text-xs">Cargando partidas...</div>
            ) : saves.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-mono text-xs">
                No hay partidas registradas todavía en este equipo.
              </div>
            ) : (
              saves.map((s) => (
                <div
                  key={s.slug}
                  onClick={() => setSaveName(s.name)}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  title="Click para usar este nombre"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                      {s.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>🪐 {s.planetCount} mundos</span>
                      <span>·</span>
                      <span>📅 {formatDate(s.mtime)}</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-cyan-400 font-mono">
                    Usar
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full flex items-center justify-center py-2 text-[10px] font-mono text-slate-500">
        <span>Guarda el avance en cualquier momento con nombre personalizado y fecha</span>
      </div>
    </div>
  );
};

export default SaveGameScreen;
