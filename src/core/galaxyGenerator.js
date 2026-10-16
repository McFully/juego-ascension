import { FACTIONS, BIOME_KEYS, BIOMES, PLANET_SIZES, GRAVITY_LEVELS, PLANET_TRAITS, AI_STRATEGIES, AI_STRATEGY_KEYS, PLANET_PREFIXES, PLANET_SUFFIXES } from '../data/gameData.js';

const AI_TITLES = ['Imperio','República','Dominio','Confederación','Colectivo','Alianza','Legión','Clan','Sindicato','Hegemonía','Reino','Federación','Protectorado','Cábala','Nación','Concordia','Secta','Coalición','Cartel','Principado','Soberanía','Frente','Enclave','Unión','Orden','Congregación','Consorcio','Dinastía','Imperium','Magisterio'];
const AI_ROOTS = ['Kael','Vex','Xylos','Draak','Zor','Sid','Fénix','Crom','Orion','Tauri','Astr','Lumin','Umbr','Vort','Sola','Eclip','Quant','Ragn','Nova','Andró','Heli','Drak','Galá','Spect','Terran','Cósmi','Void','Cent','Kron','Elys','Valk','Heli','Astr','Drac','Zion','Vega','Zeph','Hydr','Atla','Tita','Hype','Xeno','Ache','Bore','Cael','Ereb','Gaea','Herm','Janu','Kore','Leth','Mima','Nyx','Osir','Prome','Rhea','Tart','Uran','Vulc','Nebul','Spha','Lux','Noct','Umbr','Auri','Ferr','Argent','Cobal','Thori','Irid','Plat','Onyx','Jade','Rubi','Zafir','Esme','Topa','Ámbar','Perla','Opal','Cuar','Gran','Márm','Bronc','Acer','Crom'];

export const generateAIName = (index) => {
  const t = AI_TITLES[index % AI_TITLES.length];
  const r1 = AI_ROOTS[(index * 7 + 3) % AI_ROOTS.length];
  const r2 = AI_ROOTS[(index * 13 + 11) % AI_ROOTS.length];
  const suffix = index < AI_TITLES.length * AI_ROOTS.length ? '' : ` ${Math.floor(index / (AI_TITLES.length * AI_ROOTS.length))}`;
  return `${t} ${r1}${r2}${suffix}`;
};

let _planetNameCounter = 0;
export const generatePlanetName = () => {
  const idx = _planetNameCounter++;
  const p = PLANET_PREFIXES[idx % PLANET_PREFIXES.length];
  const suffixIdx = Math.floor(idx / PLANET_PREFIXES.length) % PLANET_SUFFIXES.length;
  const s = PLANET_SUFFIXES[suffixIdx];
  return Math.random() < 0.2 ? `${p} ${Math.floor(idx / 10)}` : `${p} ${s}`;
};

