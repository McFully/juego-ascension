# Control de Builds

- PROHIBIDO generar build, .exe, setup.exe o instalador automáticamente
- Build solo cuando el usuario lo solicite EXPLÍCITAMENTE y de forma SEPARADA
- Desarrollo ≠ Build. No compilar tras cambios, no empaquetar automáticamente
- Consentimiento implícito no es válido
- "Ningún build o ejecutable puede ser generado automáticamente bajo ninguna circunstancia."

## Versionado automático

- CADA VEZ que se genera un .exe (setup o portable), la versión en `package.json` se incrementa automáticamente (patch: 1.0.0 → 1.0.1)
- El incremento se hace con `npm version patch --no-git-tag-version --no-commit-hooks`
- Los scripts `dist`, `dist:installer` y `dist:all` ya incluyen el bump automático
- La versión se inyecta en el bundle via `__APP_VERSION__` (definido en `vite.config.js`)
- La versión se muestra en la UI: footer del juego + página de Ajustes
- NO usar `npm run bump` manualmente para builds de desarrollo
