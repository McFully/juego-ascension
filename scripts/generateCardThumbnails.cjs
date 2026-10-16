const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '../Assets');
const CARDS_DIR = path.join(ASSETS_DIR, 'cards');

if (!fs.existsSync(CARDS_DIR)) {
  fs.mkdirSync(CARDS_DIR, { recursive: true });
}

async function processAll() {
  console.log('[Thumbnails] Iniciando generacion en Assets/cards...');
  const files = fs.readdirSync(ASSETS_DIR);
  const webpFiles = files.filter(f => f.toLowerCase().endsWith('.webp') && fs.statSync(path.join(ASSETS_DIR, f)).isFile());
  
  console.log(`[Thumbnails] Total imagenes maestras detectadas: ${webpFiles.length}`);
  let processed = 0;
  let skipped = 0;
  let totalOrigBytes = 0;
  let totalThumbBytes = 0;

  for (const file of webpFiles) {
    const inputPath = path.join(ASSETS_DIR, file);
    const outputPath = path.join(CARDS_DIR, file);

    const origStat = fs.statSync(inputPath);
    totalOrigBytes += origStat.size;

    if (fs.existsSync(outputPath)) {
      const outStat = fs.statSync(outputPath);
      totalThumbBytes += outStat.size;
      skipped++;
      continue;
    }

    try {
      await sharp(inputPath)
        .resize({ width: 560, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);

      const outStat = fs.statSync(outputPath);
      totalThumbBytes += outStat.size;
      processed++;

      if (processed % 50 === 0) {
        console.log(`[Thumbnails] Procesadas ${processed}/${webpFiles.length}...`);
      }
    } catch (err) {
      console.error(`[Thumbnails] Error procesando ${file}:`, err.message);
    }
  }

  const origMB = (totalOrigBytes / (1024 * 1024)).toFixed(2);
  const thumbMB = (totalThumbBytes / (1024 * 1024)).toFixed(2);
  const ratio = totalOrigBytes > 0 ? ((1 - (totalThumbBytes / totalOrigBytes)) * 100).toFixed(1) : 0;

  console.log(`[Thumbnails] Finalizado con exito.`);
  console.log(`[Thumbnails] Nuevas generadas: ${processed}, Ya existentes: ${skipped}`);
  console.log(`[Thumbnails] Peso original: ${origMB} MB -> Peso miniaturas: ${thumbMB} MB (Ahorro: ${ratio}%)`);
}

processAll().catch(err => {
  console.error('[Thumbnails] Fallo fatal:', err);
  process.exit(1);
});
