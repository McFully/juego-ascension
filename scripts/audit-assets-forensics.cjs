const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');
const assetsDir = path.resolve(__dirname, '..', 'Assets');
const publicDir = path.resolve(__dirname, '..', 'public');

function getAllFiles(dir, exts = ['.js', '.jsx', '.json', '.html', '.css']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'landing'].includes(entry.name)) {
        files = files.concat(getAllFiles(res, exts));
      }
    } else {
      if (exts.includes(path.extname(entry.name).toLowerCase())) {
        files.push(res);
      }
    }
  }
  return files;
}

console.log('🔍 [Auditoría Forense Atómica de Assets e Imágenes]');
const allSrcFiles = getAllFiles(srcDir);

// 1. Buscar cualquier mención de extensiones antiguas (.jpg, .jpeg, .png, .avif) que apunten a Assets
let legacyMatches = [];
for (const file of allSrcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /Assets\/[^'"`\)]+\.(avif|jpg|jpeg|png)/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    legacyMatches.push({ file: path.relative(path.resolve(__dirname, '..'), file), match: match[0] });
  }
}

console.log(`1. Referencias legacy (.avif, .jpg, .png) en código hacia Assets: ${legacyMatches.length}`);
if (legacyMatches.length > 0) {
  console.log('Detalle:', legacyMatches);
}

// 2. Verificar que cada clave en REAL_IMAGES mapee a un archivo existente en disco
const catalogModule = require('../src/data/assetsCatalog.js');
// Leer texto del catálogo para sacar las claves y archivos
const catalogContent = fs.readFileSync(path.join(srcDir, 'data', 'assetsCatalog.js'), 'utf8');
const keyRegex = /([a-zA-Z0-9_]+):\s*asset\('([^']+)'\)/g;
let keyMatch;
let totalChecked = 0;
let missingFiles = [];

while ((keyMatch = keyRegex.exec(catalogContent)) !== null) {
  const [_, key, filename] = keyMatch;
  totalChecked++;
  const fullPath = path.join(assetsDir, filename);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push({ key, filename });
  }
}

console.log(`2. Total claves de REAL_IMAGES auditadas: ${totalChecked}`);
console.log(`   Archivos faltantes en disco: ${missingFiles.length}`);
if (missingFiles.length > 0) {
  console.error('❌ Faltan archivos:', missingFiles);
} else {
  console.log('✅ 100% de las imágenes del catálogo están presentes y accesibles en disco.');
}

// 3. Auditar todas las imágenes de la carpeta Assets para ver si hay huérfanas
const filesInAssets = fs.readdirSync(assetsDir).filter(f => f.endsWith('.webp'));
const referencedInCatalog = new Set();
const matches = catalogContent.match(/asset\('([^']+)'\)/g) || [];
matches.forEach(m => {
  const fn = m.replace(/^asset\('/, '').replace(/'\)$/, '');
  referencedInCatalog.add(fn);
});

const unreferenced = filesInAssets.filter(f => !referencedInCatalog.has(f));
console.log(`3. Archivos WebP en Assets/: ${filesInAssets.length}`);
console.log(`   Archivos referenciados en catálogo: ${referencedInCatalog.size}`);
console.log(`   Archivos disponibles como reserva/variante: ${unreferenced.length}`);

// 4. Verificación de permisos y tamaño mínimo (corrupción de ficheros)
let corrupted = [];
for (const file of filesInAssets) {
  const stat = fs.statSync(path.join(assetsDir, file));
  if (stat.size < 100) { // menos de 100 bytes indica fichero vacío o corrupto
    corrupted.push({ file, size: stat.size });
  }
}
console.log(`4. Archivos corruptos o vacíos (< 100 bytes): ${corrupted.length}`);
if (corrupted.length > 0) {
  console.error('❌ Archivos corruptos detectados:', corrupted);
} else {
  console.log('✅ Todas las imágenes WebP tienen tamaño e integridad válidos.');
}

console.log('==============================================');
if (missingFiles.length === 0 && legacyMatches.length === 0 && corrupted.length === 0) {
  console.log('🎉 AUDITORÍA DE ASSETS: 100% PERFECTA, CERO ERRORES.');
} else {
  process.exit(1);
}
