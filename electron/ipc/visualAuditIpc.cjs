/**
 * visualAuditIpc.cjs — Manejador IPC en Electron para captura y persistencia de Auditorías Visuales.
 */

const { ipcMain, app } = require('electron');
const fs = require('fs');
const path = require('path');

function getAuditDirs() {
  let baseDir;
  try {
    if (app && app.isPackaged) {
      baseDir = app.getPath('userData');
    } else if (app) {
      baseDir = path.resolve(path.join(__dirname, '..', '..'));
    } else {
      baseDir = process.env.APPDATA ? path.join(process.env.APPDATA, 'ascension') : process.cwd();
    }
  } catch (_) {
    baseDir = process.cwd();
  }

  const uiAuditDir = path.join(baseDir, 'ui-audit');
  const auditsDir = path.join(uiAuditDir, 'audits');
  return { baseDir, uiAuditDir, auditsDir };
}

function assertSafeAuditId(id) {
  const val = String(id || '').trim();
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(val) || val.includes('..')) {
    throw new Error('ID de auditoría inválido');
  }
  return val;
}

function registerVisualAuditIpc(getMainWindow) {
  const { baseDir, uiAuditDir, auditsDir } = getAuditDirs();

  // Asegurar directorios de forma segura y tolerante
  try {
    if (!fs.existsSync(uiAuditDir)) fs.mkdirSync(uiAuditDir, { recursive: true });
    if (!fs.existsSync(auditsDir)) fs.mkdirSync(auditsDir, { recursive: true });
  } catch (err) {
    console.warn('[Ascensión Audit] No se pudo crear directorio de auditoría:', err.message);
  }

  // 1. Capturar pantalla real de la ventana de juego
  ipcMain.handle('audit-capture-screenshot', async () => {
    try {
      const win = getMainWindow();
      if (!win) return { success: false, error: 'Ventana no disponible' };
      const image = await win.webContents.capturePage();
      const base64 = image.toDataURL();
      return { success: true, base64 };
    } catch (err) {
      console.error('[Ascensión Audit] Error capturando pantalla:', err);
      return { success: false, error: err.message };
    }
  });

  // 2. Guardar auditoría estructurada y actualizar LATEST_AUDIT.json
  ipcMain.handle('audit-save-run', async (_event, payload) => {
    try {
      const { auditData, screenshotBase64 } = payload || {};
      if (!auditData) return { success: false, error: 'Datos de auditoría vacíos' };

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const folderName = `AUDIT_${stamp}`;
      const runDir = path.join(auditsDir, folderName);
      const screenshotsDir = path.join(runDir, 'screenshots');

      fs.mkdirSync(runDir, { recursive: true });
      fs.mkdirSync(screenshotsDir, { recursive: true });

      // Guardar screenshot si existe
      let screenshotRelPath = null;
      if (screenshotBase64 && screenshotBase64.startsWith('data:image')) {
        const base64Data = screenshotBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const imgName = `screen_${auditData.screen?.activeTab || 'view'}.png`;
        const imgFullPath = path.join(screenshotsDir, imgName);
        fs.writeFileSync(imgFullPath, buffer);
        screenshotRelPath = `screenshots/${imgName}`;
      }

      // Guardar visual-audit.json
      const fullAuditJson = {
        ...auditData,
        screenshot: screenshotRelPath
      };
      fs.writeFileSync(path.join(runDir, 'visual-audit.json'), JSON.stringify(fullAuditJson, null, 2), 'utf-8');

      // Generar visual-audit.md (informe humano legible)
      const mdContent = `# INFORME DE AUDITORÍA VISUAL DOM
**ID de Ejecución:** ${folderName}  
**Fecha:** ${now.toLocaleString('es-ES')}  
**Versión:** ${auditData.application?.version || '1.0.0'}  
**Pantalla Auditada:** \`${auditData.screen?.activeTab}\`  
**Resolución Viewport:** ${auditData.viewport?.width}x${auditData.viewport?.height} (DPR: ${auditData.viewport?.devicePixelRatio})  

---

## 1. RESUMEN DE ELEMENTOS RENDERIZADOS
- **Tarjetas Totales:** ${auditData.summary?.totalCards} (Visibles: ${auditData.summary?.visibleCards})
- **Botones Totales:** ${auditData.summary?.totalButtons} (Visibles: ${auditData.summary?.visibleButtons})
- **Gráficos Canvas:** ${auditData.summary?.canvasesCount}
- **Tablas:** ${auditData.summary?.tablesCount}
- **Problemas Geométricos Detectados:** ${auditData.summary?.issuesCount}

---

## 2. TARJETAS RENDERIZADAS
${(auditData.cards || []).slice(0, 20).map(c => `- **${c.auditId}**: "${c.title || 'Sin título'}" [${c.geometry.width}x${c.geometry.height}px] - Visible: ${c.visible ? 'SÍ' : 'NO'}`).join('\n')}

---

## 3. BOTONES Y CONTROLES INTERACTIVOS
${(auditData.buttons || []).slice(0, 30).map(b => `- **[${b.status}]** "${b.text || b.ariaLabel || b.title || 'Icono'}" (${b.geometry.width}x${b.geometry.height}px) - Disabled: ${b.disabled}`).join('\n')}

---

## 4. PROBLEMAS VISUALES DETECTADOS
${(auditData.visualIssues || []).length > 0 
  ? auditData.visualIssues.map(i => `- **[${i.severity}]** ${i.type}: ${i.details}`).join('\n')
  : '✓ No se detectaron desbordamientos ni colisiones críticas en el viewport.'}
`;
      fs.writeFileSync(path.join(runDir, 'visual-audit.md'), mdContent, 'utf-8');

      // Manifiesto
      const manifest = {
        auditId: folderName,
        generatedAt: now.toISOString(),
        version: auditData.application?.version || '1.0.0',
        activeTab: auditData.screen?.activeTab,
        files: ['visual-audit.json', 'visual-audit.md', screenshotRelPath].filter(Boolean)
      };
      fs.writeFileSync(path.join(runDir, 'VISUAL_AUDIT_MANIFEST.json'), JSON.stringify(manifest, null, 2), 'utf-8');

      // Actualizar puntero LATEST_AUDIT.json en ui-audit/
      const latestAuditInfo = {
        latestAudit: folderName,
        path: `ui-audit/audits/${folderName}/`,
        generatedAt: now.toISOString(),
        activeTab: auditData.screen?.activeTab
      };
      fs.writeFileSync(path.join(uiAuditDir, 'LATEST_AUDIT.json'), JSON.stringify(latestAuditInfo, null, 2), 'utf-8');

      return {
        success: true,
        auditId: folderName,
        runDir,
        manifest
      };
    } catch (err) {
      console.error('[Ascensión Audit] Error guardando auditoría:', err);
      return { success: false, error: err.message };
    }
  });

  // 3. Obtener la última auditoría registrada
  ipcMain.handle('audit-get-latest', async () => {
    try {
      const latestJsonPath = path.join(uiAuditDir, 'LATEST_AUDIT.json');
      if (!fs.existsSync(latestJsonPath)) {
        return { success: true, hasLatest: false };
      }
      const raw = fs.readFileSync(latestJsonPath, 'utf-8');
      const latestMeta = JSON.parse(raw);
      const auditJsonPath = path.join(baseDir, latestMeta.path, 'visual-audit.json');
      let fullData = null;
      if (fs.existsSync(auditJsonPath)) {
        fullData = JSON.parse(fs.readFileSync(auditJsonPath, 'utf-8'));
      }
      return { success: true, hasLatest: true, metadata: latestMeta, fullData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // 4. Exportar auditoría a ZIP nativo
  ipcMain.handle('audit-export-zip', async (_event, auditId) => {
    try {
      const targetDir = auditId ? path.join(auditsDir, assertSafeAuditId(auditId)) : null;
      let runDir = targetDir;
      if (!runDir || !fs.existsSync(runDir)) {
        const latestJsonPath = path.join(uiAuditDir, 'LATEST_AUDIT.json');
        if (!fs.existsSync(latestJsonPath)) return { success: false, error: 'No hay auditoría que exportar' };
        const latestMeta = JSON.parse(fs.readFileSync(latestJsonPath, 'utf-8'));
        runDir = path.join(baseDir, latestMeta.path);
      }

      const zipName = `JuegoAscension_UI_Audit_${path.basename(runDir)}.zip`;
      const zipPath = path.join(uiAuditDir, zipName);

      // Usar Compress-Archive de PowerShell en Windows de forma síncrona/segura
      const { execSync } = require('child_process');
      const escapedSrc = runDir.replace(/'/g, "''");
      const escapedDst = zipPath.replace(/'/g, "''");
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${escapedSrc}\\*' -DestinationPath '${escapedDst}' -Force"`);

      return { success: true, zipPath, zipName };
    } catch (err) {
      console.error('[Ascensión Audit] Error exportando ZIP:', err);
      return { success: false, error: err.message };
    }
  });

  // 5. Comparar dos auditorías y emitir visual-audit-diff.md
  ipcMain.handle('audit-compare', async (_event, payload) => {
    try {
      const { previousAuditId, currentAuditId } = payload || {};
      const safePrevId = assertSafeAuditId(previousAuditId);
      const safeCurrId = assertSafeAuditId(currentAuditId);
      const prevPath = path.join(auditsDir, safePrevId, 'visual-audit.json');
      const currPath = path.join(auditsDir, safeCurrId, 'visual-audit.json');

      if (!fs.existsSync(prevPath) || !fs.existsSync(currPath)) {
        return { success: false, error: 'Uno o ambos archivos de auditoría no existen' };
      }

      const prev = JSON.parse(fs.readFileSync(prevPath, 'utf-8'));
      const curr = JSON.parse(fs.readFileSync(currPath, 'utf-8'));

      const prevCards = new Set((prev.cards || []).map(c => c.auditId));
      const currCards = new Set((curr.cards || []).map(c => c.auditId));

      const addedCards = [...currCards].filter(id => !prevCards.has(id));
      const removedCards = [...prevCards].filter(id => !currCards.has(id));

      const prevBtns = new Set((prev.buttons || []).map(b => b.auditId || b.text));
      const currBtns = new Set((curr.buttons || []).map(b => b.auditId || b.text));

      const addedBtns = [...currBtns].filter(t => !prevBtns.has(t));
      const removedBtns = [...prevBtns].filter(t => !currBtns.has(t));

      const diffMd = `# COMPARATIVA DE AUDITORÍAS VISUALES
**Auditoría Anterior:** ${previousAuditId}  
**Auditoría Actual:** ${currentAuditId}  
**Fecha:** ${new Date().toLocaleString('es-ES')}  

---

## 1. TARJETAS DEL DOM
- **Tarjetas Añadidas (+):** ${addedCards.length > 0 ? addedCards.join(', ') : 'Ninguna'}
- **Tarjetas Eliminadas (-):** ${removedCards.length > 0 ? removedCards.join(', ') : 'Ninguna'}
- **Total Anterior vs Actual:** ${prev.summary?.totalCards} ➔ ${curr.summary?.totalCards}

---

## 2. BOTONES Y CONTROLES
- **Botones Nuevos (+):** ${addedBtns.length > 0 ? addedBtns.slice(0, 10).join(', ') : 'Ninguno'}
- **Botones Desaparecidos (-):** ${removedBtns.length > 0 ? removedBtns.slice(0, 10).join(', ') : 'Ninguno'}
- **Total Anterior vs Actual:** ${prev.summary?.totalButtons} ➔ ${curr.summary?.totalButtons}

---

## 3. PROBLEMAS GEOMÉTRICOS Y OVERFLOWS
- **Incidencias Previas:** ${prev.summary?.issuesCount || 0}
- **Incidencias Actuales:** ${curr.summary?.issuesCount || 0}
`;

      const diffPath = path.join(auditsDir, currentAuditId, 'visual-audit-diff.md');
      fs.writeFileSync(diffPath, diffMd, 'utf-8');

      return { success: true, diffPath, summary: { addedCards, removedCards, addedBtns, removedBtns } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

module.exports = { registerVisualAuditIpc };
