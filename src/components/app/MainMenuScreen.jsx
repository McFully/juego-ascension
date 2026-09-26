import React from 'react';
import { StarField } from '../../ui.jsx';
import { asset, SafeImg } from '../../assets.jsx';

const APP_VERSION = (typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev');

export const MainMenuScreen = ({ onContinue, onNewGame, onLoadGame, onImport, onExport, onSaveGame, onExit, onExportLogs, hasSaves, lastSaveName }) => {
  return (
    <div className="min-h-screen w-full bg-[#02040a] text-white flex flex-col justify-center items-center p-4 md:p-8 select-none font-sans relative overflow-x-hidden">
      {/* Background Cinematic FX */}
      <StarField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />

      {/* Grid de Tarjetas del Menú Principal: Centrado quirúrgico vertical y horizontalmente */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-2 md:px-4 my-auto animate-in fade-in zoom-in-95 duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 w-full pointer-events-auto items-stretch">
          
          {/* Tarjeta 1: Continuar */}
          <button
            onClick={onContinue}
            disabled={!hasSaves}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none min-h-[260px] md:min-h-[290px] ${
              hasSaves
                ? 'bg-gradient-to-b from-[#0c1830]/95 via-[#081024]/90 to-[#05070f] border-cyan-500/50 hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:scale-[1.02] cursor-pointer'
                : 'bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
            }`}
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuContinue"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081024]/80 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 backdrop-blur-md">
                {hasSaves ? 'DISPONIBLE' : 'VACÍO'}
              </span>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-cyan-300">
                <span className="text-xl">▶️</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">REANUDAR</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Continuar Partida
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  {hasSaves
                    ? (lastSaveName ? `Imperio: ${lastSaveName}` : 'Reanudar sesión de mando táctico inmediatamente')
                    : 'No se detectan partidas guardadas en el disco local'}
                </p>
              </div>
            </div>
          </button>

          {/* Tarjeta 2: Nueva Expedición */}
          <button
            onClick={onNewGame}
            className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none bg-gradient-to-b from-[#16274a]/95 via-[#0d1b38]/90 to-[#05070f] border-cyan-400/60 hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(6,182,212,0.45)] hover:scale-[1.02] cursor-pointer min-h-[260px] md:min-h-[290px]"
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuNewGame"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b38]/80 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                OPERACIÓN
              </span>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-cyan-300">
                <span className="text-xl">🚀</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">INICIAR</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Nueva Expedición
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  Fundar un nuevo dominio planetario desde los cimientos galácticos
                </p>
              </div>
            </div>
          </button>

          {/* Tarjeta 3: Cargar Partida */}
          <button
            onClick={onLoadGame}
            className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none bg-[#090d1f]/90 border-white/10 hover:border-white/25 hover:bg-[#0e1633] hover:scale-[1.02] cursor-pointer min-h-[260px] md:min-h-[290px]"
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuLoadGame"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-slate-300">
                <span className="text-xl">💾</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">REGISTROS</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Cargar Partida
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  Acceder al banco de memoria táctica e historiales de mando
                </p>
              </div>
            </div>
          </button>

          {/* Tarjeta 4: Importar Partida */}
          <button
            onClick={onImport}
            className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none bg-[#090d1f]/90 border-white/10 hover:border-white/25 hover:bg-[#0e1633] hover:scale-[1.02] cursor-pointer min-h-[260px] md:min-h-[290px]"
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuImport"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-slate-300">
                <span className="text-xl">📥</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">ARCHIVO</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Importar Partida
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  Cargar savegame desde un archivo JSON externo en el disco
                </p>
              </div>
            </div>
          </button>

          {/* Tarjeta 5: Exportar Partida */}
          <button
            onClick={onExport}
            disabled={!hasSaves}
            className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none min-h-[260px] md:min-h-[290px] ${
              hasSaves
                ? 'bg-[#090d1f]/90 border-white/10 hover:border-white/25 hover:bg-[#0e1633] hover:scale-[1.02] cursor-pointer'
                : 'bg-black/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
            }`}
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuExport"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-slate-300">
                <span className="text-xl">📤</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">RESPALDO</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-cyan-300 transition-colors truncate">
                  Exportar Partida
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  Generar copia de seguridad descargable en formato JSON
                </p>
              </div>
            </div>
          </button>

          {/* Tarjeta 6: Guardado Rápido */}
          <button
            onClick={onSaveGame}
            className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 select-none text-left focus:outline-none bg-[#090d1f]/90 border-white/10 hover:border-emerald-400/60 hover:bg-[#081824] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer min-h-[260px] md:min-h-[290px]"
          >
            <div className="relative w-full h-36 md:h-40 bg-[#05070f] border-b border-white/10 flex items-center justify-center overflow-hidden">
              <SafeImg
                id="menuSaveGame"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081824]/80 via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 backdrop-blur-md">
                GUARDAR
              </span>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-emerald-400">
                <span className="text-xl">💾</span>
                <span className="text-xs font-mono font-bold uppercase tracking-widest">GUARDAR PARTIDA</span>
              </div>
            </div>
            <div className="p-4 md:p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wide group-hover:text-emerald-300 transition-colors truncate">
                  Guardar Partida
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-2 leading-relaxed">
                  Guardar el avance del imperio con nombre personalizado en el disco local.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer minimalista, botón de telemetría y créditos oficiales */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center gap-2.5 pt-3 pb-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-[0.3em] flex items-center gap-3">
            <span>● Terminal Conectada</span>
            <span>·</span>
            <span>100% Local y Offline</span>
            <span>·</span>
            <span className="text-emerald-400">Base de Datos: SQLite</span>
          </div>
          {onExportLogs && (
            <button
              onClick={onExportLogs}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
              title="Exportar archivo con todos los logs y telemetría técnica completa del sistema"
            >
              <span>📊</span>
              <span>Exportar Logs y Telemetría 360</span>
            </button>
          )}
        </div>

        {/* Línea de créditos oficiales y versión */}
        <div className="text-[10px] font-mono text-slate-500/80 uppercase tracking-widest text-center select-none pt-1">
          © 2026 Aritz Bahamonde Larxé. Todos los derechos reservados. · Ascension · v{APP_VERSION}
        </div>
      </div>
    </div>
  );
};

export default MainMenuScreen;
