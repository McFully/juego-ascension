# INFRAESTRUCTURA, CI/CD Y DESPLIEGUE

## 1. MODELO DE DESPLIEGUE DEL EJECUTABLE
- **Plataforma Objetivo:** Windows PC (Arquitectura x64).
- **Tipo de Instalador:** NSIS (`Ascension-v${version}-Setup.exe`) y Portable (`Ascension-v${version}-Portable.exe`).
- **Ruta de Distribución Local:** `E:\Proyectos Antigravity\Juegos\Ascensión\Instalador`.

## 2. PIPELINE DE AUTOMATIZACIÓN DE COMPILACIÓN (`build-dist.js`)
El script `build-dist.js` automatiza la secuencia de entrega continua:
1. Incremento de versión patch.
2. Compilación de producción con Vite.
3. Generación del ejecutable firmado con Electron Builder.
4. Compresión óptima en formato ZIP mediante PowerShell (`Compress-Archive`).
5. Copia del instalador comprimido al directorio de descarga de Firebase (`firebase-download/public/`).
6. Sincronización automática de versión y enlaces de descarga en el `index.html` de la landing page.
