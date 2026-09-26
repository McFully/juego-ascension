import React, { useRef, useEffect, useState } from 'react';
import { sfx } from '../../audio.js';

export const CombatTacticalArena2D = ({ report, onClose, fmt, SHIPS, DEFENSES }) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [simulationRound, setSimulationRound] = useState(1);
  const [combatFinished, setCombatFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = canvas.width;
    const height = canvas.height;

    const attackerShips = [];
    const defenderShips = [];
    const projectiles = [];
    const particles = [];

    const atkFleet = report?.attackerFleet || report?.summary?.attackerFleet || {};
    let atkIndex = 0;
    Object.entries(atkFleet).forEach(([shipId, count]) => {
      const visualCount = Math.min(count, 15);
      for (let i = 0; i < visualCount; i++) {
        attackerShips.push({
          id: `atk_${atkIndex++}`,
          shipId,
          x: 40 + Math.random() * 120,
          y: 60 + (i * 28) % (height - 120) + (Math.random() * 20 - 10),
          targetX: width * 0.45,
          targetY: height * 0.5,
          vx: (Math.random() * 0.8 + 0.4),
          vy: (Math.random() - 0.5) * 0.6,
          side: 'attacker',
          size: shipId === 'deathstar' || shipId === 'battleship' ? 12 : shipId === 'cruiser' ? 8 : 5,
          color: '#10b981',
          hp: 100,
          maxHp: 100,
          shield: 50,
          reloadTime: Math.random() * 60,
          destroyed: false
        });
      }
    });

    const defFleet = report?.defenderFleet || report?.summary?.defenderFleet || {};
    let defIndex = 0;
    Object.entries(defFleet).forEach(([shipId, count]) => {
      const visualCount = Math.min(count, 15);
      for (let i = 0; i < visualCount; i++) {
        defenderShips.push({
          id: `def_${defIndex++}`,
          shipId,
          x: width - 40 - Math.random() * 120,
          y: 60 + (i * 28) % (height - 120) + (Math.random() * 20 - 10),
          targetX: width * 0.55,
          targetY: height * 0.5,
          vx: -(Math.random() * 0.8 + 0.4),
          vy: (Math.random() - 0.5) * 0.6,
          side: 'defender',
          size: shipId === 'deathstar' || shipId === 'battleship' ? 12 : shipId === 'cruiser' ? 8 : 5,
          color: '#06b6d4',
          hp: 100,
          maxHp: 100,
          shield: 50,
          reloadTime: Math.random() * 60,
          destroyed: false
        });
      }
    });

    if (attackerShips.length === 0) {
      attackerShips.push({ id: 'atk_0', shipId: 'cruiser', x: 80, y: height / 2, vx: 0.5, vy: 0, side: 'attacker', size: 8, color: '#10b981', hp: 100, maxHp: 100, shield: 50, reloadTime: 0, destroyed: false });
    }
    if (defenderShips.length === 0) {
      defenderShips.push({ id: 'def_0', shipId: 'cruiser', x: width - 80, y: height / 2, vx: -0.5, vy: 0, side: 'defender', size: 8, color: '#06b6d4', hp: 100, maxHp: 100, shield: 50, reloadTime: 0, destroyed: false });
    }

    let roundTimer = 0;

    const render = () => {
      roundTimer += playbackSpeed;

      if (roundTimer > 300) {
        roundTimer = 0;
        setSimulationRound(prev => {
          if (prev < (report?.result?.rounds?.length || 6)) return prev + 1;
          setCombatFinished(true);
          return prev;
        });
      }

      ctx.fillStyle = 'rgba(5, 7, 15, 0.35)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      attackerShips.forEach(ship => {
        if (ship.destroyed) return;
        ship.x += ship.vx * playbackSpeed;
        ship.y += ship.vy * playbackSpeed;

        if (ship.y < 30 || ship.y > height - 30) ship.vy *= -1;
        if (ship.x > width * 0.48 || ship.x < 30) ship.vx *= -1;

        ship.reloadTime += playbackSpeed;
        if (ship.reloadTime > 45 && isPlaying) {
          ship.reloadTime = 0;
          const aliveDefs = defenderShips.filter(d => !d.destroyed);
          if (aliveDefs.length > 0) {
            const target = aliveDefs[Math.floor(Math.random() * aliveDefs.length)];
            projectiles.push({
              x: ship.x,
              y: ship.y,
              targetX: target.x,
              targetY: target.y,
              vx: (target.x - ship.x) * 0.04,
              vy: (target.y - ship.y) * 0.04,
              color: '#34d399',
              life: 25,
              targetRef: target,
              damage: 15
            });
            if (Math.random() < 0.15) sfx('laser');
          }
        }

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.fillStyle = ship.color;
        ctx.shadowColor = ship.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(ship.size, 0);
        ctx.lineTo(-ship.size, -ship.size * 0.6);
        ctx.lineTo(-ship.size * 0.5, 0);
        ctx.lineTo(-ship.size, ship.size * 0.6);
        ctx.closePath();
        ctx.fill();

        if (ship.shield > 0) {
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, ship.size * 1.4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      defenderShips.forEach(ship => {
        if (ship.destroyed) return;
        ship.x += ship.vx * playbackSpeed;
        ship.y += ship.vy * playbackSpeed;

        if (ship.y < 30 || ship.y > height - 30) ship.vy *= -1;
        if (ship.x < width * 0.52 || ship.x > width - 30) ship.vx *= -1;

        ship.reloadTime += playbackSpeed;
        if (ship.reloadTime > 45 && isPlaying) {
          ship.reloadTime = 0;
          const aliveAtks = attackerShips.filter(a => !a.destroyed);
          if (aliveAtks.length > 0) {
            const target = aliveAtks[Math.floor(Math.random() * aliveAtks.length)];
            projectiles.push({
              x: ship.x,
              y: ship.y,
              targetX: target.x,
              targetY: target.y,
              vx: (target.x - ship.x) * 0.04,
              vy: (target.y - ship.y) * 0.04,
              color: '#38bdf8',
              life: 25,
              targetRef: target,
              damage: 15
            });
            if (Math.random() < 0.15) sfx('laser');
          }
        }

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.fillStyle = ship.color;
        ctx.shadowColor = ship.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-ship.size, 0);
        ctx.lineTo(ship.size, -ship.size * 0.6);
        ctx.lineTo(ship.size * 0.5, 0);
        ctx.lineTo(ship.size, ship.size * 0.6);
        ctx.closePath();
        ctx.fill();

        if (ship.shield > 0) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, ship.size * 1.4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx * playbackSpeed;
        p.y += p.vy * playbackSpeed;
        p.life -= playbackSpeed;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();

        if (p.life <= 0) {
          projectiles.splice(i, 1);
          if (p.targetRef && !p.targetRef.destroyed) {
            p.targetRef.hp -= p.damage;
            for (let k = 0; k < 5; k++) {
              particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 15,
                color: p.color
              });
            }
            if (p.targetRef.hp <= 0) {
              p.targetRef.destroyed = true;
              sfx('explosion');
              for (let k = 0; k < 18; k++) {
                particles.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 25,
                  color: '#f59e0b'
                });
              }
            }
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;

        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 4;
        ctx.fillRect(pt.x, pt.y, 2, 2);

        if (pt.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, playbackSpeed, report]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-black/60 border border-white/10 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            Simulación Táctica 2D
          </span>
          <span className="text-slate-400">Ronda: <span className="text-white font-bold">{simulationRound}</span></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer"
          >
            {isPlaying ? '⏸ Pausar' : '▶ Reanudar'}
          </button>
          <button
            onClick={() => setPlaybackSpeed(s => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
            className="px-3 py-1 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold transition-all cursor-pointer"
          >
            x{playbackSpeed} Vel
          </button>
        </div>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#05070f] shadow-[0_0_30px_rgba(6,182,212,0.15)]">
        <canvas
          ref={canvasRef}
          width={800}
          height={360}
          className="w-full h-auto block"
        />

        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
          🟢 VECTOR ATACANTE: {report?.attacker?.name || 'Flota Incursora'}
        </div>

        <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
          🔵 VECTOR DEFENSIVO: {report?.defender?.name || 'Guarnición Orbital'}
        </div>

        {combatFinished && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <span className="text-lg font-mono font-black text-amber-300 tracking-widest uppercase">
              Simulación de Encuentro Concluida
            </span>
            <button
              onClick={() => {
                setSimulationRound(1);
                setCombatFinished(false);
              }}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all cursor-pointer shadow-lg"
            >
              🔄 Repetir Simulación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
