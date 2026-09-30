const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '..', 'Assets');

async function convertAll() {
  const files = fs.readdirSync(ASSETS_DIR);
  
  const toConvert = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.avif', '.jpg', '.jpeg', '.png'].includes(ext);
  });

  console.log(`[WebP Converter] Archivos candidatos: ${toConvert.length}`);

  // Filtrar los que ya existen para saltar trabajo ya hecho
  const pending = toConvert.filter(file => {
    const parsed = path.parse(file);
    const outPath = path.join(ASSETS_DIR, `${parsed.name}.webp`);
    return !fs.existsSync(outPath);
  });

  console.log(`[WebP Converter] Archivos pendientes de procesar: ${pending.length}`);

  let successCount = 0;
  let errorCount = 0;

  // Procesamiento concurrente en bloques de 8 hilos para aprovechar todos los núcleos de la CPU
  const CONCURRENCY = 8;
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const chunk = pending.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (file) => {
      const fullPath = path.join(ASSETS_DIR, file);
      const parsed = path.parse(file);
      const outPath = path.join(ASSETS_DIR, `${parsed.name}.webp`);

      try {
        // Conversión WebP sin pérdida (lossless: true) preservando resolución y fidelidad absoluta
        await sharp(fullPath)
          .webp({ lossless: true, effort: 4 })
          .toFile(outPath);
        successCount++;
      } catch (err) {
        console.error(`Error en ${file}:`, err.message);
        errorCount++;
      }
    }));

    if ((i + CONCURRENCY) % 40 === 0 || i + CONCURRENCY >= pending.length) {
      console.log(`[WebP Converter] Progreso: ${Math.min(i + CONCURRENCY, pending.length)} / ${pending.length}`);
    }
  }

  console.log(`[WebP Converter] Finalizado. Éxitos: ${successCount}, Errores: ${errorCount}`);
}

convertAll();
