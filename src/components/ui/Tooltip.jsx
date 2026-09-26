import React from 'react';

export const Tooltip = React.memo(({ text, children }) => (
  <div className="relative group inline-block">
    {children}
    {text && (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 glass-deep holographic rounded-lg text-xs text-slate-200 whitespace-normal min-w-[120px] max-w-[200px] opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-[var(--ue-accent)]/30 data-text fresnel">
        {text}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0d1a] border-b border-r border-[var(--ue-accent)]/30 rotate-45" />
      </div>
    )}
  </div>
));
