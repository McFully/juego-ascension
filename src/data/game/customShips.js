export const SHIP_CHASSIS = {
  scout: { name: 'Explorador Ligero', icon: '🛸', hull: 200, cargo: 100, speed: 15000, slots: 2, cost: { m: 5000, c: 3000, d: 1000 }, req: { shipyard: 4 } },
  fighter: { name: 'Cazador', icon: '✈️', hull: 600, cargo: 50, speed: 12000, slots: 3, cost: { m: 8000, c: 4000, d: 2000 }, req: { shipyard: 5 } },
  corvette: { name: 'Corbeta', icon: '🚀', hull: 1500, cargo: 300, speed: 10000, slots: 4, cost: { m: 15000, c: 10000, d: 4000 }, req: { shipyard: 6 } },
  frigate: { name: 'Fragata', icon: '⛵', hull: 3000, cargo: 800, speed: 8000, slots: 5, cost: { m: 30000, c: 20000, d: 8000 }, req: { shipyard: 7 } },
  cruiserH: { name: 'Crucero Pesado', icon: '🚢', hull: 6000, cargo: 1200, speed: 7000, slots: 6, cost: { m: 60000, c: 40000, d: 15000 }, req: { shipyard: 8 } },
  battleshipH: { name: 'Acorazado', icon: '⚓', hull: 12000, cargo: 2000, speed: 5000, slots: 8, cost: { m: 100000, c: 80000, d: 30000 }, req: { shipyard: 10 } },
  carrier: { name: 'Portanaves', icon: '🛩️', hull: 20000, cargo: 5000, speed: 3000, slots: 10, cost: { m: 200000, c: 150000, d: 50000 }, req: { shipyard: 12, customShipyard: 1 } },
  titan: { name: 'Titán', icon: '🏛️', hull: 50000, cargo: 10000, speed: 1500, slots: 12, cost: { m: 500000, c: 400000, d: 200000 }, req: { shipyard: 15, customShipyard: 3 } },
};

export const SHIP_WEAPONS = {
  lightLaser: { name: 'Láser Ligero', icon: '🔴', atk: 50, energy: 5, slots: 1, cost: { m: 2000, c: 1000, d: 0 }, req: { laser: 2 } },
  heavyLaser: { name: 'Láser Pesado', icon: '🔴', atk: 150, energy: 15, slots: 1, cost: { m: 5000, c: 3000, d: 0 }, req: { laser: 4 } },
  ionCannonS: { name: 'Cañón Iónico', icon: '🔵', atk: 300, energy: 25, slots: 2, cost: { m: 10000, c: 8000, d: 2000 }, req: { ion: 3 } },
  plasmaCannon: { name: 'Cañón de Plasma', icon: '🟣', atk: 600, energy: 40, slots: 2, cost: { m: 20000, c: 15000, d: 5000 }, req: { plasma: 3 } },
  gaussCannonS: { name: 'Cañón Gauss', icon: '🎯', atk: 400, energy: 30, slots: 2, cost: { m: 15000, c: 10000, d: 3000 }, req: { ballisticWeapons: 2 } },
  missileRack: { name: 'Lanzamisiles', icon: '🚀', atk: 500, energy: 20, slots: 2, cost: { m: 12000, c: 5000, d: 4000 }, req: { advMissiles: 2 } },
  railgun: { name: 'Cañón Electromagnético', icon: '⚡', atk: 800, energy: 50, slots: 3, cost: { m: 30000, c: 20000, d: 10000 }, req: { ballisticWeapons: 4, ion: 4 } },
  plasmaBeam: { name: 'Rayo de Plasma', icon: '💥', atk: 1200, energy: 70, slots: 3, cost: { m: 50000, c: 40000, d: 20000 }, req: { plasma: 5, orbitalArtillery: 2 } },
};

