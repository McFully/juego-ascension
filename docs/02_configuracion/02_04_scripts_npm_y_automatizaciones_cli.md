# SCRIPTS NPM Y AUTOMATIZACIONES CLI

## 1. COMANDOS REGISTRADOS
| Comando | Script Ejecutado |
| :--- | :--- |
| `npm run dev` | `vite` |
| `npm run dev:electron` | `vite build && electron .` |
| `npm run build` | `vite build` |
| `npm run bump` | `npm version patch --no-git-tag-version --no-commit-hooks` |
| `npm run dist` | `npm run bump && vite build && electron-builder --win` |
| `npm run dist:dir` | `npm run bump && vite build && electron-builder --win --dir` |
| `npm run dist:all` | `npm run bump && vite build && electron-builder --win --linux --mac` |
| `npm run test` | `vitest run` |
