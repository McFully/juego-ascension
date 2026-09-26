# GUÍA DE INSTALACIÓN Y ARRANQUE LOCAL

## 1. REQUISITOS DEL SISTEMA Y ENTORNO PREVIO
- **Sistema Operativo:** Windows 10 u 11 (64-bit).
- **Node.js:** Versión 18.x o superior (LTS recomendada Node 20.x o 22.x).
- **Gestor de Paquetes:** npm 9.x o superior.
- **Herramientas Nativas de Compilación:** Python 3.x y Visual C++ Build Tools (necesarios para módulos nativos como `sharp`).

## 2. PROCEDIMIENTO PASO A PASO PARA LEVANTAR EL PROYECTO
1. **Acceso al Directorio del Proyecto:**
   ```powershell
   cd "E:Proyectos AntigravityJuegosJuego Ascensión"
   ```

2. **Instalación Limpia de Dependencias:**
   ```powershell
   npm install
   ```

3. **Ejecución en Servidor de Desarrollo Web (Vite HMR):**
   ```powershell
   npm run dev
   ```
   - La aplicación se inicializa en `http://localhost:5173`.
   - Proporciona recarga en caliente de componentes React y estilos Tailwind.

4. **Ejecución en Entorno Nativo de Escritorio (Electron):**
   ```powershell
   npm run dev:electron
   ```
   - Compila previamente los assets con Vite (`vite build`) y arranca el proceso principal de Electron (`electron .`).

5. **Ejecución de Pruebas Unitarias de Regresión:**
   ```powershell
   npm run test
   ```
