const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.resolve(__dirname, '..', 'Assets');
const files = fs.readdirSync(ASSETS_DIR);

const toDelete = files.filter(f => {
  const ext = path.extname(f).toLowerCase();
  return ['.avif', '.jpg', '.jpeg', '.png'].includes(ext);
});

console.log(`Eliminando ${toDelete.length} archivos antiguos redundantes (.avif, .jpg, .png)...`);
let deleted = 0;
for (const f of toDelete) {
  fs.unlinkSync(path.join(ASSETS_DIR, f));
  deleted++;
}
console.log(`Completado. ${deleted} archivos eliminados de Assets.`);

const remaining = fs.readdirSync(ASSETS_DIR);
const exts = {};
remaining.forEach(f => {
  const ext = path.extname(f).toLowerCase() || 'sin-ext';
  exts[ext] = (exts[ext] || 0) + 1;
});
console.log('Distribución final de extensiones en Assets:', exts);
