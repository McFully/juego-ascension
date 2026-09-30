import React, { useState } from 'react';

/**
 * TutorialOverlay — Guía táctica inicial interactiva para nuevos comandantes del Imperio.
 */
export const TutorialOverlay = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenido al Mando Supremo",
      desc: "Eres el Comandante Supremo de un imperio interestelar naciente. Tu misión es expandir el dominio de tu civilización a lo largo del cosmos, colonizar nuevos mundos y construir una armada invencible.",
      icon: "👑"
    },
    {
      title: "Economía y Extracción",
      desc: "Comienza asegurando la producción en tu planeta natal. Desarrolla las Minas de Metal y Cristal para generar materias primas, y Sintetizadores de Deuterio para combustible cuántico. Vigila tu balance de Energía ⚡.",
      icon: "⛏️"
    },
    {
      title: "Investigación e Industria",
      desc: "Construye Laboratorios de Investigación para desbloquear tecnologías militares y propulsores espaciales. La I+D desbloquea naves avanzadas, sistemas de defensa planetaria y terraformación.",
      icon: "🔬"
    },
    {
      title: "Defensa y Flotas Navales",
      desc: "Produce cazas ligeros, fragatas y cruceros en el Astillero Orbital. Establece rutas comerciales interplanetarias, patrullas de combate y expande tus colonias a otros sistemas estelares.",
      icon: "🚀"
    },
    {
      title: "Gobernanza y Leyes",
      desc: "Nombra ministros en el Distrito Federal para automatizar sectores de tu imperio, promulga decretos de estado y dirige el Consejo Imperial para alcanzar la Ascensión definitiva.",
      icon: "🏛️"
    }
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none font-mono animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full bg-[#050814]/95 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,1),0_0_40px_rgba(6,182,212,0.25)] text-center overflow-hidden">
        {/* Glow ambiental */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Icono del paso */}
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {current.icon}
          </div>

          <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 mb-1">
            Manual de Operaciones Imperiales · Protocolo {step + 1} de {steps.length}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-3">
            {current.title}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-sans">
            {current.desc}
          </p>

          {/* Indicadores de progreso */}
          <div className="flex items-center gap-1.5 mb-6">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === step
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                    : idx < step
                      ? 'w-2 bg-cyan-600/60'
                      : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-3 w-full justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Saltar Manual
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.playSfx) window.playSfx('click');
                if (step < steps.length - 1) {
                  setStep(s => s + 1);
                } else {
                  onComplete();
                }
              }}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {step < steps.length - 1 ? "Siguiente ▶" : "Tomar el Mando 🚀"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
