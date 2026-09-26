import React from 'react';
import { StarField } from '../ui.jsx';
import { asset } from '../assets.jsx';
import { S } from '../styles.js';

export const MainMenu = ({
  onContinue,
  onNewGame,
  onLoadGame,
  onImport,
  onExport,
  onExit,
  hasSaves,
  lastSaveName,
  appVersion = '1.0.80'
}) => {
  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden">
      {/* Background Cinematic FX */}
      <StarField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
      
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="flex flex-col items-center mb-12 group">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-700 animate-pulse" />
            <img src={asset('logo-ascension.webp')} alt="Ascensión" className="h-48 w-auto object-contain relative drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" draggable={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">ASCENSIÓN</h1>
            <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <p className="text-cyan-400/60 text-[10px] font-black uppercase tracking-[0.4em] font-mono">Elite Tactical Command Interface</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl pointer-events-auto">
          {/* Main Action Group */}
          <div className="space-y-3">
            <button
              onClick={onContinue}
              disabled={!hasSaves}
              className={`w-full h-24 p-6 rounded-2xl border-2 transition-all flex flex-col justify-center relative overflow-hidden group ${
                hasSaves
                  ? 'bg-cyan-500/10 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/40 border-white/5 opacity-50 grayscale cursor-not-allowed'
              }`}
            >
              {hasSaves && <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rotate-45 translate-x-8 -translate-y-8 border-l border-b border-cyan-500/30 group-hover:bg-cyan-500/20 transition-all" />}
              <span className="flex items-center gap-4 relative z-10">
                <span className="material-symbols-outlined text-3xl text-cyan-400 group-hover:scale-110 transition-transform">play_circle</span>
                <div className="text-left">
                  <div className="text-lg font-black uppercase italic tracking-tighter">Continuar</div>
                  <div className="text-[10px] text-cyan-400/60 font-mono truncate max-w-[160px]">{hasSaves ? (lastSaveName || 'PARTIDA RECIENTE') : 'SIN DATOS'}</div>
                </div>
              </span>
            </button>

            <button
              onClick={onNewGame}
              className="w-full py-4 px-6 rounded-2xl bg-white text-black border-2 border-white hover:bg-transparent hover:text-white transition-all group flex items-center gap-4"
            >
              <span className="material-symbols-outlined font-black group-hover:rotate-90 transition-transform duration-500">add_circle</span>
              <span className="text-lg font-black uppercase italic tracking-tighter">Nueva Expedición</span>
            </button>
          </div>

          {/* Secondary Action Group */}
          <div className="space-y-3">
            <button
              onClick={onLoadGame}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900/60 border-2 border-white/10 hover:border-white/30 transition-all flex items-center gap-4 group"
            >
              <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">history</span>
              <span className="text-sm font-bold uppercase tracking-tight">Registros de Vuelo</span>
            </button>

            <div className="grid grid-cols-2 gap-3 h-[100px]">
               <button onClick={onImport} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all group">
                 <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">download</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Importar</span>
               </button>
               <button onClick={onExport} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/40 transition-all group">
                 <span className="material-symbols-outlined text-slate-500 group-hover:text-cyan-400 transition-colors">upload</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Exportar</span>
               </button>
            </div>
            
            <button
              onClick={onExit}
              className="w-full py-3 px-6 rounded-xl text-slate-600 hover:text-red-500 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono group-hover:tracking-[0.4em] transition-all italic">Terminal Off</span>
            </button>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 animate-pulse opacity-40">
           <div className="text-[10px] font-mono text-cyan-500 tracking-[0.5em] uppercase">Security Protocol v4.8 Active</div>
           <div className="flex gap-2">
             {[1,2,3,4,5,6].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />)}
           </div>
        </div>

        <div className="mt-auto pt-10 text-[9px] text-slate-700 font-mono uppercase tracking-widest">
          © 2026 Aritz Bahamonde Larxé · Ascension · v{appVersion}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
