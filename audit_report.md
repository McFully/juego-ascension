# Reporte de Auditoría Forense Extrema - Ascensión (v1.0.56)

Nosotros realizar análisis profundo de código de juego **Ascensión** para encontrar fallas, errores, código muerto, inconsistencias y vulnerabilidades. No cambiar ningún archivo, solo auditar y reportar.

---

## 1. Causa Raíz de Fallo de Voces Locales (VITS) en Executable (.exe)

### El Problema
En la compilación del instalador (`.exe`), el motor de voz local VITS no funciona. El agente anterior desactivó VITS y volvió al TTS del navegador (`window.speechSynthesis`), pero el usuario no quiere eso porque suena robótico, con retardo y con ruidos de fondo.

### La Causa Técnica
1. **Restricción de Chromium (CORS en `file://`)**:
   En producción, Electron carga el juego usando el protocolo local `file://` (`dist/index.html`).
   El código en `vits-local.js` intenta leer los archivos de configuración JSON y modelos ONNX (`.onnx`) usando la función `fetch()` con rutas relativas (`./voices/...`).
   Chromium bloquea por seguridad cualquier petición `fetch()` sobre `file://`. Esto causa un error de CORS/Protocolo en la consola del renderizador, rompiendo la inicialización de VITS silenciosamente.
2. **Ausencia de Canal IPC o Protocolo Personalizado**:
   `main.cjs` y `preload.cjs` no tienen ningún manejador para leer archivos binarios pesados (modelos ONNX) directamente desde Node.js (`fs.readFileSync`), lo que obliga al frontend a usar `fetch()`, el cual falla.

---

## 2. Inconsistencias y Errores Críticos Detectados

### A. Recursos Faltantes (Consola con Errores 404)
* **Fuentes y Estilos**: En [index.html](file:///C:/Users/Aritz/Desktop/Proyectos%20Antigravity/Juegos/Ascensión/index.html#L12-L13) se importan `./fonts/fonts.css` y `./fonts/material.css`. Sin embargo, la carpeta `public/fonts/` no existe en el proyecto. Esto causa errores 404 al cargar íconos y tipografías.

### B. Gráficos de Investigación (Completado)
* **Diseño Experimental** y **Propulsión Cuántica** ya tienen sus ilustraciones definitivas en la carpeta `Assets/` (`Diseno Experimental.webp` y `Propulsion Cuantica.webp`). Queda verificado que los archivos físicos existen y no son negros/placeholders. El mapeo en `src/App.jsx` es correcto.

### C. Nombres Inconsistentes en Compilación y Empaquetado
* En `package.json`, la configuración de empaquetado para Windows usa nombres variables:
  * Instalador: `juego_ascensión_setup_v1.0.56.exe` (caracteres especiales, minúsculas, espacios).
  * Portable: `ascensión-v${version}-Portable.exe` (mezcla de minúsculas y mayúsculas).
  * Nombre oficial de producto en Electron: `Ascensión` o `Hanseatic Strategos` en otras referencias de configuración legacy.
* Se debe unificar a un único formato limpio y profesional: `Ascension-Setup.exe` y `Ascension.exe`.

### D. Ruidos y Efectos Molestos en Diplomacia
* En [DiplomacyPage.jsx](file:///C:/Users/Aritz/Desktop/Proyectos%20Antigravity/Juegos/Ascensión/src/pages/DiplomacyPage.jsx), existen funciones como `playInsectoidBackgroundClicks`, `playFactionBackgroundSynth` y `playDiploSound('connect')` que generan interferencias analógicas, zumbidos y clics de interfaz. El usuario solicitó eliminar estos efectos para escuchar solo la voz limpia sin latencia.

---

## 3. Vulnerabilidades y Problemas de Estabilidad

1. **Configuración de Seguridad en Electron**:
   `webSecurity` no está explícitamente configurado. En caso de desactivarse para solucionar el CORS de VITS, se introduce riesgo si no se controla adecuadamente el aislamiento de contexto. La solución recomendada es registrar un protocolo seguro personalizado (ej. `ascension-asset://`) en `main.cjs`.
2. **Carga de Modelos ONNX de Gran Tamaño en Memoria**:
   Los modelos de voz (`.onnx`) pesan entre 28MB y 76MB. Cargarlos dinámicamente con `ort-wasm-simd.wasm` cuando el usuario hace clic causa un retardo (latencia de compilación WebAssembly e inferencia).
   * **Mejora sugerida**: Pre-cargar el modelo de la facción correspondiente en segundo plano al entrar a la sección de Diplomacia/Comunicaciones, de modo que al pulsar "Hablar", el modelo ya resida en la memoria RAM listo para ejecutar la síntesis en milisegundos.

---

## 4. Plan de Acción Recomendado (Para Ejecución Posterior)

1. **Registrar Protocolo de Archivos**:
   Modificar `main.cjs` para registrar un protocolo personalizado `ascension-asset://` que resuelva rutas del directorio `dist` mediante Node.js `fs` y permita `fetch()` seguro sin violar políticas CORS.
2. **Modificar vits-local.js**:
   Cambiar la constante `u` y las llamadas de carga para usar el protocolo personalizado en lugar de rutas locales relativas problemáticas.
3. **Pre-cargar Modelos**:
   Crear un disparador de pre-carga en `DiplomacyPage.jsx` para inicializar el motor VITS con la voz de la facción seleccionada antes de que el usuario pulse un mensaje.
4. **Remover SFX de Diplomacia**:
   Comentar o eliminar llamadas a `playDiploSound('connect')` y osciladores de estática/zumbido en Diplomacia.
5. **Añadir Fuentes**:
   Colocar los archivos tipográficos necesarios en la carpeta `public/fonts/`.

