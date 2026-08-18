import React, { useState } from 'react';
import { StarField } from '../ui.jsx';
import { S } from '../styles.js';

export const NewGameScreen = ({ onConfirm, onBack }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('standard');

  const trimmed = name.trim();
  const isValid = trimmed.length >= 2 && trimmed.length <= 20;

  const gameModes = [
    { 
      id: 'standard', 
      title: 'Ascensión Estándar', 
      icon: 'stars',
      color: 'border-cyan-500/30',
      activeColor: 'bg-cyan-500 text-black',
      desc: 'Experiencia clásica. Coloniza la galaxia y domina a las IAs rivales.' 
    },
    { 
      id: 'survivor', 
      title: 'Superviviente Solitario', 
      icon: 'emergency',
      color: 'border-amber-500/30',
      activeColor: 'bg-amber-500 text-black',
      desc: 'Sin planeta natal. Empiezas con una Nave Nodriza dañada y recursos críticos.' 
    },
    { 
      id: 'decay', 
      title: 'Imperio en Decadencia', 
      icon: 'history_edu',
      color: 'border-rose-500/30',
      activeColor: 'bg-rose-500 text-black',
      desc: 'Gestiona un imperio gigante que se colapsa. El objetivo es sobrevivir al caos.' 
    },
    { 
      id: 'corporate', 
      title: 'Hegemonía Corporativa', 
      icon: 'currency_exchange',
      color: 'border-emerald-500/30',
      activeColor: 'bg-emerald-500 text-black',
      desc: 'Victoria económica. Gana comprando planetas e imponiendo tu moneda.' 
    },
    { 
      id: 'roguelike', 
      title: 'Nébula de Guerra', 
      icon: 'skull',
      color: 'border-purple-500/30',
      activeColor: 'bg-purple-500 text-black',
      desc: 'Muerte permanente. Niebla de guerra total y enemigos ultra agresivos.' 
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValid) onConfirm(trimmed, mode);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden">
      <StarField />
      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">Preparar Expedición</h2>
            <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Configuración de parámetros de simulación galáctica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Commander Identity */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-deep rounded-3xl p-8 border border-white/5 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">Identificación de Comandante</label>
                 <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="NOMBRE CLAVE"
                  maxLength={20}
                  className="w-full bg-black/40 border-b-2 border-white/10 py-3 text-2xl font-black italic tracking-tighter uppercase focus:border-cyan-500 transition-all outline-none"
                  autoFocus
                />
               </div>
               
               <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-cyan-400">
                   <span className="material-symbols-outlined text-sm">verified_user</span>
                   <span className="text-[10px] font-black uppercase">Perfil Verificado</span>
                 </div>
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">"Tu nombre será grabado en los anales de la historia galáctica, ya sea como salvador o tirano."</p>
               </div>

               <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full h-16 rounded-2xl bg-cyan-500 text-black font-black text-lg uppercase italic tracking-tighter hover:bg-cyan-400 transition-all disabled:opacity-20 disabled:grayscale flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
              >
                <span>Iniciar Simulación</span>
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </div>
          </div>

          {/* Right: Game Mode Selection */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Seleccionar Modo de Aventura</span>
                <span className="text-[10px] font-mono text-cyan-500/60 uppercase">Dificultad: Dinámica</span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {gameModes.map(m => (
                 <button
                   key={m.id}
                   onClick={() => setMode(m.id)}
                   className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${
                     mode === m.id 
                       ? `${m.color} bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]` 
                       : 'border-white/5 bg-black/40 hover:border-white/20'
                   }`}
                 >
                   {mode === m.id && <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500 flex items-center justify-center rounded-bl-xl"><span className="material-symbols-outlined text-black text-sm font-bold">check</span></div>}
                   <div className="flex items-start gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === m.id ? m.activeColor : 'bg-white/5 text-slate-400'}`}>
                       <span className="material-symbols-outlined">{m.icon}</span>
                     </div>
                     <div className="space-y-1 pr-6">
                       <div className={`text-sm font-black uppercase italic tracking-tight ${mode === m.id ? 'text-white' : 'text-slate-400'}`}>{m.title}</div>
                       <p className="text-[10px] text-slate-600 font-mono leading-tight uppercase">{m.desc}</p>
                     </div>
                   </div>
                 </button>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewGameScreen;
