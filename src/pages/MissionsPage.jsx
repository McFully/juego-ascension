import React, { useState, useEffect } from 'react';

const CHAPTERS_INFO = [
  { id: 1, name: "Capítulo 1: Fundaciones Imperiales", icon: "🏗️", intro: "Las primeras colonias se asientan sobre el polvo de mundos remotos. Reúne recursos, genera energía y establece tus primeros laboratorios científicos." },
  { id: 2, name: "Capítulo 2: Defensa y Espionaje", icon: "🛰️", intro: "El cosmos no está vacío. Construye una red de satélites espía, blinda tu atmósfera con láseres pesados y prepara defensas antimisiles defensivas." },
  { id: 3, name: "Capítulo 3: Expansión de la Galaxia", icon: "🌌", intro: "Es hora de cruzar el umbral del vacío interestelar. Construye cargueros de transporte, entabla contacto con las primeras civilizaciones vecinas y funda colonias." },
  { id: 4, name: "Capítulo 4: Relaciones Galácticas", icon: "🤝", intro: "La diplomacia y el comercio son armas más potentes que los destructores. Firma pactos bilaterales, acumula influencia y asegura tu reputación galáctica." },
  { id: 5, name: "Capítulo 5: Operaciones Ministeriales", icon: "🏛️", intro: "Los ministerios del imperio demandan especializaciones drásticas. Industrializa tus mundos y automatiza las rutas logísticas del tesoro." },
  { id: 6, name: "Capítulo 6: Guerra y Cañones de Plasma", icon: "⚔️", intro: "Las tensiones acumuladas estallan en batallas colosales de naves de plasma. Moviliza tu armada y derrota a las civilizaciones opositoras." },
  { id: 7, name: "Capítulo 7: Soberanía Absoluta y Singularidad", icon: "👑", intro: "Consolida la hegemonía interestelar definitiva. Construye la Estrella de la Muerte e instaura una alianza imperial eterna." }
];

