import React from 'react';

export const ProgressBar = React.memo(({ value, max, color = 'from-cyan-500 to-blue-500', height = 'h-1.5', pulse = false }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`w-full bg-[#05070f] border border-white/10 rounded-full overflow-hidden relative ${height} fresnel`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20" />
      <div className={`bg-gradient-to-r ${color} ${height} relative`}
        style={{
          width: `${pct}%`,
          boxShadow: '0 0 14px rgba(6,182,212,0.55), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.25)',
          transition: 'width 0.32s cubic-bezier(0.23, 1.0, 0.32, 1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/32 via-white/12 to-transparent" />
      </div>
    </div>
  );
});
