const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '..', 'src', 'data', 'assetsCatalog.js');
const assetsDir = path.resolve(__dirname, '..', 'Assets');

const catalogContent = fs.readFileSync(catalogPath, 'utf8');
const assetMatches = catalogContent.match(/asset\('([^']+)'\)/g) || [];

console.log(`Verificando existencia física de ${assetMatches.length} referencias del catálogo...`);

let missing = 0;
let ok = 0;

for (const match of assetMatches) {
  const filename = match.replace(/^asset\('/, '').replace(/'\)$/, '');
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Falta en disco: ${filename}`);
    missing++;
  } else {
    ok++;
  }
}

console.log(`Resultado: ${ok} presentes, ${missing} faltantes.`);
if (missing === 0) {
  console.log('🎉 ¡Integridad 100% verificada! Cero errores 404 en el catálogo.');
} else {
  process.exit(1);
}
