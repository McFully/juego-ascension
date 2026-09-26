const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.resolve(__dirname, '..', 'Assets', 'ministers'),
  path.resolve(__dirname, '..', 'public', 'ministers')
];

async function convertMinisters() {
  console.log('Iniciando conversión de retratos de ministros a WebP Lossless...');

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png'));
    console.log(`Convirtiendo ${files.length} avatares en: ${dir}`);

    for (const f of files) {
      const fullPath = path.join(dir, f);
      const parsed = path.parse(f);
      const outPath = path.join(dir, `${parsed.name}.webp`);

      try {
        await sharp(fullPath)
          .webp({ lossless: true, effort: 4 })
          .toFile(outPath);
        fs.unlinkSync(fullPath); // Eliminar el JPG original
      } catch (err) {
        console.error(`Error en ${f}:`, err.message);
      }
    }
    console.log(`✅ Directorio ${dir} completado a WebP.`);
  }

  console.log('🎉 Todos los avatares de ministros convertidos a WebP Lossless.');
}

convertMinisters();
