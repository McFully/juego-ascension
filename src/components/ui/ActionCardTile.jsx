import React from 'react';
import { SafeImg } from '../../assets.jsx';
import { useNavigation } from '../navigation/NavigationContext.jsx';

/**
 * ActionCardTile — Tarjeta funcional de control (Atrás, Menú Principal, Acceso Directo)
 * diseñada para insertarse de forma coherente dentro de los carruseles horizontales.
 * Tiene las mismas dimensiones (w-72 / w-80) y aspecto de videoconsola.
 */
export const ActionCardTile = React.memo(({
  type = "back", // "back" | "menu" | "custom"
  title,
  subtitle,
  icon,
  assetId = "commandCenter",
  onClick,
  targetScreen = "overview",
  badgeText
}) => {
  const nav = useNavigation();
  const isBack = type === "back";
  const isMenu = type === "menu";

  const defaultTitle = isBack ? "Volver" : isMenu ? "Menú Principal" : "Acción";
  const defaultSubtitle = isBack 
    ? "Regresar a la pantalla anterior" 
    : isMenu 
    ? "Opciones y ajustes de partida" 
    : "";
  const defaultIcon = isBack ? "◀" : isMenu ? "⚙️" : "✨";
  const defaultBadge = isBack ? "RETORNO" : isMenu ? "SISTEMA" : badgeText;

  const handleClick = () => {
    if (window.playSfx) window.playSfx("click");
    if (onClick) {
      onClick();
    } else if (isBack) {
      if (nav?.navigateBackWithSync) {
        nav.navigateBackWithSync();
      } else if (nav?.navigateBack) {
        nav.navigateBack();
      } else if (nav?.navigateTo) {
        nav.navigateTo(targetScreen || 'overview');
      }
    } else if (targetScreen && nav?.navigateTo) {
      nav.navigateTo(targetScreen);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none cursor-pointer text-left focus:outline-none w-full h-full min-h-[260px] holographic fresnel ${
        isBack
          ? "bg-gradient-to-b from-[#0c1830]/95 via-[#081024]/90 to-[#05070f] border-cyan-500/40 hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:scale-[1.02] active:scale-[0.98]"
          : "bg-gradient-to-b from-[#18132e]/95 via-[#0f0c22]/90 to-[#05070f] border-purple-500/40 hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.35)] hover:scale-[1.02] active:scale-[0.98]"
      }`}
    >
      {/* Banner de Imagen Superior con Flecha Destacada Superpuesta */}
      <div className="relative w-full h-28 md:h-32 overflow-hidden bg-[#05070f] border-b border-white/10 flex items-center justify-center">
        <SafeImg
          id={assetId}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-105"
        />
        
        {/* Gran indicador central de Volver superpuesto sobre la imagen */}
        {isBack && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/30 border border-cyan-400/80 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-110 group-hover:bg-cyan-500/40 transition-transform duration-300">
              <span className="text-2xl font-black text-cyan-200">◀</span>
            </div>
          </div>
        )}

        {defaultBadge && (
          <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider shadow-md backdrop-blur-sm border ${
            isBack 
              ? "bg-cyan-500/25 border-cyan-400/60 text-cyan-200" 
              : "bg-purple-500/25 border-purple-400/60 text-purple-200"
          }`}>
            {defaultBadge}
          </span>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h4 className={`text-sm font-bold uppercase tracking-wide transition-colors ${
            isBack ? "text-white group-hover:text-cyan-300" : "text-white group-hover:text-purple-300"
          }`}>
            {title || defaultTitle}
          </h4>
          <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
            {subtitle || defaultSubtitle}
          </p>
        </div>
      </div>
    </button>
  );
});
