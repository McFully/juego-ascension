import React from 'react';

export const AudioMixerSettings = ({
  audioConfig,
  onMuteToggle,
  onMasterChange,
  onMusicChange,
  onSfxChange,
  onWarChange,
  onVoiceChange,
  onOperationsChange
}) => {
  return (
    <div className="glass rounded-xl p-4 border border-cyan-500/20 bg-cyan-950/20 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider font-mono">
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>Ajustes de Audio y Sonido</span>
        </div>
        <button
          onClick={onMuteToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
            audioConfig.muted
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
              : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/30'
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {audioConfig.muted ? 'volume_off' : 'volume_up'}
          </span>
          <span>{audioConfig.muted ? 'Silenciado (Mute)' : 'Sonido Activo'}</span>
        </button>
      </div>

      {/* Slider Volumen Maestro */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-cyan-400">volume_up</span>
            <span>Canal Maestro General</span>
          </span>
          <span className="text-cyan-400 font-bold">{Math.round((audioConfig.masterVolume ?? 1) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.masterVolume ?? 1}
          onChange={(e) => onMasterChange(e.target.value)}
          className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slider Volumen Música */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-indigo-400">music_note</span>
            <span>Banda Sonora y Ministerios</span>
          </span>
          <span className="text-indigo-400 font-bold">{Math.round(audioConfig.musicVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.musicVolume}
          onChange={(e) => onMusicChange(e.target.value)}
          className="w-full accent-indigo-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slider Volumen Efectos UI */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-amber-400">touch_app</span>
            <span>Interfaz Háptica y Clicks</span>
          </span>
          <span className="text-amber-400 font-bold">{Math.round(audioConfig.sfxVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.sfxVolume}
          onChange={(e) => onSfxChange(e.target.value)}
          className="w-full accent-amber-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slider Volumen Operaciones en Curso (Construcción, Naves e I+D) */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-cyan-400">precision_manufacturing</span>
            <span>Operaciones en Curso (Obras, Astillero e I+D)</span>
          </span>
          <span className="text-cyan-400 font-bold">{Math.round((audioConfig.operationsVolume ?? 0) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.operationsVolume ?? 0}
          onChange={(e) => onOperationsChange && onOperationsChange(e.target.value)}
          className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slider Volumen Armas y Guerra */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-red-400">swords</span>
            <span>Combate, Láseres y Explosiones</span>
          </span>
          <span className="text-red-400 font-bold">{Math.round((audioConfig.warVolume ?? 0.6) * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.warVolume ?? 0.6}
          onChange={(e) => onWarChange(e.target.value)}
          className="w-full accent-red-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>

      {/* Slider Volumen Voces */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-400">record_voice_over</span>
            <span>Transmisiones y Consejeros de IA</span>
          </span>
          <span className="text-emerald-400 font-bold">{Math.round(audioConfig.voiceVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          disabled={audioConfig.muted}
          value={audioConfig.voiceVolume}
          onChange={(e) => onVoiceChange(e.target.value)}
          className="w-full accent-emerald-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};
