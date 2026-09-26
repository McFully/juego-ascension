import React from "react";

let _diploCtx = null;
export const getDiploCtx = () => {
  if (!_diploCtx || _diploCtx.state === "closed") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    _diploCtx = new AudioContextClass();
  }
  if (_diploCtx.state === "suspended") _diploCtx.resume();
  return _diploCtx;
};

export const playDiploSound = (type) => {
  try {
    const ctx = getDiploCtx();
    if (!ctx) return;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    if (type === "connect") {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.15);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(650, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.1);
          osc2.connect(masterGain);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.1);
        } catch (_) {}
      }, 100);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      osc.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "success") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + i * 0.05 + 0.2);
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.2);
      });
    } else if (type === "warn") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.3);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (err) {
    console.warn("AudioContext failed", err);
  }
};

export const LeaderAvatar = ({ factionKey, isGlitching }) => {
  const factionColors = {
    human: { primary: "#22d3ee", secondary: "#0891b2", glow: "rgba(34, 211, 238, 0.4)" },
    cyborg: { primary: "#c084fc", secondary: "#9333ea", glow: "rgba(192, 132, 252, 0.4)" },
    synth: { primary: "#34d399", secondary: "#059669", glow: "rgba(52, 211, 153, 0.4)" },
    draconian: { primary: "#f87171", secondary: "#dc2626", glow: "rgba(248, 113, 113, 0.4)" },
    helios: { primary: "#fbbf24", secondary: "#d97706", glow: "rgba(251, 191, 36, 0.4)" },
    solaris: { primary: "#facc15", secondary: "#ca8a04", glow: "rgba(250, 204, 21, 0.4)" },
    drakon: { primary: "#fda4af", secondary: "#e11d48", glow: "rgba(253, 164, 175, 0.4)" },
    vortex: { primary: "#818cf8", secondary: "#4f46e5", glow: "rgba(129, 140, 248, 0.4)" },
    umbra: { primary: "#94a3b8", secondary: "#475569", glow: "rgba(148, 163, 184, 0.4)" },
  };
  const colors = factionColors[factionKey] || factionColors.human;

  return (
    <div className="relative w-full aspect-square max-w-[150px] mx-auto bg-black/60 border-2 rounded-xl p-1.5 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-md"
         style={{ borderColor: colors.primary, boxShadow: `0 0 12px ${colors.glow}` }}>
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.04),rgba(0,255,0,0.02),rgba(0,0,255,0.04))] bg-[size:100%_4px,3px_100%]" />
      <div className="absolute left-0 w-full h-[1.5px] opacity-50 animate-scanline pointer-events-none" 
           style={{ backgroundColor: colors.primary }} />
      {isGlitching && <div className="absolute inset-0 bg-red-500/15 mix-blend-screen animate-pulse" />}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {factionKey === "cyborg" ? (
          <g>
            <path d="M30 40 C30 20, 70 20, 70 40 L68 70 C68 80, 32 80, 32 70 Z" fill="none" stroke={colors.primary} strokeWidth="2" />
            <rect x="35" y="38" width="30" height="7" rx="2" fill="none" stroke={colors.primary} strokeWidth="2" />
            <line x1="37" y1="41" x2="63" y2="41" stroke={colors.primary} strokeWidth="3" />
            <circle cx="45" cy="41" r="1.5" fill="#fff" className="animate-ping" />
            <path d="M43 62 L57 62 M45 65 L55 65" stroke={colors.primary} strokeWidth="1" />
          </g>
        ) : factionKey === "synth" ? (
          <g>
            <rect x="25" y="25" width="50" height="50" rx="6" fill="none" stroke={colors.primary} strokeWidth="2.5" />
            <circle cx="50" cy="12" r="3.5" fill={colors.primary} />
            <line x1="50" y1="25" x2="50" y2="15" stroke={colors.primary} strokeWidth="2" />
            <rect x="32" y="38" width="12" height="6" rx="1.5" fill="none" stroke={colors.primary} strokeWidth="1.5" />
            <rect x="56" y="38" width="12" height="6" rx="1.5" fill="none" stroke={colors.primary} strokeWidth="1.5" />
            <circle cx="38" cy="41" r="1" fill={colors.primary} />
            <circle cx="62" cy="41" r="1" fill={colors.primary} />
            <path d="M36 58 Q 50 50 64 58" fill="none" stroke={colors.primary} strokeWidth="2" />
          </g>
        ) : factionKey === "draconian" || factionKey === "drakon" ? (
          <g>
            <path d="M50 15 L65 30 L65 45 L50 85 L35 45 L35 30 Z" fill="none" stroke={colors.primary} strokeWidth="2.5" />
            <polygon points="38,36 46,38 44,42 36,40" fill={colors.primary} />
            <polygon points="62,36 54,38 56,42 64,40" fill={colors.primary} />
            <path d="M42 62 L50 72 L58 62" fill="none" stroke={colors.primary} strokeWidth="1.5" />
          </g>
        ) : factionKey === "vortex" ? (
          <g>
            <circle cx="50" cy="50" r="24" fill="none" stroke={colors.primary} strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="14" fill="none" stroke={colors.primary} strokeWidth="2" strokeDasharray="8 4" />
            <circle cx="50" cy="50" r="4" fill={colors.primary} />
          </g>
        ) : (
          <g>
            <path d="M15 90 C15 75, 25 68, 38 68 L62 68 C75 68, 85 75, 85 90" fill="none" stroke={colors.primary} strokeWidth="2" />
            <path d="M35 38 C35 25, 65 25, 65 38 C65 52, 35 52, 35 38" fill="none" stroke={colors.primary} strokeWidth="2" />
            <circle cx="48" cy="39" r="1.5" fill={colors.primary} />
          </g>
        )}
      </svg>
    </div>
  );
};
