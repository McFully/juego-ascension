import React, { useState, useEffect } from 'react';
import { executeCurrentScreenAudit } from '../../utils/uiAuditEngine.js';

export const VisualAuditSettingsTab = ({ state, currentPlanet, appVersion }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [lastAuditResult, setLastAuditResult] = useState(null);
  const [latestSavedAudit, setLatestSavedAudit] = useState(null);

  // Cargar info de última auditoría persistida
  const loadLatestAudit = async () => {
    try {
      if (window.electronAPI && window.electronAPI.auditGetLatest) {
        const res = await window.electronAPI.auditGetLatest();
        if (res.success && res.hasLatest) {
          setLatestSavedAudit(res.metadata);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadLatestAudit();
  }, []);

  const handleAuditCurrentScreen = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Ejecutar análisis del DOM en el navegador
      const auditData = await executeCurrentScreenAudit({
        activeTab: state?.activeTab || 'overview',
        currentPlanet,
        appVersion
      });

      // 2. Capturar pantallazo nativo via Electron si está disponible
      let screenshotBase64 = null;
      if (window.electronAPI && window.electronAPI.auditCaptureScreenshot) {
        const snapRes = await window.electronAPI.auditCaptureScreenshot();
        if (snapRes.success) screenshotBase64 = snapRes.base64;
      }

      // 3. Persistir run en disco (JSON + MD + Manifiesto + Screenshot)
      if (window.electronAPI && window.electronAPI.auditSaveRun) {
        const saveRes = await window.electronAPI.auditSaveRun({
          auditData,
          screenshotBase64
        });
        if (saveRes.success) {
          setFeedback(`✓ Auditoría completada con éxito. Carpeta: ${saveRes.auditId}`);
          setLastAuditResult(auditData);
          await loadLatestAudit();
        } else {
          setFeedback(`Error guardando auditoría: ${saveRes.error}`);
        }
      } else {
        setLastAuditResult(auditData);
        setFeedback('✓ Inspección DOM finalizada (modo navegador sin Electron IPC).');
      }
    } catch (err) {
      setFeedback(`Fallo en auditoría: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 font-mono text-xs" data-ui-audit-id="visual-audit-panel">
      <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <span>🔬</span>
            <span>AUDITORÍA VISUAL DEL DOM EN TIEMPO DE EJECUCIÓN</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900 text-cyan-200">
            QA y Evidencia
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Herramienta transversal de validación empírica. Inspecciona los elementos reales computados por el navegador (no el código fuente), capturando geometrías, botones, visibilidad física y capturas de pantalla.
        </p>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl border ${
          feedback.startsWith('✓') 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-red-950/40 border-red-500/40 text-red-300'
        }`}>
          {feedback}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          disabled={loading}
          onClick={handleAuditCurrentScreen}
          className="p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 border border-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          data-ui-audit-id="btn-audit-current-screen"
        >
          <span>📸</span>
          <span>{loading ? 'Inspeccionando DOM...' : 'Auditar Pantalla Actual'}</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleAuditCurrentScreen}
          className="p-3.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 border border-indigo-400/50 transition cursor-pointer"
          data-ui-audit-id="btn-audit-full-report"
        >
          <span>📦</span>
          <span>Generar Informe y Persistir Evidencia</span>
        </button>

        <button
          type="button"
          disabled={loading || !latestSavedAudit}
          onClick={async () => {
            if (window.electronAPI && window.electronAPI.auditExportZip) {
              setLoading(true);
              const res = await window.electronAPI.auditExportZip();
              if (res.success) {
                setFeedback(`✓ Paquete ZIP exportado: ${res.zipName}`);
              } else {
                setFeedback(`Error exportando ZIP: ${res.error}`);
              }
              setLoading(false);
            }
          }}
          className="p-3.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-2 border border-emerald-400/50 transition cursor-pointer col-span-1 sm:col-span-2"
          data-ui-audit-id="btn-export-audit-zip"
        >
          <span>🗜️</span>
          <span>Exportar Paquete Completo (ZIP)</span>
        </button>
      </div>

      {/* Estado de Última Auditoría en Disco */}
      {latestSavedAudit && (
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-[11px]">
          <div className="text-slate-400 flex items-center justify-between">
            <span>Última Evidencia Guardada:</span>
            <span className="text-cyan-300 font-bold">{latestSavedAudit.latestAudit}</span>
          </div>
          <div className="text-slate-500 text-[10px]">
            Ruta relativa: <code className="text-slate-300">{latestSavedAudit.path}</code>
          </div>
          <div className="text-slate-500 text-[10px]">
            Fecha: {new Date(latestSavedAudit.generatedAt).toLocaleString('es-ES')}
          </div>
        </div>
      )}

      {/* Resumen del Último Análisis */}
      {lastAuditResult && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
          <div className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>📊</span>
            <span>Métricas del Renderizado Actual</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-slate-400 block">Tarjetas:</span>
              <span className="text-cyan-300 font-bold text-sm">
                {lastAuditResult.summary?.visibleCards} / {lastAuditResult.summary?.totalCards}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-slate-400 block">Botones:</span>
              <span className="text-cyan-300 font-bold text-sm">
                {lastAuditResult.summary?.visibleButtons} / {lastAuditResult.summary?.totalButtons}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-slate-400 block">Canvas/Gráficos:</span>
              <span className="text-emerald-300 font-bold text-sm">
                {lastAuditResult.summary?.canvasesCount}
              </span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-white/5">
              <span className="text-slate-400 block">Desbordamientos:</span>
              <span className={`${lastAuditResult.summary?.issuesCount > 0 ? 'text-amber-400' : 'text-emerald-400'} font-bold text-sm`}>
                {lastAuditResult.summary?.issuesCount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
