# GESTIÓN GLOBAL DE ERRORES Y FALLBACKS

## 1. COMPONENTE RAÍZ ERROR BOUNDARY
- Implementado en `src/components/ErrorBoundary.jsx`.
- Captura cualquier excepción imprevista producida durante el renderizado de cualquier pantalla o componente hijo.
- Presenta un panel táctico de emergencia con opción de "Reiniciar Submarino/Nave de Control" sin perder el archivo de guardado en disco.

## 2. WATCHDOG DE CARGA INICIAL
- Controlado en `src/components/LoadingScreen.jsx` con un temporizador de 10 segundos.
- Si el proceso de lectura o inicialización del estado excede los 10 segundos, se muestra automáticamente un botón de "Reintentar Carga" con opción de arranque seguro.

## 3. SANITIZACIÓN DE DATOS ANTE VERSIONES OBSOLETAS
- `src/reducers/loadMigrator.js` valida y migra esquemas antiguos (v1, v2) a la estructura vigente (v3).
- Proporciona valores por defecto para planetas, tecnologías o facciones que hayan sido añadidas en actualizaciones recientes.
