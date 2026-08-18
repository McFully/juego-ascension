# ⚙️ BLOQUE 2: ENTORNOS, SCRIPTS Y DESPLIEGUE

## 02.01 GUÍA DE INSTALACIÓN Y ARRANQUE LOCAL

### Requisitos Previos
- **Node.js:** Versión 18.x o superior (se recomienda LTS Node 20+).
- **npm:** Versión 9.x o superior.
- **Sistema Operativo:** Windows 10/11 (entorno probado prioritario).

### Pasos de Instalación y Ejecución

1. **Clonar o situarse en el directorio raíz del proyecto:**
   ```bash
   cd "e:/Proyectos Antigravity/Juegos/Juego Ascensión"
   ```

2. **Instalar dependencias de desarrollo:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo Desarrollo Web (Vite Dev Server):**
   ```bash
   npm run dev
   ```
   *Acceso por navegador en `http://localhost:5173`.*

4. **Ejecutar en modo Desarrollo Desktop (Vite + Electron):**
   ```bash
   npm run dev:electron
   ```
   *Compila la app e inicia la ventana nativa de Electron.*

---

## 02.02 ANÁLISIS DE SCRIPTS NPM Y AUTOMATIZACIONES CLI

### Scripts Definidos en `package.json`

| Comando | Acción Ejecutada | Descripción / Propósito |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Inicia el servidor de desarrollo ultrarrápido HMR para pruebas web. |
| `npm run dev:electron` | `vite build && electron .` | Compila los assets estáticos y arranca el proceso principal de Electron. |
| `npm run build` | `vite build` | Genera la compilación de producción web optimizada en la carpeta `dist/`. |
| `npm run bump` | `npm version patch --no-git-tag-version --no-commit-hooks` | Incrementa automáticamente la versión patch (ej. `1.1.27` -> `1.1.28`). |
| `npm run dist` | `npm run bump && vite build && electron-builder --win` | Incrementa versión, compila Vite y genera el instalador ejecutable `.exe` en `release/`. |
| `npm run dist:dir` | `npm run bump && vite build && electron-builder --win --dir` | Genera la compilación unpacked (carpeta sin empaquetar) para validación rápida. |
| `npm run dist:all` | `npm run bump && vite build && electron-builder --win --linux --mac` | Compila ejecutables multiplataforma (Windows, Linux y macOS). |
| `npm run test` | `vitest run` | Ejecuta la suite de pruebas unitarias con Vitest. |

---

## 02.03 CONFIGURACIÓN DE EMPAQUETADO Y ELECTRON BUILDER

La sección `"build"` de `package.json` define las opciones de empaquetado final del ejecutable:

- **App ID:** `com.ascension`
- **Nombre de Producto:** `Ascension`
- **Idiomas Soportados:** Español (`es`, `es-419`)
- **Directorio de Salida:** `release/`
- **Archivos Incluidos:** `dist/**/*`, `electron/**/*`, `build/icon.png`
- **Objetivos Windows:**
  1. **Instalador NSIS:** `Ascension-v${version}-Setup.exe` (Permite elegir ruta de instalación y crea acceso directo en Escritorio).
  2. **Portable Executable:** `Ascension-v${version}-Portable.exe` (Ejecutable único sin instalación).