export const SHIP_ENGINES = {
  basicCombustion: { name: 'Combustión Básica', icon: '🔥', speed: 5000, energy: 2, slots: 1, cost: { m: 2000, c: 1000, d: 500 }, req: { combustion: 2 } },
  advCombustion: { name: 'Combustión Avanzada', icon: '🔥', speed: 8000, energy: 4, slots: 1, cost: { m: 5000, c: 3000, d: 1500 }, req: { combustion: 4 } },
  basicImpulse: { name: 'Impulso Básico', icon: '💨', speed: 12000, energy: 8, slots: 2, cost: { m: 10000, c: 8000, d: 3000 }, req: { impulse: 3 } },
  advImpulse: { name: 'Impulso Avanzado', icon: '💨', speed: 18000, energy: 12, slots: 2, cost: { m: 20000, c: 15000, d: 6000 }, req: { impulse: 5 } },
  hyperDrive: { name: 'Hipermotor', icon: '🌀', speed: 25000, energy: 20, slots: 3, cost: { m: 40000, c: 30000, d: 15000 }, req: { hyperspace: 4 } },
  quantumEngine: { name: 'Motor Cuántico', icon: '💫', speed: 40000, energy: 30, slots: 3, cost: { m: 80000, c: 60000, d: 30000 }, req: { quantumDrive: 3 } },
};

export const SHIP_SHIELDS = {
  basicShield: { name: 'Escudo Básico', icon: '🛡️', shd: 50, energy: 5, slots: 1, cost: { m: 3000, c: 2000, d: 500 }, req: { shields: 2 } },
  advShield: { name: 'Escudo Avanzado', icon: '🛡️', shd: 150, energy: 10, slots: 1, cost: { m: 8000, c: 5000, d: 2000 }, req: { shields: 4 } },
  megaShield: { name: 'Megasescudo', icon: '🔰', shd: 400, energy: 20, slots: 2, cost: { m: 20000, c: 15000, d: 5000 }, req: { shields: 6 } },
  quantumShield: { name: 'Escudo Cuántico', icon: '✨', shd: 800, energy: 35, slots: 2, cost: { m: 50000, c: 40000, d: 20000 }, req: { shields: 8, quantumEnergy: 3 } },
};

