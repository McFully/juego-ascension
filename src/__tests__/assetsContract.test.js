import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { REAL_IMAGES } from '../data/assetsCatalog.js';

describe('Assets Catalog Contract (Fase 07)', () => {
  it('no contiene claves duplicadas en la definición léxica de REAL_IMAGES', () => {
    const catalogPath = path.resolve(__dirname, '../data/assetsCatalog.js');
    const content = fs.readFileSync(catalogPath, 'utf8');

    // Extraer bloque REAL_IMAGES
    const realImagesMatch = content.match(/export const REAL_IMAGES = \{([\s\S]*?)\n\};/);
    expect(realImagesMatch).not.toBeNull();

    const block = realImagesMatch[1];
    const keyRegex = /^\s*([a-zA-Z0-9_$]+)\s*:/gm;
    const keys = [];
    let match;
    while ((match = keyRegex.exec(block)) !== null) {
      keys.push(match[1]);
    }

    const seen = new Set();
    const duplicates = [];
    for (const key of keys) {
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    }

    expect(duplicates).toEqual([]);
  });

  it('todos los archivos referenciados en REAL_IMAGES existen en disco', () => {
    const assetsDir = path.resolve(__dirname, '../../Assets');
    const publicMinistersDir = path.resolve(__dirname, '../../public/ministers');
    const missing = [];

    for (const [key, val] of Object.entries(REAL_IMAGES)) {
      if (typeof val === 'string') {
        let fullPath;
        if (val.startsWith('/ministers/')) {
          fullPath = path.join(publicMinistersDir, path.basename(val));
        } else if (val.startsWith('file://')) {
          const parsed = new URL(val);
          const filename = path.basename(decodeURIComponent(parsed.pathname));
          fullPath = path.join(assetsDir, filename);
        } else {
          fullPath = path.join(assetsDir, path.basename(val));
        }

        if (!fs.existsSync(fullPath)) {
          missing.push({ key, val, fullPath });
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('no existen referencias muertas bgImage en ministryMetadata', () => {
    const ministryPath = path.resolve(__dirname, '../data/ministryMetadata.js');
    const content = fs.readFileSync(ministryPath, 'utf8');
    expect(content.includes('bgImage:')).toBe(false);
  });
});
