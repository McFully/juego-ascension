const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '..', 'src', 'data', 'assetsCatalog.js');
let content = fs.readFileSync(catalogPath, 'utf8');
const initialMatches = content.match(/\.(avif|jpg|jpeg|png)'/gi);
console.log('Referencias iniciales no webp:', initialMatches ? initialMatches.length : 0);

content = content.replace(/\.(avif|jpg|jpeg|png)'/gi, ".webp'");
fs.writeFileSync(catalogPath, content, 'utf8');

const remainingMatches = content.match(/\.(avif|jpg|jpeg|png)'/gi);
console.log('Referencias restantes no webp:', remainingMatches ? remainingMatches.length : 0);
console.log('¡Catálogo actualizado a .webp con éxito!');
