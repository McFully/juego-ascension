import React, { useState, useEffect } from 'react';
import { queryGemini, checkQuotaStatus, getGeminiApiKey, saveGeminiApiKey } from '../../services/geminiService.js';
import { SubsystemTopBanner } from '../navigation/SubsystemTopBanner.jsx';

export const TacticalAdvisorView = ({ state, currentPlanet, production, fmt, onBack }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [quota, setQuota] = useState({ used: 0, maxDaily: 500, remaining: 500 });
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Saludos, Comandante Supremo. Soy el Núcleo Táctico Gemini del Alto Mando. Estoy conectado a la telemetría imperial para analizar recursos, defensas, producción y movimientos galácticos. ¿Cuál es su directiva?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setApiKeyInput(getGeminiApiKey());
    checkQuotaStatus(500).then(setQuota);
  }, []);

  const handleSaveKey = () => {
    saveGeminiApiKey(apiKeyInput);
    setShowConfig(false);
    checkQuotaStatus(500).then(setQuota);
  };

  const handleSendPrompt = async (promptToSend) => {
    const text = (promptToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    // Resumen táctico ultra-compacto del estado imperial para dar contexto exacto
    const imperialContext = `
[ESTADO IMPERIAL EN TIEMPO REAL]
Planetas: ${(state?.planets || []).length} mundos
Planeta Activo: ${currentPlanet?.name || 'Capital'}
Recursos Planeta: Metal: ${fmt ? fmt(currentPlanet?.resources?.metal || 0) : 0}, Cristal: ${fmt ? fmt(currentPlanet?.resources?.crystal || 0) : 0}, Deuterio: ${fmt ? fmt(currentPlanet?.resources?.deuterium || 0) : 0}, Energía: ${fmt ? fmt(currentPlanet?.resources?.energy || 0) : 0}
Créditos: ${state?.credits || 0}
Naves Estelares: ${(state?.ships || []).length} naves en servicio
Partida en Curso: ${state?.playerName || 'Comandante'}
    `.trim();

    const fullPrompt = `${imperialContext}\n\n[CONSULTA DEL COMANDANTE]: ${text}`;

    const res = await queryGemini(fullPrompt, {
      category: 'tactical_advisor',
      systemInstruction: 'Eres el Almirante Táctico e Inteligencia Suprema del juego Ascensión. Tu misión es asesorar al comandante con respuestas breves, ejecutivas, estratégicas y militares. Nunca uses el símbolo &.'
    });

    const botMsg = {
      role: 'assistant',
      text: res.text,
      fromCache: res.fromCache,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
    checkQuotaStatus(500).then(setQuota);
  };

  return (
    <div className="space-y-4 view-enter w-full max-w-full min-w-0 flex flex-col flex-1 h-[calc(100vh-140px)] min-h-[650px] overflow-hidden">
      <SubsystemTopBanner
        state={state}
        currentPlanet={currentPlanet}
        production={production}
        fmt={fmt}
        breadcrumbTitle="Almirante Táctico Gemini (IA)"
        breadcrumbIcon="🧠"
        rightSlot={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono">
              <span className="text-slate-400">Cuota Diaria:</span>
              <span className="font-bold text-cyan-300">{quota.used} / {quota.maxDaily}</span>
            </div>
            <button
              onClick={() => setShowConfig(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 font-mono text-xs uppercase transition-all cursor-pointer"
            >
              ⚙️ Clave API
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-slate-700/50 text-slate-300 border border-white/10 font-mono text-xs uppercase transition-all cursor-pointer"
              >
                Volver
              </button>
            )}
          </div>
        }
      />

      {/* Modal / Barra de Configuración de API Key */}
      {showConfig && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 animate-in fade-in duration-200 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-mono text-cyan-300 mb-1">Clave de API Google Gemini (Google AI Studio):</label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Pega aquí tu API Key de Gemini..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={handleSaveKey}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase transition-all cursor-pointer whitespace-nowrap"
          >
            Guardar Clave
          </button>
        </div>
      )}

      {/* Acciones Rápidas Tácticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => handleSendPrompt("Analiza el balance de recursos y energía de mi planeta actual.")}
          className="p-2.5 rounded-xl bg-[#090d1f] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer"
        >
          📊 Balance Planetario
        </button>
        <button
          onClick={() => handleSendPrompt("¿Cuál debería ser mi prioridad militar y defensiva ahora mismo?")}
          className="p-2.5 rounded-xl bg-[#090d1f] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer"
        >
          ⚔️ Prioridad Militar
        </button>
        <button
          onClick={() => handleSendPrompt("Evalúa mi estado de expansión colonial y cuántos mundos debería tener.")}
          className="p-2.5 rounded-xl bg-[#090d1f] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer"
        >
          🪐 Expansión Colonial
        </button>
        <button
          onClick={() => handleSendPrompt("Dame un informe de inteligencia sobre las mayores amenazas galácticas conocidas.")}
          className="p-2.5 rounded-xl bg-[#090d1f] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all text-xs font-mono text-slate-300 hover:text-cyan-300 cursor-pointer"
        >
          🛰️ Amenazas Galácticas
        </button>
      </div>

      {/* Terminal de Transmisiones a Pantalla Completa */}
      <div className="rounded-3xl bg-[#070c1f] border border-cyan-500/30 p-5 space-y-4 shadow-[0_0_40px_rgba(6,182,212,0.1)] flex flex-col flex-1 min-h-[450px]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 font-mono text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl max-w-[85%] ${
                msg.role === 'user'
                  ? 'ml-auto bg-cyan-950/60 border border-cyan-500/40 text-cyan-100'
                  : 'mr-auto bg-[#0a1026] border border-white/10 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] text-slate-400">
                <span className="font-bold text-cyan-400">
                  {msg.role === 'user' ? '👤 COMANDANTE' : '🧠 NÚCLEO TÁCTICO GEMINI'}
                </span>
                <div className="flex items-center gap-2">
                  {msg.fromCache && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px]">
                      CACHÉ LOCAL (0 TOKENS)
                    </span>
                  )}
                  <span>{msg.time}</span>
                </div>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="mr-auto p-3 rounded-2xl bg-[#0a1026] border border-cyan-500/30 text-cyan-300 animate-pulse text-xs font-mono">
              📡 Transmitiendo datos cuánticos con el Núcleo Gemini...
            </div>
          )}
        </div>

        {/* Input de consulta */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt()}
            placeholder="Escribe una orden o consulta estratégica para el Almirante..."
            className="flex-1 px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => handleSendPrompt()}
            disabled={loading || !inputText.trim()}
            className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono font-bold text-xs uppercase transition-all cursor-pointer"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};
