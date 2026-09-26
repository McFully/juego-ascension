# SCRIPTS NPM Y AUTOMATIZACIONES CLI

## 1. CATÁLOGO DE COMANDOS DEL PROYECTO
| Comando CLI | Script Ejecutado | Función y Alcance Operativo |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Servidor de desarrollo web reactivo con HMR ultrarrápido. |
| `npm run dev:electron` | `vite build && electron .` | Compilación preliminar e inicio del contenedor Electron nativo. |
| `npm run build` | `vite build` | Genera los bundles optimizados listos para producción en `dist/`. |
| `npm run bump` | `npm version patch --no-git-tag-version` | Incrementa automáticamente la versión patch en `package.json`. |
| `npm run dist` | `npm run bump && vite build && electron-builder --win` | Proceso integral: incrementa versión, compila Vite y crea el instalador NSIS. |
| `npm run dist:dir` | `npm run bump && vite build && electron-builder --win --dir` | Genera la carpeta desempaquetada (`win-unpacked`) para validación forense rápida. |
| `npm run dist:all` | `npm run bump && vite build && electron-builder --win --linux --mac` | Compilación multiplataforma para Windows, Linux y macOS. |
| `npm run test` | `vitest run` | Ejecución completa de la suite de pruebas unitarias y de simulación. |

## 2. REGLA MAESTRA DE EMPAQUETADO Y DESPLIEGUE
- Prohibido generar compilaciones (`dist`, `dist:dir`, instaladores) sin petición expresa del usuario.
- Siempre que el usuario solicite explícitamente generar un build o instalador, este debe copiarse obligatoriamente a:
  `E:\Proyectos Antigravity\Juegos\Ascensión\Instalador`.