export const generateAIPlanet = (level, coords, empireName, aiIndex) => {
  const factionKeys = Object.keys(FACTIONS);
  const factionKey = factionKeys[Math.floor(Math.random() * factionKeys.length)];
  const fact = FACTIONS[factionKey];
  const pName = generatePlanetName();
  const biomeKey = BIOME_KEYS[Math.floor(Math.random() * BIOME_KEYS.length)];
  const biome = BIOMES[biomeKey];
  const sizeIdx = Math.floor(Math.random() * PLANET_SIZES.length);
  const planetSize = PLANET_SIZES[sizeIdx];
  const gravIdx = Math.floor(Math.random() * GRAVITY_LEVELS.length);
  const gravity = GRAVITY_LEVELS[gravIdx];
  const trait = PLANET_TRAITS[Math.floor(Math.random() * PLANET_TRAITS.length)];
  const strategyKey = AI_STRATEGY_KEYS[Math.floor(Math.random() * AI_STRATEGY_KEYS.length)];
  const strategy = AI_STRATEGIES[strategyKey];

  const baseMetal = 1000 * level;
  const baseCrystal = Math.floor(600 * level);
  const baseDeuterium = Math.floor(300 * level);
  const getTraitEff = (t) => {
    if (!t || !t.effect) return {};
    return typeof t.effect === 'function' ? t.effect({}) : t.effect;
  };
  const tEff = getTraitEff(trait);
  const metalBonus = (biome.bonus?.metal || 0) + (tEff.metal || 0) + (gravity.mult.prod - 1);
  const crystalBonus = (biome.bonus?.crystal || 0) + (tEff.crystal || 0);
  const deutBonus = (biome.bonus?.deuterium || 0) + (tEff.deuterium || 0);
  const malus = tEff.malus || 0;

  return {
    id: Math.random().toString(36).slice(2, 11),
    name: pName,
    galaxy: coords.galaxy, system: coords.system, position: coords.position,
    temperature: -30 + Math.floor(Math.random() * 100),
    resources: {
      metal: Math.floor(baseMetal * (1 + metalBonus - malus)),
      crystal: Math.floor(baseCrystal * (1 + crystalBonus - malus)),
      deuterium: Math.floor(baseDeuterium * (1 + deutBonus - malus)),
    },
    buildings: {
      metalMine: Math.min(15, Math.floor(level * 1.5)),
      crystalMine: Math.min(12, Math.floor(level * 1.2)),
      deutSynth: Math.min(10, level),
      solarPlant: Math.min(12, Math.floor(level * 1.3)),
      robotFactory: Math.min(8, Math.floor(level * 0.8)),
      shipyard: Math.min(6, Math.floor(level * 0.6)),
      researchLab: Math.min(5, Math.floor(level * 0.5)),
    },
    research: {
      weapons: Math.floor(level * 0.4),
      shields: Math.floor(level * 0.3),
      armour: Math.floor(level * 0.3),
    },
    fleet: {
      lightFighter: Math.floor(level * 5 + Math.random() * level * 5),
      cruiser: Math.floor(level * 1.5),
      battleship: Math.floor(level * 0.5),
    },
    defenses: {
      rocketLauncher: Math.floor(level * 10),
      lightLaser: Math.floor(level * 3),
    },
    isAI: true, aiLevel: level,
    relation: 0,
    discovered: false,
    aiType: strategyKey,
    aiPersonality: (strategyKey === 'militarist' || strategyKey === 'expansionist') ? 'bélico' :
                   (strategyKey === 'merchant' || strategyKey === 'diplomat') ? 'mercantilista' : 'pacífico',
    faction: factionKey,
    empireName: empireName,
    race: fact.race,
    economicLvl: Math.floor(level * 1.2) || 1,
    militaryLvl: Math.floor(level * 1.5) || 1,
    biome: biomeKey,
    planetSize,
    gravity: gravIdx,
    trait: trait ? { name: trait.name, desc: trait.desc } : null,
    strategy: strategyKey,
    aggression: strategy.warTendency + (Math.random() * 0.4 - 0.2),
    ecoTendency: strategy.weight.eco + (Math.random() * 0.2 - 0.1),
    diploTendency: strategy.weight.diplo + (Math.random() * 0.2 - 0.1),
    riskTolerance: 0.3 + Math.random() * 0.5,
    lossTolerance: 0.2 + Math.random() * 0.4,
    totalWins: 0, totalLosses: 0, totalDraws: 0,
    warsDeclared: 0, warsReceived: 0,
    planetsConquered: 0, planetsLost: 0,
    totalEcoSpent: 0, totalMilSpent: 0,
    factionStability: 0.7 + Math.random() * 0.3,
    lastStrategyChange: Date.now(),
    clanId: null,
    allianceIds: [],
    espDefenseLvl: Math.floor(Math.random() * level),
    tradeRoutes: [],
    activePacts: [],
  };
};

/**
 * Perfil astronómico realista del sistema solar.
 * Genera deterministamente el tipo estelar y cuántos planetas reales orbitan.
 */
