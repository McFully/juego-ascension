/**
 * geminiService.js — Conector de IA para el juego Ascensión
 * 
 * Principios de diseño:
 * 1. Zero-Crash: Si falla la red, la clave es inválida o no hay internet, devuelve fallbacks locales sin romper el juego.
 * 2. Caché local permanente: Lee y escribe en SQLite local mediante preload (geminiGetCache / geminiSetCache).
 * 3. Control de cuota: Respeta el límite diario de 500 llamadas (geminiGetQuota / geminiRecordCall).
 * 4. Modelo ultrarrápido y ligero: gemini-2.0-flash / gemini-1.5-flash.
 */

const LOCAL_STORAGE_KEY = "ascension_gemini_api_key";
const DEFAULT_MODEL = "gemini-flash-latest";

/**
 * Obtiene la API Key activa (prioridad: localStorage del jugador -> variable de entorno)
 */
export function getGeminiApiKey() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored && stored.trim().length > 10) {
        return stored.trim();
      }
    }
  } catch (err) {
    console.warn("[Gemini Service] Error leyendo localStorage:", err);
  }
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || "";
}

/**
 * Guarda o actualiza la API Key en el almacenamiento local del jugador
 */
export function saveGeminiApiKey(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (!key || key.trim() === "") {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
      }
    }
    return true;
  } catch (err) {
    console.error("[Gemini Service] Error guardando API key:", err);
    return false;
  }
}

/**
 * Consulta el estado actual de la cuota diaria (llamadas gastadas y restantes)
 */
export async function checkQuotaStatus(maxDaily = 500) {
  if (typeof window !== 'undefined' && window.electronAPI?.geminiGetQuota) {
    try {
      const res = await window.electronAPI.geminiGetQuota(maxDaily);
      if (res.success && res.quota) {
        return res.quota;
      }
    } catch (err) {
      console.warn("[Gemini Service] Error obteniendo cuota vía IPC:", err);
    }
  }
  return { date: new Date().toISOString().slice(0, 10), used: 0, maxDaily, remaining: maxDaily, canMakeCall: true };
}

/**
 * Envía un prompt a Gemini con validación previa de caché y cuota.
 * 
 * @param {string} prompt - Texto del prompt.
 * @param {object} options - Opciones adicionales ({ category, systemInstruction, temperature, useCache }).
 * @returns {Promise<{ success: boolean, text: string, fromCache: boolean, error?: string }>}
 */
export async function queryGemini(prompt, options = {}) {
  const {
    category = "general",
    systemInstruction = "Eres el Almirante Táctico y Consejero de Inteligencia del Imperio en el videojuego de estrategia espacial Ascensión. Responde siempre con tono inmersivo, conciso, militar o científico, en español y sin usar el símbolo ampersand (&).",
    temperature = 0.7,
    useCache = true,
  } = options;

  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return { success: false, text: "Prompt vacío.", fromCache: false, error: "Prompt inválido" };
  }

  // 1. Revisar si ya está en la caché de SQLite local
  if (useCache && typeof window !== 'undefined' && window.electronAPI?.geminiGetCache) {
    try {
      const cacheRes = await window.electronAPI.geminiGetCache(prompt);
      if (cacheRes.success && cacheRes.cached) {
        return { success: true, text: cacheRes.cached, fromCache: true };
      }
    } catch (cacheErr) {
      console.warn("[Gemini Service] Error revisando caché local:", cacheErr);
    }
  }

  // 2. Verificar API Key
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      text: "No se ha configurado la clave de API de Gemini. Puedes añadirla en Ajustes.",
      fromCache: false,
      error: "NO_API_KEY",
    };
  }

  // 3. Verificar límite diario de cuota (Rate Limiting preventivo)
  const quota = await checkQuotaStatus(500);
  if (!quota.canMakeCall) {
    return {
      success: false,
      text: `Se ha alcanzado el límite diario de llamadas gratuitas (${quota.used}/${quota.maxDaily}). Se reanudará mañana.`,
      fromCache: false,
      error: "QUOTA_EXCEEDED",
    };
  }

  // 4. Ejecutar llamada HTTPS directa a Google Gemini
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt.trim() }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 800,
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error("[Gemini Service] Fallo en respuesta de API:", errorMsg);
      return {
        success: false,
        text: `Error de enlace hiperespacial con Gemini: ${errorMsg}`,
        fromCache: false,
        error: errorMsg,
      };
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return {
        success: false,
        text: "La IA no devolvió ninguna transmisión válida.",
        fromCache: false,
        error: "EMPTY_RESPONSE",
      };
    }

    const cleanText = candidateText.trim();

    // 5. Registrar llamada en la cuota local
    if (typeof window !== 'undefined' && window.electronAPI?.geminiRecordCall) {
      window.electronAPI.geminiRecordCall().catch(() => {});
    }

    // 6. Guardar en la caché de SQLite local
    if (useCache && typeof window !== 'undefined' && window.electronAPI?.geminiSetCache) {
      window.electronAPI
        .geminiSetCache({ prompt, responseText: cleanText, category })
        .catch(() => {});
    }

    return {
      success: true,
      text: cleanText,
      fromCache: false,
    };
  } catch (networkErr) {
    console.error("[Gemini Service] Error de conexión:", networkErr);
    return {
      success: false,
      text: "Conexión hiperespacial fallida. Comprueba tu conexión a internet.",
      fromCache: false,
      error: networkErr.message || "NETWORK_ERROR",
    };
  }
}
