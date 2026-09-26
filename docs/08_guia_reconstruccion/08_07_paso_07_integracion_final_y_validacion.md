# PASO 07: INTEGRACIÓN FINAL Y VALIDACIÓN

## 1. PROCEDIMIENTO DE CONTROL DE CALIDAD Y PACKAGING
1. Ejecutar las pruebas unitarias automatizadas:
   ```powershell
   npm run test
   ```
2. Verificar compilación limpia de producción con Vite:
   ```powershell
   npm run build
   ```
3. Validar arranque nativo en Electron:
   ```powershell
   npm run dev:electron
   ```
4. Generar el instalador ejecutable de Windows cuando el usuario lo solicite expresamente:
   ```powershell
   npm run dist
   ```