export const SHIP_MODULES = {
  extraCargo: { name: 'Bodega Extra', icon: '📦', desc: 'Espacio de carga presurizado adicional para transportar más recursos en expediciones y comercio.', bonus: { cargo: 2000 }, slots: 1, cost: { m: 5000, c: 3000, d: 1000 }, req: { modularEng: 1 } },
  armorPlating: { name: 'Placas Blindaje', icon: '🛡️', desc: 'Capas de blindaje de aleación densa que incrementan la integridad del casco.', bonus: { hull: 1000 }, slots: 1, cost: { m: 8000, c: 4000, d: 2000 }, req: { armour: 4 } },
  speedBoost: { name: 'Acelerador', icon: '⚡', desc: 'Inyectores de empuje hiperreactivos para elevar la velocidad crucero de la nave.', bonus: { speed: 2000 }, slots: 1, cost: { m: 6000, c: 5000, d: 3000 }, req: { impulse: 3 } },
  nanoRepair: { name: 'Nanoreparador', icon: '🔧', desc: 'Micronanobots autónomos programados para sellar brechas y reparar el casco en combate.', bonus: { repair: 0.1 }, slots: 1, cost: { m: 15000, c: 10000, d: 5000 }, req: { nanoTech: 2 } },
  stealthSys: { name: 'Sistema Sigilo', icon: '👻', desc: 'Dispersor de firmas térmicas y electromagnéticas para evadir escaneos enemigos.', bonus: { stealth: 1 }, slots: 2, cost: { m: 20000, c: 25000, d: 10000 }, req: { espionage: 6, nanoTech: 2 } },
  aiAssist: { name: 'Asistente IA', icon: '🤖', desc: 'Copiloto táctico de computación neuronal para optimizar puntería y modulación de escudos.', bonus: { atk: 100, shd: 50 }, slots: 2, cost: { m: 25000, c: 20000, d: 15000 }, req: { aiMilitary: 2 } },
  energyCore: { name: 'Núcleo Energético', icon: '⚛️', desc: 'Generador de fisión compacta para alimentar subsistemas con alto consumo de energía.', bonus: { energy: 20 }, slots: 2, cost: { m: 30000, c: 25000, d: 15000 }, req: { advReactors: 3 } },
  quantumCore: { name: 'Núcleo Cuántico', icon: '💎', desc: 'Núcleo avanzado de resonancia cuántica que amplifica armamento, escudos y motores.', bonus: { atk: 200, shd: 100, speed: 3000 }, slots: 3, cost: { m: 80000, c: 60000, d: 40000 }, req: { quantumNetworks: 3, expDesign: 3 } },
  ionDeflector: { name: 'Escudo Ionizante', icon: '🌀', desc: 'Deflector de polaridad inversa capaz de disipar impactos energéticos continuos.', bonus: {}, slots: 1, cost: { m: 15000, c: 20000, d: 10000 }, req: { shields: 6 } },
  stealthModule: { name: 'Sigilo Avanzado', icon: '🕵️', desc: 'Generador de camuflaje activo que reduce drásticamente la visibilidad a cambio de peso.', bonus: { stealth: 2, speed: -400 }, slots: 2, cost: { m: 22000, c: 28000, d: 10000 }, req: { espionage: 5, nanoTech: 3 } },
  tradeModule: { name: 'Módulo Comercial', icon: '💰', desc: 'Compartimento aduanero y estiba automatizada para convoyes comerciales del imperio.', bonus: { cargo: 2500, speed: -200 }, slots: 1, cost: { m: 8000, c: 12000, d: 4000 }, req: { modularEng: 3 } },
  plasmaInjector: { name: 'Inyector Plasma', icon: '⚡', desc: 'Sobrealimentador magnético de plasma para empuje y sobreaceleración reactiva.', bonus: {}, slots: 1, cost: { m: 25000, c: 15000, d: 15000 }, req: { impulse: 5 } },
  gaussBattery: { name: 'Batería Gauss', icon: '💥', desc: 'Condensadores cinéticos suplementarios para disparos balísticos de alta cadencia.', bonus: {}, slots: 2, cost: { m: 30000, c: 10000, d: 5000 }, req: { weapons: 7 } },
};

export const MISSILES = {
  interplanetaryMissile: { name: 'Misil Interplanetario', icon: '☄️', desc: 'Misil balístico termonuclear de largo alcance diseñado para arrasar defensas planetarias enemigas.', cost: { m: 12000, c: 2500, d: 0 }, atk: 12000, tech: 'weapons' },
  antiBallisticMissile: { name: 'Misil Antibalístico', icon: '🛡️', desc: 'Sistema de intercepción orbital automático que neutraliza misiles interplanetarios hostiles.', cost: { m: 8000, c: 0, d: 0 }, atk: 1, tech: 'shields' },
};

export const MOON_BUILDINGS = {
  lunarBase: { name: 'Base Lunar', icon: '🌙', desc: 'Proporciona soporte vital, energía y espacio de construcción en la superficie del satélite lunar.', cost: { m: 20000, c: 10000, d: 5000 }, factor: 2, cat: 'facility', max: 1 },
  sensorPhalanx: { name: 'Phalanx Sensor', icon: '📡', desc: 'Red masiva de sensores hiperespaciales capaz de rastrear y escanear flotas enemigas en vuelo.', cost: { m: 500000, c: 200000, d: 100000 }, factor: 2, cat: 'facility', max: 1, req: { lunarBase: 1 } },
  jumpGate: { name: 'Puerta de Salto', icon: '🌀', desc: 'Portal de curvatura que permite el tránsito instantáneo de flotas entre lunas aliadas con puertas activas.', cost: { m: 2000000, c: 1000000, d: 500000 }, factor: 2, cat: 'facility', max: 1, req: { lunarBase: 5 } },
  moonStorage: { name: 'Depósito Lunar', icon: '🏪', desc: 'Instalaciones de almacenamiento de recursos diseñadas para el entorno de baja gravedad de la luna.', cost: { m: 5000, c: 2500, d: 1000 }, factor: 2, cat: 'storage' },
};

