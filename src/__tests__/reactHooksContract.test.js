import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SRC = join(process.cwd(), 'src');

/**
 * CONTRATO DE HOOKS DE REACT.
 *
 * El 06/10 la fase 22 reescribio `ExchangeCommandHubView.jsx` y, al hacerlo,
 * elimino la linea `import React, { useState } from 'react'`. El archivo seguia
 * llamando a `useState` seis veces y lo monta `BuildingsPage`, asi que el hub de
 * mando del planeta Lonja era pantalla blanca al abrirlo. Los 419 tests pasaban:
 * el proyecto no tiene @testing-library ni jsdom, asi que ningun test monta un
 * componente y un import perdido no se ve.
 *
 * Este test no monta nada. Comprueba estaticamente, en todos los archivos de
 * src/, que todo hook de React usado llega desde un import. Cubre la clase
 * entera de fallo, no solo el archivo que lo introdujo.
 */

const REACT_HOOKS = [
  'useState', 'useEffect', 'useLayoutEffect', 'useInsertionEffect',
  'useMemo', 'useCallback', 'useRef', 'useContext', 'useReducer',
  'useId', 'useDeferredValue', 'useTransition', 'useSyncExternalStore',
  'useImperativeHandle', 'useDebugValue',
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(js|jsx)$/.test(entry.name) && !/\.test\.jsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Los comentarios describen el fallo ("no debe usar useState") y no lo cometen. */
function sinComentarios(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1 ');
}

/** Nombres que el archivo importa desde 'react'. */
function hooksImportados(src) {
  const nombres = new Set();
  for (const m of src.matchAll(/import\s+([^;]+?)\s+from\s+['"]react['"]/g)) {
    const clausula = m[1];
    const porDefecto = clausula.replace(/\{[^}]*\}/, '').replace(/,/g, ' ').trim();
    if (porDefecto === 'React' || porDefecto === '* as React') nombres.add('__default__');
    const llaves = clausula.match(/\{([\s\S]*)\}/);
    if (llaves) {
      for (const parte of llaves[1].split(',')) {
        const limpio = parte.trim().split(/\s+as\s+/)[0].trim();
        if (limpio) nombres.add(limpio);
      }
    }
  }
  return nombres;
}

describe('contrato de hooks de React', () => {
  const archivos = walk(SRC);

  it('el escaner encuentra componentes que comprobar', () => {
    expect(archivos.length).toBeGreaterThan(100);
  });

  it('ningun archivo usa un hook de React sin importarlo', () => {
    const ofensores = [];
    for (const file of archivos) {
      const src = sinComentarios(readFileSync(file, 'utf-8'));
      const importados = hooksImportados(src);
      const rel = file.split(/[\\/]/).slice(-2).join('/');

      for (const hook of REACT_HOOKS) {
        // `(?<![.\w])` descarta React.useState: ese llega por el import por defecto.
        const usa = new RegExp(`(?<![.\\w])${hook}\\s*\\(`).test(src);
        if (!usa) continue;
        if (importados.has(hook) || importados.has('__default__')) continue;
        ofensores.push(`${hook} sin importar  <-  ${rel}`);
      }
    }
    expect(ofensores.sort().join('\n')).toBe('');
  });

  it('ningun componente monta un hook sin declararlo antes de usarlo', () => {
    // Un `useState` declarado despues de su primera llamada no compila en la
    // practica con el patron de este proyecto, pero el fallo se manifiesta
    // como pantalla en blanco, asi que se comprueba explicitamente.
    const ofensores = [];
    for (const file of archivos) {
      const src = sinComentarios(readFileSync(file, 'utf-8'));
      const rel = file.split(/[\\/]/).slice(-2).join('/');

      for (const m of src.matchAll(/const\s*[\[{]([^\]}]*)[\]}]?\s*=\s*use([A-Z]\w*)\(/g)) {
        const nombres = m[1].split(',').map(s => s.trim()).filter(Boolean);
        for (const nombre of nombres) {
          const primeraLlamada = src.indexOf(`${nombre}.${m[2]}(`);
          const declaracion = src.indexOf(m[0]);
          if (primeraLlamada !== -1 && declaracion !== -1 && primeraLlamada < declaracion) {
            ofensores.push(`${nombre}.${m[2]} se usa antes de declararse  <-  ${rel}`);
          }
        }
      }
    }
    expect(ofensores.sort().join('\n')).toBe('');
  });
});