export const getSystemProfile = (galaxy, system) => {
  const seed = galaxy * 7777 + system * 31;
  let sVal = seed;
  const nextRand = () => {
    const x = Math.sin(sVal++) * 10000;
    return x - Math.floor(x);
  };

  const starTypes = [
    { type: 'Enana Amarilla (Clase G)', color: '#facc15', spectral: 'G2V' },
    { type: 'Enana Roja (Clase M)', color: '#ef4444', spectral: 'M4V' },
    { type: 'Gigante Azul (Clase O)', color: '#38bdf8', spectral: 'O9V' },
    { type: 'Subgigante Naranja (Clase K)', color: '#fb923c', spectral: 'K1IV' },
    { type: 'Sistema Binario', color: '#e879f9', spectral: 'G+M' }
  ];

  const star = starTypes[Math.floor(nextRand() * starTypes.length)];

  // Número real y finito de órbitas que tiene este sistema solar (entre 5 y 9 órbitas totales, ej. 8 como nuestro sistema solar)
  const maxOrbits = (galaxy === 1 && system === 1) ? 8 : (5 + Math.floor(nextRand() * 5));

  // De esas órbitas existentes, entre 2 y 6 albergan planetas reales; otras pueden ser cinturones o vacío
  const planetPositions = new Set();
  const asteroidPositions = new Set();

  if (galaxy === 1 && system === 1) {
    planetPositions.add(1); // Mundo natal del jugador
    planetPositions.add(3);
    planetPositions.add(5);
    planetPositions.add(7);
    asteroidPositions.add(4);
  } else {
    const planetCount = 2 + Math.floor(nextRand() * (maxOrbits - 2));
    for (let i = 0; i < planetCount; i++) {
      const pos = 1 + Math.floor(nextRand() * maxOrbits);
      planetPositions.add(pos);
    }
    const asteroidPos = 1 + Math.floor(nextRand() * maxOrbits);
    if (!planetPositions.has(asteroidPos)) asteroidPositions.add(asteroidPos);
  }

  return {
    star,
    maxOrbits,
    planetPositions,
    asteroidPositions,
  };
};

export const getVirginPlanet = (galaxy, system, position) => {
  const seed = galaxy * 10000 + system * 20 + position;
  let sVal = seed;
  const nextRand = () => {
    const x = Math.sin(sVal++) * 10000;
    return x - Math.floor(x);
  };

  const biomes = BIOME_KEYS;
  const sizes = PLANET_SIZES;
  const gravities = [0, 1, 2, 3, 4];
  const traits = PLANET_TRAITS;

  const rTemp = nextRand();
  const rBiome = nextRand();
  const rSize = nextRand();
  const rGravity = nextRand();
  const rTrait = nextRand();

  return {
    id: `virgin-${galaxy}-${system}-${position}`,
    name: null,
    isVirgin: true,
    empireName: null,
    galaxy,
    system,
    position,
    temperature: -30 + Math.floor(rTemp * 110),
    resources: { metal: 0, crystal: 0, deuterium: 0 },
    buildings: {},
    research: {},
    fleet: {},
    defenses: {},
    missiles: {},
    isHome: false,
    moon: null,
    retrofitTech: {},
    faction: null,
    biome: biomes[Math.floor(rBiome * biomes.length)],
    planetSize: sizes[Math.floor(rSize * sizes.length)],
    gravity: gravities[Math.floor(rGravity * gravities.length)],
    trait: traits[Math.floor(rTrait * traits.length)],
  };
};

export const generateGalaxy = (playerName, homeFaction) => {
  const aiPlanets = [];
  const usedNames = new Set();
  const systems = [];
  let aiIndex = 0;

  for (let g = 1; g <= 10; g++) {
    const systemsInGalaxy = g === 1 ? 500 : 389;
    for (let s = 1; s <= systemsInGalaxy; s++) {
      systems.push({ galaxy: g, system: s });
    }
  }

  const generateUniqueAIName = (idx) => {
    let name;
    let attempts = 0;
    do {
      name = generateAIName(idx + attempts * 1000);
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    usedNames.add(name);
    return name;
  };

  for (let i = 0; i < systems.length; i++) {
    const { galaxy, system } = systems[i];

    for (let pos = 1; pos <= 15; pos++) {
      if (galaxy === 1 && system === 1 && pos === 1) continue;

      if (Math.random() < 0.05) {
        const level = 1 + Math.floor(Math.random() * 15);
        const empName = generateUniqueAIName(aiIndex);
        const planet = generateAIPlanet(level, { galaxy, system, position: pos }, empName, aiIndex);
        aiPlanets.push(planet);
        aiIndex++;
      }
    }
  }

  return { aiPlanets };
};
