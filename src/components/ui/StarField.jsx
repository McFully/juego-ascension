import React from 'react';

/**
 * StarField — Fondo cósmico ultra-optimizado por hardware GPU (CSS/SVG nativo).
 * 0% de sobrecarga de CPU: sustituye el redibujado continuo por Canvas
 * con capas compuestas estáticas aceleradas por GPU sin provocar caídas de frames
 * ni bloqueo de eventos de ratón.
 */
export const StarField = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070f] select-none" aria-hidden="true">
      {/* Nebulosas cósmicas pre-renderizadas mediante gradientes radiales estáticos */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 25% 30%, rgba(12, 28, 54, 0.45) 0%, rgba(10, 16, 35, 0.25) 45%, transparent 70%),
            radial-gradient(circle at 80% 70%, rgba(38, 12, 54, 0.3) 0%, rgba(16, 8, 32, 0.15) 50%, transparent 65%)
          `
        }}
      />

      {/* Capa de estrellas lejanas (Capa 1: tenue y sutil) */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 25px 35px, #93c5fd, transparent),
            radial-gradient(1px 1px at 85px 125px, #ffffff, transparent),
            radial-gradient(1px 1px at 155px 75px, #93c5fd, transparent),
            radial-gradient(1px 1px at 215px 190px, #ffffff, transparent),
            radial-gradient(1.2px 1.2px at 295px 145px, #67e8f9, transparent),
            radial-gradient(1px 1px at 360px 40px, #ffffff, transparent),
            radial-gradient(1.5px 1.5px at 430px 220px, #c084fc, transparent)
          `,
          backgroundSize: '450px 300px'
        }}
      />

      {/* Capa de estrellas brillantes y centelleantes (Capa 2: profundidad media) */}
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 40px 90px, #ffffff, transparent),
            radial-gradient(2px 2px at 180px 230px, #67e8f9, transparent),
            radial-gradient(1.5px 1.5px at 310px 60px, #fde047, transparent),
            radial-gradient(2px 2px at 490px 170px, #ffffff, transparent),
            radial-gradient(1.5px 1.5px at 620px 280px, #93c5fd, transparent)
          `,
          backgroundSize: '650px 400px'
        }}
      />

      {/* Retícula sutil táctica de baja interferencia */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(white 0.6px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
});

export default StarField;
