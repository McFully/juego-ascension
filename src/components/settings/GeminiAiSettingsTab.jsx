import React, { useState, useEffect } from 'react';
import { getGeminiApiKey, saveGeminiApiKey, checkQuotaStatus, queryGemini } from '../../services/geminiService.js';

export const GeminiAiSettingsTab = () => {
  const [apiKey, setApiKey] = useState('');
  const [quota, setQuota] = useState({ used: 0, maxDaily: 500, remaining: 500, canMakeCall: true });
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testResult, setTestResult] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setApiKey(getGeminiApiKey());
    checkQuotaStatus(500).then(setQuota).catch(() => {});
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    saveGeminiApiKey(apiKey);
    setSaveSuccess(true);
    setTestStatus(null);
    setTestResult('');
    checkQuotaStatus(500).then(setQuota).catch(() => {});
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestResult('Introduce una clave de API antes de verificar el enlace.');
      return;
    }
    setTestStatus('testing');
    setTestResult('Comprobando enlace hiperespacial con Google Gemini...');

    try {
      const res = await queryGemini('Responde únicamente "Enlace hiperespacial establecido correctamente con el Imperio."', {
        category: 'test_connection',
        temperature: 0.1,
        useCache: false
      });

      if (res.success) {
        setTestStatus('success');
        setTestResult(res.text || 'Conexión verificada con éxito.');
        checkQuotaStatus(500).then(setQuota).catch(() => {});
      } else {
        setTestStatus('error');
        setTestResult(res.error || res.text || 'Error al conectar con la API de Gemini.');
      }
    } catch (err) {
      setTestStatus('error');
      setTestResult(err.message || 'Error de red o conexión.');
    }
  };

  return (
    <div className="space-y-4 text-xs font-mono">
      <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#070c1e]/90 space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Núcleo Táctico Gemini (IA)</h3>
              <p className="text-[10px] text-slate-400">Orquestación de decisiones estratégicas galácticas y análisis militar.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px]">
            <span className="text-slate-400">Cuota diaria:</span>
            <span className="font-bold text-cyan-300">{quota.used} / {quota.maxDaily}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div>
            <label className="block text-[11px] text-cyan-300 mb-1 font-bold">
              Clave de API de Gemini (Google AI Studio):
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Pega aquí tu clave AIzaSy..."
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono"
            />
            <p className="text-[9px] text-slate-400 mt-1">
              La clave se guarda localmente en tu equipo. Si no dispones de conexión o se agota la cuota, el juego conmuta automáticamente al motor determinista local sin interrupciones.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase transition-all cursor-pointer text-[11px]"
            >
              Guardar Clave
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-cyan-950/50 border border-white/15 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 uppercase transition-all cursor-pointer text-[11px]"
            >
              {testStatus === 'testing' ? 'Verificando...' : 'Verificar Enlace'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  saveGeminiApiKey('');
                  setTestStatus(null);
                  setTestResult('');
                  checkQuotaStatus(500).then(setQuota).catch(() => {});
                }}
                className="px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 uppercase transition-all cursor-pointer text-[10px]"
              >
                Eliminar
              </button>
            )}
          </div>
        </form>

        {saveSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
            ✓ Clave de Gemini guardada localmente con éxito.
          </div>
        )}

        {testStatus && (
          <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
            testStatus === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : testStatus === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-200'
              : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200 animate-pulse'
          }`}>
            {testResult}
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-xl border border-white/10 bg-[#090d1f]/60 space-y-2">
        <h4 className="text-[11px] font-bold text-slate-200 uppercase flex items-center gap-1.5">
          <span>🛡️</span>
          <span>Arquitectura Híbrida y Fallbacks de Emergencia</span>
        </h4>
        <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1">
          <li><strong>Cero Bloqueos:</strong> Toda consulta externa tiene watchdog y temporizador estricto de seguridad.</li>
          <li><strong>Caché SQLite:</strong> Respuestas idénticas de análisis se guardan en tu base de datos local para ahorrar cuota.</li>
          <li><strong>Director Determinista:</strong> En caso de fallo o modo offline, los cálculos de simulación e IA de facciones rivales prosiguen mediante el motor matemático local.</li>
        </ul>
      </div>
    </div>
  );
};
