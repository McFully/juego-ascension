import React, { useState } from 'react';

const TutorialOverlay = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    "Bienvenido a Ascensión. Eres el comandante de un imperio interestelar.",
    "Comienza construyendo Minas en tu planeta principal para generar recursos.",
    "Investiga nuevas tecnologías para desbloquear naves avanzadas.",
    "¡Explora la galaxia y expande tu dominio!"
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0a0d1a] border border-[var(--ue-accent)]/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Tutorial</h2>
        <p className="text-slate-300 mb-8">{steps[step]}</p>
        <button
          onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else onComplete();
          }}
          className="px-6 py-2 bg-[var(--ue-accent)] text-black font-bold rounded-full hover:brightness-110 transition-all"
        >
          {step < steps.length - 1 ? "Siguiente" : "Comenzar"}
        </button>
      </div>
    </div>
  );
};

export default TutorialOverlay;
