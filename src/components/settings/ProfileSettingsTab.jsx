import React, { useState } from 'react';

/**
 * ProfileSettingsTab — Pestaña de perfil del Comandante para Ascension en Windows.
 * Permite actualizar el nombre de Comandante y subir/cambiar avatar local (convertido a Base64).
 */
export const ProfileSettingsTab = ({ state, dispatch }) => {
  const currentName = state?.playerName || 'Comandante';
  const currentAvatar = state?.avatarUrl || state?.playerAvatar || '';

  const [username, setUsername] = useState(currentName);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleSaveUsername = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed === currentName) return;
    setError(null);
    if (dispatch) {
      dispatch({
        type: 'SET_PLAYER_PROFILE',
        payload: { playerName: trimmed }
      });
      setMsg('✓ Nombre de comandante actualizado con éxito');
      setTimeout(() => setMsg(null), 2500);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no debe superar los 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        setAvatarUrl(base64);
        setError(null);
        if (dispatch) {
          dispatch({
            type: 'SET_PLAYER_PROFILE',
            payload: { avatarUrl: base64 }
          });
          setMsg('✓ Avatar actualizado correctamente');
          setTimeout(() => setMsg(null), 2500);
        }
      }
    };
    reader.onerror = () => {
      setError('Error al leer el archivo de imagen');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (dispatch) {
      dispatch({
        type: 'SET_PLAYER_PROFILE',
        payload: { avatarUrl: '' }
      });
      setMsg('✓ Avatar restablecido');
      setTimeout(() => setMsg(null), 2000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
        {/* Avatar Circular con Glow Cósmico */}
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-[#040814] flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar Comandante"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">👨‍🚀</span>
            )}
          </div>
          <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-[10px] text-cyan-300 font-bold text-center px-1">
            <span>Cambiar</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {username || 'Comandante'}
          </h3>
          <p className="text-[11px] text-slate-400">
            Identificación oficial del Comandante Supremo en el Imperio.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <label className="inline-block px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-all cursor-pointer font-bold">
              <span>📷 Subir Nueva Imagen</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all cursor-pointer font-bold"
              >
                Restablecer
              </button>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
          {msg}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold">
          {error}
        </div>
      )}

      {/* Formulario de cambio de nombre */}
      <form onSubmit={handleSaveUsername} className="space-y-3 p-4 rounded-2xl bg-black/40 border border-white/10">
        <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider">
          Nombre del Comandante Supremo
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={username}
            maxLength={25}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Introduce tu nombre"
            className="flex-1 bg-black/60 border border-white/15 focus:border-cyan-400 text-white px-3 py-2 rounded-xl outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!username.trim() || username.trim() === currentName}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};
export default ProfileSettingsTab;
