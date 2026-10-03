export const classifyShip = (id, shipsCatalog = {}) => {
  if (id === 'interplanetaryMissile' || id === 'antiBallisticMissile') {
    return 'ammo';
  }
  const entry = shipsCatalog[id];
  if (entry?.cat === 'ammo') return 'ammo';
  if (entry?.cat === 'military') return 'combat';

  const combatList = [
    'atmosphericInterceptor',
    'lightFighter',
    'quantumFighter',
    'systemGunship',
    'heavyFighter',
    'hyperHeavyFighter',
    'systemCruiser',
    'cruiser',
    'battleship',
    'dreadnought',
    'bomber',
    'destroyer',
    'deathstar',
    'planetDestroyer'
  ];
  if (combatList.includes(id) || id.startsWith('custom_')) {
    return 'combat';
  }
  return 'civilian';
};

export const getShipDriveRange = (id, shipsCatalog = {}) => {
  const entry = shipsCatalog[id];
  if (entry?.range) return entry.range;
  if (entry?.drive === 'combustion') return 'system';
  if (entry?.drive === 'impulse') return 'galaxy';
  return 'universe';
};

export const canShipReachTarget = (shipId, origin, target, shipsCatalog = {}) => {
  if (!origin || !target) return true;
  const range = getShipDriveRange(shipId, shipsCatalog);

  // Mismo sistema solar
  const isSameSystem = origin.galaxy === target.galaxy && origin.system === target.system;
  // Misma galaxia
  const isSameGalaxy = origin.galaxy === target.galaxy;

  if (range === 'system') {
    return isSameSystem;
  }
  if (range === 'galaxy') {
    return isSameGalaxy;
  }
  return true; // 'universe'
};

export const filterAvailableFleet = (fleetObj = {}, filter = 'all', shipsCatalog = {}) => {
  return Object.entries(fleetObj).filter(([id, q]) => {
    if (q <= 0) return false;
    const cat = classifyShip(id, shipsCatalog);
    // Los misiles son munición balística y pertenecen al Silo, no al Hangar naval
    if (cat === 'ammo') return false;
    if (filter === 'all') return true;
    if (filter === 'combat') return cat === 'combat';
    if (filter === 'civilian') return cat === 'civilian';
    return true;
  });
};