const MissionsPage = ({ state, dispatch, currentPlanet, setActiveTab, MISSIONS, S }) => {
  const completedList = state.completedMissions || [];
  const activeList = state.activeMissions || [];
  const [selectedChap, setSelectedChap] = useState(1);

  const isChapterCompleted = (chapId) => {
    const chapMissions = MISSIONS.filter(m => m.chap === chapId);
    if (chapMissions.length === 0) return false;
    return chapMissions.every(m => completedList.includes(m.id));
  };

  useEffect(() => {
    const firstIncomplete = CHAPTERS_INFO.find(ch => !isChapterCompleted(ch.id));
    if (firstIncomplete) {
      setSelectedChap(firstIncomplete.id);
    } else {
      setSelectedChap(CHAPTERS_INFO[CHAPTERS_INFO.length - 1].id);
    }
  }, [completedList]);

  // Logic to auto-complete missions based on requirements
  useEffect(() => {
    activeList.forEach(mId => {
      const m = MISSIONS.find(m => m.id === mId);
      if (m && m.check(state, currentPlanet)) {
        dispatch({ type: 'COMPLETE_MISSION', missionId: mId });
      }
    });
  }, [state, currentPlanet, activeList, MISSIONS, dispatch]);

  // Determine if a chapter is unlocked (previous chapter must be 100% completed)
  const getChapterProgress = (chapId) => {
    const chapMissions = MISSIONS.filter(m => m.chap === chapId);
    if (chapMissions.length === 0) return 0;
    const completedChapMissions = chapMissions.filter(m => completedList.includes(m.id));
    return Math.round((completedChapMissions.length / chapMissions.length) * 100);
  };

  const isChapterUnlocked = (chapId) => {
    if (chapId === 1) return true;
    // Check if the previous chapter is 100% completed
    return getChapterProgress(chapId - 1) === 100;
  };

  const activeChapters = CHAPTERS_INFO.filter(ch => !isChapterCompleted(ch.id));
  const visibleChapters = activeChapters.length > 0 ? activeChapters : [CHAPTERS_INFO[CHAPTERS_INFO.length - 1]];

  const currentChapInfo = CHAPTERS_INFO.find(c => c.id === selectedChap) || CHAPTERS_INFO[0];
  const currentChapMissions = MISSIONS.filter(m => m.chap === selectedChap);

  const activeMission = MISSIONS.find(m => activeList.includes(m.id));

  // Determine next future rewards info
  const totalCompleted = completedList.length;
  const totalMissions = MISSIONS.length;
  const campaignProgress = Math.round((totalCompleted / totalMissions) * 100);

  return (
    <div className="space-y-4">
      {/* Campaign Progress header */}
      <div className={S.cardDeep + " flex flex-col md:flex-row md:items-center justify-between gap-4"}>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">🚀 Campaña del Imperio: Ascensión</h2>
          <p className="text-xs text-slate-400">Completa cada capítulo para desbloquear los siguientes sectores e historia.</p>
        </div>
        <div className="shrink-0 flex items-center gap-4 min-w-[280px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-mono text-cyan-400 mb-1">
              <span>Progreso General</span>
              <span>{campaignProgress}%</span>
            </div>
            <div className="w-full bg-slate-950/60 rounded-full h-2 border border-white/5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${campaignProgress}%` }} />
            </div>
          </div>
          <span className="text-sm font-mono font-bold bg-cyan-950/30 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
            {totalCompleted} / {totalMissions}
          </span>
        </div>
      </div>

      {/* Chapters selection bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {visibleChapters.map(ch => {
          const unlocked = isChapterUnlocked(ch.id);
          const progress = getChapterProgress(ch.id);
          const active = selectedChap === ch.id;

          let btnClass = "border bg-black/30 text-slate-500 border-white/5 opacity-50 cursor-not-allowed";
          if (unlocked) {
            if (active) {
              btnClass = "border border-cyan-500/80 bg-cyan-950/20 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]";
            } else {
              btnClass = "border border-white/10 bg-slate-900/40 text-slate-300 hover:bg-white/5 hover:border-white/20";
            }
          }

          return (
            <button
              key={ch.id}
              onClick={() => unlocked && setSelectedChap(ch.id)}
              disabled={!unlocked}
              className={`rounded-xl p-2.5 transition-all text-left flex flex-col justify-between h-20 ${btnClass}`}
            >
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-lg shrink-0">{ch.icon}</span>
                <span className="font-bold text-[11px] truncate leading-tight">Cap. {ch.id}</span>
              </div>
              <div className="w-full mt-2">
                <div className="flex justify-between text-[9px] text-slate-400 mb-0.5 font-mono">
                  <span>{unlocked ? "Progreso" : "Bloqueado"}</span>
                  {unlocked && <span>{progress}%</span>}
                </div>
                {unlocked ? (
                  <div className="w-full bg-slate-950/80 rounded-full h-1 overflow-hidden">
                    <div className="bg-cyan-400 h-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                ) : (
                  <div className="text-[10px] text-red-400/80 font-mono flex items-center gap-0.5">🔒 Requiere Cap. {ch.id - 1}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Chapter Details */}
      <div className={S.card}>
        <div className="border-b border-white/10 pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{currentChapInfo.icon}</span> {currentChapInfo.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
            "{currentChapInfo.intro}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {currentChapMissions.map((m) => {
            const isCompleted = completedList.includes(m.id);
            const isLocked = m.req && !completedList.includes(m.req);
            const isActive = activeList.includes(m.id);

            let statusBg = "glass-deep border-white/10 text-slate-400";
            if (isCompleted) statusBg = "bg-emerald-950/20 border-emerald-500/20 text-slate-300";
            else if (isActive) statusBg = "bg-cyan-950/20 border-cyan-500/30 text-slate-200 shadow-lg shadow-cyan-500/5";

            return (
              <div key={m.id} className={`flex flex-col border rounded-xl p-4 transition-all relative ${statusBg} ${isLocked ? "opacity-45" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <span className="font-bold text-sm text-slate-100">{m.name}</span>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs glass border border-emerald-500/30 text-emerald-300 emissive-gold px-2 py-0.5 rounded-full font-bold">
                      Completada
                    </span>
                  ) : isActive ? (
                    <span className="text-xs glass border border-[var(--ue-accent)]/30 text-[var(--ue-accent)] px-2 py-0.5 rounded-full font-bold emissive-cyan fresnel specular">
                      Activa
                    </span>
                  ) : isLocked ? (
                    <span className="text-xs glass border-white/10 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                      🔒 Bloqueada
                    </span>
                  ) : (
                    <span className="text-xs glass-deep border-white/10 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      Pendiente
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-4 flex-1">
                  {m.desc}
                </p>

                <div className="glass-deep border-white/10 rounded-xl p-2.5 space-y-1 mt-auto">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Recompensa del Capítulo:</div>
                  <div className="text-xs font-bold text-[var(--ue-accent)] holo-text">
                    🎁 {m.rewardDesc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Mission Dashboard (Rendered at the bottom for layout consistency) */}
      {activeMission ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-6 shadow-xl shadow-cyan-500/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none">
            {activeMission.icon}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-bold glass border border-[var(--ue-accent)]/40 text-[var(--ue-accent)] emissive-cyan rounded-full">
                  MISIÓN ACTIVA ACTUAL
                </span>
                <span className="text-xs text-slate-400">Capítulo {activeMission.chap}</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span className="text-3xl">{activeMission.icon}</span> {activeMission.name}
              </h2>
              <p className="text-slate-300 text-sm max-w-xl">
                {activeMission.desc}
              </p>
            </div>
            
            <div className="shrink-0 glass-deep border border-white/10 fresnel specular rounded-xl p-4 space-y-2 min-w-[240px]">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recompensa de la Misión:</div>
              <div className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                🎁 {activeMission.rewardDesc}
              </div>
              <div className="pt-2 text-[10px] text-slate-500">
                Se otorga automáticamente al cumplir el objetivo.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/30 via-slate-900/50 to-slate-950 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
          <div className="text-6xl">👑</div>
          <h2 className="text-2xl font-bold text-slate-100">¡Campaña Completada!</h2>
          <p className="text-slate-300 max-w-md mx-auto text-sm">
            Has completado con éxito todos los objetivos de la campaña. Tu soberanía e imperio espacial han alcanzado la hegemonía interestelar definitiva.
          </p>
        </div>
      )}
    </div>
  );
};

export default MissionsPage;
