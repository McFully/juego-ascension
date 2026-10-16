export const DEFENSES = {
  rocketLauncher: { name: 'Lanzamisiles', icon: '🚀', cost: { m: 2000, c: 0, d: 0 }, atk: 80, shd: 20, hull: 200, garrison: 0.2, energy: 0 },
  lightLaser: { name: 'Láser Ligero', icon: '🔴', cost: { m: 1500, c: 500, d: 0 }, atk: 100, shd: 25, hull: 200, garrison: 0.2, energy: 1, req: { laser: 3 } },
  heavyLaser: { name: 'Láser Pesado', icon: '🔴', cost: { m: 6000, c: 2000, d: 0 }, atk: 250, shd: 100, hull: 800, garrison: 0.5, energy: 3, req: { laser: 6, energy: 3 } },
  gaussCannon: { name: 'Cañón Gauss', icon: '🎯', cost: { m: 20000, c: 15000, d: 2000 }, atk: 1100, shd: 200, hull: 3500, garrison: 2, energy: 8, req: { energy: 6, weapons: 3, shields: 1 } },
  ionCannon: { name: 'Cañón de Iones', icon: '🔵', cost: { m: 5000, c: 3000, d: 0 }, atk: 150, shd: 500, hull: 800, garrison: 0.5, energy: 4, req: { ion: 4 } },
  plasmaTurret: { name: 'Cañón de Plasma', icon: '🟣', cost: { m: 50000, c: 50000, d: 30000 }, atk: 3000, shd: 300, hull: 10000, garrison: 3, energy: 15, rapid: { smallCargo: 250, largeCargo: 250, lightFighter: 200, heavyFighter: 100, cruiser: 50 }, req: { plasma: 7 } },
  smallShieldDome: { name: 'Cúpula Pequeña', icon: '🛡️', cost: { m: 10000, c: 10000, d: 0 }, atk: 1, shd: 2000, hull: 2000, garrison: 5, energy: 10, max: 1, req: { shields: 2 } },
  largeShieldDome: { name: 'Cúpula Grande', icon: '🛡️', cost: { m: 50000, c: 50000, d: 0 }, atk: 1, shd: 10000, hull: 10000, garrison: 20, energy: 50, max: 1, req: { shields: 6 } },
};
