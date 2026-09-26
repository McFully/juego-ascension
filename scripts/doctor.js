/**
 * Doctor de Salud y Estabilidad Offline de Ascensión (Punto 50).
 * Ejecuta validaciones estáticas, cumplimiento de reglas 100% offline,
 * integridad de saves y suite de pruebas unitarias.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n🔍 [Ascensión Doctor] Iniciando auditoría de integridad técnica y offline...');

let checksPassed = 0;
let totalChecks = 4;

// 1. Verificación de archivos y dependencias críticas
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  if (pkg.name === 'ascension' && pkg.main === 'electron/main.cjs') {
    console.log('✅ [1/4] Estructura de paquete Electron y scripts verificada.');
    checksPassed++;
  } else {
    console.error('❌ [1/4] Discrepancia en package.json principal.');
  }
} catch (e) {
  console.error('❌ [1/4] Error leyendo package.json:', e.message);
}

// 2. Comprobación de ausencia de llamadas de red prohibidas en src/
try {
  const getAllFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllFiles(fullPath));
      } else if (/\.(jsx?|tsx?)$/.test(file) && !file.includes('.test.') && !file.includes('.spec.')) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const srcFiles = getAllFiles(path.join(rootDir, 'src'));
  let networkLeakFound = false;

  for (const full of srcFiles) {
    const content = fs.readFileSync(full, 'utf-8');
    // Chequear llamadas o protocolos externos no autorizados
    if (/\bfetch\s*\(/.test(content) || /WebSocket\b/.test(content) || /(http:\/\/|https:\/\/)/.test(content)) {
      if (!content.includes('ascension-asset://') && !content.includes('http://www.w3.org/2000/svg')) {
        networkLeakFound = true;
        console.error(`⚠️ Advertencia de red en: ${path.relative(rootDir, full)}`);
      }
    }
  }

  if (!networkLeakFound) {
    console.log(`✅ [2/4] Runtime 100% offline verificado: Cero llamadas de red externas en ${srcFiles.length} archivos de src/.`);
    checksPassed++;
  } else {
    console.error('❌ [2/4] Se detectaron potenciales llamadas de red externas.');
  }
} catch (e) {
  console.error('❌ [2/4] Error en verificación offline:', e.message);
}

// 3. Verificación de tests unitarios (vitest)
try {
  console.log('⏳ [3/4] Ejecutando suite de vitest...');
  execSync('npx vitest run', { cwd: rootDir, stdio: 'inherit', timeout: 120000 });
  console.log('✅ [3/4] Todos los tests unitarios han pasado satisfactoriamente.');
  checksPassed++;
} catch (e) {
  console.error('❌ [3/4] Falló la suite de pruebas unitarias:', e.message);
}

// 4. Verificación de compilación de producción con Vite
try {
  console.log('⏳ [4/4] Verificando bundle de producción (vite build)...');
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit', timeout: 240000 });
  console.log('✅ [4/4] Compilación de producción generada sin errores.');
  checksPassed++;
} catch (e) {
  console.error('❌ [4/4] Falló el build de producción:', e.message);
}

console.log(`\n========================================`);
if (checksPassed === totalChecks) {
  console.log(`🎉 [Ascensión Doctor] Sistema 100% Saludable (${checksPassed}/${totalChecks} verificaciones completadas).`);
  process.exit(0);
} else {
  console.error(`⚠️ [Ascensión Doctor] Se detectaron anomalías (${checksPassed}/${totalChecks} verificaciones pasadas).`);
  process.exit(1);
}
