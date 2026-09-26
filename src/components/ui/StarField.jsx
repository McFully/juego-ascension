import React, { useEffect, useRef } from 'react';

/**
 * StarField — Fondo cósmico dinámico renderizado sobre Canvas de alta velocidad.
 * Proporciona deriva estelar multicapa, centelleo senoidal suave, nebulosas profundas
 * y estrellas fugaces esporádicas sin la pesadez de cientos de nodos DOM ni filtros de desenfoque masivos.
 */
export const StarField = React.memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Detección de reducción de movimiento del sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Generación de estrellas en 3 capas de profundidad
    const STAR_COUNT = 180;
    const stars = Array.from({ length: STAR_COUNT }, () => {
      const layer = Math.random() < 0.6 ? 1 : Math.random() < 0.85 ? 2 : 3;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: layer === 1 ? 0.6 + Math.random() * 0.6 : layer === 2 ? 1.2 + Math.random() * 0.8 : 2.0 + Math.random() * 1.0,
        speedX: (0.015 + layer * 0.02) * (prefersReducedMotion ? 0 : 1),
        speedY: (0.008 + layer * 0.012) * (prefersReducedMotion ? 0 : 1),
        layer,
        color:
          layer === 3
            ? (Math.random() < 0.35 ? '#67e8f9' : Math.random() < 0.7 ? '#c084fc' : '#fde047')
            : (Math.random() < 0.2 ? '#93c5fd' : '#ffffff'),
        pulseSpeed: 0.01 + Math.random() * 0.025,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });

    // Estado de estrella fugaz
    let shootingStar = null;
    let nextShootingStarTime = Date.now() + 8000 + Math.random() * 12000;

    const spawnShootingStar = () => {
      const startX = Math.random() * width * 0.75;
      const startY = Math.random() * height * 0.45;
      const length = 120 + Math.random() * 100;
      const angle = (Math.PI / 4) + (Math.random() * 0.2 - 0.1); // ~45 grados
      shootingStar = {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * 14,
        vy: Math.sin(angle) * 14,
        length,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.015,
        color: Math.random() < 0.5 ? '#67e8f9' : '#ffffff',
      };
    };

    let tick = 0;

    const render = () => {
      tick++;

      // Limpieza con gradiente sutil y persistente
      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, width, height);

      // Resplandor radial de nebulosa cósmica sutil (estilo espacio profundo)
      const grad1 = ctx.createRadialGradient(width * 0.25, height * 0.3, 0, width * 0.25, height * 0.3, width * 0.65);
      grad1.addColorStop(0, 'rgba(12, 28, 54, 0.45)');
      grad1.addColorStop(0.5, 'rgba(10, 16, 35, 0.25)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 0, width * 0.8, height * 0.7, width * 0.5);
      grad2.addColorStop(0, 'rgba(38, 12, 54, 0.3)');
      grad2.addColorStop(0.6, 'rgba(16, 8, 32, 0.15)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Dibujar estrellas con centelleo y deriva
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Movimiento de deriva continua
        s.x -= s.speedX;
        s.y -= s.speedY;
        if (s.x < 0) s.x = width;
        if (s.y < 0) s.y = height;

        // Centelleo armónico
        const alpha = Math.max(0.2, Math.sin(tick * s.pulseSpeed + s.pulseOffset) * 0.4 + 0.6);

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.baseSize, 0, Math.PI * 2);
        ctx.fill();

        // Glow para estrellas de capa superior
        if (s.layer === 3) {
          ctx.strokeStyle = s.color;
          ctx.globalAlpha = alpha * 0.35;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.baseSize * 2.2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Gestión de estrella fugaz
      const now = Date.now();
      if (!shootingStar && now > nextShootingStarTime && !prefersReducedMotion) {
        spawnShootingStar();
        nextShootingStarTime = now + 12000 + Math.random() * 18000;
      }

      if (shootingStar) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.life -= shootingStar.decay;

        if (shootingStar.life <= 0) {
          shootingStar = null;
        } else {
          ctx.globalAlpha = shootingStar.life;
          const tailX = shootingStar.x - (shootingStar.vx / 14) * shootingStar.length;
          const tailY = shootingStar.y - (shootingStar.vy / 14) * shootingStar.length;

          const shootGrad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
          shootGrad.addColorStop(0, 'transparent');
          shootGrad.addColorStop(1, shootingStar.color);

          ctx.strokeStyle = shootGrad;
          ctx.lineWidth = 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(shootingStar.x, shootingStar.y);
          ctx.stroke();

          // Cabeza brillante
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(shootingStar.x, shootingStar.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Retícula sutil de proyección táctica */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: 'radial-gradient(white 0.6px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
});

export default StarField;
