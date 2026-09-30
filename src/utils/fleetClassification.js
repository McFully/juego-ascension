export const classifyShip = (id, shipsCatalog = {}) => {
  if (id === 'interplanetaryMissile' || id === 'antiBallisticMissile') {
    return 'ammo';
  }
  const combatList = [
    'lightFighter',
    'heavyFighter',
    'cruiser',
    'battleship',
    'bomber',
    'destroyer',
    'deathstar',
    'planetDestroyer'
  ];
  if (combatList.includes(id) || id.startsWith('custom_')) {
    return 'combat';
  }
  const entry = shipsCatalog[id];
  if (entry?.cat === 'military') return 'combat';
  if (entry?.cat === 'ammo') return 'ammo';
  return 'civilian';
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
