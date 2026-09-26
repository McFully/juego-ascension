import { execSync } from 'child_process';
import { readFileSync, copyFileSync, writeFileSync, existsSync, renameSync, mkdirSync } from 'fs';
import path from 'path';

console.log('[Build Script] Starting build and packaging pipeline...');

try {
  // 1. Bump version
  console.log('[Build Script] Bumping version...');
  execSync('npm run bump', { stdio: 'inherit' });

  // Read the new version from package.json
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const version = pkg.version;
  console.log(`[Build Script] New version detected: v${version}`);

  // 2. Build Vite assets
  console.log('[Build Script] Running Vite build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Compile Electron package for Windows
  console.log('[Build Script] Packaging with electron-builder...');
  execSync('npx electron-builder --win', { stdio: 'inherit' });

  // 4. Locate the generated Setup executable
  const setupFilename = `Ascension-v${version}-Setup.exe`;
  const setupPath = path.join('release', setupFilename);

  // 5. Compress setup executable into Ascension-v${version}.zip using PowerShell's Compress-Archive
  const zipFilename = `Ascension-v${version}.zip`;
  const zipPath = path.join('release', zipFilename);
  console.log(`[Build Script] Compressing ${setupPath} into ${zipPath} (Maximum compression)...`);
  
  // Prepare PowerShell command to compress (Optimal compression level)
  const psCommand = `powershell -Command "Compress-Archive -Path '${setupPath}' -DestinationPath '${zipPath}' -CompressionLevel Optimal -Force"`;
  execSync(psCommand, { stdio: 'inherit' });

  // 6. Copy new ZIP package to Firebase deploy directory
  const firebasePublicZipPath = path.join('firebase-download', 'public', zipFilename);
  console.log(`[Build Script] Copying ZIP package to Firebase public path: ${firebasePublicZipPath}`);
  copyFileSync(zipPath, firebasePublicZipPath);

  // 7. Sincronizar automáticamente el index.html de la landing page con la nueva versión y el nuevo enlace
  const htmlPath = path.join('landing', 'public', 'index.html');
  console.log(`[Build Script] Auto-updating version references in ${htmlPath}...`);
  let htmlContent = readFileSync(htmlPath, 'utf8');

  // Regexes to replace links and versions
  // Matches href="https://probando-ca7d9.web.app/*.zip"
  const linkRegex = /href="https:\/\/probando-ca7d9\.web\.app\/[^"]+\.zip"/g;
  const newLink = `href="https://probando-ca7d9.web.app/${zipFilename}"`;
  htmlContent = htmlContent.replace(linkRegex, newLink);

  // Matches version text (e.g. <span class="meta-item">Versión: v*</span>)
  const versionRegex = /<span class="meta-item">Versión: v[^<]+<\/span>/g;
  const newVersionSpan = `<span class="meta-item">Versión: v${version}</span>`;
  htmlContent = htmlContent.replace(versionRegex, newVersionSpan);

  // Also replace any old local reference just in case
  const oldLocalLinkRegex = /href="public\/GameSetup\.zip"/g;
  htmlContent = htmlContent.replace(oldLocalLinkRegex, newLink);

  writeFileSync(htmlPath, htmlContent, 'utf8');
  // 8. Copiar obligatoriamente el instalador a E:\Proyectos Antigravity\Juegos\Ascensión\Instalador (Regla 7 AGENTS.md)
  const masterInstallerDir = 'E:\\Proyectos Antigravity\\Juegos\\Ascensión\\Instalador';
  try {
    if (!existsSync(masterInstallerDir)) {
      mkdirSync(masterInstallerDir, { recursive: true });
    }
    const targetSetupPath = path.join(masterInstallerDir, setupFilename);
    console.log(`[Build Script] Copiando instalador a carpeta maestra: ${targetSetupPath}`);
    copyFileSync(setupPath, targetSetupPath);
  } catch (errCopy) {
    console.warn(`[Build Script] Aviso al copiar a carpeta maestra de instalador: ${errCopy.message}`);
  }

  console.log('[Build Script] Pipeline completed successfully!');
} catch (error) {
  console.error('[Build Script] Build pipeline failed:', error);
  process.exit(1);
}
